# Tracker Checkpoint: Dashboard & Data Model Simplification

**Date**: 2026-01-06
**Type**: Architectural Decision + Pattern Documentation
**Status**: Planning Complete, Implementation Pending

---

## Prompt for Terminal 2 (Tracker Claude)

Please analyze this architectural simplification decision through an information theory lens. Read the referenced files and create documentation for:

1. **Pattern extraction** - What reusable patterns emerged from this decision?
2. **Information theory analysis** - How does this reduce entropy in the system?
3. **Decision documentation** - Why was this approach chosen over alternatives?

---

## Context: The Problem

### Original System State

The dashboard had **15 sections** and two independent configuration systems:

**System A: Offers**
- `OfferDefinition` with `inputRequirements.requiredFields`
- Located in `src/lib/offers/`

**System B: Conversations (Flows)**
- `ConversationFlow` with `questions[].mappingKey`
- Located in `src/stores/conversationConfig/`

**The Disconnect**:
- Offers required fields like `['email', 'location', 'timeline']`
- Conversations had questions with mappingKeys like `['email', 'propertyLocation', 'timeline']`
- `'location' ≠ 'propertyLocation'` = validation failure
- Validation only happened during onboarding, not after edits
- Result: Users completed conversations but offer generation failed silently

### Information Theory Problem

From an IT perspective, this was a **channel capacity mismatch**:
- Extraction channel (conversation) collected data with certain keys
- Verification channel (offer generation) expected different keys
- No error correction or normalization layer existed
- Result: 100% signal loss at the verification stage

---

## The Solution: Intent-Based Offers

### Key Decisions Made

1. **Terminology: Flow → Intent**
   - "Flow" implied configurable sequence
   - "Intent" is just user classification (buy/sell/browse)
   - Intent is a filter, not a configurable entity

2. **Offers own their questions**
   - Each `OfferTemplate` declares `supportedIntents: Intent[]`
   - Each offer defines `intentQuestions: Record<Intent, QuestionTemplate[]>`
   - Questions live inside the offer, not in a separate store

3. **Single-intent vs multi-intent offers**
   - `home-estimate`: Only for sellers (`supportedIntents: ['sell']`)
   - `real-estate-timeline`: All intents (`supportedIntents: ['buy', 'sell', 'browse']`)

4. **Question merging at runtime**
   - Chat looks up enabled offers
   - Filters by user's declared intent
   - Merges questions from applicable offers
   - Deduplicates by `mappingKey`

5. **Dashboard reduction: 15 → 6 sections**
   - Merge related sections (config+colors→Settings, 5 KB sections→Knowledge Base)
   - Remove conversation editor entirely (offers dictate questions)
   - Result: Less cognitive load for real estate agents

---

## Files to Read for Analysis

### Plan Documents (Created This Session)
- `docs/plans/dashboard-reduction-plan.md` - Implementation roadmap
- `docs/plans/data-model-simplification.md` - Deep dive on type/store changes

### Current System (Before)
- `src/stores/conversationConfig/conversation.store.ts` - Flow config store (to be removed)
- `src/stores/onboardingStore/onboarding.store.ts` - Has `offerFlowMap`, `conversationFlows` (to simplify)
- `src/lib/offers/core/types.ts` - Current `OfferDefinition` type
- `src/lib/offers/offerRequirements.ts` - Current requirements (to be replaced)
- `src/types/conversation.types.ts` - `ConversationQuestion` type

### Troubleshooting Context
- `docs/troubleshooting/offer-generation-validation-failure.md` - The bug that triggered this

---

## Information Theory Concepts to Analyze

Please analyze this decision using these IT principles:

### 1. Entropy Reduction

**Before**: High configuration entropy
- User could configure: 6 offers × 3 flows × N questions × M mappingKeys
- Many invalid configurations possible
- Validation only at one point (onboarding)

**After**: Low configuration entropy
- User selects: which offers to enable
- Questions are predetermined by offers
- Zero invalid configurations possible

**Questions to answer**:
- What was the entropy of the configuration space before?
- What is it after?
- How much did we reduce decision complexity for the user?

### 2. Signal vs Noise

**Before**:
- User provided data (signal) through conversation
- Data keys didn't match offer requirements (noise introduced)
- Normalization attempted but results discarded

