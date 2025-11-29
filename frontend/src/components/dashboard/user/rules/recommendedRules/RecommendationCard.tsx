// components/dashboard/user/rules/recommendedRules/RecommendationCard.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { AlertCircle, Edit2, Trash2, Plus, Save, X } from 'lucide-react';
import EditableRuleGroup from '../EditableRuleGroup';
import { hasPlaceholderValuesInRuleGroup, getPlaceholderWarning } from '@/lib/rules/fieldValidation';
import { RULE_TERMINOLOGY } from '@/lib/rules/terminology';
import { smartRuleGroupToRuleGroup, ruleGroupToSmartRuleGroup } from '@/lib/rules/ruleConverter';
import type { RuleRecommendation } from '@/lib/rules/ruleTypes';
import type { UserField } from '@/lib/rules/fieldDiscovery';

interface RecommendationCardProps {
  recommendation: RuleRecommendation;
  userFields: UserField[];
  isEditing: boolean;
  onEdit: () => void;
  onSave: (updates: Partial<RuleRecommendation>) => void;
  onCancel: () => void;
  onDelete: () => void;
  onAttach: () => void;
}

export default function RecommendationCard({
  recommendation,
  userFields,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onAttach,
}: RecommendationCardProps) {
  const [editedRule, setEditedRule] = useState<RuleRecommendation>(recommendation);

  // Sync editedRule with recommendation prop when entering edit mode
  useEffect(() => {
    if (isEditing) {
      setEditedRule(recommendation);
    }
  }, [isEditing, recommendation.id]); // Only sync when entering edit mode or recommendation ID changes

  // Convert SmartRuleGroup to RuleGroup for validation
  const ruleGroupForValidation = smartRuleGroupToRuleGroup(recommendation.ruleGroup);
  const hasPlaceholders = hasPlaceholderValuesInRuleGroup(ruleGroupForValidation);
  const placeholderWarning = hasPlaceholders ? getPlaceholderWarning(ruleGroupForValidation) : null;

  const handleSave = () => {
    onSave(editedRule);
  };

  if (isEditing) {
    // Convert SmartRuleGroup to RuleGroup for editing
    const convertedRuleGroup = smartRuleGroupToRuleGroup(editedRule.ruleGroup);
    
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border border-indigo-500/50 p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
          <input
            type="text"
            value={editedRule.title}
            onChange={(e) => setEditedRule((prev) => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
          <textarea
            value={editedRule.description}
            onChange={(e) => setEditedRule((prev) => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white"
            rows={3}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            {RULE_TERMINOLOGY.ruleGroup}
          </label>
          <EditableRuleGroup
            key={`edit-${editedRule.id}-${convertedRuleGroup.logic}`}
            ruleGroup={convertedRuleGroup}
            onUpdate={(updated) => {
              const smartRuleGroup = ruleGroupToSmartRuleGroup(updated);
              setEditedRule((prev) => ({ ...prev, ruleGroup: smartRuleGroup }));
            }}
            userFields={userFields}
          />
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition"
          >
            <X className="h-4 w-4 inline mr-2" />
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Save className="h-4 w-4 inline mr-2" />
            Save Changes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border border-slate-700 p-6 hover:border-indigo-500/50 transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">{recommendation.title}</h3>
          <p className="text-slate-300 text-sm">{recommendation.description}</p>
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={onEdit}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition"
            title="Edit"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {hasPlaceholders && placeholderWarning && (
        <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-yellow-200">
            <strong>Warning:</strong> {placeholderWarning}
          </div>
        </div>
      )}

      <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
        <h4 className="text-sm font-medium text-slate-300 mb-3">{RULE_TERMINOLOGY.ruleGroup}</h4>
        <EditableRuleGroup
          ruleGroup={smartRuleGroupToRuleGroup(recommendation.ruleGroup)}
          onUpdate={() => {}}
          userFields={userFields}
        />
      </div>

      <div className="flex gap-3 justify-end">
        <button
          onClick={onAttach}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Attach to Advice Items
        </button>
      </div>
    </div>
  );
}
