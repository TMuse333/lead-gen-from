// stores/chatStore/buttonClickHandler.ts - MONGODB QUESTIONS
import { ChatMessage, ChatState, Intent, OfferType } from '../types';
import { ButtonOption } from '@/types/conversation.types';
import {
  getOffer,
  isValidOfferType,
  isValidIntent,
} from '@/lib/offers/unified';
import {
  getFirstQuestion,
  getNextQuestion,
  getQuestionById,
  isFlowComplete,
  calculateProgress,
  convertButtons,
  getBotQuestions,
} from '@/lib/chat/questionProvider';
import type { TimelineFlow, CustomQuestion } from '@/types/timelineBuilder.types';

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

      // Show intent selection with only supported intents (excluding browse for MVP)
      const intentButtons = offer.supportedIntents
        .filter(intent => intent !== 'browse') // Remove browse option
        .map(intent => {
          const labels: Record<Intent, { label: string; icon: string }> = {
            buy: { label: "I'm looking to buy", icon: '🔑' },
            sell: { label: "I'm looking to sell", icon: '🏠' },
            browse: { label: 'Just browsing', icon: '👀' }, // Keep for type safety
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
      let { selectedOffer, loadQuestionsForFlow } = get();

      // MVP: Auto-select timeline offer if no offer selected yet
      if (!selectedOffer) {
        const defaultOffer: OfferType = 'real-estate-timeline';
        console.log('[ButtonHandler] Auto-selecting default offer for MVP:', defaultOffer);

        set({
          selectedOffer: defaultOffer,
          enabledOffers: [defaultOffer],
          useIntentSystem: true,
        });

        selectedOffer = defaultOffer;
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

      // Load questions for this flow from MongoDB
      const clientId = typeof window !== 'undefined'
        ? sessionStorage.getItem('clientId') || undefined
        : undefined;

      await loadQuestionsForFlow(selectedIntent as TimelineFlow, clientId);

      // Get questions from store and filter to only those linked to phases
      const updatedState = get();
      const allQuestions = updatedState.flowQuestions[selectedIntent as TimelineFlow] || [];
      const questions = getBotQuestions(allQuestions);

      console.log(`[ButtonHandler] 📋 Bot questions for ${selectedIntent}: ${questions.length} (from ${allQuestions.length} total)`);
      if (questions.length > 0) {
        questions.forEach((q, i) => {
          console.log(`  ${i + 1}. ${q.id} | type: ${q.inputType} | buttons: ${q.buttons?.length || 0}`);
          if (q.buttons) {
            q.buttons.forEach(b => console.log(`      - ${b.label} (${b.value})`));
          }
        });
      } else {
        console.warn('[ButtonHandler] ⚠️ NO QUESTIONS in store! Check if loadQuestionsForFlow succeeded');
      }

      // Get first question
      const firstQuestion = getFirstQuestion(questions);
      console.log('[ButtonHandler] First question from MongoDB:', firstQuestion?.id);
      if (firstQuestion) {
        console.log('[ButtonHandler] First question details:', {
          id: firstQuestion.id,
          question: firstQuestion.question,
          inputType: firstQuestion.inputType,
          buttons: firstQuestion.buttons?.map(b => b.label),
          mappingKey: firstQuestion.mappingKey,
        });
      }

      if (firstQuestion) {
        // Convert CustomQuestion to ChatMessage format
        const aiMsg: ChatMessage = {
          role: 'assistant',
          content: firstQuestion.question,
          buttons: convertButtons(firstQuestion),
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
    const { selectedOffer, currentIntent, currentQuestionId, flowQuestions } = state;

    if (!selectedOffer || !currentIntent || !currentQuestionId) {
      console.warn('[ButtonHandler] Missing state for answer:', { selectedOffer, currentIntent, currentQuestionId });
      return;
    }

    // Get questions from store and filter to only those linked to phases
    const allQuestions = flowQuestions[currentIntent as TimelineFlow] || [];
    const questions = getBotQuestions(allQuestions);

    // Get current question from stored questions
    const currentQuestion = getQuestionById(questions, currentQuestionId);

    if (!currentQuestion) {
      console.warn('[ButtonHandler] Question not found:', currentQuestionId);
      return;
    }

    // Use mappingKey if available, otherwise fall back to question id
    const mappingKey = currentQuestion.mappingKey || currentQuestion.id;
    if (!mappingKey) {
      console.error('[ButtonHandler] Question has neither mappingKey nor id - this should never happen:', currentQuestionId);
      return;
    }

    // Log when using id as fallback (helps identify questions needing migration)
    if (!currentQuestion.mappingKey) {
      console.log('[ButtonHandler] Using question id as mappingKey fallback:', currentQuestion.id);
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
    addAnswer(mappingKey, button.value);

    // Update conversation with answer
    await updateConversation({
      messages: get().messages,
      userInput: { ...get().userInput, [mappingKey]: button.value },
      progress: get().progress,
      currentQuestionId,
      answer: {
        questionId: currentQuestionId,
        mappingKey,
        value: button.value,
        answeredVia: 'button',
      },
    });

    // Apply tracker feedback from button (if button has tracker info)
    const clickedButton = currentQuestion.buttons?.find(b => b.value === button.value);
    // Note: CustomQuestion buttons don't have tracker info by default,
    // but we could add this later if needed

    try {
      console.log('📞 Calling /api/chat/smart for button click...');

      // Get next question for LLM context (before API call!)
      const nextQuestionForContext = getNextQuestion(questions, currentQuestionId);
      console.log('[ButtonHandler] Next question for context:', nextQuestionForContext?.id, nextQuestionForContext?.question);

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
          nextQuestionConfig: nextQuestionForContext, // Send next question for LLM context
        }),
      });

      const data = await response.json();
      console.log('✅ API response received:', data);

      // Handle extracted answer
      if (data.extracted) {
        get().addAnswer(data.extracted.mappingKey, data.extracted.value);
      }

      // Get updated state and filter to bot questions only
      const updatedState = get();
      const updatedAllQuestions = updatedState.flowQuestions[currentIntent as TimelineFlow] || [];
      const updatedQuestions = getBotQuestions(updatedAllQuestions);

      // Check completion using filtered bot questions (only those linked to phases)
      const isNowComplete = isFlowComplete(updatedQuestions, updatedState.userInput);

      // Get next question from stored questions
      const nextQuestion = getNextQuestion(updatedQuestions, currentQuestionId);

      // CRITICAL UX RULE: Contact modal MUST appear at the end of all questions
      // Show contact modal when: flow is complete OR there's no next question
      if (isNowComplete || !nextQuestion) {
        console.log('🎉 FLOW COMPLETE! Showing contact modal for lead capture');
        set({
          showContactModal: true,
          isComplete: true,
          shouldCelebrate: true,
          progress: 100,
        });
      } else {
        // Continue to next question
        const aiMsg: ChatMessage = {
          role: 'assistant',
          content: data.reply || nextQuestion.question,
          buttons: convertButtons(nextQuestion),
          timestamp: new Date(),
        };
        set((s) => ({
          messages: [...s.messages, aiMsg],
          currentQuestionId: nextQuestion.id,
          currentNodeId: nextQuestion.id,
        }));

        // Update progress
        const answeredKeys = new Set(Object.keys(updatedState.userInput));
        const newProgress = calculateProgress(updatedQuestions, answeredKeys);
        set({ progress: newProgress });

        // Send updated progress to server
        const { updateConversation: updateConv } = get();
        await updateConv({
          progress: newProgress,
          currentQuestionId: nextQuestion.id,
          messages: get().messages,
        });
      }

    } catch (error) {
      console.error('❌ API call failed, using fallback:', error);

      // Fallback: get next question locally (filter to bot questions only)
      const updatedState = get();
      const updatedAllQuestions = updatedState.flowQuestions[currentIntent as TimelineFlow] || [];
      const updatedQuestions = getBotQuestions(updatedAllQuestions);
      const isNowComplete = isFlowComplete(updatedQuestions, updatedState.userInput);
      const nextQuestion = getNextQuestion(updatedQuestions, currentQuestionId);

      // CRITICAL UX RULE: Contact modal MUST appear at the end of all questions
      // Show contact modal when: flow is complete OR there's no next question
      if (isNowComplete || !nextQuestion) {
        console.log('🎉 FLOW COMPLETE (fallback)! Showing contact modal for lead capture');
        set({
          showContactModal: true,
          isComplete: true,
          shouldCelebrate: true,
          progress: 100,
        });
      } else {
        // Continue to next question
        const aiMsg: ChatMessage = {
          role: 'assistant',
          content: nextQuestion.question,
          buttons: convertButtons(nextQuestion),
          timestamp: new Date(),
        };
        set((s) => ({
          messages: [...s.messages, aiMsg],
          currentQuestionId: nextQuestion.id,
          currentNodeId: nextQuestion.id,
        }));

        const answeredKeys = new Set(Object.keys(updatedState.userInput));
        const newProgress = calculateProgress(updatedQuestions, answeredKeys);
        set({ progress: newProgress });

        // Send updated progress to server
        const { updateConversation: updateConvFallback } = get();
        await updateConvFallback({
          progress: newProgress,
          currentQuestionId: nextQuestion.id,
          messages: get().messages,
        });
      }
    } finally {
      set({ loading: false });
    }
  };
}
