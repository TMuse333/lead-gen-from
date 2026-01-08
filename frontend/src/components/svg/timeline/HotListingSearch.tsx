"use client";

import { useState, useEffect } from "react";

const CONFIG = {
  primaryColor: "#06b6d4",
  secondaryColor: "#10b981",
  accentColor: "#f97316", // orange for flame
};

export default function HotListingSearch() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { primaryColor, secondaryColor, accentColor } = CONFIG;

  return (
    <div className="relative">
      <svg viewBox="0 0 200 220" width="200" height="220" fill="none">
        <defs>
          <linearGradient id="searchGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>
          <linearGradient id="flameGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={accentColor} />
            <stop offset="100%" stopColor={primaryColor} />
          </linearGradient>
          <filter id="searchGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Document/Listing card */}
        <g
          filter="url(#searchGlow)"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(10px)",
            transition: "all 0.6s ease-out 0.2s",
          }}
        >
          <rect
            x="50"
            y="60"
            width="100"
            height="130"
            rx="8"
            fill={primaryColor}
            fillOpacity="0.1"
            stroke={primaryColor}
            strokeWidth="2"
          />
          {/* Document lines */}
          <line x1="65" y1="100" x2="135" y2="100" stroke={primaryColor} strokeWidth="1.5" opacity="0.5" />
          <line x1="65" y1="115" x2="125" y2="115" stroke={primaryColor} strokeWidth="1.5" opacity="0.5" />
          <line x1="65" y1="130" x2="130" y2="130" stroke={primaryColor} strokeWidth="1.5" opacity="0.5" />
          <line x1="65" y1="145" x2="110" y2="145" stroke={primaryColor} strokeWidth="1.5" opacity="0.5" />
          <line x1="65" y1="160" x2="120" y2="160" stroke={primaryColor} strokeWidth="1.5" opacity="0.5" />

          {/* Connection dots at bottom */}
          <circle cx="85" cy="200" r="4" fill={primaryColor} />
          <circle cx="100" cy="210" r="4" fill={secondaryColor} />
          <circle cx="115" cy="200" r="4" fill={primaryColor} />
          <line x1="100" y1="190" x2="85" y2="200" stroke={primaryColor} strokeWidth="1" />
          <line x1="100" y1="190" x2="100" y2="210" stroke={secondaryColor} strokeWidth="1" />
          <line x1="100" y1="190" x2="115" y2="200" stroke={primaryColor} strokeWidth="1" />
        </g>

        {/* Flame icon at top */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "scale(1)" : "scale(0.8)",
            transformOrigin: "100px 35px",
            transition: "all 0.5s ease-out 0.6s",
          }}
        >
          <path
            d="M100 15 Q110 25, 108 35 Q115 28, 118 38 Q122 50, 110 55 Q115 50, 112 45 Q108 55, 100 55 Q92 55, 88 45 Q85 50, 90 55 Q78 50, 82 38 Q85 28, 92 35 Q90 25, 100 15 Z"
            fill="url(#flameGradient)"
            fillOpacity="0.6"
            stroke={accentColor}
            strokeWidth="1.5"
            style={{
              animation: mounted ? "flicker 1.5s ease-in-out infinite" : "none",
            }}
          />
        </g>

        {/* Magnifying glass */}
        <g
          filter="url(#searchGlow)"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "rotate(0deg)" : "rotate(-15deg)",
            transformOrigin: "100px 110px",
            transition: "all 0.7s ease-out 0.4s",
          }}
        >
          <circle
            cx="90"
            cy="95"
            r="25"
            fill={secondaryColor}
            fillOpacity="0.1"
            stroke="url(#searchGradient)"
            strokeWidth="3"
          />
          {/* Glass shine */}
          <path
            d="M75 85 Q80 78, 90 80"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.3"
          />
          {/* Handle */}
          <line
            x1="108"
            y1="113"
            x2="130"
            y2="135"
            stroke="url(#searchGradient)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Small house inside magnifier */}
          <path d="M90 85 L80 92 L80 102 L100 102 L100 92 Z" fill={primaryColor} fillOpacity="0.3" stroke={primaryColor} strokeWidth="1" />
        </g>

        <style>{`
          @keyframes flicker {
            0%, 100% { opacity: 0.6; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.05); }
          }
        `}</style>
      </svg>
    </div>
  );
}
