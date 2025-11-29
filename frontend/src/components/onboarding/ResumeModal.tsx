"use client";

import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Play, X, Clock, FileText } from "lucide-react";
import { useOnboardingStore } from "@/stores/onboardingStore/onboarding.store";

interface ResumeModalProps {
  isOpen: boolean;
  onResume: () => void;
  onRestart: () => void;
  progressData: {
    currentStep: number;
    businessName: string;
    completedSteps: number[];
  };
}

export default function ResumeModal({
  isOpen,
  onResume,
  onRestart,
  progressData,
}: ResumeModalProps) {
  const { currentStep, businessName, completedSteps } = progressData;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onRestart} // Clicking outside defaults to restart (safer)
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl border border-cyan-500/30 shadow-2xl max-w-md w-full p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/20 rounded-lg">
                    <Clock className="h-6 w-6 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-cyan-50">
                      Welcome Back!
                    </h2>
                    <p className="text-sm text-cyan-200/70">
                      We found your incomplete onboarding
                    </p>
                  </div>
                </div>
                <button
                  onClick={onRestart}
                  className="p-2 text-slate-400 hover:text-slate-300 rounded-lg hover:bg-slate-700/50 transition-colors"
                  title="Close and restart"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Progress Info */}
              <div className="bg-slate-800/50 rounded-lg p-4 mb-6 border border-slate-700">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-slate-400 mb-1">Your Progress</p>
                    <p className="text-cyan-50 font-semibold mb-2">
                      {businessName || "Unnamed Business"}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-cyan-200">
                        Step {currentStep} of 6
                      </span>
                      <span className="text-slate-400">
                        {completedSteps.length} step{completedSteps.length !== 1 ? "s" : ""} completed
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="mt-3 w-full bg-slate-700/50 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${(currentStep / 6) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <motion.button
                  onClick={onResume}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/30"
                >
                  <Play className="h-5 w-5" />
                  Continue from Step {currentStep}
                </motion.button>

                <motion.button
                  onClick={onRestart}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-700/50 text-slate-300 font-medium rounded-lg hover:bg-slate-700 border border-slate-600 hover:border-slate-500 transition-all"
                >
                  <RotateCcw className="h-5 w-5" />
                  Start Fresh (Clear All Data)
                </motion.button>
              </div>

              {/* Info Text */}
              <p className="mt-4 text-xs text-slate-400 text-center">
                Your progress is saved locally. You can resume anytime or start over with a clean slate.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

