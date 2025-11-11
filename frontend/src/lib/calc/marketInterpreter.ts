// lib/calc/marketInterpreter.ts

import { MarketData } from '@/types/dataTypes/market.types';

/**
 * Interpret market data contextually based on user flow
 * Same data, different insights for sellers vs buyers vs browsers
 */

export interface FlowSpecificInsight {
  metric: string;
  value: string;
  interpretation: string;
  sentiment: 'positive' | 'neutral' | 'caution';
  icon: string;
}

export interface MarketInterpretation {
  headline: string;
  summary: string;
  insights: FlowSpecificInsight[];
  recommendation: string;
}

/**
 * Main function: Interpret market data based on flow
 */
export function interpretMarketForFlow(
  marketData: MarketData,
  flow: 'sell' | 'buy' | 'browse'
): MarketInterpretation {
  switch (flow) {
    case 'sell':
      return interpretForSellers(marketData);
    case 'buy':
      return interpretForBuyers(marketData);
    case 'browse':
      return interpretForBrowsers(marketData);
    default:
      return interpretForBrowsers(marketData);
  }
}

// ==================== SELLER INTERPRETATION ====================

function interpretForSellers(data: MarketData): MarketInterpretation {
  const insights: FlowSpecificInsight[] = [];
  
  // 1. Days on Market - Sellers want LOW
  const dom = data.averageDaysOnMarket;
  insights.push({
    metric: 'Average Days to Sell',
    value: `${dom} days`,
    interpretation: dom < 20 
      ? 'Homes are selling quickly - great time to list'
      : dom < 35
      ? 'Steady market with reasonable sale timelines'
      : 'Homes taking longer - pricing will be critical',
    sentiment: dom < 20 ? 'positive' : dom < 35 ? 'neutral' : 'caution',
    icon: '⏱️'
  });
  
  // 2. Price Trend - Sellers want UP
  const priceChange = data.yearOverYearChange || 0;
  insights.push({
    metric: 'Price Trend',
    value: `${priceChange > 0 ? '+' : ''}${priceChange.toFixed(1)}%`,
    interpretation: priceChange > 5
      ? 'Strong appreciation - sellers have pricing power'
      : priceChange > 0
      ? 'Modest growth - stable seller\'s market'
      : 'Declining prices - competitive pricing essential',
    sentiment: priceChange > 5 ? 'positive' : priceChange > 0 ? 'neutral' : 'caution',
    icon: '📈'
  });
  
  // 3. Inventory - Sellers want LOW (less competition)
  const inventory = data.totalActiveListings;
  insights.push({
    metric: 'Active Competition',
    value: `${inventory} homes`,
    interpretation: inventory < 400
      ? 'Low inventory gives you negotiating leverage'
      : inventory < 600
      ? 'Moderate competition - stand out with staging'
      : 'High competition - professional marketing crucial',
    sentiment: inventory < 400 ? 'positive' : inventory < 600 ? 'neutral' : 'caution',
    icon: '🏘️'
  });
  
  // 4. Absorption Rate - Sellers want HIGH
  const absorptionRate = data.absorptionRate || calculateAbsorptionRate(data);
  insights.push({
    metric: 'Market Absorption',
    value: `${absorptionRate.toFixed(1)} months`,
    interpretation: absorptionRate < 3
      ? 'Seller\'s market - buyers competing for homes'
      : absorptionRate < 6
      ? 'Balanced market - quality listings move well'
      : 'Buyer\'s market - be prepared to negotiate',
    sentiment: absorptionRate < 3 ? 'positive' : absorptionRate < 6 ? 'neutral' : 'caution',
    icon: '🎯'
  });
  
  return {
    headline: getSellerHeadline(dom, priceChange, absorptionRate),
    summary: `In ${data.area}, homes are selling in ${dom} days on average with ${priceChange > 0 ? 'rising' : 'declining'} prices. ${inventory} active listings create ${absorptionRate < 3 ? 'strong seller leverage' : absorptionRate < 6 ? 'balanced conditions' : 'buyer-favorable conditions'}.`,
    insights,
    recommendation: getSellerRecommendation(dom, priceChange, absorptionRate)
  };
}

function getSellerHeadline(dom: number, priceChange: number, absorption: number): string {
  if (dom < 20 && priceChange > 5) return 'Excellent Time to Sell';
  if (dom < 30 && priceChange > 0) return 'Favorable Selling Conditions';
  if (dom < 45) return 'Strategic Pricing Is Key';
  return 'Competitive Market - Professional Marketing Essential';
}

