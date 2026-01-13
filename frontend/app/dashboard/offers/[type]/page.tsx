'use client';

import { useParams, useRouter } from 'next/navigation';
import { OfferEditor } from '@/components/dashboard/user/offers/editor/OfferEditor';
import type { OfferType } from '@/stores/onboardingStore/onboarding.store';

export default function OfferEditorPage() {
  const params = useParams();
  const router = useRouter();
  const offerType = params.type as OfferType;

  const handleBack = () => {
    router.push('/dashboard?section=offers');
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-900">
      {/* OfferEditor handles its own header, tabs, and navigation */}
      <div className="flex-1 overflow-y-auto p-6">
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

