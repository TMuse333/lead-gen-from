import { Plus, FileText } from 'lucide-react';

interface ManualQuestionInputProps {
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
}

export default function ManualQuestionInput({ value, onChange, onAdd }: ManualQuestionInputProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 mb-6">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <FileText className="h-5 w-5 text-indigo-400" />
        Add Questions
      </h2>
      <div className="flex gap-3">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), onAdd())}
          placeholder="Type a question you'll answer with your voice..."
          className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={onAdd}
          disabled={!value.trim()}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-semibold flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-5 w-5" />
          Add
        </button>
      </div>
    </div>
  );
}