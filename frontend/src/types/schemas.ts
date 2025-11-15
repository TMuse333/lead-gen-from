// types/schema.ts

import { PersonalizationContext } from "./personalization.types";

export interface SchemaField {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'enum';
  description: string;
  required: boolean;
  constraints?: {
    minLength?: number;
    maxLength?: number;
    wordCount?: string;
    tone?: string;
    options?: string[];
  };
  example?: any;
  context?: string;

  // ADD THESE TWO — this is all you need!
  items?: SchemaField;                    // for arrays
  fields?: Record<string, SchemaField>;   // for objects
}

export interface ComponentSchema {
  componentName: string;
  description: string;
  fields: Record<string, SchemaField>;

  // Optional deep personalization
  personalization?: {
    // Which Qdrant collections to query before generating this component
    retrieveFrom?: ('advice' | 'actionSteps')[];

    // Simple way: append extra instructions to the generic prompt
    promptAddendum?: string;

    // Advanced way: completely custom prompt using retrieved data
    customPromptBuilder?: (
      baseSchemaPrompt: string,
      context: PersonalizationContext
    ) => string;
  };
}