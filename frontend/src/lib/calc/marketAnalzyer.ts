// ============================================
// MARKET ANALYZER
// Processes raw MarketData into BaseMarketAnalysis
// ============================================

import { BaseMarketAnalysis } from '@/types/analysis/baseMarketAnalysis';
import { MarketData, MarketCondition, TrendDirection, InventoryLevel, MarketVelocity } from '@/types/dataTypes/market.types';

/**
 * Main analyzer function - converts raw market data to analyzed insights
 */
export function analyzeMarket(data: MarketData): BaseMarketAnalysis {
  // Calculate all the metrics
  const condition = determineMarketCondition(data);
  const trendDirection = determineTrendDirection(data);
  const inventoryLevel = determineInventoryLevel(data);
  const marketVelocity = determineMarketVelocity(data);
  const competitionScore = calculateCompetitionScore(data);
  const priceChange = calculatePriceChange(data);
  const velocityChange = calculateVelocityChange(data);
  const inventoryChange = calculateInventoryChange(data);
  const timing = calculateTimingIndicators(data, condition, trendDirection);
  const neighborhoods = categorizeNeighborhoods(data);
  const summary = generateMarketSummary(data, condition, trendDirection, timing);

  return {
    condition,
    trendDirection,
    inventoryLevel,
    marketVelocity,
    
    metrics: {
      averageSalePrice: data.averageSalePrice,
      medianSalePrice: data.medianSalePrice,
      averageDaysOnMarket: data.averageDaysOnMarket,
      activeListings: data.totalActiveListings,
      soldLast30Days: data.totalSoldLast30Days,
      absorptionRate: data.absorptionRate || calculateAbsorptionRate(data),
      pricePerSqft: data.pricePerSqft,
      competitionScore,
    },
    
    trends: {
      priceChange,
      velocityChange,
      inventoryChange,
    },
    
    timing,
    neighborhoods,
    summary,
    
    generatedAt: new Date(),
    dataSource: data.area,
  };
}

/**
 * Calculate confidence level in the analysis
 */
