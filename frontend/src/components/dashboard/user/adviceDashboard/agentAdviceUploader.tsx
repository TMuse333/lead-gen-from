'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { HelpCircle, Plus, Trash2, X } from 'lucide-react';
import RuleBuilder from './ruleBuilder';
import { useUserConfig } from '@/contexts/UserConfigContext';
import { discoverFieldsFromFlows } from '@/lib/rules/fieldDiscovery';
import type { UserField } from '@/lib/rules/fieldDiscovery';
import { ADVICE_TYPES, DEFAULT_ADVICE_TYPE, ensureTypeTag, type AdviceType } from '@/types/advice.types';

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
  const { config } = useUserConfig();
  
  // Basic fields
  const [title, setTitle] = useState('');
  const [advice, setAdvice] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [adviceType, setAdviceType] = useState<AdviceType>(DEFAULT_ADVICE_TYPE);
  
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
  
  // Dynamic fields from user's flow
  const [userFields, setUserFields] = useState<UserField[]>([]);
  
  useEffect(() => {
    if (config?.conversationFlows) {
      const fields = discoverFieldsFromFlows(config.conversationFlows);
      setUserFields(fields);
    }
  }, [config]);

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
    budget: ['under-400k', '400k-600k', '600k-800k', '800k-1M', '1M+'],
    bedrooms: ['1', '2', '3', '4', '5+'],
    interest: ['high', 'medium', 'low'],
  };

  const handleAdviceUpload = async () => {
    if (!title || !advice) {
      setStatus('❌ Please fill in both title and advice');
      return;
    }

    setIsUploading(true);
    setStatus('');

    try {
      // Ensure type tag is in tags array
      const tagsWithType = ensureTypeTag(tags, adviceType);

      // Convert simple rules to ruleGroups format if needed
      const ruleGroups = rules.length > 0 ? [{
        logic: ruleLogic,
        rules: rules,
      }] : undefined;

      const response = await axios.post('/api/agent-advice/add', {
        title,
        advice,
        tags: tagsWithType,
        flow: selectedFlows,
        conditions: {}, // Simple conditions handled by rules now
        ruleGroups,
        type: adviceType, // Include type in request
      });

      if (response.data.success) {
        setStatus('✅ Advice uploaded successfully!');
        // Reset form
        setTitle('');
        setAdvice('');
        setTags([]);
        setNewTag('');
        setAdviceType(DEFAULT_ADVICE_TYPE);
        setSelectedFlows([]);
        setRules([]);
        setRuleLogic('AND');
      } else {
        setStatus(`❌ ${response.data.error || 'Failed to upload advice'}`);
      }
    } catch (error: any) {
      console.error('Error uploading advice:', error);
      setStatus(`❌ ${error.response?.data?.error || error.message || 'Failed to upload advice'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddTag = () => {
    // ... (omitted tag logic) ...
  };

  const handleRemoveTag = (tagToRemove: string) => {
    // ... (omitted tag logic) ...
  };
  
  return (
    <div className="relative">
      {/* Main Form Container */}
      {/* Changed background, added dark border, and set default text color */}
      <div className="max-w-4xl mx-auto bg-slate-800 text-slate-100 p-8 rounded-xl border border-slate-700 space-y-8">
        <h2 className="text-3xl font-extrabold text-white mb-6">
          Add New Agent Advice
        </h2>

        {/* Advice Title */}
        <div>
          <label htmlFor="title" className="text-sm font-medium text-slate-300 mb-2 block">
            Advice Title (Short summary)
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Urgent Relocation Selling Strategy"
            // Updated input styles
            className="w-full px-4 py-2 border border-slate-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-slate-900 text-slate-100"
          />
        </div>

        {/* Advice Content */}
        <div>
          <label htmlFor="advice" className="text-sm font-medium text-slate-300 mb-2 block">
            Detailed Advice (What the AI should output)
          </label>
          <textarea
            id="advice"
            value={advice}
            onChange={(e) => setAdvice(e.target.value)}
            placeholder="Write out the detailed advice, tips, or action steps..."
            rows={6}
            // Updated textarea styles
            className="w-full px-4 py-2 border border-slate-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-slate-900 text-slate-100 resize-none"
          />
        </div>

        {/* Advice Type */}
        <div>
          <label htmlFor="adviceType" className="text-sm font-medium text-slate-300 mb-2 block">
            Advice Type
          </label>
          <select
            id="adviceType"
            value={adviceType}
            onChange={(e) => setAdviceType(e.target.value as AdviceType)}
            className="w-full px-4 py-2 border border-slate-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-slate-900 text-slate-100"
          >
            {ADVICE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-400 mt-1">
            Default: {DEFAULT_ADVICE_TYPE.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </p>
        </div>

        {/* Tags */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">
            Tags (Optional keywords)
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag) => (
              <span
                key={tag}
                // Updated tag styles
                className="text-slate-300 bg-indigo-900/40 rounded-full hover:bg-indigo-900/70 hover:text-indigo-300 transition cursor-pointer flex items-center gap-2 py-1 px-3 border border-indigo-900"
                onClick={() => handleRemoveTag(tag)}
              >
                {tag}
                <X size={14} />
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="Add tag and press Enter"
              // Updated input styles
              className="px-4 py-2 border border-slate-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-slate-900 text-slate-100"
            />
            <button
              onClick={handleAddTag}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-1"
            >
              <Plus size={18} /> Add
            </button>
          </div>
        </div>
        
        {/* Applicable Flows */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">
            Applicable Flows (Select all that apply)
          </label>
          <div className="flex gap-4">
            {FLOW_OPTIONS.map((flow) => (
              <button
                key={flow}
                onClick={() => {
                  setSelectedFlows(prev => 
                    prev.includes(flow) 
                      ? prev.filter(f => f !== flow) 
                      : [...prev, flow]
                  );
                }}
                className={`
                  text-lg font-semibold py-2 px-6 rounded-xl border-2 transition-all duration-200
                  ${selectedFlows.includes(flow) 
                    // Updated inactive state colors
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' 
                    : 'bg-slate-900/50 text-indigo-400 border-indigo-900 hover:bg-indigo-900/70'
                  }
                `}
              >
                {flow.charAt(0).toUpperCase() + flow.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Rule Builder */}
        <div className="space-y-4">
          <label className="text-sm font-medium text-slate-300 mb-2 block">
            Conditional Rules (Optional)
            <span className="text-xs text-slate-400 ml-2">
              {userFields.length > 0 
                ? `(${userFields.length} fields from your flow)`
                : '(Using default fields)'}
            </span>
          </label>
          <RuleBuilder
            rules={rules}
            logic={ruleLogic}
            onRulesChange={setRules}
            onLogicChange={setRuleLogic}
            userFields={userFields}
          />
        </div>

        {/* Advanced Rule Toggle (omitted for brevity) */}
        {/* ... */}


        {/* Submission */}
        <button
          onClick={handleAdviceUpload}
          disabled={isUploading}
          // Using the same indigo-to-blue gradient as ruleBuilder for consistency
          className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isUploading ? (
            'Uploading...'
          ) : (
            <>
              <Plus size={24} />
              Upload Agent Advice
            </>
          )}
        </button>

        {/* Status */}
        {status && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Updated status message colors */}
            {status.startsWith('✅') ? (
              <div className="bg-green-900/30 text-green-300 p-3 rounded-lg font-semibold text-center border border-green-700">
                {status}
              </div>
            ) : (
              <div className="bg-red-900/30 text-red-300 p-3 rounded-lg font-semibold text-center border border-red-700">
                {status}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Help Button */}
      <button
        onClick={() => setShowHelp(true)}
        className="fixed bottom-6 right-6 z-40 p-3 bg-indigo-900/50 text-indigo-400 rounded-full hover:bg-indigo-900 hover:scale-110 transition-all duration-200 border border-indigo-700 shadow-xl"
        title="Help & Info"
      >
        <HelpCircle size={24} />
      </button>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            // Darker overlay
            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4"
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              // Updated modal background and border
              className="bg-slate-800 text-slate-100 p-8 rounded-xl border border-slate-700 shadow-2xl max-w-lg w-full"
            >
              <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-3">
                <h2 className="text-2xl font-bold text-white">How to Write Agent Advice</h2>
                <button
                  onClick={() => setShowHelp(false)}
                  className="p-1 rounded-full hover:bg-slate-700 transition"
                >
                  <X size={24} className='text-slate-400' />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-slate-200 mb-1">💡 Keep it Actionable</h3>
                  <p className="text-sm text-slate-300">
                    Think about common questions or concerns your clients have. Write the advice
                    you'd give them in person. Be specific, personal, and helpful.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-200 mb-2">Understanding Rules vs Universal Advice</h3>
                  
                  <div className="space-y-3 mb-4">
                    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                      <h4 className="font-medium text-slate-200 mb-1 flex items-center gap-2">
                        🌐 Universal Advice
                      </h4>
                      <p className="text-xs text-slate-400">
                        Applies to all users in your selected flows. No conditions needed. Perfect for general tips.
                      </p>
                    </div>

                    <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-700">
                      <h4 className="font-medium text-blue-200 mb-1 flex items-center gap-2">
                        🎯 Simple Conditions
                      </h4>
                      <p className="text-xs text-blue-300/80">
                        Quick filtering (e.g., property type, timeline). Use when advice applies to specific user answers.
                      </p>
                    </div>

                    <div className="bg-purple-900/30 p-3 rounded-lg border border-purple-700">
                      <h4 className="font-medium text-purple-200 mb-1 flex items-center gap-2">
                        🔧 Complex Rules
                      </h4>
                      <p className="text-xs text-purple-300/80">
                        Advanced targeting with AND/OR logic. Use for precise situations requiring multiple conditions.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-200 mb-1">📝 Examples:</h3>
                  <div className="space-y-2 text-sm">
                    <div className="bg-slate-900/50 p-2 rounded">
                      <p className="text-slate-300">
                        <strong className="text-slate-200">Universal:</strong> "General home buying tips"<br />
                        <span className="text-xs text-slate-400">→ Applies to everyone in 'buy' flow</span>
                      </p>
                    </div>
                    <div className="bg-slate-900/50 p-2 rounded">
                      <p className="text-slate-300">
                        <strong className="text-slate-200">With Rules:</strong> "Urgent Relocation Selling Strategy"<br />
                        <span className="text-xs text-slate-400">→ Only when timeline = "0-3" AND sellingReason = "relocating"</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3">
                  <p className="text-xs text-indigo-300">
                    <strong>💡 Tip:</strong> Start with universal advice. You can always add rules later to make it more targeted.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="mt-6 w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
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