"use client";

import { useState, useEffect } from "react";

/**
 * BrowsingTimelineProgress - Overall browsing journey visualization
 *
 * Horizontal path with milestone dots for browsing/discovery process.
 * Dynamic props for current step highlighting.
 * Conveys: "Your discovery journey at a glance"
 */

const DEFAULT_STEPS = [
  { id: 1, label: "Explore", icon: "🗺️" },
  { id: 2, label: "Search", icon: "🔍" },
  { id: 3, label: "Save", icon: "❤️" },
  { id: 4, label: "Compare", icon: "⚖️" },
  { id: 5, label: "Decide", icon: "✨" },
];

interface Props {
  className?: string;
  currentStep?: number;
  totalSteps?: number;
  primaryColor?: string;
  secondaryColor?: string;
  width?: number;
  height?: number;
}

export default function BrowsingTimelineProgress({
  className = "",
  currentStep = 1,
  totalSteps = 5,
  primaryColor = "#3b82f6",
  secondaryColor = "#10b981",
  width = 300,
  height = 120,
}: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const steps = DEFAULT_STEPS.slice(0, totalSteps);
  const completedColor = secondaryColor;
  const activeColor = primaryColor;
  const inactiveColor = "#475569";

  // Calculate positions
  const padding = 30;
  const pathWidth = 240;
  const stepSpacing = pathWidth / (steps.length - 1);
  const pathY = 55;

  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 300 120"
        width={width}
        height={height}
        fill="none"
      >
        <defs>
          <linearGradient id="browsingTimelineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={completedColor} />
            <stop offset="100%" stopColor={activeColor} />
          </linearGradient>

          <filter id="browsingTimelineGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="browsingActiveGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Title */}
        <text
          x="150"
          y="18"
          textAnchor="middle"
          fill={activeColor}
          fontSize="10"
          fontFamily="monospace"
          opacity={mounted ? 0.7 : 0}
          style={{ transition: "opacity 0.5s ease-out" }}
        >
          YOUR DISCOVERY JOURNEY
        </text>

        {/* Background path */}
        <line
          x1={padding}
          y1={pathY}
          x2={padding + pathWidth}
          y2={pathY}
          stroke={inactiveColor}
          strokeWidth="3"
          strokeOpacity="0.3"
          strokeLinecap="round"
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease-out",
          }}
        />

        {/* Completed path */}
        <line
          x1={padding}
          y1={pathY}
          x2={padding + stepSpacing * (currentStep - 1)}
          y2={pathY}
          stroke="url(#browsingTimelineGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          filter="url(#browsingTimelineGlow)"
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.2s",
          }}
        />

        {/* Step nodes */}
        {steps.map((step, index) => {
          const x = padding + index * stepSpacing;
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;
          const isFuture = step.id > currentStep;

          const nodeColor = isCompleted
            ? completedColor
            : isActive
              ? activeColor
              : inactiveColor;

          const nodeRadius = isActive ? 14 : 10;

          return (
            <g
              key={step.id}
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "scale(1)" : "scale(0.5)",
                transformOrigin: `${x}px ${pathY}px`,
                transition: `all 0.4s ease-out ${0.1 + index * 0.1}s`,
              }}
            >
              {/* Active pulse ring */}
              {isActive && (
                <circle
                  cx={x}
                  cy={pathY}
                  r={nodeRadius + 6}
                  fill="none"
                  stroke={activeColor}
                  strokeWidth="2"
                  opacity="0.3"
                  style={{
                    animationName: "browsingPulse",
                    animationDuration: "2s",
                    animationIterationCount: "infinite",
                  }}
                />
              )}

              {/* Node circle */}
              <circle
                cx={x}
                cy={pathY}
                r={nodeRadius}
                fill={isActive || isCompleted ? nodeColor : "transparent"}
                fillOpacity={isActive ? 1 : 0.8}
                stroke={nodeColor}
                strokeWidth="2"
                filter={isActive ? "url(#browsingActiveGlow)" : undefined}
              />

              {/* Checkmark for completed */}
              {isCompleted && (
                <path
                  d={`M${x - 4} ${pathY} L${x - 1} ${pathY + 3} L${x + 4} ${pathY - 3}`}
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              )}

              {/* Step number for active/future */}
              {!isCompleted && (
                <text
                  x={x}
                  y={pathY + 4}
                  textAnchor="middle"
                  fill={isActive ? "white" : nodeColor}
                  fontSize={isActive ? "10" : "8"}
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {step.id}
                </text>
              )}

              {/* Label */}
              <text
                x={x}
                y={pathY + 28}
                textAnchor="middle"
                fill={isActive ? activeColor : isCompleted ? completedColor : inactiveColor}
                fontSize="7"
                fontFamily="monospace"
                fontWeight={isActive ? "bold" : "normal"}
                opacity={isFuture ? 0.5 : 1}
              >
                {step.label}
              </text>
            </g>
          );
        })}

        {/* Celebration at end */}
        <g
          filter={currentStep === totalSteps ? "url(#browsingActiveGlow)" : undefined}
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "scale(1)" : "scale(0)",
            transformOrigin: `${padding + pathWidth}px ${pathY}px`,
            transition: "all 0.5s ease-out 0.8s",
          }}
        >
          {currentStep === totalSteps && (
            <>
              {/* Ready indicator */}
              {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                <line
                  key={i}
                  x1={padding + pathWidth + Math.cos((angle * Math.PI) / 180) * 18}
                  y1={pathY + Math.sin((angle * Math.PI) / 180) * 18}
                  x2={padding + pathWidth + Math.cos((angle * Math.PI) / 180) * 25}
                  y2={pathY + Math.sin((angle * Math.PI) / 180) * 25}
                  stroke={i % 2 === 0 ? completedColor : activeColor}
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity="0.6"
                  style={{
                    animationName: "browsingBurst",
                    animationDuration: "1.5s",
                    animationIterationCount: "infinite",
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </>
          )}
        </g>

        {/* Progress text */}
        <text
          x="150"
          y="108"
          textAnchor="middle"
          fill={activeColor}
          fontSize="9"
          fontFamily="monospace"
          style={{
            opacity: mounted ? 0.8 : 0,
            transition: "opacity 0.5s ease-out 0.5s",
          }}
        >
          Step {currentStep} of {totalSteps}
          {currentStep === totalSteps ? " — Ready to act! 🚀" : ""}
        </text>

        <style>{`
          @keyframes browsingPulse {
            0%, 100% { r: 20; opacity: 0.3; }
            50% { r: 24; opacity: 0.1; }
          }
          @keyframes browsingBurst {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 0.2; }
          }
        `}</style>
      </svg>
    </div>
  );
}
