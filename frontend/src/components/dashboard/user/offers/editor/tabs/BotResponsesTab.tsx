// src/components/dashboard/user/offers/editor/tabs/BotResponsesTab.tsx
/**
 * Bot Responses Tab - Configure chatbot responses and link to phases/advice
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Link,
  BookOpen,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  X,
} from 'lucide-react';
import { StoryPickerModal } from '@/components/dashboard/shared/StoryPickerModal';
import type { TimelineFlow, BotQuestionConfig, CustomPhaseConfig } from '@/types/timelineBuilder.types';

interface MergedQuestionConfig {
  questionId: string;
  questionText: string;
  order: number;
  mappingKey?: string;
  linkedPhaseId?: string;
  linkedStepId?: string;
  personalAdvice?: string;
  linkedStoryId?: string;
}

const FLOW_TABS: { id: TimelineFlow; label: string }[] = [
  { id: 'buy', label: 'Buyers' },
  { id: 'sell', label: 'Sellers' },
  { id: 'browse', label: 'Browsers' },
];

export function BotResponsesTab() {
  const [selectedFlow, setSelectedFlow] = useState<TimelineFlow>('buy');
  const [questions, setQuestions] = useState<MergedQuestionConfig[]>([]);
  const [phases, setPhases] = useState<CustomPhaseConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [storyPickerState, setStoryPickerState] = useState<{
    isOpen: boolean;
    questionId: string;
    currentStoryId?: string;
  }>({ isOpen: false, questionId: '' });

  // Fetch data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch bot config and phases in parallel
      const [botResponse, phasesResponse] = await Promise.all([
        fetch(`/api/bot-config?flow=${selectedFlow}`),
        fetch(`/api/custom-phases?flow=${selectedFlow}`),
      ]);

      const botData = await botResponse.json();
      const phasesData = await phasesResponse.json();

      if (!botResponse.ok) {
        throw new Error(botData.error || 'Failed to fetch bot config');
      }
      if (!phasesResponse.ok) {
        throw new Error(phasesData.error || 'Failed to fetch phases');
      }

      setQuestions(botData.questions || []);
      setPhases(phasesData.phases || []);
      setIsDirty(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [selectedFlow]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Clear success message after timeout
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const toggleQuestionExpanded = (questionId: string) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  const updateQuestion = (questionId: string, updates: Partial<MergedQuestionConfig>) => {
    setQuestions((prev) =>
      prev.map((q) => (q.questionId === questionId ? { ...q, ...updates } : q))
    );
    setIsDirty(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      // Convert to BotQuestionConfig format
      const configs: BotQuestionConfig[] = questions
        .filter((q) => q.linkedPhaseId || q.linkedStepId || q.personalAdvice || q.linkedStoryId)
        .map((q) => ({
          questionId: q.questionId,
          linkedPhaseId: q.linkedPhaseId,
          linkedStepId: q.linkedStepId,
          personalAdvice: q.personalAdvice,
          linkedStoryId: q.linkedStoryId,
        }));

      const response = await fetch('/api/bot-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flow: selectedFlow, configs }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save');
      }

      setSuccessMessage('Bot responses saved successfully');
      setIsDirty(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const openStoryPicker = (question: MergedQuestionConfig) => {
    setStoryPickerState({
      isOpen: true,
      questionId: question.questionId,
      currentStoryId: question.linkedStoryId,
    });
  };

  const handleStorySelect = (storyId: string) => {
    if (storyId) {
      updateQuestion(storyPickerState.questionId, { linkedStoryId: storyId });
    } else {
      updateQuestion(storyPickerState.questionId, { linkedStoryId: undefined });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">Bot Responses</h3>
          <p className="text-sm text-slate-400 mt-1">
            Link chatbot questions to timeline phases and personal advice
          </p>
        </div>
        {isDirty && (
          <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded">
            Unsaved Changes
          </span>
        )}
      </div>

      {/* Flow Tabs */}
      <div className="flex gap-1 bg-slate-800 p-1 rounded-lg w-fit">
        {FLOW_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedFlow(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedFlow === tab.id
                ? 'bg-cyan-500 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm">{error}</span>
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm">{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question List */}
      {questions.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p>No questions configured for this flow</p>
          <p className="text-sm mt-1">Configure questions in the Conversation Flow settings</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((question) => (
            <QuestionConfigCard
              key={question.questionId}
              question={question}
              phases={phases}
              isExpanded={expandedQuestions.has(question.questionId)}
              onToggleExpand={() => toggleQuestionExpanded(question.questionId)}
              onUpdate={(updates) => updateQuestion(question.questionId, updates)}
              onOpenStoryPicker={() => openStoryPicker(question)}
            />
          ))}
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-slate-700">
        <button
          onClick={handleSave}
          disabled={isSaving || !isDirty}
          className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Responses
            </>
          )}
        </button>
      </div>

      {/* Story Picker Modal */}
      <StoryPickerModal
        isOpen={storyPickerState.isOpen}
        onClose={() => setStoryPickerState((s) => ({ ...s, isOpen: false }))}
        onSelectStory={handleStorySelect}
        onSaveInline={() => {}} // Not used for bot responses
        flow={selectedFlow}
        currentStoryId={storyPickerState.currentStoryId}
      />
    </div>
  );
}

