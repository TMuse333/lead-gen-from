"use client";

import { useState, useEffect } from "react";

/**
 * JourneyProgress - Vertical progress indicator for timeline steps
 * Matches agent-lead-gen ProgressIndicator style
 */

const CONFIG = {
  primaryCyan: "#06b6d4",
  lightCyan: "#22d3ee",
  success: "#10b981",
  white: "#ffffff",
  darkBg: "#0f172a",
  cardBg: "#1e293b",
  strokeDark: "#334155",
};

interface Step {
  name: string;
  timeline?: string;
}

interface Props {
  width?: number;
  height?: number;
  steps?: Step[];
  currentStep?: number;
}

export default function JourneyProgress({
  width = 180,
  height = 320,
  steps = [
    { name: "Pre-Approval", timeline: "Week 1" },
    { name: "Find Agent", timeline: "Week 2" },
    { name: "Home Search", timeline: "Week 3-6" },
    { name: "Make Offer", timeline: "Week 7" },
    { name: "Inspection", timeline: "Week 8" },
    { name: "Closing", timeline: "Week 10" },
  ],
  currentStep = 2,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let frame: number;
    const animate = (timestamp: number) => {
      setTime(timestamp / 1000);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  const stepSpacing = (height - 60) / (steps.length - 1);
  const startY = 30;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ overflow: "visible" }}
    >
      <defs>
        <filter id="jp-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <linearGradient id="jp-line-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={CONFIG.success} />
          <stop offset={`${(currentStep / (steps.length - 1)) * 100}%`} stopColor={CONFIG.primaryCyan} />
          <stop offset={`${(currentStep / (steps.length - 1)) * 100}%`} stopColor={CONFIG.strokeDark} />
          <stop offset="100%" stopColor={CONFIG.strokeDark} />
        </linearGradient>
      </defs>

      {/* Background connector line */}
      <line
        x1="24"
        y1={startY}
        x2="24"
        y2={startY + stepSpacing * (steps.length - 1)}
        stroke={CONFIG.strokeDark}
        strokeWidth="3"
        strokeLinecap="round"
        style={{
          opacity: mounted ? 1 : 0,
          transition: "opacity 0.3s ease-out",
        }}
      />

      {/* Progress line */}
      <line
        x1="24"
        y1={startY}
        x2="24"
        y2={startY + stepSpacing * currentStep}
        stroke="url(#jp-line-gradient)"
        strokeWidth="3"
        strokeLinecap="round"
        filter="url(#jp-glow)"
        style={{
          opacity: mounted ? 1 : 0,
          transition: "opacity 0.4s ease-out 0.1s",
        }}
      />

      {/* Step nodes */}
      {steps.map((step, i) => {
        const y = startY + i * stepSpacing;
        const isCompleted = i < currentStep;
        const isCurrent = i === currentStep;
        const isPending = i > currentStep;

        return (
          <g
            key={i}
            style={{
              opacity: mounted ? 1 : 0,
              transition: `opacity 0.4s ease-out ${0.15 + i * 0.08}s`,
            }}
          >
            {/* Outer ring for current step */}
            {isCurrent && (
              <circle
                cx="24"
                cy={y}
                r={18 + Math.sin(time * 2) * 2}
                fill="none"
                stroke={CONFIG.primaryCyan}
                strokeWidth="2"
                opacity={0.3 + Math.sin(time * 2) * 0.2}
              />
            )}

            {/* Node circle */}
            <circle
              cx="24"
              cy={y}
              r="12"
              fill={
                isCompleted
                  ? CONFIG.success
                  : isCurrent
                  ? CONFIG.primaryCyan
                  : CONFIG.cardBg
              }
              stroke={
                isCompleted
                  ? CONFIG.success
                  : isCurrent
                  ? CONFIG.primaryCyan
                  : CONFIG.strokeDark
              }
              strokeWidth="2"
              filter={isCurrent ? "url(#jp-glow)" : "none"}
            />

            {/* Checkmark for completed */}
            {isCompleted && (
              <polyline
                points={`19,${y} 22,${y + 3} 29,${y - 4}`}
                fill="none"
                stroke={CONFIG.white}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Number for current/pending */}
            {!isCompleted && (
              <text
                x="24"
                y={y + 4}
                textAnchor="middle"
                fontSize="11"
                fontFamily="system-ui, sans-serif"
                fontWeight="700"
                fill={isCurrent ? CONFIG.darkBg : CONFIG.strokeDark}
              >
                {i + 1}
              </text>
            )}

            {/* Step name */}
            <text
              x="48"
              y={y - 2}
              fontSize="12"
              fontFamily="system-ui, sans-serif"
              fontWeight={isCurrent ? "700" : "500"}
              fill={isPending ? CONFIG.strokeDark : CONFIG.white}
            >
              {step.name}
            </text>

            {/* Timeline */}
            {step.timeline && (
              <text
                x="48"
                y={y + 12}
                fontSize="10"
                fontFamily="system-ui, sans-serif"
                fill={
                  isCompleted
                    ? CONFIG.success
                    : isCurrent
                    ? CONFIG.lightCyan
                    : CONFIG.strokeDark
                }
                opacity={0.8}
              >
                {step.timeline}
              </text>
            )}
          </g>
        );
      })}

      {/* Progress percentage */}
      <g
        style={{
          opacity: mounted ? 1 : 0,
          transition: "opacity 0.5s ease-out 0.5s",
        }}
      >
        <text
          x={width - 10}
          y="20"
          textAnchor="end"
          fontSize="18"
          fontFamily="monospace"
          fontWeight="700"
          fill={CONFIG.primaryCyan}
        >
          {Math.round((currentStep / (steps.length - 1)) * 100)}%
        </text>
        <text
          x={width - 10}
          y="34"
          textAnchor="end"
          fontSize="9"
          fontFamily="system-ui, sans-serif"
          fill={CONFIG.white}
          opacity="0.5"
        >
          complete
        </text>
      </g>
    </svg>
  );
}
