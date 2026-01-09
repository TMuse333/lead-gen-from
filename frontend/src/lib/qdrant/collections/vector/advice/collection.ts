// src/lib/qdrant/collections/vector/advice/advice.collection.ts

import { qdrant } from '../../../client';
import { criticalError } from '@/lib/logger';

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
    }
  } catch (error) {
    criticalError('QdrantAdviceCollection', error);
    throw error;
  }
}