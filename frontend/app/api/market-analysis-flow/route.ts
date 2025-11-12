// app/api/market-analysis/route.ts
import { NextRequest, NextResponse } from 'next/server';
import type { PropertyData } from '@/types/dataTypes/property.types';
import {
  computeMarketData,
  getPropertiesForArea,
} from '@/lib/calc/marketCalc';
import { analyzeMarket, calculateConfidence } from '@/lib/calc/marketAnalzyer';
import { interpretMarketForFlow } from '@/lib/calc/marketInterpreter';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      area = 'Halifax',
      flow = 'sell' as 'sell' | 'buy' | 'browse',
      properties,
    }: {
      area?: string;
      flow?: 'sell' | 'buy' | 'browse';
      properties?: PropertyData[];
    } = body;

    if (!area || !flow) {
      return NextResponse.json(
        { success: false, error: 'Missing area or flow' },
        { status: 400 }
      );
    }

    // Use custom properties if provided, else fallback to placeholder
    const props = Array.isArray(properties) && properties.length > 0
      ? properties
      : getPropertiesForArea(area);

    const marketData = computeMarketData(props, area);
    const baseAnalysis = analyzeMarket(marketData);
    const flowInterpretation = interpretMarketForFlow(marketData, flow);
    const confidence = calculateConfidence(marketData);

    return NextResponse.json({
      success: true,
      data: {
        analysis: baseAnalysis,
        flowSpecific: flowInterpretation,
        confidence,
        marketData, // optional debug
        metadata: {
          area,
          flow,
          generatedAt: new Date().toISOString(),
          dataSource: properties?.length ? 'external' : 'placeholder',
          isMockData: !properties?.length,
        },
      },
    });
  } catch (error: any) {
    console.error('Market analysis POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Invalid payload' },
      { status: 400 }
    );
  }
}