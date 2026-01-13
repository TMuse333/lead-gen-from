// components/ux/chatWithTracker/tracker/DynamicInsights.tsx
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Sparkles, CheckCircle2, Star, TrendingUp, Heart, Clock, Unlock, Target } from 'lucide-react';
import type { Intent } from '@/lib/offers/unified';

interface DynamicInsightsProps {
  clientId: string | null;
  currentIntent: Intent | null;
  progress: number;
  answeredCount: number;
  totalQuestions: number;
  lastAnswerKey?: string;
  lastAnswerValue?: string;
  currentPhaseId?: string;
}

interface InsightItem {
  id: string;
  type: 'story' | 'milestone' | 'encouragement' | 'countdown' | 'phase' | 'match';
  icon: 'book' | 'star' | 'check' | 'sparkle' | 'heart' | 'trending' | 'clock' | 'unlock' | 'target';
  message: string;
  color: string;
}

// Flow-specific messaging
const FLOW_LABELS: Record<string, string> = {
  buy: 'home buying',
  sell: 'home selling',
  browse: 'market exploration',
};

// Phase display names
const PHASE_LABELS: Record<string, string> = {
  'financial-prep': 'Financial Preparation',
  'house-hunting': 'Home Search',
  'make-offer': 'Making an Offer',
  'under-contract': 'Under Contract',
  'closing': 'Closing',
  'post-closing': 'Post-Closing',
  'home-prep': 'Home Preparation',
  'set-price': 'Pricing Strategy',
  'list-property': 'Listing Your Property',
  'marketing-showings': 'Marketing & Showings',
  'review-offers': 'Reviewing Offers',
  'under-contract-sell': 'Under Contract',
  'closing-sell': 'Closing',
  'understand-options': 'Understanding Options',
  'financial-education': 'Financial Education',
  'market-research': 'Market Research',
  'decision-time': 'Decision Time',
  'next-steps': 'Next Steps',
};

// Answer-specific story search terms
const ANSWER_SEARCH_TERMS: Record<string, (value: string) => string> = {
  budget: (v) => v.includes('500') ? 'mid-range budget' : v.includes('300') ? 'starter home' : 'luxury',
  timeline: (v) => v.includes('0-3') ? 'quick timeline' : v.includes('6-12') ? 'flexible timeline' : 'timeline',
  location: (v) => v,
  preApproved: (v) => v === 'yes' ? 'pre-approved buyers' : 'getting pre-approved',
  buyingReason: (v) => v.includes('first') ? 'first-time buyers' : v.includes('invest') ? 'investment' : 'home buying',
  sellingReason: (v) => v.includes('downsize') ? 'downsizing' : v.includes('relocat') ? 'relocation' : 'selling',
};

// Milestone messages based on progress
const MILESTONES = [
  { threshold: 25, message: 'Great start! Your timeline is taking shape.' },
  { threshold: 50, message: 'Halfway there! Your plan is coming together nicely.' },
  { threshold: 75, message: 'Almost done! Just a few more details.' },
  { threshold: 100, message: 'Complete! Your personalized timeline is ready.' },
];

