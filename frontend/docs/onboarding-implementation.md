# Onboarding Flow Implementation Guide

## Overview

This document outlines the multi-step onboarding flow that guides new users through setting up their chatbot. The flow is designed to be user-friendly for non-technical users, breaking down the complex dashboard configuration into manageable steps.

## Current Status

✅ **Completed:**
- Step 1: Business Setup (Business name, data collection preferences, flow intentions)
- Step 2: Offers Selection (PDF, Landing Page, Video, Custom offers)
- Authentication integration (redirects to onboarding after login)
- State management with Zustand + persistence
- Progress tracking and navigation

⏳ **Next Steps:**
- Step 3: Conversation Flow Setup (simplified question builder)
- Step 4: Knowledge Base Upload (Agent Advice)
- Step 5: Results Page Configuration
- Step 6: Test & Preview
- Step 7: Deployment & Integration
- Step 8: Payment/Subscription (if applicable)
- Step 9: Success & Dashboard Access

---

## Architecture

### File Structure

```
frontend/
├── app/
│   └── onboarding/
│       └── page.tsx                    # Main onboarding page with auth check
├── src/
│   ├── stores/
│   │   └── onboardingStore/
│   │       └── onboarding.store.ts    # Zustand store with persistence
│   └── components/
│       └── onboarding/
│           └── steps/
│               ├── step1BusinessSetup.tsx
│               └── step2Offers.tsx
└── docs/
    └── onboarding-implementation.md   # This file
```

### State Management

**Store Location:** `src/stores/onboardingStore/onboarding.store.ts`

**State Structure:**
```typescript
interface OnboardingState {
  // Step 1
  businessName: string;
  industry: string;
  dataCollection: DataCollectionType[];  // 'email' | 'phone' | 'propertyAddress' | 'custom'
  customDataCollection: string;
  selectedIntentions: FlowIntention[];   // 'buy' | 'sell' | 'browse'
  
  // Step 2
  selectedOffers: OfferType[];             // 'pdf' | 'landingPage' | 'video' | 'custom'
  customOffer: string;
  
  // Flow control
  currentStep: number;
  completedSteps: number[];
}
```

**Persistence:** Uses Zustand's `persist` middleware to save progress to localStorage. Users can refresh the page without losing their progress.

---

## Step 1: Business Setup

**Component:** `src/components/onboarding/steps/step1BusinessSetup.tsx`

**What it collects:**
1. **Business Name** (required)
   - Simple text input
   - Used for personalization and branding

2. **Data Collection Preferences** (required, multi-select)
   - Email
   - Phone
   - Property Address
   - Custom field (optional text input)

3. **Flow Intentions** (required, multi-select)
   - Buy - For visitors looking to purchase
   - Sell - For visitors looking to sell
   - Browse - For visitors exploring the market

**Validation:**
- Business name must not be empty
- At least one data collection type must be selected
- At least one flow intention must be selected

**UI Features:**
- Toggle buttons for multi-select options
- Custom field input with add/remove functionality
- Visual feedback for selected items
- Disabled "Continue" button until validation passes

---

## Step 2: Offers

**Component:** `src/components/onboarding/steps/step2Offers.tsx`

**What it collects:**
1. **Predefined Offers** (multi-select, at least one required)
   - PDF Guide - Downloadable resource
   - Landing Page - Personalized results page
   - Video - Video content or tutorial

2. **Custom Offer** (optional)
   - Textarea for custom value proposition
   - Examples: "Free consultation call", "10% discount", etc.

**Note:** These are currently placeholder buttons. Actual configuration will be implemented in later steps.

**Validation:**
- At least one predefined offer OR custom offer must be provided

**UI Features:**
- Toggle buttons for predefined offers
- Custom offer textarea with add/remove
- Back button to return to Step 1
- Progress indicator

---

## Authentication Integration

### Sign-In Flow

1. User clicks "Get Your Own" on homepage → `/auth/signin`
2. User enters email → receives magic link
3. User clicks magic link → NextAuth verifies token
4. **Redirect to `/onboarding`** (via `callbackUrl` and redirect callback)

### Onboarding Page Auth Check

**Location:** `app/onboarding/page.tsx`

**Behavior:**
- Checks `useSession()` from NextAuth
- If `status === "unauthenticated"` → redirects to `/auth/signin?callbackUrl=/onboarding`
- Shows loading spinner while checking auth
- Only renders steps if authenticated

### Auth Configuration

**Location:** `src/lib/auth/authConfig.ts`

**Key Settings:**
- `redirect` callback: Defaults to `/onboarding` for new sign-ins
- `pages.signIn`: Custom sign-in page at `/auth/signin`
- `session.strategy`: `'database'` (uses MongoDB)

---

## Progress Tracking

### Step Navigation

- **Current Step:** Stored in Zustand store (`currentStep`)
- **Completed Steps:** Array of step numbers (`completedSteps`)
- **Progress Bar:** Calculated as `(currentStep / totalSteps) * 100%`

