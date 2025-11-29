# Offer System Architecture - Brainstorming

## Overview
Each offer type needs:
- **Required Inputs**: What data from conversation flows is needed
- **Prompt Builder**: How to construct the LLM prompt
- **Output Type**: What structure the LLM should return
- **Generation Logic**: How to process/format the output

---

## Approach 1: Offer Definition Object (Recommended)

**Concept**: Each offer type has a complete definition object that contains everything needed to generate it.

```typescript
// types/offers/offerDefinitions.ts

import type { OfferType } from "@/stores/onboardingStore/onboarding.store";
import type { OutputValue } from "@/types/genericOutput.types";

// ==================== BASE TYPES ====================

export interface BaseOfferProps {
  // Common to all offers
  id: string;
  type: OfferType;
  businessName: string;
  flow: string;
  generatedAt: string;
}

// ==================== INPUT REQUIREMENTS ====================

export interface InputRequirements {
  requiredFields: string[]; // mappingKeys like 'email', 'propertyAddress'
  optionalFields?: string[]; // Nice to have but not required
  fieldValidations?: Record<string, {
    type?: 'email' | 'phone' | 'number' | 'text';
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  }>;
}

// ==================== PROMPT BUILDER ====================

export type PromptBuilder = (
  userInput: Record<string, string>,
  context: {
    flow: string;
    businessName: string;
    qdrantAdvice?: string[];
    additionalContext?: Record<string, any>;
  }
) => string;

// ==================== OUTPUT SCHEMA ====================

export interface OutputSchema {
  // JSON Schema or TypeScript type definition
  type: 'object';
  properties: Record<string, {
    type: string;
    description: string;
    required?: boolean;
    example?: any;
  }>;
  // Or use a TypeScript type directly
  outputType: string; // e.g., "PdfOfferOutput"
}

// ==================== VALIDATOR ====================

export type OutputValidator = (output: unknown) => {
  valid: boolean;
  errors?: string[];
  normalized?: any;
};

// ==================== OFFER DEFINITION ====================

export interface OfferDefinition<T extends BaseOfferProps = BaseOfferProps> {
  // Identity
  type: OfferType;
  label: string;
  description: string;
  icon?: string;
  
  // Input requirements
  inputRequirements: InputRequirements;
  
  // Prompt generation
  buildPrompt: PromptBuilder;
  
  // Output structure
  outputSchema: OutputSchema;
  outputValidator: OutputValidator;
  
  // Post-processing (optional)
  postProcess?: (output: T, userInput: Record<string, string>) => T;
  
  // Generation metadata
  model?: 'gpt-4o-mini' | 'gpt-4o' | 'claude-3-5-sonnet';
  maxTokens?: number;
  temperature?: number;
}

// ==================== OFFER-SPECIFIC OUTPUT TYPES ====================

export interface PdfOfferOutput extends BaseOfferProps {
  type: 'pdf';
  title: string;
  sections: Array<{
    heading: string;
    content: string;
    order: number;
  }>;
  metadata: {
    pageCount?: number;
    downloadUrl?: string;
  };
}

export interface LandingPageOfferOutput extends BaseOfferProps {
  type: 'landingPage';
  hero: {
    title: string;
    subtitle: string;
    ctaText: string;
  };
  summary: {
    title: string;
    content: string;
  };
  insights: Array<{
    title: string;
    description: string;
  }>;
  recommendations: Array<{
    title: string;
    description: string;
    actionUrl?: string;
  }>;
}

export interface HomeEstimateOfferOutput extends BaseOfferProps {
  type: 'home-estimate';
  propertyAddress: string;
  estimatedValue: {
    low: number;
    high: number;
    confidence: number;
    currency: string;
  };
  comparables: Array<{
    address: string;
    soldPrice: number;
    soldDate: string;
    similarity: number;
  }>;
  factors: Array<{
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
  }>;
  recommendations: string[];
}

export interface VideoOfferOutput extends BaseOfferProps {
  type: 'video';
  title: string;
  script: string;
  sections: Array<{
    timestamp: string;
    content: string;
  }>;
  metadata: {
    duration?: number;
    videoUrl?: string;
  };
}

// ==================== OFFER DEFINITIONS ====================

export const PDF_OFFER_DEFINITION: OfferDefinition<PdfOfferOutput> = {
  type: 'pdf',
  label: 'PDF Guide',
  description: 'Downloadable resource guide',
  icon: '📄',
  
  inputRequirements: {
    requiredFields: ['email'],
    optionalFields: ['propertyAddress', 'timeline'],
  },
  
  buildPrompt: (userInput, context) => {
    const userName = userInput.email?.split('@')[0] || 'there';
    return `You are creating a personalized PDF guide for ${userName}.

