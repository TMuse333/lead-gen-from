// components/ux/resultsComponents/timeline/TimelineDisplay.tsx
'use client';

import { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  DollarSign,
  User,
  ChevronDown,
  ChevronUp,
  Download,
  Share2,
  Sparkles,
  AlertCircle,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import type { TimelineOutput } from '@/lib/offers/definitions/timeline/timeline-types';
import { generateTimelinePDF } from '@/lib/pdf/generateTimelinePDF';

interface TimelineDisplayProps {
  data: TimelineOutput;
}

export function TimelineDisplay({ data }: TimelineDisplayProps) {
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(
    new Set(data.phases.map((p) => p.id))
  );
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
    const shareData = {
      title: data.title,
      text: data.subtitle || 'Check out my personalized timeline!',
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // User cancelled or share failed - copy to clipboard as fallback
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const togglePhase = (phaseId: string) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phaseId)) {
        next.delete(phaseId);
      } else {
        next.add(phaseId);
      }
      return next;
    });
  };

  const flowColors = {
    buy: {
      gradient: 'bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50',
      accentColor: 'text-blue-600',
      borderColor: 'border-blue-200',
      badgeBg: 'bg-blue-100',
      iconBg: 'bg-blue-100',
      buttonBg: 'bg-blue-600 hover:bg-blue-700',
    },
    sell: {
      gradient: 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50',
      accentColor: 'text-emerald-600',
      borderColor: 'border-emerald-200',
      badgeBg: 'bg-emerald-100',
      iconBg: 'bg-emerald-100',
      buttonBg: 'bg-emerald-600 hover:bg-emerald-700',
    },
    browse: {
      gradient: 'bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50',
      accentColor: 'text-purple-600',
      borderColor: 'border-purple-200',
      badgeBg: 'bg-purple-100',
      iconBg: 'bg-purple-100',
      buttonBg: 'bg-purple-600 hover:bg-purple-700',
    },
  };

  const flow = data.userSituation.flow || 'buy';
  const colors = flowColors[flow as keyof typeof flowColors] || flowColors.buy;

  return (
    <section className="timeline-display py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Calendar className={`h-8 w-8 ${colors.accentColor}`} />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              {data.title}
            </h1>
            <Calendar className={`h-8 w-8 ${colors.accentColor}`} />
          </div>
          {data.subtitle && (
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {data.subtitle}
            </p>
          )}
        </div>

        {/* User Situation Card */}
        <div
          className={`${colors.gradient} rounded-2xl border-2 ${colors.borderColor} p-6 md:p-8 shadow-lg`}
        >
          <div className="flex items-center gap-3 mb-6">
            <User className={`h-6 w-6 ${colors.accentColor}`} />
            <h2 className="text-2xl font-bold text-gray-900">
              Your Situation
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.userSituation.location && (
              <div className={`flex items-center gap-3 p-4 bg-white/70 rounded-lg border ${colors.borderColor}`}>
                <MapPin className={`h-5 w-5 ${colors.accentColor}`} />
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase">Location</p>
                  <p className="text-sm font-bold text-gray-900">{data.userSituation.location}</p>
                </div>
              </div>
            )}

            {data.userSituation.budget && (
              <div className={`flex items-center gap-3 p-4 bg-white/70 rounded-lg border ${colors.borderColor}`}>
                <DollarSign className={`h-5 w-5 ${colors.accentColor}`} />
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase">Budget</p>
                  <p className="text-sm font-bold text-gray-900">{data.userSituation.budget}</p>
                </div>
              </div>
            )}

            {data.userSituation.timeline && (
              <div className={`flex items-center gap-3 p-4 bg-white/70 rounded-lg border ${colors.borderColor}`}>
                <Clock className={`h-5 w-5 ${colors.accentColor}`} />
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase">Timeline</p>
                  <p className="text-sm font-bold text-gray-900">{data.userSituation.timeline}</p>
                </div>
              </div>
            )}

            <div className={`flex items-center gap-3 p-4 bg-white/70 rounded-lg border ${colors.borderColor}`}>
              <TrendingUp className={`h-5 w-5 ${colors.accentColor}`} />
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase">Goal</p>
                <p className="text-sm font-bold text-gray-900 capitalize">
                  {flow === 'buy' ? 'Buying' : flow === 'sell' ? 'Selling' : 'Browsing'}
                </p>
              </div>
            </div>
          </div>

          {data.userSituation.isFirstTime && (
            <div className={`mt-4 flex items-center gap-2 px-4 py-2 bg-white/70 rounded-lg border ${colors.borderColor} w-fit`}>
              <Sparkles className={`h-4 w-4 ${colors.accentColor}`} />
              <span className="text-sm font-medium text-gray-700">
                First-Time {flow === 'buy' ? 'Buyer' : 'Seller'}
              </span>
            </div>
          )}
        </div>

        {/* Total Timeline Overview */}
        <div className="text-center">
          <div className={`inline-flex items-center gap-3 px-6 py-3 ${colors.badgeBg} border ${colors.borderColor} rounded-xl`}>
            <Clock className={`h-6 w-6 ${colors.accentColor}`} />
            <div className="text-left">
              <p className="text-xs font-semibold text-gray-600 uppercase">Total Estimated Time</p>
              <p className={`text-lg font-bold ${colors.accentColor}`}>
                {data.totalEstimatedTime}
              </p>
            </div>
          </div>
        </div>

        {/* Timeline Phases */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-900">Your Roadmap</h2>
            <p className="text-sm text-gray-500">
              {data.phases.length} {data.phases.length === 1 ? 'Phase' : 'Phases'}
            </p>
          </div>

          <div className="space-y-4">
            {data.phases.map((phase, index) => (
              <PhaseCard
                key={phase.id}
                phase={phase}
                index={index}
                totalPhases={data.phases.length}
                expanded={expandedPhases.has(phase.id)}
                onToggle={() => togglePhase(phase.id)}
                colors={colors}
              />
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        {data.disclaimer && (
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
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
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-4 justify-center pt-4">
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className={`flex items-center gap-2 px-6 py-3 ${colors.buttonBg} text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
          >
            {isDownloading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Download className="h-5 w-5" />
            )}
            {isDownloading ? 'Generating...' : 'Download PDF'}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-105"
          >
            <Share2 className="h-5 w-5" />
            Share Timeline
          </button>
        </div>
        {downloadError && (
          <p className="text-center text-red-500 text-sm mt-2">{downloadError}</p>
        )}
      </div>
    </section>
  );
}

// ==================== PHASE CARD ====================

interface PhaseCardProps {
  phase: TimelineOutput['phases'][0];
  index: number;
  totalPhases: number;
  expanded: boolean;
  onToggle: () => void;
  colors: {
    gradient: string;
    accentColor: string;
    borderColor: string;
    badgeBg: string;
    iconBg: string;
    buttonBg: string;
  };
}

function PhaseCard({
  phase,
  index,
  totalPhases,
  expanded,
  onToggle,
  colors,
}: PhaseCardProps) {
  const priorityStyles = {
    high: {
      badge: 'bg-red-100 text-red-700 border-red-300',
      icon: 'text-red-600',
    },
    medium: {
      badge: 'bg-blue-100 text-blue-700 border-blue-300',
      icon: 'text-blue-600',
    },
    low: {
      badge: 'bg-gray-100 text-gray-700 border-gray-300',
      icon: 'text-gray-600',
    },
  };

  return (
    <div
      className={`
        rounded-xl border-2 ${colors.borderColor}
        ${expanded ? colors.gradient : 'bg-white'}
        shadow-md transition-all duration-300
      `}
    >
      {/* Phase Header - Always Visible */}
      <button
        onClick={onToggle}
        className="w-full p-6 text-left hover:bg-black/5 transition-colors rounded-t-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className={`flex items-center justify-center w-10 h-10 ${colors.iconBg} rounded-full border ${colors.borderColor}`}>
                <span className={`text-lg font-bold ${colors.accentColor}`}>
                  {index + 1}
                </span>
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                  {phase.name}
                </h3>
                {phase.timeline && (
                  <p className="text-sm text-gray-600 mt-1">
                    <Clock className="inline h-4 w-4 mr-1" />
                    {phase.timeline}
                    {phase.timelineVariability && (
                      <span className="text-gray-500 ml-1">
                        ({phase.timelineVariability})
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {phase.isOptional && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-300">
                Optional
              </span>
            )}
            {expanded ? (
              <ChevronUp className={`h-6 w-6 ${colors.accentColor}`} />
            ) : (
              <ChevronDown className={`h-6 w-6 ${colors.accentColor}`} />
            )}
          </div>
        </div>
      </button>

      {/* Phase Content - Collapsible */}
      {expanded && (
        <div className="px-6 pb-6 space-y-6">
          {/* Description */}
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 leading-relaxed">{phase.description}</p>
          </div>

          {/* Conditional Note */}
          {phase.conditionalNote && (
            <div className="bg-white/70 border border-amber-300 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                <AlertCircle className="inline h-4 w-4 mr-2" />
                {phase.conditionalNote}
              </p>
            </div>
          )}

          {/* Action Items */}
          {phase.actionItems && phase.actionItems.length > 0 && (
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className={`h-5 w-5 ${colors.accentColor}`} />
                Action Items ({phase.actionItems.length})
              </h4>
              <div className="space-y-2">
                {phase.actionItems.map((item, idx) => {
                  const priority = item.priority || 'medium';
                  const style = priorityStyles[priority as keyof typeof priorityStyles];

                  return (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 bg-white/70 rounded-lg border border-gray-200"
                    >
                      <CheckCircle2 className={`h-5 w-5 ${style.icon} flex-shrink-0 mt-0.5`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {item.task}
                        </p>
                        {item.details && (
                          <p className="text-xs text-gray-600 mt-1">
                            {item.details}
                          </p>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded border ${style.badge} uppercase font-semibold`}>
                        {priority}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Agent Advice */}
          {phase.agentAdvice && phase.agentAdvice.length > 0 && (
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Sparkles className={`h-5 w-5 ${colors.accentColor}`} />
                Your Agent's Advice
              </h4>
              <div className="space-y-3">
                {phase.agentAdvice.map((advice, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-4 bg-white/70 rounded-lg border-l-4"
                    style={{ borderLeftColor: 'currentColor' }}
                  >
                    <div className={`${colors.accentColor}`}>
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <p className="text-sm text-gray-700 italic leading-relaxed">
                      "{advice}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resources */}
          {phase.resources && phase.resources.length > 0 && (
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-3">
                Helpful Resources
              </h4>
              <div className="space-y-2">
                {phase.resources.map((resource, idx) => (
                  <a
                    key={idx}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-white/70 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all group"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                        {resource.title}
                      </p>
                      {resource.description && (
                        <p className="text-xs text-gray-600 mt-1">
                          {resource.description}
                        </p>
                      )}
                    </div>
                    <ChevronUp className="h-4 w-4 text-gray-400 group-hover:text-blue-600 rotate-90" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
