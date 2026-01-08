# Offer Generation Examples

Complete examples showing how to generate each offer type.

---

## Setup

```typescript
import {
  generateOffer,
  getOfferDefinition,
  type PdfOfferOutput,
  type LandingPageOfferOutput,
  type HomeEstimateOfferOutput,
  type VideoOfferOutput,
  type CustomOfferOutput,
} from '@/lib/offers';

// Common context for all examples
const context = {
  userId: 'user-123',
  agentId: 'agent-456',
  flow: 'buy',
  businessName: 'Premier Real Estate',
  qdrantAdvice: [
    'First-time buyers should get pre-approved before house hunting',
    'The local market is competitive with homes selling quickly',
    'Consider getting a home inspection before making an offer',
  ],
};
```

---

## 1. PDF Offer Example

### Input

```typescript
const pdfInput = {
  email: 'john.doe@example.com',
  firstName: 'John',
  lastName: 'Doe',
  propertyAddress: '123 Main Street, Anytown, CA 90210',
  timeline: '3-6 months',
  budget: '$500,000 - $600,000',
};
```

### Generation

```typescript
const pdfDefinition = getOfferDefinition('pdf')!;

const pdfResult = await generateOffer<PdfOfferOutput>(
  pdfDefinition,
  pdfInput,
  context
);

if (pdfResult.success) {
  console.log('PDF Generated Successfully!');
  console.log('Title:', pdfResult.data.title);
  console.log('Sections:', pdfResult.data.sections.length);
  console.log('Page Count:', pdfResult.data.metadata.pageCount);
  console.log('Cost:', `$${pdfResult.metadata.cost.toFixed(4)}`);
  console.log('Tokens:', pdfResult.metadata.tokensUsed);
}
```

### Expected Output Structure

```json
{
  "id": "pdf-1701234567890",
  "type": "pdf",
  "businessName": "Premier Real Estate",
  "flow": "buy",
  "generatedAt": "2024-11-29T12:00:00.000Z",
  "version": "1.0.0",
  "title": "Your Complete Home Buying Guide for Anytown",
  "sections": [
    {
      "heading": "Welcome to Your Home Buying Journey",
      "content": "Dear John, congratulations on taking the first step...",
      "order": 1
    },
    {
      "heading": "Understanding the Anytown Market",
      "content": "The real estate market in Anytown is currently...",
      "order": 2
    },
    {
      "heading": "Your Pre-Approval Checklist",
      "content": "Before you start house hunting, getting pre-approved...",
      "order": 3
    },
    {
      "heading": "Properties in Your Budget Range",
      "content": "With your budget of $500,000-$600,000...",
      "order": 4
    },
    {
      "heading": "Next Steps and Timeline",
      "content": "Based on your 3-6 month timeline...",
      "order": 5
    }
  ],
  "metadata": {
    "pageCount": 5,
    "generatedBy": "AI Assistant"
  }
}
```

---

## 2. Landing Page Offer Example

### Input

```typescript
const landingInput = {
  email: 'sarah.smith@example.com',
  firstName: 'Sarah',
  propertyAddress: '456 Oak Avenue, Riverside, CA 92501',
  propertyType: 'Single Family Home',
  timeline: '1-2 months',
};
```

### Generation

```typescript
const landingDefinition = getOfferDefinition('landingPage')!;

const landingResult = await generateOffer<LandingPageOfferOutput>(
  landingDefinition,
  landingInput,
  context
);

if (landingResult.success) {
  console.log('Landing Page Generated!');
  console.log('Hero Title:', landingResult.data.hero.title);
  console.log('Insights:', landingResult.data.insights.length);
  console.log('Recommendations:', landingResult.data.recommendations.length);
}
```

### Expected Output Structure

