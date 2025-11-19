import { Mic } from 'lucide-react';
import { Mode } from '@/types/recording.types';

interface EmptyStateProps {
  mode: Mode;
}

export default function EmptyState({ mode }: EmptyStateProps) {
  return (
    <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-12 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-700/50 rounded-full mb-4">
        <Mic className="h-8 w-8 text-slate-500" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">No Questions Yet</h3>
      <p className="text-slate-400 text-sm">
        {mode === 'manual'
          ? 'Add questions to start recording your expertise'
          : 'Generate a script to get started'}
      </p>
    </div>
  );
}