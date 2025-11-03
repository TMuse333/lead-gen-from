// ============================================
// AI ANALYSIS INPUT & OUTPUT
// ============================================

import { LeadSubmission } from './submission.types';
import { ComparableHome } from './comparable.types';
import { MarketTrend } from './market.types';
import { AgentAdviceScenario } from './advice.types';
import { FormConfig } from './config.types';

export interface AnalysisInput {
  leadData: LeadSubmission;
  comparableHomes: ComparableHome[];
  marketTrends: MarketTrend;
  agentAdvice: AgentAdviceScenario[];
  formConfig: FormConfig;
}

export interface AIAnalysis {
  estimatedValue: {
    low: number;
    high: number;
    confidence: number;
    reasoning: string;
  };
  marketSummary: string;
  personalizedAdvice: string;
  recommendedActions: string[];
  comparablesSummary: string;
  generatedAt: Date;
  tokensUsed: number;
}