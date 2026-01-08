# Pattern: Classification vs Configuration

**Category**: Architectural Pattern
**Complexity**: Beginner-Intermediate
**Information Theory Principle**: Classification reduces entropy, configuration increases it

---

## Problem (High Entropy State)

You've made something **configurable** when it should just be **classification**:

```
Configuration (High Entropy):
User must:
  - Define the thing
  - Customize its behavior
  - Set its parameters
  - Ensure it's valid

Many possible configurations, many invalid
```

**vs**

```
Classification (Low Entropy):
User must:
  - Choose from predefined options

Few options, all valid
```

**Symptoms**:
- Users configure something that rarely needs customization
- Most configurations are just slight variations of defaults
- Validation is needed to ensure configurations are valid
- Documentation has long "how to configure X" sections
- Users ask "what should I set this to?"

**Information Theory Analysis**:
- Configuration entropy: Unbounded (user can set anything)
- Classification entropy: log₂(N) where N = number of categories
- Invalid state probability: High (configuration) vs Zero (classification)

---

## Solution (Low Entropy State)

**Recognize when choice should be classification, not configuration.**

**Classification**: Selecting from predefined, mutually exclusive categories
**Configuration**: Customizing behavior within a category

```
Before (Configuration):
User configures: Question order, text, mappingKeys, validation, buttons
Result: Unbounded entropy, many invalid states

After (Classification):
User selects: Buy intent | Sell intent | Browse intent
Result: log₂(3) = 1.58 bits, zero invalid states
```

---

## Information Theory Principles

### 1. Entropy: Classification vs Configuration

**Classification**:
```
H = log₂(N)

Where N = number of categories

Examples:
- Intent (buy/sell/browse): H = log₂(3) ≈ 1.58 bits
- Day of week: H = log₂(7) ≈ 2.81 bits
- Color theme (light/dark): H = log₂(2) = 1 bit

Entropy is BOUNDED and LOW
```

**Configuration**:
```
H = log₂(N₁) + log₂(N₂) + ... + log₂(Nₖ)

Where Nᵢ = possible values for parameter i

Examples:
- Question flow: log₂(order) + log₂(text) + log₂(mappingKeys) + ...
- RGB color: log₂(256) + log₂(256) + log₂(256) = 24 bits
- Database config: log₂(host) + log₂(port) + log₂(credentials) + ...

Entropy is UNBOUNDED and HIGH
```

**Key Insight**: Configuration entropy grows multiplicatively with parameters. Classification entropy is fixed by category count.

### 2. Invalid States

**Classification**:
```
Invalid states = 0 (assuming categories are predefined and tested)

Example:
  Intent ∈ {buy, sell, browse}
  All three options are valid
  User cannot create invalid intent
```

**Configuration**:
```
Invalid states = Total possible configurations - Valid configurations

Example:
  Question flow configuration:
  Total configs ≈ 10^6 (many parameters)
  Valid configs ≈ 10^4 (most break something)
  Invalid states ≈ 99% of configuration space
```

### 3. Filtering vs Generating Options

**Classification**: Filtering operation (reduces entropy)
```
All possible entities → Filter by classification → Subset of entities

Example:
  All offers → Filter by intent='sell' → Seller offers only

Information preserved: 100%
Entropy reduced: By removing irrelevant options
```

**Configuration**: Generative operation (increases entropy)
```
No initial state → User creates configuration → New entity

Example:
  Empty flow → User adds questions, mappingKeys → Custom flow

Information generated: User must provide
Entropy increased: By adding parameters
```

**Key Insight**: Filtering is lossless (just removes irrelevant info). Generation requires user to provide information, increasing cognitive load.

---

## Implementation

### Anti-Pattern (Before): Configuration

