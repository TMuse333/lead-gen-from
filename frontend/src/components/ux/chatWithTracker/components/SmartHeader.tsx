// components/ux/chatWithTracker/components/SmartHeader.tsx
'use client';

import { X, Calendar, FileText, Video, Home, Sparkles } from 'lucide-react';
import type { OfferType } from '@/stores/onboardingStore/onboarding.store';

interface SmartHeaderProps {
  businessName: string;
  currentOffer?: OfferType;
  progress: number;
  currentStep?: number;
  totalSteps?: number;
  onClose?: () => void;
}

const OFFER_ICONS: Record<OfferType, typeof Calendar> = {
  'real-estate-timeline': Calendar,
  'pdf': FileText,
  'video': Video,
  'home-estimate': Home,
  'landingPage': Sparkles,
  'custom': Sparkles,
};

const OFFER_LABELS: Record<OfferType, string> = {
  'real-estate-timeline': 'Personalized Timeline',
  'pdf': 'Custom Report',
  'video': 'Video Walkthrough',
  'home-estimate': 'Home Estimate',
  'landingPage': 'Landing Page',
  'custom': 'Custom Offer',
};

export function SmartHeader({
  businessName,
  currentOffer,
  progress,
  currentStep,
  totalSteps,
  onClose,
}: SmartHeaderProps) {
  const Icon = currentOffer ? OFFER_ICONS[currentOffer] : Sparkles;
  const offerLabel = currentOffer ? OFFER_LABELS[currentOffer] : 'Getting Started';

  return (
    <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-700">
      <div className="px-4 md:px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Logo & Business Name */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {businessName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="hidden sm:block min-w-0">
              <h1 className="text-white font-semibold truncate">
                {businessName}
              </h1>
              <p className="text-slate-400 text-xs truncate">
                AI Assistant
              </p>
            </div>
          </div>

          {/* Center: Current Offer & Progress */}
          <div className="flex-1 max-w-md">
            {currentOffer && (
              <div className="space-y-2">
                {/* Offer Info */}
                <div className="flex items-center gap-2 justify-center">
                  <Icon className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm font-medium text-slate-300">
                    {offerLabel}
                  </span>
                  {currentStep && totalSteps && (
                    <span className="text-xs text-slate-500">
                      Step {currentStep}/{totalSteps}
                    </span>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 ease-out"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>

                {/* Progress Percentage (Mobile) */}
                <div className="text-center sm:hidden">
                  <span className="text-xs text-cyan-400 font-medium">
                    {Math.round(progress)}%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right: Progress % (Desktop) & Close Button */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {currentOffer && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-cyan-400">
                  {Math.round(progress)}%
                </span>
              </div>
            )}

            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors group"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
