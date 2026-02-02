// src/components/dashboard/user/offers/editor/tabs/QuickSetupWizard.tsx
/**
 * Quick Setup Wizard - Streamlined 3-step setup for Buy + Sell timelines
 *
 * Steps:
 * 1. Buy Flow - Review phases and link stories/advice to steps
 * 2. Sell Flow - Review phases and link stories/advice to steps
 * 3. Preview & Activate - Review and save both flows
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Check,
  Sparkles,
  BookOpen,
  Search,
  Loader2,
  Home,
  DollarSign,
  Link2,
  Unlink,
  Eye,
  Save,
  ArrowRight,
  CheckCircle2,
  ListChecks,
} from 'lucide-react';
import type { AvailableStory, CustomPhaseConfig, CustomActionableStep, TimelineFlow } from '@/types/timelineBuilder.types';

interface QuickSetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  embedded?: boolean;
}

type WizardStep = 'buy' | 'sell' | 'preview';

const STEP_INFO = {
  buy: {
    title: 'Buyer Journey',
    icon: Home,
    description: 'Review the buyer timeline and add your personal advice',
    color: 'cyan',
  },
  sell: {
    title: 'Seller Journey',
    icon: DollarSign,
    description: 'Review the seller timeline and add your personal advice',
    color: 'amber',
  },
  preview: {
    title: 'Preview & Activate',
    icon: Eye,
    description: 'Review your setup and activate your timelines',
    color: 'green',
  },
};

export function QuickSetupWizard({
  isOpen,
  onClose,
  onComplete,
  embedded = false,
}: QuickSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('buy');
  const [buyPhases, setBuyPhases] = useState<CustomPhaseConfig[]>([]);
  const [sellPhases, setSellPhases] = useState<CustomPhaseConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  // Story browser
  const [stories, setStories] = useState<AvailableStory[]>([]);
  const [storiesLoading, setStoriesLoading] = useState(false);
  const [storySearch, setStorySearch] = useState('');
  const [showStoryPicker, setShowStoryPicker] = useState<{
    flow: TimelineFlow;
    phaseId: string;
    stepId: string;
  } | null>(null);

  // Fetch phases for both flows
  const fetchPhases = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [buyRes, sellRes] = await Promise.all([
        fetch('/api/custom-phases?flow=buy'),
        fetch('/api/custom-phases?flow=sell'),
      ]);

      const buyData = await buyRes.json();
      const sellData = await sellRes.json();

      if (!buyRes.ok) throw new Error(buyData.error || 'Failed to fetch buyer phases');
      if (!sellRes.ok) throw new Error(sellData.error || 'Failed to fetch seller phases');

      setBuyPhases(buyData.phases || []);
      setSellPhases(sellData.phases || []);

      // Expand first phase by default
      if (buyData.phases?.length > 0) {
        setExpandedPhases(new Set([buyData.phases[0].id]));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load phases');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch stories
  const fetchStories = useCallback(async (search?: string) => {
    setStoriesLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      params.set('limit', '50');

      const response = await fetch(`/api/stories/available?${params.toString()}`);
      const data = await response.json();
      if (response.ok) {
        setStories(data.stories || []);
      }
    } catch (err) {
      console.error('Failed to fetch stories:', err);
    } finally {
      setStoriesLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (isOpen) {
      fetchPhases();
    }
  }, [isOpen, fetchPhases]);

  // Fetch stories when picker opens
  useEffect(() => {
    if (showStoryPicker) {
      fetchStories(storySearch);
    }
  }, [showStoryPicker, storySearch, fetchStories]);

  // Get current phases based on step
  const getCurrentPhases = () => {
    return currentStep === 'buy' ? buyPhases : currentStep === 'sell' ? sellPhases : [];
  };

  const setCurrentPhases = (phases: CustomPhaseConfig[]) => {
    if (currentStep === 'buy') {
      setBuyPhases(phases);
    } else if (currentStep === 'sell') {
      setSellPhases(phases);
    }
  };

  // Toggle phase expansion
  const togglePhase = (phaseId: string) => {
    setExpandedPhases(prev => {
      const next = new Set(prev);
      if (next.has(phaseId)) next.delete(phaseId);
      else next.add(phaseId);
      return next;
    });
  };

  // Toggle step expansion for advice editing
  const toggleStep = (stepKey: string) => {
    setExpandedSteps(prev => {
      const next = new Set(prev);
      if (next.has(stepKey)) next.delete(stepKey);
      else next.add(stepKey);
      return next;
    });
  };

  // Update step inline advice
  const updateStepAdvice = (phaseId: string, stepId: string, advice: string) => {
    const phases = getCurrentPhases();
    const updated = phases.map(p =>
      p.id === phaseId
        ? {
            ...p,
            actionableSteps: p.actionableSteps.map(s =>
              s.id === stepId ? { ...s, inlineExperience: advice } : s
            ),
          }
        : p
    );
    setCurrentPhases(updated);
  };

  // Link story to step
  const linkStoryToStep = (story: AvailableStory) => {
    if (!showStoryPicker) return;

    const { flow, phaseId, stepId } = showStoryPicker;
    const phases = flow === 'buy' ? buyPhases : sellPhases;

    // Format story text
    let adviceText = story.advice;
    if (story.situation || story.action || story.outcome) {
      const parts = [];
      if (story.situation) parts.push(`Situation: ${story.situation}`);
      if (story.action) parts.push(`What I did: ${story.action}`);
      if (story.outcome) parts.push(`Outcome: ${story.outcome}`);
      adviceText = parts.join('\n\n');
    }

    const updated = phases.map(p =>
      p.id === phaseId
        ? {
            ...p,
            actionableSteps: p.actionableSteps.map(s =>
              s.id === stepId
                ? { ...s, inlineExperience: adviceText, linkedStoryId: story.id }
                : s
            ),
          }
        : p
    );

    if (flow === 'buy') {
      setBuyPhases(updated);
    } else {
      setSellPhases(updated);
    }

    setShowStoryPicker(null);
    setStorySearch('');
  };

  // Unlink story from step
  const unlinkStory = (phaseId: string, stepId: string) => {
    const phases = getCurrentPhases();
    const updated = phases.map(p =>
      p.id === phaseId
        ? {
            ...p,
            actionableSteps: p.actionableSteps.map(s =>
              s.id === stepId ? { ...s, linkedStoryId: undefined } : s
            ),
          }
        : p
    );
    setCurrentPhases(updated);
  };

  // Count steps with advice
  const countAdviceSteps = (phases: CustomPhaseConfig[]): number => {
    return phases.reduce((count, phase) => {
      return count + phase.actionableSteps.filter(s => s.inlineExperience || s.linkedStoryId).length;
    }, 0);
  };

  const countTotalSteps = (phases: CustomPhaseConfig[]): number => {
    return phases.reduce((count, phase) => count + phase.actionableSteps.length, 0);
  };

  // Navigation
  const handleNext = () => {
    if (currentStep === 'buy') {
      setCurrentStep('sell');
      // Expand first sell phase
      if (sellPhases.length > 0) {
        setExpandedPhases(new Set([sellPhases[0].id]));
      }
    } else if (currentStep === 'sell') {
      setCurrentStep('preview');
    }
  };

  const handleBack = () => {
    if (currentStep === 'sell') {
      setCurrentStep('buy');
      if (buyPhases.length > 0) {
        setExpandedPhases(new Set([buyPhases[0].id]));
      }
    } else if (currentStep === 'preview') {
      setCurrentStep('sell');
    }
  };

  // Save both flows
  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const [buyRes, sellRes] = await Promise.all([
        fetch('/api/custom-phases', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ flow: 'buy', phases: buyPhases }),
        }),
        fetch('/api/custom-phases', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ flow: 'sell', phases: sellPhases }),
        }),
      ]);

      const buyData = await buyRes.json();
      const sellData = await sellRes.json();

      if (!buyRes.ok) throw new Error(buyData.error || 'Failed to save buyer phases');
      if (!sellRes.ok) throw new Error(sellData.error || 'Failed to save seller phases');

      onComplete();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  // Progress calculation
  const getProgress = () => {
    switch (currentStep) {
      case 'buy': return 33;
      case 'sell': return 66;
      case 'preview': return 95;
      default: return 0;
    }
  };

  if (!isOpen && !embedded) return null;

  const currentPhases = getCurrentPhases();
  const stepInfo = STEP_INFO[currentStep];
  const StepIcon = stepInfo.icon;

  const wizardContent = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg">
            <Sparkles className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Quick Setup Wizard</h2>
            <p className="text-xs text-slate-400">Configure both buyer and seller journeys</p>
          </div>
        </div>
        {!embedded && (
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-slate-800 flex-shrink-0">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-green-500"
          initial={{ width: 0 }}
          animate={{ width: `${getProgress()}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Step Indicator */}
      <div className="px-6 py-4 border-b border-slate-700/50 flex-shrink-0">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          {(['buy', 'sell', 'preview'] as WizardStep[]).map((step, index) => {
            const info = STEP_INFO[step];
            const Icon = info.icon;
            const isActive = currentStep === step;
            const isPast = (currentStep === 'sell' && step === 'buy') ||
                          (currentStep === 'preview' && (step === 'buy' || step === 'sell'));

            return (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center transition-all
                      ${isActive
                        ? `bg-${info.color}-500/20 border-2 border-${info.color}-500`
                        : isPast
                          ? 'bg-green-500/20 border-2 border-green-500'
                          : 'bg-slate-700 border-2 border-slate-600'
                      }
                    `}
                  >
                    {isPast ? (
                      <Check className="w-5 h-5 text-green-400" />
                    ) : (
                      <Icon className={`w-5 h-5 ${isActive ? `text-${info.color}-400` : 'text-slate-400'}`} />
                    )}
                  </div>
                  <span className={`text-xs mt-1.5 font-medium ${isActive ? 'text-slate-200' : 'text-slate-500'}`}>
                    {info.title}
                  </span>
                </div>
                {index < 2 && (
                  <div className={`w-12 h-0.5 mx-2 ${isPast ? 'bg-green-500/50' : 'bg-slate-700'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-400">{error}</p>
            <button
              onClick={fetchPhases}
              className="mt-4 px-4 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600"
            >
              Retry
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* Buy/Sell Phase Editor */}
            {(currentStep === 'buy' || currentStep === 'sell') && (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-medium text-slate-100">{stepInfo.title}</h3>
                    <p className="text-sm text-slate-400 mt-1">{stepInfo.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-cyan-400">
                      {countAdviceSteps(currentPhases)}/{countTotalSteps(currentPhases)}
                    </div>
                    <div className="text-xs text-slate-500">steps with advice</div>
                  </div>
                </div>

                {/* Tip */}
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <p className="text-sm text-amber-300">
                    <strong>Tip:</strong> Adding your personal stories to steps makes your timeline unique.
                    Click on any step to add advice or link a story from your knowledge base.
                  </p>
                </div>

                {/* Phases List */}
                <div className="space-y-3">
                  {currentPhases.map((phase, phaseIndex) => (
                    <div
                      key={phase.id}
                      className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden"
                    >
                      {/* Phase Header */}
                      <button
                        onClick={() => togglePhase(phase.id)}
                        className="w-full flex items-center justify-between p-4 hover:bg-slate-700/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`
                            w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium
                            ${currentStep === 'buy' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-amber-500/20 text-amber-400'}
                          `}>
                            {phaseIndex + 1}
                          </span>
                          <div className="text-left">
                            <h4 className="font-medium text-slate-100">{phase.name}</h4>
                            <p className="text-xs text-slate-500">{phase.timeline} • {phase.actionableSteps.length} steps</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {phase.actionableSteps.some(s => s.inlineExperience || s.linkedStoryId) && (
                            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                              Has advice
                            </span>
                          )}
                          <ChevronDown
                            className={`w-5 h-5 text-slate-400 transition-transform ${
                              expandedPhases.has(phase.id) ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                      </button>

                      {/* Phase Steps */}
                      <AnimatePresence>
                        {expandedPhases.has(phase.id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-t border-slate-700"
                          >
                            <div className="p-4 space-y-2">
                              {phase.actionableSteps.map((step, stepIndex) => {
                                const stepKey = `${phase.id}-${step.id}`;
                                const hasAdvice = !!step.inlineExperience;
                                const hasStory = !!step.linkedStoryId;

                                return (
                                  <div
                                    key={step.id}
                                    className={`
                                      rounded-lg border transition-all
                                      ${hasAdvice || hasStory
                                        ? 'bg-green-500/5 border-green-500/30'
                                        : 'bg-slate-900/50 border-slate-700'
                                      }
                                    `}
                                  >
                                    {/* Step Header */}
                                    <button
                                      onClick={() => toggleStep(stepKey)}
                                      className="w-full flex items-center justify-between p-3 text-left"
                                    >
                                      <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <span className={`
                                          w-5 h-5 flex items-center justify-center rounded text-xs flex-shrink-0
                                          ${step.priority === 'high'
                                            ? 'bg-red-500/20 text-red-400'
                                            : step.priority === 'medium'
                                              ? 'bg-amber-500/20 text-amber-400'
                                              : 'bg-slate-700 text-slate-400'
                                          }
                                        `}>
                                          {stepIndex + 1}
                                        </span>
                                        <span className="text-sm text-slate-200 truncate">{step.title}</span>
                                      </div>
                                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                        {hasStory && (
                                          <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">
                                            <BookOpen className="w-3 h-3" />
                                            Linked
                                          </span>
                                        )}
                                        {hasAdvice && !hasStory && (
                                          <span className="w-2 h-2 rounded-full bg-green-400" />
                                        )}
                                        <ChevronDown
                                          className={`w-4 h-4 text-slate-400 transition-transform ${
                                            expandedSteps.has(stepKey) ? 'rotate-180' : ''
                                          }`}
                                        />
                                      </div>
                                    </button>

                                    {/* Step Advice Editor */}
                                    <AnimatePresence>
                                      {expandedSteps.has(stepKey) && (
                                        <motion.div
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{ height: 'auto', opacity: 1 }}
                                          exit={{ height: 0, opacity: 0 }}
                                          transition={{ duration: 0.15 }}
                                          className="border-t border-slate-700/50"
                                        >
                                          <div className="p-3 space-y-3">
                                            {/* Story Link Section */}
                                            <div className="flex items-center gap-2">
                                              <button
                                                onClick={() => setShowStoryPicker({
                                                  flow: currentStep as TimelineFlow,
                                                  phaseId: phase.id,
                                                  stepId: step.id,
                                                })}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm rounded-lg transition-colors"
                                              >
                                                <BookOpen className="w-4 h-4" />
                                                Browse Knowledge Base
                                              </button>
                                              {hasStory && (
                                                <button
                                                  onClick={() => unlinkStory(phase.id, step.id)}
                                                  className="flex items-center gap-1 px-2 py-1.5 text-slate-400 hover:text-red-400 text-sm transition-colors"
                                                >
                                                  <Unlink className="w-4 h-4" />
                                                  Unlink
                                                </button>
                                              )}
                                            </div>

                                            {/* Inline Advice */}
                                            <div>
                                              <label className="text-xs text-slate-400 mb-1 block">
                                                Personal advice for this step:
                                              </label>
                                              <textarea
                                                value={step.inlineExperience || ''}
                                                onChange={(e) => updateStepAdvice(phase.id, step.id, e.target.value)}
                                                placeholder="Share your personal experience or tip for this step..."
                                                rows={3}
                                                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 resize-none"
                                              />
                                            </div>
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Preview Step */}
            {currentStep === 'preview' && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="inline-flex p-3 bg-green-500/20 rounded-full mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-medium text-slate-100">Ready to Activate!</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Review your setup below and save to activate your personalized timelines.
                  </p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Buy Summary */}
                  <div className="bg-slate-800/50 border border-cyan-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Home className="w-5 h-5 text-cyan-400" />
                      <h4 className="font-medium text-slate-100">Buyer Journey</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Phases</span>
                        <span className="text-slate-200">{buyPhases.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Total Steps</span>
                        <span className="text-slate-200">{countTotalSteps(buyPhases)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Steps with Advice</span>
                        <span className="text-green-400 font-medium">{countAdviceSteps(buyPhases)}</span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400"
                        style={{
                          width: `${countTotalSteps(buyPhases) > 0
                            ? (countAdviceSteps(buyPhases) / countTotalSteps(buyPhases)) * 100
                            : 0}%`
                        }}
                      />
                    </div>
                  </div>

                  {/* Sell Summary */}
                  <div className="bg-slate-800/50 border border-amber-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <DollarSign className="w-5 h-5 text-amber-400" />
                      <h4 className="font-medium text-slate-100">Seller Journey</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Phases</span>
                        <span className="text-slate-200">{sellPhases.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Total Steps</span>
                        <span className="text-slate-200">{countTotalSteps(sellPhases)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Steps with Advice</span>
                        <span className="text-green-400 font-medium">{countAdviceSteps(sellPhases)}</span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-400"
                        style={{
                          width: `${countTotalSteps(sellPhases) > 0
                            ? (countAdviceSteps(sellPhases) / countTotalSteps(sellPhases)) * 100
                            : 0}%`
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* No advice warning */}
                {countAdviceSteps(buyPhases) === 0 && countAdviceSteps(sellPhases) === 0 && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <p className="text-sm text-amber-300">
                      <strong>Note:</strong> You haven't added any personal advice yet.
                      Your timelines will work, but adding stories makes them unique to you.
                      You can always add advice later.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-4 border-t border-slate-700 flex-shrink-0 bg-slate-900/50">
        <button
          onClick={currentStep === 'buy' ? onClose : handleBack}
          className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {currentStep === 'buy' ? 'Cancel' : 'Back'}
        </button>

        {currentStep === 'preview' ? (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-medium rounded-lg transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save & Activate
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className={`
              flex items-center gap-2 px-6 py-2.5 font-medium rounded-lg transition-all
              ${currentStep === 'buy'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500'
                : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500'
              }
              text-white
            `}
          >
            Continue to {currentStep === 'buy' ? 'Sellers' : 'Preview'}
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Story Picker Modal */}
      <AnimatePresence>
        {showStoryPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 flex items-center justify-center p-6 z-50"
            onClick={() => setShowStoryPicker(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-lg max-h-[70vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-700">
                <h3 className="font-medium text-slate-100">Select from Knowledge Base</h3>
                <button
                  onClick={() => setShowStoryPicker(null)}
                  className="p-1 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 border-b border-slate-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={storySearch}
                    onChange={(e) => setStorySearch(e.target.value)}
                    placeholder="Search stories..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {storiesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                  </div>
                ) : stories.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">No stories found</p>
                    <p className="text-slate-500 text-xs mt-1">Add stories in the Knowledge Base tab</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {stories.map((story) => (
                      <button
                        key={story.id}
                        onClick={() => linkStoryToStep(story)}
                        className="w-full p-3 text-left bg-slate-900/50 border border-slate-700 rounded-lg hover:border-purple-500/50 hover:bg-purple-500/5 transition-all"
                      >
                        <div className="font-medium text-slate-200 text-sm mb-1">{story.title}</div>
                        {story.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {story.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="px-1.5 py-0.5 bg-slate-700 text-slate-400 text-xs rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-slate-400 line-clamp-2">
                          {story.situation || story.advice?.slice(0, 100)}...
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  // Render as modal or embedded
  if (embedded) {
    return (
      <div className="flex flex-col h-full bg-slate-900 rounded-xl overflow-hidden">
        {wizardContent}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {wizardContent}
      </motion.div>
    </motion.div>
  );
}
