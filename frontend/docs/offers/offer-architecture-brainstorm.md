# Offer System Architecture - Approach 1 Implementation Guide

## Overview
Each offer type needs:
- **Required Inputs**: What data from conversation flows is needed
- **Prompt Builder**: How to construct the LLM prompt
- **Output Type**: What structure the LLM should return
- **Generation Logic**: How to process/format the output

---

## Approach 1: Offer Definition Object

**Concept**: Each offer type has a complete definition object that contains everything needed to generate it.

### Base Types

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
```

### Offer-Specific Output Types

```typescript
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
```

### Example Offer Definition

```typescript
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
```

### Offer Registry

```typescript
// ==================== OFFER REGISTRY ====================

export const OFFER_DEFINITIONS: Record<OfferType, OfferDefinition> = {
  'pdf': PDF_OFFER_DEFINITION,
  'landingPage': LANDING_PAGE_OFFER_DEFINITION,
  'video': VIDEO_OFFER_DEFINITION,
  'home-estimate': HOME_ESTIMATE_OFFER_DEFINITION,
  'custom': CUSTOM_OFFER_DEFINITION,
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

## Key Benefits

1. **Self-contained**: Everything for an offer is in one place
2. **Type-safe**: TypeScript ensures correctness
3. **Extensible**: Easy to add new offer types
4. **Testable**: Each definition can be tested independently
5. **Maintainable**: Clear separation of concerns
6. **Flexible**: Supports different models, temperatures, etc. per offer

---

## Onboarding Changes Required

### Overview
The onboarding flow already has most of the validation logic in place. Only **minor changes** are needed to switch from the static `OFFER_REQUIREMENTS` object to the new `OFFER_DEFINITIONS` registry.

### Changes Required

#### 1. Step 2: Offers Selection (`step2Offers.tsx`)

**Current State:**
- Uses `getOfferRequirements()` from `@/lib/offers/offerRequirements`
- Reads from static `OFFER_REQUIREMENTS` object
- Displays required fields from `requiredFields` array

**Changes Needed:**
```typescript
// BEFORE:
import { getOfferRequirements, FIELD_LABELS } from "@/lib/offers/offerRequirements";

const requirements = getOfferRequirements(offer.value);

// AFTER:
import { getOfferDefinition } from "@/lib/offers/registry";
import { FIELD_LABELS } from "@/lib/offers/offerRequirements"; // Keep for labels

const definition = getOfferDefinition(offer.value);
const requirements = definition.inputRequirements;
```

**Impact:** 
- Low complexity
- UI structure stays the same
- Just swap data source
- ~5 minutes to update

#### 2. Validation Function (`validateOfferRequirements.ts`)

**Current State:**
- Uses `getOfferRequirements()` from `@/lib/offers/offerRequirements`
- Extracts `requiredFields` from static object

**Changes Needed:**
```typescript
// BEFORE:
import { getOfferRequirements } from "@/lib/offers/offerRequirements";

const requirements = getOfferRequirements(offerType);
const requiredFields = requirements.requiredFields;

// AFTER:
import { getOfferDefinition } from "@/lib/offers/registry";

const definition = getOfferDefinition(offerType);
const requiredFields = definition.inputRequirements.requiredFields;
```

**Impact:**
- Low complexity
- Function signature stays the same
- Just swap data source
- ~5 minutes to update

#### 3. Step 2: Offer Options Array (Optional Enhancement)

**Current State:**
- Hardcoded `OFFER_OPTIONS` array with static labels/icons

**Optional Enhancement:**
```typescript
// Could dynamically generate from registry:
import { OFFER_DEFINITIONS } from "@/lib/offers/registry";

const OFFER_OPTIONS = Object.values(OFFER_DEFINITIONS)
  .filter(def => def.type !== 'custom')
  .map(def => ({
    value: def.type,
    label: def.label,
    icon: def.icon || <FileText />,
    description: def.description,
  }));
```

**Impact:**
- Optional enhancement
- Makes it easier to add new offers (no code changes needed)
- ~10 minutes to implement

### Summary of Changes

| File | Change Type | Complexity | Time Estimate |
|------|-------------|------------|---------------|
| `step2Offers.tsx` | Data source swap | Low | ~5 min |
| `validateOfferRequirements.ts` | Data source swap | Low | ~5 min |
| `step2Offers.tsx` (optional) | Dynamic generation | Low | ~10 min |

**Total Estimated Time: ~20 minutes** (including optional enhancement)

### What Stays the Same

✅ **Step 2 UI structure** - No visual changes needed  
✅ **Step 3 validation logic** - Already works correctly  
✅ **User experience** - Same flow, same validation  
✅ **Storage format** - Still stores `selectedOffers: OfferType[]`  
✅ **Validation timing** - Still validates in Step 3 before proceeding  

### Migration Path

1. **Create offer definitions** - Build the new `OFFER_DEFINITIONS` registry
2. **Update imports** - Change `getOfferRequirements` → `getOfferDefinition` in 2 files
3. **Update property access** - Change `requirements.requiredFields` → `definition.inputRequirements.requiredFields`
4. **Test** - Verify validation still works correctly
5. **Optional** - Make offer options dynamic from registry

### Backward Compatibility

The old `OFFER_REQUIREMENTS` object can remain temporarily for reference, but should be deprecated once the new system is in place. The new system provides the same data structure (`requiredFields` array) so the validation logic doesn't need to change.

---

## Next Steps

1. ✅ Create base types and interfaces (`types.ts`)
2. ✅ Create offer registry (`registry.ts`)
3. ✅ Implement first offer definition (PDF as example)
4. ⏳ Update onboarding to use definitions (Step 2 + validation)
5. ⏳ Update generation API to use definitions
6. ⏳ Add validation and error handling
7. ⏳ Create UI for offer configuration (future)