USER CONTEXT:
Flow: ${context.flow}
${Object.entries(userInput).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

${context.qdrantAdvice ? `RELEVANT ADVICE:\n${context.qdrantAdvice.join('\n\n')}` : ''}

Generate a comprehensive PDF guide with the following structure:
{
  "title": "Personalized guide title",
  "sections": [
    {
      "heading": "Section heading",
      "content": "Detailed content (2-3 paragraphs)",
      "order": 1
    }
  ],
  "metadata": {
    "pageCount": 5
  }
}

Make it actionable, specific to their situation, and valuable.`;
  },
  
  outputSchema: {
    type: 'object',
    properties: {
      title: { type: 'string', description: 'PDF title', required: true },
      sections: { 
        type: 'array', 
        description: 'PDF sections', 
        required: true,
        example: [{ heading: 'Intro', content: '...', order: 1 }]
      },
      metadata: { type: 'object', description: 'PDF metadata', required: false },
    },
    outputType: 'PdfOfferOutput',
  },
  
  outputValidator: (output) => {
    if (!output || typeof output !== 'object') {
      return { valid: false, errors: ['Output must be an object'] };
    }
    
    const o = output as Partial<PdfOfferOutput>;
    const errors: string[] = [];
    
    if (!o.title) errors.push('Missing title');
    if (!Array.isArray(o.sections) || o.sections.length === 0) {
      errors.push('Missing or empty sections array');
    }
    
    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      normalized: errors.length === 0 ? output : undefined,
    };
  },
  
  postProcess: (output, userInput) => {
    // Add any post-processing logic
    return {
      ...output,
      id: `pdf-${Date.now()}`,
      generatedAt: new Date().toISOString(),
    };
  },
  
  model: 'gpt-4o-mini',
  maxTokens: 4000,
  temperature: 0.7,
};

export const HOME_ESTIMATE_OFFER_DEFINITION: OfferDefinition<HomeEstimateOfferOutput> = {
  type: 'home-estimate',
  label: 'Home Estimate',
  description: 'Property valuation estimate',
  icon: '🏠',
  
  inputRequirements: {
    requiredFields: ['propertyAddress', 'propertyType', 'propertyAge', 'renovations', 'timeline'],
    optionalFields: ['bedrooms', 'bathrooms', 'squareFeet'],
    fieldValidations: {
      propertyAddress: { type: 'text', minLength: 5 },
    },
  },
  
  buildPrompt: (userInput, context) => {
    return `You are a real estate valuation expert. Generate a detailed home estimate.

PROPERTY INFORMATION:
Address: ${userInput.propertyAddress}
Type: ${userInput.propertyType}
Age: ${userInput.propertyAge}
Renovations: ${userInput.renovations}
Timeline: ${userInput.timeline}

${context.qdrantAdvice ? `MARKET KNOWLEDGE:\n${context.qdrantAdvice.join('\n\n')}` : ''}

Generate a comprehensive home estimate with:
{
  "propertyAddress": "${userInput.propertyAddress}",
  "estimatedValue": {
    "low": 350000,
    "high": 425000,
    "confidence": 0.85,
    "currency": "USD"
  },
  "comparables": [
    {
      "address": "123 Similar St",
      "soldPrice": 380000,
      "soldDate": "2024-01-15",
      "similarity": 0.92
    }
  ],
  "factors": [
    {
      "factor": "Recent renovations",
      "impact": "positive",
      "description": "Kitchen renovation adds value"
    }
  ],
  "recommendations": [
    "Consider staging before listing",
    "Market timing is favorable"
  ]
}

Be realistic and data-driven.`;
  },
  
  outputSchema: {
    type: 'object',
    properties: {
      propertyAddress: { type: 'string', required: true },
      estimatedValue: { type: 'object', required: true },
      comparables: { type: 'array', required: true },
      factors: { type: 'array', required: true },
      recommendations: { type: 'array', required: true },
    },
    outputType: 'HomeEstimateOfferOutput',
  },
  
  outputValidator: (output) => {
    const o = output as Partial<HomeEstimateOfferOutput>;
    const errors: string[] = [];
    
    if (!o.propertyAddress) errors.push('Missing propertyAddress');
    if (!o.estimatedValue?.low || !o.estimatedValue?.high) {
      errors.push('Missing estimatedValue range');
    }
    
    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      normalized: errors.length === 0 ? output : undefined,
    };
  },
  
  model: 'gpt-4o', // Use more powerful model for estimates
  maxTokens: 3000,
  temperature: 0.3, // Lower temperature for more consistent estimates
};

// ==================== OFFER REGISTRY ====================

export const OFFER_DEFINITIONS: Record<OfferType, OfferDefinition> = {
  'pdf': PDF_OFFER_DEFINITION,
  'landingPage': {
    // Similar structure...
  },
  'video': {
    // Similar structure...
  },
  'home-estimate': HOME_ESTIMATE_OFFER_DEFINITION,
  'custom': {
    // Flexible custom offer definition
  },
};

// ==================== HELPER FUNCTIONS ====================

export function getOfferDefinition(type: OfferType): OfferDefinition {
  return OFFER_DEFINITIONS[type] || OFFER_DEFINITIONS.custom;
}

export function validateOfferInputs(
  offerType: OfferType,
  userInput: Record<string, string>
): { valid: boolean; missing: string[] } {
  const definition = getOfferDefinition(offerType);
  const missing: string[] = [];
  
  definition.inputRequirements.requiredFields.forEach((field) => {
    if (!userInput[field] || userInput[field].trim() === '') {
      missing.push(field);
    }
  });
  
  return {
    valid: missing.length === 0,
    missing,
  };
}

---

## Approach 2: Class-Based Pattern

**Concept**: Use classes to encapsulate offer logic (more OOP approach).

```typescript
// lib/offers/BaseOffer.ts

export abstract class BaseOffer<T extends BaseOfferProps> {
  abstract type: OfferType;
  abstract label: string;
  abstract description: string;
  
  abstract inputRequirements: InputRequirements;
  abstract outputSchema: OutputSchema;
  
  abstract buildPrompt(
    userInput: Record<string, string>,
    context: OfferContext
  ): string;
  
  abstract validateOutput(output: unknown): ValidationResult;
  
  abstract postProcess(
    output: T,
    userInput: Record<string, string>
  ): T;
  
  // Common methods
  validateInputs(userInput: Record<string, string>): ValidationResult {
    // Implementation
  }
  
  getModel(): string {
    return 'gpt-4o-mini';
  }
  
  getMaxTokens(): number {
    return 4000;
  }
}

// lib/offers/PdfOffer.ts

export class PdfOffer extends BaseOffer<PdfOfferOutput> {
  type = 'pdf' as const;
  label = 'PDF Guide';
  description = 'Downloadable resource guide';
  
  inputRequirements = {
    requiredFields: ['email'],
  };
  
  buildPrompt(userInput, context) {
    // Implementation
  }
  
  validateOutput(output) {
    // Implementation
  }
  
  postProcess(output, userInput) {
    // Implementation
  }
}
```

---

## Approach 3: Functional Composition Pattern

**Concept**: Compose offer definitions from smaller functions.

```typescript
// lib/offers/composeOffer.ts

export function createOfferDefinition<T extends BaseOfferProps>(config: {
  type: OfferType;
  label: string;
  inputRequirements: InputRequirements;
  promptTemplate: string | PromptBuilder;
  outputSchema: OutputSchema;
  validator: OutputValidator;
  postProcessor?: (output: T, userInput: Record<string, string>) => T;
}): OfferDefinition<T> {
  return {
    ...config,
    buildPrompt: typeof config.promptTemplate === 'string'
      ? (userInput, context) => {
          // Template string replacement
          return config.promptTemplate
            .replace('{{userName}}', userInput.email?.split('@')[0] || 'there')
            .replace('{{flow}}', context.flow)
            // ... more replacements
        }
      : config.promptTemplate,
    outputValidator: config.validator,
    postProcess: config.postProcessor,
  };
}

// Usage:
export const PDF_OFFER = createOfferDefinition<PdfOfferOutput>({
  type: 'pdf',
  label: 'PDF Guide',
  inputRequirements: {
    requiredFields: ['email'],
  },
  promptTemplate: `Create a PDF guide for {{userName}}...`,
  outputSchema: { /* ... */ },
  validator: (output) => { /* ... */ },
});
```

---

## Approach 4: Schema-Driven Pattern

**Concept**: Define offers using JSON Schema-like definitions.

```typescript
// lib/offers/schemaDriven.ts

export interface OfferSchema {
  type: OfferType;
  metadata: {
    label: string;
    description: string;
    icon?: string;
  };
  input: {
    required: string[];
    optional?: string[];
    validations?: Record<string, any>;
  };
  prompt: {
    template: string;
    variables?: string[]; // Variables to replace in template
    includeQdrant?: boolean;
    includeMarketData?: boolean;
  };
  output: {
    schema: JSONSchema; // Full JSON Schema
    examples?: any[];
  };
  generation: {
    model: string;
    maxTokens: number;
    temperature: number;
  };
  processing?: {
    validator?: string; // Function name or path
    transformer?: string;
    formatter?: string;
  };
}

// Example:
export const PDF_OFFER_SCHEMA: OfferSchema = {
  type: 'pdf',
  metadata: {
    label: 'PDF Guide',
    description: 'Downloadable resource',
  },
  input: {
    required: ['email'],
    optional: ['propertyAddress'],
  },
  prompt: {
    template: 'Create a PDF guide for {{userName}} based on {{flow}} flow...',
    variables: ['userName', 'flow'],
    includeQdrant: true,
  },
  output: {
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        sections: { type: 'array' },
      },
      required: ['title', 'sections'],
    },
  },
  generation: {
    model: 'gpt-4o-mini',
    maxTokens: 4000,
    temperature: 0.7,
  },
};
```

---

## Recommended: Hybrid Approach (Approach 1 + Extensions)

**Best of both worlds**: Use the definition object pattern but with type-safe extensions.

```typescript
// types/offers/offerDefinitions.ts

