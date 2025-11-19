import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface UploadSectionProps {
  isUploading: boolean;
  uploadStatus: string;
  hasIncompleteRecordings: boolean;
  onUpload: () => void;
}

export default function UploadSection({
  isUploading,
  uploadStatus,
  hasIncompleteRecordings,
  onUpload,
}: UploadSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6"
    >
      <button
        onClick={onUpload}
        disabled={isUploading || hasIncompleteRecordings}
        className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-bold text-lg flex items-center justify-center gap-3 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUploading ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin" />
            Uploading to Qdrant...
          </>
        ) : (
          <>
            <CheckCircle2 className="h-6 w-6" />
            Upload All Advice
          </>
        )}
      </button>

      {uploadStatus && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center"
        >
          {uploadStatus.startsWith('Success') ? (
            <div className="bg-green-900/30 text-green-300 p-3 rounded-lg font-semibold border border-green-700">
              {uploadStatus}
            </div>
          ) : (
            <div className="bg-red-900/30 text-red-300 p-3 rounded-lg font-semibold border border-red-700">
              {uploadStatus}
            </div>
          )}
        </motion.div>
      )}

      {hasIncompleteRecordings && (
        <div className="mt-4 flex items-center gap-2 text-amber-400 text-sm justify-center">
          <AlertCircle className="h-4 w-4" />
          <span>Please complete all recordings before uploading</span>
        </div>
      )}
    </motion.div>
  );
}