// lib/rules/ruleConverter.ts
// Convert between SmartRuleGroup (with SmartField) and RuleGroup (with string field)

import type { RuleGroup, ConditionRule } from '@/types/rules.types';
import type { SmartRuleGroup, SmartConditionRule, SmartField } from './ruleTypes';

/**
 * Convert SmartRuleGroup to RuleGroup for Qdrant storage
 */
export function smartRuleGroupToRuleGroup(smartGroup: SmartRuleGroup): RuleGroup {
  return {
    logic: smartGroup.logic,
    rules: smartGroup.rules.map(rule => {
      if ('logic' in rule) {
        // Nested SmartRuleGroup
        return smartRuleGroupToRuleGroup(rule);
      } else {
        // SmartConditionRule
        return smartConditionRuleToConditionRule(rule);
      }
    }),
  };
}

/**
 * Convert SmartConditionRule to ConditionRule
 */
export function smartConditionRuleToConditionRule(smartRule: SmartConditionRule): ConditionRule {
  // Extract field value - prefer fieldId, fallback to concept
  const fieldValue = smartRule.field.fieldId || smartRule.field.concept || '';
  
  return {
    field: fieldValue,
    operator: smartRule.operator,
    value: smartRule.value,
    weight: smartRule.weight,
  };
}

/**
 * Convert RuleGroup to SmartRuleGroup (for editing)
 */
export function ruleGroupToSmartRuleGroup(ruleGroup: RuleGroup): SmartRuleGroup {
  return {
    logic: ruleGroup.logic,
    rules: ruleGroup.rules.map(rule => {
      if ('logic' in rule) {
        // Nested RuleGroup
        return ruleGroupToSmartRuleGroup(rule);
      } else {
        // ConditionRule
        return conditionRuleToSmartConditionRule(rule);
      }
    }),
  };
}

/**
 * Convert ConditionRule to SmartConditionRule
 */
export function conditionRuleToSmartConditionRule(rule: ConditionRule): SmartConditionRule {
  // Try to determine if field is a concept or fieldId
  // For now, assume it's a fieldId if it's a string
  const smartField: SmartField = {
    fieldId: typeof rule.field === 'string' ? rule.field : undefined,
    concept: typeof rule.field === 'string' ? undefined : (rule.field as any)?.concept,
    label: typeof rule.field === 'string' ? undefined : (rule.field as any)?.label,
  };

  return {
    field: smartField,
    operator: rule.operator,
    value: rule.value,
    weight: rule.weight,
  };
}

