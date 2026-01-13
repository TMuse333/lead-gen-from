// types/advice.types.ts
// Advice type definitions with extensible const array approach

import type { OfferType } from '@/lib/offers/unified';

/**
 * All valid advice types. Add new types here as needed.
 * This is the single source of truth for advice types.
 */
export const ADVICE_TYPES = [
  'general-advice',
  'actionable-advice',
] as const;

/**
 * Knowledge kind - distinguishes tips from stories
 * tip: General advice ("Do X when Y")
 * story: Past client experience with narrative arc
 */
export const KNOWLEDGE_KINDS = ['tip', 'story'] as const;
export type KnowledgeKind = typeof KNOWLEDGE_KINDS[number];
export const DEFAULT_KNOWLEDGE_KIND: KnowledgeKind = 'tip';

/**
 * TypeScript union type auto-generated from ADVICE_TYPES array
 */
export type AdviceType = typeof ADVICE_TYPES[number];

/**
 * Default advice type for backward compatibility
 */
export const DEFAULT_ADVICE_TYPE: AdviceType = 'general-advice';

// ==================== OFFER-SPECIFIC PLACEMENT TYPES ====================

/**
 * Timeline phase IDs - locations within the real-estate-timeline offer
 */
export type TimelinePhaseId =
  | 'financial-prep'
  | 'find-agent'
  | 'house-hunting'
  | 'make-offer'
  | 'under-contract'
  | 'closing'
  | 'post-closing'
  // Selling-specific phases
  | 'home-prep'
  | 'choose-agent-price'
  | 'list-property'
  | 'marketing-showings'
  | 'review-offers'
  | 'under-contract-sell'
  | 'closing-sell'
  // Browsing-specific phases
  | 'understand-options'
  | 'financial-education'
  | 'market-research'
  | 'decision-time'
  | 'next-steps'
  | string; // Allow custom phases

/**
 * PDF section IDs - locations within the pdf offer
 */
export type PdfSectionId =
  | 'executive-summary'
  | 'market-analysis'
  | 'property-details'
  | 'recommendations'
  | 'next-steps'
  | string;

/**
 * Video segment IDs - locations within the video offer
 */
export type VideoSegmentId =
  | 'intro'
  | 'property-tour'
  | 'neighborhood'
  | 'market-context'
  | 'call-to-action'
  | string;

/**
 * Home estimate component IDs
 */
export type EstimateComponentId =
  | 'valuation'
  | 'comparables'
  | 'market-trends'
  | 'recommendations'
  | string;

/**
 * Landing page section IDs
 */
export type LandingPageSectionId =
  | 'hero'
  | 'features'
  | 'testimonials'
  | 'cta'
  | string;

/**
 * Map of offer types to their location identifier types
 * Extend this as you add new offers
 */
export type OfferLocationMap = {
  'real-estate-timeline': TimelinePhaseId;
  'pdf': PdfSectionId;
  'video': VideoSegmentId;
  'home-estimate': EstimateComponentId;
  'landingPage': LandingPageSectionId;
  'custom': string;
};

/**
 * Placement map: which locations within which offers
 * Keys are offer types, values are arrays of location identifiers
 */
export type AdvicePlacements = Partial<{
  [K in OfferType]: string[];
}>;

// ==================== TYPE GUARDS & HELPERS ====================

/**
 * Type guard to check if a string is a valid advice type
 */
export function isValidAdviceType(type: string): type is AdviceType {
  return ADVICE_TYPES.includes(type as any);
}

/**
 * Determines the advice type from an item's tags
 * Defaults to 'general-advice' if no type tag is found
 */
export function getAdviceTypeFromTags(tags?: string[]): AdviceType {
  if (!tags || tags.length === 0) {
    return DEFAULT_ADVICE_TYPE;
  }

  // Check for each type in order (most specific first)
  for (const type of ADVICE_TYPES) {
    if (tags.includes(type)) {
      return type;
    }
  }

  // Default if no type tag found
  return DEFAULT_ADVICE_TYPE;
}

/**
 * Ensures an advice item has the correct type tag in its tags array
 * Adds the type tag if missing, preserves existing tags
 */
