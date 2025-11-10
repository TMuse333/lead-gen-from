// // store/useChatStore.ts

// import { create } from 'zustand';
// import { devtools } from 'zustand/middleware';
// import confetti from 'canvas-confetti';
// import {
 
//   ExtractedAnswer,
//   ChatButton,
//   ChatMessage,
// } from '@/types/chat/chat.types';
// import { INITIAL_MESSAGE } from '@/data/conversationFlows/conversationFlows';
// import { FlowAnalysisOutput } from '@/types/analysis.types';

// import { useEffect } from 'react';
// import axios from 'axios'


// // =========================
// // State Types
// // =========================

// export interface ChatStateData {
//   messages: ChatMessage[];
//   extractedAnswers: ExtractedAnswer[];
//   loading: boolean;
//   showTracker: boolean;
//   currentFlow: 'sell' | 'buy' | 'browse' | null;
//   progress: number;
//   shouldCelebrate: boolean;
//   isComplete: boolean;

//   // ✅ New: store full results for easy access on results page
//   analysisResult: FlowAnalysisOutput | null;
  
//   userEmail: string | null;
// }

// export interface ChatStateActions {
//   addMessage: (message: ChatMessage) => void;
//   addExtractedAnswer: (answer: ExtractedAnswer) => void;
//   setLoading: (loading: boolean) => void;
//   setShowTracker: (show: boolean) => void;
//   setCurrentFlow: (flow: 'sell' | 'buy' | 'browse' | null) => void;
//   setProgress: (progress: number) => void;
//   clearCelebration: () => void;
//   reset: () => void;
//   setComplete: (complete: boolean) => void;

//   // ✅ New actions for result data
//   setResults: (data: {
//     analysis: FlowAnalysisOutput;

//     email?: string;
//   }) => void;

//   clearResults: () => void;

//   // existing chat flow handlers
//   sendMessage: (message: string, displayText?: string) => Promise<void>;
//   handleButtonClick: (button: ChatButton) => Promise<void>;
// }

// export type ChatState = ChatStateData & ChatStateActions;

// // =========================
// // Initial State
// // =========================

// const initialState: ChatStateData = {
//   messages: [INITIAL_MESSAGE],
//   extractedAnswers: [],
//   loading: false,
//   showTracker: false,
//   currentFlow: null,
//   progress: 0,
//   shouldCelebrate: false,
//   isComplete: false,

//   // ✅ new
//   analysisResult: null,

//   userEmail: null,
// };

// // =========================
// // Store
// // =========================

// export const useChatStore = create<ChatState>()(
//   devtools(
//     (set, get) => ({
//       ...initialState,

//       // =========================
//       // Chat Actions
//       // =========================

//       addMessage: (message: ChatMessage) => {
//         set((state) => ({
//           messages: [...state.messages, message],
//         }));
//       },

//       addExtractedAnswer: (answer: ExtractedAnswer) => {
//         set((state) => {
//           const newAnswers = [...state.extractedAnswers, answer];
//           const totalQuestions = 6; // default
//           const progress = Math.round((newAnswers.length / totalQuestions) * 100);

//           if (newAnswers.length === 1 && !state.showTracker) {
//             return { extractedAnswers: newAnswers, progress, showTracker: true };
//           }

//           if (newAnswers.length === 2) {
//             confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
//             return {
//               extractedAnswers: newAnswers,
//               progress,
//               showTracker: true,
//               shouldCelebrate: true,
//             };
//           }

//           return { extractedAnswers: newAnswers, progress };
//         });
//       },

//       setLoading: (loading: boolean) => set({ loading }),
//       setShowTracker: (show: boolean) => set({ showTracker: show }),
//       setCurrentFlow: (flow: 'sell' | 'buy' | 'browse' | null) =>
//         set({ currentFlow: flow }),
//       setProgress: (progress: number) => set({ progress }),
//       clearCelebration: () => set({ shouldCelebrate: false }),
//       reset: () => set(initialState),
//       setComplete: (complete: boolean) => set({ isComplete: complete }),

//       // =========================
//       // ✅ Results Management
//       // =========================
//       setResults: ({ analysis , email }) =>
//         set({
//           analysisResult: analysis,
       
//           userEmail: email || null,
//         }),

//       clearResults: () =>
//         set({
//           analysisResult: null,
         
//           userEmail: null,
//         }),

//       // =========================
//       // Chat Flow Logic
//       // =========================

//       handleButtonClick: async (button: ChatButton) => {
//         if (['sell', 'buy', 'browse'].includes(button.value)) {
//           set({ currentFlow: button.value as 'sell' | 'buy' | 'browse' });
          
//           get().setCurrentFlow(button.value as 'sell' | 'buy' | 'browse'); 
          
//         }
//         const { sendMessage } = get();
//         await sendMessage(button.value, button.label);
//       },

//       sendMessage: async (message: string, displayText?: string) => {
//         const state = get();
//         if (!message.trim()) return;

//         set({ loading: true });

//         const userMsg: ChatMessage = {
//           role: 'user',
//           content: displayText || message,
//           timestamp: new Date(),
//         };
//         set((state) => ({ messages: [...state.messages, userMsg] }));

//         try {
//           const payload = {
//             messages: [...state.messages, userMsg],
//             currentAnswers: state.extractedAnswers,
//             currentFlow: state.currentFlow,
//           };

//           const response = await fetch('/api/chat-smart', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(payload),
//           });

//           if (!response.ok) throw new Error('Failed to send message');
//           const data = await response.json();

//           if (data.extracted) get().addExtractedAnswer(data.extracted);
//           if (data.flowType) set({ currentFlow: data.flowType });

//           const aiMsg: ChatMessage = {
//             role: 'assistant',
//             content: data.reply || 'Let me help you with that.',
//             buttons: data.buttons || [],
//             timestamp: new Date(),
//           };
//           set((state) => ({ messages: [...state.messages, aiMsg] }));

//           if (data.progress !== undefined) set({ progress: data.progress });

//           if (data.isComplete) {
//             set({ isComplete: true });
//             setTimeout(() => {
//               const onComplete = (window as any).__chatOnComplete;
//               if (onComplete) onComplete(get().extractedAnswers);
//             }, 2000);
//           }
//         } catch (error) {
//           console.error('Error sending message:', error);
//           const errorMsg: ChatMessage = {
//             role: 'assistant',
//             content: "I'm sorry, I encountered an error. Please try again.",
//             timestamp: new Date(),
//           };
//           set((state) => ({ messages: [...state.messages, errorMsg] }));
//         } finally {
//           set({ loading: false });
//         }
//       },
//     }),


    
//     { name: 'chat-store' }
//   )
// );

// // =========================
// // Selectors
// // =========================
// export const selectMessages = (state: ChatState) => state.messages;
// export const selectExtractedAnswers = (state: ChatState) =>
//   state.extractedAnswers;
// export const selectLoading = (state: ChatState) => state.loading;
// export const selectShowTracker = (state: ChatState) => state.showTracker;
// export const selectProgress = (state: ChatState) => state.progress;
// export const selectCurrentFlow = (state: ChatState) => state.currentFlow;
// export const selectIsComplete = (state: ChatState) => state.isComplete;

// // ✅ New Selectors
// export const selectAnalysisResult = (state: ChatState) => state.analysisResult;

// export const selectUserEmail = (state: ChatState) => state.userEmail;

export const three = 4