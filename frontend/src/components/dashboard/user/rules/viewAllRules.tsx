// components/dashboard/user/rules/viewAllRules.tsx
// View all rules currently in Qdrant

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Loader2, AlertCircle, Filter, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { discoverFieldsFromFlows } from '@/lib/rules/fieldDiscovery';
import { useUserConfig } from '@/contexts/UserConfigContext';

type MatchOperator = 'equals' | 'includes' | 'not_equals' | 'greater_than' | 'less_than' | 'between';
type LogicOperator = 'AND' | 'OR';

interface ConditionRule {
  field: string | { fieldId: string; concept?: string; label?: string };
  operator: MatchOperator;
  value: string | string[];
  weight?: number;
}

interface RuleGroup {
  logic: LogicOperator;
  rules: (ConditionRule | RuleGroup)[];
}

interface AdviceItem {
  id: string;
  title: string;
  advice: string;
  tags: string[];
  applicableWhen?: {
    flow?: string[];
    ruleGroups?: RuleGroup[];
    conditions?: Record<string, string[]>;
    minMatchScore?: number;
  };
  createdAt: string;
  updatedAt?: string;
}

export default function ViewAllRules() {
  const { config } = useUserConfig();
  const [adviceList, setAdviceList] = useState<AdviceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterFlow, setFilterFlow] = useState<string>('');

  const userFields = config?.conversationFlows 
    ? discoverFieldsFromFlows(config.conversationFlows)
    : [];

  const flows = config?.conversationFlows ? Object.keys(config.conversationFlows) : [];

  const fetchAdvice = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/api/agent-advice/get', {
        params: { limit: 1000 },
      });

      if (res.data.success) {
        setAdviceList(res.data.advice || []);
      } else {
        setError('Failed to load advice');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to load advice');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvice();
  }, []);

  // Filter advice items that have rules
  const itemsWithRules = adviceList.filter(item => {
    const hasRuleGroups = item.applicableWhen?.ruleGroups && item.applicableWhen.ruleGroups.length > 0;
    const hasConditions = item.applicableWhen?.conditions && Object.keys(item.applicableWhen.conditions).length > 0;
    
    if (!hasRuleGroups && !hasConditions) return false;
    
    if (filterFlow && item.applicableWhen?.flow) {
      return item.applicableWhen.flow.includes(filterFlow);
    }
    
    return true;
  });

  // Helper to get field label
  const getFieldLabel = (field: string | { fieldId: string; concept?: string; label?: string }): string => {
    if (typeof field === 'string') {
      const matchingField = userFields.find(f => f.fieldId === field);
      return matchingField?.label || field;
    }
    return field.label || field.fieldId || field.concept || 'Unknown Field';
  };

  // Render rule groups recursively
  const renderRuleGroup = (group: RuleGroup, depth = 0): JSX.Element => {
    return (
      <div className={`${depth > 0 ? 'ml-4 pl-4 border-l-2 border-slate-700' : ''} space-y-2`}>
        <div className="text-xs font-semibold text-indigo-400">
          {group.logic} Group:
        </div>
        {group.rules.map((rule, idx) => {
          if ('logic' in rule) {
            return (
              <div key={idx} className="mt-2">
                {renderRuleGroup(rule as RuleGroup, depth + 1)}
              </div>
            );
          } else {
            const condRule = rule as ConditionRule;
            const fieldLabel = getFieldLabel(condRule.field);
            return (
              <div
                key={idx}
                className="text-xs bg-slate-900 p-2 rounded border border-slate-700"
              >
                <span className="font-medium text-slate-300">{fieldLabel}</span>{' '}
                <span className="text-slate-400">{condRule.operator}</span>{' '}
                <span className="text-indigo-400 font-semibold">
                  {Array.isArray(condRule.value) ? condRule.value.join(' or ') : condRule.value}
                </span>
                {condRule.weight && condRule.weight > 1 && (
                  <span className="ml-2 text-slate-400">(weight: {condRule.weight})</span>
                )}
              </div>
            );
          }
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400 mx-auto mb-4" />
        <p className="text-slate-400">Loading rules...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-400">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
        <button
          onClick={fetchAdvice}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">All Client Situations</h2>
          <p className="text-slate-400 mb-2">
            View all client situations currently attached to your advice items. These are different situations your clients could be in that determine which advice they receive.
          </p>
          <p className="text-sm text-slate-500">
            Here are the different situations your clients could be in based on their conversation answers. Each advice item can be targeted to specific client situations.
          </p>
        </div>
        <button
          onClick={fetchAdvice}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Flow Filter */}
      {flows.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <label className="text-sm font-medium text-slate-300">Filter by Flow:</label>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterFlow('')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filterFlow === ''
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              All Flows
            </button>
            {flows.map((flow) => (
              <button
                key={flow}
                onClick={() => setFilterFlow(flow)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filterFlow === flow
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {flow.charAt(0).toUpperCase() + flow.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-white">{itemsWithRules.length}</div>
            <div className="text-sm text-slate-400">Items with Client Situations</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {itemsWithRules.reduce((sum, item) => {
                const ruleGroups = item.applicableWhen?.ruleGroups || [];
                return sum + ruleGroups.length;
              }, 0)}
            </div>
            <div className="text-sm text-slate-400">Total Situation Groups</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{adviceList.length}</div>
            <div className="text-sm text-slate-400">Total Advice Items</div>
          </div>
        </div>
      </div>

      {/* Client Situations List */}
      {itemsWithRules.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
          <p className="text-slate-400 mb-4">No client situations found</p>
          <p className="text-sm text-slate-500">
            {filterFlow 
              ? `No advice items with client situations for the "${filterFlow}" flow`
              : 'Add client situations to your advice items to see them here'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {itemsWithRules.map((item) => {
            const isExpanded = expandedId === item.id;
            const ruleGroups = item.applicableWhen?.ruleGroups || [];
            const conditions = item.applicableWhen?.conditions || {};

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl hover:shadow-2xl transition overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-white mb-2">
                        {item.title}
                      </h3>
                      
                      {/* Flow Pills */}
                      {item.applicableWhen?.flow && item.applicableWhen.flow.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {item.applicableWhen.flow.map((flowType) => (
                            <span
                              key={flowType}
                              className="bg-indigo-900/50 text-indigo-400 px-2 py-1 rounded text-xs font-medium border border-indigo-700"
                            >
                              {flowType}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Client Situation Count */}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-purple-900/50 text-purple-300 border border-purple-700">
                          {ruleGroups.length} Situation Group{ruleGroups.length !== 1 ? 's' : ''}
                        </span>
                        {Object.keys(conditions).length > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-900/50 text-blue-300 border border-blue-700">
                            {Object.keys(conditions).length} Simple Condition{Object.keys(conditions).length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className={`p-2 rounded-full hover:bg-slate-700/50 transition ${
                        isExpanded ? 'text-indigo-400' : 'text-slate-400'
                      }`}
                      title={isExpanded ? 'Hide details' : 'Show details'}
                    >
                      {isExpanded ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  {/* Expanded Rules */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-700 space-y-4">
                      {/* Client Situation Groups */}
                      {ruleGroups.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-slate-200 mb-2">Client Situation Groups:</p>
                          <div className="bg-purple-900/30 p-4 rounded-lg space-y-3 text-slate-300 border border-purple-700">
                            {ruleGroups.map((group, idx) => (
                              <div key={idx}>
                                {renderRuleGroup(group)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Simple Conditions */}
                      {Object.keys(conditions).length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-slate-200 mb-2">Simple Conditions:</p>
                          <div className="bg-blue-900/30 p-4 rounded-lg space-y-2 border border-blue-700">
                            {Object.entries(conditions).map(([field, values]) => {
                              const fieldLabel = getFieldLabel(field);
                              return (
                                <div key={field} className="text-xs bg-slate-900 p-2 rounded border border-slate-700">
                                  <span className="font-medium text-slate-300">{fieldLabel}</span>{' '}
                                  <span className="text-slate-400">includes</span>{' '}
                                  <span className="text-blue-400 font-semibold">
                                    {Array.isArray(values) ? values.join(' or ') : values}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Advice Preview */}
                      <div>
                        <p className="text-sm font-semibold text-slate-200 mb-2">Advice Content:</p>
                        <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                          <p className="text-slate-300 text-sm">{item.advice}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

