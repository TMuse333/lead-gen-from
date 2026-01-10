// lib/offers/definitions/timeline/timeline-templates.ts
/**
 * Base templates for Real Estate Timelines
 * Provides structure for buy/sell/browse flows
 */

import type { PhaseTemplate, FlowTemplate, TimelineFlow } from './timeline-types';

// ==================== BUYING TIMELINE TEMPLATE ====================

const BUYING_PHASES: PhaseTemplate[] = [
  {
    id: 'financial-prep',
    name: 'Financial Preparation',
    baseTimeline: 'Week 1-2',
    description: 'Get your finances in order and understand your buying power',
    suggestedActionItems: [
      'Get pre-approved for a mortgage',
      'Review your credit score and fix any issues',
      'Calculate your total budget including down payment and closing costs',
      'Save for down payment (typically 3-20% of purchase price)',
      'Gather financial documents (tax returns, pay stubs, bank statements)',
    ],
    conditionalNote: 'Skip if already pre-approved',
    order: 1,
  },
  {
    id: 'house-hunting',
    name: 'House Hunting',
    baseTimeline: 'Week 2-7',
    description: 'Search for properties that meet your needs and budget',
    suggestedActionItems: [
      'Create a list of must-haves vs nice-to-haves',
      'Tour properties with your agent',
      'Attend open houses in target neighborhoods',
      'Research neighborhoods (schools, amenities, commute)',
      'Narrow down to top 2-3 properties',
    ],
    order: 2,
  },
  {
    id: 'make-offer',
    name: 'Make an Offer',
    baseTimeline: 'Week 7-9',
    description: 'Submit a competitive offer on your chosen property',
    suggestedActionItems: [
      'Work with your agent to determine fair offer price',
      'Include appropriate contingencies (inspection, financing, appraisal)',
      'Submit offer letter with pre-approval',
      'Negotiate terms if there are counteroffers',
      'Celebrate when offer is accepted!',
    ],
    order: 3,
  },
  {
    id: 'under-contract',
    name: 'Under Contract',
    baseTimeline: 'Week 9-13',
    description: 'Complete due diligence and finalize financing',
    suggestedActionItems: [
      'Schedule and attend home inspection',
      'Negotiate repairs or credits based on inspection findings',
      'Complete appraisal with your lender',
      'Finalize mortgage and review loan documents',
      'Purchase homeowners insurance',
      'Do final walkthrough before closing',
    ],
    order: 4,
  },
  {
    id: 'closing',
    name: 'Closing Day',
    baseTimeline: 'Week 13-15',
    description: 'Sign paperwork and receive keys to your new home',
    suggestedActionItems: [
      'Review closing disclosure 3 days before closing',
      'Wire funds or bring certified check for closing costs',
      'Attend closing appointment and sign documents',
      'Receive keys and garage door openers',
      'Set up utilities and change locks',
      'Move in and enjoy your new home!',
    ],
    order: 5,
  },
  {
    id: 'post-closing',
    name: 'Post-Closing',
    baseTimeline: 'Week 15+',
    description: 'Settle into your new home',
    suggestedActionItems: [
      'Update your address with USPS, banks, and services',
      'File homestead exemption if applicable',
      'Set up maintenance schedule for your home',
      'Get to know your neighbors',
      'Leave a review for your agent!',
    ],
    isOptional: true,
    order: 6,
  },
];

export const BUYING_TEMPLATE: FlowTemplate = {
  flow: 'buy',
  displayName: 'Home Buying Timeline',
  description: 'Step-by-step guide for purchasing a home',
  phases: BUYING_PHASES,
  defaultTotalTime: '4-6 months',
};

// ==================== SELLING TIMELINE TEMPLATE ====================

const SELLING_PHASES: PhaseTemplate[] = [
  {
    id: 'home-prep',
    name: 'Prepare Your Home',
    baseTimeline: 'Week 1-4',
    description: 'Make your home market-ready to attract buyers and maximize value',
    suggestedActionItems: [
      'Declutter and deep clean every room',
      'Make necessary repairs (fix leaks, patch walls, etc.)',
      'Consider professional staging',
      'Improve curb appeal (landscaping, paint, etc.)',
      'Organize and pack personal items',
    ],
    order: 1,
  },
  {
    id: 'set-price',
    name: 'Set Your Listing Price',
    baseTimeline: 'Week 4-5',
    description: 'Work with your agent to determine optimal listing price',
    suggestedActionItems: [
      'Review comparative market analysis (CMA) with your agent',
      'Discuss pricing strategy based on market conditions',
      'Consider recent comparable sales in your area',
      'Set competitive listing price',
      'Finalize marketing strategy and timeline',
    ],
    order: 2,
  },
  {
    id: 'list-property',
    name: 'List Your Property',
    baseTimeline: 'Week 5-6',
    description: 'Create compelling listing and go live on the market',
    suggestedActionItems: [
      'Schedule professional photography',
      'Create detailed listing description',
      'List on MLS and major real estate websites',
      'Install lockbox and showing instructions',
      'Prepare for showings (clean, depersonalize)',
    ],
    order: 3,
  },
  {
    id: 'marketing-showings',
    name: 'Marketing & Showings',
    baseTimeline: 'Week 6-10',
    description: 'Market your home and accommodate buyer showings',
    suggestedActionItems: [
      'Host open houses (typically weekends)',
      'Accommodate private showings',
      'Keep home clean and ready to show',
      'Gather feedback from showings',
      'Adjust price or strategy if needed',
    ],
    order: 4,
  },
  {
    id: 'review-offers',
    name: 'Review & Negotiate Offers',
    baseTimeline: 'Week 10-12',
    description: 'Evaluate offers and negotiate best terms',
    suggestedActionItems: [
      'Review all offers with your agent',
      'Compare price, contingencies, and buyer qualifications',
      'Counter-negotiate if needed',
      'Accept best offer',
      'Notify other potential buyers',
    ],
    order: 5,
  },
  {
    id: 'under-contract-sell',
    name: 'Under Contract',
    baseTimeline: 'Week 12-16',
    description: 'Work with buyer through due diligence period',
    suggestedActionItems: [
      'Accommodate buyer\'s home inspection',
      'Negotiate repair requests or credits',
      'Cooperate with appraiser',
      'Address any title issues',
      'Prepare for final walkthrough',
    ],
    order: 6,
  },
  {
    id: 'closing-sell',
    name: 'Closing',
    baseTimeline: 'Week 16-18',
    description: 'Complete the sale and transfer ownership',
    suggestedActionItems: [
      'Review closing statement',
      'Complete any agreed-upon repairs',
      'Attend closing appointment',
      'Hand over keys, garage openers, and manuals',
      'Receive proceeds from sale',
      'Cancel utilities and forward mail',
    ],
    order: 7,
  },
];