```json
{
  "id": "landing-1701234567890",
  "type": "landingPage",
  "businessName": "Premier Real Estate",
  "flow": "buy",
  "generatedAt": "2024-11-29T12:00:00.000Z",
  "version": "1.0.0",
  "hero": {
    "title": "Sarah, Your Dream Home in Riverside Awaits",
    "subtitle": "Personalized guidance to help you find the perfect single family home in 1-2 months",
    "ctaText": "Start Your Journey"
  },
  "summary": {
    "title": "Welcome to Your Personalized Home Search",
    "content": "Sarah, we understand you're looking for a single family home in Riverside and want to move quickly. With your 1-2 month timeline, we've created this personalized guide to help you navigate the market efficiently..."
  },
  "insights": [
    {
      "title": "Fast-Moving Market",
      "description": "Riverside homes are selling within 15-20 days on average",
      "icon": "📊"
    },
    {
      "title": "Competitive Financing",
      "description": "Current interest rates favor buyers who act quickly",
      "icon": "💰"
    },
    {
      "title": "Local Market Expert",
      "description": "We know Riverside neighborhoods inside and out",
      "icon": "🏡"
    }
  ],
  "recommendations": [
    {
      "title": "Get Pre-Approved This Week",
      "description": "With your 1-2 month timeline, getting pre-approved now will make you a competitive buyer...",
      "priority": 1
    },
    {
      "title": "Schedule Neighborhood Tours",
      "description": "Visit different areas of Riverside to find the best fit for your lifestyle...",
      "priority": 2
    },
    {
      "title": "Set Up MLS Alerts",
      "description": "Receive instant notifications when new homes match your criteria...",
      "priority": 3
    }
  ]
}
```

---

## 3. Home Estimate Offer Example

### Input

```typescript
const estimateInput = {
  email: 'mike.jones@example.com',
  propertyAddress: '789 Pine Street, Mountain View, CA 94040',
  propertyType: '3-bedroom house',
  bedrooms: '3',
  bathrooms: '2',
  squareFeet: '1,800',
  yearBuilt: '1985',
};
```

### Generation

```typescript
const estimateDefinition = getOfferDefinition('home-estimate')!;

const estimateResult = await generateOffer<HomeEstimateOfferOutput>(
  estimateDefinition,
  estimateInput,
  { ...context, flow: 'sell' }
);

if (estimateResult.success) {
  console.log('Home Estimate Generated!');
  console.log('Address:', estimateResult.data.propertyAddress);
  console.log('Estimated Value:', 
    `$${estimateResult.data.estimatedValue.low.toLocaleString()} - ` +
    `$${estimateResult.data.estimatedValue.high.toLocaleString()}`
  );
  console.log('Confidence:', `${estimateResult.data.estimatedValue.confidence}%`);
  console.log('Comparables:', estimateResult.data.comparables.length);
}
```

### Expected Output Structure

```json
{
  "id": "estimate-1701234567890",
  "type": "home-estimate",
  "businessName": "Premier Real Estate",
  "flow": "sell",
  "generatedAt": "2024-11-29T12:00:00.000Z",
  "version": "1.0.0",
  "propertyAddress": "789 Pine Street, Mountain View, CA 94040",
  "estimatedValue": {
    "low": 1250000,
    "high": 1400000,
    "confidence": 75,
    "currency": "USD"
  },
  "comparables": [
    {
      "address": "792 Pine Street, Mountain View",
      "soldPrice": 1325000,
      "soldDate": "2024-11-15",
      "similarity": 88,
      "distance": "0.1 miles"
    },
    {
      "address": "1045 Oak Avenue, Mountain View",
      "soldPrice": 1280000,
      "soldDate": "2024-11-01",
      "similarity": 82,
      "distance": "0.3 miles"
    },
    {
      "address": "2301 Elm Drive, Mountain View",
      "soldPrice": 1375000,
      "soldDate": "2024-10-20",
      "similarity": 79,
      "distance": "0.5 miles"
    }
  ],
  "factors": [
    {
      "factor": "Prime Location",
      "impact": "positive",
      "description": "Mountain View is a highly desirable area with excellent schools and tech company proximity"
    },
    {
      "factor": "Property Age",
      "impact": "neutral",
      "description": "Built in 1985, the home is established but may need updates to compete with newer construction"
    },
    {
      "factor": "Market Conditions",
      "impact": "positive",
      "description": "Strong buyer demand in Mountain View is driving prices upward"
    },
    {
      "factor": "Square Footage",
      "impact": "positive",
      "description": "1,800 sq ft is well-suited for families and compares favorably to area averages"
    }
  ],
  "recommendations": [
    "Consider updating the kitchen and bathrooms to maximize sale price",
    "Professional staging can help highlight the home's best features",
    "Price competitively at $1,325,000 to generate multiple offers",
    "List in early spring for maximum buyer activity"
  ],
  "disclaimer": "This estimate is generated by AI based on available market data..."
}
```

