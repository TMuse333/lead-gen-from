// types/resultsPageComponents/landingPageSchemas.ts

import { HERO_BANNER_SCHEMA, LlmHeroBannerProps } from "./components/herobanner";
import { PROFILE_SUMMARY_SCHEMA, LlmProfileSummaryProps } from "./components/profileSummary";
import { PERSONAL_MESSAGE_SCHEMA, LlmPersonalMessageProps } from "./components/personalMessage";
import { ACTION_PLAN_SCHEMA, LlmActionPlanProps } from "./components/actionPlan";
import { MARKET_INSIGHTS_SCHEMA, LlmMarketInsightsProps } from "./components/marketInsights";
import { NEXT_STEPS_CTA_SCHEMA, LlmNextStepsCTAProps } from "./components/cta";
import { ComponentSchema } from "./schemas";

// ==================== COMPLETE LLM OUTPUT ====================

export interface LlmOutput {
  hero: LlmHeroBannerProps;
  profileSummary: LlmProfileSummaryProps;
  personalMessage: LlmPersonalMessageProps;
  marketInsights: LlmMarketInsightsProps;
  actionPlan: LlmActionPlanProps;
  nextStepsCTA: LlmNextStepsCTAProps;
}

// ==================== ALL COMPONENT SCHEMAS ====================

export const LANDING_PAGE_SCHEMAS: ComponentSchema[] = [
  HERO_BANNER_SCHEMA,
  PROFILE_SUMMARY_SCHEMA,
  PERSONAL_MESSAGE_SCHEMA,
  ACTION_PLAN_SCHEMA,
  MARKET_INSIGHTS_SCHEMA,
  NEXT_STEPS_CTA_SCHEMA,
];

// ==================== HELPER FUNCTIONS ====================

/**
 * Get schema by component name
 */
export function getSchemaByName(componentName: string): ComponentSchema | undefined {
  return LANDING_PAGE_SCHEMAS.find(schema => schema.componentName === componentName);
}

/**
 * Get all schema names (useful for debugging/validation)
 */
export function getAllSchemaNames(): string[] {
  return LANDING_PAGE_SCHEMAS.map(schema => schema.componentName);
}

/**
 * Validate that LlmOutput has all required components
 */
export function validateLlmOutput(output: Partial<LlmOutput>): {
  valid: boolean;
  missing: string[];
} {
  const required: (keyof LlmOutput)[] = [
    'hero',
    'profileSummary',
    'personalMessage',
    'actionPlan',
    'marketInsights',
    'nextStepsCTA',
  ];

  const missing = required.filter(key => !output[key]);

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Get schema documentation as string (useful for LLM prompts)
 */
export function getSchemasAsPromptString(): string {
  return LANDING_PAGE_SCHEMAS.map(schema => {
    return `
## ${schema.componentName.toUpperCase()}
Description: ${schema.description}

Fields:
${Object.entries(schema.fields).map(([fieldName, field]) => {
  return `  - ${fieldName} (${field.type}${field.required ? ', required' : ', optional'}): ${field.description}
    ${field.example ? `Example: ${JSON.stringify(field.example)}` : ''}
    ${field.context ? `Context: ${field.context}` : ''}`;
}).join('\n')}
`;
  }).join('\n---\n');
}