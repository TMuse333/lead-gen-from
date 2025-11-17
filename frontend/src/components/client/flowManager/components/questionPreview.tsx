// components/EditableQuestionCard.tsx
'use client';

import { useState } from 'react';
import { 
  Eye, EyeOff, Trash2, GripVertical, 
  Smile, Type, Hash, MessageSquare, CheckSquare 
} from 'lucide-react';
import { QuestionNode, ButtonOption } from '@/types/conversationConfig.types';
import { useConversationConfigStore } from '@/stores/conversationConfigStore';

interface Props {
  question: QuestionNode;
  flowId: string;
  index: number;
}

export default function EditableQuestionCard({ question, flowId, index }: Props) {
  const { updateQuestion, deleteQuestion } = useConversationConfigStore();
  const [expanded, setExpanded] = useState(false);
  const [isEditingText, setIsEditingText] = useState(false);
  const [text, setText] = useState(question.question);

  // Save on blur or Enter
  const saveText = () => {
    if (text !== question.question) {
      updateQuestion(flowId, question.id, { question: text });
    }
    setIsEditingText(false);
  };

  return (
    <div className="group border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-sm transition-all bg-white">
      <div className="flex items-start gap-4">
        {/* Drag handle */}
        <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="h-5 w-5 text-slate-400 cursor-grab" />
        </div>

        {/* Order + Visual */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-sm">
            {index + 1}
          </div>
          {/* {question.visual?.type === 'emoji' && (
            <span className="text-3xl">{question.visual.value}</span>
          )} */}
          {question.visual?.type === 'icon' && question.visual.value && (
            <question.visual.value className="w-10 h-10 text-indigo-600" />
          )}
        </div>

        {/* Question Text — Click to edit */}
        <div className="flex-1 min-w-0">
          {isEditingText ? (
            <input
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              onBlur={saveText}
              onKeyDown={(e) => e.key === 'Enter' && saveText()}
              className="w-full px-3 py-2 text-lg font-medium text-slate-900 bg-slate-50 rounded-lg border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          ) : (
            <h3
              onClick={() => setIsEditingText(true)}
              className="text-lg font-medium text-slate-900 cursor-text hover:bg-slate-50 rounded-lg px-3 py-2 -mx-3 transition-colors"
            >
              {question.question || <span className="text-slate-400">Click to add question...</span>}
            </h3>
          )}

          {/* Mapping key */}
          {question.mappingKey && (
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
              <Hash className="h-3 w-3" />
              <code className="bg-slate-100 px-2 py-1 rounded">{question.mappingKey}</code>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {expanded ? <EyeOff className="h-4 w-4 text-slate-500" /> : <Eye className="h-4 w-4 text-slate-500" />}
          </button>
          <button
            onClick={() => deleteQuestion(flowId, question.id)}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-6 pl-16 space-y-6 border-l-2 border-slate-200">
          {/* Buttons */}
          {question.buttons && question.buttons.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <CheckSquare className="h-4 w-4" /> Button Options
              </h4>
              <div className="space-y-2">
                {question.buttons.map((btn) => (
                  <EditableButton key={btn.id} button={btn} questionId={question.id} flowId={flowId} />
                ))}
              </div>
            </div>
          )}

          {/* Commentary */}
          {question.commentary && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" /> Tracker Commentary
              </h4>
              <div className="space-y-2 text-sm">
                {question.commentary.onStart && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600">Play:</span>
                    <input
                      defaultValue={question.commentary.onStart}
                      onBlur={(e) => updateQuestion(flowId, question.id, {
                        commentary: { ...question.commentary, onStart: e.target.value }
                      })}
                      className="flex-1 px-3 py-1 bg-slate-50 rounded border border-slate-300 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                )}
                {question.commentary.onComplete && (
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">Complete:</span>
                    <input
                      defaultValue={question.commentary.onComplete}
                      onBlur={(e) => updateQuestion(flowId, question.id, {
                        commentary: { ...question.commentary, onComplete: e.target.value }
                      })}
                      className="flex-1 px-3 py-1 bg-green-50 rounded border border-green-300 focus:border-green-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Mini component for inline button editing
function EditableButton({ button, questionId, flowId }: { button: ButtonOption; questionId: string; flowId: string }) {
  const { updateButton } = useConversationConfigStore();

  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
      {/* {button.visual?.type === 'emoji' && <span className="text-xl">{button.visual.value}</span>} */}
      {button.visual?.type === 'icon' && button.visual.value && <button.visual.value className="w-8 h-8" />}

      <input
        defaultValue={button.label}
        onBlur={(e) => updateButton(flowId, questionId, button.id, { label: e.target.value })}
        className="flex-1 px-3 py-1 bg-white rounded border border-transparent focus:border-indigo-400 focus:outline-none text-sm font-medium"
      />
      <code className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">{button.value}</code>
    </div>
  );
}