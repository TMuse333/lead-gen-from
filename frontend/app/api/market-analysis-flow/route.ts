// app/api/market-analysis/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MarketData } from '@/types/dataTypes/market.types';
import { analyzeMarket, calculateConfidence } from '@/lib/calc/marketAnalzyer';
import { interpretMarketForFlow } from '@/lib/calc/marketInterpreter';


/**
 * API Route: Market Analysis
 * 
 * Returns base market analysis WITH flow-specific interpretation
 * 
 * Future enhancements:
 * - Connect to real MLS API
 * - Add Qdrant vector insights
 * - Personalize based on full user data
 */
export async function GET(req: NextRequest) {
  try {
    // Extract params from query
    const { searchParams } = new URL(req.url);
    const area = searchParams.get('area') || 'Halifax';
    const flow = searchParams.get('flow') as 'sell' | 'buy' | 'browse' || 'browse';
    
    // ========================================
    // PLACEHOLDER DATA (MVP)
    // TODO: Replace with real data source
    // ========================================
    const marketData: MarketData = {
      area,
      lastUpdated: new Date(),
      
      // Core metrics
      averageSalePrice: 525000,
      medianSalePrice: 485000,
      averageDaysOnMarket: 28,
      totalActiveListings: 450,
      totalSoldLast30Days: 85,
      
      // Optional enhancements
      absorptionRate: 5.3,
      pricePerSqft: 285,
      newListingsLast7Days: 42,
      priceReductionsLast7Days: 18,
      hotNeighborhoods: ['South End', 'West End', 'Clayton Park', 'Bedford', 'Dartmouth'],
      yearOverYearChange: 8.5,
      
      // Historical comparison
      previousPeriod: {
        averageSalePrice: 510000,
        medianSalePrice: 475000,
        averageDaysOnMarket: 32,
        totalSoldLast30Days: 78,
      },
    };
    
    // Generate base market analysis
    const baseAnalysis = analyzeMarket(marketData);
    
    // Generate flow-specific interpretation
    const flowInterpretation = interpretMarketForFlow(marketData, flow);
    
    // Calculate confidence in the analysis
    const confidence = calculateConfidence(marketData);
    
    // Return complete analysis
    return NextResponse.json({
      success: true,
      data: {
        analysis: baseAnalysis,
        flowSpecific: flowInterpretation,  // ← New flow-specific insights
        confidence,
        metadata: {
          area,
          flow,  // ← Include flow in metadata
          generatedAt: new Date().toISOString(),
          dataSource: 'placeholder', // Will be 'mls_api' or 'qdrant' in future
          isMockData: true, // Flag for MVP
        },
      },
    });
    
  } catch (error) {
    console.error('Market analysis error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate market analysis' 
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint for personalized analysis
 * 
 * Body: { area, flow, userInput }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { area = 'Halifax', flow = 'browse', userInput } = body;
    
    // Future: Use userInput for deeper personalization
    // (e.g., "you mentioned a $500K budget" or "your 0-3 month timeline")
    
    const marketData: MarketData = {
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
      yearOverYearChange: 8.5,
      previousPeriod: {
        averageSalePrice: 510000,
        medianSalePrice: 475000,
        averageDaysOnMarket: 32,
        totalSoldLast30Days: 78,
      },
    };
    
    const baseAnalysis = analyzeMarket(marketData);
    const flowInterpretation = interpretMarketForFlow(marketData, flow);
    const confidence = calculateConfidence(marketData);
    
    return NextResponse.json({
      success: true,
      data: {
        analysis: baseAnalysis,
        flowSpecific: flowInterpretation,
        confidence,
        metadata: {
          area,
          flow,
          userInput, // Echo back for debugging
          generatedAt: new Date().toISOString(),
          dataSource: 'placeholder',
          isMockData: true,
        },
      },
    });
    
  } catch (error) {
    console.error('Market analysis POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate analysis' },
      { status: 500 }
    );
  }
}