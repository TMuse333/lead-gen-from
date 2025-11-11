'use client';
import { useState } from 'react';
import { X, Plus } from 'lucide-react';

// Types
type MatchOperator = 'equals' | 'includes' | 'not_equals' | 'greater_than' | 'less_than' | 'between';
type LogicOperator = 'AND' | 'OR';

export interface ConditionRule {
  field: string;
  operator: MatchOperator;
  value: string | string[];
  weight?: number;
}

export interface RuleGroup {
  logic: LogicOperator;
  rules: (ConditionRule | RuleGroup)[];
}

interface RuleBuilderProps {
  rules: ConditionRule[];
  logic: LogicOperator;
  onRulesChange: (rules: ConditionRule[]) => void;
  onLogicChange: (logic: LogicOperator) => void;
}

export default function RuleBuilder({
  rules,
  logic,
  onRulesChange,
  onLogicChange,
}: RuleBuilderProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Field & Value Options
  const FIELD_OPTIONS = [
    { value: 'propertyType', label: 'Property Type' },
    { value: 'timeline', label: 'Timeline' },
    { value: 'sellingReason', label: 'Selling Reason' },
    { value: 'buyingReason', label: 'Buying Reason' },
    { value: 'renovations', label: 'Renovations' },
    { value: 'budget', label: 'Budget' },
    { value: 'bedrooms', label: 'Bedrooms' },
    { value: 'interest', label: 'Interest' },
    { value: 'location', label: 'Location' },
    { value: 'propertyAge', label: 'Property Age' },
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
    location: ['downtown-halifax', 'dartmouth', 'bedford', 'other'],
    propertyAge: ['0-10', '10-20', '20-30', '30+'],
  };

  const OPERATOR_OPTIONS: MatchOperator[] = ['equals', 'includes', 'not_equals'];

  // Handlers
  const addRule = () => {
    const newRule: ConditionRule = {
      field: 'propertyType',
      operator: 'equals',
      value: '',
      weight: 5,
    };
    onRulesChange([...rules, newRule]);
  };

  const updateRule = (index: number, updates: Partial<ConditionRule>) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], ...updates };
    onRulesChange(newRules);
  };

  const removeRule = (index: number) => {
    onRulesChange(rules.filter((_, i) => i !== index));
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">When to Apply This Advice?</h3>
          <p className="text-sm text-gray-600 mt-1">
            {rules.length === 0
              ? 'No conditions set — applies to all users in selected flows'
              : `Applies when ${logic} of the following conditions match`}
          </p>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-5 py-2.5 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-full hover:bg-indigo-100 hover:text-indigo-700 transition-all duration-200 shadow-sm"
        >
          {isExpanded ? 'Hide Rules' : 'Show Rules'}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-6 space-y-6">
          {/* Logic Selector */}
          {rules.length > 1 && (
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">Matching Logic</label>
              <div className="flex gap-3">
                {(['AND', 'OR'] as const).map((op) => (
                  <button
                    key={op}
                    onClick={() => onLogicChange(op)}
                    className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-lg transition-all duration-200 shadow-md ${
                      logic === op
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white ring-4 ring-purple-200'
                        : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-purple-400 hover:shadow-lg'
                    }`}
                  >
                    {op === 'AND' ? 'All Must Match' : 'Any Can Match'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Rules List */}
          <div className="space-y-5">
            {rules.map((rule, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 space-y-5">
                    {/* Field */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Field</label>
                      <select
                        value={rule.field}
                        onChange={(e) => updateRule(index, { field: e.target.value, value: '' })}
                        className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition"
                      >
                        {FIELD_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Operator */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Operator</label>
                      <select
                        value={rule.operator}
                        onChange={(e) =>
                          updateRule(index, { operator: e.target.value as MatchOperator })
                        }
                        className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition"
                      >
                        {OPERATOR_OPTIONS.map((op) => (
                          <option key={op} value={op}>
                            {op.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Value */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Value{rule.operator === 'includes' && ' (select multiple)'}
                      </label>
                      {rule.operator === 'includes' ? (
                        <div className="flex flex-wrap gap-2">
                          {VALUE_OPTIONS[rule.field]?.map((val) => {
                            const selectedValues = Array.isArray(rule.value) ? rule.value : [];
                            const isSelected = selectedValues.includes(val);
                            return (
                              <button
                                key={val}
                                onClick={() => {
                                  const current = Array.isArray(rule.value) ? rule.value : [];
                                  const updated = isSelected
                                    ? current.filter((v) => v !== val)
                                    : [...current, val];
                                  updateRule(index, { value: updated });
                                }}
                                className={`px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-200 shadow-sm ${
                                  isSelected
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white ring-4 ring-emerald-100'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow'
                                }`}
                              >
                                {val}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <select
                          value={Array.isArray(rule.value) ? rule.value[0] : rule.value}
                          onChange={(e) => updateRule(index, { value: e.target.value })}
                          className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition"
                        >
                          <option value="">Select value...</option>
                          {VALUE_OPTIONS[rule.field]?.map((val) => (
                            <option key={val} value={val}>
                              {val}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Weight */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Weight (1–10)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          value={rule.weight || 5}
                          onChange={(e) => updateRule(index, { weight: parseInt(e.target.value) })}
                          min="1"
                          max="10"
                          className="flex-1 h-2 bg-gray-200 rounded-full appearance-none cursor-pointer slider-thumb"
                          style={{
                            background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${
                              ((rule.weight || 5) - 1) * 11.11
                            }%, #e5e7eb ${(rule.weight || 5) * 11.11}%, #e5e7eb 100%)`,
                          }}
                        />
                        <span className="w-12 text-center font-bold text-lg text-purple-600">
                          {rule.weight || 5}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Higher = more important for matching
                      </p>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeRule(index)}
                    className="p-3 bg-red-100 text-red-600 rounded-full hover:bg-red-200 hover:scale-110 transition-all duration-200 shadow-md"
                    title="Remove rule"
                  >
                    <X size={22} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Rule Button */}
          <button
            onClick={addRule}
            className="w-full py-5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-lg font-bold rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 group"
          >
            <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
            <span>Add New Condition</span>
          </button>

          {/* Tip */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
            <p className="text-sm font-medium text-blue-900">
              <strong>Pro Tip:</strong> Leave rules empty to apply advice universally. Use conditions to target specific client situations (e.g., urgent moves, first-time buyers).
            </p>
          </div>
        </div>
      )}
    </div>
  );
}