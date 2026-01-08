// src/lib/offers/unified/types.ts
/**
 * Unified Offer Type System
 *
 * This is the single source of truth for offer structure.
 * Each offer contains everything needed: identity, questions, tracking UI, generation, and results.
 *
 * Terminology:
 * - Intent: What the user wants to do (buy, sell, browse) - replaces "flow"
 * - Offer: A deliverable we generate for the user (timeline, PDF, video, etc.)
 * - Question: A single piece of information we collect
 * - Tracking: How we display progress in the sidebar
 */

// ==================== CORE TYPES ====================

/**
 * User intent - what the user wants to accomplish
 * This replaces the legacy "flow" terminology
 */
export type Intent = 'buy' | 'sell' | 'browse';

/**
 * All possible intents
 */
export const ALL_INTENTS: Intent[] = ['buy', 'sell', 'browse'];

/**
 * Offer types available in the system
 */
export type OfferType =
  | 'real-estate-timeline'
  | 'pdf'
  | 'video'
  | 'home-estimate'
  | 'landingPage'
  | 'custom';

/**
 * All offer types
 */
export const ALL_OFFER_TYPES: OfferType[] = [
  'real-estate-timeline',
  'pdf',
  'video',
  'home-estimate',
  'landingPage',
  'custom',
];

// ==================== QUESTION TYPES ====================

/**
 * Input type for a question
 */
export type QuestionInputType = 'buttons' | 'text' | 'email' | 'phone' | 'number' | 'address';

/**
 * Button option for button-type questions
 */
export interface QuestionButton {
  id: string;
  label: string;
  value: string;
  /** Tracker feedback when this button is selected */
  tracker?: {
    insight: string;      // Fun/engaging message shown in sidebar
    dbMessage: string;    // "Loading..." style message
  };
}

/**
 * Validation rules for a question
 */
export interface QuestionValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  patternMessage?: string;  // Custom error message for pattern
}

/**
 * A question that an offer asks to collect information
 */
export interface Question {
  /** Unique identifier within the offer */
  id: string;

  /** The question text shown to users */
  text: string;

  /**
   * Key used to store the answer in userInput
   * Questions with the same mappingKey are deduplicated across offers
   */
  mappingKey: string;

  /** Whether this question must be answered */
  required: boolean;

  /** How the user provides input */
  inputType: QuestionInputType;

  /** Display order within the intent (lower = earlier) */
  order: number;

  /** Button options (required if inputType is 'buttons') */
  buttons?: QuestionButton[];

  /** Validation rules */
  validation?: QuestionValidation;

  /** Placeholder text for text inputs */
  placeholder?: string;

  /** Allow free text even when buttons are shown */
  allowFreeText?: boolean;

  /**
   * If true, this question triggers the contact collection modal instead of
   * being shown as a regular chat question. The modal collects name, email, and phone.
   * When this flag is set, the question is considered the "final" question before generation.
   */
  triggersContactModal?: boolean;
}

// ==================== TRACKING UI TYPES ====================

/**
 * Lucide icon names commonly used in tracking
 * This is a subset - any valid Lucide icon name works
 */
export type TrackingIconName =
  | 'Calendar'
  | 'Clock'
  | 'MapPin'
  | 'DollarSign'
  | 'Mail'
  | 'Phone'
  | 'Home'
  | 'Building'
  | 'Bed'
  | 'Bath'
  | 'Maximize'
  | 'Target'
  | 'Lightbulb'
  | 'Play'
  | 'FileText'
  | 'Video'
  | 'User'
  | 'Users'
  | 'Heart'
  | 'Star'
  | 'CheckCircle'
  | 'AlertCircle'
  | 'Info'
  | 'Sparkles'
  | string;  // Allow any string for flexibility

/**
 * How to display progress in the sidebar
 */
export type ProgressStyle = 'bar' | 'steps' | 'checklist';

/**
 * Configuration for how a field appears in the tracking sidebar
 */
export interface TrackingField {
  /** Lucide icon name */
  icon: TrackingIconName;

  /** Display label (e.g., "Timeline", "Budget") */
  label: string;

  /** Display priority (lower = shown first) */
  priority: number;

  /** Show in compact preview mode? */
  preview?: boolean;

  /** Format function for display (optional) */
  format?: (value: string) => string;
}

/**
 * Tracking UI configuration for an offer
 * Defines how the offer appears in the sidebar
 */
export interface TrackingConfig {
  /** Lucide icon name for the offer */
  icon: TrackingIconName;

  /** Color for the offer (CSS variable or hex) */
  color: string;

  /** How to display progress */
  progressStyle: ProgressStyle;

  /** Configuration for each collected field */
  fields: Record<string, TrackingField>;
}

// ==================== GENERATION TYPES ====================

