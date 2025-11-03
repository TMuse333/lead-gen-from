// ============================================
// FORM STATE (CLIENT-SIDE)
// ============================================

import { FormAnswer } from './submission.types';

export interface FormState {
  currentQuestionIndex: number;
  answers: Map<string, FormAnswer>;
  isComplete: boolean;
  emailCaptured: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}