// src/hooks/useSeedResult.ts
import { useEffect } from 'react';
import { useFlowResultStore } from '@/stores/flowResultStore';
import type { FlowAnalysisOutput, FlowType } from '@/types/analysis.types';

interface SeedData {
  flowType: FlowType;
  analysis: any;
  comparableHomes?: any[];
  marketTrends?: any;
  agentAdvice?: any[];
  formConfig?: any;
  leadId?: string;
}

export const useSeedResult = (data: SeedData) => {
  const { setResult } = useFlowResultStore();

  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== 'development') return;

    const result: FlowAnalysisOutput = {
      flowType: data.flowType,
      analysis: data.analysis,
      comparableHomes: data.comparableHomes ?? [],
      marketTrends: data.marketTrends ?? null,
      agentAdvice: data.agentAdvice ?? [],
      formConfig: data.formConfig ?? null,
      leadId: data.leadId,
      generatedAt: new Date(),
    };

    setResult(result, data.flowType);
    console.log('DEV: Seeded result for', data.flowType, result);
  }, [data, setResult]);
};