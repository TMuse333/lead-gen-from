// ============================================
// FORM CONFIGURATION
// ============================================

import { FormQuestion } from './question.types';

export interface FormConfig {
  id: string;
  agentId: string;
  name: string;
  targetArea: string;
  questions: FormQuestion[];
  emailCaptureAfter: number;
  branding: {
    primaryColor: string;
    secondaryColor: string;
    logoUrl?: string;
    agentName: string;
    agentPhoto?: string;
  };
  resultConfig: {
    showComparableHomes: boolean;
    showMarketTrends: boolean;
    showAgentAdvice: boolean;
    showEstimatedValue: boolean;
    emailReportSubject: string;
  };
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}