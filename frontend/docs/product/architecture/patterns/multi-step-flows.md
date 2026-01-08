# Multi-Step Flows Pattern

## Overview

The multi-step flow pattern allows you to break complex user journeys into manageable, sequential steps. Each step is a separate component, with shared state and navigation logic managed centrally.

## When to Use

- User onboarding flows
- Complex form submissions (e.g., project initialization)
- Multi-stage processes (e.g., payment → repo creation)
- Wizard-style interfaces
- Any process requiring 3+ sequential steps

## Implementation

### 1. Define Steps

```typescript
const steps = [
  { id: 1, label: "Form", icon: FileText },
  { id: 2, label: "Images", icon: Image },
  { id: 3, label: "Generate Preview", icon: Eye },
];
```

### 2. Create Step Components

Each step is a separate component:

```typescript
// formStep.tsx
export default function FormStep() {
  // Step-specific logic
  return <div>Form content</div>;
}
```

### 3. Create Flow Orchestrator

```typescript
// initializeProjectFlow.tsx
export default function InitializeProjectFlow() {
  const [currentStep, setCurrentStep] = useState(1);
  
  const renderStep = () => {
    switch (currentStep) {
      case 1: return <FormStep />;
      case 2: return <ImageUploadStep />;
      case 3: return <GeneratePreviewStep />;
      default: return null;
    }
  };
  
  return (
    <div>
      <StepIndicator steps={steps} currentStep={currentStep} />
      {renderStep()}
      <NavigationButtons 
        onNext={handleNext}
        onPrevious={handlePrevious}
      />
    </div>
  );
}
```

## Code Examples

### Real Example: Project Initialization Flow

**File:** `frontend/src/components/ui/initializeProject/initializeProjectFlow.tsx`

```typescript
const initializeSteps = [
  { id: 1, label: "Form", icon: FileText },
  { id: 2, label: "Images", icon: Image },
  { id: 3, label: "Generate Preview", icon: Eye },
];

export default function InitializeProjectFlow() {
  const [currentStep, setCurrentStep] = useState(1);
  
  const handleNext = () => {
    if (currentStep < initializeSteps.length) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const renderStep = () => {
    switch (currentStep) {
      case 1: return <FormStep />;
      case 2: return <ImageUploadStep />;
      case 3: return <GeneratePreviewStep />;
      default: return null;
    }
  };
  
  return (
    <div className="flow-container">
      <StepProgress steps={initializeSteps} currentStep={currentStep} />
      <div className="step-content">
        {renderStep()}
      </div>
      <StepNavigation 
        currentStep={currentStep}
        totalSteps={initializeSteps.length}
        onNext={handleNext}
        onPrevious={handlePrevious}
      />
    </div>
  );
}
```

## Key Components

### Step Indicator
Shows progress through the flow with visual indicators.

### Step Navigation
Previous/Next buttons with conditional logic (disable on first/last step).

### Step State Management
- Local state for current step
- Shared state (Zustand/Context) for form data
- Validation before step progression

## Common Pitfalls

1. **Not validating before step progression**
   - Always validate current step before allowing `next`
   - Show error messages inline

2. **Losing state between steps**
   - Use Zustand or Context to persist data
   - Don't rely only on local component state

3. **Not handling edge cases**
   - What if user refreshes mid-flow?
   - What if they navigate away?
   - Consider using `sessionStorage` for recovery

4. **Too many steps**
   - If you have 7+ steps, consider breaking into sub-flows
   - Group related steps together

## Variations

### Conditional Steps
Some steps may be optional or conditional:

```typescript
const getSteps = (userType: string) => {
  const baseSteps = [step1, step2];
  if (userType === 'premium') {
    return [...baseSteps, premiumStep];
  }
  return baseSteps;
};
```

### Async Step Completion
Steps that require API calls:

```typescript
const handleNext = async () => {
  setLoading(true);
  try {
    await validateCurrentStep();
    await saveStepData();
    setCurrentStep(currentStep + 1);
  } catch (error) {
    showError(error);
  } finally {
    setLoading(false);
  }
};
```

### Branching Flows
Different paths based on user choices:

```typescript
const getNextStep = (currentStep: number, userChoice: string) => {
  if (currentStep === 2 && userChoice === 'skip') {
    return 4; // Skip step 3
  }
  return currentStep + 1;
};
```

## Related Patterns

- [Form Processing Pipeline](./form-processing-pipeline.md) - Often used together
- [State Management](./state-management.md) - Managing flow state
- [Modal Patterns](./modal-patterns.md) - Can be used in modal context

## See Also

- [MULTI_COMPONENT_FLOW_PATTERN.md](../../MULTI_COMPONENT_FLOW_PATTERN.md) - Original detailed documentation