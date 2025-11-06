// ============================================
// FLOW TYPES
// ============================================

import { FormQuestion } from './question.types';

export interface FlowResultConfig {
  showComparableHomes: boolean;
  showMarketTrends: boolean;
  showAgentAdvice: boolean;
  showEstimatedValue: boolean;
  emailReportSubject: string;
}

export interface FlowConfig {
  id: 'sell' | 'buy' | 'browse';
  title: string;
  subtitle: string;
  heroTitle: string;
  heroSubtitle: string;
  nextSteps: string[];
  cta: string;
  iconName: string; // store icon name string instead of JSX
  questions?: FormQuestion[];
  resultConfig?: FlowResultConfig;
}
