// ============================================
// AI ANALYSIS INPUT & OUTPUT TYPES
// ============================================

import { LeadSubmission } from './submission.types';
import { ComparableHome } from './comparable.types';
import { MarketTrend } from './market.types';
import { AgentAdviceScenario } from './advice.types';
import { FormConfig } from './config.types';

// ============================================
// INPUT STRUCTURE (Shared Across Flows)
// ============================================

export interface AnalysisInput {
  leadData: LeadSubmission;
  comparableHomes: ComparableHome[];
  marketTrends: MarketTrend;
  agentAdvice: AgentAdviceScenario[];
  formConfig: FormConfig;
}

// ============================================
// BASE ANALYSIS (Shared Output Structure)
// ============================================

export interface BaseAnalysis {
  marketSummary: string;
  personalizedAdvice: string;
  recommendedActions: string[];
  generatedAt: Date;
  tokensUsed: number;
}

// ============================================
// SELLER ANALYSIS
// ============================================

export interface SellerAnalysis extends BaseAnalysis {
  estimatedValue: {
    low: number;
    high: number;
    confidence: number; // 0–1 scale
    reasoning: string;
  };
  comparablesSummary: string;
}

// ============================================
// BUYER ANALYSIS
// ============================================

export interface BuyerAnalysis extends BaseAnalysis {
  bestNeighborhoods: string[];
  financingTips: string[];
  comparablesSummary?: string; // optional if shown
}

// ============================================
// BROWSE (MARKET SNAPSHOT / DISCOVERY FLOW)
// ============================================

export interface BrowseAnalysis extends BaseAnalysis {
  highlights: string[]; // e.g. featured listings, trending areas
  suggestedFilters: string[]; // e.g. "condos under $500K"
  neighborhoodInsights?: string;
}

// ============================================
// UNION TYPE FOR FLOW ANALYSIS
// ============================================

export type FlowAnalysis = SellerAnalysis | BuyerAnalysis | BrowseAnalysis;

// Optional helper type for flow selection
export type FlowType = 'sell' | 'buy' | 'browse';

export interface FlowAnalysisInput {
  leadData: LeadSubmission;
  comparableHomes: ComparableHome[];
  marketTrends: MarketTrend;
  agentAdvice: AgentAdviceScenario[];
  formConfig: FormConfig;
}


export interface FlowAnalysisOutput {
  flowType: FlowType; // 'sell' | 'buy' | 'browse'
  analysis: FlowAnalysis; // seller, buyer, or browse analysis object
  comparableHomes: ComparableHome[]; // used for visuals / summaries
  marketTrends: MarketTrend; // local market stats / trends
  agentAdvice: AgentAdviceScenario[]; // list of AI or agent insights
  formConfig: FormConfig; // original config used
  leadId?: string; // optional reference to saved lead
  generatedAt: Date; // timestamp of generation
  tokensUsed?: number; // optional model usage info
}
