# AI-Assisted Onboarding Wizard

> **Status:** Post-MVP Feature
> **Priority:** Medium
> **Effort:** Medium

---

## Design Philosophy: Forms as Structured Output

### The Paradigm Shift

Traditional form design optimizes for human input. The new paradigm treats forms as **structured output displays** that happen to be editable.

```
OLD:  Form → Human fills out → Submit
NEW:  Prompt → AI fills form → Human reviews/tweaks → Submit
```

### What This Changes

| Aspect | Old Thinking | New Thinking |
|--------|--------------|--------------|
| **Form complexity** | Bad - frustrates users | Fine - AI handles it |
| **Field count** | Minimize | As many as needed for good output |
| **Validation UX** | Critical | Less critical (AI gets it right) |
| **Help text** | For humans to understand | For AI to understand (system prompt) |
| **Default values** | Generic guesses | AI-personalized based on conversation |
| **Error states** | "Please fix these fields" | "I noticed X, should I adjust?" |

### The Form as "Structured Preview"

```
┌─────────────────────────────────────────────────────────────┐
│  CHAT                          │  LIVE FORM OUTPUT          │
│                                │                            │
│  "I work with first-time      │  Flow: [Buyers ▼]          │
│   buyers, usually 90 day      │                            │
│   deals"                       │  Phase 1: Pre-Approval     │
│                                │  Timeline: Week 1-2        │
│  "Got it! I've set up a       │  Steps:                    │
│   buyer flow with 6 phases.   │   ☑ Get pre-approved       │
│   See the preview →"          │   ☑ Review credit          │
│                                │                            │
│  "Can you add a phase for     │  Phase 2: House Hunting    │
│   new construction?"          │  Timeline: Week 2-6        │
│                                │  ...                       │
│  "Done! Added 'New Build      │                            │
│   Considerations' as Phase 5" │  [Phase 5: New Build... ]  │
│                                │                            │
└─────────────────────────────────────────────────────────────┘
```

### Key Insight

The form isn't going away—**structured data is still valuable**. But the input method shifts from:

- Dropdowns, text fields, checkboxes (human-optimized)

To:

- Natural language → function calling → structured output (AI-optimized)

The form becomes a **review/edit interface** rather than a **creation interface**.

### Implications for This Product

| Feature | Current (Human Input) | Future (AI + Review) |
|---------|----------------------|----------------------|
| Setup Wizard | Click through 20+ fields | "I work with luxury buyers" → 6 phases generated |
| Knowledge Base | Fill story form with situation/action/outcome | "Tell me about a tricky deal" → structured story created |
| Bot Questions | Add questions one by one | "I always ask timeline and budget first" → questions generated |
| Phase Config | Edit each phase manually | "My process is usually 90 days" → timelines adjusted |

### Design Principles Going Forward

1. **Keep complex structures** - Don't simplify the data model for human convenience
2. **Optimize prompts, not forms** - Help text becomes system prompt context
3. **Always allow manual override** - Form is editable for power users / edge cases
4. **Show work in real-time** - As AI fills fields, user sees it happen
5. **Conversation is the primary UX** - Form is secondary, for review/tweaks

---

## Overview

Replace manual form-filling in the setup wizard with a conversational AI that populates the wizard based on natural language input. Instead of clicking through 20+ form fields, agents have a brief conversation and the AI fills everything in.

## The Problem

Current setup wizard requires:
- Selecting flow type (buy/sell/browse)
- Setting phase count
- Filling in phase names, descriptions, timelines
- Adding questions with button options
- Adding action steps with priorities

This is tedious and doesn't leverage the conversational nature of the product.

## The Solution

### User Experience

```
Agent: "I mostly work with first-time buyers in the $300-500k range"

Bot: "Got it! I'll set up a buyer timeline focused on first-timers.
      What's the typical timeline from start to keys in hand?"

Agent: "Usually about 2-3 months if they're pre-approved"

Bot: "Perfect. I'll create 6 phases spanning 8-10 weeks.
      What questions do you always ask new clients?"

Agent: "Budget, timeline, neighborhoods they like, and if they've
       talked to a lender yet"

Bot: [Populates wizard with phases, questions, timelines]
     "Here's what I've set up. Review and tweak anything below."
```

## Implementation Approaches

