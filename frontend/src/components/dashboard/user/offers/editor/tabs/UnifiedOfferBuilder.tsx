// src/components/dashboard/user/offers/editor/tabs/UnifiedOfferBuilder.tsx
/**
 * Unified Offer Builder - Single view for Questions → Phases → Stories
 * Shows the complete flow with visual connections
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Save,
  RotateCcw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  MessageCircle,
  Layers,
  BookOpen,
  ArrowRight,
  ArrowDown,
  Edit3,
  X,
  Link2,
  Unlink,
  Sparkles,
} from 'lucide-react';
import { DraggableList } from '@/components/dashboard/shared/DraggableList';
import { StoryPickerModal } from '@/components/dashboard/shared/StoryPickerModal';
import { TimelineWizardModal } from './TimelineWizardModal';
import type {
  CustomQuestion,
  CustomPhaseConfig,
  CustomActionableStep,
  TimelineFlow,
  AvailableStory,
} from '@/types/timelineBuilder.types';
import { QUESTION_CONSTRAINTS, PHASE_CONSTRAINTS } from '@/types/timelineBuilder.types';

const FLOW_OPTIONS: { id: TimelineFlow; label: string; description: string }[] = [
  { id: 'buy', label: 'Buyer Flow', description: 'Questions and timeline for home buyers' },
  { id: 'sell', label: 'Seller Flow', description: 'Questions and timeline for home sellers' },
  { id: 'browse', label: 'Browser Flow', description: 'Questions and timeline for browsers' },
];

interface FlowData {
  questions: CustomQuestion[];
  phases: CustomPhaseConfig[];
  isCustomQuestions: boolean;
  isCustomPhases: boolean;
}

interface UnifiedOfferBuilderProps {
  externalShowWizard?: boolean;
  onWizardClose?: () => void;
  wizardOnlyMode?: boolean; // When true, only show the wizard (no builder UI)
}

export function UnifiedOfferBuilder({
  externalShowWizard,
  onWizardClose,
  wizardOnlyMode = false,
}: UnifiedOfferBuilderProps = {}) {
  const [selectedFlow, setSelectedFlow] = useState<TimelineFlow>('buy');
  const [flowData, setFlowData] = useState<FlowData>({
    questions: [],
    phases: [],
    isCustomQuestions: false,
    isCustomPhases: false,
  });
  const [stories, setStories] = useState<Map<string, AvailableStory>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [storyPickerOpen, setStoryPickerOpen] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

  // Sync external wizard state with internal state
  useEffect(() => {
    if (externalShowWizard !== undefined) {
      setShowWizard(externalShowWizard);
    }
  }, [externalShowWizard]);

  // Handle wizard close (internal + external callback)
  const handleWizardClose = () => {
    setShowWizard(false);
    onWizardClose?.();
  };

  const [storyPickerTarget, setStoryPickerTarget] = useState<{
    type: 'question' | 'step';
    questionId?: string;
    stepId?: string;
    phaseId?: string;
  } | null>(null);

  // Fetch all data for selected flow
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [questionsRes, phasesRes] = await Promise.all([
        fetch(`/api/custom-questions?flow=${selectedFlow}`),
        fetch(`/api/custom-phases?flow=${selectedFlow}`),
      ]);

      const questionsData = await questionsRes.json();
      const phasesData = await phasesRes.json();

      if (!questionsRes.ok) throw new Error(questionsData.error || 'Failed to fetch questions');
      if (!phasesRes.ok) throw new Error(phasesData.error || 'Failed to fetch phases');

      setFlowData({
        questions: questionsData.questions || [],
        phases: phasesData.phases || [],
        isCustomQuestions: questionsData.isCustom || false,
        isCustomPhases: phasesData.isCustom || false,
      });

      // Collect all story IDs
      const storyIds = new Set<string>();
      (questionsData.questions || []).forEach((q: CustomQuestion) => {
        if (q.linkedStoryId) storyIds.add(q.linkedStoryId);
      });
      (phasesData.phases || []).forEach((p: CustomPhaseConfig) => {
        p.actionableSteps.forEach((s) => {
          if (s.linkedStoryId) storyIds.add(s.linkedStoryId);
        });
      });

      // Fetch stories
      if (storyIds.size > 0) {
        const storiesRes = await fetch('/api/stories/available', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ storyIds: Array.from(storyIds) }),
        });
        if (storiesRes.ok) {
          const storiesData = await storiesRes.json();
          const storyMap = new Map<string, AvailableStory>();
          (storiesData.stories || []).forEach((s: AvailableStory) => {
            storyMap.set(s.id, s);
          });
          setStories(storyMap);
        }
      }

      // Expand first few cards by default
      const firstQuestionIds = (questionsData.questions || []).slice(0, 2).map((q: CustomQuestion) => q.id);
      setExpandedCards(new Set(firstQuestionIds));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [selectedFlow]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Clear success message
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Save all changes
  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const [questionsRes, phasesRes] = await Promise.all([
        fetch('/api/custom-questions', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ flow: selectedFlow, questions: flowData.questions }),
        }),
        fetch('/api/custom-phases', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ flow: selectedFlow, phases: flowData.phases }),
        }),
      ]);

      const questionsData = await questionsRes.json();
      const phasesData = await phasesRes.json();

      if (!questionsRes.ok) throw new Error(questionsData.error || 'Failed to save questions');
      if (!phasesRes.ok) throw new Error(phasesData.error || 'Failed to save phases');

      setSuccess('All changes saved successfully');
      setFlowData(prev => ({
        ...prev,
        isCustomQuestions: true,
        isCustomPhases: true,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to defaults
  const handleReset = async () => {
    if (!confirm('Reset all questions and phases to defaults? This cannot be undone.')) return;

    setIsSaving(true);
    setError(null);

    try {
      await Promise.all([
        fetch(`/api/custom-questions?flow=${selectedFlow}`, { method: 'DELETE' }),
        fetch(`/api/custom-phases?flow=${selectedFlow}`, { method: 'DELETE' }),
      ]);

      await fetchData();
      setSuccess('Reset to defaults');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle card expansion
  const toggleCard = (id: string) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Update question
  const updateQuestion = (questionId: string, updates: Partial<CustomQuestion>) => {
    setFlowData(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId ? { ...q, ...updates } : q
      ),
    }));
  };

  // Update phase
  const updatePhase = (phaseId: string, updates: Partial<CustomPhaseConfig>) => {
    setFlowData(prev => ({
      ...prev,
      phases: prev.phases.map(p =>
        p.id === phaseId ? { ...p, ...updates } : p
      ),
    }));
  };

  // Update step
  const updateStep = (phaseId: string, stepId: string, updates: Partial<CustomActionableStep>) => {
    setFlowData(prev => ({
      ...prev,
      phases: prev.phases.map(p =>
        p.id === phaseId
          ? {
              ...p,
              actionableSteps: p.actionableSteps.map(s =>
                s.id === stepId ? { ...s, ...updates } : s
              ),
            }
          : p
      ),
    }));
  };

  // Link question to phase
  const linkQuestionToPhase = (questionId: string, phaseId: string | null) => {
    updateQuestion(questionId, {
      linkedPhaseId: phaseId || undefined,
      linkedStepId: undefined, // Clear step when phase changes
    });
  };

  // Link question to step
  const linkQuestionToStep = (questionId: string, stepId: string | null) => {
    updateQuestion(questionId, { linkedStepId: stepId || undefined });
  };

  // Add new question
  const addQuestion = () => {
    if (flowData.questions.length >= QUESTION_CONSTRAINTS.MAX_QUESTIONS) {
      setError(`Maximum ${QUESTION_CONSTRAINTS.MAX_QUESTIONS} questions allowed`);
      return;
    }

    const newQuestion: CustomQuestion = {
      id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      question: 'New Question',
      order: flowData.questions.length + 1,
      inputType: 'buttons',
      buttons: [
        { id: `btn-1-${Date.now()}`, label: 'Option 1', value: 'option-1' },
        { id: `btn-2-${Date.now()}`, label: 'Option 2', value: 'option-2' },
      ],
      required: true,
    };

    setFlowData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
    setExpandedCards(prev => new Set([...prev, newQuestion.id]));
  };

  // Delete question
  const deleteQuestion = (questionId: string) => {
    if (flowData.questions.length <= QUESTION_CONSTRAINTS.MIN_QUESTIONS) {
      setError(`Minimum ${QUESTION_CONSTRAINTS.MIN_QUESTIONS} questions required`);
      return;
    }

    setFlowData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId),
    }));
  };

  // Reorder questions
  const reorderQuestions = (reordered: CustomQuestion[]) => {
    setFlowData(prev => ({
      ...prev,
      questions: reordered.map((q, i) => ({ ...q, order: i + 1 })),
    }));
  };

  // Handle wizard completion - apply phases and questions from wizard, then AUTO-SAVE
  const handleWizardComplete = async (
    flow: TimelineFlow,
    newPhases: CustomPhaseConfig[],
    phaseQuestions: Record<string, { id: string; text: string; inputType: 'buttons' | 'text'; options?: string[] }[]>
  ) => {
    if (flow !== selectedFlow) {
      setSelectedFlow(flow);
    }

    // Convert phase questions to CustomQuestion format
    const wizardQuestions: CustomQuestion[] = [];
    let questionOrder = 0;

    Object.entries(phaseQuestions).forEach(([phaseId, questions]) => {
      questions.forEach((q) => {
        if (q.text.trim()) {
          questionOrder++;
          wizardQuestions.push({
            id: q.id,
            question: q.text,
            order: questionOrder,
            inputType: q.inputType,
            buttons: q.inputType === 'buttons' && q.options
              ? q.options.map((opt, i) => ({
                  id: `btn-${q.id}-${i}`,
                  label: opt,
                  value: opt.toLowerCase().replace(/\s+/g, '-'),
                }))
              : undefined,
            required: true,
            linkedPhaseId: phaseId,
          });
        }
      });
    });

    // Merge questions: keep existing ones that aren't being replaced, add new ones
    // Use a Map to deduplicate by ID (wizard questions take priority)
    const wizardQuestionIds = new Set(wizardQuestions.map(q => q.id));
    const existingQuestionsToKeep = flowData.questions.filter(q => !wizardQuestionIds.has(q.id));

    // Combine and re-order
    const mergedQuestions = [...existingQuestionsToKeep, ...wizardQuestions]
      .map((q, idx) => ({ ...q, order: idx + 1 }));

    // Update local state
    setFlowData(prev => ({
      ...prev,
      phases: newPhases,
      questions: mergedQuestions,
    }));
    setShowWizard(false);

    // AUTO-SAVE to MongoDB immediately after wizard completion
    console.log('🚀 [Wizard] Auto-saving phases and questions...');
    console.log('   Phases with inlineExperience:', newPhases.flatMap(p =>
      p.actionableSteps.filter(s => s.inlineExperience).map(s => s.title)
    ));

    setIsSaving(true);
    setError(null);

    try {
      const [questionsRes, phasesRes] = await Promise.all([
        fetch('/api/custom-questions', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ flow, questions: mergedQuestions }),
        }),
        fetch('/api/custom-phases', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ flow, phases: newPhases }),
        }),
      ]);

      const questionsData = await questionsRes.json();
      const phasesData = await phasesRes.json();

      if (!questionsRes.ok) throw new Error(questionsData.error || 'Failed to save questions');
      if (!phasesRes.ok) throw new Error(phasesData.error || 'Failed to save phases');

      setSuccess('Wizard completed and saved!');
      setFlowData(prev => ({
        ...prev,
        isCustomQuestions: true,
        isCustomPhases: true,
      }));
      console.log('✅ [Wizard] Auto-save complete');
    } catch (err) {
      console.error('❌ [Wizard] Auto-save failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to save wizard changes');
    } finally {
      setIsSaving(false);
    }
  };

  // Add new phase
  const addPhase = () => {
    if (flowData.phases.length >= PHASE_CONSTRAINTS.MAX_PHASES) {
      setError(`Maximum ${PHASE_CONSTRAINTS.MAX_PHASES} phases allowed`);
      return;
    }

    const newPhase: CustomPhaseConfig = {
      id: `phase-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: 'New Phase',
      timeline: `Week ${flowData.phases.length + 1}`,
      description: 'Describe this phase...',
      order: flowData.phases.length + 1,
      actionableSteps: [
        {
          id: `step-${Date.now()}`,
          title: 'New Step',
          priority: 'medium',
          order: 1,
        },
      ],
    };

    setFlowData(prev => ({
      ...prev,
      phases: [...prev.phases, newPhase],
    }));
  };

  // Handle story selection from picker
  const handleSelectStory = (storyId: string, storyTitle: string) => {
    if (!storyPickerTarget) return;

    if (storyPickerTarget.type === 'question' && storyPickerTarget.questionId) {
      updateQuestion(storyPickerTarget.questionId, {
        linkedStoryId: storyId || undefined,
      });
    } else if (storyPickerTarget.type === 'step' && storyPickerTarget.phaseId && storyPickerTarget.stepId) {
      updateStep(storyPickerTarget.phaseId, storyPickerTarget.stepId, {
        linkedStoryId: storyId || undefined,
      });
    }

    // Store story in local cache if we have the ID
    if (storyId) {
      // We'll fetch the story details if needed
      setStories(prev => {
        const updated = new Map(prev);
        updated.set(storyId, { id: storyId, title: storyTitle, advice: '', flow: selectedFlow, tags: [] });
        return updated;
      });
    }

    setStoryPickerOpen(false);
    setStoryPickerTarget(null);
  };

  // Handle inline experience save
  const handleSaveInline = (text: string) => {
    if (!storyPickerTarget) return;

    if (storyPickerTarget.type === 'question' && storyPickerTarget.questionId) {
      updateQuestion(storyPickerTarget.questionId, {
        personalAdvice: text,
        linkedStoryId: undefined, // Clear story link when using inline
      });
    } else if (storyPickerTarget.type === 'step' && storyPickerTarget.phaseId && storyPickerTarget.stepId) {
      updateStep(storyPickerTarget.phaseId, storyPickerTarget.stepId, {
        inlineExperience: text,
        linkedStoryId: undefined, // Clear story link when using inline
      });
    }

    setStoryPickerOpen(false);
    setStoryPickerTarget(null);
  };

  // Get linked phase for a question
  const getLinkedPhase = (question: CustomQuestion): CustomPhaseConfig | null => {
    if (!question.linkedPhaseId) return null;
    return flowData.phases.find(p => p.id === question.linkedPhaseId) || null;
  };

  // Get linked step for a question
  const getLinkedStep = (question: CustomQuestion): CustomActionableStep | null => {
    if (!question.linkedStepId) return null;
    const phase = getLinkedPhase(question);
    if (!phase) return null;
    return phase.actionableSteps.find(s => s.id === question.linkedStepId) || null;
  };

  // Convert existing questions to phase-grouped format for the wizard
  const wizardInitialQuestions = useMemo(() => {
    const grouped: Record<string, { id: string; text: string; inputType: 'buttons' | 'text'; options?: string[] }[]> = {};
    flowData.questions.forEach(q => {
      if (q.linkedPhaseId) {
        if (!grouped[q.linkedPhaseId]) {
          grouped[q.linkedPhaseId] = [];
        }
        grouped[q.linkedPhaseId].push({
          id: q.id,
          text: q.question,
          inputType: q.inputType === 'buttons' ? 'buttons' : 'text',
          options: q.buttons?.map(b => b.label),
        });
      }
    });
    return grouped;
  }, [flowData.questions]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  // Wizard-only mode: Show the wizard directly in the tab
  if (wizardOnlyMode) {
    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-slate-100 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            Setup Wizard
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Quickly configure your chatbot phases, steps, and personalized advice
          </p>
        </div>

        {/* Flow Selector for Wizard Mode */}
        <div className="flex justify-center mb-4">
          <div className="flex gap-1 bg-slate-800 p-1 rounded-lg">
            {FLOW_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => setSelectedFlow(opt.id)}
                className={`px-4 py-2 rounded text-sm transition-colors ${
                  selectedFlow === opt.id
                    ? 'bg-cyan-500 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Wizard Modal in embedded mode */}
        <TimelineWizardModal
          isOpen={true}
          onClose={() => onWizardClose?.()}
          onComplete={handleWizardComplete}
          initialFlow={selectedFlow}
          initialPhases={flowData.phases}
          initialPhaseQuestions={wizardInitialQuestions}
          embedded={true}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">Offer Builder</h3>
          <p className="text-sm text-slate-400 mt-1">
            Fine-tune your phases, questions, and knowledge base connections
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Flow Selector */}
          <div className="flex gap-1 bg-slate-800 p-1 rounded-lg">
            {FLOW_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => setSelectedFlow(opt.id)}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  selectedFlow === opt.id
                    ? 'bg-cyan-500 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Reset */}
          {(flowData.isCustomQuestions || flowData.isCustomPhases) && (
            <button
              onClick={handleReset}
              disabled={isSaving}
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors flex items-center gap-2 text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          )}

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save All
          </button>

          {/* Dev-only: Auto-populate advice */}
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={async () => {
                if (!confirm(`Auto-populate advice for ${selectedFlow} flow? This will fill in any steps without advice.`)) return;
                setIsSaving(true);
                try {
                  const res = await fetch('/api/populate-advice', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ flow: selectedFlow }),
                  });
                  const data = await res.json();
                  if (data.success) {
                    setSuccess(`Populated advice: ${data.stats.fromStories} from stories, ${data.stats.fromFallbacks} from templates`);
                    await fetchData(); // Reload data
                  } else {
                    setError(data.error);
                  }
                } catch (err) {
                  setError('Failed to populate advice');
                } finally {
                  setIsSaving(false);
                }
              }}
              disabled={isSaving}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
              title="Dev only: Auto-populate advice from knowledge base"
            >
              <Sparkles className="w-4 h-4" />
              Auto-Fill Advice
            </button>
          )}
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-center gap-2 text-green-400 text-sm">
          <CheckCircle2 className="w-4 h-4" />
          {success}
        </div>
      )}

      {/* Flow Legend */}
      <div className="bg-slate-800/50 rounded-lg p-3 flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-300">Question</span>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-500" />
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <span className="text-slate-300">Phase/Step</span>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-500" />
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-purple-400" />
          <span className="text-slate-300">Story/Advice</span>
        </div>
      </div>

      {/* Main Flow Builder */}
      <div className="space-y-4">
        <DraggableList
          items={flowData.questions}
          onReorder={reorderQuestions}
          keyExtractor={q => q.id}
          renderItem={(question, index) => (
            <FlowCard
              question={question}
              index={index}
              linkedPhase={getLinkedPhase(question)}
              linkedStep={getLinkedStep(question)}
              linkedStory={question.linkedStoryId ? stories.get(question.linkedStoryId) : undefined}
              allPhases={flowData.phases}
              isExpanded={expandedCards.has(question.id)}
              isEditing={editingItem === question.id}
              onToggleExpand={() => toggleCard(question.id)}
              onEdit={() => setEditingItem(editingItem === question.id ? null : question.id)}
              onDelete={() => deleteQuestion(question.id)}
              onUpdateQuestion={(updates) => updateQuestion(question.id, updates)}
              onLinkPhase={(phaseId) => linkQuestionToPhase(question.id, phaseId)}
              onLinkStep={(stepId) => linkQuestionToStep(question.id, stepId)}
              onOpenStoryPicker={() => {
                setStoryPickerTarget({ type: 'question', questionId: question.id });
                setStoryPickerOpen(true);
              }}
            />
          )}
        />

        {/* Add Question Button */}
        <button
          onClick={addQuestion}
          disabled={flowData.questions.length >= QUESTION_CONSTRAINTS.MAX_QUESTIONS}
          className="w-full py-3 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          Add Question ({flowData.questions.length}/{QUESTION_CONSTRAINTS.MAX_QUESTIONS})
        </button>
      </div>

      {/* Phases Section */}
      <div className="border-t border-slate-700 pt-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-md font-semibold text-slate-200">Timeline Phases</h4>
            <p className="text-sm text-slate-400">Define the phases shown in the timeline</p>
          </div>
          <button
            onClick={addPhase}
            disabled={flowData.phases.length >= PHASE_CONSTRAINTS.MAX_PHASES}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Add Phase ({flowData.phases.length}/{PHASE_CONSTRAINTS.MAX_PHASES})
          </button>
        </div>

        <div className="grid gap-3">
          {flowData.phases.map((phase, index) => (
            <PhaseCard
              key={phase.id}
              phase={phase}
              index={index}
              stories={stories}
              onUpdate={(updates) => updatePhase(phase.id, updates)}
              onUpdateStep={(stepId, updates) => updateStep(phase.id, stepId, updates)}
              onOpenStoryPicker={(stepId) => {
                setStoryPickerTarget({ type: 'step', phaseId: phase.id, stepId });
                setStoryPickerOpen(true);
              }}
              onDelete={() => {
                if (flowData.phases.length <= PHASE_CONSTRAINTS.MIN_PHASES) {
                  setError(`Minimum ${PHASE_CONSTRAINTS.MIN_PHASES} phases required`);
                  return;
                }
                setFlowData(prev => ({
                  ...prev,
                  phases: prev.phases.filter(p => p.id !== phase.id),
                }));
              }}
            />
          ))}
        </div>
      </div>

      {/* Story Picker Modal */}
      <StoryPickerModal
        isOpen={storyPickerOpen}
        onClose={() => {
          setStoryPickerOpen(false);
          setStoryPickerTarget(null);
        }}
        onSelectStory={handleSelectStory}
        onSaveInline={handleSaveInline}
        flow={selectedFlow}
        currentStoryId={
          storyPickerTarget?.type === 'question'
            ? flowData.questions.find(q => q.id === storyPickerTarget.questionId)?.linkedStoryId
            : storyPickerTarget?.type === 'step'
            ? flowData.phases
                .find(p => p.id === storyPickerTarget.phaseId)
                ?.actionableSteps.find(s => s.id === storyPickerTarget.stepId)?.linkedStoryId
            : undefined
        }
        currentInlineText={
          storyPickerTarget?.type === 'question'
            ? flowData.questions.find(q => q.id === storyPickerTarget.questionId)?.personalAdvice
            : storyPickerTarget?.type === 'step'
            ? flowData.phases
                .find(p => p.id === storyPickerTarget.phaseId)
                ?.actionableSteps.find(s => s.id === storyPickerTarget.stepId)?.inlineExperience
            : undefined
        }
      />

      {/* Timeline Wizard Modal */}
      <TimelineWizardModal
        isOpen={showWizard}
        onClose={handleWizardClose}
        onComplete={handleWizardComplete}
        initialFlow={selectedFlow}
        initialPhases={flowData.phases}
        initialPhaseQuestions={wizardInitialQuestions}
      />
    </div>
  );
}

// ============================================================================
// Flow Card Component - Question with linked phase/step/story
// ============================================================================

interface FlowCardProps {
  question: CustomQuestion;
  index: number;
  linkedPhase: CustomPhaseConfig | null;
  linkedStep: CustomActionableStep | null;
  linkedStory?: AvailableStory;
  allPhases: CustomPhaseConfig[];
  isExpanded: boolean;
  isEditing: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUpdateQuestion: (updates: Partial<CustomQuestion>) => void;
  onLinkPhase: (phaseId: string | null) => void;
  onLinkStep: (stepId: string | null) => void;
  onOpenStoryPicker: () => void;
}

function FlowCard({
  question,
  index,
  linkedPhase,
  linkedStep,
  linkedStory,
  allPhases,
  isExpanded,
  isEditing,
  onToggleExpand,
  onEdit,
  onDelete,
  onUpdateQuestion,
  onLinkPhase,
  onLinkStep,
  onOpenStoryPicker,
}: FlowCardProps) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-slate-700/50 transition-colors"
        onClick={onToggleExpand}
      >
        <GripVertical className="w-4 h-4 text-slate-500 cursor-grab" />
        <div className="flex items-center gap-2">
          <span className="text-cyan-400 font-mono text-sm">Q{index + 1}</span>
          <MessageCircle className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-slate-200 font-medium truncate">{question.question}</p>
        </div>

        {/* Connection indicators */}
        <div className="flex items-center gap-2">
          {linkedPhase && (
            <>
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <div className="flex items-center gap-1 bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded text-xs">
                <Layers className="w-3 h-3" />
                {linkedPhase.name}
              </div>
            </>
          )}
          {linkedStory && (
            <>
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <div className="flex items-center gap-1 bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded text-xs">
                <BookOpen className="w-3 h-3" />
                Story
              </div>
            </>
          )}
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-slate-400" />
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 py-4 border-t border-slate-700 space-y-4">
          {/* Question Text */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Question Text</label>
            <input
              type="text"
              value={question.question}
              onChange={(e) => onUpdateQuestion({ question: e.target.value })}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-slate-200"
            />
          </div>

          {/* Input Type & Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Input Type</label>
              <select
                value={question.inputType}
                onChange={(e) => onUpdateQuestion({ inputType: e.target.value as any })}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-slate-200"
              >
                <option value="buttons">Buttons</option>
                <option value="text">Text</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="number">Number</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Mapping Key</label>
              <input
                type="text"
                value={question.mappingKey || ''}
                onChange={(e) => onUpdateQuestion({ mappingKey: e.target.value || undefined })}
                placeholder="e.g., timeline, budget"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Buttons Editor */}
          {question.inputType === 'buttons' && question.buttons && (
            <div>
              <label className="block text-sm text-slate-400 mb-2">Button Options</label>
              <div className="space-y-2">
                {question.buttons.map((btn, btnIndex) => (
                  <div key={btn.id} className="flex items-center gap-2 bg-slate-900 rounded-lg p-2">
                    <span className="text-xs text-slate-500 w-5">{btnIndex + 1}.</span>
                    <input
                      type="text"
                      value={btn.label}
                      onChange={(e) => {
                        const newButtons = [...question.buttons!];
                        newButtons[btnIndex] = { ...btn, label: e.target.value };
                        onUpdateQuestion({ buttons: newButtons });
                      }}
                      placeholder="Label"
                      className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-200"
                    />
                    <input
                      type="text"
                      value={btn.value}
                      onChange={(e) => {
                        const newButtons = [...question.buttons!];
                        newButtons[btnIndex] = { ...btn, value: e.target.value };
                        onUpdateQuestion({ buttons: newButtons });
                      }}
                      placeholder="Value"
                      className="w-28 bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-200"
                    />
                    <button
                      onClick={() => {
                        if (question.buttons!.length <= 2) return;
                        onUpdateQuestion({
                          buttons: question.buttons!.filter((_, i) => i !== btnIndex),
                        });
                      }}
                      className="p-1 text-slate-500 hover:text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    if (question.buttons!.length >= 6) return;
                    onUpdateQuestion({
                      buttons: [
                        ...question.buttons!,
                        { id: `btn-${Date.now()}`, label: 'New Option', value: 'new-option' },
                      ],
                    });
                  }}
                  className="w-full py-1.5 border border-dashed border-slate-600 rounded text-slate-400 hover:text-slate-200 text-sm"
                >
                  + Add Button
                </button>
              </div>
            </div>
          )}

          {/* Linking Section */}
          <div className="pt-3 border-t border-slate-700">
            <p className="text-sm text-slate-400 mb-3 flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Link to Timeline & Knowledge
            </p>

            <div className="grid grid-cols-3 gap-3">
              {/* Phase Link */}
              <div>
                <label className="block text-xs text-slate-500 mb-1">Linked Phase</label>
                <select
                  value={linkedPhase?.id || ''}
                  onChange={(e) => onLinkPhase(e.target.value || null)}
                  className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-sm text-slate-200"
                >
                  <option value="">No link</option>
                  {allPhases.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Step Link */}
              <div>
                <label className="block text-xs text-slate-500 mb-1">Linked Step</label>
                <select
                  value={linkedStep?.id || ''}
                  onChange={(e) => onLinkStep(e.target.value || null)}
                  disabled={!linkedPhase}
                  className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-sm text-slate-200 disabled:opacity-50"
                >
                  <option value="">No link</option>
                  {linkedPhase?.actionableSteps.map(s => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </div>

              {/* Story Link */}
              <div>
                <label className="block text-xs text-slate-500 mb-1">Linked Story</label>
                <button
                  onClick={onOpenStoryPicker}
                  className={`w-full px-2 py-1.5 rounded text-sm text-left flex items-center gap-2 ${
                    linkedStory
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : 'bg-slate-900 border border-slate-600 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  {linkedStory ? linkedStory.title.slice(0, 15) + '...' : 'Select story'}
                </button>
              </div>
            </div>

            {/* Personal Advice */}
            <div className="mt-3">
              <label className="block text-xs text-slate-500 mb-1">Personal Advice (shown with answer)</label>
              <textarea
                value={question.personalAdvice || ''}
                onChange={(e) => onUpdateQuestion({ personalAdvice: e.target.value || undefined })}
                placeholder="Custom advice to show after this question..."
                rows={2}
                className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-sm text-slate-200 placeholder:text-slate-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Phase Card Component
// ============================================================================

interface PhaseCardProps {
  phase: CustomPhaseConfig;
  index: number;
  stories: Map<string, AvailableStory>;
  onUpdate: (updates: Partial<CustomPhaseConfig>) => void;
  onUpdateStep: (stepId: string, updates: Partial<CustomActionableStep>) => void;
  onOpenStoryPicker: (stepId: string) => void;
  onDelete: () => void;
}

function PhaseCard({
  phase,
  index,
  stories,
  onUpdate,
  onUpdateStep,
  onOpenStoryPicker,
  onDelete,
}: PhaseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-slate-700/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-mono text-sm">{index + 1}</span>
          <Layers className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-slate-200 font-medium">{phase.name}</p>
          <p className="text-xs text-slate-500">{phase.timeline} • {phase.actionableSteps.length} steps</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-slate-400" />
        )}
      </div>

      {/* Expanded */}
      {isExpanded && (
        <div className="px-4 py-4 border-t border-slate-700 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Name</label>
              <input
                type="text"
                value={phase.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-sm text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Timeline</label>
              <input
                type="text"
                value={phase.timeline}
                onChange={(e) => onUpdate({ timeline: e.target.value })}
                className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-sm text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Description</label>
              <input
                type="text"
                value={phase.description}
                onChange={(e) => onUpdate({ description: e.target.value })}
                className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-sm text-slate-200"
              />
            </div>
          </div>

          {/* Steps */}
          <div>
            <label className="block text-xs text-slate-500 mb-2">Actionable Steps</label>
            <div className="space-y-2">
              {phase.actionableSteps.map((step, stepIndex) => {
                const stepStory = step.linkedStoryId ? stories.get(step.linkedStoryId) : undefined;
                return (
                  <div key={step.id} className="flex items-center gap-2 bg-slate-900 rounded p-2">
                    <span className="text-xs text-slate-500 w-5">{stepIndex + 1}.</span>
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => onUpdateStep(step.id, { title: e.target.value })}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200"
                    />
                    <select
                      value={step.priority}
                      onChange={(e) => onUpdateStep(step.id, { priority: e.target.value as any })}
                      className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                    <button
                      onClick={() => onOpenStoryPicker(step.id)}
                      className={`p-1.5 rounded ${
                        stepStory
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'text-slate-500 hover:text-purple-400'
                      }`}
                      title={stepStory ? stepStory.title : 'Link story'}
                    >
                      <BookOpen className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (phase.actionableSteps.length <= 1) return;
                        onUpdate({
                          actionableSteps: phase.actionableSteps.filter(s => s.id !== step.id),
                        });
                      }}
                      className="p-1 text-slate-500 hover:text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
              <button
                onClick={() => {
                  if (phase.actionableSteps.length >= PHASE_CONSTRAINTS.MAX_STEPS_PER_PHASE) return;
                  onUpdate({
                    actionableSteps: [
                      ...phase.actionableSteps,
                      {
                        id: `step-${Date.now()}`,
                        title: 'New Step',
                        priority: 'medium',
                        order: phase.actionableSteps.length + 1,
                      },
                    ],
                  });
                }}
                className="w-full py-1.5 border border-dashed border-slate-600 rounded text-slate-400 hover:text-slate-200 text-sm"
              >
                + Add Step
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UnifiedOfferBuilder;
