// components/landing/MarketInsights.tsx

import { LlmMarketInsightsProps, MarketInsight } from "./marketInsights";
import { TrendingUp, Info, AlertCircle, CheckCircle2, BarChart3 } from 'lucide-react';

interface MarketInsightsData {
  data: LlmMarketInsightsProps;
}

export function MarketInsights({ data }: MarketInsightsData) {
  return (
    <section className="market-insights py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <BarChart3 className="h-6 w-6 text-indigo-600" />
            <h2 className="text-3xl font-bold text-gray-900">
              {data.sectionTitle}
            </h2>
          </div>

          {/* Headline */}
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-full border border-indigo-200 mb-4">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            <span className="text-lg font-semibold text-indigo-900">
              {data.headline}
            </span>
          </div>

          {/* Summary */}
          {data.summary && (
            <p className="text-base text-gray-600 max-w-3xl mx-auto">
              {data.summary}
            </p>
          )}
        </div>

        {/* Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {data.insights.map((insight, index) => (
            <InsightCard key={index} insight={insight} />
          ))}
        </div>

        {/* Recommendation Section */}
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What This Means For You
              </h3>
              <p className="text-base text-gray-700 leading-relaxed">
                {data.recommendation}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Metadata */}
        {(data.dataSource || data.lastUpdated) && (
          <div className="flex items-center justify-center gap-4 mt-6 text-sm text-gray-500">
            {data.dataSource && (
              <span className="flex items-center gap-1">
                <Info className="h-4 w-4" />
                {data.dataSource}
              </span>
            )}
            {data.lastUpdated && (
              <span>• Updated {data.lastUpdated}</span>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// ==================== INSIGHT CARD COMPONENT ====================

interface InsightCardProps {
  insight: MarketInsight;
}

function InsightCard({ insight }: InsightCardProps) {
  // Map sentiment to styling
  const sentimentStyles = {
    positive: {
      gradient: 'bg-gradient-to-br from-green-50 to-emerald-50',
      borderColor: 'border-green-200',
      iconBg: 'bg-green-100',
      valueColor: 'text-green-700',
      badgeBg: 'bg-green-100',
      badgeText: 'text-green-700',
      icon: CheckCircle2
    },
    neutral: {
      gradient: 'bg-gradient-to-br from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200',
      iconBg: 'bg-blue-100',
      valueColor: 'text-blue-700',
      badgeBg: 'bg-blue-100',
      badgeText: 'text-blue-700',
      icon: Info
    },
    caution: {
      gradient: 'bg-gradient-to-br from-orange-50 to-amber-50',
      borderColor: 'border-orange-200',
      iconBg: 'bg-orange-100',
      valueColor: 'text-orange-700',
      badgeBg: 'bg-orange-100',
      badgeText: 'text-orange-700',
      icon: AlertCircle
    }
  };

  const styles = sentimentStyles[insight.sentiment];
  const SentimentIcon = styles.icon;

  return (
    <div
      className={`
        insight-card relative overflow-hidden rounded-xl border-2 
        ${styles.borderColor} ${styles.gradient}
        p-5 shadow-sm hover:shadow-md transition-all duration-300
        hover:scale-105
      `}
      data-sentiment={insight.sentiment}
    >
      {/* Sentiment Badge (top right) */}
      <div className="absolute top-3 right-3">
        <SentimentIcon className={`h-5 w-5 ${styles.valueColor}`} />
      </div>

      {/* Icon */}
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${styles.iconBg} mb-3`}>
        <span className="text-2xl" role="img" aria-label={insight.metric}>
          {insight.icon}
        </span>
      </div>

      {/* Metric Name */}
      <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
        {insight.metric}
      </h4>

      {/* Value */}
      <div className={`text-2xl font-bold mb-3 ${styles.valueColor}`}>
        {insight.value}
      </div>

      {/* Interpretation */}
      <p className="text-sm text-gray-700 leading-relaxed">
        {insight.interpretation}
      </p>

      {/* Decorative element */}
      <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white rounded-full blur-2xl opacity-50"></div>
    </div>
  );
}