# Data Model Simplification Guide

**Created**: 2026-01-06
**Updated**: 2026-01-06
**Purpose**: Explain current data model complexity and how to simplify with intent-based offers

---

## What "Changing the Data Model" Means

The "data model" is the **structure of types, stores, and relationships** that define how your app works. It's not just database schemas—it's:

1. **TypeScript types** that define shapes of data
2. **Zustand stores** that hold state
3. **Relationships** between different pieces of data
4. **The flow** of data from user input → storage → output

Changing the data model means restructuring these to be simpler and more aligned with your goals.

---

## Key Terminology Change: Flow → Intent

| Old Term | New Term | Reason |
|----------|----------|--------|
| Flow | Intent | "Flow" implies a configurable sequence; "Intent" is user classification |
| `currentFlow` | `currentIntent` | Semantic clarity |
| Flow configuration | **Removed** | Offers own their questions |
| `FlowType` | `Intent` | Type rename |

**Intent** represents what the user wants to do: `'buy' | 'sell' | 'browse'`

It's not a configurable entity—it's just a filter to determine which offers apply.

---

## Current Data Model: The Full Picture

### The Five Key Stores/Types (Current)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CURRENT ARCHITECTURE                          │
└─────────────────────────────────────────────────────────────────────────┘

1. OnboardingStore (src/stores/onboardingStore/onboarding.store.ts)
   ├─ businessName, industry
   ├─ selectedOffers: OfferType[]
   ├─ offerFlowMap: Record<OfferType, FlowIntention[]>  ← REMOVE
   ├─ conversationFlows: Record<string, ConversationFlow>  ← REMOVE
   ├─ knowledgeBaseItems: [...]
   └─ colorConfig: ColorTheme

2. ConversationStore (src/stores/conversationConfig/conversation.store.ts)
   ├─ flows: Record<string, ConversationFlow>  ← REMOVE ENTIRELY
   │   └─ Each flow has questions with mappingKeys
   └─ settings, activeFlowId

3. ChatStore (src/stores/chatStore/types.ts)
   ├─ messages: ChatMessage[]
   ├─ userInput: Record<string, string>
   ├─ skippedFields: Set<string>
   ├─ currentFlow → currentIntent  ← RENAME
   └─ conversationId

4. OfferDefinition (src/lib/offers/core/types.ts)
   ├─ type: OfferType
   ├─ inputRequirements: InputRequirements  ← REPLACE with intentQuestions
   └─ buildPrompt, outputSchema, etc.

5. ConversationQuestion (src/types/conversation.types.ts)
   ├─ mappingKey linking to offers  ← MOVE INTO OfferTemplate
   └─ buttons, validation, etc.
```

### The Core Problem: Two Independent Systems

```
SYSTEM A: Offers                    SYSTEM B: Conversations
─────────────────────               ──────────────────────────
OfferDefinition                     ConversationFlow
  ├─ requiredFields: [              ├─ questions: [
  │     'email',                    │     { mappingKey: 'email', ... },
  │     'location',     ←───?───→   │     { mappingKey: 'propertyLocation', ... },
  │     'timeline',                 │     { mappingKey: 'timeline', ... },
  │   ]                             │   ]

Problem: 'location' ≠ 'propertyLocation'
Problem: User can delete questions after onboarding
Problem: No runtime validation catches mismatches
```

---

## New Data Model: Intent-Based Offers

### The Simplified Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         NEW ARCHITECTURE                                │
└─────────────────────────────────────────────────────────────────────────┘

1. OnboardingStore (SIMPLIFIED)
   ├─ businessName, industry
   ├─ selectedOffers: OfferType[]  ← Only this matters
   ├─ personality: string          ← Optional customization
   ├─ colorConfig: ColorTheme
   └─ knowledgeBaseItems: [...]

   REMOVED: offerFlowMap, conversationFlows

2. ConversationStore → REMOVED OR MINIMAL
   └─ Maybe keep for settings only

3. ChatStore (RENAMED: flow → intent)
   ├─ messages: ChatMessage[]
   ├─ userInput: Record<string, string>
   ├─ currentIntent: Intent  ← Renamed from currentFlow
   └─ conversationId

4. OfferTemplate (NEW - replaces OfferDefinition)
   ├─ type: OfferType
   ├─ supportedIntents: Intent[]  ← NEW: which intents this offer works for
   ├─ intentQuestions: Record<Intent, QuestionTemplate[]>  ← NEW: questions per intent
   └─ buildPrompt, outputSchema, etc.

5. QuestionTemplate (MOVED INTO OfferTemplate)
   ├─ mappingKey: string  ← Fixed, internal
   ├─ defaultQuestion: string
   └─ inputType, buttons, validation
```

