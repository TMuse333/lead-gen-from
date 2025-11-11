// lib/sampleData/marketInsightsSamples.ts

import { LlmMarketInsights } from "@/types/resultsPageComponents/components/marketInsights";

// ==================== SELLER FLOW SAMPLES ====================

export const SELLER_HOT_MARKET_SAMPLE: LlmMarketInsights = {
  sectionTitle: "Your Market Snapshot",
  headline: "Excellent Time to Sell",
  summary: "In Halifax, homes are selling in 28 days on average with rising prices. 450 active listings create strong seller leverage in the current market.",
  insights: [
    {
      metric: "Average Days to Sell",
      value: "28 days",
      interpretation: "Homes are selling quickly - great time to list",
      sentiment: "positive",
      icon: "⏱️"
    },
    {
      metric: "Price Trend",
      value: "+8.5%",
      interpretation: "Strong appreciation - sellers have pricing power",
      sentiment: "positive",
      icon: "📈"
    },
    {
      metric: "Active Competition",
      value: "450 homes",
      interpretation: "Low inventory gives you negotiating leverage",
      sentiment: "positive",
      icon: "🏘️"
    },
    {
      metric: "Market Absorption",
      value: "5.3 months",
      interpretation: "Seller's market - buyers competing for homes",
      sentiment: "positive",
      icon: "🎯"
    }
  ],
  recommendation: "Price confidently and prepare for multiple offers. Professional photos and staging will maximize your advantage in this seller's market.",
  dataSource: "Based on Halifax MLS Data",
  lastUpdated: "November 11, 2025"
};

export const SELLER_BALANCED_MARKET_SAMPLE: LlmMarketInsights = {
  sectionTitle: "Current Market Conditions",
  headline: "Strategic Pricing Is Key",
  summary: "Halifax homes are taking 42 days to sell on average. With 650 active listings and stable prices, quality presentation will make you stand out.",
  insights: [
    {
      metric: "Average Days to Sell",
      value: "42 days",
      interpretation: "Steady market with reasonable sale timelines",
      sentiment: "neutral",
      icon: "⏱️"
    },
    {
      metric: "Price Trend",
      value: "+2.1%",
      interpretation: "Modest growth - stable seller's market",
      sentiment: "neutral",
      icon: "📊"
    },
    {
      metric: "Active Competition",
      value: "650 homes",
      interpretation: "Moderate competition - stand out with staging",
      sentiment: "neutral",
      icon: "🏘️"
    },
    {
      metric: "Market Absorption",
      value: "6.2 months",
      interpretation: "Balanced market - quality listings move well",
      sentiment: "neutral",
      icon: "🎯"
    }
  ],
  recommendation: "Price accurately from day one and ensure your home shows perfectly. Quality presentation separates quick sales from lingering listings.",
  dataSource: "Based on Halifax MLS Data",
  lastUpdated: "November 11, 2025"
};

export const SELLER_SLOW_MARKET_SAMPLE: LlmMarketInsights = {
  sectionTitle: "Market Intelligence",
  headline: "Professional Marketing Essential",
  summary: "With homes averaging 58 days on market and 800 active listings in Halifax, competitive pricing and exceptional marketing are critical for success.",
  insights: [
    {
      metric: "Average Days to Sell",
      value: "58 days",
      interpretation: "Homes taking longer - pricing will be critical",
      sentiment: "caution",
      icon: "⏱️"
    },
    {
      metric: "Price Trend",
      value: "-1.2%",
      interpretation: "Declining prices - competitive pricing essential",
      sentiment: "caution",
      icon: "📉"
    },
    {
      metric: "Active Competition",
      value: "800 homes",
      interpretation: "High competition - professional marketing crucial",
      sentiment: "caution",
      icon: "🏘️"
    },
    {
      metric: "Market Absorption",
      value: "8.5 months",
      interpretation: "Buyer's market - be prepared to negotiate",
      sentiment: "caution",
      icon: "🎯"
    }
  ],
  recommendation: "Competitive pricing and exceptional marketing are critical. Consider pre-listing inspections, be flexible on terms, and be prepared to negotiate actively with buyers.",
  dataSource: "Based on Halifax MLS Data",
  lastUpdated: "November 11, 2025"
};

export const SELLER_URGENT_TIMELINE_SAMPLE: LlmMarketInsights = {
  sectionTitle: "Your Market Reality",
  headline: "Move Fast, Price Right",
  summary: "Your 0-3 month timeline requires aggressive action. Halifax's 32-day average sale timeline means you need to list within 2 weeks to meet your deadline.",
  insights: [
    {
      metric: "Your Timeline Pressure",
      value: "0-3 months",
      interpretation: "List within 2 weeks to allow 30+ days for sale",
      sentiment: "caution",
      icon: "🚨"
    },
    {
      metric: "Average Sale Timeline",
      value: "32 days",
      interpretation: "Plus 2-4 weeks for closing - plan accordingly",
      sentiment: "neutral",
      icon: "⏱️"
    },
    {
      metric: "Price Strategy",
      value: "+6.2%",
      interpretation: "Market allows confident pricing, but urgency matters",
      sentiment: "positive",
      icon: "💰"
    },
    {
      metric: "Success Rate",
      value: "78%",
      interpretation: "Most properly-priced homes sell within 45 days",
      sentiment: "positive",
      icon: "🎯"
    }
  ],
  recommendation: "With your urgent timeline, price at or slightly below market value to ensure quick offers. Skip renovations - sell as-is and focus on deep cleaning and decluttering immediately.",
  dataSource: "Personalized for your timeline",
  lastUpdated: "November 11, 2025"
};

// ==================== ORGANIZED BY SCENARIO ====================

export const MARKET_INSIGHTS_SAMPLES = {
  sell: {
    hot: SELLER_HOT_MARKET_SAMPLE,
    balanced: SELLER_BALANCED_MARKET_SAMPLE,
    slow: SELLER_SLOW_MARKET_SAMPLE,
    urgent: SELLER_URGENT_TIMELINE_SAMPLE
  }
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Get a sample based on market conditions
 */
export function getMarketInsightsSample(
  flow: 'sell' | 'buy' | 'browse',
  scenario: string
): LlmMarketInsights {
  const flowSamples: |'buy' | 'sell' | 'browse' = MARKET_INSIGHTS_SAMPLES[flow] as const;
  
  if (!flowSamples) {
    return SELLER_BALANCED_MARKET_SAMPLE; // Default fallback
  }
  
  // Type assertion since we know the structure
  return (flowSamples as any)[scenario] || SELLER_BALANCED_MARKET_SAMPLE;
}

/**
 * Get sample based on days on market
 */
export function getMarketInsightsByDOM(
  flow: 'sell',
  daysOnMarket: number
): LlmMarketInsights {
  if (daysOnMarket < 25) {
    return MARKET_INSIGHTS_SAMPLES.sell.hot;
  } else if (daysOnMarket < 45) {
    return MARKET_INSIGHTS_SAMPLES.sell.balanced;
  } else {
    return MARKET_INSIGHTS_SAMPLES.sell.slow;
  }
}