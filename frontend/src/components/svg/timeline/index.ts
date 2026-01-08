// Timeline SVG Components - organized by intent
// Each intent (buy, sell, browse) has its own set of phase icons

// ============================================
// BUYING INTENT - 7 phases
// ============================================
export { default as PreApprovalSuccess } from './PreApprovalSuccess';
export { default as AgentPartnership } from './AgentPartnership';
export { default as HotListingSearch } from './HotListingSearch'; // house-hunting
export { default as OfferAccepted } from './OfferAccepted';
export { default as HomeInspection } from './HomeInspection';
export { default as KeyHandoff } from './KeyHandoff'; // closing
export { default as MovingDay } from './MovingDay'; // post-closing
export { default as TimelineProgress } from './TimelineProgress';

// ============================================
// SELLING INTENT - 7 phases
// ============================================
export { default as HomeValuation } from './HomeValuation'; // financial-prep equivalent
export { default as StagingPrep } from './StagingPrep'; // home-prep
export { default as ListingLive } from './ListingLive'; // list-property
export { default as ShowingDay } from './ShowingDay'; // marketing-showings
export { default as OfferReview } from './OfferReview'; // review-offers
export { default as ClosingSale } from './ClosingSale'; // closing
export { default as SellingTimelineProgress } from './SellingTimelineProgress';

// ============================================
// BROWSING INTENT - 5 phases
// ============================================
export { default as NeighborhoodExplore } from './NeighborhoodExplore'; // understand-options
export { default as PropertySearch } from './PropertySearch'; // market-research
export { default as SaveFavorites } from './SaveFavorites'; // financial-education
export { default as CompareHomes } from './CompareHomes'; // decision-time
export { default as ReadyToAct } from './ReadyToAct'; // next-steps
export { default as BrowsingTimelineProgress } from './BrowsingTimelineProgress';

// ============================================
// PHASE TO SVG MAPPING
// ============================================
import type { ComponentType } from 'react';

// Import all components for the mapping
import PreApprovalSuccess from './PreApprovalSuccess';
import AgentPartnership from './AgentPartnership';
import HotListingSearch from './HotListingSearch';
import OfferAccepted from './OfferAccepted';
import HomeInspection from './HomeInspection';
import KeyHandoff from './KeyHandoff';
import MovingDay from './MovingDay';
import HomeValuation from './HomeValuation';
import StagingPrep from './StagingPrep';
import ListingLive from './ListingLive';
import ShowingDay from './ShowingDay';
import OfferReview from './OfferReview';
import ClosingSale from './ClosingSale';
import NeighborhoodExplore from './NeighborhoodExplore';
import PropertySearch from './PropertySearch';
import SaveFavorites from './SaveFavorites';
import CompareHomes from './CompareHomes';
import ReadyToAct from './ReadyToAct';

export type PhaseIconProps = {
  className?: string;
};

/**
 * Maps phase IDs to their SVG component for each intent
 */
export const PHASE_ICONS: Record<string, Record<string, ComponentType<PhaseIconProps>>> = {
  buy: {
    'financial-prep': PreApprovalSuccess,
    'find-agent': AgentPartnership,
    'house-hunting': HotListingSearch,
    'make-offer': OfferAccepted,
    'under-contract': HomeInspection,
    'closing': KeyHandoff,
    'post-closing': MovingDay,
  },
  sell: {
    'financial-prep': HomeValuation, // Getting home valued
    'home-prep': StagingPrep,
    'choose-agent-price': AgentPartnership, // Reuse for agent selection
    'list-property': ListingLive,
    'marketing-showings': ShowingDay,
    'review-offers': OfferReview,
    'under-contract-sell': HomeInspection, // Buyer's inspection
    'closing-sell': ClosingSale,
  },
  browse: {
    'understand-options': NeighborhoodExplore,
    'financial-education': SaveFavorites,
    'market-research': PropertySearch,
    'decision-time': CompareHomes,
    'next-steps': ReadyToAct,
  },
};

/**
 * Get the appropriate SVG icon for a phase based on intent
 */
export function getPhaseIcon(
  intent: 'buy' | 'sell' | 'browse',
  phaseId: string
): ComponentType<PhaseIconProps> | null {
  return PHASE_ICONS[intent]?.[phaseId] || null;
}
