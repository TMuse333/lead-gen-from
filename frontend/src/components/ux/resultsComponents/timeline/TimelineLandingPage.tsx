// components/ux/resultsComponents/timeline/TimelineLandingPage.tsx
'use client';

import { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  User,
  Download,
  Share2,
  TrendingUp,
  Sparkles,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Target,
  BarChart3,
} from 'lucide-react';
import { StepByStepGuide } from './components/StepByStepGuide';
import { MarketContext, type MarketData } from './components/MarketContext';
import { AgentExpertise, type AgentCredentials } from './components/AgentExpertise';
import { PersonalizationChip } from './components/PersonalizationChip';
import type { MatchedStory } from './components/StoryCard';
import type { TimelineOutput } from '@/lib/offers/definitions/timeline/timeline-types';
import { generateTimelinePDF } from '@/lib/pdf/generateTimelinePDF';
import type { ColorTheme } from '@/lib/colors/defaultTheme';

interface TimelineLandingPageProps {
  data: TimelineOutput;
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
}

/**
 * Enhanced landing page presentation of a timeline offer
 * Includes stories, market context, agent expertise, and interactivity
 */
export function TimelineLandingPage({
  data,
  agentName,
  agentCredentials,
  marketData,
  storiesByPhase = {},
  interactive = true,
  colorTheme,
}: TimelineLandingPageProps) {
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
      {/* Hero Section */}
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

        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center text-white">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">
                Personalized for You
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              {data.title}
            </h1>

            {/* Subtitle */}
            {data.subtitle && (
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8">
                {data.subtitle}
              </p>
            )}

            {/* Quick stats */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-8">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <Clock className="h-5 w-5" />
                <span className="font-semibold">{data.totalEstimatedTime}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-semibold">{data.phases.length} Steps</span>
              </div>
              {data.metadata?.totalActionItems && (
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <Target className="h-5 w-5" />
                  <span className="font-semibold">{data.metadata.totalActionItems} Actions</span>
                </div>
              )}
              {totalStories > 0 && (
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <Sparkles className="h-5 w-5" />
                  <span className="font-semibold">{totalStories} Client Stories</span>
                </div>
              )}
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

      {/* User Situation Summary with Personalization Chips */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div
            className={`${hasCustomTheme ? '' : colors.gradient} rounded-2xl border-2 ${hasCustomTheme ? '' : colors.borderColor} p-6 md:p-8 shadow-lg`}
            style={hasCustomTheme ? { ...gradientBgStyle, ...borderStyle } : undefined}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`p-2 ${hasCustomTheme ? '' : colors.iconBg} rounded-lg`}
                style={iconBgStyle}
              >
                <User className={`h-5 w-5 ${hasCustomTheme ? '' : colors.accentColor}`} style={accentStyle} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Your Situation
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Goal */}
              <div
                className={`flex items-center gap-3 p-4 bg-white/70 rounded-xl border ${hasCustomTheme ? '' : colors.borderColor}`}
                style={borderStyle}
              >
                <TrendingUp className={`h-5 w-5 ${hasCustomTheme ? '' : colors.accentColor}`} style={accentStyle} />
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Goal</p>
                  <p className="text-sm font-bold text-gray-900">{flowLabel.action}</p>
                </div>
              </div>

              {/* Location */}
              {data.userSituation.location && (
                <div
                  className={`flex items-center gap-3 p-4 bg-white/70 rounded-xl border ${hasCustomTheme ? '' : colors.borderColor}`}
                  style={borderStyle}
                >
                  <MapPin className={`h-5 w-5 ${hasCustomTheme ? '' : colors.accentColor}`} style={accentStyle} />
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</p>
                    <p className="text-sm font-bold text-gray-900">{data.userSituation.location}</p>
                  </div>
                </div>
              )}

              {/* Budget */}
              {data.userSituation.budget && (
                <div
                  className={`flex items-center gap-3 p-4 bg-white/70 rounded-xl border ${hasCustomTheme ? '' : colors.borderColor}`}
                  style={borderStyle}
                >
                  <DollarSign className={`h-5 w-5 ${hasCustomTheme ? '' : colors.accentColor}`} style={accentStyle} />
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Budget</p>
                    <p className="text-sm font-bold text-gray-900">{data.userSituation.budget}</p>
                  </div>
                </div>
              )}

              {/* Timeline */}
              {data.userSituation.timeline && (
                <div
                  className={`flex items-center gap-3 p-4 bg-white/70 rounded-xl border ${hasCustomTheme ? '' : colors.borderColor}`}
                  style={borderStyle}
                >
                  <Calendar className={`h-5 w-5 ${hasCustomTheme ? '' : colors.accentColor}`} style={accentStyle} />
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Timeline</p>
                    <p className="text-sm font-bold text-gray-900">{data.userSituation.timeline}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Personalization chips row */}
            <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-gray-200/50">
              {data.userSituation.isFirstTime && (
                <PersonalizationChip type="user" value={`First-Time ${flowLabel.noun}`} highlight />
              )}
              {data.userSituation.currentStage && (
                <PersonalizationChip type="stage" value={data.userSituation.currentStage} />
              )}
              {data.userSituation.propertyType && (
                <PersonalizationChip type="property" value={data.userSituation.propertyType} />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Market Context (if provided) */}
      {marketData && (
        <section className="py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <MarketContext data={marketData} accentColor={colors.accentColor} />
          </div>
        </section>
      )}

      {/* Agent Expertise (if provided) */}
      {agentCredentials && (
        <section className="py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <AgentExpertise
              agent={agentCredentials}
              userSituation={data.userSituation}
              accentColor={colors.accentColor}
            />
          </div>
        </section>
      )}

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
