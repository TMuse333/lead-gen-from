// lib/market/generateMarketAnalysis.ts
import type { PropertyData } from '@/types/dataTypes/property.types';

import { analyzeMarket, calculateConfidence } from '@/lib/calc/marketAnalzyer';
import { interpretMarketForFlow } from '@/lib/calc/marketInterpreter';
import { computeMarketData, getPropertiesForArea } from '../calc/marketCalc';

export type FlowType = 'sell' | 'buy' | 'browse';

export async function generateMarketAnalysis(
  area: string = 'Halifax',
  flow: FlowType = 'browse',
  properties?: PropertyData[]
) {
  // Step 1: get properties (placeholder or external)
  const props = properties?.length ? properties : getPropertiesForArea(area);

  // Step 2: compute market data
  const marketData = computeMarketData(props, area);

  // Step 3: run analyses
  const baseAnalysis = analyzeMarket(marketData);
  const flowInterpretation = interpretMarketForFlow(marketData, flow);
  const confidence = calculateConfidence(marketData);

  // Step 4: return structured result
  return {
    analysis: baseAnalysis,
    flowSpecific: flowInterpretation,
    confidence,
    metadata: {
      area,
      flow,
      generatedAt: new Date().toISOString(),
      dataSource: properties?.length ? 'external' : 'placeholder',
      isMockData: !properties?.length,
    },
  };
}
