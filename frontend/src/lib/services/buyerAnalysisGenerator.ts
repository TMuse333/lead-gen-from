// lib/services/buyerAnalysisGenerator.ts
/**
 * Buyer Analysis Generator
 * Specialized analysis for home buyers
 */

 import { ExtractedAnswer } from '@/types/chat.types';
 import { MarketData } from '@/types/market.types';
 import { PropertyData } from '@/types/property.types';

 import { analyzeForBuyer } from '@/lib/market-analysis/flowMarketAnalyzers';
 import { BuyerMarketAnalysis } from '@/types/flowMarketAnalysis.types';

import { analyzeMarket } from '../calc/marketAnalyzer';
import { analyzeProperty } from '../calc/propertyAnalyzer';
import { searchProperties } from '@/data/realEstateData/placeholderData';
 
 // ============================================
 // TYPES
 // ============================================
 
 export interface BuyerCriteria {
   propertyType?: string;
   budget?: string;
   minPrice?: number;
   maxPrice?: number;
   bedrooms?: string;
   minBedrooms?: number;
   timeline?: string;
   buyingReason?: string;
   email?: string;
   area: string;
 }
 
 export interface BuyerAnalysisOutput {
   // Market Intelligence
   marketAnalysis: {
     base: ReturnType<typeof analyzeMarket>;
     buyer: BuyerMarketAnalysis;
   };
   
   // Property Matches
   propertyMatches: {
     properties: PropertyData[];
     analyses: ReturnType<typeof analyzeProperty>[];
     totalFound: number;
     bestValues: ReturnType<typeof analyzeProperty>[];
     summary: string;
   };
   
   // Affordability Analysis
   affordability: {
     budgetRange: {
       min: number;
       max: number;
     };
     estimatedMonthlyPayment: {
       principal: number;
       taxes: number;
       insurance: number;
       total: number;
     };
     downPaymentRequired: number;
     closingCosts: number;
     totalCashNeeded: number;
     affordabilityRating: 'very_affordable' | 'affordable' | 'stretch' | 'challenging';
   };
   
   // Buying Strategy
   strategy: {
     offerStrategy: 'aggressive' | 'competitive' | 'conservative';
     negotiationTips: string[];
     timing: string;
     competitionLevel: 'high' | 'moderate' | 'low';
     expectedSuccessRate: number; // percentage
     biddingWarLikelihood: number; // percentage
   };
   
   // Neighborhood Insights
   neighborhoods: {
     recommended: {
       name: string;
       priceRange: string;
       pros: string[];
       cons: string[];
       averagePrice: number;
       availableProperties: number;
     }[];
     emerging: string[];
     established: string[];
   };
   
   // Action Plan
   actionPlan: {
     immediate: string[];
     shortTerm: string[];
     beforeOffering: string[];
     financing: string[];
   };
   
   // User Context
   userContext: {
     answers: ExtractedAnswer[];
     criteria: BuyerCriteria;
     timeline: string;
     motivation: string;
   };
   
   // Metadata
   generatedAt: Date;
   confidence: {
     marketDataQuality: 'high' | 'medium' | 'low';
     propertyMatchQuality: 'high' | 'medium' | 'low';
     dataCompleteness: number;
   };
 }
 
 // ============================================
 // MAIN GENERATOR
 // ============================================
 
 export async function generateBuyerAnalysis(
   chatAnswers: ExtractedAnswer[],
   area: string = 'Halifax'
 ): Promise<BuyerAnalysisOutput> {
   console.log('🏡 Generating Buyer Analysis...', { answerCount: chatAnswers.length, area });
   
   // Step 1: Extract buyer-specific criteria
   const criteria = extractBuyerCriteria(chatAnswers, area);
   console.log('✓ Extracted criteria:', criteria);
   
   // Step 2: Get market data
   const marketData = getMarketData(area);
   console.log('✓ Fetched market data');
   
   // Step 3: Generate market analyses
   const baseMarketAnalysis = analyzeMarket(marketData);
   const buyerMarketAnalysis = analyzeForBuyer(
     baseMarketAnalysis,
     marketData,
     { answers: chatAnswers.map(a => ({ ...a })) } as any
   );
   console.log('✓ Generated market analysis');
   
   // Step 4: Find matching properties
   const propertyMatches = findPropertyMatches(criteria, area);
   console.log('✓ Found', propertyMatches.totalFound, 'matching properties');
   
   // Step 5: Calculate affordability
   const affordability = calculateAffordability(
     criteria,
     baseMarketAnalysis,
     propertyMatches
   );
   console.log('✓ Calculated affordability');
   
   // Step 6: Generate buying strategy
   const strategy = generateBuyingStrategy(
     criteria,
     buyerMarketAnalysis,
     propertyMatches,
     affordability
   );
   console.log('✓ Generated buying strategy');
   
   // Step 7: Analyze neighborhoods
   const neighborhoods = analyzeNeighborhoods(
     area,
     criteria,
     propertyMatches.properties,
     baseMarketAnalysis
   );
   console.log('✓ Analyzed neighborhoods');
   
   // Step 8: Create action plan
   const actionPlan = createBuyerActionPlan(
     criteria,
     strategy,
     buyerMarketAnalysis,
     affordability
   );
   console.log('✓ Created action plan');
   
   // Step 9: Calculate confidence
   const confidence = calculateBuyerConfidence(
     marketData,
     propertyMatches.properties,
     chatAnswers
   );
   
   console.log('✅ Buyer analysis complete!');
   
   return {
     marketAnalysis: {
       base: baseMarketAnalysis,
       buyer: buyerMarketAnalysis,
     },
     propertyMatches,
     affordability,
     strategy,
     neighborhoods,
     actionPlan,
     userContext: {
       answers: chatAnswers,
       criteria,
       timeline: criteria.timeline || 'unknown',
       motivation: criteria.buyingReason || 'unknown',
     },
     generatedAt: new Date(),
     confidence,
   };
 }
 
 // ============================================
 // HELPER FUNCTIONS
 // ============================================
 
 /**
  * Extract buyer-specific criteria from chat answers
  */
 function extractBuyerCriteria(
   answers: ExtractedAnswer[],
   defaultArea: string
 ): BuyerCriteria {
   const criteria: BuyerCriteria = {
     area: defaultArea,
   };
   
   answers.forEach(answer => {
     const questionId = answer.questionId;
     const value = answer.value;
     
     if (questionId === 'propertyType') criteria.propertyType = value;
     if (questionId === 'budget') {
       criteria.budget = value;
       // Parse budget range
       if (value === 'under-400k') {
         criteria.maxPrice = 400000;
       } else if (value === '400k-600k') {
         criteria.minPrice = 400000;
         criteria.maxPrice = 600000;
       } else if (value === '600k-800k') {
         criteria.minPrice = 600000;
         criteria.maxPrice = 800000;
       } else if (value === 'over-800k') {
         criteria.minPrice = 800000;
       }
     }
     if (questionId === 'bedrooms') {
       criteria.bedrooms = value;
       // Parse bedroom requirements
       if (value === '1-2') criteria.minBedrooms = 1;
       else if (value === '3') criteria.minBedrooms = 3;
       else if (value === '4') criteria.minBedrooms = 4;
       else if (value === '5+') criteria.minBedrooms = 5;
     }
     if (questionId === 'timeline') criteria.timeline = value;
     if (questionId === 'buyingReason') criteria.buyingReason = value;
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
  * Find properties matching buyer criteria
  */
 function findPropertyMatches(
   criteria: BuyerCriteria,
   area: string
 ) {
   // Search for active properties
   const properties = searchProperties({
     city: area,
     minPrice: criteria.minPrice,
     maxPrice: criteria.maxPrice,
     minBedrooms: criteria.minBedrooms,
     propertyType: criteria.propertyType,
   }).filter(p => p.status === 'active' || p.status === 'coming_soon');
   
   // Analyze each property
   const analyses = properties.map(property => {
     const comparables = searchProperties({
       city: property.address.city,
       propertyType: property.propertyType,
     }).filter(p => p.id !== property.id && p.status === 'sold').slice(0, 5);
     
     return analyzeProperty(property, comparables);
   });
   
   // Find best values (top 5 by value score)
   const bestValues = [...analyses]
     .sort((a, b) => b.valueMetrics.valueScore - a.valueMetrics.valueScore)
     .slice(0, 5);
   
   const summary = generatePropertyMatchSummary(properties, analyses, bestValues);
   
   return {
     properties,
     analyses,
     totalFound: properties.length,
     bestValues,
     summary,
   };
 }
 
 /**
  * Generate property match summary
  */
 function generatePropertyMatchSummary(
   properties: PropertyData[],
   analyses: ReturnType<typeof analyzeProperty>[],
   bestValues: ReturnType<typeof analyzeProperty>[]
 ): string {
   if (properties.length === 0) {
     return 'No properties currently match your exact criteria. Consider expanding your search.';
   }
   
   const excellentValues = analyses.filter(a => 
     a.valueMetrics.priceRating === 'excellent_value'
   ).length;
   
   const goodValues = analyses.filter(a => 
     a.valueMetrics.priceRating === 'good_value'
   ).length;
   
   return `Found ${properties.length} properties matching your criteria. ` +
     `${excellentValues} are excellent values, ${goodValues} are good values. ` +
     `${bestValues.length} top properties identified for your review.`;
 }
 
 /**
  * Calculate affordability
  */
 function calculateAffordability(
   criteria: BuyerCriteria,
   baseMarket: ReturnType<typeof analyzeMarket>,
   propertyMatches: ReturnType<typeof findPropertyMatches>
 ) {
   // Determine budget range
   const minPrice = criteria.minPrice || baseMarket.metrics.medianSalePrice * 0.7;
   const maxPrice = criteria.maxPrice || baseMarket.metrics.medianSalePrice * 1.3;
   
   // Calculate estimated monthly payment (rough estimate)
   const homePrice = maxPrice;
   const downPayment = homePrice * 0.20; // 20% down
   const loanAmount = homePrice - downPayment;
   const interestRate = 0.065; // 6.5% estimate
   const monthlyRate = interestRate / 12;
   const numPayments = 30 * 12; // 30-year mortgage
   
   const principal = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
     (Math.pow(1 + monthlyRate, numPayments) - 1);
   
   const taxes = (homePrice * 0.01) / 12; // ~1% annual property tax
   const insurance = 150; // Estimated monthly insurance
   const total = principal + taxes + insurance;
   
   // Calculate total cash needed
   const closingCosts = homePrice * 0.03; // ~3% closing costs
   const totalCashNeeded = downPayment + closingCosts;
   
   // Determine affordability rating
   const priceToIncome = homePrice / 75000; // Assume $75k income
   const affordabilityRating = priceToIncome < 3 ? 'very_affordable' :
                              priceToIncome < 4 ? 'affordable' :
                              priceToIncome < 5 ? 'stretch' : 'challenging';
   
   return {
     budgetRange: {
       min: minPrice,
       max: maxPrice,
     },
     estimatedMonthlyPayment: {
       principal: Math.round(principal),
       taxes: Math.round(taxes),
       insurance,
       total: Math.round(total),
     },
     downPaymentRequired: Math.round(downPayment),
     closingCosts: Math.round(closingCosts),
     totalCashNeeded: Math.round(totalCashNeeded),
     affordabilityRating,
   };
 }
 
 /**
  * Generate buying strategy
  */
 function generateBuyingStrategy(
   criteria: BuyerCriteria,
   buyerMarket: BuyerMarketAnalysis,
   propertyMatches: ReturnType<typeof findPropertyMatches>,
   affordability: ReturnType<typeof calculateAffordability>
 ) {
   const { negotiation, opportunity } = buyerMarket.buyerInsights;
   
   // Determine offer strategy
   const offerStrategy = negotiation.leverageLevel === 'high' ? 'conservative' :
                        negotiation.leverageLevel === 'moderate' ? 'competitive' : 'aggressive';
   
   // Negotiation tips based on market
   const negotiationTips = [...negotiation.strategicAdvice];
   
   // Add timeline-specific tips
   if (criteria.timeline === '0-3' || criteria.timeline === 'asap') {
     negotiationTips.push('Your tight timeline means acting decisively when you find the right property');
     negotiationTips.push('Consider having backup offers ready in case your first choice doesn\'t work out');
   }
   
   // Add budget-specific tips
   if (affordability.affordabilityRating === 'stretch' || affordability.affordabilityRating === 'challenging') {
     negotiationTips.push('Stay firm on your budget - don\'t let emotions drive you above your means');
     negotiationTips.push('Consider properties slightly below your max to leave room for unexpected costs');
   }
   
   // Calculate expected success rate
   const baseSuccessRate = offerStrategy === 'aggressive' ? 30 : 
                          offerStrategy === 'competitive' ? 55 : 75;
   
   const expectedSuccessRate = Math.max(20, Math.min(90, 
     baseSuccessRate + (negotiation.leverageLevel === 'high' ? 15 : 
                        negotiation.leverageLevel === 'moderate' ? 0 : -15)
   ));
   
   return {
     offerStrategy,
     negotiationTips,
     timing: opportunity.timingAdvice,
     competitionLevel: negotiation.competitionForProperties === 'intense' ? 'high' :
                      negotiation.competitionForProperties === 'moderate' ? 'moderate' : 'low',
     expectedSuccessRate,
     biddingWarLikelihood: negotiation.biddingWarProbability,
   };
 }
 
 /**
  * Analyze neighborhoods
  */
 function analyzeNeighborhoods(
   area: string,
   criteria: BuyerCriteria,
   properties: PropertyData[],
   baseMarket: ReturnType<typeof analyzeMarket>
 ) {
   // Group properties by neighborhood
   const neighborhoodMap = new Map<string, PropertyData[]>();
   properties.forEach(prop => {
     const hood = prop.address.neighborhood;
     if (!neighborhoodMap.has(hood)) {
       neighborhoodMap.set(hood, []);
     }
     neighborhoodMap.get(hood)!.push(prop);
   });
   
   // Analyze each neighborhood
   const recommended = Array.from(neighborhoodMap.entries()).map(([name, props]) => {
     const avgPrice = props.reduce((sum, p) => 
       sum + (p.pricing.listPrice || 0), 0
     ) / props.length;
     
     const minPrice = Math.min(...props.map(p => p.pricing.listPrice || 0));
     const maxPrice = Math.max(...props.map(p => p.pricing.listPrice || 0));
     
     // Determine pros/cons
     const pros: string[] = [];
     const cons: string[] = [];
     
     if (avgPrice < baseMarket.metrics.medianSalePrice * 0.9) {
       pros.push('Below area median price');
     } else if (avgPrice > baseMarket.metrics.medianSalePrice * 1.1) {
       cons.push('Above area median price');
     }
     
     if (props.length >= 5) {
       pros.push('Good selection of properties');
     } else {
       cons.push('Limited inventory');
     }
     
     // Check if any have good walkability
     const highWalkScore = props.some(p => 
       p.neighborhood.walkScore && p.neighborhood.walkScore >= 70
     );
     if (highWalkScore) {
       pros.push('Walkable area');
     }
     
     return {
       name,
       priceRange: `$${Math.round(minPrice / 1000)}K - $${Math.round(maxPrice / 1000)}K`,
       pros,
       cons,
       averagePrice: Math.round(avgPrice),
       availableProperties: props.length,
     };
   }).sort((a, b) => b.availableProperties - a.availableProperties)
     .slice(0, 5);
   
   return {
     recommended,
     emerging: baseMarket.neighborhoods?.emerging || [],
     established: baseMarket.neighborhoods?.stable || [],
   };
 }
 
 /**
  * Create buyer action plan
  */
 function createBuyerActionPlan(
   criteria: BuyerCriteria,
   strategy: ReturnType<typeof generateBuyingStrategy>,
   buyerMarket: BuyerMarketAnalysis,
   affordability: ReturnType<typeof calculateAffordability>
 ) {
   const immediate: string[] = [
     'Get pre-approved for a mortgage (not just pre-qualified)',
     'Determine your true budget including all costs',
     'Create list of must-haves vs. nice-to-haves',
     'Research target neighborhoods and school districts',
   ];
   
   const shortTerm: string[] = [
     'Tour at least 5-10 properties to calibrate expectations',
     'Interview and select a buyer\'s agent',
     'Save for down payment and closing costs',
     'Check your credit score and improve if needed',
   ];
   
   const beforeOffering: string[] = [
     'Schedule professional home inspection',
     'Review comparable sales with your agent',
     'Determine your maximum offer price',
     'Prepare proof of funds or pre-approval letter',
     'Research property history and neighborhood trends',
   ];
   
   const financing: string[] = [
     `Save $${Math.round(affordability.downPaymentRequired / 1000)}K for down payment (20%)`,
     `Budget $${Math.round(affordability.closingCosts / 1000)}K for closing costs`,
     `Estimated monthly payment: $${affordability.estimatedMonthlyPayment.total.toLocaleString()}`,
     'Compare rates from at least 3 lenders',
     'Consider rate lock options if rates are favorable',
   ];
   
   // Add timeline-specific actions
   if (criteria.timeline === '0-3' || criteria.timeline === 'asap') {
     immediate.unshift('URGENT: Start pre-approval process TODAY');
     shortTerm.unshift('Be ready to make quick decisions - properties move fast');
   }
   
   // Add market-specific actions
   if (strategy.competitionLevel === 'high') {
     immediate.push('Prepare to act fast - competitive market requires decisiveness');
     beforeOffering.push('Consider escalation clause in offers');
   }
   
   return {
     immediate,
     shortTerm,
     beforeOffering,
     financing,
   };
 }
 
 /**
  * Calculate confidence scores
  */
 function calculateBuyerConfidence(
   marketData: MarketData,
   properties: PropertyData[],
   chatAnswers: ExtractedAnswer[]
 ) {
   // Market data quality
   const hasHistorical = !!marketData.previousPeriod;
   const hasNeighborhoods = !!marketData.hotNeighborhoods?.length;
   const marketDataQuality = hasHistorical && hasNeighborhoods ? 'high' :
                            hasHistorical || hasNeighborhoods ? 'medium' : 'low';
   
   // Property match quality
   const propertyMatchQuality = properties.length >= 10 ? 'high' :
                               properties.length >= 5 ? 'medium' : 'low';
   
   // Data completeness
   const expectedQuestions = 6;
   const dataCompleteness = Math.round((chatAnswers.length / expectedQuestions) * 100);
   
   return {
     marketDataQuality,
     propertyMatchQuality,
     dataCompleteness,
   };
 }