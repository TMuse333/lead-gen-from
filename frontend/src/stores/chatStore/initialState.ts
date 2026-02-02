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
**Here's a sneak peek of what you'll get:**

📋 **Your Personalized Timeline**
• Step-by-step phases tailored to YOUR situation
• Actionable tasks with priorities for each phase
• Expert advice based on your location, budget & timeline
• Estimated timeframes adjusted to your goals

_These estimates are based on typical experiences with similar clients. Your agent will provide personalized guidance for your specific situation._

Just answer a few quick questions and I'll generate your custom roadmap!
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

  // Build greeting with preview
  let content = businessName
    ? `Hello! I'm ${businessName}'s AI assistant. `
    : "Hi! I'm your AI real estate assistant. ";

  content += "I can generate a personalized real estate timeline based on your goals.";
  content += TIMELINE_PREVIEW;
  content += "\n**Are you looking to buy, sell, or just exploring?**";

  return {
    role: 'assistant',
    content,
    buttons: [
      { id: 'buy', label: '🔑 I\'m looking to buy', value: 'buy' },
      { id: 'sell', label: '🏠 I want to sell my home', value: 'sell' },
      { id: 'browse', label: '👀 Just browsing the market', value: 'browse' },
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
