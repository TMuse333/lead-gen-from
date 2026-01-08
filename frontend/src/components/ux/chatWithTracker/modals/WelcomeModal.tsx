// components/ux/chatWithTracker/modals/WelcomeModal.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, FileText, Video, Home, Sparkles, X, Clock } from 'lucide-react';
import type { OfferType } from '@/stores/onboardingStore/onboarding.store';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessName: string;
  availableOffers: OfferType[];
  onSelectOffer: (offerType: OfferType) => void;
}

const OFFER_CONFIG: Record<OfferType, {
  icon: typeof Calendar;
  title: string;
  description: string;
  duration: string;
  color: string;
}> = {
  'real-estate-timeline': {
    icon: Calendar,
    title: 'Personalized Timeline',
    description: 'Get a step-by-step roadmap customized for your journey',
    duration: '2 min',
    color: 'from-blue-500 to-cyan-500',
  },
  'pdf': {
    icon: FileText,
    title: 'Custom Property Report',
    description: 'Detailed analysis and insights for your property search',
    duration: '3 min',
    color: 'from-purple-500 to-pink-500',
  },
  'video': {
    icon: Video,
    title: 'Video Walkthrough',
    description: 'Personalized video tour and recommendations',
    duration: '3 min',
    color: 'from-orange-500 to-red-500',
  },
  'home-estimate': {
    icon: Home,
    title: 'Home Value Estimate',
    description: 'AI-powered valuation based on current market data',
    duration: '2 min',
    color: 'from-green-500 to-emerald-500',
  },
  'landingPage': {
    icon: Sparkles,
    title: 'Property Landing Page',
    description: 'Custom webpage showcasing your property details',
    duration: '3 min',
    color: 'from-indigo-500 to-purple-500',
  },
  'custom': {
    icon: Sparkles,
    title: 'Custom Offer',
    description: 'Tailored solution for your unique needs',
    duration: '2-5 min',
    color: 'from-cyan-500 to-blue-500',
  },
};

export function WelcomeModal({
  isOpen,
  onClose,
  businessName,
  availableOffers,
  onSelectOffer,
}: WelcomeModalProps) {
  const [selectedOffer, setSelectedOffer] = useState<OfferType | null>(null);

  const handleSelectAndContinue = () => {
    if (selectedOffer) {
      onSelectOffer(selectedOffer);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-slate-700">
              {/* Header */}
              <div className="relative bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-b border-slate-700 p-6">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-slate-400" />
                </button>

                <div className="text-center">
                  <h1 className="text-3xl font-bold text-white mb-2">
                    Welcome to {businessName}
                  </h1>
                  <p className="text-slate-300 text-lg">
                    What can I help you create today?
                  </p>
                </div>
              </div>

              {/* Offers Grid */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableOffers.map((offerType) => {
                    const config = OFFER_CONFIG[offerType];
                    const Icon = config.icon;
                    const isSelected = selectedOffer === offerType;

                    return (
                      <motion.button
                        key={offerType}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedOffer(offerType)}
                        className={`
                          relative overflow-hidden rounded-xl p-6 text-left transition-all
                          ${isSelected
                            ? 'bg-gradient-to-br ' + config.color + ' shadow-lg ring-2 ring-white/50'
                            : 'bg-slate-800/50 hover:bg-slate-800 border-2 border-slate-700 hover:border-slate-600'
                          }
                        `}
                      >
                        {/* Icon */}
                        <div className={`
                          inline-flex p-3 rounded-lg mb-4
                          ${isSelected ? 'bg-white/20' : 'bg-slate-700/50'}
                        `}>
                          <Icon className={`h-8 w-8 ${isSelected ? 'text-white' : 'text-cyan-400'}`} />
                        </div>

                        {/* Content */}
                        <h3 className={`text-xl font-bold mb-2 ${isSelected ? 'text-white' : 'text-slate-100'}`}>
                          {config.title}
                        </h3>
                        <p className={`text-sm mb-4 ${isSelected ? 'text-white/90' : 'text-slate-400'}`}>
                          {config.description}
                        </p>

                        {/* Duration */}
                        <div className={`flex items-center gap-2 text-sm ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                          <Clock className="h-4 w-4" />
                          <span>{config.duration}</span>
                        </div>

                        {/* Selected Indicator */}
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-4 right-4 bg-white rounded-full p-1"
                          >
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-slate-700 p-6 bg-slate-800/50">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-400">
                    {selectedOffer
                      ? `Selected: ${OFFER_CONFIG[selectedOffer].title}`
                      : 'Choose an option to continue'}
                  </p>
                  <button
                    onClick={handleSelectAndContinue}
                    disabled={!selectedOffer}
                    className={`
                      px-6 py-3 rounded-lg font-semibold transition-all
                      ${selectedOffer
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl'
                        : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      }
                    `}
                  >
                    Continue →
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
