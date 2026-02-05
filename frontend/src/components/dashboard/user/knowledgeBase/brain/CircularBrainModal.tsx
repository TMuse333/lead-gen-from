'use client';

import { useMemo, useState, useCallback } from 'react';
import {
  X,
  Brain,
  ArrowLeft,
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  FolderPlus,
  Trash2,
} from 'lucide-react';
import type { KnowledgeEntry, CategoryData, CustomCategoryInfo } from './KnowledgeBrainGraph';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  businessName: string;
  categories: Record<string, CategoryData>;
  totalCount: number;
  onCategorySelect: (categoryId: string) => void;
  selectedCategory: string | null;
  customCategories?: CustomCategoryInfo[];
  onRefresh?: () => void;
}

// Color mapping for built-in categories
const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  stories: { bg: 'rgba(245, 158, 11, 0.2)', border: 'rgba(245, 158, 11, 0.6)', text: '#fbbf24' },
  tips: { bg: 'rgba(234, 179, 8, 0.2)', border: 'rgba(234, 179, 8, 0.6)', text: '#facc15' },
  about: { bg: 'rgba(59, 130, 246, 0.2)', border: 'rgba(59, 130, 246, 0.6)', text: '#60a5fa' },
  services: { bg: 'rgba(168, 85, 247, 0.2)', border: 'rgba(168, 85, 247, 0.6)', text: '#a78bfa' },
  process: { bg: 'rgba(249, 115, 22, 0.2)', border: 'rgba(249, 115, 22, 0.6)', text: '#fb923c' },
  'value-proposition': { bg: 'rgba(16, 185, 129, 0.2)', border: 'rgba(16, 185, 129, 0.6)', text: '#34d399' },
  testimonials: { bg: 'rgba(236, 72, 153, 0.2)', border: 'rgba(236, 72, 153, 0.6)', text: '#f472b6' },
  faq: { bg: 'rgba(6, 182, 212, 0.2)', border: 'rgba(6, 182, 212, 0.6)', text: '#22d3ee' },
  general: { bg: 'rgba(148, 163, 184, 0.2)', border: 'rgba(148, 163, 184, 0.6)', text: '#94a3b8' },
};

// Tailwind color to RGB mapping for custom categories
const TAILWIND_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  slate: { bg: 'rgba(148, 163, 184, 0.2)', border: 'rgba(148, 163, 184, 0.6)', text: '#94a3b8' },
  red: { bg: 'rgba(239, 68, 68, 0.2)', border: 'rgba(239, 68, 68, 0.6)', text: '#f87171' },
  orange: { bg: 'rgba(249, 115, 22, 0.2)', border: 'rgba(249, 115, 22, 0.6)', text: '#fb923c' },
  amber: { bg: 'rgba(245, 158, 11, 0.2)', border: 'rgba(245, 158, 11, 0.6)', text: '#fbbf24' },
  yellow: { bg: 'rgba(234, 179, 8, 0.2)', border: 'rgba(234, 179, 8, 0.6)', text: '#facc15' },
  lime: { bg: 'rgba(132, 204, 22, 0.2)', border: 'rgba(132, 204, 22, 0.6)', text: '#a3e635' },
  green: { bg: 'rgba(34, 197, 94, 0.2)', border: 'rgba(34, 197, 94, 0.6)', text: '#4ade80' },
  emerald: { bg: 'rgba(16, 185, 129, 0.2)', border: 'rgba(16, 185, 129, 0.6)', text: '#34d399' },
  teal: { bg: 'rgba(20, 184, 166, 0.2)', border: 'rgba(20, 184, 166, 0.6)', text: '#2dd4bf' },
  cyan: { bg: 'rgba(6, 182, 212, 0.2)', border: 'rgba(6, 182, 212, 0.6)', text: '#22d3ee' },
  sky: { bg: 'rgba(14, 165, 233, 0.2)', border: 'rgba(14, 165, 233, 0.6)', text: '#38bdf8' },
  blue: { bg: 'rgba(59, 130, 246, 0.2)', border: 'rgba(59, 130, 246, 0.6)', text: '#60a5fa' },
  indigo: { bg: 'rgba(99, 102, 241, 0.2)', border: 'rgba(99, 102, 241, 0.6)', text: '#818cf8' },
  violet: { bg: 'rgba(139, 92, 246, 0.2)', border: 'rgba(139, 92, 246, 0.6)', text: '#a78bfa' },
  purple: { bg: 'rgba(168, 85, 247, 0.2)', border: 'rgba(168, 85, 247, 0.6)', text: '#c084fc' },
  fuchsia: { bg: 'rgba(217, 70, 239, 0.2)', border: 'rgba(217, 70, 239, 0.6)', text: '#e879f9' },
  pink: { bg: 'rgba(236, 72, 153, 0.2)', border: 'rgba(236, 72, 153, 0.6)', text: '#f472b6' },
  rose: { bg: 'rgba(244, 63, 94, 0.2)', border: 'rgba(244, 63, 94, 0.6)', text: '#fb7185' },
};

