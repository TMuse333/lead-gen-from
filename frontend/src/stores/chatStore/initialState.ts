// ============================================================
// UPDATED initialState.ts
// Remove dependency on conversationFlows.ts
// ============================================================

import { ChatStateData, LlmResultState, ChatMessage } from './types';

export function getInitialMessage(): ChatMessage {
  // Static initial message - no need for store access here
  // This is the very first message before any flow is selected
  return {
    role: 'assistant',
    content: "Hi! I'm the ai assistant. How can I help you today?",
    buttons: [
      { 
        id: 'sell', 
        label: '🏠 I want to sell my home', 
        value: 'sell' 
      },
      { 
        id: 'buy', 
        label: '🔑 I\'m looking to buy', 
        value: 'buy' 
      },
      { 
        id: 'browse', 
        label: '👀 Just browsing the market', 
        value: 'browse' 
      },
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
  currentInsight: '',
dbActivity: '',
};

export const initialLlmState: Pick<LlmResultState, 'llmOutput' | 'debugInfo'> = {
  llmOutput: null,
  debugInfo: null,
};

export const initialState = {
  ...initialChatState,
  ...initialLlmState,
};

// ============================================================
// NOTES:
// ============================================================
// - Initial message buttons point to flow IDs ('sell', 'buy', 'browse')
// - When user clicks a button, actions.ts calls getNextQuestion(flowId)
// - getNextQuestion() in flowHelpers.ts uses the store to get first question
// - No need to import conversationFlows.ts anymore!