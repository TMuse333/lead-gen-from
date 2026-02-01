// src/lib/userConfig/getUserConfig.ts
// Helper function to get user's configuration from MongoDB

import { Db } from 'mongodb';
import type { OfferType } from '@/stores/onboardingStore/onboarding.store';
import type { StoryMappings } from '@/types/advice.types';

/**
 * Agent profile for display in offers
 * This is what leads see about the agent
 */
export interface AgentProfile {
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
}

export interface UserConfig {
  selectedOffers: OfferType[];
  businessName: string;
  qdrantCollectionName?: string;
  industry?: string;
  dataCollection?: string[];
  selectedIntentions?: string[];
  agentProfile?: AgentProfile;
  storyMappings?: StoryMappings;
  homebaseUrl?: string;
}

export async function getUserConfig(
  userId: string,
  db: Db
): Promise<UserConfig | null> {
  try {
    const collection = db.collection('clientConfigs');
    const userConfig = await collection.findOne({ userId });

    if (!userConfig) {
      return null;
    }

    return {
      selectedOffers: userConfig.selectedOffers || [],
      businessName: userConfig.businessName || '',
      qdrantCollectionName: userConfig.qdrantCollectionName,
      industry: userConfig.industry,
      dataCollection: userConfig.dataCollection,
      selectedIntentions: userConfig.selectedIntentions,
      agentProfile: userConfig.agentProfile,
      storyMappings: userConfig.storyMappings,
      homebaseUrl: userConfig.homebaseUrl,
    };
  } catch {
    return null;
  }
}