---

## 4. Video Offer Example

### Input

```typescript
const videoInput = {
  email: 'lisa.chen@example.com',
  firstName: 'Lisa',
  timeline: 'ASAP',
  budget: '$400,000',
};
```

### Generation

```typescript
const videoDefinition = getOfferDefinition('video')!;

const videoResult = await generateOffer<VideoOfferOutput>(
  videoDefinition,
  videoInput,
  context
);

if (videoResult.success) {
  console.log('Video Script Generated!');
  console.log('Title:', videoResult.data.title);
  console.log('Duration:', `~${videoResult.data.metadata.estimatedDuration} seconds`);
  console.log('Sections:', videoResult.data.sections.length);
  console.log('\nScript Preview:');
  console.log(videoResult.data.script.substring(0, 200) + '...');
}
```

### Expected Output Structure

```json
{
  "id": "video-1701234567890",
  "type": "video",
  "businessName": "Premier Real Estate",
  "flow": "buy",
  "generatedAt": "2024-11-29T12:00:00.000Z",
  "version": "1.0.0",
  "title": "Lisa's Personalized Home Buying Guide",
  "script": "Hi Lisa! Welcome to your personalized video guide. I'm excited to help you find your perfect home...",
  "sections": [
    {
      "timestamp": "0:00",
      "heading": "Welcome",
      "content": "Hi Lisa! Welcome to your personalized video guide. I'm excited to help you find your perfect home with your budget of $400,000.",
      "visualNotes": "Host on camera, warm greeting, professional background"
    },
    {
      "timestamp": "0:20",
      "heading": "Your Urgent Timeline",
      "content": "I understand you want to move quickly, and I'm here to help make that happen. With the right strategy, we can find you a great home fast.",
      "visualNotes": "Show calendar or timeline graphic"
    },
    {
      "timestamp": "0:50",
      "heading": "What $400,000 Gets You",
      "content": "In today's market, your budget opens up some fantastic opportunities. Let me show you what's possible...",
      "visualNotes": "Display property images or neighborhood maps"
    },
    {
      "timestamp": "1:20",
      "heading": "Your Action Plan",
      "content": "Here's what we'll do immediately: First, get you pre-approved. Second, set up your search criteria. Third, schedule showings for this weekend.",
      "visualNotes": "Show checklist with action items"
    },
    {
      "timestamp": "1:50",
      "heading": "Let's Get Started",
      "content": "Lisa, I'm ready to help you make this happen fast. Click below to schedule your consultation and let's find your home!",
      "visualNotes": "Show contact button and host's contact info"
    }
  ],
  "metadata": {
    "estimatedDuration": 150,
    "tone": "professional"
  }
}
```

---

## 5. Custom Offer Example

### Input

```typescript
const customInput = {
  email: 'alex.rivera@example.com',
  firstName: 'Alex',
  customField1: 'Looking for investment properties',
  customField2: 'Interested in multi-family units',
};
```

### Generation with Custom Schema

