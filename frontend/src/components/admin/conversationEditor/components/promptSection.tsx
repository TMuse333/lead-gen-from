// components/admin/sections/PromptSection.tsx
'use client';


import CollapsibleSection from './collapsibleSection';
import { Sparkles } from 'lucide-react';
import { QuestionNode } from '@/types/conversation.types';
import { useConversationStore } from '@/stores/conversationConfig/conversation.store';

interface Props {
  flowId: string;
  question: QuestionNode;
}

export default function PromptSection({ flowId, question }: Props) {
  const { updateQuestion } = useConversationStore();

  const updateBasePrompt = (field: string, value: string) => {
    updateQuestion(flowId, question.id, {
      basePrompt: {
        ...question.basePrompt,
        [field]: value,
      },
    });
  };

  return (
    <CollapsibleSection title="LLM Prompt" icon={Sparkles}>
      <div className="space-y-4">
        {/* System Instructions */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">
            System Instructions
          </label>
          {/* <textarea
            value={question.basePrompt?.system || ''}
            onChange={(e) => updateBasePrompt('system', e.target.value)}
            placeholder="System-level instructions for this question..."
            className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg
                     text-slate-100 focus:outline-none focus:border-indigo-500
                     resize-none"
            rows={3}
          /> */}
        </div>

        {/* Context */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">
            Context
          </label>
          <textarea
            value={question.basePrompt?.context || ''}
            onChange={(e) => updateBasePrompt('context', e.target.value)}
            placeholder="Why this question matters..."
            className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg
                     text-slate-100 focus:outline-none focus:border-indigo-500
                     resize-none"
            rows={2}
          />
        </div>

        {/* Qdrant Collection */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">
            Qdrant Collection
          </label>
          <select
            value={question.basePrompt?.qdrantCollection || 'advice'}
            onChange={(e) => updateBasePrompt('qdrantCollection', e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg
                     text-slate-100 focus:outline-none focus:border-indigo-500"
          >
            <option value="advice">Advice</option>
            <option value="actionSteps">Action Steps</option>
          </select>
          <p className="text-xs text-slate-500 mt-1">
            Which knowledge base to query
          </p>
        </div>
      </div>
    </CollapsibleSection>
  );
}