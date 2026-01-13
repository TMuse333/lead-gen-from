"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Loader2,
  User,
  Building2,
  MessageSquare,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { useOnboardingStore } from "@/stores/onboardingStore/onboarding.store";
import { useRouter } from "next/navigation";

type CompletionStatus = 'saving' | 'success' | 'error';

export default function Step2Complete() {
  const router = useRouter();
  const {
    agentFirstName,
    agentLastName,
    agentEmail,
    agentPhone,
    businessName,
    selectedIntentions,
    setCurrentStep,
  } = useOnboardingStore();

  const [status, setStatus] = useState<CompletionStatus>('saving');
  const [error, setError] = useState<string | null>(null);
  const isSubmittingRef = useRef(false);
  const hasStartedRef = useRef(false);

  // Auto-save on mount
  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    handleComplete();
  }, []);

  const handleComplete = async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setStatus('saving');
    setError(null);

    try {
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

      setStatus('success');
      useOnboardingStore.getState().markStepComplete(2);

      // Auto-redirect to dashboard home after a short delay
      setTimeout(() => {
        router.push('/dashboard?section=home');
      }, 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setStatus('error');
      isSubmittingRef.current = false;
    }
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard?section=home');
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleRetry = () => {
    isSubmittingRef.current = false;
    handleComplete();
  };

  // Get full name
  const fullName = agentLastName
    ? `${agentFirstName} ${agentLastName}`
    : agentFirstName;

  // Saving State
  if (status === 'saving') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-cyan-500/20 border border-cyan-500/30 mb-6">
            <Loader2 className="h-10 w-10 text-cyan-400 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Setting Up Your Bot...
          </h2>
          <p className="text-cyan-200/70">
            Please wait while we configure everything for you
          </p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
            <span className="text-cyan-200">Creating your unique bot profile...</span>
          </div>
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
            <span className="text-cyan-200">Setting up conversation flows...</span>
          </div>
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
            <span className="text-cyan-200">Saving your configuration...</span>
          </div>
        </div>
      </motion.div>
    );
  }

  // Error State
  if (status === 'error') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/20 border border-red-500/30 mb-6">
            <AlertCircle className="h-10 w-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-red-400 mb-2">
            Something Went Wrong
          </h2>
          <p className="text-red-200/70 max-w-md mx-auto">
            {error || 'An unexpected error occurred. Please try again.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleRetry}
            className="px-6 py-3 rounded-full font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg hover:shadow-cyan-400/50 transition-all flex items-center justify-center gap-2"
          >
            <Loader2 className="h-5 w-5" />
            Try Again
          </button>
          <button
            onClick={handleBack}
            className="px-6 py-3 rounded-full font-semibold bg-slate-700 text-slate-300 hover:bg-slate-600 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            Go Back
          </button>
        </div>
      </motion.div>
    );
  }

  // Success State
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Success Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 mb-6"
        >
          <CheckCircle2 className="h-10 w-10 text-green-400" />
        </motion.div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-300 via-cyan-300 to-green-300 bg-clip-text text-transparent mb-2">
          Account Created!
        </h2>
        <p className="text-cyan-200/70">
          Now let's customize your chatbot
        </p>
      </div>

      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700 rounded-2xl p-6 space-y-4"
      >
        <div className="flex items-center gap-2 text-sm text-cyan-400 font-medium">
          <Sparkles className="h-4 w-4" />
          Your Profile
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Agent Name */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Agent</span>
            </div>
            <p className="text-white font-semibold truncate">{fullName || 'Not set'}</p>
            <p className="text-xs text-slate-500 mt-1 truncate">{agentEmail}</p>
          </div>

          {/* Business */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Business</span>
            </div>
            <p className="text-white font-semibold truncate">{businessName || 'Not set'}</p>
            {agentPhone && (
              <p className="text-xs text-slate-500 mt-1">{agentPhone}</p>
            )}
          </div>

          {/* Flows */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Flows</span>
            </div>
            <p className="text-white font-semibold">
              {selectedIntentions.length} Active
            </p>
            <p className="text-xs text-slate-500 mt-1 capitalize">
              {selectedIntentions.join(', ')}
            </p>
          </div>
        </div>
      </motion.div>

      {/* What's Next */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-5"
      >
        <h4 className="text-cyan-300 font-semibold mb-3 flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Next: Customize Your Timeline
        </h4>
        <p className="text-cyan-200/80 text-sm">
          We'll walk you through setting up your chatbot's timeline phases, questions, and personal advice.
          This helps your bot generate personalized timelines for each lead.
        </p>
      </motion.div>

      {/* Redirect notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center"
      >
        <p className="text-sm text-slate-500 mb-4">
          Taking you to your dashboard...
        </p>
        <button
          onClick={handleGoToDashboard}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg hover:shadow-cyan-400/50 transition-all"
        >
          Go to Dashboard
          <ArrowRight className="h-5 w-5" />
        </button>
      </motion.div>
    </motion.div>
  );
}
