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
        // Assuming the API returns advice under res.data.advice based on original file's error handling.
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

  useEffect(() => {
    fetchAdvice();
  }, []);
  
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

  // Helper to render rule groups recursively (Restored and refactored)
  const renderRuleGroup = (group: RuleGroup, depth = 0): JSX.Element => {
    return (
      <div 
        // Dark theme: Indent and change border color
        className={`${depth > 0 ? 'ml-4 pl-4 border-l-2 border-slate-700' : ''} space-y-2`}
      >
        <div 
          // Dark theme: Change text color
          className="text-xs font-semibold text-indigo-400"
        >
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
              <div 
                key={idx} 
                // Dark theme: Card background and border for individual rule
                className="text-xs bg-slate-900 p-2 rounded border border-slate-700"
              >
                <span className="font-medium text-slate-300">{condRule.field}</span>{' '}
                <span className="text-slate-400">{condRule.operator}</span>{' '}
                <span className="text-indigo-400 font-semibold">
                  {/* Join with 'or' for readability of 'includes' or 'between' values */}
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
      <div className="max-w-5xl mx-auto p-6">
        <div className="text-center py-12">
          {/* Dark theme: Icon color */}
          <RefreshCw className="animate-spin mx-auto mb-4 text-indigo-400" size={40} />
          {/* Dark theme: Text color */}
          <p className="text-slate-400">Loading your advice...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        {/* Dark theme: Error card background/border/text */}
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-6 text-center">
          <p className="text-red-400 mb-4">❌ {error}</p>
          <button
            onClick={fetchAdvice}
            // Dark theme: Button colors
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    // Note: Max-width and padding were applied in Dashboard for the content container
    <div className="relative">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          {/* Dark theme: Text color */}
          <h1 className="text-3xl font-bold text-white">Your Advice Knowledge Base</h1>
          <p className="text-slate-300 mt-1">
            {adviceList.length} advice {adviceList.length === 1 ? 'piece' : 'pieces'} stored
          </p>
        </div>
        <button
          onClick={fetchAdvice}
          // Dark theme: Button colors
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Empty State */}
      {adviceList.length === 0 && (
        // Dark theme: Empty state background/border/text
        <div className="bg-slate-900/50 border-2 border-dashed border-slate-700 rounded-lg p-12 text-center">
          <p className="text-slate-400 mb-4">No advice added yet.</p>
          <button
            onClick={() => onSwitchToAdd?.()}
            // Dark theme: Button colors
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
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
              // Dark theme: Card background/border/shadow
              className={`bg-slate-800 border border-slate-700 rounded-lg shadow-xl hover:shadow-2xl transition overflow-hidden`}
            >
              {/* Header */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Dark theme: Title color */}
                    <h3 className="font-semibold text-lg text-white mb-2">
                      {item.title}
                    </h3>

                    {/* Flow Pills */}
                    {item.applicableWhen?.flow && item.applicableWhen.flow.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {item.applicableWhen.flow.map((flowType) => (
                          <span
                            key={flowType}
                            // Dark theme: Pill colors
                            className="bg-indigo-900/50 text-indigo-400 px-2 py-1 rounded text-xs font-medium border border-indigo-700"
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
                            // Dark theme: Pill colors
                            className="bg-blue-900/50 text-blue-400 px-2 py-1 rounded text-xs border border-blue-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Rule Groups Summary */}
                    {hasRuleGroups ? (
                      <div className="text-xs text-slate-300">
                        🎯 Has {item.applicableWhen!.ruleGroups!.length} rule group{item.applicableWhen!.ruleGroups!.length > 1 ? 's' : ''}
                        {item.applicableWhen?.minMatchScore && (
                          <span className="ml-2 text-indigo-400 font-medium">
                            (min score: {(item.applicableWhen.minMatchScore * 100).toFixed(0)}%)
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 italic">
                        ✨ Universal advice (no conditions)
                      </div>
                    )}
                    
                    {/* Usage Stats */}
                    {item.usageCount !== undefined && item.usageCount > 0 && (
                      <div className="mt-2 text-xs text-slate-400">
                        📊 Used {item.usageCount} time{item.usageCount !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {/* Expand/Collapse Button */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      // Dark theme: Toggle button styles
                      className={`p-2 rounded-full hover:bg-slate-700/50 transition ${
                        isExpanded ? 'text-indigo-400' : 'text-slate-400'
                      }`}
                      title={isExpanded ? 'Hide advice' : 'Show advice'}
                    >
                      {isExpanded ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                    
                    {/* Delete Button */}
                    <button
                      // onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      // Dark theme: Delete button styles
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-900/30 rounded-full transition disabled:opacity-50"
                      title="Delete advice"
                    >
                      {deletingId === item.id ? (
                        <RefreshCw size={20} className="animate-spin text-red-500" />
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
                      // Dark theme: Separator
                      className="mt-4 pt-4 border-t border-slate-700"
                    >
                      {/* Dark theme: Subheading color */}
                      <p className="text-sm font-semibold text-slate-200 mb-2">Your Advice:</p>
                      {/* Dark theme: Advice content container */}
                      <div className="bg-slate-900 p-4 rounded-lg mb-4 border border-slate-700">
                        <p className="text-slate-300 whitespace-pre-wrap">{item.advice}</p>
                      </div>

                      {/* Rule Groups Display */}
                      {hasRuleGroups && (
                        <div className="mb-4">
                          {/* Dark theme: Subheading color */}
                          <p className="text-sm font-semibold text-slate-200 mb-2">Applicable When:</p>
                          {/* Dark theme: Rule container background and border */}
                          <div className="bg-purple-900/30 p-4 rounded-lg space-y-3 text-slate-300 border border-purple-700">
                            {item.applicableWhen!.ruleGroups!.map((group, idx) => (
                              <div key={idx}>
                                {renderRuleGroup(group)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Metadata */}
                      {/* Dark theme: Metadata text color */}
                      <div className="mt-3 text-xs text-slate-400 space-y-1">
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
            // Dark theme: CTA button gradient
            className="inline-block bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-blue-700 transition shadow-md font-semibold"
          >
            ➕ Add More Advice
          </button>
        </div>
      )}
    </div>
  );
}