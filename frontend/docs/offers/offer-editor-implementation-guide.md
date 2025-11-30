# Offer Editor Implementation Guide

## Overview

This document provides comprehensive instructions and context for implementing a detailed **Offer Editor** component in the user dashboard. The editor will allow users to view, configure, test, and manage individual offers beyond the basic overview provided in `OffersDashboard.tsx`.

---

## Current State

### What Exists

1. **`OffersDashboard.tsx`** (`frontend/src/components/dashboard/user/offers/OffersDashboard.tsx`)
   - Overview/list of all configured offers
   - Shows offer status (configured, active, etc.)
   - "Configure" button that navigates to `/dashboard?section=offers&offer=${offer.type}` (currently not handled)
   - "Add Offers" button redirects to onboarding

2. **Offer System Architecture** (`frontend/src/lib/offers/`)
   - Complete offer definition system with 5 offer types: `pdf`, `landingPage`, `video`, `home-estimate`, `custom`
   - Registry system (`core/registry.ts`) that manages all offer definitions
   - Generator system (`core/generator.ts`) for creating offers
   - Type system (`core/types.ts`) defining all offer structures

3. **User Configuration** (`frontend/src/contexts/UserConfigContext.tsx`)
   - `UserConfig` interface includes `selectedOffers: string[]`
   - Config stored in MongoDB via `/api/user/config`
   - Accessible via `useUserConfig()` hook

### What's Missing

- **Detailed offer editor page** - No component exists to edit individual offers
- **Offer customization storage** - No MongoDB schema for user-specific offer overrides
- **Test generation functionality** - No way to test offer generation from dashboard
- **Offer analytics** - No per-offer generation stats/history
- **URL parameter handling** - Dashboard doesn't handle `?offer=${type}` query param

---

## Architecture Context

### Offer Definition Structure

Each offer is defined by an `OfferDefinition<T>` object with the following structure:

```typescript
interface OfferDefinition<T extends BaseOfferProps> {
  // Identity
  type: OfferType; // 'pdf' | 'landingPage' | 'video' | 'home-estimate' | 'custom'
  label: string;
  description: string;
  icon?: string;
  
  // Version Control
  version: OfferVersion; // Semantic versioning
  
  // Input Requirements
  inputRequirements: {
    requiredFields: string[]; // e.g., ['email', 'propertyAddress']
    optionalFields?: string[];
    fieldValidations?: Record<string, FieldValidation>;
  };
  
  // Prompt Generation
  buildPrompt: PromptBuilder; // Function that creates LLM prompt
  
  // Output Structure
  outputSchema: OutputSchema; // JSON schema for expected output
  outputValidator: OutputValidator; // Function to validate output
  
  // Post-processing (optional)
  postProcess?: (output: T, userInput: Record<string, string>) => T;
  
  // Generation Settings
  generationMetadata: {
    model: 'gpt-4o-mini' | 'gpt-4o' | 'claude-3-5-sonnet';
    maxTokens: number;
    temperature: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
  };
  
  // Retry & Fallback
  retryConfig: RetryConfig;
  fallbackConfig: FallbackConfig<T>;
  
  // Cost Estimation
  estimateCost: CostEstimator;
}
```

### System vs. User Customizations

**System Definitions** (read-only):
- Located in `frontend/src/lib/offers/definitions/*.ts`
- Managed by registry: `frontend/src/lib/offers/core/registry.ts`
- Accessed via: `getOfferDefinition(offerType)`

**User Customizations** (editable):
- Should be stored in MongoDB
- Should merge with system defaults
- Should allow partial overrides (not full replacement)

---

## Implementation Requirements

### 1. Component Structure

Create: `frontend/src/components/dashboard/user/offers/OfferEditor.tsx`

