// components/admin/ConversationEditor.tsx
'use client';

import { useState } from 'react';

import FlowSelector from './components/flowSelector';

import QuestionDetails from './components/questionDetails';

import FlowVisualizer from './components/flowVisualizer';
import { useConversationStore } from '@/stores/conversationConfig/conversation.store';

export default function ConversationEditor() {
  const { flows, activeFlowId, setActiveFlow } = useConversationStore();
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

  const activeFlow = activeFlowId ? flows[activeFlowId] : null;
  const selectedQuestion = selectedQuestionId && activeFlow
    ? activeFlow.questions.find(q => q.id === selectedQuestionId)
    : null;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Conversation Flow Editor</h1>
          <p className="text-sm text-slate-400 mt-1">
            Edit questions, buttons, and flow logic
          </p>
        </div>
      </div>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto p-4">
        {/* Flow Selector */}
        <div className="mb-6">
          <FlowSelector
            flows={Object.values(flows)}
            activeFlowId={activeFlowId || null}
            onSelectFlow={setActiveFlow}
          />
        </div>

        {activeFlow ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Flow Visualizer - 2 columns on desktop */}
            <div className="lg:col-span-2">
              <FlowVisualizer
                flow={activeFlow}
                selectedQuestionId={selectedQuestionId}
                onSelectQuestion={setSelectedQuestionId}
              />
            </div>

            {/* Question Details - 1 column on desktop */}
            <div className="lg:col-span-1">
              {selectedQuestion ? (
                <QuestionDetails
                  flowId={activeFlow.id}
                  question={selectedQuestion}
                  onClose={() => setSelectedQuestionId(null)}
                />
              ) : (
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-8 text-center">
                  <p className="text-slate-400">
                    Select a question to edit
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-12 text-center">
            <p className="text-slate-400 text-lg">
              Select a flow to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}