export function DynamicInsights({
  clientId,
  currentIntent,
  progress,
  answeredCount,
  totalQuestions,
  lastAnswerKey,
  lastAnswerValue,
  currentPhaseId,
}: DynamicInsightsProps) {
  const [storyCount, setStoryCount] = useState<number | null>(null);
  const [lastMilestone, setLastMilestone] = useState(0);
  const [currentInsight, setCurrentInsight] = useState<InsightItem | null>(null);
  const [insightQueue, setInsightQueue] = useState<InsightItem[]>([]);
  const [unlockedPhases, setUnlockedPhases] = useState<Set<string>>(new Set());
  const [shownCountdowns, setShownCountdowns] = useState<Set<number>>(new Set());
  const lastAnswerRef = useRef<string>('');

  // Fetch story count when intent changes
  useEffect(() => {
    if (!clientId || !currentIntent) return;

    const fetchStoryCount = async () => {
      try {
        const flow = currentIntent === 'buy' ? 'buy' : currentIntent === 'sell' ? 'sell' : 'browse';
        const res = await fetch(`/api/stories/count?clientId=${encodeURIComponent(clientId)}&flow=${flow}`);
        const data = await res.json();
        if (data.success) {
          setStoryCount(data.count);
        }
      } catch (err) {
        console.error('[DynamicInsights] Error fetching story count:', err);
      }
    };

    fetchStoryCount();
  }, [clientId, currentIntent]);

  // Generate insights based on state changes
  useEffect(() => {
    const newInsights: InsightItem[] = [];
    const questionsRemaining = totalQuestions - answeredCount;

    // Story count insight (show once when we get the count after first answer)
    if (storyCount !== null && storyCount > 0 && answeredCount === 1) {
      const flowLabel = currentIntent ? FLOW_LABELS[currentIntent] || 'your journey' : 'your journey';
      newInsights.push({
        id: `story-${Date.now()}`,
        type: 'story',
        icon: 'book',
        message: `I have ${storyCount} experiences from your agent about ${flowLabel}`,
        color: '#8b5cf6', // Purple
      });
    } else if (storyCount === 0 && answeredCount === 1) {
      newInsights.push({
        id: `story-${Date.now()}`,
        type: 'story',
        icon: 'sparkle',
        message: 'I have personalized guidance ready from your agent',
        color: '#06b6d4', // Cyan
      });
    }

    // Questions remaining countdown (at specific points)
    if (questionsRemaining > 0 && questionsRemaining <= 3 && !shownCountdowns.has(questionsRemaining)) {
      setShownCountdowns(prev => new Set([...prev, questionsRemaining]));
      const plural = questionsRemaining === 1 ? 'question' : 'questions';
      newInsights.push({
        id: `countdown-${questionsRemaining}`,
        type: 'countdown',
        icon: 'clock',
        message: `Just ${questionsRemaining} more ${plural} until your personalized timeline!`,
        color: '#06b6d4', // Cyan
      });
    }

    // Phase unlocking (when currentPhaseId changes and we haven't shown it)
    if (currentPhaseId && !unlockedPhases.has(currentPhaseId)) {
      setUnlockedPhases(prev => new Set([...prev, currentPhaseId]));
      const phaseName = PHASE_LABELS[currentPhaseId] || currentPhaseId;
      // Only show after first couple answers to not overwhelm
      if (answeredCount >= 2) {
        newInsights.push({
          id: `phase-${currentPhaseId}`,
          type: 'phase',
          icon: 'unlock',
          message: `Unlocked: ${phaseName} phase insights`,
          color: '#10b981', // Green
        });
      }
    }

    // Milestone insights
    const currentMilestone = MILESTONES.find(m => progress >= m.threshold && m.threshold > lastMilestone);
    if (currentMilestone) {
      setLastMilestone(currentMilestone.threshold);
      newInsights.push({
        id: `milestone-${currentMilestone.threshold}`,
        type: 'milestone',
        icon: currentMilestone.threshold === 100 ? 'check' : 'star',
        message: currentMilestone.message,
        color: currentMilestone.threshold === 100 ? '#10b981' : '#f59e0b', // Green or Amber
      });
    }

    if (newInsights.length > 0) {
      setInsightQueue(prev => [...prev, ...newInsights]);
    }
  }, [storyCount, progress, answeredCount, currentIntent, lastMilestone, totalQuestions, currentPhaseId, unlockedPhases, shownCountdowns]);

  // Story matching per answer - fetch relevant stories when answer changes
  useEffect(() => {
    if (!clientId || !currentIntent || !lastAnswerKey || !lastAnswerValue) return;

    // Skip if we already processed this answer
    const answerKey = `${lastAnswerKey}:${lastAnswerValue}`;
    if (lastAnswerRef.current === answerKey) return;
    lastAnswerRef.current = answerKey;

    // Skip metadata keys
    if (['intent', 'flow', 'contactName', 'contactEmail', 'contactPhone', 'email'].includes(lastAnswerKey)) {
      return;
    }

    const fetchRelevantStories = async () => {
      try {
        // Get search term based on answer type
        const getSearchTerm = ANSWER_SEARCH_TERMS[lastAnswerKey];
        const searchTerm = getSearchTerm ? getSearchTerm(lastAnswerValue) : lastAnswerValue;

        const flow = currentIntent === 'buy' ? 'buy' : currentIntent === 'sell' ? 'sell' : 'browse';
        const res = await fetch(
          `/api/stories/count?clientId=${encodeURIComponent(clientId)}&flow=${flow}&search=${encodeURIComponent(searchTerm)}`
        );
        const data = await res.json();

        if (data.success && data.count > 0) {
          // Use humble language - "I have X experiences" not "agent has X"
          const keyLabel = lastAnswerKey.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
          setInsightQueue(prev => [...prev, {
            id: `match-${lastAnswerKey}-${Date.now()}`,
            type: 'match',
            icon: 'target',
            message: `I found ${data.count} relevant ${data.count === 1 ? 'experience' : 'experiences'} from your agent matching your ${keyLabel}`,
            color: '#8b5cf6', // Purple
          }]);
        }
      } catch (err) {
        // Silently fail - this is enhancement only
        console.debug('[DynamicInsights] Story match fetch failed:', err);
      }
    };

    // Small delay to not spam API
    const timer = setTimeout(fetchRelevantStories, 500);
    return () => clearTimeout(timer);
  }, [clientId, currentIntent, lastAnswerKey, lastAnswerValue]);

  // Process insight queue - show one at a time
  useEffect(() => {
    if (insightQueue.length > 0 && !currentInsight) {
      const [next, ...rest] = insightQueue;
      setCurrentInsight(next);
      setInsightQueue(rest);

      // Auto-dismiss after 4 seconds (faster for better UX)
      const timer = setTimeout(() => {
        setCurrentInsight(null);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [insightQueue, currentInsight]);

  const IconComponent = useMemo(() => {
    if (!currentInsight) return null;
    switch (currentInsight.icon) {
      case 'book': return BookOpen;
      case 'star': return Star;
      case 'check': return CheckCircle2;
      case 'sparkle': return Sparkles;
      case 'heart': return Heart;
      case 'trending': return TrendingUp;
      case 'clock': return Clock;
      case 'unlock': return Unlock;
      case 'target': return Target;
      default: return Sparkles;
    }
  }, [currentInsight]);

  if (!currentInsight) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentInsight.id}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="mb-4 relative overflow-hidden rounded-xl"
        style={{
          background: `linear-gradient(135deg, ${currentInsight.color}15 0%, ${currentInsight.color}05 100%)`,
          border: `1px solid ${currentInsight.color}30`,
        }}
      >
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute w-20 h-20 rounded-full blur-2xl"
            style={{ backgroundColor: currentInsight.color, opacity: 0.1 }}
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute right-0 bottom-0 w-16 h-16 rounded-full blur-xl"
            style={{ backgroundColor: currentInsight.color, opacity: 0.08 }}
            animate={{
              x: [0, -20, 0],
              y: [0, 10, 0],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          />
        </div>

        <div className="relative p-4 flex items-start gap-3">
          {/* Icon with glow */}
          <motion.div
            className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
            style={{
              backgroundColor: `${currentInsight.color}20`,
              boxShadow: `0 0 20px ${currentInsight.color}30`,
            }}
            animate={{
              scale: [1, 1.05, 1],
              boxShadow: [
                `0 0 20px ${currentInsight.color}30`,
                `0 0 30px ${currentInsight.color}50`,
                `0 0 20px ${currentInsight.color}30`,
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {IconComponent && <IconComponent className="w-5 h-5" style={{ color: currentInsight.color }} />}
          </motion.div>

          {/* Message */}
          <div className="flex-1 min-w-0">
            <motion.p
              className="text-sm font-medium leading-relaxed"
              style={{ color: 'var(--color-text-on-surface)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {currentInsight.message}
            </motion.p>

            {/* Progress indicator for milestones */}
            {currentInsight.type === 'milestone' && (
              <motion.div
                className="mt-2 h-1 rounded-full overflow-hidden"
                style={{ backgroundColor: `${currentInsight.color}20` }}
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: currentInsight.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
                />
              </motion.div>
            )}

            {/* Countdown indicator */}
            {currentInsight.type === 'countdown' && (
              <motion.div
                className="mt-2 flex gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {Array.from({ length: totalQuestions }).map((_, i) => (
                  <div
                    key={i}
                    className="h-1.5 flex-1 rounded-full"
                    style={{
                      backgroundColor: i < answeredCount
                        ? currentInsight.color
                        : `${currentInsight.color}30`,
                    }}
                  />
                ))}
              </motion.div>
            )}
          </div>

          {/* Decorative SVG element */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
            <InsightSVG type={currentInsight.type} color={currentInsight.color} />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Small decorative SVG based on insight type
function InsightSVG({ type, color }: { type: string; color: string }) {
  if (type === 'story' || type === 'match') {
    return (
      <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
        <circle cx="30" cy="30" r="25" stroke={color} strokeWidth="2" strokeDasharray="4 4" />
        <circle cx="30" cy="30" r="15" fill={color} fillOpacity="0.3" />
        <path d="M25 22h10v16H25z" fill={color} />
        <path d="M27 25h6M27 29h6M27 33h4" stroke="white" strokeWidth="1.5" />
      </svg>
    );
  }

  if (type === 'milestone') {
    return (
      <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
        <path d="M30 5l5 15h16l-13 10 5 15-13-10-13 10 5-15L9 20h16z" fill={color} fillOpacity="0.5" />
        <circle cx="30" cy="30" r="8" fill={color} />
      </svg>
    );
  }

  if (type === 'phase' || type === 'countdown') {
    return (
      <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
        <rect x="15" y="15" width="30" height="30" rx="4" stroke={color} strokeWidth="2" />
        <path d="M22 30l5 5 11-11" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
      <circle cx="30" cy="30" r="20" stroke={color} strokeWidth="2" />
      <path d="M30 15v15l10 10" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default DynamicInsights;
