"use client";

import { useState, useEffect } from "react";

/**
 * StoryBridge - Trust Building Visualization
 *
 * Two orbs representing "User's Situation" and "Agent's Experience"
 * merge together. Their overlap represents Trust - showing how
 * sharing stories builds connection.
 */

const CONFIG = {
  situationColor: "#06b6d4", // Cyan for user's situation
  experienceColor: "#10b981", // Green for agent's experience
  trustColor: "#f59e0b", // Amber for trust overlap
  sparkColor: "#fbbf24", // Gold spark
};

interface Props {
  className?: string;
  progress?: number;
  autoAnimate?: boolean;
  size?: number;
}

export default function StoryBridge({
  className = "",
  progress: controlledProgress,
  autoAnimate = true,
  size = 280,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [internalProgress, setInternalProgress] = useState(0);
  const [animationTime, setAnimationTime] = useState(0);

  const progress = controlledProgress ?? internalProgress;

  useEffect(() => {
    setMounted(true);

    if (autoAnimate && controlledProgress === undefined) {
      let start: number | null = null;
      let animationId: number;
      const duration = 5000;

      const animate = (timestamp: number) => {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;

        if (elapsed < duration) {
          setInternalProgress(elapsed / duration);
        } else {
          setInternalProgress(1);
        }

        setAnimationTime(elapsed / 1000);
        animationId = requestAnimationFrame(animate);
      };

      animationId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationId);
    }
  }, [autoAnimate, controlledProgress]);

  useEffect(() => {
    if (controlledProgress !== undefined) {
      let animationId: number;
      const animate = (timestamp: number) => {
        setAnimationTime(timestamp / 1000);
        animationId = requestAnimationFrame(animate);
      };
      animationId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationId);
    }
  }, [controlledProgress]);

  const { situationColor, experienceColor, trustColor, sparkColor } = CONFIG;

  const centerY = 95;
  const orbRadius = 50;

  // Orbs move toward each other: start 120 apart, end 50 apart
  const separation = 120 - progress * 70;
  const orbAX = 140 - separation / 2;
  const orbBX = 140 + separation / 2;

  // Overlap amount increases with proximity
  const overlapAmount = Math.max(0, (orbRadius * 2 - separation) / 2);
  const trustValue = Math.min(1, overlapAmount / orbRadius);

  // Sparks appear when there's significant overlap (>50%)
  const sparkPhase = Math.max(0, (progress - 0.5) / 0.5);

  // Show TRUST text when nearly complete
  const showTrust = progress > 0.85;

  // Calculate scale based on size
  const scale = size / 280;

  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 280 200" width={size} height={size * (200/280)} fill="none">
        <defs>
          {/* Situation orb gradient (cyan) */}
          <radialGradient id="situationGrad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="50%" stopColor={situationColor} />
            <stop offset="100%" stopColor="#0e7490" stopOpacity="0.6" />
          </radialGradient>

          {/* Experience orb gradient (green) */}
          <radialGradient id="experienceGrad" cx="70%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="50%" stopColor={experienceColor} />
            <stop offset="100%" stopColor="#047857" stopOpacity="0.6" />
          </radialGradient>

          {/* Trust overlap glow (amber) */}
          <radialGradient id="trustOverlapGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={trustColor} stopOpacity="0.9" />
            <stop offset="100%" stopColor={trustColor} stopOpacity="0.3" />
          </radialGradient>

          <filter id="storyGlow" x="-50%" y="-50%" width="200%" height="200%">
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

          {/* Clip path for overlap region */}
          <clipPath id="trustOverlapClip">
            <circle cx={orbBX} cy={centerY} r={orbRadius} />
          </clipPath>
        </defs>

        {/* Title */}
        <text
          x="140"
          y="18"
          textAnchor="middle"
          fill={trustColor}
          fontSize="10"
          fontFamily="monospace"
          opacity={mounted ? 0.7 : 0}
          style={{ transition: "opacity 0.5s" }}
        >
          BUILDING TRUST
        </text>

        {/* Orb A - User's Situation */}
        <g
          filter="url(#storyGlow)"
          style={{
            opacity: mounted ? 0.8 : 0,
            transition: "opacity 0.5s",
          }}
        >
          <circle
            cx={orbAX}
            cy={centerY}
            r={orbRadius}
            fill="url(#situationGrad)"
          />
          <circle
            cx={orbAX}
            cy={centerY}
            r={orbRadius}
            fill="none"
            stroke={situationColor}
            strokeWidth="2"
            opacity="0.6"
          />
        </g>

        {/* Orb B - Agent's Experience */}
        <g
          filter="url(#storyGlow)"
          style={{
            opacity: mounted ? 0.8 : 0,
            transition: "opacity 0.5s",
          }}
        >
          <circle
            cx={orbBX}
            cy={centerY}
            r={orbRadius}
            fill="url(#experienceGrad)"
          />
          <circle
            cx={orbBX}
            cy={centerY}
            r={orbRadius}
            fill="none"
            stroke={experienceColor}
            strokeWidth="2"
            opacity="0.6"
          />
        </g>

        {/* Trust overlap region (amber glow) */}
        {overlapAmount > 5 && (
          <g filter="url(#trustIntenseGlow)">
            <circle
              cx={orbAX}
              cy={centerY}
              r={orbRadius}
              fill="url(#trustOverlapGrad)"
              clipPath="url(#trustOverlapClip)"
            />
          </g>
        )}

        {/* Gold spark particles when overlap > 50% */}
        {sparkPhase > 0 && (
          <g
            style={{
              opacity: sparkPhase,
              transform: `translate(140px, ${centerY}px)`,
              transformOrigin: "0 0",
            }}
          >
            {/* Central intense spark */}
            <circle
              cx="0"
              cy="0"
              r={8 + Math.sin(animationTime * 6) * 3}
              fill={sparkColor}
              filter="url(#trustIntenseGlow)"
            />

            {/* Radiating particles */}
            {[...Array(8)].map((_, i) => {
              const angle = (i / 8) * Math.PI * 2 + animationTime * 2;
              const dist = 15 + Math.sin(animationTime * 4 + i) * 5;
              return (
                <circle
                  key={i}
                  cx={Math.cos(angle) * dist}
                  cy={Math.sin(angle) * dist}
                  r="3"
                  fill={sparkColor}
                  opacity={0.6 + Math.sin(animationTime * 5 + i) * 0.3}
                />
              );
            })}
          </g>
        )}

        {/* TRUST text in overlap zone */}
        {showTrust && (
          <text
            x="140"
            y={centerY + 5}
            textAnchor="middle"
            fill="white"
            fontSize="14"
            fontFamily="monospace"
            fontWeight="bold"
            filter="url(#storyGlow)"
            style={{
              opacity: (progress - 0.85) / 0.15,
              transition: "opacity 0.3s",
            }}
          >
            TRUST
          </text>
        )}

        {/* Orb labels */}
        <g
          style={{
            opacity: mounted ? 0.8 : 0,
            transition: "opacity 0.5s",
          }}
        >
          <text
            x={orbAX}
            y={centerY - orbRadius - 12}
            textAnchor="middle"
            fill={situationColor}
            fontSize="8"
            fontFamily="monospace"
          >
            Their Situation
          </text>

          <text
            x={orbBX}
            y={centerY - orbRadius - 12}
            textAnchor="middle"
            fill={experienceColor}
            fontSize="8"
            fontFamily="monospace"
          >
            Your Experience
          </text>
        </g>

        {/* Trust meter */}
        <g
          style={{
            opacity: mounted ? 0.9 : 0,
            transition: "opacity 0.5s",
          }}
        >
          <rect
            x="100"
            y="160"
            width="80"
            height="28"
            rx="4"
            fill={trustColor}
            fillOpacity="0.1"
            stroke={trustColor}
            strokeWidth="1"
          />
          <text x="140" y="172" textAnchor="middle" fill={trustColor} fontSize="7" fontFamily="monospace">
            Trust Level
          </text>
          <text x="140" y="184" textAnchor="middle" fill={trustColor} fontSize="12" fontFamily="monospace" fontWeight="bold">
            {(trustValue * 100).toFixed(0)}%
          </text>
        </g>

        {/* Connection formula */}
        <text
          x="140"
          y="198"
          textAnchor="middle"
          fill={trustColor}
          fontSize="7"
          fontFamily="serif"
          fontStyle="italic"
          opacity={mounted ? 0.5 : 0}
          style={{ transition: "opacity 0.5s" }}
        >
          Situation + Experience = Trust
        </text>

        {/* Status indicator */}
        <text
          x="25"
          y="185"
          fill={progress < 0.3 ? situationColor : progress < 0.7 ? trustColor : sparkColor}
          fontSize="7"
          fontFamily="monospace"
          opacity={mounted ? 0.6 : 0}
          style={{ transition: "opacity 0.5s" }}
        >
          {progress < 0.3
            ? "Strangers..."
            : progress < 0.7
              ? "Connecting..."
              : "TRUSTED!"}
        </text>
      </svg>
    </div>
  );
}
