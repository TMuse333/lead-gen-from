// lib/sampleData/nextStepsCTASamples.ts

import { LlmNextStepsCTA } from "@/types"

// ==================== SELLER FLOW SAMPLES ====================

export const SELLER_URGENT_CTA_SAMPLE: LlmNextStepsCTA = {
  hook: "With homes selling in 28 days and your 3-month relocation timeline, every week matters. Your renovated kitchen gives you an edge—let's capitalize on it now.",
  
  keyRecap: [
    {
      icon: "🚨",
      label: "Timeline",
      value: "0-3 months"
    },
    {
      icon: "📈",
      label: "Market",
      value: "Seller's advantage"
    },
    {
      icon: "🏆",
      label: "Your Edge",
      value: "Renovated kitchen"
    },
    {
      icon: "🎯",
      label: "First Step",
      value: "Professional valuation"
    }
  ],
  
  transitionText: "Let's get you priced right and on the market fast:",
  
  primaryCTA: {
    text: "Schedule Urgent Valuation",
    subtext: "Get pricing strategy within 24 hours",
    urgencyNote: "Limited slots this week"
  },
  
  secondaryCTA: {
    text: "Quick Market Analysis",
    subtext: "See what homes like yours sold for"
  },
  
  trustElements: [
    "No obligation, ever",
    "20+ urgent relocations handled",
    "Average 28 days to sale"
  ],
  
  personalNote: {
    message: "I've helped over 20 families with tight relocation timelines just like yours. Every situation is unique, and moving fast doesn't mean compromising on value. Let's talk this week.",
    signature: "Chris"
  }
};

export const SELLER_PLANNED_CTA_SAMPLE: LlmNextStepsCTA = {
  hook: "Your 6-12 month timeline gives us the perfect window to maximize your home's value. With steady market appreciation, strategic preparation will pay off significantly.",
  
  keyRecap: [
    {
      icon: "📅",
      label: "Timeline",
      value: "6-12 months ahead"
    },
    {
      icon: "📊",
      label: "Market",
      value: "Steady growth"
    },
    {
      icon: "🏠",
      label: "Property",
      value: "Single-family home"
    },
    {
      icon: "🎯",
      label: "Strategy",
      value: "Preparation phase"
    }
  ],
  
  transitionText: "Here's how we'll maximize your outcome:",
  
  primaryCTA: {
    text: "Schedule Planning Session",
    subtext: "Free 30-minute strategy consultation"
  },
  
  secondaryCTA: {
    text: "Download Seller Timeline",
    subtext: "Month-by-month preparation guide"
  },
  
  trustElements: [
    "No pressure, just planning",
    "150+ families helped",
    "Strategic preparation specialist"
  ],
  
  personalNote: {
    message: "Planning ahead is the smartest move you can make. I'll help you prepare strategically so when it's time to list, you're positioned for the best possible outcome. No rush, just results.",
    signature: "Chris"
  }
};

// ==================== BUYER FLOW SAMPLES ====================

export const BUYER_URGENT_FIRST_HOME_CTA_SAMPLE: LlmNextStepsCTA = {
  hook: "In this competitive market, pre-approved buyers are winning. With your 0-3 month timeline and first-home goals, let's get you ready to compete and win.",
  
  keyRecap: [
    {
      icon: "🔑",
      label: "Goal",
      value: "First home purchase"
    },
    {
      icon: "⏰",
      label: "Timeline",
      value: "Ready in 0-3 months"
    },
    {
      icon: "💰",
      label: "Budget",
      value: "$400K-$600K"
    },
    {
      icon: "🎯",
      label: "Next Step",
      value: "Get pre-approved"
    }
  ],
  
  transitionText: "Let's get you ready to compete and win:",
  
  primaryCTA: {
    text: "Schedule Buyer Consultation",
    subtext: "Free strategy session + pre-approval guidance",
    urgencyNote: "Move fast in this market"
  },
  
  secondaryCTA: {
    text: "View Available Listings",
    subtext: "See what's in your budget right now"
  },
  
  trustElements: [
    "50+ first-time buyers helped",
    "Pre-approval partner network",
    "Free buyer consultation"
  ],
  
  personalNote: {
    message: "Buying your first home is exciting and overwhelming. I've guided over 50 first-timers through this exact process, and I know how to make it smooth and stress-free. Let's get you into your dream home.",
    signature: "Chris"
  }
};

export const BUYER_PLANNED_UPGRADE_CTA_SAMPLE: LlmNextStepsCTA = {
  hook: "Your 3-6 month timeline for upgrading gives you the advantage of being selective. With 3-bedroom condos in demand, let's set up your search criteria and start watching the market.",
  
  keyRecap: [
    {
      icon: "🏢",
      label: "Target",
      value: "3-bedroom condo"
    },
    {
      icon: "📅",
      label: "Timeline",
      value: "3-6 months"
    },
    {
      icon: "📍",
      label: "Area",
      value: "Dartmouth"
    },
    {
      icon: "🎯",
      label: "Approach",
      value: "Strategic search"
    }
  ],
  
  transitionText: "Let's start your search the smart way:",
  
  primaryCTA: {
    text: "Start Your Home Search",
    subtext: "Custom alerts for properties that match"
  },
  
  secondaryCTA: {
    text: "Get Condo Buyer Guide",
    subtext: "Everything you need to know about condos"
  },
  
  trustElements: [
    "30+ Dartmouth condo sales",
    "Custom search setup included",
    "Building & fee analysis expert"
  ],
  
  personalNote: {
    message: "With your solid timeline, we can be strategic and selective. I'll set up a custom search so you see the best matches the moment they hit the market. When the right one comes along, you'll know it.",
    signature: "Chris"
  }
};

