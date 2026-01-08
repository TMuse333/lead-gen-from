// lib/chat/getQuestionsForIntent.ts
/**
 * Intent-Based Question Resolution
 *
 * This module provides utilities for getting questions based on:
 * 1. User's selected offer(s)
 * 2. User's intent (buy/sell/browse) - a subcategory of offer
 *
 * Questions are derived from UNIFIED OFFERS and deduplicated by mappingKey.
 * The unified offer system is the single source of truth.
 */

import type { OfferType } from '@/stores/onboardingStore/onboarding.store';
import type { ConversationQuestion, ButtonOption } from '@/types/conversation.types';
import {
  getMergedQuestions,
  getSupportedIntents,
  filterOffersForIntent,
  type Question,
  type MergedQuestions,
  type Intent,
} from '@/lib/offers/unified';

// ==================== TYPE CONVERSIONS ====================

/**
 * Convert a unified Question to a ConversationQuestion
 * This bridges the unified offer system with the existing chat components
 */
export function questionToConversationQuestion(
  question: Question,
  index: number
): ConversationQuestion {
  // Convert button options
  const buttons: ButtonOption[] | undefined = question.buttons?.map((btn) => ({
    id: btn.id,
    label: btn.label,
    value: btn.value,
    tracker: btn.tracker,
  }));

  return {
    id: question.id,
    question: question.text,
    order: question.order ?? index + 1,
    mappingKey: question.mappingKey,
    buttons,
    allowFreeText: question.allowFreeText ?? question.inputType !== 'buttons',
    triggersContactModal: question.triggersContactModal,
    validation: question.validation
      ? {
          type: question.inputType === 'email' ? 'email' : question.inputType === 'phone' ? 'phone' : 'text',
          required: question.required,
          minLength: question.validation.minLength,
          maxLength: question.validation.maxLength,
          pattern: question.validation.pattern,
        }
      : { required: question.required },
  };
}

/**
 * Convert all questions from unified format to ConversationQuestions
 */
export function questionsToConversationQuestions(
  questions: Question[]
): ConversationQuestion[] {
  return questions.map((q, i) => questionToConversationQuestion(q, i));
}

// ==================== MAIN FUNCTIONS ====================

/**
 * Get questions for a user's intent based on enabled offers
 *
 * @param enabledOffers - List of offer types the user has enabled
 * @param intent - The user's intent (buy/sell/browse)
 * @returns Array of ConversationQuestion objects ready for the chat
 */
export function getIntentQuestions(
  enabledOffers: OfferType[],
  intent: Intent
): ConversationQuestion[] {
  const { questions } = getMergedQuestions(enabledOffers, intent);
  return questionsToConversationQuestions(questions);
}

/**
 * Get the next question for an intent-based flow
 *
 * @param enabledOffers - List of offer types the user has enabled
 * @param intent - The user's intent
 * @param currentQuestionId - Current question ID (optional)
 * @returns The next question or null if complete
 */
export function getNextIntentQuestion(
  enabledOffers: OfferType[],
  intent: Intent,
  currentQuestionId?: string
): ConversationQuestion | null {
  const questions = getIntentQuestions(enabledOffers, intent);

  if (!currentQuestionId) {
    return questions[0] || null;
  }

  const currentIndex = questions.findIndex((q) => q.id === currentQuestionId);
  if (currentIndex === -1) {
    console.warn(`[getNextIntentQuestion] Question not found: ${currentQuestionId}`);
    return null;
  }

  return questions[currentIndex + 1] || null;
}

/**
 * Get the first question for an intent
 */
export function getFirstIntentQuestion(
  enabledOffers: OfferType[],
  intent: Intent
): ConversationQuestion | null {
  const questions = getIntentQuestions(enabledOffers, intent);
  return questions[0] || null;
}

/**
 * Get total question count for an intent
 */
export function getIntentQuestionCount(
  enabledOffers: OfferType[],
  intent: Intent
): number {
  const questions = getIntentQuestions(enabledOffers, intent);
  return questions.length;
}

/**
 * Check if all required questions are answered for an intent
 */
export function isIntentComplete(
  enabledOffers: OfferType[],
  intent: Intent,
  userAnswers: Record<string, string>
): boolean {
  const questions = getIntentQuestions(enabledOffers, intent);

  const requiredQuestions = questions.filter(
    (q) => q.validation?.required !== false && q.mappingKey && !q.triggersContactModal
  );

  return requiredQuestions.every(
    (q) => q.mappingKey && userAnswers[q.mappingKey]
  );
}

/**
 * Get progress percentage for an intent-based flow
 */
export function getIntentProgress(
  enabledOffers: OfferType[],
  intent: Intent,
  userAnswers: Record<string, string>
): number {
  const totalQuestions = getIntentQuestionCount(enabledOffers, intent);
  if (totalQuestions === 0) return 0;

  const answeredCount = Object.keys(userAnswers).length;
  return Math.round((answeredCount / totalQuestions) * 100);
}

/**
 * Get a specific question by ID for an intent
 */
export function getIntentQuestion(
  enabledOffers: OfferType[],
  intent: Intent,
  questionId: string
): ConversationQuestion | null {
  const questions = getIntentQuestions(enabledOffers, intent);
  return questions.find((q) => q.id === questionId) || null;
}

/**
 * Get offers that support a specific intent (filtered from enabled offers)
 */
export function getOffersForIntent(
  enabledOffers: OfferType[],
  intent: Intent
): OfferType[] {
  return filterOffersForIntent(enabledOffers, intent);
}

// ==================== DEBUGGING ====================

/**
 * Get detailed info about questions for an intent (for debugging)
 */
export function getIntentQuestionsDebug(
  enabledOffers: OfferType[],
  intent: Intent
): {
  intent: Intent;
  enabledOffers: OfferType[];
  applicableOffers: OfferType[];
  questions: Array<{
    id: string;
    question: string;
    mappingKey: string;
    required: boolean;
    inputType: string;
  }>;
  totalCount: number;
} {
  const { questions, sourceOffers, deduplicatedCount } = getMergedQuestions(
    enabledOffers,
    intent
  );

  return {
    intent,
    enabledOffers,
    applicableOffers: sourceOffers,
    questions: questions.map((q) => ({
      id: q.id,
      question: q.text,
      mappingKey: q.mappingKey,
      required: q.required,
      inputType: q.inputType,
    })),
    totalCount: deduplicatedCount,
  };
}

// ==================== EXPORTS ====================

export type { Intent, MergedQuestions };
export { getSupportedIntents };
