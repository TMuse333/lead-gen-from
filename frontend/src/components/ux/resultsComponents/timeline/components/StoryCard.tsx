// components/ux/resultsComponents/timeline/components/StoryCard.tsx
'use client';

import { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, MapPin, DollarSign, User, Quote } from 'lucide-react';

export interface MatchedStory {
  id: string;
  title: string;
  situation: string;
  whatTheyDid: string;
  outcome: string;
  clientType?: string; // "First-time buyer", "Relocating family"
  location?: string;
  budget?: string;
  matchReasons: string[]; // ["Similar budget", "Same area", "First-time buyer"]
}

interface StoryCardProps {
  story: MatchedStory;
  accentColor: string;
  borderColor: string;
  compact?: boolean;
}

/**
 * Displays a matched client story within a phase
 * Shows social proof with relevance indicators
 */
export function StoryCard({ story, accentColor, borderColor, compact = false }: StoryCardProps) {
  const [expanded, setExpanded] = useState(false);

  if (compact) {
    return (
      <div className={`p-4 bg-amber-50/80 rounded-xl border-2 border-amber-200/60`}>
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
            <BookOpen className="h-4 w-4 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                Similar Experience
              </span>
            </div>
            <p className="text-sm text-amber-900 font-medium line-clamp-2">
              "{story.situation}"
            </p>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-amber-600 hover:text-amber-700 mt-2 font-medium flex items-center gap-1"
            >
              {expanded ? 'Show less' : 'Read their story'}
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          </div>
        </div>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-amber-200 space-y-3">
            <div>
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">
                What We Did
              </p>
              <p className="text-sm text-amber-800">{story.whatTheyDid}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">
                The Result
              </p>
              <p className="text-sm text-amber-800">{story.outcome}</p>
            </div>
            {story.matchReasons.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {story.matchReasons.map((reason, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2 py-0.5 bg-amber-200/60 text-amber-700 rounded-full"
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
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-5 border-b border-amber-200/60">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-100 rounded-xl flex-shrink-0">
            <BookOpen className="h-6 w-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                Client Story
              </span>
              {story.clientType && (
                <span className="text-xs px-2 py-0.5 bg-amber-200/60 text-amber-700 rounded-full">
                  {story.clientType}
                </span>
              )}
            </div>
            <h4 className="text-lg font-bold text-gray-900">{story.title}</h4>

            {/* Match indicators */}
            <div className="flex flex-wrap gap-2 mt-2">
              {story.location && (
                <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                  <MapPin className="h-3 w-3" />
                  {story.location}
                </span>
              )}
              {story.budget && (
                <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                  <DollarSign className="h-3 w-3" />
                  {story.budget}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Story content */}
      <div className="p-5 space-y-4">
        {/* Situation - with quote styling */}
        <div className="relative">
          <Quote className="absolute -top-1 -left-1 h-6 w-6 text-amber-300" />
          <p className="text-gray-700 pl-6 italic">
            {story.situation}
          </p>
        </div>

        {/* What they did */}
        <div>
          <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
            How We Helped
          </p>
          <p className="text-gray-700 text-sm">{story.whatTheyDid}</p>
        </div>

        {/* Outcome - highlighted */}
        <div className="p-4 bg-green-50 rounded-xl border border-green-200">
          <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">
            The Result
          </p>
          <p className="text-green-800 font-medium">{story.outcome}</p>
        </div>

        {/* Why this story matches */}
        {story.matchReasons.length > 0 && (
          <div className="pt-3 border-t border-amber-200/60">
            <p className="text-xs text-amber-600 mb-2 font-medium">
              Why this is relevant to you:
            </p>
            <div className="flex flex-wrap gap-2">
              {story.matchReasons.map((reason, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full font-medium"
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
