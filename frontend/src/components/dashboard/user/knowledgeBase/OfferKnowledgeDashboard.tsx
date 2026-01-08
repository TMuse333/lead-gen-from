// src/components/dashboard/user/knowledgeBase/OfferKnowledgeDashboard.tsx
/**
 * Offer Knowledge Dashboard
 *
 * Main component for viewing and managing knowledge by offer and phase.
 * Shows coverage statistics and guides agents on what knowledge to upload.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Loader2,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  BarChart3,
  Calendar,
  FileText,
} from 'lucide-react';
import PhaseKnowledgeCard, { type AdviceItem } from './PhaseKnowledgeCard';
import PhaseKnowledgeUploader from './PhaseKnowledgeUploader';
import {
  getAllOffers,
  type OfferType,
  type Intent,
} from '@/lib/offers/unified';
import type { KnowledgeKind } from '@/types/advice.types';

// ==================== TYPES ====================

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

interface DeleteConfirmState {
  isOpen: boolean;
  itemId: string;
  itemTitle: string;
}

// ==================== OFFER ICON MAP ====================

const OFFER_ICONS: Record<string, React.ReactNode> = {
  'real-estate-timeline': <Calendar className="w-5 h-5" />,
  pdf: <FileText className="w-5 h-5" />,
  video: <FileText className="w-5 h-5" />,
  'home-estimate': <BarChart3 className="w-5 h-5" />,
};

// ==================== COMPONENT ====================

export default function OfferKnowledgeDashboard() {
  // Get offers that have knowledge requirements
  const offersWithRequirements = getAllOffers().filter(
    (offer) => offer.knowledgeRequirements && Object.keys(offer.knowledgeRequirements).length > 0
  );

  const [selectedOffer, setSelectedOffer] = useState<OfferType>(
    offersWithRequirements[0]?.type || 'real-estate-timeline'
  );
  const [selectedIntent, setSelectedIntent] = useState<Intent>('buy');
  const [coverage, setCoverage] = useState<CoverageResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploader, setUploader] = useState<UploaderState>({
    isOpen: false,
    phaseId: '',
    phaseName: '',
    suggestedTags: [],
    editingItem: null,
  });
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({
    isOpen: false,
    itemId: '',
    itemTitle: '',
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Get the selected offer object
  const currentOffer = offersWithRequirements.find((o) => o.type === selectedOffer);
  const supportedIntents = currentOffer?.supportedIntents || ['buy', 'sell', 'browse'];

  // Fetch coverage data
  const fetchCoverage = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/knowledge/coverage?offerType=${selectedOffer}&intent=${selectedIntent}`
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch coverage');
      }

      const data: CoverageResponse = await response.json();
      setCoverage(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load coverage data');
    } finally {
      setIsLoading(false);
    }
  }, [selectedOffer, selectedIntent]);

  useEffect(() => {
    fetchCoverage();
  }, [fetchCoverage]);

  // Handle offer change
  const handleOfferChange = (offerType: OfferType) => {
    setSelectedOffer(offerType);
    // Reset intent if not supported
    const offer = offersWithRequirements.find((o) => o.type === offerType);
    if (offer && !offer.supportedIntents.includes(selectedIntent)) {
      setSelectedIntent(offer.supportedIntents[0] || 'buy');
    }
  };

  // Handle add knowledge click
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

  // Handle edit item click
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

  // Handle delete item click
  const handleDeleteItem = (itemId: string, itemTitle: string) => {
    setDeleteConfirm({
      isOpen: true,
      itemId,
      itemTitle,
    });
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!deleteConfirm.itemId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/agent-advice/get?id=${deleteConfirm.itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete');
      }

      // Refresh coverage
      fetchCoverage();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete knowledge');
    } finally {
      setIsDeleting(false);
      setDeleteConfirm({ isOpen: false, itemId: '', itemTitle: '' });
    }
  };

  // Close uploader and refresh
  const handleUploaderSuccess = () => {
    fetchCoverage();
  };

  const overallPercent = coverage ? Math.round(coverage.overallCoverage * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Knowledge by Offer</h1>
          <p className="text-slate-400 mt-1">
            See what knowledge each phase needs and track your coverage
          </p>
        </div>
        <button
          onClick={fetchCoverage}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Offer & Intent Selector */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        {/* Offer Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Offer:</span>
          <div className="flex gap-2">
            {offersWithRequirements.map((offer) => (
              <button
                key={offer.type}
                onClick={() => handleOfferChange(offer.type)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                  ${
                    selectedOffer === offer.type
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                      : 'bg-slate-700/50 text-slate-400 border border-slate-600 hover:border-slate-500'
                  }
                `}
              >
                {OFFER_ICONS[offer.type] || <FileText className="w-5 h-5" />}
                <span>{offer.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Intent Tabs */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm text-slate-400">Intent:</span>
          <div className="flex rounded-lg overflow-hidden border border-slate-600">
            {(['buy', 'sell', 'browse'] as Intent[]).map((intent) => {
              const isSupported = supportedIntents.includes(intent);
              return (
                <button
                  key={intent}
                  onClick={() => isSupported && setSelectedIntent(intent)}
                  disabled={!isSupported}
                  className={`
                    px-4 py-2 font-medium capitalize transition-all
                    ${
                      selectedIntent === intent
                        ? 'bg-cyan-600 text-white'
                        : isSupported
                          ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    }
                  `}
                >
                  {intent}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Overall Coverage */}
      {coverage && (
        <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-slate-300 font-medium">Overall Coverage</span>
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
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
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

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchCoverage}
            className="mt-3 text-sm text-red-300 hover:text-red-200 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Phase Cards */}
      {!isLoading && !error && coverage && (
        <div className="space-y-4">
          {coverage.phases.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              No knowledge requirements defined for this offer/intent combination.
            </div>
          ) : (
            coverage.phases.map((phase) => (
              <PhaseKnowledgeCard
                key={phase.phaseId}
                phaseId={phase.phaseId}
                phaseName={phase.phaseName}
                description={phase.description}
                priority={phase.priority}
                required={phase.required}
                current={phase.current}
                coverage={phase.coverage}
                searchTags={phase.searchTags}
                exampleContent={phase.exampleContent}
                items={phase.items}
                onAddKnowledge={handleAddKnowledge}
                onEditItem={(item) => handleEditItem(item, phase.phaseId)}
                onDeleteItem={handleDeleteItem}
              />
            ))
          )}
        </div>
      )}

      {/* Uploader Modal */}
      <PhaseKnowledgeUploader
        isOpen={uploader.isOpen}
        onClose={() => setUploader((prev) => ({ ...prev, isOpen: false, editingItem: null }))}
        offerType={selectedOffer}
        intent={selectedIntent}
        phaseId={uploader.phaseId}
        phaseName={uploader.phaseName}
        suggestedTags={uploader.suggestedTags}
        exampleContent={uploader.exampleContent}
        onSuccess={handleUploaderSuccess}
        editingItem={uploader.editingItem}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setDeleteConfirm({ isOpen: false, itemId: '', itemTitle: '' })}
          />
          <div className="relative bg-slate-800 rounded-xl border border-slate-700 shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-2">Delete Knowledge?</h3>
            <p className="text-slate-400 mb-4">
              Are you sure you want to delete "{deleteConfirm.itemTitle}"? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm({ isOpen: false, itemId: '', itemTitle: '' })}
                className="px-4 py-2 text-slate-400 hover:text-slate-200 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 disabled:bg-slate-600 text-white font-medium rounded-lg transition-colors"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
