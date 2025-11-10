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
  }
  
  export interface ComponentSchema {
    componentName: string;
    description: string;
    fields: Record<string, SchemaField>;
  }