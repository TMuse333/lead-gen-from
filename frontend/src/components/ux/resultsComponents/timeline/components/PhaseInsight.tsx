// components/ux/resultsComponents/timeline/components/PhaseInsight.tsx
'use client';

import { Lightbulb, Heart, Quote, ArrowRight } from 'lucide-react';
import type { MatchedStory } from '@/types/advice.types';
import type { ColorTheme } from '@/lib/colors/defaultTheme';

/**
 * Tip structure for the insight card
 */
export interface PhaseTip {
  id?: string;
  content: string;
  title?: string;
}

interface PhaseInsightProps {
  /** The agent's name for attribution */
  agentName?: string;
  /** Single tip for this phase (optional) */
  tip?: PhaseTip;
  /** Single story for this phase (optional) */
  story?: MatchedStory;
  /** Accent color for styling */
  accentColor?: string;
  /** Custom color theme for dark mode support */
  colorTheme?: ColorTheme;
}

/**
 * Unified insight card showing 1 tip + 1 story per phase
 * Clean, compact design that combines agent expertise and social proof
 */
export function PhaseInsight({
  agentName = 'Your Agent',
  tip,
  story,
  accentColor = 'text-cyan-600',
  colorTheme,
}: PhaseInsightProps) {
  // Don't render if nothing to show
  if (!tip && !story) {
    return null;
  }

  // Dark mode support
  const isDarkTheme = colorTheme && (colorTheme.background === '#0a0a0a' || colorTheme.background === '#0f172a');

  return (
    <div className={`rounded-2xl border overflow-hidden shadow-sm ${isDarkTheme ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' : 'bg-gradient-to-br from-slate-50 to-gray-50 border-gray-200'}`}>
      {/* Header */}
      <div className={`px-5 py-3 border-b ${isDarkTheme ? 'bg-gradient-to-r from-gray-800 to-gray-850 border-gray-700' : 'bg-gradient-to-r from-slate-100 to-gray-100 border-gray-200'}`}>
        <p className={`text-sm font-semibold ${isDarkTheme ? 'text-gray-200' : 'text-gray-700'}`}>
          From {agentName}'s Experience
        </p>
      </div>

      <div className={`divide-y ${isDarkTheme ? 'divide-gray-700' : 'divide-gray-100'}`}>
        {/* Tip Section */}
        {tip && (
          <div className="px-5 py-4">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg flex-shrink-0 ${isDarkTheme ? 'bg-cyan-900/50' : 'bg-cyan-100'}`}>
                <Lightbulb className={`h-4 w-4 ${isDarkTheme ? 'text-cyan-400' : 'text-cyan-600'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${isDarkTheme ? 'text-cyan-400' : 'text-cyan-700'}`}>
                  Pro Tip
                </p>
                <p className={`text-sm leading-relaxed ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                  {tip.content}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Story Section */}
        {story && (
          <div className={`px-5 py-4 ${isDarkTheme ? 'bg-amber-900/20' : 'bg-amber-50/50'}`}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg flex-shrink-0 ${isDarkTheme ? 'bg-amber-900/50' : 'bg-amber-100'}`}>
                <Heart className={`h-4 w-4 ${isDarkTheme ? 'text-amber-400' : 'text-amber-600'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <p className={`text-xs font-bold uppercase tracking-wide ${isDarkTheme ? 'text-amber-400' : 'text-amber-700'}`}>
                    Client Story
                  </p>
                  {story.clientType && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${isDarkTheme ? 'bg-amber-900/50 text-amber-300' : 'bg-amber-200/60 text-amber-700'}`}>
                      {story.clientType}
                    </span>
                  )}
                </div>

                {/* Story content - compact format */}
                <div className="space-y-2">
                  {/* Situation */}
                  {story.situation && (
                    <div className="flex items-start gap-2">
                      <Quote className={`h-3 w-3 mt-1 flex-shrink-0 ${isDarkTheme ? 'text-amber-500' : 'text-amber-400'}`} />
                      <p className={`text-sm italic ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                        {story.situation}
                      </p>
                    </div>
                  )}

                  {/* Action - what the agent did */}
                  {story.action && (
                    <div className="flex items-start gap-2 pl-5">
                      <ArrowRight className={`h-3 w-3 mt-1 flex-shrink-0 ${isDarkTheme ? 'text-amber-400' : 'text-amber-500'}`} />
                      <p className={`text-sm ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                        {story.action}
                      </p>
                    </div>
                  )}

                  {/* Outcome - highlighted */}
                  {story.outcome && (
                    <div className={`mt-2 p-2.5 border rounded-lg ${isDarkTheme ? 'bg-green-900/30 border-green-700/50' : 'bg-green-50 border-green-200'}`}>
                      <p className={`text-sm font-medium ${isDarkTheme ? 'text-green-300' : 'text-green-800'}`}>
                        <span className={isDarkTheme ? 'text-green-400' : 'text-green-600'}>Result:</span> {story.outcome}
                      </p>
                    </div>
                  )}
                </div>

                {/* Match reasons */}
                {story.matchReasons && story.matchReasons.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {story.matchReasons.slice(0, 3).map((reason, idx) => (
                      <span
                        key={idx}
                        className={`text-xs px-2 py-0.5 rounded-full ${isDarkTheme ? 'bg-amber-900/50 text-amber-300' : 'bg-amber-100 text-amber-700'}`}
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer attribution */}
      <div className={`px-5 py-2 border-t ${isDarkTheme ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
        <p className={`text-xs text-center ${isDarkTheme ? 'text-gray-500' : 'text-gray-400'}`}>
          *Based on {agentName}'s experience with similar clients
        </p>
      </div>
    </div>
  );
}

/**
 * Compact version for mobile or space-constrained layouts
 */
export function PhaseInsightCompact({
  agentName = 'Your Agent',
  tip,
  story,
  colorTheme,
}: PhaseInsightProps) {
  if (!tip && !story) {
    return null;
  }

  // Dark mode support
  const isDarkTheme = colorTheme && (colorTheme.background === '#0a0a0a' || colorTheme.background === '#0f172a');

  return (
    <div className={`rounded-xl border p-4 space-y-3 ${isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      {/* Tip - single line */}
      {tip && (
        <div className="flex items-center gap-2">
          <Lightbulb className={`h-4 w-4 flex-shrink-0 ${isDarkTheme ? 'text-cyan-400' : 'text-cyan-500'}`} />
          <p className={`text-sm line-clamp-2 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>{tip.content}</p>
        </div>
      )}

      {/* Story - ultra compact */}
      {story && (
        <div className="flex items-center gap-2">
          <Heart className={`h-4 w-4 flex-shrink-0 ${isDarkTheme ? 'text-amber-400' : 'text-amber-500'}`} />
          <p className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
            <span className={`font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>{story.title || 'Client story'}</span>
            {story.outcome && (
              <span className={isDarkTheme ? 'text-green-400' : 'text-green-600'}> → {story.outcome}</span>
            )}
          </p>
        </div>
      )}

      <p className={`text-xs ${isDarkTheme ? 'text-gray-500' : 'text-gray-400'}`}>From {agentName}'s experience</p>
    </div>
  );
}
