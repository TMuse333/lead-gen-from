// ============================================
// MARKET ANALYSIS TYPES (MVP - Simplified)
// ============================================

// ============================================
// BASE MARKET DATA (shared by all flows)
// ============================================
export interface BaseMarketAnalysis {
  // Market condition
  condition: 'sellers_market' | 'balanced' | 'buyers_market';
  
  // Key metrics (simplified)
  metrics: {
    averageSalePrice: number;
    averageDaysOnMarket: number;
    activeListings: number;
  };
  
  // Simple trend
  trend: {
    direction: 'rising' | 'stable' | 'declining';
    priceChangePercent: number;        // e.g., +5.2% or -3.1%
  };
  
  // AI-generated summary
  summary: string;
  
  generatedAt: Date;
}

// ============================================
// SELLER MARKET ANALYSIS (extends base)
// ============================================
export interface SellerMarketAnalysis extends BaseMarketAnalysis {
  sellerInsights: {
    // Should they sell now?
    timing: {
      score: number;                    // 0-100: how good is NOW for selling
      recommendation: string;           // e.g., "Great time to list"
    };
    
    // Competition
    competition: {
      similarListings: number;
      level: 'high' | 'moderate' | 'low';
    };
    
    // Quick wins to increase value
    valueBoosts: string[];              // e.g., ["Fresh paint", "Staging"]
  };
}

// ============================================
// BUYER MARKET ANALYSIS (extends base)
// ============================================
export interface BuyerMarketAnalysis extends BaseMarketAnalysis {
  buyerInsights: {
    // Should they buy now?
    timing: {
      score: number;                    // 0-100: how good is NOW for buying
      recommendation: string;           // e.g., "Good buyer's market"
    };
    
    // Negotiation power
    negotiation: {
      leverage: 'high' | 'moderate' | 'low';
      tip: string;                      // e.g., "You can negotiate 5-10% off asking"
    };
    
    // Hot neighborhoods in their budget
    hotAreas: string[];                 // e.g., ["Dartmouth", "Bedford"]
  };
}

// ============================================
// BROWSER MARKET ANALYSIS (extends base)
// ============================================
export interface BrowserMarketAnalysis extends BaseMarketAnalysis {
  browserInsights: {
    // Market health overview
    marketHealth: {
      score: number;                    // 0-100
      description: string;              // e.g., "Strong and stable"
    };
    
    // Areas of interest
    areasToWatch: string[];             // Neighborhoods gaining value
    
    // Investment potential
    investmentOutlook: string;          // e.g., "Moderate growth expected"
  };
}

// ============================================
// UNION TYPE
// ============================================
export type MarketAnalysis = SellerMarketAnalysis | BuyerMarketAnalysis | BrowserMarketAnalysis;

// ============================================
// SAMPLE DATA GENERATOR (for MVP testing)
// ============================================
export function generateSampleMarketData(flowType: 'sell' | 'buy' | 'browse'): MarketAnalysis {
  const base: BaseMarketAnalysis = {
    condition: 'balanced',
    metrics: {
      averageSalePrice: 485000,
      averageDaysOnMarket: 32,
      activeListings: 847,
    },
    trend: {
      direction: 'rising',
      priceChangePercent: 4.2,
    },
    summary: 'Halifax real estate market is showing steady growth with balanced conditions. Prices are up 4.2% year-over-year.',
    generatedAt: new Date(),
  };

  if (flowType === 'sell') {
    return {
      ...base,
      sellerInsights: {
        timing: {
          score: 78,
          recommendation: 'Great time to list - strong buyer demand',
        },
        competition: {
          similarListings: 23,
          level: 'moderate',
        },
        valueBoosts: [
          'Fresh paint in high-traffic areas',
          'Professional staging for photos',
          'Minor landscaping improvements',
        ],
      },
    } as SellerMarketAnalysis;
  }

  if (flowType === 'buy') {
    return {
      ...base,
      buyerInsights: {
        timing: {
          score: 65,
          recommendation: 'Moderate buyer conditions - act strategically',
        },
        negotiation: {
          leverage: 'moderate',
          tip: 'Properties sitting 45+ days may accept 3-5% below asking',
        },
        hotAreas: ['Dartmouth', 'Bedford', 'Clayton Park'],
      },
    } as BuyerMarketAnalysis;
  }

  // Browse
  return {
    ...base,
    browserInsights: {
      marketHealth: {
        score: 72,
        description: 'Strong and stable with moderate growth',
      },
      areasToWatch: ['Fairview', 'Spryfield', 'Eastern Passage'],
      investmentOutlook: 'Halifax shows consistent 3-5% annual appreciation',
    },
  } as BrowserMarketAnalysis;
}