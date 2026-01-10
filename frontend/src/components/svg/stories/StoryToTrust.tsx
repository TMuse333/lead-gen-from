"use client";

import { useState, useEffect } from "react";

/**
 * StoryToTrust - Book morphing into handshake
 *
 * Visualizes "sharing stories builds trust" through 4 phases:
 * 1. Book icon with sparkles
 * 2. Book opens, pages flutter, particles release
 * 3. Particles coalesce into hands reaching
 * 4. Hands clasp with trust glow
 */

const CONFIG = {
  primaryColor: "#06b6d4",
  secondaryColor: "#10b981",
  accentColor: "#f59e0b",
};

interface Props {
  className?: string;
  progress?: number;
  autoAnimate?: boolean;
  size?: number;
}

export default function StoryToTrust({
  className = "",
  progress: controlledProgress,
  autoAnimate = true,
  size = 200,
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
      const duration = 4000;

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

  const { primaryColor, secondaryColor, accentColor } = CONFIG;

  // Phase calculations
  const phase1 = Math.min(1, progress / 0.25); // 0-0.25
  const phase2 = Math.max(0, Math.min(1, (progress - 0.25) / 0.25)); // 0.25-0.5
  const phase3 = Math.max(0, Math.min(1, (progress - 0.5) / 0.25)); // 0.5-0.75
  const phase4 = Math.max(0, Math.min(1, (progress - 0.75) / 0.25)); // 0.75-1

  // Particle positions for phase 2-3 transition
  const particles = [...Array(12)].map((_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    const baseRadius = 20 + (i % 3) * 10;

    // Phase 2: particles rise up from book
    const phase2Y = 100 - phase2 * 40 - Math.sin(angle) * baseRadius * phase2;
    const phase2X = 100 + Math.cos(angle) * baseRadius * phase2 * 0.5;

    // Phase 3: particles converge toward center/hands
    const targetX = i < 6 ? 70 : 130; // Left or right hand
    const targetY = 90;
    const phase3X = phase2X + (targetX - phase2X) * phase3;
    const phase3Y = phase2Y + (targetY - phase2Y) * phase3;

    return { x: phase3X, y: phase3Y, delay: i * 0.1 };
  });

  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 200 200" width={size} height={size} fill="none">
        <defs>
          <filter id="storyTrustGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="handshakeGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <linearGradient id="bookGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>
        </defs>

        {/* Phase 1-2: Book */}
        <g
          style={{
            opacity: mounted ? Math.max(0, 1 - phase3) : 0,
            transform: `scale(${1 - phase2 * 0.2})`,
            transformOrigin: "100px 100px",
            transition: "opacity 0.3s",
          }}
        >
          {/* Book base */}
          <rect
            x="70"
            y="80"
            width="60"
            height="45"
            rx="3"
            fill={primaryColor}
            fillOpacity="0.2"
            stroke={primaryColor}
            strokeWidth="2"
            filter="url(#storyTrustGlow)"
          />

          {/* Book spine */}
          <rect
            x="70"
            y="80"
            width="8"
            height="45"
            rx="2"
            fill={primaryColor}
            fillOpacity="0.4"
          />

          {/* Book cover opening in phase 2 */}
          <rect
            x="78"
            y="80"
            width="52"
            height="45"
            rx="2"
            fill={primaryColor}
            fillOpacity="0.15"
            style={{
              transform: `rotateY(${phase2 * 60}deg)`,
              transformOrigin: "78px 102px",
            }}
          />

          {/* Page lines */}
          {[0, 1, 2].map((i) => (
            <line
              key={i}
              x1="85"
              y1={92 + i * 10}
              x2="120"
              y2={92 + i * 10}
              stroke={primaryColor}
              strokeWidth="1"
              strokeOpacity={0.4 - phase2 * 0.3}
            />
          ))}

          {/* Phase 1 sparkles */}
          {phase1 > 0 && phase2 < 0.5 && (
            <g>
              {[
                { x: 140, y: 75 },
                { x: 55, y: 90 },
                { x: 145, y: 110 },
              ].map((s, i) => (
                <circle
                  key={i}
                  cx={s.x}
                  cy={s.y}
                  r={2 + Math.sin(animationTime * 4 + i) * 1}
                  fill={accentColor}
                  opacity={0.5 + Math.sin(animationTime * 3 + i * 2) * 0.3}
                />
              ))}
            </g>
          )}

          {/* "Story" label */}
          <text
            x="100"
            y="145"
            textAnchor="middle"
            fill={primaryColor}
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
            opacity={1 - phase2}
          >
            STORY
          </text>
        </g>

        {/* Phase 2-3: Floating particles */}
        {phase2 > 0 && phase4 < 1 && (
          <g>
            {particles.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={3 + Math.sin(animationTime * 5 + i) * 1}
                fill={i % 2 === 0 ? primaryColor : secondaryColor}
                opacity={Math.min(phase2, 1 - phase4 * 0.8) * 0.8}
                filter="url(#storyTrustGlow)"
              />
            ))}
          </g>
        )}

        {/* Phase 3-4: Hands forming and clasping */}
        <g
          style={{
            opacity: phase3,
            transition: "opacity 0.3s",
          }}
        >
          {/* Left hand */}
          <g
            style={{
              transform: `translateX(${(1 - phase4) * -20}px)`,
              transition: "transform 0.3s",
            }}
          >
            <path
              d="M55 85 Q65 75 75 85 Q80 95 75 105 Q70 115 60 110 Q50 105 55 85"
              fill={primaryColor}
              fillOpacity="0.6"
              stroke={primaryColor}
              strokeWidth="2"
              filter="url(#storyTrustGlow)"
            />
            {/* Fingers */}
            <path
              d="M75 90 L85 88 M75 95 L88 94 M75 100 L85 100"
              stroke={primaryColor}
              strokeWidth="3"
              strokeLinecap="round"
            />
          </g>

          {/* Right hand */}
          <g
            style={{
              transform: `translateX(${(1 - phase4) * 20}px)`,
              transition: "transform 0.3s",
            }}
          >
            <path
              d="M145 85 Q135 75 125 85 Q120 95 125 105 Q130 115 140 110 Q150 105 145 85"
              fill={secondaryColor}
              fillOpacity="0.6"
              stroke={secondaryColor}
              strokeWidth="2"
              filter="url(#storyTrustGlow)"
            />
            {/* Fingers */}
            <path
              d="M125 90 L115 88 M125 95 L112 94 M125 100 L115 100"
              stroke={secondaryColor}
              strokeWidth="3"
              strokeLinecap="round"
            />
          </g>
        </g>

        {/* Phase 4: Connection glow and TRUST label */}
        {phase4 > 0 && (
          <g>
            {/* Central connection glow */}
            <ellipse
              cx="100"
              cy="95"
              rx={25 * phase4}
              ry={20 * phase4}
              fill={accentColor}
              fillOpacity={0.3 * phase4}
              filter="url(#handshakeGlow)"
            />

            {/* Spark particles */}
            {[...Array(6)].map((_, i) => {
              const angle = (i / 6) * Math.PI * 2 + animationTime * 3;
              const dist = 15 + Math.sin(animationTime * 4 + i) * 5;
              return (
                <circle
                  key={i}
                  cx={100 + Math.cos(angle) * dist * phase4}
                  cy={95 + Math.sin(angle) * dist * phase4 * 0.6}
                  r="2"
                  fill={accentColor}
                  opacity={phase4 * 0.7}
                />
              );
            })}

            {/* TRUST label */}
            <text
              x="100"
              y="145"
              textAnchor="middle"
              fill={accentColor}
              fontSize="12"
              fontFamily="monospace"
              fontWeight="bold"
              opacity={phase4}
              filter="url(#storyTrustGlow)"
            >
              TRUST
            </text>
          </g>
        )}

        {/* Title */}
        <text
          x="100"
          y="25"
          textAnchor="middle"
          fill={progress < 0.5 ? primaryColor : accentColor}
          fontSize="9"
          fontFamily="monospace"
          opacity={mounted ? 0.7 : 0}
          style={{ transition: "opacity 0.5s, fill 0.5s" }}
        >
          {progress < 0.5 ? "SHARING STORIES" : "BUILDING TRUST"}
        </text>

        {/* Progress indicator */}
        <g opacity={mounted ? 0.6 : 0} style={{ transition: "opacity 0.5s" }}>
          <rect x="60" y="175" width="80" height="4" rx="2" fill={primaryColor} fillOpacity="0.2" />
          <rect
            x="60"
            y="175"
            width={80 * progress}
            height="4"
            rx="2"
            fill={progress < 0.5 ? primaryColor : accentColor}
          />
        </g>
      </svg>
    </div>
  );
}
