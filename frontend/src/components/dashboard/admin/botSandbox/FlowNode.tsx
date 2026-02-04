'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { FlowNodeData } from './flowData';

const typeStyles: Record<FlowNodeData['nodeType'], { border: string; badge: string; bg: string }> = {
  entry:        { border: 'border-cyan-400/60',    badge: 'bg-cyan-500/20 text-cyan-300',       bg: 'hover:border-cyan-400' },
  bot_response: { border: 'border-emerald-400/60', badge: 'bg-emerald-500/20 text-emerald-300', bg: 'hover:border-emerald-400' },
  llm_prompt:   { border: 'border-purple-400/60',  badge: 'bg-purple-500/20 text-purple-300',   bg: 'hover:border-purple-400' },
  decision:     { border: 'border-amber-400/60',   badge: 'bg-amber-500/20 text-amber-300',     bg: 'hover:border-amber-400' },
  intel:        { border: 'border-orange-400/60',   badge: 'bg-orange-500/20 text-orange-300',   bg: 'hover:border-orange-400' },
  completion:   { border: 'border-green-400/60',   badge: 'bg-green-500/20 text-green-300',     bg: 'hover:border-green-400' },
  error:        { border: 'border-red-400/60',     badge: 'bg-red-500/20 text-red-300',         bg: 'hover:border-red-400' },
};

function FlowNodeComponent({ data, selected }: NodeProps) {
  const d = data as unknown as FlowNodeData & { isLiveActive?: boolean };
  const styles = typeStyles[d.nodeType] || typeStyles.entry;

  const liveRing = d.isLiveActive ? 'ring-2 ring-green-400/70 animate-pulse shadow-lg shadow-green-500/20' : '';

  return (
    <div
      className={`
        relative px-3 py-2.5 rounded-lg border bg-[#0b1530]/95 backdrop-blur-sm
        min-w-[160px] max-w-[200px] cursor-pointer transition-all
        ${styles.border} ${styles.bg}
        ${selected && !d.isLiveActive ? 'ring-2 ring-blue-400/50 shadow-lg shadow-blue-500/10' : ''}
        ${liveRing}
      `}
    >
      <Handle type="target" position={Position.Top} className="!bg-blue-400/60 !w-2 !h-2 !border-0" />

      {/* Role badge */}
      <div className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full inline-block mb-1 ${styles.badge}`}>
        {d.role}
      </div>

      {/* Label */}
      <div className="text-xs font-semibold text-white leading-tight mb-1">
        {d.label}
      </div>

      {/* File reference */}
      {d.file && (
        <div className="text-[10px] text-slate-400 font-mono truncate">
          {d.file}{d.line ? `:${d.line}` : ''}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-blue-400/60 !w-2 !h-2 !border-0" />
    </div>
  );
}

export default memo(FlowNodeComponent);