```typescript
const customDefinition = getOfferDefinition('custom')!;

const customResult = await generateOffer<CustomOfferOutput>(
  customDefinition,
  customInput,
  {
    ...context,
    additionalContext: {
      customSchema: {
        content: {
          headline: 'Investment opportunity headline',
          analysis: 'Market analysis for investors',
          properties: ['Property 1', 'Property 2', 'Property 3'],
          roi: 'Return on investment projections',
        },
      },
      customInstructions: `
        Create an investment-focused analysis for Alex.
        Focus on multi-family properties and ROI potential.
        Include market trends and cash flow projections.
      `,
    },
  }
);

if (customResult.success) {
  console.log('Custom Offer Generated!');
  console.log('Content Keys:', Object.keys(customResult.data.content));
  console.log('Custom Fields:', customResult.data.customFields);
}
```

### Expected Output Structure

```json
{
  "id": "custom-1701234567890",
  "type": "custom",
  "businessName": "Premier Real Estate",
  "flow": "buy",
  "generatedAt": "2024-11-29T12:00:00.000Z",
  "version": "1.0.0",
  "content": {
    "headline": "Multi-Family Investment Opportunities for Alex",
    "analysis": "The current market presents excellent opportunities for multi-family investments...",
    "properties": [
      "4-unit building on Maple Street - 8% cap rate",
      "Duplex in downtown area - Strong rental demand",
      "6-unit complex near university - Stable tenant base"
    ],
    "roi": "Based on current market conditions, multi-family properties in this area are showing 7-10% annual returns..."
  },
  "customFields": {
    "customField1": "Looking for investment properties",
    "customField2": "Interested in multi-family units",
    "processedAt": "2024-11-29T12:00:00.000Z"
  }
}
```

---

## Error Handling

### Handle Generation Failures

```typescript
const result = await generateOffer(definition, userInput, context);

if (!result.success) {
  console.error('Generation failed:', result.error);
  
  // Check if fallback was used
  if (result.fallbackUsed) {
    console.log('Fallback template was returned');
  }
  
  // Show specific errors
  if (result.errors) {
    result.errors.forEach((error) => {
      console.error('- ', error);
    });
  }
  
  // Show metadata
  console.log('Retries:', result.metadata?.retries);
  console.log('Duration:', result.metadata?.duration, 'ms');
}
```

### Validate Before Generation

```typescript
import { validateOfferInputs } from '@/lib/offers';

const validation = validateOfferInputs(
  userInput,
  definition.inputRequirements
);

if (!validation.valid) {
  console.error('Invalid input:');
  console.log('Missing fields:', validation.missing);
  console.log('Invalid fields:', validation.invalid);
  // Don't proceed with generation
  return;
}

// Proceed with generation
const result = await generateOffer(definition, userInput, context);
```

---

## Cost Estimation

### Estimate Before Generating

```typescript
const estimate = definition.estimateCost(
  userInput,
  context,
  definition.outputSchema
);

console.log('Estimated Cost:', formatCostEstimate(estimate));
console.log('Estimated Tokens:', estimate.estimatedTotalTokens);

// Only proceed if within budget
if (estimate.estimatedCostUSD > 0.10) {
  console.warn('Generation will cost more than $0.10');
  // Ask user for confirmation
}
```

---

## Batch Generation

### Generate Multiple Offers

```typescript
async function generateAllOffers(userInput, context) {
  const offerTypes = ['pdf', 'landingPage', 'video'];
  const results = [];

  for (const type of offerTypes) {
    const definition = getOfferDefinition(type);
    if (definition) {
      const result = await generateOffer(definition, userInput, context);
      results.push({ type, result });
    }
  }

  return results;
}

const allResults = await generateAllOffers(userInput, context);

allResults.forEach(({ type, result }) => {
  if (result.success) {
    console.log(`✅ ${type} generated successfully`);
  } else {
    console.error(`❌ ${type} failed: ${result.error}`);
  }
});
```

---

These examples demonstrate all 5 offer types with realistic inputs and outputs!