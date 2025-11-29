// lib/rules/ruleEvaluation.ts
// Enhanced rule evaluation that handles concepts

import type { UserField } from './fieldDiscovery';
import { discoverFieldsFromFlows } from './fieldDiscovery';
import type { ConversationFlow } from '@/stores/conversationConfig/conversation.store';
import type { SmartConditionRule, SmartRuleGroup } from './ruleTypes';
import { normalizeValue } from './concepts';
import { findFieldByConcept } from './fieldDiscovery';

/**
 * Evaluate a smart rule against user input
 */
export function evaluateSmartRule(
  rule: SmartConditionRule | SmartRuleGroup,
  userInput: Record<string, string>,
  availableFields: UserField[]
): { matched: boolean; score: number } {
  if ('logic' in rule) {
    // It's a RuleGroup
    return evaluateSmartRuleGroup(rule as SmartRuleGroup, userInput, availableFields);
  } else {
    // It's a ConditionRule
    return evaluateSmartConditionRule(rule as SmartConditionRule, userInput, availableFields);
  }
}

function evaluateSmartConditionRule(
  rule: SmartConditionRule,
  userInput: Record<string, string>,
  availableFields: UserField[]
): { matched: boolean; score: number } {
  // 1. Find the actual field to check
  let fieldValue: string | undefined;
  let field: UserField | null = null;
  
  // Try concept-based first
  if (rule.field.concept) {
    field = findFieldByConcept(rule.field.concept, availableFields);
    if (field && userInput[field.fieldId]) {
      fieldValue = userInput[field.fieldId];
    }
  }
  
  // Fallback to direct fieldId
  if (!fieldValue && rule.field.fieldId) {
    fieldValue = userInput[rule.field.fieldId];
    field = availableFields.find(f => f.fieldId === rule.field.fieldId) || null;
  }
  
  if (!fieldValue) {
    return { matched: false, score: 0 };
  }
  
  // 2. Normalize value if needed
  let normalizedValue = fieldValue;
  if (field?.concept && rule.normalizedValue) {
    normalizedValue = normalizeValue(field.concept, fieldValue);
  }
  
  // 3. Evaluate based on operator
  const ruleValue = rule.value;
  const ruleValueArray = Array.isArray(ruleValue) ? ruleValue : [ruleValue];
  
  let matched = false;
  
  switch (rule.operator) {
    case 'equals':
      matched = ruleValueArray.some(rv => 
        normalizedValue.toLowerCase() === rv.toLowerCase() ||
        fieldValue.toLowerCase() === rv.toLowerCase()
      );
      break;
      
    case 'includes':
      if (Array.isArray(ruleValue)) {
        matched = ruleValue.includes(normalizedValue) || ruleValue.includes(fieldValue);
      } else {
        matched = normalizedValue.toLowerCase().includes(ruleValue.toLowerCase()) ||
                 fieldValue.toLowerCase().includes(ruleValue.toLowerCase());
      }
      break;
      
    case 'not_equals':
      matched = !ruleValueArray.some(rv => 
        normalizedValue.toLowerCase() === rv.toLowerCase() ||
        fieldValue.toLowerCase() === rv.toLowerCase()
      );
      break;
      
    case 'greater_than':
    case 'less_than':
    case 'between':
      // Numeric comparison (would need more logic)
      matched = false; // TODO: Implement numeric comparisons
      break;
      
    default:
      matched = false;
  }
  
  return { matched, score: matched ? (rule.weight || 1) : 0 };
}

function evaluateSmartRuleGroup(
  group: SmartRuleGroup,
  userInput: Record<string, string>,
  availableFields: UserField[]
): { matched: boolean; score: number } {
  const results = group.rules.map(rule => 
    evaluateSmartRule(rule, userInput, availableFields)
  );
  
  const matchedResults = results.filter(r => r.matched);
  const totalScore = results.reduce((sum, r) => sum + r.score, 0);
  
  if (group.logic === 'AND') {
    return {
      matched: matchedResults.length === results.length,
      score: matchedResults.length === results.length ? totalScore : 0,
    };
  } else {
    // OR logic
    return {
      matched: matchedResults.length > 0,
      score: matchedResults.length > 0 ? totalScore : 0,
    };
  }
}

