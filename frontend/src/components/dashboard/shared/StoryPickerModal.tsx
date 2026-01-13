// src/components/dashboard/shared/StoryPickerModal.tsx
/**
 * Modal for selecting stories from Qdrant or entering custom inline experience
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Search,
  BookOpen,
  Pencil,
  Check,
  Loader2,
  Tag,
  AlertCircle,
} from 'lucide-react';
import type { AvailableStory, TimelineFlow } from '@/types/timelineBuilder.types';

interface StoryPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStory: (storyId: string, storyTitle: string) => void;
  onSaveInline: (text: string) => void;
  flow?: TimelineFlow;
  currentStoryId?: string;
  currentInlineText?: string;
  title?: string;
}

export function StoryPickerModal({
  isOpen,
  onClose,
  onSelectStory,
  onSaveInline,
  flow,
  currentStoryId,
  currentInlineText,
  title = 'Link Story or Experience',
}: StoryPickerModalProps) {
  const [mode, setMode] = useState<'select' | 'inline'>(currentInlineText ? 'inline' : 'select');
  const [search, setSearch] = useState('');
  const [stories, setStories] = useState<AvailableStory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inlineText, setInlineText] = useState(currentInlineText || '');
  const [selectedStoryId, setSelectedStoryId] = useState<string | undefined>(currentStoryId);

  // Fetch available stories
  const fetchStories = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (flow) params.set('flow', flow);
      if (search) params.set('search', search);
      params.set('kind', 'story'); // Only fetch stories, not tips
      params.set('limit', '50');

      const response = await fetch(`/api/stories/available?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch stories');
      }

      setStories(data.stories || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stories');
      setStories([]);
    } finally {
      setIsLoading(false);
    }
  }, [flow, search]);

  // Fetch stories when modal opens or search changes
  useEffect(() => {
    if (isOpen && mode === 'select') {
      const debounce = setTimeout(() => {
        fetchStories();
      }, search ? 300 : 0);
      return () => clearTimeout(debounce);
    }
  }, [isOpen, mode, fetchStories, search]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(currentInlineText ? 'inline' : 'select');
      setInlineText(currentInlineText || '');
      setSelectedStoryId(currentStoryId);
      setSearch('');
      setError(null);
    }
  }, [isOpen, currentInlineText, currentStoryId]);

  const handleSelectStory = (story: AvailableStory) => {
    setSelectedStoryId(story.id);
    onSelectStory(story.id, story.title);
    onClose();
  };

  const handleSaveInline = () => {
    if (inlineText.trim()) {
      onSaveInline(inlineText.trim());
      onClose();
    }
  };

  const handleClear = () => {
    setSelectedStoryId(undefined);
    setInlineText('');
    onSelectStory('', '');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Tabs */}
          <div className="flex border-b border-slate-700">
            <button
              onClick={() => setMode('select')}
              className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-colors ${
                mode === 'select'
                  ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-800/50'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Select from Stories
            </button>
            <button
              onClick={() => setMode('inline')}
              className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-colors ${
                mode === 'inline'
                  ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-800/50'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              <Pencil className="w-4 h-4" />
              Write Custom
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {mode === 'select' ? (
              <div className="flex flex-col h-full">
                {/* Search */}
                <div className="p-4 border-b border-slate-700">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search stories..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                    />
                  </div>
                </div>

                {/* Story List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                    </div>
                  ) : error ? (
                    <div className="flex items-center justify-center py-12 text-red-400">
                      <AlertCircle className="w-5 h-5 mr-2" />
                      {error}
                    </div>
                  ) : stories.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-50" />
                      <p>No stories found</p>
                      <p className="text-sm mt-1">Try a different search or add stories to your knowledge base</p>
                    </div>
                  ) : (
                    stories.map((story) => {
                      // Check if story has structured fields
                      const hasStructuredFields = !!(story.situation || story.action || story.outcome);

                      return (
                        <button
                          key={story.id}
                          onClick={() => handleSelectStory(story)}
                          className={`w-full text-left p-4 rounded-lg border transition-all ${
                            selectedStoryId === story.id
                              ? 'bg-cyan-500/10 border-cyan-500 ring-1 ring-cyan-500'
                              : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-slate-100 truncate">{story.title}</h4>
                                {story.kind && (
                                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                                    story.kind === 'story'
                                      ? 'bg-amber-500/20 text-amber-400'
                                      : 'bg-purple-500/20 text-purple-400'
                                  }`}>
                                    {story.kind === 'story' ? '📖 Story' : '💡 Tip'}
                                  </span>
                                )}
                              </div>
                              {/* Show structured content if available */}
                              {hasStructuredFields ? (
                                <div className="text-sm text-slate-400 mt-1 space-y-1">
                                  {story.situation && (
                                    <p className="line-clamp-1">
                                      <span className="text-amber-400 text-xs">Situation:</span> {story.situation}
                                    </p>
                                  )}
                                  {story.outcome && (
                                    <p className="line-clamp-1">
                                      <span className="text-green-400 text-xs">Outcome:</span> {story.outcome}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <p className="text-sm text-slate-400 mt-1 line-clamp-2">{story.advice}</p>
                              )}
                              {story.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {story.tags.slice(0, 4).map((tag) => (
                                    <span
                                      key={tag}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-slate-700 text-slate-300 rounded"
                                    >
                                      <Tag className="w-3 h-3" />
                                      {tag}
                                    </span>
                                  ))}
                                  {story.tags.length > 4 && (
                                    <span className="text-xs text-slate-500">+{story.tags.length - 4} more</span>
                                  )}
                                </div>
                              )}
                            </div>
                            {selectedStoryId === story.id && (
                              <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 ml-2" />
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Write your personal experience or advice
                </label>
                <textarea
                  value={inlineText}
                  onChange={(e) => setInlineText(e.target.value)}
                  placeholder="Share a relevant story or insight from your experience..."
                  rows={8}
                  className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 resize-none"
                />
                <p className="text-xs text-slate-500 mt-2">
                  This will be shown directly to leads without needing to be stored in your knowledge base.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-slate-700">
            <button
              onClick={handleClear}
              className="px-4 py-2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              Clear Link
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              {mode === 'inline' && (
                <button
                  onClick={handleSaveInline}
                  disabled={!inlineText.trim()}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Save Experience
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default StoryPickerModal;
