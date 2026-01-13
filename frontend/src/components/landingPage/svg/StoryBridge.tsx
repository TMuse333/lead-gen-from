"use client";

import { useState, useEffect } from "react";

const CONFIG = {
  situationColor: "#06b6d4",
  experienceColor: "#10b981",
  trustColor: "#f59e0b",
  sharedColor: "#14b8a6", // Teal - blend of cyan and emerald
};

interface Props {
  className?: string;
  progress?: number;
  autoAnimate?: boolean;
  showSlider?: boolean;
  width?: number;
  height?: number;
}

export default function StoryBridge({
  className = "",
  progress: controlledProgress,
  autoAnimate = false,
  showSlider = true,
  width = 450,
  height = 350,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [internalProgress, setInternalProgress] = useState(0.5);

  const progress = controlledProgress ?? internalProgress;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (autoAnimate && controlledProgress === undefined) {
      let start: number | null = null;
      let animationId: number;
      const duration = 5000;

      const animate = (timestamp: number) => {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;

        if (elapsed < duration) {
          setInternalProgress(elapsed / duration);
        } else {
          setInternalProgress(1);
        }

        animationId = requestAnimationFrame(animate);
      };

      animationId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationId);
    }
  }, [autoAnimate, controlledProgress]);

  const { situationColor, experienceColor, trustColor, sharedColor } = CONFIG;

  // ViewBox dimensions - all coordinates are in this space
  const viewWidth = 320;
  const viewHeight = 290; // Increased for more bottom padding
  const centerX = viewWidth / 2; // 160
  const centerY = 125; // Orbs centered vertically with room for labels
  const orbRadius = 62; // Increased orb size

  // Separation decreases as progress increases (orbs merge)
  const maxSeparation = 130;
  const minSeparation = 50;
  const separation = maxSeparation - progress * (maxSeparation - minSeparation);

  const orbAX = centerX - separation / 2;
  const orbBX = centerX + separation / 2;

  // Fixed label positions (don't move with slider)
  const labelLeftX = centerX - maxSeparation / 2;
  const labelRightX = centerX + maxSeparation / 2;

  const overlapAmount = Math.max(0, (orbRadius * 2 - separation) / 2);
  const trustValue = Math.min(1, overlapAmount / orbRadius);

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      <svg viewBox={`0 0 ${viewWidth} ${viewHeight}`} width={width} height={height} fill="none">
        <defs>
          <radialGradient id="situationGrad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="50%" stopColor={situationColor} />
            <stop offset="100%" stopColor="#0e7490" stopOpacity="0.6" />
          </radialGradient>

          <radialGradient id="experienceGrad" cx="70%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="50%" stopColor={experienceColor} />
            <stop offset="100%" stopColor="#047857" stopOpacity="0.6" />
          </radialGradient>

          <radialGradient id="trustOverlapGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={trustColor} stopOpacity="0.95" />
            <stop offset="100%" stopColor={trustColor} stopOpacity="0.5" />
          </radialGradient>

          <filter id="storyGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="trustIntenseGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <clipPath id="trustOverlapClip">
            <circle cx={orbBX} cy={centerY} r={orbRadius} />
          </clipPath>
        </defs>

        {/* Title - BUILDING TRUST */}
        <text
          x={centerX}
          y={30}
          textAnchor="middle"
          fill={sharedColor}
          fontSize="16"
          fontFamily="system-ui, sans-serif"
          fontWeight="600"
          opacity={mounted ? 0.9 : 0}
          style={{ transition: "opacity 0.5s" }}
        >
          BUILDING TRUST
        </text>

        {/* Labels above orbs - fixed positions */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s",
          }}
        >
          <text
            x={labelLeftX}
            y={centerY - orbRadius - 18}
            textAnchor="middle"
            fill={situationColor}
            fontSize="13"
            fontFamily="system-ui, sans-serif"
            fontWeight="600"
          >
            Their Situation
          </text>

          <text
            x={labelRightX}
            y={centerY - orbRadius - 18}
            textAnchor="middle"
            fill={experienceColor}
            fontSize="13"
            fontFamily="system-ui, sans-serif"
            fontWeight="600"
          >
            Your Experience
          </text>
        </g>

        {/* Left Orb - Situation */}
        <g
          filter="url(#storyGlow)"
          style={{
            opacity: mounted ? 0.9 : 0,
            transition: "opacity 0.5s",
          }}
        >
          <circle
            cx={orbAX}
            cy={centerY}
            r={orbRadius}
            fill="url(#situationGrad)"
          />
          <circle
            cx={orbAX}
            cy={centerY}
            r={orbRadius}
            fill="none"
            stroke={situationColor}
            strokeWidth="2.5"
            opacity="0.7"
          />
        </g>

        {/* Right Orb - Experience */}
        <g
          filter="url(#storyGlow)"
          style={{
            opacity: mounted ? 0.9 : 0,
            transition: "opacity 0.5s",
          }}
        >
          <circle
            cx={orbBX}
            cy={centerY}
            r={orbRadius}
            fill="url(#experienceGrad)"
          />
          <circle
            cx={orbBX}
            cy={centerY}
            r={orbRadius}
            fill="none"
            stroke={experienceColor}
            strokeWidth="2.5"
            opacity="0.7"
          />
        </g>

        {/* Overlap area - Trust zone */}
        {overlapAmount > 5 && (
          <g filter="url(#trustIntenseGlow)">
            <circle
              cx={orbAX}
              cy={centerY}
              r={orbRadius}
              fill="url(#trustOverlapGrad)"
              clipPath="url(#trustOverlapClip)"
            />
          </g>
        )}

        {/* Trust Level indicator */}
        <g
          style={{
            opacity: mounted ? 0.9 : 0,
            transition: "opacity 0.5s",
          }}
        >
          <rect
            x={centerX - 50}
            y={centerY + orbRadius + 35}
            width="100"
            height="35"
            rx="6"
            fill={sharedColor}
            fillOpacity="0.1"
            stroke={sharedColor}
            strokeWidth="1.5"
          />
          <text
            x={centerX}
            y={centerY + orbRadius + 52}
            textAnchor="middle"
            fill={sharedColor}
            fontSize="10"
            fontFamily="system-ui, sans-serif"
          >
            Trust Level
          </text>
          <text
            x={centerX}
            y={centerY + orbRadius + 66}
            textAnchor="middle"
            fill={sharedColor}
            fontSize="16"
            fontFamily="system-ui, sans-serif"
            fontWeight="bold"
          >
            {(trustValue * 100).toFixed(0)}%
          </text>
        </g>

        {/* Status text - centered between orbs and trust level box */}
        <text
          x={centerX}
          y={centerY + orbRadius + 15}
          textAnchor="middle"
          fill={progress < 0.3 ? situationColor : progress < 0.7 ? trustColor : sharedColor}
          fontSize="13"
          fontFamily="system-ui, sans-serif"
          fontWeight="600"
          opacity={mounted ? 0.85 : 0}
          style={{ transition: "opacity 0.5s" }}
        >
          {progress < 0.3
            ? "Strangers..."
            : progress < 0.7
              ? "Connecting..."
              : "TRUSTED!"}
        </text>

        {/* Formula - at very bottom with more space */}
        <text
          x={centerX}
          y={viewHeight - 12}
          textAnchor="middle"
          fill={sharedColor}
          fontSize="11"
          fontFamily="serif"
          fontStyle="italic"
          opacity={mounted ? 0.5 : 0}
          style={{ transition: "opacity 0.5s" }}
        >
          Situation + Experience = Trust
        </text>
      </svg>

      {/* Slider Control */}
      {showSlider && (
        <div className="w-full mt-6 px-4">
          <div className="flex items-center justify-between text-sm text-white/60 mb-3">
            <span className="text-cyan-400 font-medium">No Stories</span>
            <span className="text-teal-400 font-semibold">
              Connection: {(trustValue * 100).toFixed(0)}%
            </span>
            <span className="text-emerald-400 font-medium">Full Trust</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={progress * 100}
            onChange={(e) => setInternalProgress(Number(e.target.value) / 100)}
            className="w-full h-3 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #06b6d4 0%, #14b8a6 ${progress * 100}%, #1e293b ${progress * 100}%, #1e293b 100%)`,
            }}
          />
          <p className="text-center text-sm text-white/50 mt-3">
            Drag to see how stories build trust
          </p>
        </div>
      )}
    </div>
  );
}
