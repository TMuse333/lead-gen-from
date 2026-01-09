// src/lib/offers/unified/registry.ts
/**
 * Unified Offer Registry
 *
 * Central registry for all offers. This is the single source of truth
 * for looking up offers and their configurations.
 *
 * Usage:
 *   import { getOffer, getQuestionsForOffer } from '@/lib/offers/unified';
 *
 *   const offer = getOffer('real-estate-timeline');
 *   const questions = getQuestionsForOffer('real-estate-timeline', 'buy');
 */

import type {
  OfferType,
  Intent,
  UnifiedOffer,
  OfferRegistry,
  Question,
  MergedQuestions,
  TrackingConfig,
  TrackingField,
} from './types';

// ==================== REGISTRY ====================

/**
 * Global registry of unified offers
 * Populated by individual offer definition files
 */
export const OFFERS: OfferRegistry = {};

// ==================== REGISTRATION ====================

/**
 * Register an offer in the registry
 * Called by each offer definition file
 */
export function registerOffer<TOutput>(offer: UnifiedOffer<TOutput>): void {
  OFFERS[offer.type] = offer as UnifiedOffer<unknown>;
}

// ==================== LOOKUP FUNCTIONS ====================

/**
 * Get an offer by type
 */
export function getOffer(type: OfferType): UnifiedOffer | undefined {
  return OFFERS[type];
}

/**
 * Check if an offer is registered
 */
export function hasOffer(type: OfferType): boolean {
  return type in OFFERS && OFFERS[type] !== undefined;
}

/**
 * Get all registered offers
 */
export function getAllOffers(): UnifiedOffer[] {
  return Object.values(OFFERS).filter((o): o is UnifiedOffer => o !== undefined);
}

/**
 * Get all registered offer types
 */
export function getRegisteredOfferTypes(): OfferType[] {
  return Object.keys(OFFERS).filter((k) => OFFERS[k as OfferType] !== undefined) as OfferType[];
}

// ==================== INTENT-BASED FUNCTIONS ====================

/**
 * Get offers that support a specific intent
 */
export function getOffersForIntent(intent: Intent): UnifiedOffer[] {
  return getAllOffers().filter((offer) => offer.supportedIntents.includes(intent));
}

/**
 * Get offer types that support a specific intent
 */
export function getOfferTypesForIntent(intent: Intent): OfferType[] {
  return getOffersForIntent(intent).map((o) => o.type);
}

/**
 * Get all intents supported by a set of offers
 */
export function getSupportedIntents(offerTypes: OfferType[]): Intent[] {
  const intents = new Set<Intent>();

  for (const type of offerTypes) {
    const offer = OFFERS[type];
    if (offer) {
      offer.supportedIntents.forEach((intent) => intents.add(intent));
    }
  }

  return Array.from(intents);
}

/**
 * Filter offers to only those supporting an intent
 */
export function filterOffersForIntent(offerTypes: OfferType[], intent: Intent): OfferType[] {
  return offerTypes.filter((type) => {
    const offer = OFFERS[type];
    return offer?.supportedIntents.includes(intent);
  });
}

// ==================== QUESTION FUNCTIONS ====================

/**
 * Normalize offerTypes to array (accepts single offer or array)
 */
function normalizeOfferTypes(offerTypes: OfferType | OfferType[]): OfferType[] {
  return Array.isArray(offerTypes) ? offerTypes : [offerTypes];
}

/**
 * Get questions for a specific offer and intent
 */
export function getQuestionsForOffer(type: OfferType, intent: Intent): Question[] {
  const offer = OFFERS[type];
  if (!offer) return [];

  if (!offer.supportedIntents.includes(intent)) {
    console.warn(`[OfferRegistry] Offer ${type} does not support intent: ${intent}`);
    return [];
  }

  return offer.questions[intent] || [];
}

/**
 * Get merged questions from multiple offers for an intent
 * Questions are deduplicated by mappingKey (first occurrence wins)
 * @param offerTypes - Single offer type or array of offer types
 */
