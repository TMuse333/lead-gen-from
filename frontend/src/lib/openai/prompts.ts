// lib/promptBuilder.ts

import { LANDING_PAGE_SCHEMAS } from "@/types/resultsPageComponents/components";
import { ComponentSchema } from "@/types/resultsPageComponents/schemas";



/**
 * Builds prompt text for a single schema
 */
function buildSingleSchemaPrompt(schema: ComponentSchema): string {
  let prompt = `  "${schema.componentName}": {\n`;
  prompt += `    // ${schema.description}\n`;
  
  Object.entries(schema.fields).forEach(([fieldName, fieldSchema]) => {
    const required = fieldSchema.required ? 'REQUIRED' : 'OPTIONAL';
    
    prompt += `    "${fieldName}": `;
    
    // Type hint
    if (fieldSchema.type === 'enum') {
      prompt += `"${fieldSchema.constraints?.options?.join(' | ')}"`;
    } else {
      prompt += fieldSchema.type;
    }
    
    prompt += ` (${required})`;
    
    // Constraints
    if (fieldSchema.constraints) {
      const parts = [];
      if (fieldSchema.constraints.wordCount) parts.push(fieldSchema.constraints.wordCount);
      if (fieldSchema.constraints.tone) parts.push(fieldSchema.constraints.tone);
      if (parts.length > 0) {
        prompt += `\n      [${parts.join(', ')}]`;
      }
    }
    
    // Description and context
    prompt += `\n      // ${fieldSchema.description}`;
    if (fieldSchema.context) {
      prompt += `\n      // ${fieldSchema.context}`;
    }
    if (fieldSchema.example) {
      prompt += `\n      // Example: "${fieldSchema.example}"`;
    }
    
    prompt += '\n';
  });
  
  prompt += `  }`;
  return prompt;
}

/**
 * Builds prompt text for multiple schemas
 */
export function buildSchemasPrompt(schemas: ComponentSchema[]): string {
  let prompt = '{\n';
  
  schemas.forEach((schema, index) => {
    prompt += buildSingleSchemaPrompt(schema);
    
    // Add comma if not last schema
    if (index < schemas.length - 1) {
      prompt += ',\n';
    } else {
      prompt += '\n';
    }
  });
  
  prompt += '}';
  return prompt;
}

/**
 * Generates the full prompt for landing page generation
 */
export function generateLandingPagePrompt(
  flow: string,
  userInput: Record<string, string>,
  marketData: any,
  agentKnowledge: string[],
  schemas: ComponentSchema[] = LANDING_PAGE_SCHEMAS  // Use registry by default
): string {
  // Extract user's first name from email if available
  const userName = userInput.email 
    ? userInput.email.split('@')[0].charAt(0).toUpperCase() + userInput.email.split('@')[0].slice(1)
    : null;
  
  const schemaPrompt = buildSchemasPrompt(schemas);
  
  return `You are Chris's AI assistant generating a personalized real estate landing page.

USER CONTEXT:
- Flow: ${flow}
- Name: ${userName || 'Not provided'}
- Property Type: ${userInput.propertyType || 'N/A'}
- Timeline: ${userInput.timeline || 'N/A'}
${flow === 'sell' ? `- Selling Reason: ${userInput.sellingReason || 'N/A'}
- Property Age: ${userInput.propertyAge || 'N/A'}
- Renovations: ${userInput.renovations || 'N/A'}` : ''}

AGENT KNOWLEDGE (from Chris's expertise):
${agentKnowledge.map((knowledge, i) => `${i + 1}. ${knowledge}`).join('\n')}

MARKET DATA:
${JSON.stringify(marketData, null, 2)}

Generate a JSON response with the following structure:

${schemaPrompt}

CRITICAL INSTRUCTIONS:
- Respond with ONLY valid JSON - no markdown, no code blocks, no explanatory text
- Use the user's specific answers to make every section personal
- Reference market conditions when relevant to build confidence
- Match urgency and tone to their timeline across all sections
- If user's name is available, use it naturally (but don't overuse it)
- Make it feel like Chris personally wrote this for them
- For OPTIONAL fields, only include them if they add meaningful value
- Omit optional fields if you're uncertain or they feel forced

Your entire response must be a single valid JSON object matching the structure above.`;
}