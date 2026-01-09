"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Loader2,
  Database,
  Brain,
  FileText,
  MessageSquare,
  Gift,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
} from "lucide-react";
import { useOnboardingStore } from "@/stores/onboardingStore/onboarding.store";
import { useRouter } from "next/navigation";

type CompletionStatus = 'idle' | 'loading' | 'success' | 'error';

export default function Step5Complete() {
  const router = useRouter();
  const {
    businessName,
    industry,
    dataCollection,
    selectedIntentions,
    selectedOffers,
    conversationFlows,
    knowledgeBaseItems,
    setCurrentStep,
  } = useOnboardingStore();

  const [status, setStatus] = useState<CompletionStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [completionData, setCompletionData] = useState<{
    qdrantCollectionName?: string;
    knowledgeBaseItemsUploaded?: number;
  } | null>(null);
  const isSubmittingRef = useRef(false); // Prevent double submissions

  const handleComplete = async () => {
    // Prevent double submission
    if (isSubmittingRef.current) {
      return;
    }

    if (status === 'loading' || status === 'success') {
      return;
    }

    isSubmittingRef.current = true;
    setStatus('loading');
    setError(null);

    try {
      // Get all onboarding data from store
      const onboardingData = useOnboardingStore.getState();
      
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(onboardingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to complete onboarding');
      }

      const data = await response.json();
      setCompletionData(data.data);
      setStatus('success');
      
      // Mark step as complete (now step 5)
      useOnboardingStore.getState().markStepComplete(5);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setStatus('error');
      isSubmittingRef.current = false; // Reset on error so user can retry
    }
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  const handleBack = () => {
    setCurrentStep(4); // Go back to Step 4: Color Config
  };

  // Count stats
  const totalQuestions = Object.values(conversationFlows || {}).reduce(
    (sum, flow) => sum + (flow.questions?.length || 0),
    0
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-cyan-200 mb-2">
          Review Your Configuration
        </h2>
        <p className="text-cyan-200/70">
          Review your setup below. You can go back to make changes or upload when ready.
        </p>
      </div>

      {/* Summary View (shown when idle) */}
      {status === 'idle' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Configuration Summary */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-4">
            <h3 className="text-xl font-semibold text-cyan-200 mb-4">
              Configuration Summary
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Business Info */}
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm font-medium text-cyan-200">Business</span>
                </div>
                <p className="text-white font-semibold">{businessName || 'Not set'}</p>
                <p className="text-sm text-slate-400 mt-1 capitalize">{industry || 'real-estate'}</p>
              </div>

              {/* Flows */}
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm font-medium text-cyan-200">Conversation Flows</span>
                </div>
                <p className="text-white font-semibold">{selectedIntentions.length} Flow{selectedIntentions.length !== 1 ? 's' : ''}</p>
                <p className="text-sm text-slate-400 mt-1">{totalQuestions} Total Questions</p>
              </div>

              {/* Offers */}
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm font-medium text-cyan-200">Offers</span>
                </div>
                <p className="text-white font-semibold">{selectedOffers.length} Offer{selectedOffers.length !== 1 ? 's' : ''}</p>
                <p className="text-sm text-slate-400 mt-1 capitalize">
                  {selectedOffers.join(', ') || 'None selected'}
                </p>
              </div>

              {/* Knowledge Base */}
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm font-medium text-cyan-200">Knowledge Base</span>
                </div>
                <p className="text-white font-semibold">
                  {knowledgeBaseItems.length} Item{knowledgeBaseItems.length !== 1 ? 's' : ''}
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  {knowledgeBaseItems.length === 0 && 'No items added'}
                </p>
              </div>
            </div>

            {/* Data Collection */}
            {dataCollection && dataCollection.length > 0 && (
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm font-medium text-cyan-200">Data Collection</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {dataCollection.map((type) => (
                    <span
                      key={type}
                      className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded text-xs capitalize"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t border-cyan-500/20">
            <motion.button
              onClick={handleBack}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold bg-white/5 border border-cyan-500/30 text-cyan-200 hover:bg-white/10 transition-all"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Edit
            </motion.button>

            <motion.button
              onClick={handleComplete}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-8 py-3 rounded-full font-semibold shadow-lg transition-all bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-cyan-400/50"
            >
              <Upload className="h-5 w-5" />
              Upload Configuration
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      {status === 'loading' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-cyan-200 mb-4">Uploading Configuration...</h3>
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
              <span className="text-cyan-200 font-medium">Creating Qdrant collection...</span>
            </div>
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
              <span className="text-cyan-200 font-medium">Uploading knowledge base...</span>
            </div>
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
              <span className="text-cyan-200 font-medium">Saving configuration to database...</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Error State */}
      {status === 'error' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-500/10 border border-red-500/30 rounded-lg p-6"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-red-400 font-semibold mb-2">Error Completing Setup</h3>
              <p className="text-red-300/80 text-sm mb-4">{error}</p>
              <button
                onClick={handleComplete}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Success State */}
      {status === 'success' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/30 rounded-lg p-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
            >
              <CheckCircle2 className="h-16 w-16 text-green-400 mx-auto mb-4" />
            </motion.div>
            <h3 className="text-2xl font-bold text-green-400 mb-2">
              Setup Complete! 🎉
            </h3>
            <p className="text-cyan-200/70">
              Your chatbot is now configured and ready to use
            </p>
          </div>

          {/* Configuration Summary */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-4">
            <h3 className="text-xl font-semibold text-cyan-200 mb-4">
              Your Configuration Summary
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Business Info */}
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm font-medium text-cyan-200">Business</span>
                </div>
                <p className="text-white font-semibold">{businessName}</p>
                <p className="text-sm text-slate-400 mt-1">{industry}</p>
              </div>

              {/* Flows */}
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm font-medium text-cyan-200">Conversation Flows</span>
                </div>
                <p className="text-white font-semibold">{selectedIntentions.length} Flow{selectedIntentions.length !== 1 ? 's' : ''}</p>
                <p className="text-sm text-slate-400 mt-1">{totalQuestions} Total Questions</p>
              </div>

              {/* Offers */}
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm font-medium text-cyan-200">Offers</span>
                </div>
                <p className="text-white font-semibold">{selectedOffers.length} Offer{selectedOffers.length !== 1 ? 's' : ''}</p>
                <p className="text-sm text-slate-400 mt-1 capitalize">
                  {selectedOffers.join(', ')}
                </p>
              </div>

              {/* Knowledge Base */}
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm font-medium text-cyan-200">Knowledge Base</span>
                </div>
                <p className="text-white font-semibold">
                  {completionData?.knowledgeBaseItemsUploaded || knowledgeBaseItems.length} Item{(completionData?.knowledgeBaseItemsUploaded || knowledgeBaseItems.length) !== 1 ? 's' : ''}
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  {completionData?.qdrantCollectionName && (
                    <span className="font-mono text-xs">
                      {completionData.qdrantCollectionName}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Data Collection */}
            {dataCollection && dataCollection.length > 0 && (
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm font-medium text-cyan-200">Data Collection</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {dataCollection.map((type) => (
                    <span
                      key={type}
                      className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded text-xs capitalize"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Next Steps */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
            <h4 className="text-blue-300 font-semibold mb-2">What's Next?</h4>
            <ul className="text-blue-200/80 text-sm space-y-1 list-disc list-inside">
              <li>Your chatbot is ready to use</li>
              <li>Visit your dashboard to manage settings</li>
              <li>Test your chatbot with the preview feature</li>
              <li>Share your chatbot link with potential clients</li>
            </ul>
          </div>

          {/* Action Button */}
          <div className="flex justify-center pt-4">
            <motion.button
              onClick={handleGoToDashboard}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-8 py-3 rounded-full font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg hover:shadow-cyan-400/50 transition-all"
            >
              Go to Dashboard
              <ArrowRight className="h-5 w-5" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

