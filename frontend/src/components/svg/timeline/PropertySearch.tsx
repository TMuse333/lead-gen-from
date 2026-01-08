"use client";

import { useState, useEffect } from "react";

/**
 * PropertySearch - Filtering and searching homes
 *
 * Filter sliders, search results, magnifying glass.
 * Conveys: "Finding your perfect match"
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

export default function PropertySearch({ className = "", size = 200 }: Props) {
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
          <filter id="searchGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Filter panel */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateX(0)" : "translateX(-20px)",
            transition: "all 0.5s ease-out",
          }}
        >
          <rect
            x="15"
            y="25"
            width="70"
            height="130"
            rx="6"
            fill={primaryColor}
            fillOpacity="0.1"
            stroke={primaryColor}
            strokeWidth="1.5"
          />

          {/* Filter header */}
          <rect
            x="15"
            y="25"
            width="70"
            height="20"
            rx="6"
            fill={primaryColor}
            fillOpacity="0.2"
          />
          <text
            x="50"
            y="38"
            textAnchor="middle"
            fill={primaryColor}
            fontSize="8"
            fontFamily="monospace"
            fontWeight="bold"
          >
            FILTERS
          </text>

          {/* Price slider */}
          <g>
            <text x="22" y="60" fill={primaryColor} fontSize="6" fontFamily="monospace">
              Price
            </text>
            <rect x="22" y="65" width="55" height="4" rx="2" fill={primaryColor} fillOpacity="0.2" />
            <rect
              x="22"
              y="65"
              width={mounted ? "35" : "0"}
              height="4"
              rx="2"
              fill={primaryColor}
              style={{ transition: "width 0.6s ease-out 0.3s" }}
            />
            <circle
              cx={mounted ? "57" : "22"}
              cy="67"
              r="5"
              fill={primaryColor}
              style={{ transition: "cx 0.6s ease-out 0.3s" }}
            />
            <text x="65" y="72" fill={primaryColor} fontSize="5" fontFamily="monospace">
              $500K
            </text>
          </g>

          {/* Beds slider */}
          <g>
            <text x="22" y="90" fill={primaryColor} fontSize="6" fontFamily="monospace">
              Beds
            </text>
            <rect x="22" y="95" width="55" height="4" rx="2" fill={primaryColor} fillOpacity="0.2" />
            <rect
              x="22"
              y="95"
              width={mounted ? "25" : "0"}
              height="4"
              rx="2"
              fill={secondaryColor}
              style={{ transition: "width 0.6s ease-out 0.4s" }}
            />
            <circle
              cx={mounted ? "47" : "22"}
              cy="97"
              r="5"
              fill={secondaryColor}
              style={{ transition: "cx 0.6s ease-out 0.4s" }}
            />
            <text x="58" y="102" fill={secondaryColor} fontSize="5" fontFamily="monospace">
              3+
            </text>
          </g>

          {/* Baths slider */}
          <g>
            <text x="22" y="120" fill={primaryColor} fontSize="6" fontFamily="monospace">
              Baths
            </text>
            <rect x="22" y="125" width="55" height="4" rx="2" fill={primaryColor} fillOpacity="0.2" />
            <rect
              x="22"
              y="125"
              width={mounted ? "18" : "0"}
              height="4"
              rx="2"
              fill={accentColor}
              style={{ transition: "width 0.6s ease-out 0.5s" }}
            />
            <circle
              cx={mounted ? "40" : "22"}
              cy="127"
              r="5"
              fill={accentColor}
              style={{ transition: "cx 0.6s ease-out 0.5s" }}
            />
            <text x="50" y="132" fill={accentColor} fontSize="5" fontFamily="monospace">
              2+
            </text>
          </g>

          {/* Search button */}
          <rect
            x="22"
            y="140"
            width="55"
            height="12"
            rx="6"
            fill={primaryColor}
            style={{
              opacity: mounted ? 1 : 0.5,
              transition: "opacity 0.5s ease-out 0.6s",
            }}
          />
          <text
            x="49.5"
            y="149"
            textAnchor="middle"
            fill="white"
            fontSize="6"
            fontFamily="monospace"
            fontWeight="bold"
          >
            SEARCH
          </text>
        </g>

        {/* Search results */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.4s",
          }}
        >
          <text
            x="140"
            y="35"
            textAnchor="middle"
            fill={primaryColor}
            fontSize="8"
            fontFamily="monospace"
          >
            12 Results
          </text>

          {/* Result cards */}
          {[
            { y: 45, highlight: false },
            { y: 80, highlight: true },
            { y: 115, highlight: false },
          ].map((card, i) => (
            <g
              key={i}
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateX(0)" : "translateX(20px)",
                transition: `all 0.4s ease-out ${0.5 + i * 0.1}s`,
              }}
            >
              <rect
                x="95"
                y={card.y}
                width="90"
                height="30"
                rx="4"
                fill={card.highlight ? secondaryColor : primaryColor}
                fillOpacity={card.highlight ? 0.2 : 0.1}
                stroke={card.highlight ? secondaryColor : primaryColor}
                strokeWidth={card.highlight ? 2 : 1}
              />

              {/* Mini house icon */}
              <rect
                x="100"
                y={card.y + 10}
                width="18"
                height="14"
                rx="1"
                fill={card.highlight ? secondaryColor : primaryColor}
                fillOpacity="0.3"
              />
              <path
                d={`M99 ${card.y + 10} L109 ${card.y + 3} L119 ${card.y + 10}`}
                fill={card.highlight ? secondaryColor : primaryColor}
                fillOpacity="0.4"
              />

              {/* Price */}
              <text
                x="125"
                y={card.y + 14}
                fill={card.highlight ? secondaryColor : primaryColor}
                fontSize="8"
                fontFamily="monospace"
                fontWeight="bold"
              >
                ${425 + i * 25}K
              </text>

              {/* Details */}
              <text
                x="125"
                y={card.y + 24}
                fill={card.highlight ? secondaryColor : primaryColor}
                fontSize="5"
                fontFamily="monospace"
                fillOpacity="0.7"
              >
                {3 + (i % 2)}bd • {2}ba
              </text>

              {/* Match badge for highlight */}
              {card.highlight && (
                <g filter="url(#searchGlow)">
                  <rect
                    x="165"
                    y={card.y + 3}
                    width="18"
                    height="10"
                    rx="5"
                    fill={secondaryColor}
                  />
                  <text
                    x="174"
                    y={card.y + 10}
                    textAnchor="middle"
                    fill="white"
                    fontSize="5"
                    fontFamily="monospace"
                  >
                    95%
                  </text>
                </g>
              )}
            </g>
          ))}
        </g>

        {/* Magnifying glass over results */}
        <g
          filter="url(#searchGlow)"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translate(0, 0)" : "translate(-15px, -15px)",
            transition: "all 0.5s ease-out 0.7s",
          }}
        >
          <circle
            cx="115"
            cy="95"
            r="20"
            fill={primaryColor}
            fillOpacity="0.05"
            stroke={primaryColor}
            strokeWidth="3"
          />
          <line
            x1="130"
            y1="110"
            x2="145"
            y2="125"
            stroke={primaryColor}
            strokeWidth="4"
            strokeLinecap="round"
          />
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
          SEARCH PROPERTIES
        </text>
      </svg>
    </div>
  );
}
