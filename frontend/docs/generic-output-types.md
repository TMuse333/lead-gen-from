# Generic Output Type System

## Overview

The generic output components use a type-safe system that avoids `any` while remaining flexible for various LLM output structures. This document explains the current implementation and how to extend it for production with specific offer types.

## Current Type System

### Core Types (`types/genericOutput.types.ts`)

```typescript
// Primitive values that can appear in LLM output
type PrimitiveValue = string | number | boolean | null | undefined;

// Recursive type for nested structures
type OutputValue = 
  | PrimitiveValue
  | OutputValue[]
  | { [key: string]: OutputValue };

// Base interface for all LLM output components
interface BaseLlmOutputComponent {
  title?: string;
  heading?: string;
  content?: string;
  text?: string;
  message?: string;
  [key: string]: OutputValue; // Flexible for additional properties
}
```

### Type Guards

- `isValidOutputComponent(value: unknown)`: Checks if value is a valid object component
- `isSimpleContent(value: unknown)`: Checks if value has title/heading + content/text/message
- `isKeyValueData(value: unknown)`: Checks if value is a key-value structure

### Why Not `any`?

1. **Type Safety**: `OutputValue` is a recursive union type that covers all valid JSON structures
2. **Type Guards**: Runtime checks ensure type safety before rendering
3. **Extensibility**: Base interface allows extending for specific offer types
4. **Type Narrowing**: TypeScript can narrow types after type guard checks

## Current Implementation

### Generic Components

All components accept `Record<string, OutputValue>` instead of `any`:

- `GenericOutputDisplay`: Renders any nested object structure
- `GenericContentCard`: Renders simple title/content pairs
- `GenericKeyValueList`: Renders key-value data structures

### Results Page

The results page uses type guards to determine which component to render:

```typescript
const isSimple = isSimpleContent(value);
const isKeyValue = !isSimple && isKeyValueData(value);

// TypeScript knows the types after guards
if (isSimple) {
  // value is BaseLlmOutputComponent
} else if (isKeyValue) {
  // value is Record<string, OutputValue>
}
```

## Production: Adding Specific Offer Types

### Step 1: Define Offer-Specific Types

Create a new file for each offer type (e.g., `types/offers/homeEvaluation.types.ts`):

```typescript
import { BaseLlmOutputComponent } from '@/types/genericOutput.types';

/**
 * Home Evaluation Offer Output
 * Generated when user completes a "sell" flow
 */
export interface HomeEvaluationOutput extends BaseLlmOutputComponent {
  estimatedValue: {
    low: number;
    high: number;
    confidence: number;
  };
  comparableHomes: Array<{
    address: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
  }>;
  marketInsights: {
    trend: 'up' | 'down' | 'stable';
    averageDaysOnMarket: number;
    pricePerSquareFoot: number;
  };
  recommendations: string[];
  nextSteps: {
    title: string;
    actions: Array<{
      label: string;
      url?: string;
    }>;
  };
}
```

### Step 2: Create Offer-Specific Components

Create a dedicated component for the offer type:

```typescript
// components/offers/homeEvaluation/HomeEvaluationDisplay.tsx
import { HomeEvaluationOutput } from '@/types/offers/homeEvaluation.types';

interface HomeEvaluationDisplayProps {
  data: HomeEvaluationOutput;
}

export function HomeEvaluationDisplay({ data }: HomeEvaluationDisplayProps) {
  return (
    <div>
      <h2>{data.title}</h2>
      <ValueRange value={data.estimatedValue} />
      <ComparableHomes homes={data.comparableHomes} />
      {/* ... */}
    </div>
  );
}
```

### Step 3: Update LlmOutput Type

Update `types/componentSchema.ts` to include the new offer type:

```typescript
import { HomeEvaluationOutput } from './offers/homeEvaluation.types';
import { PdfGuideOutput } from './offers/pdfGuide.types';
// ... other offer types

export type LlmOutput = {
  // Common components (optional)
  hero?: LlmHeroBannerProps;
  profileSummary?: LlmProfileSummaryProps;
  // ... other common components
  
  // Offer-specific outputs (discriminated union)
  homeEvaluation?: HomeEvaluationOutput;
  pdfGuide?: PdfGuideOutput;
  landingPage?: LandingPageOutput;
  video?: VideoOutput;
  // ... other offers
  
  // Fallback for unknown/legacy formats
  [key: string]: OutputValue | undefined;
};
```

