// store/useChatStore.ts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import confetti from 'canvas-confetti';
import { ChatState, ChatMessage, ExtractedAnswer, ChatButton } from '@/types/chat.types';
import { INITIAL_MESSAGE } from '@/data/conversationFlows/conversationFlows';

const initialState = {
  messages: [INITIAL_MESSAGE],
  extractedAnswers: [],
  loading: false,
  showTracker: false,
  currentFlow: null,
  progress: 0,
  shouldCelebrate: false,
};

export const useChatStore = create<ChatState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Actions
      addMessage: (message: ChatMessage) => {
        set((state) => ({
          messages: [...state.messages, message],
        }));
      },

      addExtractedAnswer: (answer: ExtractedAnswer) => {
        set((state) => {
          const newAnswers = [...state.extractedAnswers, answer];
          
          // Get total questions for current flow (default to 6)
          const totalQuestions = 6; // All flows have 6 questions
          const progress = Math.round((newAnswers.length / totalQuestions) * 100);

          // Trigger confetti on 2nd answer (enough to start analysis)
          // Trigger tracker and celebration on 2nd answer
          if (newAnswers.length === 2) {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            });
            return {
              extractedAnswers: newAnswers,
              progress,
              showTracker: true,
              shouldCelebrate: true,
            };
          }

          // Show tracker on first answer (no celebration yet)
          if (newAnswers.length === 1 && !state.showTracker) {
            return {
              extractedAnswers: newAnswers,
              progress,
              showTracker: true,
            };
          }

          return {
            extractedAnswers: newAnswers,
            progress,
          };
        });
      },

      setLoading: (loading: boolean) => {
        set({ loading });
      },

      setShowTracker: (show: boolean) => {
        set({ showTracker: show });
      },

      setCurrentFlow: (flow: 'sell' | 'buy' | 'browse' | null) => {
        set({ currentFlow: flow });
      },

      setProgress: (progress: number) => {
        set({ progress });
      },

      handleButtonClick: async (button: ChatButton) => {
        // Detect flow from button value
        if (button.value === 'sell' || button.value === 'buy' || button.value === 'browse') {
          console.log('🎯 Flow detected from button:', button.value);
          set({ currentFlow: button.value as 'sell' | 'buy' | 'browse' });
        }
        
        const { sendMessage } = get();
        await sendMessage(button.value, button.label);
      },

      sendMessage: async (message: string, displayText?: string) => {
        const state = get();
        
        if (!message.trim()) return;

        console.log('📤 Sending message:', message);
        console.log('🎯 Current flow in store:', state.currentFlow);
        console.log('📊 Current answers:', state.extractedAnswers.length);

        set({ loading: true });

        // Add user message
        const userMsg: ChatMessage = {
          role: 'user',
          content: displayText || message,
          timestamp: new Date(),
        };

        set((state) => ({
          messages: [...state.messages, userMsg],
        }));

        try {
          // Call API
          const payload = {
            messages: [...state.messages, userMsg],
            currentAnswers: state.extractedAnswers,
            currentFlow: state.currentFlow,
          };
          
          console.log('📦 Payload to API:', JSON.stringify(payload, null, 2));
          
          const response = await fetch('/api/chat-smart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            throw new Error('Failed to send message');
          }

          const data = await response.json();
          
          console.log('🎯 API Response data:', data);
          console.log('📝 Reply from API:', data.reply);
          console.log('🔘 Buttons from API:', data.buttons);
          console.log('✅ Is Complete:', data.isComplete);
          console.log('🎯 Flow type from API:', data.flowType);

          // Update extracted answers if any (this will trigger confetti in addExtractedAnswer)
          if (data.extracted) {
            get().addExtractedAnswer(data.extracted);
          }

          // Update current flow if detected (this ensures flow persists)
          if (data.flowType) {
            console.log('🔄 Updating flow to:', data.flowType);
            set({ currentFlow: data.flowType });
          }

          // Add AI reply - clean from API
          const aiMsg: ChatMessage = {
            role: 'assistant',
            content: data.reply || 'Let me help you with that.',
            buttons: data.buttons || [],
            timestamp: new Date(),
          };
          
          console.log('💬 AI Message being added:', aiMsg);

          set((state) => ({
            messages: [...state.messages, aiMsg],
          }));

          // Update progress
          if (data.progress !== undefined) {
            set({ progress: data.progress });
          }

          // If complete, wait 2 seconds then trigger onComplete
          if (data.isComplete) {
            console.log('🎊 Form complete! Will trigger redirect in 2 seconds...');
            setTimeout(() => {
              const onComplete = (window as any).__chatOnComplete;
              if (onComplete) {
                onComplete(get().extractedAnswers);
              }
            }, 2000);
          }

        } catch (error) {
          console.error('Error sending message:', error);
          
          // Add error message
          const errorMsg: ChatMessage = {
            role: 'assistant',
            content: "I'm sorry, I encountered an error. Please try again.",
            timestamp: new Date(),
          };

          set((state) => ({
            messages: [...state.messages, errorMsg],
          }));
        } finally {
          set({ loading: false });
        }
      },

      clearCelebration: () => {
        set({ shouldCelebrate: false });
      },

      reset: () => {
        set(initialState);
      },
    }),
    { name: 'chat-store' }
  )
);

// Selectors for better performance
export const selectMessages = (state: ChatState) => state.messages;
export const selectExtractedAnswers = (state: ChatState) => state.extractedAnswers;
export const selectLoading = (state: ChatState) => state.loading;
export const selectShowTracker = (state: ChatState) => state.showTracker;
export const selectProgress = (state: ChatState) => state.progress;
export const selectCurrentFlow = (state: ChatState) => state.currentFlow;