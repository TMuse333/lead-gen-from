"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Building2, Mail, Phone, MapPin, Plus, X,
  ShoppingCart, Home, Eye, ArrowRight, Info
} from "lucide-react";
import { useOnboardingStore, DataCollectionType, FlowIntention } from "@/stores/onboardingStore/onboarding.store";
import { sanitizeBusinessName } from "@/lib/utils/sanitizeBusinessName";

const DATA_COLLECTION_OPTIONS: { value: DataCollectionType; label: string; icon: React.ReactNode }[] = [
  { value: 'email', label: 'Email', icon: <Mail className="h-5 w-5" /> },
  { value: 'phone', label: 'Phone', icon: <Phone className="h-5 w-5" /> },
  { value: 'propertyAddress', label: 'Property Address', icon: <MapPin className="h-5 w-5" /> },
];

const FLOW_INTENTIONS: { value: FlowIntention; label: string; icon: React.ReactNode; description: string }[] = [
  { 
    value: 'buy', 
    label: 'Buy', 
    icon: <ShoppingCart className="h-6 w-6" />,
    description: 'For visitors looking to purchase'
  },
  { 
    value: 'sell', 
    label: 'Sell', 
    icon: <Home className="h-6 w-6" />,
    description: 'For visitors looking to sell'
  },
  { 
    value: 'browse', 
    label: 'Browse', 
    icon: <Eye className="h-6 w-6" />,
    description: 'For visitors exploring the market'
  },
];

