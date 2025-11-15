// lib/personalization.ts


import { ComponentSchema, KnowledgeSet } from '@/types/schemas';
import { generateUserEmbedding } from '../openai/userEmbedding';
import { queryRelevantAdvice } from '../qdrant';
import { getAllActionSteps } from '../qdrant/collections/rules/actionSteps/admin';
import { calculateMatchScore } from '../qdrant/engines/rules';

/**
 * Retrieves personalized advice from Qdrant based on user input
 */
 import { PersonalizedAdviceResult, QdrantRetrievalMetadata, QdrantRetrievalItem } from '@/types/qdrant.types';

 export async function getPersonalizedAdvice(
   agentId: string,
   flow: string,
   userInput: Record<string, string>,
   knowledgeSets: KnowledgeSet[] = []
 ): Promise<PersonalizedAdviceResult> {
   const allAdvice: string[] = [];
   const metadata: QdrantRetrievalMetadata[] = [];
   
   for (const knowledgeSet of knowledgeSets) {
     if (knowledgeSet.type === 'vector') {
       const embedding = await generateUserEmbedding(flow, userInput);
       const adviceItems = await queryRelevantAdvice(agentId, embedding, flow, userInput, 5);
       
       allAdvice.push(...adviceItems.map(item => `${item.title}: ${item.advice}`));
       
       metadata.push({
         collection: knowledgeSet.name,
         type: 'vector',
         count: adviceItems.length,
         items: adviceItems.map(item => ({
           id: item.id,
           title: item.title,
           tags: item.tags,
         }))
       });
       
     } else {
       const actionSteps = await getAllActionSteps(agentId);
       const matches = actionSteps
         .map(step => ({ step, score: calculateMatchScore(step, userInput, flow as 'buy' | 'sell' | 'browse') }))
         .filter(({ score }) => score > 0)
         .sort((a, b) => b.score - a.score)
         .slice(0, 5);
       
       allAdvice.push(...matches.map(({ step }) => `${step.title}: ${step.description}`));
       
       metadata.push({
         collection: knowledgeSet.name,
         type: 'rule',
         count: matches.length,
         items: matches.map(({ step, score }) => ({
           id: step.id,
           title: step.title,
           score,
           matchedRules: step.applicableWhen,
         }))
       });
     }
   }
   
   return { advice: allAdvice, metadata };
 }

/**
 * Gets advice specifically for a component if it has personalization config
 */
 export async function getComponentAdvice(
  agentId: string,
  schema: ComponentSchema,
  flow: string,
  userInput: Record<string, string>
): Promise<string[]> {
  // Check if this component has personalization requirements
  if (!schema.personalization?.retrieveFrom) {
    return [];
  }
  
  // Get advice and extract just the string array
  const { advice } = await getPersonalizedAdvice(
    agentId, 
    flow, 
    userInput,
    schema.personalization.retrieveFrom  // Pass the knowledge sets
  );
  
  return advice;  // Return just the advice strings, not metadata
}

/**
 * Build a formatted advice section for the prompt
 */
export function formatAdviceForPrompt(advice: string[]): string {
  if (advice.length === 0) {
    return 'None provided';
  }
  
  return advice.map((item, index) => `${index + 1}. ${item}`).join('\n');
}