export function getMergedQuestions(offerTypes: OfferType | OfferType[], intent: Intent): MergedQuestions {
  const normalizedTypes = normalizeOfferTypes(offerTypes);
  const questions: Question[] = [];
  const seenMappingKeys = new Set<string>();
  const sourceOffers: OfferType[] = [];
  let originalCount = 0;

  // Sort offers by questionPriority (lower = higher priority)
  const sortedTypes = [...normalizedTypes].sort((a, b) => {
    const offerA = OFFERS[a];
    const offerB = OFFERS[b];
    const priorityA = offerA?.questionPriority ?? 50;
    const priorityB = offerB?.questionPriority ?? 50;
    return priorityA - priorityB;
  });

  for (const type of sortedTypes) {
    const offer = OFFERS[type];
    if (!offer || !offer.supportedIntents.includes(intent)) continue;

    const offerQuestions = offer.questions[intent] || [];
    originalCount += offerQuestions.length;

    if (offerQuestions.length > 0) {
      sourceOffers.push(type);
    }

    // Add questions, deduplicating by mappingKey
    for (const question of offerQuestions) {
      if (!seenMappingKeys.has(question.mappingKey)) {
        questions.push(question);
        seenMappingKeys.add(question.mappingKey);
      }
    }
  }

  // Sort by order
  const sortedQuestions = questions.sort((a, b) => a.order - b.order);

  return {
    intent,
    questions: sortedQuestions,
    sourceOffers,
    originalCount,
    deduplicatedCount: sortedQuestions.length,
  };
}

/**
 * Get all unique mappingKeys that would be collected for an intent
 * @param offerTypes - Single offer type or array of offer types
 */
export function getMappingKeysForIntent(offerTypes: OfferType | OfferType[], intent: Intent): string[] {
  const { questions } = getMergedQuestions(offerTypes, intent);
  return questions.map((q) => q.mappingKey);
}

/**
 * Get the next question in sequence
 * @param offerTypes - Single offer type or array of offer types
 */
export function getNextQuestion(
  offerTypes: OfferType | OfferType[],
  intent: Intent,
  currentQuestionId?: string
): Question | null {
  const { questions } = getMergedQuestions(offerTypes, intent);

  if (!currentQuestionId) {
    return questions[0] || null;
  }

  const currentIndex = questions.findIndex((q) => q.id === currentQuestionId);
  if (currentIndex === -1) {
    console.warn(`[OfferRegistry] Question not found: ${currentQuestionId}`);
    return null;
  }

  return questions[currentIndex + 1] || null;
}

/**
 * Get a specific question by ID
 * @param offerTypes - Single offer type or array of offer types
 */
export function getQuestion(
  offerTypes: OfferType | OfferType[],
  intent: Intent,
  questionId: string
): Question | null {
  const { questions } = getMergedQuestions(offerTypes, intent);
  return questions.find((q) => q.id === questionId) || null;
}

/**
 * Get the first question for an intent
 * @param offerTypes - Single offer type or array of offer types
 */
export function getFirstQuestion(offerTypes: OfferType | OfferType[], intent: Intent): Question | null {
  const { questions } = getMergedQuestions(offerTypes, intent);
  return questions[0] || null;
}

/**
 * Get total question count for an intent
 * @param offerTypes - Single offer type or array of offer types
 */
export function getQuestionCount(offerTypes: OfferType | OfferType[], intent: Intent): number {
  const { deduplicatedCount } = getMergedQuestions(offerTypes, intent);
  return deduplicatedCount;
}

// ==================== PROGRESS FUNCTIONS ====================

/**
 * Check if all required questions are answered
 * @param offerTypes - Single offer type or array of offer types
 */
export function isComplete(
  offerTypes: OfferType | OfferType[],
  intent: Intent,
  userInput: Record<string, string>
): boolean {
  const { questions } = getMergedQuestions(offerTypes, intent);

  const requiredQuestions = questions.filter((q) => q.required);
  return requiredQuestions.every((q) => userInput[q.mappingKey]);
}

/**
 * Get progress percentage
 * @param offerTypes - Single offer type or array of offer types
 */
export function getProgress(
  offerTypes: OfferType | OfferType[],
  intent: Intent,
  userInput: Record<string, string>
): number {
  const { questions } = getMergedQuestions(offerTypes, intent);
  if (questions.length === 0) return 0;

  const answeredCount = questions.filter((q) => userInput[q.mappingKey]).length;
  return Math.round((answeredCount / questions.length) * 100);
}

/**
 * Get list of unanswered required questions
 * @param offerTypes - Single offer type or array of offer types
 */
export function getUnansweredRequired(
  offerTypes: OfferType | OfferType[],
  intent: Intent,
  userInput: Record<string, string>
): Question[] {
  const { questions } = getMergedQuestions(offerTypes, intent);
  return questions.filter((q) => q.required && !userInput[q.mappingKey]);
}

// ==================== TRACKING FUNCTIONS ====================

/**
 * Get tracking config for an offer
 */
export function getTrackingConfig(type: OfferType): TrackingConfig | undefined {
  return OFFERS[type]?.tracking;
}

