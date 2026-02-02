// stores/chatStore/createActions.ts - MONGODB QUESTIONS (NO FALLBACKS)
import { ChatMessage, ChatStateActions, ChatState, Intent, OfferType } from './types';
import { LlmOutput } from '@/types/componentSchema';
import { GenerationDebugInfo } from './types';
import { createButtonClickHandler } from './actions/buttonClickHandler';
import { createSendMessageHandler } from './actions/sendMessageHandler';
import { fetchQuestionsForFlow } from '@/lib/chat/questionProvider';
import type { TimelineFlow, CustomQuestion } from '@/types/timelineBuilder.types';

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

        // Calculate progress using questions from MongoDB (single source of truth)
        let totalQuestions = 1; // Minimum to avoid division by zero
        let validMappingKeys: Set<string> = new Set();

        if (state.currentIntent) {
          // Use questions loaded from MongoDB - NO FALLBACK to hardcoded
          const customQuestions = state.flowQuestions[state.currentIntent as TimelineFlow];
          if (customQuestions && customQuestions.length > 0) {
            // Get all valid mappingKeys from questions (use id as fallback)
            validMappingKeys = new Set(
              customQuestions.map(q => q.mappingKey || q.id).filter(Boolean) as string[]
            );
            totalQuestions = validMappingKeys.size || 1;
          } else {
            // Questions not loaded yet - keep progress at 0 until they load
            console.warn('[ChatStore] Questions not loaded from MongoDB yet');
          }
        }

        // Count only answers that match actual question mappingKeys
        // Exclude metadata like 'intent', 'flow', 'contactName', 'contactEmail', etc.
        const metadataKeys = new Set(['intent', 'flow', 'contactName', 'contactEmail', 'contactPhone', 'email']);
        const answeredCount = Object.keys(newUserInput).filter(k => {
          // If we have valid mappingKeys from MongoDB, only count those
          if (validMappingKeys.size > 0) {
            return validMappingKeys.has(k);
          }
          // Otherwise, exclude known metadata keys
          return !metadataKeys.has(k);
        }).length;

        const progress = Math.min(Math.round((answeredCount / totalQuestions) * 100), 100);

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

    // ==================== QUESTION ACTIONS ====================
    loadQuestionsForFlow: async (flow: TimelineFlow, clientId?: string) => {
      try {
        const questions = await fetchQuestionsForFlow(flow, clientId);
        set((state) => ({
          flowQuestions: {
            ...state.flowQuestions,
            [flow]: questions,
          },
        }));
        console.log(`[ChatStore] Loaded ${questions.length} questions for ${flow} flow`);
      } catch (error) {
        console.error(`[ChatStore] Failed to load questions for ${flow}:`, error);
      }
    },

    loadAllQuestions: async (clientId?: string) => {
      const flows: TimelineFlow[] = ['buy', 'sell']; // browse commented out for MVP
      await Promise.all(
        flows.map(flow => fetchQuestionsForFlow(flow, clientId))
      ).then((results) => {
        const flowQuestions: Partial<Record<TimelineFlow, CustomQuestion[]>> = {};
        flows.forEach((flow, i) => {
          flowQuestions[flow] = results[i];
        });
        set({ flowQuestions, questionsLoaded: true });
        console.log('[ChatStore] All questions loaded');
      }).catch((error) => {
        console.error('[ChatStore] Failed to load questions:', error);
        set({ questionsLoaded: true }); // Mark as loaded even on error to prevent infinite loops
      });
    },

    getQuestionsForCurrentIntent: () => {
      const state = get();
      const intent = state.currentIntent as TimelineFlow | null;
      if (!intent) return [];
      return state.flowQuestions[intent] || [];
    },

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
