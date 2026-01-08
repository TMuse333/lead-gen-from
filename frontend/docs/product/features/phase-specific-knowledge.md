# Phase-Specific Knowledge System

> **Status:** Planned (Phase 2)
> **Prerequisite:** Story Callouts (completed)

## Overview

Make the offer definition drive knowledge requirements, just like it drives questions. The dashboard would show agents exactly what knowledge to upload per phase, with coverage tracking.

## Current State

- Knowledge is uploaded generically to Qdrant
- No guidance on what knowledge each phase needs
- Queries don't target specific phases
- Agents don't know what will be used where

## Proposed Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    UNIFIED OFFER DEFINITION                              │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  questions: { buy: [...], sell: [...] }     ← Drives chatbot    │   │
│  │  knowledgeRequirements: {                   ← NEW: Drives Qdrant│   │
│  │    buy: {                                                        │   │
│  │      'financial-prep': { tags: ['pre-approval'], priority: 'critical' }
│  │      'make-offer': { tags: ['negotiation'], priority: 'high' }  │   │
│  │    }                                                             │   │
│  │  }                                                               │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

## Types to Add

```typescript
// In /src/lib/offers/unified/types.ts

interface PhaseKnowledgeRequirement {
  /** Human-readable description for dashboard */
  description: string;
  /** Tags to search for in Qdrant */
  searchTags: string[];
  /** Priority for retrieval */
  priority: 'critical' | 'high' | 'medium' | 'low';
  /** Minimum advice items needed (default: 2) */
  minItems?: number;
  /** Example content to guide agent uploads */
  exampleContent?: string;
  /** Prompt hint for LLM when using this advice */
  usageHint?: string;
}

type KnowledgeRequirements = Partial<Record<
  Intent,
  Record<string, PhaseKnowledgeRequirement>  // phaseId → requirement
>>;
```

## Example: Timeline Offer Requirements

```typescript
const KNOWLEDGE_REQUIREMENTS: KnowledgeRequirements = {
  buy: {
    'financial-prep': {
      description: 'Pre-approval process and financing tips',
      searchTags: ['pre-approval', 'mortgage', 'credit', 'financing', 'loan'],
      priority: 'critical',
      minItems: 3,
      exampleContent: 'In Austin, getting pre-approved typically takes 3-5 days...',
    },
    'find-agent': {
      description: 'Agent selection and representation advice',
      searchTags: ['agent', 'buyer-agent', 'representation'],
      priority: 'high',
      minItems: 2,
    },
    'house-hunting': {
      description: 'Property search strategies and neighborhood insights',
      searchTags: ['house-hunting', 'neighborhoods', 'property-search'],
      priority: 'high',
      minItems: 2,
    },
    'make-offer': {
      description: 'Offer strategy and negotiation tactics',
      searchTags: ['offer', 'negotiation', 'bidding', 'contingencies'],
      priority: 'critical',
      minItems: 3,
    },
    'under-contract': {
      description: 'Inspection, appraisal, and due diligence guidance',
      searchTags: ['inspection', 'appraisal', 'due-diligence'],
      priority: 'high',
      minItems: 2,
    },
    'closing': {
      description: 'Closing process and final steps',
      searchTags: ['closing', 'title', 'escrow', 'wire-fraud'],
      priority: 'critical',
      minItems: 2,
    },
    'post-closing': {
      description: 'Move-in tips and homeowner advice',
      searchTags: ['move-in', 'homeowner', 'maintenance'],
      priority: 'low',
      minItems: 1,
    },
  },
  sell: {
    // Similar structure for selling phases
  },
};
```

## Dashboard UI Mockup

```
┌─────────────────────────────────────────────────────────────────┐
│ Offer Knowledge                                    [Timeline ▼] │
├─────────────────────────────────────────────────────────────────┤
│ [Buy] [Sell] [Browse]                                           │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 📋 Financial Preparation                      Priority: ⚠️  │ │
│ │ Pre-approval process and financing tips                     │ │
│ │                                                             │ │
│ │ Coverage: 2/3 items  [██████░░░░] 67%                       │ │
│ │                                                             │ │
│ │ Suggested tags: pre-approval, mortgage, credit              │ │
│ │                                                             │ │
│ │ Your knowledge for this phase:                              │ │
│ │ • Pre-Approval Tips for Austin Market ✓                     │ │
│ │ • Mortgage Rate Lock Strategy ✓                             │ │
│ │                                                             │ │
│ │ [+ Add Knowledge for This Phase]                            │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation Steps

1. **Add types** to `/src/lib/offers/unified/types.ts`
2. **Add requirements** to timeline offer definition
3. **Create coverage API** - `/app/api/knowledge/coverage/route.ts`
4. **Build dashboard component** - `OfferKnowledgeDashboard.tsx`
5. **Update generation** to query per-phase
6. **Add preview** showing what knowledge will be used

## Files to Create/Modify

| File | Action |
|------|--------|
| `/src/lib/offers/unified/types.ts` | Add KnowledgeRequirements types |
| `/src/lib/offers/unified/offers/realEstateTimeline.offer.ts` | Add requirements |
| `/src/components/dashboard/user/knowledgeBase/OfferKnowledgeDashboard.tsx` | Create |
| `/app/api/knowledge/coverage/route.ts` | Create |
| `/src/lib/personalization/context.ts` | Add phase-specific query |

## Bonus: Auto-Recommend Placement

Use keyword matching or LLM to suggest placements when uploading:

```typescript
const PLACEMENT_RULES = {
  'pre-approval|mortgage|loan|credit': {
    'real-estate-timeline': ['financial-prep']
  },
  'offer|negotiation|bidding|earnest': {
    'real-estate-timeline': ['make-offer']
  },
  'inspection|appraisal|repairs': {
    'real-estate-timeline': ['under-contract']
  },
};
```
