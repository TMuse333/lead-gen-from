// types/schema.ts

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
}