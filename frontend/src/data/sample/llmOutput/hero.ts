// lib/sampleData/heroSamples.ts

import { LlmHeroBanner } from "@/types/resultsPageComponents/components/herobanner";



// ==================== SELLER FLOW SAMPLES ====================

export const SELLER_URGENT_SAMPLE: LlmHeroBanner = {
  headline: "Let's Get Your Home Sold Fast, Sarah!",
  subheadline: "With your 0-3 month timeline and Halifax's hot seller's market, your recently renovated kitchen positions you perfectly for a quick, profitable sale.",
  urgencyLevel: 'high',
  emoji: '🚀',
  backgroundTheme: 'warm'
};

export const SELLER_PLANNED_SAMPLE: LlmHeroBanner = {
  headline: "Michael, Let's Plan Your Perfect Home Sale",
  subheadline: "Your 6-12 month timeline gives us the advantage of strategic preparation. Together, we'll maximize your townhouse's value in Bedford's growing market.",
  urgencyLevel: 'medium',
  emoji: '🏠',
  backgroundTheme: 'cool'
};

export const SELLER_EXPLORING_SAMPLE: LlmHeroBanner = {
  headline: "Jennifer, Let's Explore Your Selling Options",
  subheadline: "You're just exploring possibilities for your multi-family property, and that's the perfect time to understand your home's value and market potential without any pressure.",
  urgencyLevel: 'low',
  emoji: '💡',
  backgroundTheme: 'neutral'
};

// ==================== BUYER FLOW SAMPLES ====================

export const BUYER_URGENT_SAMPLE: LlmHeroBanner = {
  headline: "James, Let's Find Your Dream Home Now!",
  subheadline: "You're ready to buy within 3 months with a strong budget of $400K-$600K. Halifax has great single-family homes waiting for you, and timing is everything in this market.",
  urgencyLevel: 'high',
  emoji: '🔑',
  backgroundTheme: 'warm'
};

export const BUYER_PLANNED_SAMPLE: LlmHeroBanner = {
  headline: "Welcome to Your Home Buying Journey, Lisa!",
  subheadline: "Your 3-6 month timeline for a 3-bedroom condo gives us perfect time to find exactly what you're looking for in Dartmouth. Let's make your first home purchase smooth and exciting.",
  urgencyLevel: 'medium',
  emoji: '🏡',
  backgroundTheme: 'cool'
};

export const BUYER_EXPLORING_SAMPLE: LlmHeroBanner = {
  headline: "David, Let's Explore the Market Together",
  subheadline: "Planning to downsize in the next year? Perfect timing to understand what's available, what your budget can get you, and how to prepare for a confident purchase when you're ready.",
  urgencyLevel: 'low',
  emoji: '👀',
  backgroundTheme: 'neutral'
};

// ==================== BROWSER FLOW SAMPLES ====================

export const BROWSER_MARKET_TRENDS_SAMPLE: LlmHeroBanner = {
  headline: "Emma, Here's Your Halifax Market Insider's Guide",
  subheadline: "You're curious about market trends in downtown Halifax, and I'm excited to share insights that could shape your investment decisions in the coming year.",
  urgencyLevel: 'low',
  emoji: '📈',
  backgroundTheme: 'cool'
};

export const BROWSER_INVESTMENT_SAMPLE: LlmHeroBanner = {
  headline: "Robert, Let's Unlock Your Investment Potential",
  subheadline: "Your interest in investment opportunities in the $600K-$800K range shows smart thinking. Halifax's rental market is thriving, and I'll show you exactly where the opportunities are.",
  urgencyLevel: 'medium',
  emoji: '💰',
  backgroundTheme: 'warm'
};

export const BROWSER_GENERAL_SAMPLE: LlmHeroBanner = {
  headline: "Hi Alex! Let's Explore Halifax Real Estate",
  subheadline: "Just browsing and gathering information? That's the smartest first step. Let me give you a personalized look at what's happening in Bedford's real estate market right now.",
  urgencyLevel: 'low',
  emoji: '🗺️',
  backgroundTheme: 'neutral'
};

// ==================== ORGANIZED BY FLOW ====================

export const HERO_SAMPLES = {
  sell: {
    urgent: SELLER_URGENT_SAMPLE,
    planned: SELLER_PLANNED_SAMPLE,
    exploring: SELLER_EXPLORING_SAMPLE
  },
  buy: {
    urgent: BUYER_URGENT_SAMPLE,
    planned: BUYER_PLANNED_SAMPLE,
    exploring: BUYER_EXPLORING_SAMPLE
  },
  browse: {
    marketTrends: BROWSER_MARKET_TRENDS_SAMPLE,
    investment: BROWSER_INVESTMENT_SAMPLE,
    general: BROWSER_GENERAL_SAMPLE
  }
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Get a sample based on flow and urgency/scenario
 */
export function getHeroSample(
  flow: 'sell' | 'buy' | 'browse',
  scenario: string
): LlmHeroBanner {
  const flowSamples = HERO_SAMPLES[flow];
  
  // Type assertion since we know the structure
  return (flowSamples as any)[scenario] || SELLER_EXPLORING_SAMPLE;
}

/**
 * Get all samples for a specific flow
 */
export function getAllSamplesForFlow(flow: 'sell' | 'buy' | 'browse'): LlmHeroBanner[] {
  return Object.values(HERO_SAMPLES[flow]);
}