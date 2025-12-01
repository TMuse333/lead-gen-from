// stores/chatStore/sendMessageHandler.ts - DEBUG VERSION
import confetti from 'canvas-confetti';

import { useConversationStore } from '@/stores/conversationConfig/conversation.store';
import { ChatMessage, ChatState } from '../types';
import { checkFlowCompletion } from './completionChecker';


// stores/chatStore/sendMessageHandler.ts - FIXED VERSION

export function createSendMessageHandler(
  set: (partial: Partial<ChatState> | ((state: ChatState) => Partial<ChatState>)) => void,
  get: () => ChatState
) {
  return async (message: string, displayText?: string) => {
    const state = get();
    console.log('🟦 === SEND MESSAGE START ===');
    console.log('🟦 Message:', message);
    
    if (!message.trim()) return;

    set({ loading: true });

    const userMsg: ChatMessage = {
      role: 'user',
      content: displayText || message,
      timestamp: new Date(),
    };
    set((s) => ({ messages: [...s.messages, userMsg] }));

    try {
      console.log('📞 Calling /api/chat/smart...');

      const flow = useConversationStore.getState().getFlow(state.currentFlow!);
      const currentQuestion = flow?.questions.find(q => q.id === state.currentNodeId);

      const response = await fetch('/api/chat/smart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          freeText: message,
          currentFlow: state.currentFlow,
          currentNodeId: state.currentNodeId,
          userInput: state.userInput,
          messages: state.messages.slice(-5),
          flowConfig: flow,
          questionConfig: currentQuestion,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      console.log('✅ API response:', data);

      // Save the answer (API always extracts now)
      if (data.extracted) {
        console.log('💾 Saving answer:', data.extracted.mappingKey, '=', data.extracted.value);
        const { addAnswer, updateConversation } = get();
        addAnswer(data.extracted.mappingKey, data.extracted.value);

        // Track answer with timestamp
        await updateConversation({
          answer: {
            questionId: state.currentNodeId,
            mappingKey: data.extracted.mappingKey,
            value: data.extracted.value,
            answeredVia: 'text',
          },
        });

        // await triggerNormalization();

      } else {
        console.error('❌ API did not extract answer!');
      }

      // Get updated state
      const updatedState = get();
      console.log('📊 userInput after save:', updatedState.userInput);
      console.log('📊 Answered:', Object.keys(updatedState.userInput).length);

      // Check completion
      const isNowComplete = checkFlowCompletion(updatedState.currentFlow, updatedState.userInput);
      console.log('🎯 isNowComplete:', isNowComplete);

      if (isNowComplete) {
        console.log('🎉 FLOW COMPLETE!');
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
        set({
          isComplete: true,
          shouldCelebrate: true,
          progress: 100,
        });
        
        // Verify it was set
        setTimeout(() => {
          console.log('🔍 Final check - isComplete:', get().isComplete);
        }, 100);
      } else {
        console.log('⏭️ Not complete, continuing...');
        
        // Add AI response
        const aiMsg: ChatMessage = {
          role: 'assistant',
          content: data.reply || 'Got it!',
          buttons: data.nextQuestion?.buttons || [],
          visual: data.nextQuestion?.visual,
          timestamp: new Date(),
        };
        set((s) => ({ messages: [...s.messages, aiMsg] }));

        // Update progress
        if (data.progress !== undefined) {
          set({ progress: data.progress });
        }

        // Update current node
        if (data.nextQuestion) {
          set({ currentNodeId: data.nextQuestion.id });
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