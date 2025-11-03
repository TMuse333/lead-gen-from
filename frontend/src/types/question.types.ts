// ============================================
// QUESTION & INPUT TYPES
// ============================================

export type QuestionInputType =
  | 'button-select'
  | 'multi-select'
  | 'text'
  | 'number'
  | 'email'
  | 'textarea'
  | 'slider';

export interface AnswerChoice {
  id: string;
  label: string;
  value: string;
  icon?: string;
  triggerFollowUp?: string;
}

export interface FormQuestion {
  id: string;
  type: QuestionInputType;
  question: string;
  subtext?: string;
  placeholder?: string;
  choices?: AnswerChoice[];
  required: boolean;
  showIf?: {
    questionId: string;
    hasValue: string | string[];
  };
  weight: number;
  aiContext: string;
}