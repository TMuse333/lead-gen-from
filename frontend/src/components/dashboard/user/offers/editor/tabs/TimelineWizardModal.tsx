// src/components/dashboard/user/offers/editor/tabs/TimelineWizardModal.tsx
/**
 * Timeline Wizard Modal - Guided step-by-step setup for timeline configuration
 * Flow: Select Journey → Phase Count → Configure Each Phase Fully (details + steps + stories) → Review
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Check,
  Plus,
  Trash2,
  Sparkles,
  BookOpen,
  Link,
  MessageSquare,
  Pencil,
  FileText,
  Search,
  Loader2,
  Tag,
  Copy,
  HelpCircle,
  Users,
  Home,
  Eye,
  Lightbulb,
  ListChecks,
  Target,
} from 'lucide-react';

// ============================================================
// Collapsible Help Panel Component
// ============================================================

interface HelpPanelProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  color?: 'cyan' | 'amber' | 'purple';
}

function HelpPanel({ title, isOpen, onToggle, children, color = 'cyan' }: HelpPanelProps) {
  const colorStyles = {
    cyan: {
      bg: 'bg-cyan-500/5',
      border: 'border-cyan-500/20',
      headerBg: 'bg-cyan-500/10',
      text: 'text-cyan-400',
      icon: 'text-cyan-400',
    },
    amber: {
      bg: 'bg-amber-500/5',
      border: 'border-amber-500/20',
      headerBg: 'bg-amber-500/10',
      text: 'text-amber-400',
      icon: 'text-amber-400',
    },
    purple: {
      bg: 'bg-purple-500/5',
      border: 'border-purple-500/20',
      headerBg: 'bg-purple-500/10',
      text: 'text-purple-400',
      icon: 'text-purple-400',
    },
  };
  const styles = colorStyles[color];

  return (
    <div className={`rounded-lg border ${styles.border} overflow-hidden`}>
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-2.5 ${styles.headerBg} hover:opacity-90 transition-opacity`}
      >
        <span className={`flex items-center gap-2 text-sm font-medium ${styles.text}`}>
          <HelpCircle className="w-4 h-4" />
          {title}
        </span>
        <ChevronDown
          className={`w-4 h-4 ${styles.icon} transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`overflow-hidden ${styles.bg}`}
          >
            <div className="px-4 py-3 text-sm text-slate-300 space-y-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
import type { AvailableStory } from '@/types/timelineBuilder.types';
import type { CustomPhaseConfig, CustomActionableStep, TimelineFlow } from '@/types/timelineBuilder.types';
import { PHASE_CONSTRAINTS, createEmptyPhase, createEmptyStep } from '@/types/timelineBuilder.types';

/**
 * Simple question for a phase (used in wizard)
 */
interface PhaseQuestion {
  id: string;
  text: string;
  inputType: 'buttons' | 'text';
  options?: string[]; // For button-type questions
}

interface TimelineWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (flow: TimelineFlow, phases: CustomPhaseConfig[], phaseQuestions: Record<string, PhaseQuestion[]>) => void;
  initialFlow?: TimelineFlow;
  initialPhases?: CustomPhaseConfig[];
  initialPhaseQuestions?: Record<string, PhaseQuestion[]>;
  embedded?: boolean; // When true, render without modal overlay (for tab mode)
}

type WizardStep = 'flow' | 'phase-count' | 'configure-phase' | 'review';

const FLOW_OPTIONS: { id: TimelineFlow; label: string; description: string }[] = [
  { id: 'buy', label: 'Buyers', description: 'Customize the journey for home buyers' },
  { id: 'sell', label: 'Sellers', description: 'Customize the journey for home sellers' },
  { id: 'browse', label: 'Browsers', description: 'Customize the journey for those just browsing' },
];

