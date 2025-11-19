import { FileText, Sparkles, CheckCircle2, Settings } from 'lucide-react';
import { Mode } from '@/types/recording.types';

interface ModeSelectorProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
}

export default function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 mb-6">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Settings className="h-5 w-5 text-indigo-400" />
        Setup Method
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => onModeChange('manual')}
          className={`relative p-6 rounded-xl border-2 transition-all duration-300 ${
            mode === 'manual'
              ? 'bg-indigo-900/30 border-indigo-500 shadow-lg shadow-indigo-500/20'
              : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
          }`}
        >
          <FileText className={`h-8 w-8 mb-3 ${mode === 'manual' ? 'text-indigo-400' : 'text-slate-500'}`} />
          <h3 className="text-lg font-semibold text-white mb-2">Manual Questions</h3>
          <p className="text-sm text-slate-400">Write your own questions to answer</p>
          {mode === 'manual' && (
            <div className="absolute top-3 right-3">
              <CheckCircle2 className="h-5 w-5 text-indigo-400" />
            </div>
          )}
        </button>

        <button
          onClick={() => onModeChange('generated')}
          className={`relative p-6 rounded-xl border-2 transition-all duration-300 ${
            mode === 'generated'
              ? 'bg-purple-900/30 border-purple-500 shadow-lg shadow-purple-500/20'
              : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
          }`}
        >
          <Sparkles className={`h-8 w-8 mb-3 ${mode === 'generated' ? 'text-purple-400' : 'text-slate-500'}`} />
          <h3 className="text-lg font-semibold text-white mb-2">AI Generated Script</h3>
          <p className="text-sm text-slate-400">Let AI create questions for you</p>
          {mode === 'generated' && (
            <div className="absolute top-3 right-3">
              <CheckCircle2 className="h-5 w-5 text-purple-400" />
            </div>
          )}
        </button>
      </div>
    </div>
  );
}