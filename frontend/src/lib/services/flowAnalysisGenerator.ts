// lib/services/flowAnalysisGenerator.ts
/**
 * Flow Analysis Generator
 * Converts chat answers + market data + properties → Complete Flow Analysis
 */

 import { ExtractedAnswer } from '@/types/chat.types';
 import { MarketData } from '@/types/market.types';
 import { PropertyData } from '@/types/property.types';
 import { analyzeMarket } from '@/lib/calc/marketAnalyzer';
//  import { 
//    analyzeForSeller, 
//    analyzeForBuyer, 
//    analyzeForBrowser 
//  } from '@/lib/market-analysis/flowMarketAnalyzers';
 import { 
   SellerMarketAnalysis, 
   BuyerMarketAnalysis, 
   BrowserMarketAnalysis 
 } from '@/types/flowMarketAnalysis.types';
import { searchProperties } from '@/data/realEstateData/placeholderData';
import { analyzeProperty } from '../calc/propertyAnalyzer';
//  import { searchProperties } from '@/data/placeholderProperties';
//  import { analyzeProperty } from '@/lib/propertyAnalyzer';
 
 // ============================================
 // TYPES
 // ============================================
 
 export type FlowType = 'sell' | 'buy' | 'browse';
 
 export interface ChatToAnalysisInput {
   flowType: FlowType;
   chatAnswers: ExtractedAnswer[];
   area?: string; // Will extract from chat or default
 }
 
 export interface CompleteFlowAnalysis {
   flowType: FlowType;
   
   // Layer 1: Market Intelligence (data-driven)
   marketIntelligence: {
     base: ReturnType<typeof analyzeMarket>;
     flowSpecific: SellerMarketAnalysis | BuyerMarketAnalysis | BrowserMarketAnalysis;
   };
   
   // Layer 2: Property Intelligence (relevant homes)
   propertyIntelligence: {
     properties: PropertyData[];
     analyses: ReturnType<typeof analyzeProperty>[];
     totalFound: number;
   };
   
   // Layer 3: User Context (from chat)
   userContext: {
     answers: ExtractedAnswer[];
     extractedCriteria: Record<string, string | number>;
   };
   
   // Metadata
   generatedAt: Date;
   confidence: {
     marketDataQuality: 'high' | 'medium' | 'low';
     propertyDataQuality: 'high' | 'medium' | 'low';
     userDataCompleteness: number; // 0-100
   };
 }
 
 // ============================================
 // MAIN GENERATOR
 // ============================================
 
 export async function generateFlowAnalysis(
   input: ChatToAnalysisInput
 ): Promise<CompleteFlowAnalysis> {
   // Step 1: Extract criteria from chat answers
   const criteria = extractCriteriaFromChat(input.chatAnswers, input.flowType);
   const area = input.area || criteria.area || 'Halifax';
   
   // Step 2: Fetch market data (placeholder for now)
   const marketData = getMarketData(area as string);
   
   // Step 3: Generate base market analysis
   const baseMarketAnalysis = analyzeMarket(marketData);
   
   // Step 4: Generate flow-specific market analysis
   const flowSpecificAnalysis = generateFlowSpecificAnalysis(
     input.flowType,
     baseMarketAnalysis,
     marketData,
     input.chatAnswers
   );
   
   // Step 5: Get relevant properties
   const propertyResults = getRelevantProperties(input.flowType, criteria, area);
   
   // Step 6: Calculate confidence
   const confidence = calculateConfidence(marketData, propertyResults.properties, input.chatAnswers);
   
   return {
     flowType: input.flowType,
     marketIntelligence: {
       base: baseMarketAnalysis,
       flowSpecific: flowSpecificAnalysis,
     },
     propertyIntelligence: propertyResults,
     userContext: {
       answers: input.chatAnswers,
       extractedCriteria: criteria,
     },
     generatedAt: new Date(),
     confidence,
   };
 }
 
 // ============================================
 // HELPER FUNCTIONS
 // ============================================
 
 /**
  * Extract search criteria from chat answers
  */
 function extractCriteriaFromChat(
   answers: ExtractedAnswer[],
   flowType: FlowType
 ): Record<string, string | number> {
   const criteria: Record<string, string | number> = {};
   
   answers.forEach(answer => {
     const questionId = answer.questionId;
     const value = answer.value;
     
     // Common extractions
     if (questionId === 'location' || questionId === 'area') {
       criteria.area = value;
     }
     
     if (flowType === 'sell') {
       // Seller-specific
       if (questionId === 'propertyType') criteria.propertyType = value;
       if (questionId === 'propertyAge') criteria.propertyAge = value;
       if (questionId === 'renovations') criteria.renovations = value;
       if (questionId === 'timeline') criteria.timeline = value;
       if (questionId === 'sellingReason') criteria.sellingReason = value;
     }
     
     if (flowType === 'buy') {
       // Buyer-specific
       if (questionId === 'propertyType') criteria.propertyType = value;
       if (questionId === 'budget') {
         // Parse budget range
         if (value === 'under-400k') criteria.maxPrice = 400000;
         else if (value === '400k-600k') {
           criteria.minPrice = 400000;
           criteria.maxPrice = 600000;
         }
         else if (value === '600k-800k') {
           criteria.minPrice = 600000;
           criteria.maxPrice = 800000;
         }
         else if (value === 'over-800k') criteria.minPrice = 800000;
       }
       if (questionId === 'bedrooms') {
         // Parse bedroom requirements
         if (value === '1-2') criteria.minBedrooms = 1;
         else if (value === '3') criteria.minBedrooms = 3;
         else if (value === '4') criteria.minBedrooms = 4;
         else if (value === '5+') criteria.minBedrooms = 5;
       }
       if (questionId === 'timeline') criteria.timeline = value;
       if (questionId === 'buyingReason') criteria.buyingReason = value;
     }
     
     if (flowType === 'browse') {
       // Browser-specific
       if (questionId === 'interest') criteria.interest = value;
       if (questionId === 'location') criteria.location = value;
       if (questionId === 'priceRange') {
         if (value === 'under-400k') criteria.maxPrice = 400000;
         else if (value === '400k-600k') {
           criteria.minPrice = 400000;
           criteria.maxPrice = 600000;
         }
         else if (value === '600k-800k') {
           criteria.minPrice = 600000;
           criteria.maxPrice = 800000;
         }
         else if (value === 'over-800k') criteria.minPrice = 800000;
       }
       if (questionId === 'timeline') criteria.timeline = value;
       if (questionId === 'goal') criteria.goal = value;
     }
     
     // Email is always captured
     if (questionId === 'email') criteria.email = value;
   });
   
   return criteria;
 }
 
 /**
  * Get market data (placeholder for now)
  */
 function getMarketData(area: string): MarketData {
   // TODO: Replace with real API call
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
  * Generate flow-specific market analysis
  */
 function generateFlowSpecificAnalysis(
   flowType: FlowType,
   baseAnalysis: ReturnType<typeof analyzeMarket>,
   marketData: MarketData,
   chatAnswers: ExtractedAnswer[]
 ): SellerMarketAnalysis | BuyerMarketAnalysis | BrowserMarketAnalysis {
   // Create minimal lead data for analyzers
   const leadData = {
     answers: chatAnswers.map(a => ({
       questionId: a.questionId,
       question: a.question,
       value: a.value,
       answeredAt: a.answeredAt,
     })),
   };
   
   switch (flowType) {
     case 'sell':
       return analyzeForSeller(baseAnalysis, marketData, leadData as any);
     case 'buy':
       return analyzeForBuyer(baseAnalysis, marketData, leadData as any);
     case 'browse':
       return analyzeForBrowser(baseAnalysis, marketData, leadData as any);
     default:
       throw new Error(`Unknown flow type: ${flowType}`);
   }
 }
 
 /**
  * Get relevant properties based on flow and criteria
  */
 function getRelevantProperties(
   flowType: FlowType,
   criteria: Record<string, string | number>,
   area: string
 ) {
   let properties: PropertyData[] = [];
   
   if (flowType === 'sell') {
     // For sellers: find comparable sold/active properties
     properties = searchProperties({
       city: area,
       propertyType: criteria.propertyType as string | undefined,
     }).slice(0, 10); // Limit to 10 comparables
   }
   
   if (flowType === 'buy') {
     // For buyers: find properties matching their criteria
     properties = searchProperties({
       city: area,
       minPrice: criteria.minPrice as number | undefined,
       maxPrice: criteria.maxPrice as number | undefined,
       minBedrooms: criteria.minBedrooms as number | undefined,
       propertyType: criteria.propertyType as string | undefined,
     }).slice(0, 20); // Show more options for buyers
   }
   
   if (flowType === 'browse') {
     // For browsers: show variety across price ranges
     properties = searchProperties({
       city: area,
       minPrice: criteria.minPrice as number | undefined,
       maxPrice: criteria.maxPrice as number | undefined,
     }).slice(0, 15);
   }
   
   // Analyze each property
   const analyses = properties.map(property => {
     // Get comparables for each property
     const comparables = searchProperties({
       city: property.address.city,
       propertyType: property.propertyType,
     }).filter(p => p.id !== property.id).slice(0, 5);
     
     return analyzeProperty(property, comparables);
   });
   
   return {
     properties,
     analyses,
     totalFound: properties.length,
   };
 }
 
 /**
  * Calculate confidence in the analysis
  */
 function calculateConfidence(
   marketData: MarketData,
   properties: PropertyData[],
   chatAnswers: ExtractedAnswer[]
 ) {
   // Market data quality
   const hasHistoricalData = !!marketData.previousPeriod;
   const hasNeighborhoodData = !!marketData.hotNeighborhoods && marketData.hotNeighborhoods.length > 0;
   const marketDataQuality = hasHistoricalData && hasNeighborhoodData ? 'high' : 
     hasHistoricalData || hasNeighborhoodData ? 'medium' : 'low';
   
   // Property data quality
   const propertyDataQuality = properties.length >= 5 ? 'high' : 
     properties.length >= 3 ? 'medium' : 'low';
   
   // User data completeness (percentage of questions answered)
   const totalExpectedQuestions = 6; // from flow config
   const userDataCompleteness = Math.round((chatAnswers.length / totalExpectedQuestions) * 100);
   
   return {
     marketDataQuality,
     propertyDataQuality,
     userDataCompleteness,
   };
 }