```typescript
// Making "flow" configurable
interface ConversationFlow {
  id: string;
  label: string;
  questions: Question[];  // User can add/remove/reorder
  branching: BranchLogic;  // User can customize
  validation: ValidationRules;  // User can define
  // ... many more configuration options
}

// User must configure all of this
const buyFlow: ConversationFlow = {
  id: 'buy',
  label: 'Buyer Flow',
  questions: [
    // User manually configures each question
    { id: 'q1', mappingKey: 'budget', text: 'Your budget?', ... },
    { id: 'q2', mappingKey: 'location', text: 'Where to buy?', ... },
    // ... many more questions
  ],
  branching: { /* complex logic */ },
  validation: { /* complex rules */ },
};

// Problem:
// - High entropy (many parameters to configure)
// - Many invalid configurations possible
// - User must understand system internals
// - Difficult to maintain (changes break user configs)
```

### Pattern (After): Classification

```typescript
// "Intent" is just classification
type Intent = 'buy' | 'sell' | 'browse';

// Offers declare which intents they support
interface OfferTemplate {
  supportedIntents: Intent[];  // Classification, not configuration

  // Questions are predefined per intent (hardcoded, tested)
  intentQuestions: Record<Intent, QuestionTemplate[]>;
}

// Example
const homeEstimateOffer: OfferTemplate = {
  supportedIntents: ['sell'],  // Only for sellers (classification)

  intentQuestions: {
    sell: [
      // Predefined, optimized questions (not user-configured)
      { mappingKey: 'propertyAddress', text: 'Property address?', ... },
      { mappingKey: 'propertyType', text: 'Property type?', ... },
    ],
  },
};

// Runtime: User's intent filters which offers apply
function getApplicableOffers(
  allOffers: OfferTemplate[],
  userIntent: Intent
): OfferTemplate[] {
  return allOffers.filter(offer =>
    offer.supportedIntents.includes(userIntent)
  );
}

// Benefits:
// - Low entropy (user just classifies intent: log₂(3) bits)
// - Zero invalid states (all intents are valid)
// - User doesn't need technical knowledge
// - System maintains question quality
```

---

## Real-World Example: Intent-Based Offers

### Context

A chatbot asks questions based on user's intent (buy/sell/browse a home). Originally, "flow" was a configurable entity. Now it's just classification.

### Before (Flow as Configuration)

```typescript
// User could configure flows
interface ConversationFlow {
  id: 'buy' | 'sell' | 'browse';
  questions: Question[];
  // ... many configuration options
}

// User dashboard: "Configure Buy Flow"
// User must:
// 1. Add questions
// 2. Set mappingKeys
// 3. Define button options
// 4. Set validation rules
// 5. Ensure it matches offer requirements

// Problems:
// - User doesn't know what questions to ask
// - mappingKeys might not match offers
// - Validation rules might be wrong
// - Configuration can break after system updates

// Entropy: ~10-15 bits of configuration per flow
```

### After (Intent as Classification)

```typescript
// Intent is just a category
type Intent = 'buy' | 'sell' | 'browse';

// System automatically determines questions based on:
// 1. User's intent (classification)
// 2. Enabled offers (simple boolean flags)

// Example
const userIntent: Intent = classifyUserIntent(firstMessage);
// userIntent = 'sell'

const enabledOffers = ['home-estimate', 'real-estate-timeline'];

const questions = getQuestionsForIntent(enabledOffers, userIntent);
// Returns merged questions from all enabled offers that support 'sell'

// User dashboard: Just enable/disable offers (no flow configuration)
// User doesn't configure questions at all

// Benefits:
// - User just classifies what they want (buy/sell/browse)
// - System determines optimal questions automatically
// - Impossible to misconfigure
// - Updates improve all users' experiences

// Entropy: log₂(3) ≈ 1.58 bits
```

---

## When to Use

### ✅ Use Classification When:

1. **Limited Distinct Use Cases**
   - User needs fit into discrete categories
   - Categories are mutually exclusive
   - Edge cases are rare
   - Example: Intent (buy/sell/browse), not unlimited custom intents

