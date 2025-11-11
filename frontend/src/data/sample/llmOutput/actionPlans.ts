// lib/sampleData/actionStepsSeedData.ts

import { LlmActionPlan } from "@/types/resultsPageComponents/components/actionPlan/actionPlan";
import { ActionStep } from "../../../types/resultsPageComponents/components/actionPlan/actionPlan";
import { ActionStepScenario } from "../../../types/resultsPageComponents/components/actionPlan/actionPlanTypes";



/**
 * MVP Action Steps - 10 foundational steps across sell/buy/browse flows
 * 
 * These are PLACEHOLDER steps with generic content.
 * Chris will need to:
 * 1. Review and refine the descriptions/benefits
 * 2. Add actual resource links (his Calendly, PDFs, partner links)
 * 3. Adjust timelines to match his process
 * 4. Fine-tune applicability rules based on his experience
 */

// ==================== SELLER FLOW STEPS (4 steps) ====================


export const SELLER_PREPARATION_PLAN: LlmActionPlan = {
    sectionTitle: 'Prepare Your Home for Market',
    introText:
      'These steps will help you get your home ready to attract serious buyers and maximize your sale price.',
    steps: [
      {
        stepNumber: 1,
        title: 'Declutter and Deep Clean',
        description:
          'Remove personal items, organize spaces, and ensure your home is spotless. First impressions are critical to attract serious buyers.',
        benefit: 'Clean, clutter-free homes sell faster and appear more valuable',
        resourceLink: '/resources/home-prep-checklist',
        resourceText: 'Download Prep Checklist',
        imageUrl: '/images/steps/preparation.jpg',
        priority: 2,
        urgency: 'soon',
        timeline: 'Next 2 weeks',
      },
      {
        stepNumber: 2,
        title: 'Minor Repairs and Maintenance',
        description:
          'Fix leaky faucets, squeaky doors, chipped paint, and other small issues. Buyers notice details, and addressing them increases perceived value.',
        benefit: 'Homes with all repairs done sell more confidently and quickly',
        resourceLink: '/resources/home-repair-tips',
        resourceText: 'Repair Tips',
        imageUrl: '/images/steps/repairs.jpg',
        priority: 2,
        urgency: 'soon',
        timeline: 'Next 2 weeks',
      },
      {
        stepNumber: 3,
        title: 'Stage Key Rooms',
        description:
          'Arrange furniture to highlight spaciousness and natural flow. Emphasize the living areas, kitchen, and master bedroom. Consider renting accent pieces if needed.',
        benefit: 'Staged rooms photograph better and help buyers visualize living there',
        resourceLink: '/resources/home-staging-tips',
        resourceText: 'Staging Guide',
        imageUrl: '/images/steps/staging.jpg',
        priority: 1,
        urgency: 'immediate',
        timeline: 'Next week',
      },
      {
        stepNumber: 4,
        title: 'Enhance Curb Appeal',
        description:
          'Ensure the exterior looks inviting: mow the lawn, trim hedges, plant flowers, and clean the entrance. First impressions start outside.',
        benefit: 'Homes with strong curb appeal attract more buyers and better offers',
        resourceLink: '/resources/curb-appeal-tips',
        resourceText: 'Curb Appeal Guide',
        imageUrl: '/images/steps/curb-appeal.jpg',
        priority: 2,
        urgency: 'soon',
        timeline: 'Next 1–2 weeks',
      },
    ],
    closingNote:
      'Following these preparation steps will increase buyer interest and help you achieve the best possible sale price.',
    overallUrgency: 'medium',
  };


export const SELLER_STEP_VALUATION: ActionStepScenario = {
  id: 'sell-valuation-001',
  agentId: 'chris-agent-id', // Replace with actual agent ID
  
  title: 'Get Professional Home Valuation',
  description: 'Schedule a comprehensive market analysis to understand your home\'s current value. We\'ll review recent comparable sales, current market conditions, and your home\'s unique features to establish an accurate baseline price.',
  benefit: 'Accurate pricing from day one means faster sale and maximum value',
  
  resourceLink: '/book-valuation', // Chris needs to provide actual link
  resourceText: 'Schedule Free Valuation',
  imageUrl: '/images/steps/valuation.jpg',
  
  defaultPriority: 1,
  defaultUrgency: 'immediate',
  defaultTimeline: 'This week',
  
  category: 'valuation',
  tags: ['selling', 'valuation', 'pricing', 'market-analysis'],
  
  applicableWhen: {
    flow: ['sell'],
    ruleGroups: [
      {
        logic: 'OR',
        rules: [
          { field: 'timeline', operator: 'equals', value: '0-3', weight: 10 },
          { field: 'timeline', operator: 'equals', value: '3-6', weight: 8 },
        ]
      }
    ],
    minMatchScore: 0.5
  },
  
  createdAt: new Date(),
  usageCount: 0,
};

