"use client";

import { useState, useEffect } from "react";

/**
 * MovingDay - Post-closing/move-in phase
 *
 * Moving boxes with house, welcome mat, door opening.
 * Conveys: "New chapter begins!"
 */

const CONFIG = {
  primaryColor: "#06b6d4",
  secondaryColor: "#10b981",
  warmColor: "#f59e0b",
  boxColor: "#8b5cf6",
};

interface Props {
  className?: string;
  size?: number;
}

export default function MovingDay({ className = "", size = 200 }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { primaryColor, secondaryColor, warmColor, boxColor } = CONFIG;

  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        fill="none"
      >
        <defs>
          <linearGradient id="movingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>

          <filter id="movingGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="doorLight" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
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
            x="85"
            y="70"
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
            d="M80 70 L130 35 L180 70 Z"
            fill={primaryColor}
            fillOpacity="0.2"
            stroke={primaryColor}
            strokeWidth="2"
          />

          {/* Window */}
          <rect
            x="150"
            y="85"
            width="18"
            height="18"
            rx="1"
            fill={warmColor}
            fillOpacity="0.3"
            stroke={primaryColor}
            strokeWidth="1"
          />

          {/* Window glow */}
          <rect
            x="152"
            y="87"
            width="14"
            height="14"
            rx="1"
            fill={warmColor}
            fillOpacity="0.5"
          />
        </g>

        {/* Open door with light */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.2s",
          }}
        >
          {/* Door frame */}
          <rect
            x="100"
            y="95"
            width="30"
            height="45"
            rx="2"
            fill={primaryColor}
            fillOpacity="0.4"
          />

          {/* Door light emanating */}
          <path
            d="M100 140 L80 160 L100 160 Z"
            fill={warmColor}
            fillOpacity="0.2"
            filter="url(#doorLight)"
          />
          <path
            d="M130 140 L150 160 L130 160 Z"
            fill={warmColor}
            fillOpacity="0.2"
            filter="url(#doorLight)"
          />

          {/* Inner warm glow */}
          <rect
            x="102"
            y="97"
            width="26"
            height="43"
            rx="1"
            fill={warmColor}
            fillOpacity="0.4"
          />
        </g>

        {/* Welcome mat */}
        <g
          filter="url(#movingGlow)"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "scaleX(1)" : "scaleX(0)",
            transformOrigin: "115px 148px",
            transition: "all 0.5s ease-out 0.3s",
          }}
        >
          <rect
            x="95"
            y="142"
            width="40"
            height="12"
            rx="2"
            fill={secondaryColor}
          />
          <text
            x="115"
            y="151"
            textAnchor="middle"
            fill="white"
            fontSize="6"
            fontFamily="monospace"
            fontWeight="bold"
          >
            WELCOME
          </text>
        </g>

        {/* Moving boxes */}
        <g>
          {/* Box 1 - large */}
          <g
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateX(0)" : "translateX(-20px)",
              transition: "all 0.5s ease-out 0.4s",
            }}
          >
            <rect
              x="20"
              y="115"
              width="40"
              height="35"
              rx="3"
              fill={boxColor}
              fillOpacity="0.3"
              stroke={boxColor}
              strokeWidth="2"
            />
            {/* Box tape */}
            <line x1="40" y1="115" x2="40" y2="150" stroke={boxColor} strokeWidth="2" />
            <line x1="20" y1="125" x2="60" y2="125" stroke={boxColor} strokeWidth="2" />
            {/* Label */}
            <text x="40" y="140" textAnchor="middle" fill={boxColor} fontSize="6" fontFamily="monospace">
              KITCHEN
            </text>
          </g>

          {/* Box 2 - medium */}
          <g
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(15px)",
              transition: "all 0.5s ease-out 0.5s",
            }}
          >
            <rect
              x="35"
              y="85"
              width="30"
              height="28"
              rx="2"
              fill={boxColor}
              fillOpacity="0.25"
              stroke={boxColor}
              strokeWidth="1.5"
            />
            <line x1="50" y1="85" x2="50" y2="113" stroke={boxColor} strokeWidth="1.5" />
            <text x="50" y="102" textAnchor="middle" fill={boxColor} fontSize="5" fontFamily="monospace">
              BOOKS
            </text>
          </g>

          {/* Box 3 - small */}
          <g
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(10px)",
              transition: "all 0.5s ease-out 0.6s",
            }}
          >
            <rect
              x="55"
              y="100"
              width="22"
              height="20"
              rx="2"
              fill={boxColor}
              fillOpacity="0.2"
              stroke={boxColor}
              strokeWidth="1"
            />
          </g>
        </g>

        {/* Celebration elements */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.7s",
          }}
        >
          {/* Sparkles */}
          {[
            { x: 130, y: 30, size: 4 },
            { x: 165, y: 45, size: 3 },
            { x: 145, y: 25, size: 3 },
          ].map((s, i) => (
            <g key={i} style={{ animationName: "twinkle", animationDuration: "1.5s", animationIterationCount: "infinite", animationDelay: `${i * 0.3}s` }}>
              <line x1={s.x - s.size} y1={s.y} x2={s.x + s.size} y2={s.y} stroke={warmColor} strokeWidth="1.5" strokeLinecap="round" />
              <line x1={s.x} y1={s.y - s.size} x2={s.x} y2={s.y + s.size} stroke={warmColor} strokeWidth="1.5" strokeLinecap="round" />
            </g>
          ))}

          {/* Heart/home icon */}
          <g
            filter="url(#movingGlow)"
            style={{
              transform: mounted ? "scale(1)" : "scale(0)",
              transformOrigin: "130px 50px",
              transition: "transform 0.4s ease-out 0.8s",
            }}
          >
            <circle cx="130" cy="50" r="12" fill={secondaryColor} fillOpacity="0.2" />
            <path
              d="M125 52 L130 47 L135 52 L135 57 L125 57 Z"
              fill={secondaryColor}
            />
          </g>
        </g>

        {/* Ground line */}
        <line
          x1="15"
          y1="155"
          x2="185"
          y2="155"
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
          fill={secondaryColor}
          fontSize="10"
          fontFamily="monospace"
          fontWeight="bold"
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.9s",
          }}
        >
          NEW BEGINNINGS
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
