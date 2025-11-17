import { ConversationFlow } from '@/types/conversationConfig.types';

interface Props {
  flows: ConversationFlow[];
  selectedFlowName: string;
}

export default function StatsCard({ flows, selectedFlowName }: Props) {
  const totalQuestions = flows.reduce((sum, f) => sum + f.questions.length, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">Statistics</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-600">Total Flows:</span>
          <span className="font-semibold text-slate-900">{flows.length}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">Total Questions:</span>
          <span className="font-semibold text-slate-900">{totalQuestions}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">Selected Flow:</span>
          <span className="font-semibold text-slate-900">{selectedFlowName}</span>
        </div>
      </div>
    </div>
  );
}