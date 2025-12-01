"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Layout, Video, Plus, X, ArrowRight, ArrowLeft, AlertCircle, ShoppingCart, Home, Eye } from "lucide-react";
import { useOnboardingStore, OfferType, FlowIntention } from "@/stores/onboardingStore/onboarding.store";
import { getOfferRequirements, FIELD_LABELS } from "@/lib/offers/offerRequirements";

const OFFER_OPTIONS: { value: OfferType; label: string; icon: React.ReactNode; description: string }[] = [
  { 
    value: 'home-estimate', 
    label: 'Home Estimate', 
    icon: <span className="text-2xl">🏠</span>,
    description: 'Property valuation estimate'
  },
  { 
    value: 'pdf', 
    label: 'PDF Guide', 
    icon: <FileText className="h-6 w-6" />,
    description: 'Downloadable resource'
  },
  { 
    value: 'landingPage', 
    label: 'Landing Page', 
    icon: <Layout className="h-6 w-6" />,
    description: 'Personalized results page'
  },
  { 
    value: 'video', 
    label: 'Video', 
    icon: <Video className="h-6 w-6" />,
    description: 'Video content or tutorial'
  },
];

const FLOW_OPTIONS: { value: FlowIntention; label: string; icon: React.ReactNode }[] = [
  { value: 'buy', label: 'Buy', icon: <ShoppingCart className="h-4 w-4" /> },
  { value: 'sell', label: 'Sell', icon: <Home className="h-4 w-4" /> },
  { value: 'browse', label: 'Browse', icon: <Eye className="h-4 w-4" /> },
];

