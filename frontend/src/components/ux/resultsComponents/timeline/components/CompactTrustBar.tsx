// components/ux/resultsComponents/timeline/components/CompactTrustBar.tsx
'use client';

import { Star, Calendar, TrendingUp, Award, MapPin, Users } from 'lucide-react';
import type { AgentCredentials } from './AgentExpertise';
import type { ColorTheme } from '@/lib/colors/defaultTheme';

interface CompactTrustBarProps {
  agent: AgentCredentials;
  colorTheme?: ColorTheme;
  className?: string;
}

/**
 * Compact horizontal trust bar showing key agent credentials
 * Designed to be placed right below the hero for quick credibility
 */
export function CompactTrustBar({ agent, colorTheme, className = '' }: CompactTrustBarProps) {
  const hasCustomTheme = !!colorTheme;

  // Build stat items based on available data
  const statItems: { icon: React.ReactNode; label: string; value: string }[] = [];

  // Rating (most important for trust)
  if (agent.avgRating) {
    statItems.push({
      icon: <Star className="h-4 w-4 text-amber-500 fill-amber-500" />,
      label: 'Rating',
      value: `${agent.avgRating}${agent.reviewCount ? ` (${agent.reviewCount})` : ''}`,
    });
  }

  // Years of experience
  if (agent.yearsExperience > 0) {
    statItems.push({
      icon: <Calendar className="h-4 w-4" />,
      label: 'Experience',
      value: `${agent.yearsExperience}+ Years`,
    });
  }

  // Total transactions
  if (agent.totalTransactions) {
    statItems.push({
      icon: <TrendingUp className="h-4 w-4" />,
      label: 'Sales',
      value: `${agent.totalTransactions}+ Sales`,
    });
  }

  // Similar clients helped
  if (agent.similarClientsHelped) {
    statItems.push({
      icon: <Users className="h-4 w-4" />,
      label: 'Similar Clients',
      value: `${agent.similarClientsHelped} Like You`,
    });
  }

  // First certification (as a badge)
  if (agent.certifications && agent.certifications.length > 0) {
    statItems.push({
      icon: <Award className="h-4 w-4" />,
      label: 'Certified',
      value: agent.certifications[0],
    });
  }

  // Areas served count
  if (agent.areasServed && agent.areasServed.length > 0 && statItems.length < 5) {
    statItems.push({
      icon: <MapPin className="h-4 w-4" />,
      label: 'Areas',
      value: `${agent.areasServed.length} Areas`,
    });
  }

  // Limit to 4-5 items for clean display
  const displayItems = statItems.slice(0, 5);

  if (displayItems.length === 0) {
    return null;
  }

  const containerStyle = hasCustomTheme
    ? {
        backgroundColor: colorTheme.surface,
        borderColor: `${colorTheme.primary}30`,
      }
    : undefined;

  const iconStyle = hasCustomTheme ? { color: colorTheme.primary } : undefined;
  const textStyle = hasCustomTheme ? { color: colorTheme.text } : undefined;
  const subTextStyle = hasCustomTheme ? { color: colorTheme.textSecondary } : undefined;

  return (
    <div
      className={`w-full ${hasCustomTheme ? '' : 'bg-white'} border-y ${hasCustomTheme ? '' : 'border-gray-200'} ${className}`}
      style={containerStyle}
    >
      <div className="max-w-5xl mx-auto px-4 py-3">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:gap-x-8">
          {displayItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className={hasCustomTheme ? '' : 'text-gray-400'} style={iconStyle}>
                {item.icon}
              </span>
              <span
                className={`text-sm font-semibold ${hasCustomTheme ? '' : 'text-gray-900'}`}
                style={textStyle}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Inline stat badges for hero section - more compact version
 */
interface HeroStatBadgesProps {
  agent: AgentCredentials;
  className?: string;
}

export function HeroStatBadges({ agent, className = '' }: HeroStatBadgesProps) {
  const badges: string[] = [];

  if (agent.avgRating) {
    badges.push(`${agent.avgRating}${agent.reviewCount ? ` (${agent.reviewCount} reviews)` : ''}`);
  }

  if (agent.yearsExperience > 0) {
    badges.push(`${agent.yearsExperience} years`);
  }

  if (agent.totalTransactions) {
    badges.push(`${agent.totalTransactions}+ sales`);
  }

  if (badges.length === 0) {
    return null;
  }

  return (
    <p className={`text-sm text-white/80 ${className}`}>
      {agent.avgRating && <Star className="inline h-3.5 w-3.5 text-amber-400 fill-amber-400 mr-1 -mt-0.5" />}
      {badges.join(' • ')}
    </p>
  );
}