/**
 * Advice item for prompt context
 */
export interface PromptAdviceItem {
  advice: string;
  tags: string[];
  title?: string;
}

/**
 * Context passed to prompt builder
 */
export interface PromptContext {
  intent: Intent;
  /** @deprecated Use intent instead. Kept for backwards compatibility. */
  flow: string;
  businessName: string;
  /** @deprecated Use phaseAdvice for phase-specific knowledge */
  qdrantAdvice?: string[];
  /**
   * Phase-specific advice from Qdrant
   * Maps phase ID -> array of advice items
   */
  phaseAdvice?: Map<string, PromptAdviceItem[]>;
  additionalContext?: Record<string, unknown>;
}

/**
 * Output schema property definition
 */
export interface OutputSchemaProperty {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required?: boolean;
  items?: OutputSchemaProperty;  // For arrays
  properties?: Record<string, OutputSchemaProperty>;  // For objects
  example?: unknown;
}

/**
 * Schema defining expected output structure
 */
export interface OutputSchema {
  type: 'object';
  properties: Record<string, OutputSchemaProperty>;
  outputType: string;  // TypeScript type name for the output
}

/**
 * Result of output validation
 */
export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
  normalized?: unknown;  // Cleaned/normalized output
}

/**
 * Generation configuration for an offer
 */
export interface GenerationConfig<TOutput = unknown> {
  /** LLM model to use */
  model: string;

  /** Maximum tokens for response */
  maxTokens: number;

  /** Temperature for generation (0-1) */
  temperature: number;

  /** Build the prompt from user input */
  buildPrompt: (userInput: Record<string, string>, context: PromptContext) => string;

  /** Schema for expected output */
  outputSchema: OutputSchema;

  /** Validate the generated output */
  validateOutput: (output: unknown) => ValidationResult;

  /** Optional post-processing */
  postProcess?: (output: TOutput, userInput: Record<string, string>) => TOutput;
}

// ==================== RESULTS DISPLAY TYPES ====================

/**
 * Configuration for how results are displayed
 */
export interface ResultsConfig {
  /** Title shown on results page (e.g., "Your Personalized Timeline") */
  title: string;

  /** Subtitle with context (supports {intent} placeholder) */
  subtitle: string;

  /** Component name for custom preview rendering */
  previewComponent?: string;

  /** Call-to-action button text */
  ctaText: string;

  /** Can user download this offer? */
  downloadable?: boolean;

  /** Can user share this offer? */
  shareable?: boolean;
}

// ==================== FALLBACK TYPES ====================

/**
 * Strategy for handling generation failures
 */
export type FallbackStrategy = 'use-template' | 'retry' | 'error';

/**
 * Fallback configuration
 */
export interface FallbackConfig<TOutput = unknown> {
  /** What to do when generation fails */
  strategy: FallbackStrategy;

  /** Template to use if strategy is 'use-template' */
  template?: TOutput;

  /** Max retries if strategy is 'retry' */
  maxRetries?: number;
}

// ==================== UNIFIED OFFER TYPE ====================

/**
 * Offer category for grouping in UI
 */
export type OfferCategory = 'lead-generation' | 'content' | 'analysis' | 'custom';

/**
 * The unified offer type - single source of truth for everything about an offer
 *
 * @template TOutput - The TypeScript type for the generated output
 */
export interface UnifiedOffer<TOutput = unknown> {
  // ==================== IDENTITY ====================

  /** Unique identifier for this offer */
  type: OfferType;

  /** Human-readable name (e.g., "Personalized Timeline") */
  label: string;

  /** Description of what this offer provides */
  description: string;

  /** Emoji icon for selection UI */
  icon: string;

  // ==================== INTENT SUPPORT ====================

  /** Which intents this offer supports */
  supportedIntents: Intent[];

  // ==================== QUESTIONS ====================

  /** Questions to ask per intent */
  questions: Partial<Record<Intent, Question[]>>;

  // ==================== TRACKING UI ====================

  /** Configuration for sidebar tracking display */
  tracking: TrackingConfig;

  // ==================== GENERATION ====================

  /** Configuration for LLM generation */
  generation: GenerationConfig<TOutput>;

  // ==================== RESULTS DISPLAY ====================

  /** Configuration for results page display */
  results: ResultsConfig;

  // ==================== FALLBACK ====================

  /** Configuration for handling failures */
  fallback: FallbackConfig<TOutput>;

  // ==================== KNOWLEDGE REQUIREMENTS ====================

  /**
   * Knowledge requirements per phase, per intent
   * Defines what Qdrant knowledge is needed for each phase of the offer
   */
  knowledgeRequirements?: KnowledgeRequirements;

  // ==================== METADATA ====================

  /** Semantic version (e.g., "2.0.0") */
  version: string;