### Single Source of Truth

```
NEW MODEL:

OfferTemplate
  ├─ supportedIntents: ['sell']
  └─ intentQuestions:
      └─ sell: [
            { mappingKey: 'email', question: '...' },
            { mappingKey: 'propertyAddress', question: '...' },
          ]

The offer OWNS its questions. Can't mismatch with itself.
```

---

## The New OfferTemplate Type

```typescript
// src/lib/offers/templates/types.ts

export type Intent = 'buy' | 'sell' | 'browse';

export interface OfferTemplate {
  // Identity
  type: OfferType;
  label: string;
  description: string;
  icon: string;

  // Intent Support (NEW)
  supportedIntents: Intent[];

  // Questions per Intent (NEW - replaces separate flow config)
  intentQuestions: Partial<Record<Intent, QuestionTemplate[]>>;

  // Optional Customization
  customizable?: {
    questionWording?: boolean;   // Can agent tweak question text?
    personality?: boolean;       // Can agent set bot tone?
  };

  // Generation (same as before)
  buildPrompt: PromptBuilder;
  outputSchema: OutputSchema;
  outputValidator: OutputValidator;
  generationMetadata: GenerationMetadata;
  retryConfig: RetryConfig;
  fallbackConfig: FallbackConfig;
  version: OfferVersion;
}

export interface QuestionTemplate {
  id: string;
  defaultQuestion: string;      // Can be lightly customized by agent
  mappingKey: string;           // Fixed, internal - CANNOT be renamed
  required: boolean;
  inputType: 'buttons' | 'text' | 'email' | 'phone';
  buttons?: ButtonTemplate[];
  validation?: FieldValidation;
}

export interface ButtonTemplate {
  id: string;
  label: string;
  value: string;
  icon?: string;
}
```

---

## Intent-Specific vs Multi-Intent Offers

### Single-Intent Offers

Some offers only make sense for specific intents:

```typescript
// Home Estimate - only for sellers
const homeEstimateTemplate: OfferTemplate = {
  type: 'home-estimate',
  label: 'Home Valuation',
  supportedIntents: ['sell'],  // ONLY sellers

  intentQuestions: {
    sell: [
      { id: 'addr', mappingKey: 'propertyAddress', defaultQuestion: 'What is your property address?', required: true, inputType: 'text' },
      { id: 'type', mappingKey: 'propertyType', defaultQuestion: 'What type of property?', required: true, inputType: 'buttons', buttons: [...] },
      { id: 'age', mappingKey: 'propertyAge', defaultQuestion: 'When was it built?', required: true, inputType: 'buttons', buttons: [...] },
      { id: 'reno', mappingKey: 'renovations', defaultQuestion: 'Any recent renovations?', required: false, inputType: 'buttons', buttons: [...] },
      { id: 'email', mappingKey: 'email', defaultQuestion: 'Where should I send your estimate?', required: true, inputType: 'email' },
    ],
    // No 'buy' or 'browse' - not applicable
  },

  buildPrompt: (userInput, context) => { /* ... */ },
  // ...
};
```

### Multi-Intent Offers

Some offers work for multiple intents with different questions:

