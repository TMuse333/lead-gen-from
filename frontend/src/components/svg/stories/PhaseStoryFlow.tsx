"use client";

import { useState, useEffect } from "react";

/**
 * PhaseStoryFlow - Stories flowing into timeline phases
 *
 * Visualizes "stories populate each phase of the journey" with:
 * - Left: Glowing orb with orbiting book icons
 * - Center: Curved flowing path
 * - Right: 5 phase boxes that light up when filled with stories
 */

const CONFIG = {
  primaryColor: "#06b6d4",
  secondaryColor: "#10b981",
  emptyColor: "#64748b",
};

const PHASES = [
  "Financial Prep",
  "Home Search",
  "Make Offer",
  "Inspection",
  "Closing",
];

interface Props {
  className?: string;
  filledPhases?: number[];
  autoAnimate?: boolean;
}

export default function PhaseStoryFlow({
  className = "",
  filledPhases = [0, 1, 2],
  autoAnimate = true,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [animationTime, setAnimationTime] = useState(0);

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

  const { primaryColor, secondaryColor, emptyColor } = CONFIG;

  // Book positions along the curved path
  const getBookPosition = (t: number, offset: number) => {
    const adjustedT = ((t + offset) % 1);
    // Curved path from left orb to right phases
    const startX = 80;
    const endX = 260;
    const x = startX + (endX - startX) * adjustedT;
    // Sinusoidal curve
    const y = 125 + Math.sin(adjustedT * Math.PI) * -40;
    return { x, y, opacity: Math.sin(adjustedT * Math.PI) };
  };

  const filledCount = filledPhases.length;

  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 400 250" width="400" height="250" fill="none">
        <defs>
          <filter id="phaseFlowGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="orbGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <linearGradient id="flowPathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>
        </defs>

        {/* Title */}
        <text
          x="200"
          y="22"
          textAnchor="middle"
          fill={primaryColor}
          fontSize="11"
          fontFamily="monospace"
          opacity={mounted ? 0.8 : 0}
          style={{ transition: "opacity 0.5s" }}
        >
          STORIES POPULATE YOUR JOURNEY
        </text>

        {/* Left side: Story source orb */}
        <g
          filter="url(#orbGlow)"
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s",
          }}
        >
          {/* Main orb */}
          <circle
            cx="55"
            cy="125"
            r="35"
            fill={primaryColor}
            fillOpacity="0.2"
            stroke={primaryColor}
            strokeWidth="2"
          />

          {/* Inner glow */}
          <circle
            cx="55"
            cy="125"
            r="20"
            fill={primaryColor}
            fillOpacity={0.3 + Math.sin(animationTime * 2) * 0.1}
          />

          {/* Label */}
          <text
            x="55"
            y="122"
            textAnchor="middle"
            fill={primaryColor}
            fontSize="7"
            fontFamily="monospace"
          >
            Your
          </text>
          <text
            x="55"
            y="132"
            textAnchor="middle"
            fill={primaryColor}
            fontSize="7"
            fontFamily="monospace"
          >
            Stories
          </text>

          {/* Orbiting book icons */}
          {[0, 1, 2].map((i) => {
            const angle = animationTime * 1.5 + (i / 3) * Math.PI * 2;
            const orbitRadius = 45;
            const bx = 55 + Math.cos(angle) * orbitRadius;
            const by = 125 + Math.sin(angle) * orbitRadius * 0.6;
            return (
              <g key={i} transform={`translate(${bx - 6}, ${by - 5})`}>
                <rect
                  width="12"
                  height="10"
                  rx="1"
                  fill={primaryColor}
                  fillOpacity="0.8"
                />
                <rect
                  x="2"
                  y="2"
                  width="8"
                  height="6"
                  rx="0.5"
                  fill="white"
                  fillOpacity="0.3"
                />
              </g>
            );
          })}
        </g>

        {/* Center: Flowing path */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s 0.2s",
          }}
        >
          {/* Background path */}
          <path
            d="M90 125 Q170 70 260 125"
            fill="none"
            stroke={primaryColor}
            strokeWidth="4"
            strokeOpacity="0.2"
            strokeLinecap="round"
          />

          {/* Animated flow path */}
          <path
            d="M90 125 Q170 70 260 125"
            fill="none"
            stroke="url(#flowPathGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="8 12"
            strokeDashoffset={-animationTime * 30}
          />
        </g>

        {/* Traveling book icons */}
        {autoAnimate && (
          <g>
            {[0, 0.33, 0.66].map((offset, i) => {
              const pos = getBookPosition((animationTime * 0.2) % 1, offset);
              return (
                <g
                  key={i}
                  transform={`translate(${pos.x - 6}, ${pos.y - 5})`}
                  opacity={pos.opacity * 0.9}
                  filter="url(#phaseFlowGlow)"
                >
                  <rect
                    width="12"
                    height="10"
                    rx="1"
                    fill={primaryColor}
                  />
                  <rect
                    x="2"
                    y="2"
                    width="8"
                    height="6"
                    rx="0.5"
                    fill="white"
                    fillOpacity="0.4"
                  />
                </g>
              );
            })}
          </g>
        )}

        {/* Right side: Phase boxes */}
        <g>
          {PHASES.map((phase, i) => {
            const isFilled = filledPhases.includes(i);
            const y = 45 + i * 38;
            const color = isFilled ? secondaryColor : emptyColor;
            const pulseScale = isFilled ? 1 + Math.sin(animationTime * 3 + i) * 0.02 : 1;

            return (
              <g
                key={i}
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: `scale(${pulseScale})`,
                  transformOrigin: `330px ${y + 15}px`,
                  transition: `opacity 0.5s ${0.3 + i * 0.1}s`,
                }}
              >
                {/* Phase box */}
                <rect
                  x="280"
                  y={y}
                  width="110"
                  height="30"
                  rx="6"
                  fill={color}
                  fillOpacity={isFilled ? 0.2 : 0.1}
                  stroke={color}
                  strokeWidth={isFilled ? 2 : 1}
                  filter={isFilled ? "url(#phaseFlowGlow)" : undefined}
                />

                {/* Phase number */}
                <circle
                  cx="295"
                  cy={y + 15}
                  r="8"
                  fill={color}
                  fillOpacity={isFilled ? 0.6 : 0.3}
                />
                <text
                  x="295"
                  y={y + 19}
                  textAnchor="middle"
                  fill="white"
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {i + 1}
                </text>

                {/* Phase label */}
                <text
                  x="345"
                  y={y + 19}
                  textAnchor="middle"
                  fill={color}
                  fontSize="8"
                  fontFamily="monospace"
                  fontWeight={isFilled ? "bold" : "normal"}
                >
                  {phase}
                </text>

                {/* Story icon if filled */}
                {isFilled && (
                  <g transform={`translate(375, ${y + 8})`}>
                    <rect
                      width="10"
                      height="8"
                      rx="1"
                      fill={secondaryColor}
                    />
                    <rect
                      x="2"
                      y="2"
                      width="6"
                      height="4"
                      rx="0.5"
                      fill="white"
                      fillOpacity="0.4"
                    />
                  </g>
                )}
              </g>
            );
          })}
        </g>

        {/* Connection lines from path to phases */}
        <g
          opacity={mounted ? 0.3 : 0}
          style={{ transition: "opacity 0.5s 0.5s" }}
        >
          {PHASES.map((_, i) => {
            const y = 60 + i * 38;
            return (
              <line
                key={i}
                x1="260"
                y1="125"
                x2="280"
                y2={y}
                stroke={filledPhases.includes(i) ? secondaryColor : emptyColor}
                strokeWidth="1"
                strokeDasharray="3 3"
              />
            );
          })}
        </g>

        {/* Counter */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s 0.6s",
          }}
        >
          <rect
            x="145"
            y="215"
            width="110"
            height="25"
            rx="5"
            fill={secondaryColor}
            fillOpacity="0.1"
            stroke={secondaryColor}
            strokeWidth="1"
          />
          <text
            x="200"
            y="232"
            textAnchor="middle"
            fill={secondaryColor}
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
          >
            {filledCount}/{PHASES.length} phases have stories
          </text>
        </g>
      </svg>
    </div>
  );
}
