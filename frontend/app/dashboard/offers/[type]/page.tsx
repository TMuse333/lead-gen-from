'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { OfferEditor } from '@/components/dashboard/user/offers/editor/OfferEditor';
import type { OfferType } from '@/stores/onboardingStore/onboarding.store';

export default function OfferEditorPage() {
  const params = useParams();
  const router = useRouter();
  const offerType = params.type as OfferType;

  // Log page initialization
  useEffect(() => {
    console.log('🟢 [OfferEditorPage] Component mounted');
    console.log('🟢 [OfferEditorPage] Route params:', params);
    console.log('🟢 [OfferEditorPage] Offer type:', offerType);
    console.log('🟢 [OfferEditorPage] Current pathname:', window.location.pathname);
  }, [params, offerType]);

  const handleBack = () => {
    console.log('🟡 [OfferEditorPage] "Back to Offers" clicked - redirecting to /dashboard?section=offers');
    router.push('/dashboard?section=offers');
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Top Bar */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-30">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {offerType ? `${offerType.toUpperCase()} Offer Editor` : 'Offer Editor'}
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Customize settings, test generation, and view analytics
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="group flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:shadow-lg"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span className="hidden sm:inline">Back to Offers</span>
              </button>
              <Link
                href="/"
                className="group flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:shadow-lg"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span className="hidden sm:inline">Back to Home</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {offerType ? (
          <OfferEditor 
            offerType={offerType} 
            onBack={handleBack}
          />
        ) : (
          <div className="flex items-center justify-center h-96">
            <p className="text-slate-300">Invalid offer type</p>
          </div>
        )}
      </div>
    </div>
  );
}

