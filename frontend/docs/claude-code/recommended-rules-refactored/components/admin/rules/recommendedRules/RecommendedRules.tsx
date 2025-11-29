// components/admin/rules/recommendedRules/RecommendedRules.tsx
'use client';

import { Sparkles, Loader2, AlertCircle, RefreshCw, Plus, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserConfig } from '@/contexts/UserConfigContext';
import { discoverFieldsFromFlows } from '@/lib/rules/fieldDiscovery';
import { useRecommendedRules } from './useRecommendedRules';
import RecommendationCard from './RecommendationCard';
import AttachRuleModal from './AttachRuleModal';

export default function RecommendedRules() {
  const { config } = useUserConfig();
  const flows = config?.conversationFlows ? Object.keys(config.conversationFlows) : [];
  const userFields = config?.conversationFlows
    ? discoverFieldsFromFlows(config.conversationFlows)
    : [];

  const { state, actions } = useRecommendedRules({
    flows,
    onError: (error) => console.error('Error:', error),
  });

  if (!config || flows.length === 0) {
    return (
      <div className="bg-slate-900 rounded-lg border border-slate-700 p-8 text-center">
        <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">No Flows Configured</h3>
        <p className="text-slate-400">
          Please configure conversation flows first to get rule recommendations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-lg border border-indigo-500/30 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-indigo-400" />
              Recommended Client Situations
            </h2>
            <p className="text-slate-300">
              AI-generated rules based on your conversation flows
            </p>
          </div>
        </div>

        {/* Flow Selector */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-slate-300">Filter by Flow:</label>
          <select
            value={state.selectedFlow}
            onChange={(e) => {
              actions.setSelectedFlow(e.target.value);
              actions.loadRecommendations(e.target.value || undefined);
            }}
            className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Flows</option>
            {flows.map((flow) => (
              <option key={flow} value={flow}>
                {flow}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <button
            onClick={() => actions.generateRecommendations(state.selectedFlow || undefined)}
            disabled={state.loading}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            {state.loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Generate with AI
              </>
            )}
          </button>

          <button
            onClick={() =>
              actions.generateRecommendations(state.selectedFlow || undefined, true)
            }
            disabled={state.loading}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Regenerate
          </button>
        </div>

        <button
          onClick={actions.cleanupRules}
          disabled={state.cleaning || !state.hasRecommendations}
          className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition disabled:opacity-50 flex items-center gap-2"
        >
          {state.cleaning ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Cleaning...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Clean Placeholders
            </>
          )}
        </button>
      </div>

      {/* Error Message */}
      {state.error && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="text-red-200 text-sm">{state.error}</div>
        </div>
      )}

      {/* Loading State */}
      {state.loading && state.recommendations.length === 0 && (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 text-indigo-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading recommendations...</p>
        </div>
      )}

      {/* Empty State */}
      {!state.loading && !state.hasRecommendations && (
        <div className="bg-slate-900 rounded-lg border border-slate-700 p-12 text-center">
          <Sparkles className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Recommendations Yet</h3>
          <p className="text-slate-400 mb-6">
            Click "Generate with AI" to get rule recommendations based on your flows
          </p>
        </div>
      )}

      {/* Recommendations List */}
      {state.recommendations.length > 0 && (
        <div className="space-y-4">
          <AnimatePresence>
            {state.recommendations.map((recommendation) => (
              <motion.div
                key={recommendation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <RecommendationCard
                  recommendation={recommendation}
                  userFields={userFields}
                  isEditing={state.editingId === recommendation.id}
                  onEdit={() =>
                    actions.updateRecommendation(recommendation.id, { ...recommendation })
                  }
                  onSave={(updates) => actions.updateRecommendation(recommendation.id, updates)}
                  onCancel={() =>
                    actions.updateRecommendation(recommendation.id, { ...recommendation })
                  }
                  onDelete={() => actions.deleteRecommendation(recommendation.id)}
                  onAttach={() => {
                    actions.setSelectedRuleForAttach(recommendation);
                    actions.setShowAttachModal(true);
                    actions.loadAdviceItems();
                  }}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Attach Rule Modal */}
      {state.showAttachModal && state.selectedRuleForAttach && (
        <AttachRuleModal
          selectedRule={state.selectedRuleForAttach}
          adviceItems={state.adviceItems}
          onClose={() => {
            actions.setShowAttachModal(false);
            actions.setSelectedRuleForAttach(null);
          }}
          onSuccess={() => {
            actions.setShowAttachModal(false);
            actions.setSelectedRuleForAttach(null);
          }}
        />
      )}
    </div>
  );
}
