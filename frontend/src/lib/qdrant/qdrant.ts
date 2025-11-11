// ============================================
// QDRANT CLIENT - Vector Database for Agent Advice
// ============================================

import { QdrantClient } from '@qdrant/js-client-rest';
import { AgentAdviceScenario } from '@/types';

// Initialize Qdrant client
const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL || 'http://localhost:6333',
  apiKey: process.env.QDRANT_API_KEY,
});

const COLLECTION_NAME = process.env.QDRANT_COLLECTION_NAME || 'chris-crowell-lead-form';

/**
 * Initialize the Qdrant collection (run this once during setup)
 */
export async function initializeQdrantCollection() {
  try {
    // Check if collection exists
    const collections = await qdrantClient.getCollections();
    const exists = collections.collections.some(
      (col) => col.name === COLLECTION_NAME
    );

    if (!exists) {
      // Create collection with 1536 dimensions (OpenAI ada-002 embedding size)
      await qdrantClient.createCollection(COLLECTION_NAME, {
        vectors: {
          size: 1536,
          distance: 'Cosine',
        },
      });
      console.log('✅ Qdrant collection created:', COLLECTION_NAME);
    }
  } catch (error) {
    console.error('Error initializing Qdrant collection:', error);
    throw error;
  }
}

/**
 * Store agent advice in Qdrant with vector embedding (NEW STRUCTURE)
 */
export async function storeAgentAdvice(
  agentId: string,
  title: string,
  advice: string,
  embedding: number[],
  metadata: {
    tags?: string[];
    flow?: string[];
    conditions?: Record<string, string[]>;
  }
) {
  try {
    const point = {
      id: crypto.randomUUID(),
      vector: embedding,
      payload: {
        agentId,
        title,
        advice,
        tags: metadata.tags || [],
        flow: metadata.flow || [],
        conditions: metadata.conditions || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0,
      },
    };

    await qdrantClient.upsert(COLLECTION_NAME, {
      wait: true,
      points: [point],
    });

    console.log('✅ Stored advice in Qdrant:', title);
    return point.id;
  } catch (error) {
    console.error('Error storing advice in Qdrant:', error);
    throw error;
  }
}

/**
 * Query Qdrant for relevant agent advice based on user profile (NEW STRUCTURE)
 */
export async function queryRelevantAdvice(
  agentId: string,
  embedding: number[],
  flow: string,
  userInput: Record<string, string>,
  limit: number = 5
): Promise<AgentAdviceScenario[]> {
  try {
    console.log(`🔍 Searching Qdrant for advice matching flow: ${flow}`);
    
    // Semantic search with agentId filter
    const searchResult = await qdrantClient.search(COLLECTION_NAME, {
      vector: embedding,
      limit: limit * 3, // Get more results for filtering
      with_payload: true,
      filter: {
        must: [
          {
            key: 'agentId',
            match: { value: agentId },
          },
        ],
      },
    });

    console.log(`📋 Qdrant returned ${searchResult.length} results`);

    // Filter by applicability in JavaScript
    const filtered = searchResult
      .filter((result) => {
        const payload = result.payload;
        
        // Check flow match
        const adviceFlows = payload?.flow as string[] | undefined;
        if (adviceFlows && adviceFlows.length > 0 && !adviceFlows.includes(flow)) {
          return false;
        }

        // Check conditions match (OR logic - at least one condition must match)
        const conditions = payload?.conditions as Record<string, string[]> | undefined;
        
        if (!conditions || Object.keys(conditions).length === 0) {
          // No conditions = applies to all
          return true;
        }

        // Check if any condition matches
        for (const [key, allowedValues] of Object.entries(conditions)) {
          const userValue = userInput[key];
          if (userValue && allowedValues.includes(userValue)) {
            return true; // At least one condition matched
          }
        }

        return false; // No conditions matched
      })
      .slice(0, limit);

    // Map results to AgentAdviceScenario type
    const adviceScenarios: AgentAdviceScenario[] = filtered.map((result) => ({
      id: result.id as string,
      agentId: result.payload?.agentId as string,
      title: result.payload?.title as string,
      tags: (result.payload?.tags as string[]) || [],
      advice: result.payload?.advice as string,
      applicableWhen: {
        flow: result.payload?.flow as string[] | undefined,
        conditions: result.payload?.conditions as Record<string, string[]> | undefined,
      },
      createdAt: new Date(result.payload?.createdAt as string),
      updatedAt: result.payload?.updatedAt ? new Date(result.payload.updatedAt as string) : undefined,
      usageCount: result.payload?.usageCount as number | undefined,
      embedding: undefined,
    }));

    console.log(`✅ Found ${adviceScenarios.length} relevant advice pieces after filtering`);
    return adviceScenarios;
  } catch (error) {
    console.error('Error querying Qdrant:', error);
    // Return empty array on error rather than crashing
    return [];
  }
}

