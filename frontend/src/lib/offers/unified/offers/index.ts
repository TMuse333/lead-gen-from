// src/lib/offers/unified/offers/index.ts
/**
 * Unified Offers Index
 *
 * Import this file to register all offers in the registry.
 * Each offer file calls registerOffer() when imported.
 */

// Import all offers (this registers them)
import './realEstateTimeline.offer';
import './homeEstimate.offer';
import './pdf.offer';
import './video.offer';
import './landingPage.offer';

// Re-export individual offers for direct access
export { TIMELINE_OFFER } from './realEstateTimeline.offer';
export { HOME_ESTIMATE_OFFER } from './homeEstimate.offer';
export { PDF_OFFER } from './pdf.offer';
export { VIDEO_OFFER } from './video.offer';
export { LANDING_PAGE_OFFER } from './landingPage.offer';

// Re-export output types
export type { TimelineOutput, TimelinePhase, UserSituation } from './realEstateTimeline.offer';
export type { HomeEstimateOutput } from './homeEstimate.offer';
export type { PdfOutput } from './pdf.offer';
export type { VideoOutput } from './video.offer';
export type { LandingPageOutput } from './landingPage.offer';
