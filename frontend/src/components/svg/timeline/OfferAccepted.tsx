"use client";

import { useState, useEffect } from "react";

/**
 * OfferAccepted - Making offer phase
 *
 * Contract/document with signature line and approval stamp.
 * Conveys: "Deal in progress!"
 */

const CONFIG = {
  primaryColor: "#06b6d4",
  secondaryColor: "#10b981",
  stampColor: "#ef4444",
};

interface Props {
  className?: string;
  size?: number;
}

export default function OfferAccepted({ className = "", size = 200 }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { primaryColor, secondaryColor, stampColor } = CONFIG;

  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        fill="none"
      >
        <defs>
          <linearGradient id="offerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>

          <filter id="offerGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="stampGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Document */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(15px)",
            transition: "all 0.5s ease-out",
          }}
        >
          {/* Paper */}
          <rect
            x="40"
            y="25"
            width="120"
            height="150"
            rx="4"
            fill="white"
            stroke={primaryColor}
            strokeWidth="2"
          />

          {/* Document lines */}
          {[45, 60, 75, 90].map((y, i) => (
            <line
              key={i}
              x1="55"
              y1={y}
              x2={130 - i * 10}
              y2={y}
              stroke={primaryColor}
              strokeWidth="2"
              strokeOpacity="0.3"
              style={{
                opacity: mounted ? 1 : 0,
                transition: `opacity 0.3s ease-out ${0.2 + i * 0.1}s`,
              }}
            />
          ))}

          {/* "OFFER" header */}
          <text
            x="100"
            y="42"
            textAnchor="middle"
            fill={primaryColor}
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
          >
            PURCHASE OFFER
          </text>
        </g>

        {/* Price section */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.3s",
          }}
        >
          <rect
            x="55"
            y="100"
            width="90"
            height="25"
            rx="4"
            fill={secondaryColor}
            fillOpacity="0.1"
            stroke={secondaryColor}
            strokeWidth="1"
          />
          <text
            x="100"
            y="117"
            textAnchor="middle"
            fill={secondaryColor}
            fontSize="12"
            fontFamily="monospace"
            fontWeight="bold"
          >
            $425,000
          </text>
        </g>

        {/* Signature line */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.4s",
          }}
        >
          <line
            x1="55"
            y1="145"
            x2="145"
            y2="145"
            stroke={primaryColor}
            strokeWidth="1"
          />
          <text
            x="55"
            y="155"
            fill={primaryColor}
            fontSize="6"
            fontFamily="monospace"
            opacity="0.6"
          >
            Signature
          </text>

          {/* Signature scribble */}
          <path
            d="M60 142 Q70 135 80 140 Q90 145 100 138 Q110 131 120 140"
            stroke={primaryColor}
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            style={{
              strokeDasharray: mounted ? "100" : "0",
              strokeDashoffset: "0",
              transition: "stroke-dasharray 0.8s ease-out 0.6s",
            }}
          />
        </g>

        {/* ACCEPTED stamp */}
        <g
          filter="url(#stampGlow)"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "rotate(-15deg) scale(1)" : "rotate(-15deg) scale(0)",
            transformOrigin: "130px 80px",
            transition: "all 0.4s ease-out 0.8s",
          }}
        >
          <rect
            x="95"
            y="55"
            width="70"
            height="30"
            rx="4"
            fill="none"
            stroke={secondaryColor}
            strokeWidth="3"
          />
          <text
            x="130"
            y="75"
            textAnchor="middle"
            fill={secondaryColor}
            fontSize="12"
            fontFamily="monospace"
            fontWeight="bold"
          >
            ACCEPTED
          </text>
        </g>

        {/* Checkmark seal */}
        <g
          filter="url(#offerGlow)"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "scale(1)" : "scale(0)",
            transformOrigin: "145px 155px",
            transition: "all 0.4s ease-out 1s",
          }}
        >
          <circle cx="145" cy="155" r="15" fill={secondaryColor} />
          <path
            d="M137 155 L142 160 L153 149"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>

        {/* Celebration particles */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease-out 1.1s",
          }}
        >
          {[
            { x: 35, y: 40, color: primaryColor },
            { x: 165, y: 35, color: secondaryColor },
            { x: 30, y: 120, color: secondaryColor },
            { x: 170, y: 130, color: primaryColor },
          ].map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="4"
              fill={p.color}
              style={{
                animationName: "float",
                animationDuration: "2s",
                animationIterationCount: "infinite",
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </g>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0); opacity: 0.6; }
            50% { transform: translateY(-5px); opacity: 1; }
          }
        `}</style>
      </svg>
    </div>
  );
}