// Emoji options for subcategory creation
const EMOJI_OPTIONS = ['📁', '🏠', '💰', '📊', '🎯', '💼', '📝', '🔧', '⭐', '💡', '🚀', '📈'];
const COLOR_OPTIONS = ['slate', 'blue', 'purple', 'pink', 'orange', 'emerald', 'cyan', 'amber'];

function getColorForCategory(cat: CategoryData): { bg: string; border: string; text: string } {
  if (cat.isCustom && cat.color && TAILWIND_COLORS[cat.color]) {
    return TAILWIND_COLORS[cat.color];
  }
  return CATEGORY_COLORS[cat.id] || TAILWIND_COLORS.slate;
}

export default function CircularBrainModal({
  isOpen,
  onClose,
  businessName,
  categories,
  totalCount,
  onCategorySelect,
  selectedCategory,
  customCategories = [],
  onRefresh,
}: Props) {
  // Drill-down state
  const [zoomedCategory, setZoomedCategory] = useState<string | null>(null);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomDirection, setZoomDirection] = useState<'in' | 'out'>('in');

  // Search state for drilled-down view
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Subcategory creation state
  const [showSubcategoryForm, setShowSubcategoryForm] = useState(false);
  const [subLabel, setSubLabel] = useState('');
  const [subDescription, setSubDescription] = useState('');
  const [subIcon, setSubIcon] = useState('📁');
  const [subColor, setSubColor] = useState('slate');
  const [isCreating, setIsCreating] = useState(false);

  // Filter to only root-level categories for the main circle
  const rootCategories = useMemo(() => {
    return Object.values(categories).filter(cat => !cat.parentId && cat.count > 0);
  }, [categories]);

  // Calculate positions for circular layout
  const categoryPositions = useMemo(() => {
    const count = rootCategories.length;
    const radius = 180;
    const startAngle = -90;

    return rootCategories.map((cat, index) => {
      const angle = startAngle + (index * 360) / count;
      const radian = (angle * Math.PI) / 180;
      const x = Math.cos(radian) * radius;
      const y = Math.sin(radian) * radius;

      const maxCount = Math.max(...rootCategories.map(c => c.count), 1);
      const size = 50 + (cat.count / maxCount) * 40;

      return { ...cat, x, y, size, angle };
    });
  }, [rootCategories]);

  // Get current zoomed category data
  const zoomedCategoryData = zoomedCategory ? categories[zoomedCategory] : null;
  const zoomedColors = zoomedCategoryData ? getColorForCategory(zoomedCategoryData) : null;

  // Get subcategories for zoomed category
  const subcategories = useMemo(() => {
    if (!zoomedCategory) return [];
    return customCategories.filter(c => c.parentId === zoomedCategory);
  }, [zoomedCategory, customCategories]);

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!zoomedCategoryData) return [];
    const items = zoomedCategoryData.items || [];
    if (!searchQuery) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(
      item =>
        item.title.toLowerCase().includes(query) ||
        item.text.toLowerCase().includes(query)
    );
  }, [zoomedCategoryData, searchQuery]);

  // Handle zoom into category
  const handleZoomIn = useCallback((categoryId: string) => {
    setZoomDirection('in');
    setIsZooming(true);
    setTimeout(() => {
      setZoomedCategory(categoryId);
      setIsZooming(false);
      setSearchQuery('');
      setExpandedItems(new Set());
    }, 400);
  }, []);

  // Handle zoom out
  const handleZoomOut = useCallback(() => {
    setZoomDirection('out');
    setIsZooming(true);
    setTimeout(() => {
      setZoomedCategory(null);
      setIsZooming(false);
      setShowSubcategoryForm(false);
    }, 400);
  }, []);

  // Toggle item expansion
  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Handle subcategory creation
  const handleCreateSubcategory = async () => {
    if (!subLabel.trim() || !zoomedCategory) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/knowledge-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: subLabel.trim(),
          description: subDescription.trim() || undefined,
          icon: subIcon,
          color: subColor,
          parentId: zoomedCategory,
        }),
      });

      if (response.ok) {
        setSubLabel('');
        setSubDescription('');
        setSubIcon('📁');
        setSubColor('slate');
        setShowSubcategoryForm(false);
        onRefresh?.();
      }
    } catch (err) {
      console.error('Failed to create subcategory:', err);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={zoomedCategory ? handleZoomOut : onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl h-[700px] mx-4 overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-white bg-slate-800/80 rounded-lg hover:bg-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Main Circular View */}
        <div
          className={`
            absolute inset-0 flex items-center justify-center transition-all duration-500 ease-out
            ${isZooming && zoomDirection === 'in' ? 'scale-[3] opacity-0' : ''}
            ${isZooming && zoomDirection === 'out' ? 'scale-[0.3] opacity-0' : ''}
            ${zoomedCategory && !isZooming ? 'scale-0 opacity-0' : ''}
            ${!zoomedCategory && !isZooming ? 'scale-100 opacity-100' : ''}
          `}
        >
          {/* Background rings */}
          <div className="absolute w-[420px] h-[420px] rounded-full border border-cyan-500/10" />
          <div className="absolute w-[320px] h-[320px] rounded-full border border-cyan-500/15" />
          <div className="absolute w-[220px] h-[220px] rounded-full border border-cyan-500/20" />

          {/* Animated pulse */}
          <div
            className="absolute w-[280px] h-[280px] rounded-full border border-cyan-500/20 animate-ping"
            style={{ animationDuration: '4s' }}
          />

          {/* Connection lines */}
          <svg className="absolute w-full h-full pointer-events-none">
            {categoryPositions.map((cat) => {
              const centerX = 50;
              const centerY = 50;
              const endX = centerX + (cat.x / 500) * 100;
              const endY = centerY + (cat.y / 500) * 100;

              return (
                <line
                  key={`line-${cat.id}`}
                  x1={`${centerX}%`}
                  y1={`${centerY}%`}
                  x2={`${endX}%`}
                  y2={`${endY}%`}
                  stroke="rgba(6, 182, 212, 0.3)"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
              );
            })}
          </svg>

          {/* Center brain */}
          <div className="absolute z-10 flex flex-col items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border-2 border-cyan-400/60 shadow-lg shadow-cyan-500/30">
            <Brain className="w-10 h-10 text-cyan-400 mb-1" />
            <span className="text-xs font-medium text-cyan-300">{businessName}</span>
            <span className="text-lg font-bold text-white">{totalCount}</span>
          </div>

          {/* Category nodes */}
          {categoryPositions.map((cat) => {
            const colors = getColorForCategory(cat);

            return (
              <button
                key={cat.id}
                onClick={() => handleZoomIn(cat.id)}
                className="absolute z-10 flex flex-col items-center justify-center rounded-full cursor-pointer border-2 transition-all duration-300 hover:scale-125 hover:z-20 hover:shadow-xl"
                style={{
                  width: cat.size,
                  height: cat.size,
                  transform: `translate(${cat.x}px, ${cat.y}px)`,
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                }}
              >
                {cat.isCustom && cat.icon ? (
                  <span className="text-lg">{cat.icon}</span>
                ) : (
                  <span className="text-xl font-bold" style={{ color: colors.text }}>
                    {cat.count}
                  </span>
                )}
                <span
                  className="text-[10px] font-medium text-center leading-tight px-1 truncate max-w-full"
                  style={{ color: colors.text }}
                >
                  {cat.label}
                </span>
                {cat.isCustom && cat.icon && (
                  <span className="text-xs font-bold" style={{ color: colors.text }}>
                    {cat.count}
                  </span>
                )}
              </button>
            );
          })}

          {/* Instructions */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-4 py-2 bg-slate-800/90 rounded-xl border border-slate-700">
            <span className="text-xs text-slate-400">Click a category to explore</span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-cyan-400">{rootCategories.length} categories</span>
          </div>
        </div>

        {/* Drilled-down Category View */}
        <div
          className={`
            absolute inset-0 bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden
            transition-all duration-500 ease-out
            ${isZooming && zoomDirection === 'in' ? 'scale-[0.3] opacity-0' : ''}
            ${isZooming && zoomDirection === 'out' ? 'scale-[3] opacity-0' : ''}
            ${zoomedCategory && !isZooming ? 'scale-100 opacity-100' : ''}
            ${!zoomedCategory && !isZooming ? 'scale-0 opacity-0 pointer-events-none' : ''}
          `}
        >
          {zoomedCategoryData && zoomedColors && (
            <div className="h-full flex flex-col">
              {/* Header */}
              <div
                className="flex-shrink-0 p-4 border-b border-slate-700"
                style={{ backgroundColor: zoomedColors.bg }}
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleZoomOut}
                    className="p-2 text-slate-400 hover:text-white bg-slate-800/50 rounded-lg hover:bg-slate-700 transition"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center border-2"
                      style={{ backgroundColor: zoomedColors.bg, borderColor: zoomedColors.border }}
                    >
                      {zoomedCategoryData.icon ? (
                        <span className="text-2xl">{zoomedCategoryData.icon}</span>
                      ) : (
                        <span className="text-xl font-bold" style={{ color: zoomedColors.text }}>
                          {zoomedCategoryData.count}
                        </span>
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{zoomedCategoryData.label}</h2>
                      <p className="text-sm text-slate-400">
                        {zoomedCategoryData.count} items
                        {subcategories.length > 0 && ` • ${subcategories.length} subcategories`}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowSubcategoryForm(!showSubcategoryForm)}
                    className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition text-sm"
                  >
                    <FolderPlus className="w-4 h-4" />
                    Add Subcategory
                  </button>
                </div>

                {/* Search */}
                <div className="mt-4 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search items..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-600 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
              </div>

              {/* Subcategory Creation Form */}
              {showSubcategoryForm && (
                <div className="flex-shrink-0 p-4 bg-slate-800/50 border-b border-slate-700">
                  <h3 className="text-sm font-medium text-slate-300 mb-3">
                    Create subcategory under &quot;{zoomedCategoryData.label}&quot;
                  </h3>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={subLabel}
                      onChange={(e) => setSubLabel(e.target.value)}
                      placeholder="Subcategory name"
                      className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    />
                    <input
                      type="text"
                      value={subDescription}
                      onChange={(e) => setSubDescription(e.target.value)}
                      placeholder="Description (optional)"
                      className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    />
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Icon:</span>
                      <div className="flex gap-1">
                        {EMOJI_OPTIONS.slice(0, 6).map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setSubIcon(emoji)}
                            className={`w-7 h-7 text-sm rounded border transition ${
                              subIcon === emoji
                                ? 'bg-cyan-500/20 border-cyan-500/50'
                                : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Color:</span>
                      <div className="flex gap-1">
                        {COLOR_OPTIONS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setSubColor(color)}
                            className={`w-5 h-5 rounded-full transition ${
                              subColor === color ? 'ring-2 ring-offset-1 ring-offset-slate-800 ring-white' : ''
                            }`}
                            style={{ backgroundColor: TAILWIND_COLORS[color]?.text || '#94a3b8' }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex-1" />
                    <button
                      onClick={() => setShowSubcategoryForm(false)}
                      className="px-3 py-1.5 text-sm text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateSubcategory}
                      disabled={!subLabel.trim() || isCreating}
                      className="px-3 py-1.5 text-sm bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg disabled:opacity-50"
                    >
                      {isCreating ? 'Creating...' : 'Create'}
                    </button>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {/* Subcategories */}
                {subcategories.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                      Subcategories
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {subcategories.map((sub) => {
                        const subColors = TAILWIND_COLORS[sub.color || 'slate'];
                        return (
                          <button
                            key={sub.id}
                            onClick={() => handleZoomIn(sub.id)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg border transition hover:scale-105"
                            style={{
                              backgroundColor: subColors.bg,
                              borderColor: subColors.border,
                            }}
                          >
                            <span>{sub.icon}</span>
                            <span className="text-sm font-medium text-white">{sub.label}</span>
                            <span className="text-xs" style={{ color: subColors.text }}>
                              {categories[sub.id]?.count || 0}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Items */}
                <div>
                  <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                    Items ({filteredItems.length})
                  </h3>

                  {filteredItems.length === 0 ? (
                    <div className="text-center py-12">
                      <div
                        className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                        style={{ backgroundColor: zoomedColors.bg }}
                      >
                        {zoomedCategoryData.icon ? (
                          <span className="text-3xl opacity-50">{zoomedCategoryData.icon}</span>
                        ) : (
                          <span className="text-2xl font-bold opacity-50" style={{ color: zoomedColors.text }}>
                            0
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400">
                        {searchQuery ? 'No items match your search' : 'No items in this category yet'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredItems.map((item) => {
                        const isExpanded = expandedItems.has(item.id);

                        return (
                          <div
                            key={item.id}
                            className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden"
                          >
                            <div
                              className="flex items-center gap-2 p-3 cursor-pointer hover:bg-slate-700/30 transition"
                              onClick={() => toggleExpanded(item.id)}
                            >
                              <button className="flex-shrink-0 text-slate-400">
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </button>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-slate-100 truncate">
                                  {item.title}
                                </div>
                                {!isExpanded && (
                                  <div className="text-xs text-slate-500 truncate mt-0.5">
                                    {item.text.substring(0, 100)}...
                                  </div>
                                )}
                              </div>
                              {item.kind && (
                                <span
                                  className="flex-shrink-0 px-2 py-0.5 text-[10px] rounded"
                                  style={{
                                    backgroundColor: item.kind === 'story' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                                    color: item.kind === 'story' ? '#fbbf24' : '#facc15',
                                  }}
                                >
                                  {item.kind}
                                </span>
                              )}
                            </div>

                            {isExpanded && (
                              <div className="px-3 pb-3 border-t border-slate-700/50">
                                {/* Story-specific fields */}
                                {item.kind === 'story' && (item.situation || item.action || item.outcome) ? (
                                  <div className="pt-3 space-y-2">
                                    {item.situation && (
                                      <div>
                                        <div className="text-xs font-medium text-amber-400 mb-0.5">Situation</div>
                                        <div className="text-sm text-slate-300">{item.situation}</div>
                                      </div>
                                    )}
                                    {item.action && (
                                      <div>
                                        <div className="text-xs font-medium text-blue-400 mb-0.5">Action</div>
                                        <div className="text-sm text-slate-300">{item.action}</div>
                                      </div>
                                    )}
                                    {item.outcome && (
                                      <div>
                                        <div className="text-xs font-medium text-emerald-400 mb-0.5">Outcome</div>
                                        <div className="text-sm text-slate-300">{item.outcome}</div>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="pt-3 text-sm text-slate-300 whitespace-pre-wrap">
                                    {item.text}
                                  </div>
                                )}

                                {/* Tags */}
                                {item.tags && item.tags.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {item.tags.map((tag, i) => (
                                      <span
                                        key={i}
                                        className="px-2 py-0.5 text-xs bg-slate-700/50 text-slate-400 rounded"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* Metadata */}
                                <div className="mt-2 text-xs text-slate-500">
                                  {item.chunkCount ? (
                                    <>{item.chunkCount} chunk{item.chunkCount !== 1 ? 's' : ''}</>
                                  ) : item.kind === 'story' ? (
                                    <>Story</>
                                  ) : item.kind === 'tip' ? (
                                    <>Tip</>
                                  ) : (
                                    <>Knowledge</>
                                  )}
                                  {' '}in Qdrant
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
