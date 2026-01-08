// stores/chatStore/buttonClickHandler.ts - UNIFIED OFFER SYSTEM
import { ChatMessage, ChatState, Intent, OfferType } from '../types';
import { ButtonOption } from '@/types/conversation.types';
import {
  getOffer,
  getNextQuestion,
  getFirstQuestion,
  getQuestion,
  isComplete,
  getProgress,
  isValidOfferType,
  isValidIntent,
  ALL_OFFER_TYPES,
} from '@/lib/offers/unified';

export function createButtonClickHandler(
  set: (partial: Partial<ChatState> | ((state: ChatState) => Partial<ChatState>)) => void,
  get: () => ChatState
) {
  return async (button: ButtonOption) => {
    const state = get();

    // ==================== HANDLE OFFER SELECTION ====================
    if (isValidOfferType(button.value)) {
      const selectedOffer = button.value as OfferType;
      const offer = getOffer(selectedOffer);

      if (!offer) {
        console.error('❌ [ButtonHandler] Offer not found in registry:', selectedOffer);
        return;
      }

      // Set the selected offer in store
      set({
        selectedOffer,
        currentQuestionId: 'intent-selection',
        enabledOffers: [selectedOffer],
        useIntentSystem: true,
        currentNodeId: 'intent-selection',
      });

      // Verify state was set
      const verifyState = get();
      console.log('✅ [ButtonHandler] OFFER SELECTED:', selectedOffer);
      console.log('   Store now has selectedOffer:', verifyState.selectedOffer);

      // Add user's offer selection message
      const userMsg: ChatMessage = {
        role: 'user',
        content: button.label,
        timestamp: new Date(),
      };
      set((s) => ({ messages: [...s.messages, userMsg] }));

      // Show intent selection with only supported intents
      const intentButtons = offer.supportedIntents.map(intent => {
        const labels: Record<Intent, { label: string; icon: string }> = {
          buy: { label: "I'm buying", icon: '🔑' },
          sell: { label: "I'm selling", icon: '🏠' },
          browse: { label: 'Just browsing', icon: '👀' },
        };
        const { label, icon } = labels[intent];
        return { id: intent, label: `${icon} ${label}`, value: intent };
      });

      const intentQuestion: ChatMessage = {
        role: 'assistant',
        content: "Great choice! To personalize this for you, what are you looking to do?",
        buttons: intentButtons,
        timestamp: new Date(),
      };
      set((s) => ({ messages: [...s.messages, intentQuestion] }));

      return;
    }

    // ==================== HANDLE INTENT SELECTION ====================
    if (isValidIntent(button.value)) {
      const selectedIntent = button.value as Intent;
      const { selectedOffer } = state;

      if (!selectedOffer) {
        console.error('[ButtonHandler] No offer selected when setting intent');
        return;
      }

      console.log('[ButtonHandler] Intent selected:', selectedIntent);

      // Set intent
      set({
        currentIntent: selectedIntent,
        // Legacy compatibility
        currentFlow: selectedIntent,
      });

      // Add intent to userInput
      const { addAnswer } = get();
      addAnswer('intent', selectedIntent);

      // Add user message
      const userMsg: ChatMessage = {
        role: 'user',
        content: button.label,
        timestamp: new Date(),
      };
      set((s) => ({ messages: [...s.messages, userMsg] }));

      // Create conversation
      const { createConversation } = get();
      await createConversation();

      // Get first question from unified offer
      const firstQuestion = getFirstQuestion(selectedOffer, selectedIntent);
      console.log('[ButtonHandler] First question:', firstQuestion?.id);

      if (firstQuestion) {
        // Convert Question to ChatMessage format
        const aiMsg: ChatMessage = {
          role: 'assistant',
          content: firstQuestion.text,
          buttons: firstQuestion.buttons?.map(b => ({
            id: b.id,
            label: b.label,
            value: b.value,
          })),
          timestamp: new Date(),
        };
        set((s) => ({
          messages: [...s.messages, aiMsg],
          currentQuestionId: firstQuestion.id,
          // Legacy compatibility
          currentNodeId: firstQuestion.id,
        }));

        // Update conversation
        const { updateConversation } = get();
        await updateConversation({
          messages: get().messages,
          currentQuestionId: firstQuestion.id,
        });
      }

      return;
    }

    // ==================== HANDLE REGULAR ANSWER ====================
    const { selectedOffer, currentIntent, currentQuestionId } = state;

    if (!selectedOffer || !currentIntent || !currentQuestionId) {
      console.warn('[ButtonHandler] Missing state for answer:', { selectedOffer, currentIntent, currentQuestionId });
      return;
    }

    // Get current question from unified registry
    const currentQuestion = getQuestion(selectedOffer, currentIntent, currentQuestionId);

    if (!currentQuestion?.mappingKey) {
      console.warn('[ButtonHandler] No mappingKey for question:', currentQuestionId);
      return;
    }

    // Add user message
    const userMsg: ChatMessage = {
      role: 'user',
      content: button.label,
      timestamp: new Date(),
    };
    set((s) => ({ messages: [...s.messages, userMsg], loading: true }));

    // Save answer
    const { addAnswer, updateConversation } = get();
    addAnswer(currentQuestion.mappingKey, button.value);

    // Update conversation with answer
    await updateConversation({
      messages: get().messages,
      userInput: { ...get().userInput, [currentQuestion.mappingKey]: button.value },
      progress: get().progress,
      currentQuestionId,
      answer: {
        questionId: currentQuestionId,
        mappingKey: currentQuestion.mappingKey,
        value: button.value,
        answeredVia: 'button',
      },
    });

    // Apply tracker feedback from button
    const clickedButton = currentQuestion.buttons?.find(b => b.value === button.value);
    if (clickedButton?.tracker) {
      if (clickedButton.tracker.insight) {
        set({ currentInsight: clickedButton.tracker.insight });
      }
      if (clickedButton.tracker.dbMessage) {
        set({ dbActivity: clickedButton.tracker.dbMessage });
      }
    }

    try {
      console.log('📞 Calling /api/chat/smart for button click...');

      const response = await fetch('/api/chat/smart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buttonId: button.id,
          buttonValue: button.value,
          buttonLabel: button.label,
          selectedOffer,
          currentIntent,
          currentQuestionId,
          userInput: get().userInput,
          messages: state.messages.slice(-5),
          questionConfig: currentQuestion,
        }),
      });

      const data = await response.json();
      console.log('✅ API response received:', data);

      // Handle extracted answer
      if (data.extracted) {
        get().addAnswer(data.extracted.mappingKey, data.extracted.value);
      }

      // Get updated state
      const updatedState = get();

      // Check completion using unified system
      const isNowComplete = isComplete(selectedOffer, currentIntent, updatedState.userInput);

      if (isNowComplete) {
        console.log('🎉 FLOW COMPLETE! Setting isComplete = true');
        set({
          isComplete: true,
          shouldCelebrate: true,
          progress: 100,
        });
      } else {
        // Get next question from unified registry
        const nextQuestion = getNextQuestion(selectedOffer, currentIntent, currentQuestionId);

        if (nextQuestion) {
          // Check if this question should trigger contact modal instead of chat
          if (nextQuestion.triggersContactModal) {
            console.log('📧 Next question triggers contact modal:', nextQuestion.id);
            set({
              showContactModal: true,
              currentQuestionId: nextQuestion.id,
              currentNodeId: nextQuestion.id,
            });
            // Update progress
            const newProgress = getProgress(selectedOffer, currentIntent, updatedState.userInput);
            set({ progress: newProgress });
          } else {
            const aiMsg: ChatMessage = {
              role: 'assistant',
              content: data.reply || nextQuestion.text,
              buttons: nextQuestion.buttons?.map(b => ({
                id: b.id,
                label: b.label,
                value: b.value,
              })),
              timestamp: new Date(),
            };
            set((s) => ({
              messages: [...s.messages, aiMsg],
              currentQuestionId: nextQuestion.id,
              currentNodeId: nextQuestion.id,
            }));

            // Update progress
            const newProgress = getProgress(selectedOffer, currentIntent, updatedState.userInput);
            set({ progress: newProgress });
          }
        } else {
          // No next question means complete
          console.log('🎉 No next question! Setting isComplete = true');
          set({ isComplete: true, shouldCelebrate: true, progress: 100 });
        }
      }

    } catch (error) {
      console.error('❌ API call failed, using fallback:', error);

      // Fallback: get next question locally
      const updatedState = get();
      const isNowComplete = isComplete(selectedOffer, currentIntent, updatedState.userInput);

      if (isNowComplete) {
        console.log('🎉 FLOW COMPLETE (fallback)! Setting isComplete = true');
        set({
          isComplete: true,
          shouldCelebrate: true,
          progress: 100,
        });
      } else {
        const nextQuestion = getNextQuestion(selectedOffer, currentIntent, currentQuestionId);

        if (nextQuestion) {
          // Check if this question should trigger contact modal instead of chat
          if (nextQuestion.triggersContactModal) {
            console.log('📧 Next question triggers contact modal (fallback):', nextQuestion.id);
            set({
              showContactModal: true,
              currentQuestionId: nextQuestion.id,
              currentNodeId: nextQuestion.id,
            });
            const newProgress = getProgress(selectedOffer, currentIntent, updatedState.userInput);
            set({ progress: newProgress });
          } else {
            const aiMsg: ChatMessage = {
              role: 'assistant',
              content: nextQuestion.text,
              buttons: nextQuestion.buttons?.map(b => ({
                id: b.id,
                label: b.label,
                value: b.value,
              })),
              timestamp: new Date(),
            };
            set((s) => ({
              messages: [...s.messages, aiMsg],
              currentQuestionId: nextQuestion.id,
              currentNodeId: nextQuestion.id,
            }));

            const newProgress = getProgress(selectedOffer, currentIntent, updatedState.userInput);
            set({ progress: newProgress });
          }
        } else {
          console.log('🎉 No next question (fallback)! Setting isComplete = true');
          set({ isComplete: true, shouldCelebrate: true, progress: 100 });
        }
      }
    } finally {
      set({ loading: false });
    }
  };
}
