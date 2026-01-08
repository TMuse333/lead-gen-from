// stores/chatStore/flowHelpers.ts - UNIFIED OFFER SYSTEM
/**
 * Flow helpers - now delegates to unified offer system
 *
 * @deprecated Most functions here are deprecated.
 * Use functions from '@/lib/offers/unified' directly instead.
 */

import type { OfferType, Intent } from './types';
import {
  getNextQuestion as getNextQuestionFromRegistry,
  getFirstQuestion as getFirstQuestionFromRegistry,
  getQuestionCount,
  isComplete,
  getProgress,
  getQuestion,
  type Question,
} from '@/lib/offers/unified';
import { QuestionNode } from '@/types/conversation.types';

// ==================== CONVERSION HELPERS ====================

/**
 * Convert unified Question to legacy QuestionNode format
 */
function toQuestionNode(question: Question | null): QuestionNode | null {
  if (!question) return null;

  return {
    id: question.id,
    question: question.text,
    mappingKey: question.mappingKey,
    order: question.order,
    buttons: question.buttons?.map(b => ({
      id: b.id,
      label: b.label,
      value: b.value,
      tracker: b.tracker,
    })),
    allowFreeText: question.allowFreeText,
    validation: {
      type: question.inputType === 'email' ? 'email' : question.inputType === 'phone' ? 'phone' : question.inputType === 'number' ? 'number' : 'text',
      required: question.required,
      minLength: question.validation?.minLength,
      maxLength: question.validation?.maxLength,
      pattern: question.validation?.pattern,
    },
  };
}

// ==================== UNIFIED API ====================

/**
 * Get the next question for offer(s)+intent
 * Supports both single offer and array of offers (merged questions)
 */
export function getNextQuestion(
  offerTypes: OfferType | OfferType[],
  intent: Intent,
  currentQuestionId?: string
): QuestionNode | null {
  const question = getNextQuestionFromRegistry(offerTypes, intent, currentQuestionId);
  return toQuestionNode(question);
}

/**
 * Get the first question for offer(s)+intent
 * Supports both single offer and array of offers (merged questions)
 */
export function getFirstQuestion(
  offerTypes: OfferType | OfferType[],
  intent: Intent
): QuestionNode | null {
  const question = getFirstQuestionFromRegistry(offerTypes, intent);
  return toQuestionNode(question);
}

/**
 * Get total question count for offer(s)+intent
 * Supports both single offer and array of offers (merged questions)
 */
export function getTotalQuestions(
  offerTypes: OfferType | OfferType[],
  intent: Intent
): number {
  return getQuestionCount(offerTypes, intent);
}

/**
 * Check if flow is complete for offer(s)+intent
 * Supports both single offer and array of offers (merged questions)
 */
export function isFlowComplete(
  offerTypes: OfferType | OfferType[],
  intent: Intent,
  userAnswers: Record<string, string>
): boolean {
  return isComplete(offerTypes, intent, userAnswers);
}

/**
 * Get progress percentage for offer(s)+intent
 * Supports both single offer and array of offers (merged questions)
 */
export function getFlowProgress(
  offerTypes: OfferType | OfferType[],
  intent: Intent,
  userAnswers: Record<string, string>
): number {
  return getProgress(offerTypes, intent, userAnswers);
}

// ==================== LEGACY COMPATIBILITY ====================

/**
 * @deprecated Use getNextQuestion(offerType, intent, currentQuestionId) instead
 */
export function getNextQuestionUnified(options: {
  useIntentSystem?: boolean;
  enabledOffers?: OfferType[];
  intent: Intent | null;
  flowId?: string | null;
  currentQuestionId?: string;
  selectedOffer?: OfferType | null;
}): QuestionNode | null {
  const { selectedOffer, enabledOffers, intent, currentQuestionId } = options;
  const offer = selectedOffer || (enabledOffers && enabledOffers[0]) || null;

  if (!offer || !intent) return null;
  return getNextQuestion(offer, intent, currentQuestionId);
}

/**
 * @deprecated Use getFirstQuestion(offerType, intent) instead
 */
export function getFirstQuestionUnified(options: {
  useIntentSystem?: boolean;
  enabledOffers?: OfferType[];
  intent: Intent | null;
  flowId?: string | null;
  selectedOffer?: OfferType | null;
}): QuestionNode | null {
  const { selectedOffer, enabledOffers, intent } = options;
  const offer = selectedOffer || (enabledOffers && enabledOffers[0]) || null;

  if (!offer || !intent) return null;
  return getFirstQuestion(offer, intent);
}

/**
 * @deprecated Use getTotalQuestions(offerType, intent) instead
 */
export function getTotalQuestionsUnified(options: {
  useIntentSystem?: boolean;
  enabledOffers?: OfferType[];
  intent: Intent | null;
  flowId?: string | null;
  selectedOffer?: OfferType | null;
}): number {
  const { selectedOffer, enabledOffers, intent } = options;
  const offer = selectedOffer || (enabledOffers && enabledOffers[0]) || null;

  if (!offer || !intent) return 0;
  return getTotalQuestions(offer, intent);
}

/**
 * @deprecated Use isFlowComplete(offerType, intent, userAnswers) instead
 */
export function isCompleteUnified(options: {
  useIntentSystem?: boolean;
  enabledOffers?: OfferType[];
  intent: Intent | null;
  flowId?: string | null;
  userAnswers: Record<string, string>;
  selectedOffer?: OfferType | null;
}): boolean {
  const { selectedOffer, enabledOffers, intent, userAnswers } = options;
  const offer = selectedOffer || (enabledOffers && enabledOffers[0]) || null;

  if (!offer || !intent) return false;
  return isFlowComplete(offer, intent, userAnswers);
}

// Re-export from unified for convenience
export {
  getQuestion,
  getQuestionCount,
  isComplete,
  getProgress,
};
