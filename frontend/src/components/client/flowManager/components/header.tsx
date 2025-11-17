import { Sparkles, Plus, Upload } from 'lucide-react';
import HelpButtonWithModal from './helpModal';

interface Props {
  onImportClick: () => void;
}

export default function FlowManagerHeader({ onImportClick }: Props) {
  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-indigo-600" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Conversation Flow Manager
              </h1>
              <p className="text-sm text-slate-600">Design and manage chat experiences</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onImportClick}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Upload className="h-4 w-4" />
              Import Flow
            </button>
            <button
              onClick={() => (window.location.href = '/admin/flows/new')}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
            >
              <Plus className="h-4 w-4" />
              Create Flow
            </button>
            <HelpButtonWithModal/>
          </div>
        </div>
      </div>
    </header>
  );
}