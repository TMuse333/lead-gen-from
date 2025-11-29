// components/documentExtractor/steps/ReviewStep.tsx

import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import ExtractedItemCard from '../components/ExtractedItemCard';
import type { ExtractedItem, ConditionRule, LogicOperator } from '../types';
import type { UserField } from '@/lib/rules/fieldDiscovery';

interface ReviewStepProps {
  extractedItems: ExtractedItem[];
  selectedItems: Set<number>;
  addingRulesTo: number | null;
  itemRules: Record<number, ConditionRule[]>;
  itemLogic: Record<number, LogicOperator>;
  userFields: UserField[];
  loading: boolean;
  onToggleSelection: (index: number) => void;
  onStartEditing: (index: number) => void;
  onSaveEdit: (index: number) => void;
  onCancelEdit: (index: number) => void;
  onItemChange: (index: number, updates: Partial<ExtractedItem>) => void;
  onToggleRulesBuilder: (index: number) => void;
  onRulesChange: (index: number, rules: ConditionRule[]) => void;
  onLogicChange: (index: number, logic: LogicOperator) => void;
  onSaveRules: (index: number) => void;
  onCancelRules: (index: number) => void;
  onBack: () => void;
  onUpload: () => void;
}

export default function ReviewStep({
  extractedItems,
  selectedItems,
  addingRulesTo,
  itemRules,
  itemLogic,
  userFields,
  loading,
  onToggleSelection,
  onStartEditing,
  onSaveEdit,
  onCancelEdit,
  onItemChange,
  onToggleRulesBuilder,
  onRulesChange,
  onLogicChange,
  onSaveRules,
  onCancelRules,
  onBack,
  onUpload,
}: ReviewStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-bold text-white mb-2">Review Extracted Items</h3>
        <p className="text-slate-400">
          Review, edit, and select which items to upload to your knowledge base
        </p>
      </div>

      <div className="space-y-3">
        {extractedItems.map((item, index) => (
          <ExtractedItemCard
            key={index}
            item={item}
            index={index}
            isSelected={selectedItems.has(index)}
            isAddingRules={addingRulesTo === index}
            rules={itemRules[index] || []}
            logic={itemLogic[index] || 'AND'}
            userFields={userFields}
            onToggleSelection={() => onToggleSelection(index)}
            onStartEditing={() => onStartEditing(index)}
            onSaveEdit={() => onSaveEdit(index)}
            onCancelEdit={() => onCancelEdit(index)}
            onTitleChange={(value) => onItemChange(index, { editedTitle: value })}
            onAdviceChange={(value) => onItemChange(index, { editedAdvice: value })}
            onToggleRulesBuilder={() => onToggleRulesBuilder(index)}
            onRulesChange={(rules) => onRulesChange(index, rules)}
            onLogicChange={(logic) => onLogicChange(index, logic)}
            onSaveRules={() => onSaveRules(index)}
            onCancelRules={() => onCancelRules(index)}
          />
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-700">
        <div className="text-sm text-slate-400">
          {selectedItems.size} of {extractedItems.length} items selected
        </div>
        <div className="flex gap-4">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition"
          >
            <ArrowLeft className="w-4 h-4 inline mr-2" />
            Back
          </button>
          <button
            onClick={onUpload}
            disabled={selectedItems.size === 0 || loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                Upload {selectedItems.size} Item{selectedItems.size !== 1 ? 's' : ''}
                <ArrowRight className="w-4 h-4 inline ml-2" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

