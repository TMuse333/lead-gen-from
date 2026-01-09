'use client';
import { useState, useEffect, JSX } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { Trash2, RefreshCw, Eye, EyeOff, Edit2, Plus, X, Save, Filter, CheckCircle2, Wand2, Loader2 } from 'lucide-react';

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingRulesId, setAddingRulesId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', advice: '' });
  const [recommendedRules, setRecommendedRules] = useState<any[]>([]);
  const [selectedRuleIds, setSelectedRuleIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [suggestingRules, setSuggestingRules] = useState(false);
  const [aiSuggestedRules, setAiSuggestedRules] = useState<any[]>([]);

  const fetchAdvice = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/agent-advice/get', {
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
      setError( 'Failed to load advice');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvice();
  }, []);

  // Fetch recommended rules when opening add rules modal
  const fetchRecommendedRules = async () => {
    try {
      const res = await axios.get('/api/rules/recommendations');
      if (res.data.success) {
        setRecommendedRules(res.data.recommendations || []);
      }
    } catch (err) {
      setRecommendedRules([]);
    }
  };

  // Suggest rules with AI for a specific advice item
  const suggestRulesWithAI = async (item: AdviceItem) => {
    setSuggestingRules(true);
    try {
      const res = await axios.post('/api/rules/suggest-for-advice', {
        adviceTitle: item.title,
        adviceText: item.advice,
        flows: item.applicableWhen?.flow || [],
      });
      if (res.data.success) {
        setAiSuggestedRules(res.data.recommendations || []);
        // Merge with existing recommended rules
        const merged = [...(res.data.recommendations || []), ...recommendedRules];
        setRecommendedRules(merged);
      } else {
        alert(res.data.error || 'Failed to generate rule suggestions');
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to generate rule suggestions');
    } finally {
      setSuggestingRules(false);
    }
  };

  // Handle edit advice
  const handleEdit = (item: AdviceItem) => {
    setEditForm({ title: item.title, advice: item.advice });
    setEditingId(item.id);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    if (!editForm.title.trim() || !editForm.advice.trim()) {
      alert('Title and advice cannot be empty');
      return;
    }

    setSaving(true);
    try {
      const res = await axios.put('/api/agent-advice/update', {
        id: editingId,
        title: editForm.title,
        advice: editForm.advice,
      });

      if (res.data.success) {
        // Update local state
        setAdviceList(adviceList.map(item => 
          item.id === editingId 
            ? { ...item, title: editForm.title, advice: editForm.advice, updatedAt: new Date().toISOString() }
            : item
        ));
        setEditingId(null);
        setEditForm({ title: '', advice: '' });
      } else {
        alert('Failed to update advice');
      }
    } catch (err) {
      alert('Failed to update advice');
    } finally {
      setSaving(false);
    }
  };

  // Handle add rules
  const handleAddRules = async (adviceId: string) => {
    setAddingRulesId(adviceId);
    await fetchRecommendedRules();
  };

  const handleSaveRules = async () => {
    if (!addingRulesId || selectedRuleIds.size === 0) {
      alert('Please select at least one rule');
      return;
    }

    setSaving(true);
    try {
      const res = await axios.post('/api/rules/attach', {
        adviceItemId: addingRulesId,
        ruleIds: Array.from(selectedRuleIds),
      });

      if (res.data.success) {
        // Refresh advice list
        await fetchAdvice();
        setAddingRulesId(null);
        setSelectedRuleIds(new Set());
      } else {
        alert(res.data.error || 'Failed to attach rules');
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to attach rules');
    } finally {
      setSaving(false);
    }
  };

  // Truncate advice text
  const truncateText = (text: string, maxLength: number = 150): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this advice?')) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await axios.delete('/api/agent-advice/get', {
        params: { id },
      });

      if (res.data.success) {
        setAdviceList(adviceList.filter((item) => item.id !== id));
      } else {
        alert('Failed to delete advice');
      }
    } catch (err: unknown) {
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

                    {/* Rule Type Badge */}
                    <div className="flex items-center gap-2 mt-2">
                      {hasRuleGroups ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-purple-900/50 text-purple-300 border border-purple-700">
                          🔧 Complex Rules
                        </span>
                      ) : item.applicableWhen?.flow && item.applicableWhen.flow.length > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-900/50 text-blue-300 border border-blue-700">
                          🎯 Flow-Based
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-slate-700/50 text-slate-300 border border-slate-600">
                          🌐 Universal
                        </span>
                      )}
                      {hasRuleGroups && item.applicableWhen?.minMatchScore && (
                        <span className="text-xs text-slate-400">
                          (min score: {(item.applicableWhen.minMatchScore * 100).toFixed(0)}%)
                        </span>
                      )}
                    </div>
                    
                    {/* Usage Stats */}
                    {item.usageCount !== undefined && item.usageCount > 0 && (
                      <div className="mt-2 text-xs text-slate-400">
                        📊 Used {item.usageCount} time{item.usageCount !== 1 ? 's' : ''}
                      </div>
                    )}

                    {/* Advice Preview (Truncated) */}
                    <div className="mt-3">
                      <p className="text-sm text-slate-300 line-clamp-3">
                        {truncateText(item.advice, 150)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      {/* Edit Button */}
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-900/30 rounded-full transition"
                        title="Edit advice"
                      >
                        <Edit2 size={20} />
                      </button>
                      
                      {/* Add Rules Button */}
                      <button
                        onClick={() => handleAddRules(item.id)}
                        className="p-2 text-slate-400 hover:text-purple-400 hover:bg-purple-900/30 rounded-full transition"
                        title="Add rules"
                      >
                        <Filter size={20} />
                      </button>
                      
                      {/* Expand/Collapse Button */}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                        className={`p-2 rounded-full hover:bg-slate-700/50 transition ${
                          isExpanded ? 'text-indigo-400' : 'text-slate-400'
                        }`}
                        title={isExpanded ? 'Hide details' : 'Show details'}
                      >
                        {isExpanded ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                      
                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
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

      {/* Edit Advice Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-2xl w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Edit Advice</h3>
              <button
                onClick={() => {
                  setEditingId(null);
                  setEditForm({ title: '', advice: '' });
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Advice title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Advice
                </label>
                <textarea
                  value={editForm.advice}
                  onChange={(e) => setEditForm({ ...editForm, advice: e.target.value })}
                  rows={8}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Your advice content"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setEditingId(null);
                  setEditForm({ title: '', advice: '' });
                }}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving || !editForm.title.trim() || !editForm.advice.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Rules Modal */}
      {addingRulesId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-white">Add Rules to Advice</h3>
                <p className="text-sm text-slate-400 mt-1">
                  Select recommended rules to attach to this advice item
                </p>
              </div>
              <button
                onClick={() => {
                  setAddingRulesId(null);
                  setSelectedRuleIds(new Set());
                  setAiSuggestedRules([]);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* AI Suggestion Button */}
            {addingRulesId && (() => {
              const currentItem = adviceList.find(item => item.id === addingRulesId);
              if (!currentItem) return null;
              return (
                <div className="mb-4">
                  <button
                    onClick={() => suggestRulesWithAI(currentItem)}
                    disabled={suggestingRules}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-50"
                  >
                    {suggestingRules ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating suggestions...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4" />
                        Suggest Rules with AI for This Advice
                      </>
                    )}
                  </button>
                  {aiSuggestedRules.length > 0 && (
                    <p className="text-xs text-green-400 mt-2">
                      ✓ Generated {aiSuggestedRules.length} rule suggestion(s)
                    </p>
                  )}
                </div>
              );
            })()}

            {recommendedRules.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p>No recommended rules available</p>
                <p className="text-xs mt-2">Generate rules in the Recommended Rules section first</p>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                {recommendedRules.map((rule) => {
                  const isSelected = selectedRuleIds.has(rule.id);
                  return (
                    <div
                      key={rule.id}
                      onClick={() => {
                        const newSelected = new Set(selectedRuleIds);
                        if (isSelected) {
                          newSelected.delete(rule.id);
                        } else {
                          newSelected.add(rule.id);
                        }
                        setSelectedRuleIds(newSelected);
                      }}
                      className={`p-4 rounded-lg border cursor-pointer transition ${
                        isSelected
                          ? 'bg-purple-900/30 border-purple-600'
                          : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected ? 'bg-purple-600 border-purple-600' : 'border-slate-600'
                        }`}>
                          {isSelected && <CheckCircle2 className="h-3 w-3 text-white" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-white mb-1">{rule.title}</h4>
                          <p className="text-sm text-slate-400 mb-2">{rule.description}</p>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              rule.confidence > 0.7
                                ? 'bg-green-900/50 text-green-300'
                                : rule.confidence > 0.4
                                ? 'bg-yellow-900/50 text-yellow-300'
                                : 'bg-slate-700 text-slate-400'
                            }`}>
                              {Math.round(rule.confidence * 100)}% confidence
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4 border-t border-slate-700">
              <button
                onClick={() => {
                  setAddingRulesId(null);
                  setSelectedRuleIds(new Set());
                }}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRules}
                disabled={saving || selectedRuleIds.size === 0}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Attaching...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Attach {selectedRuleIds.size} Rule{selectedRuleIds.size !== 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

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