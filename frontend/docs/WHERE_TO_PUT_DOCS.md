# Where to Put Documentation: Quick Reference

**TL;DR**: `meta/` = Terminal 2 tracking | `product/` = App documentation

---

## Decision Tree

```
┌─────────────────────────────────────────────────────┐
│ Is this documentation ABOUT the app/product,        │
│ or ABOUT the development process itself?            │
└─────────────────────────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        ▼                               ▼
  ABOUT THE APP                   ABOUT DEVELOPMENT
  → docs/product/                 → docs/meta/
        │                               │
        │                               │
    Examples:                       Examples:
    • How features work             • Session logs
    • API documentation             • Pattern extraction
    • Setup guides                  • IT analysis
    • Architecture diagrams         • Decision rationale
    • Troubleshooting               • Metrics tracking
    • Integration guides            • Architectural decisions
```

---

## Examples by Category

### ✅ Goes in `docs/product/`

**Architecture**:
- "How the intent-based offer system works" → `product/architecture/intent-based-offers.md`
- "Data model for conversations" → `product/architecture/data-model.md`
- "Information flow diagram" → `product/architecture/information-flow.md`

**Features**:
- "How offer generation works" → `product/features/offers/offer-generation.md`
- "Conversation flow implementation" → `product/features/conversations/flow.md`
- "Analytics dashboard guide" → `product/features/analytics/dashboard.md`

**Setup & Deployment**:
- "Getting started guide" → `product/setup/quickstart.md`
- "Environment variables" → `product/setup/environment.md`
- "Deployment to Vercel" → `product/setup/deployment.md`

**Integrations**:
- "Qdrant setup guide" → `product/integrations/qdrant-implementation-guide.md`
- "OpenAI API integration" → `product/integrations/openai.md`
- "Stripe payment setup" → `product/integrations/stripe.md`

**Reference**:
- "API endpoints" → `product/reference/api/endpoints.md`
- "Zustand store API" → `product/reference/stores/chat-store.md`
- "Component props" → `product/reference/components/chat-with-tracker.md`

**Troubleshooting**:
- "Offer generation failures" → `product/troubleshooting/offer-generation-validation-failure.md`
- "Auth issues" → `product/troubleshooting/next-auth-issues.md`

**Planning**:
- "Q1 2026 roadmap" → `product/planning/roadmap-q1-2026.md`
- "Dashboard reduction plan" → `product/planning/dashboard-reduction-plan.md`
- "Feature specs" → `product/planning/feature-specs/`

---

### ✅ Goes in `docs/meta/`

**Session Logs** (Terminal 2):
- "Dashboard simplification analysis" → `meta/tracking/sessions/2026-01-06-dashboard-simplification.md`
- "Pattern extraction from X" → `meta/tracking/sessions/2026-01-XX-pattern-name.md`

**Checkpoints** (from Terminal 1):
- "Checkpoint: Offer generation complete" → `meta/tracking/checkpoints/2026-01-XX-offer-generation.md`

**Patterns** (IT analysis):
- "Self-contained entity pattern" → `meta/patterns/self-contained-entity.md`
- "Classification vs configuration" → `meta/patterns/classification-vs-configuration.md`

**Decisions** (Architectural WHY):
- "Why we chose intent-based offers" → `meta/decisions/intent-based-offers-decision.md`
- "Information theory decision process" → `meta/decisions/DECISION_PROCESS_INFORMATION_THEORY.md`

**Metrics** (System tracking):
- "System score over time" → `meta/metrics/system-score-history.md`
- "Entropy reduction timeline" → `meta/metrics/entropy-reduction-timeline.md`

**Context**:
- "Terminal 2 operational context" → `meta/context.md`

---

## Common Confusions

### ❓ "I wrote about the architecture of intent-based offers. Where does it go?"

**Answer**: Depends on the **purpose**:

- **Product docs**: "Here's HOW the intent-based offer system works (for developers building on it)"
  → `product/architecture/intent-based-offers.md`

- **Meta docs**: "Here's WHY we chose intent-based offers and the information theory analysis of the decision"
  → `meta/decisions/intent-based-offers-decision.md`

**Often both exist!** Product docs explain HOW, meta docs explain WHY.

---

### ❓ "I documented a bug and its fix. Where does it go?"

**Answer**: Depends on **audience**:

- **For users hitting this bug**: "How to troubleshoot offer generation failures"
  → `product/troubleshooting/offer-generation-validation-failure.md`

- **For Terminal 2 tracking**: "Session log: How we debugged and fixed the validation bug"
  → `meta/tracking/sessions/2026-01-05-validation-bug-fix.md`

**Again, often both!** Product docs help users, meta docs track the journey.

---

### ❓ "I'm planning a new feature. Where do I document it?"

**Answer**: Two places:

- **Feature spec (WHAT)**: "Feature: Lead scoring system"
  → `product/planning/feature-specs/lead-scoring.md`

- **Decision rationale (WHY)**: "Why we're implementing lead scoring and the information theory analysis"
  → `meta/decisions/lead-scoring-decision.md` (if it's a major architectural decision)

---

## Rule of Thumb

### Product Docs Answer:
- **WHAT** does the system do?
- **HOW** does it work?
- **HOW TO** use/deploy/troubleshoot it?

**Audience**: Developers, users, future team

---

### Meta Docs Answer:
- **WHY** did we make this decision?
- **WHAT PATTERNS** emerged?
- **HOW WELL** is the system doing (IT metrics)?
- **WHAT DID WE LEARN** from this session?

**Audience**: Future you reviewing decisions, Terminal 2 tracking, retrospectives

---

## Terminal-Specific Shortcuts

### Terminal 1 (Implementation)
When you complete a feature:
- Document HOW it works → `product/features/`
- Document HOW TO use it → `product/setup/` or `product/reference/`
- Send checkpoint to Terminal 2 → (Terminal 2 will create meta docs)

### Terminal 2 (Tracker)
When you receive a checkpoint:
- Extract patterns → `meta/patterns/`
- Document decisions → `meta/decisions/`
- Create session log → `meta/tracking/sessions/`
- Update system metrics → `meta/metrics/`

---

## Quick Commands

### Find product docs
```bash
ls docs/product/
grep -r "search term" docs/product/
```

### Find meta docs
```bash
ls docs/meta/
grep -r "pattern name" docs/meta/patterns/
```

### List all session logs
```bash
ls -la docs/meta/tracking/sessions/
```

### List all feature docs
```bash
ls -la docs/product/features/
```

---

## Summary

| Question | Answer |
|----------|--------|
| **"How does feature X work?"** | `docs/product/features/` |
| **"Why did we build it this way?"** | `docs/meta/decisions/` |
| **"How do I set it up?"** | `docs/product/setup/` |
| **"What patterns did we learn?"** | `docs/meta/patterns/` |
| **"What happened in this session?"** | `docs/meta/tracking/sessions/` |
| **"How do I troubleshoot Y?"** | `docs/product/troubleshooting/` |
| **"What's on the roadmap?"** | `docs/product/planning/` |
| **"How's the system doing (IT score)?"** | `docs/meta/metrics/` |

---

**When in doubt**: Product = app documentation, Meta = development process documentation
