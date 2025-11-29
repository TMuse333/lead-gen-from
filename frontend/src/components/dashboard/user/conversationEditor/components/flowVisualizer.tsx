// components/admin/FlowVisualizer.tsx
'use client';


import { ConversationFlow, useConversationStore } from '@/stores/conversationConfig/conversation.store';
import { ArrowDown, Plus } from 'lucide-react';


interface Props {
  flow: ConversationFlow;
  selectedQuestionId: string | null;
  onSelectQuestion: (id: string) => void;
}

export default function FlowVisualizer({ flow, selectedQuestionId, onSelectQuestion }: Props) {
  const { addQuestion } = useConversationStore();
  
  const sortedQuestions = [...flow.questions].sort((a, b) => a.order - b.order);

  const handleAddQuestion = () => {
    const newOrder = Math.max(...flow.questions.map(q => q.order), 0) + 1;
    addQuestion(flow.id, {
      question: 'New Question',
     
      mappingKey: `question${newOrder}`,
      buttons: [],
    });
  };

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Flow Diagram</h2>
        <button
          onClick={handleAddQuestion}
          className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 
                     rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Question
        </button>
      </div>

      <div className="space-y-3">
        {sortedQuestions.map((question, index) => {
          const isSelected = question.id === selectedQuestionId;
          const hasButtons = question.buttons && question.buttons.length > 0;

          return (
            <div key={question.id}>
              <button
                onClick={() => onSelectQuestion(question.id)}
                className={`
                  w-full text-left p-4 rounded-lg border-2 transition-all
                  ${isSelected
                    ? 'border-indigo-500 bg-indigo-900/30 ring-2 ring-indigo-500/50'
                    : 'border-slate-600 bg-slate-700/50 hover:border-slate-500 hover:bg-slate-700'
                  }
                `}
              >
                {/* Order badge */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-slate-600 rounded-full 
                                  flex items-center justify-center text-sm font-bold">
                    {question.order}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Question text */}
                    <p className="font-medium text-slate-100 mb-2">
                      {question.question}
                    </p>

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      {question.mappingKey && (
                        <span className="px-2 py-1 bg-slate-600 rounded text-slate-300">
                          {question.mappingKey}
                        </span>
                      )}
                      {hasButtons && (
                        <span className="px-2 py-1 bg-blue-900/50 rounded text-blue-300">
                          {question.buttons!.length} buttons
                        </span>
                      )}
                      {question.validation?.required && (
                        <span className="px-2 py-1 bg-red-900/50 rounded text-red-300">
                          Required
                        </span>
                      )}
                      {question.basePrompt && (
                        <span className="px-2 py-1 bg-purple-900/50 rounded text-purple-300">
                          Has prompt
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>

              {/* Arrow connector */}
              {index < sortedQuestions.length - 1 && (
                <div className="flex justify-center py-2">
                  <ArrowDown className="w-5 h-5 text-slate-600" />
                </div>
              )}
            </div>
          );
        })}

        {sortedQuestions.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <p>No questions yet. Click "Add Question" to start.</p>
          </div>
        )}
      </div>
    </div>
  );
}