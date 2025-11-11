# Results Page & Qdrant Integration - MVP Summary

## Overview
This document summarizes the results page architecture, Qdrant integration, and the 6 MVP components planned for the personalized landing page generated after users complete the chatbot flow.

---

## Architecture

### Data Flow
```
User completes chat → userInput collected (LlmInput type)
        ↓
API: /api/generate-landing-page
        ↓
1. Query Qdrant (5-7 relevant advice pieces)
   - Semantic search based on userInput
   - Filter by flow, ruleGroups, and conditions
   - Return advice matching user's situation
        ↓
2. Build LLM Prompt
   - User's answers (userInput)
   - Qdrant advice (Chris's knowledge)
   - Market data (you have this)
   - Component schemas (defines output structure)
        ↓
3. LLM generates structured JSON
   - All components at once
   - Uses Qdrant advice for personalization
        ↓
4. Return LlmOutput to frontend
        ↓
5. Components render personalized page
```

---

## Qdrant Structure

### AgentAdviceScenario Type
```typescript
export interface AgentAdviceScenario {
  id: string;
  agentId: string;
  title: string;                    // "Urgent Relocation Selling Strategy"
  tags: string[];                   // ['selling', 'urgent', 'relocation']
  advice: string;                   // The actual advice content
  applicableWhen: {
    flow?: string[];                // ['sell', 'buy', 'browse']
    ruleGroups?: RuleGroup[];       // Conditional matching rules
    minMatchScore?: number;         // Minimum match threshold (0-1)
  };
  createdAt: Date;
  updatedAt?: Date;
  usageCount?: number;
  embedding?: number[];
}
```

### RuleGroup & ConditionRule
```typescript
type MatchOperator = 'equals' | 'includes' | 'not_equals' | 'greater_than' | 'less_than' | 'between';
type LogicOperator = 'AND' | 'OR';

interface ConditionRule {
  field: string;              // 'timeline', 'sellingReason', etc.
  operator: MatchOperator;
  value: string | string[];   // All strings (parse to numbers if needed)
  weight?: number;            // 1-10, importance for matching
}

interface RuleGroup {
  logic: LogicOperator;       // AND or OR
  rules: (ConditionRule | RuleGroup)[];  // Can nest!
}
```

### Example Advice Entry
```typescript
{
  title: "Urgent Relocation Selling Strategy",
  advice: "When relocating in under 3 months, start decluttering immediately...",
  tags: ['selling', 'urgent', 'relocation'],
  applicableWhen: {
    flow: ['sell'],
    ruleGroups: [
      {
        logic: 'AND',
        rules: [
          { field: 'timeline', operator: 'equals', value: '0-3', weight: 10 },
          { field: 'sellingReason', operator: 'equals', value: 'relocating', weight: 8 }
        ]
      }
    ],
    minMatchScore: 0.7
  }
}
```

---

## Qdrant Query Process

### File: `lib/qdrant/matchingEngine.ts`
Contains the rule evaluation logic:
- `evaluateRule()` - Checks single condition
- `evaluateRuleGroup()` - Recursively evaluates rule groups
- `calculateMatchScore()` - Weighted scoring
- `isAdviceApplicable()` - Main applicability checker
- `filterAndRankAdvice()` - Returns ranked, filtered advice

### File: `lib/qdrant/qdrant.ts`
Contains Qdrant operations:
- `storeAgentAdvice()` - Upload new advice
- `queryRelevantAdvice()` - Semantic search + filtering
- `getAgentAdvice()` - Get all advice for agent
- `deleteAdvice()` - Remove advice

---

## LLM Output Structure

### Type Definition
```typescript
export interface LlmOutput {
  hero: LlmHeroBanner;
  profileSummary: LlmProfileSummary;
  personalMessage: LlmPersonalMessage;      // ← Needs Qdrant
  actionPlan: LlmActionPlan;                // ← Needs Qdrant (MOST IMPORTANT)
  marketInsights: LlmMarketInsights;        // Optional
  nextSteps: LlmNextSteps;                  // CTA section
}
```

