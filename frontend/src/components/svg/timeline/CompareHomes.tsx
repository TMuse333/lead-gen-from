"use client";

import { useState, useEffect } from "react";

/**
 * CompareHomes - Side-by-side property comparison
 *
 * Two property cards with comparison metrics, checkmarks.
 * Conveys: "Making informed decisions"
 */

const CONFIG = {
  primaryColor: "#3b82f6",
  secondaryColor: "#10b981",
  accentColor: "#f59e0b",
};

interface Props {
  className?: string;
  size?: number;
}

export default function CompareHomes({ className = "", size = 200 }: Props) {
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
          <filter id="compareGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* VS divider */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "scale(1)" : "scale(0)",
            transformOrigin: "100px 80px",
            transition: "all 0.5s ease-out 0.3s",
          }}
        >
          <circle
            cx="100"
            cy="80"
            r="15"
            fill={accentColor}
            fillOpacity="0.2"
            stroke={accentColor}
            strokeWidth="2"
          />
          <text
            x="100"
            y="85"
            textAnchor="middle"
            fill={accentColor}
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
          >
            VS
          </text>
        </g>

        {/* Property A */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateX(0)" : "translateX(-20px)",
            transition: "all 0.5s ease-out 0.2s",
          }}
        >
          <rect
            x="15"
            y="30"
            width="70"
            height="100"
            rx="6"
            fill={primaryColor}
            fillOpacity="0.1"
            stroke={primaryColor}
            strokeWidth="2"
          />

          {/* Header */}
          <rect
            x="15"
            y="30"
            width="70"
            height="18"
            rx="6"
            fill={primaryColor}
            fillOpacity="0.2"
          />
          <text
            x="50"
            y="42"
            textAnchor="middle"
            fill={primaryColor}
            fontSize="8"
            fontFamily="monospace"
            fontWeight="bold"
          >
            OPTION A
          </text>

          {/* Mini house */}
          <rect
            x="30"
            y="55"
            width="40"
            height="25"
            rx="2"
            fill={primaryColor}
            fillOpacity="0.2"
          />
          <path
            d="M28 55 L50 40 L72 55"
            fill={primaryColor}
            fillOpacity="0.3"
          />

          {/* Stats */}
          <text x="20" y="95" fill={primaryColor} fontSize="10" fontFamily="monospace" fontWeight="bold">
            $425K
          </text>

          {/* Comparison metrics */}
          <g>
            <text x="20" y="108" fill={primaryColor} fontSize="6" fontFamily="monospace">
              3 bed
            </text>
            <circle cx="48" cy="105" r="4" fill={secondaryColor} />
            <path d="M46 105 L47.5 107 L50 103" stroke="white" strokeWidth="1.5" fill="none" />
          </g>

          <g>
            <text x="20" y="120" fill={primaryColor} fontSize="6" fontFamily="monospace">
              2 bath
            </text>
            <circle cx="48" cy="117" r="4" fill={secondaryColor} />
            <path d="M46 117 L47.5 119 L50 115" stroke="white" strokeWidth="1.5" fill="none" />
          </g>
        </g>

        {/* Property B */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateX(0)" : "translateX(20px)",
            transition: "all 0.5s ease-out 0.2s",
          }}
        >
          <rect
            x="115"
            y="30"
            width="70"
            height="100"
            rx="6"
            fill={secondaryColor}
            fillOpacity="0.1"
            stroke={secondaryColor}
            strokeWidth="2"
          />

          {/* Header */}
          <rect
            x="115"
            y="30"
            width="70"
            height="18"
            rx="6"
            fill={secondaryColor}
            fillOpacity="0.2"
          />
          <text
            x="150"
            y="42"
            textAnchor="middle"
            fill={secondaryColor}
            fontSize="8"
            fontFamily="monospace"
            fontWeight="bold"
          >
            OPTION B
          </text>

          {/* Winner badge */}
          <g filter="url(#compareGlow)">
            <circle cx="175" cy="35" r="8" fill={secondaryColor} />
            <text x="175" y="38" textAnchor="middle" fill="white" fontSize="8">⭐</text>
          </g>

          {/* Mini house */}
          <rect
            x="130"
            y="55"
            width="40"
            height="25"
            rx="2"
            fill={secondaryColor}
            fillOpacity="0.2"
          />
          <path
            d="M128 55 L150 40 L172 55"
            fill={secondaryColor}
            fillOpacity="0.3"
          />

          {/* Stats */}
          <text x="120" y="95" fill={secondaryColor} fontSize="10" fontFamily="monospace" fontWeight="bold">
            $389K
          </text>

          {/* Comparison metrics */}
          <g>
            <text x="120" y="108" fill={secondaryColor} fontSize="6" fontFamily="monospace">
              4 bed
            </text>
            <circle cx="148" cy="105" r="4" fill={secondaryColor} />
            <path d="M146 105 L147.5 107 L150 103" stroke="white" strokeWidth="1.5" fill="none" />
          </g>

          <g>
            <text x="120" y="120" fill={secondaryColor} fontSize="6" fontFamily="monospace">
              2.5 bath
            </text>
            <circle cx="155" cy="117" r="4" fill={secondaryColor} />
            <path d="M153 117 L154.5 119 L157 115" stroke="white" strokeWidth="1.5" fill="none" />
          </g>
        </g>

        {/* Comparison chart */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.5s",
          }}
        >
          <rect
            x="25"
            y="135"
            width="150"
            height="30"
            rx="4"
            fill={primaryColor}
            fillOpacity="0.05"
            stroke={primaryColor}
            strokeWidth="1"
          />

          {/* Value comparison bars */}
          <text x="30" y="148" fill={primaryColor} fontSize="5" fontFamily="monospace">
            VALUE
          </text>

          {/* Option A bar */}
          <rect x="55" y="143" width="50" height="6" rx="3" fill={primaryColor} fillOpacity="0.3" />
          <rect
            x="55"
            y="143"
            width={mounted ? "35" : "0"}
            height="6"
            rx="3"
            fill={primaryColor}
            style={{ transition: "width 0.6s ease-out 0.6s" }}
          />

          {/* Option B bar */}
          <rect x="55" y="153" width="50" height="6" rx="3" fill={secondaryColor} fillOpacity="0.3" />
          <rect
            x="55"
            y="153"
            width={mounted ? "45" : "0"}
            height="6"
            rx="3"
            fill={secondaryColor}
            style={{ transition: "width 0.6s ease-out 0.7s" }}
          />

          {/* Labels */}
          <text x="115" y="148" fill={primaryColor} fontSize="5" fontFamily="monospace">A</text>
          <text x="115" y="158" fill={secondaryColor} fontSize="5" fontFamily="monospace">B</text>

          {/* Score */}
          <text x="140" y="153" textAnchor="middle" fill={secondaryColor} fontSize="8" fontFamily="monospace" fontWeight="bold">
            +12%
          </text>
        </g>

        {/* Connecting comparison lines */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.4s",
          }}
        >
          <line
            x1="85"
            y1="80"
            x2="90"
            y2="80"
            stroke={primaryColor}
            strokeWidth="2"
            strokeDasharray="3 2"
          />
          <line
            x1="110"
            y1="80"
            x2="115"
            y2="80"
            stroke={secondaryColor}
            strokeWidth="2"
            strokeDasharray="3 2"
          />
        </g>

        {/* Label */}
        <text
          x="100"
          y="180"
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
          COMPARE OPTIONS
        </text>
      </svg>
    </div>
  );
}