**Component should:**
- Accept `offerType` as prop or read from URL query param
- Display tabs/sections for different aspects:
  - **Overview** - Basic info, status, enable/disable toggle
  - **Input Requirements** - Required/optional fields, validations
  - **Prompt Configuration** - View/edit prompt template (if editable)
  - **Output Schema** - View output structure (read-only or editable)
  - **Generation Settings** - Model, temperature, max tokens, etc.
  - **Test Generation** - Test with sample data
  - **Analytics** - Generation stats, history, cost tracking

**Reference similar components:**
- `frontend/src/components/dashboard/user/conversationEditor/conversationEditor.tsx` - Similar tabbed editor pattern
- `frontend/src/components/dashboard/user/adviceDashboard/agentAdviceDashboard.tsx` - Similar data management pattern

### 2. MongoDB Schema

Create: `frontend/src/lib/mongodb/models/offerCustomization.ts`

```typescript
export interface OfferCustomizationDocument {
  _id?: ObjectId;
  userId: string; // From NextAuth session
  offerType: OfferType;
  
  // User overrides (partial - only what user changed)
  customizations?: {
    // Override generation settings
    generationMetadata?: Partial<GenerationMetadata>;
    
    // Override input requirements (add/remove fields)
    inputRequirements?: {
      additionalRequiredFields?: string[];
      removedRequiredFields?: string[];
      customValidations?: Record<string, FieldValidation>;
    };
    
    // Custom prompt modifications (if allowed)
    promptModifications?: {
      prependText?: string;
      appendText?: string;
      customInstructions?: string;
    };
    
    // Enable/disable
    enabled?: boolean;
    
    // Custom fallback config
    fallbackConfig?: Partial<FallbackConfig>;
  };
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastTestedAt?: Date;
  lastGeneratedAt?: Date;
}
```

**Collection name:** `offer_customizations`

### 3. API Routes

Create the following API routes:

#### `GET /api/offers/[type]`
- Fetch system definition + user customizations
- Merge them together
- Return merged offer definition

#### `PUT /api/offers/[type]`
- Save user customizations
- Validate customizations against system definition
- Update MongoDB document

#### `POST /api/offers/[type]/test`
- Test offer generation with sample data
- Return generation result
- Track test usage (for analytics)

#### `GET /api/offers/[type]/stats`
- Get generation statistics for this offer
- Include: total generations, success rate, avg cost, recent history

#### `GET /api/offers/[type]/history`
- Get recent generation history
- Paginated list of generations

### 4. Integration with Dashboard

**Update `userDashboard.tsx`:**
- Handle `?offer=${type}` query parameter
- If present, show `OfferEditor` instead of `OffersDashboard`
- Pass `offerType` prop to `OfferEditor`

**Update `OffersDashboard.tsx`:**
- "Configure" button should navigate to: `/dashboard?section=offers&offer=${offer.type}`
- This is already implemented, just needs the handler

### 5. UI/UX Patterns

**Follow existing patterns:**
- Use same color scheme: `slate-900` background, `cyan-500` accents
- Use `framer-motion` for animations (already in codebase)
- Use `lucide-react` icons (already in use)
- Match spacing/padding from `conversationEditor.tsx`

**Tab Structure:**
```typescript
const TABS = [
  { id: 'overview', label: 'Overview', icon: FileText },
  { id: 'inputs', label: 'Input Requirements', icon: ClipboardList },
  { id: 'prompt', label: 'Prompt', icon: FileCode },
  { id: 'output', label: 'Output Schema', icon: Database },
  { id: 'settings', label: 'Generation Settings', icon: Settings },
  { id: 'test', label: 'Test Generation', icon: Play },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];
```

### 6. Data Flow

```
User clicks "Configure" on offer
  ↓
Navigate to /dashboard?section=offers&offer=pdf
  ↓
userDashboard.tsx detects query param
  ↓
Render OfferEditor with offerType="pdf"
  ↓
OfferEditor fetches:
  - System definition (from registry)
  - User customizations (from MongoDB)
  ↓
Merge and display
  ↓
User makes changes
  ↓
Save to MongoDB via PUT /api/offers/[type]
  ↓
Update local state
```

