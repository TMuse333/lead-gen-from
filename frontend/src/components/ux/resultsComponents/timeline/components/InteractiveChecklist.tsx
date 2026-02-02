// components/ux/resultsComponents/timeline/components/InteractiveChecklist.tsx
'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
} from 'lucide-react';
import type { ActionItem } from '@/lib/offers/definitions/timeline/timeline-types';
import type { ColorTheme } from '@/lib/colors/defaultTheme';

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
  /** Custom color theme for dark mode support */
  colorTheme?: ColorTheme;
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
  colorTheme,
}: InteractiveChecklistProps) {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(
    new Set(items.map((item, idx) => item.isCompleted ? idx : -1).filter(idx => idx >= 0))
  );

  const completedCount = checkedItems.size;
  const totalCount = items.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  // Dark mode support
  const isDarkTheme = colorTheme && (colorTheme.background === '#0a0a0a' || colorTheme.background === '#0f172a');

  // Priority styles that adapt to theme
  const getPriorityStyle = (priority: 'high' | 'medium' | 'low') => {
    if (isDarkTheme) {
      // Dark theme priority styles - more muted backgrounds
      const darkStyles = {
        high: {
          badge: 'bg-red-900/50 text-red-300 border-red-700/50',
          dot: 'bg-red-500',
        },
        medium: {
          badge: 'bg-amber-900/50 text-amber-300 border-amber-700/50',
          dot: 'bg-amber-500',
        },
        low: {
          badge: 'bg-gray-700/50 text-gray-300 border-gray-600/50',
          dot: 'bg-gray-500',
        },
      };
      return darkStyles[priority];
    }
    return priorityStyles[priority];
  };

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

  return (
    <div className="space-y-4">
      {/* Header with progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className={`h-5 w-5 ${accentColor}`} style={colorTheme ? { color: colorTheme.primary } : undefined} />
          <h4 className={`text-lg font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
            Action Items
          </h4>
          <span className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
            ({completedCount}/{totalCount})
          </span>
        </div>

        {/* Mini progress bar */}
        {interactive && (
          <div className="flex items-center gap-2">
            <div className={`w-24 h-2 rounded-full overflow-hidden ${isDarkTheme ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div
                className={`h-full transition-all duration-300`}
                style={{ width: `${progressPercent}%`, backgroundColor: colorTheme?.primary || undefined }}
              />
            </div>
            <span className={`text-xs font-medium ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>{progressPercent}%</span>
          </div>
        )}
      </div>

      {/* Checklist items */}
      <div className="space-y-2">
        {items.map((item, idx) => {
          const priority = item.priority || 'medium';
          const style = getPriorityStyle(priority);
          const isChecked = checkedItems.has(idx);

          return (
            <div
              key={idx}
              className={`
                rounded-xl border-2 transition-all duration-200
                ${isChecked
                  ? isDarkTheme ? 'bg-green-900/30 border-green-700/50' : 'bg-green-50 border-green-200'
                  : isDarkTheme ? 'bg-gray-800/50 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'
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
                      ${isChecked ? 'text-green-500' : isDarkTheme ? 'text-gray-500 hover:text-gray-400' : 'text-gray-300 hover:text-gray-400'}
                    `}
                  >
                    {isChecked ? (
                      <CheckCircle2 className={`h-6 w-6 ${isDarkTheme ? 'fill-green-900/50' : 'fill-green-100'}`} />
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
                    ${isChecked
                      ? isDarkTheme ? 'text-gray-500 line-through' : 'text-gray-500 line-through'
                      : isDarkTheme ? 'text-white' : 'text-gray-900'
                    }
                  `}>
                    {item.task}
                  </p>

                  {/* Meta info */}
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    {item.estimatedTime && (
                      <span className={`inline-flex items-center gap-1 text-xs ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
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
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion celebration */}
      {interactive && completedCount === totalCount && totalCount > 0 && (
        <div className={`p-4 rounded-xl border-2 text-center ${isDarkTheme ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-700/50' : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'}`}>
          <Sparkles className="h-6 w-6 text-green-500 mx-auto mb-2" />
          <p className={`font-semibold ${isDarkTheme ? 'text-green-300' : 'text-green-800'}`}>Phase Complete!</p>
          <p className={`text-sm ${isDarkTheme ? 'text-green-400' : 'text-green-600'}`}>Great job completing all action items</p>
        </div>
      )}
    </div>
  );
}
