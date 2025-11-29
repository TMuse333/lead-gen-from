// src/lib/mongodb/models/clientConfig.ts
// MongoDB schema for client configuration from onboarding

import { ObjectId } from 'mongodb';
import type { ConversationFlow } from '@/stores/conversationConfig/conversation.store';
import type { DataCollectionType, FlowIntention, OfferType } from '@/stores/onboardingStore/onboarding.store';
import type { ColorTheme } from '@/lib/colors/defaultTheme';
import type { AdviceType } from '@/types/advice.types';

/**
 * Client Configuration Document (stored in 'client_configs' collection)
 * This represents a complete onboarding configuration for a user
 */
export interface ClientConfigDocument {
  _id?: ObjectId;
  
  // User reference
  userId: string; // From NextAuth session
  
  // Step 1: Business Info
  businessName: string;
  industry: string;
  dataCollection: DataCollectionType[];
  customDataCollection?: string;
  selectedIntentions: FlowIntention[];
  
  // Step 2: Offers
  selectedOffers: OfferType[];
  customOffer?: string;
  
  // Step 3: Conversation Flows
  conversationFlows: Record<string, ConversationFlow>; // keyed by flow type (buy/sell/browse)
  
  // Step 4: Knowledge Base
  knowledgeBaseItems: Array<{
    id: string;
    title: string;
    advice: string;
    flows: string[];
    tags: string[];
    source: 'manual' | 'questions' | 'document';
    type?: AdviceType; // Optional advice type (defaults to 'general-advice')
  }>;
  
  // Qdrant collection info
  qdrantCollectionName: string; // e.g., "user-business-name-advice"
  
  // Color configuration
  colorConfig?: ColorTheme; // Optional: if not provided, uses default theme
  
  // Status
  isActive: boolean;
  onboardingCompletedAt: Date;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Indexes for client_configs collection
 */
export const CLIENT_CONFIG_INDEXES = [
  { userId: 1 }, // Index for finding user's config
  { businessName: 1 }, // Index for searching by business name
  { onboardingCompletedAt: -1 }, // Index for sorting by completion date
] as const;

