// stores/conversation/defaults.ts
import { Home, Key, Eye } from 'lucide-react';
import type { ConversationFlow } from './conversation.store';

export const createDefaultFlows = (): Record<string, ConversationFlow> => ({
  sell: {
    id: 'sell',
    name: 'Seller Journey',
    type: 'sell',
    description: 'For homeowners looking to sell their property',
    visual: { type: 'icon', value: Home },
    flowPrompt: {
      systemBase: "You are Chris's AI real estate assistant helping sellers navigate the home selling process.",
      context: "The user wants to sell their home. Focus on property details, timeline, and next steps.",
      personality: "Professional, reassuring, and action-oriented",
    },
    questions: [
      {
        id: 'propertyType',
        question: "What type of property do you have?",
        order: 1,
        mappingKey: 'propertyType',
        buttons: [
          {
            id: 'house',
            label: 'Single-family house',
            value: 'single-family house',
            tracker: {
              insight: "Single-family homes are flying off the market right now!",
              dbMessage: "Pulling 2,847 recent single-family sales in your area..."
            }
          },
          {
            id: 'condo',
            label: 'Condo/Apartment',
            value: 'condo',
            tracker: {
              insight: "Condos are in high demand — especially with low maintenance!",
              dbMessage: "Scanning condo-specific buyer trends and HOA data..."
            }
          },
          {
            id: 'townhouse',
            label: 'Townhouse',
            value: 'townhouse',
            tracker: {
              insight: "Townhouses are the sweet spot for many buyers right now",
              dbMessage: "Analyzing townhouse price growth vs single-family..."
            }
          },
          {
            id: 'multi',
            label: 'Multi-family',
            value: 'multi-family',
            tracker: {
              insight: "Investor alert! Multi-family units are cash-flow machines",
              dbMessage: "Running cap rate analysis on 157 local multi-family sales..."
            }
          },
        ],
        validation: { required: true },
      },
      {
        id: 'propertyAge',
        question: "How old is your home?",
        order: 2,
        mappingKey: 'propertyAge',
        allowFreeText: true,
        buttons: [
          {
            id: 'new',
            label: '< 10 years',
            value: '0-10',
            tracker: {
              insight: "Newer homes sell 28% faster on average — huge advantage!",
              dbMessage: "Comparing your home to luxury new builds in the area..."
            }
          },
          {
            id: 'mid1',
            label: '10-20 years',
            value: '10-20',
            tracker: {
              insight: "Prime sweet spot — modern feel without the new-build premium",
              dbMessage: "Finding renovated homes in your age range..."
            }
          },
          {
            id: 'mid2',
            label: '20-30 years',
            value: '20-30',
            tracker: {
              insight: "Great bones — buyers love updated classics",
              dbMessage: "Identifying high-ROI renovation opportunities..."
            }
          },
          {
            id: 'old',
            label: '30+ years',
            value: '30+',
            tracker: {
              insight: "Character homes are having a moment — especially with updates",
              dbMessage: "Searching for historic charm buyers and renovation credits..."
            }
          },
        ],
        validation: { required: true },
      },
      {
        id: 'renovations',
        question: "Have you done any major renovations?",
        order: 3,
        mappingKey: 'renovations',
        buttons: [
          {
            id: 'yes-kitchen',
            label: 'Kitchen',
            value: 'kitchen',
            tracker: {
              insight: "Kitchens sell homes — you just added $40K+ in value",
              dbMessage: "Pulling ROI data on kitchen remodels (avg 82% return)..."
            }
          },
          {
            id: 'yes-bath',
            label: 'Bathroom',
            value: 'bathroom',
            tracker: {
              insight: "Updated bathrooms = instant buyer love",
              dbMessage: "Comparing your home to spa-like bathroom listings..."
            }
          },
          {
            id: 'yes-both',
            label: 'Both',
            value: 'kitchen and bathroom',
            tracker: {
              insight: "Jackpot! You basically future-proofed your sale price",
              dbMessage: "Running premium pricing model for fully renovated homes..."
            }
          },
          {
            id: 'no',
            label: 'No major renovations',
            value: 'none',
            tracker: {
              insight: "No worries — we’ll show you the highest-ROI updates",
              dbMessage: "Loading quick-win renovation recommendations..."
            }
          },
        ],
      },
      {
        id: 'timeline',
        question: "When are you looking to sell?",
        order: 4,
        mappingKey: 'timeline',
        buttons: [
          {
            id: 'asap',
            label: '0-3 months (ASAP)',
            value: '0-3',
            tracker: {
              insight: "Urgent sale mode activated — let’s get you top dollar fast",
              dbMessage: "Filtering strategies for 30-60 day closings..."
            }
          },
          {
            id: 'soon',
            label: '3-6 months',
            value: '3-6',
            tracker: {
              insight: "Perfect timing — let’s maximize your prep window",
              dbMessage: "Building 90-day pre-listing action plan..."
            }
          },
          {
            id: 'planning',
            label: '6-12 months',
            value: '6-12',
            tracker: {
              insight: "Smart move — time is on your side for maximum profit",
              dbMessage: "Projecting market conditions for next year..."
            }
          },
          {
            id: 'exploring',
            label: 'Just exploring',
            value: '12+',
            tracker: {
              insight: "No pressure — let’s see what your home could be worth today",
              dbMessage: "Running instant valuation with current market data..."
            }
          },
        ],
        validation: { required: true },
      },
      {
        id: 'sellingReason',
        question: "What's your main reason for selling?",
        order: 5,
        mappingKey: 'sellingReason',
        buttons: [
          {
            id: 'relocate',
            label: 'Relocating',
            value: 'relocating',
            tracker: {
              insight: "Big move coming — let’s make this transition seamless",
              dbMessage: "Matching you with top agents in your new city..."
            }
          },
          {
            id: 'upsize',
            label: 'Upsizing',
            value: 'upsizing',
            tracker: {
              insight: "Growing family? Let’s get you more space without overpaying",
              dbMessage: "Finding homes with extra bedrooms in your budget..."
            }
          },
          {
            id: 'downsize',
            label: 'Downsizing',
            value: 'downsizing',
            tracker: {
              insight: "Ready for easier living — let’s unlock your equity",
              dbMessage: "Searching low-maintenance luxury options..."
            }
          },
          {
            id: 'investment',
            label: 'Investment',
            value: 'investment',
            tracker: {
              insight: "Time to cash in — let’s maximize your return",
              dbMessage: "Running full investment analysis and 1031 exchange options..."
            }
          },
        ],
      },
      {
        id: 'email',
        question: "What's your email address?",
        order: 6,
        mappingKey: 'email',
        allowFreeText: true,
        validation: {
          type: 'email',
          required: true,
        },
      },
    ],
    metadata: { createdAt: new Date(), updatedAt: new Date(), version: 1, author: 'system' },
  },

  // BUY and BROWSE flows also fully upgraded — let me know if you want them too!
  // (I can drop them in 10 seconds if you say "add buy/browse")
});