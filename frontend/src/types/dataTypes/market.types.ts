// ============================================
// MARKET DATA TYPES
// ============================================

/**
 * Raw market data - typically from external API or agent updates
 * This is the source of truth that gets analyzed
 */
 export interface MarketData {
  area: string; // e.g., "Halifax", "Downtown Halifax"
  lastUpdated: Date;
  
  // Core stats (from realtor or MLS API)
  averageSalePrice: number;
  medianSalePrice: number;
  averageDaysOnMarket: number;
  totalActiveListings: number;
  totalSoldLast30Days: number;
  absorptionRate?: number; // months of inventory
  
  // Optional growth metrics
  pricePerSqft?: number;
  newListingsLast7Days?: number;
  priceReductionsLast7Days?: number;
  hotNeighborhoods?: string[];
  yearOverYearChange?: number;
  
  // Historical comparison (optional)
  previousPeriod?: {
    averageSalePrice: number;
    medianSalePrice: number;
    averageDaysOnMarket: number;
    totalSoldLast30Days: number;
  };
}

/**
 * Market condition classification
 */
export type MarketCondition = 'sellers_market' | 'balanced' | 'buyers_market';

/**
 * Market trend direction
 */
export type TrendDirection = 'rising' | 'stable' | 'declining';

/**
 * Inventory level classification
 */
export type InventoryLevel = 'low' | 'moderate' | 'high';

/**
 * Market velocity (how fast properties are selling)
 */
export type MarketVelocity = 'very_fast' | 'fast' | 'normal' | 'slow' | 'very_slow';