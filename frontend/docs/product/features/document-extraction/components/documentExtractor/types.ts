// components/documentExtractor/types.ts

import type { FlowIntention } from '@/stores/onboardingStore/onboarding.store';
import type { RuleGroup } from '@/types/rules.types';

export type ConditionRule = {
  field: string;
  operator: 'equals' | 'includes' | 'not_equals' | 'greater_than' | 'less_than' | 'between';
  value: string | string[];
  weight?: number;
};

export type LogicOperator = 'AND' | 'OR';

export interface ExtractedItem {
  title: string;
  advice: string;
  confidence: number;
  source?: string;
  flows?: FlowIntention[];
  tags?: string[];
  ruleGroups?: RuleGroup[];
  editing?: boolean;
  editedTitle?: string;
  editedAdvice?: string;
}

export type Step = 'upload' | 'extract' | 'context' | 'process' | 'review' | 'rules' | 'uploading';

export interface DocumentExtractorProps {
  onComplete?: (items: ExtractedItem[]) => void;
  onCancel?: () => void;
  initialFlows?: FlowIntention[];
}

export interface DocumentState {
  step: Step;
  file: File | null;
  extractedText: string;
  documentType: string;
  documentSize: number;
  contextPrompt: string;
  extractedItems: ExtractedItem[];
  selectedItems: Set<number>;
  addingRulesTo: number | null;
  itemRules: Record<number, ConditionRule[]>;
  itemLogic: Record<number, LogicOperator>;
  loading: boolean;
  error: string | null;
  isDragging: boolean;
}
