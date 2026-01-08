# Dashboard Reduction Plan

**Created**: 2026-01-06
**Updated**: 2026-01-06
**Goal**: Reduce dashboard from 15 tabs to 5-6 tabs + simplify to intent-based offer architecture

---

## Current State: 15 Dashboard Sections

```
Core Features (4):     offers, leads, my-conversations, analytics
Configuration (3):     config, conversations, colors
Knowledge Base (5):    advice, speech-upload, rules-explanation, recommended-rules, view-all-rules
Other (3):             overview, token-usage
```

**Problems**:
- Too many sections create cognitive overload for real estate agents
- `conversations` editor is disconnected from `offers` requirements
- Users can configure questions that don't collect data offers need
- Validation only happens during onboarding, breaks after edits
- "Flow" terminology implies configurable sequences when they shouldn't be

---

## Target State: 5-6 Dashboard Sections

```
1. Overview       (status + analytics merged)
2. Offers         (enable/disable, see supported intents per offer)
3. Leads          (view collected leads)
4. Conversations  (history only - viewing past chats, NO editing)
5. Knowledge Base (all KB content with internal tabs)
6. Settings       (colors, personality, usage stats)
```

---

## Key Architecture Change: Intent-Based Offers

### Terminology Change

| Old Term | New Term | Why |
|----------|----------|-----|
| Flow | Intent | "Flow" implies configurable sequence; "Intent" is just user classification |
| Flow configuration | **Removed** | Offers dictate questions, no separate config |
| `currentFlow` | `currentIntent` | Semantic clarity |

### Current Model (Complex)
```
User configures Offers ←--validation--→ User configures Flows ←--→ Questions
                              ↑
                        (breaks here)
```

### New Model (Simple)
```
User enables Offers → Offers declare supported intents + questions
                      ↓
Chat classifies user intent → Filters to applicable offers → Merges questions
                      ↓
                   Generation (guaranteed to have all required fields)
```

**Benefits**:
- Eliminates validation mismatch bugs entirely
- Real estate agents don't need technical knowledge
- Offers are self-contained (single source of truth)
- Intent is just filtering, not configuration

---

## Intent-Specific vs Multi-Intent Offers

### Single-Intent Offers
Some offers only make sense for specific intents:

| Offer | Supported Intents | Why |
|-------|-------------------|-----|
| Home Estimate | `['sell']` | Can't estimate a home you don't own |
| Buyer's Guide PDF | `['buy']` | Not relevant for sellers |
| Seller's Guide PDF | `['sell']` | Not relevant for buyers |

### Multi-Intent Offers
Some offers work across multiple intents with different questions:

| Offer | Supported Intents | Notes |
|-------|-------------------|-------|
| Real Estate Timeline | `['buy', 'sell', 'browse']` | Different questions per intent |
| General PDF | `['buy', 'sell', 'browse']` | Same questions, different content |

---

## What to Hardcode vs Let User Customize

| Component | Hardcode | User Customizes |
|-----------|----------|-----------------|
| Questions per offer/intent | Yes | No |
| Question order | Yes | No |
| mappingKey names | Yes (internal) | No |
| Required fields | Yes | No |
| Supported intents per offer | Yes | No |
| Question wording | Default | Light editing (optional) |
| Bot personality/tone | Default | Yes |
| Which offers to enable | No | Yes |
| Branding/colors | No | Yes |

---

## Implementation Phases

### Phase 1: Dashboard UI Consolidation (Prompts 1-4)
**No data model changes. Safe. Immediate visual progress.**

#### Prompt 1: Merge Settings Tabs
- Merge `config` + `colors` into `Settings`
- Move `token-usage` into Settings as sub-tab
- **Result: 15 → 12 tabs**

#### Prompt 2: Merge Knowledge Base Tabs
- Consolidate 5 KB sections into one `Knowledge Base` with internal navigation
- Sections: advice, speech-upload, rules-explanation, recommended-rules, view-all-rules
- **Result: 12 → 8 tabs**

