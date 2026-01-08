# Context for Claude: Offer System Integration - Two-Tier Management

## Overview

The offer system uses a **two-tier management approach**:
1. **Onboarding (Simple)**: Users select offers and ensure questions exist
2. **Dashboard (Complex)**: Users configure detailed offer settings, prompts, and behavior

This document explains how the offer system must support both tiers and how to structure code accordingly.

---

## The Two-Tier System

### Tier 1: Onboarding - Simple Selection & Validation

**Location**: `/onboarding` → Step 2 (Offers Selection)

**Purpose**: 
- Get users started quickly
- Ensure they have required questions in their flows
- Store basic offer selection

**What Users Do**:
1. Select which offers they want to provide (PDF, Landing Page, Home Estimate, etc.)
2. See which questions are required for each offer
3. System validates that required questions exist in their conversation flows (Step 3)
4. Cannot proceed if validation fails

**What Gets Stored**:
```typescript
// In onboarding store
selectedOffers: OfferType[]; // e.g., ['pdf', 'landingPage', 'home-estimate']
customOffer: string; // Optional custom offer description
```

**What Users DON'T Configure Here**:
- ❌ Prompt customization
- ❌ Output structure details
- ❌ Model selection
- ❌ Post-processing logic
- ❌ Advanced settings

**Code Pattern**:
```typescript
// Simple: Just read from offer definitions and display
const definition = getOfferDefinition(offerType);
const requiredFields = definition.inputRequirements.requiredFields;
// Show offer card with required fields
// Validate in Step 3
```

---

### Tier 2: Dashboard - Complex Configuration

**Location**: `/dashboard` → New "Offers" section

**Purpose**:
- Detailed offer configuration
- Customize prompts per offer
- Configure output structure
- Set model preferences
- Test and preview offers
- Manage offer lifecycle

**What Users Do**:
1. View all selected offers from onboarding
2. Configure each offer individually:
   - Customize prompt templates
   - Adjust output schema
   - Select LLM model
   - Set temperature, max tokens
   - Configure post-processing
   - Add custom validators
3. Test offers with sample data
4. Preview generated outputs
5. Enable/disable offers
6. Add new offers (beyond onboarding selection)
7. Remove offers

**What Gets Stored**:
```typescript
// In MongoDB user config document
offers: {
  [offerType: string]: {
    enabled: boolean;
    customPrompt?: string; // Override default prompt
    model?: string; // Override default model
    temperature?: number;
    maxTokens?: number;
    customValidator?: string; // Custom validation logic
    outputSchema?: OutputSchema; // Custom output structure
    postProcessConfig?: Record<string, any>; // Post-processing settings
    lastModified: Date;
    testResults?: Array<{
      input: Record<string, string>;
      output: any;
      timestamp: Date;
    }>;
  }
}
```

**Code Pattern**:
```typescript
// Complex: Full CRUD interface with tabs, forms, previews
<OffersDashboard>
  <OfferList />
  <OfferEditor offer={selectedOffer} />
  <OfferTester offer={selectedOffer} />
  <OfferPreview offer={selectedOffer} />
</OffersDashboard>
```

---

## Architecture Requirements

### 1. Offer Definitions Must Support Both Tiers

**Base Definition** (used in both tiers):
```typescript
export interface OfferDefinition {
  // Identity (used in onboarding)
  type: OfferType;
  label: string;
  description: string;
  icon?: string;
  
  // Input requirements (used in onboarding validation)
  inputRequirements: InputRequirements;
  
  // Generation config (defaults, can be overridden in dashboard)
  buildPrompt: PromptBuilder; // Default prompt builder
  outputSchema: OutputSchema; // Default schema
  outputValidator: OutputValidator; // Default validator
  postProcess?: PostProcessor; // Default post-processor
  model?: string; // Default model
  maxTokens?: number; // Default max tokens
  temperature?: number; // Default temperature
}
```

**Dashboard Overrides** (stored in MongoDB):
```typescript
export interface OfferConfiguration {
  offerType: OfferType;
  enabled: boolean;
  overrides?: {
    prompt?: string | PromptBuilder; // Custom prompt
    model?: string; // Override model
    temperature?: number;
    maxTokens?: number;
    validator?: OutputValidator; // Custom validator
    postProcess?: PostProcessor; // Custom post-processor
  };
  metadata: {
    lastModified: Date;
    testCount: number;
    successRate: number;
  };
}
```

**Resolution Logic** (merge defaults with overrides):
```typescript
function getEffectiveOfferConfig(
  offerType: OfferType,
  userConfig?: OfferConfiguration
): EffectiveOfferConfig {
  const definition = getOfferDefinition(offerType);
  const overrides = userConfig?.overrides || {};
  
  return {
    ...definition,
    buildPrompt: overrides.prompt || definition.buildPrompt,
    model: overrides.model || definition.model,
    temperature: overrides.temperature ?? definition.temperature,
    maxTokens: overrides.maxTokens ?? definition.maxTokens,
    outputValidator: overrides.validator || definition.outputValidator,
    postProcess: overrides.postProcess || definition.postProcess,
  };
}
```

