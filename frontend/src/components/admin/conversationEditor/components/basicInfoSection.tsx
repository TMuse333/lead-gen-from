// components/admin/sections/BasicInfoSection.tsx
'use client';

import { useState } from 'react';

import { useConversationStore } from '@/stores/conversationConfig/conversation.store';
import CollapsibleSection from './collapsibleSection';
import { Hash, Type } from 'lucide-react';
import { QuestionNode } from '@/types/conversation.types';

interface Props {
  flowId: string;
  question: QuestionNode;
}

export default function BasicInfoSection({ flowId, question }: Props) {
  const { updateQuestion } = useConversationStore();
  const [questionText, setQuestionText] = useState(question.question);
  const [mappingKey, setMappingKey] = useState(question.mappingKey || '');

  const handleSave = (field: 'question' | 'mappingKey', value: string) => {
    updateQuestion(flowId, question.id, { [field]: value });
  };

  return (
    <CollapsibleSection title="Basic Info" defaultOpen={true}>
      <div className="space-y-4">
        {/* Question Text */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
            <Type className="w-4 h-4" />
            Question Text
          </label>
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            onBlur={() => handleSave('question', questionText)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg
                     text-slate-100 focus:outline-none focus:border-indigo-500
                     resize-none"
            rows={3}
          />
        </div>

        {/* Mapping Key */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
            <Hash className="w-4 h-4" />
            Mapping Key
          </label>
          <input
            type="text"
            value={mappingKey}
            onChange={(e) => setMappingKey(e.target.value)}
            onBlur={() => handleSave('mappingKey', mappingKey)}
            placeholder="e.g., propertyType"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg
                     text-slate-100 focus:outline-none focus:border-indigo-500"
          />
          <p className="text-xs text-slate-500 mt-1">
            Used to store user's answer
          </p>
        </div>

        {/* Order */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">
            Order in Flow
          </label>
          <input
            type="number"
            value={question.order}
            onChange={(e) => updateQuestion(flowId, question.id, { 
              order: parseInt(e.target.value) 
            })}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg
                     text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Allow Free Text */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="allowFreeText"
            checked={question.allowFreeText || false}
            onChange={(e) => updateQuestion(flowId, question.id, { 
              allowFreeText: e.target.checked 
            })}
            className="w-4 h-4 bg-slate-900 border-slate-600 rounded"
          />
          <label htmlFor="allowFreeText" className="text-sm text-slate-300">
            Allow free text input
          </label>
        </div>
      </div>
    </CollapsibleSection>
  );
}