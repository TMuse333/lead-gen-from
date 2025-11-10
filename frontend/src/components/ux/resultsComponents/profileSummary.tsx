// components/landing/ProfileSummary.tsx

import { LlmProfileSummary } from '@/types/resultsPageComponents/components/profileSummary';
import { Home, Calendar, Wrench, Clock, MapPin, Heart, DollarSign, TrendingUp, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface ProfileSummaryProps {
  data: LlmProfileSummary;
}

// Map common icons to Lucide components
const iconMap: Record<string, LucideIcon> = {
  '🏠': Home,
  '📅': Calendar,
  '🔨': Wrench,
  '⏱️': Clock,
  '📍': MapPin,
  '💭': Heart,
  '💰': DollarSign,
  '📈': TrendingUp,
  '✨': Sparkles,
};

export function LlmProfileSummary({ data }: ProfileSummaryProps) {
  const badgeStyles = {
    urgent: {
      bg: 'bg-orange-100',
      text: 'text-orange-700',
      border: 'border-orange-200',
      icon: '🔥'
    },
    planned: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      border: 'border-blue-200',
      icon: '📋'
    },
    exploring: {
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-200',
      icon: '🔍'
    }
  };

  return (
    <section className="profile-summary bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Situation</h2>
        <p className="text-base text-gray-600 leading-relaxed">
          {data.overview}
        </p>
      </div>

      {/* Key Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {data.keyHighlights.map((highlight, index) => {
          // Get Lucide icon component or use emoji
          const IconComponent = iconMap[highlight.icon];
          
          return (
            <div
              key={index}
              className="group relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
            >
              {/* Icon */}
              <div className="flex items-start gap-3 mb-2">
                <div className="flex-shrink-0 w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200 group-hover:border-gray-300 transition-colors">
                  {IconComponent ? (
                    <IconComponent className="h-5 w-5 text-gray-700" />
                  ) : (
                    <span className="text-xl">{highlight.icon}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    {highlight.label}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 leading-snug">
                    {highlight.value}
                  </p>
                </div>
              </div>

              {/* Optional Context - Chris's insight */}
              {highlight.context && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-600 italic leading-relaxed">
                    💡 {highlight.context}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Optional Timeline Badge */}
      {data.timelineBadge && (
        <div className="flex justify-center">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${
              badgeStyles[data.timelineBadge.variant].bg
            } ${badgeStyles[data.timelineBadge.variant].border}`}
          >
            <span className="text-lg">
              {badgeStyles[data.timelineBadge.variant].icon}
            </span>
            <span
              className={`text-sm font-semibold ${
                badgeStyles[data.timelineBadge.variant].text
              }`}
            >
              {data.timelineBadge.text}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}