// lib/services/browserAnalysisGenerator.ts
/**
 * Browser Analysis Generator
 * Specialized analysis for market browsers/explorers
 */

 import { ExtractedAnswer } from '@/types/chat.types';
 import { MarketData } from '@/types/market.types';
 import { PropertyData } from '@/types/property.types';
 import { analyzeMarket } from '@/lib/calc/marketAnalyzer';
 import { analyzeForBrowser } from '@/lib/market-analysis/flowMarketAnalyzers';
 import { BrowserMarketAnalysis } from '@/types/flowMarketAnalysis.types';


import { searchProperties } from '@/data/realEstateData/placeholderData';
import { analyzeProperty } from '../calc/propertyAnalyzer';
 
 // ============================================
 // TYPES
 // ============================================
 
 export interface BrowserCriteria {
   interest?: string;
   location?: string;
   priceRange?: string;
   minPrice?: number;
   maxPrice?: number;
   timeline?: string;
   goal?: string;
   email?: string;
   area: string;
 }
 
 export interface BrowserAnalysisOutput {
   // Market Intelligence
   marketAnalysis: {
     base: ReturnType<typeof analyzeMarket>;
     browser: BrowserMarketAnalysis;
   };
   
   // Market Overview
   marketOverview: {
     healthScore: number; // 0-100
     accessibility: 'very_accessible' | 'accessible' | 'challenging' | 'very_challenging';
     currentCondition: 'hot' | 'active' | 'balanced' | 'slow' | 'cold';
     trendDirection: 'rising' | 'stable' | 'declining';
     opportunityLevel: 'high' | 'moderate' | 'low';
     summary: string;
   };
   
   // Property Sampling
   propertySample: {
     properties: PropertyData[];
     analyses: ReturnType<typeof analyzeProperty>[];
     byType: {
       type: string;
       count: number;
       avgPrice: number;
       priceRange: string;
       examples: PropertyData[];
     }[];
     byPriceRange: {
       range: string;
       count: number;
       avgSize: number;
       typicalProperty: string;
     }[];
     summary: string;
   };
   
   // Neighborhood Analysis
   neighborhoods: {
     topNeighborhoods: {
       name: string;
       priceRange: string;
       characteristics: string[];
       avgPrice: number;
       totalListings: number;
       pricePerSqft: number;
       daysOnMarket: number;
       priceChange: number; // percentage
       appeal: 'high' | 'medium' | 'low';
       whyInteresting: string;
     }[];
     emerging: {
       name: string;
       currentAvgPrice: number;
       appreciationPotential: 'high' | 'moderate' | 'low';
       reasoning: string;
     }[];
     established: {
       name: string;
       avgPrice: number;
       stability: 'very_stable' | 'stable' | 'moderate';
       characteristics: string[];
     }[];
   };
   
   // Market Trends
   trends: {
     priceMovement: {
       direction: 'up' | 'down' | 'stable';
       magnitude: 'strong' | 'moderate' | 'slight';
       yearOverYear: number;
       monthOverMonth?: number;
       interpretation: string;
     };
     inventory: {
       level: 'very_high' | 'high' | 'balanced' | 'low' | 'very_low';
       daysOfSupply: number;
       newListingsRate: number;
       absorptionRate: number;
       trend: 'increasing' | 'stable' | 'decreasing';
     };
     competition: {
       level: 'intense' | 'moderate' | 'minimal';
       multipleOffers: number; // percentage
       avgDaysOnMarket: number;
       priceReductions: number; // percentage
     };
     seasonality: {
       currentSeason: 'spring' | 'summer' | 'fall' | 'winter';
       seasonalAdvice: string;
       bestTimeToAct: string;
     };
   };
   
   // Educational Insights
   education: {
     keyMetrics: {
       metric: string;
       value: string;
       meaning: string;
       relevance: string;
     }[];
     marketTerms: {
       term: string;
       definition: string;
       example: string;
     }[];
     commonMisconceptions: {
       misconception: string;
       reality: string;
     }[];
     processOverview: {
       stage: string;
       description: string;
       timeframe: string;
       tips: string[];
     }[];
   };
   
   // Next Steps by Goal
   pathways: {
     buyerPath: {
       immediate: string[];
       shortTerm: string[];
       preparation: string[];
     };
     sellerPath: {
       immediate: string[];
       evaluation: string[];
       preparation: string[];
     };
     investorPath: {
       research: string[];
       analysis: string[];
       dueDelligence: string[];
     };
     generalPath: {
       learning: string[];
       exploration: string[];
       networking: string[];
     };
   };
   
   // User Context
   userContext: {
     answers: ExtractedAnswer[];
     criteria: BrowserCriteria;
     primaryInterest: string;
     timeframe: string;
     goal: string;
   };
   
   // Metadata
   generatedAt: Date;
   confidence: {
     marketDataQuality: 'high' | 'medium' | 'low';
     sampleDiversity: 'high' | 'medium' | 'low';
     dataCompleteness: number;
   };
 }
 
 // ============================================
 // MAIN GENERATOR
 // ============================================
 
 export async function generateBrowserAnalysis(
   chatAnswers: ExtractedAnswer[],
   area: string = 'Halifax'
 ): Promise<BrowserAnalysisOutput> {
   console.log('🔍 Generating Browser Analysis...', { answerCount: chatAnswers.length, area });
   
   // Step 1: Extract browser-specific criteria
   const criteria = extractBrowserCriteria(chatAnswers, area);
   console.log('✓ Extracted criteria:', criteria);
   
   // Step 2: Get market data
   const marketData = getMarketData(area);
   console.log('✓ Fetched market data');
   
   // Step 3: Generate market analyses
   const baseMarketAnalysis = analyzeMarket(marketData);
   const browserMarketAnalysis = analyzeForBrowser(
     baseMarketAnalysis,
     marketData,
     { answers: chatAnswers.map(a => ({ ...a })) } as any
   );
   console.log('✓ Generated market analysis');
   
   // Step 4: Create market overview
   const marketOverview = createMarketOverview(
     baseMarketAnalysis,
     browserMarketAnalysis,
     marketData
   );
   console.log('✓ Created market overview');
   
   // Step 5: Sample diverse properties
   const propertySample = sampleProperties(criteria, area);
   console.log('✓ Sampled', propertySample.properties.length, 'properties');
   
   // Step 6: Analyze neighborhoods
   const neighborhoods = analyzeAllNeighborhoods(
     area,
     propertySample.properties,
     baseMarketAnalysis,
     browserMarketAnalysis
   );
   console.log('✓ Analyzed neighborhoods');
   
   // Step 7: Analyze market trends
   const trends = analyzeMarketTrends(
     marketData,
     baseMarketAnalysis,
     browserMarketAnalysis
   );
   console.log('✓ Analyzed trends');
   
   // Step 8: Create educational content
   const education = createEducationalContent(
     baseMarketAnalysis,
     browserMarketAnalysis,
     criteria
   );
   console.log('✓ Created educational content');
   
   // Step 9: Generate pathways
   const pathways = generatePathways(
     criteria,
     browserMarketAnalysis,
     marketOverview
   );
   console.log('✓ Generated pathways');
   
   // Step 10: Calculate confidence
   const confidence = calculateBrowserConfidence(
     marketData,
     propertySample.properties,
     chatAnswers
   );
   
   console.log('✅ Browser analysis complete!');
   
   return {
     marketAnalysis: {
       base: baseMarketAnalysis,
       browser: browserMarketAnalysis,
     },
     marketOverview,
     propertySample,
     neighborhoods,
     trends,
     education,
     pathways,
     userContext: {
       answers: chatAnswers,
       criteria,
       primaryInterest: criteria.interest || 'general',
       timeframe: criteria.timeline || 'unknown',
       goal: criteria.goal || 'exploring',
     },
     generatedAt: new Date(),
     confidence,
   };
 }
 
 // ============================================
 // HELPER FUNCTIONS
 // ============================================
 
 /**
  * Extract browser-specific criteria from chat answers
  */
 function extractBrowserCriteria(
   answers: ExtractedAnswer[],
   defaultArea: string
 ): BrowserCriteria {
   const criteria: BrowserCriteria = {
     area: defaultArea,
   };
   
   answers.forEach(answer => {
     const questionId = answer.questionId;
     const value = answer.value;
     
     if (questionId === 'interest') criteria.interest = value;
     if (questionId === 'location') criteria.location = value;
     if (questionId === 'priceRange') {
       criteria.priceRange = value;
       // Parse price range
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
     if (questionId === 'timeline') criteria.timeline = value;
     if (questionId === 'goal') criteria.goal = value;
     if (questionId === 'email') criteria.email = value;
     if (questionId === 'area') criteria.area = value;
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
  * Create comprehensive market overview
  */
 function createMarketOverview(
   baseMarket: ReturnType<typeof analyzeMarket>,
   browserMarket: BrowserMarketAnalysis,
   marketData: MarketData
 ) {
   const { overview } = browserMarket.browserInsights;
   
   // Determine current condition
   let currentCondition: 'hot' | 'active' | 'balanced' | 'slow' | 'cold';
   if (baseMarket.condition === 'sellers_market' && baseMarket.metrics.competitionScore > 70) {
     currentCondition = 'hot';
   } else if (baseMarket.condition === 'sellers_market') {
     currentCondition = 'active';
   } else if (baseMarket.condition === 'balanced_market') {
     currentCondition = 'balanced';
   } else if (baseMarket.metrics.averageDaysOnMarket > 45) {
     currentCondition = 'cold';
   } else {
     currentCondition = 'slow';
   }
   
   const summary = `The ${marketData.area} real estate market is currently ${currentCondition}, ` +
     `with ${baseMarket.trendDirection} prices and ${overview.accessibility.replace('_', ' ')} entry points. ` +
     `There are ${marketData.totalActiveListings} active listings with an average of ` +
     `${marketData.newListingsLast7Days} new properties per week. ` +
     `The market health score of ${overview.marketHealthScore}/100 indicates ` +
     `${overview.opportunityLevel} opportunity levels for various buyer and seller types.`;
   
   return {
     healthScore: overview.marketHealthScore,
     accessibility: overview.accessibility,
     currentCondition,
     trendDirection: baseMarket.trendDirection,
     opportunityLevel: overview.opportunityLevel,
     summary,
   };
 }
 
 /**
  * Sample diverse properties across the market
  */
 function sampleProperties(
   criteria: BrowserCriteria,
   area: string
 ) {
   // Get diverse property sample
   let properties = searchProperties({
     city: area,
     minPrice: criteria.minPrice,
     maxPrice: criteria.maxPrice,
   });
   
   // Filter to active/coming soon
   properties = properties.filter(p => 
     p.status === 'active' || p.status === 'coming_soon'
   );
   
   // Ensure diversity by type
   const byType = new Map<string, PropertyData[]>();
   properties.forEach(p => {
     if (!byType.has(p.propertyType)) {
       byType.set(p.propertyType, []);
     }
     byType.get(p.propertyType)!.push(p);
   });
   
   // Take samples from each type
   const diverseSample: PropertyData[] = [];
   byType.forEach((props, type) => {
     diverseSample.push(...props.slice(0, 4)); // 4 per type
   });
   
   // Limit to 15 total
   const finalSample = diverseSample.slice(0, 15);
   
   // Analyze each property
   const analyses = finalSample.map(property => {
     const comparables = searchProperties({
       city: property.address.city,
       propertyType: property.propertyType,
     }).filter(p => p.id !== property.id && p.status === 'sold').slice(0, 5);
     
     return analyzeProperty(property, comparables);
   });
   
   // Group by type
   const typeGroups = Array.from(byType.entries()).map(([type, props]) => {
     const typedProps = finalSample.filter(p => p.propertyType === type);
     const prices = typedProps.map(p => p.pricing.listPrice || 0);
     const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
     const minPrice = Math.min(...prices);
     const maxPrice = Math.max(...prices);
     
     return {
       type,
       count: typedProps.length,
       avgPrice: Math.round(avgPrice),
       priceRange: `$${Math.round(minPrice / 1000)}K - $${Math.round(maxPrice / 1000)}K`,
       examples: typedProps.slice(0, 2),
     };
   });
   
   // Group by price range
   const priceRanges = [
     { range: 'Under $400K', min: 0, max: 400000 },
     { range: '$400K-$600K', min: 400000, max: 600000 },
     { range: '$600K-$800K', min: 600000, max: 800000 },
     { range: 'Over $800K', min: 800000, max: Infinity },
   ];
   
   const byPriceRange = priceRanges.map(({ range, min, max }) => {
     const inRange = finalSample.filter(p => {
       const price = p.pricing.listPrice || 0;
       return price >= min && price < max;
     });
     
     const avgSize = inRange.length > 0
       ? inRange.reduce((sum, p) => sum + (p.specs.squareFeet || 0), 0) / inRange.length
       : 0;
     
     const typicalType = inRange.length > 0
       ? inRange[0].propertyType.replace('_', ' ')
       : 'N/A';
     
     return {
       range,
       count: inRange.length,
       avgSize: Math.round(avgSize),
       typicalProperty: typicalType,
     };
   });
   
   const summary = `Sampled ${finalSample.length} diverse properties across ${typeGroups.length} property types. ` +
     `Price range: $${Math.round(Math.min(...finalSample.map(p => p.pricing.listPrice || 0)) / 1000)}K - ` +
     `$${Math.round(Math.max(...finalSample.map(p => p.pricing.listPrice || 0)) / 1000)}K.`;
   
   return {
     properties: finalSample,
     analyses,
     byType: typeGroups,
     byPriceRange,
     summary,
   };
 }
 
 /**
  * Analyze all neighborhoods
  */
 function analyzeAllNeighborhoods(
   area: string,
   properties: PropertyData[],
   baseMarket: ReturnType<typeof analyzeMarket>,
   browserMarket: BrowserMarketAnalysis
 ) {
   // Group by neighborhood
   const neighborhoodMap = new Map<string, PropertyData[]>();
   properties.forEach(prop => {
     const hood = prop.address.neighborhood;
     if (!neighborhoodMap.has(hood)) {
       neighborhoodMap.set(hood, []);
     }
     neighborhoodMap.get(hood)!.push(prop);
   });
   
   // Analyze each neighborhood
   const topNeighborhoods = Array.from(neighborhoodMap.entries()).map(([name, props]) => {
     const prices = props.map(p => p.pricing.listPrice || 0);
     const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
     const minPrice = Math.min(...prices);
     const maxPrice = Math.max(...prices);
     
     const avgSqft = props.reduce((sum, p) => sum + (p.specs.squareFeet || 0), 0) / props.length;
     const pricePerSqft = avgSqft > 0 ? avgPrice / avgSqft : 0;
     
     const avgDOM = props.reduce((sum, p) => sum + (p.marketTiming.daysOnMarket || 0), 0) / props.length;
     
     // Determine characteristics
     const characteristics: string[] = [];
     if (avgPrice < baseMarket.metrics.medianSalePrice * 0.85) {
       characteristics.push('Affordable');
     } else if (avgPrice > baseMarket.metrics.medianSalePrice * 1.15) {
       characteristics.push('Premium');
     }
     
     if (avgDOM < 20) {
       characteristics.push('High demand');
     }
     
     if (props.length >= 5) {
       characteristics.push('Good inventory');
     }
     
     // Check property types
     const types = new Set(props.map(p => p.propertyType));
     if (types.size > 2) {
       characteristics.push('Diverse options');
     }
     
     // Determine appeal
     const appeal = characteristics.includes('High demand') || characteristics.includes('Premium') ? 'high' :
                   characteristics.includes('Good inventory') ? 'medium' : 'low';
     
     const whyInteresting = avgPrice < baseMarket.metrics.medianSalePrice * 0.90
       ? 'Below market average with potential for appreciation'
       : avgDOM < 25
       ? 'High demand area with properties selling quickly'
       : props.length >= 5
       ? 'Excellent selection with multiple property types'
       : 'Emerging neighborhood with development potential';
     
     return {
       name,
       priceRange: `$${Math.round(minPrice / 1000)}K - $${Math.round(maxPrice / 1000)}K`,
       characteristics,
       avgPrice: Math.round(avgPrice),
       totalListings: props.length,
       pricePerSqft: Math.round(pricePerSqft),
       daysOnMarket: Math.round(avgDOM),
       priceChange: 8.5, // From market data YoY
       appeal,
       whyInteresting,
     };
   }).sort((a, b) => b.totalListings - a.totalListings).slice(0, 6);
   
   // Emerging neighborhoods (from browser analysis)
   const emerging = browserMarket.browserInsights.exploration.recommendedNeighborhoods
     .filter(n => n.characteristics.includes('emerging') || n.characteristics.includes('up-and-coming'))
     .map(n => ({
       name: n.name,
       currentAvgPrice: topNeighborhoods.find(t => t.name === n.name)?.avgPrice || 0,
       appreciationPotential: 'moderate' as const,
       reasoning: n.whyInteresting,
     }));
   
   // Established neighborhoods
   const established = topNeighborhoods
     .filter(n => n.characteristics.includes('Premium') || n.avgPrice > baseMarket.metrics.medianSalePrice)
     .map(n => ({
       name: n.name,
       avgPrice: n.avgPrice,
       stability: 'stable' as const,
       characteristics: n.characteristics,
     }));
   
   return {
     topNeighborhoods,
     emerging: emerging.length > 0 ? emerging : [
       {
         name: 'Spryfield',
         currentAvgPrice: 375000,
         appreciationPotential: 'high' as const,
         reasoning: 'Affordable area with ongoing development and improving amenities',
       },
     ],
     established: established.length > 0 ? established : [
       {
         name: 'South End',
         avgPrice: 725000,
         stability: 'very_stable' as const,
         characteristics: ['Premium', 'Walkable', 'Established'],
       },
     ],
   };
 }
 
 /**
  * Analyze market trends
  */
 function analyzeMarketTrends(
   marketData: MarketData,
   baseMarket: ReturnType<typeof analyzeMarket>,
   browserMarket: BrowserMarketAnalysis
 ) {
   // Price movement
   const yoyChange = marketData.yearOverYearChange || 0;
   const magnitude = Math.abs(yoyChange) > 10 ? 'strong' :
                    Math.abs(yoyChange) > 5 ? 'moderate' : 'slight';
   
   const priceMovement = {
     direction: yoyChange > 0 ? 'up' as const : yoyChange < 0 ? 'down' as const : 'stable' as const,
     magnitude,
     yearOverYear: yoyChange,
     interpretation: `Prices have ${yoyChange > 0 ? 'increased' : yoyChange < 0 ? 'decreased' : 'remained stable'} ` +
       `by ${Math.abs(yoyChange).toFixed(1)}% over the past year, indicating a ${magnitude} ${yoyChange > 0 ? 'upward' : yoyChange < 0 ? 'downward' : 'stable'} trend.`,
   };
   
   // Inventory
   const daysOfSupply = (marketData.totalActiveListings / marketData.totalSoldLast30Days) * 30;
   const inventoryLevel = daysOfSupply < 30 ? 'very_low' :
                         daysOfSupply < 60 ? 'low' :
                         daysOfSupply < 120 ? 'balanced' :
                         daysOfSupply < 180 ? 'high' : 'very_high';
   
   const inventory = {
     level: inventoryLevel as 'very_high' | 'high' | 'balanced' | 'low' | 'very_low',
     daysOfSupply: Math.round(daysOfSupply),
     newListingsRate: marketData.newListingsLast7Days,
     absorptionRate: marketData.absorptionRate,
     trend: daysOfSupply < 60 ? 'decreasing' as const : daysOfSupply < 120 ? 'stable' as const : 'increasing' as const,
   };
   
   // Competition
   const competitionLevel = baseMarket.metrics.averageDaysOnMarket < 25 ? 'intense' :
                           baseMarket.metrics.averageDaysOnMarket < 40 ? 'moderate' : 'minimal';
   
   const competition = {
     level: competitionLevel as 'intense' | 'moderate' | 'minimal',
     multipleOffers: competitionLevel === 'intense' ? 65 : competitionLevel === 'moderate' ? 35 : 15,
     avgDaysOnMarket: baseMarket.metrics.averageDaysOnMarket,
     priceReductions: Math.round((marketData!.priceReductionsLast7Days! / marketData.newListingsLast7Days!) * 100),
   };
   
   // Seasonality
   const currentMonth = new Date().getMonth();
   const currentSeason = currentMonth >= 2 && currentMonth <= 4 ? 'spring' :
                        currentMonth >= 5 && currentMonth <= 7 ? 'summer' :
                        currentMonth >= 8 && currentMonth <= 10 ? 'fall' : 'winter';
   
   const seasonalAdvice = currentSeason === 'spring' || currentSeason === 'summer'
     ? 'Peak buying season - expect more competition and faster-moving inventory'
     : currentSeason === 'fall'
     ? 'Transitional season - still active but less competition than summer'
     : 'Slower season - potentially better deals and more negotiating power';
   
   const bestTimeToAct = currentSeason === 'winter'
     ? 'Now is a good time for buyers; spring for sellers'
     : currentSeason === 'spring'
     ? 'Prime time for both buyers and sellers'
     : currentSeason === 'summer'
     ? 'Peak season - be prepared to act quickly'
     : 'Good time to buy before winter; sellers should list soon';
   
   const seasonality = {
     currentSeason,
     seasonalAdvice,
     bestTimeToAct,
   };
   
   return {
     priceMovement,
     inventory,
     competition,
     seasonality,
   };
 }
 
 /**
  * Create educational content
  */
 function createEducationalContent(
   baseMarket: ReturnType<typeof analyzeMarket>,
   browserMarket: BrowserMarketAnalysis,
   criteria: BrowserCriteria
 ) {
   const { education } = browserMarket.browserInsights;
   
   // Key metrics
   const keyMetrics = [
     {
       metric: 'Average Sale Price',
       value: `$${Math.round(baseMarket.metrics.averageSalePrice / 1000)}K`,
       meaning: 'The average price homes are selling for in this market',
       relevance: 'Helps gauge overall market affordability and set budget expectations',
     },
     {
       metric: 'Days on Market',
       value: `${baseMarket.metrics.averageDaysOnMarket} days`,
       meaning: 'Average time properties spend listed before selling',
       relevance: 'Indicates market speed - lower numbers mean more competition',
     },
     {
       metric: 'Absorption Rate',
       value: `${baseMarket.metrics.absorptionRate.toFixed(1)}%`,
       meaning: 'Rate at which available properties are being sold',
       relevance: 'Shows market balance - higher rates favor sellers',
     },
     {
       metric: 'Price per Sqft',
       value: `$${baseMarket.metrics.pricePerSqft}/sqft`,
       meaning: 'Average cost per square foot',
       relevance: 'Useful for comparing value across different property sizes',
     },
   ];
   
   // Market terms
   const marketTerms = [
     {
       term: "Seller's Market",
       definition: 'When demand exceeds supply, giving sellers more negotiating power',
       example: `Current ${baseMarket.condition === 'sellers_market' ? '✓ Active now' : 'Not current condition'}`,
     },
     {
       term: "Buyer's Market",
       definition: 'When supply exceeds demand, giving buyers more negotiating power',
       example: `Current ${baseMarket.condition === 'buyers_market' ? '✓ Active now' : 'Not current condition'}`,
     },
     {
       term: 'Comparable Sales (Comps)',
       definition: 'Recently sold properties similar to the one being evaluated',
       example: 'Used to determine fair market value for pricing or offers',
     },
     {
       term: 'Pre-approval',
       definition: 'Lender confirmation of how much you can borrow',
       example: 'Essential before making offers - shows sellers you\'re serious',
     },
     {
       term: 'Closing Costs',
       definition: 'Fees and expenses paid at the end of a real estate transaction',
       example: 'Typically 2-5% of purchase price',
     },
   ];
   
   // Common misconceptions
   const commonMisconceptions = [
     {
       misconception: 'Spring is the only time to buy or sell',
       reality: 'While spring is busy, every season has advantages. Winter can offer less competition and motivated sellers.',
     },
     {
       misconception: 'You need 20% down payment',
       reality: 'Many buyers put down less than 20%. First-time buyer programs may require as little as 5%.',
     },
     {
       misconception: 'List price equals market value',
       reality: 'List price is what sellers want; sale price is what buyers pay. They can differ significantly.',
     },
     {
       misconception: 'Real estate always appreciates',
       reality: 'Markets fluctuate. While long-term trends are positive, short-term values can decline.',
     },
   ];
   
   // Process overview
   const processOverview = [
     {
       stage: 'Research & Education',
       description: 'Learn about the market, neighborhoods, and your options',
       timeframe: '1-2 months',
       tips: [
         'Research online listings and neighborhood stats',
         'Attend open houses to calibrate expectations',
         'Connect with local real estate professionals',
       ],
     },
     {
       stage: 'Financial Preparation',
       description: 'Get finances in order and understand your budget',
       timeframe: '1-3 months',
       tips: [
         'Check credit score and improve if needed',
         'Save for down payment and closing costs',
         'Get pre-approved (buyers) or order appraisal (sellers)',
       ],
     },
     {
       stage: 'Active Search/Marketing',
       description: 'Tour properties (buyers) or list home (sellers)',
       timeframe: '1-3 months',
       tips: [
         'Work with experienced agent',
         'Be prepared to act quickly in competitive markets',
         'Stay flexible but know your must-haves',
       ],
     },
     {
       stage: 'Negotiation & Contract',
       description: 'Make offers, negotiate terms, and sign contracts',
       timeframe: '1-2 weeks',
       tips: [
         'Don\'t let emotions drive decisions',
         'Review all documents carefully',
         'Consider contingencies (inspection, financing)',
       ],
     },
     {
       stage: 'Closing',
       description: 'Final inspections, paperwork, and transfer of ownership',
       timeframe: '30-45 days',
       tips: [
         'Complete home inspection',
         'Secure insurance',
         'Do final walk-through before closing',
       ],
     },
   ];
   
   return {
     keyMetrics,
     marketTerms,
     commonMisconceptions,
     processOverview,
   };
 }
 
 /**
  * Generate pathways based on user's goal
  */
 function generatePathways(
   criteria: BrowserCriteria,
   browserMarket: BrowserMarketAnalysis,
   marketOverview: ReturnType<typeof createMarketOverview>
 ) {
   const { nextSteps } = browserMarket.browserInsights;
   
   return {
     buyerPath: {
       immediate: nextSteps.ifBuying.slice(0, 4),
       shortTerm: [
         'Save for down payment and closing costs',
         'Research and compare mortgage lenders',
         'Define your must-have vs. nice-to-have features',
         'Set up property alerts for your target areas',
       ],
       preparation: [
         'Get pre-approved for mortgage',
         'Build relationship with buyer\'s agent',
         'Create comprehensive budget including all costs',
         'Plan for potential multiple offer situations',
       ],
     },
     sellerPath: {
       immediate: nextSteps.ifSelling.slice(0, 4),
       evaluation: [
         'Research recent comparable sales in your area',
         'Assess needed repairs and improvements',
         'Understand current market conditions',
         'Interview experienced listing agents',
       ],
       preparation: [
         'Complete necessary repairs and improvements',
         'Declutter and stage your home',
         'Gather all property documents',
         'Plan for timing based on market conditions',
       ],
     },
     investorPath: {
       research: nextSteps.ifInvesting.slice(0, 4),
       analysis: [
         'Analyze cash flow potential and expenses',
         'Research rental demand in target areas',
         'Understand property management requirements',
         'Evaluate appreciation vs. cash flow strategy',
       ],
       dueDelligence: [
         'Review property inspection thoroughly',
         'Calculate true ROI including all costs',
         'Research local landlord regulations',
         'Build team (agent, property manager, accountant)',
       ],
     },
     generalPath: {
       learning: nextSteps.generalResearch.slice(0, 4),
       exploration: [
         'Attend local real estate events and seminars',
         'Follow market reports and trends',
         'Network with agents and other homeowners',
         'Visit different neighborhoods regularly',
       ],
       networking: [
         'Connect with real estate professionals',
         'Join local homeowner or investor groups',
         'Follow reputable real estate blogs/podcasts',
         'Consider informational interviews with agents',
       ],
     },
   };
 }
 
 /**
  * Calculate confidence scores
  */
 function calculateBrowserConfidence(
   marketData: MarketData,
   properties: PropertyData[],
   chatAnswers: ExtractedAnswer[]
 ) {
   // Market data quality
   const hasHistorical = !!marketData.previousPeriod;
   const hasNeighborhoods = !!marketData.hotNeighborhoods?.length;
   const marketDataQuality = hasHistorical && hasNeighborhoods ? 'high' :
                            hasHistorical || hasNeighborhoods ? 'medium' : 'low';
   
   // Sample diversity (variety of property types and price ranges)
   const uniqueTypes = new Set(properties.map(p => p.propertyType)).size;
   const priceRange = properties.length > 0
     ? Math.max(...properties.map(p => p.pricing.listPrice || 0)) - 
       Math.min(...properties.map(p => p.pricing.listPrice || 0))
     : 0;
   
   const sampleDiversity = uniqueTypes >= 3 && priceRange > 300000 ? 'high' :
                          uniqueTypes >= 2 && priceRange > 150000 ? 'medium' : 'low';
   
   // Data completeness
   const expectedQuestions = 6;
   const dataCompleteness = Math.round((chatAnswers.length / expectedQuestions) * 100);
   
   return {
     marketDataQuality,
     sampleDiversity,
     dataCompleteness,
   };
 }