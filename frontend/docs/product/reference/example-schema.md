
## example of a component file type.ts

### this is herobanner.ts


import { ComponentSchema } from "../schemas";

export const HERO_BANNER_SCHEMA: ComponentSchema = {
    componentName: 'hero',
    description: 'The hero banner is the first impression - it should immediately capture attention, feel personalized, and communicate urgency based on the user\'s timeline.',
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


  export interface LlmHeroBanner {
    headline: string;
    subheadline: string;
    urgencyLevel: 'high' | 'medium' | 'low';
    emoji?: string;
    backgroundTheme?: 'warm' | 'cool' | 'neutral';
  }

  ## here is an example of the herobanner being rendered in herobanner.tsx

  // components/landing/HeroBanner.tsx

import { LlmHeroBanner } from "@/types/resultsPageComponents/components/herobanner";
import { Sparkles, Clock, Calendar, TrendingUp } from 'lucide-react';

interface LlmHeroBannerProps {
  data: LlmHeroBanner;
}

export function LlmHerobanner({ data }: LlmHeroBannerProps) {
  // Map urgency to gradient and styling - more neutral, easier on eyes
  const urgencyStyles = {
    high: {
      gradient: 'bg-gradient-to-br from-amber-50 via-orange-50 to-red-50',
      textColor: 'text-gray-900',
      accentColor: 'text-orange-600',
      borderColor: 'border-orange-200',
      bgAccent: 'bg-orange-100',
      pulse: true,
      badge: 'Time-Sensitive Opportunity',
      icon: Clock
    },
    medium: {
      gradient: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50',
      textColor: 'text-gray-900',
      accentColor: 'text-indigo-600',
      borderColor: 'border-indigo-200',
      bgAccent: 'bg-indigo-100',
      pulse: false,
      badge: 'Great Timing',
      icon: Calendar
    },
    low: {
      gradient: 'bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50',
      textColor: 'text-gray-900',
      accentColor: 'text-slate-600',
      borderColor: 'border-slate-200',
      bgAccent: 'bg-slate-100',
      pulse: false,
      badge: 'Planning Ahead',
      icon: TrendingUp
    }
  };

  const styles = urgencyStyles[data.urgencyLevel];
  const IconComponent = styles.icon;
  
  // Map theme to accent colors (subtle)
  const themeAccent = {
    warm: 'decoration-orange-400',
    cool: 'decoration-blue-400',
    neutral: 'decoration-slate-400'
  }[data.backgroundTheme || 'neutral'];

  return (
    <section 
      className={`hero-banner relative overflow-hidden ${styles.gradient} rounded-xl shadow-lg border ${styles.borderColor}`}
      data-urgency={data.urgencyLevel}
      data-theme={data.backgroundTheme}
    >
      {/* Subtle decorative background pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-0 left-0 w-72 h-72 bg-gray-900 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gray-900 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 md:py-16">
        {/* Emoji with subtle animation */}
        {data.emoji && (
          <div className="text-center mb-4">
            <span 
              className={`inline-block text-6xl ${styles.pulse ? 'animate-bounce' : ''}`}
              style={{ animationDuration: '2s' }}
            >
              {data.emoji}
            </span>
          </div>
        )}

        {/* Headline - The star of the show */}
        <h1 
          className={`text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-4 leading-tight ${styles.textColor}`}
        >
          {/* Subtle underline decoration */}
          <span className={`underline ${themeAccent} decoration-2 underline-offset-8`}>
            {data.headline}
          </span>
        </h1>

        {/* Subheadline */}
        <p 
          className="text-lg sm:text-xl lg:text-2xl text-center leading-relaxed mb-6 text-gray-700 max-w-4xl mx-auto"
        >
          {data.subheadline}
        </p>

        {/* Urgency badge with icon */}
        <div className="flex justify-center">
          <div 
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${styles.bgAccent} border ${styles.borderColor}`}
          >
            {styles.pulse ? (
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${styles.bgAccent} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${styles.accentColor} bg-current`}></span>
              </span>
            ) : (
              <IconComponent className={`h-4 w-4 ${styles.accentColor}`} />
            )}
            <span className={`text-sm font-medium ${styles.accentColor}`}>
              {styles.badge}
            </span>
          </div>
        </div>

        {/* Personal touch indicator with icon */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4 text-gray-500" />
          <p className="text-sm font-medium text-gray-600">
            Personalized analysis by Chris
          </p>
        </div>
      </div>
    </section>
  );
}


## for each component you gerenate make the two files, the COMPONENT_NAME.ts then COMPONENT_NAME.TSX