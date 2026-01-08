// stores/chatStore/initialState.ts
/**
 * Initial state for offer-centric chat
 */

import { ChatStateData, LlmResultState, ChatMessage } from './types';
import { getOffer, type OfferType } from '@/lib/offers/unified';

// Offer labels for display
const OFFER_LABELS: Record<string, string> = {
  'real-estate-timeline': 'personalized timeline',
  'pdf': 'custom property report',
  'landingPage': 'property landing page',
  'video': 'personalized video walkthrough',
  'home-estimate': 'home value estimate',
  'custom': 'custom offer',
};

/**
 * Get initial message based on available offers
 */
export function getInitialMessage(): ChatMessage {
  let businessName = '';
  let selectedOffers: OfferType[] = [];

  if (typeof window !== 'undefined') {
    try {
      businessName = sessionStorage.getItem('businessName') || '';
      const offersJson = sessionStorage.getItem('selectedOffers');
      if (offersJson) {
        selectedOffers = JSON.parse(offersJson);
      }
    } catch (error) {
      console.warn('Could not load client config from session:', error);
    }
  }

  // Build greeting
  let content = businessName
    ? `Hello! I'm ${businessName}'s AI assistant. `
    : "Hi! I'm your AI real estate assistant. ";

  content += "I can create personalized content based on your situation.";

  // If offers are configured, show them as buttons
  if (selectedOffers.length > 0) {
    content += "\n\n**What would you like me to create for you?**";

    const offerButtons = selectedOffers.map((offerType) => {
      const offer = getOffer(offerType);
      const label = offer?.label || OFFER_LABELS[offerType] || offerType;
      const icon = offer?.icon || '✨';

      return {
        id: offerType,
        label: `${icon} ${label.charAt(0).toUpperCase() + label.slice(1)}`,
        value: offerType,
      };
    });

    return {
      role: 'assistant',
      content,
      buttons: offerButtons,
      timestamp: new Date(),
    };
  }

  // Fallback: show intent buttons if no offers configured
  content += "\n\n**How can I help you today?**";

  return {
    role: 'assistant',
    content,
    buttons: [
      { id: 'sell', label: '🏠 I want to sell my home', value: 'sell' },
      { id: 'buy', label: '🔑 I\'m looking to buy', value: 'buy' },
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
