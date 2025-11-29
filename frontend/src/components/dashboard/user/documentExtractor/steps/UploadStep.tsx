// components/documentExtractor/steps/UploadStep.tsx

import { Upload, FileText, Loader2, AlertCircle } from 'lucide-react';

interface UploadStepProps {
  file: File | null;
  loading: boolean;
  error: string | null;
  isDragging: boolean;
  onFileSelect: (file: File) => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

export default function UploadStep({
  file,
  loading,
  error,
  isDragging,
  onFileSelect,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
}: UploadStepProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-bold text-white mb-2">Upload Document</h3>
        <p className="text-slate-400">
          Upload a PDF, DOCX, or TXT file to extract knowledge
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="text-red-400 text-sm">{error}</div>
        </div>
      )}

      <div
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
          isDragging
            ? 'border-indigo-400 bg-indigo-500/10'
            : 'border-slate-600 hover:border-slate-500'
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          {loading ? (
            <>
              <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
              <p className="text-slate-400">Extracting text from document...</p>
            </>
          ) : (
            <>
              <Upload className="w-12 h-12 text-slate-400" />
              <div>
                <p className="text-white mb-2">
                  Drag and drop your document here, or
                </p>
                <label className="cursor-pointer inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                  Browse Files
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-slate-500">
                Supported formats: PDF, DOCX, TXT (Max 10MB)
              </p>
            </>
          )}

          {file && !loading && (
            <div className="flex items-center gap-2 text-sm text-slate-300 bg-slate-800 px-4 py-2 rounded">
              <FileText className="w-4 h-4" />
              {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