2. **Customization Rarely Needed**
   - Most users use defaults
   - Customization doesn't add value
   - Complexity of configuration > value gained
   - Example: Question order (optimal order is known)

3. **Quality Control Matters**
   - You can optimize for each category
   - User-generated configs often suboptimal
   - Testing is easier with fixed categories
   - Example: Predefined questions are A/B tested and proven

4. **Reducing User Cognitive Load**
   - Users aren't experts in the domain
   - Configuration requires technical knowledge
   - Simpler choice → better UX
   - Example: Real estate agents, not UX designers

### ✅ Use Configuration When:

1. **Genuinely Unlimited Use Cases**
   - Can't predict all user needs
   - Categories would number in hundreds
   - Customization is the core value proposition
   - Example: Color themes (many valid combinations)

2. **Customization Often Needed**
   - Most users need to customize
   - Defaults don't fit most use cases
   - Value of flexibility > complexity cost
   - Example: Branding (business name, logo, colors)

3. **Expert Users**
   - Users understand the domain
   - Configuration is expected
   - Power users demand flexibility
   - Example: Database connection strings

---

## Decision Tree

```
Is there a finite set of common use cases?
│
├─ Yes → Can they be discrete categories?
│   │
│   ├─ Yes → Would predefined solutions work for 90%+ of users?
│   │   │
│   │   ├─ Yes → USE CLASSIFICATION ✅
│   │   │
│   │   └─ No → USE CONFIGURATION
│   │
│   └─ No → USE CONFIGURATION
│
└─ No → USE CONFIGURATION
```

**Examples**:

- **Intent (buy/sell/browse)**: Finite categories → 90%+ coverage → Classification ✅
- **Question flow**: Finite categories → Predefined works → Classification ✅
- **Business name**: Unlimited values → Must configure → Configuration ✅
- **Color scheme**: Finite (light/dark) or unlimited (RGB)? → Depends on product

---

## Variations

### Variation 1: Classification with Light Customization

Allow classification + minor tweaks:

```typescript
interface OfferTemplate {
  supportedIntents: Intent[];  // Classification

  intentQuestions: Record<Intent, QuestionTemplate[]>;

  // Allow light customization
  customizable?: {
    questionWording?: boolean;  // User can tweak text
    personality?: boolean;      // User can set tone
  };
}

// Example
const offer: OfferTemplate = {
  supportedIntents: ['sell'],

  intentQuestions: {
    sell: [
      {
        mappingKey: 'email',
        defaultQuestion: 'What is your email?',  // Default
        // User can customize: "Where should I send your estimate?"
      },
    ],
  },

  customizable: {
    questionWording: true,  // Allow tweaking
    personality: true,      // Allow tone setting
  },
};

// Benefit: 90% is predefined (low entropy), 10% customizable (adds value)
```

### Variation 2: Hierarchical Classification

Classify at multiple levels:

```typescript
// Level 1: Intent (buy/sell/browse)
// Level 2: Property type (house/condo/land)
// Level 3: Timeline (0-3mo, 3-6mo, 6-12mo, 12+mo)

interface HierarchicalClassification {
  intent: Intent;               // log₂(3) bits
  propertyType: PropertyType;   // log₂(4) bits
  timeline: Timeline;           // log₂(4) bits
}

// Total entropy: ~3.9 bits (very low)
// Result: Offers filtered by all three classifications

function getApplicableOffers(classification: HierarchicalClassification) {
  return offers.filter(offer =>
    offer.supportedIntents.includes(classification.intent) &&
    offer.supportedPropertyTypes.includes(classification.propertyType) &&
    offer.supportedTimelines.includes(classification.timeline)
  );
}
```

### Variation 3: Configuration per Classification

Different configuration allowed per category:

