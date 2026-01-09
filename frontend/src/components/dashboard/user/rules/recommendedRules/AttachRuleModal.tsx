// components/dashboard/user/rules/recommendedRules/AttachRuleModal.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Search, Loader2, Plus, AlertCircle } from 'lucide-react';
import axios from 'axios';
import AdviceItemCard from './AdviceItemCard';
import { filterAdviceItems } from './utils';
import { smartRuleGroupToRuleGroup } from '@/lib/rules/ruleConverter';
import type { RuleRecommendation } from '@/lib/rules/ruleTypes';
import type { AdviceItem } from './types';

interface AttachRuleModalProps {
  selectedRule: RuleRecommendation | null;
  adviceItems: AdviceItem[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function AttachRuleModal({
  selectedRule,
  adviceItems,
  onClose,
  onSuccess,
}: AttachRuleModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [attaching, setAttaching] = useState(false);

  if (!selectedRule) return null;

  const filteredItems = filterAdviceItems(adviceItems, searchQuery);

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleAttach = async () => {
    if (selectedIds.size === 0) {
      alert('Please select at least one advice item');
      return;
    }

    setAttaching(true);
    try {
      // Convert SmartRuleGroup to RuleGroup for Qdrant
      const ruleGroupForQdrant = smartRuleGroupToRuleGroup(selectedRule.ruleGroup);

      const response = await axios.post('/api/rules/attach', {
        ruleId: selectedRule.id,
        adviceItemIds: Array.from(selectedIds),
        ruleGroup: ruleGroupForQdrant,
      });

      if (response.data.success) {
        alert(
          `Successfully attached "${selectedRule.title}" to ${
            response.data.rulesAttached || selectedIds.size
          } advice item(s)`
        );
        onSuccess();
        onClose();
      } else {
        alert(response.data.error || 'Failed to attach client situation');
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to attach client situation');
    } finally {
      setAttaching(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">
            Attach "{selectedRule.title}" to Advice Items
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search advice items by title, content, tags, or flow..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Advice Items List */}
        <div className="flex-1 overflow-y-auto space-y-2 mb-4">
          {adviceItems.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No advice items found</p>
              <p className="text-xs mt-1">Create some advice items first</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p>No advice items match "{searchQuery}"</p>
              <p className="text-xs mt-2">
                Try a different search term. {adviceItems.length} total item(s) available.
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <AdviceItemCard
                key={item.id}
                item={item}
                isSelected={selectedIds.has(item.id)}
                searchQuery={searchQuery}
                onToggleSelection={toggleSelection}
              />
            ))
          )}
        </div>

        {/* Search Results Count */}
        {searchQuery && adviceItems.length > 0 && (
          <div className="mb-4 text-xs text-slate-500">
            Showing {filteredItems.length} of {adviceItems.length} advice item(s)
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-slate-700">
          <button
            onClick={() => {
              onClose();
              setSelectedIds(new Set());
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleAttach}
            disabled={attaching || selectedIds.size === 0}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            {attaching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Attaching...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Attach to {selectedIds.size} Item{selectedIds.size !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
