// components/ImportModal.tsx
import { FileJson, X } from 'lucide-react';

interface Props {
  onClose: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ImportModal({ onClose, onImport }: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <FileJson className="h-6 w-6 text-indigo-600" />
            <h3 className="text-lg font-semibold text-slate-900">Import Flow</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-sm text-slate-600 mb-4">
            Select a JSON file exported from this flow manager to import a conversation flow.
          </p>
          <input
            type="file"
            accept=".json"
            onChange={onImport}
            className="w-full p-3 border-2 border-dashed border-slate-300 rounded-lg hover:border-indigo-400 transition-colors cursor-pointer"
          />
          <p className="text-xs text-slate-500 mt-2">Supported format: JSON</p>
        </div>
      </div>
    </div>
  );
}