```typescript
interface OfferTemplate {
  supportedIntents: Intent[];

  // Different configuration options per intent
  intentConfig: Record<Intent, IntentSpecificConfig>;
}

const offer: OfferTemplate = {
  supportedIntents: ['buy', 'sell'],

  intentConfig: {
    buy: {
      questions: buyQuestions,      // Predefined for buy
      customizable: { tone: true }, // Only tone customizable
    },
    sell: {
      questions: sellQuestions,     // Different for sell
      customizable: { wording: true, tone: true }, // More customization
    },
  },
};
```

---

## Benefits

### Information Theory Benefits

| Metric | Configuration | Classification | Improvement |
|--------|--------------|----------------|-------------|
| **Entropy** | 10-15 bits | 1.58 bits | ~90% reduction |
| **Invalid States** | ~99% of space | 0% | 100% reduction |
| **User Decisions** | Many parameters | Single choice | ~90% reduction |
| **Cognitive Load** | High (technical) | Low (simple) | Major reduction |
| **Validation Needed** | Yes (complex) | No | 100% reduction |

### Practical Benefits

1. **Simpler UX**: User makes one choice instead of many
2. **Better Quality**: Predefined options are tested and optimized
3. **Easier Maintenance**: Update classification logic, all users benefit
4. **Fewer Bugs**: Invalid states impossible
5. **Faster Onboarding**: New users can start in minutes

---

## Common Objections

### Objection 1: "But users need flexibility!"

**Response**: Do they, really?

- Analyze actual usage: Do users customize, or just use defaults?
- Test hypothesis: Offer limited classification first, add config if needed
- Consider: 90% rule - If predefined works for 90%+, use classification

**Example**: In the offer system, no users ever customized question flows beyond light wording tweaks. Making flows configurable added complexity without value.

### Objection 2: "What if a user has a unique use case?"

**Response**: Add it as a new classification category.

```typescript
// Before: User configures custom flow
// After: Add 'investor' intent
type Intent = 'buy' | 'sell' | 'browse' | 'investor';

// Predefined questions for investor intent
const investorQuestions = [...];
```

**Benefit**: Future users with same use case benefit from your work.

### Objection 3: "We'll lose power users!"

**Response**: Provide "Advanced Mode" as escape hatch.

```typescript
interface SystemConfig {
  mode: 'simple' | 'advanced';

  // Simple mode: Classification only
  // Advanced mode: Allow configuration
}

// Default: Simple mode (classification)
// Power users: Can toggle to advanced mode
```

**Best Practice**: Make advanced mode opt-in, not default.

---

## Migration Guide

### Step 1: Analyze Current Configuration Usage

```typescript
// Audit existing configurations
const configurations = getAllUserConfigs();

// Cluster by similarity
const clusters = clusterBySimilarity(configurations);

// Count cluster sizes
clusters.forEach(cluster => {
  console.log(`${cluster.label}: ${cluster.count} users`);
});

// Example results:
// "Default buy flow": 1,247 users (85%)
// "Default sell flow": 892 users (60%)
// "Custom tweaks": 23 users (1.5%)

// Decision: If 90%+ use defaults, make it classification
```

### Step 2: Identify Natural Categories

```typescript
// Look for patterns in configurations
const categories = identifyCategories(configurations);

// Example
categories = ['buy', 'sell', 'browse'];

// Validate: Do these categories cover most use cases?
const coverage = calculateCoverage(categories, configurations);
// coverage = 98.5% ← Good, use classification
```

### Step 3: Create Predefined Templates

```typescript
// Extract best configuration for each category
const buyTemplate = extractBestConfig(configurations, 'buy');
const sellTemplate = extractBestConfig(configurations, 'sell');
const browseTemplate = extractBestConfig(configurations, 'browse');

// Make them hardcoded (classification)
const templates: Record<Intent, Template> = {
  buy: buyTemplate,
  sell: sellTemplate,
  browse: browseTemplate,
};
```

### Step 4: Deprecate Configuration

