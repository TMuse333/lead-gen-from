// components/dashboard/user/rules/EditableRuleGroup.tsx
// Editable component for editing RuleGroup structures

'use client';

import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { RuleGroup, ConditionRule, LogicOperator, MatchOperator } from '@/types/rules.types';
import type { UserField } from '@/lib/rules/fieldDiscovery';

interface EditableRuleGroupProps {
  ruleGroup: RuleGroup;
  userFields: UserField[];
  onUpdate: (updatedRuleGroup: RuleGroup) => void;
  depth?: number;
}

export default function EditableRuleGroup({
  ruleGroup,
  userFields,
  onUpdate,
  depth = 0,
}: EditableRuleGroupProps) {
  const [expanded, setExpanded] = useState(depth === 0);

  // Build field options from user fields
  const FIELD_OPTIONS = userFields.map(field => ({
    value: field.fieldId,
    label: `${field.label}${field.concept ? ` (${field.concept.label})` : ''}`,
    concept: field.concept?.concept,
  }));

  // Build value options from user fields
  const VALUE_OPTIONS: Record<string, string[]> = {};
  userFields.forEach(field => {
    VALUE_OPTIONS[field.fieldId] = field.values.length > 0 ? field.values : [];
  });

  const OPERATOR_OPTIONS: MatchOperator[] = ['equals', 'includes', 'not_equals', 'greater_than', 'less_than', 'between'];

  // Helper to get field value from rule
  // ConditionRule.field is always a string in RuleGroup
  const getFieldValue = (rule: ConditionRule | RuleGroup): string => {
    if ('logic' in rule) return '';
    const conditionRule = rule as ConditionRule;
    return typeof conditionRule.field === 'string' ? conditionRule.field : '';
  };

  // Helper to set field value in rule
  const setFieldValue = (rule: ConditionRule | RuleGroup, newFieldId: string): ConditionRule | RuleGroup => {
    if ('logic' in rule) return rule;
    // ConditionRule.field is a string, not an object
    return {
      ...rule,
      field: newFieldId, // Set field as string
      value: '', // Reset value when field changes
    };
  };

  // Update logic operator
  const updateLogic = (newLogic: LogicOperator) => {
    onUpdate({
      ...ruleGroup,
      logic: newLogic,
    });
  };

  // Add a new condition rule
  const addRule = () => {
    const newRule: ConditionRule = {
      field: FIELD_OPTIONS[0]?.value || '',
      operator: 'equals',
      value: '',
    };
    onUpdate({
      ...ruleGroup,
      rules: [...ruleGroup.rules, newRule],
    });
  };

  // Remove a rule
  const removeRule = (index: number) => {
    onUpdate({
      ...ruleGroup,
      rules: ruleGroup.rules.filter((_, i) => i !== index),
    });
  };

  // Update a condition rule
  const updateConditionRule = (index: number, updates: Partial<ConditionRule>) => {
    const updatedRules = ruleGroup.rules.map((rule, i) => {
      if (i === index && !('logic' in rule)) {
        return { ...rule, ...updates };
      }
      return rule;
    });
    onUpdate({
      ...ruleGroup,
      rules: updatedRules,
    });
  };

  // Update a nested rule group
  const updateNestedRuleGroup = (index: number, updatedGroup: RuleGroup) => {
    const updatedRules = ruleGroup.rules.map((rule, i) => {
      if (i === index && 'logic' in rule) {
        return updatedGroup;
      }
      return rule;
    });
    onUpdate({
      ...ruleGroup,
      rules: updatedRules,
    });
  };

  // Get value input for a rule
  const getRuleValueInput = (rule: ConditionRule, index: number) => {
    const fieldId = getFieldValue(rule);
    const fieldOptions = VALUE_OPTIONS[fieldId] || [];

    if (rule.operator === 'between') {
      const [min, max] = Array.isArray(rule.value) ? rule.value : ['', ''];
      return (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Min Value"
            value={min}
            onChange={(e) => updateConditionRule(index, { value: [e.target.value, max] })}
            className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-100 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <input
            type="text"
            placeholder="Max Value"
            value={max}
            onChange={(e) => updateConditionRule(index, { value: [min, e.target.value] })}
            className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-100 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      );
    }

    if (fieldOptions.length > 0) {
      return (
        <select
          value={Array.isArray(rule.value) ? rule.value[0] : rule.value}
          onChange={(e) => updateConditionRule(index, { value: e.target.value })}
          className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-100 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Select value...</option>
          {fieldOptions.map((val) => (
            <option key={val} value={val}>
              {val}
            </option>
          ))}
        </select>
      );
    }

    // Text input for free-form values
    return (
      <input
        type="text"
        placeholder="Enter value"
        value={Array.isArray(rule.value) ? rule.value.join(', ') : rule.value || ''}
        onChange={(e) => {
          const value = e.target.value;
          // For 'includes' operator, allow comma-separated values
          if (rule.operator === 'includes' && value.includes(',')) {
            updateConditionRule(index, { value: value.split(',').map(v => v.trim()).filter(Boolean) });
          } else {
            updateConditionRule(index, { value });
          }
        }}
        className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-800 text-slate-100 focus:ring-indigo-500 focus:border-indigo-500"
      />
    );
  };

  return (
    <div className={`${depth > 0 ? 'ml-4 pl-4 border-l-2 border-slate-700' : ''} space-y-3`}>
      {/* Logic Selector */}
      {ruleGroup.rules.length > 1 && (
        <div className="flex gap-2 items-center">
          <button
            onClick={() => updateLogic('AND')}
            className={`px-3 py-1 rounded text-sm font-medium transition ${
              ruleGroup.logic === 'AND'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            AND
          </button>
          <button
            onClick={() => updateLogic('OR')}
            className={`px-3 py-1 rounded text-sm font-medium transition ${
              ruleGroup.logic === 'OR'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            OR
          </button>
          <span className="text-xs text-slate-400">
            {ruleGroup.rules.length} rule{ruleGroup.rules.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Rules */}
      <div className="space-y-3">
        {ruleGroup.rules.map((rule, index) => {
          // Nested RuleGroup
          if ('logic' in rule) {
            return (
              <div key={index} className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="flex items-center gap-2 text-sm font-medium text-slate-300"
                  >
                    {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    Nested {rule.logic} Group
                  </button>
                  <button
                    onClick={() => removeRule(index)}
                    className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded transition"
                    title="Remove nested group"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {expanded && (
                  <EditableRuleGroup
                    ruleGroup={rule}
                    userFields={userFields}
                    onUpdate={(updated) => updateNestedRuleGroup(index, updated)}
                    depth={depth + 1}
                  />
                )}
              </div>
            );
          }

          // Condition Rule
          const conditionRule = rule as ConditionRule;
          const fieldId = getFieldValue(conditionRule);
          const fieldLabel = FIELD_OPTIONS.find(f => f.value === fieldId)?.label || fieldId;

          return (
            <div key={index} className="bg-slate-800 border border-slate-700 rounded-lg p-3 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1 grid grid-cols-3 gap-2">
                  {/* Field */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Field</label>
                    <select
                      value={fieldId}
                      onChange={(e) => {
                        const updated = setFieldValue(conditionRule, e.target.value) as ConditionRule;
                        updateConditionRule(index, updated);
                      }}
                      className="w-full px-2 py-1.5 text-sm border border-slate-600 rounded bg-slate-900 text-slate-100 focus:ring-indigo-500 focus:border-indigo-500"
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
                    <label className="block text-xs font-medium text-slate-400 mb-1">Operator</label>
                    <select
                      value={conditionRule.operator}
                      onChange={(e) => updateConditionRule(index, { operator: e.target.value as MatchOperator })}
                      className="w-full px-2 py-1.5 text-sm border border-slate-600 rounded bg-slate-900 text-slate-100 focus:ring-indigo-500 focus:border-indigo-500"
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
                    <label className="block text-xs font-medium text-slate-400 mb-1">Value</label>
                    {getRuleValueInput(conditionRule, index)}
                  </div>
                </div>

                <button
                  onClick={() => removeRule(index)}
                  className="ml-2 p-1 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded transition self-start mt-6"
                  title="Remove rule"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Weight (optional) */}
              {conditionRule.weight !== undefined && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Weight: {conditionRule.weight}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={conditionRule.weight}
                    onChange={(e) => updateConditionRule(index, { weight: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Rule Button */}
      <button
        onClick={addRule}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition"
      >
        <Plus className="h-4 w-4" />
        Add Rule
      </button>
    </div>
  );
}

