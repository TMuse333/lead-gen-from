// components/chat/TimelinePreviewSvg.tsx
'use client';

import { useState, useEffect } from 'react';

/**
 * Compact timeline preview SVG for chat header
 * Shows animated timeline path symbolizing personalized offer generation
 */

const CONFIG = {
  primaryCyan: '#06b6d4',
  lightCyan: '#22d3ee',
  success: '#10b981',
  white: '#ffffff',
  darkBg: '#0f172a',
  cardBg: '#1e293b',
};

interface Props {
  width?: number;
  height?: number;
}

export default function TimelinePreviewSvg({ width = 280, height = 80 }: Props) {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let frame: number;
    const animate = (timestamp: number) => {
      setTime(timestamp / 1000);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  const milestones = [
    { label: 'Start', x: 30 },
    { label: 'Plan', x: 100 },
    { label: 'Search', x: 170 },
    { label: 'Close', x: 240 },
  ];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ overflow: 'visible' }}
      className="mx-auto"
    >
      <defs>
        <filter id="tp-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <linearGradient id="tp-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={CONFIG.success} />
          <stop offset="100%" stopColor={CONFIG.primaryCyan} />
        </linearGradient>
      </defs>

      {/* Background track */}
      <path
        d={`M 30 40 Q 65 25 100 40 T 170 40 T 240 40`}
        fill="none"
        stroke={CONFIG.cardBg}
        strokeWidth="3"
        strokeLinecap="round"
        style={{
          opacity: mounted ? 1 : 0,
          transition: 'opacity 0.3s ease-out',
        }}
      />

      {/* Animated progress path */}
      <path
        d={`M 30 40 Q 65 25 100 40 T 170 40 T 240 40`}
        fill="none"
        stroke="url(#tp-gradient)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="250"
        strokeDashoffset={mounted ? 250 - ((time * 25) % 250) : 250}
        filter="url(#tp-glow)"
      />

      {/* Milestone nodes */}
      {milestones.map((milestone, i) => {
        const isActive = ((time * 0.4) % 4) > i;
        const pulse = Math.sin(time * 2 + i * 0.8) * 0.15;

        return (
          <g
            key={i}
            style={{
              opacity: mounted ? 0.9 + pulse : 0,
              transition: `opacity 0.3s ease-out ${0.1 + i * 0.08}s`,
            }}
          >
            {/* Node */}
            <circle
              cx={milestone.x}
              cy={40}
              r="10"
              fill={isActive ? CONFIG.primaryCyan : CONFIG.cardBg}
              stroke={CONFIG.primaryCyan}
              strokeWidth="2"
              filter={isActive ? 'url(#tp-glow)' : 'none'}
            />

            {/* Checkmark for active */}
            {isActive && (
              <polyline
                points={`${milestone.x - 4},40 ${milestone.x - 1},43 ${milestone.x + 5},36`}
                fill="none"
                stroke={CONFIG.darkBg}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Number for inactive */}
            {!isActive && (
              <text
                x={milestone.x}
                y={44}
                textAnchor="middle"
                fontSize="10"
                fontFamily="system-ui, sans-serif"
                fontWeight="600"
                fill={CONFIG.primaryCyan}
              >
                {i + 1}
              </text>
            )}

            {/* Label */}
            <text
              x={milestone.x}
              y={62}
              textAnchor="middle"
              fontSize="9"
              fontFamily="system-ui, sans-serif"
              fill={CONFIG.white}
              opacity={isActive ? 1 : 0.5}
            >
              {milestone.label}
            </text>
          </g>
        );
      })}

      {/* Moving particle */}
      {mounted && (
        <circle
          cx={30 + ((time * 30) % 210)}
          cy={40 + Math.sin(((time * 30) % 210) / 35 * Math.PI) * -10}
          r="4"
          fill={CONFIG.lightCyan}
          filter="url(#tp-glow)"
          opacity={0.8}
        />
      )}
    </svg>
  );
}