export const SELLER_STEP_PREPARATION: ActionStepScenario = {
  id: 'sell-prep-001',
  agentId: 'chris-agent-id',
  
  title: 'Prepare Your Home for Market',
  description: 'Start decluttering, deep cleaning, and making minor repairs. First impressions are critical. Remove personal items, organize spaces, and ensure your home shows at its absolute best to attract serious buyers.',
  benefit: 'Well-presented homes sell 30% faster and for higher prices',
  
  resourceLink: '/resources/home-prep-checklist', // Placeholder
  resourceText: 'Download Prep Checklist',
  imageUrl: '/images/steps/preparation.jpg',
  
  defaultPriority: 2,
  defaultUrgency: 'soon',
  defaultTimeline: 'Next 2 weeks',
  
  category: 'preparation',
  tags: ['selling', 'preparation', 'staging', 'cleaning', 'repairs'],
  
  applicableWhen: {
    flow: ['sell'],
    ruleGroups: [
      {
        logic: 'OR',
        rules: [
          { field: 'timeline', operator: 'equals', value: '0-3', weight: 10 },
          { field: 'timeline', operator: 'equals', value: '3-6', weight: 9 },
          { field: 'timeline', operator: 'equals', value: '6-12', weight: 7 },
        ]
      }
    ],
    minMatchScore: 0.5
  },
  
  createdAt: new Date(),
  usageCount: 0,
};

export const SELLER_STEP_PHOTOGRAPHY: ActionStepScenario = {
  id: 'sell-photo-001',
  agentId: 'chris-agent-id',
  
  title: 'Schedule Professional Photography',
  description: 'High-quality photos are essential for online listings. I\'ll arrange a professional photographer to capture your home in the best light. Photos should be taken after your home is fully prepared and staged.',
  benefit: 'Professional photos generate 118% more online views than amateur shots',
  
  resourceLink: '/book-photography', // Placeholder
  resourceText: 'Book Photo Session',
  imageUrl: '/images/steps/photography.jpg',
  
  defaultPriority: 3,
  defaultUrgency: 'soon',
  defaultTimeline: 'Week 3',
  
  category: 'marketing',
  tags: ['selling', 'photography', 'marketing', 'listing'],
  
  applicableWhen: {
    flow: ['sell'],
    ruleGroups: [
      {
        logic: 'OR',
        rules: [
          { field: 'timeline', operator: 'equals', value: '0-3', weight: 10 },
          { field: 'timeline', operator: 'equals', value: '3-6', weight: 8 },
        ]
      }
    ],
    minMatchScore: 0.6
  },
  
  createdAt: new Date(),
  usageCount: 0,
};

export const SELLER_STEP_LISTING: ActionStepScenario = {
  id: 'sell-listing-001',
  agentId: 'chris-agent-id',
  
  title: 'Launch Your Listing',
  description: 'Once photos are ready and price is confirmed, we\'ll create a compelling listing and launch across all major platforms. I\'ll handle MLS, social media promotion, and outreach to my buyer network.',
  benefit: 'Maximum exposure means more offers and better negotiating position',
  
  resourceLink: undefined,
  resourceText: undefined,
  imageUrl: '/images/steps/listing.jpg',
  
  defaultPriority: 4,
  defaultUrgency: 'soon',
  defaultTimeline: 'Week 4',
  
  category: 'marketing',
  tags: ['selling', 'listing', 'marketing', 'mls', 'promotion'],
  
  applicableWhen: {
    flow: ['sell'],
    ruleGroups: [
      {
        logic: 'OR',
        rules: [
          { field: 'timeline', operator: 'equals', value: '0-3', weight: 10 },
          { field: 'timeline', operator: 'equals', value: '3-6', weight: 9 },
        ]
      }
    ],
    minMatchScore: 0.7
  },
  
  createdAt: new Date(),
  usageCount: 0,
  prerequisiteStepIds: ['sell-valuation-001', 'sell-photo-001'],
};

// ==================== BUYER FLOW STEPS (4 steps) ====================

