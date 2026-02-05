// src/components/dashboard/admin/botSandbox/QuestionsDebugModal.tsx
/**
 * Debug Modal - Shows questions loaded from MongoDB and current state
 * Helps visualize what the bot is doing and what questions are configured
 */

'use client';

import { useState, useEffect } from 'react';
import { X, Database, CheckCircle2, Circle, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import type { CustomQuestion, TimelineFlow } from '@/types/timelineBuilder.types';

interface QuestionsDebugModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  currentFlow: TimelineFlow | null;
  currentQuestionId: string | null;
  collectedData: Record<string, string>;
}

interface LoadedQuestions {
  buy: CustomQuestion[];
  sell: CustomQuestion[];
}

export function QuestionsDebugModal({
  isOpen,
  onClose,
  clientId,
  currentFlow,
  currentQuestionId,
  collectedData,
}: QuestionsDebugModalProps) {
  const [questions, setQuestions] = useState<LoadedQuestions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TimelineFlow>('buy');

  // Load questions when modal opens or clientId changes
  const loadQuestions = async () => {
    if (!clientId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/custom-questions/all?clientId=${encodeURIComponent(clientId)}`);
      const data = await response.json();

      if (data.success) {
        setQuestions({
          buy: data.questions?.buy || [],
          sell: data.questions?.sell || [],
        });
      } else {
        setError(data.error || 'Failed to load questions');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && clientId) {
      loadQuestions();
      // Set active tab to current flow if available
      if (currentFlow) {
        setActiveTab(currentFlow);
      }
    }
  }, [isOpen, clientId, currentFlow]);

  if (!isOpen) return null;

  const currentQuestions = questions?.[activeTab] || [];
  const sortedQuestions = [...currentQuestions].sort((a, b) => a.order - b.order);

  // Find current question index
  const currentIndex = sortedQuestions.findIndex(q =>
    `q_${q.id}` === currentQuestionId || q.id === currentQuestionId
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800/50">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-semibold text-white">Questions Debug</h2>
            <span className="text-xs text-slate-400 bg-slate-700 px-2 py-0.5 rounded">
              {clientId}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadQuestions}
              disabled={loading}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700">
          {(['buy', 'sell'] as TimelineFlow[]).map((flow) => (
            <button
              key={flow}
              onClick={() => setActiveTab(flow)}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === flow
                  ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-800/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/20'
              }`}
            >
              {flow.charAt(0).toUpperCase() + flow.slice(1)} Flow
              <span className="ml-2 text-xs text-slate-500">
                ({questions?.[flow]?.length || 0})
              </span>
              {currentFlow === flow && (
                <span className="ml-1 text-xs text-green-400">(active)</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-400">{error}</p>
              <button
                onClick={loadQuestions}
                className="mt-2 text-cyan-400 hover:underline text-sm"
              >
                Try again
              </button>
            </div>
          ) : sortedQuestions.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p>No questions configured for {activeTab} flow</p>
              <p className="text-xs mt-1">Default questions will be used</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedQuestions.map((q, index) => {
                const stateId = `q_${q.id}`;
                const mappingKey = q.mappingKey || q.id;
                const isCurrent = stateId === currentQuestionId || q.id === currentQuestionId;
                const isCompleted = mappingKey ? collectedData[mappingKey] !== undefined : false;
                const isNext = index === currentIndex + 1;

                return (
                  <div
                    key={q.id}
                    className={`p-3 rounded-lg border transition-all ${
                      isCurrent
                        ? 'border-cyan-500 bg-cyan-500/10 ring-1 ring-cyan-500/50'
                        : isNext
                        ? 'border-yellow-500/50 bg-yellow-500/5'
                        : isCompleted
                        ? 'border-green-500/30 bg-green-500/5'
                        : 'border-slate-700 bg-slate-800/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Status Icon */}
                      <div className="mt-0.5">
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        ) : isCurrent ? (
                          <ArrowRight className="w-5 h-5 text-cyan-400 animate-pulse" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-500" />
                        )}
                      </div>

                      {/* Question Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-slate-500">
                            #{index + 1}
                          </span>
                          <span className="text-xs font-mono text-cyan-400/70">
                            {q.mappingKey}
                          </span>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            q.inputType === 'buttons'
                              ? 'bg-purple-500/20 text-purple-300'
                              : 'bg-blue-500/20 text-blue-300'
                          }`}>
                            {q.inputType}
                          </span>
                          {isCurrent && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                              CURRENT
                            </span>
                          )}
                          {isNext && !isCurrent && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300">
                              NEXT
                            </span>
                          )}
                        </div>

                        <p className={`text-sm ${isCurrent ? 'text-white font-medium' : 'text-slate-300'}`}>
                          {q.question}
                        </p>

                        {/* Buttons preview */}
                        {q.buttons && q.buttons.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {q.buttons.map((btn) => (
                              <span
                                key={btn.id}
                                className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300"
                              >
                                {btn.label}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Collected value */}
                        {isCompleted && mappingKey && (
                          <div className="mt-2 text-xs">
                            <span className="text-green-400">Collected: </span>
                            <span className="text-white font-mono bg-slate-700 px-1.5 py-0.5 rounded">
                              {collectedData[mappingKey]}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer with collected data summary */}
        <div className="px-4 py-3 border-t border-slate-700 bg-slate-800/30">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Collected: {Object.keys(collectedData).length} / {sortedQuestions.length} fields
            </span>
            <span>
              State: {currentQuestionId || 'none'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
