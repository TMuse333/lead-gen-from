'use client';

import {
  Sparkles,
  Home,
  DollarSign,
  Compass,
  Heart,
  Lightbulb
} from 'lucide-react';

interface StorySuggestion {
  title: string;
  template: string;
  example: string;
}

interface PhaseStories {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  stories: StorySuggestion[];
}

const PHASE_STORIES: PhaseStories[] = [
  {
    id: 'buy',
    label: 'Buying Journey',
    icon: Home,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    description: 'Stories about helping clients find and purchase their home',
    stories: [
      {
        title: 'First-Time Buyer Success',
        template: 'A first-time buyer who was nervous about a specific concern and how you helped them through it',
        example: 'I worked with a first-time buyer who was overwhelmed by the mortgage process. I walked them through each step, connected them with a great lender, and we found their dream starter home in just 6 weeks.',
      },
      {
        title: 'Competitive Market Win',
        template: 'How you helped a client win in a competitive market with multiple offers',
        example: 'A couple I worked with lost 3 bids before we connected. I helped them strengthen their offer strategy and they won their 4th attempt - a beautiful 4-bedroom in their top neighborhood.',
      },
      {
        title: 'Finding the Right Fit',
        template: 'A client who had specific requirements and how you found the perfect match',
        example: 'One client needed a home office, fenced yard for their dog, and under $400k. After showing 12 properties, we found one that checked every box plus had a finished basement.',
      },
    ],
  },
  {
    id: 'sell',
    label: 'Selling Journey',
    icon: DollarSign,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    description: 'Stories about helping clients sell their property successfully',
    stories: [
      {
        title: 'Above Asking Price',
        template: 'How you helped a client sell for more than they expected',
        example: 'A family I worked with thought their home was worth $350k. After staging and strategic marketing, we received 8 offers and closed at $385k - $35k over their expectations.',
      },
      {
        title: 'Quick Sale Success',
        template: 'A client who needed to sell quickly and how you made it happen',
        example: 'I had a client relocating for work in 30 days. We priced strategically, had professional photos done in 48 hours, and had an accepted offer within a week.',
      },
      {
        title: 'Challenging Property',
        template: 'How you overcame obstacles to sell a difficult property',
        example: 'A downtown condo had been on the market for 6 months with another agent. I repositioned the listing, targeted young professionals, and sold it in 3 weeks.',
      },
    ],
  },
  {
    id: 'browse',
    label: 'Exploring Options',
    icon: Compass,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    description: 'Stories about guiding clients through their real estate exploration',
    stories: [
      {
        title: 'Rent vs Buy Decision',
        template: 'How you helped someone decide whether buying made sense for them',
        example: 'A client was unsure if they should keep renting. After reviewing their finances and goals, we determined buying would save them $400/month - and they closed 2 months later.',
      },
      {
        title: 'Investment Education',
        template: 'Guiding a client through their first investment property decision',
        example: 'I worked with someone who wanted to invest but didn\'t know where to start. I showed them how to analyze rental yields, and they purchased a duplex that now generates $1,200/month in passive income.',
      },
      {
        title: 'Market Timing',
        template: 'Helping a client understand when the right time to act was',
        example: 'A family was waiting for prices to drop. I showed them local market data and interest rate projections. They bought last spring and have already gained $25k in equity.',
      },
    ],
  },
];

export default function RecommendedStories() {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/30">
          <Sparkles className="h-7 w-7 text-amber-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">Story Ideas for Your Timeline</h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Great stories build trust and help leads visualize their own success.
          Here are suggestions for each phase of your client's journey.
        </p>
      </div>

      {/* Tip Box */}
      <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 flex items-start gap-3">
        <Lightbulb className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-cyan-200">
          <span className="font-medium">Pro tip:</span> The best stories are specific and outcome-focused.
          Include real details (neighborhoods, timeframes, numbers) to make them relatable and credible.
        </div>
      </div>

      {/* Phase Sections */}
      <div className="space-y-8">
        {PHASE_STORIES.map((phase) => {
          const Icon = phase.icon;
          return (
            <div key={phase.id} className="space-y-4">
              {/* Phase Header */}
              <div className={`flex items-center gap-3 p-4 rounded-xl ${phase.bgColor} border ${phase.borderColor}`}>
                <div className={`p-2 rounded-lg ${phase.bgColor}`}>
                  <Icon className={`h-6 w-6 ${phase.color}`} />
                </div>
                <div>
                  <h3 className={`font-semibold ${phase.color}`}>{phase.label}</h3>
                  <p className="text-sm text-slate-400">{phase.description}</p>
                </div>
              </div>

              {/* Story Cards */}
              <div className="grid gap-4 md:grid-cols-2">
                {phase.stories.map((story, storyIndex) => (
                  <div
                    key={storyIndex}
                    className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Heart className={`h-5 w-5 ${phase.color}`} />
                      <h4 className="font-semibold text-white">{story.title}</h4>
                    </div>

                    <p className="text-sm text-slate-400 mb-4">{story.template}</p>

                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                      <p className="text-sm text-slate-300 italic leading-relaxed">
                        "{story.example}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="text-center pt-4">
        <p className="text-slate-500 text-sm">
          Ready to add your own stories? Go to the <span className="text-amber-400">Stories</span> tab to get started.
        </p>
      </div>
    </div>
  );
}
