// ============================================
// AI ANALYSIS INPUT & OUTPUT TYPES
// ============================================
import { LeadSubmission } from './submission.types';
import { ComparableHome } from './comparable.types';

import { AgentAdviceScenario } from './advice.types';
import { FormConfig } from './config.types';
import { BaseMarketAnalysis } from './baseMarketAnalysis';

// ============================================
// INPUT STRUCTURE (Shared Across Flows)
// ============================================
export interface AnalysisInput {
  leadData: LeadSubmission;
  // comparableHomes: ComparableHome[];
  // // marketSummary: MarketSummary;
  // agentAdvice: AgentAdviceScenario[];
  formConfig: FormConfig;
}

// Optional helper for flow selection
export type FlowType = 'sell' | 'buy' | 'browse';

// ============================================
// BASE ANALYSIS (Shared Output Structure)
// ============================================
export interface BaseAnalysis {
  marketSummary: string;                    // ← AI-written narrative
  personalizedAdvice: string[];             // ← always array
  recommendedActions: string[];             // ← always array
  generatedAt: string;                      // ← ISO string
  tokensUsed: number;
}

// ============================================
// SELLER ANALYSIS
// ============================================
export interface SellerAnalysis extends BaseAnalysis {
  estimatedValue: number;
  comparablesSummary: {
    address: string;
    details: string;
    soldPrice: number;
  }[];
}

// ============================================
// BUYER ANALYSIS
// ============================================
export interface BuyerAnalysis extends BaseAnalysis {
  recommendedNeighborhoods: string[];
  financingTips: string[];
}

// ============================================
// BROWSE ANALYSIS
// ============================================
export interface BrowseAnalysis extends BaseAnalysis {
  highlights: string[];
  suggestedFilters: string[];
  neighborhoodInsights: Record<string, string>;
}

// ============================================
// UNION TYPE FOR FLOW ANALYSIS
// ============================================
export type FlowAnalysis = SellerAnalysis | BuyerAnalysis | BrowseAnalysis;

// ============================================
// FINAL OUTPUT (Consistent Across Flows)
// ============================================
export interface FlowAnalysisOutput {
  flowType: FlowType;
  analysis: FlowAnalysis;


  agentAdvice?: AgentAdviceScenario[];      // ← optional
  leadId?: string;
  generatedAt: Date;
  tokensUsed?: number;
}