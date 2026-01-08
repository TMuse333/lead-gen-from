"use client";

import { useState, useEffect } from "react";

/**
 * StagingPrep - Preparing home for sale
 *
 * House with furniture rearranging, paint brush, sparkle clean.
 * Conveys: "Make it shine for buyers"
 */

const CONFIG = {
  primaryColor: "#f59e0b",
  secondaryColor: "#10b981",
  accentColor: "#8b5cf6",
};

interface Props {
  className?: string;
  size?: number;
}

export default function StagingPrep({ className = "", size = 200 }: Props) {
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
          <filter id="stagingGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Room outline */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease-out",
          }}
        >
          {/* Floor */}
          <path
            d="M30 140 L100 160 L170 140 L170 80 L100 60 L30 80 Z"
            fill={primaryColor}
            fillOpacity="0.1"
            stroke={primaryColor}
            strokeWidth="2"
          />

          {/* Back wall */}
          <path
            d="M30 80 L100 60 L170 80 L170 40 L100 20 L30 40 Z"
            fill={primaryColor}
            fillOpacity="0.15"
            stroke={primaryColor}
            strokeWidth="2"
          />
        </g>

        {/* Couch being positioned */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateX(0)" : "translateX(-20px)",
            transition: "all 0.6s ease-out 0.3s",
          }}
        >
          <rect
            x="50"
            y="110"
            width="40"
            height="20"
            rx="4"
            fill={accentColor}
            fillOpacity="0.6"
          />
          <rect
            x="48"
            y="105"
            width="8"
            height="25"
            rx="2"
            fill={accentColor}
            fillOpacity="0.8"
          />
          <rect
            x="84"
            y="105"
            width="8"
            height="25"
            rx="2"
            fill={accentColor}
            fillOpacity="0.8"
          />

          {/* Movement arrows */}
          <path
            d="M45 120 L35 120 M35 117 L30 120 L35 123"
            stroke={secondaryColor}
            strokeWidth="2"
            strokeLinecap="round"
            style={{
              opacity: mounted ? 0.6 : 0,
              transition: "opacity 0.5s ease-out 0.5s",
            }}
          />
        </g>

        {/* Plant */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "scale(1)" : "scale(0)",
            transformOrigin: "130px 115px",
            transition: "all 0.5s ease-out 0.4s",
          }}
        >
          <rect
            x="125"
            y="115"
            width="12"
            height="15"
            rx="2"
            fill={primaryColor}
            fillOpacity="0.6"
          />
          <ellipse
            cx="131"
            cy="108"
            rx="10"
            ry="12"
            fill={secondaryColor}
            fillOpacity="0.7"
          />
        </g>

        {/* Paint brush */}
        <g
          filter="url(#stagingGlow)"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "rotate(0deg)" : "rotate(-30deg)",
            transformOrigin: "160px 55px",
            transition: "all 0.5s ease-out 0.5s",
          }}
        >
          {/* Handle */}
          <rect
            x="155"
            y="55"
            width="25"
            height="8"
            rx="2"
            fill={primaryColor}
          />
          {/* Bristles */}
          <rect
            x="147"
            y="53"
            width="10"
            height="12"
            rx="1"
            fill={accentColor}
          />
          {/* Paint drip */}
          <path
            d="M152 65 Q150 72 152 78"
            stroke={secondaryColor}
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            style={{
              strokeDasharray: 20,
              strokeDashoffset: mounted ? 0 : 20,
              transition: "stroke-dashoffset 0.8s ease-out 0.7s",
            }}
          />
        </g>

        {/* Picture frame being hung */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(-15px)",
            transition: "all 0.5s ease-out 0.6s",
          }}
        >
          <rect
            x="70"
            y="35"
            width="25"
            height="20"
            rx="2"
            fill={accentColor}
            fillOpacity="0.3"
            stroke={accentColor}
            strokeWidth="2"
          />
          {/* Hanger line */}
          <path
            d="M82.5 35 L82.5 28 L78 28 M82.5 28 L87 28"
            stroke={primaryColor}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>

        {/* Sparkle clean effects */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.7s",
          }}
        >
          {[
            { x: 40, y: 90, size: 4 },
            { x: 110, y: 75, size: 3 },
            { x: 155, y: 100, size: 4 },
            { x: 75, y: 145, size: 3 },
          ].map((s, i) => (
            <g
              key={i}
              style={{
                animationName: "twinkle",
                animationDuration: "1.5s",
                animationIterationCount: "infinite",
                animationDelay: `${i * 0.25}s`,
              }}
            >
              <line
                x1={s.x - s.size}
                y1={s.y}
                x2={s.x + s.size}
                y2={s.y}
                stroke={secondaryColor}
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1={s.x}
                y1={s.y - s.size}
                x2={s.x}
                y2={s.y + s.size}
                stroke={secondaryColor}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </g>
          ))}
        </g>

        {/* Checklist */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.5s",
          }}
        >
          <rect
            x="15"
            y="25"
            width="35"
            height="45"
            rx="3"
            fill="white"
            fillOpacity="0.1"
            stroke={primaryColor}
            strokeWidth="1.5"
          />
          {[
            { y: 35, done: true },
            { y: 47, done: true },
            { y: 59, done: false },
          ].map((item, i) => (
            <g key={i}>
              <rect
                x="20"
                y={item.y}
                width="8"
                height="8"
                rx="1"
                fill={item.done ? secondaryColor : "transparent"}
                stroke={item.done ? secondaryColor : primaryColor}
                strokeWidth="1"
              />
              {item.done && (
                <path
                  d={`M22 ${item.y + 4} L24 ${item.y + 6} L26 ${item.y + 2}`}
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  fill="none"
                />
              )}
              <line
                x1="32"
                y1={item.y + 4}
                x2="45"
                y2={item.y + 4}
                stroke={primaryColor}
                strokeWidth="2"
                strokeOpacity="0.5"
              />
            </g>
          ))}
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
          STAGING & PREP
        </text>

        <style>{`
          @keyframes twinkle {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 1; }
          }
        `}</style>
      </svg>
    </div>
  );
}
