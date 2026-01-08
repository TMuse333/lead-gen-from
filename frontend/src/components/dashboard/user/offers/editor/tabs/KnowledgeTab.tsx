// src/components/dashboard/user/offers/editor/tabs/KnowledgeTab.tsx
/**
 * Knowledge Tab for Offer Editor
 *
 * Shows personalized knowledge coverage for this specific offer.
 * Displays what knowledge exists per phase and allows uploading more.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Loader2,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  BookOpen,
  Plus,
  ChevronDown,
  ChevronRight,
  Tag,
  Lightbulb,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  MessageSquare,
} from 'lucide-react';
import type { OfferType, Intent } from '@/lib/offers/unified';
import type { KnowledgeKind } from '@/types/advice.types';
import PhaseKnowledgeUploader from '@/components/dashboard/user/knowledgeBase/PhaseKnowledgeUploader';

// ==================== TYPES ====================

interface AdviceItem {
  id: string;
  title: string;
  advice: string;
  tags: string[];
  kind?: KnowledgeKind;
}

interface PhaseCoverage {
  phaseId: string;
  phaseName: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  required: number;
  current: number;
  coverage: number;
  searchTags: string[];
  exampleContent?: string;
  items: AdviceItem[];
}

interface CoverageResponse {
  offerType: OfferType;
  intent: Intent;
  overallCoverage: number;
  totalRequired: number;
  totalCurrent: number;
  phases: PhaseCoverage[];
  missingCritical: string[];
}

interface UploaderState {
  isOpen: boolean;
  phaseId: string;
  phaseName: string;
  suggestedTags: string[];
  exampleContent?: string;
  editingItem?: (AdviceItem & { kind?: KnowledgeKind }) | null;
}

interface KnowledgeTabProps {
  offerType: OfferType;
}

// ==================== PRIORITY CONFIG ====================

const PRIORITY_CONFIG = {
  critical: {
    label: 'Critical',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/30',
  },
  high: {
    label: 'High',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    borderColor: 'border-amber-500/30',
  },
  medium: {
    label: 'Medium',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30',
  },
  low: {
    label: 'Low',
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/20',
    borderColor: 'border-slate-500/30',
  },
};

// ==================== COMPONENT ====================

export function KnowledgeTab({ offerType }: KnowledgeTabProps) {
  const [selectedIntent, setSelectedIntent] = useState<Intent>('buy');
  const [coverage, setCoverage] = useState<CoverageResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [uploader, setUploader] = useState<UploaderState>({
    isOpen: false,
    phaseId: '',
    phaseName: '',
    suggestedTags: [],
    editingItem: null,
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch coverage data
  const fetchCoverage = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/knowledge/coverage?offerType=${offerType}&intent=${selectedIntent}`
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch coverage');
      }

      const data: CoverageResponse = await response.json();
      setCoverage(data);

      // Auto-expand phases with low coverage
      const lowCoveragePhases = data.phases
        .filter((p) => p.coverage < 1)
        .map((p) => p.phaseId);
      setExpandedPhases(new Set(lowCoveragePhases.slice(0, 3)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load coverage data');
    } finally {
      setIsLoading(false);
    }
  }, [offerType, selectedIntent]);

  useEffect(() => {
    fetchCoverage();
  }, [fetchCoverage]);

  const togglePhaseExpanded = (phaseId: string) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phaseId)) {
        next.delete(phaseId);
      } else {
        next.add(phaseId);
      }
      return next;
    });
  };

  const toggleItemExpanded = (itemId: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const handleAddKnowledge = (phaseId: string, phaseName: string, suggestedTags: string[]) => {
    const phase = coverage?.phases.find((p) => p.phaseId === phaseId);
    setUploader({
      isOpen: true,
      phaseId,
      phaseName,
      suggestedTags,
      exampleContent: phase?.exampleContent,
      editingItem: null,
    });
  };

  const handleEditItem = (item: AdviceItem, phaseId: string) => {
    const phase = coverage?.phases.find((p) => p.phaseId === phaseId);
    setUploader({
      isOpen: true,
      phaseId,
      phaseName: phase?.phaseName || phaseId,
      suggestedTags: phase?.searchTags || [],
      exampleContent: phase?.exampleContent,
      editingItem: item,
    });
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/agent-advice/get?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete');
      }

      fetchCoverage();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete knowledge');
    } finally {
      setIsDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const overallPercent = coverage ? Math.round(coverage.overallCoverage * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">Personalized Knowledge</h3>
          <p className="text-sm text-slate-400 mt-1">
            Your expertise that gets injected into this offer's generation
          </p>
        </div>
        <button
          onClick={fetchCoverage}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors disabled:opacity-50 text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Intent Tabs */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-400">Intent:</span>
        <div className="flex rounded-lg overflow-hidden border border-slate-600">
          {(['buy', 'sell', 'browse'] as Intent[]).map((intent) => (
            <button
              key={intent}
              onClick={() => setSelectedIntent(intent)}
              className={`
                px-4 py-2 font-medium capitalize transition-all text-sm
                ${selectedIntent === intent
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }
              `}
            >
              {intent}
            </button>
          ))}
        </div>
      </div>

      {/* Overall Coverage */}
      {coverage && (
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-slate-300 font-medium">Knowledge Coverage</span>
              {coverage.missingCritical.length > 0 && (
                <div className="flex items-center gap-1 text-sm text-red-400">
                  <AlertTriangle className="w-4 h-4" />
                  {coverage.missingCritical.length} critical phase
                  {coverage.missingCritical.length > 1 ? 's' : ''} need attention
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {overallPercent >= 100 ? (
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              ) : overallPercent >= 70 ? (
                <div className="w-5 h-5 rounded-full bg-amber-500" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-400" />
              )}
              <span
                className={`text-lg font-bold ${
                  overallPercent >= 100
                    ? 'text-green-400'
                    : overallPercent >= 70
                      ? 'text-amber-400'
                      : 'text-red-400'
                }`}
              >
                {overallPercent}%
              </span>
              <span className="text-slate-500 text-sm">
                ({coverage.totalCurrent}/{coverage.totalRequired} items)
              </span>
            </div>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                overallPercent >= 100
                  ? 'bg-green-500'
                  : overallPercent >= 70
                    ? 'bg-amber-500'
                    : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(overallPercent, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Phases */}
      {!isLoading && !error && coverage && (
        <div className="space-y-3">
          {coverage.phases.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              No knowledge requirements defined for this offer/intent combination.
            </div>
          ) : (
            coverage.phases.map((phase) => {
              const isExpanded = expandedPhases.has(phase.phaseId);
              const priorityConfig = PRIORITY_CONFIG[phase.priority];
              const coveragePercent = Math.round(phase.coverage * 100);
              const isComplete = phase.coverage >= 1;
              const isCriticalMissing = phase.priority === 'critical' && phase.current < phase.required;

              return (
                <div
                  key={phase.phaseId}
                  className={`rounded-lg border transition-all ${
                    isCriticalMissing
                      ? 'border-red-500/50 bg-red-500/5'
                      : 'border-slate-700 bg-slate-800/30'
                  }`}
                >
                  {/* Phase Header */}
                  <button
                    onClick={() => togglePhaseExpanded(phase.phaseId)}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-700/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                      {isComplete ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      ) : isCriticalMissing ? (
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-500" />
                      )}
                      <span className="text-slate-100 font-medium text-sm">{phase.phaseName}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${priorityConfig.bgColor} ${priorityConfig.color}`}
                      >
                        {priorityConfig.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-400">
                        {phase.current}/{phase.required}
                      </span>
                      <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            isComplete ? 'bg-green-500' : coveragePercent > 50 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(coveragePercent, 100)}%` }}
                        />
                      </div>
                    </div>
                  </button>

                  {/* Phase Content */}
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3">
                      <p className="text-slate-400 text-sm ml-7">{phase.description}</p>

                      {/* Tags */}
                      <div className="ml-7 flex flex-wrap gap-2">
                        {phase.searchTags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Example */}
                      {phase.exampleContent && (
                        <div className="ml-7 p-3 bg-slate-900/50 rounded border border-slate-700">
                          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1">
                            <Lightbulb className="w-3 h-3" />
                            Example
                          </div>
                          <p className="text-sm text-slate-300 italic">"{phase.exampleContent}"</p>
                        </div>
                      )}

                      {/* Items */}
                      {phase.items.length > 0 && (
                        <div className="ml-7 space-y-2">
                          <div className="text-xs text-slate-500 uppercase tracking-wide">
                            Your Knowledge ({phase.items.length})
                          </div>
                          {phase.items.map((item) => {
                            const isItemExpanded = expandedItems.has(item.id);
                            return (
                              <div
                                key={item.id}
                                className="bg-slate-900/30 rounded border border-slate-700/50"
                              >
                                <div className="flex items-center gap-2 p-2">
                                  {item.kind === 'story' ? (
                                    <BookOpen className="w-4 h-4 text-amber-400 flex-shrink-0" />
                                  ) : (
                                    <MessageSquare className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                                  )}
                                  <span className="text-sm text-slate-200 flex-1 truncate">
                                    {item.title}
                                  </span>
                                  {item.kind === 'story' && (
                                    <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                                      Story
                                    </span>
                                  )}
                                  <button
                                    onClick={() => toggleItemExpanded(item.id)}
                                    className="p-1 hover:bg-slate-700 rounded"
                                  >
                                    {isItemExpanded ? (
                                      <EyeOff className="w-3 h-3 text-slate-400" />
                                    ) : (
                                      <Eye className="w-3 h-3 text-slate-400" />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => handleEditItem(item, phase.phaseId)}
                                    className="p-1 hover:bg-slate-700 rounded"
                                  >
                                    <Pencil className="w-3 h-3 text-cyan-400" />
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirm({ id: item.id, title: item.title })}
                                    className="p-1 hover:bg-red-500/20 rounded"
                                  >
                                    <Trash2 className="w-3 h-3 text-red-400" />
                                  </button>
                                </div>
                                {isItemExpanded && (
                                  <div className="px-2 pb-2">
                                    <div className="p-2 bg-slate-800/50 rounded text-xs text-slate-300 whitespace-pre-wrap">
                                      {item.advice}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Add Button */}
                      <div className="ml-7">
                        <button
                          onClick={() => handleAddKnowledge(phase.phaseId, phase.phaseName, phase.searchTags)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-all ${
                            isCriticalMissing
                              ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30'
                              : isComplete
                                ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                                : 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30'
                          }`}
                        >
                          <Plus className="w-4 h-4" />
                          {isComplete ? 'Add More' : 'Add Knowledge'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Uploader Modal */}
      <PhaseKnowledgeUploader
        isOpen={uploader.isOpen}
        onClose={() => setUploader((prev) => ({ ...prev, isOpen: false, editingItem: null }))}
        offerType={offerType}
        intent={selectedIntent}
        phaseId={uploader.phaseId}
        phaseName={uploader.phaseName}
        suggestedTags={uploader.suggestedTags}
        exampleContent={uploader.exampleContent}
        onSuccess={fetchCoverage}
        editingItem={uploader.editingItem}
      />

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-slate-800 rounded-xl border border-slate-700 shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-2">Delete Knowledge?</h3>
            <p className="text-slate-400 mb-4">
              Are you sure you want to delete "{deleteConfirm.title}"?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
