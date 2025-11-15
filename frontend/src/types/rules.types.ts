// src/types/rules.types.ts
// This file owns ALL rule logic. Every collection uses this.

export type MatchOperator =
  | 'equals'
  | 'includes'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'between';

export type LogicOperator = 'AND' | 'OR';

export interface ConditionRule {
  field: string;
  operator: MatchOperator;
  value: string | string[];   // Keep simple — all values are strings
  weight?: number;            // Optional weight for scoring
}

export interface RuleGroup {
  logic: LogicOperator;
  rules: (ConditionRule | RuleGroup)[];
}

// This is the shared applicability block
export interface ApplicableWhen {
  flow?: ('sell' | 'buy' | 'browse')[];
  ruleGroups?: RuleGroup[];
  minMatchScore?: number;     // 0.0 to 1.0
}