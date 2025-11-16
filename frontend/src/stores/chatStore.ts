// stores/chatStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import confetti from 'canvas-confetti';
import { ChatButton, LlmInput } from '@/types/chat.types';
import { INITIAL_MESSAGE_NODE } from '@/data/conversationFlows/conversationFlows';
import { LlmOutput } from '@/types/componentSchema';
import { QdrantRetrievalMetadata } from '@/types/qdrant.types';

// ChatMessage is ONLY for UI display
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  buttons?: ChatButton[];
  timestamp: Date;
}

/* --------------------------------------------------------------
   DEBUG/METADATA INTERFACES
   -------------------------------------------------------------- */
export interface GenerationDebugInfo {
  qdrantRetrieval: QdrantRetrievalMetadata[];
  promptLength: number;
  adviceUsed: number;
  generationTime?: number;
  userInput: Record<string, string>;  // ADD THIS
  flow: string;
}

/* --------------------------------------------------------------
   STATE INTERFACES
   -------------------------------------------------------------- */
export interface LlmResultState {
  llmOutput: LlmOutput | null;
  debugInfo: GenerationDebugInfo | null;
  setLlmOutput: (data: LlmOutput | Partial<LlmOutput>) => void;
  setDebugInfo: (info: GenerationDebugInfo) => void;
  clearLlmOutput: () => void;
}

export interface ChatStateData {
  messages: ChatMessage[];
  userInput: LlmInput;
  loading: boolean;
  showTracker: boolean;
  currentFlow: 'sell' | 'buy' | 'browse' | null;
  progress: number;
  shouldCelebrate: boolean;
  isComplete: boolean;
}

export interface ChatStateActions {
  addMessage: (message: ChatMessage) => void;
  addAnswer: (key: string, value: string) => void;
  setLoading: (loading: boolean) => void;
  setShowTracker: (show: boolean) => void;
  setCurrentFlow: (flow: 'sell' | 'buy' | 'browse' | null) => void;
  setProgress: (progress: number) => void;
  clearCelebration: () => void;
  reset: () => void;
  setComplete: (complete: boolean) => void;
  sendMessage: (message: string, displayText?: string) => Promise<void>;
  handleButtonClick: (button: ChatButton) => Promise<void>;
}

export type ChatState = ChatStateData & ChatStateActions & LlmResultState;

/* --------------------------------------------------------------
   INITIAL STATE
   -------------------------------------------------------------- */
const INITIAL_MESSAGE: ChatMessage = {
  role: 'assistant',
  content: INITIAL_MESSAGE_NODE.question,
  buttons: INITIAL_MESSAGE_NODE.buttons,
  timestamp: new Date(),
};

const initialState: ChatStateData & Pick<LlmResultState, 'llmOutput' | 'debugInfo'> = {
  messages: [INITIAL_MESSAGE],
  userInput: {},
  loading: false,
  showTracker: false,
  currentFlow: null,
  progress: 0,
  shouldCelebrate: false,
  isComplete: false,
  llmOutput: null,
  debugInfo: null,
};

/* --------------------------------------------------------------
   STORE
   -------------------------------------------------------------- */
