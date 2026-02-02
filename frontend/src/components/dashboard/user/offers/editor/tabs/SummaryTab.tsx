// src/components/dashboard/user/offers/editor/tabs/SummaryTab.tsx
/**
 * Summary Tab - Visual flow of Phases → Steps → Advice
 * Read-only overview of what's been configured
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Circle,
  ArrowDown,
  BookOpen,
  Lightbulb,
  Users,
  Home,
  Search,
} from 'lucide-react';
import type { CustomPhaseConfig, TimelineFlow } from '@/types/timelineBuilder.types';

const FLOW_OPTIONS: { id: TimelineFlow; label: string; icon: typeof Users }[] = [
  { id: 'buy', label: 'Buyers', icon: Home },
  { id: 'sell', label: 'Sellers', icon: Users },
  // { id: 'browse', label: 'Browsers', icon: Search }, // Commented out for MVP
];

const PRIORITY_STYLES = {
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
};

export function SummaryTab() {
  const [selectedFlow, setSelectedFlow] = useState<TimelineFlow>('buy');
  const [phases, setPhases] = useState<CustomPhaseConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());

  // Fetch phases for selected flow
  const fetchPhases = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/custom-phases?flow=${selectedFlow}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to fetch phases');

      setPhases(data.phases || []);
      // Expand first phase by default
      if (data.phases?.length > 0) {
        setExpandedPhases(new Set([data.phases[0].id]));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setIsLoading(false);
    }
  }, [selectedFlow]);

  useEffect(() => {
    fetchPhases();
  }, [fetchPhases]);

  const togglePhase = (phaseId: string) => {
    setExpandedPhases(prev => {
      const next = new Set(prev);
      if (next.has(phaseId)) next.delete(phaseId);
      else next.add(phaseId);
      return next;
    });
  };

  // Count steps with advice
  const getAdviceCount = (phase: CustomPhaseConfig) => {
    return phase.actionableSteps.filter(s => s.inlineExperience || s.linkedStoryId).length;
  };

  // Get total stats
  const totalSteps = phases.reduce((sum, p) => sum + p.actionableSteps.length, 0);
  const totalAdvice = phases.reduce((sum, p) => sum + getAdviceCount(p), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-slate-100">Your Chatbot Flow</h3>
        <p className="text-sm text-slate-400 mt-1">
          Visual overview of phases, steps, and personalized advice
        </p>
      </div>

      {/* Flow Selector */}
      <div className="flex justify-center">
        <div className="inline-flex gap-2 bg-slate-800/50 p-1.5 rounded-xl">
          {FLOW_OPTIONS.map(opt => {
            const Icon = opt.icon;
            const isActive = selectedFlow === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setSelectedFlow(opt.id)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex justify-center gap-8">
        <div className="text-center">
          <div className="text-2xl font-bold text-cyan-400">{phases.length}</div>
          <div className="text-xs text-slate-500 uppercase tracking-wide">Phases</div>
        </div>
        <div className="w-px bg-slate-700" />
        <div className="text-center">
          <div className="text-2xl font-bold text-amber-400">{totalSteps}</div>
          <div className="text-xs text-slate-500 uppercase tracking-wide">Steps</div>
        </div>
        <div className="w-px bg-slate-700" />
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400">{totalAdvice}</div>
          <div className="text-xs text-slate-500 uppercase tracking-wide">With Advice</div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {phases.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-dashed border-slate-700">
          <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-2">No phases configured yet</p>
          <p className="text-sm text-slate-500">
            Use the Setup Wizard tab to create your timeline
          </p>
        </div>
      ) : (
        /* Visual Flow */
        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-gradient-to-b from-cyan-500/50 via-amber-500/50 to-purple-500/50" />

          <div className="space-y-4">
            {phases.map((phase, phaseIndex) => {
              const isExpanded = expandedPhases.has(phase.id);
              const adviceCount = getAdviceCount(phase);
              const isComplete = adviceCount === phase.actionableSteps.length;

              return (
                <motion.div
                  key={phase.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: phaseIndex * 0.1 }}
                  className="relative"
                >
                  {/* Phase Card */}
                  <div
                    className={`ml-16 bg-slate-800/50 rounded-xl border transition-all ${
                      isExpanded
                        ? 'border-cyan-500/30 shadow-lg shadow-cyan-500/5'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {/* Phase Header */}
                    <button
                      onClick={() => togglePhase(phase.id)}
                      className="w-full px-5 py-4 flex items-center gap-4 text-left"
                    >
                      {/* Phase Number Circle */}
                      <div className="absolute left-0 w-16 flex justify-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                          isComplete
                            ? 'bg-cyan-500 text-white'
                            : 'bg-slate-700 text-slate-300 border-2 border-slate-600'
                        }`}>
                          {isComplete ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            phaseIndex + 1
                          )}
                        </div>
                      </div>

                      {/* Phase Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h4 className="text-lg font-semibold text-slate-100">
                            {phase.name}
                          </h4>
                          <span className="text-xs px-2 py-0.5 bg-slate-700 text-slate-400 rounded-full">
                            {phase.timeline}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 mt-0.5 line-clamp-1">
                          {phase.description}
                        </p>
                      </div>

                      {/* Metrics */}
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-sm font-medium text-slate-200">
                            {phase.actionableSteps.length}
                          </div>
                          <div className="text-[10px] text-slate-500 uppercase">Steps</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-sm font-medium ${
                            adviceCount > 0 ? 'text-purple-400' : 'text-slate-500'
                          }`}>
                            {adviceCount}/{phase.actionableSteps.length}
                          </div>
                          <div className="text-[10px] text-slate-500 uppercase">Advice</div>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {/* Expanded Steps */}
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="border-t border-slate-700"
                      >
                        <div className="p-5 space-y-3">
                          {phase.actionableSteps.map((step, stepIndex) => {
                            const hasAdvice = step.inlineExperience || step.linkedStoryId;

                            return (
                              <div
                                key={step.id}
                                className="flex gap-4"
                              >
                                {/* Step connector */}
                                <div className="flex flex-col items-center">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                    hasAdvice
                                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                      : 'bg-slate-700 text-slate-400'
                                  }`}>
                                    {stepIndex + 1}
                                  </div>
                                  {stepIndex < phase.actionableSteps.length - 1 && (
                                    <div className="flex-1 w-0.5 bg-slate-700 my-1" />
                                  )}
                                </div>

                                {/* Step Content */}
                                <div className="flex-1 pb-3">
                                  <div className="flex items-start gap-3">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-slate-200 font-medium">
                                          {step.title}
                                        </span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                          PRIORITY_STYLES[step.priority]
                                        }`}>
                                          {step.priority}
                                        </span>
                                      </div>

                                      {/* Advice Preview */}
                                      {hasAdvice && (
                                        <div className="mt-2 flex items-start gap-2">
                                          <div className="flex-shrink-0 mt-0.5">
                                            {step.linkedStoryId ? (
                                              <BookOpen className="w-4 h-4 text-purple-400" />
                                            ) : (
                                              <Lightbulb className="w-4 h-4 text-amber-400" />
                                            )}
                                          </div>
                                          <div className="bg-slate-900/50 rounded-lg p-3 flex-1 border border-slate-700">
                                            <p className="text-sm text-slate-300 line-clamp-2">
                                              {step.inlineExperience || 'Linked story'}
                                            </p>
                                            {step.inlineExperience && step.inlineExperience.length > 100 && (
                                              <p className="text-xs text-purple-400 mt-1">
                                                + more advice
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                      {!hasAdvice && (
                                        <p className="text-xs text-slate-500 mt-1 italic">
                                          No personalized advice yet
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Flow arrow between phases */}
                  {phaseIndex < phases.length - 1 && (
                    <div className="ml-16 flex justify-center py-2">
                      <ArrowDown className="w-5 h-5 text-slate-600" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      {phases.length > 0 && (
        <div className="flex justify-center gap-6 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className="w-4 h-4 rounded-full bg-cyan-500" />
            <span>Complete Phase</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>Quick Advice</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <BookOpen className="w-4 h-4 text-purple-400" />
            <span>Linked Story</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default SummaryTab;
