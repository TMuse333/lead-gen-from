// components/ux/resultsComponents/timeline/components/StoryCard.tsx
'use client';

import { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, MapPin, DollarSign, Quote } from 'lucide-react';
import type { MatchedStory } from '@/types/advice.types';
import type { ColorTheme } from '@/lib/colors/defaultTheme';

// Re-export for backward compatibility
export type { MatchedStory };

interface StoryCardProps {
  story: MatchedStory;
  accentColor: string;
  borderColor: string;
  compact?: boolean;
  /** Hide the header section (when rendered inside a wrapper that provides its own header) */
  hideHeader?: boolean;
  /** Custom color theme for dark mode support */
  colorTheme?: ColorTheme;
}

/**
 * Displays a matched client story within a phase
 * Shows social proof with relevance indicators
 */
export function StoryCard({ story, accentColor, borderColor, compact = false, hideHeader = false, colorTheme }: StoryCardProps) {
  const [expanded, setExpanded] = useState(false);

  // Dark mode support
  const isDarkTheme = colorTheme && (colorTheme.background === '#0a0a0a' || colorTheme.background === '#0f172a');

  if (compact) {
    return (
      <div className={`p-4 rounded-xl border-2 ${isDarkTheme ? 'bg-amber-900/30 border-amber-700/50' : 'bg-amber-50/80 border-amber-200/60'}`}>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg flex-shrink-0 ${isDarkTheme ? 'bg-amber-900/50' : 'bg-amber-100'}`}>
            <BookOpen className={`h-4 w-4 ${isDarkTheme ? 'text-amber-400' : 'text-amber-600'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-semibold uppercase tracking-wide ${isDarkTheme ? 'text-amber-400' : 'text-amber-700'}`}>
                Similar Experience
              </span>
            </div>
            <p className={`text-sm font-medium line-clamp-2 ${isDarkTheme ? 'text-amber-200' : 'text-amber-900'}`}>
              "{story.situation}"
            </p>
            <button
              onClick={() => setExpanded(!expanded)}
              className={`text-xs mt-2 font-medium flex items-center gap-1 ${isDarkTheme ? 'text-amber-400 hover:text-amber-300' : 'text-amber-600 hover:text-amber-700'}`}
            >
              {expanded ? 'Show less' : 'Read their story'}
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          </div>
        </div>

        {expanded && (
          <div className={`mt-4 pt-4 border-t space-y-3 ${isDarkTheme ? 'border-amber-700/50' : 'border-amber-200'}`}>
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${isDarkTheme ? 'text-amber-400' : 'text-amber-700'}`}>
                What We Did
              </p>
              <p className={`text-sm ${isDarkTheme ? 'text-amber-200' : 'text-amber-800'}`}>{story.action}</p>
            </div>
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${isDarkTheme ? 'text-amber-400' : 'text-amber-700'}`}>
                The Result
              </p>
              <p className={`text-sm ${isDarkTheme ? 'text-amber-200' : 'text-amber-800'}`}>{story.outcome}</p>
            </div>
            {story.matchReasons.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {story.matchReasons.map((reason, idx) => (
                  <span
                    key={idx}
                    className={`text-xs px-2 py-0.5 rounded-full ${isDarkTheme ? 'bg-amber-900/50 text-amber-300' : 'bg-amber-200/60 text-amber-700'}`}
                  >
                    {reason}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Full card view
  return (
    <div className={`${hideHeader ? '' : isDarkTheme ? 'bg-gradient-to-br from-amber-900/30 to-orange-900/30 rounded-2xl border-2 border-amber-700/50 overflow-hidden shadow-sm' : 'bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200 overflow-hidden shadow-sm'}`}>
      {/* Header - conditionally shown */}
      {!hideHeader && (
        <div className={`p-5 border-b ${isDarkTheme ? 'border-amber-700/50' : 'border-amber-200/60'}`}>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl flex-shrink-0 ${isDarkTheme ? 'bg-amber-900/50' : 'bg-amber-100'}`}>
              <BookOpen className={`h-6 w-6 ${isDarkTheme ? 'text-amber-400' : 'text-amber-600'}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-bold uppercase tracking-wider ${isDarkTheme ? 'text-amber-400' : 'text-amber-600'}`}>
                  Client Story
                </span>
                {story.clientType && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${isDarkTheme ? 'bg-amber-900/50 text-amber-300' : 'bg-amber-200/60 text-amber-700'}`}>
                    {story.clientType}
                  </span>
                )}
              </div>
              <h4 className={`text-lg font-bold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>{story.title}</h4>

              {/* Match indicators */}
              <div className="flex flex-wrap gap-2 mt-2">
                {story.location && (
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${isDarkTheme ? 'text-amber-300 bg-amber-900/50' : 'text-amber-700 bg-amber-100'}`}>
                    <MapPin className="h-3 w-3" />
                    {story.location}
                  </span>
                )}
                {story.budget && (
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${isDarkTheme ? 'text-amber-300 bg-amber-900/50' : 'text-amber-700 bg-amber-100'}`}>
                    <DollarSign className="h-3 w-3" />
                    {story.budget}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Story content */}
      <div className={`${hideHeader ? '' : 'p-5'} space-y-4`}>
        {/* Situation - with quote styling */}
        <div className="relative">
          <Quote className={`absolute -top-1 -left-1 h-6 w-6 ${isDarkTheme ? 'text-amber-600' : 'text-amber-300'}`} />
          <p className={`pl-6 italic ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
            {story.situation}
          </p>
        </div>

        {/* What they did */}
        <div>
          <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDarkTheme ? 'text-amber-400' : 'text-amber-600'}`}>
            How We Helped
          </p>
          <p className={`text-sm ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>{story.action}</p>
        </div>

        {/* Outcome - highlighted */}
        <div className={`p-4 rounded-xl border ${isDarkTheme ? 'bg-green-900/30 border-green-700/50' : 'bg-green-50 border-green-200'}`}>
          <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDarkTheme ? 'text-green-400' : 'text-green-600'}`}>
            The Result
          </p>
          <p className={`font-medium ${isDarkTheme ? 'text-green-300' : 'text-green-800'}`}>{story.outcome}</p>
        </div>

        {/* Why this story matches */}
        {story.matchReasons.length > 0 && (
          <div className={`pt-3 border-t ${isDarkTheme ? 'border-amber-700/50' : 'border-amber-200/60'}`}>
            <p className={`text-xs mb-2 font-medium ${isDarkTheme ? 'text-amber-400' : 'text-amber-600'}`}>
              Why this is relevant to you:
            </p>
            <div className="flex flex-wrap gap-2">
              {story.matchReasons.map((reason, idx) => (
                <span
                  key={idx}
                  className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${isDarkTheme ? 'bg-amber-900/50 text-amber-300' : 'bg-amber-100 text-amber-700'}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  {reason}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
