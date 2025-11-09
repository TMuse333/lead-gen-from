// lib/services/sellerAnalysisGenerator.ts
/**
 * Seller Analysis Generator
 * Specialized analysis for home sellers
 */

 import { ExtractedAnswer } from '@/types/chat.types';
 import { MarketData } from '@/types/market.types';
 import { PropertyData } from '@/types/property.types';
 import { analyzeMarket } from '@/lib/calc/marketAnalyzer';

 import { SellerMarketAnalysis } from '@/types/flowMarketAnalysis.types';

 import { analyzeProperty, compareProperties } from '@/lib/calc/propertyAnalyzer';
import { searchProperties } from '@/data/realEstateData/placeholderData';
 
 // ============================================
 // TYPES
 // ============================================
 
 export interface SellerCriteria {
   propertyType?: string;
   propertyAge?: string;
   renovations?: string;
   timeline?: string;
   sellingReason?: string;
   email?: string;
   area: string;
 }
 
 export interface SellerAnalysisOutput {
   // Market Intelligence
   marketAnalysis: {
     base: ReturnType<typeof analyzeMarket>;
     seller: SellerMarketAnalysis;
   };
   
   // Property Valuation
   propertyValuation: {
     estimatedValue: {
       low: number;
       mid: number;
       high: number;
       confidence: 'high' | 'medium' | 'low';
       reasoning: string;
     };
     pricePerSqft?: number;
     valuationMethod: 'comparative' | 'estimated';
   };
   
   // Comparable Properties
   comparables: {
     properties: PropertyData[];
     analyses: ReturnType<typeof analyzeProperty>[];
     comparison: ReturnType<typeof compareProperties> | null;
     summary: string;
   };
   
   // Selling Strategy
   strategy: {
     recommendedListPrice: number;
     pricingStrategy: 'aggressive' | 'competitive' | 'conservative';
     expectedTimeToSell: number;
     bestTimeToList: string;
     stagingRecommendations: string[];
     marketingTips: string[];
   };
   
   // Action Plan
   actionPlan: {
     immediate: string[];      // This week
     shortTerm: string[];      // This month
     beforeListing: string[];  // Pre-listing prep
   };
   
   // User Context
   userContext: {
     answers: ExtractedAnswer[];
     criteria: SellerCriteria;
     timeline: string;
     motivation: string;
   };
   
   // Metadata
   generatedAt: Date;
   confidence: {
     valuationConfidence: 'high' | 'medium' | 'low';
     marketDataQuality: 'high' | 'medium' | 'low';
     comparablesQuality: 'high' | 'medium' | 'low';
   };
 }
 
 // ============================================
 // MAIN GENERATOR
 // ============================================
 
 export async function generateSellerAnalysis(
   chatAnswers: ExtractedAnswer[],
   area: string = 'Halifax'
 ): Promise<SellerAnalysisOutput> {
   console.log('📊 Generating Seller Analysis...', { answerCount: chatAnswers.length, area });
   
   // Step 1: Extract seller-specific criteria
   const criteria = extractSellerCriteria(chatAnswers, area);
   console.log('✓ Extracted criteria:', criteria);
   
   // Step 2: Get market data
   const marketData = getMarketData(area);
   console.log('✓ Fetched market data');
   
   // Step 3: Generate market analyses
   const baseMarketAnalysis = analyzeMarket(marketData);
   const sellerMarketAnalysis = analyzeForSeller(
     baseMarketAnalysis,
     marketData,
     { answers: chatAnswers.map(a => ({ ...a })) } as any
   );
   console.log('✓ Generated market analysis');
   
   // Step 4: Find comparable properties
   const comparablesResult = findComparables(criteria, area);
   console.log('✓ Found', comparablesResult.properties.length, 'comparables');
   
   // Step 5: Calculate property valuation
   const valuation = calculateSellerValuation(
     criteria,
     comparablesResult,
     baseMarketAnalysis,
     sellerMarketAnalysis
   );
   console.log('✓ Calculated valuation:', valuation.estimatedValue.mid);
   
   // Step 6: Generate selling strategy
   const strategy = generateSellingStrategy(
     criteria,
     valuation,
     sellerMarketAnalysis,
     comparablesResult
   );
   console.log('✓ Generated selling strategy');
   
   // Step 7: Create action plan
   const actionPlan = createSellerActionPlan(
     criteria,
     strategy,
     sellerMarketAnalysis
   );
   console.log('✓ Created action plan');
   
   // Step 8: Calculate confidence
   const confidence = calculateSellerConfidence(
     marketData,
     comparablesResult.properties,
     chatAnswers
   );
   
   console.log('✅ Seller analysis complete!');
   
   return {
     marketAnalysis: {
       base: baseMarketAnalysis,
       seller: sellerMarketAnalysis,
     },
     propertyValuation: valuation,
     comparables: comparablesResult,
     strategy,
     actionPlan,
     userContext: {
       answers: chatAnswers,
       criteria,
       timeline: criteria.timeline || 'unknown',
       motivation: criteria.sellingReason || 'unknown',
     },
     generatedAt: new Date(),
     confidence,
   };
 }
 
 // ============================================
 // HELPER FUNCTIONS
 // ============================================
 
 /**
  * Extract seller-specific criteria from chat answers
  */
 function extractSellerCriteria(
   answers: ExtractedAnswer[],
   defaultArea: string
 ): SellerCriteria {
   const criteria: SellerCriteria = {
     area: defaultArea,
   };
   
   answers.forEach(answer => {
     const questionId = answer.questionId;
     const value = answer.value;
     
     if (questionId === 'propertyType') criteria.propertyType = value;
     if (questionId === 'propertyAge') criteria.propertyAge = value;
     if (questionId === 'renovations') criteria.renovations = value;
     if (questionId === 'timeline') criteria.timeline = value;
     if (questionId === 'sellingReason') criteria.sellingReason = value;
     if (questionId === 'email') criteria.email = value;
     if (questionId === 'area' || questionId === 'location') criteria.area = value;
   });
   
   return criteria;
 }
 
 /**
  * Get market data (placeholder for now)
  */
 function getMarketData(area: string): MarketData {
   // TODO: Replace with real API
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
     hotNeighborhoods: ['South End', 'West End', 'Clayton Park', 'Bedford'],
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
  * Find comparable sold properties
  */
 function findComparables(
   criteria: SellerCriteria,
   area: string
 ) {
   // Search for recently sold and active properties
   const properties = searchProperties({
     city: area,
     propertyType: criteria.propertyType,
   });
   
   // Prioritize sold properties
   const sold = properties.filter(p => p.status === 'sold');
   const active = properties.filter(p => p.status === 'active');
   
   // Take best comparables (prefer sold, but include some active for context)
   const comparables = [
     ...sold.slice(0, 8),
     ...active.slice(0, 3),
   ].slice(0, 10);
   
   // Analyze each comparable
   const analyses = comparables.map(property => {
     const otherComps = comparables.filter(p => p.id !== property.id).slice(0, 5);
     return analyzeProperty(property, otherComps);
   });
   
   // Create comparative analysis if we have a subject property
   // For sellers, we estimate their property as the "subject"
   const comparison = comparables.length > 0 
     ? compareProperties(comparables[0], comparables.slice(1))
     : null;
   
   const summary = generateComparablesSummary(comparables, analyses);
   
   return {
     properties: comparables,
     analyses,
     comparison,
     summary,
   };
 }
 
 /**
  * Generate comparables summary
  */
 function generateComparablesSummary(
   properties: PropertyData[],
   analyses: ReturnType<typeof analyzeProperty>[]
 ): string {
   if (properties.length === 0) {
     return 'No comparable properties found in this area.';
   }
   
   const sold = properties.filter(p => p.status === 'sold');
   const avgPrice = properties.reduce((sum, p) => 
     sum + (p.pricing.soldPrice || p.pricing.listPrice || 0), 0
   ) / properties.length;
   
   const avgDOM = properties.reduce((sum, p) => 
     sum + (p.marketTiming.daysOnMarket || 0), 0
   ) / properties.length;
   
   return `Found ${properties.length} comparable properties (${sold.length} recently sold). ` +
     `Average sale price: $${Math.round(avgPrice / 1000)}K. ` +
     `Properties sold in an average of ${Math.round(avgDOM)} days.`;
 }
 
 /**
  * Calculate seller's property valuation
  */
 function calculateSellerValuation(
   criteria: SellerCriteria,
   comparablesResult: ReturnType<typeof findComparables>,
   baseMarket: ReturnType<typeof analyzeMarket>,
   sellerMarket: SellerMarketAnalysis
 ) {
   const { properties } = comparablesResult;
   
   if (properties.length === 0) {
     // No comparables - use market average
     return {
       estimatedValue: {
         low: Math.round(baseMarket.metrics.medianSalePrice * 0.90),
         mid: baseMarket.metrics.medianSalePrice,
         high: Math.round(baseMarket.metrics.medianSalePrice * 1.10),
         confidence: 'low' as const,
         reasoning: 'Based on area median price (no direct comparables available)',
       },
       valuationMethod: 'estimated' as const,
     };
   }
   
   // Calculate base value from comparables
   const soldProps = properties.filter(p => p.status === 'sold');
   const prices = soldProps.length > 0 
     ? soldProps.map(p => p.pricing.soldPrice || 0).filter(p => p > 0)
     : properties.map(p => p.pricing.listPrice || 0).filter(p => p > 0);
   
   const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
   
   // Adjust based on property characteristics
   let adjustmentFactor = 1.0;
   let adjustmentReasons: string[] = [];
   
   // Age adjustment
   if (criteria.propertyAge === '0-10') {
     adjustmentFactor += 0.08;
     adjustmentReasons.push('newer property (+8%)');
   } else if (criteria.propertyAge === '30+') {
     adjustmentFactor -= 0.05;
     adjustmentReasons.push('older property (-5%)');
   }
   
   // Renovation adjustment
   if (criteria.renovations && criteria.renovations !== 'none') {
     if (criteria.renovations.includes('kitchen') && criteria.renovations.includes('bathroom')) {
       adjustmentFactor += 0.10;
       adjustmentReasons.push('major renovations (+10%)');
     } else if (criteria.renovations.includes('kitchen') || criteria.renovations.includes('bathroom')) {
       adjustmentFactor += 0.05;
       adjustmentReasons.push('recent renovations (+5%)');
     }
   }
   
   // Market condition adjustment
   if (baseMarket.condition === 'sellers_market') {
     adjustmentFactor += 0.03;
     adjustmentReasons.push('strong seller\'s market (+3%)');
   } else if (baseMarket.condition === 'buyers_market') {
     adjustmentFactor -= 0.03;
     adjustmentReasons.push('buyer\'s market (-3%)');
   }
   
   const adjustedValue = Math.round(avgPrice * adjustmentFactor);
   
   // Calculate range
   const low = Math.round(adjustedValue * 0.92);
   const high = Math.round(adjustedValue * 1.08);
   
   // Determine confidence
   const confidence = soldProps.length >= 5 ? 'high' :
                     soldProps.length >= 3 ? 'medium' : 'low';
   
   const reasoning = `Based on ${properties.length} comparable properties ` +
     `(${soldProps.length} sold). ` +
     (adjustmentReasons.length > 0 
       ? `Adjusted for: ${adjustmentReasons.join(', ')}.`
       : '');
   
   return {
     estimatedValue: {
       low,
       mid: adjustedValue,
       high,
       confidence,
       reasoning,
     },
     pricePerSqft: baseMarket.metrics.pricePerSqft,
     valuationMethod: 'comparative' as const,
   };
 }
 
 /**
  * Generate selling strategy
  */
 function generateSellingStrategy(
   criteria: SellerCriteria,
   valuation: ReturnType<typeof calculateSellerValuation>,
   sellerMarket: SellerMarketAnalysis,
   comparables: ReturnType<typeof findComparables>
 ) {
   const { estimatedValue } = valuation;
   const { pricingRecommendation, timing } = sellerMarket.sellerInsights;
   
   // Determine recommended list price
   let recommendedListPrice = estimatedValue.mid;
   
   if (pricingRecommendation.strategy === 'aggressive') {
     recommendedListPrice = Math.round(estimatedValue.high * 0.98);
   } else if (pricingRecommendation.strategy === 'conservative') {
     recommendedListPrice = Math.round(estimatedValue.low * 1.02);
   }
   
   // Staging recommendations
   const stagingRecommendations = [
     'Professional photography is essential - first impressions online matter',
     'Declutter and depersonalize - buyers need to envision their life here',
     'Deep clean everything - spotless homes sell faster',
     'Fresh paint in neutral colors creates a blank canvas',
     'Maximize natural light - open curtains and add strategic lighting',
   ];
   
   // Add renovation-specific recommendations
   if (criteria.renovations && criteria.renovations !== 'none') {
     stagingRecommendations.push(
       'Highlight your renovations in listing photos and description'
     );
   }
   
   // Marketing tips
   const marketingTips = [
     'List on Thursday or Friday for maximum weekend showing traffic',
     'Create a virtual tour - 87% of buyers start their search online',
     'Leverage social media marketing to reach more potential buyers',
     'Host an open house within the first week of listing',
   ];
   
   // Timeline-specific tips
   if (criteria.timeline === '0-3' || criteria.timeline === 'asap') {
     marketingTips.push(
       'Consider offering buyer incentives (closing cost assistance) for quick sale',
       'Be flexible with showing times - every showing is an opportunity'
     );
   }
   
   return {
     recommendedListPrice,
     pricingStrategy: pricingRecommendation.strategy,
     expectedTimeToSell: pricingRecommendation.expectedTimeToSell,
     bestTimeToList: timing.bestTimeToList,
     stagingRecommendations,
     marketingTips,
   };
 }
 
 /**
  * Create seller action plan
  */
 function createSellerActionPlan(
   criteria: SellerCriteria,
   strategy: ReturnType<typeof generateSellingStrategy>,
   sellerMarket: SellerMarketAnalysis
 ) {
   const immediate: string[] = [
     'Schedule professional home inspection to identify any issues',
     'Research and interview 3-5 experienced listing agents',
     'Start decluttering and organizing your home',
     'Gather all property documents (deed, surveys, warranties)',
   ];
   
   const shortTerm: string[] = [
     'Complete recommended repairs identified in inspection',
     'Hire professional photographer for listing photos',
     'Deep clean entire property (consider professional service)',
     'Make minor cosmetic improvements (paint touch-ups, landscaping)',
     'Prepare property disclosure documents',
   ];
   
   const beforeListing: string[] = [
     'Final walk-through with your agent',
     'Remove personal items and family photos',
     'Set up a plan for keeping house show-ready',
     'Arrange for temporary living arrangements for pets during showings',
     'Review and approve listing photos and description',
   ];
   
   // Add timeline-specific actions
   if (criteria.timeline === '0-3' || criteria.timeline === 'asap') {
     immediate.unshift('Contact agent immediately - your timeline is tight');
     shortTerm.unshift('Fast-track any necessary repairs - consider "as-is" if needed');
   }
   
   // Add market-specific actions
   if (sellerMarket.condition === 'sellers_market') {
     immediate.push('Consider pre-listing to build excitement');
   }
   
   return {
     immediate,
     shortTerm,
     beforeListing,
   };
 }
 
 /**
  * Calculate confidence scores
  */
 function calculateSellerConfidence(
   marketData: MarketData,
   comparables: PropertyData[],
   chatAnswers: ExtractedAnswer[]
 ) {
   // Valuation confidence
   const soldComps = comparables.filter(p => p.status === 'sold').length;
   const valuationConfidence = soldComps >= 5 ? 'high' :
                               soldComps >= 3 ? 'medium' : 'low';
   
   // Market data quality
   const hasHistorical = !!marketData.previousPeriod;
   const hasNeighborhoods = !!marketData.hotNeighborhoods?.length;
   const marketDataQuality = hasHistorical && hasNeighborhoods ? 'high' :
                            hasHistorical || hasNeighborhoods ? 'medium' : 'low';
   
   // Comparables quality
   const comparablesQuality = comparables.length >= 8 ? 'high' :
                             comparables.length >= 5 ? 'medium' : 'low';
   
   return {
     valuationConfidence,
     marketDataQuality,
     comparablesQuality,
   };
 }