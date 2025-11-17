// stores/chatStore/selectors.ts
import { ChatState } from './types';
import { LlmOutput } from '@/types/componentSchema';

export const selectMessages = (state: ChatState) => state.messages;
export const selectUserInput = (state: ChatState) => state.userInput;
export const selectLoading = (state: ChatState) => state.loading;
export const selectShowTracker = (state: ChatState) => state.showTracker;
export const selectProgress = (state: ChatState) => state.progress;
export const selectCurrentFlow = (state: ChatState) => state.currentFlow;
export const selectCurrentNode = (state: ChatState) => state.currentNodeId;
export const selectIsComplete = (state: ChatState) => state.isComplete;

// LLM output selectors
export const selectLlmOutput = (state: ChatState) => state.llmOutput;
export const selectLlmOutputPartial = (state: ChatState): Partial<LlmOutput> | null =>
  state.llmOutput ? (state.llmOutput as Partial<LlmOutput>) : null;

// Debug info selector
export const selectDebugInfo = (state: ChatState) => state.debugInfo;