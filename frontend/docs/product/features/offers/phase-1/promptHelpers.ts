// lib/offers/promptBuilders/promptHelpers.ts
/**
 * Helper functions for building prompts
 * Shared utilities across all offer types
 */

import type { PromptContext } from '../core/types';

// ==================== FORMATTING HELPERS ====================

/**
 * Format user input for prompt
 */
export function formatUserInput(userInput: Record<string, string>): string {
  return Object.entries(userInput)
    .map(([key, value]) => `- ${formatFieldName(key)}: ${value}`)
    .join('\n');
}

/**
 * Format field name for display
 */
export function formatFieldName(fieldName: string): string {
  return fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim();
}

/**
 * Format Qdrant advice for prompt
 */
export function formatQdrantAdvice(advice?: string[]): string {
  if (!advice || advice.length === 0) {
    return '';
  }
  
  return `RELEVANT ADVICE FROM KNOWLEDGE BASE:\n${advice.map((item, index) => 
    `${index + 1}. ${item}`
  ).join('\n\n')}`;
}

/**
 * Format output schema for prompt
 */
export function formatOutputSchema(schema: Record<string, any>): string {
  return JSON.stringify(schema, null, 2);
}

// ==================== CONTEXT HELPERS ====================

/**
 * Get personalized greeting
 */
export function getPersonalizedGreeting(userInput: Record<string, string>): string {
  const email = userInput.email;
  const name = userInput.name || userInput.firstName;
  
  if (name) {
    return name;
  }
  
  if (email) {
    const username = email.split('@')[0];
    return username.charAt(0).toUpperCase() + username.slice(1);
  }
  
  return 'there';
}

/**
 * Get flow-specific context
 */
export function getFlowContext(flow: string): string {
  const flowContexts: Record<string, string> = {
    buy: 'The user is looking to buy/purchase',
    sell: 'The user is looking to sell',
    browse: 'The user is browsing and exploring options',
  };
  
  return flowContexts[flow] || `The user is in the ${flow} flow`;
}

// ==================== INSTRUCTION TEMPLATES ====================

/**
 * Get output format instructions
 */
export function getOutputInstructions(outputType: string): string {
  return `
CRITICAL INSTRUCTIONS:
1. Respond with ONLY valid JSON - no markdown, no code blocks, no explanations
2. The JSON must match the ${outputType} structure exactly
3. All required fields must be present
4. Make the content personalized and specific to the user's situation
5. Be concise but valuable - every section should provide actionable insights
6. Do not use placeholder values like {name} or [value] - fill in actual content
`;
}

/**
 * Get quality guidelines
 */
export function getQualityGuidelines(): string {
  return `
QUALITY GUIDELINES:
- Be specific and actionable
- Use the user's actual information (don't make up data)
- Keep language professional yet approachable
- Avoid generic advice - make it relevant to their situation
- If you don't have enough information, ask clarifying questions instead of guessing
`;
}

// ==================== PROMPT BUILDERS ====================

/**
 * Build base prompt structure
 */
export function buildBasePrompt(
  offerLabel: string,
  userInput: Record<string, string>,
  context: PromptContext,
  outputSchema: Record<string, any>,
  specificInstructions?: string
): string {
  const userName = getPersonalizedGreeting(userInput);
  const flowContext = getFlowContext(context.flow);
  
  return `You are creating a personalized ${offerLabel} for ${userName} at ${context.businessName}.

USER CONTEXT:
${flowContext}
${formatUserInput(userInput)}

${formatQdrantAdvice(context.qdrantAdvice)}

${specificInstructions || ''}

${getOutputInstructions(offerLabel)}

${getQualityGuidelines()}

OUTPUT STRUCTURE:
${formatOutputSchema(outputSchema)}

Generate the ${offerLabel} now:`;
}

// ==================== VALIDATION HELPERS ====================

/**
 * Check if required data is present
 */
export function hasRequiredData(
  userInput: Record<string, string>,
  requiredFields: string[]
): { hasData: boolean; missing: string[] } {
  const missing = requiredFields.filter(
    (field) => !userInput[field] || userInput[field].trim() === ''
  );
  
  return {
    hasData: missing.length === 0,
    missing,
  };
}

/**
 * Extract specific fields from user input
 */
export function extractFields(
  userInput: Record<string, string>,
  fields: string[]
): Record<string, string> {
  const extracted: Record<string, string> = {};
  
  fields.forEach((field) => {
    if (userInput[field]) {
      extracted[field] = userInput[field];
    }
  });
  
  return extracted;
}

// ==================== CONTENT ENHANCEMENT ====================

/**
 * Add business context to prompt
 */
export function addBusinessContext(
  businessName: string,
  additionalContext?: Record<string, any>
): string {
  let context = `Business: ${businessName}`;
  
  if (additionalContext) {
    const contextItems = Object.entries(additionalContext)
      .map(([key, value]) => `${formatFieldName(key)}: ${value}`)
      .join('\n');
    
    if (contextItems) {
      context += `\n${contextItems}`;
    }
  }
  
  return context;
}

/**
 * Add personalization hints
 */
export function getPersonalizationHints(userInput: Record<string, string>): string[] {
  const hints: string[] = [];
  
  if (userInput.email) {
    hints.push(`Use "${getPersonalizedGreeting(userInput)}" when addressing the user`);
  }
  
  if (userInput.propertyAddress) {
    hints.push('Reference their specific property when relevant');
  }
  
  if (userInput.timeline) {
    hints.push(`Consider their timeline: ${userInput.timeline}`);
  }
  
  if (userInput.budget) {
    hints.push(`Keep recommendations within their budget: ${userInput.budget}`);
  }
  
  return hints;
}