function getSellerRecommendation(dom: number, priceChange: number, absorption: number): string {
  if (dom < 20 && absorption < 3) {
    return 'Price confidently and prepare for multiple offers. Professional photos and staging will maximize your advantage.';
  } else if (dom < 35) {
    return 'Price accurately from day one and ensure your home shows perfectly. Quality presentation separates quick sales from lingering listings.';
  } else {
    return 'Competitive pricing and exceptional marketing are critical. Consider pre-listing inspections and be prepared to negotiate.';
  }
}

// ==================== BUYER INTERPRETATION ====================

function interpretForBuyers(data: MarketData): MarketInterpretation {
  const insights: FlowSpecificInsight[] = [];
  
  // 1. Days on Market - Buyers want HIGH (more time to decide)
  const dom = data.averageDaysOnMarket;
  insights.push({
    metric: 'Decision Timeline',
    value: `${dom} days average`,
    interpretation: dom < 20
      ? 'Move fast - homes receiving offers quickly'
      : dom < 35
      ? 'Reasonable time to evaluate and make decisions'
      : 'More time to shop and negotiate terms',
    sentiment: dom < 20 ? 'caution' : dom < 35 ? 'neutral' : 'positive',
    icon: '⏱️'
  });
  
  // 2. Price Trend - Buyers want DOWN or STABLE
  const priceChange = data.yearOverYearChange || 0;
  insights.push({
    metric: 'Price Trend',
    value: `${priceChange > 0 ? '+' : ''}${priceChange.toFixed(1)}%`,
    interpretation: priceChange > 5
      ? 'Rising prices - lock in rates now before further increases'
      : priceChange > 0
      ? 'Modest appreciation - normal growth market'
      : 'Declining prices - opportunity for negotiation',
    sentiment: priceChange > 5 ? 'caution' : priceChange > 0 ? 'neutral' : 'positive',
    icon: '📊'
  });
  
  // 3. Inventory - Buyers want HIGH (more choices)
  const inventory = data.totalActiveListings;
  insights.push({
    metric: 'Available Options',
    value: `${inventory} homes`,
    interpretation: inventory < 400
      ? 'Limited selection - be ready to act on good matches'
      : inventory < 600
      ? 'Healthy selection across price ranges'
      : 'Abundant choices - take time to find the perfect fit',
    sentiment: inventory < 400 ? 'caution' : inventory < 600 ? 'neutral' : 'positive',
    icon: '🏠'
  });
  
  // 4. Your Budget Context
  const avgPrice = data.averageSalePrice;
  const medianPrice = data.medianSalePrice;
  insights.push({
    metric: 'Price Context',
    value: `$${(medianPrice / 1000).toFixed(0)}K median`,
    interpretation: `Half of homes sell for less than $${(medianPrice / 1000).toFixed(0)}K. Average is $${(avgPrice / 1000).toFixed(0)}K. Range varies by neighborhood and property type.`,
    sentiment: 'neutral',
    icon: '💰'
  });
  
  return {
    headline: getBuyerHeadline(dom, priceChange, inventory),
    summary: `${data.area} offers ${inventory} active listings with a median sale price of $${(medianPrice / 1000).toFixed(0)}K. Homes are averaging ${dom} days on market. ${priceChange > 0 ? 'Prices are rising' : 'Prices are stable'}, ${dom < 20 ? 'so pre-approval and quick decisions are essential' : 'giving you time to find the right fit'}.`,
    insights,
    recommendation: getBuyerRecommendation(dom, priceChange, inventory)
  };
}

function getBuyerHeadline(dom: number, priceChange: number, inventory: number): string {
  if (dom < 20 && inventory < 400) return 'Competitive Market - Act Fast';
  if (dom < 35 && priceChange < 5) return 'Balanced Conditions for Buyers';
  if (inventory > 600) return 'Great Selection Available';
  return 'Favorable Conditions with Good Options';
}

function getBuyerRecommendation(dom: number, priceChange: number, inventory: number): string {
  if (dom < 20 && inventory < 400) {
    return 'Get pre-approved immediately and be prepared to make decisions within 24-48 hours of viewings. Strong offers win in this market.';
  } else if (dom < 35) {
    return 'Secure pre-approval and define your criteria clearly. You have time to be selective, but quality homes still move quickly.';
  } else {
    return 'Take advantage of increased negotiating power. View multiple properties, compare carefully, and don\'t hesitate to negotiate on price and conditions.';
  }
}

// ==================== BROWSER INTERPRETATION ====================

