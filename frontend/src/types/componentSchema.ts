// types/resultsPageComponents/landingPageSchemas.ts

import type { OutputValue } from './genericOutput.types';

// ==================== COMPLETE LLM OUTPUT ====================

/**
 * Flexible LLM output type that can handle any structure from the LLM
 * 
 * This type is intentionally generic to support:
 * - Different offer types (PDF, landing page, video, custom)
 * - Different flow types (buy, sell, browse)
 * - Future offer types without code changes
 * 
 * For production, you can extend this with specific offer types:
 * @example
 * export type LlmOutput = {
 *   homeEvaluation?: HomeEvaluationOutput;
 *   pdfGuide?: PdfGuideOutput;
 *   [key: string]: OutputValue | undefined;
 * };
 */
export type LlmOutput = Record<string, OutputValue | undefined> & {
  // Debug info (excluded from main output)
  _debug?: unknown;
};

// ==================== ALL COMPONENT SCHEMAS ====================

// export const LANDING_PAGE_SCHEMAS: ComponentSchema[] = [
//   HERO_BANNER_SCHEMA,
//   PROFILE_SUMMARY_SCHEMA,
//   PERSONAL_MESSAGE_SCHEMA,
//   ACTION_PLAN_SCHEMA,
//   MARKET_INSIGHTS_SCHEMA,
//   NEXT_STEPS_CTA_SCHEMA,
// ];

// ==================== HELPER FUNCTIONS ====================

/**
 * Get schema by component name
 */
// export function getSchemaByName(componentName: string): ComponentSchema | undefined {
//   return LANDING_PAGE_SCHEMAS.find(schema => schema.componentName === componentName);
// }

/**
 * Get all schema names (useful for debugging/validation)
 */
// export function getAllSchemaNames(): string[] {
//   return LANDING_PAGE_SCHEMAS.map(schema => schema.componentName);
// }

/**
 * Validate that LlmOutput has at least some components
 * More flexible - just checks that it's an object with some data
 */
export function validateLlmOutput(output: Partial<LlmOutput>): {
  valid: boolean;
  missing: string[];
  available: string[];
} {
  if (!output || typeof output !== 'object') {
    return {
      valid: false,
      missing: [],
      available: [],
    };
  }

  const available = Object.keys(output).filter(key => 
    output[key] !== null && 
    output[key] !== undefined && 
    typeof output[key] === 'object' &&
    key !== '_debug' // Exclude debug info
  );

  // No longer checking for specific components - fully flexible
  const missing: string[] = [];

  // Valid if we have at least one component
  return {
    valid: available.length > 0,
    missing,
    available,
  };
}

/**
 * Get schema documentation as string (useful for LLM prompts)
 */
// export function getSchemasAsPromptString(): string {
//   return LANDING_PAGE_SCHEMAS.map(schema => {
//     return `
// ## ${schema.componentName.toUpperCase()}
// Description: ${schema.description}

// Fields:
// ${Object.entries(schema.fields).map(([fieldName, field]) => {
//   return `  - ${fieldName} (${field.type}${field.required ? ', required' : ', optional'}): ${field.description}
//     ${field.example ? `Example: ${JSON.stringify(field.example)}` : ''}
//     ${field.context ? `Context: ${field.context}` : ''}`;
// }).join('\n')}
// `;
//   }).join('\n---\n');
// }