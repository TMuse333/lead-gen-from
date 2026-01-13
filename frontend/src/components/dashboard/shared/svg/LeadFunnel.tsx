"use client";

import { useState, useEffect } from "react";

/**
 * LeadFunnel - Lead qualification funnel visualization
 * Shows leads being filtered and qualified through AI
 */

const CONFIG = {
  primaryColor: "#06b6d4", // cyan-500
  secondaryColor: "#3b82f6", // blue-500
  accentColor: "#10b981", // green-500
  dimColor: "#64748b", // slate-500
};

interface Props {
  size?: number;
  progress?: number;
  autoAnimate?: boolean;
}

export default function LeadFunnel({
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
    const duration = 4000;

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

  // Funnel shape points
  const funnelTop = 25;
  const funnelBottom = height - 40;
  const topWidth = 80;
  const bottomWidth = 25;

  // Leads at different stages
  const leads = [
    { x: cx - 50, startY: -20, color: CONFIG.dimColor, qualified: false },
    { x: cx - 20, startY: -10, color: CONFIG.dimColor, qualified: false },
    { x: cx + 15, startY: -25, color: CONFIG.primaryColor, qualified: true },
    { x: cx + 45, startY: -15, color: CONFIG.dimColor, qualified: false },
    { x: cx - 35, startY: -30, color: CONFIG.primaryColor, qualified: true },
  ];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ overflow: "visible" }}
    >
      <defs>
        <filter id="funnel-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <linearGradient id="funnel-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={CONFIG.primaryColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={CONFIG.accentColor} stopOpacity="0.5" />
        </linearGradient>

        <clipPath id="funnel-clip">
          <polygon
            points={`
              ${cx - topWidth},${funnelTop}
              ${cx + topWidth},${funnelTop}
              ${cx + bottomWidth},${funnelBottom}
              ${cx - bottomWidth},${funnelBottom}
            `}
          />
        </clipPath>
      </defs>

      <style>
        {`
          @keyframes fall {
            0% { transform: translateY(0); }
            100% { transform: translateY(200px); }
          }
          @keyframes filter-pulse {
            0%, 100% { stroke-opacity: 0.3; }
            50% { stroke-opacity: 0.8; }
          }
        `}
      </style>

      {/* Funnel outline */}
      <polygon
        points={`
          ${cx - topWidth},${funnelTop}
          ${cx + topWidth},${funnelTop}
          ${cx + bottomWidth},${funnelBottom}
          ${cx - bottomWidth},${funnelBottom}
        `}
        fill="url(#funnel-gradient)"
        stroke={CONFIG.primaryColor}
        strokeWidth="2"
        strokeOpacity={mounted ? 0.8 : 0}
        style={{
          transition: "stroke-opacity 0.5s ease-out",
        }}
      />

      {/* Filter lines inside funnel */}
      {[0.3, 0.5, 0.7].map((ratio, i) => {
        const y = funnelTop + (funnelBottom - funnelTop) * ratio;
        const lineWidth = topWidth - (topWidth - bottomWidth) * ratio;
        return (
          <line
            key={i}
            x1={cx - lineWidth}
            y1={y}
            x2={cx + lineWidth}
            y2={y}
            stroke={CONFIG.secondaryColor}
            strokeWidth="1"
            strokeDasharray="4 4"
            style={{
              animation: mounted ? `filter-pulse 2s ease-in-out infinite ${i * 0.3}s` : "none",
            }}
          />
        );
      })}

      {/* Leads falling through funnel */}
      {leads.map((lead, i) => {
        const delay = i * 0.15;
        const leadProgress = Math.max(0, Math.min(1, (p - delay) / 0.6));
        const currentY = lead.startY + leadProgress * (funnelBottom - lead.startY + 30);

        // Leads get filtered out at different stages
        const filterOutY = lead.qualified ? Infinity : funnelTop + (funnelBottom - funnelTop) * (0.3 + i * 0.15);
        const isFiltered = currentY > filterOutY;
        const opacity = isFiltered ? 0 : 1;

        // Qualified leads narrow toward center
        const narrowingFactor = Math.max(0, 1 - leadProgress * 0.8);
        const xOffset = (lead.x - cx) * narrowingFactor;
        const displayX = cx + xOffset;

        return (
          <g key={i}>
            {/* Lead dot */}
            <circle
              cx={displayX}
              cy={currentY}
              r={lead.qualified ? 8 : 6}
              fill={lead.color}
              fillOpacity={mounted ? opacity : 0}
              filter={lead.qualified ? "url(#funnel-glow)" : undefined}
              style={{
                transition: "fill-opacity 0.3s ease-out",
              }}
            />

            {/* Star for qualified leads */}
            {lead.qualified && currentY > funnelBottom && mounted && (
              <text
                x={displayX}
                y={currentY + 4}
                textAnchor="middle"
                fontSize="10"
                fill="white"
              >
                ★
              </text>
            )}
          </g>
        );
      })}

      {/* Output indicator */}
      {mounted && p > 0.7 && (
        <g
          style={{
            opacity: p > 0.8 ? 1 : 0,
            transition: "opacity 0.5s ease-out",
          }}
        >
          {/* Qualified leads count */}
          <rect
            x={cx - 35}
            y={height - 30}
            width={70}
            height={24}
            rx={12}
            fill={CONFIG.accentColor}
            filter="url(#funnel-glow)"
          />
          <text
            x={cx}
            y={height - 13}
            textAnchor="middle"
            fontSize="11"
            fontFamily="monospace"
            fontWeight="bold"
            fill="white"
          >
            2 READY
          </text>
        </g>
      )}

      {/* Stage labels */}
      {mounted && (
        <>
          <text
            x={cx + topWidth + 10}
            y={funnelTop + 20}
            fontSize="8"
            fontFamily="monospace"
            fill={CONFIG.dimColor}
            style={{ opacity: p > 0.2 ? 0.7 : 0, transition: "opacity 0.3s" }}
          >
            ALL LEADS
          </text>
          <text
            x={cx + bottomWidth + 10}
            y={funnelBottom - 10}
            fontSize="8"
            fontFamily="monospace"
            fill={CONFIG.accentColor}
            style={{ opacity: p > 0.6 ? 0.9 : 0, transition: "opacity 0.3s" }}
          >
            QUALIFIED
          </text>
        </>
      )}
    </svg>
  );
}