/**
 * Get tracking field config for a specific field
 */
export function getTrackingField(type: OfferType, mappingKey: string): TrackingField | undefined {
  return OFFERS[type]?.tracking.fields[mappingKey];
}

/**
 * Get all preview fields for an offer (fields marked with preview: true)
 */
export function getPreviewFields(type: OfferType): string[] {
  const tracking = OFFERS[type]?.tracking;
  if (!tracking) return [];

  return Object.entries(tracking.fields)
    .filter(([_, field]) => field.preview)
    .sort(([, a], [, b]) => a.priority - b.priority)
    .map(([key]) => key);
}

// ==================== VALIDATION FUNCTIONS ====================

/**
 * Validate that an offer's required inputs will be collected
 */
export function validateOfferCoverage(
  offerType: OfferType,
  intent: Intent,
  enabledOffers: OfferType[]
): { valid: boolean; missingFields: string[]; collectedFields: string[] } {
  const offer = OFFERS[offerType];

  if (!offer) {
    return { valid: false, missingFields: ['Offer not found'], collectedFields: [] };
  }

  if (!offer.supportedIntents.includes(intent)) {
    return { valid: false, missingFields: ['Intent not supported'], collectedFields: [] };
  }

  const collectedFields = getMappingKeysForIntent(enabledOffers, intent);

  // Get required fields from questions
  const offerQuestions = offer.questions[intent] || [];
  const requiredFields = offerQuestions.filter((q) => q.required).map((q) => q.mappingKey);

  const missingFields = requiredFields.filter((field) => !collectedFields.includes(field));

  return {
    valid: missingFields.length === 0,
    missingFields,
    collectedFields,
  };
}

// ==================== INPUT REQUIREMENTS DERIVATION ====================

/**
 * Field validation type matching core/types.ts
 */
type FieldValidationType = 'email' | 'phone' | 'number' | 'text';

interface DerivedFieldValidation {
  type?: FieldValidationType;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  required?: boolean;
}

interface DerivedInputRequirements {
  requiredFields: string[];
  optionalFields?: string[];
  fieldValidations?: Record<string, DerivedFieldValidation>;
}

/**
 * Derive InputRequirements from unified offer questions
 * This provides backwards compatibility with the old validation system
 * NOTE: This collects from ALL intents - use getInputRequirementsForIntent for intent-specific requirements
 */
export function deriveInputRequirements(type: OfferType): DerivedInputRequirements {
  const offer = OFFERS[type];
  if (!offer) {
    return { requiredFields: [], optionalFields: [], fieldValidations: {} };
  }

  const requiredFields = new Set<string>();
  const optionalFields = new Set<string>();
  const fieldValidations: Record<string, DerivedFieldValidation> = {};

  // Collect from all intents
  for (const questions of Object.values(offer.questions)) {
    for (const q of questions || []) {
      if (q.required) {
        requiredFields.add(q.mappingKey);
      } else {
        optionalFields.add(q.mappingKey);
      }

      // Map inputType to FieldValidationType
      let fieldType: FieldValidationType = 'text';
      if (q.inputType === 'email') fieldType = 'email';
      else if (q.inputType === 'phone') fieldType = 'phone';
      else if (q.inputType === 'number') fieldType = 'number';

      // Build field validation
      fieldValidations[q.mappingKey] = {
        type: fieldType,
        required: q.required,
        minLength: q.validation?.minLength,
        maxLength: q.validation?.maxLength,
        pattern: q.validation?.pattern,
      };
    }
  }

  return {
    requiredFields: Array.from(requiredFields),
    optionalFields: Array.from(optionalFields).filter((f) => !requiredFields.has(f)),
    fieldValidations,
  };
}

/**
 * Get InputRequirements for a specific offer and intent
 * This is the INTENT-AWARE version - use this for validation!
 *
 * @param type - The offer type
 * @param intent - The specific intent (buy, sell, browse)
 * @returns InputRequirements derived from the offer's questions for this intent
 */
