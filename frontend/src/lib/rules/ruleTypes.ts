// lib/rules/ruleTypes.ts
// Enhanced rule types that support concepts

import type { MatchOperator, LogicOperator, ConditionRule, RuleGroup } from '@/types/rules.types';

export interface SmartField {
  // Preferred: concept-based (more flexible)
  concept?: string;
  
  // Fallback: direct field reference
  fieldId?: string;
  
  // Display
  label?: string;
}

export interface SmartConditionRule extends Omit<ConditionRule, 'field'> {
  field: SmartField;
  normalizedValue?: string; // Standardized value
}

export interface SmartRuleGroup extends Omit<RuleGroup, 'rules'> {
  rules: (SmartConditionRule | SmartRuleGroup)[];
}

export interface RuleRecommendation {
  id: string;
  title: string;
  description: string;
  ruleGroup: SmartRuleGroup;
  reasoning: string; // Why this rule was recommended
  confidence: number; // 0-1
}

