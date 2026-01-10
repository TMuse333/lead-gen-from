// src/components/dashboard/user/knowledgeBase/StoryPlacementManager.tsx
/**
 * Story Placement Manager
 *
 * Modal for managing where a story is placed (which offers/phases).
 * Allows adding and removing placements.
 */

'use client';

import { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Loader2,
  CheckCircle2,
  Plus,
  Trash2,
  Calendar,
  FileText,
  BarChart3,
} from 'lucide-react';
import { getAllOffers, type OfferType, type Intent } from '@/lib/offers/unified';

interface Placement {
  offerType: OfferType;
  offerLabel: string;
  phases: string[];
}

interface StoryPlacementManagerProps {
  isOpen: boolean;
  onClose: () => void;
  storyId: string;
  storyTitle: string;
  currentPlacements: Record<string, string[]>;
  onSuccess?: () => void;
}

// Phase options per offer type
const PHASE_OPTIONS: Record<string, Array<{ id: string; label: string }>> = {
  'real-estate-timeline': [
    // Buy phases
    { id: 'financial-prep', label: 'Financial Preparation (Buy)' },
    { id: 'find-agent', label: 'Find Your Agent (Buy)' },
    { id: 'house-hunting', label: 'House Hunting (Buy)' },
    { id: 'make-offer', label: 'Make an Offer (Buy)' },
    { id: 'under-contract', label: 'Under Contract (Buy)' },
    { id: 'closing', label: 'Closing Day (Buy)' },
    { id: 'post-closing', label: 'Post-Closing (Buy)' },
    // Sell phases
    { id: 'home-prep', label: 'Prepare Your Home (Sell)' },
    { id: 'choose-agent-price', label: 'Choose Agent & Price (Sell)' },
    { id: 'list-property', label: 'List Property (Sell)' },
    { id: 'marketing-showings', label: 'Marketing & Showings (Sell)' },
    { id: 'review-offers', label: 'Review Offers (Sell)' },
    { id: 'under-contract-sell', label: 'Under Contract (Sell)' },
    { id: 'closing-sell', label: 'Closing (Sell)' },
    // Browse phases
    { id: 'understand-options', label: 'Understand Options (Browse)' },
    { id: 'financial-education', label: 'Financial Education (Browse)' },
    { id: 'market-research', label: 'Market Research (Browse)' },
    { id: 'decision-time', label: 'Decision Time (Browse)' },
    { id: 'next-steps', label: 'Next Steps (Browse)' },
  ],
  pdf: [
    { id: 'executive-summary', label: 'Executive Summary' },
    { id: 'market-analysis', label: 'Market Analysis' },
    { id: 'property-details', label: 'Property Details' },
    { id: 'recommendations', label: 'Recommendations' },
    { id: 'next-steps', label: 'Next Steps' },
  ],
  video: [
    { id: 'intro', label: 'Introduction' },
    { id: 'property-tour', label: 'Property Tour' },
    { id: 'neighborhood', label: 'Neighborhood' },
    { id: 'market-context', label: 'Market Context' },
    { id: 'call-to-action', label: 'Call to Action' },
  ],
  'home-estimate': [
    { id: 'valuation', label: 'Valuation' },
    { id: 'comparables', label: 'Comparables' },
    { id: 'market-trends', label: 'Market Trends' },
    { id: 'recommendations', label: 'Recommendations' },
  ],
};

const OFFER_ICONS: Record<string, React.ReactNode> = {
  'real-estate-timeline': <Calendar className="w-4 h-4" />,
  pdf: <FileText className="w-4 h-4" />,
  video: <FileText className="w-4 h-4" />,
  'home-estimate': <BarChart3 className="w-4 h-4" />,
};

