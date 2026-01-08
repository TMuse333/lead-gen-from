// components/ux/resultsComponents/timeline/components/ProgressIndicator.tsx
'use client';

import { Check } from 'lucide-react';
import type { ColorTheme } from '@/lib/colors/defaultTheme';

interface ProgressIndicatorProps {
  steps: Array<{
    id: string;
    name: string;
    timeline?: string;
  }>;
  /** Current active step index (0-based) */
  currentStep?: number;
  /** Accent color class */
  accentColor?: string;
  /** Border color class */
  borderColor?: string;
  /** Make it sticky at the top */
  sticky?: boolean;
  /** Callback when a step is clicked */
  onStepClick?: (stepIndex: number) => void;
  /** Custom color theme (overrides color classes) */
  colorTheme?: ColorTheme;
}

/**
 * Visual progress indicator showing all steps in the timeline
 * Can be sticky at the top of the page for navigation
 */
export function ProgressIndicator({
  steps,
  currentStep = 0,
  accentColor = 'text-blue-600',
  borderColor = 'border-blue-200',
  sticky = false,
  onStepClick,
  colorTheme,
}: ProgressIndicatorProps) {
  const hasCustomTheme = !!colorTheme;
  const bgColor = accentColor.replace('text-', 'bg-');

  // Inline styles for custom theme
  const borderStyle = hasCustomTheme ? { borderColor: `${colorTheme.primary}40` } : undefined;
  const primaryBgStyle = hasCustomTheme ? { backgroundColor: colorTheme.primary, borderColor: 'transparent', color: '#fff' } : undefined;
  const currentRingStyle = hasCustomTheme
    ? { borderColor: `${colorTheme.primary}40`, color: colorTheme.primary, boxShadow: `0 0 0 2px white, 0 0 0 4px ${colorTheme.primary}` }
    : undefined;
  const textAccentStyle = hasCustomTheme ? { color: colorTheme.primary } : undefined;

  return (
    <div
      className={`
        ${sticky ? 'sticky top-0 z-10' : ''}
        bg-white/95 backdrop-blur-sm
        border-b ${hasCustomTheme ? '' : borderColor}
        py-4 px-4 md:px-6
        overflow-x-auto
      `}
      style={borderStyle}
    >
      <div className="flex items-center justify-between min-w-max gap-2">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isCurrent = idx === currentStep;
          const isClickable = onStepClick !== undefined;

          // Determine circle styles based on state
          const getCircleStyle = () => {
            if (hasCustomTheme) {
              if (isCompleted) return primaryBgStyle;
              if (isCurrent) return currentRingStyle;
              return undefined;
            }
            return undefined;
          };

          const getCircleClass = () => {
            if (hasCustomTheme) {
              if (isCompleted) return 'bg-transparent border-transparent text-white';
              if (isCurrent) return 'bg-white';
              return 'border-gray-300 text-gray-400 bg-gray-50';
            }
            if (isCompleted) return `${bgColor} border-transparent text-white`;
            if (isCurrent) return `${borderColor} ${accentColor} bg-white ring-2 ring-offset-2 ${accentColor.replace('text-', 'ring-')}`;
            return 'border-gray-300 text-gray-400 bg-gray-50';
          };

          return (
            <div
              key={step.id}
              className="flex items-center"
            >
              {/* Step indicator */}
              <button
                onClick={() => isClickable && onStepClick?.(idx)}
                disabled={!isClickable}
                className={`
                  group flex flex-col items-center gap-1
                  ${isClickable ? 'cursor-pointer' : 'cursor-default'}
                  transition-all
                `}
              >
                {/* Circle */}
                <div
                  className={`
                    flex items-center justify-center
                    w-8 h-8 md:w-10 md:h-10 rounded-full
                    border-2 transition-all
                    ${getCircleClass()}
                    ${isClickable ? 'group-hover:scale-110' : ''}
                  `}
                  style={getCircleStyle()}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4 md:h-5 md:w-5" />
                  ) : (
                    <span className="text-sm md:text-base font-semibold">
                      {idx + 1}
                    </span>
                  )}
                </div>

                {/* Label */}
                <span
                  className={`
                    text-xs md:text-sm font-medium text-center max-w-[80px] md:max-w-[100px]
                    leading-tight line-clamp-2
                    ${hasCustomTheme
                      ? isCurrent ? '' : isCompleted ? 'text-gray-700' : 'text-gray-400'
                      : isCurrent ? accentColor : isCompleted ? 'text-gray-700' : 'text-gray-400'
                    }
                  `}
                  style={hasCustomTheme && isCurrent ? textAccentStyle : undefined}
                >
                  {step.name}
                </span>
              </button>

              {/* Connector line (except for last step) */}
              {idx < steps.length - 1 && (
                <div
                  className={`
                    hidden md:block
                    w-8 lg:w-16 h-0.5 mx-2
                    ${hasCustomTheme ? '' : idx < currentStep ? bgColor : 'bg-gray-200'}
                  `}
                  style={hasCustomTheme
                    ? { backgroundColor: idx < currentStep ? colorTheme.primary : '#e5e7eb' }
                    : undefined
                  }
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Compact progress bar variant
 */
interface ProgressBarProps {
  current: number;
  total: number;
  accentColor?: string;
  showLabel?: boolean;
}

export function ProgressBar({
  current,
  total,
  accentColor = 'text-blue-600',
  showLabel = true,
}: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100);
  const bgColor = accentColor.replace('text-', 'bg-');

  return (
    <div className="space-y-2">
      {showLabel && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            Step {current} of {total}
          </span>
          <span className={`font-medium ${accentColor}`}>
            {percentage}% complete
          </span>
        </div>
      )}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${bgColor} transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
