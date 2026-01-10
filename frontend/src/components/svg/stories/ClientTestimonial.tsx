"use client";

import { useState, useEffect } from "react";

/**
 * ClientTestimonial - 5-star review card animation
 * Represents happy client reviews
 */

const CONFIG = {
  primaryBlue: "#0077b3",
  lightBlue: "#00bfff",
  gold: "#FFD700",
  googleBlue: "#4285F4",
  googleGreen: "#34A853",
  googleYellow: "#FBBC05",
  googleRed: "#EA4335",
  white: "#ffffff",
};

interface Props {
  size?: number;
  progress?: number;
  autoAnimate?: boolean;
}

export default function ClientTestimonial({
  size = 200,
  progress,
  autoAnimate = true,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [animProgress, setAnimProgress] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!autoAnimate || progress !== undefined) return;

    let frame: number;
    let start: number;
    const duration = 3500;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const p = Math.min(elapsed / duration, 1);
      setAnimProgress(p);
      if (p < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [autoAnimate, progress]);

  const p = progress ?? animProgress;
  const width = size * 1.4;
  const height = size;
  const cx = width / 2;

  const stars = [0, 1, 2, 3, 4];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ overflow: "visible" }}
    >
      <defs>
        <filter id="testimonial-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.15" />
        </filter>

        <filter id="star-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <linearGradient id="avatar-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={CONFIG.primaryBlue} />
          <stop offset="100%" stopColor={CONFIG.lightBlue} />
        </linearGradient>
      </defs>

      <style>
        {`
          @keyframes star-pop {
            0% { transform: scale(0) rotate(-180deg); }
            60% { transform: scale(1.3) rotate(10deg); }
            100% { transform: scale(1) rotate(0deg); }
          }
          @keyframes card-lift {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
          }
        `}
      </style>

      {/* Review card */}
      <g
        style={{
          opacity: mounted && p > 0.1 ? 1 : 0,
          transform: `scale(${mounted && p > 0.1 ? 1 : 0.9})`,
          transformOrigin: `${cx}px ${height / 2}px`,
          transition: "all 0.5s ease-out",
          animation: mounted && p > 0.9 ? "card-lift 3s ease-in-out infinite" : "none",
        }}
      >
        <rect
          x={20}
          y={25}
          width={width - 40}
          height={height - 50}
          rx={16}
          fill={CONFIG.white}
          filter="url(#testimonial-shadow)"
        />

        {/* Blue accent line at top */}
        <rect
          x={20}
          y={25}
          width={width - 40}
          height={6}
          rx={3}
          fill={CONFIG.primaryBlue}
        />
      </g>

      {/* Quote marks */}
      {mounted && p > 0.2 && (
        <text
          x={35}
          y={65}
          fontSize="30"
          fill={CONFIG.primaryBlue}
          fillOpacity="0.2"
          fontFamily="Georgia, serif"
          style={{
            opacity: p > 0.3 ? 1 : 0,
            transition: "opacity 0.3s ease-out",
          }}
        >
          "
        </text>
      )}

      {/* Review text placeholder lines */}
      {mounted && p > 0.3 && (
        <g
          style={{
            opacity: p > 0.4 ? 1 : 0,
            transition: "opacity 0.5s ease-out",
          }}
        >
          <rect x={40} y={70} width={width - 80} height={8} rx={4} fill="#e2e8f0" />
          <rect x={40} y={85} width={width - 100} height={8} rx={4} fill="#e2e8f0" />
          <rect x={40} y={100} width={width - 120} height={8} rx={4} fill="#e2e8f0" />
        </g>
      )}

      {/* 5 Stars */}
      <g>
        {stars.map((i) => {
          const starX = cx - 50 + i * 25;
          const starY = 130;
          const starDelay = 0.4 + i * 0.08;
          const isVisible = p > starDelay;

          return (
            <text
              key={i}
              x={starX}
              y={starY}
              fontSize="20"
              fill={CONFIG.gold}
              textAnchor="middle"
              filter="url(#star-glow)"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "scale(1) rotate(0deg)" : "scale(0) rotate(-180deg)",
                transformOrigin: `${starX}px ${starY - 10}px`,
                transition: `all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${starDelay}s`,
              }}
            >
              ★
            </text>
          );
        })}
      </g>

      {/* Avatar and name */}
      {mounted && p > 0.6 && (
        <g
          style={{
            opacity: p > 0.7 ? 1 : 0,
            transition: "opacity 0.5s ease-out",
          }}
        >
          {/* Avatar */}
          <circle
            cx={55}
            cy={height - 40}
            r={18}
            fill="url(#avatar-gradient)"
          />
          <text
            x={55}
            y={height - 35}
            textAnchor="middle"
            fontSize="14"
            fontWeight="bold"
            fill={CONFIG.white}
          >
            JD
          </text>

          {/* Name */}
          <text
            x={80}
            y={height - 45}
            fontSize="12"
            fontWeight="bold"
            fill="#1a1a1a"
          >
            John D.
          </text>
          <text
            x={80}
            y={height - 30}
            fontSize="10"
            fill="#64748b"
          >
            Verified Buyer
          </text>
        </g>
      )}

      {/* Google icon indicator */}
      {mounted && p > 0.8 && (
        <g
          style={{
            opacity: p > 0.85 ? 1 : 0,
            transition: "opacity 0.3s ease-out",
          }}
        >
          <circle
            cx={width - 45}
            cy={height - 40}
            r={14}
            fill={CONFIG.white}
            stroke="#e2e8f0"
            strokeWidth="1"
          />
          <text
            x={width - 45}
            y={height - 35}
            textAnchor="middle"
            fontSize="12"
            fontWeight="bold"
            fill={CONFIG.googleBlue}
          >
            G
          </text>
        </g>
      )}

      {/* "50+ Reviews" badge */}
      {mounted && p > 0.9 && (
        <g
          style={{
            opacity: p > 0.95 ? 1 : 0,
            transition: "opacity 0.3s ease-out",
          }}
        >
          <rect
            x={cx - 40}
            y={height - 18}
            width={80}
            height={20}
            rx={10}
            fill={CONFIG.primaryBlue}
          />
          <text
            x={cx}
            y={height - 4}
            textAnchor="middle"
            fontSize="10"
            fontWeight="bold"
            fill={CONFIG.white}
          >
            50+ Reviews
          </text>
        </g>
      )}
    </svg>
  );
}
