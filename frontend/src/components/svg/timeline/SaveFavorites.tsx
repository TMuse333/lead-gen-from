"use client";

import { useState, useEffect } from "react";

/**
 * SaveFavorites - Saving and bookmarking properties
 *
 * Heart icons, property cards being saved, collection.
 * Conveys: "Building your wishlist"
 */

const CONFIG = {
  primaryColor: "#3b82f6",
  secondaryColor: "#ef4444", // Red for hearts
  accentColor: "#10b981",
};

interface Props {
  className?: string;
  size?: number;
}

export default function SaveFavorites({ className = "", size = 200 }: Props) {
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
          <filter id="heartGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="bigHeartGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Favorites collection folder */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease-out",
          }}
        >
          <path
            d="M25 55 L25 145 Q25 150 30 150 L95 150 Q100 150 100 145 L100 65 L85 65 L80 55 L25 55"
            fill={primaryColor}
            fillOpacity="0.15"
            stroke={primaryColor}
            strokeWidth="2"
          />

          {/* Folder tab */}
          <rect
            x="25"
            y="50"
            width="55"
            height="12"
            rx="3"
            fill={primaryColor}
            fillOpacity="0.3"
          />
          <text
            x="52.5"
            y="59"
            textAnchor="middle"
            fill={primaryColor}
            fontSize="6"
            fontFamily="monospace"
            fontWeight="bold"
          >
            FAVORITES
          </text>
        </g>

        {/* Saved property cards in folder */}
        <g>
          {[
            { x: 35, y: 75, delay: 0.3 },
            { x: 50, y: 85, delay: 0.4 },
            { x: 65, y: 95, delay: 0.5 },
          ].map((card, i) => (
            <g
              key={i}
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(20px)",
                transition: `all 0.4s ease-out ${card.delay}s`,
              }}
            >
              <rect
                x={card.x}
                y={card.y}
                width="40"
                height="50"
                rx="3"
                fill="white"
                fillOpacity="0.9"
                stroke={primaryColor}
                strokeWidth="1"
              />

              {/* Mini house */}
              <rect
                x={card.x + 8}
                y={card.y + 8}
                width="24"
                height="18"
                rx="1"
                fill={primaryColor}
                fillOpacity="0.2"
              />
              <path
                d={`M${card.x + 7} ${card.y + 8} L${card.x + 20} ${card.y + 1} L${card.x + 33} ${card.y + 8}`}
                fill={primaryColor}
                fillOpacity="0.3"
              />

              {/* Heart on card */}
              <path
                d={`M${card.x + 30} ${card.y + 34}
                   C${card.x + 27} ${card.y + 31} ${card.x + 23} ${card.y + 32} ${card.x + 23} ${card.y + 36}
                   C${card.x + 23} ${card.y + 40} ${card.x + 30} ${card.y + 45} ${card.x + 30} ${card.y + 45}
                   C${card.x + 30} ${card.y + 45} ${card.x + 37} ${card.y + 40} ${card.x + 37} ${card.y + 36}
                   C${card.x + 37} ${card.y + 32} ${card.x + 33} ${card.y + 31} ${card.x + 30} ${card.y + 34}`}
                fill={secondaryColor}
              />
            </g>
          ))}
        </g>

        {/* Count badge */}
        <g
          filter="url(#heartGlow)"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "scale(1)" : "scale(0)",
            transformOrigin: "95px 55px",
            transition: "all 0.4s ease-out 0.6s",
          }}
        >
          <circle cx="95" cy="55" r="12" fill={secondaryColor} />
          <text
            x="95"
            y="59"
            textAnchor="middle"
            fill="white"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
          >
            3
          </text>
        </g>

        {/* Property being saved (animated) */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translate(0, 0)" : "translate(30px, -30px)",
            transition: "all 0.6s ease-out 0.4s",
          }}
        >
          <rect
            x="120"
            y="45"
            width="60"
            height="75"
            rx="4"
            fill="white"
            fillOpacity="0.95"
            stroke={primaryColor}
            strokeWidth="2"
          />

          {/* House image area */}
          <rect
            x="125"
            y="50"
            width="50"
            height="35"
            rx="2"
            fill={primaryColor}
            fillOpacity="0.15"
          />

          {/* House icon */}
          <rect
            x="140"
            y="60"
            width="20"
            height="15"
            rx="1"
            fill={primaryColor}
            fillOpacity="0.3"
          />
          <path
            d="M138 60 L150 50 L162 60"
            fill={primaryColor}
            fillOpacity="0.4"
          />

          {/* Price */}
          <text
            x="150"
            y="98"
            textAnchor="middle"
            fill={primaryColor}
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
          >
            $385K
          </text>

          {/* Details */}
          <text
            x="150"
            y="110"
            textAnchor="middle"
            fill={primaryColor}
            fontSize="6"
            fontFamily="monospace"
            fillOpacity="0.7"
          >
            3bd • 2ba • 1,850sf
          </text>
        </g>

        {/* Big animated heart */}
        <g
          filter="url(#bigHeartGlow)"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "scale(1)" : "scale(0)",
            transformOrigin: "165px 35px",
            transition: "all 0.5s ease-out 0.7s",
          }}
        >
          <path
            d="M165 28
               C160 22 152 23 152 30
               C152 37 165 47 165 47
               C165 47 178 37 178 30
               C178 23 170 22 165 28"
            fill={secondaryColor}
            style={{
              animationName: "heartbeat",
              animationDuration: "1.5s",
              animationIterationCount: "infinite",
            }}
          />
        </g>

        {/* Arrow showing save action */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.6s",
          }}
        >
          <path
            d="M115 100 Q100 115 85 120"
            fill="none"
            stroke={accentColor}
            strokeWidth="2"
            strokeDasharray="4 2"
            style={{
              strokeDashoffset: mounted ? 0 : 40,
              transition: "stroke-dashoffset 0.8s ease-out 0.7s",
            }}
          />
          <polygon
            points="85,115 80,125 90,122"
            fill={accentColor}
          />
        </g>

        {/* Floating hearts */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.8s",
          }}
        >
          {[
            { x: 140, y: 135 },
            { x: 160, y: 145 },
            { x: 175, y: 130 },
          ].map((h, i) => (
            <path
              key={i}
              d={`M${h.x} ${h.y - 3}
                 C${h.x - 2} ${h.y - 5} ${h.x - 4} ${h.y - 4.5} ${h.x - 4} ${h.y - 2}
                 C${h.x - 4} ${h.y + 1} ${h.x} ${h.y + 4} ${h.x} ${h.y + 4}
                 C${h.x} ${h.y + 4} ${h.x + 4} ${h.y + 1} ${h.x + 4} ${h.y - 2}
                 C${h.x + 4} ${h.y - 4.5} ${h.x + 2} ${h.y - 5} ${h.x} ${h.y - 3}`}
              fill={secondaryColor}
              fillOpacity="0.6"
              style={{
                animationName: "floatUp",
                animationDuration: "2s",
                animationIterationCount: "infinite",
                animationDelay: `${i * 0.4}s`,
              }}
            />
          ))}
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
          SAVE FAVORITES
        </text>

        <style>{`
          @keyframes heartbeat {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.15); }
          }
          @keyframes floatUp {
            0%, 100% { opacity: 0.6; transform: translateY(0); }
            50% { opacity: 0.3; transform: translateY(-8px); }
          }
        `}</style>
      </svg>
    </div>
  );
}
