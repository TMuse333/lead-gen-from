// components/documentExtractor/steps/ContextStep.tsx

import { ArrowRight, ArrowLeft, Loader2, FileText } from 'lucide-react';

interface ContextStepProps {
  contextPrompt: string;
  extractedText: string;
  documentType: string;
  documentSize: number;
  loading: boolean;
  onContextPromptChange: (value: string) => void;
  onProcess: () => void;
  onBack: () => void;
}

export default function ContextStep({
  contextPrompt,
  extractedText,
  documentType,
  documentSize,
  loading,
  onContextPromptChange,
  onProcess,
  onBack,
}: ContextStepProps) {
  const wordCount = extractedText.split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-bold text-white mb-2">
          Provide Context for Extraction
        </h3>
        <p className="text-slate-400">
          Help the AI understand what kind of information to extract
        </p>
      </div>

      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-400">Document Info</span>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-slate-500">Type</div>
            <div className="text-white font-medium uppercase">{documentType}</div>
          </div>
          <div>
            <div className="text-slate-500">Size</div>
            <div className="text-white font-medium">
              {(documentSize / 1024).toFixed(2)} KB
            </div>
          </div>
          <div>
            <div className="text-slate-500">Words</div>
            <div className="text-white font-medium">{wordCount.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Extraction Context
        </label>
        <textarea
          value={contextPrompt}
          onChange={(e) => onContextPromptChange(e.target.value)}
          placeholder="Example: Extract best practices, tips, and advice for software development teams. Focus on practical, actionable recommendations."
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows={6}
        />
        <p className="text-xs text-slate-500 mt-2">
          Tip: Be specific about what you want to extract and the format you prefer
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-700">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition"
        >
          <ArrowLeft className="w-4 h-4 inline mr-2" />
          Back
        </button>
        <button
          onClick={onProcess}
          disabled={!contextPrompt.trim() || loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Process with AI
              <ArrowRight className="w-4 h-4 inline ml-2" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