### Option 1: Pre-fill Mode (Recommended)

```
┌─────────────────────────────────────────────────────────────┐
│  Step 1: Quick Chat (2-3 questions)                         │
│  ├── "What type of clients do you work with?"               │
│  ├── "How long does your typical deal take?"                │
│  └── "What makes your process unique?"                      │
├─────────────────────────────────────────────────────────────┤
│  Step 2: Review Pre-filled Wizard                           │
│  └── AI has populated phases, questions, timelines          │
│      User tweaks/approves each section                      │
└─────────────────────────────────────────────────────────────┘
```

**Pros:**
- Fast - 3 prompts vs 20+ form fields
- Safe - User still reviews structured output
- Flexible - Can still manually adjust anything

### Option 2: Hybrid Mode

Keep wizard UI, add "Help me fill this" button at each section that opens a mini-chat.

### Option 3: Full Conversational

Replace wizard entirely with chat + live preview sidebar. Higher effort, more risk.

## Technical Implementation

### No Separate Qdrant Needed (V1)

Use system prompt + function calling:

```typescript
const onboardingSystemPrompt = `
You help real estate agents set up their client timeline wizard.

Available functions:
- set_flow_type(flow: 'buy'|'sell'|'browse')
- add_phase({ name, timeline, description, steps })
- add_question({ question, inputType, options })

Common buyer phases: Pre-approval, House Hunting, Making Offers,
Under Contract, Closing...

Ask 2-3 questions, then call functions to populate the wizard.
`;

const wizardTools = [
  {
    name: 'set_flow_type',
    description: 'Set the journey type (buy/sell/browse)',
    parameters: {
      type: 'object',
      properties: {
        flow: { type: 'string', enum: ['buy', 'sell', 'browse'] }
      },
      required: ['flow']
    }
  },
  {
    name: 'add_phase',
    description: 'Add a phase to the timeline',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        timeline: { type: 'string' },
        description: { type: 'string' },
        steps: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              priority: { type: 'string', enum: ['high', 'medium', 'low'] }
            }
          }
        }
      },
      required: ['name', 'timeline', 'description', 'steps']
    }
  },
  {
    name: 'add_question',
    description: 'Add a bot question',
    parameters: {
      type: 'object',
      properties: {
        question: { type: 'string' },
        inputType: { type: 'string', enum: ['buttons', 'text'] },
        options: { type: 'array', items: { type: 'string' } },
        linkedPhaseId: { type: 'string' }
      },
      required: ['question', 'inputType']
    }
  }
];
```

### Future Enhancements (V2+)

| Version | Enhancement | Qdrant? |
|---------|-------------|---------|
| V1 | System prompt + function calling | No |
| V2 | Pull from user's existing stories to personalize | Existing collection |
| V3 | Shared templates collection for advanced matching | New shared collection |

## UX Flow

1. **Entry point:** "Quick Setup" button alongside "Manual Setup" in wizard
2. **Chat phase:** 3-5 questions in conversational style
3. **Preview:** Show generated timeline in real-time as bot fills it
4. **Review:** Drop into normal wizard UI with everything pre-filled
5. **Edit:** User can tweak any field, AI-generated or not

## Value Proposition

- Agents who hate forms get 80% done in 2 minutes
- Conversation captures valuable context for personalization
- Could expand to: "Want me to write a few stories based on what you told me?"
- Differentiator vs competitors with rigid form-based onboarding

## Files to Create/Modify

### New Files
- `src/components/onboarding/ConversationalSetup.tsx` - Chat UI for quick setup
- `src/lib/onboarding/wizardTools.ts` - Function definitions for AI
- `src/lib/onboarding/systemPrompt.ts` - System prompt for onboarding agent

### Modified Files
- `TimelineWizardModal.tsx` - Add "Quick Setup" entry point
- `UnifiedOfferBuilder.tsx` - Handle pre-filled state from AI

## Open Questions

1. Should AI-generated content be visually distinguished (e.g., "AI suggested" badge)?
2. Should we save conversation transcript for future reference?
3. How to handle edge cases where user says contradictory things?
4. Should we offer to generate sample stories based on the conversation?

## Related Features

- Stories generation from conversation
- Smart defaults based on agent's market/specialty
- Progressive refinement ("That's close, but make the inspection phase longer")
