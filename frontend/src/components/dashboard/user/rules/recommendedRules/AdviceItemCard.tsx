// components/admin/rules/recommendedRules/AdviceItemCard.tsx
'use client';

import { CheckCircle2 } from 'lucide-react';
import SearchHighlight from './SearchHighlight';
import type { AdviceItem } from './types';

interface AdviceItemCardProps {
  item: AdviceItem;
  isSelected: boolean;
  searchQuery: string;
  onToggleSelection: (id: string) => void;
}

export default function AdviceItemCard({
  item,
  isSelected,
  searchQuery,
  onToggleSelection,
}: AdviceItemCardProps) {
  const hasRules = (item.applicableWhen?.ruleGroups?.length ?? 0) > 0;

  return (
    <div
      onClick={() => onToggleSelection(item.id)}
      className={`p-4 rounded-lg border cursor-pointer transition ${
        isSelected
          ? 'bg-indigo-900/30 border-indigo-600'
          : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-1 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
            isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-600'
          }`}
        >
          {isSelected && <CheckCircle2 className="h-3 w-3 text-white" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-medium text-white">
              <SearchHighlight text={item.title} searchQuery={searchQuery} />
            </h4>
            {hasRules && (
              <span className="text-xs px-2 py-0.5 bg-purple-900/50 text-purple-300 rounded border border-purple-700">
                Has Client Situations
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 line-clamp-2">
            <SearchHighlight text={item.advice} searchQuery={searchQuery} />
          </p>
          {item.tags && item.tags.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {item.tags.slice(0, 3).map((tag: string) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 bg-slate-800 text-slate-400 rounded"
                >
                  <SearchHighlight text={tag} searchQuery={searchQuery} />
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
