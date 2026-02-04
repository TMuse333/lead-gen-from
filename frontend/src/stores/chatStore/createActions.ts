// stores/chatStore/createActions.ts - STATE MACHINE + LEGACY HANDLERS
import { ChatMessage, ChatStateActions, ChatState, Intent, OfferType } from './types';
import { LlmOutput } from '@/types/componentSchema';
import { GenerationDebugInfo } from './types';
import { createButtonClickHandler } from './actions/buttonClickHandler';
import { createSendMessageHandler } from './actions/sendMessageHandler';
import { createStateMachineMessageHandler } from './actions/stateMachineMessageHandler';
import { createStateMachineButtonHandler } from './actions/stateMachineButtonHandler';
import { fetchQuestionsForFlow } from '@/lib/chat/questionProvider';
import { fetchStateMachineConfig } from '@/lib/stateMachine/provider';
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
    // These dispatch to state machine handlers when SM is active,
    // otherwise fall back to the legacy handlers.
    handleButtonClick: (() => {
      const legacyHandler = createButtonClickHandler(set, get);
      const smHandler = createStateMachineButtonHandler(set, get);
      return async (button: import('@/types/conversation.types').ButtonOption) => {
        const state = get();
        // Use state machine handler if config is loaded AND we're past intent selection
        // (intent selection buttons should still go through legacy handler)
        const isIntentOrOffer = ['buy', 'sell', 'browse', 'real-estate-timeline', 'pdf', 'video', 'home-estimate'].includes(button.value);
        if (state.stateMachineConfig && state.currentStateId && !isIntentOrOffer) {
          return smHandler(button);
        }
        return legacyHandler(button);
      };
    })(),
    sendMessage: (() => {
      const legacyHandler = createSendMessageHandler(set, get);
      const smHandler = createStateMachineMessageHandler(set, get);
      return async (message: string, displayText?: string) => {
        const state = get();
        // Use state machine handler if config is loaded AND we have an active state
        if (state.stateMachineConfig && state.currentStateId && state.currentIntent) {
          return smHandler(message, displayText);
        }
        return legacyHandler(message, displayText);
      };
    })(),

    // ==================== CONVERSATION TRACKING ====================
    setConversationId: (id: string | null) => {
      set({ conversationId: id });
    },

    createConversation: async () => {
      const state = get();
      const intent = state.currentIntent || state.currentFlow;

      console.log('[ChatStore] createConversation called:', {
        intent,
        currentIntent: state.currentIntent,
        currentFlow: state.currentFlow,
        messageCount: state.messages.length,
        existingConversationId: state.conversationId,
      });

      if (!intent || state.messages.length === 0) {
        console.warn('[ChatStore] Cannot create conversation: missing intent or messages');
        return null;
      }

      // Skip if conversation already exists
      if (state.conversationId) {
        console.log('[ChatStore] Conversation already exists:', state.conversationId);
        return state.conversationId;
      }

      try {
        const clientIdentifier = typeof window !== 'undefined'
          ? sessionStorage.getItem('clientId') || undefined
          : undefined;

        // Get visitor tracking data from session storage
        let visitorData = undefined;
        if (typeof window !== 'undefined') {
          const visitorDataStr = sessionStorage.getItem('visitorData');
          if (visitorDataStr) {
            try {
              visitorData = JSON.parse(visitorDataStr);
            } catch (e) {
              console.warn('[ChatStore] Failed to parse visitor data:', e);
            }
          }
        }

        // Detect environment based on hostname (localhost = test, otherwise production)
        const environment: 'test' | 'production' = typeof window !== 'undefined' &&
          (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
          ? 'test'
          : 'production';

        console.log('[ChatStore] Creating conversation with clientIdentifier:', clientIdentifier, 'environment:', environment, 'visitorData:', visitorData?.visitorId);

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
            visitorData, // Include visitor tracking data
            environment, // Mark as test or production
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to create conversation: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.success && data._id) {
          // Set conversation ID and mark all current messages as synced
          set({ conversationId: data._id, lastSyncedMessageCount: state.messages.length });
          console.log('[ChatStore] Conversation created:', data._id, 'with', state.messages.length, 'messages synced');
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
          console.log('[ChatStore updateConversation] Messages check:', {
            updatesMessagesLength: updates.messages.length,
            stateMessagesLength: state.messages.length,
            lastSyncedCount: state.lastSyncedMessageCount || 0,
          });

          // Use lastSyncedMessageCount to track what we've already sent to the server
          const lastSyncedCount = state.lastSyncedMessageCount || 0;
          const newMessages = updates.messages.slice(lastSyncedCount);

          console.log('[ChatStore updateConversation] New messages to send:', newMessages.length);

          if (newMessages.length > 0) {
            updateBody.messages = newMessages.map(msg => ({
              role: msg.role,
              content: msg.content,
              buttons: msg.buttons?.map(b => ({ label: b.label, value: b.value })),
              timestamp: msg.timestamp,
            }));
            // Update the synced count after we build the update body
            set({ lastSyncedMessageCount: updates.messages.length });
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

        if (updates.contactModal) {
          updateBody.contactModal = updates.contactModal;
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

    // ==================== STATE MACHINE ACTIONS ====================
    loadStateMachineConfig: async (flow: Intent, clientId?: string) => {
      try {
        console.log(`[ChatStore] Loading state machine config for ${flow}`);
        const config = await fetchStateMachineConfig(flow, clientId);
        if (config) {
          set({
            stateMachineConfig: config,
            currentStateId: config.initialStateId,
            stateHistory: [config.initialStateId],
            stateMachineLoaded: true,
          });
          console.log(`[ChatStore] State machine loaded: ${config.states.length} states, initial: ${config.initialStateId}`);
        } else {
          console.warn(`[ChatStore] No state machine config available for ${flow}`);
          set({ stateMachineLoaded: true });
        }
      } catch (error) {
        console.error(`[ChatStore] Failed to load state machine config:`, error);
        set({ stateMachineLoaded: true });
      }
    },

    setCurrentStateId: (stateId: string) => {
      set((s) => ({
        currentStateId: stateId,
        currentQuestionId: stateId,
        currentNodeId: stateId,
        stateHistory: [...s.stateHistory, stateId],
      }));
    },

    incrementStateAttempt: (stateId: string) => {
      set((s) => ({
        stateAttempts: {
          ...s.stateAttempts,
          [stateId]: (s.stateAttempts[stateId] || 0) + 1,
        },
      }));
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
