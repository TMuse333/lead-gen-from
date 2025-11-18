// stores/chatStore/actions.ts - REFACTORED & CLEAN
import confetti from 'canvas-confetti';
import { ChatMessage, ChatStateActions, ChatState } from './types';
import { LlmOutput } from '@/types/componentSchema';
import { GenerationDebugInfo } from './types';
import { getTotalQuestions } from './flowHelpers';
import { createButtonClickHandler } from './actions/buttonClickHandler';
import { createSendMessageHandler } from './actions/sendMessageHandler';

export function createActions(
  set: (partial: Partial<ChatState> | ((state: ChatState) => Partial<ChatState>)) => void,
  get: () => ChatState
): ChatStateActions & Pick<ChatState, 'setLlmOutput' | 'setDebugInfo' | 'clearLlmOutput'> {
  
  return {
    // === MESSAGE ACTIONS ===
    addMessage: (message: ChatMessage) =>
      set((state) => ({ messages: [...state.messages, message] })),

    // === TRACKER ACTIONS ===
    setCurrentInsight: (text: string) => {
      console.log('📝 Setting currentInsight:', text);
      set({ currentInsight: text });
    },
    
    setDbActivity: (text: string) => {
      console.log('📝 Setting dbActivity:', text);
      set({ dbActivity: text });
    },

    // === ANSWER TRACKING ===
    addAnswer: (key: string, value: string) => {
      set((state) => {
        const newUserInput = { ...state.userInput, [key]: value };
        const totalQuestions = state.currentFlow 
          ? getTotalQuestions(state.currentFlow)
          : 6;
        const progress = Math.round(
          (Object.keys(newUserInput).length / totalQuestions) * 100
        );

        console.log(`[ChatStore] Answer added → ${key}: "${value}"`);
        console.log(`[ChatStore] Progress: ${progress}%`);

        // First answer - show tracker
        if (Object.keys(newUserInput).length === 1 && !state.showTracker) {
          return { userInput: newUserInput, progress, showTracker: true };
        }

        // Second answer - celebrate
        if (Object.keys(newUserInput).length === 2) {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          return {
            userInput: newUserInput,
            progress,
            showTracker: true,
            shouldCelebrate: true,
          };
        }

        return { userInput: newUserInput, progress };
      });
    },

    // === MAIN HANDLERS (imported from separate files) ===
    handleButtonClick: createButtonClickHandler(set, get),
    sendMessage: createSendMessageHandler(set, get),

    // === SIMPLE SETTERS ===
    setLoading: (loading: boolean) => set({ loading }),
    setShowTracker: (show: boolean) => set({ showTracker: show }),
    setCurrentFlow: (flow: 'sell' | 'buy' | 'browse' | null) => set({ currentFlow: flow }),
    setCurrentNode: (nodeId: string) => set({ currentNodeId: nodeId }),
    setProgress: (progress: number) => set({ progress }),
    clearCelebration: () => set({ shouldCelebrate: false }),
    setComplete: (complete: boolean) => {
      console.log('🎯 setComplete called with:', complete);
      set({ isComplete: complete });
    },
    
    // === LLM OUTPUT ACTIONS ===
    setLlmOutput: (data: LlmOutput | Partial<LlmOutput>) => {
      set((state) => {
        const current = state.llmOutput || {};
        const updated = { ...current, ...data } as LlmOutput;
        console.log('[ChatStore] llmOutput updated:', updated);
        return { llmOutput: updated };
      });
    },

    setDebugInfo: (info: GenerationDebugInfo) => {
      console.log('[ChatStore] Debug info updated:', info);
      set({ debugInfo: info });
    },

    clearLlmOutput: () => set({ llmOutput: null, debugInfo: null }),

    // === RESET ===
    reset: async () => {
      const { initialState } = await import('./initialState');
      set(initialState);
    },
  };
}