```typescript
// Migration strategy
interface UserConfig {
  mode: 'legacy' | 'modern';

  // Legacy: Keep old configuration for existing users
  legacyFlows?: ConversationFlow[];

  // Modern: Just classification
  enabledIntents: Intent[];
}

// New users: Get modern mode (classification only)
// Existing users: Migrate gradually or keep legacy mode
```

---

## Examples in Other Domains

### Example 1: UI Themes

**Bad (Configuration)**:
```typescript
// User configures every color
interface ThemeConfig {
  primaryColor: string;      // #3498db
  secondaryColor: string;    // #2ecc71
  backgroundColor: string;   // #ecf0f1
  textColor: string;         // #2c3e50
  // ... 50 more color properties
}

// Result: Most users pick ugly, inaccessible combinations
```

**Good (Classification)**:
```typescript
// User selects theme
type Theme = 'light' | 'dark' | 'high-contrast';

// Predefined, accessible themes
const themes: Record<Theme, ThemeColors> = {
  light: { /* tested, accessible colors */ },
  dark: { /* tested, accessible colors */ },
  'high-contrast': { /* WCAG AAA compliant */ },
};

// User picks theme, gets professional design
```

### Example 2: Email Templates

**Bad (Configuration)**:
```typescript
// User writes HTML email from scratch
interface EmailTemplate {
  html: string;  // User must know HTML, CSS
  css: string;   // User must handle email client quirks
}

// Result: Broken emails in Outlook, Gmail, etc.
```

**Good (Classification)**:
```typescript
// User selects template type
type EmailType = 'welcome' | 'receipt' | 'notification';

// Predefined, tested templates
const templates: Record<EmailType, EmailTemplate> = {
  welcome: { /* works in all clients */ },
  receipt: { /* works in all clients */ },
  notification: { /* works in all clients */ },
};

// User fills in content, system handles rendering
```

### Example 3: Database Queries

**Bad (Configuration)**:
```typescript
// User writes SQL
const query = userProvidedSQL;  // Risk: SQL injection, bad performance

// Result: Security holes, slow queries
```

**Good (Classification)**:
```typescript
// User selects query type
type QueryType = 'findByEmail' | 'findByDateRange' | 'findByStatus';

// Predefined, optimized, safe queries
const queries: Record<QueryType, QueryBuilder> = {
  findByEmail: (email) => /* parameterized query */,
  findByDateRange: (start, end) => /* indexed query */,
  findByStatus: (status) => /* optimized query */,
};

// User selects type + provides parameters (type-safe)
```

---

## Related Patterns

### Complementary Patterns

- **Self-Contained Entity**: Classification determines which entity applies
- **Template Method**: Classification selects template, template executes logic
- **Strategy Pattern**: Classification selects strategy

### Contrasting Patterns

- **Builder Pattern**: For when configuration is truly needed
- **Factory Pattern**: Classification can drive factory selection
- **Adapter Pattern**: Convert configuration to classification

---

## Conclusion

**Classification vs Configuration** is a fundamental choice that affects:
- **System entropy** (classification is lower)
- **User cognitive load** (classification is simpler)
- **Error rates** (classification is safer)
- **Maintenance burden** (classification is easier)

**Decision Heuristic**:
```
If 90%+ of users would use the same configuration,
  → Make it a classification
  → Hardcode the optimal solution
  → Let users just select their category

Otherwise,
  → Allow configuration
  → Provide good defaults
  → Validate heavily
```

**Information Theory Insight**:

Classification is **filtering** (lossless, reduces entropy)
Configuration is **generation** (user must provide information, increases entropy)

When possible, **filter rather than generate** to reduce cognitive load and errors.

**Real-World Impact**:

In the intent-based offer system:
- Changed "flow" from configuration (10-15 bits) to classification (1.58 bits)
- Reduced setup time from 30+ minutes to <5 minutes
- Eliminated validation errors (impossible to misconfigure)
- Improved offer quality (predefined questions are A/B tested)

This is the power of recognizing when choice should be classification, not configuration.
