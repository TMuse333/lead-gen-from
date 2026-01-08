"use client";

import { useState, useEffect } from "react";

/**
 * ListingLive - Home goes on market
 *
 * For sale sign with house, "LIVE" indicator, broadcast waves.
 * Conveys: "Your home is now visible to buyers"
 */

const CONFIG = {
  primaryColor: "#f59e0b",
  secondaryColor: "#10b981",
  accentColor: "#ef4444",
};

interface Props {
  className?: string;
  size?: number;
}

export default function ListingLive({ className = "", size = 200 }: Props) {
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
          <linearGradient id="listingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>

          <filter id="listingGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="liveGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* House in background */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease-out",
          }}
        >
          {/* House body */}
          <rect
            x="100"
            y="70"
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
            d="M95 70 L135 40 L175 70 Z"
            fill={primaryColor}
            fillOpacity="0.2"
            stroke={primaryColor}
            strokeWidth="2"
          />

          {/* Door */}
          <rect
            x="125"
            y="95"
            width="20"
            height="30"
            rx="2"
            fill={primaryColor}
            fillOpacity="0.4"
          />

          {/* Window */}
          <rect
            x="150"
            y="82"
            width="14"
            height="14"
            rx="1"
            fill={secondaryColor}
            fillOpacity="0.3"
            stroke={primaryColor}
            strokeWidth="1"
          />
        </g>

        {/* For Sale Sign */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.5s ease-out 0.2s",
          }}
        >
          {/* Post */}
          <rect
            x="45"
            y="60"
            width="6"
            height="80"
            rx="1"
            fill={primaryColor}
          />

          {/* Sign board */}
          <rect
            x="25"
            y="50"
            width="60"
            height="45"
            rx="4"
            fill="white"
            fillOpacity="0.95"
            stroke={primaryColor}
            strokeWidth="2"
          />

          {/* FOR SALE text */}
          <text
            x="55"
            y="68"
            textAnchor="middle"
            fill={primaryColor}
            fontSize="8"
            fontFamily="monospace"
            fontWeight="bold"
          >
            FOR SALE
          </text>

          {/* House icon on sign */}
          <path
            d="M45 78 L55 70 L65 78 L65 88 L45 88 Z"
            fill={primaryColor}
            fillOpacity="0.3"
            stroke={primaryColor}
            strokeWidth="1.5"
          />
        </g>

        {/* LIVE indicator */}
        <g
          filter="url(#liveGlow)"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "scale(1)" : "scale(0)",
            transformOrigin: "55px 30px",
            transition: "all 0.4s ease-out 0.4s",
          }}
        >
          <rect
            x="35"
            y="20"
            width="40"
            height="20"
            rx="10"
            fill={accentColor}
          />
          <circle
            cx="47"
            cy="30"
            r="4"
            fill="white"
            style={{
              animationName: "blink",
              animationDuration: "1s",
              animationIterationCount: "infinite",
            }}
          />
          <text
            x="62"
            y="34"
            textAnchor="middle"
            fill="white"
            fontSize="9"
            fontFamily="monospace"
            fontWeight="bold"
          >
            LIVE
          </text>
        </g>

        {/* Broadcast waves */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.5s",
          }}
        >
          {[1, 2, 3].map((i) => (
            <path
              key={i}
              d={`M85 95 Q${85 + i * 8} ${95 - i * 15} ${85 + i * 15} 95`}
              fill="none"
              stroke={secondaryColor}
              strokeWidth="2"
              strokeLinecap="round"
              style={{
                animationName: "wave",
                animationDuration: "2s",
                animationIterationCount: "infinite",
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </g>

        {/* Eye views indicator */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.6s",
          }}
        >
          <g transform="translate(150, 140)">
            {/* Eye icon */}
            <ellipse
              cx="0"
              cy="0"
              rx="12"
              ry="8"
              fill="none"
              stroke={secondaryColor}
              strokeWidth="2"
            />
            <circle cx="0" cy="0" r="4" fill={secondaryColor} />

            {/* View count */}
            <text
              x="20"
              y="4"
              fill={secondaryColor}
              fontSize="10"
              fontFamily="monospace"
              fontWeight="bold"
            >
              47
            </text>
          </g>
        </g>

        {/* Notification bells */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.7s",
          }}
        >
          {[
            { x: 160, y: 50, delay: 0 },
            { x: 175, y: 65, delay: 0.5 },
          ].map((n, i) => (
            <g
              key={i}
              style={{
                animationName: "ring",
                animationDuration: "2s",
                animationIterationCount: "infinite",
                animationDelay: `${n.delay}s`,
              }}
            >
              <path
                d={`M${n.x} ${n.y + 8} Q${n.x - 5} ${n.y + 8} ${n.x - 5} ${n.y + 3}
                   Q${n.x - 5} ${n.y - 5} ${n.x} ${n.y - 5}
                   Q${n.x + 5} ${n.y - 5} ${n.x + 5} ${n.y + 3}
                   Q${n.x + 5} ${n.y + 8} ${n.x} ${n.y + 8}`}
                fill={primaryColor}
              />
              <circle cx={n.x} cy={n.y + 10} r="2" fill={primaryColor} />
            </g>
          ))}
        </g>

        {/* Ground line */}
        <line
          x1="20"
          y1="145"
          x2="180"
          y2="145"
          stroke={primaryColor}
          strokeWidth="2"
          strokeOpacity="0.3"
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease-out",
          }}
        />

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
          LISTING LIVE
        </text>

        <style>{`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
          @keyframes wave {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.1); }
          }
          @keyframes ring {
            0%, 90%, 100% { transform: rotate(0deg); }
            92%, 96% { transform: rotate(10deg); }
            94%, 98% { transform: rotate(-10deg); }
          }
        `}</style>
      </svg>
    </div>
  );
}
