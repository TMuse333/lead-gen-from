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
import { StoryCard, type MatchedStory } from './components/StoryCard';
import { ClientTestimonial } from '@/components/svg/stories';
import { HeroTimelineStats } from '@/components/svg/timeline';
import type { TimelineOutput } from '@/lib/offers/definitions/timeline/timeline-types';
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
      await generateTimelinePDF(data);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Personalized with user name and animated visualization */}
      <section
        className={`relative overflow-hidden ${hasCustomTheme ? '' : `bg-gradient-to-r ${colors.heroGradient}`}`}
        style={heroStyle}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-10 md:py-14">
          {/* Mobile: flex-col, Desktop: grid */}
          <div className={`flex flex-col ${forceMobileLayout ? '' : 'lg:grid lg:grid-cols-2 lg:gap-8'} gap-6 items-center`}>
            {/* Left: Text content */}
            <div className={`text-white text-center ${forceMobileLayout ? '' : 'lg:text-left'} order-1`}>
              {/* Personalized greeting badge */}
              {displayUserName && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full mb-3">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">
                    Created for {displayUserName}
                  </span>
                </div>
              )}

              {/* Title - with user's name highlighted */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
                {displayUserName ? (
                  <>
                    <span className="text-white">{displayUserName}</span>
                    <span className="text-white/70">'s </span>
                  </>
                ) : (
                  <span className="text-white/90">Your </span>
                )}
                <span className="text-white">{flowLabel.action} Timeline</span>
              </h1>

              {/* Intro description - prepares user for what this page is */}
              <p className={`text-base md:text-lg text-white/90 max-w-xl mx-auto ${forceMobileLayout ? '' : 'lg:mx-0'} mb-4 leading-relaxed`}>
                This is your personalized roadmap — a step-by-step guide designed specifically for your situation.
                Below you'll find expert advice, actionable tasks, and everything you need to navigate your{' '}
                {flowLabel.action.toLowerCase()} journey with confidence.
              </p>

              {/* Your details - shown below the description */}
              <div className={`flex flex-wrap justify-center ${forceMobileLayout ? '' : 'lg:justify-start'} gap-2 mb-4`}>
                {data.userSituation.location && (
                  <span className="bg-white/25 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-medium">
                    📍 {data.userSituation.location}
                  </span>
                )}
                {data.userSituation.isFirstTime && (
                  <span className="bg-white/25 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-medium">
                    🏠 First-Time {flowLabel.noun}
                  </span>
                )}
                {data.userSituation.budget && (
                  <span className="bg-white/25 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-medium">
                    💰 {data.userSituation.budget}
                  </span>
                )}
                {data.userSituation.timeline && (
                  <span className="bg-white/25 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-medium">
                    📅 {data.userSituation.timeline}
                  </span>
                )}
              </div>

              {/* What's included - small text */}
              <p className="text-xs text-white/70">
                Includes {data.phases.length} phases, {data.metadata?.totalActionItems || 0} action items
                {totalStories > 0 && `, and ${totalStories} relevant client stories`}
              </p>
            </div>

            {/* Right: Animated Stats Visualization */}
            <div className={`flex justify-center order-2 w-full max-w-sm ${forceMobileLayout ? '' : 'lg:max-w-none lg:justify-end'}`}>
              <HeroTimelineStats
                duration={data.totalEstimatedTime || '4-5 months'}
                steps={data.phases.length}
                actions={data.metadata?.totalActionItems || 0}
                stories={totalStories}
                budget={data.userSituation.budget}
                primaryColor={hasCustomTheme ? colorTheme?.primary : undefined}
                secondaryColor={hasCustomTheme ? colorTheme?.gradientTo : undefined}
                width={320}
                height={220}
              />
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="#F9FAFB"
            />
          </svg>
        </div>
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

      {/* SECTION 2: Agent Expertise - "Your Guide" (credibility after seeing value)
          Information Theory: Build trust after demonstrating competence */}
      {agentCredentials && (
        <section className="py-10 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Your Guide for This Journey
              </h2>
              <p className="text-gray-600">
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
      )}

      {/* SECTION 3: Featured Stories - Social Proof (after core content engagement)
          Information Theory: Social validation reinforces decision after seeing value */}
      {totalStories > 0 && (
        <section className="py-10 px-4 bg-gradient-to-b from-amber-50/50 to-white">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col items-center">
              {/* Hero SVG - Centered above content */}
              <div className="mb-6 flex justify-center">
                <ClientTestimonial size={180} />
              </div>

              {/* Section Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full mb-3">
                  <Sparkles className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-semibold text-amber-700">Real Client Experiences</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Success Stories From People Like You
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
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
                      className="bg-white rounded-2xl border-2 border-amber-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-amber-300 overflow-hidden"
                    >
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2 border-b border-amber-100">
                        <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
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
                  <p className="text-sm text-gray-500">
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
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-amber-900 mb-2">
                    Important Note
                  </h3>
                  <p className="text-sm text-amber-800 leading-relaxed">
                    {data.disclaimer}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
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
              className="inline-flex items-center gap-2 px-6 py-3
                bg-gray-100 hover:bg-gray-200 text-gray-700
                font-semibold rounded-xl
                hover:scale-105
                transition-all duration-200"
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
                  hover:bg-gray-50
                  hover:scale-105
                  transition-all duration-200
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
        <section className="py-8 px-4 bg-gray-50 border-t border-gray-200">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-6 p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
              {data.agentInfo.photo && (
                <img
                  src={data.agentInfo.photo}
                  alt={data.agentInfo.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              )}
              <div>
                <p className="text-sm text-gray-500 mb-1">Your Guide</p>
                <h3 className="text-xl font-bold text-gray-900">
                  {data.agentInfo.name}
                </h3>
                {data.agentInfo.company && (
                  <p className="text-gray-600">{data.agentInfo.company}</p>
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
    </div>
  );
}
