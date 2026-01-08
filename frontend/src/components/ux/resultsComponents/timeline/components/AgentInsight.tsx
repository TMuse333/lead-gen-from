// components/ux/resultsComponents/timeline/components/AgentInsight.tsx
'use client';

import { Sparkles, MessageCircle } from 'lucide-react';

interface AgentInsightProps {
  advice: string;
  /** Optional agent name for personalization */
  agentName?: string;
  /** Color accent class (e.g., 'text-blue-600') */
  accentColor?: string;
  /** Whether this is a featured/highlighted insight */
  featured?: boolean;
}

/**
 * Displays personalized agent advice with an "experience" framing
 * Makes Qdrant advice feel like it comes from actual agent experience
 */
export function AgentInsight({
  advice,
  agentName,
  accentColor = 'text-blue-600',
  featured = false,
}: AgentInsightProps) {
  const borderColor = accentColor.replace('text-', 'border-');

  if (featured) {
    return (
      <div
        className={`
          relative p-5 rounded-xl
          bg-gradient-to-br from-white via-gray-50 to-white
          border-2 ${borderColor}
          shadow-sm
        `}
      >
        {/* Featured badge */}
        <div className={`absolute -top-3 left-4 px-3 py-1 rounded-full bg-white border ${borderColor} shadow-sm`}>
          <div className="flex items-center gap-1.5">
            <Sparkles className={`h-3.5 w-3.5 ${accentColor}`} />
            <span className={`text-xs font-semibold ${accentColor}`}>
              Pro Tip
            </span>
          </div>
        </div>

        <div className="mt-2">
          <p className="text-sm text-gray-700 leading-relaxed italic">
            "{advice}"
          </p>
          {agentName && (
            <p className={`mt-3 text-xs font-medium ${accentColor}`}>
              — Based on {agentName}'s experience
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg
        bg-white/70 backdrop-blur-sm
        border-l-4 ${borderColor}
        hover:shadow-sm transition-shadow
      `}
    >
      <div className={`flex-shrink-0 mt-0.5 ${accentColor}`}>
        <MessageCircle className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-700 leading-relaxed">
          {advice}
        </p>
      </div>
    </div>
  );
}

/**
 * Container for multiple agent insights
 */
interface AgentInsightsListProps {
  insights: string[];
  agentName?: string;
  accentColor?: string;
  /** Show first insight as featured */
  featureFirst?: boolean;
  title?: string;
}

export function AgentInsightsList({
  insights,
  agentName,
  accentColor = 'text-blue-600',
  featureFirst = false,
  title = "From my experience...",
}: AgentInsightsListProps) {
  if (insights.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className={`h-5 w-5 ${accentColor}`} />
        <h4 className="text-lg font-semibold text-gray-900">
          {title}
        </h4>
      </div>

      <div className="space-y-3">
        {insights.map((advice, idx) => (
          <AgentInsight
            key={idx}
            advice={advice}
            agentName={agentName}
            accentColor={accentColor}
            featured={featureFirst && idx === 0}
          />
        ))}
      </div>
    </div>
  );
}
