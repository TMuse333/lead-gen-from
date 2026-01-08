"use client";

import { useState, useEffect } from "react";

/**
 * HomeInspection - Under contract/inspection phase
 *
 * House with magnifying glass scanning, clipboard checklist.
 * Conveys: "Thorough due diligence"
 */

const CONFIG = {
  primaryColor: "#06b6d4",
  secondaryColor: "#10b981",
  warningColor: "#f59e0b",
};

interface Props {
  className?: string;
  size?: number;
}

export default function HomeInspection({ className = "", size = 200 }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { primaryColor, secondaryColor, warningColor } = CONFIG;

  const checklistItems = [
    { label: "Foundation", checked: true },
    { label: "Roof", checked: true },
    { label: "Plumbing", checked: true },
    { label: "Electrical", checked: false },
  ];

  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        fill="none"
      >
        <defs>
          <linearGradient id="inspectGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>

          <filter id="inspectGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <clipPath id="magClip">
            <circle cx="75" cy="85" r="28" />
          </clipPath>
        </defs>

        {/* House */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(10px)",
            transition: "all 0.5s ease-out",
          }}
        >
          {/* House body */}
          <rect
            x="40"
            y="80"
            width="70"
            height="55"
            rx="2"
            fill={primaryColor}
            fillOpacity="0.15"
            stroke={primaryColor}
            strokeWidth="2"
          />

          {/* Roof */}
          <path
            d="M35 80 L75 50 L115 80 Z"
            fill={primaryColor}
            fillOpacity="0.2"
            stroke={primaryColor}
            strokeWidth="2"
          />

          {/* Door */}
          <rect
            x="65"
            y="105"
            width="20"
            height="30"
            rx="2"
            fill={primaryColor}
            fillOpacity="0.3"
          />

          {/* Window */}
          <rect
            x="48"
            y="90"
            width="14"
            height="14"
            rx="1"
            fill={primaryColor}
            fillOpacity="0.3"
            stroke={primaryColor}
            strokeWidth="1"
          />
        </g>

        {/* Magnifying glass */}
        <g
          filter="url(#inspectGlow)"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translate(0, 0)" : "translate(-20px, -20px)",
            transition: "all 0.6s ease-out 0.2s",
          }}
        >
          {/* Lens */}
          <circle
            cx="75"
            cy="85"
            r="28"
            fill={primaryColor}
            fillOpacity="0.1"
            stroke={primaryColor}
            strokeWidth="3"
          />

          {/* Scanning effect inside lens */}
          <g clipPath="url(#magClip)">
            <line
              x1="50"
              y1="75"
              x2="100"
              y2="75"
              stroke={secondaryColor}
              strokeWidth="2"
              opacity="0.5"
              style={{
                animationName: mounted ? "scan" : "none",
                animationDuration: "2s",
                animationIterationCount: "infinite",
              }}
            />
          </g>

          {/* Handle */}
          <line
            x1="95"
            y1="105"
            x2="115"
            y2="125"
            stroke={primaryColor}
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Lens shine */}
          <path
            d="M60 70 Q65 65 72 68"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.6"
            fill="none"
          />
        </g>

        {/* Checklist */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateX(0)" : "translateX(15px)",
            transition: "all 0.5s ease-out 0.3s",
          }}
        >
          {/* Clipboard */}
          <rect
            x="125"
            y="45"
            width="60"
            height="100"
            rx="4"
            fill="white"
            stroke={primaryColor}
            strokeWidth="1.5"
          />

          {/* Clip */}
          <rect
            x="145"
            y="40"
            width="20"
            height="10"
            rx="2"
            fill={primaryColor}
          />

          {/* Checklist items */}
          {checklistItems.map((item, i) => (
            <g
              key={i}
              style={{
                opacity: mounted ? 1 : 0,
                transition: `opacity 0.3s ease-out ${0.5 + i * 0.15}s`,
              }}
            >
              {/* Checkbox */}
              <rect
                x="132"
                y={60 + i * 20}
                width="12"
                height="12"
                rx="2"
                fill={item.checked ? secondaryColor : "transparent"}
                stroke={item.checked ? secondaryColor : primaryColor}
                strokeWidth="1.5"
              />

              {/* Checkmark */}
              {item.checked && (
                <path
                  d={`M134 ${66 + i * 20} L137 ${69 + i * 20} L142 ${63 + i * 20}`}
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              )}

              {/* Label */}
              <text
                x="148"
                y={69 + i * 20}
                fill={item.checked ? secondaryColor : primaryColor}
                fontSize="7"
                fontFamily="monospace"
              >
                {item.label}
              </text>
            </g>
          ))}

          {/* Progress */}
          <text
            x="155"
            y="138"
            textAnchor="middle"
            fill={warningColor}
            fontSize="8"
            fontFamily="monospace"
          >
            75% Complete
          </text>
        </g>

        {/* Inspection icons on house */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.7s",
          }}
        >
          {/* Roof check */}
          <circle cx="75" cy="55" r="8" fill={secondaryColor} fillOpacity="0.2" />
          <path
            d="M71 55 L74 58 L79 52"
            stroke={secondaryColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Foundation indicator */}
          <rect
            x="45"
            y="132"
            width="60"
            height="6"
            rx="1"
            fill={secondaryColor}
            fillOpacity="0.3"
          />
        </g>

        {/* Status label */}
        <text
          x="75"
          y="160"
          textAnchor="middle"
          fill={primaryColor}
          fontSize="8"
          fontFamily="monospace"
          style={{
            opacity: mounted ? 0.7 : 0,
            transition: "opacity 0.5s ease-out 0.8s",
          }}
        >
          INSPECTION IN PROGRESS
        </text>

        <style>{`
          @keyframes scan {
            0%, 100% { transform: translateY(-15px); opacity: 0.3; }
            50% { transform: translateY(15px); opacity: 0.8; }
          }
        `}</style>
      </svg>
    </div>
  );
}
