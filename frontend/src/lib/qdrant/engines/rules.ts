// src/lib/qdrant/engines/ruleEngine.ts
// ← This is Chris’s decision-making brain. One source. Forever.

import type { RuleGroup, ConditionRule } from '@/types';

// Reuse your LlmInput type or make a shared UserInput
export type UserInput = Record<string, string>;

// Generic item that has applicableWhen
export interface ApplicableItem {
  applicableWhen: {
    flow?: ('sell' | 'buy' | 'browse')[];
    ruleGroups?: RuleGroup[];
    minMatchScore?: number;
  };
}

// 1. Evaluate a single condition
function evaluateRule(rule: ConditionRule, userInput: UserInput): { matched: boolean; weight: number } {
  const userValue = userInput[rule.field];
  const weight = rule.weight || 1;
  if (!userValue) return { matched: false, weight };

  switch (rule.operator) {
    case 'equals':      return { matched: userValue === rule.value, weight };
    case 'not_equals':  return { matched: userValue !== rule.value, weight };
    case 'includes':    return { matched: Array.isArray(rule.value) ? rule.value.includes(userValue) : userValue.includes(rule.value as string), weight };
    case 'greater_than': {
      const a = parseFloat(userValue); const b = parseFloat(rule.value as string);
      return { matched: !isNaN(a) && !isNaN(b) && a > b, weight };
    }
    case 'less_than': {
      const a = parseFloat(userValue); const b = parseFloat(rule.value as string);
      return { matched: !isNaN(a) && !isNaN(b) && a < b, weight };
    }
    case 'between': {
      if (Array.isArray(rule.value) && rule.value.length === 2) {
        const val = parseFloat(userValue);
        const min = parseFloat(rule.value[0]);
        const max = parseFloat(rule.value[1]);
        return { matched: !isNaN(val) && val >= min && val <= max, weight };
      }
      return { matched: false, weight };
    }
    default: return { matched: false, weight };
  }
}

// 2. Recursively evaluate rule groups
function evaluateRuleGroup(group: RuleGroup, userInput: UserInput): { matched: boolean; totalWeight: number; matchedWeight: number } {
  let matchedCount = 0;
  let totalWeight = 0;
  let matchedWeight = 0;

  for (const rule of group.rules) {
    if ('logic' in rule) {
      const nested = evaluateRuleGroup(rule as RuleGroup, userInput);
      totalWeight += nested.totalWeight;
      matchedWeight += nested.matchedWeight;
      if (nested.matched) matchedCount++;
    } else {
      const result = evaluateRule(rule as ConditionRule, userInput);
      totalWeight += result.weight;
      if (result.matched) {
        matchedWeight += result.weight;
        matchedCount++;
      }
    }
  }

  const matched = group.logic === 'AND' ? matchedCount === group.rules.length : matchedCount > 0;
  return { matched, totalWeight, matchedWeight };
}

// 3. Main public function — works for ANY item
export function calculateMatchScore<T extends ApplicableItem>(
  item: T,
  userInput: UserInput,
  flow: 'sell' | 'buy' | 'browse'
): number {
  const { applicableWhen } = item;

  // Flow check
  if (applicableWhen.flow && !applicableWhen.flow.includes(flow)) {
    return 0;
  }

  // No rules → universal match
  if (!applicableWhen.ruleGroups || applicableWhen.ruleGroups.length === 0) {
    return 1.0;
  }

  let totalWeight = 0;
  let matchedWeight = 0;

  for (const group of applicableWhen.ruleGroups) {
    const result = evaluateRuleGroup(group, userInput);
    totalWeight += result.totalWeight;
    matchedWeight += result.matchedWeight;
  }

  const score = totalWeight > 0 ? matchedWeight / totalWeight : 0;
  const minScore = applicableWhen.minMatchScore || 0;
  return score >= minScore ? score : 0;
}

// Optional: full applicability check (like your old isAdviceApplicable)
export function isApplicable<T extends ApplicableItem>(
  item: T,
  flow: string,
  userInput: UserInput
): { applicable: boolean; matchScore: number } {
  const score = calculateMatchScore(item, userInput, flow as any);
  return { applicable: score > 0, matchScore: score };
}