// src/lib/qdrant/collections/vector/agentKnowledge/queries.ts
/**
 * Agent Knowledge Query Functions
 *
 * Retrieves agent knowledge from Qdrant for contextual responses during:
 * - Objection handling
 * - Off-topic/chitchat responses
 * - Clarification requests
 * - Contact modal hesitation
 */

import { qdrant } from '../../../client';
import { getEmbedding } from '@/lib/openai/embedding';

export interface AgentKnowledgeResult {
  id: string;
  title: string;
  text: string;
  category?: string;
  chunkIndex: number;
  score: number;
}

export interface QueryAgentKnowledgeOptions {
  limit?: number;
  category?: string; // Filter by category (e.g., 'about', 'services', 'faq')
  minScore?: number; // Minimum similarity score (0-1)
}

/**
 * Query agent knowledge for relevant context
 * Used to provide contextual responses during objections, off-topic, and hesitation
 */
export async function queryAgentKnowledge(
  collectionName: string,
  queryText: string,
  options: QueryAgentKnowledgeOptions = {}
): Promise<AgentKnowledgeResult[]> {
  const { limit = 3, category, minScore = 0.5 } = options;

  try {
    // Generate embedding for the query
    const embedding = await getEmbedding(queryText);

    // Build filter conditions
    const mustConditions: any[] = [
      { key: 'source', match: { value: 'agent_knowledge' } },
    ];

    if (category) {
      mustConditions.push({ key: 'category', match: { value: category } });
    }

    // Search Qdrant
    const searchResult = await qdrant.search(collectionName, {
      vector: embedding,
      limit: limit * 2, // Get extra candidates for score filtering
      with_payload: true,
      filter: {
        must: mustConditions,
      },
    });

    if (searchResult.length === 0) {
      return [];
    }

    // Filter by minimum score and transform results
    const results: AgentKnowledgeResult[] = searchResult
      .filter((result) => result.score >= minScore)
      .slice(0, limit)
      .map((result) => {
        const payload = result.payload as any;
        return {
          id: result.id as string,
          title: payload?.title || '',
          text: payload?.text || '',
          category: payload?.category,
          chunkIndex: payload?.chunkIndex || 0,
          score: result.score,
        };
      });

    return results;
  } catch (error) {
    console.error('[AgentKnowledge] Query failed:', error);
    return [];
  }
}

/**
 * Query agent knowledge specifically for value propositions
 * Used when user hesitates in contact modal
 */
export async function queryValuePropositions(
  collectionName: string,
  userContext: string,
  limit = 2
): Promise<AgentKnowledgeResult[]> {
  return queryAgentKnowledge(collectionName, userContext, {
    limit,
    category: 'value-proposition',
    minScore: 0.4,
  });
}

/**
 * Query agent knowledge for FAQ-style responses
 * Used for clarification questions
 */
export async function queryFAQKnowledge(
  collectionName: string,
  question: string,
  limit = 2
): Promise<AgentKnowledgeResult[]> {
  return queryAgentKnowledge(collectionName, question, {
    limit,
    category: 'faq',
    minScore: 0.5,
  });
}

/**
 * Query stories for social proof and testimonials
 * Stories have kind: 'story' and include situation/action/outcome structure
 */
export async function queryStories(
  collectionName: string,
  queryText: string,
  limit = 2
): Promise<AgentKnowledgeResult[]> {
  try {
    const embedding = await getEmbedding(queryText);

    const searchResult = await qdrant.search(collectionName, {
      vector: embedding,
      limit: limit * 2,
      with_payload: true,
      filter: {
        must: [{ key: 'kind', match: { value: 'story' } }],
      },
    });

    return searchResult
      .filter((result) => result.score >= 0.4)
      .slice(0, limit)
      .map((result) => {
        const payload = result.payload as any;
        return {
          id: result.id as string,
          title: payload?.title || '',
          text: payload?.advice || payload?.text || '',
          category: 'stories',
          chunkIndex: 0,
          score: result.score,
          // Story-specific fields
          situation: payload?.situation,
          action: payload?.action,
          outcome: payload?.outcome,
        };
      });
  } catch (error) {
    console.error('[AgentKnowledge] Story query failed:', error);
    return [];
  }
}