---

## 6 MVP Components

### 1. ✅ Hero Banner (DONE)
**File:** `components/landing/HeroBanner.tsx`
**Schema:** `HERO_BANNER_SCHEMA`
**Qdrant:** ❌ Not needed (uses userInput only)
**Purpose:** Attention-grabbing personalized greeting

### 2. ✅ Profile Summary (DONE)
**File:** `components/landing/ProfileSummary.tsx`
**Schema:** `PROFILE_SUMMARY_SCHEMA`
**Qdrant:** ❌ Not needed (displays user's answers)
**Purpose:** Validates personalization with visual cards

### 3. ⏳ Chris's Personal Message (TO BUILD)
**File:** `components/landing/PersonalMessage.tsx` (not created yet)
**Schema:** `PERSONAL_MESSAGE_SCHEMA` (not created yet)
**Qdrant:** ✅ YES - Uses Chris's voice/tone from advice
**Purpose:** Builds trust and human connection
**Content:**
- 3-4 sentence personal note
- References their specific situation
- Uses Qdrant to match Chris's expertise

### 4. ⏳ Personalized Action Plan (TO BUILD) ⭐⭐⭐
**File:** `components/landing/ActionPlan.tsx` (not created yet)
**Schema:** `ACTION_PLAN_SCHEMA` (not created yet)
**Qdrant:** ✅ YES - Critical for personalized steps
**Purpose:** Deliver actionable guidance (HIGHEST VALUE COMPONENT)
**Content:**
- 3-5 numbered action steps
- Each step: title, description, timeframe, CTA
- Steps prioritized by urgency
- Based on Chris's Qdrant advice + their situation

**Example Structure:**
```typescript
interface LlmActionPlan {
  sectionTitle: string;
  introText?: string;
  steps: Array<{
    stepNumber: number;
    title: string;
    description: string;
    timeframe: string;          // "This week", "Next 2 weeks"
    urgency: 'immediate' | 'soon' | 'later';
    ctaText?: string;           // "Schedule Now"
    ctaLink?: string;
    icon?: string;
  }>;
  closingNote?: string;
}
```

### 5. ⏳ Market Insights (TO BUILD)
**File:** `components/landing/MarketInsights.tsx` (not created yet)
**Schema:** `MARKET_INSIGHTS_SCHEMA` (not created yet)
**Qdrant:** ⚠️ Optional - Could use Chris's market knowledge
**Purpose:** Show market expertise with data
**Content:**
- 2-3 key market stats
- Context for their situation
- Simple data visualization

### 6. ⏳ Next Steps CTA (TO BUILD)
**File:** `components/landing/NextStepsCTA.tsx` (not created yet)
**Schema:** `NEXT_STEPS_CTA_SCHEMA` (not created yet)
**Qdrant:** ❌ Not needed
**Purpose:** Convert to action
**Content:**
- Clear primary CTA (Schedule Call)
- Secondary options
- Urgency-based messaging

---

## Schema Registry

### File: `lib/llmSchemas.ts`
Central collection of all schemas:
```typescript
export const LANDING_PAGE_SCHEMAS: ComponentSchema[] = [
  HERO_BANNER_SCHEMA,           // ✅ Done
  PROFILE_SUMMARY_SCHEMA,       // ✅ Done
  // PERSONAL_MESSAGE_SCHEMA,   // ⏳ To add
  // ACTION_PLAN_SCHEMA,         // ⏳ To add
  // MARKET_INSIGHTS_SCHEMA,     // ⏳ To add
  // NEXT_STEPS_CTA_SCHEMA,      // ⏳ To add
];
```

---

## API Route Structure

### File: `app/api/generate-landing-page/route.ts`
```typescript
export async function POST(req: Request) {
  const { flow, userInput, agentId } = await req.json();
  
  // 1. Query Qdrant for relevant advice
  const agentKnowledge = await queryRelevantAdvice(
    agentId,
    flow,
    userInput,
    5  // Get top 5 pieces
  );
  
  // 2. Get market data (you have this)
  const marketData = await getMarketData(userInput);
  
  // 3. Build prompt with schemas
  const prompt = generateLandingPagePrompt(
    flow,
    userInput,
    marketData,
    agentKnowledge,  // ← Qdrant advice injected here
    LANDING_PAGE_SCHEMAS
  );
  
  // 4. Call Anthropic API
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }]
  });
  
  // 5. Parse and return
  const llmOutput = JSON.parse(response.content[0].text);
  return Response.json({ success: true, data: llmOutput });
}
```

---

## Next Steps (Priority Order)

### Immediate (Next Chat)
1. **Create ACTION_PLAN_SCHEMA** - Define structure for action steps
2. **Build ActionPlan component** - Render the steps nicely
3. **Wire Qdrant into API route** - Actually query and pass advice to LLM
4. **Test end-to-end** - User completes chat → sees personalized action plan

### After Action Plan Works
5. Create PERSONAL_MESSAGE_SCHEMA + component
6. Create MARKET_INSIGHTS_SCHEMA + component (optional if time)
7. Create NEXT_STEPS_CTA_SCHEMA + component

---

## Key Files Reference

### Types
- `types/chat.types.ts` - LlmInput, ChatNode
- `types/llmOutput.types.ts` - LlmHeroBanner, LlmProfileSummary, etc.
- `types/index.ts` - AgentAdviceScenario, RuleGroup, ConditionRule

### Qdrant
- `lib/qdrant/qdrant.ts` - Qdrant operations
- `lib/qdrant/matchingEngine.ts` - Rule evaluation logic

### Schemas
- `lib/llmSchemas.ts` - All component schemas
- `lib/promptBuilder.ts` - Builds LLM prompts from schemas

### Components (Built)
- `components/landing/HeroBanner.tsx`
- `components/landing/ProfileSummary.tsx`

### Components (To Build)
- `components/landing/PersonalMessage.tsx`
- `components/landing/ActionPlan.tsx` ⭐⭐⭐
- `components/landing/MarketInsights.tsx`
- `components/landing/NextStepsCTA.tsx`

### Sample Data
- `lib/sampleData/heroSamples.ts`
- `lib/sampleData/profileSummarySamples.ts`

### Admin UI (Done)
- `components/client/adviceDashboard/viewAgentAdvice.tsx` - View/delete advice
- `components/client/adviceDashboard/agentAdviceUploader.tsx` - Add advice
- `components/client/adviceDashboard/RuleBuilder.tsx` - Rule UI

---

## Sample User Flow

1. User: Sarah (selling, 0-3 months, relocating, renovated kitchen)
2. Qdrant finds:
   - "Urgent Relocation Selling Strategy"
   - "Kitchen Renovation Value Impact"
   - "General Seller Market Timing Advice"
3. LLM generates:
   - Hero: "Let's Get Your Home Sold Fast, Sarah!"
   - Profile: Shows her answers
   - Personal Message: "Sarah, I've helped 20+ families relocate in tight timelines..."
   - Action Plan:
     1. Get professional valuation (This week)
     2. Start decluttering immediately (Next 2 weeks)
     3. Professional photos + staging (Week 3)
   - Next Steps: "Schedule 15-min Call"

---

## Context Size Impact

**Current Chat Size:** ~150+ messages, ~80K+ tokens
**New Chat Size:** This summary + new messages

**Estimated Savings:**
- **Token usage:** 85-90% reduction per message
- **Response quality:** Better - Claude sees only relevant context
- **Cost savings:** ~$0.20-0.40 per conversation
- **Speed:** Faster responses with less context to process

**Recommendation:** Start fresh chat with this .md file attached for Action Plan implementation.