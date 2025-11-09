// ============================================
// BASE MARKET ANALYSIS TYPES
// ============================================

import { MarketCondition, TrendDirection, InventoryLevel, MarketVelocity } from './market.types';

/**
 * Base Market Analysis - Universal insights from market data
 * This is flow-agnostic and provides core market intelligence
 */
export interface BaseMarketAnalysis {
  // Market Classification
  condition: MarketCondition;
  trendDirection: TrendDirection;
  inventoryLevel: InventoryLevel;
  marketVelocity: MarketVelocity;
  
  // Key Metrics
  metrics: {
    averageSalePrice: number;
    medianSalePrice: number;
    averageDaysOnMarket: number;
    activeListings: number;
    soldLast30Days: number;
    absorptionRate: number; // months of inventory
    pricePerSqft?: number;
    competitionScore: number; // 0-100: how competitive the market is
  };
  
  // Trend Analysis
  trends: {
    priceChange: {
      percentage: number;
      direction: TrendDirection;
      significance: 'minor' | 'moderate' | 'significant';
    };
    velocityChange: {
      daysOnMarketChange: number; // negative = faster
      soldVolumeChange: number; // percentage
    };
    inventoryChange: {
      newListings: number;
      priceReductions: number;
      trend: 'tightening' | 'stable' | 'loosening';
    };
  };
  
  // Timing Indicators
  timing: {
    buyerOpportunity: 'excellent' | 'good' | 'fair' | 'poor';
    sellerOpportunity: 'excellent' | 'good' | 'fair' | 'poor';
    urgencyLevel: 'high' | 'moderate' | 'low';
    seasonalFactor: string; // e.g., "Spring buying season"
  };
  
  // Neighborhood Insights
  neighborhoods?: {
    hottest: string[];
    emerging: string[];
    stable: string[];
  };
  
  // Generated narrative
  summary: string;
  
  // Metadata
  generatedAt: Date;
  dataSource: string;
}

/**
 * Market Analysis Confidence Levels
 */
export interface AnalysisConfidence {
  overall: number; // 0-100
  factors: {
    dataRecency: number;
    sampleSize: number;
    marketStability: number;
  };
  caveats?: string[];
}