export const SELLING_TEMPLATE: FlowTemplate = {
  flow: 'sell',
  displayName: 'Home Selling Timeline',
  description: 'Step-by-step guide for selling your home',
  phases: SELLING_PHASES,
  defaultTotalTime: '4-5 months',
};

// ==================== BROWSING TIMELINE TEMPLATE ====================

const BROWSING_PHASES: PhaseTemplate[] = [
  {
    id: 'understand-options',
    name: 'Understand Your Options',
    baseTimeline: 'Week 1-2',
    description: 'Explore whether buying, selling, or investing is right for you',
    suggestedActionItems: [
      'Assess your current housing situation',
      'Research buy vs rent considerations',
      'Understand current market conditions',
      'Evaluate your financial readiness',
      'Identify your goals (investment, primary residence, etc.)',
    ],
    order: 1,
  },
  {
    id: 'financial-education',
    name: 'Financial Education',
    baseTimeline: 'Week 2-4',
    description: 'Learn about real estate financing and costs',
    suggestedActionItems: [
      'Learn how mortgages work (fixed vs ARM, terms, etc.)',
      'Understand down payment requirements',
      'Check your credit score and understand its impact',
      'Research closing costs and ongoing expenses',
      'Explore first-time buyer programs if applicable',
    ],
    order: 2,
  },
  {
    id: 'market-research',
    name: 'Market Research',
    baseTimeline: 'Week 4-8',
    description: 'Research neighborhoods and market trends',
    suggestedActionItems: [
      'Explore different neighborhoods',
      'Research school districts if relevant',
      'Analyze price trends in areas of interest',
      'Check inventory levels and competition',
      'Attend open houses to get a feel for the market',
    ],
    order: 3,
  },
  {
    id: 'decision-time',
    name: 'Decision Time',
    baseTimeline: 'Week 8-12',
    description: 'Decide if and when you\'re ready to move forward',
    suggestedActionItems: [
      'Evaluate your timeline (ready now vs 6-12 months)',
      'Assess financial preparedness',
      'Connect with a real estate agent for guidance',
      'Get pre-qualified to understand your options',
      'Make a go/no-go decision',
    ],
    order: 4,
  },
  {
    id: 'next-steps',
    name: 'Next Steps',
    baseTimeline: 'Week 12+',
    description: 'Take action based on your decision',
    suggestedActionItems: [
      'If buying: Move to the home buying timeline',
      'If selling: Move to the home selling timeline',
      'If waiting: Set up alerts and continue researching',
      'If investing: Explore investment property strategies',
      'Stay in touch with your agent for updates',
    ],
    isOptional: true,
    order: 5,
  },
];

export const BROWSING_TEMPLATE: FlowTemplate = {
  flow: 'browse',
  displayName: 'Real Estate Exploration Timeline',
  description: 'Educational guide for those exploring real estate options',
  phases: BROWSING_PHASES,
  defaultTotalTime: '2-3 months',
};

// ==================== TEMPLATE REGISTRY ====================

/**
 * Get template by flow type
 */
export function getFlowTemplate(flow: TimelineFlow): FlowTemplate {
  switch (flow) {
    case 'buy':
      return BUYING_TEMPLATE;
    case 'sell':
      return SELLING_TEMPLATE;
    case 'browse':
      return BROWSING_TEMPLATE;
    default:
      return BUYING_TEMPLATE; // Fallback
  }
}

/**
 * Get all templates
 */
export function getAllTemplates(): FlowTemplate[] {
  return [BUYING_TEMPLATE, SELLING_TEMPLATE, BROWSING_TEMPLATE];
}

/**
 * Get template phases by flow
 */
export function getTemplatePhases(flow: TimelineFlow): PhaseTemplate[] {
  return getFlowTemplate(flow).phases;
}
