// components/EmptyState.tsx
import { Settings } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
          <Settings className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No Flow Selected</h3>
        <p className="text-slate-600 max-w-md mx-auto">
          Select a flow from the left sidebar to view and edit its details, or create a new
          flow to get started.
        </p>
      </div>
    </div>
  );
}