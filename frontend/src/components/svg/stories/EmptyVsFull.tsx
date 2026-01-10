"use client";

import { useState, useEffect } from "react";

/**
 * EmptyVsFull - Split-screen comparison
 *
 * Shows a timeline phase WITHOUT a story vs WITH a story:
 * - Left: Cold, uninviting (gray, dashed, faded)
 * - Right: Warm, trustworthy (gradient, glowing, sparkles)
 * - Center: Animated arrow
 */

const CONFIG = {
  primaryColor: "#06b6d4",
  secondaryColor: "#10b981",
  accentColor: "#f59e0b",
  emptyColor: "#64748b",
};

interface Props {
  className?: string;
  showComparison?: boolean;
}

export default function EmptyVsFull({
  className = "",
  showComparison = true,
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

  const { primaryColor, secondaryColor, accentColor, emptyColor } = CONFIG;

  // Arrow bounce animation
  const arrowBounce = Math.sin(animationTime * 3) * 5;

  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 350 180" width="350" height="180" fill="none">
        <defs>
          <filter id="emptyFullGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="warmGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <linearGradient id="warmBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>

          <linearGradient id="arrowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={emptyColor} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>
        </defs>

        {/* Title */}
        <text
          x="175"
          y="20"
          textAnchor="middle"
          fill={secondaryColor}
          fontSize="10"
          fontFamily="monospace"
          opacity={mounted ? 0.8 : 0}
          style={{ transition: "opacity 0.5s" }}
        >
          THE DIFFERENCE A STORY MAKES
        </text>

        {/* Left card: Without Story */}
        {showComparison && (
          <g
            style={{
              opacity: mounted ? 0.6 : 0,
              transition: "opacity 0.5s",
            }}
          >
            {/* Card background */}
            <rect
              x="25"
              y="40"
              width="120"
              height="100"
              rx="8"
              fill={emptyColor}
              fillOpacity="0.05"
              stroke={emptyColor}
              strokeWidth="2"
              strokeDasharray="6 4"
            />

            {/* Question mark icon */}
            <text
              x="85"
              y="85"
              textAnchor="middle"
              fill={emptyColor}
              fontSize="32"
              fontFamily="serif"
              opacity="0.5"
            >
              ?
            </text>

            {/* Empty state indicator */}
            <g opacity="0.4">
              <line x1="55" y1="105" x2="115" y2="105" stroke={emptyColor} strokeWidth="2" />
              <line x1="65" y1="115" x2="105" y2="115" stroke={emptyColor} strokeWidth="2" />
            </g>

            {/* Label */}
            <text
              x="85"
              y="155"
              textAnchor="middle"
              fill={emptyColor}
              fontSize="9"
              fontFamily="monospace"
            >
              No Story
            </text>
          </g>
        )}

        {/* Center arrow */}
        {showComparison && (
          <g
            style={{
              opacity: mounted ? 1 : 0,
              transform: `translateX(${arrowBounce}px)`,
              transition: "opacity 0.5s",
            }}
          >
            <path
              d="M155 90 L185 90 L185 82 L200 90 L185 98 L185 90"
              fill="url(#arrowGrad)"
              filter="url(#emptyFullGlow)"
            />
          </g>
        )}

        {/* Right card: With Story */}
        <g
          filter="url(#warmGlow)"
          style={{
            opacity: mounted ? 1 : 0,
            transform: showComparison ? "translateX(0)" : "translateX(-80px)",
            transition: "opacity 0.5s 0.2s, transform 0.5s",
          }}
        >
          {/* Card background with gradient border */}
          <rect
            x="205"
            y="40"
            width="120"
            height="100"
            rx="8"
            fill={secondaryColor}
            fillOpacity="0.1"
          />
          <rect
            x="205"
            y="40"
            width="120"
            height="100"
            rx="8"
            fill="none"
            stroke="url(#warmBorderGrad)"
            strokeWidth="2"
          />

          {/* Ambient glow pulse */}
          <rect
            x="210"
            y="45"
            width="110"
            height="90"
            rx="6"
            fill={secondaryColor}
            fillOpacity={0.05 + Math.sin(animationTime * 2) * 0.03}
          />

          {/* Book icon with sparkle */}
          <g transform="translate(250, 60)">
            <rect
              x="0"
              y="0"
              width="30"
              height="24"
              rx="3"
              fill={primaryColor}
              fillOpacity="0.8"
            />
            <rect
              x="4"
              y="4"
              width="22"
              height="16"
              rx="2"
              fill="white"
              fillOpacity="0.3"
            />
            <line x1="15" y1="4" x2="15" y2="20" stroke="white" strokeWidth="1" strokeOpacity="0.4" />

            {/* Sparkle */}
            <g
              style={{
                opacity: 0.6 + Math.sin(animationTime * 4) * 0.4,
              }}
            >
              <circle cx="35" cy="-5" r="3" fill={accentColor} />
              <line x1="35" y1="-10" x2="35" y2="0" stroke={accentColor} strokeWidth="1" />
              <line x1="30" y1="-5" x2="40" y2="-5" stroke={accentColor} strokeWidth="1" />
            </g>
          </g>

          {/* Star ratings */}
          <g transform="translate(240, 95)">
            {[0, 1, 2].map((i) => (
              <text
                key={i}
                x={i * 15}
                y="0"
                fill={accentColor}
                fontSize="12"
                style={{
                  opacity: 0.7 + Math.sin(animationTime * 3 + i * 0.5) * 0.3,
                }}
              >
                ★
              </text>
            ))}
          </g>

          {/* Content lines */}
          <g opacity="0.6">
            <line x1="225" y1="118" x2="305" y2="118" stroke={secondaryColor} strokeWidth="2" />
            <line x1="235" y1="128" x2="295" y2="128" stroke={secondaryColor} strokeWidth="2" />
          </g>

          {/* Label */}
          <text
            x="265"
            y="155"
            textAnchor="middle"
            fill={secondaryColor}
            fontSize="9"
            fontFamily="monospace"
            fontWeight="bold"
          >
            With Story
          </text>
        </g>

        {/* Bottom text */}
        <text
          x="175"
          y="172"
          textAnchor="middle"
          fill={secondaryColor}
          fontSize="8"
          fontFamily="monospace"
          fontStyle="italic"
          opacity={mounted ? 0.6 : 0}
          style={{ transition: "opacity 0.5s 0.4s" }}
        >
          Stories create connection and credibility
        </text>
      </svg>
    </div>
  );
}