---

## Implementation Structure

### File Organization

```
lib/offers/
├── definitions/
│   ├── pdfOffer.ts              # Base definition
│   ├── landingPageOffer.ts
│   └── ...
├── registry.ts                   # Central registry
├── types.ts                      # Type definitions
├── resolvers.ts                  # Merge defaults + overrides
└── validators.ts                 # Shared validation

components/
├── onboarding/
│   └── steps/
│       └── step2Offers.tsx       # Simple selection UI
└── dashboard/
    └── user/
        └── offers/              # NEW: Complex dashboard
            ├── OffersDashboard.tsx
            ├── OfferList.tsx
            ├── OfferEditor/
            │   ├── index.tsx
            │   ├── PromptEditor.tsx
            │   ├── SchemaEditor.tsx
            │   ├── ModelSelector.tsx
            │   └── ValidatorEditor.tsx
            ├── OfferTester/
            │   ├── index.tsx
            │   ├── TestInputForm.tsx
            │   └── TestResults.tsx
            └── OfferPreview/
                ├── index.tsx
                └── PreviewOutput.tsx
```

---

## Onboarding Integration (Simple)

### Step 2: Offer Selection

**Current Implementation**:
- Reads from `OFFER_REQUIREMENTS` static object
- Shows offer cards with required fields
- Stores `selectedOffers: OfferType[]`

**New Implementation** (minimal changes):
```typescript
// step2Offers.tsx
import { getOfferDefinition } from "@/lib/offers/registry";

// Get all available offers from registry
const availableOffers = Object.values(OFFER_DEFINITIONS)
  .filter(def => def.type !== 'custom');

// For each offer, show:
const definition = getOfferDefinition(offer.value);
const requiredFields = definition.inputRequirements.requiredFields;
// Display offer card with required fields
```

**Key Points**:
- ✅ Only reads from definitions (no user config needed)
- ✅ Shows required fields for validation
- ✅ Simple UI - just selection
- ✅ No editing capabilities
- ✅ Stores only offer types, not configurations

---

## Dashboard Integration (Complex)

### New "Offers" Section

**Add to Dashboard**:
```typescript
// userDashboard.tsx
const USER_SECTIONS = [
  // ... existing sections
  {
    id: 'offers',
    label: 'Offers',
    icon: Gift, // or FileText, Package, etc.
    component: OffersDashboard,
    description: 'Configure and manage your offer generation settings'
  },
];
```

### OffersDashboard Component Structure

```typescript
// components/dashboard/user/offers/OffersDashboard.tsx

export default function OffersDashboard() {
  const [activeTab, setActiveTab] = useState<'list' | 'editor' | 'tester' | 'preview'>('list');
  const [selectedOffer, setSelectedOffer] = useState<OfferType | null>(null);
  const { config } = useUserConfig(); // Get user's offer configurations
  
  // Get all offers selected in onboarding
  const onboardingOffers = config?.selectedOffers || [];
  
  // Get user's custom configurations from MongoDB
  const offerConfigs = config?.offers || {};
  
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Tabs */}
        <Tabs>
          <TabList>
            <Tab>All Offers</Tab>
            <Tab>Configure</Tab>
            <Tab>Test</Tab>
            <Tab>Preview</Tab>
          </TabList>
          
          <TabPanels>
            {/* Tab 1: List all offers */}
            <TabPanel>
              <OfferList 
                offers={onboardingOffers}
                configs={offerConfigs}
                onSelect={setSelectedOffer}
              />
            </TabPanel>
            
            {/* Tab 2: Edit selected offer */}
            <TabPanel>
              {selectedOffer ? (
                <OfferEditor 
                  offerType={selectedOffer}
                  definition={getOfferDefinition(selectedOffer)}
                  userConfig={offerConfigs[selectedOffer]}
                  onSave={handleSaveConfig}
                />
              ) : (
                <EmptyState message="Select an offer to configure" />
              )}
            </TabPanel>
            
            {/* Tab 3: Test offer generation */}
            <TabPanel>
              {selectedOffer ? (
                <OfferTester 
                  offerType={selectedOffer}
                  effectiveConfig={getEffectiveOfferConfig(selectedOffer, offerConfigs[selectedOffer])}
                />
              ) : (
                <EmptyState message="Select an offer to test" />
              )}
            </TabPanel>
            
            {/* Tab 4: Preview generated output */}
            <TabPanel>
              {selectedOffer ? (
                <OfferPreview 
                  offerType={selectedOffer}
                  effectiveConfig={getEffectiveOfferConfig(selectedOffer, offerConfigs[selectedOffer])}
                />
              ) : (
                <EmptyState message="Select an offer to preview" />
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </div>
  );
}
```

