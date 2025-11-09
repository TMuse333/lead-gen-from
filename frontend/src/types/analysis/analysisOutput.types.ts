// ============================================
// ANALYSIS OUTPUT TYPES (MVP - Simplified)
// What the user sees on results page
// ============================================

import { BaseMarketAnalysis } from "./baseMarketAnalysis";



// ============================================
// BASE ANALYSIS OUTPUT (shared by all flows)
// ============================================
export interface BaseAnalysisOutput {
  // User info
  email: string;
  
  // Flow type
  flowType: 'sell' | 'buy' | 'browse';
  
  // Market data (flow-specific)
  marketAnalysis: BaseMarketAnalysis;
  
  // Personalized recommendations
  recommendations: string[];
  
  // Next steps
  nextSteps: string[];
  
  // Timestamp
  generatedAt: Date;
}

// ============================================
// SELLER ANALYSIS OUTPUT (extends base)
// ============================================
export interface SellerAnalysisOutput extends BaseAnalysisOutput {
  flowType: 'sell';
  
  // Estimated home value
  estimatedValue: {
    low: number;
    high: number;
    confidence: number;              // 0-100
  };
  
  // Comparable homes (simplified)
  comparables: {
    address: string;
    price: number;
    beds: number;
    baths: number;
    sqft?: number;
  }[];
  
  // Seller-specific advice
  sellerAdvice: {
    pricingStrategy: string;         // e.g., "List at $525K for quick sale"
    bestTimeToList: string;          // e.g., "Spring market (March-May)"
    prepTips: string[];              // Home prep suggestions
  };
}

// ============================================
// BUYER ANALYSIS OUTPUT (extends base)
// ============================================
export interface BuyerAnalysisOutput extends BaseAnalysisOutput {
  flowType: 'buy';
  
  // Recommended properties (simplified)
  recommendedHomes: {
    address: string;
    price: number;
    beds: number;
    baths: number;
    sqft?: number;
    neighborhood: string;
    whyRecommended: string;          // AI explanation
  }[];
  
  // Buyer-specific advice
  buyerAdvice: {
    budgetTip: string;               // e.g., "You can afford $450-525K range"
    negotiationStrategy: string;     // e.g., "Ask for seller concessions"
    financingAdvice: string;         // e.g., "Get pre-approved first"
  };
}

// ============================================
// BROWSER ANALYSIS OUTPUT (extends base)
// ============================================
export interface BrowserAnalysisOutput extends BaseAnalysisOutput {
  flowType: 'browse';
  
  // Market highlights
  highlights: {
    topNeighborhoods: { name: string; avgPrice: number }[];
    emergingAreas: string[];
    investmentSpots: string[];
  };
  
  // Browser-specific advice
  browserAdvice: {
    ifBuying: string[];              // What to do if they decide to buy
    ifSelling: string[];             // What to do if they decide to sell
    marketTiming: string;            // When's the best time to act
  };
}

// ============================================
// UNION TYPE
// ============================================
export type AnalysisOutput = SellerAnalysisOutput | BuyerAnalysisOutput | BrowserAnalysisOutput;

// ============================================
// RESPONSE WRAPPER (for API)
// ============================================
export interface AnalysisResponse {
  success: boolean;
  analysis: AnalysisOutput;
  error?: string;
}