// ==================== BROWSER FLOW SAMPLES ====================

export const BROWSER_CURIOUS_CTA_SAMPLE: LlmNextStepsCTA = {
  hook: "You've learned a lot about Halifax's market today. Whether you're planning to buy, sell, or invest in the future, having a trusted advisor makes all the difference when you're ready.",
  
  keyRecap: [
    {
      icon: "📊",
      label: "Interest",
      value: "Market trends"
    },
    {
      icon: "📍",
      label: "Area",
      value: "Halifax"
    },
    {
      icon: "💡",
      label: "Goal",
      value: "Learning & exploring"
    },
    {
      icon: "🎯",
      label: "Timeline",
      value: "Just gathering info"
    }
  ],
  
  transitionText: "Let's keep the conversation going:",
  
  primaryCTA: {
    text: "Schedule Quick Chat",
    subtext: "15 minutes, no sales pitch, just insights"
  },
  
  secondaryCTA: {
    text: "Get Monthly Market Report",
    subtext: "Free updates delivered to your inbox"
  },
  
  trustElements: [
    "No obligation, ever",
    "15+ years Halifax expertise",
    "Just exploring? Perfect."
  ],
  
  personalNote: {
    message: "The fact that you're taking time to learn tells me you're thinking strategically. I'm here as a resource whenever you have questions—whether that's next month or next year. No pressure, just helpful guidance.",
    signature: "Chris"
  }
};

export const BROWSER_INVESTMENT_FOCUSED_CTA_SAMPLE: LlmNextStepsCTA = {
  hook: "Halifax's rental market offers strong returns in the $600K-$800K range. With your interest in investment opportunities, let's explore what makes financial sense for your portfolio goals.",
  
  keyRecap: [
    {
      icon: "💼",
      label: "Interest",
      value: "Investment property"
    },
    {
      icon: "💰",
      label: "Range",
      value: "$600K-$800K"
    },
    {
      icon: "📈",
      label: "Market",
      value: "Strong fundamentals"
    },
    {
      icon: "🎯",
      label: "Focus",
      value: "ROI analysis"
    }
  ],
  
  transitionText: "Let's look at the numbers together:",
  
  primaryCTA: {
    text: "Schedule Investment Review",
    subtext: "Cash flow projections + market analysis"
  },
  
  secondaryCTA: {
    text: "Get Investment Guide",
    subtext: "Halifax rental market ROI breakdown"
  },
  
  trustElements: [
    "25+ investor clients",
    "Cap rate & cash flow expert",
    "Property management connections"
  ],
  
  personalNote: {
    message: "Real estate investing is about numbers and strategy. I've helped 25+ investors build their portfolios in Halifax, and I can show you exactly what returns to expect. Let's run the numbers together.",
    signature: "Chris"
  }
};

// ==================== ORGANIZED BY FLOW & SCENARIO ====================

export const NEXT_STEPS_CTA_SAMPLES = {
  sell: {
    urgent: SELLER_URGENT_CTA_SAMPLE,
    planned: SELLER_PLANNED_CTA_SAMPLE,
  },
  buy: {
    urgentFirstHome: BUYER_URGENT_FIRST_HOME_CTA_SAMPLE,
    plannedUpgrade: BUYER_PLANNED_UPGRADE_CTA_SAMPLE,
  },
  browse: {
    curious: BROWSER_CURIOUS_CTA_SAMPLE,
    investment: BROWSER_INVESTMENT_FOCUSED_CTA_SAMPLE,
  },
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Get a sample based on flow and scenario
 */
export function getNextStepsCTASample(
  flow: 'sell' | 'buy' | 'browse',
  scenario: string
): LlmNextStepsCTA {
  const flowSamples = NEXT_STEPS_CTA_SAMPLES[flow];
  
  // Type assertion since we know the structure
  return (flowSamples as any)[scenario] || BROWSER_CURIOUS_CTA_SAMPLE;
}

/**
 * Get sample based on urgency level
 */
export function getNextStepsCTAByUrgency(
  flow: 'sell' | 'buy',
  urgency: 'high' | 'medium' | 'low'
): LlmNextStepsCTA {
  if (flow === 'sell') {
    return urgency === 'high' 
      ? SELLER_URGENT_CTA_SAMPLE 
      : SELLER_PLANNED_CTA_SAMPLE;
  } else {
    return urgency === 'high'
      ? BUYER_URGENT_FIRST_HOME_CTA_SAMPLE
      : BUYER_PLANNED_UPGRADE_CTA_SAMPLE;
  }
}