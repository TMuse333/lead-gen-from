// lib/personalization/context.ts

import { ComponentSchema, KnowledgeSet } from '@/types/schemas';
import { generateUserEmbedding } from '../openai/userEmbedding';
import { queryRelevantAdvice } from '../qdrant';
import { getAllActionSteps } from '../qdrant/collections/rules/actionSteps/admin';
import { calculateMatchScore } from '../qdrant/engines/rules';
import { PersonalizedAdviceResult, QdrantRetrievalMetadata } from '@/types/qdrant.types';

export async function getPersonalizedAdvice(
  agentId: string,
  flow: string,
  userInput: Record<string, string>,
  knowledgeSets: KnowledgeSet[] = []
): Promise<PersonalizedAdviceResult> {
  console.log('\n🔍 [getPersonalizedAdvice] Starting retrieval...');
  console.log('   Agent ID:', agentId);
  console.log('   Flow:', flow);
  console.log('   User Input:', userInput);
  console.log('   Knowledge Sets:', knowledgeSets);

  const allAdvice: string[] = [];
  const metadata: QdrantRetrievalMetadata[] = [];
  
  if (knowledgeSets.length === 0) {
    console.log('⚠️ [getPersonalizedAdvice] No knowledge sets provided!');
    return { advice: [], metadata: [] };
  }

  for (const knowledgeSet of knowledgeSets) {
    console.log(`\n📦 [${knowledgeSet.name}] Processing collection (${knowledgeSet.type})...`);
    
    if (knowledgeSet.type === 'vector') {
      console.log('   🔮 Using vector search...');
      
      try {
        // Generate embedding
        console.log('   Generating embedding...');
        const embedding = await generateUserEmbedding(flow, userInput);
        console.log(`   ✅ Embedding generated: ${embedding.length} dimensions`);
        console.log(`   First 5 values: [${embedding.slice(0, 5).join(', ')}...]`);
        
        // Query Qdrant - use collection name from knowledgeSet if provided
        const collectionName = knowledgeSet.name; // knowledgeSet.name should be the Qdrant collection name
        console.log('   Querying Qdrant...');
        console.log(`   Using collection: ${collectionName}`);
        const adviceItems = await queryRelevantAdvice(agentId, embedding, flow, userInput, 5, collectionName);
        console.log(`   ✅ Qdrant returned ${adviceItems.length} items`);
        
        if (adviceItems.length === 0) {
          console.log('   ⚠️ No advice items returned from Qdrant!');
          console.log('   Possible reasons:');
          console.log('   - Collection is empty');
          console.log('   - No items match the flow/conditions');
          console.log('   - Agent ID filter is too strict');
        } else {
          adviceItems.forEach((item, i) => {
            console.log(`   ${i + 1}. ${item.title}`);
            console.log(`      - Tags: ${item.tags?.join(', ') || 'none'}`);
            console.log(`      - Flow: ${item.applicableWhen?.flow?.join(', ') || 'any'}`);
          });
        }
        
        allAdvice.push(...adviceItems.map(item => `${item.title}: ${item.advice}`));
        
        metadata.push({
          collection: knowledgeSet.name,
          type: 'vector',
          count: adviceItems.length,
          items: adviceItems.map(item => ({
            id: item.id,
            title: item.title,
            advice: item.advice, 
            tags: item.tags,
          }))
        });
      } catch (error) {
        console.error(`   ❌ Error in vector search for ${knowledgeSet.name}:`, error);
      }
      
    } else if (knowledgeSet.type === 'rule') {
      console.log('   📏 Using rule-based search...');
      
      try {
        // Get all action steps
        console.log('   Fetching all action steps...');
        const actionSteps = await getAllActionSteps(agentId);
        console.log(`   ✅ Retrieved ${actionSteps.length} total action steps from DB`);
        
        if (actionSteps.length === 0) {
          console.log('   ⚠️ No action steps in database for agent:', agentId);
        } else {
          console.log('   Calculating match scores...');
          
          const matches = actionSteps
            .map(step => {
              const score = calculateMatchScore(step, userInput, flow as "buy" | "sell" | 'browse');
              console.log(`      - ${step.title}: score ${score.toFixed(2)}`);
              return { step, score };
            })
            .filter(({ score }) => {
              const matched = score > 0;
              if (!matched) {
                console.log(`      ❌ Filtered out (score: ${score.toFixed(2)})`);
              }
              return matched;
            })
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);
          
          console.log(`   ✅ Matched ${matches.length} action steps after filtering`);
          
          if (matches.length === 0) {
            console.log('   ⚠️ No action steps matched the rules!');
            console.log('   Flow:', flow);
            console.log('   User input keys:', Object.keys(userInput));
            console.log('   Check if action steps have matching flow and rule conditions');
          }
          
          allAdvice.push(...matches.map(({ step }) => `${step.title}: ${step.description}`));
          
          metadata.push({
            collection: knowledgeSet.name,
            type: 'rule',
            count: matches.length,
            items: matches.map(({ step, score }) => ({
              id: step.id,
              title: step.title,
              description: step.description,
              score,
              matchedRules: step.applicableWhen,
            }))
          });
        }
      } catch (error) {
        console.error(`   ❌ Error in rule-based search for ${knowledgeSet.name}:`, error);
      }
    }
  }
  
  console.log('\n✅ [getPersonalizedAdvice] Retrieval complete');
  console.log(`   Total advice items: ${allAdvice.length}`);
  console.log(`   Collections processed: ${metadata.length}`);
  
  return { advice: allAdvice, metadata };
}

export async function getComponentAdvice(
  agentId: string,
  schema: ComponentSchema,
  flow: string,
  userInput: Record<string, string>
): Promise<string[]> {
  if (!schema.personalization?.retrieveFrom) {
    return [];
  }
  
  const { advice } = await getPersonalizedAdvice(
    agentId, 
    flow, 
    userInput,
    schema.personalization.retrieveFrom
  );
  
  return advice;
}

export function formatAdviceForPrompt(advice: string[]): string {
  if (advice.length === 0) {
    return 'None provided';
  }
  
  return advice.map((item, index) => `${index + 1}. ${item}`).join('\n');
}