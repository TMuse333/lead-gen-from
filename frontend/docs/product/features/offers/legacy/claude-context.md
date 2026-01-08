# Context for Claude: Offer System Implementation

## Project Overview

**Project**: SaaS Lead Generation Chatbot Platform  
**Tech Stack**: Next.js 14 (App Router), TypeScript, Zustand, MongoDB, Qdrant (vector DB), OpenAI API  
**Purpose**: Multi-tenant SaaS where users configure chatbots that generate personalized offers based on conversation flows

---

## Current Tech Stack & Dependencies

### Core Technologies
- **Next.js 14** with App Router
- **TypeScript** (strict mode)
- **Zustand** for state management (with persistence middleware)
- **MongoDB** for user data, configurations, tracking
- **Qdrant** for vector embeddings and RAG
- **OpenAI API** (currently using `gpt-4o-mini` for most things)
- **NextAuth.js** for authentication
- **Framer Motion** for animations

### Key Libraries
```typescript
// State Management
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// LLM
import OpenAI from 'openai';

// Database
import { ObjectId } from 'mongodb';

// Types
import type { ConversationFlow } from '@/stores/conversationConfig/conversation.store';
import type { OutputValue } from '@/types/genericOutput.types';
```

---

## Current Offer System State

### What Exists Now
1. **Static Requirements Object** (`lib/offers/offerRequirements.ts`)
   - Defines `OFFER_REQUIREMENTS` with `requiredFields` arrays
   - Used in onboarding Step 2 and validation
   - Simple structure: `{ offerType, label, description, requiredFields, icon }`

2. **Generic Generation API** (`app/api/generation/generate-offer/route.ts`)
   - Currently generates flexible `LlmOutput` (generic JSON structure)
   - Uses OpenAI `gpt-4o-mini`
   - Retrieves Qdrant advice via `getPersonalizedAdvice()`
   - Returns generic output that frontend renders flexibly

3. **Onboarding Validation** (`lib/onboarding/validateOfferRequirements.ts`)
   - Validates that required fields exist in conversation flows
   - Used in Step 3 of onboarding
   - Already works correctly, just needs to read from new definitions

### What Needs to Change
- Replace static `OFFER_REQUIREMENTS` with `OFFER_DEFINITIONS` registry
- Add prompt builders, output validators, post-processors per offer
- Update onboarding to read from definitions (minimal changes)
- Update generation API to use definitions

---

## Key Type Definitions

### Offer Types
```typescript
// From: stores/onboardingStore/onboarding.store.ts
export type OfferType = 'pdf' | 'landingPage' | 'video' | 'home-estimate' | 'custom';
export type FlowIntention = 'buy' | 'sell' | 'browse';
```

### Generic Output Types
```typescript
// From: types/genericOutput.types.ts
export type OutputValue = 
  | string | number | boolean | null | undefined
  | OutputValue[]
  | { [key: string]: OutputValue };

// From: types/componentSchema.ts
export type LlmOutput = Record<string, OutputValue | undefined> & {
  _debug?: unknown;
};
```

### Conversation Flow Types
```typescript
// From: stores/conversationConfig/conversation.store.ts
export interface ConversationFlow {
  id: string;
  name: string;
  type: string;
  description?: string;
  flowPrompt: {
    systemBase: string;
    context: string;
    personality: string;
  };
  questions: ConversationQuestion[];
  metadata: FlowMetadata;
}

// From: types/conversation.types.ts
export interface ConversationQuestion {
  id: string;
  question: string;
  order: number;
  mappingKey?: string; // This is what we validate against
  buttons?: ButtonOption[];
  allowFreeText?: boolean;
  validation?: {
    type?: 'email' | 'phone' | 'number' | 'text';
    required?: boolean;
  };
}
```

### Onboarding State
```typescript
// From: stores/onboardingStore/onboarding.store.ts
export interface OnboardingState {
  businessName: string;
  selectedOffers: OfferType[];
  customOffer: string;
  conversationFlows: Record<string, ConversationFlow>; // keyed by 'buy' | 'sell' | 'browse'
  knowledgeBaseItems: Array<{...}>;
  // ... other fields
}
```

