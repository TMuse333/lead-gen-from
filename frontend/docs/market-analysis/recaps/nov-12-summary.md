# Landing Page Components - Testing & Integration Phase
**Session Date:** November 12, 2025  
**Status:** All 6 components built ✅ - Ready for API integration and testing

---

## 🎉 WHAT WE ACCOMPLISHED

### ✅ All 6 MVP Components Complete

| # | Component | Schema | TSX | Samples | Status |
|---|-----------|--------|-----|---------|--------|
| 1 | Hero Banner | ✅ | ✅ | ✅ | **COMPLETE** |
| 2 | Profile Summary | ✅ | ✅ | ✅ | **COMPLETE** |
| 3 | Personal Message | ✅ | ✅ | ✅ | **COMPLETE** |
| 4 | Action Plan | ✅ | ✅ | ⚠️ | **COMPLETE** (needs samples) |
| 5 | Market Insights | ✅ | ✅ | ✅ | **COMPLETE** |
| 6 | Next Steps CTA | ✅ | ✅ | ✅ | **COMPLETE** |

---

## 📁 FILES CREATED THIS SESSION

### Component Schemas (for LLM)
```
/lib/schemas/
├── herobanner.ts                 ✅ Schema + LlmHeroBanner interface
├── profileSummary.ts             ✅ Schema + LlmProfileSummary interface
├── personalMessage.ts            ✅ Schema + LlmPersonalMessage interface
├── actionPlan.ts                 ✅ Schema + LlmActionPlan interface
├── marketInsights.ts             ✅ Schema + LlmMarketInsights interface
└── nextStepsCTA.ts               ✅ Schema + LlmNextStepsCTA interface
```

### React Components (for display)
```
/components/landing/
├── HeroBanner.tsx                ✅ Renders hero with urgency styling
├── ProfileSummary.tsx            ✅ Renders profile cards grid
├── PersonalMessage.tsx           ✅ Renders Chris's personal note
├── ActionPlan.tsx                ✅ Carousel of action steps
├── MarketInsights.tsx            ✅ Flow-specific market data display
└── NextStepsCTA.tsx              ✅ Dynamic closing with dual CTAs
```

### Sample Data (for testing)
```
/lib/sampleData/
├── heroSamples.ts                ✅ 9 scenarios (sell/buy/browse)
├── profileSummarySamples.ts      ✅ Various profile examples
├── personalMessageSamples.ts     ✅ 12 scenarios with different tones
├── actionPlanSamples.ts          CREATED (needs to be added)
├── marketInsightsSamples.ts      ✅ 4 seller scenarios (hot/balanced/slow/urgent)
└── nextStepsCTASamples.ts        ✅ 6 scenarios across all flows
```

### Infrastructure & Types
```
/types/resultsPageComponents/
├── schemas.ts                    ✅ Base ComponentSchema interface
├── landingPageSchemas.ts         ✅ Complete LlmOutput + all schemas exported
└── components/
    └── [all component type files]  ✅ Individual interfaces

/lib/prompts/
├── ctaPromptBuilder.ts           ✅ LLM-powered CTA generator
└── landingPagePromptBuilder.ts   ⚠️ INCOMPLETE (you were creating this)

/lib/calc/
└── marketInterpreter.ts          ✅ Flow-specific market data interpretation
```

### Qdrant & Data Retrieval
```
/lib/qdrant/
├── actionSteps.ts                ✅ Query action steps by rules
└── qdrant.ts                     ✅ Query advice by semantic search (existing)

/lib/
├── embeddings.ts                 ✅ Generate embeddings for semantic search
└── [other existing files]

/scripts/
├── setup-qdrant.ts               ✅ Seeds agent-advice collection (existing)
└── setup-action-steps.ts         ✅ Seeds agent-action-steps collection (NEW)
```

---

## 🏗️ ARCHITECTURE OVERVIEW

### Two-Collection Qdrant Setup

```
┌─────────────────────────────────────────────────────────┐
│ Collection 1: agent-advice                              │
│ • Purpose: Personal Message component                   │
│ • Data: Prose advice paragraphs (Chris's expertise)    │
│ • Search: Semantic (embeddings via OpenAI)             │
│ • Query: queryRelevantAdvice(agentId, embedding, ...)  │
│ • Contains: ~10 advice scenarios                        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Collection 2: agent-action-steps                        │
│ • Purpose: Action Plan component                        │
│ • Data: Structured action steps (title, desc, etc.)    │
│ • Search: Rule-based matching (no embeddings)          │
│ • Query: queryActionSteps(agentId, flow, userInput...) │
│ • Contains: 10 seed steps (4 sell, 4 buy, 2 browse)   │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

```
User completes chat
  ↓
