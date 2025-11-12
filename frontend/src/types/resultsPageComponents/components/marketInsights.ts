import { SchemaField } from '../schemas';

// ------------------------------------------
// Market Insights Schema
// ------------------------------------------

export const MARKET_INSIGHTS_SCHEMA: {
  componentName: string;
  description: string;
  fields: Record<string, SchemaField>;
} = {
  componentName: 'marketInsights',
  description:
    'The market insights component provides contextual market data tailored to the user\'s flow (sell/buy/browse). It shows 3-4 key metrics with flow-specific interpretations and actionable context. This helps users understand current market conditions and how they impact their specific situation.',

  fields: {
    sectionTitle: {
      type: 'string',
      description: 'Main heading for the market insights section',
      required: true,
      constraints: {
        wordCount: '2-5 words',
        tone: 'informative, professional',
      },
      example: 'Your Market Snapshot',
      context:
        'Keep it simple and clear. Options: "Market Overview", "Current Market Conditions", "Your Market Snapshot", "Market Intelligence"',
    },

    headline: {
      type: 'string',
      description: 'Flow-specific headline that summarizes the market condition',
      required: true,
      constraints: {
        wordCount: '3-6 words',
        tone: 'clear, contextual to flow',
      },
      example: 'Excellent Time to Sell',
      context:
        'Should reflect the market temperature from THEIR perspective. Sellers want to know if it\'s a good time to sell. Buyers want to know competition level. Browsers want overall market health.',
    },

    summary: {
      type: 'string',
      description: 'Brief 2-3 sentence overview of market conditions',
      required: false,
      constraints: {
        wordCount: '25-40 words',
        tone: 'informative, specific, contextual',
      },
      example:
        'In Halifax, homes are selling in 28 days on average with rising prices. 450 active listings create strong seller leverage in the current market.',
      context:
        'Should mention: area, key timeframe (DOM), price trend, and what it means for them. Reference their specific area if available from userInput.',
    },

    insights: {
      type: 'array',
      description: 'Array of 3-4 key market insights with interpretations',
      required: true,
      constraints: {
        minLength: 3,
        maxLength: 4,
      },
      context:
        'Each insight shows a metric + interpretation from their perspective. Must include sentiment (positive/neutral/caution) for visual styling. Order by importance to their flow.',
      example: [
        {
          metric: 'Average Days to Sell',
          value: '28 days',
          interpretation: 'Homes are selling quickly - great time to list',
          sentiment: 'positive',
          icon: '⏱️',
        },
      ],
    },

    recommendation: {
      type: 'string',
      description:
        'Actionable recommendation based on market conditions and their flow',
      required: true,
      constraints: {
        wordCount: '20-35 words',
        tone: 'actionable, specific, encouraging',
      },
      example:
        'Price confidently and prepare for multiple offers. Professional photos and staging will maximize your advantage in this seller\'s market.',
      context:
        'Should be flow-specific advice that connects market conditions to action. Sellers: pricing/marketing strategy. Buyers: timing/preparation advice. Browsers: general guidance on next steps.',
    },

    dataSource: {
      type: 'string',
      description: 'Optional label indicating where the data comes from',
      required: false,
      constraints: {
        wordCount: '2-5 words',
      },
      example: 'Based on Halifax MLS Data',
      context:
        'Builds credibility. Options: "Based on MLS Data", "Real-time market data", "Last 30 days activity". Can be omitted for cleaner design.',
    },

    lastUpdated: {
      type: 'string',
      description: 'When this data was last refreshed',
      required: false,
      example: 'November 11, 2025',
      context:
        'Shows data freshness. Can be formatted date or relative ("Updated today", "Updated this week").',
    },
  },
};

// ------------------------------------------
// Market Insight Item Schema (nested within insights array)
// ------------------------------------------

const MARKET_INSIGHT_ITEM_FIELDS = {
  metric: {
    type: 'string',
    description: 'Name of the market metric being shown',
    required: true,
    constraints: {
      wordCount: '2-5 words',
    },
    example: 'Average Days to Sell',
    context:
      'Should be clear and specific. Examples: "Average Days to Sell", "Price Trend", "Active Competition", "Available Options", "Market Temperature"',
  },

  value: {
    type: 'string',
    description: 'The actual metric value in user-friendly format',
    required: true,
    constraints: {
      wordCount: '1-4 words',
    },
    example: '28 days',
    context:
      'Keep concise and scannable. Include units. Examples: "28 days", "+8.5%", "450 homes", "$485K median"',
  },

  interpretation: {
    type: 'string',
    description:
      'What this metric means for the user in their specific flow context',
    required: true,
    constraints: {
      wordCount: '8-15 words',
      tone: 'clear, contextual, relevant to their flow',
    },
    example: 'Homes are selling quickly - great time to list',
    context:
      'CRITICAL: This must be flow-specific. Same metric means different things to sellers vs buyers. Focus on what it means for THEIR situation, not generic market commentary.',
  },

  sentiment: {
    type: 'enum',
    description:
      'How this metric should be perceived by the user - affects color coding',
    required: true,
    constraints: {
      options: ['positive', 'neutral', 'caution'],
    },
    example: 'positive',
    context:
      'positive = green (good news for them), neutral = blue (informational), caution = orange/red (requires attention/action). Same metric can have different sentiment for different flows!',
  },

  icon: {
    type: 'string',
    description: 'Emoji icon representing this metric',
    required: true,
    constraints: {
      maxLength: 2,
    },
    example: '⏱️',
    context:
      'Suggestions: ⏱️ (time/DOM), 📈 (prices up), 📊 (prices stable), 📉 (prices down), 🏠 (inventory), 💰 (price point), 🎯 (absorption), 🌡️ (temperature), 🔥 (hot market)',
  },
};

// ------------------------------------------
// Output Interfaces
// ------------------------------------------

export interface MarketInsight {
  metric: string;
  value: string;
  interpretation: string;
  sentiment: 'positive' | 'neutral' | 'caution';
  icon: string;
}

export interface LlmMarketInsightsProps {
  sectionTitle: string;
  headline: string;
  summary?: string;
  insights: MarketInsight[];
  recommendation: string;
  dataSource?: string;
  lastUpdated?: string;
}