export function getInputRequirementsForIntent(
  type: OfferType,
  intent: Intent
): DerivedInputRequirements {
  const offer = OFFERS[type];
  if (!offer) {
    console.warn(`[OfferRegistry] Offer not found: ${type}`);
    return { requiredFields: [], optionalFields: [], fieldValidations: {} };
  }

  if (!offer.supportedIntents.includes(intent)) {
    console.warn(`[OfferRegistry] Offer ${type} does not support intent: ${intent}`);
    return { requiredFields: [], optionalFields: [], fieldValidations: {} };
  }

  const questions = offer.questions[intent] || [];
  const requiredFields: string[] = [];
  const optionalFields: string[] = [];
  const fieldValidations: Record<string, DerivedFieldValidation> = {};

  for (const q of questions) {
    // Skip questions that trigger the contact modal - those are collected via modal, not validated here
    if (q.triggersContactModal) {
      // Still track as optional for validation purposes
      optionalFields.push(q.mappingKey);
      continue;
    }

    if (q.required) {
      requiredFields.push(q.mappingKey);
    } else {
      optionalFields.push(q.mappingKey);
    }

    // Map inputType to FieldValidationType
    let fieldType: FieldValidationType = 'text';
    if (q.inputType === 'email') fieldType = 'email';
    else if (q.inputType === 'phone') fieldType = 'phone';
    else if (q.inputType === 'number') fieldType = 'number';

    // Build field validation
    fieldValidations[q.mappingKey] = {
      type: fieldType,
      required: q.required,
      minLength: q.validation?.minLength,
      maxLength: q.validation?.maxLength,
      pattern: q.validation?.pattern,
    };
  }

  // Always allow intent/flow fields
  if (!fieldValidations['intent']) {
    optionalFields.push('intent');
    fieldValidations['intent'] = { type: 'text', required: false };
  }
  if (!fieldValidations['flow']) {
    optionalFields.push('flow');
    fieldValidations['flow'] = { type: 'text', required: false };
  }

  return {
    requiredFields,
    optionalFields,
    fieldValidations,
  };
}

// ==================== MERGED VALIDATION ====================

/**
 * Get input requirements from MERGED questions across all enabled offers
 * This validates against what was ACTUALLY asked (merged, deduplicated questions)
 * rather than what each individual offer expects.
 *
 * Use this for API validation when multiple offers are enabled!
 *
 * @param enabledOffers - All enabled offer types
 * @param intent - The intent being validated
 * @returns InputRequirements derived from merged questions
 */
export function getInputRequirementsForMergedOffers(
  enabledOffers: OfferType[],
  intent: Intent
): DerivedInputRequirements {
  // Get merged questions from all enabled offers for this intent
  const { questions } = getMergedQuestions(enabledOffers, intent);

  const requiredFields: string[] = [];
  const optionalFields: string[] = [];
  const fieldValidations: Record<string, DerivedFieldValidation> = {};

  for (const q of questions) {
    // Skip questions that trigger the contact modal
    if (q.triggersContactModal) {
      optionalFields.push(q.mappingKey);
      continue;
    }

    if (q.required) {
      requiredFields.push(q.mappingKey);
    } else {
      optionalFields.push(q.mappingKey);
    }

    // Map inputType to FieldValidationType
    let fieldType: FieldValidationType = 'text';
    if (q.inputType === 'email') fieldType = 'email';
    else if (q.inputType === 'phone') fieldType = 'phone';
    else if (q.inputType === 'number') fieldType = 'number';

    fieldValidations[q.mappingKey] = {
      type: fieldType,
      required: q.required,
      minLength: q.validation?.minLength,
      maxLength: q.validation?.maxLength,
      pattern: q.validation?.pattern,
    };
  }

  // Always allow intent/flow fields
  optionalFields.push('intent', 'flow');
  fieldValidations['intent'] = { type: 'text', required: false };
  fieldValidations['flow'] = { type: 'text', required: false };

  return {
    requiredFields,
    optionalFields,
    fieldValidations,
  };
}

// ==================== DEBUG FUNCTIONS ====================

/**
 * Get registry status for debugging
 */
export function getRegistryStatus(): {
  registered: OfferType[];
  byIntent: Record<Intent, OfferType[]>;
  totalQuestions: Record<OfferType, number>;
} {
  const registered = getRegisteredOfferTypes();

  const byIntent: Record<Intent, OfferType[]> = {
    buy: getOfferTypesForIntent('buy'),
    sell: getOfferTypesForIntent('sell'),
    browse: getOfferTypesForIntent('browse'),
  };

  const totalQuestions: Record<string, number> = {};
  for (const type of registered) {
    const offer = OFFERS[type];
    if (offer) {
      const total = Object.values(offer.questions).reduce(
        (sum, questions) => sum + (questions?.length || 0),
        0
      );
      totalQuestions[type] = total;
    }
  }

  return { registered, byIntent, totalQuestions: totalQuestions as Record<OfferType, number> };
}

/**
 * Log registry status to console (no-op in production)
 */
export function logRegistryStatus(): void {
  // No-op - debug logging removed
}
