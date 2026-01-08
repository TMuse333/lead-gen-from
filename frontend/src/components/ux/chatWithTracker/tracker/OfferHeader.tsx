// components/ux/chatWithTracker/tracker/OfferHeader.tsx
'use client';

import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { Sparkles, Trophy, Award, Gift } from 'lucide-react';
import { getOffer, getTrackingConfig, type OfferType } from '@/lib/offers/unified';

interface OfferHeaderProps {
  selectedOffer: OfferType | null;
  progress: number;
  isComplete: boolean;
}

export function OfferHeader({ selectedOffer, progress, isComplete }: OfferHeaderProps) {
  const offer = selectedOffer ? getOffer(selectedOffer) : null;
  const tracking = selectedOffer ? getTrackingConfig(selectedOffer) : null;
  const color = tracking?.color || '#3b82f6';

  // Get offer-specific icon or default
  const iconName = tracking?.icon || 'Sparkles';
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string; size?: number }>>)[iconName] || Sparkles;

  const trophyScale = 0.5 + (progress / 100) * 0.5;

  return (
    <div className="flex items-center justify-between mb-4 relative z-10">
      <div className="flex items-center gap-2">
        <div className="relative">
          <motion.div
            animate={{
              boxShadow: [
                `0 0 8px ${color}40`,
                `0 0 16px ${color}60`,
                `0 0 8px ${color}40`,
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="rounded-lg p-1"
          >
            <span style={{ filter: `drop-shadow(0 0 4px ${color})`, color: 'var(--color-text-on-background)' }}>
              <IconComponent size={20} />
            </span>
          </motion.div>
        </div>
        <div>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-on-background)' }}>
            {offer?.label || 'AI Analysis'}
          </h3>
          {offer && (
            <p className="text-xs" style={{ color: 'var(--color-text-on-background-dim)' }}>
              {offer.description.length > 40
                ? offer.description.substring(0, 40) + '...'
                : offer.description}
            </p>
          )}
        </div>
      </div>

      {/* Reward icon that grows with progress */}
      <motion.div
        animate={{
          scale: [trophyScale, trophyScale * 1.1, trophyScale],
          rotate: isComplete ? [0, 10, -10, 0] : 0,
        }}
        transition={{
          scale: { duration: 2, repeat: Infinity },
          rotate: { duration: 0.5, repeat: isComplete ? Infinity : 0 },
        }}
        className="relative"
      >
        {isComplete ? (
          <Trophy
            className="text-yellow-500"
            size={24 + progress / 4}
            style={{ filter: 'drop-shadow(0 0 8px rgba(234, 179, 8, 0.6))' }}
          />
        ) : progress > 50 ? (
          <Award
            size={24 + progress / 4}
            style={{ color, filter: `drop-shadow(0 0 6px ${color}80)` }}
          />
        ) : (
          <Gift style={{ color: 'var(--color-text-on-background-dim)' }} size={24 + progress / 4} />
        )}

        {/* Glow effect */}
        {progress > 30 && (
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              boxShadow: [
                `0 0 ${5 + (progress / 100) * 20}px ${color}4d`,
                `0 0 ${15 + (progress / 100) * 30}px ${color}80`,
                `0 0 ${5 + (progress / 100) * 20}px ${color}4d`,
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.div>
    </div>
  );
}
