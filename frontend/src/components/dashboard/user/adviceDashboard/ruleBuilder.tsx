'use client';
import { useState, useMemo } from 'react';
import { X, Plus } from 'lucide-react';
import type { UserField } from '@/lib/rules/fieldDiscovery';

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
  userFields?: UserField[]; // Optional: dynamic fields from user's flow
}

export default function RuleBuilder({
  rules,
  logic,
  onRulesChange,
  onLogicChange,
  userFields = [],
}: RuleBuilderProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Build field options from user fields or fallback to defaults
  const FIELD_OPTIONS = useMemo(() => {
    if (userFields.length > 0) {
      return userFields.map(field => ({
        value: field.fieldId,
        label: `${field.label}${field.concept ? ` (${field.concept.label})` : ''}`,
        concept: field.concept?.concept,
      }));
    }
    
    // Fallback to defaults
    return [
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
  }, [userFields]);

  // Build value options from user fields or fallback to defaults
  const VALUE_OPTIONS: Record<string, string[]> = useMemo(() => {
    const options: Record<string, string[]> = {};
    
    if (userFields.length > 0) {
      userFields.forEach(field => {
        options[field.fieldId] = field.values.length > 0 
          ? field.values 
          : []; // Empty for text fields
      });
    } else {
      // Fallback defaults
      options.propertyType = ['single-family house', 'condo', 'townhouse', 'multi-family'];
      options.timeline = ['0-3', '3-6', '6-12', '12+'];
      options.sellingReason = ['upsizing', 'downsizing', 'relocating', 'investment'];
      options.buyingReason = ['first-home', 'upgrade', 'downsize', 'investment'];
      options.renovations = ['kitchen', 'bathroom', 'kitchen and bathroom', 'none'];
      options.budget = ['under-400k', '400k-600k', '600k-800k', '800k-1M', '1M+'];
      options.bedrooms = ['1', '2', '3', '4', '5+'];
      options.interest = ['high', 'medium', 'low'];
      options.location = [];
      options.propertyAge = ['new', 'old', 'historic'];
    }
    
    return options;
  }, [userFields]);

  const OPERATOR_OPTIONS: MatchOperator[] = ['equals', 'includes', 'not_equals', 'greater_than', 'less_than', 'between'];

  const addRule = () => {
    onRulesChange([
      ...rules,
      {
        field: FIELD_OPTIONS[0].value,
        operator: 'equals',
        value: '',
      },
    ]);
  };

  const removeRule = (index: number) => {
    onRulesChange(rules.filter((_, i) => i !== index));
  };

  const updateRule = (index: number, newRule: Partial<ConditionRule>) => {
    onRulesChange(
      rules.map((rule, i) =>
        i === index ? { ...rule, ...newRule } : rule
      )
    );
  };
  
  const getRuleValueInput = (rule: ConditionRule, index: number) => {
    const fieldOptions = VALUE_OPTIONS[rule.field];
    
    if (rule.operator === 'between') {
      // Assuming value is string[] of length 2
      const [min, max] = Array.isArray(rule.value) ? rule.value : ['', ''];
      
      return (
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min Value"
            value={min}
            onChange={(e) => updateRule(index, { value: [e.target.value, max] })}
            // Updated input styles
            className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-100 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <input
            type="number"
            placeholder="Max Value"
            value={max}
            onChange={(e) => updateRule(index, { value: [min, e.target.value] })}
            // Updated input styles
            className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-100 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      );
    }
    
    if (fieldOptions && fieldOptions.length > 0) {
      return (
        <select
          value={Array.isArray(rule.value) ? rule.value[0] : rule.value}
          onChange={(e) => updateRule(index, { value: e.target.value })}
          // Updated select styles
          className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-100 focus:ring-indigo-500 focus:border-indigo-500"
        >
          {fieldOptions.map((val) => (
            <option key={val} value={val}>
              {val}
            </option>
          ))}
        </select>
      );
    }

    // Default to text input for free-form values or fields without predefined options
    return (
      <input
        type="text"
        placeholder="Enter Value"
        value={Array.isArray(rule.value) ? rule.value.join(', ') : rule.value}
        onChange={(e) => updateRule(index, { value: e.target.value })}
        // Updated input styles
        className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-100 focus:ring-indigo-500 focus:border-indigo-500"
      />
    );
  };

  return (
    // Updated container background and border
    <div className="space-y-4 p-4 border border-slate-700 rounded-xl bg-slate-900/50">
      {rules.length > 1 && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => onLogicChange('AND')}
            // Updated inactive state colors
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              logic === 'AND' ? 'bg-indigo-600 text-white' : 'bg-slate-900/50 text-indigo-400 border border-indigo-700 hover:bg-slate-700'
            }`}
          >
            AND
          </button>
          <button
            onClick={() => onLogicChange('OR')}
            // Updated inactive state colors
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              logic === 'OR' ? 'bg-indigo-600 text-white' : 'bg-slate-900/50 text-indigo-400 border border-indigo-700 hover:bg-slate-700'
            }`}
          >
            OR
          </button>
          <span className="self-center text-sm text-slate-400">
            Apply {logic} logic between rules
          </span>
        </div>
      )}

      {/* Rules List */}
      <div className="space-y-4">
        {rules.map((rule, index) => {
          const fieldLabel = FIELD_OPTIONS.find(f => f.value === rule.field)?.label;

          return (
            // Updated rule card background and border
            <div key={index} className="flex items-start gap-4 p-4 bg-slate-900 rounded-lg shadow-xl border border-slate-700">
              <div className="flex-1 space-y-3">
                {/* Rule Preview */}
                <div className="text-sm font-medium p-2 bg-slate-800 border border-slate-700 rounded-md">
                  If <span className="text-slate-200">{rule.field}</span>{' '}
                  <span className="text-slate-200">{rule.operator}</span>{' '}
                  <span className="text-indigo-400 font-semibold">
                    {Array.isArray(rule.value) ? rule.value.join(' and ') : rule.value}
                  </span>
                </div>

                {/* Rule Edit Form */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Field */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Field
                    </label>
                    <select
                      value={rule.field}
                      onChange={(e) => updateRule(index, { field: e.target.value, value: '' })}
                      // Updated select styles
                      className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-100 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {FIELD_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Operator */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Operator
                    </label>
                    <select
                      value={rule.operator}
                      onChange={(e) => updateRule(index, { operator: e.target.value as MatchOperator, value: '' })}
                      // Updated select styles
                      className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-100 focus:ring-indigo-500 focus:border-indigo-500"
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
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Value
                    </label>
                    {getRuleValueInput(rule, index)}
                    
                    {rule.operator === 'includes' ? (
                      <div className="space-y-1">
                        <p className="text-xs text-slate-400">
                          (Separate multiple values with commas)
                        </p>
                      </div>
                    ) : rule.operator === 'between' ? (
                      <div className="space-y-1">
                        <p className="text-xs text-slate-400">
                          (Min and max values)
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
                
                {/* Weight */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Weight (1–10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={rule.weight || 1}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      updateRule(index, { weight: isNaN(value) ? 1 : Math.max(1, Math.min(10, value)) });
                    }}
                    placeholder="1"
                    // Updated input styles
                    className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-100 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Higher weight means this condition is more important (Default: 1).
                  </p>
                </div>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => removeRule(index)}
                // Updated remove button colors
                className="p-3 bg-red-900/50 text-red-400 rounded-full hover:bg-red-900 hover:scale-110 transition-all duration-200 shadow-md border border-red-700"
                title="Remove rule"
              >
                <X size={22} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Add Rule Button */}
      <button
        onClick={addRule}
        // Keeping the existing dark gradient which is already modern/dark
        className="w-full py-5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-lg font-bold rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 group"
      >
        <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
        <span>Add New Condition</span>
      </button>

      {/* Tip */}
      {/* Updated tip container colors */}
      <div className="mt-6 p-4 bg-slate-900/50 rounded-xl border border-indigo-700">
        <p className="text-sm font-medium text-indigo-400">
          <strong>Pro Tip:</strong> Leave rules empty to apply advice universally. Use conditions to target specific client situations (e.g., urgent moves, first-time buyers).
        </p>
      </div>
    </div>
  );
}