```typescript
// Real Estate Timeline - works for all intents
const timelineTemplate: OfferTemplate = {
  type: 'real-estate-timeline',
  label: 'Personalized Timeline',
  supportedIntents: ['buy', 'sell', 'browse'],  // All intents

  intentQuestions: {
    buy: [
      { id: 'budget', mappingKey: 'budget', defaultQuestion: 'What is your budget range?', required: true, inputType: 'buttons', buttons: [...] },
      { id: 'location', mappingKey: 'location', defaultQuestion: 'Where are you looking to buy?', required: true, inputType: 'text' },
      { id: 'timeline', mappingKey: 'timeline', defaultQuestion: 'When do you want to move in?', required: true, inputType: 'buttons', buttons: [...] },
      { id: 'email', mappingKey: 'email', defaultQuestion: 'Where should I send your timeline?', required: true, inputType: 'email' },
    ],
    sell: [
      { id: 'propType', mappingKey: 'propertyType', defaultQuestion: 'What type of property are you selling?', required: true, inputType: 'buttons', buttons: [...] },
      { id: 'location', mappingKey: 'location', defaultQuestion: 'Where is your property located?', required: true, inputType: 'text' },
      { id: 'timeline', mappingKey: 'timeline', defaultQuestion: 'When do you want to sell?', required: true, inputType: 'buttons', buttons: [...] },
      { id: 'email', mappingKey: 'email', defaultQuestion: 'Where should I send your timeline?', required: true, inputType: 'email' },
    ],
    browse: [
      { id: 'interest', mappingKey: 'interest', defaultQuestion: 'What are you curious about?', required: true, inputType: 'buttons', buttons: [...] },
      { id: 'email', mappingKey: 'email', defaultQuestion: 'Want me to send you some info?', required: false, inputType: 'email' },
    ],
  },

  buildPrompt: (userInput, context) => { /* ... */ },
  // ...
};
```

---

## Question Merging Logic

When a user starts a chat, the system merges questions from all applicable offers:

```typescript
// src/lib/chat/getQuestionsForIntent.ts

import { offerTemplateRegistry } from '@/lib/offers/templates';
import type { QuestionTemplate, Intent, OfferType } from '@/lib/offers/templates/types';

export function getQuestionsForIntent(
  enabledOffers: OfferType[],
  intent: Intent
): QuestionTemplate[] {
  const questions: QuestionTemplate[] = [];
  const seenMappingKeys = new Set<string>();

  for (const offerType of enabledOffers) {
    const template = offerTemplateRegistry[offerType];
    if (!template) continue;

    // Skip offers that don't support this intent
    if (!template.supportedIntents.includes(intent)) continue;

    const intentQuestions = template.intentQuestions[intent] || [];

    for (const question of intentQuestions) {
      // Deduplicate by mappingKey (if 2 offers need 'email', ask once)
      if (!seenMappingKeys.has(question.mappingKey)) {
        questions.push(question);
        seenMappingKeys.add(question.mappingKey);
      }
    }
  }

  // Sort by priority if needed (required first, etc.)
  return questions.sort((a, b) => {
    if (a.required && !b.required) return -1;
    if (!a.required && b.required) return 1;
    return 0;
  });
}

// Helper to get applicable offers for an intent
export function getApplicableOffers(
  enabledOffers: OfferType[],
  intent: Intent
): OfferType[] {
  return enabledOffers.filter(offerType => {
    const template = offerTemplateRegistry[offerType];
    return template?.supportedIntents.includes(intent);
  });
}
```

---

