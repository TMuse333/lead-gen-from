import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FlowAnalysisOutput } from '@/types/analysis.types';

interface FlowResultState {
  result: FlowAnalysisOutput | null;
  setResult: (result: FlowAnalysisOutput) => void;
  clearResult: () => void;

  // optional helpers for quick access
  flowType?: string;
  leadId?: string;
}

export const useFlowResultStore = create<FlowResultState>()(
  persist(
    (set, get) => ({
      result: null,

      setResult: (result) =>
        set({
          result,
          flowType: result.flowType,
          leadId: result.leadId,
        }),

      clearResult: () => set({ result: null, flowType: undefined, leadId: undefined }),
    }),
    {
      name: 'flow-result-storage', // localStorage key
      partialize: (state) => ({
        result: state.result,
        flowType: state.flowType,
        leadId: state.leadId,
      }),
    }
  )
);