#### Prompt 3: Merge Overview + Analytics
- Combine into single `Overview` dashboard
- **Result: 8 → 7 tabs**

#### Prompt 4: Simplify Conversation Sections
- Remove `conversations` (editor) - will be fully removed in Phase 2
- Keep only `my-conversations` → rename to `Conversations` (history only)
- **Result: 7 → 6 tabs**

---

### Phase 2: Intent-Based Offer System (Prompts 5-7)
**Core architecture change. Fixes the validation bug.**

#### Prompt 5: Create OfferTemplate Type System
```typescript
interface OfferTemplate {
  type: OfferType;
  label: string;
  description: string;
  icon: string;

  // Intent support (the key addition)
  supportedIntents: Intent[];

  // Questions per intent (replaces separate flow config)
  intentQuestions: Partial<Record<Intent, QuestionTemplate[]>>;

  // Light customization
  customizable?: {
    questionWording?: boolean;
    personality?: boolean;
  };

  // Generation (same as before)
  buildPrompt: PromptBuilder;
  outputSchema: OutputSchema;
  outputValidator: OutputValidator;
  generationMetadata: GenerationMetadata;
}

type Intent = 'buy' | 'sell' | 'browse';

interface QuestionTemplate {
  id: string;
  defaultQuestion: string;
  mappingKey: string;        // Fixed, internal
  required: boolean;
  inputType: 'buttons' | 'text' | 'email' | 'phone';
  buttons?: ButtonTemplate[];
  validation?: FieldValidation;
}
```

#### Prompt 6: Create Offer Templates
Create templates for existing offers:

**Single-Intent:**
- `home-estimate.template.ts` - supportedIntents: `['sell']`
- `pdf-buyer-guide.template.ts` - supportedIntents: `['buy']`
- `pdf-seller-guide.template.ts` - supportedIntents: `['sell']`

**Multi-Intent:**
- `real-estate-timeline.template.ts` - supportedIntents: `['buy', 'sell', 'browse']`
- `landing-page.template.ts` - supportedIntents: `['buy', 'sell', 'browse']`

#### Prompt 7: Wire Up Intent-Based Question Merging
```typescript
// src/lib/chat/getQuestionsForIntent.ts

function getQuestionsForIntent(
  enabledOffers: OfferType[],
  intent: Intent
): QuestionTemplate[] {
  const questions: QuestionTemplate[] = [];
  const seenMappingKeys = new Set<string>();

  for (const offerType of enabledOffers) {
    const template = offerTemplateRegistry[offerType];

    // Skip if offer doesn't support this intent
    if (!template.supportedIntents.includes(intent)) continue;

    const intentQuestions = template.intentQuestions[intent] || [];

    for (const question of intentQuestions) {
      // Deduplicate by mappingKey
      if (!seenMappingKeys.has(question.mappingKey)) {
        questions.push(question);
        seenMappingKeys.add(question.mappingKey);
      }
    }
  }

  return questions;
}
```

Update chat components:
- Replace `currentFlow` with `currentIntent`
- Use merged questions from applicable offers
- Add `intent` to userInput automatically

---

### Phase 3: Cleanup (Prompts 8-9)
**Remove what's no longer needed.**

#### Prompt 8: Remove Flow/Conversation Configuration
- Delete `src/stores/conversationConfig/` or reduce to minimal settings
- Delete `src/stores/conversationConfig/defaults/flow.*.ts`
- Delete `src/components/dashboard/user/conversationEditor/`
- Delete `src/lib/onboarding/validateOfferRequirements.ts`
- Remove `ConversationFlow` type
- Remove `offerFlowMap` from OnboardingStore

#### Prompt 9: Simplify Onboarding
New onboarding flow:
- Step 1: Select offers to enable (shows supported intents per offer)
- Step 2: Customize personality/tone (optional)
- Step 3: Branding/colors
- **Done. No question configuration.**

Remove from onboarding:
- `conversationFlows` configuration step
- Validation step (no longer needed)
- `offerFlowMap` configuration

---

## Files to Modify

