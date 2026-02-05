'use client';

import { useState } from 'react';
import {
  X,
  ChevronDown,
  ChevronRight,
  Brain,
  User,
  Briefcase,
  MessageSquare,
  Star,
  HelpCircle,
  Cog,
  FileText,
  Trash2,
  Plus,
  Search,
  Heart,
  Lightbulb,
} from 'lucide-react';
import type { KnowledgeEntry } from './KnowledgeBrainGraph';

// Re-export for convenience
export type { KnowledgeEntry };

const categoryConfig: Record<string, {
  icon: React.ElementType;
  color: string;
  bgColor: string;
  label: string;
  description: string;
}> = {
  master: {
    icon: Brain,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
    label: 'All Knowledge',
    description: 'Everything in your agent\'s brain',
  },
  stories: {
    icon: Heart,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    label: 'Stories',
    description: 'Client success stories that build trust',
  },
  tips: {
    icon: Lightbulb,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    label: 'Tips & Advice',
    description: 'Expert knowledge and market insights',
  },
  about: {
    icon: User,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    label: 'About',
    description: 'Background, experience, personal info',
  },
  services: {
    icon: Briefcase,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    label: 'Services',
    description: 'What you offer, specializations',
  },
  process: {
    icon: Cog,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    label: 'Process',
    description: 'How you work, step-by-step guides',
  },
  testimonials: {
    icon: Star,
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/20',
    label: 'Testimonials',
    description: 'Client reviews and success stories',
  },
  'value-proposition': {
    icon: MessageSquare,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    label: 'Value Props',
    description: 'Why choose you, unique benefits',
  },
  faq: {
    icon: HelpCircle,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    label: 'FAQ',
    description: 'Common questions and answers',
  },
  general: {
    icon: FileText,
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/20',
    label: 'General',
    description: 'Contact info, locations, other',
  },
};

interface Props {
  category: string | null;
  entries: KnowledgeEntry[];
  onClose: () => void;
  onDelete?: (entryId: string) => void;
  onAddNew?: () => void;
}

export default function KnowledgeCategoryPanel({
  category,
  entries,
  onClose,
  onDelete,
  onAddNew,
}: Props) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const config = categoryConfig[category || 'master'] || categoryConfig.master;
  const Icon = config.icon;

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredEntries = entries.filter((entry) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      entry.title.toLowerCase().includes(query) ||
      entry.text.toLowerCase().includes(query)
    );
  });

  const handleDelete = (id: string) => {
    if (onDelete) {
      onDelete(id);
    }
    setDeleteConfirm(null);
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 border-l border-slate-700">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${config.color}`} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">{config.label}</h2>
              <p className="text-xs text-slate-400">{config.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entries..."
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
          />
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mt-3 text-sm">
          <span className="text-slate-400">
            {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
            {searchQuery && entries.length !== filteredEntries.length && (
              <span className="text-slate-500"> (of {entries.length})</span>
            )}
          </span>
          {onAddNew && (
            <button
              onClick={onAddNew}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Add New
            </button>
          )}
        </div>
      </div>

      {/* Entries List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <div className={`w-12 h-12 rounded-full ${config.bgColor} flex items-center justify-center mx-auto mb-3`}>
              <Icon className={`w-6 h-6 ${config.color} opacity-50`} />
            </div>
            <p className="text-slate-400 text-sm">
              {searchQuery ? 'No entries match your search' : 'No entries in this category yet'}
            </p>
            {!searchQuery && onAddNew && (
              <button
                onClick={onAddNew}
                className="mt-4 px-4 py-2 text-sm font-medium text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg transition"
              >
                Add your first entry
              </button>
            )}
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const isExpanded = expandedItems.has(entry.id);
            const isDeleting = deleteConfirm === entry.id;

            return (
              <div
                key={entry.id}
                className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden"
              >
                <div
                  className="flex items-center gap-2 p-3 cursor-pointer hover:bg-slate-700/30 transition"
                  onClick={() => toggleExpanded(entry.id)}
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
                      {entry.title}
                    </div>
                    {!isExpanded && (
                      <div className="text-xs text-slate-500 truncate mt-0.5">
                        {entry.text.substring(0, 80)}...
                      </div>
                    )}
                  </div>

                  {onDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm(entry.id);
                      }}
                      className="flex-shrink-0 p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {isExpanded && (
                  <div className="px-3 pb-3 border-t border-slate-700/50">
                    {/* Story-specific display */}
                    {entry.kind === 'story' && (entry.situation || entry.action || entry.outcome) ? (
                      <div className="pt-3 space-y-3">
                        {entry.situation && (
                          <div>
                            <div className="text-xs font-medium text-amber-400 mb-1">Situation</div>
                            <div className="text-sm text-slate-300">{entry.situation}</div>
                          </div>
                        )}
                        {entry.action && (
                          <div>
                            <div className="text-xs font-medium text-blue-400 mb-1">Action</div>
                            <div className="text-sm text-slate-300">{entry.action}</div>
                          </div>
                        )}
                        {entry.outcome && (
                          <div>
                            <div className="text-xs font-medium text-emerald-400 mb-1">Outcome</div>
                            <div className="text-sm text-slate-300">{entry.outcome}</div>
                          </div>
                        )}
                        {entry.text && (
                          <div>
                            <div className="text-xs font-medium text-slate-400 mb-1">Full Text</div>
                            <div className="text-sm text-slate-300 whitespace-pre-wrap">{entry.text}</div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="pt-3 text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {entry.text}
                      </div>
                    )}
                    {/* Tags for stories/tips */}
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {entry.tags.map((tag, i) => (
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
                      {entry.chunkCount ? (
                        <>{entry.chunkCount} chunk{entry.chunkCount !== 1 ? 's' : ''} in Qdrant</>
                      ) : entry.kind === 'story' ? (
                        <>Story vector in Qdrant</>
                      ) : entry.kind === 'tip' ? (
                        <>Tip vector in Qdrant</>
                      ) : (
                        <>Stored in Qdrant</>
                      )}
                    </div>
                  </div>
                )}

                {/* Delete confirmation */}
                {isDeleting && (
                  <div className="px-3 pb-3 border-t border-red-500/30 bg-red-500/5">
                    <div className="pt-3 flex items-center justify-between">
                      <span className="text-sm text-red-300">Delete this entry?</span>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirm(null);
                          }}
                          className="px-3 py-1 text-xs text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(entry.id);
                          }}
                          className="px-3 py-1 text-xs bg-red-600 hover:bg-red-500 text-white rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
