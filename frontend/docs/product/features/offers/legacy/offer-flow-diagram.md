# Offer Generation Flow Diagram

## High-Level Flow

```
User Completes Chat
    ↓
Extract userInput (mappingKeys → values)
    ↓
Determine Selected Offers (from config)
    ↓
For Each Offer:
    ├─→ Validate Required Inputs
    │   └─→ Missing? → Error/Warning
    │
    ├─→ Get Offer Definition
    │   ├─→ inputRequirements
    │   ├─→ buildPrompt function
    │   ├─→ outputSchema
    │   └─→ outputValidator
    │
    ├─→ Build Prompt
    │   ├─→ Include userInput
    │   ├─→ Include Qdrant advice (if needed)
    │   ├─→ Include market data (if needed)
    │   └─→ Apply prompt template
    │
    ├─→ Call LLM
    │   ├─→ Use offer's model (or default)
    │   ├─→ Use offer's maxTokens
    │   └─→ Use offer's temperature
    │
    ├─→ Parse & Validate Output
    │   ├─→ JSON.parse()
    │   ├─→ Run outputValidator
    │   └─→ Normalize if needed
    │
    ├─→ Post-Process
    │   ├─→ Add metadata (id, timestamps)
    │   ├─→ Format data
    │   └─→ Generate download URLs (if PDF/video)
    │
    └─→ Return Final Output
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                    USER INPUT                           │
│  {                                                      │
│    email: "user@example.com",                          │
│    propertyAddress: "123 Main St",                     │
│    timeline: "0-3",                                    │
│    propertyType: "house"                               │
│  }                                                      │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│              OFFER DEFINITION LOOKUP                     │
│  getOfferDefinition('pdf')                              │
│    → Returns PDF_OFFER_DEFINITION                      │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│              INPUT VALIDATION                            │
│  validateOfferInputs('pdf', userInput)                  │
│    → Checks: requiredFields = ['email'] ✓              │
│    → Returns: { valid: true, missing: [] }              │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│              PROMPT BUILDING                             │
│  offerDef.buildPrompt(userInput, context)               │
│    → Extracts: userName, flow, propertyAddress          │
│    → Fetches: Qdrant advice (if needed)                 │
│    → Builds: Complete prompt string                    │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│              LLM GENERATION                              │
│  openai.chat.completions.create({                       │
│    model: offerDef.model,                              │
│    messages: [{ role: 'user', content: prompt }],      │
│    max_tokens: offerDef.maxTokens,                     │
│    temperature: offerDef.temperature                    │
│  })                                                     │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│              OUTPUT VALIDATION                           │
│  offerDef.outputValidator(rawOutput)                    │
│    → Checks: title, sections, metadata                 │
│    → Returns: { valid: true, normalized: {...} }        │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│              POST-PROCESSING                             │
│  offerDef.postProcess(validatedOutput, userInput)       │
│    → Adds: id, generatedAt, businessName               │
│    → Sorts: sections by order                          │
│    → Returns: Final PdfOfferOutput                      │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│              FINAL OUTPUT                                │
│  {                                                      │
│    id: "pdf-1234567890-abc123",                        │
│    type: "pdf",                                        │
│    title: "Your Complete Guide...",                    │
│    sections: [...],                                     │
│    metadata: { pageCount: 5, ... },                   │
│    generatedAt: "2024-01-15T10:30:00Z"                │
│  }                                                      │
└─────────────────────────────────────────────────────────┘
```

---

## Type Relationships

```
BaseOfferProps (base)
    ├─→ PdfOfferOutput extends BaseOfferProps
    ├─→ LandingPageOfferOutput extends BaseOfferProps
    ├─→ HomeEstimateOfferOutput extends BaseOfferProps
    └─→ VideoOfferOutput extends BaseOfferProps

OfferDefinition<T extends BaseOfferProps>
    ├─→ inputRequirements: InputRequirements
    ├─→ buildPrompt: PromptBuilder
    ├─→ outputSchema: OutputSchema
    ├─→ outputValidator: OutputValidator
    └─→ postProcess?: PostProcessor

InputRequirements
    ├─→ requiredFields: string[]
    ├─→ optionalFields?: string[]
    └─→ fieldValidations?: Record<string, ValidationRule>

OutputSchema
    ├─→ type: 'object'
    ├─→ properties: Record<string, PropertyDefinition>
    └─→ outputType: string (TypeScript type name)
```

---

## Example: Multiple Offers in One Request

```typescript
// User selected: ['pdf', 'landingPage', 'home-estimate']

const results = await Promise.all(
  ['pdf', 'landingPage', 'home-estimate'].map(async (offerType) => {
    const offerDef = getOfferDefinition(offerType);
    
    // Validate inputs
    const inputCheck = validateOfferInputs(offerType, userInput);
    if (!inputCheck.valid) {
      return {
        type: offerType,
        success: false,
        error: 'Missing required inputs',
        missing: inputCheck.missing,
      };
    }
    
    // Generate
    const prompt = offerDef.buildPrompt(userInput, context);
    const output = await generateWithLLM(prompt, offerDef);
    const validated = offerDef.outputValidator(output);
    
    if (!validated.valid) {
      return {
        type: offerType,
        success: false,
        error: 'Invalid output',
        errors: validated.errors,
      };
    }
    
    // Post-process
    const final = offerDef.postProcess
      ? offerDef.postProcess(validated.normalized!, userInput)
      : validated.normalized!;
    
    return {
      type: offerType,
      success: true,
      output: final,
    };
  })
);

// Results:
// [
//   { type: 'pdf', success: true, output: PdfOfferOutput },
//   { type: 'landingPage', success: true, output: LandingPageOfferOutput },
//   { type: 'home-estimate', success: false, error: 'Missing propertyAddress' }
// ]
```

---

## Key Design Decisions

### 1. **Self-Contained Definitions**
Each offer definition is a complete, standalone object. This makes it:
- Easy to test
- Easy to understand
- Easy to modify
- Easy to version

### 2. **Type-Safe Extensions**
Using generics ensures:
- Input validation matches actual input type
- Output type matches what validator expects
- Post-processor receives correct types

### 3. **Flexible Prompt Building**
Prompt builder is a function, allowing:
- Dynamic content based on userInput
- Conditional inclusion of Qdrant advice
- Different prompts for different flows
- Easy A/B testing of prompts

### 4. **Validation at Multiple Stages**
- Input validation (before LLM call)
- Output validation (after LLM call)
- Post-processing (final formatting)

This catches errors early and ensures quality.

### 5. **Registry Pattern**
Central registry makes it:
- Easy to add new offers
- Easy to look up offers
- Easy to iterate over all offers
- Easy to get offer metadata for UI

---

## Future Enhancements

1. **Prompt Templates**: Store prompts in database, allow users to customize
2. **A/B Testing**: Multiple prompt versions per offer
3. **Caching**: Cache generated offers for similar inputs
4. **Versioning**: Track offer definition versions
5. **Analytics**: Track which offers perform best
6. **Preview**: Show offer preview before generation
7. **Templates**: Pre-built offer templates users can customize

