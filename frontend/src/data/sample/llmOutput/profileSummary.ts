// lib/sampleData/profileSummarySamples.ts

import { LlmProfileSummary } from '@/types/resultsPageComponents/components/profileSummary';

// ==================== SELLER FLOW SAMPLES ====================

export const SELLER_URGENT_PROFILE: LlmProfileSummary = {
  overview: "You're preparing to sell a 10-20 year old single-family home in Halifax with a recently renovated kitchen. You're planning to relocate within the next 3 months, which means timing and efficiency are your top priorities.",
  keyHighlights: [
    {
      icon: '🏠',
      label: 'Property Type',
      value: 'Single-family house',
      context: 'High demand - 87% sell within 30 days in your area'
    },
    {
      icon: '📅',
      label: 'Property Age',
      value: '10-20 years',
      context: 'Sweet spot for buyers - modern enough, established neighborhood'
    },
    {
      icon: '🔨',
      label: 'Renovations',
      value: 'Kitchen',
      context: 'Smart investment - typically adds $15K-25K in value'
    },
    {
      icon: '⏱️',
      label: 'Timeline',
      value: '0-3 months',
      context: 'Perfect timing for spring market rush'
    },
    {
      icon: '💭',
      label: 'Selling Reason',
      value: 'Relocating',
      context: "I've helped 15+ families with smooth relocation sales"
    }
  ],
  timelineBadge: {
    text: 'Selling Soon',
    variant: 'urgent'
  }
};

export const SELLER_PLANNED_PROFILE: LlmProfileSummary = {
  overview: "You're planning to sell your townhouse in Bedford over the next 6-12 months. This gives us plenty of time to strategically prepare your home and choose the optimal listing window for maximum value.",
  keyHighlights: [
    {
      icon: '🏠',
      label: 'Property Type',
      value: 'Townhouse',
      context: 'Popular with first-time buyers and downsizers'
    },
    {
      icon: '⏱️',
      label: 'Timeline',
      value: '6-12 months',
      context: 'Ideal preparation time for 10-15% higher sale price'
    },
    {
      icon: '📍',
      label: 'Location',
      value: 'Bedford',
      context: 'Strong market - average 3% price growth year-over-year'
    },
    {
      icon: '💭',
      label: 'Selling Reason',
      value: 'Upsizing',
      context: 'We can coordinate your sale and purchase seamlessly'
    }
  ],
  timelineBadge: {
    text: 'Planning Ahead',
    variant: 'planned'
  }
};

export const SELLER_EXPLORING_PROFILE: LlmProfileSummary = {
  overview: "You're exploring the possibility of selling your multi-family property, with no immediate pressure. This is the perfect time to understand your home's value and market conditions without commitment.",
  keyHighlights: [
    {
      icon: '🏠',
      label: 'Property Type',
      value: 'Multi-family',
      context: 'Strong investor interest - rental market is hot'
    },
    {
      icon: '⏱️',
      label: 'Timeline',
      value: 'Just exploring',
      context: 'No rush means we can wait for the perfect buyer'
    },
    {
      icon: '💭',
      label: 'Motivation',
      value: 'Investment opportunity',
      context: 'Smart to evaluate - market has shifted favorably'
    },
    {
      icon: '📈',
      label: 'Market Position',
      value: 'Considering options',
      context: 'Multi-family properties appreciate 12% faster than single-family'
    }
  ]
};

// ==================== BUYER FLOW SAMPLES ====================

export const BUYER_URGENT_PROFILE: LlmProfileSummary = {
  overview: "You're actively searching for a single-family house with your budget of $400K-$600K. You want to close within 3 months, which means we need to move quickly in this competitive market.",
  keyHighlights: [
    {
      icon: '🏠',
      label: 'Looking For',
      value: 'Single-family house',
      context: '23 active listings in your price range right now'
    },
    {
      icon: '💰',
      label: 'Budget',
      value: '$400K - $600K',
      context: 'Great range - lots of quality options in Halifax'
    },
    {
      icon: '🛏️',
      label: 'Bedrooms',
      value: '3 bedrooms',
      context: 'Most popular configuration - good resale value'
    },
    {
      icon: '⏱️',
      label: 'Timeline',
      value: 'ASAP (0-3 months)',
      context: 'I have 3 off-market opportunities I can show you'
    },
    {
      icon: '💭',
      label: 'Goal',
      value: 'First home',
      context: 'You may qualify for first-time buyer programs'
    }
  ],
  timelineBadge: {
    text: 'Ready to Buy',
    variant: 'urgent'
  }
};

export const BUYER_PLANNED_PROFILE: LlmProfileSummary = {
  overview: "You're planning to purchase a 3-bedroom condo in Dartmouth within the next 3-6 months. Your budget and timeline give us flexibility to find the perfect match without rushing.",
  keyHighlights: [
    {
      icon: '🏠',
      label: 'Looking For',
      value: '3-bedroom condo',
      context: 'Dartmouth has excellent condo inventory right now'
    },
    {
      icon: '💰',
      label: 'Budget',
      value: '$400K - $600K',
      context: 'You can get a premium unit in this range'
    },
    {
      icon: '⏱️',
      label: 'Timeline',
      value: '3-6 months',
      context: 'Perfect window - not rushed, but focused'
    },
    {
      icon: '📍',
      label: 'Preferred Area',
      value: 'Dartmouth',
      context: 'Up-and-coming area with strong appreciation'
    },
    {
      icon: '💭',
      label: 'Reason',
      value: 'Upgrading',
      context: 'Can coordinate your sale and purchase timing'
    }
  ]
};

// ==================== BROWSER FLOW SAMPLES ====================

export const BROWSER_MARKET_PROFILE: LlmProfileSummary = {
  overview: "You're researching Halifax market trends in the $600K-$800K range, exploring investment opportunities for the coming year. Smart move - understanding the market before diving in is crucial.",
  keyHighlights: [
    {
      icon: '📈',
      label: 'Interest',
      value: 'Market trends',
      context: 'Halifax market up 8.2% YoY - strong fundamentals'
    },
    {
      icon: '💰',
      label: 'Price Range',
      value: '$600K - $800K',
      context: 'Luxury condo and premium single-family sweet spot'
    },
    {
      icon: '📍',
      label: 'Area Focus',
      value: 'Downtown Halifax',
      context: 'Highest appreciation zone - 11% last 3 years'
    },
    {
      icon: '⏱️',
      label: 'Timeframe',
      value: 'Within a year',
      context: 'Plenty of time to identify the perfect opportunity'
    },
    {
      icon: '💭',
      label: 'Goal',
      value: 'Investment research',
      context: 'Rental yields in this range average 5.2%'
    }
  ],
  timelineBadge: {
    text: 'Researching Options',
    variant: 'exploring'
  }
};

// ==================== ORGANIZED BY FLOW ====================

export const PROFILE_SUMMARY_SAMPLES = {
  sell: {
    urgent: SELLER_URGENT_PROFILE,
    planned: SELLER_PLANNED_PROFILE,
    exploring: SELLER_EXPLORING_PROFILE
  },
  buy: {
    urgent: BUYER_URGENT_PROFILE,
    planned: BUYER_PLANNED_PROFILE
  },
  browse: {
    market: BROWSER_MARKET_PROFILE
  }
};