**After**:
- Questions come from offers themselves
- Keys are guaranteed to match (no noise possible)
- Signal transmission is lossless

**Questions to answer**:
- What was the signal-to-noise ratio before?
- How did the architecture introduce noise?
- How does the new architecture eliminate noise sources?

### 3. Channel Capacity

**Before**:
- Extraction channel: Conversation with configurable questions
- Verification channel: Offer generation with fixed requirements
- Mismatch: Extraction output didn't fit verification input

**After**:
- Single channel: Offer templates contain both extraction (questions) and verification (generation)
- No handoff between channels = no capacity mismatch

**Questions to answer**:
- How did separate channels cause information loss?
- How does combining them into one source of truth preserve information?

### 4. Redundancy & Error Correction

**Before**:
- No redundancy between systems
- Validation was single-point (onboarding only)
- Post-onboarding edits bypassed validation

**After**:
- Redundancy by design: Offer contains what it needs
- No validation needed (can't mismatch with itself)
- System is self-correcting

**Questions to answer**:
- What error correction mechanisms were missing?
- How does the new design make errors impossible rather than just detectable?

### 5. Compression

**Before**:
- Complex configuration spread across multiple stores
- User had to understand mappingKey ↔ requiredField relationship
- Mental model required: offers + flows + validation

**After**:
- Simple configuration: just select offers
- No technical understanding needed
- Mental model: offers (that's it)

**Questions to answer**:
- How much did we compress the user's mental model?
- What's the information density of the old vs new configuration?

---

## Patterns to Extract

Based on this analysis, please document these potential patterns:

### Pattern 1: Self-Contained Entity Pattern
**Problem**: Two systems that must stay in sync but have independent configuration
**Solution**: Combine into one self-contained entity that owns all its requirements

### Pattern 2: Classification vs Configuration Pattern
**Problem**: Making something configurable when it should just be a filter
**Solution**: Intent is classification (filter), not configuration (customizable sequence)

### Pattern 3: Question Deduplication Pattern
**Problem**: Multiple data sources might need the same field
**Solution**: Merge at runtime, deduplicate by key, ask once

### Pattern 4: Dashboard Consolidation Pattern
**Problem**: Too many navigation options create cognitive overload
**Solution**: Merge related sections, use internal tabs, reduce top-level choices

---

## Documentation to Create

After analysis, please create/update:

1. **`docs/patterns/self-contained-entity.md`**
   - The pattern of offers owning their questions
   - When to use vs when to keep systems separate

2. **`docs/patterns/classification-vs-configuration.md`**
   - Intent as filter, not config
   - Other places this pattern applies

3. **`docs/architecture/intent-based-offers.md`**
   - New architecture overview
   - Data flow diagrams
   - Type relationships

4. **`docs/tracking/sessions/2026-01-06-dashboard-simplification.md`**
   - Session log with IT analysis
   - Decisions made and why
   - Entropy reduction metrics

---

## Success Metrics for Documentation

- [ ] IT analysis explains WHY this reduces complexity, not just WHAT changed
- [ ] Patterns are generic enough to apply to other systems
- [ ] Architecture docs show before/after with clear improvement metrics
- [ ] Session log captures decision rationale for future reference

---

## Additional Context

### Why This Matters for Real Estate Agents

The end users (real estate agents) want to:
- Set up a chatbot quickly (< 5 minutes)
- Not think about technical details
- Have it "just work"

The old system required understanding:
- What offers need what fields
- How to configure questions to collect those fields
- How mappingKeys link to requiredFields

The new system requires understanding:
- Which offers do I want to provide?

That's a massive reduction in required knowledge—from ~30 minutes of configuration to ~2 minutes.

### Why Not Just Add Validation?

Alternative considered: Add validation at more points (dashboard editing, pre-generation, etc.)

Why rejected:
- Validation catches errors, doesn't prevent them
- Users would still configure things wrong, just get errors sooner
- Doesn't reduce cognitive load
- Band-aid on a broken architecture

The chosen approach (offers own questions) makes errors **impossible**, not just **detectable**.

---

## Terminal 2 Action Items

1. Read the referenced files
2. Perform IT analysis using the framework above
3. Create the 4 documentation files listed
4. Update `docs/tracking/context.md` with new patterns
5. Note any additional patterns or insights discovered

---

**End of Checkpoint**
