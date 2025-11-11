// lib/sampleData/personalMessageSamples.ts

import { LlmPersonalMessage } from "@/types/resultsPageComponents/components/personalMessage";

// ==================== SELLER FLOW SAMPLES ====================

export const SELLER_URGENT_RELOCATION_SAMPLE: LlmPersonalMessage = {
  agentName: "Chris",
  greeting: "Hi Sarah,",
  messageBody: "I've helped over 20 families navigate tight relocation timelines just like yours. The 0-3 month window you mentioned is actually quite common in Halifax, and with the right strategy, we can maximize your sale price despite the urgency. Your recent kitchen renovation is a strong selling point that we'll leverage in positioning your home to stand out in the current market.",
  signature: "Looking forward to connecting,",
  agentTitle: "Senior Real Estate Advisor",
  photoUrl: "/images/chris-headshot.jpg",
  credibilityPoints: [
    { icon: "🏆", text: "150+ homes sold in Halifax" },
    { icon: "⭐", text: "4.9/5 average client rating" },
    { icon: "⏱️", text: "Average 28 days to sale" }
  ],
  tone: "urgent-supportive"
};

export const SELLER_PLANNED_UPSIZE_SAMPLE: LlmPersonalMessage = {
  agentName: "Chris",
  greeting: "Hi Michael,",
  messageBody: "Your 6-12 month timeline for upsizing gives us a fantastic advantage. I've worked with dozens of families making similar moves in Bedford, and the key is strategic timing. We'll coordinate your sale and purchase to ensure a smooth transition without the stress of temporary housing. Your townhouse location is in high demand, which gives us excellent negotiating power.",
  signature: "Let's make this transition seamless,",
  agentTitle: "REALTOR®",
  credibilityPoints: [
    { icon: "🏠", text: "Bedford market specialist" },
    { icon: "📊", text: "Top 5% in Nova Scotia" }
  ],
  tone: "calm-confident"
};

export const SELLER_EXPLORING_DOWNSIZE_SAMPLE: LlmPersonalMessage = {
  agentName: "Chris",
  greeting: "Hello Jennifer,",
  messageBody: "Exploring your options is the smartest first step when considering downsizing. I've guided many empty-nesters through this exact journey, and there's absolutely no pressure to move quickly. Let's take time to understand your multi-family property's true value, explore what downsized living looks like in Halifax, and create a plan that works perfectly for your timeline and lifestyle goals.",
  signature: "Here to help whenever you're ready,",
  agentTitle: "Real Estate Advisor",
  credibilityPoints: [
    { icon: "💼", text: "15+ years in Halifax real estate" },
    { icon: "🎯", text: "Downsizing specialist" }
  ],
  tone: "calm-confident"
};

export const SELLER_URGENT_INVESTMENT_SAMPLE: LlmPersonalMessage = {
  agentName: "Chris",
  greeting: "Hi David,",
  messageBody: "Timing is critical when liquidating investment properties, and your 0-3 month window is definitely achievable. I've sold over 40 investment properties in the past two years, and I understand the importance of maximizing returns while moving quickly. We'll position your property to attract both investors and owner-occupants, giving us the widest buyer pool possible.",
  signature: "Let's maximize your return,",
  agentTitle: "Investment Property Specialist",
  credibilityPoints: [
    { icon: "💰", text: "40+ investment sales" },
    { icon: "📈", text: "Average 102% of asking price" }
  ],
  tone: "urgent-supportive"
};

// ==================== BUYER FLOW SAMPLES ====================

export const BUYER_URGENT_FIRST_HOME_SAMPLE: LlmPersonalMessage = {
  agentName: "Chris",
  greeting: "Hi James,",
  messageBody: "Congratulations on taking the exciting step toward homeownership! Your budget of $400K-$600K opens up excellent opportunities for single-family homes in Halifax. I've helped over 50 first-time buyers navigate this process in the past year, and I know exactly how to make it smooth and stress-free. With your 0-3 month timeline, we'll need to move efficiently, but I'll guide you through every step.",
  signature: "Let's find your perfect first home,",
  agentTitle: "First-Time Buyer Specialist",
  credibilityPoints: [
    { icon: "🔑", text: "50+ first-time buyers helped" },
    { icon: "⭐", text: "Certified Buyer's Agent" },
    { icon: "💡", text: "Down payment strategy expert" }
  ],
  tone: "excited-encouraging"
};

