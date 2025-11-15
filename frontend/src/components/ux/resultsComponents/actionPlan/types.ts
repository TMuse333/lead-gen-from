// src/types/actionPlan.types.ts
import { ApplicableWhen } from '@/types';

export type ActionStepCategory =
  | 'preparation'
  | 'valuation'
  | 'financial'
  | 'marketing'
  | 'search'
  | 'negotiation'
  | 'legal'
  | 'moving'
  | 'education'
  | 'relationship';

/**
 * This is the stored template in Qdrant
 * Rule-based collection — no embedding needed
 */
export interface ActionStepScenario {
  id: string;
  agentId: string;

  // Core content
  title: string;
  description: string;
  benefit?: string;

  // Resources
  resourceLink?: string;
  resourceText?: string;
  imageUrl?: string;

  // Default prioritization
  defaultPriority: number;                    // 1–10 (lower = higher priority)
  defaultUrgency: 'immediate' | 'soon' | 'later';
  defaultTimeline: string;                    // e.g. "This week", "Next 30 days"

  // Categorization
  category: ActionStepCategory;
  tags: string[];

  // Applicability — uses shared rules!
  applicableWhen: ApplicableWhen;

  // Metadata
  createdAt: Date;
  updatedAt?: Date;
  usageCount?: number;

  // Relationships
  prerequisiteStepIds?: string[];
  relatedStepIds?: string[];
}

/**
 * This is what the LLM outputs — personalized version
 */
export interface ActionStep {
  stepNumber: number;
  title: string;
  description: string;
  benefit?: string;
  resourceLink?: string;
  resourceText?: string;
  imageUrl?: string;

  priority: number;                 // Final priority after personalization
  urgency: 'immediate' | 'soon' | 'later';
  timeline: string;                 // e.g. "Start this week"
}

/**
 * Final props for the React component
 */
export interface LlmActionPlanProps {
  sectionTitle: string;
  introText?: string;
  steps: ActionStep[];
  closingNote?: string;
  overallUrgency?: 'high' | 'medium' | 'low';
}