  /** Category for grouping in UI */
  category: OfferCategory;

  /** Whether this offer is enabled by default for new users */
  enabledByDefault: boolean;

  /** Priority for question ordering when multiple offers (lower = higher priority) */
  questionPriority?: number;
}

// ==================== TYPE GUARDS ====================

/**
 * Check if an intent is valid
 */
export function isValidIntent(value: string): value is Intent {
  return ALL_INTENTS.includes(value as Intent);
}

/**
 * Check if an offer type is valid
 */
export function isValidOfferType(value: string): value is OfferType {
  return ALL_OFFER_TYPES.includes(value as OfferType);
}

/**
 * Check if an offer supports a given intent
 */
export function offerSupportsIntent(offer: UnifiedOffer, intent: Intent): boolean {
  return offer.supportedIntents.includes(intent);
}

/**
 * Check if a question requires button input
 */
export function isButtonQuestion(question: Question): boolean {
  return question.inputType === 'buttons' && !!question.buttons?.length;
}

/**
 * Check if a question is a text input type
 */
export function isTextQuestion(question: Question): boolean {
  return ['text', 'email', 'phone', 'number', 'address'].includes(question.inputType);
}

// ==================== FACTORY HELPERS ====================

/**
 * Create a button question with common defaults
 */
export function createButtonQuestion(
  id: string,
  text: string,
  mappingKey: string,
  buttons: QuestionButton[],
  options?: Partial<Question>
): Question {
  return {
    id,
    text,
    mappingKey,
    required: true,
    inputType: 'buttons',
    order: 50,
    buttons,
    allowFreeText: false,
    ...options,
  };
}

/**
 * Create a text question with common defaults
 */
export function createTextQuestion(
  id: string,
  text: string,
  mappingKey: string,
  inputType: 'text' | 'email' | 'phone' | 'number' | 'address' = 'text',
  options?: Partial<Question>
): Question {
  return {
    id,
    text,
    mappingKey,
    required: true,
    inputType,
    order: 50,
    validation: {
      required: true,
      ...(inputType === 'email' && { pattern: '^[^@]+@[^@]+\\.[^@]+$', patternMessage: 'Please enter a valid email' }),
      ...(inputType === 'phone' && { pattern: '^[0-9\\-\\+\\s\\(\\)]+$', patternMessage: 'Please enter a valid phone number' }),
    },
    ...options,
  };
}

/**
 * Create a standard email question
 */
export function createEmailQuestion(
  options?: Partial<Question>
): Question {
  return {
    ...createTextQuestion(
      'email',
      "What's your email so we can send your personalized results?",
      'email',
      'email',
      {
        order: 100,  // Email usually comes last
        placeholder: 'you@example.com',
        ...options,
      }
    ),
    // This question triggers the contact collection modal instead of chat input
    triggersContactModal: true,
  };
}

/**
 * Create a standard location question
 */
export function createLocationQuestion(
  text: string = 'What area are you interested in?',
  options?: Partial<Question>
): Question {
  return createTextQuestion(
    'location',
    text,
    'location',
    'text',
    {
      order: 20,
      placeholder: 'City, neighborhood, or zip code',
      validation: { required: true, minLength: 2 },
      ...options,
    }
  );
}

// ==================== KNOWLEDGE REQUIREMENTS TYPES ====================

/**
 * Priority level for knowledge requirements
 */
export type KnowledgePriority = 'critical' | 'high' | 'medium' | 'low';

/**
 * Knowledge requirement for a specific phase/location within an offer
 *
 * This tells the system what knowledge is needed for each phase,
 * enabling phase-specific Qdrant queries and guiding agent uploads.
 */
export interface PhaseKnowledgeRequirement {
  /** Human-readable description for dashboard */
  description: string;

  /** Tags to search for in Qdrant */
  searchTags: string[];

  /** Priority for retrieval (affects query limits and display) */
  priority: KnowledgePriority;

  /** Minimum advice items needed (default: 2) */
  minItems?: number;

  /** Example content to guide agent uploads */
  exampleContent?: string;

  /** Prompt hint for LLM when using this advice */
  usageHint?: string;
}

/**
 * Knowledge requirements per phase, per intent
 * Maps intent → phaseId → requirement
 */
export type KnowledgeRequirements = Partial<
  Record<Intent, Record<string, PhaseKnowledgeRequirement>>
>;

// ==================== REGISTRY TYPES ====================

/**
 * Registry of all unified offers
 */
export type OfferRegistry = Partial<Record<OfferType, UnifiedOffer<unknown>>>;

/**
 * Result of merging questions from multiple offers
 */
export interface MergedQuestions {
  intent: Intent;
  questions: Question[];
  sourceOffers: OfferType[];
  originalCount: number;
  deduplicatedCount: number;
}
