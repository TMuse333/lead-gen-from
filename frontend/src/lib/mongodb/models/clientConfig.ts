// src/lib/mongodb/models/clientConfig.ts
// MongoDB schema for client configuration from onboarding

import { ObjectId } from 'mongodb';
import type { ConversationFlow } from '@/stores/conversationConfig/conversation.store';
import type { DataCollectionType, FlowIntention, OfferType } from '@/stores/onboardingStore/onboarding.store';
import type { ColorTheme } from '@/lib/colors/defaultTheme';
import type { AdviceType, StoryMappings } from '@/types/advice.types';
import type { FlowPhaseConfigs, FlowBotConfig, FlowQuestionConfigs } from '@/types/timelineBuilder.types';

/**
 * CTA Style options for the results page ending section
 */
export type CTAStyle =
  | 'questions-form'    // Form to send questions + agent contact (default)
  | 'contact-card'      // Just show agent contact info prominently
  | 'calendly'          // Calendly booking embed
  | 'minimal';          // Just download/share buttons

/**
 * Configuration for the ending CTA section on results page
 */
export interface EndingCTAConfig {
  // Agent display info
  headshot?: string;           // Vercel Blob URL for agent photo
  displayName: string;         // How agent wants to be displayed
  title?: string;              // e.g., "Real Estate Agent", "Realtor"
  company?: string;            // Company/brokerage name

  // Contact methods
  email?: string;              // Agent's email
  phone?: string;              // Agent's phone
  calendlyUrl?: string;        // Calendly booking URL (for calendly style)

  // CTA style selection
  style: CTAStyle;

  // Custom messaging
  sectionTitle?: string;       // e.g., "Have Questions?" (default)
  sectionSubtitle?: string;    // Custom subtitle text
  customMessage?: string;      // Personal message from agent
  responseTimeText?: string;   // e.g., "I typically respond within 24 hours"
}

/**
 * Client Configuration Document (stored in 'client_configs' collection)
 * This represents a complete onboarding configuration for a user
 */
export interface ClientConfigDocument {
  _id?: ObjectId;
  
  // User reference
  userId: string; // From NextAuth session

  // Agent Info (from simplified onboarding)
  agentFirstName?: string;  // For bot personalization (casual contexts)
  agentLastName?: string;   // For formal contexts (optional)

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

  // Agent Profile (for display to leads)
  agentProfile?: {
    name: string;
    title?: string;
    company?: string;
    photo?: string;
    yearsExperience: number;
    totalTransactions?: number;
    transactionsInArea?: number;
    similarClientsHelped?: number;
    specializations?: string[];
    certifications?: string[];
    avgRating?: number;
    reviewCount?: number;
    areasServed?: string[];
    email?: string;
    phone?: string;
  };

  // Story Mappings (explicit phase-to-story linking)
  // Maps flow types to phase IDs to Qdrant story IDs
  storyMappings?: StoryMappings;

  // Custom Phase Configurations (Timeline Builder)
  // Allows agents to fully customize their timeline phases and steps
  customPhases?: FlowPhaseConfigs;

  // Bot Response Configuration
  // Links chatbot questions to phases, steps, and personal advice
  botResponseConfig?: FlowBotConfig;

  // Custom Questions Configuration
  // Allows agents to customize chatbot questions per flow
  customQuestions?: FlowQuestionConfigs;

  // Ending CTA Configuration
  // Controls the "Questions?" section and CTA on the results page
  endingCTA?: EndingCTAConfig;

  // Lead Notification Settings
  // Email address to receive notifications when new leads submit contact info
  notificationEmail?: string;

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

