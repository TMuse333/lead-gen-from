"use client";

import { useState, useEffect } from "react";

/**
 * PreApprovalSuccess - Financial preparation phase
 *
 * Calculator/clipboard with checkmark, credit score gauge,
 * and approval visual. Conveys: "You're financially ready!"
 */

const CONFIG = {
  primaryColor: "#06b6d4",
  secondaryColor: "#10b981",
  accentColor: "#fbbf24",
};

interface Props {
  className?: string;
  size?: number;
}

export default function PreApprovalSuccess({ className = "", size = 200 }: Props) {
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
          <linearGradient id="preApprovalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>

          <filter id="preApprovalGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Clipboard base */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(10px)",
            transition: "all 0.5s ease-out",
          }}
        >
          {/* Clipboard body */}
          <rect
            x="45"
            y="40"
            width="110"
            height="140"
            rx="8"
            fill={primaryColor}
            fillOpacity="0.1"
            stroke={primaryColor}
            strokeWidth="2"
          />

          {/* Clipboard clip */}
          <rect
            x="75"
            y="32"
            width="50"
            height="16"
            rx="4"
            fill={primaryColor}
          />
          <circle cx="100" cy="40" r="4" fill="white" />
        </g>

        {/* Credit score gauge */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "scale(1)" : "scale(0.8)",
            transformOrigin: "100px 95px",
            transition: "all 0.6s ease-out 0.2s",
          }}
        >
          {/* Gauge background arc */}
          <path
            d="M60 110 A45 45 0 0 1 140 110"
            fill="none"
            stroke={primaryColor}
            strokeWidth="8"
            strokeOpacity="0.2"
            strokeLinecap="round"
          />

          {/* Gauge filled arc (excellent score) */}
          <path
            d="M60 110 A45 45 0 0 1 130 75"
            fill="none"
            stroke="url(#preApprovalGrad)"
            strokeWidth="8"
            strokeLinecap="round"
            filter="url(#preApprovalGlow)"
            style={{
              strokeDasharray: mounted ? "120" : "0",
              strokeDashoffset: "0",
              transition: "stroke-dasharray 1s ease-out 0.4s",
            }}
          />

          {/* Score value */}
          <text
            x="100"
            y="100"
            textAnchor="middle"
            fill={secondaryColor}
            fontSize="18"
            fontFamily="monospace"
            fontWeight="bold"
            style={{
              opacity: mounted ? 1 : 0,
              transition: "opacity 0.5s ease-out 0.8s",
            }}
          >
            780
          </text>
          <text
            x="100"
            y="115"
            textAnchor="middle"
            fill={primaryColor}
            fontSize="8"
            fontFamily="monospace"
          >
            EXCELLENT
          </text>
        </g>

        {/* Dollar sign */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateX(0)" : "translateX(-10px)",
            transition: "all 0.5s ease-out 0.3s",
          }}
        >
          <circle cx="65" cy="145" r="15" fill={accentColor} fillOpacity="0.2" stroke={accentColor} strokeWidth="1.5" />
          <text
            x="65"
            y="151"
            textAnchor="middle"
            fill={accentColor}
            fontSize="16"
            fontWeight="bold"
          >
            $
          </text>
        </g>

        {/* Checkmark badge */}
        <g
          filter="url(#preApprovalGlow)"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "scale(1)" : "scale(0)",
            transformOrigin: "135px 145px",
            transition: "all 0.4s ease-out 0.6s",
          }}
        >
          <circle cx="135" cy="145" r="18" fill={secondaryColor} />
          <path
            d="M126 145 L132 151 L145 138"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>

        {/* Sparkle accents */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.8s",
          }}
        >
          {[
            { x: 155, y: 55, size: 4 },
            { x: 50, y: 70, size: 3 },
            { x: 160, y: 120, size: 3 },
          ].map((sparkle, i) => (
            <g key={i}>
              <line
                x1={sparkle.x - sparkle.size}
                y1={sparkle.y}
                x2={sparkle.x + sparkle.size}
                y2={sparkle.y}
                stroke={accentColor}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <line
                x1={sparkle.x}
                y1={sparkle.y - sparkle.size}
                x2={sparkle.x}
                y2={sparkle.y + sparkle.size}
                stroke={accentColor}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </g>
          ))}
        </g>

        <style>{`
          @keyframes twinkle {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
          }
        `}</style>
      </svg>
    </div>
  );
}
