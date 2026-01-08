// src/components/dashboard/user/knowledgeBase/PhaseKnowledgeUploader.tsx
/**
 * Phase Knowledge Uploader Modal
 *
 * Modal for uploading or editing knowledge with pre-filled phase context.
 * Auto-sets placements and suggests tags based on the selected phase.
 */

'use client';

import { useState, useEffect } from 'react';
import { X, Tag, MapPin, Lightbulb, Loader2, CheckCircle2, BookOpen, MessageSquare } from 'lucide-react';
import type { OfferType, Intent } from '@/lib/offers/unified';
import type { KnowledgeKind } from '@/types/advice.types';

interface EditingItem {
  id: string;
  title: string;
  advice: string;
  tags: string[];
  kind?: KnowledgeKind;
}

interface PhaseKnowledgeUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  offerType: OfferType;
  intent: Intent;
  phaseId: string;
  phaseName: string;
  suggestedTags: string[];
  exampleContent?: string;
  onSuccess?: () => void;
  /** If provided, modal is in edit mode */
  editingItem?: EditingItem | null;
}

export default function PhaseKnowledgeUploader({
  isOpen,
  onClose,
  offerType,
  intent,
  phaseId,
  phaseName,
  suggestedTags,
  exampleContent,
  onSuccess,
  editingItem,
}: PhaseKnowledgeUploaderProps) {
  const [title, setTitle] = useState('');
  const [advice, setAdvice] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Story mode state
  const [kind, setKind] = useState<KnowledgeKind>('tip');
  const [clientSituation, setClientSituation] = useState('');
  const [whatYouDid, setWhatYouDid] = useState('');
  const [outcome, setOutcome] = useState('');

  const isEditMode = !!editingItem;
  const isStoryMode = kind === 'story';

  // Initialize form when modal opens or editing item changes
  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        setTitle(editingItem.title);
        setAdvice(editingItem.advice);
        setSelectedTags(editingItem.tags);
        setKind(editingItem.kind || 'tip');
      } else {
        setTitle('');
        setAdvice('');
        setSelectedTags(suggestedTags.slice(0, 2));
        setKind('tip');
      }
      // Reset story fields
      setClientSituation('');
      setWhatYouDid('');
      setOutcome('');
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, editingItem, suggestedTags]);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags((prev) => [...prev, customTag.trim()]);
      setCustomTag('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    // Build the advice content based on mode
    let finalAdvice = '';
    if (isStoryMode) {
      if (!clientSituation.trim() || !whatYouDid.trim() || !outcome.trim()) {
        setError('All story fields are required');
        return;
      }
      // Format story as structured advice
      finalAdvice = `[CLIENT STORY]\nSituation: ${clientSituation.trim()}\nWhat I did: ${whatYouDid.trim()}\nOutcome: ${outcome.trim()}`;
    } else {
      if (!advice.trim()) {
        setError('Advice content is required');
        return;
      }
      finalAdvice = advice.trim();
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && editingItem) {
        // Update existing item
        const response = await fetch('/api/agent-advice/update', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingItem.id,
            title: title.trim(),
            advice: finalAdvice,
            tags: selectedTags,
            kind,
            flow: [intent],
            placements: {
              [offerType]: [phaseId],
            },
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to update knowledge');
        }
      } else {
        // Add new item
        const response = await fetch('/api/agent-advice/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            advice: finalAdvice,
            tags: selectedTags,
            kind,
            flow: [intent],
            placements: {
              [offerType]: [phaseId],
            },
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to save knowledge');
        }
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save knowledge');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-slate-800 rounded-xl border border-slate-700 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">
              {isEditMode ? 'Edit Knowledge' : `Add Knowledge for ${phaseName}`}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-slate-400">
                {isEditMode ? `Editing: ${editingItem?.title}` : `Will appear in: ${offerType} → ${intent} → ${phaseId}`}
              </span>
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
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
          {/* Kind Toggle - Tip vs Story */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setKind('tip')}
              className={`
                flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all
                ${kind === 'tip'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                  : 'bg-slate-700/50 text-slate-400 border border-slate-600 hover:border-slate-500'
                }
              `}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Tip / Advice</span>
            </button>
            <button
              type="button"
              onClick={() => setKind('story')}
              className={`
                flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all
                ${kind === 'story'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                  : 'bg-slate-700/50 text-slate-400 border border-slate-600 hover:border-slate-500'
                }
              `}
            >
              <BookOpen className="w-4 h-4" />
              <span>Client Story</span>
            </button>
          </div>

          {/* Example hint */}
          {exampleContent && !isStoryMode && (
            <div className="flex items-start gap-3 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
              <Lightbulb className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-cyan-300 mb-1">Example</div>
                <div className="text-sm text-slate-300 italic">"{exampleContent}"</div>
              </div>
            </div>
          )}

          {/* Story mode hint */}
          {isStoryMode && (
            <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <BookOpen className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-amber-300 mb-1">Tell a Client Story</div>
                <div className="text-sm text-slate-300">
                  Share a real experience: "I had a client in a similar situation..."
                </div>
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Pre-Approval Tips for Austin Market"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
            />
          </div>

          {/* Advice Content - Different UI for tip vs story */}
          {!isStoryMode ? (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Your Knowledge <span className="text-red-400">*</span>
              </label>
              <textarea
                value={advice}
                onChange={(e) => setAdvice(e.target.value)}
                placeholder="Share your expertise for this phase of the journey..."
                rows={5}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 resize-none"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Client Situation */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  What was their situation? <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={clientSituation}
                  onChange={(e) => setClientSituation(e.target.value)}
                  placeholder="e.g., First-time buyer, relocating for work, tight timeline, competitive market..."
                  rows={2}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 resize-none"
                />
              </div>

              {/* What You Did */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  What did you do to help? <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={whatYouDid}
                  onChange={(e) => setWhatYouDid(e.target.value)}
                  placeholder="e.g., I connected them with a bridge loan lender, helped them write a personal letter to the seller..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 resize-none"
                />
              </div>

              {/* Outcome */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  How did it turn out? <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  placeholder="e.g., They closed on the home 2 weeks before their lease ended, seller chose their offer over a higher one..."
                  rows={2}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 resize-none"
                />
              </div>
            </div>
          )}

          {/* Tags */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4 text-slate-400" />
              <label className="text-sm font-medium text-slate-300">Tags</label>
            </div>

            {/* Suggested tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {suggestedTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`
                    text-sm px-3 py-1.5 rounded-full border transition-all
                    ${
                      selectedTags.includes(tag)
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                        : 'bg-slate-700/50 text-slate-400 border-slate-600 hover:border-slate-500'
                    }
                  `}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Custom tag input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
                placeholder="Add custom tag..."
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
              <button
                type="button"
                onClick={addCustomTag}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
              >
                Add
              </button>
            </div>

            {/* Selected tags display */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 text-xs px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className="hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-sm text-green-400">
              <CheckCircle2 className="w-5 h-5" />
              Knowledge saved successfully!
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-700 bg-slate-800/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || success}
            className="flex items-center gap-2 px-6 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isEditMode ? 'Updating...' : 'Saving...'}
              </>
            ) : success ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                {isEditMode ? 'Updated!' : 'Saved!'}
              </>
            ) : (
              isEditMode ? 'Update Knowledge' : 'Save Knowledge'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
