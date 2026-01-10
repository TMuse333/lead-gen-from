"use client";

import { useState, useEffect } from "react";

/**
 * SocialProofPulse - Ripple waves converting leads
 *
 * Visualizes the multiplier effect of social proof:
 * - Center: Story card with ambient pulse
 * - Ripples: 3 expanding circles
 * - Perimeter: 8 lead dots that convert when ripples pass
 */

const CONFIG = {
  storyColor: "#f59e0b",
  leadColor: "#06b6d4",
  emptyColor: "#64748b",
};

interface Props {
  className?: string;
  convertedCount?: number;
  autoAnimate?: boolean;
}

export default function SocialProofPulse({
  className = "",
  convertedCount = 5,
  autoAnimate = true,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [animationTime, setAnimationTime] = useState(0);
  const [recentlyConverted, setRecentlyConverted] = useState<number[]>([]);

  useEffect(() => {
    setMounted(true);

    if (autoAnimate) {
      let animationId: number;
      const animate = (timestamp: number) => {
        setAnimationTime(timestamp / 1000);
        animationId = requestAnimationFrame(animate);
      };
      animationId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationId);
    }
  }, [autoAnimate]);

  // Track recently converted for pop animation
  useEffect(() => {
    const newConverted = [...Array(convertedCount)].map((_, i) => i);
    const added = newConverted.filter(i => !recentlyConverted.includes(i));
    if (added.length > 0) {
      setRecentlyConverted(prev => [...prev, ...added]);
      // Clear pop animation after delay
      setTimeout(() => {
        setRecentlyConverted(newConverted);
      }, 300);
    }
  }, [convertedCount]);

  const { storyColor, leadColor, emptyColor } = CONFIG;

  const centerX = 125;
  const centerY = 125;
  const leadRadius = 95;

  // Lead positions around the perimeter
  const leads = [...Array(8)].map((_, i) => {
    const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
    return {
      x: centerX + Math.cos(angle) * leadRadius,
      y: centerY + Math.sin(angle) * leadRadius,
      isConverted: i < convertedCount,
      isPoppingIn: recentlyConverted.includes(i) && i >= convertedCount,
    };
  });

  // Ripple phases (3 ripples, staggered)
  const ripples = [0, 1, 2].map(i => {
    const cycleTime = 3; // 3 second cycle
    const offset = i * 1; // 1 second stagger
    const t = ((animationTime + offset) % cycleTime) / cycleTime;
    const radius = 20 + t * 80;
    const opacity = Math.max(0, 1 - t);
    return { radius, opacity };
  });

  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 250 250" width="250" height="250" fill="none">
        <defs>
          <filter id="socialGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="storyCardGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <radialGradient id="rippleGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={storyColor} stopOpacity="0.4" />
            <stop offset="100%" stopColor={storyColor} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Title */}
        <text
          x="125"
          y="22"
          textAnchor="middle"
          fill={storyColor}
          fontSize="10"
          fontFamily="monospace"
          opacity={mounted ? 0.8 : 0}
          style={{ transition: "opacity 0.5s" }}
        >
          SOCIAL PROOF MULTIPLIER
        </text>

        {/* Ripples */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s",
          }}
        >
          {ripples.map((ripple, i) => (
            <circle
              key={i}
              cx={centerX}
              cy={centerY}
              r={ripple.radius}
              fill="none"
              stroke={storyColor}
              strokeWidth="2"
              opacity={ripple.opacity * 0.5}
            />
          ))}
        </g>

        {/* Lead dots around perimeter */}
        <g>
          {leads.map((lead, i) => {
            const isConverted = lead.isConverted;
            const color = isConverted ? leadColor : emptyColor;

            // Pop animation scale
            const popScale = lead.isPoppingIn ? 1.3 : 1;
            const pulseScale = isConverted
              ? 1 + Math.sin(animationTime * 2 + i) * 0.1
              : 1;
            const finalScale = popScale * pulseScale;

            return (
              <g
                key={i}
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: `translate(${lead.x}px, ${lead.y}px) scale(${finalScale})`,
                  transformOrigin: "0 0",
                  transition: "opacity 0.5s, transform 0.3s",
                }}
              >
                {/* Glow ring for converted */}
                {isConverted && (
                  <circle
                    cx="0"
                    cy="0"
                    r="12"
                    fill="none"
                    stroke={leadColor}
                    strokeWidth="1"
                    opacity={0.3 + Math.sin(animationTime * 3 + i) * 0.2}
                    filter="url(#socialGlow)"
                  />
                )}

                {/* Lead dot */}
                <circle
                  cx="0"
                  cy="0"
                  r="8"
                  fill={color}
                  fillOpacity={isConverted ? 0.8 : 0.4}
                  stroke={color}
                  strokeWidth="2"
                  filter={isConverted ? "url(#socialGlow)" : undefined}
                />

                {/* Checkmark for converted */}
                {isConverted && (
                  <path
                    d="M-3 0 L-1 2 L3 -2"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                )}
              </g>
            );
          })}
        </g>

        {/* Central story card */}
        <g
          filter="url(#storyCardGlow)"
          style={{
            opacity: mounted ? 1 : 0,
            transform: `scale(${1 + Math.sin(animationTime * 2) * 0.05})`,
            transformOrigin: `${centerX}px ${centerY}px`,
            transition: "opacity 0.5s",
          }}
        >
          {/* Card background */}
          <rect
            x={centerX - 25}
            y={centerY - 30}
            width="50"
            height="60"
            rx="6"
            fill={storyColor}
            fillOpacity={0.8 + Math.sin(animationTime * 2) * 0.1}
          />

          {/* Quote/book symbol */}
          <text
            x={centerX}
            y={centerY - 5}
            textAnchor="middle"
            fill="white"
            fontSize="24"
          >
            📖
          </text>

          {/* Story label */}
          <text
            x={centerX}
            y={centerY + 20}
            textAnchor="middle"
            fill="white"
            fontSize="7"
            fontFamily="monospace"
            fontWeight="bold"
          >
            STORY
          </text>
        </g>

        {/* Counter */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s 0.3s",
          }}
        >
          <rect
            x="75"
            y="218"
            width="100"
            height="24"
            rx="5"
            fill={leadColor}
            fillOpacity="0.1"
            stroke={leadColor}
            strokeWidth="1"
          />
          <text
            x="125"
            y="234"
            textAnchor="middle"
            fill={leadColor}
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
          >
            {convertedCount}/8 influenced
          </text>
        </g>

        {/* Connection lines (subtle) */}
        <g
          opacity={mounted ? 0.15 : 0}
          style={{ transition: "opacity 0.5s 0.2s" }}
        >
          {leads.map((lead, i) => (
            <line
              key={i}
              x1={centerX}
              y1={centerY}
              x2={lead.x}
              y2={lead.y}
              stroke={lead.isConverted ? leadColor : emptyColor}
              strokeWidth="1"
              strokeDasharray={lead.isConverted ? "none" : "3 3"}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
