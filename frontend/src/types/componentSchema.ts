// types/resultsPageComponents/landingPageSchemas.ts



import { LlmActionPlanProps, LlmHeroBannerProps, LlmMarketInsightsProps, LlmNextStepsCTAProps, LlmPersonalMessageProps, LlmProfileSummaryProps } from "@/components/ux/resultsComponents";
import { ComponentSchema } from "./schemas";

// ==================== COMPLETE LLM OUTPUT ====================

// Flexible LLM output that can handle varying structures from different flows
export type LlmOutput = Record<string, any> & {
  // Common components (optional - may not exist in all flows)
  hero?: LlmHeroBannerProps;
  profileSummary?: LlmProfileSummaryProps;
  personalMessage?: LlmPersonalMessageProps;
  marketInsights?: LlmMarketInsightsProps;
  actionPlan?: LlmActionPlanProps;
  nextStepsCTA?: LlmNextStepsCTAProps;
  // Allow any other custom components
  [key: string]: any;
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

  // Common components that we typically expect
  const commonComponents = [
    'hero',
    'profileSummary',
    'personalMessage',
    'actionPlan',
    'marketInsights',
    'nextStepsCTA',
  ];

  const available = Object.keys(output).filter(key => 
    output[key] !== null && 
    output[key] !== undefined && 
    typeof output[key] === 'object' &&
    key !== '_debug' // Exclude debug info
  );

  const missing = commonComponents.filter(key => !output[key]);

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