// Base definition (what we showed in Approach 1)
export interface OfferDefinition<T extends BaseOfferProps = BaseOfferProps> {
  // ... (from Approach 1)
}

// Type-safe offer definitions with generics
export interface TypedOfferDefinition<
  TInput extends Record<string, string>,
  TOutput extends BaseOfferProps
> extends OfferDefinition<TOutput> {
  // Type-safe input requirements
  inputRequirements: {
    requiredFields: (keyof TInput)[];
    optionalFields?: (keyof TInput)[];
  };
  
  // Type-safe prompt builder
  buildPrompt: (
    userInput: TInput,
    context: OfferContext
  ) => string;
  
  // Type-safe validator
  outputValidator: (output: unknown) => {
    valid: boolean;
    errors?: string[];
    normalized?: TOutput;
  };
  
  // Type-safe post-processor
  postProcess?: (output: TOutput, userInput: TInput) => TOutput;
}

// Example usage:
export const PDF_OFFER: TypedOfferDefinition<
  { email: string; propertyAddress?: string },
  PdfOfferOutput
> = {
  type: 'pdf',
  // ... rest of definition
  inputRequirements: {
    requiredFields: ['email'], // TypeScript knows 'email' is valid
    optionalFields: ['propertyAddress'],
  },
  // ... rest
};
```

---

## Implementation Structure

```
lib/offers/
├── definitions/
│   ├── pdfOffer.ts          # PDF offer definition
│   ├── landingPageOffer.ts  # Landing page offer definition
│   ├── homeEstimateOffer.ts # Home estimate offer definition
│   ├── videoOffer.ts       # Video offer definition
│   └── customOffer.ts       # Custom offer definition
├── registry.ts              # Central registry of all offers
├── validators.ts            # Shared validation utilities
├── promptBuilders.ts        # Shared prompt building utilities
└── types.ts                 # Type definitions

app/api/generation/
├── generate-offer/
│   └── route.ts             # Main generation endpoint
└── offers/
    ├── pdf/
    │   └── route.ts         # PDF-specific generation
    ├── landing-page/
    │   └── route.ts         # Landing page generation
    └── home-estimate/
        └── route.ts         # Home estimate generation
```

---

## Key Benefits of Approach 1 (Recommended)

1. **Self-contained**: Everything for an offer is in one place
2. **Type-safe**: TypeScript ensures correctness
3. **Extensible**: Easy to add new offer types
4. **Testable**: Each definition can be tested independently
5. **Maintainable**: Clear separation of concerns
6. **Flexible**: Supports different models, temperatures, etc. per offer

---

## Next Steps

1. Choose an approach (recommend Approach 1)
2. Create base types and interfaces
3. Implement first offer definition (PDF as example)
4. Create offer registry
5. Update generation API to use definitions
6. Add validation and error handling
7. Create UI for offer configuration (future)

