"use client";

import { useState, useEffect } from "react";

/**
 * AgentPartnership - Finding an agent phase
 *
 * Two figures connecting/shaking hands, one with house badge.
 * Conveys: "Expert guidance"
 */

const CONFIG = {
  primaryColor: "#06b6d4",
  secondaryColor: "#10b981",
  accentColor: "#8b5cf6",
};

interface Props {
  className?: string;
  size?: number;
}

export default function AgentPartnership({ className = "", size = 200 }: Props) {
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
          <linearGradient id="agentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>

          <filter id="agentGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Left person (buyer) */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateX(0)" : "translateX(-15px)",
            transition: "all 0.5s ease-out",
          }}
        >
          {/* Head */}
          <circle cx="65" cy="65" r="18" fill={primaryColor} fillOpacity="0.2" stroke={primaryColor} strokeWidth="2" />

          {/* Body */}
          <path
            d="M40 130 Q40 95 65 95 Q90 95 90 130"
            fill={primaryColor}
            fillOpacity="0.15"
            stroke={primaryColor}
            strokeWidth="2"
          />

          {/* Arm reaching out */}
          <path
            d="M85 105 Q100 100 105 95"
            stroke={primaryColor}
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* Right person (agent) */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateX(0)" : "translateX(15px)",
            transition: "all 0.5s ease-out 0.1s",
          }}
        >
          {/* Head */}
          <circle cx="135" cy="65" r="18" fill={secondaryColor} fillOpacity="0.2" stroke={secondaryColor} strokeWidth="2" />

          {/* Body */}
          <path
            d="M110 130 Q110 95 135 95 Q160 95 160 130"
            fill={secondaryColor}
            fillOpacity="0.15"
            stroke={secondaryColor}
            strokeWidth="2"
          />

          {/* Arm reaching out */}
          <path
            d="M115 105 Q100 100 95 95"
            stroke={secondaryColor}
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />

          {/* House badge on agent */}
          <g filter="url(#agentGlow)">
            <circle cx="155" cy="55" r="12" fill={accentColor} />
            <path
              d="M150 57 L155 52 L160 57 L160 62 L150 62 Z"
              fill="white"
            />
          </g>
        </g>

        {/* Handshake in center */}
        <g
          filter="url(#agentGlow)"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "scale(1)" : "scale(0.5)",
            transformOrigin: "100px 95px",
            transition: "all 0.5s ease-out 0.3s",
          }}
        >
          {/* Clasped hands */}
          <ellipse cx="100" cy="95" rx="12" ry="8" fill="url(#agentGrad)" />

          {/* Connection glow */}
          <circle cx="100" cy="95" r="18" fill={primaryColor} fillOpacity="0.1" />
        </g>

        {/* Connection lines */}
        <g
          style={{
            opacity: mounted ? 0.5 : 0,
            transition: "opacity 0.5s ease-out 0.5s",
          }}
        >
          <path
            d="M75 85 Q100 75 125 85"
            stroke="url(#agentGrad)"
            strokeWidth="1"
            strokeDasharray="4 4"
            fill="none"
          />
        </g>

        {/* Trust indicators */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.6s",
          }}
        >
          {/* Stars/trust symbols */}
          {[
            { x: 100, y: 55 },
            { x: 85, y: 65 },
            { x: 115, y: 65 },
          ].map((star, i) => (
            <circle
              key={i}
              cx={star.x}
              cy={star.y}
              r="3"
              fill={accentColor}
              style={{
                animationName: "pulse",
                animationDuration: "2s",
                animationIterationCount: "infinite",
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </g>

        {/* Bottom text area */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.4s",
          }}
        >
          <rect
            x="55"
            y="145"
            width="90"
            height="30"
            rx="6"
            fill={secondaryColor}
            fillOpacity="0.1"
            stroke={secondaryColor}
            strokeWidth="1"
          />
          <text
            x="100"
            y="164"
            textAnchor="middle"
            fill={secondaryColor}
            fontSize="10"
            fontFamily="monospace"
          >
            PARTNERSHIP
          </text>
        </g>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.4; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.2); }
          }
        `}</style>
      </svg>
    </div>
  );
}