export const BUYER_STEP_PREAPPROVAL: ActionStepScenario = {
  id: 'buy-preapproval-001',
  agentId: 'chris-agent-id',
  
  title: 'Get Mortgage Pre-Approval',
  description: 'Connect with a trusted mortgage broker to understand your buying power and get pre-approved. This shows sellers you\'re a serious buyer and helps you move quickly when you find the right home.',
  benefit: 'Pre-approved buyers win 40% more competitive bidding situations',
  
  resourceLink: '/resources/mortgage-partners', // Placeholder
  resourceText: 'View Mortgage Partners',
  imageUrl: '/images/steps/preapproval.jpg',
  
  defaultPriority: 1,
  defaultUrgency: 'immediate',
  defaultTimeline: 'This week',
  
  category: 'financial',
  tags: ['buying', 'mortgage', 'pre-approval', 'financing'],
  
  applicableWhen: {
    flow: ['buy'],
    ruleGroups: [
      {
        logic: 'OR',
        rules: [
          { field: 'timeline', operator: 'equals', value: '0-3', weight: 10 },
          { field: 'timeline', operator: 'equals', value: '3-6', weight: 9 },
        ]
      }
    ],
    minMatchScore: 0.5
  },
  
  createdAt: new Date(),
  usageCount: 0,
};

export const BUYER_STEP_SEARCH_CRITERIA: ActionStepScenario = {
  id: 'buy-criteria-001',
  agentId: 'chris-agent-id',
  
  title: 'Define Your Home Criteria',
  description: 'Let\'s meet to clarify your must-haves, nice-to-haves, and deal-breakers. We\'ll discuss neighborhoods, property types, and lifestyle needs so I can set up a custom search that sends you only relevant listings.',
  benefit: 'Clear criteria saves time and helps you act fast on the right properties',
  
  resourceLink: '/book-consultation', // Placeholder
  resourceText: 'Schedule Planning Call',
  imageUrl: '/images/steps/criteria.jpg',
  
  defaultPriority: 2,
  defaultUrgency: 'immediate',
  defaultTimeline: 'This week',
  
  category: 'search',
  tags: ['buying', 'search', 'criteria', 'planning'],
  
  applicableWhen: {
    flow: ['buy'],
    ruleGroups: [
      {
        logic: 'OR',
        rules: [
          { field: 'timeline', operator: 'equals', value: '0-3', weight: 10 },
          { field: 'timeline', operator: 'equals', value: '3-6', weight: 8 },
          { field: 'timeline', operator: 'equals', value: '6-12', weight: 6 },
        ]
      }
    ],
    minMatchScore: 0.5
  },
  
  createdAt: new Date(),
  usageCount: 0,
};

export const BUYER_STEP_VIEWINGS: ActionStepScenario = {
  id: 'buy-viewings-001',
  agentId: 'chris-agent-id',
  
  title: 'Start Viewing Properties',
  description: 'I\'ll arrange viewings for homes that match your criteria. Plan to see 5-10 properties to understand the market and refine what you\'re looking for. I\'ll point out important details you might miss.',
  benefit: 'Seeing multiple properties quickly helps you recognize value and act confidently',
  
  resourceLink: undefined,
  resourceText: undefined,
  imageUrl: '/images/steps/viewings.jpg',
  
  defaultPriority: 3,
  defaultUrgency: 'soon',
  defaultTimeline: 'Next 2 weeks',
  
  category: 'search',
  tags: ['buying', 'viewings', 'showings', 'tours'],
  
  applicableWhen: {
    flow: ['buy'],
    ruleGroups: [
      {
        logic: 'OR',
        rules: [
          { field: 'timeline', operator: 'equals', value: '0-3', weight: 10 },
          { field: 'timeline', operator: 'equals', value: '3-6', weight: 9 },
        ]
      }
    ],
    minMatchScore: 0.6
  },
  
  createdAt: new Date(),
  usageCount: 0,
  prerequisiteStepIds: ['buy-preapproval-001', 'buy-criteria-001'],
};

export const BUYER_STEP_OFFER: ActionStepScenario = {
  id: 'buy-offer-001',
  agentId: 'chris-agent-id',
  
  title: 'Prepare Your Offer Strategy',
  description: 'When you find the right home, we\'ll review comparable sales, assess competition, and craft a strategic offer. I\'ll help you understand what price and terms will be competitive while protecting your interests.',
  benefit: 'Strategic offers get accepted while keeping you from overpaying',
  
  resourceLink: undefined,
  resourceText: undefined,
  imageUrl: '/images/steps/offer.jpg',
  
  defaultPriority: 4,
  defaultUrgency: 'later',
  defaultTimeline: 'When you find the one',
  
  category: 'negotiation',
  tags: ['buying', 'offer', 'negotiation', 'strategy'],
  
  applicableWhen: {
    flow: ['buy'],
    ruleGroups: [
      {
        logic: 'OR',
        rules: [
          { field: 'timeline', operator: 'equals', value: '0-3', weight: 10 },
          { field: 'timeline', operator: 'equals', value: '3-6', weight: 8 },
        ]
      }
    ],
    minMatchScore: 0.7
  },
  
  createdAt: new Date(),
  usageCount: 0,
  prerequisiteStepIds: ['buy-viewings-001'],
};

