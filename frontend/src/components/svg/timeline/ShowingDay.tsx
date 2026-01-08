"use client";

import { useState, useEffect } from "react";

/**
 * ShowingDay - Buyers touring the home
 *
 * House with open door, multiple figure silhouettes touring.
 * Conveys: "Interest is building"
 */

const CONFIG = {
  primaryColor: "#f59e0b",
  secondaryColor: "#10b981",
  accentColor: "#06b6d4",
};

interface Props {
  className?: string;
  size?: number;
}

export default function ShowingDay({ className = "", size = 200 }: Props) {
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
          <filter id="showingGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="warmLight" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
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
            x="80"
            y="60"
            width="90"
            height="70"
            rx="2"
            fill={primaryColor}
            fillOpacity="0.15"
            stroke={primaryColor}
            strokeWidth="2"
          />

          {/* Roof */}
          <path
            d="M75 60 L125 25 L175 60 Z"
            fill={primaryColor}
            fillOpacity="0.2"
            stroke={primaryColor}
            strokeWidth="2"
          />

          {/* Windows */}
          <rect
            x="145"
            y="75"
            width="18"
            height="18"
            rx="1"
            fill={secondaryColor}
            fillOpacity="0.3"
            stroke={primaryColor}
            strokeWidth="1"
          />
          <rect
            x="145"
            y="100"
            width="18"
            height="18"
            rx="1"
            fill={secondaryColor}
            fillOpacity="0.3"
            stroke={primaryColor}
            strokeWidth="1"
          />
        </g>

        {/* Open door with warm light */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.2s",
          }}
        >
          {/* Door frame */}
          <rect
            x="100"
            y="85"
            width="30"
            height="45"
            rx="2"
            fill={primaryColor}
            fillOpacity="0.5"
          />

          {/* Warm light from inside */}
          <rect
            x="102"
            y="87"
            width="26"
            height="43"
            rx="1"
            fill="#fbbf24"
            fillOpacity="0.5"
            filter="url(#warmLight)"
          />

          {/* Light rays */}
          <path
            d="M100 130 L70 155 M115 130 L115 155 M130 130 L160 155"
            stroke="#fbbf24"
            strokeWidth="3"
            strokeOpacity="0.3"
            strokeLinecap="round"
            filter="url(#warmLight)"
          />
        </g>

        {/* People touring */}
        <g>
          {/* Person 1 - entering */}
          <g
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateX(0)" : "translateX(-30px)",
              transition: "all 0.6s ease-out 0.3s",
            }}
          >
            <circle cx="85" cy="115" r="8" fill={accentColor} />
            <rect
              x="80"
              y="125"
              width="10"
              height="20"
              rx="3"
              fill={accentColor}
              fillOpacity="0.8"
            />
          </g>

          {/* Person 2 - looking around */}
          <g
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateX(0)" : "translateX(-40px)",
              transition: "all 0.6s ease-out 0.4s",
            }}
          >
            <circle cx="55" cy="120" r="7" fill={secondaryColor} />
            <rect
              x="51"
              y="129"
              width="8"
              height="16"
              rx="2"
              fill={secondaryColor}
              fillOpacity="0.8"
            />

            {/* Thought bubble */}
            <g filter="url(#showingGlow)">
              <circle cx="45" cy="100" r="12" fill="white" fillOpacity="0.1" stroke={secondaryColor} strokeWidth="1" />
              <text x="45" y="104" textAnchor="middle" fill={secondaryColor} fontSize="10">❤️</text>
              <circle cx="52" cy="108" r="3" fill="white" fillOpacity="0.1" stroke={secondaryColor} strokeWidth="1" />
            </g>
          </g>

          {/* Person 3 - waiting outside */}
          <g
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateX(0)" : "translateX(-50px)",
              transition: "all 0.6s ease-out 0.5s",
            }}
          >
            <circle cx="30" cy="125" r="6" fill={primaryColor} fillOpacity="0.6" />
            <rect
              x="27"
              y="133"
              width="6"
              height="12"
              rx="2"
              fill={primaryColor}
              fillOpacity="0.5"
            />
          </g>
        </g>

        {/* Agent with clipboard */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "scale(1)" : "scale(0.5)",
            transformOrigin: "175px 125px",
            transition: "all 0.5s ease-out 0.4s",
          }}
        >
          <circle cx="175" cy="115" r="9" fill={primaryColor} />
          <rect
            x="170"
            y="126"
            width="10"
            height="22"
            rx="3"
            fill={primaryColor}
            fillOpacity="0.8"
          />

          {/* Clipboard */}
          <rect
            x="158"
            y="118"
            width="12"
            height="16"
            rx="2"
            fill="white"
            fillOpacity="0.9"
            stroke={primaryColor}
            strokeWidth="1"
          />
          <line x1="160" y1="123" x2="168" y2="123" stroke={primaryColor} strokeWidth="1" />
          <line x1="160" y1="127" x2="168" y2="127" stroke={primaryColor} strokeWidth="1" />
          <line x1="160" y1="131" x2="165" y2="131" stroke={primaryColor} strokeWidth="1" />
        </g>

        {/* Calendar with time slots */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.6s",
          }}
        >
          <rect
            x="15"
            y="30"
            width="45"
            height="50"
            rx="4"
            fill="white"
            fillOpacity="0.1"
            stroke={primaryColor}
            strokeWidth="1.5"
          />
          <rect
            x="15"
            y="30"
            width="45"
            height="12"
            rx="4"
            fill={primaryColor}
            fillOpacity="0.3"
          />
          <text x="37.5" y="40" textAnchor="middle" fill={primaryColor} fontSize="7" fontFamily="monospace" fontWeight="bold">
            TODAY
          </text>

          {/* Time slots */}
          {[
            { time: "10:00", filled: true },
            { time: "11:30", filled: true },
            { time: "2:00", filled: false },
          ].map((slot, i) => (
            <g key={i}>
              <text
                x="22"
                y={52 + i * 10}
                fill={slot.filled ? secondaryColor : primaryColor}
                fontSize="6"
                fontFamily="monospace"
              >
                {slot.time}
              </text>
              <circle
                cx="50"
                cy={49 + i * 10}
                r="3"
                fill={slot.filled ? secondaryColor : "transparent"}
                stroke={slot.filled ? secondaryColor : primaryColor}
                strokeWidth="1"
              />
            </g>
          ))}
        </g>

        {/* Interest indicator */}
        <g
          filter="url(#showingGlow)"
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.7s",
          }}
        >
          <rect
            x="130"
            y="15"
            width="55"
            height="25"
            rx="4"
            fill={secondaryColor}
            fillOpacity="0.2"
            stroke={secondaryColor}
            strokeWidth="1"
          />
          <text x="157.5" y="25" textAnchor="middle" fill={secondaryColor} fontSize="7" fontFamily="monospace">
            INTEREST
          </text>
          <text x="157.5" y="35" textAnchor="middle" fill={secondaryColor} fontSize="10" fontFamily="monospace" fontWeight="bold">
            HIGH 🔥
          </text>
        </g>

        {/* Ground line */}
        <line
          x1="15"
          y1="150"
          x2="185"
          y2="150"
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
          SHOWING DAY
        </text>
      </svg>
    </div>
  );
}