function interpretForBrowsers(data: MarketData): MarketInterpretation {
  const insights: FlowSpecificInsight[] = [];
  
  // 1. Market Temperature
  const dom = data.averageDaysOnMarket;
  const absorption = data.absorptionRate || calculateAbsorptionRate(data);
  insights.push({
    metric: 'Market Temperature',
    value: absorption < 3 ? 'Hot' : absorption < 6 ? 'Balanced' : 'Cool',
    interpretation: absorption < 3
      ? 'Fast-paced seller\'s market with high demand'
      : absorption < 6
      ? 'Balanced market with fair conditions for both sides'
      : 'Buyer-friendly market with more negotiating room',
    sentiment: 'neutral',
    icon: '🌡️'
  });
  
  // 2. Price Trends
  const priceChange = data.yearOverYearChange || 0;
  const previousPrice = data.previousPeriod?.averageSalePrice || data.averageSalePrice;
  const monthlyChange = ((data.averageSalePrice - previousPrice) / previousPrice) * 100;
  insights.push({
    metric: 'Price Movement',
    value: `${priceChange > 0 ? '+' : ''}${priceChange.toFixed(1)}% YoY`,
    interpretation: `Year-over-year growth of ${priceChange.toFixed(1)}%. ${monthlyChange > 0 ? `Recent uptick of ${monthlyChange.toFixed(1)}% from last period` : 'Prices stabilizing'}. ${data.area} ${priceChange > 8 ? 'continues strong appreciation' : priceChange > 3 ? 'shows steady growth' : 'remains stable'}.`,
    sentiment: priceChange > 8 ? 'positive' : 'neutral',
    icon: '📈'
  });
  
  // 3. Activity Level
  const recentSales = data.totalSoldLast30Days;
  const newListings = data.newListingsLast7Days || 0;
  insights.push({
    metric: 'Market Activity',
    value: `${recentSales} sales/month`,
    interpretation: `${recentSales} transactions closed in the last 30 days with ${newListings} new listings this week. ${dom < 25 ? 'High activity levels' : 'Moderate pace'}. ${data.area} is ${recentSales > 80 ? 'very active' : recentSales > 50 ? 'steadily active' : 'moderately active'}.`,
    sentiment: 'neutral',
    icon: '📊'
  });
  
  // 4. Investment Perspective
  const avgPrice = data.averageSalePrice;
  insights.push({
    metric: 'Investment Outlook',
    value: `$${(avgPrice / 1000).toFixed(0)}K avg`,
    interpretation: `Average sale price of $${(avgPrice / 1000).toFixed(0)}K. ${priceChange > 5 ? 'Strong appreciation suggests healthy investment potential' : priceChange > 0 ? 'Steady growth indicates stable market fundamentals' : 'Price stabilization may present buying opportunities'}. ${data.area} offers diverse property types across price ranges.`,
    sentiment: priceChange > 5 ? 'positive' : 'neutral',
    icon: '💼'
  });
  
  return {
    headline: getBrowserHeadline(priceChange, absorption),
    summary: `${data.area} real estate market shows ${priceChange > 0 ? 'positive momentum' : 'stability'} with ${recentSales} monthly transactions and ${dom} average days on market. The ${absorption < 3 ? 'seller\'s' : absorption < 6 ? 'balanced' : 'buyer\'s'} market offers opportunities for ${priceChange > 5 ? 'long-term appreciation' : 'strategic entry'}.`,
    insights,
    recommendation: getBrowserRecommendation(priceChange, absorption)
  };
}

function getBrowserHeadline(priceChange: number, absorption: number): string {
  if (priceChange > 8) return 'Strong Growth Market';
  if (priceChange > 3 && absorption < 4) return 'Healthy, Active Market';
  if (absorption < 3) return 'Fast-Paced Market Conditions';
  return 'Stable Market with Opportunities';
}

function getBrowserRecommendation(priceChange: number, absorption: number): string {
  if (priceChange > 5 && absorption < 3) {
    return 'Strong market fundamentals suggest good long-term potential. Whether buying or selling, timing and preparation are key in this active market.';
  } else if (priceChange > 0) {
    return 'Balanced conditions offer opportunities for both buyers and sellers. Understanding your specific neighborhood and property type is essential for success.';
  } else {
    return 'Market stabilization creates strategic opportunities. Whether you\'re exploring buying, selling, or investing, thorough research and local expertise will be valuable.';
  }
}

// ==================== HELPER FUNCTIONS ====================

function calculateAbsorptionRate(data: MarketData): number {
  // Absorption rate = months of inventory at current sales pace
  // Lower = faster moving = seller's market
  const monthlySales = data.totalSoldLast30Days;
  return monthlySales > 0 ? data.totalActiveListings / monthlySales : 6;
}