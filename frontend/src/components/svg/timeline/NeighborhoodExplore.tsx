"use client";

import { useState, useEffect } from "react";

/**
 * NeighborhoodExplore - First step in browsing journey
 *
 * Map with location pins, area highlights, compass.
 * Conveys: "Discovering neighborhoods"
 */

const CONFIG = {
  primaryColor: "#3b82f6", // Blue for browsing
  secondaryColor: "#10b981",
  accentColor: "#f59e0b",
};

interface Props {
  className?: string;
  size?: number;
}

export default function NeighborhoodExplore({ className = "", size = 200 }: Props) {
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
          <linearGradient id="exploreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>

          <filter id="exploreGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="pinGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Map background */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease-out",
          }}
        >
          <rect
            x="25"
            y="30"
            width="150"
            height="120"
            rx="8"
            fill={primaryColor}
            fillOpacity="0.1"
            stroke={primaryColor}
            strokeWidth="2"
          />

          {/* Map grid lines */}
          {[50, 75, 100, 125].map((x, i) => (
            <line
              key={`v${i}`}
              x1={x}
              y1="30"
              x2={x}
              y2="150"
              stroke={primaryColor}
              strokeWidth="0.5"
              strokeOpacity="0.2"
            />
          ))}
          {[55, 80, 105, 130].map((y, i) => (
            <line
              key={`h${i}`}
              x1="25"
              y1={y}
              x2="175"
              y2={y}
              stroke={primaryColor}
              strokeWidth="0.5"
              strokeOpacity="0.2"
            />
          ))}

          {/* Roads */}
          <path
            d="M25 90 L175 90"
            stroke={primaryColor}
            strokeWidth="4"
            strokeOpacity="0.3"
          />
          <path
            d="M100 30 L100 150"
            stroke={primaryColor}
            strokeWidth="4"
            strokeOpacity="0.3"
          />
        </g>

        {/* Neighborhood area highlights */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.2s",
          }}
        >
          <ellipse
            cx="65"
            cy="65"
            rx="25"
            ry="20"
            fill={secondaryColor}
            fillOpacity="0.2"
            stroke={secondaryColor}
            strokeWidth="1"
            strokeDasharray="4 2"
          />
          <ellipse
            cx="140"
            cy="115"
            rx="28"
            ry="22"
            fill={accentColor}
            fillOpacity="0.2"
            stroke={accentColor}
            strokeWidth="1"
            strokeDasharray="4 2"
          />
        </g>

        {/* Location pins */}
        <g>
          {[
            { x: 55, y: 60, color: secondaryColor, delay: 0.3 },
            { x: 75, y: 70, color: secondaryColor, delay: 0.4 },
            { x: 130, y: 110, color: accentColor, delay: 0.5 },
            { x: 150, y: 120, color: accentColor, delay: 0.6 },
            { x: 100, y: 90, color: primaryColor, delay: 0.7, main: true },
          ].map((pin, i) => (
            <g
              key={i}
              filter={pin.main ? "url(#pinGlow)" : "url(#exploreGlow)"}
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0) scale(1)" : "translateY(-15px) scale(0.5)",
                transformOrigin: `${pin.x}px ${pin.y}px`,
                transition: `all 0.4s ease-out ${pin.delay}s`,
              }}
            >
              <path
                d={`M${pin.x} ${pin.y + 12}
                   Q${pin.x - 8} ${pin.y} ${pin.x} ${pin.y - 10}
                   Q${pin.x + 8} ${pin.y} ${pin.x} ${pin.y + 12}`}
                fill={pin.color}
              />
              <circle
                cx={pin.x}
                cy={pin.y - 5}
                r={pin.main ? 5 : 3}
                fill="white"
              />

              {/* Ripple effect for main pin */}
              {pin.main && (
                <circle
                  cx={pin.x}
                  cy={pin.y + 12}
                  r="15"
                  fill="none"
                  stroke={pin.color}
                  strokeWidth="2"
                  opacity="0.4"
                  style={{
                    animationName: "ripple",
                    animationDuration: "2s",
                    animationIterationCount: "infinite",
                  }}
                />
              )}
            </g>
          ))}
        </g>

        {/* Compass */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "rotate(0deg)" : "rotate(-90deg)",
            transformOrigin: "170px 45px",
            transition: "all 0.6s ease-out 0.5s",
          }}
        >
          <circle
            cx="170"
            cy="45"
            r="15"
            fill="white"
            fillOpacity="0.1"
            stroke={primaryColor}
            strokeWidth="1.5"
          />
          <path
            d="M170 32 L166 48 L170 45 L174 48 Z"
            fill={primaryColor}
          />
          <path
            d="M170 58 L166 42 L170 45 L174 42 Z"
            fill={primaryColor}
            fillOpacity="0.4"
          />
          <text
            x="170"
            y="37"
            textAnchor="middle"
            fill={primaryColor}
            fontSize="6"
            fontFamily="monospace"
            fontWeight="bold"
          >
            N
          </text>
        </g>

        {/* Search radius indicator */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.6s",
          }}
        >
          <circle
            cx="100"
            cy="90"
            r="40"
            fill="none"
            stroke={primaryColor}
            strokeWidth="1"
            strokeDasharray="6 3"
            opacity="0.5"
            style={{
              animationName: "expandRadius",
              animationDuration: "3s",
              animationIterationCount: "infinite",
            }}
          />
        </g>

        {/* Area labels */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.7s",
          }}
        >
          <text
            x="65"
            y="55"
            textAnchor="middle"
            fill={secondaryColor}
            fontSize="6"
            fontFamily="monospace"
            fontWeight="bold"
          >
            DOWNTOWN
          </text>
          <text
            x="140"
            y="105"
            textAnchor="middle"
            fill={accentColor}
            fontSize="6"
            fontFamily="monospace"
            fontWeight="bold"
          >
            SUBURBS
          </text>
        </g>

        {/* Label */}
        <text
          x="100"
          y="175"
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
          EXPLORE AREAS
        </text>

        <style>{`
          @keyframes ripple {
            0% { r: 15; opacity: 0.4; }
            100% { r: 30; opacity: 0; }
          }
          @keyframes expandRadius {
            0%, 100% { r: 40; opacity: 0.5; }
            50% { r: 50; opacity: 0.2; }
          }
        `}</style>
      </svg>
    </div>
  );
}
