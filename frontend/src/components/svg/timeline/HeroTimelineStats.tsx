"use client";

import { useState, useEffect } from "react";

/**
 * HeroTimelineStats - Animated visualization for timeline offer hero
 *
 * Displays key stats in a clean, contained layout with animated path.
 * All text stays within the viewBox boundaries.
 */

interface TimelineStatsProps {
  /** Total duration (e.g., "4-5 months") */
  duration: string;
  /** Number of phases/steps */
  steps: number;
  /** Total action items */
  actions: number;
  /** Number of client stories */
  stories: number;
  /** User's budget */
  budget?: string;
  /** User's timeline */
  userTimeline?: string;
  /** Is first time buyer/seller */
  isFirstTime?: boolean;
  /** Flow type for context */
  flowType?: string;
  /** Primary color for theming */
  primaryColor?: string;
  /** Secondary color for theming */
  secondaryColor?: string;
  /** Width of the SVG */
  width?: number;
  /** Height of the SVG */
  height?: number;
  className?: string;
}

export default function HeroTimelineStats({
  duration,
  steps,
  actions,
  stories,
  budget,
  userTimeline,
  isFirstTime,
  flowType = "buy",
  primaryColor = "#06b6d4",
  secondaryColor = "#10b981",
  width = 320,
  height = 220,
  className = "",
}: TimelineStatsProps) {
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

  // Animated progress along path
  const progress = mounted ? (Math.sin(time * 0.8) + 1) / 2 : 0;

  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 320 220"
        width={width}
        height={height}
        fill="none"
        className="max-w-full h-auto"
      >
        <defs>
          <linearGradient id="statsPathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>

          <filter id="statsGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="statsShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Background card */}
        <rect
          x="10"
          y="10"
          width="300"
          height="200"
          rx="16"
          fill="white"
          fillOpacity="0.95"
          filter="url(#statsShadow)"
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.4s ease-out",
          }}
        />

        {/* Header section */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.4s ease-out 0.1s",
          }}
        >
          <text
            x="160"
            y="38"
            textAnchor="middle"
            fontSize="11"
            fontWeight="600"
            fill={primaryColor}
            style={{ letterSpacing: "0.05em" }}
          >
            YOUR JOURNEY AT A GLANCE
          </text>
        </g>

        {/* Animated path visualization */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.2s",
          }}
        >
          {/* Path background */}
          <path
            d="M30 75 Q80 65 120 70 Q180 80 220 68 Q260 56 290 62"
            stroke={primaryColor}
            strokeWidth="3"
            strokeOpacity="0.15"
            strokeLinecap="round"
            fill="none"
          />

          {/* Animated path */}
          <path
            d="M30 75 Q80 65 120 70 Q180 80 220 68 Q260 56 290 62"
            stroke="url(#statsPathGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            filter="url(#statsGlow)"
            style={{
              strokeDasharray: 300,
              strokeDashoffset: mounted ? 0 : 300,
              transition: "stroke-dashoffset 1.2s ease-out 0.3s",
            }}
          />

          {/* Milestone dots */}
          {[
            { x: 30, y: 75 },
            { x: 120, y: 70 },
            { x: 220, y: 68 },
            { x: 290, y: 62 },
          ].map((point, i) => (
            <circle
              key={i}
              cx={point.x}
              cy={point.y}
              r={i === 3 ? 8 : 5}
              fill={i === 3 ? secondaryColor : "white"}
              stroke={i === 3 ? secondaryColor : primaryColor}
              strokeWidth="2"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "scale(1)" : "scale(0)",
                transformOrigin: `${point.x}px ${point.y}px`,
                transition: `all 0.3s ease-out ${0.4 + i * 0.1}s`,
              }}
            />
          ))}

          {/* House icon at end */}
          <text
            x="290"
            y="66"
            textAnchor="middle"
            fontSize="10"
            fill="white"
          >
            🏠
          </text>

          {/* Traveling dot */}
          <circle
            cx={30 + progress * 260}
            cy={75 - Math.sin(progress * Math.PI) * 8}
            r="4"
            fill={secondaryColor}
            style={{
              opacity: mounted ? 0.8 : 0,
              transition: "opacity 0.5s ease-out 0.8s",
            }}
          />
        </g>

        {/* Stats grid - 2x2 layout */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.4s ease-out 0.5s",
          }}
        >
          {/* Row 1 */}
          {/* Duration */}
          <g>
            <rect x="25" y="95" width="130" height="45" rx="8" fill={`${primaryColor}10`} />
            <text x="40" y="115" fontSize="10" fill="#64748b">Timeline</text>
            <text x="40" y="132" fontSize="16" fontWeight="bold" fill="#1e293b">{duration}</text>
          </g>

          {/* Steps */}
          <g>
            <rect x="165" y="95" width="130" height="45" rx="8" fill={`${secondaryColor}10`} />
            <text x="180" y="115" fontSize="10" fill="#64748b">Steps</text>
            <text x="180" y="132" fontSize="16" fontWeight="bold" fill="#1e293b">{steps} phases</text>
          </g>

          {/* Row 2 */}
          {/* Actions */}
          <g>
            <rect x="25" y="150" width="130" height="45" rx="8" fill={`${primaryColor}10`} />
            <text x="40" y="170" fontSize="10" fill="#64748b">Action Items</text>
            <text x="40" y="187" fontSize="16" fontWeight="bold" fill="#1e293b">{actions} tasks</text>
          </g>

          {/* Stories or User Info */}
          <g>
            <rect x="165" y="150" width="130" height="45" rx="8" fill={`${secondaryColor}10`} />
            {stories > 0 ? (
              <>
                <text x="180" y="170" fontSize="10" fill="#64748b">Client Stories</text>
                <text x="180" y="187" fontSize="16" fontWeight="bold" fill="#1e293b">{stories} matched</text>
              </>
            ) : budget ? (
              <>
                <text x="180" y="170" fontSize="10" fill="#64748b">Your Budget</text>
                <text x="180" y="187" fontSize="14" fontWeight="bold" fill="#1e293b">{budget}</text>
              </>
            ) : (
              <>
                <text x="180" y="170" fontSize="10" fill="#64748b">Personalized</text>
                <text x="180" y="187" fontSize="14" fontWeight="bold" fill="#1e293b">For You</text>
              </>
            )}
          </g>
        </g>

        {/* Decorative corner sparkles */}
        {mounted && [
          { x: 295, y: 25, delay: 0 },
          { x: 25, y: 195, delay: 0.3 },
        ].map((sparkle, i) => (
          <circle
            key={i}
            cx={sparkle.x}
            cy={sparkle.y}
            r="3"
            fill={i === 0 ? primaryColor : secondaryColor}
            opacity={0.4 + Math.sin(time * 2 + sparkle.delay) * 0.3}
          />
        ))}
      </svg>
    </div>
  );
}
