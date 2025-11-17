// components/sidebar.tsx
import { ConversationFlow } from '@/types/conversationConfig.types';
import FlowCard from './flowCard';
import StatsCard from './statsCard';

interface Props {
  flows: ConversationFlow[];
  selectedFlowId: string | null;
  onSelectFlow: (id: string) => void;
  onExport: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function FlowListSidebar({
  flows,
  selectedFlowId,
  onSelectFlow,
  onExport,
  onDuplicate,
  onDelete,
}: Props) {
  return (
    <div className="col-span-4 space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Flows</h2>
        <div className="space-y-3">
          {flows.map((flow) => (
            <FlowCard
              key={flow.id}
              flow={flow}
              isSelected={selectedFlowId === flow.id}
              onSelect={() => onSelectFlow(flow.id)}
              onExport={() => onExport(flow.id)}
              onDuplicate={() => onDuplicate(flow.id)}
              onDelete={() => onDelete(flow.id)}
            />
          ))}
        </div>
      </div>

      <StatsCard flows={flows} selectedFlowName={flows.find(f => f.id === selectedFlowId)?.name || 'None'} />
    </div>
  );
}