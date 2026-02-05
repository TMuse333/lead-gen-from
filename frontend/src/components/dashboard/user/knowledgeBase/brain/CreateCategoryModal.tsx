'use client';

import { useState } from 'react';
import { X, Loader2, FolderPlus } from 'lucide-react';

interface CustomCategoryInfo {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  color?: string;
  parentId?: string | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingCategories: CustomCategoryInfo[];
  builtInCategories: Array<{ id: string; label: string }>;
}

// Popular emoji options for categories
const EMOJI_OPTIONS = [
  '📁', '🏠', '💰', '📊', '🎯', '💼', '📝', '🔧',
  '⭐', '💡', '🚀', '📈', '🤝', '💎', '🎓', '📍',
  '🏆', '💬', '📞', '✅', '🔑', '📋', '🎁', '⚡',
];

// Tailwind color options
const COLOR_OPTIONS = [
  { id: 'slate', label: 'Slate', bg: 'bg-slate-500' },
  { id: 'red', label: 'Red', bg: 'bg-red-500' },
  { id: 'orange', label: 'Orange', bg: 'bg-orange-500' },
  { id: 'amber', label: 'Amber', bg: 'bg-amber-500' },
  { id: 'yellow', label: 'Yellow', bg: 'bg-yellow-500' },
  { id: 'lime', label: 'Lime', bg: 'bg-lime-500' },
  { id: 'green', label: 'Green', bg: 'bg-green-500' },
  { id: 'emerald', label: 'Emerald', bg: 'bg-emerald-500' },
  { id: 'teal', label: 'Teal', bg: 'bg-teal-500' },
  { id: 'cyan', label: 'Cyan', bg: 'bg-cyan-500' },
  { id: 'sky', label: 'Sky', bg: 'bg-sky-500' },
  { id: 'blue', label: 'Blue', bg: 'bg-blue-500' },
  { id: 'indigo', label: 'Indigo', bg: 'bg-indigo-500' },
  { id: 'violet', label: 'Violet', bg: 'bg-violet-500' },
  { id: 'purple', label: 'Purple', bg: 'bg-purple-500' },
  { id: 'fuchsia', label: 'Fuchsia', bg: 'bg-fuchsia-500' },
  { id: 'pink', label: 'Pink', bg: 'bg-pink-500' },
  { id: 'rose', label: 'Rose', bg: 'bg-rose-500' },
];

export default function CreateCategoryModal({
  isOpen,
  onClose,
  onSuccess,
  existingCategories,
  builtInCategories,
}: Props) {
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('📁');
  const [color, setColor] = useState('slate');
  const [parentId, setParentId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/knowledge-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: label.trim(),
          description: description.trim() || undefined,
          icon,
          color,
          parentId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create category');
      }

      // Reset form
      setLabel('');
      setDescription('');
      setIcon('📁');
      setColor('slate');
      setParentId(null);

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Combine built-in agent knowledge categories with custom categories for parent options
  const parentOptions = [
    ...builtInCategories.filter(c => !['stories', 'tips'].includes(c.id)),
    ...existingCategories.filter(c => !c.parentId), // Only root custom categories
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-slate-800 rounded-xl border border-slate-700 shadow-2xl w-full max-w-lg p-6 mx-4 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-cyan-500/20 rounded-lg">
            <FolderPlus className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Create Category</h3>
            <p className="text-sm text-slate-400">Add a custom category for your knowledge</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Label */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Category Name <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Buying Process, Market Updates"
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this category"
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
              disabled={isSubmitting}
            />
          </div>

          {/* Parent Category (for subcategories) */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Parent Category
              <span className="text-slate-500 font-normal ml-1">(optional, for subcategories)</span>
            </label>
            <select
              value={parentId || ''}
              onChange={(e) => setParentId(e.target.value || null)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
              disabled={isSubmitting}
            >
              <option value="">None (top-level category)</option>
              <optgroup label="Built-in Categories">
                {parentOptions.filter(c => !existingCategories.some(ec => ec.id === c.id)).map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </optgroup>
              {existingCategories.filter(c => !c.parentId).length > 0 && (
                <optgroup label="Custom Categories">
                  {existingCategories.filter(c => !c.parentId).map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          {/* Icon */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`
                    w-10 h-10 text-xl rounded-lg border transition-all
                    ${icon === emoji
                      ? 'bg-cyan-500/20 border-cyan-500/50 ring-2 ring-cyan-400/50'
                      : 'bg-slate-900 border-slate-700 hover:border-slate-600'
                    }
                  `}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.id)}
                  className={`
                    w-8 h-8 rounded-full transition-all
                    ${c.bg}
                    ${color === c.id
                      ? 'ring-2 ring-offset-2 ring-offset-slate-800 ring-white scale-110'
                      : 'hover:scale-110'
                    }
                  `}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="pt-2">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Preview
            </label>
            <div
              className={`
                inline-flex items-center gap-2 px-3 py-2 rounded-lg border
                bg-${color}-500/10 border-${color}-500/30
              `}
              style={{
                backgroundColor: `var(--color-${color}-500, #64748b)20`,
                borderColor: `var(--color-${color}-500, #64748b)50`,
              }}
            >
              <span className="text-lg">{icon}</span>
              <span className="font-medium text-white">{label || 'Category Name'}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-slate-200"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !label.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? 'Creating...' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