POST /api/generate-landing-page
  ↓
1. Generate embedding from userInput
2. Query agent-advice (semantic search)
3. Query agent-action-steps (rule matching)
4. Fetch market data from /api/market-analysis
  ↓
5. Build complete LLM prompt with all schemas
  ↓
6. Call Claude API (or OpenAI)
  ↓
7. Parse JSON response → LlmOutput
  ↓
8. Return to frontend
  ↓
Results page renders all 6 components
```

---

## 🎯 CURRENT API ROUTE STATUS

### Your Current Route (`/api/generate-landing-page`)

**Location:** `app/api/generate-landing-page/route.ts`

**What it does NOW:**
```typescript
POST /api/generate-landing-page
Input: { flow, userInput, agentId }

Steps:
1. ✅ Generate embedding
2. ✅ Query agent advice
3. ✅ Query action steps
4. ✅ Build action plan prompt (only 1 component!)
5. ✅ Call OpenAI
6. ✅ Return parsed JSON

ISSUE: Only generates Action Plan, not all 6 components!
```

**What it NEEDS to do:**
```typescript
POST /api/generate-landing-page
Input: { flow, userInput, agentId }

Steps:
1. ✅ Generate embedding
2. ✅ Query agent advice (for Personal Message)
3. ✅ Query action steps (for Action Plan)
4. ✅ Fetch market data (for Market Insights)
5. ❌ Build COMPLETE prompt with ALL 6 schemas
6. ❌ Call Claude/OpenAI with higher token limit
7. ❌ Parse complete LlmOutput with all 6 components
8. ❌ Validate all components present
9. ✅ Return to frontend

NEED: Complete prompt builder that generates all 6 at once
```

---

## 🔑 KEY TYPES & INTERFACES

### Complete LlmOutput (All Components)

```typescript
// From: /types/resultsPageComponents/landingPageSchemas.ts

export interface LlmOutput {
  hero: LlmHeroBanner;
  profileSummary: LlmProfileSummary;
  personalMessage: LlmPersonalMessage;
  actionPlan: LlmActionPlan;
  marketInsights: LlmMarketInsights;
  nextStepsCTA: LlmNextStepsCTA;
}

// All schemas exported as array:
export const LANDING_PAGE_SCHEMAS: ComponentSchema[] = [
  HERO_BANNER_SCHEMA,
  PROFILE_SUMMARY_SCHEMA,
  PERSONAL_MESSAGE_SCHEMA,
  ACTION_PLAN_SCHEMA,
  MARKET_INSIGHTS_SCHEMA,
  NEXT_STEPS_CTA_SCHEMA,
];
```

### UserInput Type

```typescript
// From: /types/chat.types.ts

export type LlmInput = Record<LlmMappingKey, string>;

// Example userInput:
{
  flow: "sell",
  timeline: "0-3",
  propertyType: "single-family house",
  sellingReason: "relocating",
  renovations: "kitchen",
  email: "user@example.com"
}
```

---

## 🧪 TESTING STRATEGY

### Current Test Setup

You mentioned having:
```bash
# Sample data file
/samples/sample.chat.json

# Test command
curl -s -X POST http://localhost:3000/api/test-component \
  -d '{ "sample": "buy-first-home.json" }' | jq .
```

### Recommended Test Flow

**Phase 1: Test Individual Components**
```bash
# Test each component in isolation with sample data
# Make sure React components render properly

# Example test file structure:
/samples/
├── seller-urgent.json          # 0-3mo, relocating
├── seller-planned.json         # 6-12mo, upsizing
├── buyer-first-home.json       # First-time buyer
├── buyer-upgrade.json          # Upgrading home
└── browser-curious.json        # Just exploring
```

**Phase 2: Test Qdrant Collections**
```bash
# Verify both collections have data
curl http://localhost:6333/collections/agent-advice | jq .
curl http://localhost:6333/collections/agent-action-steps | jq .

# Test semantic search
# (Run your existing queryRelevantAdvice function)