### Phase 1 (UI Consolidation)
- `src/components/dashboard/user/userDashboard/userDashboard.tsx`
- Create: `src/components/dashboard/user/settings/SettingsDashboard.tsx`
- Create: `src/components/dashboard/user/knowledgeBase/KnowledgeBaseDashboard.tsx`
- Modify: `src/components/dashboard/user/overview/` (merge analytics)

### Phase 2 (Offer Templates)
- Create: `src/lib/offers/templates/types.ts`
- Create: `src/lib/offers/templates/index.ts` (registry)
- Create: `src/lib/offers/templates/realEstateTimeline.template.ts`
- Create: `src/lib/offers/templates/homeEstimate.template.ts`
- Create: `src/lib/offers/templates/pdf.template.ts`
- Create: `src/lib/chat/getQuestionsForIntent.ts`
- Modify: `src/components/ux/chatWithTracker/chatWithTracker.tsx`
- Modify: `src/stores/chatStore/types.ts` (flow → intent)

### Phase 3 (Cleanup)
- Remove: `src/stores/conversationConfig/` (most of it)
- Remove: `src/components/dashboard/user/conversationEditor/`
- Remove: `src/lib/onboarding/validateOfferRequirements.ts`
- Simplify: `src/stores/onboardingStore/onboarding.store.ts`
- Simplify: `src/components/onboarding/steps/`

---

## New Data Flow Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│ SETUP (Agent Dashboard)                                                │
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
│ CHAT (End User)                                                        │
│                                                                        │
│ User: "I want to sell my home"                                        │
│     ↓                                                                  │
│ Intent classified: SELL                                                │
│     ↓                                                                  │
│ Filter offers by intent:                                               │
│   ✅ real-estate-timeline (supports sell)                             │
│   ✅ home-estimate (supports sell)                                    │
│   ❌ pdf-buyer-guide (filtered out - buy only)                        │
│     ↓                                                                  │
│ Merge questions from applicable offers:                                │
│   timeline.intentQuestions.sell + homeEstimate.intentQuestions.sell   │
│   Deduplicated by mappingKey                                           │
│     ↓                                                                  │
│ Run questions, collect userInput                                       │
│ userInput.intent = 'sell' (added automatically)                        │
└────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌────────────────────────────────────────────────────────────────────────┐
│ GENERATION                                                             │
│                                                                        │
│ For each applicable offer:                                             │
│   - All required fields GUARANTEED (questions came from offer)        │
│   - buildPrompt(userInput, context)                                   │
│   - LLM generation                                                     │
│   - outputValidator(result)                                            │
│   - Return generated offer                                             │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Success Criteria

- [ ] Dashboard has 5-6 sections (down from 15)
- [ ] Real estate agent can set up bot in < 5 minutes
- [ ] No validation errors when generating offers
- [ ] `intent` is automatically included in userInput
- [ ] Questions are determined by enabled offers + user intent
- [ ] Onboarding is 3 steps or fewer
- [ ] ConversationStore/flow config is removed
- [ ] No separate "flow" configuration exists

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking existing user configs | Migration script to extract enabled offers from old config |
| Losing flexibility | Add "Advanced Mode" toggle later for power users |
| Regression in chat flow | Test each intent (buy/sell/browse) end-to-end |
| Missing offer templates | Create templates for all 6 current offer types |

---

## Effort Estimate

| Phase | Prompts | Effort |
|-------|---------|--------|
| Phase 1: UI Consolidation | 4 | 2-3 hours |
| Phase 2: Offer Templates | 3 | 3-4 hours |
| Phase 3: Cleanup | 2 | 1-2 hours |
| **Total** | **9** | **6-9 hours** |

---

## Notes for Terminal 2 (Tracker Claude)

When implementing, send checkpoints for:
1. Each tab merge completion
2. OfferTemplate type creation
3. Individual offer template creation
4. Intent-based question merging
5. Flow → Intent terminology migration
6. Final cleanup

Document patterns:
- "Intent-Based Offer Pattern"
- "Self-Contained Offer Template Pattern"
- "Question Deduplication Pattern"
- "Dashboard Consolidation Pattern"
