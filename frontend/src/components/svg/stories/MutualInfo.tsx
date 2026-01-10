"use client";

import { useState, useEffect } from "react";

/**
 * MutualInfo - Mutual Information "Overlap" visualization
 *
 * Two orbs representing variables merge together,
 * their overlap represents mutual information.
 * Shows how much one variable tells about another.
 */

const CONFIG = {
  orbAColor: "#8b5cf6", // Purple for "Ad Content"
  orbBColor: "#06b6d4", // Cyan for "User Behavior"
  overlapColor: "#10b981", // Green for mutual information
  sparkColor: "#fbbf24", // Gold spark
};

interface Props {
  className?: string;
  progress?: number;
  autoAnimate?: boolean;
}

export default function MutualInfo({
  className = "",
  progress: controlledProgress,
  autoAnimate = true,
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

  const { orbAColor, orbBColor, overlapColor, sparkColor } = CONFIG;

  const centerY = 95;
  const orbRadius = 50;

  // Orbs move toward each other
  const separation = 120 - progress * 70; // Start 120 apart, end 50 apart
  const orbAX = 140 - separation / 2;
  const orbBX = 140 + separation / 2;

  // Overlap amount increases with proximity
  const overlapAmount = Math.max(0, (orbRadius * 2 - separation) / 2);
  const mutualInfoValue = Math.min(1, overlapAmount / orbRadius);

  // Sparks appear when there's significant overlap
  const sparkPhase = Math.max(0, (progress - 0.5) / 0.5);

  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 280 200" width="280" height="200" fill="none">
        <defs>
          {/* Orb A gradient */}
          <radialGradient id="orbAGrad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#c4b5fd" />
            <stop offset="50%" stopColor={orbAColor} />
            <stop offset="100%" stopColor="#5b21b6" stopOpacity="0.6" />
          </radialGradient>

          {/* Orb B gradient */}
          <radialGradient id="orbBGrad" cx="70%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="50%" stopColor={orbBColor} />
            <stop offset="100%" stopColor="#0e7490" stopOpacity="0.6" />
          </radialGradient>

          {/* Overlap glow */}
          <radialGradient id="overlapGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={overlapColor} stopOpacity="0.9" />
            <stop offset="100%" stopColor={overlapColor} stopOpacity="0.3" />
          </radialGradient>

          <filter id="mutualGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="intenseGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Clip path for overlap region */}
          <clipPath id="overlapClip">
            <circle cx={orbBX} cy={centerY} r={orbRadius} />
          </clipPath>
        </defs>

        {/* Title */}
        <text
          x="140"
          y="18"
          textAnchor="middle"
          fill={overlapColor}
          fontSize="10"
          fontFamily="monospace"
          opacity={mounted ? 0.7 : 0}
        >
          MUTUAL INFORMATION
        </text>

        {/* Orb A - Ad Content */}
        <g
          filter="url(#mutualGlow)"
          style={{
            opacity: mounted ? 0.8 : 0,
            transition: "opacity 0.5s",
          }}
        >
          <circle
            cx={orbAX}
            cy={centerY}
            r={orbRadius}
            fill="url(#orbAGrad)"
          />
          <circle
            cx={orbAX}
            cy={centerY}
            r={orbRadius}
            fill="none"
            stroke={orbAColor}
            strokeWidth="2"
            opacity="0.6"
          />
        </g>

        {/* Orb B - User Behavior */}
        <g
          filter="url(#mutualGlow)"
          style={{
            opacity: mounted ? 0.8 : 0,
            transition: "opacity 0.5s",
          }}
        >
          <circle
            cx={orbBX}
            cy={centerY}
            r={orbRadius}
            fill="url(#orbBGrad)"
          />
          <circle
            cx={orbBX}
            cy={centerY}
            r={orbRadius}
            fill="none"
            stroke={orbBColor}
            strokeWidth="2"
            opacity="0.6"
          />
        </g>

        {/* Overlap region */}
        {overlapAmount > 5 && (
          <g filter="url(#intenseGlow)">
            <circle
              cx={orbAX}
              cy={centerY}
              r={orbRadius}
              fill="url(#overlapGrad)"
              clipPath="url(#overlapClip)"
            />
          </g>
        )}

        {/* Mutual Information spark */}
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
              filter="url(#intenseGlow)"
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

        {/* Orb labels */}
        <g
          style={{
            opacity: mounted ? 0.8 : 0,
            transition: "opacity 0.5s",
          }}
        >
          <text
            x={orbAX}
            y={centerY - orbRadius - 10}
            textAnchor="middle"
            fill={orbAColor}
            fontSize="9"
            fontFamily="monospace"
          >
            H(X)
          </text>
          <text
            x={orbAX}
            y={centerY - orbRadius - 22}
            textAnchor="middle"
            fill={orbAColor}
            fontSize="7"
            fontFamily="monospace"
            opacity="0.6"
          >
            Ad Content
          </text>

          <text
            x={orbBX}
            y={centerY - orbRadius - 10}
            textAnchor="middle"
            fill={orbBColor}
            fontSize="9"
            fontFamily="monospace"
          >
            H(Y)
          </text>
          <text
            x={orbBX}
            y={centerY - orbRadius - 22}
            textAnchor="middle"
            fill={orbBColor}
            fontSize="7"
            fontFamily="monospace"
            opacity="0.6"
          >
            User Behavior
          </text>
        </g>

        {/* Mutual Information indicator */}
        {overlapAmount > 5 && (
          <g
            style={{
              opacity: mutualInfoValue,
              transition: "opacity 0.3s",
            }}
          >
            <text
              x="140"
              y={centerY + 8}
              textAnchor="middle"
              fill={overlapColor}
              fontSize="11"
              fontFamily="monospace"
              fontWeight="bold"
              filter="url(#mutualGlow)"
            >
              I(X;Y)
            </text>
          </g>
        )}

        {/* Value display */}
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
            fill={overlapColor}
            fillOpacity="0.1"
            stroke={overlapColor}
            strokeWidth="1"
          />
          <text x="140" y="172" textAnchor="middle" fill={overlapColor} fontSize="7" fontFamily="monospace">
            Mutual Info
          </text>
          <text x="140" y="184" textAnchor="middle" fill={overlapColor} fontSize="12" fontFamily="monospace" fontWeight="bold">
            {(mutualInfoValue * 100).toFixed(0)}%
          </text>
        </g>

        {/* Formula */}
        <text
          x="140"
          y="198"
          textAnchor="middle"
          fill={overlapColor}
          fontSize="7"
          fontFamily="serif"
          fontStyle="italic"
          opacity={mounted ? 0.5 : 0}
        >
          I(X;Y) = H(X) + H(Y) - H(X,Y)
        </text>

        {/* Status */}
        <text
          x="25"
          y="185"
          fill={progress < 0.3 ? orbAColor : progress < 0.7 ? overlapColor : sparkColor}
          fontSize="7"
          fontFamily="monospace"
          opacity={mounted ? 0.6 : 0}
        >
          {progress < 0.3
            ? "Independent..."
            : progress < 0.7
              ? "Correlating..."
              : "CERTAINTY!"}
        </text>
      </svg>
    </div>
  );
}
