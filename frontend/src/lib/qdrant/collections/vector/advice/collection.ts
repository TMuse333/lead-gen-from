// src/lib/qdrant/collections/vector/advice/advice.collection.ts

import { qdrant } from '../../../client';

export const ADVICE_COLLECTION =
  process.env.QDRANT_COLLECTION_NAME || 'chris-crowell-lead-form';

export async function ensureAdviceCollection() {
  try {
    const { collections } = await qdrant.getCollections();
    const exists = collections.some((col) => col.name === ADVICE_COLLECTION);

    if (!exists) {
      await qdrant.createCollection(ADVICE_COLLECTION, {
        vectors: {
          size: 1536,
          distance: 'Cosine' as const,
          on_disk: true,
        },
        optimizers_config: {
          default_segment_number: 5,
          memmap_threshold: 20000,
        },
      });
      console.log('Created vector collection:', ADVICE_COLLECTION);
    }
  } catch (error) {
    console.error('Failed to ensure advice collection:', error);
    throw error;
  }
}