### OfferEditor Component

```typescript
// components/dashboard/user/offers/OfferEditor/index.tsx

export default function OfferEditor({
  offerType,
  definition,
  userConfig,
  onSave,
}: OfferEditorProps) {
  const [prompt, setPrompt] = useState(userConfig?.overrides?.prompt || definition.buildPrompt.toString());
  const [model, setModel] = useState(userConfig?.overrides?.model || definition.model);
  const [temperature, setTemperature] = useState(userConfig?.overrides?.temperature ?? definition.temperature);
  const [enabled, setEnabled] = useState(userConfig?.enabled ?? true);
  
  const handleSave = async () => {
    const config: OfferConfiguration = {
      offerType,
      enabled,
      overrides: {
        prompt: prompt !== definition.buildPrompt.toString() ? prompt : undefined,
        model: model !== definition.model ? model : undefined,
        temperature: temperature !== definition.temperature ? temperature : undefined,
      },
      metadata: {
        lastModified: new Date(),
        testCount: userConfig?.metadata?.testCount || 0,
        successRate: userConfig?.metadata?.successRate || 0,
      },
    };
    
    await onSave(config);
  };
  
  return (
    <div className="space-y-6">
      {/* Enable/Disable Toggle */}
      <Toggle label="Enable Offer" checked={enabled} onChange={setEnabled} />
      
      {/* Prompt Editor */}
      <PromptEditor 
        defaultPrompt={definition.buildPrompt}
        customPrompt={prompt}
        onChange={setPrompt}
      />
      
      {/* Model Selection */}
      <ModelSelector 
        defaultModel={definition.model}
        selectedModel={model}
        onChange={setModel}
      />
      
      {/* Temperature Slider */}
      <Slider 
        label="Temperature"
        min={0}
        max={1}
        step={0.1}
        value={temperature}
        onChange={setTemperature}
      />
      
      {/* Save Button */}
      <Button onClick={handleSave}>Save Configuration</Button>
    </div>
  );
}
```

### OfferTester Component

```typescript
// components/dashboard/user/offers/OfferTester/index.tsx

export default function OfferTester({
  offerType,
  effectiveConfig,
}: OfferTesterProps) {
  const [testInput, setTestInput] = useState<Record<string, string>>({});
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  
  const handleTest = async () => {
    setTesting(true);
    try {
      // Call generation API with test input
      const response = await fetch('/api/generation/test-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offerType,
          userInput: testInput,
          config: effectiveConfig, // Use effective config (defaults + overrides)
        }),
      });
      
      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setTesting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Test Input Form */}
      <TestInputForm 
        requiredFields={effectiveConfig.inputRequirements.requiredFields}
        optionalFields={effectiveConfig.inputRequirements.optionalFields}
        values={testInput}
        onChange={setTestInput}
      />
      
      {/* Test Button */}
      <Button onClick={handleTest} disabled={testing}>
        {testing ? 'Testing...' : 'Test Offer Generation'}
      </Button>
      
      {/* Test Results */}
      {testResult && (
        <TestResults 
          result={testResult}
          config={effectiveConfig}
        />
      )}
    </div>
  );
}
```

---

## Data Flow

### Onboarding Flow
```
User selects offers in Step 2
    ↓
Stored in Zustand: selectedOffers: ['pdf', 'landingPage']
    ↓
Step 3 validates required fields exist
    ↓
On completion, saved to MongoDB:
{
  selectedOffers: ['pdf', 'landingPage'],
  offers: {} // Empty - no custom configs yet
}
```

### Dashboard Flow
```
User opens Offers section
    ↓
Loads from MongoDB:
- selectedOffers: ['pdf', 'landingPage']
- offers: { pdf: {...}, landingPage: {...} }
    ↓
For each offer:
- Get base definition from registry
- Merge with user config overrides
- Display effective configuration
    ↓
User edits offer settings
    ↓
Saves to MongoDB:
{
  offers: {
    pdf: {
      enabled: true,
      overrides: {
        model: 'claude-3-5-sonnet',
        temperature: 0.8
      }
    }
  }
}
```

### Generation Flow
```
User completes chat
    ↓
API receives: { offerType: 'pdf', userInput: {...} }
    ↓
Get effective config:
- Load base definition
- Load user config from MongoDB
- Merge: effectiveConfig = merge(definition, userConfig)
    ↓
Use effective config for generation:
- effectiveConfig.buildPrompt()
- effectiveConfig.model
- effectiveConfig.temperature
    ↓
Generate and return
```

---

## Key Design Principles