### Persistence

- All state automatically saved to localStorage via Zustand persist
- Users can refresh page without losing progress
- State key: `'onboarding-storage'`

### Step Completion

- Steps are marked complete when user clicks "Continue"
- `markStepComplete(stepNumber)` adds step to `completedSteps` array
- Can be used later to show "completed" indicators or skip steps

---

## Next Steps: Implementation Roadmap

### Step 3: Conversation Flow Setup

**Goal:** Allow users to configure chatbot questions (simplified version of ConversationEditor)

**What to collect:**
- Choose template flow OR start from scratch
- Add/edit questions one at a time:
  - Question text
  - Question type (buttons vs free text)
  - Button options (if applicable)
- Reorder questions (drag & drop)
- Preview the flow

**Simplifications:**
- Hide advanced features (conditional branching, validation rules) behind "Advanced" toggle
- Show one question at a time
- Provide templates/examples
- Focus on getting 3-5 questions set up quickly

**Implementation:**
```typescript
// Add to onboarding.store.ts
conversationFlow: {
  questions: QuestionNode[];
  flows: FlowIntention[];
}

// Create step3ConversationFlow.tsx
// Reuse components from ConversationEditor but simplified
```

---

### Step 4: Knowledge Base Upload

**Goal:** Upload expert knowledge that personalizes responses

**What to collect:**
- Upload method choice:
  - **Option A:** Text upload (simplified AgentAdviceUploader)
    - Title
    - Advice text (150-500 words)
    - Which flows it applies to
    - Simple conditions (optional)
  - **Option B:** Speech/script upload (AgentAdviceSpeechUploader)
    - Record or upload audio
    - AI transcribes and chunks it
- Upload 3-5 initial advice snippets (minimum to get started)
- "Add more later" option

**Simplifications:**
- Hide complex rule builder initially
- Focus on "upload 3-5 pieces of advice to get started"
- Show examples of good advice
- Make it feel like "sharing your expertise" not "configuring rules"

**Implementation:**
```typescript
// Add to onboarding.store.ts
adviceLibrary: {
  items: AdviceItem[];
  uploadMethod: 'text' | 'speech';
}

// Create step4KnowledgeBase.tsx
// Reuse AgentAdviceUploader but simplified
```

---

### Step 5: Results Page Configuration

**Goal:** Configure what users see after completing the chat

**What to collect:**
- Choose which components to show:
  - Hero banner
  - Profile summary
  - Personal message
  - Market insights
  - Action plan
  - Next steps CTA
- Customize messaging/tone
- Preview sample results page

**Simplifications:**
- Toggle components on/off
- Simple text customization
- Hide LLM prompt engineering

**Implementation:**
```typescript
// Add to onboarding.store.ts
resultsConfig: {
  components: {
    hero: boolean;
    profileSummary: boolean;
    personalMessage: boolean;
    marketInsights: boolean;
    actionPlan: boolean;
    nextStepsCTA: boolean;
  };
  messaging: {
    tone: string;
    customMessages: Record<string, string>;
  };
}

// Create step5ResultsConfig.tsx
```

---

### Step 6: Test Your Bot

**Goal:** Let users try it before going live

**What to do:**
- Interactive preview of the chatbot
- Complete a test conversation
- See sample results page
- "Looks good" or "I want to make changes" options

**Implementation:**
```typescript
// Create step6TestBot.tsx
// Embed the actual chatbot component
// Use test data from onboarding store
// Show results preview
```

---

### Step 7: Deployment & Integration

**Goal:** Get the bot live on their site

**What to collect:**
- Choose deployment method:
  - **Option A:** Embed code (iframe/widget)
  - **Option B:** Custom domain (if multi-tenant)
  - **Option C:** Standalone page
- Get embed code/URL
- Test on their site
- Optional: Analytics setup

**Implementation:**
```typescript
// Add to onboarding.store.ts
deployment: {
  method: 'embed' | 'domain' | 'standalone';
  embedCode?: string;
  domain?: string;
  analyticsEnabled: boolean;
}

// Create step7Deployment.tsx
// Generate embed code based on client ID
// Show integration instructions
```

---

### Step 8: Payment/Subscription (Optional)

**Goal:** Handle billing if payment is required

**What to do:**
- Select plan (if multiple tiers)
- Enter payment info (Stripe)
- Confirm subscription

**Implementation:**
```typescript
// Add to onboarding.store.ts
subscription: {
  planId: string;
  paymentMethod?: PaymentMethod;
  status: 'pending' | 'active' | 'failed';
}

// Create step8Payment.tsx
// Integrate Stripe Checkout
// Only show if payment required before going live
```

---

### Step 9: Success & Next Steps

**Goal:** Celebrate completion and guide to dashboard

**What to show:**
- Confetti/celebration animation
- "Your bot is live!" message
- Links to:
  - View dashboard
  - Edit settings
  - View analytics
  - Add more advice
