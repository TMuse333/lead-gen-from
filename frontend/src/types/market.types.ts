// ============================================
// MARKET TRENDS
// ============================================

export interface MarketTrend {
    area: string;
    period: string;
    metrics: {
      averageSalePrice: number;
      medianSalePrice: number;
      averageDaysOnMarket: number;
      totalSales: number;
      inventoryLevel: 'low' | 'balanced' | 'high';
    };
    trend: {
      direction: 'up' | 'down' | 'stable';
      percentageChange: number;
    };
  }