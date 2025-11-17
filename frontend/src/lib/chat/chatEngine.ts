// // lib/chatEngine.ts (NEW FILE - replaces hardcoded flow logic)

// import { QuestionNode } from '@/types/conversationConfig.types';

// export class ChatEngine {
//   static getNextQuestion(
//     flowId: string,
//     currentQuestionId?: string
//   ): QuestionNode | null {
//     const flow = useConversationConfigStore.getState().getFlow(flowId);
//     if (!flow) return null;

//     const sortedQuestions = [...flow.questions].sort((a, b) => a.order - b.order);

//     if (!currentQuestionId) {
//       // Return first question
//       return sortedQuestions[0] || null;
//     }

//     // Find next question
//     const currentIndex = sortedQuestions.findIndex(q => q.id === currentQuestionId);
//     if (currentIndex === -1 || currentIndex === sortedQuestions.length - 1) {
//       return null; // No more questions
//     }

//     return sortedQuestions[currentIndex + 1];
//   }

//   static isFlowComplete(flowId: string, userAnswers: Record<string, string>): boolean {
//     const flow = useConversationConfigStore.getState().getFlow(flowId);
//     if (!flow) return false;

//     const requiredQuestions = flow.questions.filter(q => 
//       q.validation?.required !== false
//     );

//     return requiredQuestions.every(q => 
//       q.mappingKey && userAnswers[q.mappingKey]
//     );
//   }

//   static getTotalQuestions(flowId: string): number {
//     const flow = useConversationConfigStore.getState().getFlow(flowId);
//     return flow?.questions.length || 0;
//   }
// }// stores/chatStore.ts
// import { create } from 'zustand';
// import { devtools } from 'zustand/middleware';
// import confetti from 'canvas-confetti';
// import { ChatButton, LlmInput } from '@/types/chat.types';
// import { INITIAL_MESSAGE_NODE } from '@/data/conversationFlows/conversationFlows';
// import { LlmOutput } from '@/types/componentSchema';
// import { QdrantRetrievalMetadata } from '@/types/qdrant.types';
// import { useConversationConfigStore } from '@/stores/conversationConfigStore';
// import { ChatEngine } from '@/lib/chatEngine';

// // ChatMessage is ONLY for UI display
// interface ChatMessage {
//   role: 'user' | 'assistant';
//   content: string;
//   buttons?: ChatButton[];
//   timestamp: Date;
// }

// export interface GenerationDebugInfo {
//   qdrantRetrieval: QdrantRetrievalMetadata[];
//   promptLength: number;
//   adviceUsed: number;
//   generationTime?: number;
//   userInput: Record<string, string>;
//   flow: string;
// }

// export interface LlmResultState {
//   llmOutput: LlmOutput | null;
//   debugInfo: GenerationDebugInfo | null;
//   setLlmOutput: (data: LlmOutput | Partial<LlmOutput>) => void;
//   setDebugInfo: (info: GenerationDebugInfo) => void;
//   clearLlmOutput: () => void;
// }

// export interface ChatStateData {
//   messages: ChatMessage[];
//   userInput: LlmInput;
//   loading: boolean;
//   showTracker: boolean;
//   currentFlow: 'sell' | 'buy' | 'browse' | null;
//   currentNodeId: string | null;  // ← NEW: tracks current position in flow
//   progress: number;
//   shouldCelebrate: boolean;
//   isComplete: boolean;
// }

// export interface ChatStateActions {
//   addMessage: (message: ChatMessage) => void;
//   addAnswer: (key: string, value: string) => void;
//   setLoading: (loading: boolean) => void;
//   setShowTracker: (show: boolean) => void;
//   setCurrentFlow: (flow: 'sell' | 'buy' | 'browse' | null) => void;
//   setCurrentNodeId: (id: string | null) => void;
//   setProgress: (progress: number) => void;
//   clearCelebration: () => void;
//   reset: () => void;
//   setComplete: (complete: boolean) => void;
//   sendMessage: (message: string, displayText?: string) => Promise<void>;
//   handleButtonClick: (button: ChatButton) => Promise<void>;
// }

// export type ChatState = ChatStateData & ChatStateActions & LlmResultState;

// const INITIAL_MESSAGE: ChatMessage = {
//   role: 'assistant',
//   content: INITIAL_MESSAGE_NODE.question,
//   buttons: INITIAL_MESSAGE_NODE.buttons,
//   timestamp: new Date(),
// };

// const initialState: ChatStateData & Pick<LlmResultState, 'llmOutput' | 'debugInfo'> = {
//   messages: [INITIAL_MESSAGE],
//   userInput: {},
//   loading: false,
//   showTracker: false,
//   currentFlow: null,
//   currentNodeId: null,
//   progress: 0,
//   shouldCelebrate: false,
//   isComplete: false,
//   llmOutput: null,
//   debugInfo: null,
// };

// export const useChatStore = create<ChatState>()(
//   devtools(
//     (set, get) => ({
//       ...initialState,

//       // LlmOutput actions
//       setLlmOutput: (data: LlmOutput | Partial<LlmOutput>) => {
//         set((state) => {
//           const current = state.llmOutput || {};
//           const updated = { ...current, ...data } as LlmOutput;
//           console.log("[ChatStore] llmOutput updated:", updated);
//           return { llmOutput: updated };
//         });
//       },

