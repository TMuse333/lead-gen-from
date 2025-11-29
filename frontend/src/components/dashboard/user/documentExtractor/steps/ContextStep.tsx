// components/documentExtractor/steps/ContextStep.tsx

import { useState } from 'react';
import { ArrowRight, ArrowLeft, Loader2, FileText, Eye, EyeOff } from 'lucide-react';

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
  const [showFileContents, setShowFileContents] = useState(false);
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
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-400">Document Info</span>
          </div>
          <button
            onClick={() => setShowFileContents(!showFileContents)}
            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition"
          >
            {showFileContents ? (
              <>
                <EyeOff className="w-4 h-4" />
                Hide Contents
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Show Contents
              </>
            )}
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm mb-3">
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
        {showFileContents && (
          <div className="mt-3 pt-3 border-t border-slate-700">
            <div className="max-h-60 overflow-y-auto bg-slate-900 rounded p-3 text-sm text-slate-300 whitespace-pre-wrap">
              {extractedText}
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Extraction Context <span className="text-slate-500 text-xs">(Optional)</span>
        </label>
        <textarea
          value={contextPrompt}
          onChange={(e) => onContextPromptChange(e.target.value)}
          placeholder="Example: Extract best practices, tips, and advice for software development teams. Focus on practical, actionable recommendations. Leave empty to extract general advice."
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows={6}
        />
        <p className="text-xs text-slate-500 mt-2">
          {contextPrompt.trim() 
            ? 'Custom prompt will be used for extraction'
            : 'If left empty, will use default: "Extract relevant advice and knowledge from this document"'}
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
          disabled={loading}
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

