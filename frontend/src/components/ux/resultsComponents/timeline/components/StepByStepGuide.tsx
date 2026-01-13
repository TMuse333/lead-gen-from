// components/ux/resultsComponents/timeline/components/StepByStepGuide.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { StepCard } from './StepCard';
import { ProgressIndicator } from './ProgressIndicator';
import type { TimelinePhase, TimelineFlow } from '@/lib/offers/definitions/timeline/timeline-types';
import type { MatchedStory } from './StoryCard';
import type { ColorTheme } from '@/lib/colors/defaultTheme';

interface StepCardColors {
  gradient: string;
  accentColor: string;
  borderColor: string;
  badgeBg: string;
  iconBg: string;
  _theme?: ColorTheme;
}

interface StepByStepGuideProps {
  phases: TimelinePhase[];
  colors: StepCardColors;
  /** The user's intent (buy/sell/browse) for phase icons */
  intent?: TimelineFlow;
  /** Show sticky progress indicator at top */
  showProgress?: boolean;
  /** Agent name for insight attribution */
  agentName?: string;
  /** Start with all cards expanded or collapsed */
  defaultExpanded?: boolean;
  /** Title above the guide */
  title?: string;
  /** Matched stories per phase (phaseId -> stories) */
  storiesByPhase?: Record<string, MatchedStory[]>;
  /** Enable interactive features */
  interactive?: boolean;
  /** User situation for personalization */
  userSituation?: {
    location?: string;
    budget?: string;
    timeline?: string;
    isFirstTime?: boolean;
  };
  /** Custom color theme (overrides colors when provided) */
  colorTheme?: ColorTheme;
  /** Use unified insight mode (1 story + 1 tip per phase) - default true */
  unifiedInsightMode?: boolean;
}

/**
 * The main step-by-step guide component
 * Displays phases as interactive step cards with progress tracking
 */
export function StepByStepGuide({
  phases,
  colors,
  intent = 'buy',
  showProgress = true,
  agentName,
  defaultExpanded = true,
  title = "Your Step-by-Step Roadmap",
  storiesByPhase = {},
  interactive = true,
  userSituation,
  colorTheme,
  unifiedInsightMode = true,
}: StepByStepGuideProps) {
  // If colorTheme is provided, use it for inline styles
  const hasCustomTheme = !!colorTheme;
  const [activeStep, setActiveStep] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Track which step is in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = stepRefs.current.findIndex(
              (ref) => ref === entry.target
            );
            if (index !== -1) {
              setActiveStep(index);
            }
          }
        });
      },
      {
        rootMargin: '-100px 0px -60% 0px',
        threshold: 0,
      }
    );

    stepRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [phases.length]);

  const scrollToStep = (index: number) => {
    const ref = stepRefs.current[index];
    if (ref) {
      const yOffset = -120; // Account for sticky header
      const y = ref.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Map phases to progress steps
  const progressSteps = phases.map((phase) => ({
    id: phase.id,
    name: phase.name,
    timeline: phase.timeline,
  }));

  return (
    <div className="relative">
      {/* Sticky progress indicator */}
      {showProgress && phases.length > 1 && (
        <ProgressIndicator
          steps={progressSteps}
          currentStep={activeStep}
          accentColor={hasCustomTheme ? '' : colors.accentColor}
          borderColor={hasCustomTheme ? '' : colors.borderColor}
          sticky
          onStepClick={scrollToStep}
          colorTheme={colorTheme}
        />
      )}

      {/* Guide content */}
      <div className="py-8 px-4 md:px-6">
        {/* Title */}
        {title && (
          <div className="text-center mb-8">
            <h2
              className={`text-3xl md:text-4xl font-bold ${hasCustomTheme ? '' : 'text-gray-900'}`}
              style={hasCustomTheme ? { color: colorTheme.text } : undefined}
            >
              {title}
            </h2>
            <p
              className={`mt-2 ${hasCustomTheme ? '' : 'text-gray-600'}`}
              style={hasCustomTheme ? { color: colorTheme.textSecondary } : undefined}
            >
              {phases.length} steps to reach your goal
            </p>
          </div>
        )}

        {/* Step cards */}
        <div className="max-w-4xl mx-auto space-y-6">
          {phases.map((phase, index) => (
            <div
              key={phase.id}
              ref={(el) => {
                stepRefs.current[index] = el;
              }}
            >
              <StepCard
                phase={phase}
                stepNumber={index + 1}
                totalSteps={phases.length}
                colors={colors}
                intent={intent}
                defaultExpanded={defaultExpanded}
                agentName={agentName}
                matchedStories={storiesByPhase[phase.id] || []}
                interactive={interactive}
                userSituation={userSituation}
                colorTheme={colorTheme}
                unifiedInsightMode={unifiedInsightMode}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
