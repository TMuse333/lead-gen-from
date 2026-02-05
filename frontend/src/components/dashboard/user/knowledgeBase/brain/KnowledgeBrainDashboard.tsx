'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Brain,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Plus,
  X,
  Heart,
  Lightbulb,
  User,
  Briefcase,
  Cog,
  MessageSquare,
  Star,
  HelpCircle,
  FileText,
  FolderPlus,
  CircleDot,
  ChevronRight,
} from 'lucide-react';
import KnowledgeCategoryPanel from './KnowledgeCategoryPanel';
import CircularBrainModal from './CircularBrainModal';
import CreateCategoryModal from './CreateCategoryModal';
import type { KnowledgeEntry, CategoryData, CustomCategoryInfo } from './KnowledgeBrainGraph';

// Built-in category configuration with icons and colors
const BUILTIN_CATEGORY_CONFIG: Record<string, {
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  label: string;
  description: string;
  row: 'primary' | 'agent';
}> = {
  stories: {
    icon: Heart,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    label: 'Stories',
    description: 'Client success stories',
    row: 'primary',
  },
  tips: {
    icon: Lightbulb,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    label: 'Tips & Advice',
    description: 'Expert knowledge',
    row: 'primary',
  },
  about: {
    icon: User,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    label: 'About',
    description: 'Background & experience',
    row: 'agent',
  },
  services: {
    icon: Briefcase,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    label: 'Services',
    description: 'What you offer',
    row: 'agent',
  },
  process: {
    icon: Cog,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    label: 'Process',
    description: 'How you work',
    row: 'agent',
  },
  'value-proposition': {
    icon: MessageSquare,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    label: 'Value Props',
    description: 'Why choose you',
    row: 'agent',
  },
  testimonials: {
    icon: Star,
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
    label: 'Testimonials',
    description: 'Client feedback',
    row: 'agent',
  },
  faq: {
    icon: HelpCircle,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    label: 'FAQ',
    description: 'Common questions',
    row: 'agent',
  },
  general: {
    icon: FileText,
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-500/30',
    label: 'General',
    description: 'Other info',
    row: 'agent',
  },
};