/**
 * Query tips and advice
 * Tips have kind: 'tip' with advice text
 */
export async function queryTips(
  collectionName: string,
  queryText: string,
  limit = 2
): Promise<AgentKnowledgeResult[]> {
  try {
    const embedding = await getEmbedding(queryText);

    const searchResult = await qdrant.search(collectionName, {
      vector: embedding,
      limit: limit * 2,
      with_payload: true,
      filter: {
        must: [{ key: 'kind', match: { value: 'tip' } }],
      },
    });

    return searchResult
      .filter((result) => result.score >= 0.4)
      .slice(0, limit)
      .map((result) => {
        const payload = result.payload as any;
        return {
          id: result.id as string,
          title: payload?.title || '',
          text: payload?.advice || payload?.text || '',
          category: 'tips',
          chunkIndex: 0,
          score: result.score,
        };
      });
  } catch (error) {
    console.error('[AgentKnowledge] Tips query failed:', error);
    return [];
  }
}

/**
 * Query testimonials for trust-building
 */
export async function queryTestimonials(
  collectionName: string,
  context: string,
  limit = 2
): Promise<AgentKnowledgeResult[]> {
  return queryAgentKnowledge(collectionName, context, {
    limit,
    category: 'testimonials',
    minScore: 0.4,
  });
}

/**
 * Query "about" knowledge for personality and background
 */
export async function queryAboutKnowledge(
  collectionName: string,
  context: string,
  limit = 2
): Promise<AgentKnowledgeResult[]> {
  return queryAgentKnowledge(collectionName, context, {
    limit,
    category: 'about',
    minScore: 0.4,
  });
}

/**
 * Smart knowledge retrieval based on intent
 * Returns combined relevant knowledge from multiple sources
 */
export async function queryKnowledgeForIntent(
  collectionName: string,
  queryText: string,
  intent: string,
  objectionType?: string
): Promise<{
  agentKnowledge: AgentKnowledgeResult[];
  stories: AgentKnowledgeResult[];
  tips: AgentKnowledgeResult[];
}> {
  const results = {
    agentKnowledge: [] as AgentKnowledgeResult[],
    stories: [] as AgentKnowledgeResult[],
    tips: [] as AgentKnowledgeResult[],
  };

  try {
    switch (intent) {
      case 'objection':
        // For objections, fetch testimonials, value props, and relevant stories
        const [testimonials, valueProps, objectionStories] = await Promise.all([
          objectionType === 'trust_issue'
            ? queryTestimonials(collectionName, queryText, 2)
            : Promise.resolve([]),
          queryValuePropositions(collectionName, queryText, 2),
          queryStories(collectionName, queryText, 1),
        ]);
        results.agentKnowledge = [...testimonials, ...valueProps];
        results.stories = objectionStories;
        break;

      case 'clarification_question':
        // For clarifications, fetch FAQ and relevant tips
        const [faq, clarificationTips] = await Promise.all([
          queryFAQKnowledge(collectionName, queryText, 2),
          queryTips(collectionName, queryText, 2),
        ]);
        results.agentKnowledge = faq;
        results.tips = clarificationTips;
        break;

      case 'chitchat':
      case 'off_topic':
        // For off-topic, fetch about info and general knowledge to steer back
        const [about, general] = await Promise.all([
          queryAboutKnowledge(collectionName, queryText, 1),
          queryAgentKnowledge(collectionName, queryText, { limit: 2, minScore: 0.4 }),
        ]);
        results.agentKnowledge = [...about, ...general];
        break;

      case 'direct_answer':
      case 'multi_answer':
        // For direct answers, optionally fetch relevant context for warmer acknowledgment
        results.agentKnowledge = await queryAgentKnowledge(collectionName, queryText, {
          limit: 1,
          minScore: 0.6 // Higher threshold - only use if very relevant
        });
        break;

      default:
        // Generic fallback
        results.agentKnowledge = await queryAgentKnowledge(collectionName, queryText, {
          limit: 2,
          minScore: 0.4
        });
    }
  } catch (error) {
    console.error('[AgentKnowledge] Intent-based query failed:', error);
  }

  return results;
}

