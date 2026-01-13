// src/lib/offers/unified/offers/index.ts
/**
 * Unified Offers Index
 *
 * Import this file to register all offers in the registry.
 * Each offer file calls registerOffer() when imported.
 *
 * Currently only real-estate-timeline is active.
 * Other offers (pdf, home-estimate, etc.) can be added when ready.
 */

// Import active offers only (this registers them)
import './realEstateTimeline.offer';

// Re-export individual offers for direct access
export { TIMELINE_OFFER } from './realEstateTimeline.offer';

// Re-export output types
export type { TimelineOutput, TimelinePhase, UserSituation } from './realEstateTimeline.offer';