export function ensureTypeTag(
  tags: string[],
  type?: AdviceType
): string[] {
  const adviceType = type || DEFAULT_ADVICE_TYPE;
  const hasTypeTag = ADVICE_TYPES.some(t => tags.includes(t));

  if (hasTypeTag) {
    // Already has a type tag, return as-is
    return tags;
  }

  // Add the type tag
  return [adviceType, ...tags];
}

/**
 * Check if advice has placement for a specific offer type
 */
export function hasPlacementForOffer(
  placements: AdvicePlacements | undefined,
  offerType: OfferType
): boolean {
  if (!placements) return false;
  const locations = placements[offerType];
  return Array.isArray(locations) && locations.length > 0;
}

/**
 * Check if advice has placement for a specific location within an offer
 */
export function hasPlacementForLocation(
  placements: AdvicePlacements | undefined,
  offerType: OfferType,
  location: string
): boolean {
  if (!placements) return false;
  const locations = placements[offerType];
  return Array.isArray(locations) && locations.includes(location);
}

/**
 * Agent Advice Scenario interface (Tips/Advice)
 * Represents a tip/advice item retrieved from Qdrant
 */
export interface AgentAdviceScenario {
  id: string;
  agentId?: string;
  title: string;
  advice: string;
  tags: string[];
  type?: AdviceType; // Optional advice type
  kind?: KnowledgeKind; // tip or story (legacy - new stories use Story interface)
  applicableWhen?: {
    flow?: string[];
    /** Which offer types this advice applies to (empty = all offers) */
    offerTypes?: OfferType[];
    /** Specific locations within offers (e.g., timeline phases, pdf sections) */
    placements?: AdvicePlacements;
    conditions?: Record<string, string[]>;
    ruleGroups?: any[]; // RuleGroup[] from rules.types
    minMatchScore?: number;
  };
  createdAt: Date;
  updatedAt?: Date;
  usageCount?: number;
}

// ==================== STORY TYPES (SEPARATED) ====================

/**
 * Story - Client success story with structured narrative
 * Separated from tips/advice for cleaner data model
 */
export interface Story {
  id: string;
  agentId: string;
  title: string;
  /** Part 1: What was the client's situation/problem? */
  situation: string;
  /** Part 2: What did the agent do to help? */
  action: string;
  /** Part 3: What was the result/outcome? */
  outcome: string;
  /** Tags for categorization and matching */
  tags: string[];
  /** Which timeline phases this story should appear in */
  placements?: AdvicePlacements;
  /** Which flows this story applies to (buy/sell/browse) */
  flows?: string[];
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Input for creating a new story
 */
export interface CreateStoryInput {
  title: string;
  situation: string;
  action: string;
  outcome: string;
  tags?: string[];
  placements?: AdvicePlacements;
  flows?: string[];
}

/**
 * Input for updating an existing story
 */
export interface UpdateStoryInput extends Partial<CreateStoryInput> {
  id: string;
}

/**
 * Story matched to a user's situation for display
 */
export interface MatchedStory {
  id: string;
  title: string;
  situation: string;
  action: string;
  outcome: string;
  tags?: string[];
  matchReasons: string[];
  clientType?: string;
  location?: string;
  budget?: string;
}

// ==================== STATIC STORY MAPPING TYPES ====================

/**
 * Mapping of phase IDs to story IDs (Qdrant point IDs)
 * Allows agents to explicitly configure which stories appear in which phases
 */
export type PhaseStoryMapping = Record<string, string[]>;

/**
 * Story mappings organized by flow type
 * Each flow (buy/sell/browse) has its own phase-to-story mappings
 */
export interface StoryMappings {
  buy?: PhaseStoryMapping;
  sell?: PhaseStoryMapping;
  browse?: PhaseStoryMapping;
}

/**
 * Lightweight story reference for display
 * Minimal data needed to show a story in the timeline
 */
export interface StoryReference {
  id: string;
  title: string;
  advice: string; // The story content
  tags?: string[];
}

/**
 * Stories organized by phase for timeline rendering
 */
export type StoriesByPhase = Record<string, StoryReference[]>;
