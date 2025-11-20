// stores/chatStore/buttonClickHandler.ts
import confetti from 'canvas-confetti';

import { ChatMessage, ChatState } from '../types';
import { getNextQuestion } from '../flowHelpers';
import { useConversationStore } from '@/stores/conversationConfig/conversation.store'
import { checkFlowCompletion } from './completionChecker';
import { applyButtonTracker } from './trackerUtils';
import { ButtonOption } from '@/types/conversation.types';

export function createButtonClickHandler(
  set: (partial: Partial<ChatState> | ((state: ChatState) => Partial<ChatState>)) => void,
  get: () => ChatState
) {
  return async (button: ButtonOption) => {
    const state = get();

    // Handle flow selection (sell/buy/browse)
    if (['sell', 'buy', 'browse'].includes(button.value)) {
      set({
        currentFlow: button.value as 'sell' | 'buy' | 'browse',
        currentNodeId: '',
      });

      const userMsg: ChatMessage = {
        role: 'user',
        content: button.label,
        timestamp: new Date(),
      };
      set((s) => ({ messages: [...s.messages, userMsg] }));

      const firstQuestion = getNextQuestion(button.value);
      if (firstQuestion) {
        const aiMsg: ChatMessage = {
          role: 'assistant',
          content: firstQuestion.question,
          buttons: firstQuestion.buttons,
          visual: firstQuestion.visual ? {
            type: firstQuestion.visual.type,
            value: typeof firstQuestion.visual.value === 'function'
              ? firstQuestion.visual.value.name
              : firstQuestion.visual.value
          } : undefined,
          timestamp: new Date(),
        };
        set((s) => ({
          messages: [...s.messages, aiMsg],
          currentNodeId: firstQuestion.id,
        }));
      }
      return;
    }

    // Regular answer button click
    if (!state.currentFlow || !state.currentNodeId) return;

    const currentQuestion = useConversationStore
      .getState()
      .getQuestion(state.currentFlow, state.currentNodeId);

    if (!currentQuestion?.mappingKey) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: button.label,
      timestamp: new Date(),
    };
    set((s) => ({ messages: [...s.messages, userMsg], loading: true }));

    try {
      console.log('📞 Calling /api/chat-smart for button click...');

      const flow = useConversationStore.getState().getFlow(state.currentFlow);

      const response = await fetch('/api/chat-smart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buttonId: button.id,
          buttonValue: button.value,
          buttonLabel: button.label,
          currentFlow: state.currentFlow,
          currentNodeId: state.currentNodeId,
          userInput: state.userInput,
          messages: state.messages.slice(-5),
          flowConfig: flow,
          questionConfig: currentQuestion,
        }),
      });

      if (!response.ok) throw new Error(`API returned ${response.status}`);

      const data = await response.json();
      console.log('✅ API response received:', data);

      // Add answer to state
      let answerValue: string;
      if (data.extracted) {
        get().addAnswer(data.extracted.mappingKey, data.extracted.value);
        answerValue = data.extracted.value;
      } else {
        get().addAnswer(currentQuestion.mappingKey, button.value);
        answerValue = button.value;
      }

      // Apply tracker messages
      applyButtonTracker(
        state.currentFlow,
        state.currentNodeId,
        currentQuestion.mappingKey,
        answerValue,
        (updates) => set(updates)
      );

      // Get updated state after adding answer
      const updatedState = get();

      // Check completion
      const isNowComplete = checkFlowCompletion(updatedState.currentFlow, updatedState.userInput);

      if (isNowComplete) {
        console.log('🎉 FLOW COMPLETE! Setting isComplete = true');
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
        set({
          isComplete: true,
          shouldCelebrate: true,
          progress: 100,
        });
      } else {
        // Continue to next question
        const aiMsg: ChatMessage = {
          role: 'assistant',
          content: data.reply,
          buttons: data.nextQuestion?.buttons || [],
          visual: data.nextQuestion?.visual,
          timestamp: new Date(),
        };
        set((s) => ({ messages: [...s.messages, aiMsg] }));

        if (data.nextQuestion) {
          set({ currentNodeId: data.nextQuestion.id });
        }

        if (data.progress !== undefined) {
          set({ progress: data.progress });
        }
      }

    } catch (error) {
      console.error('❌ API call failed, using fallback:', error);

      // Fallback: add answer locally
      get().addAnswer(currentQuestion.mappingKey, button.value);
      
      applyButtonTracker(
        state.currentFlow,
        state.currentNodeId,
        currentQuestion.mappingKey,
        button.value,
        (updates) => set(updates)
      );

      const updatedState = get();
      const isNowComplete = checkFlowCompletion(updatedState.currentFlow, updatedState.userInput);

      if (isNowComplete) {
        console.log('🎉 FLOW COMPLETE (fallback)! Setting isComplete = true');
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
        set({
          isComplete: true,
          shouldCelebrate: true,
          progress: 100,
        });
      } else {
        const nextQuestion = getNextQuestion(state.currentFlow, state.currentNodeId);

        if (nextQuestion) {
          const aiMsg: ChatMessage = {
            role: 'assistant',
            content: nextQuestion.question,
            buttons: nextQuestion.buttons,
            visual: nextQuestion.visual ? {
              type: nextQuestion.visual.type,
              value: typeof nextQuestion.visual.value === 'function'
                ? nextQuestion.visual.value.name
                : nextQuestion.visual.value
            } : undefined,
            timestamp: new Date(),
          };
          set((s) => ({
            messages: [...s.messages, aiMsg],
            currentNodeId: nextQuestion.id,
          }));
        } else {
          console.log('🎉 No next question! Setting isComplete = true');
          confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
          set({ isComplete: true, shouldCelebrate: true, progress: 100 });
        }
      }
    } finally {
      set({ loading: false });
    }
  };
}