### Step 4: Update Results Page with Type Discrimination

Update the results page to handle specific offer types:

```typescript
// resultsPage.tsx
import { HomeEvaluationDisplay } from '@/components/offers/homeEvaluation/HomeEvaluationDisplay';
import { PdfGuideDisplay } from '@/components/offers/pdfGuide/PdfGuideDisplay';
// ... other offer components

// Type guard for offer types
function isHomeEvaluation(data: unknown): data is HomeEvaluationOutput {
  return (
    typeof data === 'object' &&
    data !== null &&
    'estimatedValue' in data &&
    'comparableHomes' in data
  );
}

// In render:
{outputEntries.map(([key, value]) => {
  // Check for specific offer types first
  if (isHomeEvaluation(value)) {
    return <HomeEvaluationDisplay key={key} data={value} />;
  }
  
  if (isPdfGuide(value)) {
    return <PdfGuideDisplay key={key} data={value} />;
  }
  
  // Fallback to generic components
  if (isSimpleContent(value)) {
    return <GenericContentCard ... />;
  }
  // ... etc
})}
```

### Step 5: Update API Route to Return Typed Output

Update the API route to return the correct type:

```typescript
// app/api/test-component/route.ts
import { HomeEvaluationOutput } from '@/types/offers/homeEvaluation.types';

// In the route handler:
const output: LlmOutput = {
  homeEvaluation: {
    title: "Your Home Evaluation",
    estimatedValue: { low: 500000, high: 600000, confidence: 0.85 },
    // ... rest of the data
  }
};
```

## Migration Strategy

### Phase 1: Current (Flexible)
- ✅ Generic components with `OutputValue` types
- ✅ Type guards for runtime safety
- ✅ Works with any LLM output structure

### Phase 2: Gradual Typing
- Add types for one offer at a time
- Keep generic components as fallback
- Use type guards to route to specific components

### Phase 3: Full Typing
- All offer types have dedicated TypeScript interfaces
- All offer types have dedicated React components
- Generic components only used for truly unknown structures

## Benefits of This Approach

1. **Type Safety**: No `any` types, full TypeScript support
2. **Flexibility**: Generic components handle unknown structures
3. **Gradual Migration**: Can add types incrementally
4. **IntelliSense**: Full autocomplete for typed offer outputs
5. **Runtime Safety**: Type guards ensure correct rendering
6. **Maintainability**: Clear separation between generic and specific components

## Example: Complete Offer Type

```typescript
// types/offers/pdfGuide.types.ts
export interface PdfGuideOutput extends BaseLlmOutputComponent {
  title: string; // Required for PDF guide
  sections: Array<{
    heading: string;
    content: string;
    pageNumber: number;
  }>;
  downloadUrl: string;
  fileSize: number;
  expiresAt: Date;
}

// components/offers/pdfGuide/PdfGuideDisplay.tsx
export function PdfGuideDisplay({ data }: { data: PdfGuideOutput }) {
  return (
    <div>
      <h1>{data.title}</h1>
      {data.sections.map(section => (
        <Section key={section.pageNumber} {...section} />
      ))}
      <DownloadButton url={data.downloadUrl} size={data.fileSize} />
    </div>
  );
}
```

## Best Practices

1. **Always extend `BaseLlmOutputComponent`** for new offer types
2. **Use type guards** before rendering specific components
3. **Keep generic components** as fallback for unknown structures
4. **Document required vs optional fields** in type comments
5. **Use discriminated unions** if offers have overlapping structures
6. **Test type guards** with various input structures

## Type Safety Checklist

- [ ] No `any` types in component props
- [ ] All offer types extend `BaseLlmOutputComponent`
- [ ] Type guards used before type-specific rendering
- [ ] Generic components handle unknown structures
- [ ] TypeScript strict mode enabled
- [ ] All types exported from central location
- [ ] Runtime validation matches TypeScript types

