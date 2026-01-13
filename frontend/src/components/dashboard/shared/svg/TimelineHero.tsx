"use client";

import { useState, useEffect } from "react";

/**
 * TimelineHero - Personalized buying journey hero banner
 * Shows agent headshot, buyer info, and animated timeline path
 */

const CONFIG = {
  primaryCyan: "#00caff",
  lightCyan: "#00e4ff",
  accentCyan: "#33ddff",
  midCyan: "#00c1ff",
  deepBlue: "#2800e3",
  success: "#10b981",
  white: "#ffffff",
  lightGray: "#e1e1e3",
  strokeDark: "#006f89",
  darkBg: "#0a0f1a",
};

interface Props {
  width?: number;
  height?: number;
  buyerName?: string;
  location?: string;
  buyerType?: string;
  budget?: string;
  timeline?: string;
}

export default function TimelineHero({
  width = 500,
  height = 340,
  buyerName = "Alex",
  location = "Halifax, NS",
  buyerType = "First-Time Buyer",
  budget = "$425,000",
  timeline = "6 months",
}: Props) {
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

  // Timeline milestones
  const milestones = [
    { label: "Pre-Approval", icon: "check", x: 200, y: 95 },
    { label: "Home Search", icon: "search", x: 280, y: 145 },
    { label: "Offer", icon: "doc", x: 360, y: 195 },
    { label: "Closing", icon: "key", x: 440, y: 245 },
  ];

  // Feature pills
  const features = [
    "Expert-curated steps",
    "Actionable tasks",
    "Real success stories",
  ];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ overflow: "visible" }}
    >
      <defs>
        <filter id="th-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="th-soft-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <linearGradient id="th-timeline-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={CONFIG.primaryCyan} />
          <stop offset="100%" stopColor={CONFIG.deepBlue} />
        </linearGradient>

        <linearGradient id="th-card-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a2332" />
          <stop offset="100%" stopColor="#0d1320" />
        </linearGradient>

        <clipPath id="th-headshot-clip">
          <circle cx="70" cy="100" r="42" />
        </clipPath>
      </defs>

      {/* === BACKGROUND CARD === */}
      <rect
        x="10"
        y="10"
        width={width - 20}
        height={height - 20}
        rx="16"
        fill="url(#th-card-gradient)"
        stroke={CONFIG.primaryCyan}
        strokeWidth="1"
        strokeOpacity="0.3"
        style={{
          opacity: mounted ? 1 : 0,
          transition: "opacity 0.4s ease-out",
        }}
      />

      {/* === AGENT HEADSHOT SECTION === */}
      <g
        style={{
          opacity: mounted ? 1 : 0,
          transition: "opacity 0.5s ease-out 0.1s",
        }}
      >
        {/* Headshot ring - outer glow */}
        <circle
          cx="70"
          cy="100"
          r="48"
          fill="none"
          stroke={CONFIG.primaryCyan}
          strokeWidth="2"
          strokeOpacity={0.3 + Math.sin(time * 2) * 0.15}
          filter="url(#th-soft-glow)"
        />

        {/* Headshot background */}
        <circle
          cx="70"
          cy="100"
          r="42"
          fill="#1e293b"
          stroke={CONFIG.primaryCyan}
          strokeWidth="2"
        />

        {/* Placeholder person icon */}
        <g transform="translate(70, 100)">
          {/* Head */}
          <circle
            cx="0"
            cy="-12"
            r="14"
            fill={CONFIG.lightGray}
            opacity="0.8"
          />
          {/* Body */}
          <path
            d="M -22 28 Q -22 8 0 8 Q 22 8 22 28"
            fill={CONFIG.lightGray}
            opacity="0.8"
          />
        </g>

        {/* Verified badge */}
        <g transform="translate(100, 130)">
          <circle
            cx="0"
            cy="0"
            r="12"
            fill={CONFIG.success}
            stroke={CONFIG.darkBg}
            strokeWidth="2"
          />
          <polyline
            points="-5,0 -1,4 6,-4"
            fill="none"
            stroke={CONFIG.white}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </g>

      {/* === TITLE SECTION === */}
      <g
        style={{
          opacity: mounted ? 1 : 0,
          transition: "opacity 0.5s ease-out 0.15s",
        }}
      >
        <text
          x="130"
          y="50"
          fontSize="18"
          fontFamily="system-ui, sans-serif"
          fontWeight="700"
          fill={CONFIG.white}
        >
          {buyerName}&apos;s Buying Timeline
        </text>
        <text
          x="130"
          y="72"
          fontSize="11"
          fontFamily="system-ui, sans-serif"
          fill={CONFIG.white}
          opacity="0.6"
        >
          A personalized roadmap for your journey in {location}
        </text>
      </g>

      {/* === FEATURE PILLS === */}
      <g
        style={{
          opacity: mounted ? 1 : 0,
          transition: "opacity 0.5s ease-out 0.2s",
        }}
      >
        {features.map((feature, i) => {
          const pillX = 130 + i * 115;
          return (
            <g key={i}>
              <rect
                x={pillX}
                y="82"
                width={108}
                height="22"
                rx="11"
                fill={CONFIG.primaryCyan}
                fillOpacity="0.15"
                stroke={CONFIG.primaryCyan}
                strokeWidth="1"
                strokeOpacity="0.4"
              />
              {/* Checkmark */}
              <circle
                cx={pillX + 14}
                cy="93"
                r="6"
                fill={CONFIG.success}
                opacity="0.9"
              />
              <polyline
                points={`${pillX + 11},93 ${pillX + 13},95.5 ${pillX + 18},90`}
                fill="none"
                stroke={CONFIG.white}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <text
                x={pillX + 26}
                y="97"
                fontSize="9"
                fontFamily="system-ui, sans-serif"
                fill={CONFIG.white}
                opacity="0.85"
              >
                {feature}
              </text>
            </g>
          );
        })}
      </g>

      {/* === BUYER INFO CARD === */}
      <g
        style={{
          opacity: mounted ? 1 : 0,
          transition: "opacity 0.5s ease-out 0.25s",
        }}
      >
        <rect
          x="28"
          y="160"
          width="85"
          height="80"
          rx="10"
          fill="#1e293b"
          stroke={CONFIG.primaryCyan}
          strokeWidth="1"
          strokeOpacity="0.3"
        />

        {/* Buyer type badge */}
        <rect
          x="33"
          y="168"
          width="75"
          height="18"
          rx="4"
          fill={CONFIG.deepBlue}
        />
        <text
          x="70"
          y="181"
          textAnchor="middle"
          fontSize="8"
          fontFamily="monospace"
          fontWeight="600"
          fill={CONFIG.white}
        >
          {buyerType.toUpperCase()}
        </text>

        {/* Budget */}
        <text
          x="70"
          y="205"
          textAnchor="middle"
          fontSize="8"
          fontFamily="system-ui, sans-serif"
          fill={CONFIG.white}
          opacity="0.5"
        >
          Budget
        </text>
        <text
          x="70"
          y="218"
          textAnchor="middle"
          fontSize="13"
          fontFamily="monospace"
          fontWeight="700"
          fill={CONFIG.success}
        >
          {budget}
        </text>

        {/* Timeline */}
        <text
          x="70"
          y="235"
          textAnchor="middle"
          fontSize="8"
          fontFamily="system-ui, sans-serif"
          fill={CONFIG.white}
          opacity="0.5"
        >
          Timeline: <tspan fill={CONFIG.accentCyan} fontWeight="600">{timeline}</tspan>
        </text>
      </g>

      {/* === TIMELINE PATH === */}
      <g
        style={{
          opacity: mounted ? 1 : 0,
          transition: "opacity 0.5s ease-out 0.3s",
        }}
      >
        {/* Timeline curve path */}
        <path
          d="M 140 140 Q 180 120 220 140 T 300 190 T 380 240 T 460 290"
          fill="none"
          stroke={CONFIG.primaryCyan}
          strokeWidth="3"
          strokeOpacity="0.3"
          strokeLinecap="round"
        />

        {/* Animated progress along path */}
        <path
          d="M 140 140 Q 180 120 220 140 T 300 190 T 380 240 T 460 290"
          fill="none"
          stroke="url(#th-timeline-gradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="400"
          strokeDashoffset={mounted ? 400 - (time * 30) % 400 : 400}
          filter="url(#th-glow)"
        />

        {/* Milestone nodes */}
        {milestones.map((milestone, i) => {
          const isActive = ((time * 0.5) % 4) > i;
          const pulse = Math.sin(time * 2 + i * 0.8) * 0.15;

          return (
            <g
              key={i}
              style={{
                opacity: mounted ? 0.85 + pulse : 0,
                transition: `opacity 0.4s ease-out ${0.35 + i * 0.1}s`,
              }}
            >
              {/* Node outer ring */}
              <circle
                cx={milestone.x}
                cy={milestone.y}
                r="22"
                fill="none"
                stroke={CONFIG.primaryCyan}
                strokeWidth="1.5"
                strokeOpacity={0.3 + pulse}
              />

              {/* Node background */}
              <circle
                cx={milestone.x}
                cy={milestone.y}
                r="18"
                fill={isActive ? CONFIG.primaryCyan : "#1e293b"}
                stroke={CONFIG.primaryCyan}
                strokeWidth="2"
                filter={isActive ? "url(#th-soft-glow)" : "none"}
              />

              {/* Icon inside node */}
              <g transform={`translate(${milestone.x}, ${milestone.y})`}>
                {milestone.icon === "check" && (
                  <polyline
                    points="-6,-1 -2,4 7,-5"
                    fill="none"
                    stroke={isActive ? CONFIG.darkBg : CONFIG.lightGray}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                {milestone.icon === "search" && (
                  <>
                    <circle
                      cx="-2"
                      cy="-2"
                      r="6"
                      fill="none"
                      stroke={isActive ? CONFIG.darkBg : CONFIG.lightGray}
                      strokeWidth="2"
                    />
                    <line
                      x1="2"
                      y1="2"
                      x2="7"
                      y2="7"
                      stroke={isActive ? CONFIG.darkBg : CONFIG.lightGray}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </>
                )}
                {milestone.icon === "doc" && (
                  <>
                    <rect
                      x="-6"
                      y="-8"
                      width="12"
                      height="16"
                      rx="2"
                      fill="none"
                      stroke={isActive ? CONFIG.darkBg : CONFIG.lightGray}
                      strokeWidth="2"
                    />
                    <line
                      x1="-3"
                      y1="-3"
                      x2="3"
                      y2="-3"
                      stroke={isActive ? CONFIG.darkBg : CONFIG.lightGray}
                      strokeWidth="1.5"
                    />
                    <line
                      x1="-3"
                      y1="1"
                      x2="3"
                      y2="1"
                      stroke={isActive ? CONFIG.darkBg : CONFIG.lightGray}
                      strokeWidth="1.5"
                    />
                  </>
                )}
                {milestone.icon === "key" && (
                  <>
                    <circle
                      cx="-3"
                      cy="-3"
                      r="5"
                      fill="none"
                      stroke={isActive ? CONFIG.darkBg : CONFIG.lightGray}
                      strokeWidth="2"
                    />
                    <line
                      x1="1"
                      y1="1"
                      x2="8"
                      y2="8"
                      stroke={isActive ? CONFIG.darkBg : CONFIG.lightGray}
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <line
                      x1="5"
                      y1="5"
                      x2="7"
                      y2="3"
                      stroke={isActive ? CONFIG.darkBg : CONFIG.lightGray}
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </>
                )}
              </g>

              {/* Label */}
              <text
                x={milestone.x}
                y={milestone.y + 32}
                textAnchor="middle"
                fontSize="9"
                fontFamily="system-ui, sans-serif"
                fontWeight="600"
                fill={CONFIG.white}
                opacity="0.9"
              >
                {milestone.label}
              </text>
            </g>
          );
        })}

        {/* Floating particles along timeline */}
        {mounted && [0, 1, 2].map((i) => {
          const t = ((time * 0.08 + i * 0.33) % 1);
          // Bezier approximation along the path
          const x = 140 + t * 320;
          const y = 140 + Math.sin(t * Math.PI) * 60 + t * 100;
          const opacity = t < 0.1 ? t * 8 : t > 0.9 ? (1 - t) * 8 : 0.6;

          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3"
              fill={CONFIG.accentCyan}
              opacity={opacity}
              filter="url(#th-soft-glow)"
            />
          );
        })}
      </g>

      {/* === CTA HINT === */}
      <g
        style={{
          opacity: mounted ? 0.7 + Math.sin(time * 1.5) * 0.2 : 0,
          transition: "opacity 0.5s ease-out 0.5s",
        }}
      >
        <text
          x={width - 30}
          y={height - 25}
          textAnchor="end"
          fontSize="10"
          fontFamily="system-ui, sans-serif"
          fill={CONFIG.primaryCyan}
        >
          View your journey →
        </text>
      </g>
    </svg>
  );
}
