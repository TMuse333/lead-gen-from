// src/lib/qdrant/collections/vector/advice/advice.queries.ts

import { qdrant } from '../../../client';
import { ADVICE_COLLECTION } from './collection';
import { AgentAdviceScenario } from '@/types';

export async function queryRelevantAdvice(
  agentId: string,
  embedding: number[],
  flow: string,
  userInput: Record<string, string>,
  limit: number = 5
): Promise<AgentAdviceScenario[]> {
  try {
    console.log(`Searching advice for flow: ${flow}`);

    const searchResult = await qdrant.search(ADVICE_COLLECTION, {
      vector: embedding,
      limit: limit * 3,
      with_payload: true,
      // Optional: uncomment when you want hard agent filter
      // filter: {
      //   must: [{ key: 'agentId', match: { value: agentId } }],
      // },
    });

    console.log(`Qdrant returned ${searchResult.length} candidates`);

    const filtered = searchResult
      .filter((result) => {
        const p = result.payload as any;

        // Flow check
        const flows: string[] = p?.flow || [];
        if (flows.length > 0 && !flows.includes(flow)) return false;

        // Conditions check (OR logic)
        const conditions: Record<string, string[]> = p?.conditions || {};
        if (Object.keys(conditions).length === 0) return true;

        return Object.entries(conditions).some(([key, values]) => {
          const userVal = userInput[key];
          return userVal && values.includes(userVal);
        });
      })
      .slice(0, limit);

    const results: AgentAdviceScenario[] = filtered.map((r) => ({
      id: r.id as string,
      agentId: (r.payload as any)?.agentId,
      title: (r.payload as any)?.title,
      tags: ((r.payload as any)?.tags as string[]) || [],
      advice: (r.payload as any)?.advice,
      applicableWhen: {
        flow: (r.payload as any)?.flow,
        conditions: (r.payload as any)?.conditions,
      },
      createdAt: new Date((r.payload as any)?.createdAt),
      updatedAt: (r.payload as any)?.updatedAt
        ? new Date((r.payload as any)?.updatedAt)
        : undefined,
      usageCount: (r.payload as any)?.usageCount,
    }));

    console.log(`Returning ${results.length} relevant advice items`);
    return results;
  } catch (error) {
    console.error('Error in queryRelevantAdvice:', error);
    return [];
  }
}

export async function getAgentAdvice(
  agentId: string,
  limit = 100
): Promise<AgentAdviceScenario[]> {
  try {
    const result = await qdrant.scroll(ADVICE_COLLECTION, {
      limit,
      with_payload: true,
      with_vector: false,
      filter: {
        must: [{ key: 'agentId', match: { value: agentId } }],
      },
    });

    return result.points.map((point) => ({
      id: point.id as string,
      agentId: (point.payload as any)?.agentId,
      title: (point.payload as any)?.title,
      tags: ((point.payload as any)?.tags as string[]) || [],
      advice: (point.payload as any)?.advice,
      applicableWhen: {
        flow: (point.payload as any)?.flow,
        conditions: (point.payload as any)?.conditions,
      },
      createdAt: new Date((point.payload as any)?.createdAt),
      updatedAt: (point.payload as any)?.updatedAt
        ? new Date((point.payload as any)?.updatedAt)
        : undefined,
      usageCount: (point.payload as any)?.usageCount,
    }));
  } catch (error) {
    console.error('Error fetching agent advice:', error);
    return [];
  }
}