export function calculateConfidence(data: MarketData): AnalysisConfidence {
  const daysSinceUpdate = Math.floor(
    (new Date().getTime() - new Date(data.lastUpdated).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // Data recency score (0-100)
  const dataRecency = Math.max(0, 100 - (daysSinceUpdate * 5));
  
  // Sample size score (based on total sold)
  const sampleSize = Math.min(100, (data.totalSoldLast30Days / 50) * 100);
  
  // Market stability score (based on volatility)
  const priceVolatility = data.previousPeriod 
    ? Math.abs((data.averageSalePrice - data.previousPeriod.averageSalePrice) / data.previousPeriod.averageSalePrice)
    : 0;
  const marketStability = Math.max(0, 100 - (priceVolatility * 1000));
  
  const overall = (dataRecency + sampleSize + marketStability) / 3;
  
  const caveats: string[] = [];
  if (dataRecency < 70) caveats.push('Data may not reflect current market conditions');
  if (sampleSize < 60) caveats.push('Limited sample size - use caution with statistical conclusions');
  if (marketStability < 60) caveats.push('High market volatility - trends may change rapidly');
  
  return {
    overall,
    factors: {
      dataRecency,
      sampleSize,
      marketStability,
    },
    caveats: caveats.length > 0 ? caveats : undefined,
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Determine if it's a seller's, buyer's, or balanced market
 */
function determineMarketCondition(data: MarketData): MarketCondition {
  const absorptionRate = data.absorptionRate || calculateAbsorptionRate(data);
  const daysOnMarket = data.averageDaysOnMarket;
  
  // Seller's market: < 4 months inventory, fast sales
  if (absorptionRate < 4 && daysOnMarket < 30) {
    return 'sellers_market';
  }
  
  // Buyer's market: > 6 months inventory, slow sales
  if (absorptionRate > 6 && daysOnMarket > 60) {
    return 'buyers_market';
  }
  
  return 'balanced';
}

/**
 * Calculate absorption rate (months of inventory)
 */
function calculateAbsorptionRate(data: MarketData): number {
  if (data.totalSoldLast30Days === 0) return 12; // Default high if no sales
  
  // Months of inventory = active listings / (sales per month)
  return data.totalActiveListings / data.totalSoldLast30Days;
}

/**
 * Determine price trend direction
 */
function determineTrendDirection(data: MarketData): TrendDirection {
  if (!data.previousPeriod) {
    // Use year-over-year if available
    if (data.yearOverYearChange) {
      if (data.yearOverYearChange > 2) return 'rising';
      if (data.yearOverYearChange < -2) return 'declining';
      return 'stable';
    }
    return 'stable'; // Default if no comparison data
  }
  
  const priceChange = 
    (data.averageSalePrice - data.previousPeriod.averageSalePrice) / 
    data.previousPeriod.averageSalePrice;
  
  if (priceChange > 0.02) return 'rising';
  if (priceChange < -0.02) return 'declining';
  return 'stable';
}

/**
 * Classify inventory level
 */
function determineInventoryLevel(data: MarketData): InventoryLevel {
  const absorptionRate = data.absorptionRate || calculateAbsorptionRate(data);
  
  if (absorptionRate < 4) return 'low';
  if (absorptionRate > 6) return 'high';
  return 'moderate';
}

/**
 * Determine market velocity (how fast properties sell)
 */
function determineMarketVelocity(data: MarketData): MarketVelocity {
  const dom = data.averageDaysOnMarket;
  
  if (dom < 15) return 'very_fast';
  if (dom < 30) return 'fast';
  if (dom < 60) return 'normal';
  if (dom < 90) return 'slow';
  return 'very_slow';
}

/**
 * Calculate competition score (0-100)
 */
function calculateCompetitionScore(data: MarketData): number {
  // Factors: low inventory, fast sales, rising prices
  const inventoryFactor = Math.max(0, 100 - (data.absorptionRate || calculateAbsorptionRate(data)) * 10);
  const velocityFactor = Math.max(0, 100 - data.averageDaysOnMarket);
  
  let priceFactor = 50; // default
  if (data.yearOverYearChange) {
    priceFactor = Math.min(100, 50 + (data.yearOverYearChange * 5));
  }
  
  return Math.round((inventoryFactor + velocityFactor + priceFactor) / 3);
}

/**
 * Calculate price change metrics
 */
function calculatePriceChange(data: MarketData) {
  if (!data.previousPeriod && !data.yearOverYearChange) {
    return {
      percentage: 0,
      direction: 'stable' as TrendDirection,
      significance: 'minor' as const,
    };
  }
  
  let percentage = 0;
  if (data.previousPeriod) {
    percentage = ((data.averageSalePrice - data.previousPeriod.averageSalePrice) / 
                  data.previousPeriod.averageSalePrice) * 100;
  } else if (data.yearOverYearChange) {
    percentage = data.yearOverYearChange;
  }
  
  const direction: TrendDirection = 
    percentage > 2 ? 'rising' : 
    percentage < -2 ? 'declining' : 
    'stable';
  
  const significance: 'minor' | 'moderate' | 'significant' =
    Math.abs(percentage) > 10 ? 'significant' :
    Math.abs(percentage) > 5 ? 'moderate' :
    'minor';
  
  return { percentage, direction, significance };
}

/**
 * Calculate velocity change
 */
function calculateVelocityChange(data: MarketData) {
  if (!data.previousPeriod) {
    return {
      daysOnMarketChange: 0,
      soldVolumeChange: 0,
    };
  }
  
  const daysOnMarketChange = data.averageDaysOnMarket - data.previousPeriod.averageDaysOnMarket;
  const soldVolumeChange = 
    ((data.totalSoldLast30Days - data.previousPeriod.totalSoldLast30Days) / 
    data.previousPeriod.totalSoldLast30Days) * 100;
  
  return {
    daysOnMarketChange,
    soldVolumeChange,
  };
}

/**
 * Calculate inventory change
 */
function calculateInventoryChange(data: MarketData) {
  const newListings = data.newListingsLast7Days || 0;
  const priceReductions = data.priceReductionsLast7Days || 0;
  
  // Determine if inventory is tightening or loosening
  const absorptionRate = data.absorptionRate || calculateAbsorptionRate(data);
  let trend: 'tightening' | 'stable' | 'loosening' = 'stable';
  
  if (absorptionRate < 4) trend = 'tightening';
  if (absorptionRate > 6) trend = 'loosening';
  
  return {
    newListings,
    priceReductions,
    trend,
  };
}

/**
 * Calculate timing indicators
 */
function calculateTimingIndicators(
  data: MarketData,
  condition: MarketCondition,
  trend: TrendDirection
) {
  // Buyer opportunity (better in buyer's market, stable/declining prices)
  let buyerOpportunity: 'excellent' | 'good' | 'fair' | 'poor' = 'fair';
  if (condition === 'buyers_market' && (trend === 'stable' || trend === 'declining')) {
    buyerOpportunity = 'excellent';
  } else if (condition === 'balanced') {
    buyerOpportunity = 'good';
  } else if (condition === 'sellers_market' && trend === 'rising') {
    buyerOpportunity = 'poor';
  }
  
  // Seller opportunity (better in seller's market, rising prices)
  let sellerOpportunity: 'excellent' | 'good' | 'fair' | 'poor' = 'fair';
  if (condition === 'sellers_market' && trend === 'rising') {
    sellerOpportunity = 'excellent';
  } else if (condition === 'balanced') {
    sellerOpportunity = 'good';
  } else if (condition === 'buyers_market' && (trend === 'stable' || trend === 'declining')) {
    sellerOpportunity = 'poor';
  }
  
  // Urgency level
  const urgencyLevel: 'high' | 'moderate' | 'low' = 
    data.averageDaysOnMarket < 20 || data.absorptionRate! < 3 ? 'high' :
    data.averageDaysOnMarket < 45 || data.absorptionRate! < 5 ? 'moderate' :
    'low';
  
  // Seasonal factor (simple heuristic)
  const month = new Date().getMonth();
  let seasonalFactor = '';
  if (month >= 2 && month <= 5) {
    seasonalFactor = 'Spring buying season - high activity expected';
  } else if (month >= 6 && month <= 8) {
    seasonalFactor = 'Summer market - family moves common';
  } else if (month >= 9 && month <= 10) {
    seasonalFactor = 'Fall market - good balance of inventory';
  } else {
    seasonalFactor = 'Winter market - lower activity, potential value';
  }
  
  return {
    buyerOpportunity,
    sellerOpportunity,
    urgencyLevel,
    seasonalFactor,
  };
}

/**
 * Categorize neighborhoods (if data available)
 */
function categorizeNeighborhoods(data: MarketData) {
  if (!data.hotNeighborhoods || data.hotNeighborhoods.length === 0) {
    return undefined;
  }
  
  // Simple categorization - in production, this would use more sophisticated data
  const all = data.hotNeighborhoods;
  
  return {
    hottest: all.slice(0, Math.ceil(all.length / 3)),
    emerging: all.slice(Math.ceil(all.length / 3), Math.ceil(2 * all.length / 3)),
    stable: all.slice(Math.ceil(2 * all.length / 3)),
  };
}

/**
 * Generate market summary narrative
 */
function generateMarketSummary(
  data: MarketData,
  condition: MarketCondition,
  trend: TrendDirection,
  timing: ReturnType<typeof calculateTimingIndicators>
): string {
  const conditionText = 
    condition === 'sellers_market' ? "a seller's market" :
    condition === 'buyers_market' ? "a buyer's market" :
    'a balanced market';
  
  const trendText =
    trend === 'rising' ? 'rising' :
    trend === 'declining' ? 'declining' :
    'stable';
  
  return `${data.area} is currently experiencing ${conditionText} with ${trendText} prices. ` +
    `The average sale price is $${data.averageSalePrice.toLocaleString()} ` +
    `(median: $${data.medianSalePrice.toLocaleString()}), ` +
    `and properties are selling in an average of ${data.averageDaysOnMarket} days. ` +
    `${timing.seasonalFactor}`;
}