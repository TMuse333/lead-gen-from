// ============================================
// MARKET ANALYSIS USAGE EXAMPLES
// ============================================


import { analyzeMarket, calculateConfidence } from './marketAnalyzer';
import { analyzeForSeller, analyzeForBuyer, analyzeForBrowser } from './flowMarketAnalyzers';
import { LeadSubmission, MarketData } from '@/types';

// ============================================
// EXAMPLE 1: Basic Market Analysis
// ============================================

async function exampleBasicAnalysis() {
  // Sample market data (would come from MLS API or database)
  const marketData: MarketData = {
    area: 'Halifax',
    lastUpdated: new Date(),
    averageSalePrice: 525000,
    medianSalePrice: 485000,
    averageDaysOnMarket: 28,
    totalActiveListings: 450,
    totalSoldLast30Days: 85,
    absorptionRate: 5.3,
    pricePerSqft: 285,
    newListingsLast7Days: 42,
    priceReductionsLast7Days: 18,
    hotNeighborhoods: ['South End', 'West End', 'Clayton Park', 'Bedford', 'Dartmouth'],
    yearOverYearChange: 8.5,
    previousPeriod: {
      averageSalePrice: 510000,
      medianSalePrice: 475000,
      averageDaysOnMarket: 32,
      totalSoldLast30Days: 78,
    },
  };

  // Generate base market analysis
  const baseAnalysis = analyzeMarket(marketData);
  
  console.log('Market Condition:', baseAnalysis.condition);
  console.log('Trend Direction:', baseAnalysis.trendDirection);
  console.log('Competition Score:', baseAnalysis.metrics.competitionScore);
  console.log('Summary:', baseAnalysis.summary);
  
  // Calculate confidence in the analysis
  const confidence = calculateConfidence(marketData);
  console.log('Analysis Confidence:', confidence.overall.toFixed(1) + '%');
  
  return baseAnalysis;
}

// ============================================
// EXAMPLE 2: Seller-Specific Analysis
// ============================================

async function exampleSellerAnalysis() {
  // Get base analysis
  const marketData: MarketData = {
    area: 'Halifax',
    lastUpdated: new Date(),
    averageSalePrice: 525000,
    medianSalePrice: 485000,
    averageDaysOnMarket: 28,
    totalActiveListings: 450,
    totalSoldLast30Days: 85,
    absorptionRate: 5.3,
    pricePerSqft: 285,
    yearOverYearChange: 8.5,
  };
  
  const baseAnalysis = analyzeMarket(marketData);
  
  // Sample seller lead data
  const sellerLead: LeadSubmission = {
    id: 'lead-123',
    answers: [
      { questionId: 'property_type', question: 'Property Type', value: 'house', answeredAt: new Date() },
      { questionId: 'property_age', question: 'Property Age', value: '15-30', answeredAt: new Date() },
      { questionId: 'renovations', question: 'Renovations', value: 'yes', answeredAt: new Date() },
      { questionId: 'timeline', question: 'Timeline', value: '3-6', answeredAt: new Date() },
      { questionId: 'sellingReason', question: 'Selling Reason', value: 'upsizing', answeredAt: new Date() },
    ],
    createdAt: new Date(),
    flowType: 'sell',
  };
  
  // Generate seller-specific analysis
  const sellerAnalysis = analyzeForSeller(baseAnalysis, marketData, sellerLead);
  
  console.log('\n=== SELLER ANALYSIS ===');
  console.log('Pricing Strategy:', sellerAnalysis.sellerInsights.pricingRecommendation.strategy);
  console.log('Expected Time to Sell:', sellerAnalysis.sellerInsights.pricingRecommendation.expectedTimeToSell, 'days');
  console.log('Current Market Score:', sellerAnalysis.sellerInsights.timing.currentMarketScore);
  console.log('Competition Level:', sellerAnalysis.sellerInsights.competition.competitionLevel);
  console.log('\nSeller Summary:', sellerAnalysis.sellerSummary);
  
  return sellerAnalysis;
}

// ============================================
// EXAMPLE 3: Buyer-Specific Analysis
// ============================================

async function exampleBuyerAnalysis() {
  const marketData: MarketData = {
    area: 'Halifax',
    lastUpdated: new Date(),
    averageSalePrice: 525000,
    medianSalePrice: 485000,
    averageDaysOnMarket: 28,
    totalActiveListings: 450,
    totalSoldLast30Days: 85,
    absorptionRate: 5.3,
    pricePerSqft: 285,
    yearOverYearChange: 8.5,
  };
  
  const baseAnalysis = analyzeMarket(marketData);
  
  // Sample buyer lead data
  const buyerLead: LeadSubmission = {
    id: 'lead-456',
    answers: [
      { questionId: 'budget', question: 'Budget', value: '500000', answeredAt: new Date() },
      { questionId: 'desired_property_type', question: 'Desired Property Type', value: 'house', answeredAt: new Date() },
      { questionId: 'bedrooms', question: 'Bedrooms', value: '3', answeredAt: new Date() },
      { questionId: 'timeline', question: 'Timeline', value: '3-6', answeredAt: new Date() },
    ],
    createdAt: new Date(),
    flowType: 'buy',
  };
  
  // Generate buyer-specific analysis
  const buyerAnalysis = analyzeForBuyer(baseAnalysis, marketData, buyerLead);
  
  console.log('\n=== BUYER ANALYSIS ===');
  console.log('Buyer Advantage:', buyerAnalysis.buyerInsights.opportunity.buyerAdvantage);
  console.log('Negotiation Leverage:', buyerAnalysis.buyerInsights.negotiation.leverageLevel);
  console.log('Bidding War Probability:', buyerAnalysis.buyerInsights.negotiation.biddingWarProbability + '%');
  console.log('Affordability Index:', buyerAnalysis.buyerInsights.financing.affordabilityIndex);
  console.log('\nBuyer Summary:', buyerAnalysis.buyerSummary);
  console.log('\nImmediate Actions:', buyerAnalysis.buyerInsights.actionPlan.immediate);
  
  return buyerAnalysis;
}

