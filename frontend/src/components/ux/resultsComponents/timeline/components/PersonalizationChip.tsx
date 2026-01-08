// components/ux/resultsComponents/timeline/components/PersonalizationChip.tsx
'use client';

import { MapPin, DollarSign, Calendar, Home, User, Clock, Target } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type ChipType = 'location' | 'budget' | 'timeline' | 'property' | 'user' | 'stage' | 'custom';

interface PersonalizationChipProps {
  type: ChipType;
  value: string;
  label?: string;
  highlight?: boolean;
}

const CHIP_CONFIG: Record<ChipType, { icon: LucideIcon; bgColor: string; textColor: string; borderColor: string }> = {
  location: {
    icon: MapPin,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
  },
  budget: {
    icon: DollarSign,
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
  },
  timeline: {
    icon: Calendar,
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
  },
  property: {
    icon: Home,
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
  },
  user: {
    icon: User,
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-700',
    borderColor: 'border-pink-200',
  },
  stage: {
    icon: Target,
    bgColor: 'bg-cyan-50',
    textColor: 'text-cyan-700',
    borderColor: 'border-cyan-200',
  },
  custom: {
    icon: Clock,
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-200',
  },
};

/**
 * Visual indicator that content is personalized
 * Reinforces the "this is for YOU" signal
 */
export function PersonalizationChip({ type, value, label, highlight = false }: PersonalizationChipProps) {
  const config = CHIP_CONFIG[type];
  const Icon = config.icon;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
        border transition-all
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        ${highlight ? 'ring-2 ring-offset-1 ring-blue-400/50 shadow-sm' : ''}
      `}
    >
      <Icon className="h-3 w-3" />
      {label && <span className="text-gray-500">{label}:</span>}
      <span className="font-semibold">{value}</span>
    </span>
  );
}

/**
 * Inline text highlight for personalized content
 */
export function PersonalizedText({
  children,
  type = 'custom'
}: {
  children: React.ReactNode;
  type?: ChipType;
}) {
  const config = CHIP_CONFIG[type];

  return (
    <span
      className={`
        px-1.5 py-0.5 rounded font-semibold
        ${config.bgColor} ${config.textColor}
      `}
    >
      {children}
    </span>
  );
}

/**
 * "Based on your X" callout for advice sections
 */
export function BasedOnYour({
  factors,
  className = '',
}: {
  factors: { type: ChipType; value: string }[];
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 flex-wrap text-xs ${className}`}>
      <span className="text-gray-500 font-medium">Based on your:</span>
      {factors.map((factor, idx) => (
        <PersonalizationChip key={idx} type={factor.type} value={factor.value} />
      ))}
    </div>
  );
}