### 1. Separation of Concerns
- **Onboarding**: Simple selection, no configuration
- **Dashboard**: Full configuration, testing, preview

### 2. Defaults + Overrides Pattern
- Base definitions provide sensible defaults
- Users can override specific settings
- System merges intelligently

### 3. Progressive Disclosure
- Onboarding shows only what's needed
- Dashboard reveals full capabilities
- Users aren't overwhelmed initially

### 4. Backward Compatibility
- Existing onboarding selections still work
- New dashboard features are optional
- System degrades gracefully

### 5. Scalability
- Easy to add new offer types
- Dashboard UI adapts to any offer
- No hardcoding per offer type

---

## API Routes Needed

### 1. Get User Offer Configs
```typescript
// GET /api/user/offers
// Returns: { offers: Record<OfferType, OfferConfiguration> }
```

### 2. Save Offer Config
```typescript
// POST /api/user/offers/[offerType]
// Body: OfferConfiguration
// Saves to MongoDB user config document
```

### 3. Test Offer Generation
```typescript
// POST /api/generation/test-offer
// Body: { offerType, userInput, config }
// Returns: { output, metadata, errors }
```

### 4. Preview Offer
```typescript
// POST /api/generation/preview-offer
// Body: { offerType, userInput, config }
// Returns: { preview: LlmOutput }
```

---

## Implementation Checklist

### Phase 1: Onboarding Integration
- [ ] Update `step2Offers.tsx` to use offer definitions
- [ ] Update `validateOfferRequirements.ts` to use definitions
- [ ] Test validation still works
- [ ] Ensure onboarding stores only offer types

### Phase 2: Dashboard Foundation
- [ ] Create `OffersDashboard` component
- [ ] Add to `USER_SECTIONS` in `userDashboard.tsx`
- [ ] Create `OfferList` component
- [ ] Create API route: `GET /api/user/offers`

### Phase 3: Configuration Editor
- [ ] Create `OfferEditor` component
- [ ] Create `PromptEditor` sub-component
- [ ] Create `ModelSelector` sub-component
- [ ] Create API route: `POST /api/user/offers/[offerType]`
- [ ] Implement config merging logic

### Phase 4: Testing & Preview
- [ ] Create `OfferTester` component
- [ ] Create `OfferPreview` component
- [ ] Create API route: `POST /api/generation/test-offer`
- [ ] Create API route: `POST /api/generation/preview-offer`

### Phase 5: Integration
- [ ] Update generation API to use effective configs
- [ ] Test end-to-end flow
- [ ] Add error handling
- [ ] Add loading states

---

## Code Generation Guidelines for Claude

When generating code for this system, ensure:

1. **Two-Tier Awareness**: Code should work in both onboarding (simple) and dashboard (complex) contexts

2. **Default + Override Pattern**: Always provide defaults, allow overrides

3. **Type Safety**: Use TypeScript strictly - offer types, configs, etc.

4. **MongoDB Integration**: Store user configs in user's config document

5. **Error Handling**: Gracefully handle missing configs, invalid overrides, etc.

6. **Progressive Enhancement**: System works with just onboarding selections, dashboard adds features

7. **Scalability**: Code should work for any offer type, not hardcoded

8. **Testing Support**: Include test/preview capabilities in dashboard

9. **User Experience**: Clear UI, helpful errors, loading states

10. **Documentation**: Code should be self-documenting with clear types and interfaces

---

## Example: Complete Flow

### User Journey

1. **Onboarding**:
   - User selects "PDF Guide" and "Home Estimate"
   - System shows: PDF needs `email`, Home Estimate needs `propertyAddress`, `propertyType`, etc.
   - User configures flows with these questions
   - Validation passes, onboarding completes

2. **Dashboard (First Time)**:
   - User opens "Offers" section
   - Sees list: PDF Guide, Home Estimate
   - Both show "Using default settings"
   - User clicks "Configure" on PDF Guide

3. **Dashboard (Configuration)**:
   - User sees default prompt (from definition)
   - User edits prompt to be more personalized
   - User changes model to Claude
   - User adjusts temperature to 0.8
   - User clicks "Test" to try with sample data
   - User sees generated output, satisfied
   - User saves configuration

4. **Generation (Live)**:
   - User's bot generates offer for a lead
   - System loads PDF definition
   - System loads user's custom config
   - System merges: uses custom prompt, Claude model, 0.8 temperature
   - Generates offer with user's customizations
   - Returns to lead

---

## Summary

- **Onboarding**: Simple selection, validation only
- **Dashboard**: Full configuration, testing, preview
- **Architecture**: Defaults + overrides pattern
- **Storage**: MongoDB for user configs
- **Generation**: Merges defaults with user overrides
- **Scalability**: Works for any offer type
- **User Experience**: Progressive disclosure, not overwhelming

