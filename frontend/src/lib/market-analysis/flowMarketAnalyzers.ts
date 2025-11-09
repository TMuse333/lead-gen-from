// lib/market-analysis/flowMarketAnalyzers.ts
/**
 * Flow-Specific Market Analyzers
 * Converts base market analysis into flow-specific insights
 * These functions are used by the specialized generators
 */

 import { BaseMarketAnalysis } from '@/types/baseMarketAnalysis';
 import { 
   SellerMarketAnalysis, 
   BuyerMarketAnalysis, 
   BrowserMarketAnalysis 
 } from '@/types/flowMarketAnalysis.types';
 import { MarketData } from '@/types/market.types';
 
 // ============================================
 // TYPES
 // ============================================
 
 interface LeadData {
   answers: Array<{
     questionId: string;
     value: string;
   }>;
 }
 
 // ============================================
 // SELLER ANALYZER
 // ============================================
 
 export function analyzeForSeller(
   baseAnalysis: BaseMarketAnalysis,
   marketData: MarketData,
   leadData: LeadData
 ): SellerMarketAnalysis {
   // Extract seller-specific info from lead data
   const timeline = leadData.answers.find(a => a.questionId === 'timeline')?.value || '';
   const renovations = leadData.answers.find(a => a.questionId === 'renovations')?.value || 'none';
   const propertyAge = leadData.answers.find(a => a.questionId === 'propertyAge')?.value || '';
   const sellingReason = leadData.answers.find(a => a.questionId === 'sellingReason')?.value || '';
   
   // Determine pricing strategy based on market condition
   let pricingStrategy: 'aggressive' | 'competitive' | 'conservative';
   let expectedTimeToSell: number;
   
   if (baseAnalysis.condition === 'sellers_market') {
     pricingStrategy = 'aggressive';
     expectedTimeToSell = Math.max(15, baseAnalysis.metrics.averageDaysOnMarket - 10);
   } else if (baseAnalysis.condition === 'balanced_market') {
     pricingStrategy = 'competitive';
     expectedTimeToSell = baseAnalysis.metrics.averageDaysOnMarket;
   } else {
     pricingStrategy = 'conservative';
     expectedTimeToSell = baseAnalysis.metrics.averageDaysOnMarket + 15;
   }
   
   // Adjust based on urgency
   if (timeline === '0-3' || timeline === 'asap') {
     if (pricingStrategy === 'aggressive') pricingStrategy = 'competitive';
   }
   
   const confidenceLevel = baseAnalysis.reliability === 'high' ? 'high' : 
                          baseAnalysis.reliability === 'medium' ? 'medium' : 'low';
   
   const pricingRecommendation = {
     strategy: pricingStrategy,
     reasoning: generatePricingReasoning(pricingStrategy, baseAnalysis, timeline),
     expectedTimeToSell,
     confidenceLevel,
   };
   
   // Competition analysis
   const competition = {
     similarListings: Math.round(marketData.totalActiveListings * 0.15), // Estimate 15% similar
     averageListPrice: marketData.averageSalePrice,
     daysOnMarketForSimilar: baseAnalysis.metrics.averageDaysOnMarket,
     priceReductionRate: Math.round((marketData.priceReductionsLast7Days / marketData.newListingsLast7Days) * 100),
     competitionLevel: baseAnalysis.metrics.competitionScore > 70 ? 'high' as const :
                      baseAnalysis.metrics.competitionScore > 40 ? 'moderate' as const : 'low' as const,
   };
   
   // Timing recommendations
   const currentMonth = new Date().getMonth();
   const season = currentMonth >= 2 && currentMonth <= 4 ? 'spring' :
                 currentMonth >= 5 && currentMonth <= 7 ? 'summer' :
                 currentMonth >= 8 && currentMonth <= 10 ? 'fall' : 'winter';
   
   const timing = {
     currentMarketScore: calculateSellerMarketScore(baseAnalysis, season, timeline),
     bestTimeToList: generateBestTimeToList(season, timeline, baseAnalysis),
     urgencyReason: generateUrgencyReason(timeline, baseAnalysis),
     seasonalAdvice: generateSeasonalAdvice(season, baseAnalysis),
   };
   
   // Value optimization suggestions
   const valueOptimization = {
     quickWins: generateQuickWins(renovations, propertyAge),
     majorImprovements: generateMajorImprovements(renovations, propertyAge),
     costVsBenefit: [
       { item: 'Fresh paint', estimatedCost: 3000, estimatedValueAdd: 5000, roi: 67 },
       { item: 'Landscaping', estimatedCost: 2000, estimatedValueAdd: 4000, roi: 100 },
       { item: 'Kitchen update', estimatedCost: 45000, estimatedValueAdd: 35000, roi: 78 },
     ],
   };
   
   // Risk assessment
   const risks = {
     level: baseAnalysis.condition === 'buyers_market' ? 'high' as const :
           baseAnalysis.trendDirection === 'declining' ? 'moderate' as const : 'low' as const,
     factors: generateRiskFactors(baseAnalysis, timeline),
     mitigation: generateMitigationStrategies(baseAnalysis, timeline),
   };
   
   // Market positioning
   const positioning = {
     competitiveAdvantages: generateCompetitiveAdvantages(renovations, propertyAge, baseAnalysis),
     potentialChallenges: generatePotentialChallenges(baseAnalysis, competition),
     targetBuyerProfile: generateTargetBuyer(sellingReason, baseAnalysis),
   };
   
   // Generate summary
   const sellerSummary = `The ${marketData.area} market is currently a ${baseAnalysis.condition.replace('_', ' ')} ` +
     `with ${baseAnalysis.trendDirection} prices. Your ${pricingStrategy} pricing strategy should result in a sale ` +
     `within approximately ${expectedTimeToSell} days. ${competition.similarListings} similar properties are competing ` +
     `for buyers. ${timing.bestTimeToList}`;
   
   return {
     ...baseAnalysis,
     sellerInsights: {
       pricingRecommendation,
       competition,
       timing,
       valueOptimization,
       risks,
       positioning,
     },
     sellerSummary,
   };
 }
 
 // ============================================
 // BUYER ANALYZER
 // ============================================
 
 export function analyzeForBuyer(
   baseAnalysis: BaseMarketAnalysis,
   marketData: MarketData,
   leadData: LeadData
 ): BuyerMarketAnalysis {
   // Extract buyer-specific info
   const timeline = leadData.answers.find(a => a.questionId === 'timeline')?.value || '';
   const budget = leadData.answers.find(a => a.questionId === 'budget')?.value || '';
   const buyingReason = leadData.answers.find(a => a.questionId === 'buyingReason')?.value || '';
   
   // Opportunity assessment
   const currentMarketScore = calculateBuyerMarketScore(baseAnalysis, timeline);
   const buyerAdvantage = baseAnalysis.condition === 'buyers_market' ? 'strong' as const :
                         baseAnalysis.condition === 'balanced_market' ? 'moderate' as const : 'weak' as const;
   
   const opportunity = {
     currentMarketScore,
     buyerAdvantage,
     reasoning: `Current ${baseAnalysis.condition.replace('_', ' ')} provides ${buyerAdvantage} buyer advantage`,
     timingAdvice: generateBuyerTimingAdvice(timeline, baseAnalysis),
   };
   
   // Negotiation landscape
   const leverageLevel = baseAnalysis.condition === 'buyers_market' ? 'high' as const :
                        baseAnalysis.condition === 'balanced_market' ? 'moderate' as const : 'low' as const;
   
   const typicalPriceReduction = leverageLevel === 'high' ? 5 :
                                leverageLevel === 'moderate' ? 2 : 0.5;
   
   const competitionForProperties = baseAnalysis.metrics.averageDaysOnMarket < 25 ? 'intense' as const :
                                   baseAnalysis.metrics.averageDaysOnMarket < 45 ? 'moderate' as const : 'minimal' as const;
   
   const biddingWarProbability = competitionForProperties === 'intense' ? 75 :
                                competitionForProperties === 'moderate' ? 40 : 15;
   
   const negotiation = {
     leverageLevel,
     typicalPriceReduction,
     competitionForProperties,
     biddingWarProbability,
     strategicAdvice: generateNegotiationAdvice(leverageLevel, competitionForProperties, timeline),
   };
   
   // Value opportunities
   const valueOpportunities = {
     bestValueNeighborhoods: marketData.hotNeighborhoods?.slice(0, 3) || ['Clayton Park', 'Fairview', 'Spryfield'],
     undervaluedPropertyTypes: ['Townhouses', 'Condos in emerging areas'],
     emergingAreas: [
       {
         neighborhood: 'Spryfield',
         appreciationPotential: 'high' as const,
         reasoning: 'Ongoing development driving value',
       },
     ],
     hiddenGems: ['Properties listed in winter', 'Homes on market 60+ days'],
   };
   
   // Financing context
   const affordabilityIndex = 100 - baseAnalysis.metrics.competitionScore;
   
   const financing = {
     affordabilityIndex,
     typicalDownPayment: 20,
     closingCostEstimate: 3,
     rateEnvironment: baseAnalysis.trendDirection === 'rising' ? 'challenging' as const : 'favorable' as const,
     financingTips: [
       'Shop multiple lenders for best rates',
       'Get fully underwritten pre-approval',
       'Budget for property tax and insurance',
     ],
   };
   
   // Inventory intelligence
   const daysOfSupply = (marketData.totalActiveListings / marketData.totalSoldLast30Days) * 30;
   
   const inventory = {
     daysOfSupply: Math.round(daysOfSupply),
     newListingsRate: marketData.newListingsLast7Days,
     freshInventoryOpportunities: daysOfSupply < 60 
       ? 'Tight market - act fast on matches' 
       : 'Balanced inventory - be selective',
     inventoryTrend: daysOfSupply < 60 
       ? 'Inventory decreasing - seller advantage' 
       : 'Inventory stable - balanced market',
   };
   
   // Risk assessment
   const risks = {
     overpayingRisk: competitionForProperties === 'intense' ? 'high' as const : 'moderate' as const,
     marketShiftRisk: baseAnalysis.trendDirection === 'rising' ? 'moderate' as const : 'low' as const,
     warnings: ['Don\'t waive inspection due to competition', 'Stick to budget limits'],
     protectionStrategies: ['Include inspection contingency', 'Get title insurance'],
   };
   
   // Action plan
   const actionPlan = {
     immediate: ['Get mortgage pre-approval', 'Define must-haves', 'Research neighborhoods'],
     shortTerm: ['Tour 8-12 properties', 'Build agent relationship', 'Monitor market'],
     longTerm: ['Continue saving', 'Follow market trends', 'Build credit score'],
   };
   
   // Generate summary
   const buyerSummary = `The ${marketData.area} market offers ${buyerAdvantage} buyer advantage with ` +
     `${competitionForProperties} competition. Bidding wars occur in ${biddingWarProbability}% of transactions.`;
   
   return {
     ...baseAnalysis,
     buyerInsights: {
       opportunity,
       negotiation,
       valueOpportunities,
       financing,
       inventory!,
       risks,
       actionPlan,
     },
     buyerSummary,
   };
 }
 
 // ============================================
 // BROWSER ANALYZER
 // ============================================
 
 export function analyzeForBrowser(
   baseAnalysis: BaseMarketAnalysis,
   marketData: MarketData,
   leadData: LeadData
 ): BrowserMarketAnalysis {
   // Extract browser-specific info
   const interest = leadData.answers.find(a => a.questionId === 'interest')?.value || 'general';
   const goal = leadData.answers.find(a => a.questionId === 'goal')?.value || 'learn';
   
   // Market overview
   const marketHealthScore = calculateMarketHealthScore(baseAnalysis);
   const affordabilityScore = 100 - baseAnalysis.metrics.competitionScore;
   
   const overview = {
     marketHealthScore,
     accessibility: affordabilityScore > 70 ? 'very_accessible' as const :
                   affordabilityScore > 50 ? 'accessible' as const :
                   affordabilityScore > 30 ? 'challenging' as const : 'very_challenging' as const,
     diversityScore: 75,
     opportunityLevel: marketHealthScore > 70 ? 'high' as const :
                      marketHealthScore > 50 ? 'moderate' as const : 'low' as const,
   };
   
   // Exploration recommendations
   const exploration = {
     recommendedNeighborhoods: (marketData.hotNeighborhoods || []).slice(0, 5).map(name => ({
       name,
       priceRange: '$400K - $700K',
       characteristics: ['Established', 'Good amenities'],
       whyInteresting: 'Strong performance and livability',
     })),
     propertyTypeDistribution: [
       { type: 'Single Family', percentage: 45, averagePrice: 550000, availability: 'moderate' as const },
       { type: 'Condo', percentage: 30, averagePrice: 350000, availability: 'abundant' as const },
     ],
     searchFilters: {
       priceRanges: [
         { min: 0, max: 400000, label: 'Starter' },
         { min: 400000, max: 600000, label: 'Mid-Range' },
       ],
       popularFeatures: ['Updated Kitchen', 'Home Office'],
       recommendedSortBy: 'best_value',
     },
   };
   
   // Market education
   const education = {
     keyTerms: [
       {
         term: 'Absorption Rate',
         definition: 'Speed at which homes are sold',
         relevance: 'Higher rates favor sellers',
       },
     ],
     marketDynamics: [
       `Current ${baseAnalysis.condition.replace('_', ' ')}`,
       'Seasonal factors affect activity',
     ],
     commonMisconceptions: [
       {
         misconception: 'Spring is only time to buy',
         reality: 'Every season has advantages',
       },
     ],
   };
   
   // Insights & patterns
   const patterns = {
     priceTrends: `Prices ${baseAnalysis.trendDirection}`,
     popularFeatures: ['Updated kitchens', 'Home offices', 'Outdoor spaces'],
     emergingTrends: ['Remote work spaces essential', 'Energy efficiency priority'],
     seasonalPatterns: 'Spring/summer peak, winter slower',
   };
   
   // Comparative analysis
   const comparison = {
     neighborhoodComparisons: (marketData.hotNeighborhoods || []).slice(0, 3).map(name => ({
       neighborhood: name,
       avgPrice: marketData.averageSalePrice,
       pricePerSqft: baseAnalysis.metrics.pricePerSqft,
       daysOnMarket: baseAnalysis.metrics.averageDaysOnMarket,
       insight: 'Strong performance',
     })),
     propertyTypeComparisons: [
       { type: 'Single Family', valueProposition: 'Best appreciation', marketStrength: 'strong' as const },
       { type: 'Condo', valueProposition: 'Lower entry cost', marketStrength: 'moderate' as const },
     ],
   };
   
   // Next steps
   const nextSteps = {
     ifBuying: ['Get pre-approved', 'Tour properties', 'Build agent relationship'],
     ifSelling: ['Get valuation', 'Research comparables', 'Interview agents'],
     ifInvesting: ['Analyze cash flow', 'Research rental demand', 'Calculate ROI'],
     generalResearch: ['Follow market reports', 'Attend open houses', 'Network'],
   };
   
   // Generate summary
   const browserSummary = `The ${marketData.area} market shows health score of ${marketHealthScore}/100 ` +
     `with ${overview.accessibility.replace('_', ' ')} entry points and ${overview.opportunityLevel} opportunity.`;
   
   return {
     ...baseAnalysis,
     browserInsights: {
       overview,
       exploration,
       education,
       patterns,
       comparison,
       nextSteps,
     },
     browserSummary,
   };
 }
 
 // ============================================
 // HELPER FUNCTIONS
 // ============================================
 
 function generatePricingReasoning(strategy: string, baseAnalysis: BaseMarketAnalysis, timeline: string): string {
   if (strategy === 'aggressive') {
     return `Strong ${baseAnalysis.condition.replace('_', ' ')} supports premium pricing`;
   } else if (strategy === 'competitive') {
     return 'Balanced market requires competitive pricing';
   }
   return 'Conservative pricing recommended for quicker sale';
 }
 
 function calculateSellerMarketScore(baseAnalysis: BaseMarketAnalysis, season: string, timeline: string): number {
   let score = 50;
   if (baseAnalysis.condition === 'sellers_market') score += 25;
   if (baseAnalysis.trendDirection === 'rising') score += 15;
   if (season === 'spring' || season === 'summer') score += 10;
   return Math.max(0, Math.min(100, score));
 }
 
 function generateBestTimeToList(season: string, timeline: string, baseAnalysis: BaseMarketAnalysis): string {
   if (timeline === '0-3') return 'List immediately to meet timeline';
   if (season === 'winter') return 'Wait for spring for maximum activity';
   return 'Market conditions favorable - list within 2-3 weeks';
 }
 
 function generateUrgencyReason(timeline: string, baseAnalysis: BaseMarketAnalysis): string {
   if (timeline === '0-3') return 'ASAP timeline requires immediate action';
   return 'No urgent pressure';
 }
 
 function generateSeasonalAdvice(season: string, baseAnalysis: BaseMarketAnalysis): string {
   const seasonal = {
     spring: 'Peak season - maximum buyer activity',
     summer: 'Strong market continues',
     fall: 'Serious buyers remain',
     winter: 'Motivated buyers - less competition',
   };
   return seasonal[season as keyof typeof seasonal] || seasonal.spring;
 }
 
 function generateQuickWins(renovations: string, propertyAge: string): string[] {
   return [
     'Fresh paint in neutral colors',
     'Professional deep cleaning',
     'Enhance curb appeal',
     'Update light fixtures',
   ];
 }
 
 function generateMajorImprovements(renovations: string, propertyAge: string): string[] {
   const improvements = [];
   if (!renovations.includes('kitchen')) improvements.push('Kitchen renovation');
   if (!renovations.includes('bathroom')) improvements.push('Bathroom update');
   return improvements;
 }
 
 function generateRiskFactors(baseAnalysis: BaseMarketAnalysis, timeline: string): string[] {
   const factors = [];
   if (baseAnalysis.condition === 'buyers_market') factors.push('Buyer\'s market reduces power');
   if (timeline === '0-3') factors.push('Tight timeline may force lower offers');
   return factors;
 }
 
 function generateMitigationStrategies(baseAnalysis: BaseMarketAnalysis, timeline: string): string[] {
   return [
     'Price competitively from day one',
     'Professional staging and photography',
     'Be flexible with showings',
   ];
 }
 
 function generateCompetitiveAdvantages(renovations: string, propertyAge: string, baseAnalysis: BaseMarketAnalysis): string[] {
   const advantages = [];
   if (renovations.includes('kitchen')) advantages.push('Updated kitchen');
   if (propertyAge === '0-10') advantages.push('Newer construction');
   return advantages;
 }
 
 function generatePotentialChallenges(baseAnalysis: BaseMarketAnalysis, competition: any): string[] {
   return ['Competition from similar properties', 'Buyer financing delays'];
 }
 
 function generateTargetBuyer(sellingReason: string, baseAnalysis: BaseMarketAnalysis): string {
   if (sellingReason === 'upsizing') return 'Growing families';
   if (sellingReason === 'downsizing') return 'Empty nesters';
   return 'First-time and move-up buyers';
 }
 
 function calculateBuyerMarketScore(baseAnalysis: BaseMarketAnalysis, timeline: string): number {
   let score = 50;
   if (baseAnalysis.condition === 'buyers_market') score += 30;
   if (baseAnalysis.trendDirection === 'declining') score += 15;
   return Math.max(0, Math.min(100, score));
 }
 
 function generateBuyerTimingAdvice(timeline: string, baseAnalysis: BaseMarketAnalysis): string {
   if (timeline === '0-3') return 'Your tight timeline is feasible';
   return 'Market conditions support your timeline';
 }
 
 function generateNegotiationAdvice(leverage: string, competition: string, timeline: string): string[] {
   const advice = [];
   if (leverage === 'high') advice.push('Request repairs - sellers motivated');
   if (competition === 'intense') advice.push('Get pre-approved to move fast');
   return advice;
 }
 
 function calculateMarketHealthScore(baseAnalysis: BaseMarketAnalysis): number {
   let score = 50;
   if (baseAnalysis.condition === 'balanced_market') score += 20;
   if (baseAnalysis.trendDirection === 'rising') score += 15;
   return Math.max(0, Math.min(100, score));
 }