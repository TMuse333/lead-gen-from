// components/ux/resultsComponents/timeline/components/InteractiveChecklist.tsx
'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  MessageCircle,
  Bell,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import type { ActionItem } from '@/lib/offers/definitions/timeline/timeline-types';

interface InteractiveActionItem extends ActionItem {
  isCompleted?: boolean;
  userNote?: string;
}

interface InteractiveChecklistProps {
  items: InteractiveActionItem[];
  phaseId: string;
  accentColor: string;
  onItemToggle?: (index: number, completed: boolean) => void;
  onAddNote?: (index: number, note: string) => void;
  interactive?: boolean;
}

const priorityStyles = {
  high: {
    badge: 'bg-red-100 text-red-700 border-red-200',
    dot: 'bg-red-500',
    checkBg: 'bg-red-50',
  },
  medium: {
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    checkBg: 'bg-amber-50',
  },
  low: {
    badge: 'bg-gray-100 text-gray-600 border-gray-200',
    dot: 'bg-gray-400',
    checkBg: 'bg-gray-50',
  },
};

/**
 * Interactive checklist for action items
 * Users can check items, add notes, and track progress
 */
export function InteractiveChecklist({
  items,
  phaseId,
  accentColor,
  onItemToggle,
  onAddNote,
  interactive = true,
}: InteractiveChecklistProps) {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(
    new Set(items.map((item, idx) => item.isCompleted ? idx : -1).filter(idx => idx >= 0))
  );
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});

  const completedCount = checkedItems.size;
  const totalCount = items.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const handleToggle = (index: number) => {
    if (!interactive) return;

    const newChecked = new Set(checkedItems);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedItems(newChecked);
    onItemToggle?.(index, newChecked.has(index));
  };

  const handleNoteChange = (index: number, note: string) => {
    setNotes(prev => ({ ...prev, [index]: note }));
    onAddNote?.(index, note);
  };

  return (
    <div className="space-y-4">
      {/* Header with progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className={`h-5 w-5 ${accentColor}`} />
          <h4 className="text-lg font-semibold text-gray-900">
            Action Items
          </h4>
          <span className="text-sm text-gray-500">
            ({completedCount}/{totalCount})
          </span>
        </div>

        {/* Mini progress bar */}
        {interactive && (
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${accentColor.replace('text-', 'bg-')} transition-all duration-300`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-medium text-gray-500">{progressPercent}%</span>
          </div>
        )}
      </div>

      {/* Checklist items */}
      <div className="space-y-2">
        {items.map((item, idx) => {
          const priority = item.priority || 'medium';
          const style = priorityStyles[priority];
          const isChecked = checkedItems.has(idx);
          const isExpanded = expandedItem === idx;

          return (
            <div
              key={idx}
              className={`
                rounded-xl border-2 transition-all duration-200
                ${isChecked
                  ? 'bg-green-50 border-green-200'
                  : 'bg-white border-gray-200 hover:border-gray-300'
                }
              `}
            >
              {/* Main row */}
              <div className="flex items-start gap-3 p-4">
                {/* Checkbox */}
                {interactive ? (
                  <button
                    onClick={() => handleToggle(idx)}
                    className={`
                      flex-shrink-0 mt-0.5 transition-all duration-200
                      ${isChecked ? 'text-green-500' : 'text-gray-300 hover:text-gray-400'}
                    `}
                  >
                    {isChecked ? (
                      <CheckCircle2 className="h-6 w-6 fill-green-100" />
                    ) : (
                      <Circle className="h-6 w-6" />
                    )}
                  </button>
                ) : (
                  <div className={`w-2 h-2 rounded-full mt-2 ${style.dot}`} />
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`
                    font-medium transition-all
                    ${isChecked ? 'text-gray-500 line-through' : 'text-gray-900'}
                  `}>
                    {item.task}
                  </p>

                  {/* Meta info */}
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    {item.estimatedTime && (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {item.estimatedTime}
                      </span>
                    )}
                    <span
                      className={`
                        text-xs px-2 py-0.5 rounded-full border font-medium capitalize
                        ${style.badge}
                      `}
                    >
                      {priority}
                    </span>
                  </div>

                  {/* Note (if exists) */}
                  {notes[idx] && (
                    <div className="mt-2 p-2 bg-amber-50 rounded-lg text-sm text-amber-800 border border-amber-200">
                      <span className="font-medium">Note:</span> {notes[idx]}
                    </div>
                  )}
                </div>

                {/* Actions */}
                {interactive && (
                  <button
                    onClick={() => setExpandedItem(isExpanded ? null : idx)}
                    className="flex-shrink-0 p-1.5 hover:bg-gray-100 rounded-lg transition"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                )}
              </div>

              {/* Expanded actions */}
              {interactive && isExpanded && (
                <div className="px-4 pb-4 pt-0 border-t border-gray-100">
                  <div className="pt-3 space-y-3">
                    {/* Add note */}
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Add a personal note
                      </label>
                      <textarea
                        value={notes[idx] || ''}
                        onChange={(e) => handleNoteChange(idx, e.target.value)}
                        placeholder="e.g., Call John at the bank on Monday..."
                        className="mt-1 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none"
                        rows={2}
                      />
                    </div>

                    {/* Quick actions */}
                    <div className="flex gap-2">
                      <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition">
                        <Bell className="h-3 w-3" />
                        Set Reminder
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition">
                        <MessageCircle className="h-3 w-3" />
                        Ask a Question
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion celebration */}
      {interactive && completedCount === totalCount && totalCount > 0 && (
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 text-center">
          <Sparkles className="h-6 w-6 text-green-500 mx-auto mb-2" />
          <p className="font-semibold text-green-800">Phase Complete!</p>
          <p className="text-sm text-green-600">Great job completing all action items</p>
        </div>
      )}
    </div>
  );
}
