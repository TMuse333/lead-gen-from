'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Gift, FileText, Layout, Video, Home, Sparkles,
  Plus, Settings, Play, AlertCircle, CheckCircle2,
  ArrowRight, ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useUserConfig } from '@/contexts/UserConfigContext';
import { getOfferDefinition, getAllOfferDefinitions } from '@/lib/offers';
import type { OfferType } from '@/stores/onboardingStore/onboarding.store';

interface OfferStatus {
  type: OfferType;
  enabled: boolean;
  configured: boolean;
  lastGenerated?: Date;
  totalGenerations?: number;
}

export default function OffersDashboard() {
  const { config, loading } = useUserConfig();
  const router = useRouter();
  const [offers, setOffers] = useState<OfferStatus[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(true);

  useEffect(() => {
    if (!loading && config) {
      // Get all available offer definitions
      const allDefinitions = getAllOfferDefinitions();
      
      // Get user's selected offers from config
      const selectedOffers = config.selectedOffers || [];
      
      // Map to offer status
      const offerStatuses: OfferStatus[] = selectedOffers.map((offerType) => {
        const definition = getOfferDefinition(offerType as OfferType);
        return {
          type: offerType as OfferType,
          enabled: true, // TODO: Check if user has custom config that disables it
          configured: !!definition,
          // TODO: Fetch generation stats from API
        };
      });
      
      setOffers(offerStatuses);
      setLoadingOffers(false);
    } else if (!loading && !config) {
      setLoadingOffers(false);
    }
  }, [config, loading]);

  const hasOffers = offers.length > 0;
  const configuredOffers = offers.filter(o => o.configured);

  if (loading || loadingOffers) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state - no offers configured
  if (!hasOffers) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-cyan-500/20 p-12 text-center"
          >
            <div className="mb-6">
              <Gift className="h-16 w-16 text-cyan-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-2">
                No Offers Configured
              </h2>
              <p className="text-slate-300 text-lg">
                Configure what you'll provide to users who complete your chatbot
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-6 mb-6 text-left">
              <h3 className="text-lg font-semibold text-cyan-200 mb-3">
                What are offers?
              </h3>
              <p className="text-slate-300 mb-4">
                Offers are the value you provide to users after they complete your chatbot conversation. 
                Examples include:
              </p>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start gap-2">
                  <FileText className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span><strong>PDF Guides</strong> - Downloadable resources personalized to their situation</span>
                </li>
                <li className="flex items-start gap-2">
                  <Layout className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span><strong>Landing Pages</strong> - Personalized results pages with insights and recommendations</span>
                </li>
                <li className="flex items-start gap-2">
                  <Home className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span><strong>Home Estimates</strong> - Property valuations and market analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <Video className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span><strong>Video Content</strong> - Personalized video scripts and content</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                onClick={() => {
                  console.log('🔵 [OffersDashboard] "Configure Offers" button clicked - redirecting to /dashboard/offers/add');
                  router.push('/dashboard/offers/add');
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-cyan-400/50 transition-all"
              >
                <Plus className="h-5 w-5" />
                Configure Offers
              </motion.button>
              <motion.button
                onClick={() => router.push('/dashboard?section=config')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 transition-all"
              >
                <Settings className="h-5 w-5" />
                View My Setup
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Has offers - show them
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Total Offers</span>
              <Gift className="h-5 w-5 text-cyan-400" />
            </div>
            <p className="text-3xl font-bold text-white">{offers.length}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Configured</span>
              <CheckCircle2 className="h-5 w-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">{configuredOffers.length}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Active</span>
              <Play className="h-5 w-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {offers.filter(o => o.enabled).length}
            </p>
          </motion.div>
        </div>

        {/* Offers List */}
        <div className="space-y-4">
          {offers.map((offer, index) => {
            const definition = getOfferDefinition(offer.type);
            const Icon = getOfferIcon(offer.type);
            
            return (
              <motion.div
                key={offer.type}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-cyan-500/10 rounded-lg">
                      <Icon className="h-6 w-6 text-cyan-400" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">
                          {definition?.label || offer.type}
                        </h3>
                        {offer.configured && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded">
                            Configured
                          </span>
                        )}
                        {offer.enabled ? (
                          <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-medium rounded">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-slate-500/20 text-slate-400 text-xs font-medium rounded">
                            Disabled
                          </span>
                        )}
                      </div>
                      
                      <p className="text-slate-300 mb-4">
                        {definition?.description || 'No description available'}
                      </p>

                      {definition && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {definition.inputRequirements.requiredFields.map((field) => (
                            <span
                              key={field}
                              className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded"
                            >
                              {field}
                            </span>
                          ))}
                        </div>
                      )}

                      {offer.totalGenerations !== undefined && (
                        <p className="text-sm text-slate-400">
                          {offer.totalGenerations} generations
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        console.log('🔵 [OffersDashboard] "Configure" button clicked for offer:', offer.type);
                        console.log('🔵 [OffersDashboard] Navigating to:', `/dashboard/offers/${offer.type}`);
                        router.push(`/dashboard/offers/${offer.type}`);
                      }}
                      className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      Configure
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Add More Offers CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/20 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Want to add more offers?
              </h3>
              <p className="text-slate-400 text-sm">
                Configure additional offer types to provide more value to your users
              </p>
            </div>
            <button
              onClick={() => {
                console.log('🔵 [OffersDashboard] "Add Offers" button clicked - redirecting to /dashboard/offers/add');
                router.push('/dashboard/offers/add');
              }}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Add Offers
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function getOfferIcon(type: OfferType) {
  switch (type) {
    case 'pdf':
      return FileText;
    case 'landingPage':
      return Layout;
    case 'video':
      return Video;
    case 'home-estimate':
      return Home;
    case 'custom':
      return Sparkles;
    default:
      return Gift;
  }
}

