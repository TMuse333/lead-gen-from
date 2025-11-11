'use client';
import { useState } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { HelpCircle, Plus, Trash2, X } from 'lucide-react';
import RuleBuilder from './ruleBuilder';

// Import types
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

export default function AgentAdviceUploader() {
  // Basic fields
  const [title, setTitle] = useState('');
  const [advice, setAdvice] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  
  // Flow selection
  const [selectedFlows, setSelectedFlows] = useState<string[]>([]);
  
  // Simple rule builder state
  const [rules, setRules] = useState<ConditionRule[]>([]);
  const [ruleLogic, setRuleLogic] = useState<LogicOperator>('AND');
  
  // UI state
  const [status, setStatus] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showAdvancedRules, setShowAdvancedRules] = useState(false);

  // Predefined options
  const FLOW_OPTIONS = ['sell', 'buy', 'browse'];
  
  const FIELD_OPTIONS = [
    { value: 'propertyType', label: 'Property Type' },
    { value: 'timeline', label: 'Timeline' },
    { value: 'sellingReason', label: 'Selling Reason' },
    { value: 'buyingReason', label: 'Buying Reason' },
    { value: 'renovations', label: 'Renovations' },
    { value: 'budget', label: 'Budget' },
    { value: 'bedrooms', label: 'Bedrooms' },
    { value: 'interest', label: 'Interest' },
  ];

  const VALUE_OPTIONS: Record<string, string[]> = {
    propertyType: ['single-family house', 'condo', 'townhouse', 'multi-family'],
    timeline: ['0-3', '3-6', '6-12', '12+'],
    sellingReason: ['upsizing', 'downsizing', 'relocating', 'investment'],
    buyingReason: ['first-home', 'upgrade', 'downsize', 'investment'],
    renovations: ['kitchen', 'bathroom', 'kitchen and bathroom', 'none'],
    budget: ['under-400k', '400k-600k', '600k-800k', 'over-800k'],
    bedrooms: ['1-2', '3', '4', '5+'],
    interest: ['market-trends', 'investment', 'neighborhood', 'general'],
  };

  const OPERATOR_OPTIONS: MatchOperator[] = ['equals', 'includes', 'not_equals'];

  const handleSubmit = async () => {
    if (!title.trim() || !advice.trim()) {
      setStatus('❌ Please fill in both title and advice.');
      return;
    }

    if (selectedFlows.length === 0) {
      setStatus('❌ Please select at least one flow.');
      return;
    }

    setIsUploading(true);
    setStatus('⏳ Generating embedding and uploading...');

    try {
      // Build ruleGroups from simple rules
      const ruleGroups: RuleGroup[] = rules.length > 0 ? [
        {
          logic: ruleLogic,
          rules: rules,
        }
      ] : [];

      const res = await axios.post('/api/add-agent-advice', {
        title: title.trim(),
        advice: advice.trim(),
        tags,
        flow: selectedFlows,
        conditions: {
          flow: selectedFlows,
          ruleGroups: ruleGroups.length > 0 ? ruleGroups : undefined,
        }
      });

      if (res.data.success) {
        setStatus('✅ Advice uploaded successfully!');
        // Reset form
        setTitle('');
        setAdvice('');
        setTags([]);
        setSelectedFlows([]);
        setRules([]);
        setNewTag('');
      } else {
        setStatus(`❌ Upload failed: ${res.data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error(err);
      setStatus(`❌ Upload failed: ${err.response?.data?.error || err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const toggleFlow = (flow: string) => {
    if (selectedFlows.includes(flow)) {
      setSelectedFlows(selectedFlows.filter((f) => f !== flow));
    } else {
      setSelectedFlows([...selectedFlows, flow]);
    }
  };

  const addRule = () => {
    setRules([
      ...rules,
      {
        field: 'propertyType',
        operator: 'equals',
        value: '',
        weight: 5,
      }
    ]);
  };

  const updateRule = (index: number, updates: Partial<ConditionRule>) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], ...updates };
    setRules(newRules);
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  return (
    <div className="relative max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg text-black">
      {/* Help button */}
      <button
        onClick={() => setShowHelp(true)}
        className="absolute top-4 right-4 text-gray-600 hover:text-black transition"
      >
        <HelpCircle size={22} />
      </button>

      <h1 className="text-2xl font-bold mb-4">Add Your Expertise</h1>
      <p className="mb-6 text-gray-700">
        Share your advice for different situations. This will be used to personalize the
        AI-generated analysis for your leads.
      </p>

      {/* Title Input */}
      <div className="mb-6">
        <label className="block mb-2 font-semibold text-lg">
          Advice Title
          <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Urgent Relocation Selling Strategy"
          className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:outline-none"
        />
        <p className="text-sm text-gray-500 mt-1">
          Give this advice a clear, descriptive title
        </p>
      </div>

      {/* Advice Textarea */}
      <div className="mb-6">
        <label className="block mb-2 font-semibold text-lg">
          Your Advice
          <span className="text-red-500">*</span>
        </label>
        <textarea
          value={advice}
          onChange={(e) => setAdvice(e.target.value)}
          placeholder="Share your expertise, strategies, and guidance..."
          className="w-full border-2 border-gray-300 p-3 rounded-lg h-48 focus:border-blue-500 focus:outline-none resize-none"
        />
        <p className="text-sm text-gray-500 mt-1">
          The more specific and detailed, the better! This will be woven into personalized analysis.
        </p>
      </div>

      {/* Flow Selection */}
      <div className="mb-6">
        <label className="block mb-2 font-semibold text-lg">
          Applies to Flows
          <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {FLOW_OPTIONS.map((flow) => (
            <button
              key={flow}
              onClick={() => toggleFlow(flow)}
              className={`px-4 py-2 rounded-lg border-2 transition ${
                selectedFlows.includes(flow)
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
              }`}
            >
              {flow}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Select which user flows this advice applies to
        </p>
      </div>

      {/* Tags */}
      <div className="mb-6">
        <label className="block mb-2 font-semibold">Tags</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTag()}
            placeholder="Add a tag (e.g., urgent, renovation, first-time)"
            className="flex-1 border-2 border-gray-300 p-2 rounded-lg focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={addTag}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Plus size={18} />
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
            >
              {tag}
              <button onClick={() => removeTag(tag)} className="hover:text-red-600">
                <Trash2 size={14} />
              </button>
            </span>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Optional: Add keywords to help categorize this advice
        </p>
      </div>

      {/* Rule Builder */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      <RuleBuilder
          rules={rules}
          logic={ruleLogic}
          onRulesChange={setRules}
          onLogicChange={setRuleLogic}
        />
        
        <p className="text-sm text-gray-600 mb-4">
          {rules.length === 0 
            ? 'No conditions set - this advice will apply to all users in the selected flows'
            : `This advice will apply when ${ruleLogic} of the following conditions match:`
          }
        </p>

        {showAdvancedRules && (
          <>
            {/* Logic Selector */}
            {rules.length > 1 && (
              <div className="mb-4">
                <label className="block mb-2 font-medium text-sm">Matching Logic:</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setRuleLogic('AND')}
                    className={`px-4 py-2 rounded-lg border-2 transition ${
                      ruleLogic === 'AND'
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-gray-700 border-gray-300'
                    }`}
                  >
                    AND (all must match)
                  </button>
                  <button
                    onClick={() => setRuleLogic('OR')}
                    className={`px-4 py-2 rounded-lg border-2 transition ${
                      ruleLogic === 'OR'
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-gray-700 border-gray-300'
                    }`}
                  >
                    OR (any can match)
                  </button>
                </div>
              </div>
            )}

            {/* Rules List */}
            <div className="space-y-3 mb-4">
              {rules.map((rule, index) => (
                <div key={index} className="bg-white p-3 rounded-lg border-2 border-gray-300">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 space-y-2">
                      {/* Field */}
                      <select
                        value={rule.field}
                        onChange={(e) => updateRule(index, { field: e.target.value, value: '' })}
                        className="w-full border border-gray-300 p-2 rounded text-sm"
                      >
                        {FIELD_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>

                      {/* Operator */}
                      <select
                        value={rule.operator}
                        onChange={(e) => updateRule(index, { operator: e.target.value as MatchOperator })}
                        className="w-full border border-gray-300 p-2 rounded text-sm"
                      >
                        {OPERATOR_OPTIONS.map((op) => (
                          <option key={op} value={op}>
                            {op}
                          </option>
                        ))}
                      </select>

                      {/* Value */}
                      {rule.operator === 'includes' ? (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-600">Select multiple values:</p>
                          <div className="flex flex-wrap gap-1">
                            {VALUE_OPTIONS[rule.field]?.map((val) => {
                              const selectedValues = Array.isArray(rule.value) ? rule.value : [];
                              const isSelected = selectedValues.includes(val);
                              return (
                                <button
                                  key={val}
                                  onClick={() => {
                                    const current = Array.isArray(rule.value) ? rule.value : [];
                                    const updated = isSelected
                                      ? current.filter(v => v !== val)
                                      : [...current, val];
                                    updateRule(index, { value: updated });
                                  }}
                                  className={`px-2 py-1 text-xs rounded ${
                                    isSelected
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-gray-200 text-gray-700'
                                  }`}
                                >
                                  {val}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <select
                          value={Array.isArray(rule.value) ? rule.value[0] : rule.value}
                          onChange={(e) => updateRule(index, { value: e.target.value })}
                          className="w-full border border-gray-300 p-2 rounded text-sm"
                        >
                          <option value="">Select value...</option>
                          {VALUE_OPTIONS[rule.field]?.map((val) => (
                            <option key={val} value={val}>
                              {val}
                            </option>
                          ))}
                        </select>
                      )}

                      {/* Weight */}
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-600">Weight:</label>
                        <input
                          type="number"
                          value={rule.weight || 5}
                          onChange={(e) => updateRule(index, { weight: parseInt(e.target.value) })}
                          min="1"
                          max="10"
                          className="w-20 border border-gray-300 p-1 rounded text-sm"
                        />
                        <span className="text-xs text-gray-500">(1-10)</span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeRule(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Rule Button */}
            <button
              onClick={addRule}
              className="w-full border-2 border-dashed border-gray-300 p-3 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition"
            >
              + Add Condition
            </button>
          </>
        )}
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={isUploading || !title.trim() || !advice.trim() || selectedFlows.length === 0}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
      >
        {isUploading ? '⏳ Uploading...' : '✅ Add Advice to Knowledge Base'}
      </button>

      {/* Status Message */}
      {status && (
        <div
          className={`mt-4 p-3 rounded-lg ${
            status.includes('✅')
              ? 'bg-green-100 text-green-800'
              : status.includes('❌')
              ? 'bg-red-100 text-red-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {status}
        </div>
      )}

      {/* Help Modal */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white p-6 rounded-lg shadow-xl max-w-lg m-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4">How This Works</h2>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="font-semibold text-black mb-1">🎯 What is this for?</h3>
                  <p className="text-sm">
                    This tool lets you add your expertise to the AI system. When users complete
                    the chat, the AI will find and use YOUR advice that's most relevant to their
                    situation.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-black mb-1">💡 What to write?</h3>
                  <p className="text-sm">
                    Think about common questions or concerns your clients have. Write the advice
                    you'd give them in person. Be specific, personal, and helpful.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-black mb-1">🔍 Flows & Rules</h3>
                  <p className="text-sm">
                    Select which flows (sell/buy/browse) this applies to. Add optional rules to
                    make the advice more targeted (e.g., only for urgent timelines or specific
                    property types).
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-black mb-1">📝 Example:</h3>
                  <p className="text-sm">
                    <strong>Title:</strong> "Urgent Relocation Selling Strategy"<br />
                    <strong>Flows:</strong> sell<br />
                    <strong>Rules:</strong> timeline equals "0-3" AND sellingReason equals "relocating"
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="mt-6 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Got it!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}