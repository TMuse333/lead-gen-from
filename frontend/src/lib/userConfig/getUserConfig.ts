// src/lib/userConfig/getUserConfig.ts
// Helper function to get user's configuration from MongoDB

import { Db } from 'mongodb';
import type { OfferType } from '@/stores/onboardingStore/onboarding.store';

export interface UserConfig {
  selectedOffers: OfferType[];
  businessName: string;
  qdrantCollectionName?: string;
  industry?: string;
  dataCollection?: string[];
  selectedIntentions?: string[];
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
    };
  } catch (error) {
    console.error('Error fetching user config:', error);
    return null;
  }
}
