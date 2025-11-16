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
    console.log(`\n🔍 [queryRelevantAdvice] Starting Qdrant search...`);
    console.log(`   Collection: ${ADVICE_COLLECTION}`);
    console.log(`   Agent ID: ${agentId}`);
    console.log(`   Flow: ${flow}`);
    console.log(`   Limit: ${limit}`);
    console.log(`   Embedding dimensions: ${embedding.length}`);

    const searchResult = await qdrant.search(ADVICE_COLLECTION, {
      vector: embedding,
      limit: limit * 3, // Get 3x candidates for filtering
      with_payload: true,
      // Optional: uncomment when you want hard agent filter
      // filter: {
      //   must: [{ key: 'agentId', match: { value: agentId } }],
      // },
    });

    console.log(`   ✅ Qdrant raw search returned ${searchResult.length} candidates`);

    if (searchResult.length === 0) {
      console.log('   ⚠️ No results from Qdrant at all!');
      console.log('   Possible issues:');
      console.log('   - Collection is empty');
      console.log('   - Embedding dimensions mismatch');
      console.log('   - Collection name incorrect');
      return [];
    }

    // Log raw results before filtering
    console.log('   Raw results (before filtering):');
    searchResult.forEach((result, i) => {
      const payload = result.payload as any;
      console.log(`   ${i + 1}. Score: ${result.score?.toFixed(3)} | Title: ${payload?.title || 'NO TITLE'}`);
      console.log(`      Flow: ${payload?.flow || 'none'} | Conditions: ${JSON.stringify(payload?.conditions || {})}`);
    });

    // Apply filters
    const filtered = searchResult
      .filter((result) => {
        const p = result.payload as any;

        // Flow check
        const flows: string[] = p?.flow || [];
        console.log(`   Checking flow for "${p?.title}": ${flows.join(', ')} (looking for: ${flow})`);
        
        if (flows.length > 0 && !flows.includes(flow)) {
          console.log(`      ❌ Flow mismatch - skipping`);
          return false;
        }

        // Conditions check (OR logic)
        const conditions: Record<string, string[]> = p?.conditions || {};
        if (Object.keys(conditions).length === 0) {
          console.log(`      ✅ No conditions - match (universal)`);
          return true;
        }

        const matched = Object.entries(conditions).some(([key, values]) => {
          const userVal = userInput[key];
          const conditionMet = userVal && values.includes(userVal);
          console.log(`      Condition "${key}": user=${userVal}, required=${values.join('|')} → ${conditionMet ? '✅' : '❌'}`);
          return conditionMet;
        });

        console.log(`      ${matched ? '✅' : '❌'} Overall conditions match: ${matched}`);
        return matched;
      })
      .slice(0, limit);

    console.log(`   ✅ After filtering: ${filtered.length} items match`);

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

    console.log(`   Final results:`);
    results.forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.title}`);
    });

    return results;
  } catch (error) {
    console.error('❌ [queryRelevantAdvice] Error:', error);
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