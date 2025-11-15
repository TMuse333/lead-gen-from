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
  value: string | string[];
  weight?: number;
}

export interface RuleGroup {
  logic: LogicOperator;
  rules: (ConditionRule | RuleGroup)[];
}

export interface UserInput {
  [key: string]: string;
}

export interface ApplicableWhen {
  flow?: ('sell' | 'buy' | 'browse')[];
  ruleGroups?: RuleGroup[];
  minMatchScore?: number;
}

export interface ActionStepScenario {
  id: string;
  agentId: string;
  title: string;
  description: string;
  benefit?: string;
  resourceLink?: string;
  resourceText?: string;
  imageUrl?: string;
  defaultPriority: number;
  defaultUrgency?: 'low' | 'medium' | 'high';
  defaultTimeline?: string;
  category: string;
  tags?: string[];
  applicableWhen: ApplicableWhen;
  prerequisiteStepIds?: string[];
  relatedStepIds?: string[];
}

export interface ActionStepMatch {
  step: ActionStepScenario;
  matchScore: number;
  matchedRules: string[];
}

