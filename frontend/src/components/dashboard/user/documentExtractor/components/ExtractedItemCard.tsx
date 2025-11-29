// components/documentExtractor/components/ExtractedItemCard.tsx

import { Edit2, Save, Target } from 'lucide-react';
import RuleBuilder from '../../adviceDashboard/ruleBuilder';
import type { ExtractedItem, ConditionRule, LogicOperator } from '../types';
import type { UserField } from '@/lib/rules/fieldDiscovery';

interface ExtractedItemCardProps {
  item: ExtractedItem;
  index: number;
  isSelected: boolean;
  isAddingRules: boolean;
  rules: ConditionRule[];
  logic: LogicOperator;
  userFields: UserField[];
  onToggleSelection: () => void;
  onStartEditing: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onTitleChange: (value: string) => void;
  onAdviceChange: (value: string) => void;
  onToggleRulesBuilder: () => void;
  onRulesChange: (rules: ConditionRule[]) => void;
  onLogicChange: (logic: LogicOperator) => void;
  onSaveRules: () => void;
  onCancelRules: () => void;
}

export default function ExtractedItemCard({
  item,
  index,
  isSelected,
  isAddingRules,
  rules,
  logic,
  userFields,
  onToggleSelection,
  onStartEditing,
  onSaveEdit,
  onCancelEdit,
  onTitleChange,
  onAdviceChange,
  onToggleRulesBuilder,
  onRulesChange,
  onLogicChange,
  onSaveRules,
  onCancelRules,
}: ExtractedItemCardProps) {
  return (
    <div
      className={`bg-slate-800 rounded-lg p-4 border-2 transition ${
        isSelected ? 'border-indigo-500' : 'border-slate-700'
      }`}
    >
      <div className="flex items-start gap-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelection}
          className="mt-1 w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
        />

        <div className="flex-1">
          {item.editing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={item.editedTitle || ''}
                onChange={(e) => onTitleChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-white"
                placeholder="Title"
              />
              <textarea
                value={item.editedAdvice || ''}
                onChange={(e) => onAdviceChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-white"
                rows={3}
                placeholder="Advice"
              />
              <div className="flex gap-2">
                <button
                  onClick={onSaveEdit}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  <Save className="w-4 h-4 inline mr-1" />
                  Save
                </button>
                <button
                  onClick={onCancelEdit}
                  className="px-3 py-1 bg-slate-700 text-white rounded text-sm hover:bg-slate-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-white">{item.title}</h4>
                <div className="flex gap-2">
                  <button
                    onClick={onStartEditing}
                    className="p-1 text-slate-400 hover:text-white"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onToggleRulesBuilder}
                    className="p-1 text-slate-400 hover:text-indigo-400"
                    title="Add Rules"
                  >
                    <Target className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-slate-300 text-sm mb-2">{item.advice}</p>
              {item.ruleGroups && item.ruleGroups.length > 0 && (
                <div className="text-xs text-indigo-400 mb-2">
                  Has {item.ruleGroups.length} rule group(s)
                </div>
              )}
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span>Confidence: {(item.confidence * 100).toFixed(0)}%</span>
                {item.source && <span>Source: {item.source}</span>}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Rules Builder */}
      {isAddingRules && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="space-y-4">
            <RuleBuilder
              rules={rules}
              logic={logic}
              onRulesChange={onRulesChange}
              onLogicChange={onLogicChange}
              userFields={userFields}
            />
            <div className="flex gap-2">
              <button
                onClick={onSaveRules}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                Save Rules
              </button>
              <button
                onClick={onCancelRules}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

