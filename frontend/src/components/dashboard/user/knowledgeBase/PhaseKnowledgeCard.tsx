// src/components/dashboard/user/knowledgeBase/PhaseKnowledgeCard.tsx
/**
 * Phase Knowledge Card Component
 *
 * Displays knowledge coverage for a single phase within an offer.
 * Shows requirements, current coverage, example content, and upload action.
 */

'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Plus,
  Tag,
  Lightbulb,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  BookOpen,
  MessageSquare,
} from 'lucide-react';
import type { KnowledgeKind } from '@/types/advice.types';

export interface AdviceItem {
  id: string;
  title: string;
  advice: string;
  tags: string[];
  kind?: KnowledgeKind;
}

interface PhaseKnowledgeCardProps {
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
  onAddKnowledge: (phaseId: string, phaseName: string, searchTags: string[]) => void;
  onEditItem?: (item: AdviceItem) => void;
  onDeleteItem?: (itemId: string, itemTitle: string) => void;
}

const PRIORITY_CONFIG = {
  critical: {
    label: 'Critical',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/30',
  },
  high: {
    label: 'High',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    borderColor: 'border-amber-500/30',
  },
  medium: {
    label: 'Medium',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30',
  },
  low: {
    label: 'Low',
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/20',
    borderColor: 'border-slate-500/30',
  },
};

export default function PhaseKnowledgeCard({
  phaseId,
  phaseName,
  description,
  priority,
  required,
  current,
  coverage,
  searchTags,
  exampleContent,
  items,
  onAddKnowledge,
  onEditItem,
  onDeleteItem,
}: PhaseKnowledgeCardProps) {
  const [isExpanded, setIsExpanded] = useState(coverage < 1);
  const [showExample, setShowExample] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItemExpanded = (itemId: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const priorityConfig = PRIORITY_CONFIG[priority];
  const isComplete = coverage >= 1;
  const isCriticalMissing = priority === 'critical' && current < required;

  const coveragePercent = Math.round(coverage * 100);
  const progressWidth = Math.min(coveragePercent, 100);

  return (
    <div
      className={`
        rounded-lg border transition-all
        ${isCriticalMissing ? 'border-red-500/50 bg-red-500/5' : 'border-slate-700 bg-slate-800/50'}
      `}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-700/30 transition-colors rounded-t-lg"
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-slate-400" />
          )}

          <div className="flex items-center gap-2">
            {isComplete ? (
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            ) : isCriticalMissing ? (
              <AlertTriangle className="w-5 h-5 text-red-400" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-slate-500" />
            )}
            <span className="text-slate-100 font-medium">{phaseName}</span>
          </div>

          <span
            className={`text-xs px-2 py-0.5 rounded ${priorityConfig.bgColor} ${priorityConfig.color}`}
          >
            {priorityConfig.label}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Coverage indicator */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">
              {current}/{required}
            </span>
            <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  isComplete
                    ? 'bg-green-500'
                    : coverage > 0.5
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                }`}
                style={{ width: `${progressWidth}%` }}
              />
            </div>
            <span
              className={`text-sm font-medium ${
                isComplete ? 'text-green-400' : coverage > 0.5 ? 'text-amber-400' : 'text-red-400'
              }`}
            >
              {coveragePercent}%
            </span>
          </div>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Description */}
          <p className="text-slate-400 text-sm ml-8">{description}</p>

          {/* Suggested Tags */}
          <div className="ml-8">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4 text-slate-500" />
              <span className="text-xs text-slate-500 uppercase tracking-wide">
                Suggested Tags
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {searchTags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Example Content */}
          {exampleContent && (
            <div className="ml-8">
              <button
                onClick={() => setShowExample(!showExample)}
                className="flex items-center gap-2 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <Lightbulb className="w-4 h-4" />
                {showExample ? 'Hide example' : 'Show example content'}
              </button>
              {showExample && (
                <div className="mt-2 p-3 bg-slate-900/50 rounded border border-slate-700 text-sm text-slate-300 italic">
                  "{exampleContent}"
                </div>
              )}
            </div>
          )}

          {/* Existing Items */}
          {items.length > 0 && (
            <div className="ml-8">
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">
                Your Knowledge ({items.length})
              </div>
              <div className="space-y-3">
                {items.map((item) => {
                  const isItemExpanded = expandedItems.has(item.id);
                  return (
                    <div
                      key={item.id}
                      className="bg-slate-900/30 rounded-lg border border-slate-700/50 overflow-hidden"
                    >
                      {/* Item Header */}
                      <div className="flex items-start gap-2 p-3">
                        {item.kind === 'story' ? (
                          <BookOpen className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                        ) : (
                          <MessageSquare className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-200 font-medium">{item.title}</span>
                            {item.kind === 'story' && (
                              <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                Story
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-xs px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        {/* Action Buttons */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => toggleItemExpanded(item.id)}
                            className="p-1.5 hover:bg-slate-700 rounded transition-colors"
                            title={isItemExpanded ? 'Hide content' : 'Show content'}
                          >
                            {isItemExpanded ? (
                              <EyeOff className="w-4 h-4 text-slate-400" />
                            ) : (
                              <Eye className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                          {onEditItem && (
                            <button
                              onClick={() => onEditItem(item)}
                              className="p-1.5 hover:bg-slate-700 rounded transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4 text-cyan-400" />
                            </button>
                          )}
                          {onDeleteItem && (
                            <button
                              onClick={() => onDeleteItem(item.id, item.title)}
                              className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          )}
                        </div>
                      </div>
                      {/* Expanded Content */}
                      {isItemExpanded && (
                        <div className="px-3 pb-3 pt-0">
                          <div className="p-3 bg-slate-800/50 rounded border border-slate-700 text-sm text-slate-300 whitespace-pre-wrap">
                            {item.advice}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add Knowledge Button */}
          <div className="ml-8">
            <button
              onClick={() => onAddKnowledge(phaseId, phaseName, searchTags)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                ${
                  isCriticalMissing
                    ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30'
                    : isComplete
                      ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600'
                      : 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30'
                }
              `}
            >
              <Plus className="w-4 h-4" />
              {isComplete ? 'Add More Knowledge' : 'Add Knowledge for This Phase'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