export default function Step1BusinessSetup() {
  const {
    businessName,
    dataCollection,
    customDataCollection,
    selectedIntentions,
    setBusinessName,
    setDataCollection,
    setCustomDataCollection,
    setSelectedIntentions,
    setCurrentStep,
    markStepComplete,
  } = useOnboardingStore();

  const [showCustomDataInput, setShowCustomDataInput] = useState(false);
  const [customDataValue, setCustomDataValue] = useState(customDataCollection);
  const [displayName, setDisplayName] = useState(businessName || '');

  // Sync display name with store value on mount
  useEffect(() => {
    if (businessName) {
      // If businessName is already sanitized, we need to show a friendly version
      // For now, just use the businessName as-is for display
      setDisplayName(businessName);
    }
  }, []);

  // Calculate sanitized name from display name
  const sanitizedName = displayName ? sanitizeBusinessName(displayName) : '';

  const handleDataCollectionToggle = (type: DataCollectionType) => {
    if (dataCollection.includes(type)) {
      setDataCollection(dataCollection.filter(t => t !== type));
    } else {
      setDataCollection([...dataCollection, type]);
    }
  };

  const handleIntentionToggle = (intention: FlowIntention) => {
    if (selectedIntentions.includes(intention)) {
      setSelectedIntentions(selectedIntentions.filter(i => i !== intention));
    } else {
      setSelectedIntentions([...selectedIntentions, intention]);
    }
  };

  const handleAddCustomData = () => {
    if (customDataValue.trim()) {
      setCustomDataCollection(customDataValue.trim());
      setShowCustomDataInput(false);
      setCustomDataValue('');
    }
  };

  const handleRemoveCustomData = () => {
    setCustomDataCollection('');
  };

  const canProceed = sanitizedName.trim() !== '' && 
                     dataCollection.length > 0 && 
                     selectedIntentions.length > 0;

  const handleNext = () => {
    if (canProceed) {
      markStepComplete(1);
      setCurrentStep(2);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300 bg-clip-text text-transparent mb-2">
          Let's Set Up Your Bot
        </h2>
        <p className="text-cyan-200/70">
          Tell us about your business and what you want to collect
        </p>
      </div>

      {/* Business Name */}
      <div>
        <label htmlFor="businessName" className="block text-sm font-medium text-cyan-200 mb-2">
          Business Name <span className="text-red-400">*</span>
        </label>
        <input
          id="businessName"
          type="text"
          value={displayName}
          onChange={(e) => {
            const value = e.target.value;
            setDisplayName(value);
            const sanitized = sanitizeBusinessName(value);
            setSanitizedName(sanitized);
            // Store the sanitized version in the store
            setBusinessName(sanitized);
          }}
          placeholder="e.g., Bob Real Estate"
          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-cyan-500/30 text-white placeholder-cyan-200/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
        />
        {displayName && sanitizedName && (
          <div className="mt-2 flex items-start gap-2 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <Info className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-cyan-200/80">
                Stored as: <span className="font-mono font-semibold text-cyan-300">{sanitizedName}</span>
              </p>
              <p className="text-xs text-cyan-200/60 mt-1">
                This URL-friendly format is used for your bot URL and system identifiers
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Data Collection */}
      <div>
        <label className="block text-sm font-medium text-cyan-200 mb-3">
          What do you want from the user? <span className="text-red-400">*</span>
        </label>
        <p className="text-sm text-cyan-200/60 mb-4">
          Select all that apply. This is what your bot will collect from visitors.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {DATA_COLLECTION_OPTIONS.map((option) => {
            const isSelected = dataCollection.includes(option.value);
            return (
              <motion.button
                key={option.value}
                type="button"
                onClick={() => handleDataCollectionToggle(option.value)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all
                  ${isSelected
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-200'
                    : 'bg-white/5 border-cyan-500/30 text-cyan-200/70 hover:border-cyan-500/50'
                  }
                `}
              >
                <div className={isSelected ? 'text-cyan-400' : 'text-cyan-400/50'}>
                  {option.icon}
                </div>
                <span className="font-medium">{option.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Custom Data Collection */}
        {!showCustomDataInput && !customDataCollection ? (
          <button
            type="button"
            onClick={() => setShowCustomDataInput(true)}
            className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add custom data field
          </button>
        ) : showCustomDataInput ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={customDataValue}
              onChange={(e) => setCustomDataValue(e.target.value)}
              placeholder="e.g., Company name, Budget range..."
              className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-cyan-500/30 text-white placeholder-cyan-200/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
            <button
              type="button"
              onClick={handleAddCustomData}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCustomDataInput(false);
                setCustomDataValue('');
              }}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 border border-cyan-500/40 rounded-lg">
            <span className="text-cyan-200">{customDataCollection}</span>
            <button
              type="button"
              onClick={handleRemoveCustomData}
              className="ml-auto text-cyan-400 hover:text-cyan-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Flow Intentions */}
      <div>
        <label className="block text-sm font-medium text-cyan-200 mb-3">
          What kind of intentions could your visitors have? <span className="text-red-400">*</span>
        </label>
        <p className="text-sm text-cyan-200/60 mb-4">
          Select the types of conversations your bot should handle. These are predefined flows for real estate.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {FLOW_INTENTIONS.map((intention) => {
            const isSelected = selectedIntentions.includes(intention.value);
            return (
              <motion.button
                key={intention.value}
                type="button"
                onClick={() => handleIntentionToggle(intention.value)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  flex flex-col items-center gap-3 px-6 py-5 rounded-xl border-2 transition-all text-center
                  ${isSelected
                    ? 'bg-cyan-500/20 border-cyan-500 shadow-lg shadow-cyan-500/20'
                    : 'bg-white/5 border-cyan-500/30 hover:border-cyan-500/50'
                  }
                `}
              >
                <div className={isSelected ? 'text-cyan-400' : 'text-cyan-400/50'}>
                  {intention.icon}
                </div>
                <div>
                  <div className={`font-semibold ${isSelected ? 'text-cyan-200' : 'text-cyan-200/70'}`}>
                    {intention.label}
                  </div>
                  <div className="text-xs text-cyan-200/50 mt-1">
                    {intention.description}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Next Button */}
      <div className="flex justify-end pt-6 border-t border-cyan-500/20">
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

