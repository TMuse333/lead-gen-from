// lib/promptBuilder.ts


import { ComponentSchema } from "@/types/schemas";




function buildSingleSchemaPrompt(schema: ComponentSchema): string {
  let prompt = ` "${schema.componentName}": {\n`;
  prompt += `   // ${schema.description}\n\n`;

  Object.entries(schema.fields).forEach(([fieldName, field]) => {
    const required = field.required ? 'REQUIRED' : 'optional';
    prompt += `   "${fieldName}": `;

    if (field.type === 'object' && field.fields) {
      prompt += `{\n`;
      Object.entries(field.fields).forEach(([k, f]) => {
        const r = f.required ? 'REQUIRED' : 'optional';
        prompt += `     "${k}": ${f.type} (${r}) // ${f.description}\n`;
        if (f.example) prompt += `     // Example: ${JSON.stringify(f.example)}\n`;
      });
      prompt += `   }`;
    } else if (field.type === 'array' && field.items) {
      prompt += `[\n`;
      if (field.items.type === 'object' && field.items.fields) {
        prompt += `     {\n`;
        Object.entries(field.items.fields).forEach(([k, f]) => {
          const r = f.required ? 'REQUIRED' : 'optional';
          prompt += `       "${k}": ${f.type} (${r}) // ${f.description}\n`;
          if (f.example) prompt += `       // Example: ${JSON.stringify(f.example)}\n`;
        });
        prompt += `     }\n`;
      } else {
        prompt += `     ${field.items.type}\n`;
      }
      prompt += `   ]`;
      if (field.constraints?.minLength || field.constraints?.maxLength) {
        prompt += ` [${field.constraints.minLength || 0}-${field.constraints.maxLength || '∞'} items]`;
      }
    } else {
      prompt += `${field.type}`;
    }

    prompt += ` (${required})`;
    if (field.constraints?.wordCount) prompt += ` [${field.constraints.wordCount}]`;
    if (field.constraints?.tone) prompt += ` [tone: ${field.constraints.tone}]`;

    prompt += `\n   // ${field.description}`;
    if (field.context) prompt += `\n   // ${field.context}`;
    if (field.example && !field.fields && !field.items) {
      prompt += `\n   // Example: ${JSON.stringify(field.example)}`;
    }
    prompt += `\n\n`;
  });

  prompt += ` }\n`;
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
- For budget: ALWAYS use the exact value the user provided, including ranges like "$600K - $800K" or "Under $500K".
- Never replace budget with "TBD", "To be discussed", or "Not specified" unless the user Literally said nothing about budget.
- If user says "$600K - $800K", output exactly that as the value.
- Use "dollar-sign" as the icon for budget.
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

  return `You are The agents AI assistant generating a personalized landing page.

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
// export function buildSchemasPrompt(schemas: ComponentSchema[]): string {
//   let prompt = '{\n';
  
//   schemas.forEach((schema, index) => {
//     prompt += buildSingleSchemaPrompt(schema);
    
//     // Add comma if not last schema
//     if (index < schemas.length - 1) {
//       prompt += ',\n';
//     } else {
//       prompt += '\n';
//     }
//   });
  
//   prompt += '}';
//   return prompt;
// }

/**
 * Generates the full prompt for landing page generation
 */
