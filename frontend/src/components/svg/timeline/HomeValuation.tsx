"use client";

import { useState, useEffect } from "react";

/**
 * HomeValuation - First step in selling journey
 *
 * House with price tag, chart showing value analysis.
 * Conveys: "Know your home's worth"
 */

const CONFIG = {
  primaryColor: "#f59e0b", // Amber for selling
  secondaryColor: "#10b981",
  accentColor: "#06b6d4",
};

interface Props {
  className?: string;
  size?: number;
}

export default function HomeValuation({ className = "", size = 200 }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { primaryColor, secondaryColor, accentColor } = CONFIG;

  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        fill="none"
      >
        <defs>
          <linearGradient id="valuationGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>

          <filter id="valuationGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* House */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease-out",
          }}
        >
          {/* House body */}
          <rect
            x="45"
            y="85"
            width="70"
            height="55"
            rx="2"
            fill={primaryColor}
            fillOpacity="0.15"
            stroke={primaryColor}
            strokeWidth="2"
          />

          {/* Roof */}
          <path
            d="M40 85 L80 50 L120 85 Z"
            fill={primaryColor}
            fillOpacity="0.2"
            stroke={primaryColor}
            strokeWidth="2"
          />

          {/* Door */}
          <rect
            x="70"
            y="110"
            width="20"
            height="30"
            rx="2"
            fill={primaryColor}
            fillOpacity="0.4"
          />

          {/* Window */}
          <rect
            x="52"
            y="95"
            width="14"
            height="14"
            rx="1"
            fill={accentColor}
            fillOpacity="0.3"
            stroke={primaryColor}
            strokeWidth="1"
          />
        </g>

        {/* Price tag */}
        <g
          filter="url(#valuationGlow)"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "scale(1) rotate(-15deg)" : "scale(0) rotate(-15deg)",
            transformOrigin: "145px 45px",
            transition: "all 0.5s ease-out 0.3s",
          }}
        >
          <rect
            x="120"
            y="30"
            width="50"
            height="30"
            rx="4"
            fill={secondaryColor}
          />
          <circle
            cx="127"
            cy="45"
            r="4"
            fill="none"
            stroke="white"
            strokeWidth="1.5"
          />
          <text
            x="145"
            y="50"
            textAnchor="middle"
            fill="white"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
          >
            $$$
          </text>
        </g>

        {/* Value chart */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.4s",
          }}
        >
          {/* Chart background */}
          <rect
            x="125"
            y="80"
            width="60"
            height="50"
            rx="4"
            fill={accentColor}
            fillOpacity="0.1"
            stroke={accentColor}
            strokeWidth="1"
          />

          {/* Chart bars */}
          {[
            { x: 135, h: 20 },
            { x: 150, h: 30 },
            { x: 165, h: 38 },
          ].map((bar, i) => (
            <rect
              key={i}
              x={bar.x}
              y={130 - bar.h}
              width="10"
              height={mounted ? bar.h : 0}
              rx="2"
              fill={i === 2 ? secondaryColor : primaryColor}
              fillOpacity={0.6 + i * 0.2}
              style={{
                transition: `height 0.5s ease-out ${0.5 + i * 0.15}s`,
              }}
            />
          ))}

          {/* Trend arrow */}
          <path
            d="M135 115 L165 95 L165 100 L172 93"
            stroke={secondaryColor}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            style={{
              strokeDasharray: 50,
              strokeDashoffset: mounted ? 0 : 50,
              transition: "stroke-dashoffset 0.8s ease-out 0.7s",
            }}
          />
        </g>

        {/* Magnifying glass on house */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translate(0, 0)" : "translate(-10px, -10px)",
            transition: "all 0.5s ease-out 0.2s",
          }}
        >
          <circle
            cx="55"
            cy="65"
            r="18"
            fill={accentColor}
            fillOpacity="0.1"
            stroke={accentColor}
            strokeWidth="2"
          />
          <line
            x1="68"
            y1="78"
            x2="80"
            y2="90"
            stroke={accentColor}
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* $ inside magnifier */}
          <text
            x="55"
            y="70"
            textAnchor="middle"
            fill={primaryColor}
            fontSize="14"
            fontFamily="monospace"
            fontWeight="bold"
          >
            $
          </text>
        </g>

        {/* Sparkles */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.8s",
          }}
        >
          {[
            { x: 30, y: 50 },
            { x: 100, y: 35 },
            { x: 175, y: 65 },
          ].map((s, i) => (
            <g
              key={i}
              style={{
                animationName: "sparkle",
                animationDuration: "1.5s",
                animationIterationCount: "infinite",
                animationDelay: `${i * 0.3}s`,
              }}
            >
              <circle cx={s.x} cy={s.y} r="2" fill={primaryColor} />
            </g>
          ))}
        </g>

        {/* Label */}
        <text
          x="100"
          y="170"
          textAnchor="middle"
          fill={primaryColor}
          fontSize="10"
          fontFamily="monospace"
          fontWeight="bold"
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.9s",
          }}
        >
          HOME VALUATION
        </text>

        <style>{`
          @keyframes sparkle {
            0%, 100% { opacity: 0.4; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.3); }
          }
        `}</style>
      </svg>
    </div>
  );
}
