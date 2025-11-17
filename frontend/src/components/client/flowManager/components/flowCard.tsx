// components/flowCard.tsx
import { Download, Copy, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { ConversationFlow } from '@/types/conversationConfig.types';
import { useState } from 'react';

interface Props {
  flow: ConversationFlow;
  isSelected: boolean;
  onSelect: () => void;
  onExport: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export default function FlowCard({
  flow,
  isSelected,
  onSelect,
  onExport,
  onDuplicate,
  onDelete,
}: Props) {
  const [showActions, setShowActions] = useState(true);
  const [expanded, setExpanded] = useState(false);

  return (
    <div
    className={`relative border-2 rounded-xl p-5 cursor-pointer transition-all duration-300 ease-out
      ${isSelected
        ? 'border-indigo-500 bg-indigo-50/60 shadow-xl ring-4 ring-indigo-500/20 scale-105 -translate-y-1'
        : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1'
      }`}
    // onMouseEnter={() => setShowActions(true)}
    // onMouseLeave={() => setShowActions(false)}
    onClick={onSelect}
  >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="text-slate-400 hover:text-slate-600"
          >
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>

          <div className="flex items-center gap-2">
          {/* {flow.visual?.type === 'emoji' && <span className="text-4xl">{flow.visual.value}</span>} */}
{flow.visual?.type === 'icon' && <flow.visual.value className="w-10 h-10" />}
            <div>
              <h3 className="font-semibold text-slate-900">{flow.name}</h3>
              <p className="text-xs text-slate-600">{flow.description}</p>
            </div>
          </div>
        </div>

        {showActions && (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button onClick={onExport} className="p-1.5 hover:bg-slate-100 rounded" title="Export">
              <Download className="h-4 w-4 text-slate-600" />
            </button>
            <button onClick={onDuplicate} className="p-1.5 hover:bg-slate-100 rounded" title="Duplicate">
              <Copy className="h-4 w-4 text-slate-600" />
            </button>
            <button onClick={onDelete} className="p-1.5 hover:bg-red-50 rounded" title="Delete">
              <Trash2 className="h-4 w-4 text-red-600" />
            </button>
          </div>
        )}
      </div>

      {expanded && (
        <div className="mt-3 ml-8 text-sm text-slate-600 border-l-2 border-slate-200 pl-4">
          {flow.questions.length === 0 ? (
            <p className="italic">No questions yet</p>
          ) : (
            <div>
              <p className="font-medium">{flow.questions.length} questions:</p>
              <div className="mt-1 space-y-1">
                {flow.questions
                  .sort((a, b) => a.order - b.order)
                  .slice(0, 5)
                  .map((q) => (
                    <div key={q.id} className="text-xs truncate">
                      {q.question}
                    </div>
                  ))}
                {flow.questions.length > 5 && <p className="text-xs text-slate-500">...and more</p>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}