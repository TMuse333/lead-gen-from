import { LeadSubmission, MarketTrend } from "@/types";

export function generateMarketSummaryPrompt(
    leadData: LeadSubmission,
    marketTrends: MarketTrend  // Starting data from input
  ): string {
    const area = leadData.propertyProfile?.area || 'Halifax';  // Fallback to Halifax
    const trendsContext = `
  - Average Sale Price: $${marketTrends.averageSalePrice.toLocaleString()}
  - Median Sale Price: $${marketTrends.medianSalePrice.toLocaleString()}
  - Average Days on Market: ${marketTrends.averageDaysOnMarket}
  - Market Trend: ${marketTrend.marketTrend}
  - Trend Percentage: ${marketTrends.trendPercentage}
  - Inventory Level: ${marketTrends.inventoryLevel}
    `;
  
    return `
  You are an expert real estate analyst for ${area}.
  
  INPUT TRENDS:
  ${trendsContext || 'No trend data provided—use general knowledge.'}
  
  TASK: Generate a MarketSummary JSON with these exact fields:
  - summary (string: 2-3 sentence narrative overview of the market)
  - averageSalePrice (number: latest avg price)
  - medianSalePrice (number: latest median price)
  - averageDaysOnMarket (number: avg DOM)
  - marketTrend ('up' | 'down' | 'stable')
  - trendPercentage (number: e.g., 3.2 or -1.5)
  - inventoryLevel ('low' | 'balanced' | 'high')
  
  Be accurate, data-driven, and neutral. Return ONLY the JSON object.
    `;
  }