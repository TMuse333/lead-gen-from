'use client';
import { useState, useEffect, JSX } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { Trash2, RefreshCw, Eye, EyeOff } from 'lucide-react';

// Import proper types
type MatchOperator = 'equals' | 'includes' | 'not_equals' | 'greater_than' | 'less_than' | 'between';
type LogicOperator = 'AND' | 'OR';

interface ConditionRule {
  field: string;
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
  applicableWhen?: {  // Make it optional
    flow?: string[];
    ruleGroups?: RuleGroup[];
    minMatchScore?: number;
  };
  createdAt: string;
  updatedAt?: string;
  usageCount?: number;
}

interface ViewAgentAdviceProps {
  onSwitchToAdd?: () => void;
}

export default function ViewAgentAdvice({ onSwitchToAdd }: ViewAgentAdviceProps) {
  const [adviceList, setAdviceList] = useState<AdviceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAdvice = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/get-agent-advice', {
        params: {
          limit: 100,
        },
      });

      if (res.data.success) {
        setAdviceList(res.data.advice);
      } else {
        setError('Failed to load advice');
      }
    } catch (err: unknown) {
      console.error(err);
      setError( 'Failed to load advice');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this advice?')) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await axios.delete('/api/get-agent-advice', {
        params: { id },
      });

      if (res.data.success) {
        setAdviceList(adviceList.filter((item) => item.id !== id));
      } else {
        alert('Failed to delete advice');
      }
    } catch (err: unknown) {
      console.error(err);
      alert( 'Failed to delete advice');
    } finally {
      setDeletingId(null);
    }
  };

  // Helper to render rule groups recursively
  const renderRuleGroup = (group: RuleGroup, depth = 0): JSX.Element => {
    return (
      <div className={`${depth > 0 ? 'ml-4 pl-4 border-l-2 border-black' : ''} space-y-2`}>
        <div className="text-xs font-semibold text-black">
          {group.logic} Group:
        </div>
        {group.rules.map((rule, idx) => {
          if ('logic' in rule) {
            // Nested RuleGroup
            return (
              <div key={idx} className="mt-2">
                {renderRuleGroup(rule as RuleGroup, depth + 1)}
              </div>
            );
          } else {
            // ConditionRule
            const condRule = rule as ConditionRule;
            return (
              <div key={idx} className="text-xs bg-gray-50 p-2 rounded">
                <span className="font-medium">{condRule.field}</span>{' '}
                <span className="text-black">{condRule.operator}</span>{' '}
                <span className="text-blue-600">
                  {Array.isArray(condRule.value) ? condRule.value.join(', ') : condRule.value}
                </span>
                {condRule.weight && (
                  <span className="ml-2 text-black">(weight: {condRule.weight})</span>
                )}
              </div>
            );
          }
        })}
      </div>
    );
  };

  useEffect(() => {
    fetchAdvice();
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="text-center py-12">
          <RefreshCw className="animate-spin mx-auto mb-4 text-blue-600" size={40} />
          <p className="text-gray-600">Loading your advice...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 mb-4">❌ {error}</p>
          <button
            onClick={fetchAdvice}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Advice Knowledge Base</h1>
          <p className="text-black mt-1">
            {adviceList.length} advice {adviceList.length === 1 ? 'piece' : 'pieces'} stored
          </p>
        </div>
        <button
          onClick={fetchAdvice}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Empty State */}
      {adviceList.length === 0 && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <p className="text-black mb-4">No advice added yet.</p>
          <button
            onClick={() => onSwitchToAdd?.()}
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Add Your First Advice
          </button>
        </div>
      )}

      {/* Advice List */}
      <div className="space-y-4">
        {adviceList.map((item) => {
          const isExpanded = expandedId === item.id;
          const hasRuleGroups = item.applicableWhen?.ruleGroups && item.applicableWhen.ruleGroups.length > 0;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition overflow-hidden"
            >
              {/* Header */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      {item.title}
                    </h3>

                    {/* Flow Pills */}
                    {item.applicableWhen?.flow && item.applicableWhen.flow.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {item.applicableWhen.flow.map((flowType) => (
                          <span
                            key={flowType}
                            className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs font-medium"
                          >
                            📊 {flowType}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Rule Groups Summary */}
                    {hasRuleGroups ? (
                      <div className="text-xs text-black">
                        🎯 Has {item.applicableWhen!.ruleGroups!.length} rule group{item.applicableWhen!.ruleGroups!.length > 1 ? 's' : ''}
                        {item.applicableWhen?.minMatchScore && (
                          <span className="ml-2">
                            (min score: {(item.applicableWhen.minMatchScore * 100).toFixed(0)}%)
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-black italic">
                        ✨ Universal advice (no conditions)
                      </div>
                    )}

                    {/* Usage Stats */}
                    {item.usageCount !== undefined && item.usageCount > 0 && (
                      <div className="mt-2 text-xs text-black">
                        📊 Used {item.usageCount} time{item.usageCount !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="p-2 text-gray-900 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                      title={isExpanded ? 'Hide advice' : 'Show advice'}
                    >
                      {isExpanded ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="p-2 text-gray-900 hover:text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
                      title="Delete advice"
                    >
                      {deletingId === item.id ? (
                        <RefreshCw size={20} className="animate-spin" />
                      ) : (
                        <Trash2 size={20} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Advice */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-4 pt-4 border-t border-gray-200"
                    >
                      <p className="text-sm font-semibold text-gray-900 mb-2">Your Advice:</p>
                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <p className="text-gray-800 whitespace-pre-wrap">{item.advice}</p>
                      </div>

                      {/* Rule Groups Display */}
                      {hasRuleGroups && (
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-gray-900 mb-2">Applicable When:</p>
                          <div className="bg-purple-50 p-4 rounded-lg space-y-3 text-black">
                            {item.applicableWhen!.ruleGroups!.map((group, idx) => (
                              <div key={idx}>
                                {renderRuleGroup(group)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="mt-3 text-xs text-gray-900 space-y-1">
                        <p>Added: {new Date(item.createdAt).toLocaleString()}</p>
                        {item.updatedAt && item.updatedAt !== item.createdAt && (
                          <p>Updated: {new Date(item.updatedAt).toLocaleString()}</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add More CTA */}
      {adviceList.length > 0 && (
        <div className="mt-8 text-center">
          <button
            onClick={() => onSwitchToAdd?.()}
            className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition shadow-md"
          >
            ➕ Add More Advice
          </button>
        </div>
      )}
    </div>
  );
}