# Test rule matching
# (Run your existing queryActionSteps function)
```

**Phase 3: Test API Route**
```bash
# Test landing page generation
curl -X POST http://localhost:3000/api/generate-landing-page \
  -H "Content-Type: application/json" \
  -d '{
    "flow": "sell",
    "agentId": "your-agent-id",
    "userInput": {
      "timeline": "0-3",
      "propertyType": "single-family house",
      "sellingReason": "relocating",
      "renovations": "kitchen",
      "email": "sarah@example.com"
    }
  }' | jq .
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "hero": { "headline": "...", ... },
    "profileSummary": { "cards": [...], ... },
    "personalMessage": { "greeting": "...", ... },
    "actionPlan": { "steps": [...], ... },
    "marketInsights": { "insights": [...], ... },
    "nextStepsCTA": { "hook": "...", ... }
  },
  "metadata": {
    "flow": "sell",
    "componentsGenerated": 6,
    "adviceUsed": 3,
    "actionStepsUsed": 4
  }
}
```

---

## 🚧 WHAT NEEDS TO BE DONE NEXT

### Priority 1: Complete the Prompt Builder ⚠️

**File:** `/lib/prompts/landingPagePromptBuilder.ts`

**Status:** YOU STARTED THIS but didn't finish. File was truncated mid-creation.

**What it needs:**
```typescript
export function buildCompleteLandingPagePrompt(context: {
  flow: string;
  userInput: Record<string, string>;
  agentAdvice: any[];
  actionStepMatches: any[];
  marketData: any;
  schemas: ComponentSchema[];
}): string {
  // Build a prompt that:
  // 1. Explains user context (flow, inputs)
  // 2. Provides Qdrant data (advice + action steps)
  // 3. Includes market data
  // 4. Describes all 6 component schemas
  // 5. Gives specific instructions per component
  // 6. Requests JSON output with all 6 components
  
  return `[Complete prompt string]`;
}
```

**Instructions for each component:**
- Hero: Use first name, match urgency to timeline
- Profile Summary: Visual cards from userInput
- Personal Message: Use agentAdvice to inform tone
- Action Plan: Use actionStepMatches, personalize for user
- Market Insights: Use marketData.flowSpecific
- Next Steps CTA: LLM-powered, references all above

### Priority 2: Update API Route

**File:** `app/api/generate-landing-page/route.ts`

**Changes needed:**
1. Import `buildCompleteLandingPagePrompt`
2. Add market data fetch step
3. Call complete prompt builder (not just action plan)
4. Increase max_tokens to 8000+ (6 components need more)
5. Consider using Claude instead of OpenAI (better at following schemas)
6. Add validation after parsing

### Priority 3: Create ActionPlan Sample Data

**File:** `/lib/sampleData/actionPlanSamples.ts`

**Needs:** 3-4 complete action plan examples similar to other samples

### Priority 4: Build Results Page

**File:** `app/results/[id]/page.tsx` (or wherever)

**Needs:** Page that renders all 6 components in sequence
```typescript
<HeroBanner data={llmOutput.hero} />
<ProfileSummary data={llmOutput.profileSummary} />
<PersonalMessage data={llmOutput.personalMessage} />
<ActionPlan data={llmOutput.actionPlan} />
<MarketInsights data={llmOutput.marketInsights} />
<NextStepsCTA data={llmOutput.nextStepsCTA} />
```

---

## 🔧 CRITICAL IMPLEMENTATION NOTES

### 1. Token Limits

**OpenAI gpt-4o-mini:** 16K output tokens max
**Claude Sonnet 4.5:** 8K output tokens max

Generating 6 components = ~5-7K tokens total
- Current route uses 4000 max_tokens ⚠️ TOO LOW
- Increase to 8000 for safety

### 2. Model Choice

**Recommendation: Use Claude Sonnet 4.5**
- Better at following complex schemas
- Better JSON output
- Your actionPlan.ts prompt was designed for Claude
- More reliable for structured output

**Current:** Using OpenAI (gpt-4o-mini)
**Consider switching to:** Claude for better results

### 3. Error Handling

Add validation after parsing:
```typescript
import { validateLlmOutput } from '@/types';

const llmOutput = JSON.parse(rawText);
const validation = validateLlmOutput(llmOutput);

