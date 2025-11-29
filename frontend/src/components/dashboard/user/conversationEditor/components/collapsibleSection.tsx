// components/dashboard/user/conversationEditor/components/collapsibleSection.tsx
'use client';

import { useState, ReactNode } from 'react';
import { ChevronDown, ChevronRight, LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  icon?: LucideIcon;
  defaultOpen?: boolean;
  children: ReactNode;
}

export default function CollapsibleSection({ 
  title, 
  icon: Icon, 
  defaultOpen = false, 
  children 
}: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-slate-700 rounded-lg bg-slate-900/30">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 hover:bg-slate-700/30 
                 transition-colors rounded-lg"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-slate-400" />}
          <span className="font-medium text-slate-200">{title}</span>
        </div>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {isOpen && (
        <div className="p-3 border-t border-slate-700">
          {children}
        </div>
      )}
    </div>
  );
}