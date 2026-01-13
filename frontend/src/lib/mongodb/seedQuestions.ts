// src/lib/mongodb/seedQuestions.ts
/**
 * Seed Utility for Default Questions
 *
 * Generates default questions from the unified offer system
 * and seeds them into MongoDB client configs.
 *
 * This is the ONLY place where hardcoded questions are used -
 * as seed data for new accounts. After seeding, MongoDB is the
 * single source of truth.
 */

import { getMergedQuestions, type Intent } from '@/lib/offers/unified';
import type {
  CustomQuestion,
  TimelineFlow,
  CustomButtonOption,
  FlowQuestionConfigs,
} from '@/types/timelineBuilder.types';

/**
 * Phase mappings - links questions to timeline phases
 */
const PHASE_MAPPINGS: Record<TimelineFlow, Record<string, string>> = {
  buy: {
    buyingReason: 'financial-prep',
    preApproved: 'financial-prep',
    location: 'house-hunting',
    budget: 'make-offer',
    timeline: 'under-contract',
  },
  sell: {
    sellingReason: 'home-prep',
    budget: 'set-price',
    location: 'list-property',
    timeline: 'marketing-showings',
  },
  browse: {
    interest: 'understand-options',
    budget: 'financial-education',
    location: 'market-research',
    timeline: 'decision-time',
  },
};

/**
 * Generate default questions for a specific flow
 * Converts unified offer questions to CustomQuestion format
 */
export function generateDefaultQuestionsForFlow(flow: TimelineFlow): CustomQuestion[] {
  const enabledOffers = ['real-estate-timeline'] as const;
  const { questions } = getMergedQuestions(enabledOffers as any, flow as Intent);
  const phaseMappings = PHASE_MAPPINGS[flow] || {};

  return questions
    // Filter out email questions - contact is collected via modal
    .filter((q) =>
      q.inputType !== 'email' &&
      q.mappingKey !== 'email' &&
      q.mappingKey !== 'contactEmail'
    )
    .map((q, index): CustomQuestion => ({
      id: q.id,
      question: q.text,
      order: q.order ?? (index + 1) * 10,
      inputType: q.inputType as CustomQuestion['inputType'],
      // CRITICAL: Always set mappingKey for answer tracking
      mappingKey: q.mappingKey || q.id,
      buttons: q.buttons?.map((btn): CustomButtonOption => ({
        id: btn.id,
        label: btn.label,
        value: btn.value,
      })),
      placeholder: q.inputType === 'text' ? 'Type your answer...' : undefined,
      required: q.required !== false,
      // Link to timeline phases
      linkedPhaseId: q.mappingKey ? phaseMappings[q.mappingKey] : undefined,
    }))
    .sort((a, b) => a.order - b.order);
}

/**
 * Generate default questions for all flows
 */
export function generateAllDefaultQuestions(): FlowQuestionConfigs {
  return {
    buy: generateDefaultQuestionsForFlow('buy'),
    sell: generateDefaultQuestionsForFlow('sell'),
    browse: generateDefaultQuestionsForFlow('browse'),
  };
}

/**
 * Get a summary of default questions (for logging/debugging)
 */
export function getDefaultQuestionsSummary(): Record<TimelineFlow, { count: number; questions: string[] }> {
  const allQuestions = generateAllDefaultQuestions();

  return {
    buy: {
      count: allQuestions.buy?.length || 0,
      questions: allQuestions.buy?.map(q => `${q.id} (${q.inputType}, order: ${q.order})`) || [],
    },
    sell: {
      count: allQuestions.sell?.length || 0,
      questions: allQuestions.sell?.map(q => `${q.id} (${q.inputType}, order: ${q.order})`) || [],
    },
    browse: {
      count: allQuestions.browse?.length || 0,
      questions: allQuestions.browse?.map(q => `${q.id} (${q.inputType}, order: ${q.order})`) || [],
    },
  };
}
