// components/ux/resultsComponents/actionPlan.tsx
'use client';
import { LlmActionPlanProps } from "./types";
import { ChevronLeft, ChevronRight, CheckCircle2, ExternalLink, Sparkles, Clock, Calendar, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { ActionStep } from "./types";

interface ActionPlanProps {
  data: LlmActionPlanProps;
}

// === UPDATE: Make urgency optional in incoming data ===


export function ActionPlan({ data }: ActionPlanProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = data.steps.length;

  const goToNext = () => setCurrentStep((prev) => (prev + 1) % totalSteps);
  const goToPrevious = () => setCurrentStep((prev) => (prev - 1 + totalSteps) % totalSteps);
  const goToStep = (index: number) => setCurrentStep(index);

  // === SAFE: Fallback to 'medium' if overallUrgency missing ===
  const overallUrgency = data.overallUrgency || 'medium';

  const urgencyStyles = {
    high: {
      gradient: 'bg-gradient-to-br from-orange-50 via-red-50 to-pink-50',
      accentColor: 'text-orange-600',
      borderColor: 'border-orange-200',
      badgeBg: 'bg-orange-100',
      icon: Clock
    },
    medium: {
      gradient: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50',
      accentColor: 'text-indigo-600',
      borderColor: 'border-indigo-200',
      badgeBg: 'bg-indigo-100',
      icon: Calendar
    },
    low: {
      gradient: 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50',
      accentColor: 'text-emerald-600',
      borderColor: 'border-emerald-200',
      badgeBg: 'bg-emerald-100',
      icon: TrendingUp
    }
  };

  const overallStyle = urgencyStyles[overallUrgency];

  return (
    <section className="action-plan py-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className={`h-7 w-7 ${overallStyle.accentColor}`} />
            <h2 className="text-4xl font-bold text-gray-900">{data.sectionTitle}</h2>
            <Sparkles className={`h-7 w-7 ${overallStyle.accentColor}`} />
          </div>
          {data.introText && (
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">{data.introText}</p>
          )}
          {data.overallUrgency && (
            <div className="flex justify-center mt-6">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${overallStyle.badgeBg} border ${overallStyle.borderColor}`}>
                <overallStyle.icon className={`h-5 w-5 ${overallStyle.accentColor}`} />
                <span className={`text-sm font-medium ${overallStyle.accentColor}`}>
                  {overallUrgency === 'high' && 'Time-Sensitive Plan'}
                  {overallUrgency === 'medium' && 'Strategic Roadmap'}
                  {overallUrgency === 'low' && 'Flexible Timeline'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Carousel */}
        <div className="relative">
          <div className="overflow-hidden">
            <StepCard step={data.steps[currentStep] } isActive={true} />
          </div>

          {totalSteps > 1 && (
            <>
              <button onClick={goToPrevious} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-12 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all hover:scale-110 border-2 border-gray-200 z-10">
                <ChevronLeft className="h-6 w-6 text-gray-700" />
              </button>
              <button onClick={goToNext} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-12 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all hover:scale-110 border-2 border-gray-200 z-10">
                <ChevronRight className="h-6 w-6 text-gray-700" />
              </button>
            </>
          )}
        </div>

        {/* Step Indicators */}
        {totalSteps > 1 && (
          <div className="flex justify-center items-center gap-3 mt-8">
            {data.steps.map((_, index) => (
              <button
                key={index}
                onClick={() => goToStep(index)}
                className={`transition-all ${index === currentStep ? 'w-12 h-3 bg-indigo-600' : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'} rounded-full`}
              />
            ))}
          </div>
        )}

        <div className="text-center mt-4">
          <p className="text-sm text-gray-500 font-medium">Step {currentStep + 1} of {totalSteps}</p>
        </div>

        {/* Closing Note */}
        {data.closingNote && (
          <div className="mt-12 text-center">
            <div className={`inline-flex items-center gap-3 px-8 py-4 ${overallStyle.gradient} rounded-xl border-2 ${overallStyle.borderColor} shadow-sm`}>
              <CheckCircle2 className={`h-6 w-6 ${overallStyle.accentColor} flex-shrink-0`} />
              <p className="text-base font-medium text-gray-700">{data.closingNote}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ==================== STEP CARD (SAFE VERSION) ====================


function StepCard({ step, isActive }: { step: ActionStep; isActive: boolean }) {
  const urgencyStyles = {
    immediate: {
      gradient: 'bg-gradient-to-br from-red-50 via-orange-50 to-amber-50',
      borderColor: 'border-orange-300',
      badgeBg: 'bg-orange-100',
      badgeText: 'text-orange-700',
      accentColor: 'text-orange-600',
      buttonBg: 'bg-orange-600 hover:bg-orange-700',
      iconBg: 'bg-orange-100',
      pulse: true,
    },
    soon: {
      gradient: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50',
      borderColor: 'border-blue-300',
      badgeBg: 'bg-blue-100',
      badgeText: 'text-blue-700',
      accentColor: 'text-blue-600',
      buttonBg: 'bg-blue-600 hover:bg-blue-700',
      iconBg: 'bg-blue-100',
      pulse: false,
    },
    later: {
      gradient: 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50',
      borderColor: 'border-emerald-300',
      badgeBg: 'bg-emerald-100',
      badgeText: 'text-emerald-700',
      accentColor: 'text-emerald-600',
      buttonBg: 'bg-emerald-600 hover:bg-emerald-700',
      iconBg: 'bg-emerald-100',
      pulse: false,
    },
  };

  const styles = urgencyStyles[step.urgency]; // No fallback needed — guaranteed to exist

  return (
    <div
      className={`
        step-card relative overflow-hidden rounded-2xl border-2
        ${styles.borderColor} ${styles.gradient}
        shadow-xl p-8 md:p-12 transition-all duration-300
        ${isActive ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
      `}
    >
      {/* Step Badge */}
      <div className="flex items-start justify-between mb-6">
        <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-lg ${styles.badgeBg} border ${styles.borderColor}`}>
          <span className={`text-sm font-bold ${styles.badgeText}`}>
            STEP {step.stepNumber}
          </span>
          {styles.pulse && (
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${styles.badgeBg} opacity-75`} />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-600" />
            </span>
          )}
        </div>
        <div className={`text-xs font-medium ${styles.accentColor}`}>
          Priority {step.priority}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
        {step.title}
      </h3>

      {/* Description */}
      <p className="text-lg text-gray-700 leading-relaxed mt-4">
        {step.description}
      </p>

      {/* Benefit */}
      {step.benefit && (
        <div className="flex items-start gap-3 p-4 bg-white/60 rounded-lg border border-gray-200 backdrop-blur-sm mt-6">
          <CheckCircle2 className={`h-6 w-6 ${styles.accentColor} flex-shrink-0 mt-0.5`} />
          <div>
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">Why This Matters</p>
            <p className="text-base font-medium text-gray-800">{step.benefit}</p>
          </div>
        </div>
      )}

      {/* Timeline & Urgency */}
      <div className="flex flex-wrap gap-4 mt-6">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${styles.iconBg} border ${styles.borderColor}`}>
          <Clock className={`h-5 w-5 ${styles.accentColor}`} />
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase">Timeline</p>
            <p className={`text-sm font-bold ${styles.accentColor}`}>{step.timeline}</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${styles.iconBg} border ${styles.borderColor}`}>
          <TrendingUp className={`h-5 w-5 ${styles.accentColor}`} />
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase">Urgency</p>
            <p className={`text-sm font-bold ${styles.accentColor} capitalize`}>{step.urgency}</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      {step.resourceLink && step.resourceText && (
        <div className="mt-8">
          <a
            href={step.resourceLink}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg ${styles.buttonBg} text-white font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105`}
          >
            {step.resourceText}
            <ExternalLink className="h-5 w-5" />
          </a>
        </div>
      )}
    </div>
  );
}