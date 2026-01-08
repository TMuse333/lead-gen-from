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
import { BasedOnYour } from './PersonalizationChip';
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
}: StepCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const hasCustomTheme = !!colorTheme;

  // Get phase-specific SVG icon based on intent
  const PhaseSvgIcon = getPhaseIcon(intent, phase.id);

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

  // Build personalization factors for "Based on your" display
  const personalizationFactors: { type: 'location' | 'budget' | 'timeline' | 'user'; value: string }[] = [];
  if (userSituation?.location) personalizationFactors.push({ type: 'location', value: userSituation.location });
  if (userSituation?.budget) personalizationFactors.push({ type: 'budget', value: userSituation.budget });

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
          : { ...borderStyle, backgroundColor: 'white' }
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
                ${hasCustomTheme ? 'bg-white/80' : colors.badgeBg}
                ${hasCustomTheme ? '' : colors.accentColor}
                shadow-sm backdrop-blur-sm
              `}
              style={accentStyle}
            >
              Step {stepNumber} of {totalSteps}
            </span>
            {phase.isOptional && (
              <span className="text-xs bg-gray-100/80 text-gray-600 px-2.5 py-1 rounded-full border border-gray-200 backdrop-blur-sm">
                Optional
              </span>
            )}
          </div>

          {/* Expand/collapse - top right */}
          <div className="absolute top-4 right-4">
            <div
              className={`
                p-2.5 rounded-full bg-white/80 backdrop-blur-sm
                border ${hasCustomTheme ? '' : colors.borderColor}
                shadow-sm
              `}
              style={borderStyle}
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
              <span className="text-xs bg-amber-100/90 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200 flex items-center gap-1 backdrop-blur-sm shadow-sm">
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
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
            {phase.name}
          </h3>

          {phase.timeline && (
            <div className="flex items-center justify-center gap-2 mt-3 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span className="font-medium">{phase.timeline}</span>
              {phase.timelineVariability && (
                <span className="text-gray-400 text-xs">
                  ({phase.timelineVariability})
                </span>
              )}
            </div>
          )}

          {/* Preview text when collapsed */}
          {!expanded && (
            <p className="mt-3 text-sm text-gray-500 line-clamp-2 max-w-xl mx-auto">
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
            <p className="text-gray-700 leading-relaxed text-base text-center max-w-2xl mx-auto">
              {phase.description}
            </p>
          </div>

          {/* Conditional note */}
          {phase.conditionalNote && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl max-w-2xl mx-auto">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                {phase.conditionalNote}
              </p>
            </div>
          )}

          {/* Two-column layout for action items and advice */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Interactive Action items */}
            {phase.actionItems && phase.actionItems.length > 0 && (
              <div className="bg-white/60 rounded-2xl p-5 border border-gray-200/50">
                <InteractiveChecklist
                  items={phase.actionItems}
                  phaseId={phase.id}
                  accentColor={colors.accentColor}
                  interactive={interactive}
                />
              </div>
            )}

            {/* Agent advice with personalization context */}
            {phase.agentAdvice && phase.agentAdvice.length > 0 && (
              <div className="bg-white/60 rounded-2xl p-5 border border-gray-200/50">
                {/* Show personalization factors if available */}
                {personalizationFactors.length > 0 && (
                  <BasedOnYour factors={personalizationFactors} className="mb-3" />
                )}

                <AgentInsightsList
                  insights={phase.agentAdvice}
                  agentName={agentName}
                  accentColor={colors.accentColor}
                  featureFirst={phase.agentAdvice.length > 1}
                />
              </div>
            )}
          </div>

          {/* Matched Stories - Full width below */}
          {matchedStories.length > 0 && (
            <div className="space-y-3 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Similar Client Experience
                </h4>
              </div>
              {matchedStories.slice(0, 1).map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  accentColor={colors.accentColor}
                  borderColor={colors.borderColor}
                  compact
                />
              ))}
            </div>
          )}

          {/* Resources */}
          {phase.resources && phase.resources.length > 0 && (
            <div className="max-w-2xl mx-auto">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 text-center">
                Helpful Resources
              </h4>
              <div className="grid gap-2">
                {phase.resources.map((resource, idx) => (
                  <a
                    key={idx}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all group"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                        {resource.title}
                      </p>
                      {resource.description && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {resource.description}
                        </p>
                      )}
                    </div>
                    <ChevronUp className="h-4 w-4 text-gray-400 group-hover:text-blue-600 rotate-90" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Progress indicator at bottom */}
      <div className="h-1.5 bg-gray-100">
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