// Tailwind color classes for custom categories
const COLOR_CLASSES: Record<string, { color: string; bgColor: string; borderColor: string }> = {
  slate: { color: 'text-slate-400', bgColor: 'bg-slate-500/10', borderColor: 'border-slate-500/30' },
  red: { color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/30' },
  orange: { color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30' },
  amber: { color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30' },
  yellow: { color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/30' },
  lime: { color: 'text-lime-400', bgColor: 'bg-lime-500/10', borderColor: 'border-lime-500/30' },
  green: { color: 'text-green-400', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/30' },
  emerald: { color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30' },
  teal: { color: 'text-teal-400', bgColor: 'bg-teal-500/10', borderColor: 'border-teal-500/30' },
  cyan: { color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30' },
  sky: { color: 'text-sky-400', bgColor: 'bg-sky-500/10', borderColor: 'border-sky-500/30' },
  blue: { color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30' },
  indigo: { color: 'text-indigo-400', bgColor: 'bg-indigo-500/10', borderColor: 'border-indigo-500/30' },
  violet: { color: 'text-violet-400', bgColor: 'bg-violet-500/10', borderColor: 'border-violet-500/30' },
  purple: { color: 'text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/30' },
  fuchsia: { color: 'text-fuchsia-400', bgColor: 'bg-fuchsia-500/10', borderColor: 'border-fuchsia-500/30' },
  pink: { color: 'text-pink-400', bgColor: 'bg-pink-500/10', borderColor: 'border-pink-500/30' },
  rose: { color: 'text-rose-400', bgColor: 'bg-rose-500/10', borderColor: 'border-rose-500/30' },
};

// Built-in category order
const BUILTIN_ORDER = ['stories', 'tips', 'about', 'services', 'process', 'value-proposition', 'testimonials', 'faq', 'general'];

// Built-in categories for parent selection in create modal
const BUILTIN_CATEGORIES_FOR_PARENT = [
  { id: 'about', label: 'About' },
  { id: 'services', label: 'Services' },
  { id: 'process', label: 'Process' },
  { id: 'value-proposition', label: 'Value Props' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'faq', label: 'FAQ' },
  { id: 'general', label: 'General' },
];

// Category options for the add knowledge modal
const CATEGORY_OPTIONS = [
  { id: 'about', label: 'About', description: 'Background, experience, personal info' },
  { id: 'services', label: 'Services', description: 'What you offer, specializations' },
  { id: 'process', label: 'Process', description: 'How you work, step-by-step guides' },
  { id: 'value-proposition', label: 'Value Props', description: 'Why choose you, unique benefits' },
  { id: 'testimonials', label: 'Testimonials', description: 'Client reviews and success stories' },
  { id: 'faq', label: 'FAQ', description: 'Common questions and answers' },
  { id: 'general', label: 'General', description: 'Contact info, locations, other' },
];

export default function KnowledgeBrainDashboard() {
  const [categories, setCategories] = useState<Record<string, CategoryData>>({});
  const [customCategories, setCustomCategories] = useState<CustomCategoryInfo[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [businessName, setBusinessName] = useState('Agent');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selection state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [showPanel, setShowPanel] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCircularModal, setShowCircularModal] = useState(false);
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);

  // Add knowledge form state
  const [formTitle, setFormTitle] = useState('');
  const [formText, setFormText] = useState('');
  const [formCategory, setFormCategory] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all knowledge
  const fetchKnowledge = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/knowledge-brain');
      if (!response.ok) {
        throw new Error('Failed to fetch knowledge');
      }

      const data = await response.json();
      setCategories(data.categories || {});
      setCustomCategories(data.customCategories || []);
      setTotalCount(data.totalCount || 0);
      if (data.businessName) {
        setBusinessName(data.businessName);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load knowledge');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKnowledge();
  }, [fetchKnowledge]);

  // Build category order including custom categories
  const categoryOrder = [...BUILTIN_ORDER];
  // Add root-level custom categories
  const rootCustomCategories = customCategories.filter(c => !c.parentId);
  for (const custom of rootCustomCategories) {
    categoryOrder.push(custom.id);
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showAddModal || showCircularModal || showCreateCategoryModal ||
          e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const primaryCount = 2;
      const maxIndex = categoryOrder.length - 1;

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          setFocusedIndex((prev) => Math.min(prev + 1, maxIndex));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setFocusedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (focusedIndex < primaryCount) {
            setFocusedIndex(primaryCount);
          } else if (focusedIndex < primaryCount + 4) {
            setFocusedIndex(Math.min(focusedIndex + 4, maxIndex));
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (focusedIndex >= primaryCount && focusedIndex < primaryCount + 4) {
            setFocusedIndex(focusedIndex < primaryCount + 2 ? 0 : 1);
          } else if (focusedIndex >= primaryCount + 4) {
            setFocusedIndex(focusedIndex - 4);
          }
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (categoryOrder[focusedIndex]) {
            handleCategorySelect(categoryOrder[focusedIndex]);
          }
          break;
        case 'Escape':
          if (showPanel) {
            e.preventDefault();
            setShowPanel(false);
            setSelectedCategory(null);
          }
          break;
        case '1': case '2': case '3': case '4': case '5':
        case '6': case '7': case '8': case '9':
          e.preventDefault();
          const num = parseInt(e.key) - 1;
          if (num < categoryOrder.length) {
            setFocusedIndex(num);
            handleCategorySelect(categoryOrder[num]);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, showAddModal, showCircularModal, showCreateCategoryModal, showPanel, categoryOrder]);

  // Handle category selection
  const handleCategorySelect = useCallback((categoryId: string) => {
    if (categoryId === 'master') {
      // Select all
      setSelectedCategory(null);
      const allItems = Object.values(categories).flatMap(c => c.items);
      setShowPanel(true);
      return;
    }
    setSelectedCategory(categoryId);
    setShowPanel(true);
    const idx = categoryOrder.indexOf(categoryId);
    if (idx >= 0) setFocusedIndex(idx);
  }, [categories, categoryOrder]);

  const handleClosePanel = useCallback(() => {
    setShowPanel(false);
    setSelectedCategory(null);
  }, []);

  // Handle delete
  const handleDelete = async (entryId: string) => {
    try {
      const response = await fetch('/api/agent-knowledge', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId }),
      });

      if (!response.ok) throw new Error('Failed to delete');
      await fetchKnowledge();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // Handle add knowledge
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formText.trim()) return;

    setIsSubmitting(true);

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

      if (!response.ok) throw new Error('Failed to add knowledge');

      setFormTitle('');
      setFormText('');
      setFormCategory('general');
      setShowAddModal(false);

      await fetchKnowledge();
    } catch (err) {
      console.error('Add failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const estimateChunks = (text: string): number => {
    const length = text.trim().length;
    if (length <= 600) return 1;
    return Math.ceil(length / 500);
  };

  // Can delete in category (only agent knowledge, not stories/tips)
  const canDeleteInCategory = selectedCategory && !['stories', 'tips'].includes(selectedCategory);

  // Get panel entries
  const panelEntries = selectedCategory
    ? (categories[selectedCategory]?.items || [])
    : Object.values(categories).flatMap(c => c.items);

  // Calculate stats
  const primaryCategories = BUILTIN_ORDER.filter(id => BUILTIN_CATEGORY_CONFIG[id]?.row === 'primary');
  const agentCategories = BUILTIN_ORDER.filter(id => BUILTIN_CATEGORY_CONFIG[id]?.row === 'agent');
  const agentKnowledgeCount = agentCategories.reduce((sum, id) => sum + (categories[id]?.count || 0), 0);

  // Get subcategories for a parent
  const getSubcategories = (parentId: string) => {
    return customCategories.filter(c => c.parentId === parentId);
  };

  // All category options for add modal (built-in + custom)
  const allCategoryOptions = [
    ...CATEGORY_OPTIONS,
    ...customCategories.map(c => ({
      id: c.id,
      label: c.icon ? `${c.icon} ${c.label}` : c.label,
      description: c.description || 'Custom category',
    })),
  ];

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-900">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchKnowledge}
            className="mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Render a category card
  const renderCategoryCard = (categoryId: string, isLarge: boolean = false) => {
    const catData = categories[categoryId];
    const customCat = customCategories.find(c => c.id === categoryId);
    const isCustom = !!customCat;
    const builtinConfig = BUILTIN_CATEGORY_CONFIG[categoryId];

    const globalIndex = categoryOrder.indexOf(categoryId);
    const isFocused = focusedIndex === globalIndex;
    const isSelected = selectedCategory === categoryId;

    // Get styles
    let Icon: React.ElementType = FileText;
    let colorClasses = COLOR_CLASSES.slate;
    let label = catData?.label || categoryId;
    let description = '';
    let icon: string | undefined;

    if (isCustom && customCat) {
      icon = customCat.icon;
      label = customCat.label;
      description = customCat.description || '';
      colorClasses = COLOR_CLASSES[customCat.color || 'slate'] || COLOR_CLASSES.slate;
    } else if (builtinConfig) {
      Icon = builtinConfig.icon;
      label = builtinConfig.label;
      description = builtinConfig.description;
      colorClasses = {
        color: builtinConfig.color,
        bgColor: builtinConfig.bgColor,
        borderColor: builtinConfig.borderColor,
      };
    }

    // Get subcategories
    const subcategories = getSubcategories(categoryId);

    if (isLarge) {
      return (
        <button
          key={categoryId}
          onClick={() => handleCategorySelect(categoryId)}
          className={`
            relative p-4 rounded-xl border transition-all text-left
            ${colorClasses.bgColor} ${colorClasses.borderColor}
            ${isFocused ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900' : ''}
            ${isSelected ? 'border-cyan-400 shadow-lg shadow-cyan-500/20' : ''}
            hover:scale-[1.02] hover:shadow-lg
          `}
        >
          <span className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center text-xs font-mono text-slate-500 bg-slate-800/50 rounded">
            {globalIndex + 1}
          </span>

          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-lg ${colorClasses.bgColor} border ${colorClasses.borderColor}`}>
              {icon ? (
                <span className="text-2xl">{icon}</span>
              ) : (
                <Icon className={`w-6 h-6 ${colorClasses.color}`} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white">{label}</h3>
                <span className={`text-lg font-bold ${colorClasses.color}`}>
                  {catData?.count || 0}
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">{description}</p>

              {/* Subcategories indicator */}
              {subcategories.length > 0 && (
                <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                  <ChevronRight className="w-3 h-3" />
                  <span>{subcategories.length} subcategories</span>
                </div>
              )}

              {/* Progress bar */}
              {totalCount > 0 && (
                <div className="mt-3 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all`}
                    style={{
                      width: `${Math.min(100, ((catData?.count || 0) / totalCount) * 100 * 3)}%`,
                      backgroundColor: 'currentColor',
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </button>
      );
    }

    // Small card
    return (
      <button
        key={categoryId}
        onClick={() => handleCategorySelect(categoryId)}
        className={`
          relative p-3 rounded-xl border transition-all text-left
          ${colorClasses.bgColor} ${colorClasses.borderColor}
          ${isFocused ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900' : ''}
          ${isSelected ? 'border-cyan-400 shadow-lg shadow-cyan-500/20' : ''}
          hover:scale-[1.02] hover:shadow-lg
        `}
      >
        <span className="absolute top-1.5 right-1.5 w-4 h-4 flex items-center justify-center text-[10px] font-mono text-slate-500 bg-slate-800/50 rounded">
          {globalIndex + 1}
        </span>

        <div className="flex items-center gap-2 mb-2">
          {icon ? (
            <span className="text-base">{icon}</span>
          ) : (
            <Icon className={`w-4 h-4 ${colorClasses.color}`} />
          )}
          <span className={`text-lg font-bold ${colorClasses.color}`}>
            {catData?.count || 0}
          </span>
        </div>
        <h3 className="font-medium text-white text-sm">{label}</h3>
        <p className="text-xs text-slate-500 mt-0.5 truncate">{description}</p>

        {/* Subcategories indicator */}
        {subcategories.length > 0 && (
          <div className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-500">
            <span>+{subcategories.length} sub</span>
          </div>
        )}
      </button>
    );
  };

  return (
    <div ref={containerRef} className="h-full flex bg-slate-900 overflow-hidden">
      {/* Main content area */}
      <div className={`flex-1 overflow-y-auto transition-all duration-300 ${showPanel ? 'pr-0' : ''}`}>
        {/* Brain Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-slate-900 to-slate-900" />

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="absolute w-32 h-32 rounded-full border border-cyan-500/20 animate-ping" style={{ animationDuration: '3s' }} />
            <div className="absolute w-48 h-48 rounded-full border border-cyan-500/10 animate-ping" style={{ animationDuration: '4s', animationDelay: '0.5s' }} />
          </div>

          <div className="relative px-6 py-8">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full" />
                <div className="relative p-4 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl border border-cyan-500/30">
                  <Brain className="w-12 h-12 text-cyan-400" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">{businessName}&apos;s Knowledge Brain</h1>
              <p className="text-slate-400 text-sm">Everything your AI assistant knows</p>
            </div>

            {/* Stats row */}
            <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="text-2xl font-bold text-cyan-400">{totalCount}</span>
                <span className="text-slate-400 text-sm">total</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <Heart className="w-4 h-4 text-amber-400" />
                <span className="text-lg font-semibold text-amber-400">{categories.stories?.count || 0}</span>
                <span className="text-amber-300/70 text-sm">stories</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                <Lightbulb className="w-4 h-4 text-yellow-400" />
                <span className="text-lg font-semibold text-yellow-400">{categories.tips?.count || 0}</span>
                <span className="text-yellow-300/70 text-sm">tips</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 rounded-xl border border-slate-600">
                <FileText className="w-4 h-4 text-slate-400" />
                <span className="text-lg font-semibold text-slate-300">{agentKnowledgeCount}</span>
                <span className="text-slate-400 text-sm">knowledge</span>
              </div>
              {rootCustomCategories.length > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-xl border border-purple-500/20">
                  <FolderPlus className="w-4 h-4 text-purple-400" />
                  <span className="text-lg font-semibold text-purple-400">{rootCustomCategories.length}</span>
                  <span className="text-purple-300/70 text-sm">custom</span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <button
                onClick={fetchKnowledge}
                className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm">Refresh</span>
              </button>
              <button
                onClick={() => setShowCircularModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors"
                title="Circular View"
              >
                <CircleDot className="w-4 h-4" />
                <span className="text-sm">Circular View</span>
              </button>
              <button
                onClick={() => setShowCreateCategoryModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
              >
                <FolderPlus className="w-4 h-4" />
                <span className="text-sm">New Category</span>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Knowledge
              </button>
            </div>

            <p className="text-center text-xs text-slate-500 mt-4">
              Arrow keys to navigate • Enter to select • 1-9 for quick access
            </p>
          </div>
        </div>

        {/* Category Cards */}
        <div className="px-6 pb-8">
          {/* Primary Knowledge (Stories & Tips) */}
          <div className="mb-6">
            <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3 px-1">
              Primary Knowledge
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {primaryCategories.map(id => renderCategoryCard(id, true))}
            </div>
          </div>

          {/* Agent Knowledge */}
          <div className="mb-6">
            <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3 px-1">
              Agent Knowledge
            </h2>
            <div className="grid grid-cols-4 gap-3">
              {agentCategories.map(id => renderCategoryCard(id, false))}
            </div>
          </div>

          {/* Custom Categories */}
          {rootCustomCategories.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3 px-1">
                Custom Categories
              </h2>
              <div className="grid grid-cols-4 gap-3">
                {rootCustomCategories.map(cat => renderCategoryCard(cat.id, false))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Side panel */}
      {showPanel && (
        <div className="w-[400px] border-l border-slate-700 flex-shrink-0">
          <KnowledgeCategoryPanel
            category={selectedCategory}
            entries={panelEntries}
            onClose={handleClosePanel}
            onDelete={canDeleteInCategory ? handleDelete : undefined}
            onAddNew={canDeleteInCategory ? () => {
              if (selectedCategory) setFormCategory(selectedCategory);
              setShowAddModal(true);
            } : undefined}
          />
        </div>
      )}

      {/* Circular Brain Modal */}
      <CircularBrainModal
        isOpen={showCircularModal}
        onClose={() => setShowCircularModal(false)}
        businessName={businessName}
        categories={categories}
        totalCount={totalCount}
        onCategorySelect={(id) => {
          setShowCircularModal(false);
          handleCategorySelect(id);
        }}
        selectedCategory={selectedCategory}
        customCategories={customCategories}
        onRefresh={fetchKnowledge}
      />

      {/* Create Category Modal */}
      <CreateCategoryModal
        isOpen={showCreateCategoryModal}
        onClose={() => setShowCreateCategoryModal(false)}
        onSuccess={fetchKnowledge}
        existingCategories={customCategories}
        builtInCategories={BUILTIN_CATEGORIES_FOR_PARENT}
      />

      {/* Add Knowledge Modal */}
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

            <h3 className="text-lg font-semibold text-white mb-4">Add Knowledge</h3>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Title <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g., Home Buying Process Step 1"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>

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
                  <optgroup label="Built-in Categories">
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label} - {cat.description}
                      </option>
                    ))}
                  </optgroup>
                  {customCategories.length > 0 && (
                    <optgroup label="Custom Categories">
                      {customCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.label} {cat.description ? `- ${cat.description}` : ''}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Content <span className="text-cyan-400">*</span>
                </label>
                <textarea
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  placeholder="Enter the knowledge content..."
                  rows={8}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 resize-y"
                  disabled={isSubmitting}
                />
                <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                  <span>{formText.length.toLocaleString()} characters</span>
                  {formText.length > 0 && (
                    <span className="text-cyan-400">
                      ~{estimateChunks(formText)} chunk{estimateChunks(formText) !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>

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
    </div>
  );
}
