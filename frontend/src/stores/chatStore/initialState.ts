// stores/chatStore/initialState.ts
import { ChatStateData, LlmResultState, ChatMessage } from './types';
import { useConversationConfigStore } from '../conversationConfigStore';

export function getInitialMessage(): ChatMessage {
  // Get initial message from config (or fallback)
  return {
    role: 'assistant',
    content: "Hi! I'm Chris's AI assistant. How can I help you today?",
    buttons: [
      { id: 'sell', label: '🏠 I want to sell my home', value: 'sell' },
      { id: 'buy', label: '🔑 I\'m looking to buy', value: 'buy' },
      { id: 'browse', label: '👀 Just browsing the market', value: 'browse' },
    ],
    timestamp: new Date(),
  };
}

export const initialChatState: ChatStateData = {
  messages: [getInitialMessage()],
  userInput: {},
  loading: false,
  showTracker: false,
  currentFlow: null,
  currentNodeId: '',
  progress: 0,
  shouldCelebrate: false,
  isComplete: false,
};

export const initialLlmState: Pick<LlmResultState, 'llmOutput' | 'debugInfo'> = {
  llmOutput: null,
  debugInfo: null,
};

export const initialState = {
  ...initialChatState,
  ...initialLlmState,
};