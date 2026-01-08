"use client";

import { useState, useEffect } from "react";

const CONFIG = {
  primaryColor: "#06b6d4",
  secondaryColor: "#10b981",
};

export default function KeyHandoff() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { primaryColor, secondaryColor } = CONFIG;

  return (
    <div className="relative">
      <svg viewBox="0 0 300 250" width="300" height="250" fill="none">
        <defs>
          <linearGradient id="keyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>
          <filter id="keyGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Hand */}
        <g
          filter="url(#keyGlow)"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateX(0)" : "translateX(20px)",
            transition: "all 0.8s ease-out 0.2s",
          }}
        >
          {/* Palm */}
          <path
            d="M220 80 Q240 85, 250 100 Q260 120, 255 140 Q250 155, 235 160 L200 165 Q185 160, 180 145 L175 110 Q175 90, 195 80 Z"
            fill={primaryColor}
            fillOpacity="0.15"
            stroke={primaryColor}
            strokeWidth="2"
          />
          {/* Fingers */}
          <path d="M200 80 Q205 60, 210 50 Q215 45, 220 50 Q225 60, 222 80" stroke={primaryColor} strokeWidth="2" fill={primaryColor} fillOpacity="0.1" />
          <path d="M215 75 Q220 55, 228 45 Q235 40, 240 48 Q245 60, 240 78" stroke={primaryColor} strokeWidth="2" fill={primaryColor} fillOpacity="0.1" />
          <path d="M232 80 Q238 62, 248 55 Q255 52, 258 60 Q260 72, 252 85" stroke={primaryColor} strokeWidth="2" fill={primaryColor} fillOpacity="0.1" />
          {/* Thumb */}
          <path d="M175 105 Q160 100, 150 105 Q145 112, 150 120 Q158 128, 175 125" stroke={primaryColor} strokeWidth="2" fill={primaryColor} fillOpacity="0.1" />
        </g>

        {/* Key */}
        <g
          filter="url(#keyGlow)"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "rotate(0deg)" : "rotate(-10deg)",
            transformOrigin: "150px 120px",
            transition: "all 0.6s ease-out 0.5s",
          }}
        >
          {/* Key head - heart shape */}
          <path
            d="M90 100 Q90 80, 110 80 Q125 80, 125 95 Q125 80, 140 80 Q160 80, 160 100 Q160 120, 125 145 Q90 120, 90 100 Z"
            fill={secondaryColor}
            fillOpacity="0.2"
            stroke="url(#keyGradient)"
            strokeWidth="2.5"
          />
          {/* Key shaft */}
          <line x1="125" y1="145" x2="125" y2="210" stroke="url(#keyGradient)" strokeWidth="3" />
          {/* Key teeth */}
          <path d="M125 180 L140 180 L140 188 L125 188" stroke={primaryColor} strokeWidth="2" fill={primaryColor} fillOpacity="0.2" />
          <path d="M125 195 L135 195 L135 203 L125 203" stroke={primaryColor} strokeWidth="2" fill={primaryColor} fillOpacity="0.2" />
        </g>

        {/* House keychain */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(-10px)",
            transition: "all 0.5s ease-out 0.8s",
          }}
        >
          {/* Ring */}
          <circle cx="125" cy="75" r="12" stroke={primaryColor} strokeWidth="2" fill="none" />
          {/* Mini house */}
          <g transform="translate(105, 35)">
            <path d="M20 15 L5 25 L5 40 L35 40 L35 25 Z" fill={secondaryColor} fillOpacity="0.2" stroke={secondaryColor} strokeWidth="1.5" />
            <rect x="15" y="30" width="10" height="10" fill={primaryColor} fillOpacity="0.3" stroke={primaryColor} strokeWidth="1" />
          </g>
        </g>

        {/* Subtle sparkle */}
        <circle
          cx="170"
          cy="60"
          r="2"
          fill={primaryColor}
          style={{
            animation: mounted ? "pulse 2s ease-in-out infinite" : "none",
          }}
        />

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
          }
        `}</style>
      </svg>
    </div>
  );
}
