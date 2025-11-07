'use client';


// import NextSteps from './NextSteps';
// import EstimatedValueSection from './EstimatedValueSection';
// import ComparableHomesSection from './ComparableHomesSection';
// import MarketTrendsSection from './MarketTrendsSection';
// import AgentAdviceSection from './AgentAdviceSection';
// import BuyerExtrasSection from './BuyerExtrasSection';
// import BrowseExtrasSection from './BrowseExtrasSection';

import type { FlowAnalysisOutput, FlowType } from '@/types/analysis.types';
import { flowConfigs } from '@/lib/config/flowConfig';
import { HeroBanner } from './herobanner';
import { useSeedResult } from '@/lib/hooks/useSeedResult';

interface ResultLayoutProps {
  flowType: FlowType;
  output: FlowAnalysisOutput;
}

export default function ResultLayout({ flowType, output }: ResultLayoutProps) {


  // const sellData = {
  //   flowType: 'sell' as const,
  //   analysis: {
  //     estimatedValue: { low: 460000, high: 520000, confidence: 0.92 },
  //     marketSummary: 'Halifax single-family homes are up 3.2% YoY with strong demand in South End.',
  //     personalizedAdvice: 'You are looking to upsize within the next 6-12 months…',
  //     recommendedActions: ['Declutter', 'Stage', 'List in spring'],
  //     comparablesSummary: 'Three similar homes sold between $475K–$510K in the last 60 days.',
  //   },
  //   comparableHomes: [
  //     { id: '1', address: '123 Spring Garden Rd', price: 485000, beds: 3, baths: 2 },
  //     { id: '2', address: '456 Quinpool Rd', price: 498000, beds: 3, baths: 2 },
  //     { id: '3', address: '789 South St', price: 510000, beds: 4, baths: 3 },
  //   ],
  //   leadId: 'dev-sell-001',
  // };

  // useSeedResult(sellData)



  // const config = flowConfigs[flowType];
  // const { analysis, formConfig } = output;
  // const rc = config.resultConfig;

  // console.log('output',output)
  // console.log('rc',rc)
  // console.log('analysis',analysis)
  // console.log('formconfig',formConfig)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 text-center">
        <p className="text-sm text-gray-600">
          {/* Report for {formConfig.branding.agentName} */}
        </p>
      </header>

  

      <footer className="text-center py-6 text-xs text-gray-500">
        Generated on {new Date(output.generatedAt).toLocaleDateString()}
      </footer>
    </div>
  );
}