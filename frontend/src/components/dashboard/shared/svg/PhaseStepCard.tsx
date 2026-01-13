"use client";

import { useState, useEffect } from "react";

/**
 * PhaseStepCard - Individual phase/step card matching agent-lead-gen StepCard style
 * Shows phase icon, title, action items checklist, and progress
 */

const CONFIG = {
  primaryCyan: "#06b6d4",
  lightCyan: "#00e4ff",
  accentCyan: "#22d3ee",
  success: "#10b981",
  amber: "#f59e0b",
  white: "#ffffff",
  darkBg: "#0f172a",
  cardBg: "#1e293b",
  strokeDark: "#334155",
};

interface ActionItem {
  label: string;
  completed?: boolean;
}

interface Props {
  width?: number;
  height?: number;
  stepNumber?: number;
  totalSteps?: number;
  phaseName?: string;
  timeline?: string;
  actionItems?: ActionItem[];
  isActive?: boolean;
}

export default function PhaseStepCard({
  width = 340,
  height = 200,
  stepNumber = 1,
  totalSteps = 5,
  phaseName = "Financial Preparation",
  timeline = "Week 1-2",
  actionItems = [
    { label: "Check credit score", completed: true },
    { label: "Gather documents", completed: true },
    { label: "Get pre-approved", completed: false },
    { label: "Set budget range", completed: false },
  ],
  isActive = true,
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

  const completedCount = actionItems.filter((i) => i.completed).length;
  const progressPercent = (completedCount / actionItems.length) * 100;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ overflow: "visible" }}
    >
      <defs>
        <filter id="psc-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <linearGradient id="psc-progress" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={CONFIG.primaryCyan} />
          <stop offset="100%" stopColor={CONFIG.success} />
        </linearGradient>

        <clipPath id="psc-icon-clip">
          <circle cx="50" cy="70" r="35" />
        </clipPath>
      </defs>

      {/* Card background */}
      <rect
        x="0"
        y="0"
        width={width}
        height={height}
        rx="16"
        fill={CONFIG.cardBg}
        stroke={isActive ? CONFIG.primaryCyan : CONFIG.strokeDark}
        strokeWidth={isActive ? "2" : "1"}
        style={{
          opacity: mounted ? 1 : 0,
          transition: "opacity 0.3s ease-out",
        }}
      />

      {/* Step badge - top left */}
      <g
        style={{
          opacity: mounted ? 1 : 0,
          transition: "opacity 0.4s ease-out 0.1s",
        }}
      >
        <rect
          x="12"
          y="12"
          width="70"
          height="22"
          rx="11"
          fill={CONFIG.primaryCyan}
          fillOpacity="0.2"
        />
        <text
          x="47"
          y="27"
          textAnchor="middle"
          fontSize="11"
          fontFamily="system-ui, sans-serif"
          fontWeight="600"
          fill={CONFIG.accentCyan}
        >
          Step {stepNumber} of {totalSteps}
        </text>
      </g>

      {/* Timeline badge - top right */}
      <g
        style={{
          opacity: mounted ? 1 : 0,
          transition: "opacity 0.4s ease-out 0.15s",
        }}
      >
        <rect
          x={width - 82}
          y="12"
          width="70"
          height="22"
          rx="11"
          fill={CONFIG.amber}
          fillOpacity="0.2"
        />
        <text
          x={width - 47}
          y="27"
          textAnchor="middle"
          fontSize="11"
          fontFamily="system-ui, sans-serif"
          fontWeight="600"
          fill={CONFIG.amber}
        >
          {timeline}
        </text>
      </g>

      {/* Phase icon area */}
      <g
        style={{
          opacity: mounted ? 1 : 0,
          transition: "opacity 0.4s ease-out 0.2s",
        }}
      >
        <circle
          cx="50"
          cy="90"
          r="32"
          fill={CONFIG.primaryCyan}
          fillOpacity="0.15"
          stroke={CONFIG.primaryCyan}
          strokeWidth="2"
        />

        {/* Document/checklist icon */}
        <g transform="translate(50, 90)">
          <rect
            x="-14"
            y="-18"
            width="28"
            height="36"
            rx="4"
            fill="none"
            stroke={CONFIG.accentCyan}
            strokeWidth="2"
          />
          {/* Lines on document */}
          {[-8, -2, 4, 10].map((lineY, i) => (
            <line
              key={i}
              x1="-8"
              y1={lineY}
              x2={i < 2 ? "8" : "4"}
              y2={lineY}
              stroke={CONFIG.accentCyan}
              strokeWidth="2"
              strokeLinecap="round"
              opacity={mounted ? 0.6 + Math.sin(time * 2 + i * 0.5) * 0.3 : 0.6}
            />
          ))}
          {/* Checkmark on first line */}
          <circle cx="10" cy="-8" r="4" fill={CONFIG.success} />
          <polyline
            points="7,-8 9,-6 13,-10"
            fill="none"
            stroke={CONFIG.white}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>
      </g>

      {/* Phase name */}
      <text
        x="95"
        y="75"
        fontSize="16"
        fontFamily="system-ui, sans-serif"
        fontWeight="700"
        fill={CONFIG.white}
        style={{
          opacity: mounted ? 1 : 0,
          transition: "opacity 0.4s ease-out 0.25s",
        }}
      >
        {phaseName}
      </text>

      {/* Action items checklist */}
      <g
        style={{
          opacity: mounted ? 1 : 0,
          transition: "opacity 0.4s ease-out 0.3s",
        }}
      >
        {actionItems.slice(0, 4).map((item, i) => {
          const itemY = 95 + i * 22;
          return (
            <g key={i}>
              {/* Checkbox */}
              <rect
                x="95"
                y={itemY - 8}
                width="14"
                height="14"
                rx="3"
                fill={item.completed ? CONFIG.success : "transparent"}
                stroke={item.completed ? CONFIG.success : CONFIG.strokeDark}
                strokeWidth="1.5"
              />
              {item.completed && (
                <polyline
                  points={`98,${itemY} 101,${itemY + 3} 106,${itemY - 3}`}
                  fill="none"
                  stroke={CONFIG.white}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              )}
              {/* Label */}
              <text
                x="115"
                y={itemY + 4}
                fontSize="11"
                fontFamily="system-ui, sans-serif"
                fill={item.completed ? CONFIG.white : CONFIG.strokeDark}
                opacity={item.completed ? 0.9 : 0.6}
              >
                {item.label}
              </text>
            </g>
          );
        })}
      </g>

      {/* Progress bar at bottom */}
      <g
        style={{
          opacity: mounted ? 1 : 0,
          transition: "opacity 0.4s ease-out 0.4s",
        }}
      >
        {/* Background track */}
        <rect
          x="0"
          y={height - 4}
          width={width}
          height="4"
          rx="0"
          fill={CONFIG.strokeDark}
        />
        {/* Progress fill */}
        <rect
          x="0"
          y={height - 4}
          width={(progressPercent / 100) * width}
          height="4"
          rx="0"
          fill="url(#psc-progress)"
          filter="url(#psc-glow)"
        />
      </g>

      {/* Completion count */}
      <text
        x={width - 15}
        y={height - 15}
        textAnchor="end"
        fontSize="10"
        fontFamily="monospace"
        fill={CONFIG.success}
        style={{
          opacity: mounted ? 0.8 : 0,
          transition: "opacity 0.4s ease-out 0.45s",
        }}
      >
        {completedCount}/{actionItems.length}
      </text>
    </svg>
  );
}