---

## Current File Structure

```
frontend/
├── app/
│   ├── api/
│   │   ├── generation/
│   │   │   └── generate-offer/
│   │   │       └── route.ts          # Current generation endpoint
│   │   └── onboarding/
│   │       └── generate-advice-questions/
│   │           └── route.ts
│   └── onboarding/
│       └── page.tsx                  # Onboarding flow
├── src/
│   ├── components/
│   │   └── onboarding/
│   │       └── steps/
│   │           ├── step2Offers.tsx   # Offer selection UI
│   │           └── step3ConversationFlow/
│   │               └── index.tsx     # Flow configuration
│   ├── lib/
│   │   ├── offers/
│   │   │   └── offerRequirements.ts  # CURRENT: Static requirements
│   │   ├── onboarding/
│   │   │   └── validateOfferRequirements.ts  # Validation logic
│   │   ├── personalization/
│   │   │   └── context.ts            # getPersonalizedAdvice()
│   │   └── mongodb/
│   │       └── db.ts                 # Database helpers
│   ├── stores/
│   │   ├── onboardingStore/
│   │   │   └── onboarding.store.ts   # Onboarding state
│   │   └── conversationConfig/
│   │       └── conversation.store.ts # Flow definitions
│   └── types/
│       ├── genericOutput.types.ts    # OutputValue, etc.
│       ├── componentSchema.ts        # LlmOutput type
│       └── conversation.types.ts     # Question types
└── docs/
    └── offers/
        ├── offer-architecture-brainstorm.md  # Implementation guide
        ├── concrete-example.md              # Full example
        └── offer-flow-diagram.md            # Flow diagrams
```

---

## Key Patterns & Conventions

### 1. Zustand Store Pattern
```typescript
// Stores use persist middleware with localStorage
export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      // state and actions
    }),
    {
      name: 'onboarding-storage',
    }
  )
);
```

### 2. API Route Pattern
```typescript
// app/api/[route]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/authConfig";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    // ... logic
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 3. Qdrant Integration
```typescript
// Uses getPersonalizedAdvice() which:
// 1. Generates embedding from userInput + flow
// 2. Queries Qdrant collection (per-user collections)
// 3. Applies rule-based filtering
// 4. Returns ranked advice with metadata

import { getPersonalizedAdvice } from "@/lib/personalization/context";

const { advice, metadata } = await getPersonalizedAdvice(
  agentId,        // User's business identifier
  flow,          // 'buy' | 'sell' | 'browse'
  userInput,     // Record<string, string>
  knowledgeSets  // Array<{ type: 'vector', name: string }>
);
```

### 4. LLM Usage Pattern
```typescript
// Currently using OpenAI
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const completion = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [{ role: 'user', content: prompt }],
  max_tokens: 4000,
  temperature: 0.7,
});

const output = JSON.parse(completion.choices[0].message.content);
```

### 5. Token Tracking Pattern
```typescript
// Token usage is tracked per feature
import { createBaseTrackingObject, trackUsageAsync } from "@/lib/tokenUsage/trackUsage";