export const BUYER_PLANNED_UPGRADE_SAMPLE: LlmPersonalMessage = {
  agentName: "Chris",
  greeting: "Hi Lisa,",
  messageBody: "Your 3-6 month timeline for finding a 3-bedroom condo in Dartmouth is ideal. This gives us time to see what comes on the market and make a confident decision without rushing. I've completed 30+ condo purchases in Dartmouth over the past two years, and I know the buildings, the fees, and which ones offer the best value. We'll find you something that truly feels like an upgrade.",
  signature: "Excited to start this journey with you,",
  agentTitle: "Condo Market Specialist",
  photoUrl: "/images/chris-headshot.jpg",
  credibilityPoints: [
    { icon: "🏢", text: "30+ Dartmouth condo sales" },
    { icon: "📋", text: "Condo document review expert" }
  ],
  tone: "calm-confident"
};

export const BUYER_EXPLORING_DOWNSIZE_SAMPLE: LlmPersonalMessage = {
  agentName: "Chris",
  greeting: "Hi Patricia,",
  messageBody: "Planning to downsize over the next year is wonderfully proactive. I work with many clients in similar situations, and having time to explore means we can be selective and thoughtful. There's no pressure at all—we'll look at different neighborhoods, consider various property types, and make sure your next home truly fits your lifestyle. When you're ready to move forward, you'll feel completely confident.",
  signature: "Looking forward to exploring options with you,",
  agentTitle: "Real Estate Advisor",
  credibilityPoints: [
    { icon: "🎯", text: "Downsizing specialist" },
    { icon: "🏘️", text: "All Halifax neighborhoods" }
  ],
  tone: "calm-confident"
};

export const BUYER_URGENT_INVESTMENT_SAMPLE: LlmPersonalMessage = {
  agentName: "Chris",
  greeting: "Hi Robert,",
  messageBody: "Your focus on investment properties shows smart financial thinking. With a $600K-$800K budget and a 0-3 month timeline, we have excellent opportunities in Halifax's rental market. I've helped investors acquire 25+ properties in the past year, and I understand cap rates, cash flow analysis, and tenant demographics. We'll find you a property that makes financial sense from day one.",
  signature: "Let's build your portfolio,",
  agentTitle: "Investment Property Advisor",
  credibilityPoints: [
    { icon: "💼", text: "25+ investor clients" },
    { icon: "📊", text: "Rental market analysis expert" },
    { icon: "💰", text: "Average 6.5% cap rate" }
  ],
  tone: "urgent-supportive"
};

// ==================== BROWSER FLOW SAMPLES ====================

export const BROWSER_MARKET_TRENDS_SAMPLE: LlmPersonalMessage = {
  agentName: "Chris",
  greeting: "Hi Emma,",
  messageBody: "Your curiosity about market trends in downtown Halifax is spot-on timing. I track this market daily, and I'd love to share the insights I provide to my buying and selling clients. Understanding price movements, inventory levels, and buyer behavior gives you a real advantage when you decide to make a move. There's no commitment here—just valuable market intelligence from someone who lives and breathes Halifax real estate.",
  signature: "Happy to share what I know,",
  agentTitle: "Market Analyst",
  credibilityPoints: [
    { icon: "📈", text: "Daily market tracking" },
    { icon: "📍", text: "Downtown Halifax expert" }
  ],
  tone: "calm-confident"
};