// Question Config Card Component
interface QuestionConfigCardProps {
  question: MergedQuestionConfig;
  phases: CustomPhaseConfig[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (updates: Partial<MergedQuestionConfig>) => void;
  onOpenStoryPicker: () => void;
}

function QuestionConfigCard({
  question,
  phases,
  isExpanded,
  onToggleExpand,
  onUpdate,
  onOpenStoryPicker,
}: QuestionConfigCardProps) {
  const hasConfig = !!(question.linkedPhaseId || question.personalAdvice || question.linkedStoryId);
  const selectedPhase = phases.find((p) => p.id === question.linkedPhaseId);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggleExpand}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-700/50 transition-colors"
      >
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform ${
            isExpanded ? '' : '-rotate-90'
          }`}
        />
        <MessageSquare className="w-4 h-4 text-slate-400" />
        <div className="flex-1 min-w-0">
          <p className="text-slate-100 truncate">{question.questionText}</p>
          {question.mappingKey && (
            <p className="text-xs text-slate-500 mt-0.5">maps to: {question.mappingKey}</p>
          )}
        </div>
        {hasConfig && (
          <span className="px-2 py-0.5 text-xs bg-cyan-500/20 text-cyan-400 rounded">
            Configured
          </span>
        )}
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-700"
          >
            <div className="p-4 space-y-4">
              {/* Link to Phase */}
              <div>
                <label className="block text-sm text-slate-400 mb-1">
                  <Link className="w-3 h-3 inline mr-1" />
                  Link to Phase
                </label>
                <select
                  value={question.linkedPhaseId || ''}
                  onChange={(e) => onUpdate({
                    linkedPhaseId: e.target.value || undefined,
                    linkedStepId: undefined, // Clear step when phase changes
                  })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-400/50"
                >
                  <option value="">No phase linked</option>
                  {phases.map((phase) => (
                    <option key={phase.id} value={phase.id}>
                      {phase.name} ({phase.timeline})
                    </option>
                  ))}
                </select>
              </div>

              {/* Link to Step (if phase selected) */}
              {selectedPhase && (
                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    Link to Step (optional)
                  </label>
                  <select
                    value={question.linkedStepId || ''}
                    onChange={(e) => onUpdate({ linkedStepId: e.target.value || undefined })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-400/50"
                  >
                    <option value="">No specific step</option>
                    {selectedPhase.actionableSteps.map((step) => (
                      <option key={step.id} value={step.id}>
                        {step.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Personal Advice */}
              <div>
                <label className="block text-sm text-slate-400 mb-1">
                  Personal Advice
                </label>
                <textarea
                  value={question.personalAdvice || ''}
                  onChange={(e) => onUpdate({ personalAdvice: e.target.value || undefined })}
                  placeholder="Add personalized advice the bot should share after this question..."
                  rows={3}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400/50 resize-none"
                />
              </div>

              {/* Link Story */}
              <div>
                <label className="block text-sm text-slate-400 mb-1">
                  <BookOpen className="w-3 h-3 inline mr-1" />
                  Link Story
                </label>
                <button
                  onClick={onOpenStoryPicker}
                  className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                    question.linkedStoryId
                      ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400'
                      : 'bg-slate-700 border-slate-600 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {question.linkedStoryId ? (
                    <span className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Story linked
                      <X
                        className="w-4 h-4 ml-auto hover:text-red-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdate({ linkedStoryId: undefined });
                        }}
                      />
                    </span>
                  ) : (
                    'Click to select a story...'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default BotResponsesTab;
