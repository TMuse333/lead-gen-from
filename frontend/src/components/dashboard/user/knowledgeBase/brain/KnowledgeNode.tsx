'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Brain, User, Briefcase, MessageSquare, Star, HelpCircle, Cog, FileText, Heart, Lightbulb } from 'lucide-react';

export interface KnowledgeNodeData extends Record<string, unknown> {
  label: string;
  category: string;
  count: number;
  nodeType: 'master' | 'category';
  description?: string;
}

const categoryConfig: Record<string, {
  icon: React.ElementType;
  color: string;
  borderColor: string;
  bgColor: string;
}> = {
  master: {
    icon: Brain,
    color: 'text-cyan-300',
    borderColor: 'border-cyan-400/60',
    bgColor: 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20',
  },
  stories: {
    icon: Heart,
    color: 'text-amber-300',
    borderColor: 'border-amber-400/60',
    bgColor: 'bg-amber-500/10',
  },
  tips: {
    icon: Lightbulb,
    color: 'text-yellow-300',
    borderColor: 'border-yellow-400/60',
    bgColor: 'bg-yellow-500/10',
  },
  about: {
    icon: User,
    color: 'text-blue-300',
    borderColor: 'border-blue-400/60',
    bgColor: 'bg-blue-500/10',
  },
  services: {
    icon: Briefcase,
    color: 'text-purple-300',
    borderColor: 'border-purple-400/60',
    bgColor: 'bg-purple-500/10',
  },
  process: {
    icon: Cog,
    color: 'text-amber-300',
    borderColor: 'border-amber-400/60',
    bgColor: 'bg-amber-500/10',
  },
  testimonials: {
    icon: Star,
    color: 'text-pink-300',
    borderColor: 'border-pink-400/60',
    bgColor: 'bg-pink-500/10',
  },
  'value-proposition': {
    icon: MessageSquare,
    color: 'text-emerald-300',
    borderColor: 'border-emerald-400/60',
    bgColor: 'bg-emerald-500/10',
  },
  faq: {
    icon: HelpCircle,
    color: 'text-orange-300',
    borderColor: 'border-orange-400/60',
    bgColor: 'bg-orange-500/10',
  },
  general: {
    icon: FileText,
    color: 'text-slate-300',
    borderColor: 'border-slate-400/60',
    bgColor: 'bg-slate-500/10',
  },
};

function KnowledgeNodeComponent({ data, selected }: NodeProps) {
  const d = data as unknown as KnowledgeNodeData;
  const config = categoryConfig[d.category] || categoryConfig.general;
  const Icon = config.icon;
  const isMaster = d.nodeType === 'master';

  return (
    <div
      className={`
        relative rounded-xl border backdrop-blur-sm cursor-pointer transition-all
        ${config.borderColor} ${config.bgColor}
        ${isMaster ? 'px-6 py-4 min-w-[220px]' : 'px-4 py-3 min-w-[140px]'}
        ${selected ? 'ring-2 ring-cyan-400/50 shadow-lg shadow-cyan-500/20 scale-105' : 'hover:scale-102'}
        hover:shadow-lg
      `}
    >
      {/* Target handle (top) - not for master node */}
      {!isMaster && (
        <Handle
          type="target"
          position={Position.Top}
          className="!bg-cyan-400/60 !w-2.5 !h-2.5 !border-0"
        />
      )}

      <div className="flex items-center gap-3">
        <div className={`
          flex items-center justify-center rounded-lg
          ${isMaster ? 'w-12 h-12' : 'w-9 h-9'}
          ${config.bgColor} border ${config.borderColor}
        `}>
          <Icon className={`${isMaster ? 'w-6 h-6' : 'w-5 h-5'} ${config.color}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className={`font-semibold text-white leading-tight ${isMaster ? 'text-base' : 'text-sm'}`}>
            {d.label}
          </div>
          {d.count > 0 && (
            <div className={`text-xs mt-0.5 ${config.color}`}>
              {d.count} {d.count === 1 ? 'item' : 'items'}
            </div>
          )}
          {d.count === 0 && !isMaster && (
            <div className="text-xs mt-0.5 text-slate-500">
              No items yet
            </div>
          )}
        </div>
      </div>

      {/* Source handle (bottom) - only for master node */}
      {isMaster && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!bg-cyan-400/60 !w-2.5 !h-2.5 !border-0"
        />
      )}
    </div>
  );
}

export default memo(KnowledgeNodeComponent);
