// stores/chatStore/trackerUtils.ts - UNIFIED OFFER SYSTEM
import type { OfferType, Intent } from '../types';
import { getQuestion, getTrackingConfig } from '@/lib/offers/unified';

/**
 * Apply tracker messages from a button click using unified offer system
 */
export function applyTrackerFeedback(
  selectedOffer: OfferType,
  intent: Intent,
  questionId: string,
  answerValue: string,
  setState: (updates: { currentInsight?: string; dbActivity?: string }) => void
): void {
  const question = getQuestion(selectedOffer, intent, questionId);
  const clickedButton = question?.buttons?.find(b => b.value === answerValue);

  if (!clickedButton?.tracker) {
    console.log('⚠️ No tracker found for button:', answerValue);
    return;
  }

  const updates: { currentInsight?: string; dbActivity?: string } = {};

  if (clickedButton.tracker.insight) {
    updates.currentInsight = clickedButton.tracker.insight;
    console.log('✅ Setting insight:', clickedButton.tracker.insight);
  }

  if (clickedButton.tracker.dbMessage) {
    updates.dbActivity = clickedButton.tracker.dbMessage;
    console.log('✅ Setting dbActivity:', clickedButton.tracker.dbMessage);
  }

  setState(updates);
}

/**
 * Get tracking configuration for an offer
 */
export function getOfferTracking(offerType: OfferType) {
  return getTrackingConfig(offerType);
}

/**
 * @deprecated Use applyTrackerFeedback instead
 * Kept for backwards compatibility
 */
export function applyTrackerUnified(options: {
  useIntentSystem?: boolean;
  enabledOffers?: OfferType[];
  intent: Intent | null;
  currentFlow?: string | null;
  currentNodeId: string;
  mappingKey: string;
  answerValue: string;
  setState: (updates: { currentInsight?: string; dbActivity?: string }) => void;
  selectedOffer?: OfferType | null;
}): void {
  const {
    selectedOffer,
    enabledOffers,
    intent,
    currentNodeId,
    answerValue,
    setState,
  } = options;

  // Use selectedOffer if provided, otherwise fall back to first enabledOffer
  const offer = selectedOffer || (enabledOffers && enabledOffers[0]) || null;

  if (!offer || !intent) {
    console.log('⚠️ Missing offer or intent for tracker');
    return;
  }

  applyTrackerFeedback(offer, intent, currentNodeId, answerValue, setState);
}

/**
 * @deprecated Use applyTrackerFeedback instead
 */
export function applyButtonTracker(
  currentFlow: string,
  currentNodeId: string,
  mappingKey: string,
  answerValue: string,
  setState: (updates: { currentInsight?: string; dbActivity?: string }) => void
): void {
  // Legacy - no longer supported without offer context
  console.warn('[trackerUtils] applyButtonTracker is deprecated, use applyTrackerFeedback');
}

/**
 * @deprecated Use applyTrackerFeedback instead
 */
export function applyIntentButtonTracker(
  enabledOffers: OfferType[],
  intent: Intent,
  questionId: string,
  answerValue: string,
  setState: (updates: { currentInsight?: string; dbActivity?: string }) => void
): void {
  const offer = enabledOffers[0];
  if (offer) {
    applyTrackerFeedback(offer, intent, questionId, answerValue, setState);
  }
}
