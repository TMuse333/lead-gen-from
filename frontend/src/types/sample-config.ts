// ============================================
// DEFAULT & SAMPLE CONFIG
// ============================================

import { FormConfig } from './config.types';
import { FormQuestion } from './question.types';

export const DEFAULT_FORM_CONFIG: Partial<FormConfig> = {
  name: "Seller Lead Form - Halifax",
  targetArea: "Halifax Regional Municipality",
  emailCaptureAfter: 6,
  branding: {
    primaryColor: "#2563eb",
    secondaryColor: "#10b981",
    agentName: "Your Agent Name",
  },
  resultConfig: {
    showComparableHomes: true,
    showMarketTrends: true,
    showAgentAdvice: true,
    showEstimatedValue: true,
    emailReportSubject: "Your Personalized Home Value Analysis",
  },
  isActive: true,
};

export const SAMPLE_QUESTIONS: FormQuestion[] = [/* ... same as original ... */];
// (Keep full array here or move to a separate file if too large)