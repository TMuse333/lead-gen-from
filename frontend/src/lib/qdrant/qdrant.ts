// ============================================
// QDRANT CLIENT - Vector Database for Agent Advice
// ============================================

import { QdrantClient } from '@qdrant/js-client-rest';
import { AgentAdviceScenario, UserProfile } from '@/types';

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
 * Store agent advice in Qdrant with vector embedding
 */
export async function storeAgentAdvice(
  agentId: string,
  scenario: string,
  advice: string,
  embedding: number[],
  metadata: {
    tags?: string[];
    propertyType?: string[];
    sellingReason?: string[];
    timeline?: string[];
  }
) {
  try {
    const point = {
      id: crypto.randomUUID(),
      vector: embedding,
      payload: {
        agentId,
        scenario,
        advice,
        ...metadata,
        createdAt: new Date().toISOString(),
      },
    };

    await qdrantClient.upsert(COLLECTION_NAME, {
      wait: true,
      points: [point],
    });

    console.log('✅ Stored advice in Qdrant:', scenario);
    return point.id;
  } catch (error) {
    console.error('Error storing advice in Qdrant:', error);
    throw error;
  }
}

/**
 * Query Qdrant for relevant agent advice based on user profile
 */
export async function queryRelevantAdvice(
  agentId: string,
  userProfile: UserProfile,
  embedding: number[],
  limit: number = 3
): Promise<AgentAdviceScenario[]> {
  try {
    console.log(`🔍 Searching Qdrant for advice matching: ${agentId}`);
    
    // Simple semantic search - no complex filters
    const searchResult = await qdrantClient.search(COLLECTION_NAME, {
      vector: embedding,
      limit: 10, // Get more, then filter in JS
      with_payload: true,
    });

    console.log(`📋 Qdrant returned ${searchResult.length} results`);

    // Filter by agentId in JavaScript (like your working GET route)
    const filtered = searchResult
      .filter((result) => result.payload?.agentId === agentId)
      .slice(0, limit); // Take only the top N after filtering

    // Map results to AgentAdviceScenario type
    const adviceScenarios: AgentAdviceScenario[] = filtered.map((result) => ({
      id: result.id as string,
      agentId: result.payload?.agentId as string,
      scenario: result.payload?.scenario as string,
      tags: (result.payload?.tags as string[]) || [],
      advice: result.payload?.advice as string,
      applicableWhen: {
        propertyType: result.payload?.propertyType as string[],
        sellingReason: result.payload?.sellingReason as string[],
        timeline: result.payload?.timeline as string[],
      },
      createdAt: new Date(result.payload?.createdAt as string),
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
 * Get all advice for a specific agent (for admin/dashboard)
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
      scenario: point.payload?.scenario as string,
      tags: (point.payload?.tags as string[]) || [],
      advice: point.payload?.advice as string,
      applicableWhen: {
        propertyType: point.payload?.propertyType as string[],
        sellingReason: point.payload?.sellingReason as string[],
        timeline: point.payload?.timeline as string[],
      },
      createdAt: new Date(point.payload?.createdAt as string),
    }));
  } catch (error) {
    console.error('Error fetching agent advice:', error);
    return [];
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