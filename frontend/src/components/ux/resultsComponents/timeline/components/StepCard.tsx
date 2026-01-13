// components/ux/resultsComponents/timeline/components/StepCard.tsx
'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { AgentInsightsList } from './AgentInsight';
import { InteractiveChecklist } from './InteractiveChecklist';
import { StoryCard, type MatchedStory } from './StoryCard';
import { PhaseInsight, type PhaseTip } from './PhaseInsight';
import { BasedOnYour } from './PersonalizationChip';
import { selectBestStory, selectBestTip } from '@/lib/stories/insightSelector';
import type { TimelinePhase, TimelineFlow } from '@/lib/offers/definitions/timeline/timeline-types';
import type { ColorTheme } from '@/lib/colors/defaultTheme';
import { getPhaseIcon } from '@/components/svg/timeline';

interface StepCardColors {
  gradient: string;
  accentColor: string;
  borderColor: string;
  badgeBg: string;
  iconBg: string;
  _theme?: ColorTheme;
}

interface StepCardProps {
  phase: TimelinePhase;
  stepNumber: number;
  totalSteps: number;
  colors: StepCardColors;
  /** The user's intent (buy/sell/browse) for SVG selection */
  intent?: TimelineFlow;
  /** Start expanded or collapsed */
  defaultExpanded?: boolean;
  /** Agent name for insight attribution */
  agentName?: string;
  /** Matched stories for this phase */
  matchedStories?: MatchedStory[];
  /** Enable interactive features (checklist) */
  interactive?: boolean;
  /** User situation for personalization chips */
  userSituation?: {
    location?: string;
    budget?: string;
    timeline?: string;
    isFirstTime?: boolean;
  };
  /** Custom color theme */
  colorTheme?: ColorTheme;
  /** Use unified insight mode (1 story + 1 tip per phase) */
  unifiedInsightMode?: boolean;
}

/**
 * Enhanced step card with SVG hero, stories, interactive checklist, and personalization
 */
