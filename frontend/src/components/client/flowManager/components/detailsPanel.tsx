"use client"

import { Edit2 } from 'lucide-react';
import { ConversationFlow } from '@/types/conversationConfig.types';
import QuestionPreview from './questionPreview';
import EditableQuestionCard from './questionPreview';

interface Props {
  flow: ConversationFlow;
}

export default function FlowDetailsPanel({ flow }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="border-b border-slate-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            {/* {flow.visual?.type === 'emoji' && (
              <div className="text-4xl">{flow.visual.value}</div>
            )} */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{flow.name}</h2>
              <p className="text-slate-600 mt-1">{flow.description}</p>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium">
                  {flow.type}
                </span>
                {/* <span className="text-xs text-slate-500">
                  Created: {flow.metadata?.createdAt.toLocaleDateString()}
                </span> */}
                <span className="text-xs text-slate-500">
                  Version: {flow.metadata?.version || 1}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => (window.location.href = `/admin/flows/${flow.id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
            Edit Flow
          </button>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Questions ({flow.questions.length})
        </h3>
        <div className="space-y-3 text-black">
          {flow.questions.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p>No questions yet. Click "Edit Flow" to add questions.</p>
            </div>
          ) : (
            flow.questions
              .sort((a, b) => a.order - b.order)
              .map((q, idx) =>
            <EditableQuestionCard
              flowId={flow.id}
              key={q.id}
                question={q}
            index={idx} />)
          )}
        </div>
      </div>
    </div>
  );
}