- Quick tips for optimizing

**Implementation:**
```typescript
// Create step9Success.tsx
// Use canvas-confetti for celebration
// Show completion summary
// Navigation buttons to dashboard
```

---

## Database Integration

### Save Onboarding Data

After each step (or at completion), save to MongoDB:

```typescript
// Create API route: app/api/onboarding/save/route.ts
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const onboardingData = await req.json();
  
  // Save to MongoDB
  // Collection: 'clients' or 'onboarding'
  // Structure: { userId, step, data, completedAt }
  
  return NextResponse.json({ success: true });
}
```

### Client Model

```typescript
interface Client {
  _id: string;
  userId: string;  // From NextAuth session
  businessName: string;
  industry: string;
  dataCollection: DataCollectionType[];
  selectedIntentions: FlowIntention[];
  selectedOffers: OfferType[];
  conversationFlow: ConversationFlow;
  adviceLibrary: AdviceItem[];
  resultsConfig: ResultsConfig;
  deployment: DeploymentConfig;
  onboardingComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Extending the Flow

### Adding a New Step

1. **Update Store:**
   ```typescript
   // Add to OnboardingState interface
   newStepData: NewStepDataType;
   setNewStepData: (data: NewStepDataType) => void;
   ```

2. **Create Step Component:**
   ```typescript
   // Create stepXNewStep.tsx
   // Follow pattern from existing steps
   // Include validation, navigation, animations
   ```

3. **Update Onboarding Page:**
   ```typescript
   // Add to page.tsx
   {currentStep === X && <StepXNewStep />}
   // Update progress calculation: (currentStep / totalSteps) * 100
   ```

4. **Update Progress Indicator:**
   ```typescript
   // Update "Step X of Y" text
   // Update progress bar calculation
   ```

### Conditional Steps

Some steps may be optional or conditional:

```typescript
// In onboarding page
const shouldShowStep = (step: number) => {
  if (step === 8 && !requiresPayment) return false;
  if (step === 7 && !multiTenantEnabled) return false;
  return true;
};

// Skip step in navigation
const handleNext = () => {
  let nextStep = currentStep + 1;
  while (!shouldShowStep(nextStep) && nextStep <= totalSteps) {
    nextStep++;
  }
  setCurrentStep(nextStep);
};
```

---

## Best Practices

### Validation

- **Validate before allowing "Next"**
  - Show error messages inline
  - Disable "Continue" button until valid
  - Highlight required fields

### User Experience

- **Progressive Disclosure**
  - Show only what's needed for current step
  - Hide advanced features behind toggles
  - Provide "Skip for now" where appropriate

- **Contextual Help**
  - Tooltips for technical terms
  - Examples at each step
  - "Why this matters" explanations

- **Feedback**
  - Show what's missing
  - Preview changes in real time
  - Save progress automatically

### Mobile Responsiveness

- Single-column layout for forms
- Large touch targets
- Simplified UI on small screens
- Full-screen modals on mobile (if needed)

---

## Testing Checklist

- [ ] Auth flow: Sign in → redirects to onboarding
- [ ] Auth check: Unauthenticated users redirected to signin
- [ ] Step 1: All validations work correctly
- [ ] Step 2: All validations work correctly
- [ ] Navigation: Back/Next buttons work
- [ ] Progress bar: Updates correctly
- [ ] Persistence: Refresh page maintains state
- [ ] Mobile: All steps work on mobile devices
- [ ] Error handling: Invalid inputs show errors
- [ ] Loading states: Auth check shows loading spinner

---

## Troubleshooting

### Auth Redirect Not Working

- Check `AUTH_SECRET` and `AUTH_URL` in `.env`
- Verify `redirect` callback in `authConfig.ts`
- Check `callbackUrl` in signin page

### State Not Persisting

- Check browser localStorage (DevTools → Application → Local Storage)
- Verify Zustand persist middleware is configured
- Check for localStorage errors in console

### Step Navigation Issues

- Verify `currentStep` is being updated correctly
- Check validation logic isn't blocking navigation
- Ensure step components are rendering correctly

---

## Key Takeaways

1. **Onboarding is critical** - First impression for non-technical users
2. **Break complexity into steps** - One thing at a time
3. **Validate early** - Don't let users proceed with invalid data
4. **Save progress** - Users may need to come back later
5. **Provide examples** - Help users understand what to enter
6. **Celebrate completion** - Make users feel accomplished

---

## Related Documentation

- [Multi-Step Flows Pattern](./patterns/multi-step-flows.md)
- [Authentication Setup](./patterns/authentication.md)
- [State Management with Zustand](./zustand-localStorage-pattern.md)

---

## Questions or Issues?

If you encounter issues or need to extend the onboarding flow:

1. Check this documentation first
2. Review existing step components for patterns
3. Test in isolation before integrating
4. Update this document when adding new steps

