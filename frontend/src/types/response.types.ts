// ============================================
// API RESPONSES
// ============================================

import { AIAnalysis } from './analysis.types';
import { ComparableHome } from './comparable.types';
import { FormConfig } from './config.types';

export interface FormSubmissionResponse {
  success: boolean;
  leadId: string;
  message: string;
  analysis: AIAnalysis;
  comparableHomes: ComparableHome[];
  error?: string;
}

export interface FormConfigResponse {
  success: boolean;
  config: FormConfig;
  error?: string;
}