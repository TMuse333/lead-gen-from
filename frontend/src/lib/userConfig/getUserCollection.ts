// src/lib/userConfig/getUserCollection.ts
// Helper function to get user's Qdrant collection name from MongoDB

import { getClientConfigsCollection } from '@/lib/mongodb/db';

export async function getUserCollectionName(userId: string): Promise<string | null> {
  try {
    const collection = await getClientConfigsCollection();
    const userConfig = await collection.findOne({ userId });
    return userConfig?.qdrantCollectionName || null;
  } catch (error) {
    console.error('Error fetching user collection:', error);
    return null;
  }
}