/**
 * Get all advice for a specific agent (for admin/dashboard) (NEW STRUCTURE)
 */
export async function getAgentAdvice(
  agentId: string,
  limit: number = 100
): Promise<AgentAdviceScenario[]> {
  try {
    const result = await qdrantClient.scroll(COLLECTION_NAME, {
      filter: {
        must: [
          {
            key: 'agentId',
            match: { value: agentId },
          },
        ],
      },
      limit,
      with_payload: true,
      with_vector: false,
    });

    return result.points.map((point) => ({
      id: point.id as string,
      agentId: point.payload?.agentId as string,
      title: point.payload?.title as string,
      tags: (point.payload?.tags as string[]) || [],
      advice: point.payload?.advice as string,
      applicableWhen: {
        flow: point.payload?.flow as string[] | undefined,
        conditions: point.payload?.conditions as Record<string, string[]> | undefined,
      },
      createdAt: new Date(point.payload?.createdAt as string),
      updatedAt: point.payload?.updatedAt ? new Date(point.payload.updatedAt as string) : undefined,
      usageCount: point.payload?.usageCount as number | undefined,
    }));
  } catch (error) {
    console.error('Error fetching agent advice:', error);
    return [];
  }
}

/**
 * Increment usage count when advice is used in generation
 */
export async function incrementAdviceUsage(adviceId: string) {
  try {
    // Fetch current point
    const points = await qdrantClient.retrieve(COLLECTION_NAME, {
      ids: [adviceId],
      with_payload: true,
    });

    if (points.length === 0) {
      console.warn(`⚠️  Advice ${adviceId} not found for usage increment`);
      return;
    }

    const currentCount = (points[0].payload?.usageCount as number) || 0;

    // Update with incremented count
    await qdrantClient.setPayload(COLLECTION_NAME, {
      points: [adviceId],
      payload: {
        usageCount: currentCount + 1,
        lastUsed: new Date().toISOString(),
      },
    });

    console.log(`✅ Incremented usage count for advice ${adviceId}: ${currentCount + 1}`);
  } catch (error) {
    console.error('Error incrementing advice usage:', error);
    // Don't throw - this is non-critical
  }
}

/**
 * Update existing advice
 */
export async function updateAdvice(
  adviceId: string,
  updates: {
    title?: string;
    advice?: string;
    tags?: string[];
    flow?: string[];
    conditions?: Record<string, string[]>;
    embedding?: number[];
  }
) {
  try {
    const payload: any = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // If embedding provided, update vector too
    if (updates.embedding) {
      await qdrantClient.upsert(COLLECTION_NAME, {
        wait: true,
        points: [
          {
            id: adviceId,
            vector: updates.embedding,
            payload,
          },
        ],
      });
    } else {
      // Just update payload
      await qdrantClient.setPayload(COLLECTION_NAME, {
        points: [adviceId],
        payload,
      });
    }

    console.log('✅ Updated advice:', adviceId);
  } catch (error) {
    console.error('Error updating advice:', error);
    throw error;
  }
}

/**
 * Delete advice by ID
 */
export async function deleteAdvice(adviceId: string) {
  try {
    await qdrantClient.delete(COLLECTION_NAME, {
      wait: true,
      points: [adviceId],
    });
    console.log('✅ Deleted advice:', adviceId);
  } catch (error) {
    console.error('Error deleting advice:', error);
    throw error;
  }
}

export { qdrantClient };