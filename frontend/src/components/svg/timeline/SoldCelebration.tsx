"use client";

import { useState, useEffect } from "react";

/**
 * SoldCelebration - SOLD sign with celebration effects
 * Chris Crowell style with red banner and confetti
 */

const CONFIG = {
  accentRed: "#CC0000",
  darkRed: "#A30000",
  primaryBlue: "#0077b3",
  gold: "#FFD700",
  white: "#ffffff",
};

interface Props {
  size?: number;
  progress?: number;
  autoAnimate?: boolean;
}

export default function SoldCelebration({
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
    const duration = 3000;

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
  const width = size;
  const height = size * 1.2;
  const cx = width / 2;

  // Confetti particles
  const confetti = [
    { x: 20, y: 30, color: CONFIG.accentRed, delay: 0 },
    { x: width - 25, y: 40, color: CONFIG.primaryBlue, delay: 0.1 },
    { x: 35, y: 60, color: CONFIG.gold, delay: 0.2 },
    { x: width - 40, y: 55, color: CONFIG.accentRed, delay: 0.15 },
    { x: 50, y: 25, color: CONFIG.primaryBlue, delay: 0.25 },
    { x: width - 55, y: 35, color: CONFIG.gold, delay: 0.3 },
    { x: 25, y: 80, color: CONFIG.gold, delay: 0.35 },
    { x: width - 30, y: 75, color: CONFIG.accentRed, delay: 0.05 },
  ];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ overflow: "visible" }}
    >
      <defs>
        <filter id="sold-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <linearGradient id="sold-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={CONFIG.accentRed} />
          <stop offset="100%" stopColor={CONFIG.darkRed} />
        </linearGradient>

        <linearGradient id="post-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#5a4a3a" />
          <stop offset="50%" stopColor="#8b7355" />
          <stop offset="100%" stopColor="#5a4a3a" />
        </linearGradient>
      </defs>

      <style>
        {`
          @keyframes confetti-fall {
            0% { transform: translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(50px) rotate(180deg); opacity: 0; }
          }
          @keyframes banner-swing {
            0%, 100% { transform: rotate(-2deg); }
            50% { transform: rotate(2deg); }
          }
          @keyframes star-burst {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.3); opacity: 1; }
          }
        `}
      </style>

      {/* Sign post */}
      <rect
        x={cx - 6}
        y={70}
        width={12}
        height={height - 80}
        rx={2}
        fill="url(#post-gradient)"
        style={{
          transform: `scaleY(${mounted && p > 0.1 ? 1 : 0})`,
          transformOrigin: `${cx}px ${height}px`,
          transition: "transform 0.5s ease-out",
        }}
      />

      {/* Sign hanging hardware */}
      <circle
        cx={cx - 30}
        cy={78}
        r={4}
        fill="#8b7355"
        style={{
          opacity: mounted && p > 0.3 ? 1 : 0,
          transition: "opacity 0.3s",
        }}
      />
      <circle
        cx={cx + 30}
        cy={78}
        r={4}
        fill="#8b7355"
        style={{
          opacity: mounted && p > 0.3 ? 1 : 0,
          transition: "opacity 0.3s",
        }}
      />

      {/* SOLD banner */}
      <g
        style={{
          transform: `scale(${mounted && p > 0.3 ? 1 : 0})`,
          transformOrigin: `${cx}px 78px`,
          transition: "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s",
          animation: mounted && p > 0.8 ? "banner-swing 3s ease-in-out infinite" : "none",
        }}
      >
        <rect
          x={cx - 70}
          y={85}
          width={140}
          height={55}
          rx={6}
          fill="url(#sold-bg)"
          filter="url(#sold-glow)"
        />

        {/* Inner border */}
        <rect
          x={cx - 64}
          y={91}
          width={128}
          height={43}
          rx={4}
          fill="none"
          stroke={CONFIG.white}
          strokeWidth="2"
          strokeOpacity="0.3"
        />

        {/* SOLD text */}
        <text
          x={cx}
          y={123}
          textAnchor="middle"
          fontSize="32"
          fontFamily="Arial, sans-serif"
          fontWeight="bold"
          fill={CONFIG.white}
          letterSpacing="4"
        >
          SOLD
        </text>
      </g>

      {/* Confetti */}
      {mounted && p > 0.6 && (
        <>
          {confetti.map((c, i) => (
            <g key={i}>
              <rect
                x={c.x}
                y={c.y}
                width={8}
                height={12}
                rx={1}
                fill={c.color}
                style={{
                  animation: `confetti-fall 2s ease-out infinite ${c.delay}s`,
                  transformOrigin: `${c.x + 4}px ${c.y + 6}px`,
                }}
              />
            </g>
          ))}
        </>
      )}

      {/* Star bursts */}
      {mounted && p > 0.7 && (
        <>
          {[
            { x: cx - 85, y: 90 },
            { x: cx + 85, y: 90 },
            { x: cx, y: 50 },
          ].map((star, i) => (
            <text
              key={i}
              x={star.x}
              y={star.y}
              fontSize="20"
              fill={CONFIG.gold}
              textAnchor="middle"
              style={{
                animation: `star-burst 1.5s ease-in-out infinite ${i * 0.2}s`,
              }}
            >
              ★
            </text>
          ))}
        </>
      )}

      {/* Success message */}
      {mounted && p > 0.8 && (
        <text
          x={cx}
          y={height - 15}
          textAnchor="middle"
          fontSize="11"
          fontFamily="Arial, sans-serif"
          fontWeight="bold"
          fill={CONFIG.primaryBlue}
          style={{
            opacity: p > 0.9 ? 1 : 0,
            transition: "opacity 0.5s ease-out",
          }}
        >
          ANOTHER HAPPY CLIENT!
        </text>
      )}
    </svg>
  );
}
