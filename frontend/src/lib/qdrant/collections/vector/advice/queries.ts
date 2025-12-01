// src/lib/qdrant/collections/vector/advice/advice.queries.ts

import { qdrant } from '../../../client';
import { ADVICE_COLLECTION } from './collection';
import { AgentAdviceScenario } from '@/types';
import { calculateMatchScore } from '../../../engines/rules';
import { getAdviceTypeFromTags, DEFAULT_ADVICE_TYPE } from '@/types/advice.types';

export async function queryRelevantAdvice(
  agentId: string,
  embedding: number[],
  flow: string,
  userInput: Record<string, string>,
  limit: number = 5,
  collectionName?: string // Optional: if not provided, uses default ADVICE_COLLECTION
): Promise<AgentAdviceScenario[]> {
  try {
    const collection = collectionName || ADVICE_COLLECTION;
    
    console.log(`\n🔍 [queryRelevantAdvice] Starting Qdrant search...`);
    console.log(`   Collection: ${collection}`);
    console.log(`   Agent ID: ${agentId}`);
    console.log(`   Flow: ${flow}`);
    console.log(`   Limit: ${limit}`);
    console.log(`   Embedding dimensions: ${embedding.length}`);

    const searchResult = await qdrant.search(collection, {
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

        // Priority 1: Check ruleGroups if present (complex rules)
        const ruleGroups = p?.ruleGroups;
        if (ruleGroups && Array.isArray(ruleGroups) && ruleGroups.length > 0) {
          console.log(`      📋 Evaluating rule groups (${ruleGroups.length} group(s))...`);
          const score = calculateMatchScore(
            {
              applicableWhen: {
                flow: flows,
                ruleGroups: ruleGroups,
              },
            },
            userInput,
            flow as 'sell' | 'buy' | 'browse'
          );
          const matched = score > 0;
          console.log(`      ${matched ? '✅' : '❌'} Rule groups match: ${matched} (score: ${score.toFixed(2)})`);
          return matched;
        }

        // Priority 2: Check simple conditions (OR logic) if no ruleGroups
        const conditions: Record<string, string[]> = p?.conditions || {};
        if (Object.keys(conditions).length === 0) {
          console.log(`      ✅ No conditions or rules - match (universal)`);
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

    const results: AgentAdviceScenario[] = filtered.map((r) => {
      const payload = r.payload as any;
      const tags = (payload?.tags as string[]) || [];
      const type = payload?.type || getAdviceTypeFromTags(tags);
      
      return {
        id: r.id as string,
        agentId: payload?.agentId,
        title: payload?.title,
        tags,
        advice: payload?.advice,
        type, // Include type in result
        applicableWhen: {
          flow: payload?.flow,
          conditions: payload?.conditions,
          ruleGroups: payload?.ruleGroups, // Include ruleGroups if present
        },
        createdAt: new Date(payload?.createdAt),
        updatedAt: payload?.updatedAt
          ? new Date(payload?.updatedAt)
          : undefined,
        usageCount: payload?.usageCount,
      };
    });

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

    return result.points.map((point) => {
      const payload = point.payload as any;
      const tags = (payload?.tags as string[]) || [];
      const type = payload?.type || getAdviceTypeFromTags(tags);
      
      return {
        id: point.id as string,
        agentId: payload?.agentId,
        title: payload?.title,
        tags,
        advice: payload?.advice,
        type, // Include type in result
        applicableWhen: {
          flow: payload?.flow,
          conditions: payload?.conditions,
          ruleGroups: payload?.ruleGroups, // Include ruleGroups if present
        },
        createdAt: new Date(payload?.createdAt),
        updatedAt: payload?.updatedAt
          ? new Date(payload?.updatedAt)
          : undefined,
        usageCount: payload?.usageCount,
      };
    });
  } catch (error) {
    console.error('Error fetching agent advice:', error);
    return [];
  }
}