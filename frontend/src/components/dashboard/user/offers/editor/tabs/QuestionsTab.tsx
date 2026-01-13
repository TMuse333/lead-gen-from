// src/components/dashboard/user/offers/editor/tabs/QuestionsTab.tsx
/**
 * Questions Tab - Customize chatbot questions
 * Allows agents to modify, reorder, and customize the chatbot flow questions
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Save,
  RotateCcw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  MessageCircle,
  Type,
  ToggleLeft,
  Mail,
  Phone,
  Hash,
} from 'lucide-react';
import { DraggableList } from '@/components/dashboard/shared/DraggableList';
import type {
  CustomQuestion,
  CustomButtonOption,
  TimelineFlow,
  QuestionInputType,
} from '@/types/timelineBuilder.types';
import { QUESTION_CONSTRAINTS } from '@/types/timelineBuilder.types';

const FLOW_OPTIONS: { id: TimelineFlow; label: string }[] = [
  { id: 'buy', label: 'Buyer Flow' },
  { id: 'sell', label: 'Seller Flow' },
  { id: 'browse', label: 'Browser Flow' },
];

const INPUT_TYPE_OPTIONS: { id: QuestionInputType; label: string; icon: typeof Type }[] = [
  { id: 'buttons', label: 'Buttons', icon: ToggleLeft },
  { id: 'text', label: 'Text Input', icon: Type },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'phone', label: 'Phone', icon: Phone },
  { id: 'number', label: 'Number', icon: Hash },
];

export function QuestionsTab() {
  const [selectedFlow, setSelectedFlow] = useState<TimelineFlow>('buy');
  const [questions, setQuestions] = useState<CustomQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isCustom, setIsCustom] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  // Fetch questions for selected flow
  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/custom-questions?flow=${selectedFlow}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch questions');
      }

      setQuestions(data.questions || []);
      setIsCustom(data.isCustom || false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load questions');
    } finally {
      setIsLoading(false);
    }
  }, [selectedFlow]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Clear success message after delay
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Save all questions
  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/custom-questions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flow: selectedFlow, questions }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save questions');
      }

      setSuccess('Questions saved successfully');
      setIsCustom(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save questions');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to defaults
  const handleReset = async () => {
    if (!confirm('Reset all questions to defaults? This cannot be undone.')) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/custom-questions?flow=${selectedFlow}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset questions');
      }

      setQuestions(data.questions || []);
      setIsCustom(false);
      setSuccess('Questions reset to defaults');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset questions');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle reorder
  const handleReorder = (reordered: CustomQuestion[]) => {
    setQuestions(reordered.map((q, i) => ({ ...q, order: i + 1 })));
  };

  // Add new question
  const handleAddQuestion = () => {
    if (questions.length >= QUESTION_CONSTRAINTS.MAX_QUESTIONS) {
      setError(`Maximum ${QUESTION_CONSTRAINTS.MAX_QUESTIONS} questions allowed`);
      return;
    }

    const newQuestion: CustomQuestion = {
      id: `custom-q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      question: 'New Question',
      order: questions.length + 1,
      inputType: 'buttons',
      buttons: [
        { id: `btn-1-${Date.now()}`, label: 'Option 1', value: 'option-1' },
        { id: `btn-2-${Date.now()}`, label: 'Option 2', value: 'option-2' },
      ],
      required: true,
    };

    setQuestions([...questions, newQuestion]);
    setExpandedQuestions(new Set([...expandedQuestions, newQuestion.id]));
  };

  // Delete question
  const handleDeleteQuestion = (questionId: string) => {
    if (questions.length <= QUESTION_CONSTRAINTS.MIN_QUESTIONS) {
      setError(`Minimum ${QUESTION_CONSTRAINTS.MIN_QUESTIONS} questions required`);
      return;
    }

    setQuestions(questions.filter((q) => q.id !== questionId));
  };

  // Update question field
  const updateQuestion = (questionId: string, updates: Partial<CustomQuestion>) => {
    setQuestions(questions.map((q) => (q.id === questionId ? { ...q, ...updates } : q)));
  };

  // Add button to question
  const handleAddButton = (questionId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question?.buttons) return;

    if (question.buttons.length >= QUESTION_CONSTRAINTS.MAX_BUTTONS) {
      setError(`Maximum ${QUESTION_CONSTRAINTS.MAX_BUTTONS} buttons allowed per question`);
      return;
    }

    const newButton: CustomButtonOption = {
      id: `btn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      label: 'New Option',
      value: 'new-option',
    };

    updateQuestion(questionId, {
      buttons: [...question.buttons, newButton],
    });
  };

  // Delete button from question
  const handleDeleteButton = (questionId: string, buttonId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question?.buttons) return;

    if (question.buttons.length <= QUESTION_CONSTRAINTS.MIN_BUTTONS) {
      setError(`Minimum ${QUESTION_CONSTRAINTS.MIN_BUTTONS} buttons required`);
      return;
    }

    updateQuestion(questionId, {
      buttons: question.buttons.filter((b) => b.id !== buttonId),
    });
  };

  // Update button
  const updateButton = (
    questionId: string,
    buttonId: string,
    updates: Partial<CustomButtonOption>
  ) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question?.buttons) return;

    updateQuestion(questionId, {
      buttons: question.buttons.map((b) =>
        b.id === buttonId ? { ...b, ...updates } : b
      ),
    });
  };

  // Toggle question expansion
  const toggleExpanded = (questionId: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedQuestions(newExpanded);
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
          <h3 className="text-lg font-semibold text-slate-100">Chatbot Questions</h3>
          <p className="text-sm text-slate-400 mt-1">
            Customize the questions your chatbot asks leads
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Flow Selector */}
          <select
            value={selectedFlow}
            onChange={(e) => setSelectedFlow(e.target.value as TimelineFlow)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm"
          >
            {FLOW_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Reset Button */}
          {isCustom && (
            <button
              onClick={handleReset}
              disabled={isSaving}
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors flex items-center gap-2 text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </button>
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

      {/* Constraints Info */}
      <div className="bg-slate-800/50 rounded-lg p-3 text-sm text-slate-400">
        <span className="text-slate-300 font-medium">Limits:</span>{' '}
        {QUESTION_CONSTRAINTS.MIN_QUESTIONS}-{QUESTION_CONSTRAINTS.MAX_QUESTIONS} questions |{' '}
        {QUESTION_CONSTRAINTS.MIN_BUTTONS}-{QUESTION_CONSTRAINTS.MAX_BUTTONS} buttons per question
        {isCustom && (
          <span className="ml-2 text-cyan-400">(Custom configuration active)</span>
        )}
      </div>

      {/* Questions List */}
      <DraggableList
        items={questions}
        onReorder={handleReorder}
        keyExtractor={(q) => q.id}
        renderItem={(question, index) => (
          <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            {/* Question Header */}
            <div
              className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-slate-700/50 transition-colors"
              onClick={() => toggleExpanded(question.id)}
            >
              <GripVertical className="w-4 h-4 text-slate-500" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-sm">Q{index + 1}</span>
                  <MessageCircle className="w-4 h-4 text-cyan-400" />
                  <span className="text-slate-200 font-medium truncate">
                    {question.question}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-500 bg-slate-700 px-2 py-0.5 rounded">
                    {question.inputType}
                  </span>
                  {question.mappingKey && (
                    <span className="text-xs text-slate-500">
                      maps to: {question.mappingKey}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteQuestion(question.id);
                }}
                className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              {expandedQuestions.has(question.id) ? (
                <ChevronUp className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              )}
            </div>

            {/* Expanded Content */}
            {expandedQuestions.has(question.id) && (
              <div className="px-4 py-4 border-t border-slate-700 space-y-4">
                {/* Question Text */}
                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    Question Text
                  </label>
                  <input
                    type="text"
                    value={question.question}
                    onChange={(e) =>
                      updateQuestion(question.id, { question: e.target.value })
                    }
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-slate-200"
                  />
                </div>

                {/* Input Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">
                      Input Type
                    </label>
                    <select
                      value={question.inputType}
                      onChange={(e) =>
                        updateQuestion(question.id, {
                          inputType: e.target.value as QuestionInputType,
                          // Add default buttons if switching to buttons type
                          buttons:
                            e.target.value === 'buttons' && !question.buttons
                              ? [
                                  { id: `btn-1`, label: 'Option 1', value: 'option-1' },
                                  { id: `btn-2`, label: 'Option 2', value: 'option-2' },
                                ]
                              : question.buttons,
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-slate-200"
                    >
                      {INPUT_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-400 mb-1">
                      Mapping Key (optional)
                    </label>
                    <input
                      type="text"
                      value={question.mappingKey || ''}
                      onChange={(e) =>
                        updateQuestion(question.id, {
                          mappingKey: e.target.value || undefined,
                        })
                      }
                      placeholder="e.g., timeline, budget"
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 placeholder:text-slate-500"
                    />
                  </div>
                </div>

                {/* Required Toggle */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`required-${question.id}`}
                    checked={question.required !== false}
                    onChange={(e) =>
                      updateQuestion(question.id, { required: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                  />
                  <label
                    htmlFor={`required-${question.id}`}
                    className="text-sm text-slate-300"
                  >
                    Required question
                  </label>
                </div>

                {/* Placeholder for text inputs */}
                {question.inputType !== 'buttons' && (
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">
                      Placeholder Text
                    </label>
                    <input
                      type="text"
                      value={question.placeholder || ''}
                      onChange={(e) =>
                        updateQuestion(question.id, {
                          placeholder: e.target.value || undefined,
                        })
                      }
                      placeholder="Type your answer..."
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 placeholder:text-slate-500"
                    />
                  </div>
                )}

                {/* Buttons for button-type questions */}
                {question.inputType === 'buttons' && question.buttons && (
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">
                      Button Options
                    </label>
                    <div className="space-y-2">
                      {question.buttons.map((btn, btnIndex) => (
                        <div
                          key={btn.id}
                          className="flex items-center gap-2 bg-slate-900 rounded-lg p-2"
                        >
                          <span className="text-xs text-slate-500 w-6">
                            {btnIndex + 1}.
                          </span>
                          <input
                            type="text"
                            value={btn.label}
                            onChange={(e) =>
                              updateButton(question.id, btn.id, {
                                label: e.target.value,
                              })
                            }
                            placeholder="Button label"
                            className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-200"
                          />
                          <input
                            type="text"
                            value={btn.value}
                            onChange={(e) =>
                              updateButton(question.id, btn.id, {
                                value: e.target.value,
                              })
                            }
                            placeholder="Value"
                            className="w-32 bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-200"
                          />
                          <button
                            onClick={() => handleDeleteButton(question.id, btn.id)}
                            className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => handleAddButton(question.id)}
                        className="w-full py-2 border border-dashed border-slate-600 rounded-lg text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Add Button
                      </button>
                    </div>
                  </div>
                )}

                {/* Phase/Step Linking */}
                <div className="pt-2 border-t border-slate-700">
                  <p className="text-xs text-slate-500 mb-2">
                    Optional: Link to timeline phases in Bot Responses tab
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">
                        Personal Advice
                      </label>
                      <textarea
                        value={question.personalAdvice || ''}
                        onChange={(e) =>
                          updateQuestion(question.id, {
                            personalAdvice: e.target.value || undefined,
                          })
                        }
                        placeholder="Custom advice to show after this question..."
                        rows={2}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 text-sm placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      />

      {/* Add Question Button */}
      <button
        onClick={handleAddQuestion}
        disabled={questions.length >= QUESTION_CONSTRAINTS.MAX_QUESTIONS}
        className="w-full py-3 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus className="w-5 h-5" />
        Add Question
        <span className="text-xs">
          ({questions.length}/{QUESTION_CONSTRAINTS.MAX_QUESTIONS})
        </span>
      </button>
    </div>
  );
}

export default QuestionsTab;
