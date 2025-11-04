// lib/leadScoring.ts
import { LeadSubmission } from '@/types';

export type LeadTag = 'hot' | 'warm' | 'cold';

export interface ScoredLead extends LeadSubmission {
  score: number;
  tag: LeadTag;
  scoredAt: Date;
}

/**
 * Score a lead from 0-100 based on urgency and motivation
 */
export function scoreLead(lead: LeadSubmission): { score: number; tag: LeadTag } {
  let score = 0;

  // Timeline urgency (0-40 points) - Most important factor
  const timeline = lead.propertyProfile?.timeline;
  if (timeline === '0-3') score += 40; // ASAP - Hot!
  else if (timeline === '3-6') score += 30; // Soon
  else if (timeline === '6-12') score += 15; // Planning
  else score += 5; // Just exploring

  // Selling motivation (0-30 points)
  const reason = lead.propertyProfile?.sellingReason;
  const urgentReasons = ['relocating', 'downsizing', 'upsizing'];
  if (reason && urgentReasons.includes(reason)) {
    score += 30; // Life event = motivated seller
  } else if (reason === 'investment') {
    score += 20; // Investor = knows what they want
  } else {
    score += 10; // Other reasons
  }

  // Property value estimate (0-20 points) - Higher value = higher priority
  const estimatedValue = lead.analysis?.estimatedValue;
  if (estimatedValue?.low) {
    if (estimatedValue.low >= 500000) score += 20;
    else if (estimatedValue.low >= 350000) score += 15;
    else if (estimatedValue.low >= 200000) score += 10;
    else score += 5;
  }

  // Recent renovations (0-10 points) - Shows investment/care
  if (lead.propertyProfile?.hasRenovations) {
    score += 10;
  }

  // Recency bonus (0-10 points) - Strike while iron is hot
  const daysOld = (Date.now() - new Date(lead.submittedAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysOld < 3) score += 10; // Very recent
  else if (daysOld < 7) score += 5; // Recent

  // Specific concerns mentioned (0-5 points) - Shows they're thinking seriously
  if (lead.propertyProfile?.specificConcerns && lead.propertyProfile.specificConcerns.length > 20) {
    score += 5;
  }

  // Determine tag based on final score
  let tag: LeadTag = 'cold';
  if (score >= 70) tag = 'hot';
  else if (score >= 45) tag = 'warm';

  return { score, tag };
}

/**
 * Get display color for lead tag
 */
export function getTagColor(tag: LeadTag): string {
  switch (tag) {
    case 'hot':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'warm':
      return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'cold':
      return 'bg-blue-100 text-blue-800 border-blue-300';
  }
}

/**
 * Get display icon for lead tag
 */
export function getTagIcon(tag: LeadTag): string {
  switch (tag) {
    case 'hot':
      return '🔥';
    case 'warm':
      return '⚡';
    case 'cold':
      return '❄️';
  }
}

/**
 * Sort leads by score (highest first)
 */
export function sortLeadsByScore(leads: ScoredLead[]): ScoredLead[] {
  return [...leads].sort((a, b) => b.score - a.score);
}

/**
 * Filter leads by tag
 */
export function filterLeadsByTag(leads: ScoredLead[], tag: LeadTag): ScoredLead[] {
  return leads.filter(lead => lead.tag === tag);
}

/**
 * Get lead stats
 */
export function getLeadStats(leads: ScoredLead[]) {
  const hot = leads.filter(l => l.tag === 'hot').length;
  const warm = leads.filter(l => l.tag === 'warm').length;
  const cold = leads.filter(l => l.tag === 'cold').length;
  
  const totalValue = leads.reduce((sum, lead) => {
    return sum + (lead.analysis?.estimatedValue?.low || 0);
  }, 0);

  return {
    total: leads.length,
    hot,
    warm,
    cold,
    totalValue,
    averageScore: leads.length > 0 
      ? Math.round(leads.reduce((sum, l) => sum + l.score, 0) / leads.length)
      : 0,
  };
}