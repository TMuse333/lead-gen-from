"use client";

import { useState, useEffect } from "react";

/**
 * ClosingSale - Final step in selling journey
 *
 * Keys handed over, SOLD sign, celebration.
 * Conveys: "Congratulations, you've sold!"
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

export default function ClosingSale({ className = "", size = 200 }: Props) {
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
          <linearGradient id="closingSaleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>

          <filter id="closingGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="celebrateGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* SOLD sign */}
        <g
          filter="url(#closingGlow)"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "scale(1) rotate(-5deg)" : "scale(0) rotate(-5deg)",
            transformOrigin: "55px 70px",
            transition: "all 0.5s ease-out 0.2s",
          }}
        >
          {/* Sign post */}
          <rect
            x="52"
            y="70"
            width="6"
            height="75"
            rx="1"
            fill={primaryColor}
          />

          {/* Sign board */}
          <rect
            x="25"
            y="35"
            width="60"
            height="40"
            rx="4"
            fill="white"
            stroke={primaryColor}
            strokeWidth="2"
          />

          {/* SOLD banner over it */}
          <rect
            x="20"
            y="45"
            width="70"
            height="22"
            rx="2"
            fill={accentColor}
            transform="rotate(-8, 55, 56)"
          />
          <text
            x="55"
            y="61"
            textAnchor="middle"
            fill="white"
            fontSize="14"
            fontFamily="monospace"
            fontWeight="bold"
            transform="rotate(-8, 55, 56)"
          >
            SOLD!
          </text>
        </g>

        {/* Key handoff */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.4s",
          }}
        >
          {/* Hand giving */}
          <g
            style={{
              transform: mounted ? "translateX(0)" : "translateX(-20px)",
              transition: "transform 0.6s ease-out 0.5s",
            }}
          >
            <path
              d="M110 100 Q120 95 130 100 Q135 105 130 115 L115 120 Q110 115 110 100"
              fill={primaryColor}
              fillOpacity="0.6"
            />
          </g>

          {/* Key */}
          <g
            filter="url(#celebrateGlow)"
            style={{
              transform: mounted ? "translate(0, 0) rotate(0deg)" : "translate(-30px, -10px) rotate(-30deg)",
              transformOrigin: "145px 105px",
              transition: "all 0.6s ease-out 0.6s",
            }}
          >
            {/* Key head */}
            <circle
              cx="145"
              cy="100"
              r="10"
              fill={secondaryColor}
              stroke={secondaryColor}
              strokeWidth="2"
            />
            <circle
              cx="145"
              cy="100"
              r="4"
              fill="none"
              stroke="white"
              strokeWidth="2"
            />

            {/* Key shaft */}
            <rect
              x="153"
              y="97"
              width="20"
              height="6"
              rx="1"
              fill={secondaryColor}
            />

            {/* Key teeth */}
            <rect x="165" y="103" width="3" height="5" fill={secondaryColor} />
            <rect x="170" y="103" width="3" height="4" fill={secondaryColor} />
          </g>

          {/* Hand receiving */}
          <g
            style={{
              transform: mounted ? "translateX(0)" : "translateX(20px)",
              transition: "transform 0.6s ease-out 0.5s",
            }}
          >
            <path
              d="M165 120 Q175 115 180 120 Q185 130 175 135 L160 130 Q155 125 165 120"
              fill={primaryColor}
              fillOpacity="0.5"
            />
          </g>
        </g>

        {/* Money/check */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(15px)",
            transition: "all 0.5s ease-out 0.7s",
          }}
        >
          <rect
            x="120"
            y="140"
            width="55"
            height="30"
            rx="3"
            fill={secondaryColor}
            fillOpacity="0.2"
            stroke={secondaryColor}
            strokeWidth="1.5"
          />
          <text
            x="147.5"
            y="155"
            textAnchor="middle"
            fill={secondaryColor}
            fontSize="7"
            fontFamily="monospace"
          >
            PROCEEDS
          </text>
          <text
            x="147.5"
            y="165"
            textAnchor="middle"
            fill={secondaryColor}
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
          >
            $465,000
          </text>
        </g>

        {/* Celebration confetti */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.8s",
          }}
        >
          {[
            { x: 30, y: 25, color: primaryColor, shape: "rect" },
            { x: 75, y: 15, color: secondaryColor, shape: "circle" },
            { x: 120, y: 20, color: accentColor, shape: "rect" },
            { x: 165, y: 30, color: primaryColor, shape: "circle" },
            { x: 180, y: 50, color: secondaryColor, shape: "rect" },
            { x: 15, y: 60, color: accentColor, shape: "circle" },
            { x: 45, y: 140, color: secondaryColor, shape: "rect" },
            { x: 185, y: 90, color: primaryColor, shape: "circle" },
          ].map((c, i) => (
            <g
              key={i}
              style={{
                animationName: "confetti",
                animationDuration: "2s",
                animationIterationCount: "infinite",
                animationDelay: `${i * 0.2}s`,
              }}
            >
              {c.shape === "rect" ? (
                <rect
                  x={c.x}
                  y={c.y}
                  width="6"
                  height="6"
                  rx="1"
                  fill={c.color}
                  transform={`rotate(${i * 30}, ${c.x + 3}, ${c.y + 3})`}
                />
              ) : (
                <circle cx={c.x} cy={c.y} r="4" fill={c.color} />
              )}
            </g>
          ))}
        </g>

        {/* Celebration burst from SOLD sign */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.6s",
          }}
        >
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <line
              key={i}
              x1={55 + Math.cos((angle * Math.PI) / 180) * 35}
              y1={55 + Math.sin((angle * Math.PI) / 180) * 25}
              x2={55 + Math.cos((angle * Math.PI) / 180) * 45}
              y2={55 + Math.sin((angle * Math.PI) / 180) * 32}
              stroke={i % 2 === 0 ? primaryColor : secondaryColor}
              strokeWidth="2"
              strokeLinecap="round"
              style={{
                animationName: "burst",
                animationDuration: "1.5s",
                animationIterationCount: "infinite",
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </g>

        {/* Success checkmark */}
        <g
          filter="url(#celebrateGlow)"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "scale(1)" : "scale(0)",
            transformOrigin: "100px 175px",
            transition: "all 0.4s ease-out 0.9s",
          }}
        >
          <circle cx="100" cy="175" r="12" fill={secondaryColor} />
          <path
            d="M94 175 L98 179 L106 171"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>

        {/* Label */}
        <text
          x="100"
          y="195"
          textAnchor="middle"
          fill={primaryColor}
          fontSize="10"
          fontFamily="monospace"
          fontWeight="bold"
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease-out 1s",
          }}
        >
          CLOSING COMPLETE
        </text>

        <style>{`
          @keyframes confetti {
            0%, 100% { opacity: 0.6; transform: translateY(0) rotate(0deg); }
            50% { opacity: 1; transform: translateY(-5px) rotate(180deg); }
          }
          @keyframes burst {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 0.2; }
          }
        `}</style>
      </svg>
    </div>
  );
}
