// components/admin/rules/recommendedRules/useRecommendedRules.ts

import { useState, useEffect } from 'react';
import type { RuleRecommendation } from '@/lib/rules/ruleTypes';
import type { AdviceItem, RecommendedRulesState } from './types';
import * as api from './api';

interface UseRecommendedRulesProps {
  flows: string[];
  onError?: (error: string) => void;
}

export function useRecommendedRules({ flows, onError }: UseRecommendedRulesProps) {
  const [state, setState] = useState<RecommendedRulesState>({
    recommendations: [],
    loading: false,
    error: null,
    selectedFlow: '',
    hasRecommendations: false,
    editingId: null,
    editingRule: null,
    showManualForm: false,
    showSaveAllModal: false,
    adviceItems: [],
    selectedAdviceIds: new Set(),
    savingAll: false,
    cleaning: false,
    attachingToId: null,
    showAttachModal: false,
    selectedRuleForAttach: null,
    adviceSearchQuery: '',
  });

  // Fetch saved recommendations
  const loadRecommendations = async (flow?: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const result = await api.fetchSavedRecommendations(flow);
      setState((prev) => ({
        ...prev,
        recommendations: result.recommendations,
        hasRecommendations: result.hasRecommendations,
        loading: false,
      }));
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to load recommendations';
      setState((prev) => ({ ...prev, error: errorMsg, loading: false }));
      onError?.(errorMsg);
    }
  };

  // Generate with AI
  const generateRecommendations = async (flow?: string, forceRegenerate = false) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const result = await api.generateWithAI(flow, forceRegenerate);
      setState((prev) => ({
        ...prev,
        recommendations: result.recommendations,
        hasRecommendations: true,
        loading: false,
      }));
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to generate recommendations';
      setState((prev) => ({ ...prev, error: errorMsg, loading: false }));
      onError?.(errorMsg);
    }
  };

  // Clean up rules
  const cleanupRules = async () => {
    if (!confirm('This will remove rules that contain placeholder values. Continue?')) {
      return;
    }

    setState((prev) => ({ ...prev, cleaning: true }));

    try {
      const result = await api.cleanupRules(state.selectedFlow || undefined);
      alert(`✅ Cleaned ${result.cleaned} rule(s), removed ${result.removed} invalid rule(s)`);
      await loadRecommendations(state.selectedFlow || undefined);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to clean rules';
      alert(errorMsg);
      onError?.(errorMsg);
    } finally {
      setState((prev) => ({ ...prev, cleaning: false }));
    }
  };

  // Delete recommendation
  const deleteRecommendation = async (recommendationId: string) => {
    if (!confirm('Are you sure you want to delete this recommendation?')) {
      return;
    }

    try {
      await api.deleteRecommendation(recommendationId, state.selectedFlow || undefined);
      setState((prev) => {
        const newRecommendations = prev.recommendations.filter((r) => r.id !== recommendationId);
        return {
          ...prev,
          recommendations: newRecommendations,
          hasRecommendations: newRecommendations.length > 0,
        };
      });
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to delete recommendation';
      alert(errorMsg);
      onError?.(errorMsg);
    }
  };

  // Update recommendation
  const updateRecommendation = async (
    recommendationId: string,
    updates: Partial<RuleRecommendation>
  ) => {
    try {
      const updated = await api.updateRecommendation(
        recommendationId,
        updates,
        state.selectedFlow || undefined
      );
      setState((prev) => ({
        ...prev,
        recommendations: prev.recommendations.map((r) =>
          r.id === recommendationId ? { ...r, ...updated } : r
        ),
        editingId: null,
        editingRule: null,
      }));
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to update recommendation';
      alert(errorMsg);
      onError?.(errorMsg);
    }
  };

  // Set editing state
  const setEditingId = (id: string | null) => {
    setState((prev) => ({ ...prev, editingId: id }));
  };

  const setEditingRule = (rule: RuleRecommendation | null) => {
    setState((prev) => ({ ...prev, editingRule: rule }));
  };

  // Fetch advice items
  const loadAdviceItems = async () => {
    try {
      const items = await api.fetchAdviceItems();
      setState((prev) => ({ ...prev, adviceItems: items }));
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to fetch advice items';
      alert(errorMsg);
      onError?.(errorMsg);
    }
  };

  // Toggle advice item selection
  const toggleAdviceSelection = (id: string) => {
    setState((prev) => {
      const newSelected = new Set(prev.selectedAdviceIds);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return { ...prev, selectedAdviceIds: newSelected };
    });
  };

  // Set state helpers
  const setSelectedFlow = (flow: string) => {
    setState((prev) => ({ ...prev, selectedFlow: flow }));
  };

  const setShowAttachModal = (show: boolean) => {
    setState((prev) => ({ ...prev, showAttachModal: show }));
  };

  const setSelectedRuleForAttach = (rule: RuleRecommendation | null) => {
    setState((prev) => ({ ...prev, selectedRuleForAttach: rule }));
  };

  const setAdviceSearchQuery = (query: string) => {
    setState((prev) => ({ ...prev, adviceSearchQuery: query }));
  };

  const setShowManualForm = (show: boolean) => {
    setState((prev) => ({ ...prev, showManualForm: show }));
  };

  // Load initial data
  useEffect(() => {
    if (flows.length > 0) {
      loadRecommendations();
    }
  }, [state.selectedFlow]);

  return {
    state,
    actions: {
      loadRecommendations,
      generateRecommendations,
      cleanupRules,
      deleteRecommendation,
      updateRecommendation,
      loadAdviceItems,
      toggleAdviceSelection,
      setSelectedFlow,
      setShowAttachModal,
      setSelectedRuleForAttach,
      setAdviceSearchQuery,
      setShowManualForm,
      setEditingId,
      setEditingRule,
    },
  };
}
