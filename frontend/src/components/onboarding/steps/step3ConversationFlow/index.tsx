"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, ArrowLeft, Eye, ShoppingCart, Home,
  CheckCircle2, Sparkles, AlertCircle, X
} from "lucide-react";
import { useOnboardingStore, FlowIntention } from "@/stores/onboardingStore/onboarding.store";
import { createDefaultFlows } from "@/stores/conversationConfig/defaults/defaults";
import type { ConversationFlow } from "@/stores/conversationConfig/conversation.store";
import FlowSummary from "./FlowSummary";
import QuestionConfigFlow from "./QuestionConfigFlow";
import { validateOfferRequirements, formatValidationErrors } from "@/lib/onboarding/validateOfferRequirements";
import { FIELD_LABELS } from "@/lib/offers/offerRequirements";

const FLOW_INTENTION_ICONS = {
  buy: ShoppingCart,
  sell: Home,
  browse: Eye,
};

const FLOW_INTENTION_LABELS = {
  buy: "Buy",
  sell: "Sell",
  browse: "Browse",
};

export default function Step3ConversationFlow() {
  const {
    businessName,
    selectedIntentions,
    selectedOffers,
    conversationFlows,
    addConversationFlow,
    updateConversationFlow,
    setCurrentStep,
    markStepComplete,
  } = useOnboardingStore();

  const [activeFlowType, setActiveFlowType] = useState<FlowIntention | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);

  // Initialize flows from defaults if not already set
  useEffect(() => {
    const defaults = createDefaultFlows();
    selectedIntentions.forEach((intention) => {
      if (!conversationFlows[intention] && defaults[intention]) {
        const defaultFlow = defaults[intention];
        const customizedFlow: ConversationFlow = {
          ...defaultFlow,
          flowPrompt: {
            ...defaultFlow.flowPrompt,
            systemBase: defaultFlow.flowPrompt.systemBase.replace(
              "Chris's",
              `${businessName}'s`
            ),
          },
          metadata: {
            ...defaultFlow.metadata,
            author: 'onboarding',
          },
        };
        addConversationFlow(customizedFlow);
      }
    });
  }, [selectedIntentions, businessName, conversationFlows, addConversationFlow]);

  const activeFlow = activeFlowType ? conversationFlows[activeFlowType] : null;

  const handleBack = () => {
    setCurrentStep(2);
  };

  const handleNext = () => {
    const hasAllFlows = selectedIntentions.every(
      intention => conversationFlows[intention]
    );

    if (!hasAllFlows || selectedIntentions.length === 0) {
      return;
    }

    // Check validation (already calculated at component level)
    if (!validation.isValid) {
      const errorMessage = formatValidationErrors(validation);
      setValidationError(errorMessage);
      setShowValidationModal(true);
      return;
    }

    // All good, proceed
    markStepComplete(3);
    setCurrentStep(4); // Move to Step 4: Knowledge Base
  };

  const canProceed = selectedIntentions.length > 0 && 
                     selectedIntentions.every(intention => conversationFlows[intention]);

  const completedFlows = selectedIntentions.filter(intention => conversationFlows[intention]);

  // Get validation result for real-time display
  const validation = validateOfferRequirements(selectedOffers, conversationFlows);
  const hasValidationIssues = !validation.isValid;

  // If editing a question, show the mini flow
  if (editingQuestionId && activeFlowType) {
    return (
      <QuestionConfigFlow
        flowType={activeFlowType}
        questionId={editingQuestionId}
        onComplete={() => setEditingQuestionId(null)}
        onBack={() => setEditingQuestionId(null)}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Validation Warning Banner - Updates in real-time */}
      {hasValidationIssues && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-yellow-300 font-semibold mb-2">
                Missing Required Questions
              </h3>
              <p className="text-yellow-200/80 text-sm mb-3">
                Some of your selected offers require questions that aren't in your conversation flows yet.
              </p>
              <div className="space-y-2">
                {validation.missingFields.map(({ offerLabel, missingFields }) => (
                  <div key={offerLabel} className="bg-yellow-500/5 rounded p-2">
                    <p className="text-yellow-200 text-sm font-medium mb-1">
                      {offerLabel} needs:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {missingFields.map((field) => (
                        <span
                          key={field}
                          className="text-xs px-2 py-1 bg-yellow-500/20 border border-yellow-500/40 text-yellow-200 rounded"
                        >
                          {FIELD_LABELS[field] || field}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-yellow-200/70 text-xs mt-3">
                💡 Add these questions to your flows above, or remove the offers that require them.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Success Message - All requirements met */}
      {!hasValidationIssues && selectedOffers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/10 border border-green-500/30 rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
            <p className="text-green-200 text-sm">
              ✅ All required questions for your selected offers are present in your conversation flows.
            </p>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="text-center mb-6 relative">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300 bg-clip-text text-transparent mb-2">
          Configure Your Conversation Flows
        </h2>
        <p className="text-cyan-200/70">
          Review and customize the questions for each flow. Click on a question to configure it.
        </p>
      </div>

      {/* Flow Status */}
      {selectedIntentions.length > 0 && (
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-cyan-200">
              Flow Progress
            </span>
            <span className="text-sm text-cyan-200/70">
              {completedFlows.length} of {selectedIntentions.length} configured
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {selectedIntentions.map((intention) => {
              const isComplete = !!conversationFlows[intention];
              const Icon = FLOW_INTENTION_ICONS[intention];
              const flow = conversationFlows[intention];
              const isActive = activeFlowType === intention;
              
              return (
                <button
                  key={intention}
                  onClick={() => setActiveFlowType(intention)}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg border transition-all text-left
                    ${isActive
                      ? 'bg-cyan-500/20 border-cyan-500'
                      : isComplete
                      ? 'bg-green-500/10 border-green-500/30 hover:border-green-500/50'
                      : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-cyan-400' : isComplete ? 'text-green-400' : 'text-cyan-400/50'}`} />
                  <div className="flex-1">
                    <div className={`font-medium ${isActive ? 'text-cyan-200' : isComplete ? 'text-green-200' : 'text-cyan-200'}`}>
                      {FLOW_INTENTION_LABELS[intention]} Flow
                    </div>
                    {flow && (
                      <div className="text-xs text-cyan-200/70">
                        {flow.questions?.length || 0} questions
                      </div>
                    )}
                  </div>
                  {isComplete && !isActive && (
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Flow Summary */}
      {activeFlow && (
        <FlowSummary
          flow={activeFlow}
          flowType={activeFlowType!}
          onEditQuestion={(questionId) => setEditingQuestionId(questionId)}
          onEnhanceWithAI={() => {
            // TODO: Implement AI enhancement
            alert("AI enhancement coming soon!");
          }}
        />
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-cyan-500/20">
        <motion.button
          onClick={handleBack}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold bg-white/5 border border-cyan-500/30 text-cyan-200 hover:bg-white/10 transition-all"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </motion.button>

        <motion.button
          onClick={handleNext}
          disabled={!canProceed || hasValidationIssues}
          whileHover={canProceed && !hasValidationIssues ? { scale: 1.02 } : {}}
          whileTap={canProceed && !hasValidationIssues ? { scale: 0.98 } : {}}
          className={`
            flex items-center gap-2 px-8 py-3 rounded-full font-semibold transition-all
            ${canProceed && !hasValidationIssues
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg hover:shadow-cyan-400/50'
              : 'bg-slate-700 text-slate-400 cursor-not-allowed'
            }
          `}
          title={hasValidationIssues ? 'Please fix missing required questions before continuing' : ''}
        >
          Continue
          <ArrowRight className="h-5 w-5" />
        </motion.button>
      </div>

      {/* Validation Error Modal */}
      <AnimatePresence>
        {showValidationModal && validationError && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
              onClick={() => setShowValidationModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl border border-red-500/30 shadow-2xl max-w-lg w-full p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/20 rounded-lg">
                      <AlertCircle className="h-6 w-6 text-red-400" />
                    </div>
                    <h3 className="text-xl font-bold text-red-300">
                      Missing Required Questions
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowValidationModal(false)}
                    className="p-2 text-slate-400 hover:text-slate-300 rounded-lg hover:bg-slate-700/50 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <p className="text-slate-300 mb-4">
                  Some of your selected offers require questions that aren't in your conversation flows. Please add them or remove the offers.
                </p>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
                  <pre className="text-sm text-red-200 whitespace-pre-wrap font-sans">
                    {validationError}
                  </pre>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowValidationModal(false)}
                    className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  >
                    I'll Fix This
                  </button>
                  <button
                    onClick={() => {
                      setShowValidationModal(false);
                      setCurrentStep(2); // Go back to offers step
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Go Back to Offers
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

