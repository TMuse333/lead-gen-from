// ============================================
// FORM CONFIGURATION
// ============================================

import { FormQuestion } from './question.types';
import { FlowResultConfig } from './flow.types';

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
  resultConfig: FlowResultConfig;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}
