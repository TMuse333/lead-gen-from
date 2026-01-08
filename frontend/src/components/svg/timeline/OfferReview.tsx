"use client";

import { useState, useEffect } from "react";

/**
 * OfferReview - Multiple offers to evaluate
 *
 * Stack of offer documents, comparison scale, best offer highlighted.
 * Conveys: "Weighing your options"
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

export default function OfferReview({ className = "", size = 200 }: Props) {
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
          <linearGradient id="offerReviewGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>

          <filter id="offerGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="bestGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Stack of offer documents */}
        <g>
          {/* Back offers (stack effect) */}
          {[2, 1, 0].map((i) => (
            <g
              key={i}
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? `translateY(0)` : `translateY(${20 - i * 5}px)`,
                transition: `all 0.4s ease-out ${0.1 + i * 0.1}s`,
              }}
            >
              <rect
                x={30 + i * 4}
                y={55 + i * 5}
                width="55"
                height="70"
                rx="4"
                fill={i === 0 ? "white" : primaryColor}
                fillOpacity={i === 0 ? 0.95 : 0.2 - i * 0.05}
                stroke={primaryColor}
                strokeWidth={i === 0 ? 2 : 1}
              />

              {i === 0 && (
                <>
                  {/* Offer header */}
                  <rect
                    x="30"
                    y="55"
                    width="55"
                    height="15"
                    rx="4"
                    fill={primaryColor}
                    fillOpacity="0.2"
                  />
                  <text
                    x="57.5"
                    y="66"
                    textAnchor="middle"
                    fill={primaryColor}
                    fontSize="7"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    OFFER #1
                  </text>

                  {/* Price */}
                  <text
                    x="57.5"
                    y="85"
                    textAnchor="middle"
                    fill={primaryColor}
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    $445K
                  </text>

                  {/* Details */}
                  <line x1="35" y1="95" x2="80" y2="95" stroke={primaryColor} strokeWidth="1" strokeOpacity="0.3" />
                  <text x="38" y="105" fill={primaryColor} fontSize="5" fontFamily="monospace" fillOpacity="0.7">
                    Cash offer
                  </text>
                  <text x="38" y="115" fill={primaryColor} fontSize="5" fontFamily="monospace" fillOpacity="0.7">
                    30 day close
                  </text>
                </>
              )}
            </g>
          ))}
        </g>

        {/* Best offer - highlighted */}
        <g
          filter="url(#bestGlow)"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "scale(1) rotate(-3deg)" : "scale(0.8) rotate(-3deg)",
            transformOrigin: "140px 90px",
            transition: "all 0.5s ease-out 0.4s",
          }}
        >
          <rect
            x="105"
            y="50"
            width="65"
            height="80"
            rx="4"
            fill={secondaryColor}
            fillOpacity="0.15"
            stroke={secondaryColor}
            strokeWidth="2"
          />

          {/* Best badge */}
          <g transform="translate(155, 45)">
            <circle r="12" fill={secondaryColor} />
            <text y="4" textAnchor="middle" fill="white" fontSize="6" fontFamily="monospace" fontWeight="bold">
              BEST
            </text>
          </g>

          {/* Offer header */}
          <rect
            x="105"
            y="50"
            width="65"
            height="18"
            rx="4"
            fill={secondaryColor}
            fillOpacity="0.3"
          />
          <text
            x="137.5"
            y="63"
            textAnchor="middle"
            fill={secondaryColor}
            fontSize="8"
            fontFamily="monospace"
            fontWeight="bold"
          >
            OFFER #3
          </text>

          {/* Price - bigger */}
          <text
            x="137.5"
            y="88"
            textAnchor="middle"
            fill={secondaryColor}
            fontSize="14"
            fontFamily="monospace"
            fontWeight="bold"
          >
            $465K
          </text>

          {/* Details */}
          <line x1="110" y1="98" x2="165" y2="98" stroke={secondaryColor} strokeWidth="1" strokeOpacity="0.3" />
          <text x="115" y="110" fill={secondaryColor} fontSize="6" fontFamily="monospace">
            Pre-approved
          </text>
          <text x="115" y="120" fill={secondaryColor} fontSize="6" fontFamily="monospace">
            Flexible close
          </text>
        </g>

        {/* Comparison scale */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.5s",
          }}
        >
          {/* Scale base */}
          <polygon
            points="100,175 90,185 110,185"
            fill={primaryColor}
            fillOpacity="0.6"
          />
          <line
            x1="100"
            y1="175"
            x2="100"
            y2="155"
            stroke={primaryColor}
            strokeWidth="3"
          />

          {/* Balance beam - tilted toward best offer */}
          <g
            style={{
              transform: mounted ? "rotate(10deg)" : "rotate(0deg)",
              transformOrigin: "100px 155px",
              transition: "transform 0.8s ease-out 0.7s",
            }}
          >
            <line
              x1="60"
              y1="155"
              x2="140"
              y2="155"
              stroke={primaryColor}
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Left plate (other offers) */}
            <rect
              x="50"
              y="155"
              width="25"
              height="5"
              rx="2"
              fill={primaryColor}
            />
            <text x="62.5" y="170" textAnchor="middle" fill={primaryColor} fontSize="6" fontFamily="monospace">
              Others
            </text>

            {/* Right plate (best offer) - lower/heavier */}
            <rect
              x="125"
              y="155"
              width="25"
              height="5"
              rx="2"
              fill={secondaryColor}
            />
            <text x="137.5" y="170" textAnchor="middle" fill={secondaryColor} fontSize="6" fontFamily="monospace">
              Best
            </text>
          </g>
        </g>

        {/* Count indicator */}
        <g
          filter="url(#offerGlow)"
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.6s",
          }}
        >
          <rect
            x="15"
            y="15"
            width="50"
            height="30"
            rx="6"
            fill={accentColor}
            fillOpacity="0.2"
            stroke={accentColor}
            strokeWidth="1"
          />
          <text x="40" y="28" textAnchor="middle" fill={accentColor} fontSize="7" fontFamily="monospace">
            OFFERS
          </text>
          <text x="40" y="40" textAnchor="middle" fill={accentColor} fontSize="12" fontFamily="monospace" fontWeight="bold">
            3
          </text>
        </g>

        {/* Sparkles on best offer */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.8s",
          }}
        >
          {[
            { x: 175, y: 55 },
            { x: 180, y: 85 },
            { x: 100, y: 45 },
          ].map((s, i) => (
            <g
              key={i}
              style={{
                animationName: "sparkle",
                animationDuration: "1.5s",
                animationIterationCount: "infinite",
                animationDelay: `${i * 0.3}s`,
              }}
            >
              <circle cx={s.x} cy={s.y} r="3" fill={secondaryColor} />
            </g>
          ))}
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
            transition: "opacity 0.5s ease-out 0.9s",
          }}
        >
          REVIEWING OFFERS
        </text>

        <style>{`
          @keyframes sparkle {
            0%, 100% { opacity: 0.4; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.3); }
          }
        `}</style>
      </svg>
    </div>
  );
}
