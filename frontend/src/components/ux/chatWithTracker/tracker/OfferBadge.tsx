// components/ux/chatWithTracker/tracker/OfferBadge.tsx
'use client';

import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { getOffer, getTrackingConfig, type OfferType, type Intent } from '@/lib/offers/unified';

interface OfferBadgeProps {
  selectedOffer: OfferType | null;
  currentIntent: Intent | null;
}

export function OfferBadge({ selectedOffer, currentIntent }: OfferBadgeProps) {
  if (!selectedOffer) return null;

  const offer = getOffer(selectedOffer);
  const tracking = getTrackingConfig(selectedOffer);

  if (!offer) return null;

  // Get the Lucide icon component dynamically
  const iconName = tracking?.icon || 'Sparkles';
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string; size?: number }>>)[iconName] || LucideIcons.Sparkles;

  const intentLabels: Record<Intent, string> = {
    buy: 'Buying',
    sell: 'Selling',
    browse: 'Browsing',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mb-4"
    >
      {/* Offer badge */}
      <div
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
        style={{
          background: `linear-gradient(135deg, ${tracking?.color || '#3b82f6'}dd, ${tracking?.color || '#3b82f6'}99)`,
          boxShadow: `0 2px 8px ${tracking?.color || '#3b82f6'}40`,
          color: 'var(--color-text-on-gradient)',
        }}
      >
        <IconComponent size={16} />
        <span>{offer.label}</span>
      </div>

      {/* Intent sub-badge */}
      {currentIntent && (
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
          style={{
            backgroundColor: 'rgba(var(--color-text-on-background-rgb, 255,255,255), 0.1)',
            color: 'var(--color-text-on-background-dim)',
          }}
        >
          {intentLabels[currentIntent]}
        </motion.span>
      )}
    </motion.div>
  );
}
