// components/admin/sections/ButtonsSection.tsx
'use client';

import { useState } from 'react';

import CollapsibleSection from './collapsibleSection';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { ButtonOption, QuestionNode } from '@/types/conversation.types';
import { useConversationStore } from '@/stores/conversationConfig/conversation.store';

interface Props {
  flowId: string;
  question: QuestionNode;
}

export default function ButtonsSection({ flowId, question }: Props) {
  const { addButton, updateButton, deleteButton } = useConversationStore();
  const [expandedButtonId, setExpandedButtonId] = useState<string | null>(null);

  const handleAddButton = () => {
    const newButton: ButtonOption = {
      id: `btn-${Date.now()}`,
      label: 'New Button',
      value: 'new-value',
    };
    addButton(flowId, question.id, newButton);
  };

  return (
    <CollapsibleSection title="Buttons" defaultOpen={true}>
      <div className="space-y-2">
        {question.buttons?.map((button) => (
          <div
            key={button.id}
            className="border border-slate-600 rounded-lg bg-slate-900/50"
          >
            {/* Button header */}
            <div className="flex items-center gap-2 p-3">
              <button
                onClick={() => setExpandedButtonId(
                  expandedButtonId === button.id ? null : button.id
                )}
                className="text-slate-400 hover:text-slate-200"
              >
                {expandedButtonId === button.id ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              <input
                value={button.label}
                onChange={(e) => updateButton(flowId, question.id, button.id, {
                  label: e.target.value
                })}
                className="flex-1 bg-transparent border-none focus:outline-none 
                         text-slate-100 font-medium"
              />

              <button
                onClick={() => deleteButton(flowId, question.id, button.id)}
                className="p-1 hover:bg-red-900/30 rounded text-red-400 
                         hover:text-red-300 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Expanded details */}
            {expandedButtonId === button.id && (
              <div className="px-3 pb-3 space-y-3 border-t border-slate-700 pt-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Value</label>
                  <input
                    value={button.value}
                    onChange={(e) => updateButton(flowId, question.id, button.id, {
                      value: e.target.value
                    })}
                    className="w-full px-2 py-1 bg-slate-800 border border-slate-600 
                             rounded text-sm text-slate-100 focus:outline-none 
                             focus:border-indigo-500"
                  />
                </div>

                {/* Prompt Config */}
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Context Prompt (for LLM)
                  </label>
                  <textarea
                    value={button.prompt?.contextPrompt || ''}
                    onChange={(e) => updateButton(flowId, question.id, button.id, {
                      prompt: { ...button.prompt, contextPrompt: e.target.value }
                    })}
                    placeholder="Focus on..."
                    className="w-full px-2 py-1 bg-slate-800 border border-slate-600 
                             rounded text-sm text-slate-100 focus:outline-none 
                             focus:border-indigo-500 resize-none"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    Qdrant Query
                  </label>
                  <input
                    value={button.prompt?.qdrantQuery || ''}
                    onChange={(e) => updateButton(flowId, question.id, button.id, {
                      prompt: { ...button.prompt, qdrantQuery: e.target.value }
                    })}
                    placeholder="Search query for knowledge base"
                    className="w-full px-2 py-1 bg-slate-800 border border-slate-600 
                             rounded text-sm text-slate-100 focus:outline-none 
                             focus:border-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Add button */}
        <button
          onClick={handleAddButton}
          className="w-full py-2 border-2 border-dashed border-slate-600 
                   hover:border-indigo-500 rounded-lg flex items-center 
                   justify-center gap-2 text-slate-400 hover:text-indigo-400 
                   transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Button
        </button>
      </div>
    </CollapsibleSection>
  );
}