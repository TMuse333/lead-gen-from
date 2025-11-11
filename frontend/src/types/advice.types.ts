// types/index.ts

export type MatchOperator = 'equals' | 'includes' | 'not_equals' | 'greater_than' | 'less_than' | 'between';
export type LogicOperator = 'AND' | 'OR';

export interface ConditionRule {
  field: string;
  operator: MatchOperator;
  value: string | string[];  // Keep it simple - all strings
  weight?: number;
}

export interface RuleGroup {
  logic: LogicOperator;
  rules: (ConditionRule | RuleGroup)[];
}

export interface AgentAdviceScenario {
  id: string;
  agentId: string;
  title: string;
  tags: string[];
  advice: string;
  
  applicableWhen: {
    flow?: string[];
    ruleGroups?: RuleGroup[];
    minMatchScore?: number;
  };
  
  createdAt: Date;
  updatedAt?: Date;
  usageCount?: number;
  embedding?: number[];
}