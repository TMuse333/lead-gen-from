// ============================================
// FLOW-SPECIFIC MARKET ANALYSIS TYPES
// ============================================

import { BaseMarketAnalysis } from "./baseMarketAnalysis";



/**
 * Seller-Specific Market Analysis
 * Extends base analysis with seller-focused insights
 */
export interface SellerMarketAnalysis extends BaseMarketAnalysis {
  sellerInsights: {
    // Pricing Strategy
    pricingRecommendation: {
      strategy: 'aggressive' | 'competitive' | 'conservative';
      reasoning: string;
      expectedTimeToSell: number; // days
      confidenceLevel: 'high' | 'medium' | 'low';
    };
    
    // Competition Analysis
    competition: {
      similarListings: number;
      averageListPrice: number;
      daysOnMarketForSimilar: number;
      priceReductionRate: number; // percentage of listings that reduced price
      competitionLevel: 'high' | 'moderate' | 'low';
    };
    
    // Timing Recommendations
    timing: {
      currentMarketScore: number; // 0-100: how good is NOW for selling
      bestTimeToList: string; // e.g., "List within 2 weeks to capture spring market"
      urgencyReason: string;
      seasonalAdvice: string;
    };
    
    // Value Optimization
    valueOptimization: {
      quickWins: string[]; // e.g., ["Fresh paint in living areas", "Professional staging"]
      majorImprovements: string[]; // e.g., ["Kitchen renovation could add $30k"]
      costVsBenefit: {
        item: string;
        estimatedCost: number;
        estimatedValueAdd: number;
        roi: number; // percentage
      }[];
    };
    
    // Risk Factors
    risks: {
      level: 'high' | 'moderate' | 'low';
      factors: string[];
      mitigation: string[];
    };
    
    // Market Positioning
    positioning: {
      competitiveAdvantages: string[];
      potentialChallenges: string[];
      targetBuyerProfile: string;
    };
  };
  
  // Seller-specific narrative
  sellerSummary: string;
}

/**
 * Buyer-Specific Market Analysis
 * Extends base analysis with buyer-focused insights
 */
export interface BuyerMarketAnalysis extends BaseMarketAnalysis {
  buyerInsights: {
    // Opportunity Assessment
    opportunity: {
      currentMarketScore: number; // 0-100: how good is NOW for buying
      buyerAdvantage: 'strong' | 'moderate' | 'weak';
      reasoning: string;
      timingAdvice: string;
    };
    
    // Negotiation Landscape
    negotiation: {
      leverageLevel: 'high' | 'moderate' | 'low';
      typicalPriceReduction: number; // percentage off asking
      competitionForProperties: 'intense' | 'moderate' | 'minimal';
      biddingWarProbability: number; // 0-100
      strategicAdvice: string[];
    };
    
    // Value Opportunities
    valueOpportunities: {
      bestValueNeighborhoods: string[];
      undervaluedPropertyTypes: string[];
      emergingAreas: {
        neighborhood: string;
        appreciationPotential: 'high' | 'moderate' | 'low';
        reasoning: string;
      }[];
      hiddenGems: string[];
    };
    
    // Financing Context
    financing: {
      affordabilityIndex: number; // 0-100: how affordable is the market
      typicalDownPayment: number; // percentage
      closingCostEstimate: number; // percentage of purchase price
      rateEnvironment: 'favorable' | 'neutral' | 'challenging';
      financingTips: string[];
    };
    
    // Inventory Intelligence
    inventory: {
      daysOfSupply: number;
      newListingsRate: number; // listings per week
      freshInventoryOpportunities: string;
      inventoryTrend: string;
    };
    
    // Risk Assessment
    risks: {
      overpayingRisk: 'high' | 'moderate' | 'low';
      marketShiftRisk: 'high' | 'moderate' | 'low';
      warnings: string[];
      protectionStrategies: string[];
    };
    
    // Action Plan
    actionPlan: {
      immediate: string[]; // Things to do this week
      shortTerm: string[]; // Things to do this month
      longTerm: string[]; // Things to consider for 3+ months
    };
  };
  
  // Buyer-specific narrative
  buyerSummary: string;
}

/**
 * Browser-Specific Market Analysis
 * Extends base analysis with exploration-focused insights
 */
export interface BrowserMarketAnalysis extends BaseMarketAnalysis {
  browserInsights: {
    // Market Overview
    overview: {
      marketHealthScore: number; // 0-100
      accessibility: 'very_accessible' | 'accessible' | 'challenging' | 'very_challenging';
      diversityScore: number; // 0-100: variety of property types and price points
      opportunityLevel: 'high' | 'moderate' | 'low';
    };
    
    // Exploration Recommendations
    exploration: {
      recommendedNeighborhoods: {
        name: string;
        priceRange: string;
        characteristics: string[];
        whyInteresting: string;
      }[];
      propertyTypeDistribution: {
        type: string;
        percentage: number;
        averagePrice: number;
        availability: 'abundant' | 'moderate' | 'limited';
      }[];
      searchFilters: {
        priceRanges: { min: number; max: number; label: string }[];
        popularFeatures: string[];
        recommendedSortBy: string;
      };
    };
    
    // Market Education
    education: {
      keyTerms: {
        term: string;
        definition: string;
        relevance: string;
      }[];
      marketDynamics: string[];
      commonMisconceptions: string[];
    };
    
    // Insights & Patterns
    patterns: {
      priceTrends: string;
      popularFeatures: string[];
      emergingTrends: string[];
      seasonalPatterns: string;
    };
    
    // Comparative Analysis
    comparison: {
      neighborhoodComparisons: {
        neighborhood: string;
        avgPrice: number;
        pricePerSqft: number;
        daysOnMarket: number;
        insight: string;
      }[];
      propertyTypeComparisons: {
        type: string;
        valueProposition: string;
        marketStrength: 'strong' | 'moderate' | 'weak';
      }[];
    };
    
    // Next Steps
    nextSteps: {
      ifBuying: string[];
      ifSelling: string[];
      ifInvesting: string[];
      generalResearch: string[];
    };
  };
  
  // Browser-specific narrative
  browserSummary: string;
}