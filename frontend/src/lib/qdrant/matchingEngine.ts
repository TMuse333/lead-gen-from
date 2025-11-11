// lib/qdrant/matchingEngine.ts

import { RuleGroup, ConditionRule, AgentAdviceScenario } from '@/types';
import { LlmInput } from '@/types/chat.types';

/**
 * Evaluate a single condition rule
 */
function evaluateRule(rule: ConditionRule, userInput: LlmInput): boolean {
  const userValue = userInput[rule.field];
  
  if (!userValue) return false;
  
  switch (rule.operator) {
    case 'equals':
      return userValue === rule.value;
    
    case 'includes':
      if (Array.isArray(rule.value)) {
        return rule.value.includes(userValue);
      }
      return userValue === rule.value;
    
    case 'not_equals':
      return userValue !== rule.value;
    
    case 'greater_than':
      // Cast both to numbers for comparison
      const gtUserNum = parseFloat(userValue);
      const gtRuleNum = parseFloat(rule.value as string);
      return !isNaN(gtUserNum) && !isNaN(gtRuleNum) && gtUserNum > gtRuleNum;
    
    case 'less_than':
      // Cast both to numbers for comparison
      const ltUserNum = parseFloat(userValue);
      const ltRuleNum = parseFloat(rule.value as string);
      return !isNaN(ltUserNum) && !isNaN(ltRuleNum) && ltUserNum < ltRuleNum;
    
    case 'between':
      // Expects rule.value to be ['min', 'max'] as strings
      if (Array.isArray(rule.value) && rule.value.length === 2) {
        const num = parseFloat(userValue);
        const min = parseFloat(rule.value[0]);
        const max = parseFloat(rule.value[1]);
        return !isNaN(num) && !isNaN(min) && !isNaN(max) && num >= min && num <= max;
      }
      return false;
    
    default:
      return false;
  }
}

/**
 * Recursively evaluate a rule group (handles nested groups)
 */
function evaluateRuleGroup(group: RuleGroup, userInput: LlmInput): boolean {
  const results = group.rules.map(rule => {
    // If rule is a nested RuleGroup, recurse
    if ('logic' in rule && 'rules' in rule) {
      return evaluateRuleGroup(rule as RuleGroup, userInput);
    }
    // Otherwise it's a ConditionRule
    return evaluateRule(rule as ConditionRule, userInput);
  });
  
  // Apply AND/OR logic
  if (group.logic === 'AND') {
    return results.every(r => r === true);
  } else {
    return results.some(r => r === true);
  }
}

/**
 * Calculate match score with weights
 */
function calculateMatchScore(
  ruleGroups: RuleGroup[], 
  userInput: LlmInput
): number {
  let totalWeight = 0;
  let matchedWeight = 0;
  
  function processGroup(group: RuleGroup) {
    group.rules.forEach(rule => {
      if ('logic' in rule && 'rules' in rule) {
        // Nested group - recurse
        processGroup(rule as RuleGroup);
      } else {
        // Single rule
        const condRule = rule as ConditionRule;
        const weight = condRule.weight || 5; // Default weight
        totalWeight += weight;
        
        if (evaluateRule(condRule, userInput)) {
          matchedWeight += weight;
        }
      }
    });
  }
  
  ruleGroups.forEach(processGroup);
  
  return totalWeight > 0 ? matchedWeight / totalWeight : 0;
}

/**
 * Main function: Check if advice is applicable
 */
export function isAdviceApplicable(
  advice: AgentAdviceScenario,
  flow: string,
  userInput: LlmInput
): { applicable: boolean; matchScore: number; reason?: string } {
  
  // 1. Check flow match
  if (advice.applicableWhen.flow && !advice.applicableWhen.flow.includes(flow)) {
    return { 
      applicable: false, 
      matchScore: 0,
      reason: `Flow mismatch: advice is for ${advice.applicableWhen.flow.join(', ')}`
    };
  }
  
  // 2. If no rule groups, applies to all in this flow
  if (!advice.applicableWhen.ruleGroups || advice.applicableWhen.ruleGroups.length === 0) {
    return { applicable: true, matchScore: 1.0, reason: 'Universal advice' };
  }
  
  // 3. Evaluate rule groups
  const allGroupsMatch = advice.applicableWhen.ruleGroups.every(group => 
    evaluateRuleGroup(group, userInput)
  );
  
  // 4. Calculate match score
  const matchScore = calculateMatchScore(advice.applicableWhen.ruleGroups, userInput);
  
  // 5. Check minimum score threshold
  const minScore = advice.applicableWhen.minMatchScore || 0.5; // Default 50%
  
  if (allGroupsMatch && matchScore >= minScore) {
    return { 
      applicable: true, 
      matchScore,
      reason: `Rules matched with score ${(matchScore * 100).toFixed(0)}%`
    };
  }
  
  return { 
    applicable: false, 
    matchScore,
    reason: `Match score ${(matchScore * 100).toFixed(0)}% below threshold ${(minScore * 100).toFixed(0)}%`
  };
}

/**
 * Filter and rank advice by applicability
 */
export function filterAndRankAdvice(
  adviceList: AgentAdviceScenario[],
  flow: string,
  userInput: LlmInput
): Array<{ advice: AgentAdviceScenario; matchScore: number; reason: string }> {
  
  return adviceList
    .map(advice => {
      const result = isAdviceApplicable(advice, flow, userInput);
      return {
        advice,
        matchScore: result.matchScore,
        reason: result.reason || '',
        applicable: result.applicable
      };
    })
    .filter(item => item.applicable)
    .sort((a, b) => b.matchScore - a.matchScore); // Highest score first
}