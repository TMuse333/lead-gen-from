// components/documentExtractor/components/SuccessState.tsx

import { CheckCircle2, Loader2 } from 'lucide-react';

interface SuccessStateProps {
  loading: boolean;
  selectedItemsCount: number;
}

export default function SuccessState({ loading, selectedItemsCount }: SuccessStateProps) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Uploading items to your knowledge base...</p>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
      <p className="text-white font-semibold mb-2">Items uploaded successfully!</p>
      <p className="text-slate-400">
        {selectedItemsCount} item{selectedItemsCount !== 1 ? 's' : ''} added to your knowledge base
      </p>
    </div>
  );
}
