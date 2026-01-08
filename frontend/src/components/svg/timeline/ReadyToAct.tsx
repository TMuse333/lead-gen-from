"use client";

import { useState, useEffect } from "react";

/**
 * ReadyToAct - Decision point in browsing journey
 *
 * Fork in road with Buy/Sell options, confident figure.
 * Conveys: "Ready to take the next step"
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

export default function ReadyToAct({ className = "", size = 200 }: Props) {
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
          <linearGradient id="readyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={secondaryColor} />
            <stop offset="50%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={accentColor} />
          </linearGradient>

          <filter id="readyGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="pathGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Fork in road */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease-out",
          }}
        >
          {/* Main path */}
          <path
            d="M100 180 L100 120"
            stroke={primaryColor}
            strokeWidth="12"
            strokeOpacity="0.3"
            strokeLinecap="round"
          />

          {/* Left path to BUY */}
          <path
            d="M100 120 Q70 100 45 70"
            stroke={secondaryColor}
            strokeWidth="10"
            strokeOpacity="0.3"
            strokeLinecap="round"
            fill="none"
          />

          {/* Right path to SELL */}
          <path
            d="M100 120 Q130 100 155 70"
            stroke={accentColor}
            strokeWidth="10"
            strokeOpacity="0.3"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* BUY destination */}
        <g
          filter="url(#readyGlow)"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "scale(1)" : "scale(0.5)",
            transformOrigin: "45px 50px",
            transition: "all 0.5s ease-out 0.3s",
          }}
        >
          <circle
            cx="45"
            cy="50"
            r="25"
            fill={secondaryColor}
            fillOpacity="0.2"
            stroke={secondaryColor}
            strokeWidth="2"
          />

          {/* House icon */}
          <rect
            x="35"
            y="48"
            width="20"
            height="14"
            rx="1"
            fill={secondaryColor}
            fillOpacity="0.6"
          />
          <path
            d="M33 48 L45 38 L57 48"
            fill={secondaryColor}
            fillOpacity="0.8"
          />

          {/* Key */}
          <circle cx="50" cy="58" r="3" fill={secondaryColor} />
          <rect x="53" y="56" width="6" height="3" rx="1" fill={secondaryColor} />

          <text
            x="45"
            y="82"
            textAnchor="middle"
            fill={secondaryColor}
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
          >
            BUY
          </text>
        </g>

        {/* SELL destination */}
        <g
          filter="url(#readyGlow)"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "scale(1)" : "scale(0.5)",
            transformOrigin: "155px 50px",
            transition: "all 0.5s ease-out 0.4s",
          }}
        >
          <circle
            cx="155"
            cy="50"
            r="25"
            fill={accentColor}
            fillOpacity="0.2"
            stroke={accentColor}
            strokeWidth="2"
          />

          {/* For sale sign */}
          <rect
            x="150"
            y="45"
            width="4"
            height="20"
            rx="1"
            fill={accentColor}
          />
          <rect
            x="142"
            y="38"
            width="20"
            height="12"
            rx="2"
            fill={accentColor}
          />
          <text
            x="152"
            y="47"
            textAnchor="middle"
            fill="white"
            fontSize="5"
            fontFamily="monospace"
            fontWeight="bold"
          >
            SALE
          </text>

          <text
            x="155"
            y="82"
            textAnchor="middle"
            fill={accentColor}
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
          >
            SELL
          </text>
        </g>

        {/* Person at fork */}
        <g
          filter="url(#pathGlow)"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "scale(1)" : "scale(0)",
            transformOrigin: "100px 130px",
            transition: "all 0.5s ease-out 0.5s",
          }}
        >
          {/* Body */}
          <circle cx="100" cy="115" r="10" fill={primaryColor} />
          <rect
            x="93"
            y="127"
            width="14"
            height="25"
            rx="4"
            fill={primaryColor}
            fillOpacity="0.8"
          />

          {/* Arms pointing both ways */}
          <line
            x1="93"
            y1="135"
            x2="75"
            y2="125"
            stroke={primaryColor}
            strokeWidth="4"
            strokeLinecap="round"
          />
          <line
            x1="107"
            y1="135"
            x2="125"
            y2="125"
            stroke={primaryColor}
            strokeWidth="4"
            strokeLinecap="round"
          />
        </g>

        {/* Decision sparkles */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.6s",
          }}
        >
          {[
            { x: 100, y: 100, color: primaryColor },
            { x: 80, y: 108, color: secondaryColor },
            { x: 120, y: 108, color: accentColor },
          ].map((s, i) => (
            <g
              key={i}
              style={{
                animationName: "decide",
                animationDuration: "2s",
                animationIterationCount: "infinite",
                animationDelay: `${i * 0.3}s`,
              }}
            >
              <circle cx={s.x} cy={s.y} r="3" fill={s.color} />
            </g>
          ))}
        </g>

        {/* Question marks floating */}
        <g
          style={{
            opacity: mounted ? 0.6 : 0,
            transition: "opacity 0.5s ease-out 0.7s",
          }}
        >
          <text
            x="100"
            y="98"
            textAnchor="middle"
            fill={primaryColor}
            fontSize="14"
            fontFamily="monospace"
            style={{
              animationName: "float",
              animationDuration: "2s",
              animationIterationCount: "infinite",
            }}
          >
            ?
          </text>
        </g>

        {/* Arrow indicators */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.5s",
          }}
        >
          {/* Left arrow */}
          <path
            d="M65 95 L55 85 L55 90 L45 90 L45 80 L55 80 L55 75 L65 85"
            fill={secondaryColor}
            fillOpacity="0.6"
            style={{
              animationName: "pulseLeft",
              animationDuration: "1.5s",
              animationIterationCount: "infinite",
            }}
          />

          {/* Right arrow */}
          <path
            d="M135 95 L145 85 L145 90 L155 90 L155 80 L145 80 L145 75 L135 85"
            fill={accentColor}
            fillOpacity="0.6"
            style={{
              animationName: "pulseRight",
              animationDuration: "1.5s",
              animationIterationCount: "infinite",
            }}
          />
        </g>

        {/* Ready badge */}
        <g
          filter="url(#readyGlow)"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "scale(1)" : "scale(0)",
            transformOrigin: "100px 25px",
            transition: "all 0.4s ease-out 0.8s",
          }}
        >
          <rect
            x="65"
            y="15"
            width="70"
            height="20"
            rx="10"
            fill="url(#readyGrad)"
          />
          <text
            x="100"
            y="29"
            textAnchor="middle"
            fill="white"
            fontSize="9"
            fontFamily="monospace"
            fontWeight="bold"
          >
            READY!
          </text>
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
          READY TO ACT
        </text>

        <style>{`
          @keyframes decide {
            0%, 100% { opacity: 0.4; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.3); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
          @keyframes pulseLeft {
            0%, 100% { transform: translateX(0); opacity: 0.6; }
            50% { transform: translateX(-3px); opacity: 1; }
          }
          @keyframes pulseRight {
            0%, 100% { transform: translateX(0); opacity: 0.6; }
            50% { transform: translateX(3px); opacity: 1; }
          }
        `}</style>
      </svg>
    </div>
  );
}