export const BROWSER_INVESTMENT_OPPORTUNITIES_SAMPLE: LlmPersonalMessage = {
  agentName: "Chris",
  greeting: "Hi Katherine,",
  messageBody: "Your interest in investment opportunities shows you're thinking strategically about wealth building. The $600K-$800K range in Halifax offers some of the best risk-adjusted returns in Atlantic Canada right now. I've helped investors at all experience levels—from first rental to multi-property portfolios—and I'd be happy to show you what the numbers actually look like on current listings, with zero pressure to buy.",
  signature: "Let's explore the opportunities,",
  agentTitle: "Investment Real Estate Advisor",
  photoUrl: "/images/chris-headshot.jpg",
  credibilityPoints: [
    { icon: "💼", text: "Investment property specialist" },
    { icon: "📊", text: "Market ROI analysis" }
  ],
  tone: "calm-confident"
};

export const BROWSER_GENERAL_CURIOSITY_SAMPLE: LlmPersonalMessage = {
  agentName: "Chris",
  greeting: "Hi Alex,",
  messageBody: "Just browsing and gathering information is honestly the best way to start. I love working with people who are taking their time and learning about the market before making any decisions. Bedford's real estate landscape is really interesting right now, and I'm happy to be a resource for you with no strings attached. When and if you're ready to take action, you'll have someone who already understands what you're looking for.",
  signature: "Here whenever you need me,",
  agentTitle: "Real Estate Advisor",
  credibilityPoints: [
    { icon: "🏘️", text: "Bedford neighborhood expert" },
    { icon: "📚", text: "Free market education" }
  ],
  tone: "calm-confident"
};

export const BROWSER_NEIGHBORHOOD_INFO_SAMPLE: LlmPersonalMessage = {
  agentName: "Chris",
  greeting: "Hi Rachel,",
  messageBody: "Learning about different neighborhoods is one of my favorite topics to discuss. Each area of Halifax has its own personality, amenities, and investment characteristics. I've lived here for 15+ years and sold homes in every neighborhood, so I can give you the insider perspective you won't find on Google. Whether you're thinking about living here or investing here, understanding the neighborhoods is absolutely essential.",
  signature: "Let's explore Halifax together,",
  agentTitle: "Neighborhood Specialist",
  credibilityPoints: [
    { icon: "📍", text: "All Halifax neighborhoods" },
    { icon: "🗺️", text: "15+ years local experience" }
  ],
  tone: "excited-encouraging"
};

// ==================== ORGANIZED BY FLOW ====================

export const PERSONAL_MESSAGE_SAMPLES = {
  sell: {
    urgentRelocation: SELLER_URGENT_RELOCATION_SAMPLE,
    plannedUpsize: SELLER_PLANNED_UPSIZE_SAMPLE,
    exploringDownsize: SELLER_EXPLORING_DOWNSIZE_SAMPLE,
    urgentInvestment: SELLER_URGENT_INVESTMENT_SAMPLE
  },
  buy: {
    urgentFirstHome: BUYER_URGENT_FIRST_HOME_SAMPLE,
    plannedUpgrade: BUYER_PLANNED_UPGRADE_SAMPLE,
    exploringDownsize: BUYER_EXPLORING_DOWNSIZE_SAMPLE,
    urgentInvestment: BUYER_URGENT_INVESTMENT_SAMPLE
  },
  browse: {
    marketTrends: BROWSER_MARKET_TRENDS_SAMPLE,
    investmentOpportunities: BROWSER_INVESTMENT_OPPORTUNITIES_SAMPLE,
    generalCuriosity: BROWSER_GENERAL_CURIOSITY_SAMPLE,
    neighborhoodInfo: BROWSER_NEIGHBORHOOD_INFO_SAMPLE
  }
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Get a sample based on flow and scenario
 */
export function getPersonalMessageSample(
  flow: 'sell' | 'buy' | 'browse',
  scenario: string
): LlmPersonalMessage {
  const flowSamples = PERSONAL_MESSAGE_SAMPLES[flow];
  
  // Type assertion since we know the structure
  return (flowSamples as any)[scenario] || BROWSER_GENERAL_CURIOSITY_SAMPLE;
}

/**
 * Get all samples for a specific flow
 */
export function getAllPersonalMessageSamplesForFlow(
  flow: 'sell' | 'buy' | 'browse'
): LlmPersonalMessage[] {
  return Object.values(PERSONAL_MESSAGE_SAMPLES[flow]);
}

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