import { Flow } from '@/types/recording.types';

interface FlowSelectorProps {
  selectedFlows: Flow[];
  onToggleFlow: (flow: Flow) => void;
}

const FLOW_OPTIONS: Flow[] = ['sell', 'buy', 'browse'];

export default function FlowSelector({ selectedFlows, onToggleFlow }: FlowSelectorProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 mb-6">
      <h2 className="text-lg font-semibold text-white mb-4">Applicable Flows</h2>
      <div className="flex gap-3">
        {FLOW_OPTIONS.map((flow) => (
          <button
            key={flow}
            onClick={() => onToggleFlow(flow)}
            className={`px-6 py-2.5 rounded-lg border-2 font-semibold transition-all duration-200 ${
              selectedFlows.includes(flow)
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/30'
                : 'bg-slate-900/50 text-slate-400 border-slate-700 hover:border-slate-600'
            }`}
          >
            {flow.charAt(0).toUpperCase() + flow.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}