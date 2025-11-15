// components/ux/resultsComponents/profileSummary.tsx

import { LlmProfileSummaryProps } from './profileSummary';
import {
  Home,
  Calendar,
  DollarSign,
  MapPin,
  Target,
  TrendingUp,
  Clock,
  Wrench,
  Sparkles,
  LucideIcon,
} from 'lucide-react';

// THIS IS YOUR ICON MAP — based on LABEL (not icon name)
const labelToIcon: Record<string, LucideIcon> = {
  'Property Type': Home,
  'Age': Calendar,
  'Recent Renovation': Wrench,
  'Timeline': Clock,
  'Goal': Target,
  'Location': MapPin,
  'Budget': DollarSign,
  'Price Range': DollarSign,
  'Market Trend': TrendingUp,
  'Renovations': Wrench,
  'Selling Reason': Sparkles,
  // Add more as needed
};

export function LlmProfileSummary({ data }: { data: LlmProfileSummaryProps }) {
  const badgeStyles = {
    urgent: 'bg-orange-100 text-orange-700 border-orange-200',
    planned: 'bg-blue-100 text-blue-700 border-blue-200',
    exploring: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <section className="profile-summary bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Situation</h2>
        <p className="text-base text-gray-600 leading-relaxed">{data.overview}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {data.keyHighlights.map((highlight, i) => {
          // Use the LABEL to pick the icon — this is reliable!
          const Icon = labelToIcon[highlight.label] || Home;

          return (
            <div
              key={i}
              className="group bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                  <Icon className="h-5 w-5 text-gray-700" />
                </div>
                <div>
                  <p className="text-xs font-medium text-black uppercase tracking-wide mb-1">
                    {highlight.label}
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {highlight.value}
                  </p>
                  {highlight.context && (
                    <p className="text-xs text-gray-600 mt-2 italic">
                      {highlight.context}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {data.timelineBadge && (
        <div className="flex justify-center">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${badgeStyles[data.timelineBadge.variant]}`}
          >
            <span className="text-lg">Badge</span>
            <span className="text-sm font-semibold">{data.timelineBadge.text}</span>
          </div>
        </div>
      )}
    </section>
  );
}