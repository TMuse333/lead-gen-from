'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FileText, Layout, Video, Home, Sparkles, ArrowRight, X } from 'lucide-react';
import { getAllOfferDefinitions } from '@/lib/offers';
import type { OfferType } from '@/stores/onboardingStore/onboarding.store';
import { useUserConfig } from '@/contexts/UserConfigContext';

const OFFER_ICONS: Record<OfferType, typeof FileText> = {
  'pdf': FileText,
  'landingPage': Layout,
  'video': Video,
  'home-estimate': Home,
  'custom': Sparkles,
};

export default function AddOfferPage() {
  const router = useRouter();
  const { config } = useUserConfig();
  const [selectedOffer, setSelectedOffer] = useState<OfferType | null>(null);

  // Get all available offer definitions
  const allOffers = getAllOfferDefinitions();
  
  // Filter out offers that are already selected
  const selectedOffers = config?.selectedOffers || [];
  const availableOffers = allOffers.filter(
    ({ type }) => !selectedOffers.includes(type)
  );

  const handleSelectOffer = (offerType: OfferType) => {
    setSelectedOffer(offerType);
    // Navigate directly to the offer editor
    router.push(`/dashboard/offers/${offerType}`);
  };

  const handleBack = () => {
    router.push('/dashboard?section=offers');
  };

  if (availableOffers.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-slate-800/50 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              All Offers Already Added
            </h2>
            <p className="text-slate-300 mb-6">
              You've already configured all available offer types.
            </p>
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors"
            >
              Back to Offers
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
          >
            <X className="h-4 w-4" />
            Back to Offers
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">
            Add New Offer
          </h1>
          <p className="text-slate-300">
            Select an offer type to configure and add to your chatbot
          </p>
        </div>

        {/* Offer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableOffers.map(({ type, definition }, index) => {
            const Icon = OFFER_ICONS[type] || Sparkles;
            
            return (
              <motion.button
                key={type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleSelectOffer(type)}
                className="bg-slate-800/50 border-2 border-slate-700 rounded-xl p-6 text-left hover:border-cyan-500/50 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-cyan-500/10 rounded-lg group-hover:bg-cyan-500/20 transition-colors">
                    <Icon className="h-6 w-6 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">
                      {definition.label}
                    </h3>
                    <p className="text-sm text-slate-300 mb-4">
                      {definition.description}
                    </p>
                    <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium">
                      <span>Configure</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-6"
        >
          <p className="text-slate-300 text-sm">
            <strong className="text-cyan-400">Tip:</strong> You can also add offers through the onboarding flow if you want to configure multiple offers at once.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

