// stores/chatStore/actions.ts (MERGED VERSION)
import confetti from 'canvas-confetti';
import { ChatMessage, ChatStateActions, ChatState } from './types';
import { ChatButton } from '@/types/chat.types';
import { useConversationConfigStore } from '../conversationConfigStore';
import { LlmOutput } from '@/types/componentSchema';
import { GenerationDebugInfo } from './types';
import { getNextQuestion, getTotalQuestions } from './flowHelpers';

export function createActions(
  set: (partial: Partial<ChatState> | ((state: ChatState) => Partial<ChatState>)) => void,
  get: () => ChatState
): ChatStateActions & Pick<ChatState, 'setLlmOutput' | 'setDebugInfo' | 'clearLlmOutput'> {
  
  return {
    // === MESSAGE ACTIONS ===
    addMessage: (message: ChatMessage) =>
      set((state) => ({ messages: [...state.messages, message] })),

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

    // === BUTTON CLICK HANDLER (WITH API CALL) ===
    handleButtonClick: async (button: ChatButton) => {
      const state = get();

      // Handle flow selection (no API call needed for initial selection)
      if (['sell', 'buy', 'browse'].includes(button.value)) {
        set({ 
          currentFlow: button.value as 'sell' | 'buy' | 'browse',
          currentNodeId: '',
        });

        // Add user message
        const userMsg: ChatMessage = {
          role: 'user',
          content: button.label,
          timestamp: new Date(),
        };
        set((s) => ({ messages: [...s.messages, userMsg] }));

        // Get first question from config
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

      // Handle regular answer button - WITH API CALL FOR ENHANCEMENT
      if (!state.currentFlow || !state.currentNodeId) return;

      const currentQuestion = useConversationConfigStore
        .getState()
        .getQuestion(state.currentFlow, state.currentNodeId);

      if (!currentQuestion?.mappingKey) return;

      // Add user message immediately
      const userMsg: ChatMessage = {
        role: 'user',
        content: button.label,
        timestamp: new Date(),
      };
      set((s) => ({ messages: [...s.messages, userMsg], loading: true }));

      try {
        console.log('📞 Calling /api/chat-smart for button click...');

        // Get flow and question config to send to API
        const flow = useConversationConfigStore.getState().getFlow(state.currentFlow);
        
        // Call API route for LLM + Qdrant enhancement
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
            flowConfig: flow, // Send config from client
            questionConfig: currentQuestion, // Send question config
          }),
        });

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();

        console.log('✅ API response received:', data);

        // Store the answer
        if (data.extracted) {
          get().addAnswer(data.extracted.mappingKey, data.extracted.value);
        } else {
          // Fallback
          get().addAnswer(currentQuestion.mappingKey, button.value);
        }

        // Add AI response with LLM-enhanced reply
        const aiMsg: ChatMessage = {
          role: 'assistant',
          content: data.reply,
          buttons: data.nextQuestion?.buttons || [],
          visual: data.nextQuestion?.visual,
          timestamp: new Date(),
        };
        set((s) => ({ messages: [...s.messages, aiMsg] }));

        // Update current node
        if (data.nextQuestion) {
          set({ currentNodeId: data.nextQuestion.id });
        } else {
          // Flow complete
          confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
          set({ isComplete: true, shouldCelebrate: true });
        }

        // Update progress
        if (data.progress !== undefined) {
          set({ progress: data.progress });
        }

        // Store debug info
        if (data._debug) {
          console.log('📊 Debug info:', data._debug);
        }

      } catch (error) {
        console.error('❌ API call failed, falling back to local flow:', error);
        
        // Fallback to local config-based flow (no LLM enhancement)
        get().addAnswer(currentQuestion.mappingKey, button.value);

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
          confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
          set({ isComplete: true, shouldCelebrate: true });
        }
      } finally {
        set({ loading: false });
      }
    },

    // === FREE TEXT MESSAGE (ALSO CALLS API) ===
    sendMessage: async (message: string, displayText?: string) => {
      const state = get();
      if (!message.trim()) return;
      
      set({ loading: true });

      const userMsg: ChatMessage = {
        role: 'user',
        content: displayText || message,
        timestamp: new Date(),
      };
      set((s) => ({ messages: [...s.messages, userMsg] }));

      try {
        console.log('📞 Calling /api/chat-smart for free text...');

        // Get flow and question config to send to API
        const flow = useConversationConfigStore.getState().getFlow(state.currentFlow!);
        const currentQuestion = flow?.questions.find(q => q.id === state.currentNodeId);

        const payload = {
          freeText: message,
          currentFlow: state.currentFlow,
          currentNodeId: state.currentNodeId,
          userInput: state.userInput,
          messages: state.messages.slice(-5),
          flowConfig: flow, // Send config from client
          questionConfig: currentQuestion, // Send question config
        };

        const response = await fetch('/api/chat-smart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error('Failed to send message');
        
        const data = await response.json();

        console.log('✅ Free text response:', data);

        // If this was a question (not an answer), don't extract or advance
        if (data.isFreeTextResponse) {
          // User asked a question - just show response with same buttons
          const aiMsg: ChatMessage = {
            role: 'assistant',
            content: data.reply || 'Let me help you with that.',
            buttons: data.nextQuestion?.buttons || [],
            visual: data.nextQuestion?.visual,
            timestamp: new Date(),
          };
          set((s) => ({ messages: [...s.messages, aiMsg] }));
          // Don't advance flow - stay on same question
          return;
        }

        // Normal answer - extract and advance
        if (data.extracted) {
          get().addAnswer(data.extracted.mappingKey, data.extracted.value);
        }

        // Update flow if changed
        if (data.flowType) {
          set({ currentFlow: data.flowType });
        }

        // Add AI response
        const aiMsg: ChatMessage = {
          role: 'assistant',
          content: data.reply || 'Let me help you with that.',
          buttons: data.nextQuestion?.buttons || [],
          visual: data.nextQuestion?.visual,
          timestamp: new Date(),
        };
        set((s) => ({ messages: [...s.messages, aiMsg] }));

        // Update progress and completion
        if (data.progress !== undefined) set({ progress: data.progress });
        if (data.isComplete) {
          confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
          set({ isComplete: true });
        }

        // Update current node
        if (data.nextQuestion) {
          set({ currentNodeId: data.nextQuestion.id });
        }

      } catch (error) {
        console.error('Error sending message:', error);
        const errorMsg: ChatMessage = {
          role: 'assistant',
          content: "I'm sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        };
        set((s) => ({ messages: [...s.messages, errorMsg] }));
      } finally {
        set({ loading: false });
      }
    },

    // === SIMPLE SETTERS ===
    setLoading: (loading: boolean) => set({ loading }),
    setShowTracker: (show: boolean) => set({ showTracker: show }),
    setCurrentFlow: (flow: 'sell' | 'buy' | 'browse' | null) => set({ currentFlow: flow }),
    setCurrentNode: (nodeId: string) => set({ currentNodeId: nodeId }),
    setProgress: (progress: number) => set({ progress }),
    clearCelebration: () => set({ shouldCelebrate: false }),
    setComplete: (complete: boolean) => set({ isComplete: complete }),
    
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

    // === RESET ===
    reset: async () => {
      const { initialState } = await import('./initialState');
      set(initialState);
    },
  };
}