export default function Step2Offers() {
  const {
    selectedOffers,
    customOffer,
    selectedIntentions,
    offerFlowMap,
    setSelectedOffers,
    setCustomOffer,
    setOfferFlowMap,
    setCurrentStep,
    markStepComplete,
  } = useOnboardingStore();

  const [showCustomOfferInput, setShowCustomOfferInput] = useState(false);
  const [customOfferValue, setCustomOfferValue] = useState(customOffer);
  const [expandedOffer, setExpandedOffer] = useState<OfferType | null>(null);

  const handleOfferToggle = (offer: OfferType) => {
    if (selectedOffers.includes(offer)) {
      setSelectedOffers(selectedOffers.filter(o => o !== offer));
      // Remove from flow map when deselected - handled by clearing the map entry
    } else {
      setSelectedOffers([...selectedOffers, offer]);
      // Set default flows based on offer's applicableFlows or all selected intentions
      const requirements = getOfferRequirements(offer);
      const defaultFlows = requirements.applicableFlows || selectedIntentions;
      if (defaultFlows.length > 0) {
        setOfferFlowMap(offer, defaultFlows);
      }
    }
  };

  const handleFlowToggle = (offer: OfferType, flow: FlowIntention) => {
    const currentFlows = offerFlowMap[offer] || [];
    const newFlows = currentFlows.includes(flow)
      ? currentFlows.filter(f => f !== flow)
      : [...currentFlows, flow];
    setOfferFlowMap(offer, newFlows);
  };

  const handleAddCustomOffer = () => {
    if (customOfferValue.trim()) {
      setCustomOffer(customOfferValue.trim());
      setShowCustomOfferInput(false);
      setCustomOfferValue('');
    }
  };

  const handleRemoveCustomOffer = () => {
    setCustomOffer('');
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleNext = () => {
    markStepComplete(2);
    setCurrentStep(3); // Navigate to Step 3: Conversation Flow Setup
  };

  const canProceed = selectedOffers.length > 0 || customOffer.trim() !== '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300 bg-clip-text text-transparent mb-2">
          What Are You Going to Offer?
        </h2>
        <p className="text-cyan-200/70">
          Select what you'll provide to users who complete your chatbot
        </p>
      </div>

      {/* Predefined Offers */}
      <div>
        <label className="block text-sm font-medium text-cyan-200 mb-3">
          Select Offers <span className="text-red-400">*</span>
        </label>
        <p className="text-sm text-cyan-200/60 mb-4">
          Choose from common offer types. Each offer shows the required questions you'll need to ask in your conversation flows.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {OFFER_OPTIONS.map((offer) => {
            const isSelected = selectedOffers.includes(offer.value);
            const requirements = getOfferRequirements(offer.value);
            const hasRequirements = requirements.requiredFields.length > 0;
            
            return (
              <motion.div
                key={offer.value}
                role="button"
                tabIndex={0}
                onClick={() => handleOfferToggle(offer.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOfferToggle(offer.value);
                  }
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  flex flex-col items-start gap-3 px-6 py-5 rounded-xl border-2 transition-all text-left cursor-pointer
                  ${isSelected
                    ? 'bg-cyan-500/20 border-cyan-500 shadow-lg shadow-cyan-500/20'
                    : 'bg-white/5 border-cyan-500/30 hover:border-cyan-500/50'
                  }
                `}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className={isSelected ? 'text-cyan-400' : 'text-cyan-400/50'}>
                    {offer.icon}
                  </div>
                  <div className="flex-1">
                    <div className={`font-semibold ${isSelected ? 'text-cyan-200' : 'text-cyan-200/70'}`}>
                      {offer.label}
                    </div>
                    <div className="text-xs text-cyan-200/50 mt-1">
                      {offer.description}
                    </div>
                  </div>
                </div>
                
                {/* Flow Selection - Only show if offer is selected */}
                {isSelected && (
                  <div className="w-full pt-3 border-t border-cyan-500/20">
                    <div className="flex items-start gap-2 mb-2">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-cyan-200/80 mb-2">
                          Applicable to Flows:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {FLOW_OPTIONS.filter(fo => {
                            // Show flows that are both:
                            // 1. Selected by the user in step 1 (selectedIntentions)
                            // 2. Applicable to this offer (requirements.applicableFlows, or all if undefined)
                            const isInSelectedIntentions = selectedIntentions.includes(fo.value);
                            const isApplicableToOffer = !requirements.applicableFlows || requirements.applicableFlows.includes(fo.value);
                            return isInSelectedIntentions && isApplicableToOffer;
                          }).map((flow) => {
                            const isSelectedFlow = (offerFlowMap[offer.value] || []).includes(flow.value);
                            return (
                              <button
                                key={flow.value}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFlowToggle(offer.value, flow.value);
                                }}
                                className={`
                                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                                  ${isSelectedFlow
                                    ? 'bg-cyan-500/30 border border-cyan-500 text-cyan-200'
                                    : 'bg-slate-700/50 border border-slate-600 text-slate-400 hover:border-slate-500'
                                  }
                                `}
                              >
                                {flow.icon}
                                {flow.label}
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-xs text-cyan-200/50 mt-2">
                          Select which conversation flows this offer applies to
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Required Fields */}
                {hasRequirements && (
                  <div className="w-full pt-3 border-t border-cyan-500/20">
                    <div className="flex items-start gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-cyan-400/70 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-cyan-200/80 mb-1">
                          Required Questions:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {requirements.requiredFields.map((field) => (
                            <span
                              key={field}
                              className="text-xs px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 rounded"
                            >
                              {FIELD_LABELS[field] || field}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {!hasRequirements && (
                  <div className="w-full pt-3 border-t border-cyan-500/20">
                    <p className="text-xs text-cyan-200/60">
                      No specific questions required
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Custom Offer */}
      <div>
        <label className="block text-sm font-medium text-cyan-200 mb-3">
          Custom Offer (Optional)
        </label>
        <p className="text-sm text-cyan-200/60 mb-4">
          Describe a custom offer or value proposition you want to provide.
        </p>

        {!showCustomOfferInput && !customOffer ? (
          <button
            type="button"
            onClick={() => setShowCustomOfferInput(true)}
            className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-cyan-500/30 bg-white/5 text-cyan-400 hover:border-cyan-500/50 hover:bg-white/10 transition-all"
          >
            <Plus className="h-5 w-5" />
            Add custom offer
          </button>
        ) : showCustomOfferInput ? (
          <div className="space-y-3">
            <textarea
              value={customOfferValue}
              onChange={(e) => setCustomOfferValue(e.target.value)}
              placeholder="e.g., Free consultation call, 10% discount on first purchase, Custom market analysis report..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-cyan-500/30 text-white placeholder-cyan-200/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all resize-none"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddCustomOffer}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
              >
                Add Offer
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCustomOfferInput(false);
                  setCustomOfferValue('');
                }}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-cyan-500/20 border border-cyan-500/40 rounded-lg">
            <div className="flex items-start justify-between gap-4">
              <p className="text-cyan-200 flex-1">{customOffer}</p>
              <button
                type="button"
                onClick={handleRemoveCustomOffer}
                className="text-cyan-400 hover:text-cyan-300 flex-shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
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
          disabled={!canProceed}
          whileHover={canProceed ? { scale: 1.02 } : {}}
          whileTap={canProceed ? { scale: 0.98 } : {}}
          className={`
            flex items-center gap-2 px-8 py-3 rounded-full font-semibold transition-all
            ${canProceed
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg hover:shadow-cyan-400/50'
              : 'bg-slate-700 text-slate-400 cursor-not-allowed'
            }
          `}
        >
          Continue
          <ArrowRight className="h-5 w-5" />
        </motion.button>
      </div>
    </motion.div>
  );
}

