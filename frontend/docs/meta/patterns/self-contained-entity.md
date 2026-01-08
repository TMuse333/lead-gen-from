# Pattern: Self-Contained Entity

**Category**: Architectural Pattern
**Complexity**: Intermediate
**Information Theory Principle**: Error Prevention via Single Source of Truth

---

## Problem (High Entropy State)

You have **two or more systems that must stay synchronized** but are configured independently:

```
System A                          System B
────────                          ────────
Configuration:                    Configuration:
  - Field X                         - Expects field Y
  - Field Z                         - Expects field Z

Problem: X ≠ Y → Validation failure
         User can break sync by editing A without updating B
```

**Symptoms**:
- Validation errors between systems
- "Missing field" errors despite user providing data
- Configuration works initially but breaks after edits
- Complex validation logic trying to keep systems in sync
- Documentation warning users to "make sure X matches Y"

**Information Theory Analysis**:
- High configuration entropy (many ways to configure, many invalid)
- Channel capacity mismatch (output of A doesn't match input of B)
- Signal loss at system boundary
- Reactive error correction (validation) rather than proactive prevention

---

## Solution (Low Entropy State)

**Merge the systems into a self-contained entity that owns all its requirements.**

```
Self-Contained Entity
─────────────────────
Configuration:
  - Requirements (what it needs)
  - Extraction (how to get it)
  - Processing (what to do with it)

Result: Cannot mismatch with itself
        Validation unnecessary (self-consistent)
```

**Key Principles**:
1. **Single Source of Truth**: One entity declares both needs and means
2. **Zero External Dependencies**: No coupling to external configuration
3. **Self-Consistency**: Entity cannot be in invalid state
4. **No Validation Needed**: Errors are impossible, not just detectable

---

## Information Theory Principles

### 1. Entropy Reduction

**Before** (Two systems):
```
H_total = H(system_A) + H(system_B) + H(synchronization)

Where:
  H(system_A) = entropy of configuring A
  H(system_B) = entropy of configuring B
  H(synchronization) = entropy of keeping them in sync (UNBOUNDED)

Many configurations are invalid (high invalid state entropy)
```

**After** (Self-contained):
```
H_total = H(entity)

Where:
  H(entity) = entropy of configuring the single entity
  H(invalid states) = 0 (all configurations valid)

Significantly lower total entropy
```

### 2. Channel Capacity Unification

**Before**: Two-channel architecture (lossy)
```
System A (Extraction) → [Handoff] → System B (Processing)
                           ↓
                    Information loss possible
```

**After**: Single-channel architecture (lossless)
```
Self-Contained Entity
  ├─ Extraction
  └─ Processing
       ↓
  No handoff, no loss
```

### 3. Error Prevention vs Detection

**Before**: Reactive error correction
```
User configures → Validation checks → Error detected → User fixes

Cost: Validation logic + User effort + Time
Reliability: Depends on validation coverage
```

**After**: Proactive error prevention
```
User configures → Self-consistent by design

Cost: Zero (no validation needed)
Reliability: 100% (errors impossible)
```

**Information Theory**: This is equivalent to using **constrained codes** in error correction theory. By restricting the set of valid messages to only self-consistent ones, you eliminate the need for error detection codes entirely.

---

## Implementation

### Anti-Pattern (Before)

```typescript
// System A: Offer requirements
interface OfferDefinition {
  type: string;
  requiredFields: string[];  // ['email', 'location', 'timeline']
}

// System B: Conversation questions (separate file/store)
interface ConversationFlow {
  questions: Question[];
}

interface Question {
  mappingKey: string;  // 'propertyLocation' ← MISMATCH with 'location'
  text: string;
}

// Problem: requiredFields and mappingKeys can diverge
// Validation needed but easily bypassed
```

### Pattern (After)

```typescript
// Self-Contained: Offer owns its questions
interface OfferTemplate {
  type: string;

  // Defines both what it needs AND how to get it
  questions: QuestionTemplate[];

  // Processing uses fields from its own questions
  buildPrompt: (userInput: Record<string, string>) => string;
}

interface QuestionTemplate {
  mappingKey: string;       // Internal, fixed
  text: string;
  required: boolean;
}

// Example
const homeEstimateOffer: OfferTemplate = {
  type: 'home-estimate',

  questions: [
    { mappingKey: 'email', text: 'Your email?', required: true },
    { mappingKey: 'propertyAddress', text: 'Property address?', required: true },
    { mappingKey: 'propertyType', text: 'Property type?', required: true },
  ],

  buildPrompt: (userInput) => {
    // Uses its own mappingKeys - guaranteed to exist
    return `Generate estimate for:
      Email: ${userInput.email}
      Address: ${userInput.propertyAddress}
      Type: ${userInput.propertyType}
    `;
  },
};

// Benefit: Cannot mismatch with itself, validation unnecessary
```

---

## Real-World Example: Offer Generation System

### Context

A chatbot asks users questions, then generates personalized offers. Originally:
- **System A**: Conversation flows with questions (mappingKeys: 'propertyLocation')
- **System B**: Offer requirements (requiredFields: 'location')
- **Problem**: 'propertyLocation' ≠ 'location' → 100% validation failure

### Before (Two Systems)

```typescript
// src/stores/conversationConfig/defaults/flow.sell.ts
export const sellFlow: ConversationFlow = {
  questions: [
    { id: 'loc', mappingKey: 'propertyLocation', text: 'Where is your property?' },
    { id: 'email', mappingKey: 'email', text: 'Your email?' },
  ],
};

// src/lib/offers/offerRequirements.ts
export const OFFER_REQUIREMENTS = {
  'home-estimate': {
    requiredFields: ['location', 'email'],  // ← 'location' vs 'propertyLocation'
  },
};

// Result: Validation failure when offer generation runs
```

### After (Self-Contained)

```typescript
// src/lib/offers/templates/homeEstimate.template.ts
export const homeEstimateTemplate: OfferTemplate = {
  type: 'home-estimate',

  // Offer owns its questions
  intentQuestions: {
    sell: [
      {
        id: 'loc',
        mappingKey: 'propertyAddress',  // Fixed internally
        defaultQuestion: 'Where is your property?',
        required: true,
        inputType: 'text',
      },
      {
        id: 'email',
        mappingKey: 'email',
        defaultQuestion: 'Your email?',
        required: true,
        inputType: 'email',
      },
    ],
  },

  // Uses its own mappingKeys
  buildPrompt: (userInput, context) => {
    return `Generate home estimate for:
      Address: ${userInput.propertyAddress}
      Email: ${userInput.email}
    `;
  },

  // Validation unnecessary - guaranteed to have all fields
};

// Benefit: Impossible for mappingKeys to mismatch with requirements
```

---

## When to Use

### ✅ Use Self-Contained Entity When:

1. **Tight Coupling Exists**
   - Two systems must always stay in sync
   - Changes to A require changes to B
   - Validation between them is complex

2. **Validation is Complex**
   - You have cross-system validation logic
   - Validation rules are fragile
   - Documentation warns users about sync issues

3. **Configuration Errors Are Common**
   - Users report "missing field" errors
   - Onboarding requires validation step
   - Edits break previously working configuration

4. **Information Flows Directly**
   - System A's output is System B's input
   - No transformation needed between systems
   - One-to-one mapping of concepts

### ❌ Don't Use When:

1. **Systems Are Loosely Coupled**
   - A and B can evolve independently
   - Many-to-many relationships exist
   - Different update frequencies

2. **Transformation Layer Needed**
   - A's output must be transformed for B
   - Multiple consumers with different needs
   - Normalization/adaptation required

3. **Separation of Concerns Critical**
   - Systems owned by different teams
   - Different deployment cycles
   - Need independent testing

---

## Variations

### Variation 1: Multi-Intent Self-Contained Entity

When entity has different requirements based on context:

```typescript
interface MultiIntentOffer {
  supportedIntents: Intent[];

  // Questions per intent (still self-contained)
  intentQuestions: Record<Intent, QuestionTemplate[]>;

  buildPrompt: (userInput, intent) => {
    // Uses questions from intentQuestions[intent]
  };
}

// Example
const timelineOffer: MultiIntentOffer = {
  supportedIntents: ['buy', 'sell', 'browse'],

  intentQuestions: {
    buy: [
      { mappingKey: 'budget', text: 'Your budget?', required: true },
      { mappingKey: 'location', text: 'Where to buy?', required: true },
    ],
    sell: [
      { mappingKey: 'propertyType', text: 'Property type?', required: true },
      { mappingKey: 'location', text: 'Property location?', required: true },
    ],
  },

  buildPrompt: (userInput, intent) => {
    if (intent === 'buy') {
      return `Timeline for buying: ${userInput.budget}, ${userInput.location}`;
    } else {
      return `Timeline for selling: ${userInput.propertyType}, ${userInput.location}`;
    }
  },
};
```

### Variation 2: Registry of Self-Contained Entities

For runtime selection:

```typescript
// Registry of self-contained offers
const offerTemplateRegistry: Record<OfferType, OfferTemplate> = {
  'home-estimate': homeEstimateTemplate,
  'real-estate-timeline': timelineTemplate,
  'pdf-buyer-guide': pdfBuyerTemplate,
};

// Runtime: Merge questions from enabled offers
function getQuestionsForIntent(
  enabledOffers: OfferType[],
  intent: Intent
): QuestionTemplate[] {
  const questions: QuestionTemplate[] = [];
  const seen = new Set<string>();

  for (const offerType of enabledOffers) {
    const template = offerTemplateRegistry[offerType];
    const intentQuestions = template.intentQuestions[intent] || [];

    for (const q of intentQuestions) {
      // Deduplicate by mappingKey
      if (!seen.has(q.mappingKey)) {
        questions.push(q);
        seen.add(q.mappingKey);
      }
    }
  }

  return questions;
}

// All questions are guaranteed to match requirements of their offers
```

---

## Benefits

### Information Theory Benefits

| Benefit | Before | After | Improvement |
|---------|--------|-------|-------------|
| **Configuration Entropy** | H(A) + H(B) + H(sync) | H(entity) | ~50-70% reduction |
| **Invalid States** | Many possible | Zero | 100% reduction |
| **Signal-to-Noise Ratio** | Low (mismatches) | ~100% | Lossless transmission |
| **Error Rate** | Variable (validation-dependent) | 0% | Errors impossible |
| **Validation Overhead** | High (complex logic) | Zero | 100% reduction |

### Practical Benefits

1. **Simpler Code**: No validation logic needed
2. **Fewer Bugs**: Mismatches impossible by design
3. **Easier Maintenance**: One place to update
4. **Better UX**: No configuration errors to explain to users
5. **Faster Development**: No cross-system synchronization code

---

## Trade-Offs

### Advantages ✅

- **Eliminates validation errors** (impossible vs detectable)
- **Reduces configuration entropy** (fewer moving parts)
- **Improves reliability** (self-consistency guaranteed)
- **Simplifies mental model** (one concept vs two)
- **Easier testing** (no cross-system edge cases)

### Disadvantages ❌

- **Less flexibility** (can't mix and match as freely)
- **Potential duplication** (if multiple entities need similar things)
- **Larger entity size** (combines responsibilities)
- **Migration effort** (refactoring existing systems)

### When Trade-Offs Are Acceptable

The disadvantages are acceptable when:
- Flexibility causing more problems than it solves
- Duplication is minimal or manageable
- Entity size stays reasonable (< 500 lines)
- Migration is one-time cost with ongoing benefits

---

## Related Patterns

### Complementary Patterns

- **Classification vs Configuration**: Intent is classification, entities are self-contained
- **Question Deduplication**: Multiple entities share fields → merge at runtime
- **Single Source of Truth**: Broader principle, this is specific application

### Alternative Patterns

- **Adapter Pattern**: If systems must stay separate, add normalization layer
- **Mediator Pattern**: Coordinate between systems without merging
- **Validation Layer**: Add defensive checks (reactive, not proactive)

### When to Use Alternatives

- **Adapter**: Systems owned by different teams, must stay separate
- **Mediator**: More than 2 systems involved, complex orchestration
- **Validation**: Quick fix, architectural change not feasible

---

## Anti-Patterns to Avoid

### ❌ Anti-Pattern 1: Validation Theater

```typescript
// Don't: Add validation but don't fix root cause
function validateSync(offerReqs: string[], conversationKeys: string[]): boolean {
  // Complex validation logic
  return offerReqs.every(req => conversationKeys.includes(req));
}

// Still possible to break after validation passes
```

**Why Wrong**: Validation is reactive, doesn't prevent future breakage

**Fix**: Merge systems so validation is unnecessary

### ❌ Anti-Pattern 2: Weak References

```typescript
// Don't: Reference other system's config
interface OfferDefinition {
  requiredFields: string[];  // "Make sure these match conversation mappingKeys"
}

// User responsibility to maintain sync
```

**Why Wrong**: Relies on user discipline, documentation warnings

**Fix**: Entity owns what it needs, no external references

### ❌ Anti-Pattern 3: Shared Constants

```typescript
// Don't: Shared constants as "solution"
const FIELD_NAMES = {
  EMAIL: 'email',
  LOCATION: 'location',
};

// Both systems use FIELD_NAMES, but still separate configuration
```

**Why Wrong**: Shared constants don't prevent independent configuration

**Fix**: Merge configuration into single entity

---

## Testing Strategy

### Unit Tests

```typescript
describe('Self-Contained OfferTemplate', () => {
  it('should have all buildPrompt fields in questions', () => {
    const template = homeEstimateTemplate;

    // Extract mappingKeys from questions
    const availableKeys = new Set(
      template.questions.map(q => q.mappingKey)
    );

    // Mock userInput with all question fields
    const mockInput: Record<string, string> = {};
    template.questions.forEach(q => {
      mockInput[q.mappingKey] = 'test-value';
    });

    // Should not throw (all fields available)
    expect(() => template.buildPrompt(mockInput, {})).not.toThrow();
  });

  it('should not reference fields not in questions', () => {
    const template = homeEstimateTemplate;
    const availableKeys = template.questions.map(q => q.mappingKey);

    // Static analysis or runtime check
    const promptCode = template.buildPrompt.toString();
    const referencedFields = extractReferencedFields(promptCode);

    referencedFields.forEach(field => {
      expect(availableKeys).toContain(field);
    });
  });
});
```

### Integration Tests

```typescript
it('should generate offer successfully with self-contained entity', async () => {
  const template = homeEstimateTemplate;

  // Get questions
  const questions = template.questions;

  // Collect user input (simulate conversation)
  const userInput: Record<string, string> = {};
  questions.forEach(q => {
    userInput[q.mappingKey] = getMockAnswerFor(q);
  });

  // Generate offer (should never fail validation)
  const prompt = template.buildPrompt(userInput, {});
  const result = await generateWithLLM(prompt);

  expect(result).toBeDefined();
  expect(result.error).toBeUndefined();
});
```

---

## Migration Guide

### Step 1: Identify Coupled Systems

Look for:
- Cross-system validation logic
- "Make sure X matches Y" in documentation
- Validation errors between systems
- Configuration in multiple places for same feature

### Step 2: Analyze Dependencies

```typescript
// Before migration, map the relationship
System A provides: [field1, field2, field3]
System B requires: [field1, field2, field4]  ← Mismatch at field4

Decision: Which system should own the requirements?
Answer: Usually the consumer (B), because it knows what it needs
```

### Step 3: Create Self-Contained Entity

```typescript
// Merge A and B
interface SelfContainedEntity {
  // From B: What is needed
  requirements: Requirement[];

  // From A: How to get it (reframed as part of requirements)
  extractionMethod: (input) => output;

  // From B: What to do with it
  processingMethod: (output) => result;
}
```

### Step 4: Migrate Configuration

```typescript
// Old config
const oldOfferConfig = { requiredFields: ['email', 'location'] };
const oldConversationConfig = {
  questions: [
    { mappingKey: 'email', ... },
    { mappingKey: 'propertyLocation', ... },  // Mismatch!
  ]
};

// New config (merged)
const newOfferTemplate = {
  questions: [
    { mappingKey: 'email', ... },
    { mappingKey: 'location', ... },  // Fixed
  ],
  buildPrompt: (userInput) => {
    // Uses userInput.email, userInput.location
  },
};
```

### Step 5: Remove Validation

```typescript
// Delete this
function validateOfferRequirements(offer, conversation) {
  // Complex validation logic...
}

// No longer needed - self-consistency guaranteed
```

---

## Conclusion

The Self-Contained Entity pattern applies a fundamental information theory principle: **The best error correction is error prevention.**

By merging coupled systems into self-contained entities:
- Configuration errors become **impossible** (not just detectable)
- System complexity **reduces** (fewer moving parts)
- Reliability **increases** (self-consistency guaranteed)
- Development **accelerates** (no validation logic needed)

**When to use**: Anytime you find yourself writing validation logic to keep two systems in sync, consider whether they should be one system instead.

**Information Theory Insight**: Self-contained entities are the software equivalent of **constrained codes** in error correction—by restricting the configuration space to only valid states, you eliminate the need for error detection entirely.