export function StepCard({
  phase,
  stepNumber,
  totalSteps,
  colors,
  intent = 'buy',
  defaultExpanded = true,
  agentName,
  matchedStories = [],
  interactive = true,
  userSituation,
  colorTheme,
  unifiedInsightMode = false,
}: StepCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showAllStories, setShowAllStories] = useState(false);
  const [showExtras, setShowExtras] = useState(false);

  // Show max 2 stories initially, expandable if more exist
  const MAX_VISIBLE_STORIES = 2;
  const hasMoreStories = matchedStories.length > MAX_VISIBLE_STORIES;
  const visibleStories = showAllStories ? matchedStories : matchedStories.slice(0, MAX_VISIBLE_STORIES);
  const hiddenStoriesCount = matchedStories.length - MAX_VISIBLE_STORIES;
  const hasCustomTheme = !!colorTheme;

  // Unified insight mode: select best story and tip
  const bestStory = unifiedInsightMode ? selectBestStory(matchedStories) : undefined;
  const bestTip = unifiedInsightMode && phase.agentAdvice?.length
    ? selectBestTip(phase.agentAdvice)
    : undefined;
  const hasUnifiedInsight = bestStory || bestTip;

  // Calculate remaining stories and tips (beyond the primary one) for "Other Tips & Stories"
  const remainingStories = unifiedInsightMode && bestStory
    ? matchedStories.filter(s => s.id !== bestStory.id)
    : [];
  const remainingTips = unifiedInsightMode && bestTip && phase.agentAdvice
    ? phase.agentAdvice.filter(tip => tip !== bestTip.content)
    : [];
  const hasExtras = remainingStories.length > 0 || remainingTips.length > 0;
  const extrasCount = remainingStories.length + remainingTips.length;

  // Get phase-specific SVG icon based on intent
  const PhaseSvgIcon = getPhaseIcon(intent, phase.id);

  // Dark mode support
  const isDarkTheme = colorTheme && (colorTheme.background === '#0a0a0a' || colorTheme.background === '#0f172a');

  // Inline styles for custom theme
  const borderStyle = hasCustomTheme ? { borderColor: `${colorTheme.primary}40` } : undefined;
  const accentBgStyle = hasCustomTheme ? { backgroundColor: colorTheme.primary } : undefined;
  const accentStyle = hasCustomTheme ? { color: colorTheme.primary } : undefined;
  const iconBgStyle = hasCustomTheme ? { backgroundColor: `${colorTheme.primary}08` } : undefined;
  const gradientBgStyle = hasCustomTheme
    ? { background: `linear-gradient(to bottom right, ${colorTheme.gradientFrom}15, ${colorTheme.gradientTo}15)` }
    : undefined;
  const svgBgStyle = hasCustomTheme
    ? { background: `radial-gradient(circle at center, ${colorTheme.primary}15 0%, transparent 70%)` }
    : undefined;
  const surfaceStyle = hasCustomTheme ? { backgroundColor: colorTheme.surface } : undefined;
  const headingStyle = hasCustomTheme ? { color: colorTheme.text } : undefined;
  const subTextStyle = hasCustomTheme ? { color: colorTheme.textSecondary } : undefined;
  const cardBgStyle = hasCustomTheme ? { backgroundColor: `${colorTheme.surface}99` } : undefined;
  const progressBgStyle = hasCustomTheme ? { backgroundColor: colorTheme.border } : undefined;

  // Build personalization factors for "Based on your" display
  const personalizationFactors: { type: 'location' | 'budget' | 'timeline' | 'user'; value: string }[] = [];
  if (userSituation?.location) personalizationFactors.push({ type: 'location', value: userSituation.location });
  if (userSituation?.budget) personalizationFactors.push({ type: 'budget', value: userSituation.budget });
  if (userSituation?.timeline) personalizationFactors.push({ type: 'timeline', value: userSituation.timeline });
  if (userSituation?.isFirstTime) personalizationFactors.push({ type: 'user', value: 'First-Time Buyer' });

  return (
    <div
      className={`
        relative rounded-3xl border-2 ${hasCustomTheme ? '' : colors.borderColor}
        ${hasCustomTheme ? '' : expanded ? colors.gradient : 'bg-white'}
        shadow-lg hover:shadow-xl
        transition-all duration-300
        overflow-hidden
      `}
      style={hasCustomTheme
        ? expanded
          ? { ...borderStyle, ...gradientBgStyle }
          : { ...borderStyle, backgroundColor: colorTheme.surface }
        : undefined
      }
    >
      {/* SVG Hero Section - Always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left hover:bg-black/[0.01] transition-colors"
      >
        {/* Large SVG Hero */}
        <div
          className={`
            relative flex items-center justify-center py-8 px-4
            ${hasCustomTheme ? '' : 'bg-gradient-to-b from-slate-50/80 to-transparent'}
          `}
          style={svgBgStyle}
        >
          {/* Step badge - top left */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span
              className={`
                px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider
                ${hasCustomTheme ? '' : colors.badgeBg}
                ${hasCustomTheme ? '' : colors.accentColor}
                shadow-sm backdrop-blur-sm
              `}
              style={hasCustomTheme ? { ...accentStyle, backgroundColor: `${colorTheme.surface}cc` } : undefined}
            >
              Step {stepNumber} of {totalSteps}
            </span>
            {phase.isOptional && (
              <span
                className={`text-xs px-2.5 py-1 rounded-full border backdrop-blur-sm ${hasCustomTheme ? '' : 'bg-gray-100/80 text-gray-600 border-gray-200'}`}
                style={hasCustomTheme ? { backgroundColor: `${colorTheme.surface}cc`, color: colorTheme.textSecondary, borderColor: colorTheme.border } : undefined}
              >
                Optional
              </span>
            )}
          </div>

          {/* Expand/collapse - top right */}
          <div className="absolute top-4 right-4">
            <div
              className={`
                p-2.5 rounded-full backdrop-blur-sm
                border ${hasCustomTheme ? '' : colors.borderColor}
                shadow-sm
                ${hasCustomTheme ? '' : 'bg-white/80'}
              `}
              style={hasCustomTheme ? { ...borderStyle, backgroundColor: `${colorTheme.surface}cc` } : undefined}
            >
              {expanded ? (
                <ChevronUp className={`h-5 w-5 ${hasCustomTheme ? '' : colors.accentColor}`} style={accentStyle} />
              ) : (
                <ChevronDown className={`h-5 w-5 ${hasCustomTheme ? '' : colors.accentColor}`} style={accentStyle} />
              )}
            </div>
          </div>

          {/* Story indicator - top right below expand */}
          {matchedStories.length > 0 && (
            <div className="absolute top-16 right-4">
              <span className={`text-xs px-2.5 py-1 rounded-full border flex items-center gap-1 backdrop-blur-sm shadow-sm ${isDarkTheme ? 'bg-amber-900/50 text-amber-300 border-amber-700/50' : 'bg-amber-100/90 text-amber-700 border-amber-200'}`}>
                <Sparkles className="h-3 w-3" />
                Story
              </span>
            </div>
          )}

          {/* The SVG - Large and centered */}
          <div className="w-44 h-44 md:w-56 md:h-56 flex items-center justify-center">
            {PhaseSvgIcon ? (
              <div className="w-full h-full transform hover:scale-105 transition-transform duration-300">
                <PhaseSvgIcon />
              </div>
            ) : (
              <div
                className={`
                  w-24 h-24 rounded-full flex items-center justify-center
                  ${hasCustomTheme ? '' : colors.iconBg}
                `}
                style={iconBgStyle}
              >
                <CheckCircle2 className={`h-12 w-12 ${hasCustomTheme ? '' : colors.accentColor}`} style={accentStyle} />
              </div>
            )}
          </div>
        </div>

        {/* Title and Timeline Section */}
        <div className="px-6 pb-4 text-center">
          <h3
            className={`text-2xl md:text-3xl font-bold ${hasCustomTheme ? '' : 'text-gray-900'}`}
            style={headingStyle}
          >
            {phase.name}
          </h3>

          {phase.timeline && (
            <div className="mt-3">
              <div
                className={`flex items-center justify-center gap-2 text-sm ${hasCustomTheme ? '' : 'text-gray-600'}`}
                style={subTextStyle}
              >
                <Clock className="h-4 w-4" />
                <span className="font-medium">{phase.timeline}</span>
                {phase.timelineVariability && (
                  <span className={`text-xs ${hasCustomTheme ? 'opacity-70' : 'text-gray-400'}`}>
                    ({phase.timelineVariability})
                  </span>
                )}
              </div>
              <p className={`text-xs mt-1 ${hasCustomTheme ? 'opacity-60' : 'text-gray-400'}`}>
                *Typical timeframe estimate
              </p>
            </div>
          )}

          {/* Preview text when collapsed */}
          {!expanded && (
            <p
              className={`mt-3 text-sm line-clamp-2 max-w-xl mx-auto ${hasCustomTheme ? '' : 'text-gray-500'}`}
              style={subTextStyle}
            >
              {phase.description}
            </p>
          )}
        </div>
      </button>

      {/* Expandable content */}
      {expanded && (
        <div className="px-6 pb-8 space-y-6">
          {/* Divider */}
          <div
            className={`h-px ${hasCustomTheme ? '' : colors.borderColor.replace('border-', 'bg-')}`}
            style={hasCustomTheme ? { backgroundColor: `${colorTheme.primary}20` } : undefined}
          />

          {/* Description */}
          <div className="prose prose-sm max-w-none">
            <p
              className={`leading-relaxed text-base text-center max-w-2xl mx-auto ${hasCustomTheme ? '' : 'text-gray-700'}`}
              style={hasCustomTheme ? { color: colorTheme.text } : undefined}
            >
              {phase.description}
            </p>
          </div>

          {/* Conditional note */}
          {phase.conditionalNote && (
            <div className={`flex items-start gap-3 p-4 border rounded-xl max-w-2xl mx-auto ${isDarkTheme ? 'bg-amber-900/30 border-amber-700/50' : 'bg-amber-50 border-amber-200'}`}>
              <AlertCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${isDarkTheme ? 'text-amber-400' : 'text-amber-600'}`} />
              <p className={`text-sm ${isDarkTheme ? 'text-amber-300' : 'text-amber-800'}`}>
                {phase.conditionalNote}
              </p>
            </div>
          )}

          {/* Unified Insight Mode: Side-by-side layout for action items and primary insight */}
          {unifiedInsightMode && (
            <>
              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {/* Action Items - Left side */}
                {phase.actionItems && phase.actionItems.length > 0 && (
                  <div
                    className={`rounded-2xl p-5 border ${hasCustomTheme ? '' : 'bg-white/60 border-gray-200/50'}`}
                    style={hasCustomTheme ? { backgroundColor: `${colorTheme.surface}99`, borderColor: `${colorTheme.border}80` } : undefined}
                  >
                    {personalizationFactors.length > 0 && (
                      <BasedOnYour factors={personalizationFactors} className="mb-3" />
                    )}
                    <InteractiveChecklist
                      items={phase.actionItems}
                      phaseId={phase.id}
                      accentColor={colors.accentColor}
                      interactive={interactive}
                      colorTheme={colorTheme}
                    />
                  </div>
                )}

                {/* Primary Insight - Right side (always visible, not expandable) */}
                {hasUnifiedInsight && (
                  <div className="flex flex-col">
                    <PhaseInsight
                      agentName={agentName}
                      story={bestStory}
                      tip={bestTip}
                      accentColor={colors.accentColor}
                      colorTheme={colorTheme}
                    />
                  </div>
                )}
              </div>

              {/* Other Tips & Stories - Collapsible section for extras */}
              {hasExtras && (
                <div className="max-w-4xl mx-auto mt-4">
                  <button
                    onClick={() => setShowExtras(!showExtras)}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all duration-200 ${
                      isDarkTheme
                        ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800 text-gray-300'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    {showExtras ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">
                      {showExtras ? 'Hide' : 'Show'} Other Tips & Stories
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      isDarkTheme ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {extrasCount}
                    </span>
                  </button>

                  {showExtras && (
                    <div className={`mt-4 p-5 rounded-2xl border space-y-4 ${
                      isDarkTheme
                        ? 'bg-gray-800/30 border-gray-700'
                        : 'bg-gray-50/50 border-gray-200'
                    }`}>
                      {/* Extra Tips */}
                      {remainingTips.length > 0 && (
                        <div>
                          <h5 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
                            isDarkTheme ? 'text-cyan-400' : 'text-cyan-700'
                          }`}>
                            <Sparkles className="h-4 w-4" />
                            Additional Tips ({remainingTips.length})
                          </h5>
                          <div className="space-y-2">
                            {remainingTips.map((tip, idx) => (
                              <div
                                key={idx}
                                className={`p-3 rounded-lg border-l-4 ${
                                  isDarkTheme
                                    ? 'bg-gray-800/50 border-cyan-600 text-gray-300'
                                    : 'bg-white border-cyan-500 text-gray-700'
                                }`}
                              >
                                <p className="text-sm">{tip}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Extra Stories */}
                      {remainingStories.length > 0 && (
                        <div>
                          <h5 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
                            isDarkTheme ? 'text-amber-400' : 'text-amber-700'
                          }`}>
                            <Sparkles className="h-4 w-4" />
                            More Client Stories ({remainingStories.length})
                          </h5>
                          <div className="grid gap-3">
                            {remainingStories.map((story) => (
                              <StoryCard
                                key={story.id}
                                story={story}
                                accentColor={isDarkTheme ? 'text-amber-300' : 'text-amber-700'}
                                borderColor={isDarkTheme ? 'border-amber-700/50' : 'border-amber-200'}
                                compact={true}
                                colorTheme={colorTheme}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Original Layout: Two-column for action items and advice */}
          {!unifiedInsightMode && (
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Interactive Action items with personalization context */}
              {phase.actionItems && phase.actionItems.length > 0 && (
                <div
                  className={`rounded-2xl p-5 border ${hasCustomTheme ? '' : 'bg-white/60 border-gray-200/50'}`}
                  style={hasCustomTheme ? { backgroundColor: `${colorTheme.surface}99`, borderColor: `${colorTheme.border}80` } : undefined}
                >
                  {/* Show personalization factors next to action items */}
                  {personalizationFactors.length > 0 && (
                    <BasedOnYour factors={personalizationFactors} className="mb-3" />
                  )}

                  <InteractiveChecklist
                    items={phase.actionItems}
                    phaseId={phase.id}
                    accentColor={colors.accentColor}
                    interactive={interactive}
                    colorTheme={colorTheme}
                  />
                </div>
              )}

              {/* Agent advice */}
              {phase.agentAdvice && phase.agentAdvice.length > 0 && (
                <div
                  className={`rounded-2xl p-5 border ${hasCustomTheme ? '' : 'bg-white/60 border-gray-200/50'}`}
                  style={hasCustomTheme ? { backgroundColor: `${colorTheme.surface}99`, borderColor: `${colorTheme.border}80` } : undefined}
                >
                  <AgentInsightsList
                    insights={phase.agentAdvice}
                    agentName={agentName}
                    accentColor={colors.accentColor}
                    featureFirst={phase.agentAdvice.length > 1}
                  />
                </div>
              )}
            </div>
          )}

          {/* Matched Stories - Only shown in original mode */}
          {!unifiedInsightMode && matchedStories.length > 0 && (
            <div className="mt-6">
              {/* Stories header with amber accent */}
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className={`h-px flex-1 bg-gradient-to-r from-transparent to-transparent ${isDarkTheme ? 'via-amber-600' : 'via-amber-300'}`} />
                <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border ${isDarkTheme ? 'bg-amber-900/50 border-amber-700/50' : 'bg-amber-100 border-amber-200'}`}>
                  <Sparkles className={`h-4 w-4 ${isDarkTheme ? 'text-amber-400' : 'text-amber-600'}`} />
                  <span className={`text-sm font-bold uppercase tracking-wide ${isDarkTheme ? 'text-amber-300' : 'text-amber-700'}`}>
                    {matchedStories.length === 1 ? 'Client Story' : `${matchedStories.length} Client Stories`}
                  </span>
                </div>
                <div className={`h-px flex-1 bg-gradient-to-r from-transparent to-transparent ${isDarkTheme ? 'via-amber-600' : 'via-amber-300'}`} />
              </div>

              {/* Stories grid - initially shows max 2 */}
              <div className={`grid ${visibleStories.length > 1 ? 'md:grid-cols-2' : ''} gap-4 max-w-3xl mx-auto`}>
                {visibleStories.map((story) => (
                  <div
                    key={story.id}
                    className={`rounded-xl border-2 overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 ${isDarkTheme ? 'bg-gradient-to-br from-amber-900/30 to-orange-900/30 border-amber-700/50' : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/60'}`}
                  >
                    {/* Story header with title */}
                    <div className={`px-4 py-2.5 border-b ${isDarkTheme ? 'bg-gradient-to-r from-amber-900/40 to-orange-900/40 border-amber-700/50' : 'bg-gradient-to-r from-amber-100 to-orange-100 border-amber-200/60'}`}>
                      <h4 className={`font-bold text-sm flex items-center gap-2 ${isDarkTheme ? 'text-amber-200' : 'text-amber-900'}`}>
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        {story.title || 'Client Experience'}
                      </h4>
                      {story.clientType && (
                        <span className={`text-xs mt-0.5 block ${isDarkTheme ? 'text-amber-400' : 'text-amber-700'}`}>{story.clientType}</span>
                      )}
                    </div>
                    <div className="p-4">
                      <StoryCard
                        story={story}
                        accentColor={isDarkTheme ? 'text-amber-300' : 'text-amber-700'}
                        borderColor="border-transparent"
                        compact={false}
                        hideHeader={true}
                        colorTheme={colorTheme}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Show more/less button for additional stories */}
              {hasMoreStories && (
                <div className="text-center mt-4">
                  <button
                    onClick={() => setShowAllStories(!showAllStories)}
                    className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full border transition-all duration-200 ${isDarkTheme ? 'text-amber-300 hover:text-amber-200 bg-amber-900/30 hover:bg-amber-900/50 border-amber-700/50' : 'text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border-amber-200'}`}
                  >
                    {showAllStories ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        Show fewer stories
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        Show {hiddenStoriesCount} more {hiddenStoriesCount === 1 ? 'story' : 'stories'}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Resources */}
          {phase.resources && phase.resources.length > 0 && (
            <div className="max-w-2xl mx-auto">
              <h4
                className={`text-lg font-semibold mb-3 text-center ${hasCustomTheme ? '' : 'text-gray-900'}`}
                style={headingStyle}
              >
                Helpful Resources
              </h4>
              <div className="grid gap-2">
                {phase.resources.map((resource, idx) => (
                  <a
                    key={idx}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 p-3 rounded-lg border hover:shadow-sm transition-all group ${hasCustomTheme ? '' : 'bg-white border-gray-200 hover:border-gray-300'}`}
                    style={hasCustomTheme ? { backgroundColor: colorTheme.surface, borderColor: colorTheme.border } : undefined}
                  >
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${hasCustomTheme ? '' : 'text-gray-900 group-hover:text-blue-600'}`}
                        style={headingStyle}
                      >
                        {resource.title}
                      </p>
                      {resource.description && (
                        <p
                          className={`text-xs mt-0.5 ${hasCustomTheme ? '' : 'text-gray-500'}`}
                          style={subTextStyle}
                        >
                          {resource.description}
                        </p>
                      )}
                    </div>
                    <ChevronUp
                      className={`h-4 w-4 rotate-90 ${hasCustomTheme ? '' : 'text-gray-400 group-hover:text-blue-600'}`}
                      style={subTextStyle}
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Progress indicator at bottom */}
      <div
        className={`h-1.5 ${hasCustomTheme ? '' : 'bg-gray-100'}`}
        style={progressBgStyle}
      >
        <div
          className={`h-full ${hasCustomTheme ? '' : colors.accentColor.replace('text-', 'bg-')} transition-all`}
          style={hasCustomTheme
            ? { width: `${(stepNumber / totalSteps) * 100}%`, backgroundColor: colorTheme.primary }
            : { width: `${(stepNumber / totalSteps) * 100}%` }
          }
        />
      </div>
    </div>
  );
}
