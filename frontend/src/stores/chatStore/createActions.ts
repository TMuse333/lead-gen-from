// stores/chatStore/createActions.ts - UNIFIED OFFER SYSTEM
import { ChatMessage, ChatStateActions, ChatState, Intent, OfferType } from './types';
import { LlmOutput } from '@/types/componentSchema';
import { GenerationDebugInfo } from './types';
import { createButtonClickHandler } from './actions/buttonClickHandler';
import { createSendMessageHandler } from './actions/sendMessageHandler';
import { getQuestionCount } from '@/lib/offers/unified';

export function createActions(
  set: (partial: Partial<ChatState> | ((state: ChatState) => Partial<ChatState>)) => void,
  get: () => ChatState
): ChatStateActions & Pick<ChatState, 'setLlmOutput' | 'setDebugInfo' | 'clearLlmOutput'> {

  return {
    // ==================== MESSAGE ACTIONS ====================
    addMessage: (message: ChatMessage) =>
      set((state) => ({ messages: [...state.messages, message] })),

    setLoading: (loading: boolean) => set({ loading }),

    // ==================== TRACKER ACTIONS ====================
    setShowTracker: (show: boolean) => set({ showTracker: show }),

    setCurrentInsight: (text: string) => {
      console.log('📝 Setting currentInsight:', text);
      set({ currentInsight: text });
    },

    setDbActivity: (text: string) => {
      console.log('📝 Setting dbActivity:', text);
      set({ dbActivity: text });
    },

    // ==================== MODAL ACTIONS ====================
    setShowContactModal: (show: boolean) => {
      console.log('📝 Setting showContactModal:', show);
      set({ showContactModal: show });
    },

    // ==================== OFFER ACTIONS ====================
    selectOffer: (offer: OfferType) => {
      set({
        selectedOffer: offer,
        // Legacy compatibility
        enabledOffers: [offer],
        useIntentSystem: true,
      });
      console.log(`[ChatStore] Offer selected: ${offer}`);
    },

    setIntent: (intent: Intent) => {
      set({
        currentIntent: intent,
        // Legacy compatibility
        currentFlow: intent,
      });
      console.log(`[ChatStore] Intent set to: ${intent}`);
    },

    // ==================== ANSWER ACTIONS ====================
    addAnswer: (key: string, value: string) => {
      set((state) => {
        const newUserInput = { ...state.userInput, [key]: value };
        // Remove from skipped fields if it was previously skipped
        const newSkippedFields = new Set(state.skippedFields);
        newSkippedFields.delete(key);

        // Calculate progress using unified offer system
        let totalQuestions = 6; // Default fallback
        if (state.selectedOffer && state.currentIntent) {
          totalQuestions = getQuestionCount(state.selectedOffer, state.currentIntent);
        }

        const progress = Math.round(
          (Object.keys(newUserInput).length / totalQuestions) * 100
        );

        console.log(`[ChatStore] Answer added → ${key}: "${value}"`);
        console.log(`[ChatStore] Progress: ${progress}%`);

        // First answer - show tracker
        if (Object.keys(newUserInput).length === 1 && !state.showTracker) {
          return { userInput: newUserInput, skippedFields: newSkippedFields, progress, showTracker: true };
        }

        // Second answer - celebrate (no confetti, just visual feedback)
        if (Object.keys(newUserInput).length === 2) {
          return {
            userInput: newUserInput,
            skippedFields: newSkippedFields,
            progress,
            showTracker: true,
            shouldCelebrate: true,
          };
        }

        return { userInput: newUserInput, skippedFields: newSkippedFields, progress };
      });
    },

    skipField: (mappingKey: string) => {
      set((state) => {
        const newSkippedFields = new Set(state.skippedFields);
        newSkippedFields.add(mappingKey);
        console.log(`[ChatStore] Field skipped → ${mappingKey}`);
        return { skippedFields: newSkippedFields };
      });
    },

    isFieldSkipped: (mappingKey: string) => {
      return get().skippedFields.has(mappingKey);
    },

    // ==================== PROGRESS ACTIONS ====================
    setProgress: (progress: number) => set({ progress }),

    setComplete: (complete: boolean) => {
      console.log('🎯 setComplete called with:', complete);
      set({ isComplete: complete });
    },

    clearCelebration: () => set({ shouldCelebrate: false }),

    // ==================== MAIN HANDLERS ====================
    handleButtonClick: createButtonClickHandler(set, get),
    sendMessage: createSendMessageHandler(set, get),

    // ==================== CONVERSATION TRACKING ====================
    setConversationId: (id: string | null) => {
      set({ conversationId: id });
    },

    createConversation: async () => {
      const state = get();
      const intent = state.currentIntent || state.currentFlow;

      if (!intent || state.messages.length === 0) {
        console.warn('[ChatStore] Cannot create conversation: missing intent or messages');
        return null;
      }

      try {
        const clientIdentifier = typeof window !== 'undefined'
          ? sessionStorage.getItem('clientId') || undefined
          : undefined;

        const response = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            flow: intent,
            offer: state.selectedOffer,
            messages: state.messages.map(msg => ({
              role: msg.role,
              content: msg.content,
              buttons: msg.buttons?.map(b => ({ label: b.label, value: b.value })),
              timestamp: msg.timestamp,
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
        const updateBody: Record<string, unknown> = {};

        if (updates.messages) {
          const existingCount = state.messages.length;
          const newMessages = updates.messages.slice(existingCount);
          if (newMessages.length > 0) {
            updateBody.messages = newMessages.map(msg => ({
              role: msg.role,
              content: msg.content,
              buttons: msg.buttons?.map(b => ({ label: b.label, value: b.value })),
              timestamp: msg.timestamp,
            }));
          }
        }

        if (updates.userInput) {
          updateBody.userInput = updates.userInput;
        }

        if (updates.answer) {
          updateBody.answer = {
            ...updates.answer,
            timestamp: new Date(),
          };
        }

        if (updates.status) {
          updateBody.status = updates.status;
        }

        if (updates.progress !== undefined) {
          updateBody.progress = updates.progress;
        }

        if (updates.currentQuestionId) {
          updateBody.currentQuestionId = updates.currentQuestionId;
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

    // ==================== LLM OUTPUT ACTIONS ====================
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

    // ==================== RESET ====================
    reset: async () => {
      const { initialState } = await import('./initialState');
      set(initialState);
    },

    updateInitialMessage: () => {
      const state = get();
      if (state.messages.length === 1 && state.messages[0].role === 'assistant') {
        import('./initialState').then(({ getInitialMessage }) => {
          const newMessage = getInitialMessage();
          set({ messages: [newMessage] });
        });
      }
    },

    // ==================== LEGACY ACTIONS (deprecated) ====================
    /** @deprecated Use selectOffer instead */
    setEnabledOffers: (offers: OfferType[]) => {
      set({ enabledOffers: offers });
      if (offers.length === 1) {
        set({ selectedOffer: offers[0] });
      }
      console.log(`[ChatStore] Enabled offers set:`, offers);
    },

    /** @deprecated Use setIntent instead */
    setCurrentIntent: (intent: Intent | null) => {
      set({ currentIntent: intent, currentFlow: intent });
      console.log(`[ChatStore] Intent set to: ${intent}`);
    },

    /** @deprecated Use setIntent instead */
    setCurrentFlow: (flow: 'sell' | 'buy' | 'browse' | null) => {
      set({ currentFlow: flow, currentIntent: flow });
    },

    /** @deprecated No longer needed - always true */
    setUseIntentSystem: (use: boolean) => {
      set({ useIntentSystem: use });
    },

    /** @deprecated Use currentQuestionId */
    setCurrentNode: (nodeId: string) => {
      set({ currentNodeId: nodeId, currentQuestionId: nodeId });
    },
  };
}
