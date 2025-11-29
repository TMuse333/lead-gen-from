
// lib/embedding.ts
import { OpenAI } from 'openai';
import dotenv from 'dotenv'
import { createBaseTrackingObject, updateTrackingWithResponse } from '@/lib/tokenUsage/createTrackingObject';
import { trackUsageAsync } from '@/lib/tokenUsage/trackUsage';
import type { EmbeddingUsage } from '@/types/tokenUsage.types';


dotenv.config({
  path:'../../.env'
})


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getEmbedding(text: string, metadata?: {
  userId?: string;
  adviceId?: string;
  adviceTitle?: string;
  collectionName?: string;
}) {
  const startTime = Date.now();
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  const endTime = Date.now();

  // Track usage if metadata provided
  if (metadata) {
    const baseTracking = createBaseTrackingObject({
      userId: metadata.userId,
      provider: 'openai',
      model: 'text-embedding-3-small',
      apiType: 'embedding',
      startTime,
    });

    const usage: EmbeddingUsage = {
      ...updateTrackingWithResponse(baseTracking, {
        inputTokens: 0,
        outputTokens: 0,
        embeddingTokens: response.usage?.total_tokens || 0,
        endTime,
      }),
      feature: 'embeddings.adviceUpload',
      apiType: 'embedding',
      model: 'text-embedding-3-small',
      featureData: {
        adviceId: metadata.adviceId,
        adviceTitle: metadata.adviceTitle,
        textLength: text.length,
        collectionName: metadata.collectionName,
      },
    };

    trackUsageAsync(usage);
  }

  return response.data[0].embedding;
}