// src/components/dashboard/user/knowledgeBase/StoryUploader.tsx
/**
 * Story Uploader Modal
 *
 * Simple modal for uploading stories without requiring offer/phase assignment.
 * Stories can be assigned to offers later.
 */

'use client';

import { useState } from 'react';
import { X, BookOpen, Loader2, CheckCircle2, Tag } from 'lucide-react';

interface StoryUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editingStory?: {
    id: string;
    title: string;
    // New structured fields
    situation?: string;
    action?: string;
    outcome?: string;
    // Legacy field
    advice?: string;
    tags: string[];
    flows?: string[];
  } | null;
}

export default function StoryUploader({
  isOpen,
  onClose,
  onSuccess,
  editingStory,
}: StoryUploaderProps) {
  // Helper to get initial values - prefers structured fields, falls back to parsing legacy
  const getInitialValues = () => {
    if (!editingStory) {
      return { situation: '', action: '', outcome: '' };
    }

    // If structured fields exist, use them
    if (editingStory.situation || editingStory.action || editingStory.outcome) {
      return {
        situation: editingStory.situation || '',
        action: editingStory.action || '',
        outcome: editingStory.outcome || '',
      };
    }

    // Fall back to parsing legacy advice field
    if (editingStory.advice) {
      let situation = '';
      let action = '';
      let outcome = '';
      const lines = editingStory.advice.split('\n');
      for (const line of lines) {
        if (line.startsWith('Situation:')) {
          situation = line.replace('Situation:', '').trim();
        } else if (line.startsWith('What I did:')) {
          action = line.replace('What I did:', '').trim();
        } else if (line.startsWith('Outcome:')) {
          outcome = line.replace('Outcome:', '').trim();
        }
      }
      return { situation, action, outcome };
    }

    return { situation: '', action: '', outcome: '' };
  };

  const initialValues = getInitialValues();

  const [title, setTitle] = useState(editingStory?.title || '');
  const [clientSituation, setClientSituation] = useState(initialValues.situation);
  const [whatYouDid, setWhatYouDid] = useState(initialValues.action);
  const [outcome, setOutcome] = useState(initialValues.outcome);
  const [tags, setTags] = useState<string[]>(editingStory?.tags || []);
  const [customTag, setCustomTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isEditMode = !!editingStory;

  if (!isOpen) return null;

  const addTag = () => {
    if (customTag.trim() && !tags.includes(customTag.trim())) {
      setTags((prev) => [...prev, customTag.trim()]);
      setCustomTag('');
    }
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!clientSituation.trim() || !whatYouDid.trim() || !outcome.trim()) {
      setError('All story fields are required');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && editingStory) {
        // Use new structured API for updates
        const response = await fetch('/api/stories/update', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingStory.id,
            title: title.trim(),
            situation: clientSituation.trim(),
            action: whatYouDid.trim(),
            outcome: outcome.trim(),
            tags,
            // Preserve existing placements and flows
            placements: editingStory.flows ? undefined : {},
            flows: editingStory.flows || [],
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to update story');
        }
      } else {
        // Use new structured API for creation
        const response = await fetch('/api/stories/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            situation: clientSituation.trim(),
            action: whatYouDid.trim(),
            outcome: outcome.trim(),
            tags,
            placements: {},
            flows: [],
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to save story');
        }
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
        // Reset form
        setTitle('');
        setClientSituation('');
        setWhatYouDid('');
        setOutcome('');
        setTags([]);
        setSuccess(false);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save story');
    } finally {
      setIsSubmitting(false);
    }
  };

  const suggestedTags = [
    'first-time-buyer',
    'seller',
    'competitive-market',
    'negotiation',
    'financing',
    'relocation',
    'investment',
    'luxury',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      <div className="relative bg-slate-800 rounded-xl border border-slate-700 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <BookOpen className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100">
                {isEditMode ? 'Edit Story' : 'Add Client Story'}
              </h2>
              <p className="text-sm text-slate-400">
                Share a real experience to build trust with clients
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Story Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Helping a First-Time Buyer Win in a Competitive Market"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            />
          </div>

          {/* Story Fields */}
          <div className="space-y-4 p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                What was their situation? <span className="text-red-400">*</span>
              </label>
              <textarea
                value={clientSituation}
                onChange={(e) => setClientSituation(e.target.value)}
                placeholder="e.g., First-time buyer, relocating for work, needed to close within 45 days, limited budget of $350k in a hot market..."
                rows={3}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                What did you do to help? <span className="text-red-400">*</span>
              </label>
              <textarea
                value={whatYouDid}
                onChange={(e) => setWhatYouDid(e.target.value)}
                placeholder="e.g., I connected them with a local lender who could close fast, helped them write a personal letter to the seller, suggested waiving minor contingencies..."
                rows={3}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                How did it turn out? <span className="text-red-400">*</span>
              </label>
              <textarea
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                placeholder="e.g., They got the house at $5k under asking! The seller chose them over two higher offers because of the personal letter. They closed in 38 days..."
                rows={3}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 resize-none"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4 text-slate-400" />
              <label className="text-sm font-medium text-slate-300">
                Tags <span className="text-slate-500">(helps match to similar clients)</span>
              </label>
            </div>

            {/* Suggested tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {suggestedTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    if (tags.includes(tag)) {
                      removeTag(tag);
                    } else {
                      setTags((prev) => [...prev, tag]);
                    }
                  }}
                  className={`text-sm px-3 py-1.5 rounded-full border transition-all ${
                    tags.includes(tag)
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                      : 'bg-slate-700/50 text-slate-400 border-slate-600 hover:border-slate-500'
                  }`}
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
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add custom tag..."
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm"
              >
                Add
              </button>
            </div>

            {/* Selected tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 text-xs px-2 py-1 bg-amber-500/20 text-amber-300 rounded"
                  >
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Info box */}
          <div className="p-3 bg-slate-700/30 rounded-lg text-sm text-slate-400">
            <strong className="text-slate-300">Tip:</strong> After saving, you can assign this story
            to specific offers/phases from the Stories tab.
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
              Story saved successfully!
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
            className="flex items-center gap-2 px-6 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-600 text-white font-medium rounded-lg transition-colors"
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
              isEditMode ? 'Update Story' : 'Save Story'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