---

## Key Files to Reference

### Type Definitions
- `frontend/src/lib/offers/core/types.ts` - All offer type definitions
- `frontend/src/lib/offers/core/registry.ts` - Registry functions
- `frontend/src/stores/onboardingStore/onboarding.store.ts` - `OfferType` definition

### Example Offer Definitions
- `frontend/src/lib/offers/definitions/pdfOffer.ts` - PDF offer example
- `frontend/src/lib/offers/definitions/landingPageOffer.ts` - Landing page example
- `frontend/src/lib/offers/definitions/homeEstimateOffer.ts` - Home estimate example

### Similar Components (for UI patterns)
- `frontend/src/components/dashboard/user/conversationEditor/conversationEditor.tsx`
- `frontend/src/components/dashboard/user/adviceDashboard/agentAdviceDashboard.tsx`
- `frontend/src/components/dashboard/user/offers/OffersDashboard.tsx`

### Context & Hooks
- `frontend/src/contexts/UserConfigContext.tsx` - User config access
- `frontend/src/lib/mongodb/db.ts` - MongoDB connection helpers
- `frontend/src/lib/mongodb/models/clientConfig.ts` - Client config model (reference for schema pattern)

### API Patterns
- `frontend/app/api/user/config/route.ts` - User config API (reference for auth patterns)
- `frontend/app/api/generation/generate-offer/route.ts` - Offer generation API (reference for generation logic)

---

## Implementation Checklist

### Phase 1: Core Editor Component
- [ ] Create `OfferEditor.tsx` component
- [ ] Implement tab navigation
- [ ] Create Overview tab (basic info, status, enable/disable)
- [ ] Create Input Requirements tab (view/edit required fields)
- [ ] Create Prompt Configuration tab (view prompt, show if editable)
- [ ] Create Output Schema tab (view JSON schema structure)
- [ ] Create Generation Settings tab (model, temperature, etc.)
- [ ] Integrate with dashboard URL handling

### Phase 2: Backend & Storage
- [ ] Create MongoDB schema (`offerCustomization.ts`)
- [ ] Create `GET /api/offers/[type]` route
- [ ] Create `PUT /api/offers/[type]` route
- [ ] Implement merge logic (system defaults + user overrides)
- [ ] Add validation for user customizations

### Phase 3: Test Generation
- [ ] Create `POST /api/offers/[type]/test` route
- [ ] Create Test Generation tab in editor
- [ ] Add sample data input form
- [ ] Display generation result
- [ ] Show generation metrics (tokens, cost, duration)

### Phase 4: Analytics
- [ ] Create `GET /api/offers/[type]/stats` route
- [ ] Create `GET /api/offers/[type]/history` route
- [ ] Create Analytics tab in editor
- [ ] Display generation statistics
- [ ] Show generation history table

### Phase 5: Polish
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add success notifications
- [ ] Add confirmation dialogs for destructive actions
- [ ] Add help tooltips
- [ ] Responsive design (mobile-friendly)

---

## Important Considerations

### 1. System Defaults vs. User Overrides

**Approach:** Store only user overrides in MongoDB, merge with system defaults at runtime.

**Why:** 
- Reduces storage
- System updates automatically apply
- User can reset to defaults easily

**Implementation:**
```typescript
function mergeOfferDefinition(
  systemDef: OfferDefinition,
  userCustomizations: OfferCustomizationDocument | null
): OfferDefinition {
  if (!userCustomizations?.customizations) {
    return systemDef;
  }
  
  const merged = { ...systemDef };
  const custom = userCustomizations.customizations;
  
  // Merge generation metadata
  if (custom.generationMetadata) {
    merged.generationMetadata = {
      ...merged.generationMetadata,
      ...custom.generationMetadata,
    };
  }
  
  // Merge input requirements
  if (custom.inputRequirements) {
    // Handle additional/removed fields
    // ...
  }
  
  return merged;
}
```