//       setDebugInfo: (info: GenerationDebugInfo) => {
//         console.log("[ChatStore] Debug info updated:", info);
//         set({ debugInfo: info });
//       },

//       clearLlmOutput: () => set({ llmOutput: null, debugInfo: null }),

//       // Core actions
//       addMessage: (message: ChatMessage) =>
//         set((state) => ({ messages: [...state.messages, message] })),

//       addAnswer: (key: string, value: string) => {
//         set((state) => {
//           const newUserInput = { ...state.userInput, [key]: value };
//           const config = useConversationConfigStore.getState();
//           const totalQuestions = config.getFlow(state.currentFlow!)?.questions.length || 6;
//           const progress = Math.round((Object.keys(newUserInput).length / totalQuestions) * 100);

//           console.log(`[ChatStore] Answer added → ${key}: "${value}"`);

//           if (Object.keys(newUserInput).length === 1 && !state.showTracker) {
//             return { userInput: newUserInput, progress, showTracker: true };
//           }
//           if (Object.keys(newUserInput).length === 2) {
//             confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
//             return {
//               userInput: newUserInput,
//               progress,
//               showTracker: true,
//               shouldCelebrate: true,
//             };
//           }
//           return { userInput: newUserInput, progress };
//         });
//       },

//       setLoading: (loading: boolean) => set({ loading }),
//       setShowTracker: (show: boolean) => set({ showTracker: show }),
//       setCurrentFlow: (flow: 'sell' | 'buy' | 'browse' | null) => set({ currentFlow: flow }),
//       setCurrentNodeId: (id: string | null) => set({ currentNodeId: id }),
//       setProgress: (progress: number) => set({ progress }),
//       clearCelebration: () => set({ shouldCelebrate: false }),
//       reset: () => set(initialState),
//       setComplete: (complete: boolean) => set({ isComplete: complete }),

//       // NEW: Fully config-driven button handler
//       handleButtonClick: async (button: ChatButton) => {
//         const state = get();
//         const configStore = useConversationConfigStore.getState();

//         // Handle initial flow selection
//         if (['sell', 'buy', 'browse'].includes(button.value)) {
//           set({ currentFlow: button.value as 'sell' | 'buy' | 'browse' });
//           const firstQuestion = configStore.getFirstQuestion(button.value as 'sell' | 'buy' | 'browse');
//           if (firstQuestion) {
//             set({ currentNodeId: firstQuestion.id });
//             get().addMessage({
//               role: 'user',
//               content: button.label,
//               timestamp: new Date(),
//             });
//             get().addMessage({
//               role: 'assistant',
//               content: firstQuestion.question,
//               buttons: firstQuestion.buttons,
//               timestamp: new Date(),
//             });
//           }
//           return;
//         }

//         // Handle regular question answers
//         if (!state.currentFlow || !state.currentNodeId) return;

//         const currentQuestion = configStore.getQuestion(state.currentFlow, state.currentNodeId);
//         if (!currentQuestion?.mappingKey) return;

//         // Store the answer
//         get().addAnswer(currentQuestion.mappingKey, button.value);

//         // Add user message
//         get().addMessage({
//           role: 'user',
//           content: button.label,
//           timestamp: new Date(),
//         });

//         // Get next question
//         const nextQuestion = ChatEngine.getNextQuestion(state.currentFlow, state.currentNodeId);
        
//         if (nextQuestion) {
//           set({ currentNodeId: nextQuestion.id });
//           get().addMessage({
//             role: 'assistant',
//             content: nextQuestion.question,
//             buttons: nextQuestion.buttons,
//             timestamp: new Date(),
//           });
//         } else {
//           // Flow complete
//           confetti({
//             particleCount: 200,
//             spread: 100,
//             origin: { y: 0.6 },
//           });
//           set({ 
//             isComplete: true, 
//             shouldCelebrate: true,
//             currentNodeId: null 
//           });
//         }
//       },

//       // Keep old sendMessage for free-text fallback (optional)
//       sendMessage: async (message: string, displayText?: string) => {
//         // You can still use this for open-ended questions or legacy paths
//         // Or remove it entirely if you're going 100% config-driven
//         console.warn("sendMessage() is deprecated in favor of config-driven flow");
//       },
//     }),
//     { name: 'chat-store' }
//   )
// );

// // SELECTORS
// export const selectMessages = (state: ChatState) => state.messages;
// export const selectUserInput = (state: ChatState) => state.userInput;
// export const selectLoading = (state: ChatState) => state.loading;
// export const selectShowTracker = (state: ChatState) => state.showTracker;
// export const selectProgress = (state: ChatState) => state.progress;
// export const selectCurrentFlow = (state: ChatState) => state.currentFlow;
// export const selectCurrentNodeId = (state: ChatState) => state.currentNodeId;
// export const selectIsComplete = (state: ChatState) => state.isComplete;
// export const selectShouldCelebrate = (state: ChatState) => state.shouldCelebrate;

// export const selectLlmOutput = (state: ChatState) => state.llmOutput;
// export const selectDebugInfo = (state: ChatState) => state.debugInfo;

export const twleve = 9