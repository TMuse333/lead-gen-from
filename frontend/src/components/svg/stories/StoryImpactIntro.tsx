"use client";

import { useState, useEffect } from "react";

/**
 * StoryImpactIntro - Multi-state slideshow illustration
 *
 * Transitions through 4 states:
 * 1. "The Gap": Two circles far apart, gap labeled "?"
 * 2. "The Bridge": Book/story icon appears, connects them
 * 3. "The Connection": Circles move closer, overlap begins
 * 4. "The Trust": Merged with golden glow, "TRUST" label
 */

const CONFIG = {
  leadColor: "#06b6d4",
  agentColor: "#10b981",
  storyColor: "#f59e0b",
  trustColor: "#fbbf24",
};

interface Props {
  className?: string;
  step: number; // 1-4
}

export default function StoryImpactIntro({
  className = "",
  step = 1,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [animationTime, setAnimationTime] = useState(0);

  useEffect(() => {
    setMounted(true);

    let animationId: number;
    const animate = (timestamp: number) => {
      setAnimationTime(timestamp / 1000);
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  const { leadColor, agentColor, storyColor, trustColor } = CONFIG;

  // Calculate positions based on step
  const centerY = 95;
  const orbRadius = 40;

  // Circle separation decreases with each step
  const separations = [140, 120, 70, 40];
  const separation = separations[Math.min(step - 1, 3)];

  const leadX = 160 - separation / 2;
  const agentX = 160 + separation / 2;

  // Overlap calculation
  const overlapAmount = Math.max(0, (orbRadius * 2 - separation) / 2);
  const hasOverlap = overlapAmount > 5;

  // Step-specific visibility
  const showGapQuestion = step === 1;
  const showStory = step >= 2;
  const showConnection = step >= 3;
  const showTrust = step === 4;

  // Celebration particles for step 4
  const particles = showTrust
    ? [...Array(12)].map((_, i) => {
        const angle = (i / 12) * Math.PI * 2 + animationTime * 2;
        const dist = 55 + Math.sin(animationTime * 3 + i) * 10;
        return {
          x: 160 + Math.cos(angle) * dist,
          y: centerY + Math.sin(angle) * dist * 0.6,
          opacity: 0.4 + Math.sin(animationTime * 4 + i) * 0.3,
        };
      })
    : [];

  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 320 200" width="320" height="200" fill="none">
        <defs>
          <radialGradient id="leadOrbGrad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="50%" stopColor={leadColor} />
            <stop offset="100%" stopColor="#0e7490" stopOpacity="0.6" />
          </radialGradient>

          <radialGradient id="agentOrbGrad" cx="70%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="50%" stopColor={agentColor} />
            <stop offset="100%" stopColor="#047857" stopOpacity="0.6" />
          </radialGradient>

          <radialGradient id="trustGlowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={trustColor} stopOpacity="0.9" />
            <stop offset="100%" stopColor={storyColor} stopOpacity="0.3" />
          </radialGradient>

          <filter id="introGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="trustIntenseGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <clipPath id="agentClip">
            <circle cx={agentX} cy={centerY} r={orbRadius} />
          </clipPath>
        </defs>

        {/* Title based on step */}
        <text
          x="160"
          y="20"
          textAnchor="middle"
          fill={step === 4 ? trustColor : step >= 2 ? storyColor : leadColor}
          fontSize="11"
          fontFamily="monospace"
          fontWeight="bold"
          opacity={mounted ? 0.9 : 0}
          style={{ transition: "opacity 0.5s, fill 0.8s" }}
        >
          {step === 1 && "THE GAP"}
          {step === 2 && "THE BRIDGE"}
          {step === 3 && "THE CONNECTION"}
          {step === 4 && "THE TRUST"}
        </text>

        {/* Lead circle */}
        <g
          filter="url(#introGlow)"
          style={{
            opacity: mounted ? 0.85 : 0,
            transition: "opacity 0.5s, transform 0.8s",
          }}
        >
          <circle
            cx={leadX}
            cy={centerY}
            r={orbRadius}
            fill="url(#leadOrbGrad)"
          />
          <circle
            cx={leadX}
            cy={centerY}
            r={orbRadius}
            fill="none"
            stroke={leadColor}
            strokeWidth="2"
            opacity="0.5"
          />
          <text
            x={leadX}
            y={centerY - orbRadius - 10}
            textAnchor="middle"
            fill={leadColor}
            fontSize="8"
            fontFamily="monospace"
          >
            Lead
          </text>
        </g>

        {/* Agent circle */}
        <g
          filter="url(#introGlow)"
          style={{
            opacity: mounted ? 0.85 : 0,
            transition: "opacity 0.5s, transform 0.8s",
          }}
        >
          <circle
            cx={agentX}
            cy={centerY}
            r={orbRadius}
            fill="url(#agentOrbGrad)"
          />
          <circle
            cx={agentX}
            cy={centerY}
            r={orbRadius}
            fill="none"
            stroke={agentColor}
            strokeWidth="2"
            opacity="0.5"
          />
          <text
            x={agentX}
            y={centerY - orbRadius - 10}
            textAnchor="middle"
            fill={agentColor}
            fontSize="8"
            fontFamily="monospace"
          >
            Agent
          </text>
        </g>

        {/* Trust overlap glow (step 3-4) */}
        {hasOverlap && showConnection && (
          <g filter="url(#trustIntenseGlow)">
            <circle
              cx={leadX}
              cy={centerY}
              r={orbRadius}
              fill="url(#trustGlowGrad)"
              clipPath="url(#agentClip)"
              opacity={step === 4 ? 1 : 0.6}
              style={{ transition: "opacity 0.8s" }}
            />
          </g>
        )}

        {/* Gap question mark (step 1) */}
        {showGapQuestion && (
          <g
            style={{
              opacity: mounted ? 0.7 : 0,
              transition: "opacity 0.5s",
            }}
          >
            <text
              x="160"
              y={centerY + 8}
              textAnchor="middle"
              fill={leadColor}
              fontSize="28"
              fontFamily="serif"
              style={{
                opacity: 0.5 + Math.sin(animationTime * 2) * 0.2,
              }}
            >
              ?
            </text>
          </g>
        )}

        {/* Story book icon (step 2+) */}
        {showStory && !showTrust && (
          <g
            filter="url(#introGlow)"
            style={{
              opacity: mounted ? 1 : 0,
              transform: `scale(${1 + Math.sin(animationTime * 2) * 0.05})`,
              transformOrigin: "160px 95px",
              transition: "opacity 0.8s",
            }}
          >
            {/* Book */}
            <rect
              x="145"
              y={centerY - 15}
              width="30"
              height="24"
              rx="3"
              fill={storyColor}
            />
            <rect
              x="149"
              y={centerY - 11}
              width="22"
              height="16"
              rx="2"
              fill="white"
              fillOpacity="0.3"
            />
            <line
              x1="160"
              y1={centerY - 11}
              x2="160"
              y2={centerY + 5}
              stroke="white"
              strokeWidth="1"
              strokeOpacity="0.4"
            />

            {/* Dotted connection lines (step 2) */}
            {step === 2 && (
              <g opacity="0.5">
                <line
                  x1={leadX + orbRadius}
                  y1={centerY}
                  x2="145"
                  y2={centerY}
                  stroke={storyColor}
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                <line
                  x1="175"
                  y1={centerY}
                  x2={agentX - orbRadius}
                  y2={centerY}
                  stroke={storyColor}
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
              </g>
            )}
          </g>
        )}

        {/* TRUST text and celebration (step 4) */}
        {showTrust && (
          <g>
            {/* Celebration particles */}
            {particles.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r="4"
                fill={i % 2 === 0 ? trustColor : storyColor}
                opacity={p.opacity}
              />
            ))}

            {/* Central burst */}
            <circle
              cx="160"
              cy={centerY}
              r={15 + Math.sin(animationTime * 4) * 3}
              fill={trustColor}
              filter="url(#trustIntenseGlow)"
            />

            {/* TRUST text */}
            <text
              x="160"
              y={centerY + 6}
              textAnchor="middle"
              fill="white"
              fontSize="14"
              fontFamily="monospace"
              fontWeight="bold"
            >
              TRUST
            </text>
          </g>
        )}

        {/* Step indicator dots */}
        <g
          style={{
            opacity: mounted ? 0.8 : 0,
            transition: "opacity 0.5s",
          }}
        >
          {[1, 2, 3, 4].map((s) => (
            <circle
              key={s}
              cx={130 + s * 20}
              cy="175"
              r={s === step ? 5 : 4}
              fill={s === step ? (step === 4 ? trustColor : storyColor) : "#475569"}
              fillOpacity={s === step ? 1 : 0.4}
              style={{ transition: "fill 0.3s, r 0.3s" }}
            />
          ))}
        </g>

        {/* Subtitle */}
        <text
          x="160"
          y="190"
          textAnchor="middle"
          fill={step === 4 ? trustColor : storyColor}
          fontSize="7"
          fontFamily="monospace"
          fontStyle="italic"
          opacity={mounted ? 0.6 : 0}
          style={{ transition: "opacity 0.5s, fill 0.8s" }}
        >
          {step === 1 && "Strangers with no connection"}
          {step === 2 && "Stories create a bridge"}
          {step === 3 && "Shared experiences build rapport"}
          {step === 4 && "Trust is established"}
        </text>
      </svg>
    </div>
  );
}
