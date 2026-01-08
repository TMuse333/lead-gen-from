// stores/chatStore/sendMessageHandler.ts - UNIFIED OFFER SYSTEM
import { ChatMessage, ChatState } from '../types';
import {
  getQuestion,
  getNextQuestion,
  isComplete,
  getProgress,
} from '@/lib/offers/unified';

export function createSendMessageHandler(
  set: (partial: Partial<ChatState> | ((state: ChatState) => Partial<ChatState>)) => void,
  get: () => ChatState
) {
  return async (message: string, displayText?: string) => {
    const state = get();
    console.log('🟦 === SEND MESSAGE START ===');
    console.log('🟦 Message:', message);

    if (!message.trim()) return;

    const { selectedOffer, currentIntent, currentQuestionId } = state;

    // Validate state
    if (!selectedOffer || !currentIntent) {
      console.warn('[SendMessage] Missing offer or intent');
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

      // Get current question from unified registry
      const currentQuestion = currentQuestionId
        ? getQuestion(selectedOffer, currentIntent, currentQuestionId)
        : null;

      console.log('[SendMessage] Current question:', currentQuestion?.id);

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

      // Check completion using unified system
      const isNowComplete = isComplete(selectedOffer, currentIntent, updatedState.userInput);
      console.log('🎯 isNowComplete:', isNowComplete);

      if (isNowComplete) {
        console.log('🎉 FLOW COMPLETE!');
        set({
          isComplete: true,
          shouldCelebrate: true,
          progress: 100,
        });
      } else {
        console.log('⏭️ Not complete, continuing...');

        // Get next question from unified registry
        const nextQuestion = currentQuestionId
          ? getNextQuestion(selectedOffer, currentIntent, currentQuestionId)
          : null;

        // Check if next question should trigger contact modal
        if (nextQuestion?.triggersContactModal) {
          console.log('📧 Next question triggers contact modal:', nextQuestion.id);
          // Add a brief response before showing modal
          const aiMsg: ChatMessage = {
            role: 'assistant',
            content: data.reply || 'Got it!',
            timestamp: new Date(),
          };
          set((s) => ({ messages: [...s.messages, aiMsg] }));

          set({
            showContactModal: true,
            currentQuestionId: nextQuestion.id,
            currentNodeId: nextQuestion.id,
          });
          // Update progress
          const newProgress = getProgress(selectedOffer, currentIntent, updatedState.userInput);
          set({ progress: newProgress });
        } else {
          // Add AI response with buttons if available
          const aiMsg: ChatMessage = {
            role: 'assistant',
            content: data.reply || 'Got it!',
            buttons: nextQuestion?.buttons?.map(b => ({
              id: b.id,
              label: b.label,
              value: b.value,
            })) || data.nextQuestion?.buttons || [],
            timestamp: new Date(),
          };
          set((s) => ({ messages: [...s.messages, aiMsg] }));

          // Update progress
          const newProgress = getProgress(selectedOffer, currentIntent, updatedState.userInput);
          set({ progress: newProgress });

          // Update current question
          if (nextQuestion) {
            set({
              currentQuestionId: nextQuestion.id,
              currentNodeId: nextQuestion.id, // Legacy
            });
          } else if (data.nextQuestion) {
            set({
              currentQuestionId: data.nextQuestion.id,
              currentNodeId: data.nextQuestion.id, // Legacy
            });
          }
        }
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