const PRIORITY_OPTIONS = [
  { value: 'high', label: 'High', color: 'bg-red-500/20 text-red-400' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500/20 text-yellow-400' },
  { value: 'low', label: 'Low', color: 'bg-green-500/20 text-green-400' },
] as const;

export function TimelineWizardModal({
  isOpen,
  onClose,
  onComplete,
  initialFlow = 'buy',
  initialPhases = [],
  initialPhaseQuestions = {},
  embedded = false,
}: TimelineWizardModalProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('flow');
  const [selectedFlow, setSelectedFlow] = useState<TimelineFlow>(initialFlow);
  const [phaseCount, setPhaseCount] = useState(initialPhases.length || 6);
  const [phases, setPhases] = useState<CustomPhaseConfig[]>(initialPhases);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [expandedStepIndex, setExpandedStepIndex] = useState<number | null>(null);
  const [adviceMode, setAdviceMode] = useState<'quick' | 'story' | 'browse'>('quick');
  const [stories, setStories] = useState<AvailableStory[]>([]);
  const [storiesLoading, setStoriesLoading] = useState(false);
  const [storySearch, setStorySearch] = useState('');
  const [phaseQuestions, setPhaseQuestions] = useState<Record<string, PhaseQuestion[]>>(initialPhaseQuestions);
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const prevIsOpenRef = useRef(false);

  // Help panel states
  const [showJourneyHelp, setShowJourneyHelp] = useState(false);
  const [showPhaseConfigHelp, setShowPhaseConfigHelp] = useState(false);

  // Fetch stories/advice from knowledge base for inspiration
  // Note: We don't filter by flow or kind since knowledge base items may not have these set
  // Agents should see ALL their knowledge base items and pick what's relevant
  const fetchStories = useCallback(async () => {
    setStoriesLoading(true);
    try {
      const params = new URLSearchParams();
      // Don't filter by flow or kind - show all knowledge base items
      if (storySearch) params.set('search', storySearch);
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
  }, [storySearch]);

  // Fetch stories when browse tab is active
  useEffect(() => {
    if (adviceMode === 'browse' && expandedStepIndex !== null) {
      const debounce = setTimeout(() => fetchStories(), storySearch ? 300 : 0);
      return () => clearTimeout(debounce);
    }
  }, [adviceMode, expandedStepIndex, fetchStories, storySearch]);

  // Store latest props in refs to avoid stale closures
  const initialFlowRef = useRef(initialFlow);
  const initialPhasesRef = useRef(initialPhases);
  const initialPhaseQuestionsRef = useRef(initialPhaseQuestions);

  // Update refs when props change
  useEffect(() => {
    initialFlowRef.current = initialFlow;
    initialPhasesRef.current = initialPhases;
    initialPhaseQuestionsRef.current = initialPhaseQuestions;
  }, [initialFlow, initialPhases, initialPhaseQuestions]);

  // Reset when modal opens (only on transition from closed to open)
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      // Modal just opened - reset state using refs for latest values
      setCurrentStep('flow');
      setSelectedFlow(initialFlowRef.current);
      setPhaseCount(initialPhasesRef.current.length || 6);
      setPhases(initialPhasesRef.current.length > 0 ? [...initialPhasesRef.current] : []);
      setCurrentPhaseIndex(0);
      setExpandedStepIndex(null);
      setAdviceMode('quick');
      setStorySearch('');
      setPhaseQuestions({ ...initialPhaseQuestionsRef.current });
      setShowAllQuestions(false);
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen]); // Only depend on isOpen to prevent infinite loops

  // Initialize phases when count is set
  const initializePhases = useCallback((count: number) => {
    const newPhases: CustomPhaseConfig[] = [];
    for (let i = 0; i < count; i++) {
      if (initialPhases[i]) {
        newPhases.push({ ...initialPhases[i] });
      } else {
        newPhases.push(createEmptyPhase(i + 1));
      }
    }
    setPhases(newPhases);
  }, [initialPhases]);

  // Navigation
  const goToStep = (step: WizardStep) => {
    if (step === 'configure-phase') {
      if (phases.length === 0) {
        initializePhases(phaseCount);
      }
      setCurrentPhaseIndex(0);
    }
    setCurrentStep(step);
  };

  const handleNext = () => {
    switch (currentStep) {
      case 'flow':
        goToStep('phase-count');
        break;
      case 'phase-count':
        initializePhases(phaseCount);
        goToStep('configure-phase');
        break;
      case 'configure-phase':
        // Questions are optional per phase - phases like "Sign papers" don't need questions
        if (currentPhaseIndex < phases.length - 1) {
          setCurrentPhaseIndex(currentPhaseIndex + 1);
        } else {
          goToStep('review');
        }
        break;
      case 'review':
        onComplete(selectedFlow, phases, phaseQuestions);
        onClose();
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'phase-count':
        goToStep('flow');
        break;
      case 'configure-phase':
        if (currentPhaseIndex > 0) {
          setCurrentPhaseIndex(currentPhaseIndex - 1);
        } else {
          goToStep('phase-count');
        }
        break;
      case 'review':
        goToStep('configure-phase');
        setCurrentPhaseIndex(phases.length - 1);
        break;
    }
  };

  // Phase updates
  const updateCurrentPhase = (updates: Partial<CustomPhaseConfig>) => {
    setPhases(prev => prev.map((p, i) =>
      i === currentPhaseIndex ? { ...p, ...updates } : p
    ));
  };

  // Step management
  const addStep = () => {
    const phase = phases[currentPhaseIndex];
    if (phase.actionableSteps.length >= PHASE_CONSTRAINTS.MAX_STEPS_PER_PHASE) return;

    updateCurrentPhase({
      actionableSteps: [
        ...phase.actionableSteps,
        createEmptyStep(phase.actionableSteps.length + 1)
      ]
    });
  };

  const removeStep = (stepIndex: number) => {
    const phase = phases[currentPhaseIndex];
    if (phase.actionableSteps.length <= PHASE_CONSTRAINTS.MIN_STEPS_PER_PHASE) return;

    const filtered = phase.actionableSteps.filter((_, i) => i !== stepIndex);
    updateCurrentPhase({
      actionableSteps: filtered.map((s, i) => ({ ...s, order: i + 1 }))
    });
  };

  const updateStep = (stepIndex: number, updates: Partial<CustomActionableStep>) => {
    const phase = phases[currentPhaseIndex];
    updateCurrentPhase({
      actionableSteps: phase.actionableSteps.map((s, i) =>
        i === stepIndex ? { ...s, ...updates } : s
      )
    });
  };

  // Helper to format story format as text
  const formatStoryAdvice = (situation: string, action: string, result: string): string => {
    const parts = [];
    if (situation.trim()) parts.push(`Situation: ${situation.trim()}`);
    if (action.trim()) parts.push(`What I did: ${action.trim()}`);
    if (result.trim()) parts.push(`Outcome: ${result.trim()}`);
    return parts.join('\n\n');
  };

  // Helper to parse story format from text - handles multiple formats
  const parseStoryAdvice = (text: string): { situation: string; action: string; result: string } => {
    // Remove [CLIENT STORY] header if present
    const cleanText = text.replace(/\[CLIENT STORY\]\n?/i, '');

    // Match various formats: "Situation:", "The Situation:", etc.
    const situationMatch = cleanText.match(/(?:The\s+)?Situation:\s*([\s\S]*?)(?=(?:What I did|What I Did|Action):|(?:The\s+)?(?:Result|Outcome):|$)/i);
    const actionMatch = cleanText.match(/(?:What I did|What I Did|Action):\s*([\s\S]*?)(?=(?:The\s+)?(?:Result|Outcome):|$)/i);
    const resultMatch = cleanText.match(/(?:The\s+)?(?:Result|Outcome):\s*([\s\S]*?)$/i);

    return {
      situation: situationMatch?.[1]?.trim() || '',
      action: actionMatch?.[1]?.trim() || '',
      result: resultMatch?.[1]?.trim() || '',
    };
  };

  // Helper to check if story has structured fields
  const isStructuredStory = (story: AvailableStory): boolean => {
    return !!(story.situation || story.action || story.outcome);
  };

  // Helper to format story for display in browse tab
  // Supports both structured (situation/action/outcome) and legacy (advice string) formats
  const formatStoryForDisplay = (story: AvailableStory): React.ReactNode => {
    // Prefer structured fields if available
    if (isStructuredStory(story)) {
      return (
        <div className="space-y-2">
          {story.situation && (
            <div>
              <span className="text-amber-400 font-medium text-xs">Situation:</span>
              <span className="text-slate-300 text-xs ml-1">{story.situation}</span>
            </div>
          )}
          {story.action && (
            <div>
              <span className="text-amber-400 font-medium text-xs">What I did:</span>
              <span className="text-slate-300 text-xs ml-1">{story.action}</span>
            </div>
          )}
          {story.outcome && (
            <div>
              <span className="text-green-400 font-medium text-xs">Outcome:</span>
              <span className="text-slate-300 text-xs ml-1">{story.outcome}</span>
            </div>
          )}
        </div>
      );
    }

    // Fall back to parsing legacy advice text
    const text = story.advice;
    // Remove [CLIENT STORY] header
    const cleanText = text.replace(/\[CLIENT STORY\]\n?/i, '');

    // Split by common headers and format each section
    const sections = cleanText.split(/\n+/);

    return sections.map((section, idx) => {
      const trimmed = section.trim();
      if (!trimmed) return null;

      // Check if this is a header line
      const headerMatch = trimmed.match(/^((?:The\s+)?(?:Situation|What I did|What I Did|Action|Result|Outcome)):\s*(.*)/i);

      if (headerMatch) {
        const [, header, content] = headerMatch;
        const isOutcome = header.toLowerCase().includes('result') || header.toLowerCase().includes('outcome');
        return (
          <div key={idx} className={idx > 0 ? 'mt-2' : ''}>
            <span className={`${isOutcome ? 'text-green-400' : 'text-amber-400'} font-medium text-xs`}>{header}:</span>
            {content && <span className="text-slate-300 text-xs ml-1">{content}</span>}
          </div>
        );
      }

      return (
        <p key={idx} className={`text-slate-400 text-xs ${idx > 0 ? 'mt-1' : ''}`}>
          {trimmed}
        </p>
      );
    });
  };

  // Copy story to advice - switches to appropriate tab based on content
  const copyStoryToAdvice = (story: AvailableStory, stepIndex: number) => {
    // For structured stories, format into the standard text format for storage
    let adviceText = story.advice;
    if (isStructuredStory(story)) {
      adviceText = formatStoryAdvice(
        story.situation || '',
        story.action || '',
        story.outcome || ''
      );
    }

    updateStep(stepIndex, {
      inlineExperience: adviceText,
      linkedStoryId: story.id
    });

    // Check if this is a story format (structured or legacy)
    const hasStoryFormat = isStructuredStory(story) ||
      story.advice.includes('[CLIENT STORY]') ||
      (story.advice.includes('Situation:') && story.advice.includes('Outcome:')) ||
      story.kind === 'story';

    // Switch to story tab if story format, otherwise quick tab
    setAdviceMode(hasStoryFormat ? 'story' : 'quick');
    // Keep panel open so user can see/edit it
  };

  // Track expanded story in browse tab
  const [expandedStoryId, setExpandedStoryId] = useState<string | null>(null);

  // Question management for current phase
  const getCurrentPhaseQuestions = (): PhaseQuestion[] => {
    const phase = phases[currentPhaseIndex];
    if (!phase) return [];
    return phaseQuestions[phase.id] || [];
  };

  const addQuestion = () => {
    const phase = phases[currentPhaseIndex];
    if (!phase) return;

    const newQuestion: PhaseQuestion = {
      id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: '',
      inputType: 'buttons',
      options: ['Yes', 'No'],
    };

    setPhaseQuestions(prev => ({
      ...prev,
      [phase.id]: [...(prev[phase.id] || []), newQuestion],
    }));
  };

  const updateQuestion = (questionId: string, updates: Partial<PhaseQuestion>) => {
    const phase = phases[currentPhaseIndex];
    if (!phase) return;

    setPhaseQuestions(prev => ({
      ...prev,
      [phase.id]: (prev[phase.id] || []).map(q =>
        q.id === questionId ? { ...q, ...updates } : q
      ),
    }));
  };

  const removeQuestion = (questionId: string) => {
    const phase = phases[currentPhaseIndex];
    if (!phase) return;

    setPhaseQuestions(prev => ({
      ...prev,
      [phase.id]: (prev[phase.id] || []).filter(q => q.id !== questionId),
    }));
  };

  // Get total question count across all phases
  const getTotalQuestionCount = (): number => {
    return Object.values(phaseQuestions).reduce((total, questions) => {
      return total + questions.filter(q => q.text.trim()).length;
    }, 0);
  };

  // Get all questions flattened with phase info
  const getAllQuestionsWithPhase = (): { question: PhaseQuestion; phaseName: string; phaseIndex: number }[] => {
    const result: { question: PhaseQuestion; phaseName: string; phaseIndex: number }[] = [];
    phases.forEach((phase, index) => {
      const questions = phaseQuestions[phase.id] || [];
      questions.forEach(q => {
        if (q.text.trim()) {
          result.push({ question: q, phaseName: phase.name, phaseIndex: index });
        }
      });
    });
    return result;
  };

  // Progress calculation
  const getProgress = () => {
    switch (currentStep) {
      case 'flow':
        return 10;
      case 'phase-count':
        return 20;
      case 'configure-phase':
        // 20% to 80% based on which phase we're on
        const phaseProgress = (currentPhaseIndex + 1) / phases.length;
        return 20 + (phaseProgress * 60);
      case 'review':
        return 95;
      default:
        return 0;
    }
  };

  if (!isOpen && !embedded) return null;

  const currentPhase = phases[currentPhaseIndex];

  // Shared content (used in both modal and embedded modes)
  const wizardContent = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-semibold text-slate-100">Timeline Setup Wizard</h2>
        </div>
        {!embedded && (
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

        {/* Progress Bar */}
        <div className="h-1 bg-slate-800 flex-shrink-0">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${getProgress()}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Select Flow */}
            {currentStep === 'flow' && (
              <motion.div
                key="flow"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-xl font-medium text-slate-100">Which journey do you want to customize?</h3>
                  <p className="text-sm text-slate-400 mt-1">Select the type of client this timeline is for</p>
                </div>

                {/* Help Panel for Journey Types */}
                <HelpPanel
                  title="What do these options mean?"
                  isOpen={showJourneyHelp}
                  onToggle={() => setShowJourneyHelp(!showJourneyHelp)}
                  color="cyan"
                >
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-cyan-500/20 rounded-lg flex-shrink-0">
                        <Home className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div>
                        <p className="font-medium text-cyan-400">Buyers</p>
                        <p className="text-slate-400 text-xs mt-0.5">
                          For clients looking to purchase a home. The timeline will guide them through
                          financing, house hunting, offers, and closing.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-amber-500/20 rounded-lg flex-shrink-0">
                        <Target className="w-4 h-4 text-amber-400" />
                      </div>
                      <div>
                        <p className="font-medium text-amber-400">Sellers</p>
                        <p className="text-slate-400 text-xs mt-0.5">
                          For clients selling their property. The timeline covers pricing, staging,
                          marketing, showings, and closing from the seller's perspective.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-purple-500/20 rounded-lg flex-shrink-0">
                        <Eye className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <p className="font-medium text-purple-400">Browsers</p>
                        <p className="text-slate-400 text-xs mt-0.5">
                          For visitors just exploring the market. A lighter timeline focused on education
                          and building a relationship for when they're ready.
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 pt-2 border-t border-slate-700">
                      You can configure all three journeys—just complete this wizard once per type.
                    </p>
                  </div>
                </HelpPanel>

                <div className="space-y-3">
                  {FLOW_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedFlow(option.id)}
                      className={`w-full p-4 rounded-lg border text-left transition-all ${
                        selectedFlow === option.id
                          ? 'border-cyan-500 bg-cyan-500/10'
                          : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-slate-100">{option.label}</span>
                          <p className="text-sm text-slate-400 mt-0.5">{option.description}</p>
                        </div>
                        {selectedFlow === option.id && (
                          <Check className="w-5 h-5 text-cyan-400" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Phase Count */}
            {currentStep === 'phase-count' && (
              <motion.div
                key="phase-count"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div>
                  <h3 className="text-xl font-medium text-slate-100">How many phases should your timeline have?</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Choose between {PHASE_CONSTRAINTS.MIN_PHASES} and {PHASE_CONSTRAINTS.MAX_PHASES} phases
                  </p>
                </div>

                {/* Phase Count Selector */}
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setPhaseCount(Math.max(PHASE_CONSTRAINTS.MIN_PHASES, phaseCount - 1))}
                    disabled={phaseCount <= PHASE_CONSTRAINTS.MIN_PHASES}
                    className="p-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <div className="text-5xl font-bold text-cyan-400 w-20 text-center">
                    {phaseCount}
                  </div>
                  <button
                    onClick={() => setPhaseCount(Math.min(PHASE_CONSTRAINTS.MAX_PHASES, phaseCount + 1))}
                    disabled={phaseCount >= PHASE_CONSTRAINTS.MAX_PHASES}
                    className="p-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>

                {/* Phase Preview */}
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-slate-300">Phase Preview</h4>
                    <span className="text-xs text-slate-500">
                      {phaseCount} phase{phaseCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2">
                    {Array.from({ length: phaseCount }).map((_, index) => {
                      const existingPhase = initialPhases[index];
                      const phaseName = existingPhase?.name || `Phase ${index + 1}`;
                      const timeline = existingPhase?.timeline || `Week ${index + 1}`;
                      const stepCount = existingPhase?.actionableSteps?.length || 1;
                      const isExisting = !!existingPhase;

                      return (
                        <div
                          key={index}
                          className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
                            isExisting
                              ? 'bg-slate-700/50 border-slate-600'
                              : 'bg-slate-800/50 border-slate-700 border-dashed'
                          }`}
                        >
                          <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium flex-shrink-0 ${
                            isExisting
                              ? 'bg-cyan-500/20 text-cyan-400'
                              : 'bg-slate-700 text-slate-500'
                          }`}>
                            {index + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${
                              isExisting ? 'text-slate-200' : 'text-slate-500'
                            }`}>
                              {phaseName}
                            </p>
                            {isExisting && (
                              <p className="text-xs text-slate-500">
                                {timeline} • {stepCount} step{stepCount !== 1 ? 's' : ''}
                              </p>
                            )}
                          </div>
                          {isExisting ? (
                            <span className="text-xs text-cyan-400/70 bg-cyan-500/10 px-2 py-0.5 rounded flex-shrink-0">
                              Current
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500 flex-shrink-0">
                              New
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {phaseCount > initialPhases.length && initialPhases.length > 0 && (
                    <p className="text-xs text-slate-500 mt-3 text-center">
                      {phaseCount - initialPhases.length} new phase{phaseCount - initialPhases.length !== 1 ? 's' : ''} will be added
                    </p>
                  )}
                  {phaseCount < initialPhases.length && (
                    <p className="text-xs text-amber-400/70 mt-3 text-center">
                      {initialPhases.length - phaseCount} phase{initialPhases.length - phaseCount !== 1 ? 's' : ''} will be removed
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 3: Configure Each Phase Fully */}
            {currentStep === 'configure-phase' && currentPhase && (
              <motion.div
                key={`phase-${currentPhaseIndex}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                {/* Phase Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs font-medium rounded">
                        Phase {currentPhaseIndex + 1} of {phases.length}
                      </span>
                    </div>
                    <h3 className="text-xl font-medium text-slate-100">
                      Configure Phase {currentPhaseIndex + 1}
                    </h3>
                  </div>
                  {/* Phase progress dots */}
                  <div className="flex gap-1">
                    {phases.map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          i === currentPhaseIndex
                            ? 'bg-cyan-400'
                            : i < currentPhaseIndex
                            ? 'bg-cyan-400/50'
                            : 'bg-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Help Panel for Phase Configuration */}
                <HelpPanel
                  title="What are these sections for?"
                  isOpen={showPhaseConfigHelp}
                  onToggle={() => setShowPhaseConfigHelp(!showPhaseConfigHelp)}
                  color="amber"
                >
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-cyan-500/20 text-cyan-400 rounded flex items-center justify-center text-xs font-bold flex-shrink-0">
                        1
                      </div>
                      <div>
                        <p className="font-medium text-cyan-400">Phase Details</p>
                        <p className="text-slate-400 text-xs mt-0.5">
                          The name, timeline (e.g., "Week 1-2"), and description of this phase.
                          This is what clients see as a milestone in their journey.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-amber-500/20 text-amber-400 rounded flex items-center justify-center text-xs font-bold flex-shrink-0">
                        2
                      </div>
                      <div>
                        <p className="font-medium text-amber-400">Bot Questions <span className="font-normal text-slate-500">(Optional)</span></p>
                        <p className="text-slate-400 text-xs mt-0.5">
                          Questions the chatbot asks related to this phase. Not every phase needs questions—
                          simple phases like "Sign closing papers" may not require any.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-cyan-500/20 text-cyan-400 rounded flex items-center justify-center text-xs font-bold flex-shrink-0">
                        3
                      </div>
                      <div>
                        <p className="font-medium text-cyan-400">Action Steps</p>
                        <p className="text-slate-400 text-xs mt-0.5">
                          Specific tasks clients should complete during this phase. Each step can have:
                        </p>
                        <ul className="text-slate-400 text-xs mt-1 ml-3 space-y-0.5">
                          <li className="flex items-start gap-1">
                            <span className="text-slate-500">•</span>
                            <span><span className="text-slate-300">Priority</span> — high, medium, or low importance</span>
                          </li>
                          <li className="flex items-start gap-1">
                            <span className="text-slate-500">•</span>
                            <span><span className="text-slate-300">Extra Advice</span> — optional tips or stories for specific steps</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* How advice works explanation */}
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2.5">
                      <p className="text-emerald-400 text-xs font-medium mb-1.5">How Personalization Works</p>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        Each phase automatically shows <span className="text-emerald-300">1 tip + 1 story</span> from
                        your knowledge base (matched to the client's situation). You don't need to link advice to every step.
                      </p>
                      <p className="text-slate-500 text-xs mt-1.5">
                        If you add extra advice to specific steps, it appears in an expandable section below the
                        main step card—giving interested clients more detail without cluttering the view.
                      </p>
                    </div>

                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-2.5">
                      <p className="text-purple-400 text-xs flex items-start gap-2">
                        <Lightbulb className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>When to add step-level advice:</strong> Use it for steps where you have
                          specific tips that go beyond the phase-level insight—like negotiation tactics
                          for "Make an Offer" or inspection red flags for "Due Diligence."
                        </span>
                      </p>
                    </div>
                  </div>
                </HelpPanel>

                {/* Phase Details Section */}
                <div className="bg-slate-800/50 rounded-lg p-4 space-y-4">
                  <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <span className="w-5 h-5 bg-cyan-500/20 text-cyan-400 rounded flex items-center justify-center text-xs">1</span>
                    Phase Details
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Phase Name</label>
                      <input
                        type="text"
                        value={currentPhase.name}
                        onChange={(e) => updateCurrentPhase({ name: e.target.value })}
                        placeholder="e.g., Financial Preparation"
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Timeline</label>
                      <input
                        type="text"
                        value={currentPhase.timeline}
                        onChange={(e) => updateCurrentPhase({ timeline: e.target.value })}
                        placeholder="e.g., Week 1-2"
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Description</label>
                    <textarea
                      value={currentPhase.description}
                      onChange={(e) => updateCurrentPhase({ description: e.target.value })}
                      placeholder="Briefly describe what happens in this phase..."
                      rows={2}
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
                    />
                  </div>
                </div>

                {/* Bot Questions Section */}
                <div className="bg-slate-800/50 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <span className="w-5 h-5 bg-amber-500/20 text-amber-400 rounded flex items-center justify-center text-xs">2</span>
                      Bot Questions
                      <span className="text-xs text-slate-500 font-normal">(Optional)</span>
                    </h4>
                    <span className="text-xs text-slate-500">
                      {getCurrentPhaseQuestions().length} question{getCurrentPhaseQuestions().length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Add questions to gather info for this phase, or skip if not needed (e.g., &quot;Sign papers&quot; phase).
                  </p>

                  <div className="space-y-3">
                    {getCurrentPhaseQuestions().map((question, qIndex) => (
                      <div
                        key={question.id}
                        className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 space-y-3"
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-xs text-amber-400 font-medium w-6 pt-2">
                            Q{qIndex + 1}
                          </span>
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={question.text}
                              onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                              placeholder="What question should the bot ask?"
                              className="w-full bg-slate-800 border border-slate-600 rounded px-2.5 py-1.5 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                            />
                            <div className="space-y-2">
                              <select
                                value={question.inputType}
                                onChange={(e) => updateQuestion(question.id, {
                                  inputType: e.target.value as 'buttons' | 'text',
                                  options: e.target.value === 'buttons' ? ['Yes', 'No'] : undefined
                                })}
                                className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none"
                              >
                                <option value="buttons">Button Options</option>
                                <option value="text">Text Input</option>
                              </select>

                              {/* Visual Button Options Editor */}
                              {question.inputType === 'buttons' && (
                                <div className="space-y-2">
                                  {/* Preview Label */}
                                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">
                                    Button Preview (max 5)
                                  </p>

                                  {/* Button Options List */}
                                  <div className="flex flex-wrap gap-2">
                                    {(question.options || []).map((option, optIndex) => (
                                      <div
                                        key={optIndex}
                                        className="group flex items-center gap-1 bg-cyan-500/20 border border-cyan-500/40 rounded-full pl-3 pr-1 py-1"
                                      >
                                        <input
                                          type="text"
                                          value={option}
                                          onChange={(e) => {
                                            const newOptions = [...(question.options || [])];
                                            newOptions[optIndex] = e.target.value;
                                            updateQuestion(question.id, { options: newOptions });
                                          }}
                                          className="bg-transparent text-xs text-cyan-300 w-20 focus:outline-none focus:w-28 transition-all placeholder:text-cyan-500/50"
                                          placeholder="Label..."
                                        />
                                        <button
                                          onClick={() => {
                                            const newOptions = (question.options || []).filter((_, i) => i !== optIndex);
                                            updateQuestion(question.id, { options: newOptions.length > 0 ? newOptions : ['Yes'] });
                                          }}
                                          className="p-0.5 text-cyan-500/50 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </div>
                                    ))}

                                    {/* Add Button Option */}
                                    {(question.options?.length || 0) < 5 && (
                                      <button
                                        onClick={() => {
                                          const newOptions = [...(question.options || []), `Option ${(question.options?.length || 0) + 1}`];
                                          updateQuestion(question.id, { options: newOptions });
                                        }}
                                        className="flex items-center gap-1 px-2.5 py-1 border border-dashed border-slate-600 rounded-full text-xs text-slate-500 hover:text-cyan-400 hover:border-cyan-500/50 transition-colors"
                                      >
                                        <Plus className="w-3 h-3" />
                                        Add
                                      </button>
                                    )}
                                  </div>

                                  {/* User Preview */}
                                  <div className="mt-2 p-2 bg-slate-900/70 rounded border border-slate-700/50">
                                    <p className="text-[9px] text-slate-600 mb-1.5">USER SEES:</p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {(question.options || []).map((option, i) => (
                                        <span
                                          key={i}
                                          className="px-3 py-1 bg-slate-700 text-slate-200 text-xs rounded-lg"
                                        >
                                          {option || 'Empty'}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Text Input Preview */}
                              {question.inputType === 'text' && (
                                <div className="mt-2 p-2 bg-slate-900/70 rounded border border-slate-700/50">
                                  <p className="text-[9px] text-slate-600 mb-1.5">USER SEES:</p>
                                  <div className="bg-slate-800 border border-slate-600 rounded px-2.5 py-1.5 text-xs text-slate-500">
                                    Type your answer...
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => removeQuestion(question.id)}
                            className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={addQuestion}
                      className="w-full py-2 border border-dashed border-amber-500/30 rounded-lg text-amber-400/70 hover:text-amber-400 hover:border-amber-500/50 transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Bot Question
                    </button>
                  </div>
                </div>

                {/* Actionable Steps Section */}
                <div className="bg-slate-800/50 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <span className="w-5 h-5 bg-cyan-500/20 text-cyan-400 rounded flex items-center justify-center text-xs">3</span>
                      Action Steps
                      <span className="text-xs text-slate-500 font-normal">
                        ({currentPhase.actionableSteps.length}/{PHASE_CONSTRAINTS.MAX_STEPS_PER_PHASE})
                      </span>
                    </h4>
                  </div>

                  <div className="space-y-3">
                    {currentPhase.actionableSteps.map((step, stepIndex) => {
                      const isExpanded = expandedStepIndex === stepIndex;
                      const parsedStory = step.inlineExperience ? parseStoryAdvice(step.inlineExperience) : { situation: '', action: '', result: '' };
                      const hasStoryFormat = parsedStory.situation || parsedStory.action || parsedStory.result;

                      return (
                        <div
                          key={step.id}
                          className="bg-slate-900/50 border border-slate-700 rounded-lg overflow-hidden"
                        >
                          {/* Step Header */}
                          <div className="flex items-center gap-2 p-3">
                            <span className="text-xs text-slate-500 font-medium w-6">
                              {stepIndex + 1}.
                            </span>
                            <input
                              type="text"
                              value={step.title}
                              onChange={(e) => updateStep(stepIndex, { title: e.target.value })}
                              placeholder="Step title..."
                              className="flex-1 bg-slate-800 border border-slate-600 rounded px-2.5 py-1.5 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                            />
                            <select
                              value={step.priority}
                              onChange={(e) => updateStep(stepIndex, { priority: e.target.value as 'high' | 'medium' | 'low' })}
                              className="bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-xs text-slate-300 focus:outline-none"
                            >
                              {PRIORITY_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => {
                                setExpandedStepIndex(isExpanded ? null : stepIndex);
                                setAdviceMode('quick');
                                setStorySearch('');
                              }}
                              className={`px-2 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
                                step.inlineExperience
                                  ? 'bg-purple-500 text-white'
                                  : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30'
                              }`}
                            >
                              <MessageSquare className="w-3 h-3" />
                              {step.inlineExperience ? 'Edit Advice' : '+ Advice'}
                            </button>
                            {currentPhase.actionableSteps.length > PHASE_CONSTRAINTS.MIN_STEPS_PER_PHASE && (
                              <button
                                onClick={() => removeStep(stepIndex)}
                                className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          {/* Advice indicator when collapsed */}
                          {!isExpanded && step.inlineExperience && (
                            <div className="px-3 pb-2 pl-9">
                              <p className="text-xs text-purple-400/70 truncate">
                                {step.linkedStoryId ? '📖 Story linked' : '💬 ' + step.inlineExperience.slice(0, 60) + (step.inlineExperience.length > 60 ? '...' : '')}
                              </p>
                            </div>
                          )}

                          {/* Expanded Advice Panel */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-slate-700"
                              >
                                <div className="p-3 space-y-3">
                                  {/* Advice Mode Tabs */}
                                  <div className="flex gap-1 bg-slate-800 p-1 rounded-lg">
                                    <button
                                      onClick={() => setAdviceMode('quick')}
                                      className={`flex-1 py-1.5 px-2 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
                                        adviceMode === 'quick'
                                          ? 'bg-purple-500 text-white'
                                          : 'text-slate-400 hover:text-slate-200'
                                      }`}
                                    >
                                      <Pencil className="w-3 h-3" />
                                      Quick Advice
                                    </button>
                                    <button
                                      onClick={() => setAdviceMode('story')}
                                      className={`flex-1 py-1.5 px-2 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
                                        adviceMode === 'story'
                                          ? 'bg-purple-500 text-white'
                                          : 'text-slate-400 hover:text-slate-200'
                                      }`}
                                    >
                                      <FileText className="w-3 h-3" />
                                      Story Format
                                    </button>
                                    <button
                                      onClick={() => setAdviceMode('browse')}
                                      className={`flex-1 py-1.5 px-2 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
                                        adviceMode === 'browse'
                                          ? 'bg-purple-500 text-white'
                                          : 'text-slate-400 hover:text-slate-200'
                                      }`}
                                    >
                                      <BookOpen className="w-3 h-3" />
                                      Browse Stories
                                    </button>
                                  </div>

                                  {/* Quick Advice Tab */}
                                  {adviceMode === 'quick' && (
                                    <div className="space-y-2">
                                      <textarea
                                        value={step.inlineExperience || ''}
                                        onChange={(e) => updateStep(stepIndex, {
                                          inlineExperience: e.target.value || undefined,
                                          linkedStoryId: undefined
                                        })}
                                        placeholder="Add a quick tip or advice for this step..."
                                        rows={3}
                                        className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 resize-none"
                                      />
                                    </div>
                                  )}

                                  {/* Story Format Tab */}
                                  {adviceMode === 'story' && (
                                    <div className="space-y-3">
                                      <p className="text-xs text-slate-400">
                                        Structure your advice as a story with situation, action, and result.
                                      </p>
                                      <div>
                                        <label className="block text-xs text-slate-500 mb-1">The Situation</label>
                                        <textarea
                                          value={parsedStory.situation}
                                          onChange={(e) => {
                                            const newText = formatStoryAdvice(e.target.value, parsedStory.action, parsedStory.result);
                                            updateStep(stepIndex, { inlineExperience: newText || undefined, linkedStoryId: undefined });
                                          }}
                                          placeholder="Describe the client's situation..."
                                          rows={2}
                                          className="w-full bg-slate-800 border border-slate-600 rounded px-2.5 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 resize-none"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs text-slate-500 mb-1">What I Did</label>
                                        <textarea
                                          value={parsedStory.action}
                                          onChange={(e) => {
                                            const newText = formatStoryAdvice(parsedStory.situation, e.target.value, parsedStory.result);
                                            updateStep(stepIndex, { inlineExperience: newText || undefined, linkedStoryId: undefined });
                                          }}
                                          placeholder="What action did you take?"
                                          rows={2}
                                          className="w-full bg-slate-800 border border-slate-600 rounded px-2.5 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 resize-none"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs text-slate-500 mb-1">The Result</label>
                                        <textarea
                                          value={parsedStory.result}
                                          onChange={(e) => {
                                            const newText = formatStoryAdvice(parsedStory.situation, parsedStory.action, e.target.value);
                                            updateStep(stepIndex, { inlineExperience: newText || undefined, linkedStoryId: undefined });
                                          }}
                                          placeholder="What was the outcome?"
                                          rows={2}
                                          className="w-full bg-slate-800 border border-slate-600 rounded px-2.5 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 resize-none"
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {/* Browse Stories Tab */}
                                  {adviceMode === 'browse' && (
                                    <div className="space-y-3">
                                      <div className="relative">
                                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                          type="text"
                                          value={storySearch}
                                          onChange={(e) => setStorySearch(e.target.value)}
                                          placeholder="Search your stories..."
                                          className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                                        />
                                      </div>

                                      <div className="max-h-48 overflow-y-auto space-y-2">
                                        {storiesLoading ? (
                                          <div className="flex items-center justify-center py-6">
                                            <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                                          </div>
                                        ) : stories.length === 0 ? (
                                          <div className="text-center py-6 text-slate-500 text-sm">
                                            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                            <p>No stories found</p>
                                            <p className="text-xs mt-1">Add stories to your knowledge base first</p>
                                          </div>
                                        ) : (
                                          stories.map((story) => {
                                            // Detect if this is a story format vs a tip
                                            const hasStoryFormat = isStructuredStory(story) ||
                                              story.advice.includes('[CLIENT STORY]') ||
                                              (story.advice.includes('Situation:') && (story.advice.includes('Outcome:') || story.advice.includes('Result:'))) ||
                                              story.kind === 'story';
                                            const isExpanded = expandedStoryId === story.id;

                                            return (
                                              <div
                                                key={story.id}
                                                className={`bg-slate-800 border rounded-lg p-3 transition-colors ${
                                                  hasStoryFormat
                                                    ? 'border-amber-500/30 hover:border-amber-500/50'
                                                    : 'border-slate-600 hover:border-purple-500/50'
                                                }`}
                                              >
                                                {/* Header with type badge */}
                                                <div className="flex items-center justify-between gap-2 mb-2">
                                                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                                                    hasStoryFormat
                                                      ? 'bg-amber-500/20 text-amber-400'
                                                      : 'bg-purple-500/20 text-purple-400'
                                                  }`}>
                                                    {hasStoryFormat ? '📖 STORY' : '💡 TIP'}
                                                  </span>
                                                  <button
                                                    onClick={() => copyStoryToAdvice(story, stepIndex)}
                                                    className={`text-[10px] font-medium px-2 py-1 rounded transition-colors ${
                                                      hasStoryFormat
                                                        ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                                                        : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                                                    }`}
                                                  >
                                                    Use this
                                                  </button>
                                                </div>

                                                <div
                                                  className="cursor-pointer"
                                                  onClick={() => setExpandedStoryId(isExpanded ? null : story.id)}
                                                >
                                                  <h5 className="text-sm font-medium text-slate-200 mb-2">{story.title}</h5>

                                                  {/* Formatted content display */}
                                                  <div className={isExpanded ? '' : 'max-h-16 overflow-hidden relative'}>
                                                    {hasStoryFormat ? (
                                                      formatStoryForDisplay(story)
                                                    ) : (
                                                      <p className="text-xs text-slate-400 whitespace-pre-wrap">{story.advice}</p>
                                                    )}
                                                    {!isExpanded && (
                                                      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-800 to-transparent" />
                                                    )}
                                                  </div>

                                                  {!isExpanded && story.advice.length > 80 && (
                                                    <p className="text-[10px] text-purple-400 hover:text-purple-300 mt-1">
                                                      Click to expand...
                                                    </p>
                                                  )}

                                                  {story.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                      {story.tags.slice(0, 3).map((tag) => (
                                                        <span
                                                          key={tag}
                                                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs bg-slate-700 text-slate-400 rounded"
                                                        >
                                                          <Tag className="w-2.5 h-2.5" />
                                                          {tag}
                                                        </span>
                                                      ))}
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            );
                                          })
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Done button */}
                                  <div className="flex justify-end pt-2">
                                    <button
                                      onClick={() => setExpandedStepIndex(null)}
                                      className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-xs transition-colors"
                                    >
                                      Done
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}

                    {/* Add Step Button */}
                    {currentPhase.actionableSteps.length < PHASE_CONSTRAINTS.MAX_STEPS_PER_PHASE && (
                      <button
                        onClick={addStep}
                        className="w-full py-2 border border-dashed border-slate-600 rounded-lg text-slate-500 hover:text-slate-300 hover:border-slate-500 transition-colors text-sm flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Another Step
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Review */}
            {currentStep === 'review' && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div>
                  <h3 className="text-xl font-medium text-slate-100">Review Your Timeline</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Here&apos;s your {FLOW_OPTIONS.find(f => f.id === selectedFlow)?.label} timeline with {phases.length} phases and {getTotalQuestionCount()} questions
                  </p>
                </div>

                {/* View All Questions Toggle */}
                <button
                  onClick={() => setShowAllQuestions(!showAllQuestions)}
                  className="w-full py-2.5 px-4 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 hover:bg-amber-500/20 transition-colors text-sm flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    View All Bot Questions ({getTotalQuestionCount()})
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showAllQuestions ? 'rotate-180' : ''}`} />
                </button>

                {/* All Questions Panel */}
                <AnimatePresence>
                  {showAllQuestions && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden"
                    >
                      <div className="p-4 space-y-3 max-h-60 overflow-y-auto">
                        {getAllQuestionsWithPhase().map(({ question, phaseName, phaseIndex }, idx) => (
                          <div key={question.id} className="flex items-start gap-3 text-sm">
                            <span className="text-amber-400 font-mono text-xs w-6 pt-0.5">Q{idx + 1}</span>
                            <div className="flex-1">
                              <p className="text-slate-200">{question.text}</p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Phase {phaseIndex + 1}: {phaseName}
                                {question.inputType === 'buttons' && question.options && (
                                  <span className="ml-2 text-slate-600">
                                    [{question.options.join(', ')}]
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                  {phases.map((phase, index) => {
                    const stepsWithAdvice = phase.actionableSteps.filter(s => s.inlineExperience);
                    return (
                      <div
                        key={phase.id}
                        className="bg-slate-800 border border-slate-700 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <span className="w-7 h-7 flex items-center justify-center bg-cyan-500/20 text-cyan-400 text-sm font-medium rounded-full flex-shrink-0">
                              {index + 1}
                            </span>
                            <div>
                              <h4 className="font-medium text-slate-100">{phase.name}</h4>
                              <p className="text-sm text-slate-400 mt-0.5 line-clamp-1">
                                {phase.description}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-slate-500 bg-slate-700 px-2 py-1 rounded">
                            {phase.timeline}
                          </span>
                        </div>

                        {/* Questions summary */}
                        {(phaseQuestions[phase.id]?.length || 0) > 0 && (
                          <div className="mt-2 pl-10">
                            <p className="text-xs text-amber-400/70 flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              {phaseQuestions[phase.id].length} bot question{phaseQuestions[phase.id].length > 1 ? 's' : ''}
                            </p>
                          </div>
                        )}

                        {/* Steps summary */}
                        <div className="mt-2 pl-10">
                          <div className="flex flex-wrap gap-2">
                            {phase.actionableSteps.map((step, si) => (
                              <span
                                key={step.id}
                                className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                                  step.inlineExperience
                                    ? 'bg-purple-500/20 text-purple-400'
                                    : 'bg-slate-700 text-slate-400'
                                }`}
                              >
                                {step.title}
                                {step.inlineExperience && (
                                  <MessageSquare className="w-3 h-3" />
                                )}
                              </span>
                            ))}
                          </div>
                          {stepsWithAdvice.length > 0 && (
                            <p className="text-xs text-purple-400/70 mt-2">
                              {stepsWithAdvice.length} step{stepsWithAdvice.length > 1 ? 's' : ''} with personalized advice
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-4 border-t border-slate-700 bg-slate-800/50 flex-shrink-0">
        <button
          onClick={handleBack}
          disabled={currentStep === 'flow'}
          className="px-4 py-2 text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-2">
          {currentStep === 'configure-phase' && (
            <span className="text-sm text-slate-500">
              Phase {currentPhaseIndex + 1} of {phases.length}
            </span>
          )}
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors flex items-center gap-1"
          >
            {currentStep === 'review' ? (
              <>
                <Check className="w-4 h-4" />
                Apply Timeline
              </>
            ) : currentStep === 'configure-phase' && currentPhaseIndex < phases.length - 1 ? (
              <>
                Next Phase
                <ChevronRight className="w-4 h-4" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );

  // Embedded mode: render content directly without modal overlay
  if (embedded) {
    return (
      <div className="w-full bg-slate-900 rounded-xl border border-slate-700 overflow-hidden flex flex-col">
        {wizardContent}
      </div>
    );
  }

  // Modal mode: render with overlay and animation
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900 rounded-xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col"
      >
        {wizardContent}
      </motion.div>
    </div>
  );
}

export default TimelineWizardModal;
