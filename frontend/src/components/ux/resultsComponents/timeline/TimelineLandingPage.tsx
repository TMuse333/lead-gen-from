// components/ux/resultsComponents/timeline/TimelineLandingPage.tsx
'use client';

import { useState } from 'react';
import {
  Download,
  Share2,
  Sparkles,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Target,
  Users,
} from 'lucide-react';
import { StepByStepGuide } from './components/StepByStepGuide';
import { type MarketData } from './components/MarketContext';
import { AgentExpertise, type AgentCredentials } from './components/AgentExpertise';
import { CompactTrustBar, HeroStatBadges } from './components/CompactTrustBar';
import { StoryCard, type MatchedStory } from './components/StoryCard';
import { ClientTestimonial } from '@/components/svg/stories';
import { HeroTimelineStats } from '@/components/svg/timeline';
import { EstimateDisclaimer } from '@/components/ux/shared/EstimateDisclaimer';
import { EndingCTA } from '@/components/ux/resultsComponents/EndingCTA';
import type { TimelineOutput } from '@/lib/offers/definitions/timeline/timeline-types';
import type { EndingCTAConfig } from '@/lib/mongodb/models/clientConfig';
import { generateTimelinePDF } from '@/lib/pdf/generateTimelinePDF';
import type { ColorTheme } from '@/lib/colors/defaultTheme';

interface TimelineLandingPageProps {
  data: TimelineOutput;
  /** User's name for personalization */
  userName?: string;
  /** Agent/business name for personalization */
  agentName?: string;
  /** Agent credentials for expertise section */
  agentCredentials?: AgentCredentials;
  /** Local market data */
  marketData?: MarketData;
  /** Matched stories by phase ID */
  storiesByPhase?: Record<string, MatchedStory[]>;
  /** Enable interactive features */
  interactive?: boolean;
  /** User's color theme - if provided, overrides default flow colors */
  colorTheme?: ColorTheme;
  /** Force mobile layout (for preview purposes) */
  forceMobileLayout?: boolean;
  /** Ending CTA configuration from agent's dashboard settings */
  endingCTA?: EndingCTAConfig;
  /** Conversation ID for linking questions */
  conversationId?: string;
}

/**
 * Enhanced landing page presentation of a timeline offer
 * Includes stories, market context, agent expertise, and interactivity
 */
