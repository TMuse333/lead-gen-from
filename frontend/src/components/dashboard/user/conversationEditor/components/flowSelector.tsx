// components/admin/FlowSelector.tsx
'use client';

import { ConversationFlow } from "@/stores/conversationConfig/conversation.store";



interface Props {
  flows: ConversationFlow[];
  activeFlowId: string | null;
  onSelectFlow: (flowId: string) => void;
}

const flowColors = {
  sell: {
    bg: 'bg-orange-900/20',
    border: 'border-orange-700/50',
    activeBorder: 'border-orange-500',
    text: 'text-orange-400',
    hover: 'hover:border-orange-600',
  },
  buy: {
    bg: 'bg-blue-900/20',
    border: 'border-blue-700/50',
    activeBorder: 'border-blue-500',
    text: 'text-blue-400',
    hover: 'hover:border-blue-600',
  },
  browse: {
    bg: 'bg-emerald-900/20',
    border: 'border-emerald-700/50',
    activeBorder: 'border-emerald-500',
    text: 'text-emerald-400',
    hover: 'hover:border-emerald-600',
  },
};

export default function FlowSelector({ flows, activeFlowId, onSelectFlow }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {flows.map((flow) => {
        const colors = flowColors[flow.type as keyof typeof flowColors] || flowColors.buy;
        const isActive = flow.id === activeFlowId;
        console.log(flow)
        return (
          <button
            key={flow.id}
            onClick={() => onSelectFlow(flow.id)}
            className={`
              ${colors.bg} ${isActive ? colors.activeBorder : colors.border} ${colors.hover}
              border-2 rounded-lg p-4 text-left transition-all
              ${isActive ? 'ring-2 ring-offset-2 ring-offset-slate-900' : 'hover:scale-105'}
            `}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
              {/* {flow.visual?.type === 'icon' && flow.visual.value && (
  <flow.visual.value className={`w-8 h-8 ${colors.text}`} />
)} */}
                <div>
                  <h3 className="font-semibold text-lg text-slate-100">
                    {flow.name}
                  </h3>
                  <p className="text-sm text-slate-400 mt-0.5">
                    {flow.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-4 text-xs">
              <span className={`${colors.text} font-medium`}>
                {flow.questions.length} questions
              </span>
              <span className="text-slate-500">
                v{flow.metadata?.version || 1}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}