// ==================== BROWSER FLOW STEPS (2 steps) ====================

export const BROWSER_STEP_MARKET_REPORT: ActionStepScenario = {
  id: 'browse-report-001',
  agentId: 'chris-agent-id',
  
  title: 'Review Current Market Report',
  description: 'I\'ll send you my latest market analysis for your area of interest. This includes price trends, inventory levels, days on market, and my insights on where things are heading.',
  benefit: 'Understanding the market helps you time your move and set expectations',
  
  resourceLink: '/request-market-report', // Placeholder
  resourceText: 'Get Free Market Report',
  imageUrl: '/images/steps/market-report.jpg',
  
  defaultPriority: 1,
  defaultUrgency: 'soon',
  defaultTimeline: 'This week',
  
  category: 'education',
  tags: ['browsing', 'market', 'education', 'trends', 'research'],
  
  applicableWhen: {
    flow: ['browse'],
    ruleGroups: [
      {
        logic: 'OR',
        rules: [
          { field: 'interest', operator: 'equals', value: 'market-trends', weight: 10 },
          { field: 'interest', operator: 'equals', value: 'investment', weight: 8 },
        ]
      }
    ],
    minMatchScore: 0.5
  },
  
  createdAt: new Date(),
  usageCount: 0,
};

export const BROWSER_STEP_CONSULTATION: ActionStepScenario = {
  id: 'browse-consult-001',
  agentId: 'chris-agent-id',
  
  title: 'Schedule No-Pressure Consultation',
  description: 'Let\'s have a casual 15-minute call to discuss your real estate interests. No sales pitch - just a conversation about your situation, questions you have, and how I can be a resource when you\'re ready.',
  benefit: 'Getting to know each other now means smoother process later',
  
  resourceLink: '/book-consultation', // Placeholder
  resourceText: 'Book 15-Min Call',
  imageUrl: '/images/steps/consultation.jpg',
  
  defaultPriority: 2,
  defaultUrgency: 'later',
  defaultTimeline: 'When you\'re ready',
  
  category: 'relationship',
  tags: ['browsing', 'consultation', 'meeting', 'relationship'],
  
  applicableWhen: {
    flow: ['browse'],
    ruleGroups: [
      {
        logic: 'OR',
        rules: [
          { field: 'goal', operator: 'equals', value: 'buy-future', weight: 8 },
          { field: 'goal', operator: 'equals', value: 'sell-future', weight: 8 },
          { field: 'goal', operator: 'equals', value: 'invest', weight: 7 },
        ]
      }
    ],
    minMatchScore: 0.4
  },
  
  createdAt: new Date(),
  usageCount: 0,
};

// ==================== EXPORT ALL STEPS ====================

// export const MVP_ACTION_STEPS: ActionStepScenario[] = [
//   // Seller steps
//   SELLER_STEP_VALUATION,
//   SELLER_STEP_PREPARATION,
//   SELLER_STEP_PHOTOGRAPHY,
//   SELLER_STEP_LISTING,
  
//   // Buyer steps
//   BUYER_STEP_PREAPPROVAL,
//   BUYER_STEP_SEARCH_CRITERIA,
//   BUYER_STEP_VIEWINGS,
//   BUYER_STEP_OFFER,
  
//   // Browser steps
//   BROWSER_STEP_MARKET_REPORT,
//   BROWSER_STEP_CONSULTATION,
// ];

// /**
//  * Helper to get steps by flow
//  */
// export function getStepsByFlow(flow: 'sell' | 'buy' | 'browse'): ActionStepScenario[] {
//   return MVP_ACTION_STEPS.filter(step => 
//     step.applicableWhen.flow?.includes(flow)
//   );
// }

// /**
//  * Helper to seed Qdrant with these steps
//  */
// export async function seedActionSteps() {
//   // This will be implemented in lib/qdrant/actionSteps.ts
//   // Similar to how you seed AgentAdvice
//   console.log('Seeding action steps to Qdrant...');
//   // Implementation will use your Qdrant client
// }