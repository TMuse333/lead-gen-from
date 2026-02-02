// stores/chatStore/initialState.ts
/**
 * Initial state for offer-centric chat
 */

import { ChatStateData, LlmResultState, ChatMessage } from './types';
import { getOffer, type OfferType } from '@/lib/offers/unified';

// MVP: Only timeline offer is configured
const MVP_OFFER: OfferType = 'real-estate-timeline';

/**
 * Timeline preview teaser - shows what the user will get
 */
const TIMELINE_PREVIEW = `
**Here's what I can do for you:**

📋 **Your Personalized Real Estate Timeline**
I'll ask you a few quick questions about your situation, and then create a custom step-by-step roadmap just for you.

💬 **Real Stories & Advice**
I even have stories directly from your agent about how they've helped clients in similar situations - so you can see exactly how they handle different scenarios.

_Ready to get started? Just let me know if you're looking to buy or sell!_
`;

/**
 * Get initial message with timeline preview
 */
export function getInitialMessage(): ChatMessage {
  let businessName = '';

  if (typeof window !== 'undefined') {
    try {
      businessName = sessionStorage.getItem('businessName') || '';
    } catch (error) {
      console.warn('Could not load client config from session:', error);
    }
  }

  // Build greeting with preview - warm and caring tone
  let content = businessName
    ? `Hey there! I'm ${businessName}'s AI assistant, and I'm here to help make your real estate journey as smooth as possible. `
    : "Hey there! I'm your AI real estate assistant, here to help make your journey as smooth as possible. ";

  content += TIMELINE_PREVIEW;
  content += "\n**What brings you here today?**";

  return {
    role: 'assistant',
    content,
    buttons: [
      { id: 'buy', label: "🔑 I'm looking to buy", value: 'buy' },
      { id: 'sell', label: "🏠 I'm looking to sell", value: 'sell' },
    ],
    timestamp: new Date(),
  };
}

export const initialChatState: ChatStateData = {
  // Messages
  messages: [getInitialMessage()],
  loading: false,

  // Offer-centric state
  selectedOffer: null,
  currentIntent: null,
  currentQuestionId: '',
  userInput: {},
  skippedFields: new Set<string>(),

  // Progress
  progress: 0,
  isComplete: false,
  shouldCelebrate: false,

  // UI state
  showTracker: false,
  currentInsight: '',
  dbActivity: '',

  // Modal state
  showContactModal: false,

  // Conversation tracking
  conversationId: null,
  lastSyncedMessageCount: 0,

  // Questions (fetched from MongoDB)
  flowQuestions: {},
  questionsLoaded: false,

  // Legacy (backwards compatibility)
  currentFlow: null,
  enabledOffers: [],
  useIntentSystem: true,
  currentNodeId: '',
};

export const initialLlmState: Pick<LlmResultState, 'llmOutput' | 'debugInfo'> = {
  llmOutput: null,
  debugInfo: null,
};

export const initialState = {
  ...initialChatState,
  ...initialLlmState,
};
