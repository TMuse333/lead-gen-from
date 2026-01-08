# Onboarding Validation System Guide

## Overview

The onboarding validation system ensures that users have configured all required questions for their selected offers. It validates that conversation flows contain questions with the correct `mappingKey` values to collect the data needed for each offer type.

## Key Concepts

### 1. Offer Requirements

Each offer type has specific data requirements defined in `frontend/src/lib/offers/offerRequirements.ts`:

```typescript
interface OfferRequirement {
  offerType: OfferType;
  label: string;
  description: string;
  requiredFields: string[]; // mappingKeys that must be collected
  applicableFlows?: FlowIntention[]; // Which flows this offer applies to
}
```

**Example:**
- `home-estimate` requires: `['propertyAddress', 'propertyType', 'propertyAge', 'renovations', 'timeline']`
- `home-estimate` only applies to: `['sell']` flow
- `pdf` requires: `['email']`
- `pdf` applies to: all flows (no `applicableFlows` restriction)

### 2. Flow Mapping

Users can specify which conversation flows each offer applies to:
- **Step 2 (Offers)**: User selects offers and chooses applicable flows
- **Zustand Store**: `offerFlowMap: Record<OfferType, FlowIntention[]>` stores this mapping

**Example:**
```typescript
offerFlowMap = {
  'home-estimate': ['sell'],      // Only for sellers
  'pdf': ['buy', 'sell', 'browse'], // For all flows
  'landingPage': ['buy', 'browse']  // For buyers and browsers only
}
```

### 3. Question Mapping Keys

Each question in a conversation flow can have a `mappingKey` that links it to a data field:

```typescript
interface ConversationQuestion {
  id: string;
  question: string;
  mappingKey?: string; // e.g., 'propertyAddress', 'email', 'timeline'
  // ...
}
```

**Example:**
- Question: "What is your property address?" → `mappingKey: 'propertyAddress'`
- Question: "What is your email?" → `mappingKey: 'email'`

## Validation Logic

### File: `frontend/src/lib/onboarding/validateOfferRequirements.ts`

The validation function `validateOfferRequirements()`:

1. **Iterates through selected offers**
2. **Determines which flows to check** (priority order):
   - User-specified `offerFlowMap[offerType]` (from Step 2)
   - Offer's default `applicableFlows` (from `offerRequirements.ts`)
   - All flows (if neither is specified)
3. **Extracts mappingKeys** from only the applicable flows
4. **Checks if required fields exist** in those mappingKeys
5. **Returns validation result** with missing fields

