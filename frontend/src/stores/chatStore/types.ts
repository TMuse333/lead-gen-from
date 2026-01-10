// stores/chatStore/types.ts
/**
 * Chat Store Types - Offer-Centric Architecture
 *
 * The chat is driven by offers. User selects an offer, then an intent,
 * then answers that offer's questions for that intent.
 */

import { LlmOutput } from '@/types/componentSchema';
import { ButtonOption } from '@/types/conversation.types';
import { QdrantRetrievalMetadata } from '@/types/qdrant.types';
import type { OfferType, Intent } from '@/lib/offers/unified';

// Re-export for convenience
export type { OfferType, Intent };

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  buttons?: ButtonOption[];
  timestamp: Date;
  visual?: { type: string; value: string };
}

export interface GenerationDebugInfo {
  // Server-side (LLM) generation properties - optional for client-side
  qdrantRetrieval?: QdrantRetrievalMetadata[];
  promptLength?: number;
  adviceUsed?: number;
  // Common properties
  generationTime?: number;
  userInput?: Record<string, string>;
  offer?: OfferType;
  intent?: Intent;
  /** @deprecated Use intent instead */
  flow?: string;
  // Client-side generation properties
  generatedBy?: string;
  storyCount?: number;
  offersGenerated?: string[];
}

export interface LlmResultState {
  llmOutput: LlmOutput | null;
  debugInfo: GenerationDebugInfo | null;
  setLlmOutput: (data: LlmOutput | Partial<LlmOutput>) => void;
  setDebugInfo: (info: GenerationDebugInfo) => void;
  clearLlmOutput: () => void;
}

/**
 * Chat state data - offer-centric
 */
export interface ChatStateData {
  // ==================== MESSAGES ====================
  messages: ChatMessage[];
  loading: boolean;

  // ==================== OFFER-CENTRIC STATE ====================
  /** The offer the user selected (e.g., 'real-estate-timeline') */
  selectedOffer: OfferType | null;

  /** User's intent (buy/sell/browse) */
  currentIntent: Intent | null;

  /** Current question ID being answered */
  currentQuestionId: string;

  /** Collected answers keyed by mappingKey */
  userInput: Record<string, string>;

  /** Fields the user chose to skip */
  skippedFields: Set<string>;

  // ==================== PROGRESS ====================
  progress: number;
  isComplete: boolean;
  shouldCelebrate: boolean;

  // ==================== UI STATE ====================
  showTracker: boolean;
  currentInsight: string;
  dbActivity: string;

  // ==================== MODAL STATE ====================
  /** When true, show the contact collection modal instead of the next chat question */
  showContactModal: boolean;

  // ==================== CONVERSATION TRACKING ====================
  conversationId: string | null;

  // ==================== LEGACY (for backwards compatibility) ====================
  /** @deprecated Use selectedOffer + currentIntent instead */
  currentFlow: Intent | null;
  /** @deprecated Use selectedOffer instead */
  enabledOffers: OfferType[];
  /** @deprecated Always true now */
  useIntentSystem: boolean;
  /** @deprecated Use currentQuestionId instead */
  currentNodeId: string;
}

export interface ChatStateActions {
  // ==================== MESSAGE ACTIONS ====================
  addMessage: (message: ChatMessage) => void;
  setLoading: (loading: boolean) => void;
  sendMessage: (message: string, displayText?: string) => Promise<void>;
  handleButtonClick: (button: ButtonOption) => Promise<void>;

  // ==================== OFFER ACTIONS ====================
  selectOffer: (offer: OfferType) => void;
  setIntent: (intent: Intent) => void;

  // ==================== ANSWER ACTIONS ====================
  addAnswer: (key: string, value: string) => void;
  skipField: (mappingKey: string) => void;
  isFieldSkipped: (mappingKey: string) => boolean;

  // ==================== PROGRESS ACTIONS ====================
  setProgress: (progress: number) => void;
  setComplete: (complete: boolean) => void;
  clearCelebration: () => void;

  // ==================== UI ACTIONS ====================
  setShowTracker: (show: boolean) => void;
  setCurrentInsight: (text: string) => void;
  setDbActivity: (text: string) => void;

  // ==================== MODAL ACTIONS ====================
  setShowContactModal: (show: boolean) => void;

  // ==================== CONVERSATION ACTIONS ====================
  setConversationId: (id: string | null) => void;
  createConversation: () => Promise<string | null>;
  updateConversation: (updates: {
    messages?: ChatMessage[];
    userInput?: Record<string, string>;
    status?: 'in-progress' | 'completed' | 'abandoned';
    progress?: number;
    currentQuestionId?: string;
    answer?: {
      questionId: string;
      mappingKey: string;
      value: string;
      answeredVia: 'button' | 'text';
    };
  }) => Promise<void>;

  // ==================== RESET ====================
  reset: () => void;
  updateInitialMessage: () => void;

  // ==================== LEGACY ACTIONS (for backwards compatibility) ====================
  /** @deprecated Use selectOffer instead */
  setEnabledOffers: (offers: OfferType[]) => void;
  /** @deprecated Use setIntent instead */
  setCurrentIntent: (intent: Intent | null) => void;
  /** @deprecated Use setIntent instead */
  setCurrentFlow: (flow: Intent | null) => void;
  /** @deprecated No longer needed */
  setUseIntentSystem: (use: boolean) => void;
  /** @deprecated Use currentQuestionId */
  setCurrentNode: (nodeId: string) => void;
}

export type ChatState = ChatStateData & ChatStateActions & LlmResultState;