if (!validation.valid) {
  console.error('Missing:', validation.missing);
  // Handle missing components
}
```

### 4. Market Data Integration

Your route currently doesn't fetch market data. Add:
```typescript
const marketResponse = await fetch(
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/market-analysis?flow=${flow}&area=${userInput.location || 'Halifax'}`
);
const marketData = await marketResponse.json();
```

---

## 📊 COMPONENT SUMMARY REFERENCE

### 1. Hero Banner
- **Purpose:** Attention-grabbing greeting
- **Data needed:** userInput (timeline, name)
- **Qdrant:** No
- **Urgency levels:** high/medium/low based on timeline

### 2. Profile Summary
- **Purpose:** Visual validation of inputs
- **Data needed:** userInput (all fields)
- **Qdrant:** No
- **Cards:** 3-6 key facts with emphasis levels

### 3. Personal Message
- **Purpose:** Chris's personal note, builds trust
- **Data needed:** userInput + agentAdvice
- **Qdrant:** ✅ YES (agent-advice collection)
- **Tone:** urgent-supportive/calm-confident/excited-encouraging

### 4. Action Plan ⭐ (Most Complex)
- **Purpose:** Actionable steps
- **Data needed:** userInput + actionStepMatches
- **Qdrant:** ✅ YES (agent-action-steps collection)
- **Steps:** 1-5 steps in carousel
- **Urgency:** immediate/soon/later per step

### 5. Market Insights
- **Purpose:** Flow-specific market data
- **Data needed:** marketData from /api/market-analysis
- **Qdrant:** No
- **Insights:** 3-4 metrics with sentiment (positive/neutral/caution)

### 6. Next Steps CTA
- **Purpose:** Drive action, create momentum
- **Data needed:** All above components (for context)
- **Qdrant:** No (LLM-generated dynamically)
- **CTAs:** Primary + Secondary with trust elements

---

## 🎯 TESTING CHECKLIST

### Before Testing
- [ ] Both Qdrant collections seeded (agent-advice + agent-action-steps)
- [ ] OpenAI API key set (or Claude API key)
- [ ] Market analysis API working
- [ ] All component files in correct locations

### Test Flow
1. [ ] Test Qdrant queries independently
2. [ ] Test embedding generation
3. [ ] Test market data API
4. [ ] Test prompt builder (if complete)
5. [ ] Test full API route with curl
6. [ ] Verify all 6 components in response
7. [ ] Test with different flows (sell/buy/browse)
8. [ ] Test with different timelines (urgent/planned)

### Common Issues to Watch For
- [ ] JSON parsing errors (markdown code blocks in response)
- [ ] Missing components (incomplete generation)
- [ ] Token limit exceeded (increase max_tokens)
- [ ] Qdrant connection errors (check collections exist)
- [ ] Type mismatches (validate against LlmOutput)

---

## 💡 NEXT SESSION GOALS

1. **Complete the prompt builder** (highest priority)
2. **Update API route** to use complete prompt
3. **Test end-to-end** with curl commands
4. **Debug and iterate** on prompt/responses
5. **Build results page** once API works
6. **Create actionPlan samples** for testing

---

## 📚 KEY IMPORTS FOR NEXT SESSION

```typescript
// Types
import { 
  LANDING_PAGE_SCHEMAS, 
  LlmOutput, 
  validateLlmOutput 
} from '@/types';

// Qdrant Queries
import { queryRelevantAdvice } from '@/lib/qdrant/qdrant';
import { queryActionSteps } from '@/lib/qdrant/actionSteps';

// Embeddings
import { generateUserEmbedding } from '@/lib/embeddings';

// Prompts (INCOMPLETE)
import { buildCompleteLandingPagePrompt } from '@/lib/prompts/landingPagePromptBuilder';

// Market Data
import { interpretMarketForFlow } from '@/lib/calc/marketInterpreter';
```

---

## 🙏 FINAL NOTES

**You're 90% there!** All the hard architecture work is done:
- ✅ Component schemas defined
- ✅ React components built
- ✅ Qdrant collections designed
- ✅ Query logic implemented
- ✅ Type system complete

**What's left is primarily:**
1. Finishing the prompt builder (was truncated)
2. Wiring it all together in the API route
3. Testing and debugging

The foundation is solid. Next session is about integration and testing!

---

**Good luck with testing! The architecture is sound and ready to go. 🚀**