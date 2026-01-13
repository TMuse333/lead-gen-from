'use client';

/**
 * Timeline Dashboard
 * Direct access to timeline configuration without the "offers" wrapper
 * Embeds the OfferEditor for 'real-estate-timeline' type
 */

import { useRouter, useSearchParams } from 'next/navigation';
import { OfferEditor } from '../offers/editor/OfferEditor';

export default function TimelineDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get tab from URL if present (for deep linking)
  const tabParam = searchParams.get('tab');

  const handleBack = () => {
    router.push('/dashboard?section=home');
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="flex-1 overflow-y-auto p-6">
        <OfferEditor
          offerType="real-estate-timeline"
          onBack={handleBack}
        />
      </div>
    </div>
  );
}