### Validation Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│              Step 3: Conversation Flow Setup                 │
│                                                              │
│  User selects flows (Buy/Sell/Browse)                        │
│  User adds questions with mappingKeys                       │
│                                                              │
│  On "Next" click:                                           │
│    └─► validateOfferRequirements()                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│         validateOfferRequirements() Function                 │
│                                                              │
│  Input:                                                      │
│  - selectedOffers: ['home-estimate', 'pdf']                │
│  - conversationFlows: { buy: {...}, sell: {...} }          │
│  - offerFlowMap: { 'home-estimate': ['sell'] }             │
│                                                              │
│  For each offer:                                            │
│    1. Get requirements from offerRequirements.ts            │
│    2. Determine flows to check:                            │
│       - offerFlowMap[offer] OR                              │
│       - requirements.applicableFlows OR                      │
│       - all flows                                           │
│    3. Extract mappingKeys from those flows only            │
│    4. Check if requiredFields exist in mappingKeys         │
│    5. Report missing fields                                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              ValidationResult                                │
│                                                              │
│  {                                                           │
│    isValid: boolean,                                        │
│    missingFields: [                                        │
│      {                                                      │
│        offerType: 'home-estimate',                          │
│        offerLabel: 'Home Estimate (in sell flow)',          │
│        missingFields: ['propertyAddress']                   │
│      }                                                      │
│    ],                                                       │
│    warnings: [...]                                          │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
```

## Common Validation Issues

### Issue 1: Missing Required Field

**Symptom:**
- User sees: "Home Estimate requires: Property Address"
- Cannot proceed to next step

**Root Cause:**
- No question in the applicable flow(s) has `mappingKey: 'propertyAddress'`

**Solution:**
1. User must add a question to the applicable flow
2. Set the question's `mappingKey` to the missing field (e.g., `'propertyAddress'`)
3. Validation will pass once all required fields have corresponding questions

### Issue 2: Wrong Flow Selected

**Symptom:**
- User selected "Home Estimate" for "Buy" flow
- Validation fails because home-estimate only applies to "Sell" flow

**Root Cause:**
- `offerFlowMap['home-estimate']` includes `'buy'` but `applicableFlows: ['sell']` restricts it

**Solution:**
- In Step 2, user should only select "Sell" flow for home-estimate offer
- The UI should filter flow options based on `applicableFlows` (already implemented)

### Issue 3: Field Name Mismatch

**Symptom:**
- User added question with `mappingKey: 'address'` but offer requires `'propertyAddress'`

**Root Cause:**
- `mappingKey` doesn't match the required field name exactly

**Solution:**
- User must use the exact field name from `requiredFields` array
- Use the "Data Mapping Key" dropdown in QuestionConfigFlow to select the correct key

## File Structure

```
frontend/
├── src/
│   ├── lib/
│   │   ├── offers/
│   │   │   └── offerRequirements.ts          # Defines offer requirements
│   │   └── onboarding/
│   │       └── validateOfferRequirements.ts  # Validation logic
│   ├── components/
│   │   └── onboarding/
│   │       └── steps/
│   │           ├── step2Offers.tsx          # Step 2: Select offers & flows
│   │           └── step3ConversationFlow/   # Step 3: Configure questions
│   │               ├── index.tsx            # Main component (calls validation)
│   │               ├── FlowSummary.tsx      # Question list
│   │               └── QuestionConfigFlow.tsx # Question editor
│   └── stores/
│       └── onboardingStore/
│           └── onboarding.store.ts         # Zustand store (offerFlowMap)
```

## Key Functions

### `validateOfferRequirements()`

```typescript
function validateOfferRequirements(
  selectedOffers: OfferType[],
  conversationFlows: Record<string, ConversationFlow>,
  offerFlowMap?: Record<OfferType, FlowIntention[]>
): ValidationResult
```

**Parameters:**
- `selectedOffers`: Array of offer types user selected in Step 2
- `conversationFlows`: All configured conversation flows (buy, sell, browse)
- `offerFlowMap`: User's mapping of which flows each offer applies to

**Returns:**
- `ValidationResult` with `isValid`, `missingFields`, and `warnings`

### `extractMappingKeysFromFlows()`

```typescript
function extractMappingKeysFromFlows(
  flows: Record<string, ConversationFlow>,
  flowTypes?: FlowIntention[]
): Set<string>
```

**Purpose:**
- Extracts all `mappingKey` values from specified flows
- If `flowTypes` is provided, only checks those flows
- If `flowTypes` is undefined, checks all flows

## Integration Points

### Step 3 Component (`step3ConversationFlow/index.tsx`)

**Validation Trigger:**
- Called in `handleNext()` before allowing user to proceed
- Shows validation modal if `isValid === false`

**Code Location:**
```typescript
const handleNext = () => {
  const validation = validateOfferRequirements(
    selectedOffers,
    conversationFlows,
    offerFlowMap
  );
  
  if (!validation.isValid) {
    setValidationError(formatValidationErrors(validation));
    setShowValidationModal(true);
    return;
  }
  
  // Proceed to next step...
};
```

### Step 2 Component (`step2Offers.tsx`)

**Flow Selection:**
- User selects which flows each offer applies to
- Updates `offerFlowMap` in Zustand store
- UI filters available flows based on `applicableFlows` from `offerRequirements.ts`

## Debugging Validation Issues

### 1. Check Offer Requirements

```typescript
import { getOfferRequirements } from '@/lib/offers/offerRequirements';

const requirements = getOfferRequirements('home-estimate');
console.log('Required fields:', requirements.requiredFields);
console.log('Applicable flows:', requirements.applicableFlows);
```

### 2. Check Flow Mapping

```typescript
const offerFlowMap = useOnboardingStore(state => state.offerFlowMap);
console.log('Offer flow map:', offerFlowMap);
```

### 3. Check Conversation Flows

```typescript
const conversationFlows = useOnboardingStore(state => state.conversationFlows);
Object.entries(conversationFlows).forEach(([flowType, flow]) => {
  console.log(`${flowType} flow questions:`, flow.questions.map(q => ({
    question: q.question,
    mappingKey: q.mappingKey
  })));
});
```

### 4. Run Validation Manually

```typescript
import { validateOfferRequirements } from '@/lib/onboarding/validateOfferRequirements';

const result = validateOfferRequirements(
  selectedOffers,
  conversationFlows,
  offerFlowMap
);
console.log('Validation result:', result);
```

## Testing Checklist

- [ ] Select offer with `applicableFlows` restriction → Only those flows shown
- [ ] Add question with correct `mappingKey` → Validation passes
- [ ] Add question with wrong `mappingKey` → Validation fails
- [ ] Select offer for wrong flow → Validation fails appropriately
- [ ] Remove required question → Validation fails
- [ ] Add all required questions → Validation passes

## Related Documentation

- `frontend/docs/onboarding/step3-question-config-error.md` - Error handling guide
- `frontend/src/lib/offers/offerRequirements.ts` - Offer requirement definitions
- `frontend/src/lib/onboarding/validateOfferRequirements.ts` - Validation implementation

