// lib/personalization.ts


import { ComponentSchema } from '@/types/schemas';
import { generateUserEmbedding } from '../openai/userEmbedding';
import { queryRelevantAdvice } from '../qdrant';

/**
 * Retrieves personalized advice from Qdrant based on user input
 */
export async function getPersonalizedAdvice(
  agentId: string,
  flow: string,
  userInput: Record<string, string>
): Promise<string[]> {
  try {
    // Generate embedding from user input
    const embedding = await generateUserEmbedding(flow, userInput);
    
    // Query Qdrant for relevant advice
    const adviceItems = await queryRelevantAdvice(
      agentId,
      embedding,
      flow,
      userInput,
      5 // limit to top 5 most relevant pieces
    );
    
    // Format advice for prompt injection
    const formattedAdvice = adviceItems.map((item) => 
      `${item.title}: ${item.advice}`
    );
    
    console.log(`📚 Retrieved ${formattedAdvice.length} advice items for ${flow} flow`);
    
    return formattedAdvice;
  } catch (error) {
    console.error('Error retrieving personalized advice:', error);
    return []; // Gracefully degrade to empty array
  }
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
  
  // For now, we're using the generic advice collection
  // Later you can filter by schema.personalization.retrieveFrom
  return getPersonalizedAdvice(agentId, flow, userInput);
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