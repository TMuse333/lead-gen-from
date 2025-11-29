// src/lib/qdrant/userCollections.ts
// Helper functions for per-user Qdrant collections

import { qdrant } from './client';

/**
 * Generate collection name from business name
 * Sanitizes the name to be Qdrant-safe (lowercase, no spaces, alphanumeric + hyphens)
 */
export function getUserCollectionName(businessName: string): string {
  // Sanitize: lowercase, replace spaces with hyphens, remove special chars
  const sanitized = businessName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .substring(0, 50); // Limit length
  
  return `user-${sanitized}-advice`;
}

/**
 * Ensure a user's Qdrant collection exists
 * Creates it if it doesn't exist
 */
export async function ensureUserCollection(businessName: string): Promise<string> {
  const collectionName = getUserCollectionName(businessName);
  
  try {
    const { collections } = await qdrant.getCollections();
    const exists = collections.some((col) => col.name === collectionName);
    
    if (!exists) {
      await qdrant.createCollection(collectionName, {
        vectors: {
          size: 1536, // OpenAI ada-002 embedding size
          distance: 'Cosine' as const,
          on_disk: true,
        },
        optimizers_config: {
          default_segment_number: 5,
          memmap_threshold: 20000,
        },
      });
      console.log('✅ Created Qdrant collection:', collectionName);
    } else {
      console.log('✅ Qdrant collection already exists:', collectionName);
      // If collection exists, we can optionally clear it or just use it
      // For now, we'll use the existing collection
    }
    
    return collectionName;
  } catch (error: any) {
    // Handle case where collection might already exist (race condition)
    if (error?.message?.includes('already exists') || error?.status === 409) {
      console.log('✅ Qdrant collection already exists (from error):', collectionName);
      return collectionName;
    }
    console.error('❌ Failed to ensure user collection:', error);
    throw error;
  }
}

/**
 * Delete a user's Qdrant collection
 */
export async function deleteUserCollection(businessName: string): Promise<void> {
  const collectionName = getUserCollectionName(businessName);
  
  try {
    await qdrant.deleteCollection(collectionName);
    console.log('✅ Deleted Qdrant collection:', collectionName);
  } catch (error) {
    console.error('❌ Failed to delete user collection:', error);
    throw error;
  }
}

/**
 * Check if a collection exists
 */
export async function collectionExists(businessName: string): Promise<boolean> {
  const collectionName = getUserCollectionName(businessName);
  
  try {
    const { collections } = await qdrant.getCollections();
    return collections.some((col) => col.name === collectionName);
  } catch (error) {
    console.error('❌ Failed to check collection existence:', error);
    return false;
  }
}

