// components/ux/resultsComponents/timeline/components/AgentInsight.tsx
'use client';

import { useState } from 'react';
import { Sparkles, MessageCircle, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';

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
 * Container for multiple agent insights with collapsible support
 */
interface AgentInsightsListProps {
  insights: string[];
  agentName?: string;
  accentColor?: string;
  /** Show first insight as featured */
  featureFirst?: boolean;
  title?: string;
  /** Max insights to show before collapsing (default: 2) */
  maxVisible?: number;
}

export function AgentInsightsList({
  insights,
  agentName,
  accentColor = 'text-blue-600',
  featureFirst = false,
  title = "From my experience...",
  maxVisible = 2,
}: AgentInsightsListProps) {
  const [showAll, setShowAll] = useState(false);

  if (insights.length === 0) return null;

  const hasMore = insights.length > maxVisible;
  const visibleInsights = showAll ? insights : insights.slice(0, maxVisible);
  const hiddenCount = insights.length - maxVisible;

  // Get background color class from accent
  const bgColor = accentColor.replace('text-', 'bg-').replace('-600', '-50');
  const borderColor = accentColor.replace('text-', 'border-');

  return (
    <div className="space-y-3">
      {/* Header with colored background */}
      <div className={`flex items-center gap-2 px-3 py-2 ${bgColor} rounded-lg border ${borderColor}/30`}>
        <Lightbulb className={`h-5 w-5 ${accentColor}`} />
        <h4 className={`text-sm font-bold ${accentColor} uppercase tracking-wide`}>
          {title}
        </h4>
        <span className={`ml-auto text-xs ${accentColor}/70 font-medium`}>
          {insights.length} {insights.length === 1 ? 'tip' : 'tips'}
        </span>
      </div>

      {/* Insights list */}
      <div className="space-y-2">
        {visibleInsights.map((advice, idx) => (
          <AgentInsight
            key={idx}
            advice={advice}
            agentName={idx === 0 ? agentName : undefined}
            accentColor={accentColor}
            featured={featureFirst && idx === 0}
          />
        ))}
      </div>

      {/* Show more/less button */}
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className={`
            w-full flex items-center justify-center gap-2
            px-3 py-2 text-sm font-medium
            ${accentColor} hover:${bgColor}
            rounded-lg border ${borderColor}/30
            transition-all duration-200
          `}
        >
          {showAll ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Show fewer tips
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Show {hiddenCount} more {hiddenCount === 1 ? 'tip' : 'tips'}
            </>
          )}
        </button>
      )}

      {/* Subtle disclaimer */}
      <p className="text-xs text-gray-400 italic text-center mt-2">
        *Tips based on similar client experiences
      </p>
    </div>
  );
}
