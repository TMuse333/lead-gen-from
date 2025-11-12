// components/landing/NextStepsCTA.tsx

import { LlmNextStepsCTAProps } from "@/types";
import { ArrowRight, CheckCircle2, Shield, Clock, Award, Heart } from 'lucide-react';

interface NextStepsCTAProps {
  data: LlmNextStepsCTAProps;
}

export function NextStepsCTA({ data }: NextStepsCTAProps) {
  return (
    <section className="next-steps-cta py-16 px-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-5xl mx-auto">
        {/* Hook - Creates Momentum */}
        <div className="text-center mb-10">
          <p className="text-xl md:text-2xl font-semibold text-gray-800 leading-relaxed max-w-4xl mx-auto">
            {data.hook}
          </p>
        </div>

        {/* Key Recap - Visual Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {data.keyRecap.map((item, index) => (
            <div
              key={index}
              className="bg-white bg-opacity-70 backdrop-blur-sm rounded-xl p-4 border-2 border-indigo-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-center">
                <div className="text-3xl mb-2">{item.icon}</div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  {item.label}
                </div>
                <div className="text-sm font-bold text-gray-900">
                  {item.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Transition Text */}
        <div className="text-center mb-8">
          <p className="text-lg font-medium text-gray-700">
            {data.transitionText}
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          {/* Primary CTA */}
          <div className="relative group">
            <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3">
              <span>{data.primaryCTA.text}</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            {/* Subtext */}
            <div className="text-center mt-2">
              <p className="text-sm text-gray-600">
                {data.primaryCTA.subtext}
              </p>
              {data.primaryCTA.urgencyNote && (
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Clock className="h-3 w-3 text-orange-600" />
                  <span className="text-xs font-semibold text-orange-600">
                    {data.primaryCTA.urgencyNote}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Secondary CTA */}
          <div className="relative">
            <button className="w-full sm:w-auto px-8 py-4 bg-white text-indigo-600 border-2 border-indigo-300 rounded-xl font-semibold text-lg shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3">
              <span>{data.secondaryCTA.text}</span>
            </button>
            
            {/* Subtext */}
            <div className="text-center mt-2">
              <p className="text-sm text-gray-600">
                {data.secondaryCTA.subtext}
              </p>
            </div>
          </div>
        </div>

        {/* Trust Elements */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-10 pb-10 border-b-2 border-indigo-100">
          {data.trustElements.map((element, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-sm text-gray-700"
            >
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
              <span className="font-medium">{element}</span>
            </div>
          ))}
        </div>

        {/* Personal Note from Chris */}
        <div className="bg-white bg-opacity-60 backdrop-blur-sm rounded-2xl p-8 border-2 border-indigo-200 shadow-lg">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Agent Avatar */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-3xl font-bold text-indigo-600 border-4 border-white shadow-md">
                {data.personalNote.signature.charAt(0)}
              </div>
            </div>

            {/* Message Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="h-5 w-5 text-pink-500" />
                <h3 className="text-lg font-bold text-gray-900">
                  A Personal Note from {data.personalNote.signature}
                </h3>
              </div>
              
              <p className="text-base text-gray-700 leading-relaxed mb-4">
                {data.personalNote.message}
              </p>
              
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-gradient-to-r from-indigo-300 to-transparent"></div>
                <p className="text-lg font-bold text-indigo-900">
                  {data.personalNote.signature}
                </p>
                <div className="h-px flex-1 bg-gradient-to-l from-indigo-300 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Final Trust Badge */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <Shield className="h-5 w-5 text-indigo-600" />
          <p className="text-sm text-gray-600 font-medium">
            Your information is secure and will never be shared
          </p>
        </div>
      </div>
    </section>
  );
}