// components/ux/chatWithTracker/components/ValuePreviewPanel.tsx
'use client';

import { useState } from 'react';
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import type { OfferType } from '@/stores/onboardingStore/onboarding.store';

interface ValuePreviewPanelProps {
  offerType?: OfferType;
  progress: number;
  userInput: Record<string, string>;
}

// Simple phase tracking for timeline (can be expanded for other offers)
interface Phase {
  id: string;
  name: string;
  status: 'completed' | 'in-progress' | 'pending';
}

function getTimelinePhases(userInput: Record<string, string>): Phase[] {
  const hasFlow = !!userInput.flow;
  const hasTimeline = !!userInput.timeline;
  const hasLocation = !!userInput.location;
  const hasBudget = !!userInput.budget;

  return [
    {
      id: 'goal',
      name: 'Your Goal',
      status: hasFlow ? 'completed' : 'pending',
    },
    {
      id: 'timeline',
      name: 'Timeline',
      status: hasFlow && hasTimeline ? 'completed' : hasFlow ? 'in-progress' : 'pending',
    },
    {
      id: 'location',
      name: 'Location',
      status: hasTimeline && hasLocation ? 'completed' : hasTimeline ? 'in-progress' : 'pending',
    },
    {
      id: 'budget',
      name: 'Budget',
      status: hasLocation && hasBudget ? 'completed' : hasLocation ? 'in-progress' : 'pending',
    },
    {
      id: 'details',
      name: 'Additional Details',
      status: hasBudget ? 'in-progress' : 'pending',
    },
  ];
}

export function ValuePreviewPanel({
  offerType,
  progress,
  userInput,
}: ValuePreviewPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!offerType) {
    return null;
  }

  const phases = offerType === 'real-estate-timeline'
    ? getTimelinePhases(userInput)
    : [];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-72 border-r border-slate-700 bg-slate-900/50 overflow-y-auto">
        <div className="p-6 sticky top-0">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white">
                  What You'll Receive
                </h3>
              </div>
              <p className="text-sm text-slate-400">
                Building your personalized timeline
              </p>
            </div>

            {/* Progress Circle */}
            <div className="relative">
              <svg className="w-32 h-32 mx-auto transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-slate-800"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  className="text-cyan-500"
                  style={{
                    strokeDasharray: `${2 * Math.PI * 56}`,
                    strokeDashoffset: `${2 * Math.PI * 56 * (1 - progress / 100)}`,
                    transition: 'stroke-dashoffset 0.5s ease',
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {Math.round(progress)}%
                  </div>
                  <div className="text-xs text-slate-400">
                    Complete
                  </div>
                </div>
              </div>
            </div>

            {/* Phases */}
            {phases.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                  Progress
                </h4>
                <div className="space-y-2">
                  {phases.map((phase, index) => (
                    <div
                      key={phase.id}
                      className="flex items-start gap-3 group"
                    >
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-0.5">
                        {phase.status === 'completed' ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : phase.status === 'in-progress' ? (
                          <div className="relative">
                            <Circle className="h-5 w-5 text-cyan-500" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
                            </div>
                          </div>
                        ) : (
                          <Circle className="h-5 w-5 text-slate-600" />
                        )}
                      </div>

                      {/* Text */}
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          phase.status === 'completed'
                            ? 'text-green-400'
                            : phase.status === 'in-progress'
                            ? 'text-cyan-400'
                            : 'text-slate-500'
                        }`}>
                          {phase.name}
                        </p>
                      </div>

                      {/* Connecting Line */}
                      {index < phases.length - 1 && (
                        <div className="absolute left-[10px] top-8 w-0.5 h-6 bg-slate-700" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Info */}
            <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <p className="text-xs text-cyan-300 leading-relaxed">
                💡 Your timeline is being customized based on your specific situation and local market data.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Compact Progress Bar - Shows at bottom of header */}
      {progress > 0 && (
        <div className="lg:hidden sticky top-[73px] z-30 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50">
          <div className="px-4 py-2 flex items-center gap-3">
            {/* Compact progress indicator */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <svg className="w-8 h-8 transform -rotate-90">
                  <circle
                    cx="16"
                    cy="16"
                    r="12"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    fill="none"
                    className="text-slate-700"
                  />
                  <circle
                    cx="16"
                    cy="16"
                    r="12"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                    className="text-cyan-500"
                    style={{
                      strokeDasharray: `${2 * Math.PI * 12}`,
                      strokeDashoffset: `${2 * Math.PI * 12 * (1 - progress / 100)}`,
                      transition: 'stroke-dashoffset 0.5s ease',
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">
                    {Math.round(progress)}
                  </span>
                </div>
              </div>

              {/* Phase indicators - compact dots */}
              <div className="flex items-center gap-1.5 flex-1 overflow-x-auto scrollbar-hide">
                {phases.map((phase) => (
                  <div
                    key={phase.id}
                    className="flex items-center gap-1 flex-shrink-0"
                    title={phase.name}
                  >
                    {phase.status === 'completed' ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    ) : phase.status === 'in-progress' ? (
                      <div className="w-3.5 h-3.5 flex items-center justify-center">
                        <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
                      </div>
                    ) : (
                      <Circle className="h-3.5 w-3.5 text-slate-600" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
