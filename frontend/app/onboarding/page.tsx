"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Step1BusinessSetup from "@/components/onboarding/steps/step1BusinessSetup";
import Step2Offers from "@/components/onboarding/steps/step2Offers";
import Step3ConversationFlow from "@/components/onboarding/steps/step3ConversationFlow";
import Step4KnowledgeBase from "@/components/onboarding/steps/step4KnowledgeBase";
import Step5ColorConfig from "@/components/onboarding/steps/step5ColorConfig";
import Step6Complete from "@/components/onboarding/steps/step5Complete";
import { useOnboardingStore } from "@/stores/onboardingStore/onboarding.store";
import ResumeModal from "@/components/onboarding/ResumeModal";
import { detectIncompleteOnboarding, getOnboardingProgressSummary } from "@/lib/onboarding/detectIncomplete";

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [incompleteData, setIncompleteData] = useState<any>(null);
  const { currentStep, reset, setCurrentStep } = useOnboardingStore();

  useEffect(() => {
    setMounted(true);
    
    // Check for step query parameter
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const stepParam = urlParams.get('step');
      if (stepParam) {
        const stepNum = parseInt(stepParam, 10);
        if (!isNaN(stepNum) && stepNum >= 1 && stepNum <= 6) {
          console.log('🟢 [OnboardingPage] Setting step from URL param:', stepNum);
          setCurrentStep(stepNum);
        }
      }
    }
  }, [setCurrentStep]);

  useEffect(() => {
    if (status === "unauthenticated" && mounted) {
      router.push("/auth/signin?callbackUrl=/onboarding");
    }
  }, [status, mounted, router]);

  // Check if user has already completed onboarding and detect incomplete progress
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (status === "authenticated" && session?.user?.id && mounted) {
        try {
          const response = await fetch('/api/user/onboarding-status');
          if (response.ok) {
            const data = await response.json();
            if (data.hasCompletedOnboarding) {
              // Check if user came from "Add Offers" button (check URL params or referrer)
              const urlParams = new URLSearchParams(window.location.search);
              const step = urlParams.get('step');
              const allowAccess = urlParams.get('allowAccess') === 'true';
              
              // If user explicitly wants to add offers, allow access to step 2
              if (step === '2' || allowAccess) {
                console.log('🟢 [OnboardingPage] User has completed onboarding but accessing for offer configuration');
                setCheckingOnboarding(false);
                return; // Allow access
              }
              
              // User has already completed onboarding, redirect to dashboard
              console.log('🟡 [OnboardingPage] User has completed onboarding - redirecting to /dashboard');
              console.log('🟡 [OnboardingPage] Redirecting back to configuration summary');
              router.push('/dashboard');
              return;
            }
          }

          // Check for incomplete onboarding in localStorage
          const incomplete = detectIncompleteOnboarding();
          if (incomplete) {
            setIncompleteData(incomplete);
            setShowResumeModal(true);
          }
        } catch (error) {
          console.error('Error checking onboarding status:', error);
        } finally {
          setCheckingOnboarding(false);
        }
      } else if (status === "unauthenticated") {
        // Even if not authenticated, check for incomplete onboarding
        const incomplete = detectIncompleteOnboarding();
        if (incomplete) {
          setIncompleteData(incomplete);
          setShowResumeModal(true);
        }
        setCheckingOnboarding(false);
      }
    };

    checkOnboardingStatus();
  }, [status, session, mounted, router]);

  // Handle resume - continue with existing data
  const handleResume = () => {
    setShowResumeModal(false);
    // Zustand will automatically restore the state from localStorage
    // Just make sure we're on the right step
    if (incompleteData?.currentStep) {
      useOnboardingStore.getState().setCurrentStep(incompleteData.currentStep);
    }
  };

  // Handle restart - clear all data and start fresh
  const handleRestart = () => {
    reset(); // Clear Zustand store
    if (typeof window !== "undefined") {
      localStorage.removeItem("onboarding-storage"); // Clear localStorage
    }
    setShowResumeModal(false);
    setIncompleteData(null);
    useOnboardingStore.getState().setCurrentStep(1);
  };

  // Show loading while checking auth or onboarding status
  if (status === "loading" || !mounted || checkingOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1525] via-[#0f1b2e] to-[#0a1525]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-cyan-200/70">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (status === "unauthenticated") {
    return null;
  }

  // Render onboarding steps
  return (
    <>
      {/* Resume Modal */}
      {incompleteData && (
        <ResumeModal
          isOpen={showResumeModal}
          onResume={handleResume}
          onRestart={handleRestart}
          progressData={getOnboardingProgressSummary(incompleteData)}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-[#0a1525] via-[#0f1b2e] to-[#0a1525]">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-cyan-200">
                Step {currentStep} of 6
              </span>
              <span className="text-sm text-cyan-200/70">
                {Math.round((currentStep / 6) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 6) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-cyan-500/20 p-8 shadow-2xl">
            {currentStep === 1 && <Step1BusinessSetup />}
            {currentStep === 2 && <Step2Offers />}
            {currentStep === 3 && <Step3ConversationFlow />}
            {currentStep === 4 && <Step4KnowledgeBase />}
            {currentStep === 5 && <Step5ColorConfig />}
            {currentStep === 6 && <Step6Complete />}
          </div>
        </div>
      </div>
    </>
  );
}

