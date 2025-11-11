import { HERO_BANNER_SCHEMA, LlmHeroBanner } from "./components/herobanner";
import { LlmProfileSummary } from "./components/profileSummary";
import { ComponentSchema } from "./schemas";

// ==================== HERO BANNER ====================
export interface LlmOutput {
    hero: LlmHeroBanner;
    profileHighlight:LlmProfileSummary
    
    // profileSummary?: LlmProfileSummary;     // Add as you build
    // personalizedAdvice?: LlmPersonalizedAdvice;
    // marketInsights?: LlmMarketInsights;
    // etc...
  }
  
  
  export const LANDING_PAGE_SCHEMAS: ComponentSchema[] = [
    HERO_BANNER_SCHEMA,
    // PROFILE_SUMMARY_SCHEMA,      // Add next
    // PERSONALIZED_ADVICE_SCHEMA,  // Then this
    // MARKET_INSIGHTS_SCHEMA,      // etc...
  ];
  
  // Helper to get schema by component name
  export function getSchemaByName(componentName: string): ComponentSchema | undefined {
    return LANDING_PAGE_SCHEMAS.find(schema => schema.componentName === componentName);
  }