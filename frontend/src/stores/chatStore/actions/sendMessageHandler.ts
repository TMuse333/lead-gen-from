// stores/chatStore/sendMessageHandler.ts - MONGODB QUESTIONS
import { ChatMessage, ChatState } from '../types';
import {
  getNextQuestion,
  getQuestionById,
  isFlowComplete,
  calculateProgress,
  convertButtons,
  getBotQuestions,
} from '@/lib/chat/questionProvider';
import type { TimelineFlow } from '@/types/timelineBuilder.types';

export function createSendMessageHandler(
  set: (partial: Partial<ChatState> | ((state: ChatState) => Partial<ChatState>)) => void,
  get: () => ChatState
) {
  return async (message: string, displayText?: string) => {
    const state = get();
    console.log('🟦 === SEND MESSAGE START ===');
    console.log('🟦 Message:', message);

    if (!message.trim()) return;

    const { selectedOffer, currentIntent, currentQuestionId, flowQuestions } = state;

    // If no flow selected yet, show a conversational response with intent buttons
    if (!selectedOffer || !currentIntent) {
      console.log('[SendMessage] No flow selected yet, prompting user');

      // Add user's message
      const userMsg: ChatMessage = {
        role: 'user',
        content: message,
        timestamp: new Date(),
      };
      set((s) => ({ messages: [...s.messages, userMsg] }));

      // Respond with intent selection buttons - conversational and acknowledging their input
      const intentButtons = [
        { id: 'buy', label: "🔑 I'm looking to buy", value: 'buy' },
        { id: 'sell', label: "🏠 I'm looking to sell", value: 'sell' },
      ];

      // Create a caring, conversational response that acknowledges what they said
      // Theme: We're here to help create their personalized timeline with real stories from the agent
      const lowerMessage = message.toLowerCase();
      let response = '';
      let isIntel = false;

      // Get agent display name from session storage
      const agentDisplayName = typeof window !== 'undefined'
        ? sessionStorage.getItem('businessName') || 'your agent'
        : 'your agent';

      if (lowerMessage.includes('buy') || lowerMessage.includes('purchase') || lowerMessage.includes('looking for') || lowerMessage.includes('house') || lowerMessage.includes('home')) {
        // They mentioned buying - warm and helpful
        response = "It sounds like you're thinking about buying - that's exciting! I'd love to help you map out your journey. I'll ask a few quick questions to create a personalized timeline, and I can even share some stories from your agent about how they've helped buyers in similar situations. Ready to get started?";
      } else if (lowerMessage.includes('sell') || lowerMessage.includes('list') || lowerMessage.includes('move') || lowerMessage.includes('market')) {
        // They mentioned selling - supportive tone
        response = "Thinking about selling? I'm here to help make that process as smooth as possible! Let me create a custom timeline based on your situation. I'll also share some real stories from your agent about how they've successfully helped other sellers. Sound good?";
      } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey') || lowerMessage.includes('help')) {
        // Greeting - warm welcome
        response = "Hey! Great to have you here. I'm here to create a personalized real estate timeline just for you - complete with step-by-step guidance and real stories from your agent about how they handle different situations. Are you looking to buy or sell?";
      } else if (lowerMessage.includes('?') || lowerMessage.includes('how') || lowerMessage.includes('what') || lowerMessage.includes('when') || lowerMessage.includes('why') || lowerMessage.includes('where') || lowerMessage.includes('question')) {
        // They're asking a question - this is intel!
        isIntel = true;
        response = `Great question! ${agentDisplayName} actually covers topics like this regularly. Once I know a bit more about your situation, I can point you in the right direction. Are you looking to buy or sell?`;
      } else {
        // General statement with substance - treat as intel (topic interest)
        isIntel = true;
        response = `Thanks for sharing that! That's really helpful context. I'd love to build you a personalized timeline with real stories from ${agentDisplayName}. To get started, are you looking to buy or sell?`;
      }

      const promptMsg: ChatMessage = {
        role: 'assistant',
        content: response,
        buttons: intentButtons,
        timestamp: new Date(),
      };
      set((s) => ({ messages: [...s.messages, promptMsg] }));

      // Save intel in the background if detected
      if (isIntel) {
        const clientId = typeof window !== 'undefined'
          ? sessionStorage.getItem('clientId') || ''
          : '';
        const environment = typeof window !== 'undefined' &&
          (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
          ? 'test' : 'production';

        if (clientId) {
          // Determine intel type based on message content
          const hasQuestion = lowerMessage.includes('?') || lowerMessage.includes('how') || lowerMessage.includes('what') || lowerMessage.includes('when') || lowerMessage.includes('why');
          const intelType = hasQuestion ? 'question' : 'topic_interest';

          // Extract simple tags from the message
          const tagKeywords = ['mortgage', 'down payment', 'closing cost', 'inspection', 'appraisal', 'pre-approval', 'credit', 'interest rate', 'first-time', 'investment', 'condo', 'townhouse', 'detached', 'school', 'neighbourhood', 'neighborhood', 'renovation', 'property tax', 'offer', 'bidding', 'market', 'price', 'afford'];
          const tags = tagKeywords.filter(kw => lowerMessage.includes(kw));

          fetch('/api/intel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              clientId,
              conversationId: state.conversationId || undefined,
              content: message,
              summary: message.slice(0, 120),
              type: intelType,
              tags,
              environment,
            }),
          }).catch(err => console.error('[Intel] Failed to save pre-flow intel:', err));
        }
      }

      return;
    }

    set({ loading: true });

    const userMsg: ChatMessage = {
      role: 'user',
      content: displayText || message,
      timestamp: new Date(),
    };
    set((s) => ({ messages: [...s.messages, userMsg] }));

    try {
      console.log('📞 Calling /api/chat/smart...');

      // Get questions from store and filter to only those linked to phases
      const allQuestions = flowQuestions[currentIntent as TimelineFlow] || [];
      const questions = getBotQuestions(allQuestions);

      console.log('[SendMessage] Flow questions:', {
        intent: currentIntent,
        totalQuestions: questions.length,
        questionIds: questions.map(q => ({ id: q.id, question: q.question })),
      });

      // Get current question from stored questions
      const currentQuestion = currentQuestionId
        ? getQuestionById(questions, currentQuestionId)
        : null;

      console.log('[SendMessage] Current question:', currentQuestion?.id, currentQuestion?.question);

      // Get next question for LLM context (even though we don't advance yet)
      const nextQuestionForContext = currentQuestionId
        ? getNextQuestion(questions, currentQuestionId)
        : null;

      console.log('[SendMessage] Next question for context:', nextQuestionForContext?.id, nextQuestionForContext?.question);

      // Pass clientIdentifier for intel tracking
      const clientIdentifier = typeof window !== 'undefined'
        ? sessionStorage.getItem('clientId') || undefined
        : undefined;

      const response = await fetch('/api/chat/smart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          freeText: message,
          selectedOffer,
          currentIntent,
          currentQuestionId,
          userInput: state.userInput,
          messages: state.messages.slice(-5),
          questionConfig: currentQuestion,
          nextQuestionConfig: nextQuestionForContext, // Pass next question for LLM context
          clientIdentifier,
          conversationId: state.conversationId || undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      console.log('✅ API response:', data);

      // Save the answer if extracted
      if (data.extracted) {
        console.log('💾 Saving answer:', data.extracted.mappingKey, '=', data.extracted.value);
        const { addAnswer, updateConversation } = get();
        addAnswer(data.extracted.mappingKey, data.extracted.value);

        // Track answer
        await updateConversation({
          answer: {
            questionId: currentQuestionId,
            mappingKey: data.extracted.mappingKey,
            value: data.extracted.value,
            answeredVia: 'text',
          },
        });
      } else {
        console.log('💬 User asked a question/clarification - no answer extracted');
      }

      // Get updated state
      const updatedState = get();
      console.log('📊 userInput after save:', updatedState.userInput);

      // Check completion using stored questions
      const isNowComplete = isFlowComplete(questions, updatedState.userInput);
      console.log('🎯 isNowComplete:', isNowComplete);

      // DECISION POINT: Should we advance to next question or re-ask current?
      // If no answer was extracted (user asked clarification/objection), re-ask the same question
      if (!data.extracted) {
        console.log('🔄 No answer extracted - re-asking current question');

        // Re-ask the current question with buttons
        const aiMsg: ChatMessage = {
          role: 'assistant',
          content: data.reply || 'Let me clarify that for you.',
          buttons: currentQuestion ? convertButtons(currentQuestion) : [],
          timestamp: new Date(),
        };
        set((s) => ({ messages: [...s.messages, aiMsg] }));

        // Keep the same question ID - don't advance
        set({ loading: false });
        console.log('🟦 === SEND MESSAGE END (Re-asked) ===\n');
        return;
      }

      // Get next question from stored questions (only if answer was extracted)
      const nextQuestion = currentQuestionId
        ? getNextQuestion(questions, currentQuestionId)
        : null;

      // CRITICAL UX RULE: Contact modal MUST appear at the end of all questions
      // Show contact modal when: flow is complete OR there's no next question
      if (isNowComplete || !nextQuestion) {
        console.log('🎉 FLOW COMPLETE! Showing contact modal for lead capture');
        // Add a brief response before showing modal
        const aiMsg: ChatMessage = {
          role: 'assistant',
          content: data.reply || 'Perfect! Let me get your contact info to send your personalized timeline.',
          timestamp: new Date(),
        };
        set((s) => ({ messages: [...s.messages, aiMsg] }));

        set({
          showContactModal: true,
          isComplete: true,
          shouldCelebrate: true,
          progress: 100,
        });
      } else {
        console.log('⏭️ Not complete, continuing...');

        // Add AI response with buttons if available
        const aiMsg: ChatMessage = {
          role: 'assistant',
          content: data.reply || 'Got it!',
          buttons: convertButtons(nextQuestion),
          timestamp: new Date(),
        };
        set((s) => ({ messages: [...s.messages, aiMsg] }));

        // Update progress
        const answeredKeys = new Set(Object.keys(updatedState.userInput));
        const newProgress = calculateProgress(questions, answeredKeys);
        set({ progress: newProgress });

        // Update current question
        set({
          currentQuestionId: nextQuestion.id,
          currentNodeId: nextQuestion.id, // Legacy
        });

        // Send updated progress and messages to server
        const { updateConversation: updateConv } = get();
        await updateConv({
          progress: newProgress,
          currentQuestionId: nextQuestion.id,
          messages: get().messages,
        });
      }

    } catch (error) {
      console.error('❌ Error:', error);
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      set((s) => ({ messages: [...s.messages, errorMsg] }));
    } finally {
      set({ loading: false });
      console.log('🟦 === SEND MESSAGE END ===\n');
    }
  };
}
