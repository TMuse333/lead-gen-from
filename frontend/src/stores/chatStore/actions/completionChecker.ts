// stores/chatStore/completionChecker.ts - UNIFIED OFFER SYSTEM
import type { OfferType, Intent } from '../types';
import { isComplete as isOfferComplete, getQuestionCount } from '@/lib/offers/unified';

/**
 * Check if all questions for an offer+intent are answered
 * Uses the unified offer system
 */
export function checkCompletion(
  selectedOffer: OfferType | null,
  currentIntent: Intent | null,
  userInput: Record<string, string>
): boolean {
  if (!selectedOffer || !currentIntent) return false;

  const complete = isOfferComplete(selectedOffer, currentIntent, userInput);
  const totalQuestions = getQuestionCount(selectedOffer, currentIntent);
  const answeredCount = Object.keys(userInput).length;

  console.log(`📊 Completion check: ${answeredCount}/${totalQuestions} = ${complete ? '✅ COMPLETE' : '❌ incomplete'}`);

  return complete;
}

/**
 * @deprecated Use checkCompletion instead
 * Kept for backwards compatibility during migration
 */
export function checkCompletionUnified(options: {
  useIntentSystem?: boolean;
  intent: Intent | null;
  enabledOffers?: OfferType[];
  currentFlow?: string | null;
  userInput: Record<string, string>;
  selectedOffer?: OfferType | null;
}): boolean {
  const { selectedOffer, enabledOffers, intent, userInput } = options;

  // Use selectedOffer if provided, otherwise fall back to first enabledOffer
  const offer = selectedOffer || (enabledOffers && enabledOffers[0]) || null;

  return checkCompletion(offer, intent, userInput);
}

/**
 * @deprecated Use checkCompletion instead
 */
export function checkFlowCompletion(
  currentFlow: string | null,
  userInput: Record<string, string>
): boolean {
  // Map flow to intent and use default offer
  const intent = currentFlow as Intent | null;
  return checkCompletion(null, intent, userInput);
}

/**
 * @deprecated Use checkCompletion instead
 */
export function checkIntentCompletion(
  intent: Intent | null,
  enabledOffers: OfferType[],
  userInput: Record<string, string>
): boolean {
  const offer = enabledOffers[0] || null;
  return checkCompletion(offer, intent, userInput);
}
