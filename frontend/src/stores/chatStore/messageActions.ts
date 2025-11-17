// // stores/chatStore/messageActions.ts
// import { ChatMessage, ChatState } from './types';

// export function createMessageActions(
//   set: (partial: Partial<ChatState> | ((state: ChatState) => Partial<ChatState>)) => void,
//   get: () => ChatState
// ) {
//   return {
//     sendMessage: async (message: string, displayText?: string) => {
//       const state = get();
//       if (!message.trim()) return;
//       set({ loading: true });

//       const userMsg: ChatMessage = {
//         role: 'user',
//         content: displayText || message,
//         timestamp: new Date(),
//       };
//       set((s) => ({ messages: [...s.messages, userMsg] }));

//       try {
//         const payload = {
//           messages: [...state.messages, userMsg],
//           currentAnswers: state.userInput,
//           currentFlow: state.currentFlow,
//           currentNodeId: state.currentNodeId,
//         };

//         const response = await fetch('/api/chat-smart', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify(payload),
//         });
//         console.log('called route')

//         if (!response.ok) throw new Error('Failed to send message');
//         const data = await response.json();

//         // Handle extracted answer
//         if (data.extracted) {
//           get().addAnswer(data.extracted.mappingKey, data.extracted.value);
//         }

//         // Update flow if changed
//         if (data.flowType) {
//           set({ currentFlow: data.flowType });
//         }

//         // Add AI response
//         const aiMsg: ChatMessage = {
//           role: 'assistant',
//           content: data.reply || 'Let me help you with that.',
//           buttons: data.buttons || [],
//           timestamp: new Date(),
//         };
//         set((s) => ({ messages: [...s.messages, aiMsg] }));

//         // Update progress
//         if (data.progress !== undefined) set({ progress: data.progress });
//         if (data.isComplete) set({ isComplete: true });

//         // Store partial LLM output
//         if (data.llmPartial) {
//           get().setLlmOutput(data.llmPartial);
//         }
//       } catch (error) {
//         console.error('Error sending message:', error);
//         const errorMsg: ChatMessage = {
//           role: 'assistant',
//           content: "I'm sorry, I encountered an error. Please try again.",
//           timestamp: new Date(),
//         };
//         set((s) => ({ messages: [...s.messages, errorMsg] }));
//       } finally {
//         set({ loading: false });
//       }
//     },
//   };
// }

export const number = 33