// ============================================
// EXAMPLE 4: Browser-Specific Analysis
// ============================================

async function exampleBrowserAnalysis() {
  const marketData: MarketData = {
    area: 'Halifax',
    lastUpdated: new Date(),
    averageSalePrice: 525000,
    medianSalePrice: 485000,
    averageDaysOnMarket: 28,
    totalActiveListings: 450,
    totalSoldLast30Days: 85,
    absorptionRate: 5.3,
    pricePerSqft: 285,
    hotNeighborhoods: ['South End', 'West End', 'Clayton Park'],
    yearOverYearChange: 8.5,
  };
  
  const baseAnalysis = analyzeMarket(marketData);
  
  // Sample browser lead data
  const browserLead: LeadSubmission = {
    id: 'lead-789',
    answers: [
      { questionId: 'interests', question: 'Interests', value: ['market_trends', 'investment'], answeredAt: new Date() },
    ],
    createdAt: new Date(),
    flowType: 'browse',
  };
  
  // Generate browser-specific analysis
  const browserAnalysis = analyzeForBrowser(baseAnalysis, marketData, browserLead);
  
  console.log('\n=== BROWSER ANALYSIS ===');
  console.log('Market Health Score:', browserAnalysis.browserInsights.overview.marketHealthScore);
  console.log('Market Accessibility:', browserAnalysis.browserInsights.overview.accessibility);
  console.log('Opportunity Level:', browserAnalysis.browserInsights.overview.opportunityLevel);
  console.log('\nRecommended Neighborhoods:');
  browserAnalysis.browserInsights.exploration.recommendedNeighborhoods.slice(0, 3).forEach(n => {
    console.log(`  - ${n.name}: ${n.priceRange} - ${n.whyInteresting}`);
  });
  console.log('\nBrowser Summary:', browserAnalysis.browserSummary);
  
  return browserAnalysis;
}

// ============================================
// EXAMPLE 5: Complete Flow with API Integration
// ============================================

/**
 * Example API endpoint that generates analysis based on flow type
 */
export async function generateFlowAnalysis(
  flowType: 'sell' | 'buy' | 'browse',
  leadData: LeadSubmission
) {
  // Step 1: Fetch current market data (from MLS API or database)
  const marketData = await fetchMarketData(leadData.answers.find(a => a.questionId === 'area')?.value as string || 'Halifax');
  
  // Step 2: Generate base market analysis
  const baseAnalysis = analyzeMarket(marketData);
  
  // Step 3: Calculate confidence
  const confidence = calculateConfidence(marketData);
  
  // Step 4: Generate flow-specific analysis
  let flowAnalysis;
  
  switch (flowType) {
    case 'sell':
      flowAnalysis = analyzeForSeller(baseAnalysis, marketData, leadData);
      break;
    case 'buy':
      flowAnalysis = analyzeForBuyer(baseAnalysis, marketData, leadData);
      break;
    case 'browse':
      flowAnalysis = analyzeForBrowser(baseAnalysis, marketData, leadData);
      break;
  }
  
  // Step 5: Return complete analysis
  return {
    flowType,
    analysis: flowAnalysis,
    confidence,
    metadata: {
      generatedAt: new Date(),
      dataSource: marketData.area,
      dataFreshness: calculateDataFreshness(marketData.lastUpdated),
    },
  };
}

/**
 * Mock function to fetch market data
 * In production, this would call your MLS API or database
 */
async function fetchMarketData(area: string): Promise<MarketData> {
  // This would be replaced with actual API call
  return {
    area,
    lastUpdated: new Date(),
    averageSalePrice: 525000,
    medianSalePrice: 485000,
    averageDaysOnMarket: 28,
    totalActiveListings: 450,
    totalSoldLast30Days: 85,
    absorptionRate: 5.3,
    pricePerSqft: 285,
    newListingsLast7Days: 42,
    priceReductionsLast7Days: 18,
    hotNeighborhoods: ['South End', 'West End', 'Clayton Park', 'Bedford', 'Dartmouth'],
    yearOverYearChange: 8.5,
    previousPeriod: {
      averageSalePrice: 510000,
      medianSalePrice: 475000,
      averageDaysOnMarket: 32,
      totalSoldLast30Days: 78,
    },
  };
}

/**
 * Calculate how fresh the data is
 */
function calculateDataFreshness(lastUpdated: Date): string {
  const hoursSince = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60);
  
  if (hoursSince < 24) return 'real-time';
  if (hoursSince < 48) return 'fresh';
  if (hoursSince < 168) return 'recent';
  return 'dated';
}

// ============================================
// RUN EXAMPLES
// ============================================

if (require.main === module) {
  console.log('Running Market Analysis Examples...\n');
  
  exampleBasicAnalysis().then(() => {
    return exampleSellerAnalysis();
  }).then(() => {
    return exampleBuyerAnalysis();
  }).then(() => {
    return exampleBrowserAnalysis();
  }).catch(console.error);
}