const tracking = createBaseTrackingObject('offer-generation', session.user.id);
// ... make LLM call
await trackUsageAsync({
  ...tracking,
  tokensUsed: completion.usage?.total_tokens || 0,
  provider: 'openai',
  model: 'gpt-4o-mini',
});
```

---

## Current Onboarding Flow

### Step 2: Offers Selection
- **File**: `components/onboarding/steps/step2Offers.tsx`
- **Current**: Reads from `OFFER_REQUIREMENTS` static object
- **Shows**: Offer cards with required fields displayed
- **Stores**: `selectedOffers: OfferType[]` in Zustand

### Step 3: Conversation Flow
- **File**: `components/onboarding/steps/step3ConversationFlow/index.tsx`
- **Validates**: Uses `validateOfferRequirements()` to check required fields exist
- **Shows**: Warning banner if requirements missing
- **Blocks**: Proceeding to Step 4 if validation fails

### Validation Function
- **File**: `lib/onboarding/validateOfferRequirements.ts`
- **Current**: Reads from `OFFER_REQUIREMENTS`
- **Does**: Extracts `mappingKeys` from flows, checks against `requiredFields`
- **Returns**: `{ isValid, missingFields, warnings }`

---

## Important Context for Implementation

### 1. Multi-Tenancy
- Each user has their own:
  - MongoDB config document
  - Qdrant collection (named by business identifier)
  - Conversation flows
  - Knowledge base items

### 2. Business Identifier
- Derived from `businessName` in onboarding
- Sanitized: "Bob Real Estate" → "bob-real-estate"
- Used for Qdrant collection names, URLs, etc.

### 3. Flow Types
- Three main flows: `'buy'`, `'sell'`, `'browse'`
- Each flow has questions with `mappingKey` values
- These `mappingKey` values are what offers require

### 4. Generic Output Philosophy
- Current system uses flexible `LlmOutput` type
- Frontend renders generically (no hardcoded components per offer)
- This allows new offer types without frontend changes
- **Keep this flexibility** in the new system

### 5. Qdrant Integration
- Advice is retrieved per-user from their collection
- Uses semantic search + rule-based filtering
- Advice is injected into prompts as context
- Not all offers need Qdrant (but most do)

### 6. Environment Variables
```bash
OPENAI_API_KEY=sk-...
MONGODB_URI=mongodb://...
QDRANT_URL=http://...
QDRANT_API_KEY=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=...
```

---

## What NOT to Change

1. **Onboarding UI Structure** - Keep the same UX
2. **Storage Format** - Still store `selectedOffers: OfferType[]`
3. **Validation Logic** - Already works, just swap data source
4. **Generic Output Type** - Keep `LlmOutput` flexible
5. **Qdrant Integration** - Keep using `getPersonalizedAdvice()`
6. **Token Tracking** - Keep existing tracking system

---

## Implementation Checklist

When implementing, ensure:

- [ ] Create `lib/offers/types.ts` with base interfaces
- [ ] Create `lib/offers/definitions/` folder with individual offer files
- [ ] Create `lib/offers/registry.ts` with `OFFER_DEFINITIONS` map
- [ ] Update `step2Offers.tsx` to use `getOfferDefinition()`
- [ ] Update `validateOfferRequirements.ts` to use definitions
- [ ] Keep backward compatibility during migration
- [ ] Test validation still works in Step 3
- [ ] Ensure all offer types have definitions
- [ ] Update generation API to use definitions (separate task)

---

## Key Files to Reference

1. **Current Requirements**: `src/lib/offers/offerRequirements.ts`
2. **Onboarding Step 2**: `src/components/onboarding/steps/step2Offers.tsx`
3. **Validation**: `src/lib/onboarding/validateOfferRequirements.ts`
4. **Generation API**: `app/api/generation/generate-offer/route.ts`
5. **Onboarding Store**: `src/stores/onboardingStore/onboarding.store.ts`
6. **Output Types**: `src/types/genericOutput.types.ts`
7. **Architecture Doc**: `docs/offers/offer-architecture-brainstorm.md`

---

## Common Gotchas

1. **Type Safety**: Use `OfferType` from onboarding store, not string literals
2. **Mapping Keys**: These come from `question.mappingKey` in flows
3. **Qdrant Collections**: Per-user, named by business identifier
4. **Token Tracking**: Required for all LLM calls
5. **Error Handling**: Always wrap LLM calls in try/catch
6. **JSON Parsing**: LLM output must be valid JSON (no markdown)
7. **Validation**: Happens in Step 3, not Step 2

---

## Questions to Ask if Stuck

1. Should custom offers have a definition? (Yes, flexible one)
2. Can offers share prompt builders? (Yes, create utilities)
3. Should validators be strict or lenient? (Strict for required fields, lenient for structure)
4. How to handle missing Qdrant advice? (Gracefully degrade, still generate)
5. Should model selection be per-offer? (Yes, that's the point)

---

## Next Steps After Implementation

1. Update generation API to use definitions
2. Add per-offer model selection in UI
3. Add prompt customization (future)
4. Add output preview (future)
5. Add A/B testing for prompts (future)

