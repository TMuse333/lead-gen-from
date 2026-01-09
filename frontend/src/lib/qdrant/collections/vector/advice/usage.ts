// src/lib/qdrant/collections/vector/advice/advice.usage.ts

import { qdrant } from '../../../client';
import { ADVICE_COLLECTION } from './collection';

export async function incrementAdviceUsage(adviceId: string) {
  try {
    const points = await qdrant.retrieve(ADVICE_COLLECTION, {
      ids: [adviceId],
      with_payload: true,
    });

    if (points.length === 0) {
      console.warn(`Advice ${adviceId} not found`);
      return;
    }

    const current = (points[0].payload as any)?.usageCount || 0;

    await qdrant.setPayload(ADVICE_COLLECTION, {
      points: [adviceId],
      payload: {
        usageCount: current + 1,
        lastUsed: new Date().toISOString(),
      },
    });
  } catch {
    // Non-critical - usage tracking failure shouldn't break the app
  }
}