/**
 * Format knowledge results into a context string for LLM prompts
 */
export function formatKnowledgeContext(
  knowledge: {
    agentKnowledge: AgentKnowledgeResult[];
    stories: AgentKnowledgeResult[];
    tips: AgentKnowledgeResult[];
  },
  intent: string
): string {
  const sections: string[] = [];

  if (knowledge.agentKnowledge.length > 0) {
    const knowledgeText = knowledge.agentKnowledge
      .map((k) => `• ${k.title}: ${k.text}`)
      .join('\n');
    sections.push(`Business Knowledge:\n${knowledgeText}`);
  }

  if (knowledge.stories.length > 0) {
    const storiesText = knowledge.stories
      .map((s: any) => {
        if (s.situation && s.outcome) {
          return `• "${s.title}": Client was ${s.situation}. Result: ${s.outcome}`;
        }
        return `• ${s.title}: ${s.text}`;
      })
      .join('\n');
    sections.push(`Success Stories (use for social proof):\n${storiesText}`);
  }

  if (knowledge.tips.length > 0) {
    const tipsText = knowledge.tips
      .map((t) => `• ${t.title}: ${t.text}`)
      .join('\n');
    sections.push(`Expert Tips:\n${tipsText}`);
  }

  if (sections.length === 0) {
    return '';
  }

  // Intent-specific instructions
  let instructions = '';
  switch (intent) {
    case 'objection':
      instructions = 'Use this knowledge to address their concern with empathy. Reference specific examples or testimonials if relevant.';
      break;
    case 'clarification_question':
      instructions = 'Use this knowledge to provide a helpful, accurate answer. Keep it conversational.';
      break;
    case 'chitchat':
    case 'off_topic':
      instructions = 'You can briefly reference this context when steering back to the conversation.';
      break;
    default:
      instructions = 'Weave this context naturally into your response if relevant.';
  }

  return `\n\n--- PERSONALIZATION CONTEXT ---\n${instructions}\n\n${sections.join('\n\n')}`;
}

/**
 * Get all agent knowledge entries for a user (for dashboard listing)
 * Returns metadata only, not the full vector data
 */
export async function getAllAgentKnowledge(
  collectionName: string,
  limit = 100
): Promise<AgentKnowledgeResult[]> {
  try {
    const result = await qdrant.scroll(collectionName, {
      limit,
      with_payload: true,
      with_vector: false,
      filter: {
        must: [{ key: 'source', match: { value: 'agent_knowledge' } }],
      },
    });

    // Group by entryId to get unique entries (since each entry has multiple chunks)
    const entriesByEntryId = new Map<string, AgentKnowledgeResult>();

    for (const point of result.points) {
      const payload = point.payload as any;
      const entryId = payload?.entryId;

      // Only keep the first chunk of each entry for listing
      if (entryId && !entriesByEntryId.has(entryId)) {
        entriesByEntryId.set(entryId, {
          id: entryId,
          title: payload?.title || '',
          text: payload?.text || '',
          category: payload?.category,
          chunkIndex: payload?.chunkIndex || 0,
          score: 1, // Not from search, so no score
        });
      }
    }

    return Array.from(entriesByEntryId.values());
  } catch (error) {
    console.error('[AgentKnowledge] Get all failed:', error);
    return [];
  }
}
