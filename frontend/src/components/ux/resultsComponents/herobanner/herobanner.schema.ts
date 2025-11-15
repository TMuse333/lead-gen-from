import { availableCollections, ComponentSchema } from "@/types";


export const HERO_BANNER_SCHEMA: ComponentSchema = {
    componentName: 'hero',
    description: 'The hero banner is the first impression - it should immediately capture attention, feel personalized, and communicate urgency based on the user\'s timeline.',
    personalization:{
      retrieveFrom: [availableCollections.find(c => c.name === 'actionSteps')!] ,// rule-based,
    },
    fields: {
      headline: {
        type: 'string',
        description: 'Main headline that grabs attention and feels personal',
        required: true,
        constraints: {
          wordCount: '8-12 words',
          tone: 'action-oriented, warm, enthusiastic - include user\'s first name if available from email'
        },
        example: 'Let\'s Get Your Home Sold Fast, Sarah!',
        context: 'Should reflect their timeline urgency (0-3mo = urgent, 6mo+ = relaxed planning)'
      },
      subheadline: {
        type: 'string',
        description: 'Supporting text that connects their situation to an opportunity',
        required: true,
        constraints: {
          wordCount: '20-30 words',
          tone: 'explanatory, confidence-building, specific to their answers'
        },
        example: 'With your 0-3 month timeline and strong seller\'s market, acting quickly maximizes your sale price.',
        context: 'Weave together: their timeline + market conditions + their specific property details'
      },
      urgencyLevel: {
        type: 'enum',
        description: 'Controls visual styling to match timeline urgency',
        required: true,
        constraints: {
          options: ['high', 'medium', 'low']
        },
        context: 'Use: high = 0-3mo timeline, medium = 3-6mo, low = 6mo+ or "just exploring"'
      },
      emoji: {
        type: 'string',
        description: 'Single emoji that represents their journey',
        required: false,
        constraints: {
          maxLength: 2
        },
        example: '🏠',
        context: 'Suggestions: 🏠 (selling home), 🔑 (buying), 🚀 (urgent), 📈 (market focused), 💡 (exploring)'
      },
      backgroundTheme: {
        type: 'enum',
        description: 'Color theme hint for the hero section background',
        required: false,
        constraints: {
          options: ['warm', 'cool', 'neutral']
        },
        context: 'warm = urgent/exciting (reds/oranges), cool = calm/planning (blues), neutral = informational (grays)'
      }
    }
  };


  export interface LlmHeroBannerProps {
    headline: string;
    subheadline: string;
    urgencyLevel: 'high' | 'medium' | 'low';
    emoji?: string;
    backgroundTheme?: 'warm' | 'cool' | 'neutral';
  }