// components/admin/rules/recommendedRules/types.ts

import type { RuleRecommendation } from '@/lib/rules/ruleTypes';

export interface AdviceItem {
  id: string;
  title: string;
  advice: string;
  tags?: string[];
  applicableWhen?: {
    flow?: string[];
    ruleGroups?: any[];
  };
}

export interface RecommendedRulesState {
  recommendations: RuleRecommendation[];
  loading: boolean;
  error: string | null;
  selectedFlow: string;
  hasRecommendations: boolean;
  editingId: string | null;
  editingRule: RuleRecommendation | null;
  showManualForm: boolean;
  showSaveAllModal: boolean;
  adviceItems: AdviceItem[];
  selectedAdviceIds: Set<string>;
  savingAll: boolean;
  cleaning: boolean;
  attachingToId: string | null;
  showAttachModal: boolean;
  selectedRuleForAttach: RuleRecommendation | null;
  adviceSearchQuery: string;
}

export interface SearchHighlightProps {
  text: string;
  searchQuery: string;
  className?: string;
}
