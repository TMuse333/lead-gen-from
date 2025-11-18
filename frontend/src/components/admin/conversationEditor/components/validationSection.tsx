// components/admin/sections/ValidationSection.tsx
'use client';

import { QuestionNode } from '@/types/conversation.types';

import CollapsibleSection from './collapsibleSection';
import { Shield } from 'lucide-react';
import { useConversationStore } from '@/stores/conversationConfig/conversation.store';

interface Props {
  flowId: string;
  question: QuestionNode;
}

export default function ValidationSection({ flowId, question }: Props) {
  const { updateQuestion } = useConversationStore();

  const updateValidation = (field: string, value: any) => {
    updateQuestion(flowId, question.id, {
      validation: {
        ...question.validation,
        [field]: value,
      },
    });
  };

  return (
    <CollapsibleSection title="Validation" icon={Shield}>
      <div className="space-y-4">
        {/* Required */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="required"
            checked={question.validation?.required || false}
            onChange={(e) => updateValidation('required', e.target.checked)}
            className="w-4 h-4 bg-slate-900 border-slate-600 rounded"
          />
          <label htmlFor="required" className="text-sm text-slate-300">
            Required field
          </label>
        </div>

        {/* Validation Type */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">
            Validation Type
          </label>
          <select
            value={question.validation?.type || 'text'}
            onChange={(e) => updateValidation('type', e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg
                     text-slate-100 focus:outline-none focus:border-indigo-500"
          >
            <option value="text">Text</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="number">Number</option>
          </select>
        </div>

        {/* Pattern */}
        {question.validation?.type === 'email' ? (
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">
              Pattern (Regex)
            </label>
            <input
              type="text"
              value={question.validation?.pattern || ''}
              onChange={(e) => updateValidation('pattern', e.target.value)}
              placeholder="^[^\s@]+@[^\s@]+\.[^\s@]+$"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg
                       text-slate-100 focus:outline-none focus:border-indigo-500
                       font-mono text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">
              Regular expression for validation
            </p>
          </div>
        ) : null}

        {/* Min/Max Length */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">
              Min Length
            </label>
            <input
              type="number"
              value={question.validation?.minLength || ''}
              onChange={(e) => updateValidation('minLength', 
                e.target.value ? parseInt(e.target.value) : undefined
              )}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg
                       text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">
              Max Length
            </label>
            <input
              type="number"
              value={question.validation?.maxLength || ''}
              onChange={(e) => updateValidation('maxLength',
                e.target.value ? parseInt(e.target.value) : undefined
              )}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg
                       text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>
    </CollapsibleSection>
  );
}