// src/lib/chat/defaultQuestions.ts
/**
 * Default Questions - Fallback questions when MongoDB config fails to load
 *
 * These are the standard real estate questions that every bot should ask.
 * Agents can customize or add to these via the setup wizard.
 * If MongoDB fetch fails, these ensure the bot still functions.
 */

import type { CustomQuestion, TimelineFlow } from '@/types/timelineBuilder.types';

const DEFAULT_BUY_QUESTIONS: CustomQuestion[] = [
  {
    id: 'buyingReason',
    question: 'Why are you looking to buy right now?',
    order: 10,
    inputType: 'buttons',
    mappingKey: 'buyingReason',
    buttons: [
      { id: 'first', label: 'First-time buyer', value: 'first-time' },
      { id: 'moveup', label: 'Moving up', value: 'moving-up' },
      { id: 'downsize', label: 'Downsizing', value: 'downsizing' },
      { id: 'invest', label: 'Investment property', value: 'investment' },
    ],
    required: true,
  },
  {
    id: 'location',
    question: 'Where are you looking to buy?',
    order: 20,
    inputType: 'text',
    mappingKey: 'location',
    placeholder: 'Type your answer...',
    required: true,
  },
  {
    id: 'budget',
    question: "What's your budget range?",
    order: 25,
    inputType: 'buttons',
    mappingKey: 'budget',
    buttons: [
      { id: 'b1', label: 'Under $400k', value: 'under $400,000' },
      { id: 'b2', label: '$400k-$600k', value: '$400,000-$600,000' },
      { id: 'b3', label: '$600k-$800k', value: '$600,000-$800,000' },
      { id: 'b4', label: '$800k+', value: 'over $800,000' },
    ],
    required: true,
  },
  {
    id: 'timeline',
    question: 'When do you want to move in?',
    order: 30,
    inputType: 'buttons',
    mappingKey: 'timeline',
    buttons: [
      { id: 'asap', label: '0-3 months (ASAP)', value: '0-3 months' },
      { id: 'soon', label: '3-6 months', value: '3-6 months' },
      { id: 'planning', label: '6-12 months', value: '6-12 months' },
      { id: 'exploring', label: 'Just exploring', value: '12+ months' },
    ],
    required: true,
  },
  {
    id: 'preApproved',
    question: 'Are you pre-approved for a mortgage?',
    order: 35,
    inputType: 'buttons',
    mappingKey: 'preApproved',
    buttons: [
      { id: 'yes', label: 'Yes, I am', value: 'yes' },
      { id: 'no', label: 'Not yet', value: 'no' },
      { id: 'working', label: 'Working on it', value: 'in-progress' },
    ],
    required: false,
  },
];

const DEFAULT_SELL_QUESTIONS: CustomQuestion[] = [
  {
    id: 'sellingReason',
    question: "What's your main reason for selling?",
    order: 10,
    inputType: 'buttons',
    mappingKey: 'sellingReason',
    buttons: [
      { id: 'relocate', label: 'Relocating', value: 'relocating' },
      { id: 'upsize', label: 'Upsizing', value: 'upsizing' },
      { id: 'downsize', label: 'Downsizing', value: 'downsizing' },
      { id: 'investment', label: 'Investment', value: 'investment' },
    ],
    required: true,
  },
  {
    id: 'location',
    question: 'Where is your property located?',
    order: 20,
    inputType: 'text',
    mappingKey: 'location',
    placeholder: 'Type your answer...',
    required: true,
  },
  {
    id: 'budget',
    question: 'What do you think your home is worth?',
    order: 25,
    inputType: 'buttons',
    mappingKey: 'budget',
    buttons: [
      { id: 'b1', label: 'Under $400k', value: 'under $400,000' },
      { id: 'b2', label: '$400k-$600k', value: '$400,000-$600,000' },
      { id: 'b3', label: '$600k-$800k', value: '$600,000-$800,000' },
      { id: 'b4', label: '$800k+', value: 'over $800,000' },
    ],
    required: true,
  },
  {
    id: 'timeline',
    question: 'When are you looking to sell?',
    order: 30,
    inputType: 'buttons',
    mappingKey: 'timeline',
    buttons: [
      { id: 'asap', label: '0-3 months (ASAP)', value: '0-3 months' },
      { id: 'soon', label: '3-6 months', value: '3-6 months' },
      { id: 'planning', label: '6-12 months', value: '6-12 months' },
      { id: 'exploring', label: 'Just exploring', value: '12+ months' },
    ],
    required: true,
  },
];

/**
 * Get default questions for a flow
 */
export function getDefaultQuestions(flow: TimelineFlow): CustomQuestion[] {
  switch (flow) {
    case 'buy':
      return DEFAULT_BUY_QUESTIONS;
    case 'sell':
      return DEFAULT_SELL_QUESTIONS;
    default:
      return DEFAULT_BUY_QUESTIONS;
  }
}

/**
 * Get all default questions keyed by flow
 */
export function getAllDefaultQuestions(): Record<TimelineFlow, CustomQuestion[]> {
  return {
    buy: DEFAULT_BUY_QUESTIONS,
    sell: DEFAULT_SELL_QUESTIONS,
  };
}
