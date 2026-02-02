// lib/offers/definitions/timeline/timeline-types.ts
/**
 * Type definitions for Real Estate Timeline Offer
 * Defines data structures for personalized real estate timelines
 */

import type { BaseOfferProps } from '../../core/types';
import type { TimelinePhaseId } from '@/types/advice.types';

// Re-export for convenience
export type { TimelinePhaseId };

// ==================== CORE TYPES ====================

/**
 * Priority level for action items
 */
export type ActionPriority = 'high' | 'medium' | 'low';

/**
 * User's real estate flow type
 * Note: 'browse' is commented out for MVP simplicity - can be re-enabled later
 */
export type TimelineFlow = 'buy' | 'sell'; // | 'browse';

/**
 * Individual action item within a phase
 */
export interface ActionItem {
  task: string;
  priority: ActionPriority;
  estimatedTime?: string; // e.g., "2-3 hours", "1 day"
  isCompleted?: boolean; // For future interactivity
  details?: string; // Additional task details
}

/**
 * External resource (document, link, etc.)
 */
export interface Resource {
  title: string;
  url?: string;
  description?: string;
  type?: 'document' | 'link' | 'video' | 'tool';
}

/**
 * Metadata about where advice came from (for debugging/analytics)
 */
export interface AdviceMetadata {
  /** IDs of Qdrant advice items used */
  sourceIds?: string[];
  /** Whether this was retrieved via placement targeting */
  usedPlacement?: boolean;
  /** The phase ID used for retrieval */
  targetPhase?: TimelinePhaseId;
}

/**
 * A single phase in the timeline
 */
export interface TimelinePhase {
  id: string; // e.g., "financial-prep", "house-hunting"
  name: string; // e.g., "Financial Preparation"
  timeline: string; // e.g., "Week 1-2", "Month 1"
  timelineVariability?: string; // e.g., "Can vary by 1-3 weeks depending on market"
  description: string; // What happens in this phase
  actionItems: ActionItem[]; // 3-5 specific tasks
  agentAdvice: string[]; // Personalized tips from Qdrant
  resources?: Resource[]; // Optional helpful resources
  isOptional?: boolean; // Can be skipped
  conditionalNote?: string; // e.g., "Skip if already pre-approved"
  order: number; // Display order
  /** Metadata about advice sources (for debugging) */
  adviceMetadata?: AdviceMetadata;
}

/**
 * User's specific situation and context
 */
export interface UserSituation {
  flow: TimelineFlow;
  timeline?: string; // e.g., "6 months", "1 year"
  location?: string; // e.g., "Austin, TX"
  budget?: string; // e.g., "$450,000"
  currentStage?: string; // e.g., "pre-approved", "just starting"
  isFirstTime?: boolean;
  additionalContext?: string;
  propertyType?: string; // e.g., "single-family", "condo"
  contactName?: string; // User's name for personalization
  contactEmail?: string; // User's email
}

/**
 * Agent/business information
 */
export interface AgentInfo {
  name: string;
  company?: string;
  contact?: string;
  email?: string;
  phone?: string;
  website?: string;
  photo?: string;
}

// ==================== OUTPUT TYPE ====================

/**
 * Complete timeline output structure (extends BaseOfferProps)
 */
export interface TimelineOutput extends BaseOfferProps {
  type: 'real-estate-timeline';
  title: string; // e.g., "Your Personal Home Buying Timeline"
  subtitle: string; // e.g., "Customized for first-time buyers in Austin, TX"
  userSituation: UserSituation;
  phases: TimelinePhase[];
  totalEstimatedTime: string; // e.g., "5-7 months"
  disclaimer: string; // Important legal/variability disclaimer
  agentInfo?: AgentInfo;
  metadata?: {
    generatedBy?: string;
    phasesCount?: number;
    totalActionItems?: number;
    storyCount?: number;
  };
}

// ==================== INPUT TYPE ====================

/**
 * Input data for timeline generation
 */
export interface TimelineInput {
  conversationData: {
    flow: TimelineFlow;
    userResponses: Record<string, any>; // All Q&A from chat
  };
  agentAdviceContext?: string; // From Qdrant (formatted advice)
  userTimeline?: string; // e.g., "6 months"
  agentInfo?: AgentInfo;
  customization?: {
    skipPhases?: string[]; // Phase IDs to skip
    emphasizePhases?: string[]; // Phase IDs to emphasize
    additionalInstructions?: string;
  };
}

// ==================== TEMPLATE TYPES ====================

/**
 * Base template for a phase (partial, gets filled by AI)
 */
export interface PhaseTemplate {
  id: string;
  name: string;
  baseTimeline: string; // Default timeline (gets adjusted)
  description: string;
  suggestedActionItems: string[]; // Suggestions for AI to customize
  isOptional?: boolean;
  conditionalNote?: string;
  order: number;
}

/**
 * Template for an entire flow (buy/sell/browse)
 */
export interface FlowTemplate {
  flow: TimelineFlow;
  displayName: string;
  description: string;
  phases: PhaseTemplate[];
  defaultTotalTime: string; // e.g., "4-6 months"
}

// ==================== HELPER TYPES ====================

/**
 * Timeline adjustment parameters
 */
export interface TimelineAdjustment {
  userTimeline: string; // e.g., "3 months", "1 year"
  compressionFactor?: number; // Multiplier for phase durations
  skipPhases?: string[];
}

/**
 * Phase filtering criteria
 */
export interface PhaseFilterCriteria {
  currentStage?: string;
  skipPhases?: string[];
  userResponses?: Record<string, any>;
}

/**
 * Validation result for timeline
 */
export interface TimelineValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
  phasesCount?: number;
  actionItemsCount?: number;
}
