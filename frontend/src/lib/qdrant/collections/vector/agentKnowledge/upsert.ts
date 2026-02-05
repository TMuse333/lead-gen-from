// src/lib/qdrant/collections/vector/agentKnowledge/upsert.ts
/**
 * Agent Knowledge Upsert Functions
 *
 * Stores agent knowledge (website copy, FAQs, value propositions) in Qdrant
 * with proper chunking and embedding generation.
 */

import { qdrant } from '../../../client';
import { getEmbedding } from '@/lib/openai/embedding';
import { criticalError } from '@/lib/logger';

export interface AgentKnowledgeChunk {
  entryId: string;
  title: string;
  text: string;
  category?: string;
  chunkIndex: number;
}

export interface StoreAgentKnowledgeParams {
  collectionName: string;
  entryId: string;
  title: string;
  chunks: string[]; // Pre-chunked text
  category?: string;
  userId?: string; // For tracking
}

/**
 * Store agent knowledge chunks in Qdrant
 * Each chunk is stored as a separate point with the same entryId
 */
export async function storeAgentKnowledge({
  collectionName,
  entryId,
  title,
  chunks,
  category,
  userId,
}: StoreAgentKnowledgeParams): Promise<string[]> {
  try {
    const pointIds: string[] = [];

    // Process chunks in parallel for speed
    const embeddings = await Promise.all(
      chunks.map((chunk, index) =>
        getEmbedding(`${title}. ${chunk}`, {
          userId,
          adviceTitle: `${title} (chunk ${index + 1})`,
          collectionName,
        })
      )
    );

    // Prepare points for batch upsert
    const points = chunks.map((chunk, index) => {
      const pointId = `${entryId}-chunk-${index}`;
      pointIds.push(pointId);

      return {
        id: pointId,
        vector: embeddings[index],
        payload: {
          source: 'agent_knowledge',
          entryId,
          title,
          text: chunk,
          category: category || 'general',
          chunkIndex: index,
          createdAt: new Date().toISOString(),
        },
      };
    });

    // Batch upsert all chunks
    await qdrant.upsert(collectionName, {
      wait: true,
      points,
    });

    return pointIds;
  } catch (error) {
    criticalError('QdrantAgentKnowledgeUpsert', error);
    throw error;
  }
}

/**
 * Delete all chunks for an agent knowledge entry
 */
export async function deleteAgentKnowledge(
  collectionName: string,
  entryId: string
): Promise<void> {
  try {
    // Delete all points with this entryId
    await qdrant.delete(collectionName, {
      wait: true,
      filter: {
        must: [
          { key: 'source', match: { value: 'agent_knowledge' } },
          { key: 'entryId', match: { value: entryId } },
        ],
      },
    });
  } catch (error) {
    criticalError('QdrantAgentKnowledgeDelete', error);
    throw error;
  }
}

/**
 * Update agent knowledge by deleting old chunks and storing new ones
 */
export async function updateAgentKnowledge(
  params: StoreAgentKnowledgeParams
): Promise<string[]> {
  // Delete existing chunks first
  await deleteAgentKnowledge(params.collectionName, params.entryId);

  // Store new chunks
  return storeAgentKnowledge(params);
}
