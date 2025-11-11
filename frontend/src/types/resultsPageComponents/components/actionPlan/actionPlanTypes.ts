// types/actionSteps.types.ts

import { RuleGroup } from "@/types/advice.types";



/**
 * ActionStepScenario - Represents a reusable action step template
 * stored in Qdrant as a separate collection from AgentAdvice
 * 
 * Key differences from AgentAdvice:
 * - Structured data (not prose paragraphs)
 * - Rule-based retrieval (no embeddings/semantic search needed)
 * - Directly maps to ActionStep interface for LLM output
 * - More granular and composable
 */
export interface ActionStepScenario {
  id: string;
  agentId: string;
  
  // Core step content
  title: string;                    // "Get Professional Home Valuation"
  description: string;              // What to do & how
  benefit?: string;                 // Why this matters
  
  // Resources
  resourceLink?: string;            // "/book-valuation" or external URL
  resourceText?: string;            // "Schedule Free Valuation"
  imageUrl?: string;                // "/images/steps/valuation.jpg"
  
  // Prioritization metadata
  defaultPriority: number;          // 1-5, suggests where in sequence this falls
  defaultUrgency: 'immediate' | 'soon' | 'later';
  defaultTimeline: string;          // "This week", "Next 2 weeks"
  
  // Categorization
  category: ActionStepCategory;     // Groups related steps
  tags: string[];                   // ['valuation', 'pricing', 'selling']
  
  // Applicability rules
  applicableWhen: {
    flow?: ('sell' | 'buy' | 'browse')[];
    ruleGroups?: RuleGroup[];       // Same rule system as AgentAdvice
    minMatchScore?: number;
  };
  
  // Metadata
  createdAt: Date;
  updatedAt?: Date;
  usageCount?: number;              // Track which steps are most commonly used
  
  // Optional relationships
  prerequisiteStepIds?: string[];   // Steps that should come before this one
  relatedStepIds?: string[];        // Alternative or complementary steps
}

/**
 * Categories help organize steps and can inform LLM about step types
 */
export type ActionStepCategory = 
  | 'preparation'          // Getting ready (decluttering, repairs, research)
  | 'valuation'           // Understanding value/pricing
  | 'financial'           // Mortgage, pre-approval, budgeting
  | 'marketing'           // Photos, staging, listing
  | 'search'              // Finding properties, viewing homes
  | 'negotiation'         // Offers, counteroffers, inspections
  | 'legal'               // Contracts, disclosures, closing
  | 'moving'              // Logistics, planning, execution
  | 'education'           // Learning, exploring, understanding market
  | 'relationship';       // Meeting agent, building trust, communication

/**
 * Query parameters for retrieving action steps
 */
export interface ActionStepQuery {
  agentId: string;
  flow: 'sell' | 'buy' | 'browse';
  userInput: Record<string, string>;
  maxSteps?: number;                // Default 5
  priorityRange?: [number, number]; // e.g., [1, 3] for only high-priority steps
}

/**
 * Result from querying action steps
 */
export interface ActionStepQueryResult {
  steps: ActionStepScenario[];
  matchScores: number[];            // How well each step matches the user
  totalMatched: number;             // Total steps that passed filtering
}