export default function StoryPlacementManager({
  isOpen,
  onClose,
  storyId,
  storyTitle,
  currentPlacements,
  onSuccess,
}: StoryPlacementManagerProps) {
  const [placements, setPlacements] = useState<Record<string, string[]>>(currentPlacements || {});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Get available offers
  const availableOffers = getAllOffers().filter(
    (offer) => offer.knowledgeRequirements && Object.keys(offer.knowledgeRequirements).length > 0
  );

  useEffect(() => {
    if (isOpen) {
      setPlacements(currentPlacements || {});
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, currentPlacements]);

  if (!isOpen) return null;

  const togglePhase = (offerType: string, phaseId: string) => {
    setPlacements((prev) => {
      const current = prev[offerType] || [];
      const updated = current.includes(phaseId)
        ? current.filter((p) => p !== phaseId)
        : [...current, phaseId];

      if (updated.length === 0) {
        const { [offerType]: _, ...rest } = prev;
        return rest;
      }

      return { ...prev, [offerType]: updated };
    });
  };

  const removeOffer = (offerType: string) => {
    setPlacements((prev) => {
      const { [offerType]: _, ...rest } = prev;
      return rest;
    });
  };

  // Map phase IDs to their flow type
  const getFlowForPhase = (phaseId: string): 'buy' | 'sell' | 'browse' | null => {
    const buyPhases = ['financial-prep', 'find-agent', 'house-hunting', 'make-offer', 'under-contract', 'closing', 'post-closing'];
    const sellPhases = ['home-prep', 'choose-agent-price', 'set-price', 'list-property', 'marketing-showings', 'review-offers', 'under-contract-sell', 'closing-sell'];
    const browsePhases = ['understand-options', 'financial-education', 'market-research', 'decision-time', 'next-steps'];

    if (buyPhases.includes(phaseId)) return 'buy';
    if (sellPhases.includes(phaseId)) return 'sell';
    if (browsePhases.includes(phaseId)) return 'browse';
    return null;
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Update story placements in Qdrant (for backward compatibility)
      const response = await fetch('/api/agent-advice/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: storyId,
          placements,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update placements');
      }

      // 2. Sync to MongoDB storyMappings (source of truth for generation)
      // Only handle real-estate-timeline placements for now
      const timelinePlacements = placements['real-estate-timeline'] || [];
      const previousTimelinePlacements = currentPlacements['real-estate-timeline'] || [];

      // Get current storyMappings from MongoDB
      const mappingsRes = await fetch('/api/story-mappings');
      const mappingsData = await mappingsRes.json();
      const currentMappings = mappingsData.storyMappings || {};

      // Group placements by flow
      const addedPhases = timelinePlacements.filter(p => !previousTimelinePlacements.includes(p));
      const removedPhases = previousTimelinePlacements.filter(p => !timelinePlacements.includes(p));

      // Build updated mappings
      const updatedMappings = { ...currentMappings };

      // Add story to new phases
      for (const phaseId of addedPhases) {
        const flow = getFlowForPhase(phaseId);
        if (flow) {
          if (!updatedMappings[flow]) updatedMappings[flow] = {};
          if (!updatedMappings[flow][phaseId]) updatedMappings[flow][phaseId] = [];
          if (!updatedMappings[flow][phaseId].includes(storyId)) {
            updatedMappings[flow][phaseId].push(storyId);
          }
        }
      }

      // Remove story from removed phases
      for (const phaseId of removedPhases) {
        const flow = getFlowForPhase(phaseId);
        if (flow && updatedMappings[flow]?.[phaseId]) {
          updatedMappings[flow][phaseId] = updatedMappings[flow][phaseId].filter(
            (id: string) => id !== storyId
          );
          // Clean up empty arrays
          if (updatedMappings[flow][phaseId].length === 0) {
            delete updatedMappings[flow][phaseId];
          }
        }
      }

      // Save updated mappings to MongoDB
      await fetch('/api/story-mappings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyMappings: updatedMappings }),
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save placements');
    } finally {
      setIsSubmitting(false);
    }
  };

  const placedOfferTypes = Object.keys(placements);
  const unplacedOffers = availableOffers.filter((o) => !placedOfferTypes.includes(o.type));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      <div className="relative bg-slate-800 rounded-xl border border-slate-700 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <MapPin className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Manage Placements</h2>
              <p className="text-sm text-slate-400 truncate max-w-md">
                {storyTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
          {/* Current Placements */}
          {placedOfferTypes.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-slate-300">Current Placements</h3>
              {placedOfferTypes.map((offerType) => {
                const offer = availableOffers.find((o) => o.type === offerType);
                const phases = placements[offerType] || [];
                const phaseOptions = PHASE_OPTIONS[offerType] || [];

                return (
                  <div
                    key={offerType}
                    className="p-4 bg-slate-700/30 rounded-lg border border-slate-600"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {OFFER_ICONS[offerType] || <FileText className="w-4 h-4" />}
                        <span className="font-medium text-slate-200">
                          {offer?.label || offerType}
                        </span>
                        <span className="text-xs text-slate-500">
                          ({phases.length} phase{phases.length !== 1 ? 's' : ''})
                        </span>
                      </div>
                      <button
                        onClick={() => removeOffer(offerType)}
                        className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                        title="Remove all placements for this offer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {phaseOptions.map((phase) => {
                        const isSelected = phases.includes(phase.id);
                        return (
                          <button
                            key={phase.id}
                            onClick={() => togglePhase(offerType, phase.id)}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                              isSelected
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                                : 'bg-slate-800/50 text-slate-400 border-slate-600 hover:border-slate-500'
                            }`}
                          >
                            {phase.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 bg-slate-700/20 rounded-lg border border-dashed border-slate-600">
              <MapPin className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-slate-400">No placements yet</p>
              <p className="text-sm text-slate-500">Add this story to offers below</p>
            </div>
          )}

          {/* Add to Offers */}
          {unplacedOffers.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-slate-300">Add to Offer</h3>
              <div className="flex flex-wrap gap-2">
                {unplacedOffers.map((offer) => (
                  <button
                    key={offer.type}
                    onClick={() => {
                      // Add with first phase selected by default
                      const firstPhase = PHASE_OPTIONS[offer.type]?.[0]?.id;
                      if (firstPhase) {
                        setPlacements((prev) => ({
                          ...prev,
                          [offer.type]: [firstPhase],
                        }));
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-600 hover:border-slate-500 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    {OFFER_ICONS[offer.type] || <FileText className="w-4 h-4" />}
                    {offer.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Info */}
          <div className="p-3 bg-slate-700/30 rounded-lg text-sm text-slate-400">
            <strong className="text-slate-300">How it works:</strong> When this story is placed in
            a phase, it will be included in the AI's knowledge when generating that part of the
            offer. The AI may reference it as "I had a client in a similar situation..."
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-sm text-green-400">
              <CheckCircle2 className="w-5 h-5" />
              Placements updated!
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-700 bg-slate-800/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting || success}
            className="flex items-center gap-2 px-6 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 text-white font-medium rounded-lg transition-colors"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : success ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Saved!
              </>
            ) : (
              'Save Placements'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