export const useChatStore = create<ChatState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // LlmOutput actions
      setLlmOutput: (data: LlmOutput | Partial<LlmOutput>) => {
        set((state) => {
          const current = state.llmOutput || {};
          const updated = { ...current, ...data } as LlmOutput;
          console.log("[ChatStore] llmOutput updated:", updated);
          return { llmOutput: updated };
        });
      },

      setDebugInfo: (info: GenerationDebugInfo) => {
        console.log("[ChatStore] Debug info updated:", info);
        set({ debugInfo: info });
      },

      clearLlmOutput: () => set({ llmOutput: null, debugInfo: null }),

      // Existing actions...
      addMessage: (message: ChatMessage) =>
        set((state) => ({ messages: [...state.messages, message] })),

      addAnswer: (key: string, value: string) => {
        set((state) => {
          const newUserInput = { ...state.userInput, [key]: value };
          const totalQuestions = 6;
          const progress = Math.round((Object.keys(newUserInput).length / totalQuestions) * 100);

          console.log(`[ChatStore] Answer added → ${key}: "${value}"`);
          console.log(`[ChatStore] Full userInput:`, newUserInput);

          if (Object.keys(newUserInput).length === 1 && !state.showTracker) {
            return { userInput: newUserInput, progress, showTracker: true };
          }
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

      setLoading: (loading: boolean) => set({ loading }),
      setShowTracker: (show: boolean) => set({ showTracker: show }),
      setCurrentFlow: (flow: 'sell' | 'buy' | 'browse' | null) => set({ currentFlow: flow }),
      setProgress: (progress: number) => set({ progress }),
      clearCelebration: () => set({ shouldCelebrate: false }),
      reset: () => set(initialState),
      setComplete: (complete: boolean) => set({ isComplete: complete }),

      handleButtonClick: async (button: ChatButton) => {
        if (['sell', 'buy', 'browse'].includes(button.value)) {
          set({ currentFlow: button.value as 'sell' | 'buy' | 'browse' });
        }
        const { sendMessage } = get();
        await sendMessage(button.value, button.label);
      },

      sendMessage: async (message: string, displayText?: string) => {
        const state = get();
        if (!message.trim()) return;
        set({ loading: true });

        const userMsg: ChatMessage = {
          role: 'user',
          content: displayText || message,
          timestamp: new Date(),
        };
        set((state) => ({ messages: [...state.messages, userMsg] }));

        try {
          const payload = {
            messages: [...state.messages, userMsg],
            currentAnswers: state.userInput,
            currentFlow: state.currentFlow,
          };

          const response = await fetch('/api/chat-smart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          if (!response.ok) throw new Error('Failed to send message');
          const data = await response.json();

          if (data.extracted) {
            get().addAnswer(data.extracted.mappingKey, data.extracted.value);
          }
          if (data.flowType) set({ currentFlow: data.flowType });

          const aiMsg: ChatMessage = {
            role: 'assistant',
            content: data.reply || 'Let me help you with that.',
            buttons: data.buttons || [],
            timestamp: new Date(),
          };
          set((state) => ({ messages: [...state.messages, aiMsg] }));

          if (data.progress !== undefined) set({ progress: data.progress });
          if (data.isComplete) set({ isComplete: true });

          // Store partial LLM output
          if (data.llmPartial) {
            get().setLlmOutput(data.llmPartial);
          }
        } catch (error) {
          console.error('Error sending message:', error);
          const errorMsg: ChatMessage = {
            role: 'assistant',
            content: "I'm sorry, I encountered an error. Please try again.",
            timestamp: new Date(),
          };
          set((state) => ({ messages: [...state.messages, errorMsg] }));
        } finally {
          set({ loading: false });
        }
      },
    }),
    { name: 'chat-store' }
  )
);

/* --------------------------------------------------------------
   SELECTORS
   -------------------------------------------------------------- */
export const selectMessages = (state: ChatState) => state.messages;
export const selectUserInput = (state: ChatState) => state.userInput;
export const selectLoading = (state: ChatState) => state.loading;
export const selectShowTracker = (state: ChatState) => state.showTracker;
export const selectProgress = (state: ChatState) => state.progress;
export const selectCurrentFlow = (state: ChatState) => state.currentFlow;
export const selectIsComplete = (state: ChatState) => state.isComplete;

// LLM output selectors
export const selectLlmOutput = (state: ChatState) => state.llmOutput;
export const selectLlmOutputPartial = (state: ChatState): Partial<LlmOutput> | null =>
  state.llmOutput ? (state.llmOutput as Partial<LlmOutput>) : null;

// Debug info selector
export const selectDebugInfo = (state: ChatState) => state.debugInfo;