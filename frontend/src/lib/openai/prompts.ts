// lib/promptBuilder.ts


import { ComponentSchema } from "@/types/resultsPageComponents/schemas";




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


// Generic version
// lib/promptBuilder.ts

export function buildPrompt(
  schema: ComponentSchema,
  flow: string,
  userInput: Record<string, string>,
  // agentKnowledge: string[]
): string {
  const userName = userInput.email
    ? userInput.email.split('@')[0].charAt(0).toUpperCase() + userInput.email.split('@')[0].slice(1)
    : null;

  const schemaPrompt = buildSingleSchemaPrompt(schema);

  // AGENT KNOWLEDGE:
// ${agentKnowledge.map((k, i) => `${i + 1}. ${k}`).join('\n') || 'None provided'}

  return `You are Chris's AI assistant generating a personalized landing page section.

USER CONTEXT:
- Flow: ${flow}
- Name: ${userName || 'Not provided'}
- Property Type: ${userInput.propertyType || 'N/A'}
- Timeline: ${userInput.timeline || 'N/A'}
${flow === 'sell' ? `- Selling Reason: ${userInput.sellingReason || 'N/A'}
- Property Age: ${userInput.propertyAge || 'N/A'}
- Renovations: ${userInput.renovations || 'N/A'}` : ''}



---

INSTRUCTIONS:
Generate ONLY a valid JSON object for the "${schema.componentName}" component.

${schemaPrompt}

CRITICAL RULES:
- Output ONLY the JSON object (no \`\`\`json, no extra text)
- Make every field personal using user answers
- Respect REQUIRED vs OPTIONAL
- Match tone and urgency to timeline
- Include first name if available
- Omit optional fields if not confident
- Follow all word counts, tones, and constraints exactly
`;
}

export function buildMultiComponentPrompt(
  schemas: ComponentSchema[],
  flow: string,
  userInput: Record<string, string>,
  // agentKnowledge: string[]
): string {
  const userName = userInput.email
    ? userInput.email.split('@')[0].charAt(0).toUpperCase() + userInput.email.split('@')[0].slice(1)
    : null;

//     AGENT KNOWLEDGE:
// ${agentKnowledge.map((k, i) => `${i + 1}. ${k}`).join('\n') || 'None'}

  const schemaPrompts = schemas
    .map(schema => buildSingleSchemaPrompt(schema))
    .join(',\n');

  return `You are Chris's AI assistant generating a personalized landing page.

USER CONTEXT:
- Flow: ${flow}
- Name: ${userName || 'Not provided'}
- Property Type: ${userInput.propertyType || 'N/A'}
- Timeline: ${userInput.timeline || 'N/A'}
${flow === 'sell' ? `- Selling Reason: ${userInput.sellingReason || 'N/A'}
- Property Age: ${userInput.propertyAge || 'N/A'}
- Renovations: ${userInput.renovations || 'N/A'}` : ''}



---

INSTRUCTIONS:
Generate ONLY a valid JSON object with the following components:

{
${schemaPrompts}
}

CRITICAL RULES:
- Output ONLY the JSON (no markdown, no extra text)
- Make every field personal using user answers
- Respect REQUIRED vs OPTIONAL
- Match tone and urgency to timeline
- Include first name if available
- Omit optional fields if not confident
- Follow all constraints (word count, tone, etc.)
`;
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