export function TimelineLandingPage({
  data,
  userName,
  agentName,
  agentCredentials,
  marketData,
  storiesByPhase = {},
  interactive = true,
  colorTheme,
  forceMobileLayout = false,
  endingCTA,
  conversationId,
}: TimelineLandingPageProps) {
  // Helper for responsive classes - when forceMobileLayout is true, use mobile styles
  const responsive = (mobile: string, desktop: string) =>
    forceMobileLayout ? mobile : `${mobile} lg:${desktop.replace(/^lg:/, '')}`;

  // Get user's name - prioritize contactName from data, fallback to userName prop
  const displayUserName = data.userSituation.contactName || userName;
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    setDownloadError(null);

    try {
      await generateTimelinePDF(data, endingCTA || undefined);
    } catch (error) {
      setDownloadError('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: data.title,
          text: data.subtitle || 'Check out my personalized real estate timeline!',
          url: window.location.href,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      // Share failed silently
    }
  };

  // Default flow-based colors (fallback)
  const flowColors = {
    buy: {
      gradient: 'bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50',
      accentColor: 'text-blue-600',
      borderColor: 'border-blue-200',
      badgeBg: 'bg-blue-100',
      iconBg: 'bg-blue-50',
      buttonBg: 'bg-blue-600 hover:bg-blue-700',
      heroGradient: 'from-blue-600 via-blue-500 to-cyan-500',
    },
    sell: {
      gradient: 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50',
      accentColor: 'text-emerald-600',
      borderColor: 'border-emerald-200',
      badgeBg: 'bg-emerald-100',
      iconBg: 'bg-emerald-50',
      buttonBg: 'bg-emerald-600 hover:bg-emerald-700',
      heroGradient: 'from-emerald-600 via-green-500 to-teal-500',
    },
    browse: {
      gradient: 'bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50',
      accentColor: 'text-purple-600',
      borderColor: 'border-purple-200',
      badgeBg: 'bg-purple-100',
      iconBg: 'bg-purple-50',
      buttonBg: 'bg-purple-600 hover:bg-purple-700',
      heroGradient: 'from-purple-600 via-violet-500 to-indigo-500',
    },
  };

  const flow = data.userSituation.flow || 'buy';

  // If colorTheme is provided, generate colors from the user's theme
  // Otherwise fall back to flow-based colors
  const colors = colorTheme
    ? {
        // Use inline styles for custom theme colors
        gradient: '', // Will use inline style
        accentColor: '', // Will use inline style
        borderColor: '', // Will use inline style
        badgeBg: '', // Will use inline style
        iconBg: '', // Will use inline style
        buttonBg: '', // Will use inline style
        heroGradient: '', // Will use inline style
        // Store actual values for inline styles
        _theme: colorTheme,
      }
    : flowColors[flow as keyof typeof flowColors] || flowColors.buy;

  // Helper to check if using custom theme
  const hasCustomTheme = !!colorTheme;

  const flowLabels = {
    buy: { action: 'Buying', noun: 'Buyer' },
    sell: { action: 'Selling', noun: 'Seller' },
    browse: { action: 'Exploring', noun: 'Explorer' },
  };
  const flowLabel = flowLabels[flow as keyof typeof flowLabels] || flowLabels.buy;

  // Count stories for display
  const totalStories = Object.values(storiesByPhase).flat().length;

  // Generate inline styles for custom theme
  const heroStyle = hasCustomTheme
    ? {
        background: `linear-gradient(to right, ${colorTheme.gradientFrom}, ${colorTheme.gradientTo})`,
      }
    : undefined;

  const gradientBgStyle = hasCustomTheme
    ? {
        background: `linear-gradient(to bottom right, ${colorTheme.gradientFrom}15, ${colorTheme.gradientTo}15)`,
      }
    : undefined;

  const accentStyle = hasCustomTheme ? { color: colorTheme.primary } : undefined;
  const borderStyle = hasCustomTheme ? { borderColor: `${colorTheme.primary}40` } : undefined;
  const badgeBgStyle = hasCustomTheme ? { backgroundColor: `${colorTheme.primary}20` } : undefined;
  const iconBgStyle = hasCustomTheme ? { backgroundColor: `${colorTheme.primary}10` } : undefined;
  const buttonStyle = hasCustomTheme
    ? { backgroundColor: colorTheme.primary }
    : undefined;

  // Main page background style
  const pageBackgroundStyle = hasCustomTheme
    ? { backgroundColor: colorTheme.background, color: colorTheme.text }
    : undefined;

  // Surface style for cards and sections
  const surfaceStyle = hasCustomTheme
    ? { backgroundColor: colorTheme.surface, color: colorTheme.text }
    : undefined;

  // Text color overrides for dark themes
  const headingStyle = hasCustomTheme ? { color: colorTheme.text } : undefined;
  const subTextStyle = hasCustomTheme ? { color: colorTheme.textSecondary } : undefined;

  return (
    <div
      className={`min-h-screen ${hasCustomTheme ? '' : 'bg-gray-50'}`}
      style={pageBackgroundStyle}
    >
      {/* Hero Section - Personalized with user name and animated visualization */}
      <section
        className={`relative overflow-hidden ${hasCustomTheme ? '' : 'bg-gray-50'}`}
        style={hasCustomTheme ? { backgroundColor: colorTheme.background } : undefined}
      >
        {/* Decorative background elements */}
        {/* Large gradient orb - top right */}
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={hasCustomTheme ? { backgroundColor: colorTheme.primary } : { backgroundColor: '#3b82f6' }}
        />
        {/* Smaller orb - bottom left */}
        <div
          className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full blur-3xl opacity-15"
          style={hasCustomTheme ? { backgroundColor: colorTheme.primary } : { backgroundColor: '#3b82f6' }}
        />
        {/* Floating accent dots */}
        <div
          className="absolute top-20 left-[15%] w-3 h-3 rounded-full opacity-40"
          style={hasCustomTheme ? { backgroundColor: colorTheme.primary } : { backgroundColor: '#3b82f6' }}
        />
        <div
          className="absolute top-40 right-[20%] w-2 h-2 rounded-full opacity-30"
          style={hasCustomTheme ? { backgroundColor: colorTheme.primary } : { backgroundColor: '#3b82f6' }}
        />
        <div
          className="absolute bottom-32 left-[25%] w-4 h-4 rounded-full opacity-25"
          style={hasCustomTheme ? { backgroundColor: colorTheme.primary } : { backgroundColor: '#3b82f6' }}
        />
        <div
          className="absolute top-1/2 right-[10%] w-2 h-2 rounded-full opacity-35"
          style={hasCustomTheme ? { backgroundColor: colorTheme.primary } : { backgroundColor: '#3b82f6' }}
        />

        <div className="relative max-w-5xl mx-auto px-4 py-14 md:py-20">
          {/* Mobile: flex-col, md+: flex-row, centered */}
          <div className={`flex ${forceMobileLayout ? 'flex-col items-center' : 'flex-col md:flex-row md:items-center md:justify-center'} gap-10 md:gap-16`}>

            {/* Left: Agent Headshot with glow effect */}
            {(endingCTA || data.agentInfo) && (
              <div className={`flex-shrink-0 ${forceMobileLayout ? '' : 'md:order-1'}`}>
                <div className="flex flex-col items-center">
                  {/* Image container with glow */}
                  <div className="relative">
                    {/* Outer glow ring */}
                    <div
                      className="absolute inset-0 rounded-full blur-xl opacity-50 scale-110"
                      style={hasCustomTheme ? { backgroundColor: colorTheme.primary } : { backgroundColor: '#3b82f6' }}
                    />
                    {/* Middle glow ring */}
                    <div
                      className="absolute inset-0 rounded-full blur-md opacity-30 scale-105"
                      style={hasCustomTheme ? { backgroundColor: colorTheme.primary } : { backgroundColor: '#3b82f6' }}
                    />
                    {/* Accent ring border */}
                    <div
                      className="absolute -inset-1 rounded-full opacity-60"
                      style={hasCustomTheme
                        ? { background: `linear-gradient(135deg, ${colorTheme.primary}, ${colorTheme.primary}40, ${colorTheme.primary})` }
                        : { background: 'linear-gradient(135deg, #3b82f6, #3b82f640, #3b82f6)' }}
                    />
                    {(endingCTA?.headshot || data.agentInfo?.photo) ? (
                      <img
                        src={endingCTA?.headshot || data.agentInfo?.photo}
                        alt={endingCTA?.displayName || data.agentInfo?.name || 'Agent'}
                        className="relative w-44 h-44 md:w-56 md:h-56 lg:w-72 lg:h-72 rounded-full object-cover shadow-2xl"
                        style={hasCustomTheme
                          ? { borderWidth: '4px', borderStyle: 'solid', borderColor: colorTheme.background }
                          : { border: '4px solid #f9fafb' }}
                      />
                    ) : (
                      <div
                        className="relative w-44 h-44 md:w-56 md:h-56 lg:w-72 lg:h-72 rounded-full flex items-center justify-center shadow-2xl"
                        style={hasCustomTheme
                          ? { backgroundColor: colorTheme.surface, borderWidth: '4px', borderStyle: 'solid', borderColor: colorTheme.background }
                          : { backgroundColor: '#f3f4f6', border: '4px solid #f9fafb' }}
                      >
                        <Users
                          className="h-20 w-20 md:h-24 md:w-24 lg:h-32 lg:w-32"
                          style={hasCustomTheme ? { color: colorTheme.primary } : { color: '#3b82f6' }}
                        />
                      </div>
                    )}
                  </div>
                  {/* Agent name and title */}
                  <div className="mt-6 text-center">
                    <p
                      className="text-xl lg:text-2xl font-bold"
                      style={hasCustomTheme ? { color: colorTheme.text } : { color: '#111827' }}
                    >
                      {endingCTA?.displayName || data.agentInfo?.name || 'Your Agent'}
                    </p>
                    <p
                      className="text-sm lg:text-base mt-1"
                      style={hasCustomTheme ? { color: colorTheme.primary } : { color: '#3b82f6' }}
                    >
                      {endingCTA?.title || 'Your guide for this journey'}
                    </p>
                    {agentCredentials && (
                      <HeroStatBadges agent={agentCredentials} className="mt-3" />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Right: Text content in a card */}
            <div className={`flex-1 max-w-xl ${forceMobileLayout ? 'text-center' : 'text-center md:text-left md:order-2'}`}>
              {/* Card container */}
              <div
                className="rounded-2xl p-6 md:p-8 shadow-xl border"
                style={hasCustomTheme
                  ? { backgroundColor: `${colorTheme.surface}dd`, borderColor: `${colorTheme.primary}20` }
                  : { backgroundColor: 'rgba(255,255,255,0.9)', borderColor: '#e5e7eb' }}
              >
                {/* Personalized greeting badge */}
                {displayUserName && (
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 font-medium"
                    style={hasCustomTheme
                      ? { backgroundColor: `${colorTheme.primary}20`, color: colorTheme.primary, border: `1px solid ${colorTheme.primary}30` }
                      : { backgroundColor: '#dbeafe', color: '#2563eb', border: '1px solid #bfdbfe' }}
                  >
                    <Sparkles className="h-4 w-4" />
                    <span className="text-sm">
                      Created for {displayUserName}
                    </span>
                  </div>
                )}

                {/* Title - with gradient effect */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                  {displayUserName ? (
                    <>
                      <span
                        className="bg-clip-text text-transparent"
                        style={hasCustomTheme
                          ? { backgroundImage: `linear-gradient(135deg, ${colorTheme.primary}, ${colorTheme.primary}cc)` }
                          : { backgroundImage: 'linear-gradient(135deg, #2563eb, #3b82f6)' }}
                      >
                        {displayUserName}
                      </span>
                      <span style={hasCustomTheme ? { color: colorTheme.textSecondary } : { color: '#6b7280' }}>&apos;s </span>
                    </>
                  ) : (
                    <span style={hasCustomTheme ? { color: colorTheme.textSecondary } : { color: '#6b7280' }}>Your </span>
                  )}
                  <span style={hasCustomTheme ? { color: colorTheme.text } : { color: '#111827' }}>{flowLabel.action} Timeline</span>
                </h1>

                {/* Accent divider line */}
                <div
                  className="w-16 h-1 rounded-full mb-4"
                  style={hasCustomTheme
                    ? { background: `linear-gradient(to right, ${colorTheme.primary}, ${colorTheme.primary}60)` }
                    : { background: 'linear-gradient(to right, #3b82f6, #3b82f660)' }}
                />

                {/* Intro description */}
                <p
                  className={`text-base md:text-lg mb-5 leading-relaxed`}
                  style={hasCustomTheme ? { color: colorTheme.textSecondary } : { color: '#4b5563' }}
                >
                  This is your personalized roadmap — a step-by-step guide designed specifically for your situation.
                  Below you&apos;ll find expert advice, actionable tasks, and everything you need to navigate your{' '}
                  {flowLabel.action.toLowerCase()} journey with confidence.
                </p>

                {/* Your details badges */}
                <div className={`flex flex-wrap ${forceMobileLayout ? 'justify-center' : 'justify-center md:justify-start'} gap-2 mb-5`}>
                  {data.userSituation.location && (
                    <span
                      className="rounded-full px-3 py-1.5 text-xs font-medium border"
                      style={hasCustomTheme
                        ? { backgroundColor: `${colorTheme.primary}10`, color: colorTheme.primary, borderColor: `${colorTheme.primary}30` }
                        : { backgroundColor: '#eff6ff', color: '#2563eb', borderColor: '#bfdbfe' }}
                    >
                      📍 {data.userSituation.location}
                    </span>
                  )}
                  {data.userSituation.isFirstTime && (
                    <span
                      className="rounded-full px-3 py-1.5 text-xs font-medium border"
                      style={hasCustomTheme
                        ? { backgroundColor: `${colorTheme.primary}10`, color: colorTheme.primary, borderColor: `${colorTheme.primary}30` }
                        : { backgroundColor: '#eff6ff', color: '#2563eb', borderColor: '#bfdbfe' }}
                    >
                      🏠 First-Time {flowLabel.noun}
                    </span>
                  )}
                  {data.userSituation.budget && (
                    <span
                      className="rounded-full px-3 py-1.5 text-xs font-medium border"
                      style={hasCustomTheme
                        ? { backgroundColor: `${colorTheme.primary}10`, color: colorTheme.primary, borderColor: `${colorTheme.primary}30` }
                        : { backgroundColor: '#eff6ff', color: '#2563eb', borderColor: '#bfdbfe' }}
                    >
                      💰 {data.userSituation.budget}
                    </span>
                  )}
                  {data.userSituation.timeline && (
                    <span
                      className="rounded-full px-3 py-1.5 text-xs font-medium border"
                      style={hasCustomTheme
                        ? { backgroundColor: `${colorTheme.primary}10`, color: colorTheme.primary, borderColor: `${colorTheme.primary}30` }
                        : { backgroundColor: '#eff6ff', color: '#2563eb', borderColor: '#bfdbfe' }}
                    >
                      📅 {data.userSituation.timeline}
                    </span>
                  )}
                </div>

                {/* What's included */}
                <p
                  className="text-xs"
                  style={hasCustomTheme ? { color: colorTheme.textSecondary } : { color: '#9ca3af' }}
                >
                  Includes {data.phases.length} phases, {data.metadata?.totalActionItems || 0} action items
                  {totalStories > 0 && `, and ${totalStories} relevant client stories`}
                </p>
              </div>

              {/* Timeline Stats - below the card */}
              <div className={`mt-8 ${forceMobileLayout ? 'flex justify-center' : 'flex justify-center md:justify-start'}`}>
                <HeroTimelineStats
                  duration={data.totalEstimatedTime || '4-5 months'}
                  steps={data.phases.length}
                  actions={data.metadata?.totalActionItems || 0}
                  stories={totalStories}
                  budget={data.userSituation.budget}
                  primaryColor={hasCustomTheme ? colorTheme?.primary : undefined}
                  secondaryColor={hasCustomTheme ? colorTheme?.gradientTo : undefined}
                  width={320}
                  height={200}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom accent border */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1"
          style={hasCustomTheme ? { background: `linear-gradient(to right, transparent, ${colorTheme.primary}, transparent)` } : { background: 'linear-gradient(to right, transparent, #3b82f6, transparent)' }}
        />
      </section>

      {/* Compact Trust Bar - Quick credibility stats */}
      {agentCredentials && (
        <CompactTrustBar
          agent={agentCredentials}
          colorTheme={colorTheme}
        />
      )}

      {/* Estimate Disclaimer Banner - Sets expectations upfront */}
      <section className="px-4 py-4 max-w-5xl mx-auto">
        <EstimateDisclaimer
          variant="banner"
          agentContact={data.agentInfo ? {
            name: data.agentInfo.name,
            email: data.agentInfo.email,
            phone: data.agentInfo.phone,
          } : undefined}
          colorTheme={colorTheme}
        />
      </section>

      {/* SECTION 1: Step-by-Step Guide - THE CORE VALUE (moved up immediately after hero)
          Information Theory: Deliver highest-value content first while attention is peak */}
      {/* Step-by-Step Guide */}
      <section
        className={`${hasCustomTheme ? '' : colors.gradient} border-y ${hasCustomTheme ? '' : colors.borderColor}`}
        style={hasCustomTheme ? { ...gradientBgStyle, borderColor: `${colorTheme.primary}40` } : undefined}
      >
        <StepByStepGuide
          phases={data.phases}
          colors={hasCustomTheme ? { ...colors, _theme: colorTheme } : colors}
          intent={data.userSituation.flow}
          showProgress
          agentName={agentName}
          defaultExpanded
          title="Your Step-by-Step Roadmap"
          storiesByPhase={storiesByPhase}
          interactive={interactive}
          userSituation={data.userSituation}
          colorTheme={colorTheme}
        />
      </section>

      {/* SECTION 2: Agent Expertise - Now shown via CompactTrustBar above
          Full AgentExpertise section is available but hidden by default
          since key stats are shown in hero badges and compact trust bar */}
      {/* {agentCredentials && (
        <section
          className={`py-10 px-4 ${hasCustomTheme ? '' : 'bg-white'}`}
          style={surfaceStyle}
        >
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2
                className={`text-2xl md:text-3xl font-bold mb-2 ${hasCustomTheme ? '' : 'text-gray-900'}`}
                style={headingStyle}
              >
                Your Guide for This Journey
              </h2>
              <p className={hasCustomTheme ? '' : 'text-gray-600'} style={subTextStyle}>
                Expert support every step of the way
              </p>
            </div>
            <AgentExpertise
              agent={agentCredentials}
              userSituation={data.userSituation}
              accentColor={colors.accentColor}
            />
          </div>
        </section>
      )} */}

      {/* SECTION 3: Featured Stories - Social Proof (after core content engagement)
          Information Theory: Social validation reinforces decision after seeing value */}
      {totalStories > 0 && (
        <section
          className={`py-10 px-4 ${hasCustomTheme ? '' : 'bg-gradient-to-b from-amber-50/50 to-white'}`}
          style={hasCustomTheme ? { backgroundColor: colorTheme.background } : undefined}
        >
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col items-center">
              {/* Hero SVG - Centered above content */}
              <div className="mb-6 flex justify-center">
                <ClientTestimonial size={180} />
              </div>

              {/* Section Header */}
              <div className="text-center mb-8">
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-3 ${hasCustomTheme ? '' : 'bg-amber-100'}`}
                  style={hasCustomTheme ? { backgroundColor: `${colorTheme.primary}20` } : undefined}
                >
                  <Sparkles className={`h-4 w-4 ${hasCustomTheme ? '' : 'text-amber-600'}`} style={accentStyle} />
                  <span
                    className={`text-sm font-semibold ${hasCustomTheme ? '' : 'text-amber-700'}`}
                    style={accentStyle}
                  >
                    Real Client Experiences
                  </span>
                </div>
                <h2
                  className={`text-2xl md:text-3xl font-bold mb-2 ${hasCustomTheme ? '' : 'text-gray-900'}`}
                  style={headingStyle}
                >
                  Success Stories From People Like You
                </h2>
                <p className={`max-w-2xl mx-auto ${hasCustomTheme ? '' : 'text-gray-600'}`} style={subTextStyle}>
                  See how others navigated their journey with personalized guidance
                </p>
              </div>

              {/* Stories Grid */}
              <div className="w-full grid sm:grid-cols-2 gap-5">
                {Object.entries(storiesByPhase)
                  .flatMap(([phaseId, stories]) =>
                    stories.map(story => ({ ...story, phaseId }))
                  )
                  .slice(0, 4)
                  .map((story, idx) => (
                    <div
                      key={story.id || idx}
                      className={`rounded-2xl border-2 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${hasCustomTheme ? '' : 'bg-white border-amber-200/50 hover:border-amber-300'}`}
                      style={hasCustomTheme ? { backgroundColor: colorTheme.surface, borderColor: `${colorTheme.primary}30` } : undefined}
                    >
                      <div
                        className={`px-4 py-2 border-b ${hasCustomTheme ? '' : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-100'}`}
                        style={hasCustomTheme ? { backgroundColor: `${colorTheme.primary}15`, borderColor: `${colorTheme.primary}20` } : undefined}
                      >
                        <span
                          className={`text-xs font-semibold uppercase tracking-wide ${hasCustomTheme ? '' : 'text-amber-700'}`}
                          style={accentStyle}
                        >
                          {story.phaseId?.replace(/-/g, ' ') || 'Client Story'}
                        </span>
                      </div>
                      <div className="p-4">
                        <StoryCard
                          story={story}
                          accentColor={hasCustomTheme ? '' : colors.accentColor}
                          borderColor="border-transparent"
                          compact={false}
                        />
                      </div>
                    </div>
                  ))}
              </div>

              {totalStories > 4 && (
                <div className="text-center mt-6">
                  <p className={`text-sm ${hasCustomTheme ? '' : 'text-gray-500'}`} style={subTextStyle}>
                    <span className="font-medium">{totalStories - 4} more stories</span> are embedded throughout your timeline
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Market Context - Hidden until reliable data source is available
          To re-enable: uncomment the section below
      {marketData && (
        <section className="py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <MarketContext data={marketData} accentColor={colors.accentColor} />
          </div>
        </section>
      )}
      */}

      {/* Disclaimer */}
      {data.disclaimer && (
        <section className="py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div
              className={`rounded-2xl p-6 border-2 ${hasCustomTheme ? '' : 'bg-amber-50 border-amber-200'}`}
              style={hasCustomTheme ? { backgroundColor: `${colorTheme.primary}10`, borderColor: `${colorTheme.primary}30` } : undefined}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-2 rounded-lg flex-shrink-0 ${hasCustomTheme ? '' : 'bg-amber-100'}`}
                  style={hasCustomTheme ? { backgroundColor: `${colorTheme.primary}20` } : undefined}
                >
                  <AlertCircle className={`h-5 w-5 ${hasCustomTheme ? '' : 'text-amber-600'}`} style={accentStyle} />
                </div>
                <div>
                  <h3
                    className={`text-lg font-bold mb-2 ${hasCustomTheme ? '' : 'text-amber-900'}`}
                    style={headingStyle}
                  >
                    Important Note
                  </h3>
                  <p
                    className={`text-sm leading-relaxed ${hasCustomTheme ? '' : 'text-amber-800'}`}
                    style={subTextStyle}
                  >
                    {data.disclaimer}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Ending CTA Section - Configurable CTA with multiple styles */}
      {(endingCTA || data.agentInfo) && (
        <EndingCTA
          config={endingCTA || {
            // Fallback to agentInfo if no endingCTA config
            displayName: data.agentInfo?.name || 'Your Agent',
            email: data.agentInfo?.email,
            phone: data.agentInfo?.phone,
            company: data.agentInfo?.company,
            headshot: data.agentInfo?.photo,
            style: 'questions-form',
            responseTimeText: 'I typically respond within 24 hours',
          }}
          userName={data.userSituation.contactName}
          userEmail={data.userSituation.contactEmail}
          conversationId={conversationId}
          colorTheme={colorTheme}
          onDownload={handleDownloadPDF}
          onShare={handleShare}
        />
      )}

      {/* CTA Section */}
      <section
        className={`py-12 px-4 ${hasCustomTheme ? '' : 'bg-white'}`}
        style={surfaceStyle}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2
            className={`text-2xl md:text-3xl font-bold mb-4 ${hasCustomTheme ? '' : 'text-gray-900'}`}
            style={headingStyle}
          >
            Ready to Get Started?
          </h2>
          <p
            className={`mb-8 max-w-2xl mx-auto ${hasCustomTheme ? '' : 'text-gray-600'}`}
            style={subTextStyle}
          >
            Save this timeline for reference, or reach out to discuss your specific situation
            and get personalized guidance every step of the way.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className={`
                inline-flex items-center gap-2 px-6 py-3
                ${hasCustomTheme ? '' : colors.buttonBg} text-white
                font-semibold rounded-xl shadow-lg
                hover:shadow-xl hover:scale-105
                transition-all duration-200
                disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100
              `}
              style={buttonStyle}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  Download PDF
                </>
              )}
            </button>

            <button
              onClick={handleShare}
              className={`inline-flex items-center gap-2 px-6 py-3
                font-semibold rounded-xl
                hover:scale-105
                transition-all duration-200
                ${hasCustomTheme ? '' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}
              `}
              style={hasCustomTheme ? { backgroundColor: `${colorTheme.primary}15`, color: colorTheme.text } : undefined}
            >
              <Share2 className="h-5 w-5" />
              Share Timeline
            </button>

            {data.agentInfo?.email && (
              <a
                href={`mailto:${data.agentInfo.email}?subject=Timeline%20Follow-up&body=Hi%2C%20I%20just%20generated%20my%20real%20estate%20timeline%20and%20would%20like%20to%20discuss%20next%20steps.`}
                className={`
                  inline-flex items-center gap-2 px-6 py-3
                  border-2 ${hasCustomTheme ? '' : colors.borderColor} ${hasCustomTheme ? '' : colors.accentColor}
                  font-semibold rounded-xl
                  hover:scale-105
                  transition-all duration-200
                  ${hasCustomTheme ? '' : 'hover:bg-gray-50'}
                `}
                style={hasCustomTheme ? { ...borderStyle, ...accentStyle } : undefined}
              >
                Contact Agent
                <ArrowRight className="h-5 w-5" />
              </a>
            )}
          </div>

          {/* Download error message */}
          {downloadError && (
            <p className="mt-4 text-red-600 text-sm text-center">
              {downloadError}
            </p>
          )}
        </div>
      </section>

      {/* Agent Info Footer (if provided but no credentials section) */}
      {data.agentInfo && !agentCredentials && (
        <section
          className={`py-8 px-4 border-t ${hasCustomTheme ? '' : 'bg-gray-50 border-gray-200'}`}
          style={hasCustomTheme ? { backgroundColor: colorTheme.background, borderColor: colorTheme.border } : undefined}
        >
          <div className="max-w-4xl mx-auto">
            <div
              className={`flex items-center gap-6 p-6 rounded-2xl shadow-sm border ${hasCustomTheme ? '' : 'bg-white border-gray-200'}`}
              style={hasCustomTheme ? { backgroundColor: colorTheme.surface, borderColor: colorTheme.border } : undefined}
            >
              {data.agentInfo.photo && (
                <img
                  src={data.agentInfo.photo}
                  alt={data.agentInfo.name}
                  className="w-32 h-32 lg:w-40 lg:h-40 rounded-full object-cover border-4 border-gray-200 shadow-lg"
                />
              )}
              <div>
                <p className={`text-sm mb-1 ${hasCustomTheme ? '' : 'text-gray-500'}`} style={subTextStyle}>Your Guide</p>
                <h3
                  className={`text-xl font-bold ${hasCustomTheme ? '' : 'text-gray-900'}`}
                  style={headingStyle}
                >
                  {data.agentInfo.name}
                </h3>
                {data.agentInfo.company && (
                  <p className={hasCustomTheme ? '' : 'text-gray-600'} style={subTextStyle}>{data.agentInfo.company}</p>
                )}
                {(data.agentInfo.email || data.agentInfo.phone) && (
                  <div className="flex gap-4 mt-2 text-sm">
                    {data.agentInfo.email && (
                      <a
                        href={`mailto:${data.agentInfo.email}`}
                        className={`${hasCustomTheme ? '' : colors.accentColor} hover:underline`}
                        style={accentStyle}
                      >
                        {data.agentInfo.email}
                      </a>
                    )}
                    {data.agentInfo.phone && (
                      <a
                        href={`tel:${data.agentInfo.phone}`}
                        className={`${hasCustomTheme ? '' : colors.accentColor} hover:underline`}
                        style={accentStyle}
                      >
                        {data.agentInfo.phone}
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer Disclaimer */}
      <section className="px-4 max-w-4xl mx-auto">
        <EstimateDisclaimer
          variant="footer"
          agentContact={data.agentInfo ? {
            name: data.agentInfo.name,
            email: data.agentInfo.email,
            phone: data.agentInfo.phone,
          } : undefined}
          colorTheme={colorTheme}
          customMessage="The timelines, costs, and recommendations in this guide are estimates based on typical experiences with clients in similar situations. Every real estate transaction is unique. Your agent will provide specific guidance tailored to your circumstances."
        />
      </section>
    </div>
  );
}