### 2. Prompt Editing

**Decision needed:** Should users be able to edit prompts directly?

**Options:**
- **Option A:** View-only (show system prompt, explain it)
- **Option B:** Allow modifications (prepend/append text, custom instructions)
- **Option C:** Full editing (replace entire prompt)

**Recommendation:** Start with Option B (modifications), allow full editing later if needed.

### 3. Validation

**Critical validations:**
- Required fields must exist in conversation flows
- Model selection must be valid
- Temperature must be 0-2
- Max tokens must be reasonable (e.g., 100-8000)
- Custom validations must be valid JSON schemas

### 4. Testing

**Test generation should:**
- Use sample data (pre-filled from conversation flows)
- Show full generation result
- Display metrics (tokens, cost, duration)
- Allow saving test result as example
- Show validation errors if any

### 5. Error Handling

**Handle gracefully:**
- Offer type doesn't exist
- User hasn't configured this offer
- Generation fails
- API errors
- Network errors

---

## Example Usage Flow

1. User navigates to Offers tab
2. Sees list of configured offers
3. Clicks "Configure" on "PDF Guide" offer
4. Redirected to `/dashboard?section=offers&offer=pdf`
5. `OfferEditor` loads:
   - Fetches system definition for `pdf`
   - Fetches user customizations (if any)
   - Merges and displays
6. User views/edits:
   - Changes model from `gpt-4o-mini` to `gpt-4o`
   - Adjusts temperature to 0.8
   - Saves changes
7. Changes saved to MongoDB
8. User tests generation:
   - Clicks "Test Generation"
   - Uses sample data
   - Sees generated PDF structure
9. User views analytics:
   - Sees 15 total generations
   - Average cost: $0.05
   - Success rate: 98%

---

## Next Steps After Implementation

1. **Add offer templates** - Pre-configured offer setups for common use cases
2. **Add offer duplication** - Clone an offer with modifications
3. **Add offer versioning** - Track changes over time
4. **Add A/B testing** - Test different prompt variations
5. **Add offer scheduling** - Schedule offers for specific times/flows
6. **Add offer analytics dashboard** - Aggregate stats across all offers

---

## Questions to Resolve

1. **Prompt editing depth:** Full editing or modifications only?
2. **Output schema editing:** Should users be able to modify output structure?
3. **Field validation:** How strict should validation be? (warnings vs. errors)
4. **Default values:** Should system provide sensible defaults for all fields?
5. **Reset functionality:** Should users be able to reset to system defaults?

---

## Notes

- All offer definitions are currently in TypeScript files - consider if they should be moved to database for easier editing
- Generation uses OpenAI client - ensure API key is available in API routes
- Cost tracking should integrate with existing token usage system
- Analytics should integrate with existing analytics dashboard

---

## Support Files Needed

When implementing, you may also need to create:

1. **Utility functions:**
   - `lib/offers/utils/mergeCustomizations.ts` - Merge logic
   - `lib/offers/utils/validateCustomizations.ts` - Validation logic
   - `lib/offers/utils/getSampleData.ts` - Generate test data

2. **Components:**
   - `components/dashboard/user/offers/editor/OverviewTab.tsx`
   - `components/dashboard/user/offers/editor/InputsTab.tsx`
   - `components/dashboard/user/offers/editor/PromptTab.tsx`
   - `components/dashboard/user/offers/editor/OutputTab.tsx`
   - `components/dashboard/user/offers/editor/SettingsTab.tsx`
   - `components/dashboard/user/offers/editor/TestTab.tsx`
   - `components/dashboard/user/offers/editor/AnalyticsTab.tsx`

3. **Hooks:**
   - `hooks/useOfferEditor.ts` - Editor state management
   - `hooks/useOfferCustomizations.ts` - Fetch/save customizations
   - `hooks/useOfferTest.ts` - Test generation logic

---

**End of Implementation Guide**