## New Data Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│ STEP 1: SETUP (Agent Dashboard)                                        │
│                                                                        │
│ Agent enables offers:                                                  │
│   ✅ real-estate-timeline (intents: buy, sell, browse)                │
│   ✅ home-estimate (intents: sell)                                    │
│   ✅ pdf-buyer-guide (intents: buy)                                   │
│                                                                        │
│ Optional: Customize personality, colors                                │
│ That's it. No question/flow configuration.                             │
└────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌────────────────────────────────────────────────────────────────────────┐
│ STEP 2: CHAT (End User)                                                │
│                                                                        │
│ User: "I want to sell my home"                                        │
│     ↓                                                                  │
│ Intent classified: SELL                                                │
│     ↓                                                                  │
│ getApplicableOffers(enabledOffers, 'sell'):                           │
│   ✅ real-estate-timeline (supports sell)                             │
│   ✅ home-estimate (supports sell)                                    │
│   ❌ pdf-buyer-guide (filtered out - buy only)                        │
│     ↓                                                                  │
│ getQuestionsForIntent(applicableOffers, 'sell'):                      │
│   Merge: timeline.intentQuestions.sell + homeEstimate.intentQuestions.sell │
│   Deduplicate by mappingKey (email asked once)                        │
│   Result: [propertyType, location, timeline, propertyAddress, email, ...] │
│     ↓                                                                  │
│ Run merged questions                                                   │
│ Store in userInput: { intent: 'sell', propertyType: '...', ... }      │
└────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌────────────────────────────────────────────────────────────────────────┐
│ STEP 3: GENERATION                                                     │
│                                                                        │
│ For each applicable offer:                                             │
│   - All required fields GUARANTEED (questions came from offer)        │
│   - No validation needed (can't mismatch)                             │
│   - buildPrompt(userInput, context)                                   │
│   - LLM generation                                                     │
│   - Return offer                                                       │
│     ↓                                                                  │
│ User sees: Timeline + Home Estimate (both generated successfully)     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## What Gets Removed

### Stores

| Store | Before | After |
|-------|--------|-------|
| ConversationStore | Holds flows with questions | **REMOVE** (or minimal settings only) |
| OnboardingStore | Has `conversationFlows`, `offerFlowMap` | Just `selectedOffers`, `colors`, `personality` |
| ChatStore | References `currentFlow` | References `currentIntent` |

### Types to Remove

| Type | Action | Reason |
|------|--------|--------|
| `ConversationFlow` | Remove | Offers own questions now |
| `ConversationQuestion` | Replace with `QuestionTemplate` | Lives inside OfferTemplate |
| `FlowType` | Rename to `Intent` | Semantic clarity |
| `offerFlowMap` | Remove | Offers declare own intents |
| `conversationFlows` in stores | Remove | No longer needed |
| `inputRequirements` in OfferDefinition | Replace | `intentQuestions` replaces it |

### Files to Remove

```
❌ src/stores/conversationConfig/defaults/flow.buy.ts
❌ src/stores/conversationConfig/defaults/flow.sell.ts
❌ src/stores/conversationConfig/defaults/flow.browse.ts
❌ src/stores/conversationConfig/actions.ts (most of it)
❌ src/lib/onboarding/validateOfferRequirements.ts
❌ src/components/dashboard/user/conversationEditor/ (entire folder)
```

### Files to Create

```
✅ src/lib/offers/templates/types.ts
✅ src/lib/offers/templates/index.ts (registry)
✅ src/lib/offers/templates/realEstateTimeline.template.ts
✅ src/lib/offers/templates/homeEstimate.template.ts
✅ src/lib/offers/templates/pdfBuyerGuide.template.ts
✅ src/lib/offers/templates/pdfSellerGuide.template.ts
✅ src/lib/chat/getQuestionsForIntent.ts
```

---

## Before/After Comparison

### Configuration Complexity

| Metric | Before | After |
|--------|--------|-------|
| Things user configures | 6 | 2-3 |
| Validation points needed | 4 | 0 |
| Ways to break the system | Many | Very few |
| Time to set up | 30+ min | 5 min |

**Before (User Configures):**
1. Select offers
2. Map offers to flows (`offerFlowMap`)
3. Configure buy flow questions
4. Configure sell flow questions
5. Configure browse flow questions
6. Ensure all mappingKeys match requiredFields

**After (User Configures):**
1. Select offers (that's the main thing)
2. (Optional) Customize personality
3. (Optional) Customize colors

### Type Complexity

| Metric | Before | After |
|--------|--------|-------|
| Core types | 15+ | 8-10 |
| Relationships to maintain | 4 | 1 |
| Stores with flow config | 2 | 0 |
| Validation logic needed | Complex | None |

### Stores

| Metric | Before | After |
|--------|--------|-------|
| Zustand stores | 4 | 2-3 |
| Stores with questions | 2 | 0 |
| Cross-store sync needed | Yes | No |

---

## Offer Template Examples

### Complete Example: Home Estimate (Single-Intent)

```typescript
// src/lib/offers/templates/homeEstimate.template.ts

import type { OfferTemplate } from './types';

export const homeEstimateTemplate: OfferTemplate = {
  type: 'home-estimate',
  label: 'Home Valuation',
  description: 'Get an estimated value for your property',
  icon: '🏠',

  supportedIntents: ['sell'],  // Only for sellers

  intentQuestions: {
    sell: [
      {
        id: 'he-address',
        mappingKey: 'propertyAddress',
        defaultQuestion: 'What is your property address?',
        required: true,
        inputType: 'text',
        validation: { minLength: 5 },
      },
      {
        id: 'he-type',
        mappingKey: 'propertyType',
        defaultQuestion: 'What type of property is it?',
        required: true,
        inputType: 'buttons',
        buttons: [
          { id: 'single', label: 'Single Family', value: 'single-family' },
          { id: 'condo', label: 'Condo', value: 'condo' },
          { id: 'town', label: 'Townhouse', value: 'townhouse' },
          { id: 'multi', label: 'Multi-Family', value: 'multi-family' },
        ],
      },
      {
        id: 'he-age',
        mappingKey: 'propertyAge',
        defaultQuestion: 'Approximately when was it built?',
        required: true,
        inputType: 'buttons',
        buttons: [
          { id: 'new', label: '0-10 years', value: '0-10' },
          { id: 'recent', label: '10-30 years', value: '10-30' },
          { id: 'older', label: '30-50 years', value: '30-50' },
          { id: 'vintage', label: '50+ years', value: '50+' },
        ],
      },
      {
        id: 'he-reno',
        mappingKey: 'renovations',
        defaultQuestion: 'Any major renovations in the last 5 years?',
        required: false,
        inputType: 'buttons',
        buttons: [
          { id: 'kitchen', label: 'Kitchen', value: 'kitchen' },
          { id: 'bath', label: 'Bathroom', value: 'bathroom' },
          { id: 'both', label: 'Both', value: 'kitchen-bathroom' },
          { id: 'none', label: 'None', value: 'none' },
        ],
      },
      {
        id: 'he-email',
        mappingKey: 'email',
        defaultQuestion: 'Where should I send your home estimate?',
        required: true,
        inputType: 'email',
        validation: { type: 'email' },
      },
    ],
  },

  customizable: {
    questionWording: true,
    personality: true,
  },

  buildPrompt: (userInput, context) => {
    return `Generate a home valuation estimate for:
      Address: ${userInput.propertyAddress}
      Type: ${userInput.propertyType}
      Age: ${userInput.propertyAge}
      Renovations: ${userInput.renovations || 'None mentioned'}

      Business: ${context.businessName}
      Additional context: ${context.qdrantAdvice?.join('\n') || 'None'}
    `;
  },

  outputSchema: {
    type: 'object',
    outputType: 'HomeEstimateOutput',
    properties: {
      estimatedValue: { type: 'string', description: 'Estimated property value range' },
      confidence: { type: 'string', description: 'Confidence level of estimate' },
      factors: { type: 'array', description: 'Factors affecting the estimate' },
      recommendations: { type: 'array', description: 'Recommendations to increase value' },
    },
  },

  outputValidator: (output) => {
    if (!output || typeof output !== 'object') {
      return { valid: false, errors: ['Invalid output format'] };
    }
    return { valid: true };
  },

  generationMetadata: {
    model: 'gpt-4o-mini',
    maxTokens: 2000,
    temperature: 0.7,
  },

  retryConfig: {
    maxRetries: 3,
    backoffMs: 1000,
    retryableErrors: ['rate_limit', 'timeout'],
    exponentialBackoff: true,
  },

  fallbackConfig: {
    strategy: 'use-template',
    template: {
      estimatedValue: 'Unable to generate estimate',
      confidence: 'low',
      factors: [],
      recommendations: ['Please contact us for a detailed valuation'],
    },
  },

  version: {
    version: '1.0.0',
    releaseDate: '2026-01-06',
    changelog: 'Initial release',
  },
};
```

---

## Migration Path

### For Existing Users

If users have existing configurations, migrate them:

```typescript
// Migration script pseudocode
function migrateToIntentBasedOffers(oldConfig) {
  return {
    selectedOffers: oldConfig.selectedOffers,  // Keep as-is
    colorConfig: oldConfig.colorConfig,        // Keep as-is
    personality: oldConfig.conversationFlows?.sell?.flowPrompt?.personality || 'friendly',
    // Ignore: conversationFlows, offerFlowMap (no longer needed)
  };
}
```

### For Code

1. Create new `OfferTemplate` types
2. Create templates for existing offers
3. Update chat to use `getQuestionsForIntent()`
4. Rename `currentFlow` → `currentIntent` everywhere
5. Remove old stores/types
6. Update onboarding

---

## Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Source of questions** | ConversationStore (user config) | OfferTemplate (hardcoded) |
| **Intent handling** | Separate flow configs | Offers declare `supportedIntents` |
| **Validation needed** | Complex cross-system | None (self-contained) |
| **User configures questions** | Yes | No |
| **mappingKey can change** | Yes (breaks offers) | No (fixed in template) |
| **Dashboard sections** | 15 | 5-6 |
| **Onboarding steps** | 4-5 | 2-3 |

---

## Next Steps

See `docs/plans/dashboard-reduction-plan.md` for the prompt-by-prompt implementation plan.

Phase order:
1. Dashboard UI consolidation (safe, no model change)
2. Create OfferTemplate system with intent support
3. Remove old flow configuration
