// src/components/dashboard/user/knowledgeBase/AgentKnowledgeDashboard.tsx
/**
 * Agent Knowledge Dashboard
 *
 * Allows users to add general knowledge about their business (website copy,
 * FAQs, value propositions, etc.). Content gets chunked, embedded, and stored
 * in Qdrant for contextual responses during objections, off-topic moments,
 * and contact modal hesitation.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Brain,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Trash2,
  ChevronDown,
  ChevronRight,
  Search,
  Plus,
  FileText,
  CheckCircle2,
  Copy,
  X,
  Info,
} from 'lucide-react';

interface KnowledgeEntry {
  id: string;
  title: string;
  category?: string;
  text: string;
  chunkCount: number;
  createdAt: string;
  updatedAt: string;
}

const CATEGORY_OPTIONS = [
  { id: 'about', label: 'About Us', description: 'Company background, mission, values' },
  { id: 'services', label: 'Services', description: 'What you offer, specializations' },
  { id: 'faq', label: 'FAQ', description: 'Common questions and answers' },
  { id: 'value-proposition', label: 'Value Props', description: 'Why choose you, benefits' },
  { id: 'testimonials', label: 'Testimonials', description: 'Client feedback, social proof' },
  { id: 'process', label: 'Process', description: 'How you work, what to expect' },
  { id: 'general', label: 'General', description: 'Other relevant information' },
];

const CATEGORY_COLORS: Record<string, string> = {
  about: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  services: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  faq: 'bg-green-500/20 text-green-300 border-green-500/30',
  'value-proposition': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  testimonials: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  process: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  general: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
};

export default function AgentKnowledgeDashboard() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionResult, setActionResult] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formText, setFormText] = useState('');
  const [formCategory, setFormCategory] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchEntries = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/agent-knowledge');
      if (!response.ok) {
        throw new Error('Failed to fetch knowledge entries');
      }

      const data = await response.json();
      setEntries(data.entries || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load knowledge entries');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const toggleExpanded = (id: string) => {
    setExpandedEntries((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim() || !formText.trim()) {
      setActionResult({ message: 'Title and text are required', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    setActionResult(null);

    try {
      const response = await fetch('/api/agent-knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle.trim(),
          text: formText.trim(),
          category: formCategory,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add knowledge');
      }

      setActionResult({ message: data.message, type: 'success' });
      setShowAddModal(false);
      setFormTitle('');
      setFormText('');
      setFormCategory('general');
      fetchEntries();

      setTimeout(() => setActionResult(null), 5000);
    } catch (err) {
      setActionResult({
        message: err instanceof Error ? err.message : 'Failed to add knowledge',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const response = await fetch('/api/agent-knowledge', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId: id }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete knowledge');
      }

      setActionResult({ message: 'Knowledge deleted successfully', type: 'success' });
      fetchEntries();
      setTimeout(() => setActionResult(null), 5000);
    } catch (err) {
      setActionResult({
        message: err instanceof Error ? err.message : 'Failed to delete knowledge',
        type: 'error',
      });
    } finally {
      setIsDeleting(false);
      setDeleteConfirm(null);
    }
  };

  // Estimate chunk count for preview
  const estimateChunks = (text: string): number => {
    const length = text.trim().length;
    if (length <= 600) return 1;
    return Math.ceil(length / 500); // Rough estimate accounting for overlap
  };

  // Filter entries
  const filteredEntries = entries.filter((entry) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      entry.title.toLowerCase().includes(query) ||
      entry.text.toLowerCase().includes(query) ||
      entry.category?.toLowerCase().includes(query)
    );
  });

  // Group entries by category for stats
  const categoryStats = entries.reduce((acc, entry) => {
    const cat = entry.category || 'general';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Info Banner */}
      <div className="mb-8 bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-cyan-500/10 rounded-xl border border-cyan-500/30 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white mb-1">Teach Your Bot About Your Business</h2>
            <p className="text-slate-300 text-sm mb-3">
              Add website copy, FAQs, value propositions, and other knowledge. Your bot will use this
              to provide <span className="text-cyan-300 font-medium">helpful, contextual responses</span>{' '}
              when users have questions, objections, or go off-topic.
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1">
                <Info className="w-4 h-4" />
                Text is automatically chunked for better retrieval
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/20 rounded-lg">
            <Brain className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Agent Knowledge</h1>
            <p className="text-slate-400 mt-1">
              General business information for contextual responses
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchEntries}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Knowledge
          </button>
        </div>
      </div>

      {/* Action Result Message */}
      {actionResult && (
        <div
          className={`mb-6 p-4 rounded-lg border ${
            actionResult.type === 'success'
              ? 'bg-green-500/10 border-green-500/30 text-green-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionResult.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
            <span>{actionResult.message}</span>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        <div className="flex items-center gap-6">
          <div>
            <div className="text-2xl font-bold text-cyan-400">{entries.length}</div>
            <div className="text-sm text-slate-400">Total Entries</div>
          </div>
          <div className="h-8 w-px bg-slate-700" />
          <div className="flex items-center gap-2 flex-wrap">
            {Object.entries(categoryStats).map(([cat, count]) => (
              <span
                key={cat}
                className={`text-xs px-2 py-1 rounded border ${CATEGORY_COLORS[cat] || CATEGORY_COLORS.general}`}
              >
                {CATEGORY_OPTIONS.find((c) => c.id === cat)?.label || cat}: {count}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search knowledge entries..."
          className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 mb-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && entries.length === 0 && (
        <div className="text-center py-16">
          <Brain className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-300 mb-2">No knowledge added yet</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6">
            Add website copy, FAQs, or other information to help your bot
            provide better, more contextual responses.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors"
          >
            Add Your First Knowledge
          </button>
        </div>
      )}

      {/* No Results */}
      {!isLoading && !error && entries.length > 0 && filteredEntries.length === 0 && (
        <div className="text-center py-12 bg-slate-800/30 rounded-lg border border-slate-700">
          <Search className="w-8 h-8 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-400">No entries match your search</p>
        </div>
      )}

      {/* Entries List */}
      {!isLoading && !error && filteredEntries.length > 0 && (
        <div className="space-y-4">
          {filteredEntries.map((entry) => {
            const isExpanded = expandedEntries.has(entry.id);
            const categoryColor = CATEGORY_COLORS[entry.category || 'general'] || CATEGORY_COLORS.general;

            return (
              <div
                key={entry.id}
                className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden"
              >
                {/* Entry Header */}
                <div className="flex items-center gap-3 p-4">
                  <button
                    onClick={() => toggleExpanded(entry.id)}
                    className="flex-shrink-0"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    )}
                  </button>

                  <FileText className="w-5 h-5 text-cyan-400 flex-shrink-0" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-100 font-medium truncate">{entry.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded border ${categoryColor}`}>
                        {CATEGORY_OPTIONS.find((c) => c.id === entry.category)?.label || entry.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span>{entry.chunkCount} chunk{entry.chunkCount !== 1 ? 's' : ''}</span>
                      <span>{entry.text.length.toLocaleString()} chars</span>
                      <span>Added {new Date(entry.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => setDeleteConfirm({ id: entry.id, title: entry.title })}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-slate-700/50">
                    <div className="pt-4">
                      <div className="bg-slate-900/50 rounded-lg p-4 text-sm text-slate-300 whitespace-pre-wrap max-h-96 overflow-y-auto">
                        {entry.text}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-slate-800 rounded-xl border border-slate-700 shadow-2xl w-full max-w-2xl p-6 mx-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-semibold text-slate-100 mb-4">Add Agent Knowledge</h3>

            <form onSubmit={handleAdd} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Title <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g., About Our Services, FAQ, Why Choose Us"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                  disabled={isSubmitting}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                  disabled={isSubmitting}
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label} - {cat.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Text */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Knowledge Content <span className="text-cyan-400">*</span>
                </label>
                <textarea
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  placeholder="Paste your website copy, FAQ content, value propositions, or any other relevant information..."
                  rows={10}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 resize-y"
                  disabled={isSubmitting}
                />
                <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                  <span>
                    {formText.length.toLocaleString()} / 50,000 characters
                  </span>
                  {formText.length > 0 && (
                    <span className="text-cyan-400">
                      ~{estimateChunks(formText)} chunk{estimateChunks(formText) !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-slate-200"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formTitle.trim() || !formText.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? 'Adding...' : 'Add Knowledge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-slate-800 rounded-xl border border-slate-700 shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-2">Delete Knowledge?</h3>
            <p className="text-slate-400 mb-4">
              Are you sure you want to delete "{deleteConfirm.title}"? This will remove it from
              your bot's knowledge base.
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
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
