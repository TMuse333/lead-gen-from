// components/landing/PersonalMessage.tsx

import { LlmPersonalMessage } from "@/types/resultsPageComponents/components/personalMessage";
import { Quote, CheckCircle } from 'lucide-react';

interface PersonalMessageProps {
  data: LlmPersonalMessage;
}

export function PersonalMessage({ data }: PersonalMessageProps) {
  // Map tone to visual styling
  const toneStyles = {
    'urgent-supportive': {
      borderColor: 'border-orange-300',
      bgGradient: 'bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50',
      accentColor: 'text-orange-600',
      badgeBg: 'bg-orange-100',
      badgeText: 'text-orange-700',
      quoteBg: 'bg-orange-100',
      quoteColor: 'text-orange-600'
    },
    'calm-confident': {
      borderColor: 'border-blue-300',
      bgGradient: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50',
      accentColor: 'text-blue-600',
      badgeBg: 'bg-blue-100',
      badgeText: 'text-blue-700',
      quoteBg: 'bg-blue-100',
      quoteColor: 'text-blue-600'
    },
    'excited-encouraging': {
      borderColor: 'border-purple-300',
      bgGradient: 'bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50',
      accentColor: 'text-purple-600',
      badgeBg: 'bg-purple-100',
      badgeText: 'text-purple-700',
      quoteBg: 'bg-purple-100',
      quoteColor: 'text-purple-600'
    }
  };

  const styles = toneStyles[data.tone || 'calm-confident'];

  return (
    <section className="personal-message py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div 
          className={`
            relative overflow-hidden rounded-2xl border-2 
            ${styles.borderColor} ${styles.bgGradient}
            shadow-lg p-8 md:p-10
          `}
          data-tone={data.tone}
        >
          {/* Decorative quote icon */}
          <div className={`absolute top-6 left-6 ${styles.quoteBg} rounded-full p-3 opacity-50`}>
            <Quote className={`h-8 w-8 ${styles.quoteColor}`} />
          </div>

          {/* Agent Photo & Name Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-6 relative z-10">
            {/* Photo */}
            {data.photoUrl ? (
              <div className="relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-white shadow-lg flex-shrink-0">
                <img
                  src={data.photoUrl}
                  alt={data.agentName}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className={`w-24 h-24 rounded-full ${styles.badgeBg} flex items-center justify-center text-4xl font-bold ${styles.accentColor} ring-4 ring-white shadow-lg flex-shrink-0`}>
                {data.agentName.charAt(0)}
              </div>
            )}

            {/* Name & Title */}
            <div className="text-center sm:text-left">
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {data.agentName}
              </h3>
              {data.agentTitle && (
                <p className={`text-sm font-medium ${styles.accentColor}`}>
                  {data.agentTitle}
                </p>
              )}
            </div>
          </div>

          {/* Message Content */}
          <div className="space-y-4 mb-6 relative z-10">
            {/* Greeting */}
            <p className="text-lg font-semibold text-gray-900">
              {data.greeting}
            </p>

            {/* Message Body */}
            <p className="text-base leading-relaxed text-gray-700 whitespace-pre-line">
              {data.messageBody}
            </p>

            {/* Signature */}
            <p className="text-base font-medium text-gray-900 mt-6">
              {data.signature}
            </p>
            <p className="text-lg font-bold text-gray-900">
              {data.agentName}
            </p>
          </div>

          {/* Credibility Points */}
          {data.credibilityPoints && data.credibilityPoints.length > 0 && (
            <div className="mt-8 pt-6 border-t-2 border-gray-200 relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {data.credibilityPoints.map((point, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 bg-white bg-opacity-60 rounded-lg p-3 backdrop-blur-sm"
                  >
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${styles.badgeBg} flex-shrink-0`}>
                      <span className="text-xl" role="img" aria-label="credential">
                        {point.icon}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`h-4 w-4 ${styles.accentColor} flex-shrink-0`} />
                      <span className="text-sm font-medium text-gray-700">
                        {point.text}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subtle decorative elements */}
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl opacity-20 -z-0"></div>
          <div className="absolute top-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl opacity-20 -z-0"></div>
        </div>

        {/* Trust indicator */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
            <div className="h-2 w-2 rounded-full bg-green-300"></div>
          </div>
          <p className="text-sm text-gray-600 font-medium">
            Personal message crafted for your situation
          </p>
        </div>
      </div>
    </section>
  );
}