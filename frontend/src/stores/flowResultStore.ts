// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';
// import type { FlowAnalysisOutput, FlowType } from '@/types/analysis.types';

// interface FlowResultState {
//   result: FlowAnalysisOutput | null;
//   flowType: FlowType | null;
//   setResult: (result: FlowAnalysisOutput, flowType: FlowType) => void;
//   clearResult: () => void;
// }

// export const useFlowResultStore = create<FlowResultState>()(
//   persist(
//     (set) => ({
//       result: null,
//       flowType: null,
//       setResult: (result, flowType) =>
//         set({ result, flowType }),
//       clearResult: () => set({ result: null, flowType: null }),
//     }),
//     {
//       name: 'flow-result-storage',
//       partialize: (state) => ({
//         result: state.result,
//         flowType: state.flowType,
//       }),
//     }
//   )
// );


export const one = 'two'