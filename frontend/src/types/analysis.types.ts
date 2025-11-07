// ============================================
// AI ANALYSIS INPUT & OUTPUT TYPES
// ============================================
import { LeadSubmission } from './submission.types';
import { ComparableHome } from './comparable.types';
import { AgentAdviceScenario } from './advice.types';
import { FormConfig } from './config.types';

// ============================================
// MARKET TREND (matches backend)
// ============================================
export interface MarketTrend {
  averageSalePrice: number;
  medianSalePrice: number;
  averageDaysOnMarket: number;
  marketTrend: string; // e.g. "up (+3.2%)"
  inventoryLevel: 'low' | 'balanced' | 'high';
}

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
  marketSummary: MarketTrend;     // ← NOW OBJECT
  personalizedAdvice: string;
  recommendedActions: string[];
  generatedAt: string | Date;     // ← backend sends string
  tokensUsed: number;
}

// ============================================
// SELLER ANALYSIS (matches backend)
// ============================================
export interface SellerAnalysis extends BaseAnalysis {
  estimatedValue: number;         // ← NOW NUMBER
  comparablesSummary: {
    address: string;
    details: string;
    soldPrice: number;
  }[];                            // ← ARRAY OF OBJECTS
}

// ============================================
// BUYER ANALYSIS
// ============================================
export interface BuyerAnalysis extends BaseAnalysis {
  bestNeighborhoods: string[];
  financingTips: string[];
  comparablesSummary?: {
    address: string;
    details: string;
    soldPrice: number;
  }[];
}

// ============================================
// BROWSE ANALYSIS
// ============================================
export interface BrowseAnalysis extends BaseAnalysis {
  highlights: string[];
  suggestedFilters: string[];
  neighborhoodInsights?: string;
}

// ============================================
// UNION TYPE FOR FLOW ANALYSIS
// ============================================
export type FlowAnalysis = SellerAnalysis | BuyerAnalysis | BrowseAnalysis;

export type FlowType = 'sell' | 'buy' | 'browse';

export interface FlowAnalysisInput {
  leadData: LeadSubmission;
  comparableHomes: ComparableHome[];
  marketTrends: MarketTrend;
  agentAdvice: AgentAdviceScenario[];
  formConfig: FormConfig;
}

// ============================================
// FINAL OUTPUT (matches backend response)
// ============================================
export interface FlowAnalysisOutput {
  flowType: FlowType;
  analysis: FlowAnalysis;
  comparableHomes: ComparableHome[];
  marketTrends?: MarketTrend;           // ← optional (backend may omit)
  agentAdvice?: AgentAdviceScenario[];  // ← optional
  formConfig?: FormConfig;              // ← optional
  leadId?: string;
  generatedAt: Date;
  tokensUsed?: number;
}