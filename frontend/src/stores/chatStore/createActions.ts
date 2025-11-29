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

    // === CONVERSATION TRACKING ===
    setConversationId: (id: string | null) => {
      set({ conversationId: id });
    },

    createConversation: async () => {
      const state = get();
      if (!state.currentFlow || state.messages.length === 0) {
        console.warn('[ChatStore] Cannot create conversation: missing flow or messages');
        return null;
      }

      try {
        // Get client identifier if available
        const clientIdentifier = typeof window !== 'undefined' 
          ? sessionStorage.getItem('clientId') || undefined
          : undefined;

        const response = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            flow: state.currentFlow,
            messages: state.messages.map(msg => ({
              role: msg.role,
              content: msg.content,
              buttons: msg.buttons?.map(b => ({ label: b.label, value: b.value })),
              timestamp: msg.timestamp,
              questionId: msg.visual?.value, // Store questionId if available
            })),
            userInput: state.userInput,
            clientIdentifier,
            sessionId: typeof window !== 'undefined' ? sessionStorage.getItem('sessionId') || undefined : undefined,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to create conversation: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.success && data._id) {
          set({ conversationId: data._id });
          console.log('[ChatStore] Conversation created:', data._id);
          return data._id;
        }
        return null;
      } catch (error) {
        console.error('[ChatStore] Error creating conversation:', error);
        return null;
      }
    },

    updateConversation: async (updates) => {
      const state = get();
      if (!state.conversationId) {
        console.warn('[ChatStore] Cannot update conversation: no conversationId');
        return;
      }

      try {
        const updateBody: any = {};

        if (updates.messages) {
          // Only send new messages (not all messages)
          const existingCount = state.messages.length;
          const newMessages = updates.messages.slice(existingCount);
          if (newMessages.length > 0) {
            updateBody.messages = newMessages.map(msg => ({
              role: msg.role,
              content: msg.content,
              buttons: msg.buttons?.map(b => ({ label: b.label, value: b.value })),
              timestamp: msg.timestamp,
              questionId: msg.visual?.value,
            }));
          }
        }

        if (updates.userInput) {
          updateBody.userInput = updates.userInput;
        }

        if (updates.status) {
          updateBody.status = updates.status;
        }

        if (updates.progress !== undefined) {
          updateBody.progress = updates.progress;
        }

        if (updates.currentNodeId) {
          updateBody.currentNodeId = updates.currentNodeId;
        }

        const response = await fetch(`/api/conversations/${state.conversationId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateBody),
        });

        if (!response.ok) {
          throw new Error(`Failed to update conversation: ${response.statusText}`);
        }

        console.log('[ChatStore] Conversation updated');
      } catch (error) {
        console.error('[ChatStore] Error updating conversation:', error);
      }
    },

    // === RESET ===
    reset: async () => {
      const { initialState } = await import('./initialState');
      set(initialState);
    },
  };
}