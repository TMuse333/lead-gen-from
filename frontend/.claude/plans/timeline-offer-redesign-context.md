# Timeline Offer Page Redesign - Planning Context

## Goal
Redesign the timeline offer results page to be more like an actual landing page with a step-by-step guide component that provides genuine value to users.

## Core Value Proposition (Information Theory Approach)
The goal is to **reduce entropy (uncertainty)** for the end user. The user should think:

> "Wow, the agent knows and has been in this situation before, and this guide is useful as there is personalized advice based on their previous experience for my similar situation"

## Key Design Principles

### 1. Personalization Through Experience
- The advice shouldn't feel generic
- It should feel like it comes from an agent who has handled similar situations
- Qdrant should surface relevant past scenarios that match the user's situation

### 2. Step-by-Step Structure
- Visual timeline/stepper component (similar to the screenshot shared - a numbered step flow)
- Each step should have:
  - Clear action item
  - Personalized advice based on user's situation
  - Relevant tips from Qdrant knowledge base

### 3. Reducing Uncertainty
- Answer questions the user didn't know to ask
- Provide specific timelines and expectations
- Surface potential pitfalls based on similar past situations

## What Needs to Be Explored

### Current Implementation
1. **Timeline offer definition**: `src/lib/offers/definitions/` - timeline-related files
2. **Results page**: `src/components/pageComponents/frontendPages/results/resultsPage.tsx`
3. **Timeline components**: `src/components/ux/resultsComponents/timeline/`

### Qdrant/Personalization System
1. **Advice types**: `src/types/advice.types.ts` or similar
2. **Qdrant collections**: `src/lib/qdrant/collections/`
3. **Rules engine**: `src/lib/qdrant/engines/rules`
4. **How advice flows into offers**: Look at prompt building in offer templates

## Questions to Answer During Planning

### About the Offer Content
1. What steps should the timeline actually contain for buy/sell/browse flows?
2. How granular should the steps be?
3. What makes each step "personalized" vs generic?

### About Qdrant Usage
1. Is the current advice structure good enough?
2. Should advice be stored per-step or per-scenario?
3. How can we improve relevance matching?
4. Should we use different embeddings for different parts of the flow?

### About the UI
1. Step-by-step component structure
2. How to display personalized advice within each step
3. Color/gradient configuration integration
4. Mobile responsiveness

## Visual Reference
User shared a screenshot of a step-by-step component they built in another project:
- Numbered steps (1, 2, 3, 4, 5)
- Each step has a title and description
- Clean, card-based layout
- Note: The reference didn't have gradient config or color types - will need to integrate with existing theme system

## Files Likely to Modify
1. `src/lib/offers/definitions/timeline/` - offer definition and output types
2. `src/components/ux/resultsComponents/timeline/` - new step-by-step components
3. `src/lib/qdrant/` - potentially improve advice structure
4. Results page components

## Next Steps for Planning
1. Explore current timeline offer implementation
2. Explore Qdrant advice system and matching logic
3. Design the step-by-step component structure
4. Plan Qdrant improvements if needed
5. Define the actual content/steps for each flow (buy/sell/browse)
6. Create implementation plan

## Session Notes
- Previous work: Fixed OpenAI client integration in offer generation pipeline
- Cleaned up excessive console logs
- Offer generation is now working
- This is the next major feature: making the offer output actually valuable
