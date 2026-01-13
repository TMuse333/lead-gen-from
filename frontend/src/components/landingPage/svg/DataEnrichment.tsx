"use client";

import { useState, useEffect, useId } from "react";

interface Props {
  width?: number;
  height?: number;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}

export default function DataEnrichment({
  width = 400,
  height = 240,
  primaryColor = "#06b6d4",
  secondaryColor = "#3b82f6",
  accentColor = "#10b981",
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState(0);
  const id = useId().replace(/:/g, "");

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

  const cx = width / 2;
  const cy = height / 2;

  const rawData = [
    { label: "Name", value: "Sarah Chen" },
    { label: "Email", value: "sarah@email.com" },
    { label: "Phone", value: "902-555-0123" },
  ];

  const enrichedData = [
    { label: "Income", value: "$120k", angle: -60, color: accentColor },
    { label: "Home Owner", value: "Yes", angle: -20, color: "#f59e0b" },
    { label: "Market", value: "Halifax", angle: 20, color: secondaryColor },
    { label: "Timeline", value: "3 mo", angle: 60, color: "#8b5cf6" },
    { label: "Pre-Approved", value: "Yes", angle: 100, color: accentColor },
    { label: "Budget", value: "$550k", angle: 140, color: primaryColor },
  ];

  const phase = (time * 0.4) % 3;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ overflow: "visible" }}
    >
      <defs>
        <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <radialGradient id={`center-grad-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={primaryColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={primaryColor} stopOpacity="0" />
        </radialGradient>

        <linearGradient id={`enrich-grad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={primaryColor} />
          <stop offset="100%" stopColor={secondaryColor} />
        </linearGradient>
      </defs>

      <g>
        <text
          x={60}
          y={25}
          textAnchor="middle"
          fontSize="10"
          fontFamily="system-ui, sans-serif"
          fontWeight="600"
          fill={primaryColor}
          opacity={mounted ? 0.7 : 0}
        >
          RAW DATA
        </text>

        <rect
          x={15}
          y={40}
          width={90}
          height={100}
          rx={8}
          fill="#1e293b"
          stroke={primaryColor}
          strokeWidth={1}
          strokeOpacity={0.4}
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.3s ease-out",
          }}
        />

        {rawData.map((item, i) => {
          const y = 60 + i * 28;
          return (
            <g key={i}>
              <text
                x={25}
                y={y}
                fontSize="8"
                fontFamily="system-ui, sans-serif"
                fill="white"
                opacity={0.4}
              >
                {item.label}
              </text>
              <text
                x={25}
                y={y + 12}
                fontSize="9"
                fontFamily="monospace"
                fill={primaryColor}
                opacity={mounted ? 0.9 : 0}
              >
                {item.value}
              </text>
            </g>
          );
        })}

        {mounted && [0, 1, 2].map((i) => {
          const progress = ((time * 0.6 + i * 0.33) % 1);
          const startX = 105;
          const endX = cx - 45;
          const x = startX + progress * (endX - startX);
          const y = cy + Math.sin(progress * Math.PI) * -20;

          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={3}
              fill={primaryColor}
              opacity={0.7}
            />
          );
        })}
      </g>

      <g>
        <circle
          cx={cx}
          cy={cy}
          r={60}
          fill={`url(#center-grad-${id})`}
          style={{
            opacity: mounted ? 0.8 + Math.sin(time * 2) * 0.2 : 0,
          }}
        />

        <circle
          cx={cx}
          cy={cy}
          r={35}
          fill={`url(#enrich-grad-${id})`}
          filter={`url(#glow-${id})`}
          style={{
            opacity: mounted ? 1 : 0,
            transform: `scale(${mounted ? 1 : 0})`,
            transformOrigin: `${cx}px ${cy}px`,
            transition: "all 0.5s ease-out",
          }}
        />

        <g
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.3s ease-out 0.3s",
          }}
        >
          <line
            x1={cx - 12}
            y1={cy}
            x2={cx + 12}
            y2={cy}
            stroke="white"
            strokeWidth={3}
            strokeLinecap="round"
          />
          <line
            x1={cx}
            y1={cy - 12}
            x2={cx}
            y2={cy + 12}
            stroke="white"
            strokeWidth={3}
            strokeLinecap="round"
          />
          {[0, 1, 2, 3].map((i) => {
            const angle = (time * 1.5 + i * 90) * (Math.PI / 180);
            const orbitR = 25;
            return (
              <circle
                key={i}
                cx={cx + Math.cos(angle) * orbitR}
                cy={cy + Math.sin(angle) * orbitR}
                r={3}
                fill="white"
                opacity={0.6}
              />
            );
          })}
        </g>

        <circle
          cx={cx}
          cy={cy}
          r={42}
          fill="none"
          stroke={primaryColor}
          strokeWidth={2}
          strokeDasharray="8 20"
          strokeLinecap="round"
          style={{
            opacity: mounted ? 0.5 : 0,
            transform: `rotate(${-time * 45}deg)`,
            transformOrigin: `${cx}px ${cy}px`,
          }}
        />

        <text
          x={cx}
          y={cy + 55}
          textAnchor="middle"
          fontSize="9"
          fontFamily="system-ui, sans-serif"
          fontWeight="600"
          fill="white"
          opacity={mounted ? 0.5 : 0}
        >
          ENRICHMENT
        </text>
      </g>

      <g>
        {enrichedData.map((item, i) => {
          const angleRad = (item.angle * Math.PI) / 180;
          const baseRadius = 75;
          const expandRadius = phase > 1 ? baseRadius + 10 : baseRadius;

          const cardX = cx + Math.cos(angleRad) * expandRadius;
          const cardY = cy + Math.sin(angleRad) * expandRadius;

          const delay = i * 0.15;
          const isVisible = phase > 0.5 + delay;
          const cardOpacity = isVisible ? 1 : 0;

          return (
            <g
              key={i}
              style={{
                opacity: mounted ? cardOpacity : 0,
                transform: `scale(${isVisible ? 1 : 0.8})`,
                transformOrigin: `${cardX}px ${cardY}px`,
                transition: `all 0.3s ease-out ${delay}s`,
              }}
            >
              <line
                x1={cx + Math.cos(angleRad) * 42}
                y1={cy + Math.sin(angleRad) * 42}
                x2={cardX}
                y2={cardY}
                stroke={item.color}
                strokeWidth={1.5}
                strokeOpacity={0.4}
                strokeDasharray="3 3"
              />

              <rect
                x={cardX - 32}
                y={cardY - 18}
                width={64}
                height={36}
                rx={6}
                fill="#1e293b"
                stroke={item.color}
                strokeWidth={1.5}
                filter={`url(#glow-${id})`}
              />

              <text
                x={cardX}
                y={cardY - 5}
                textAnchor="middle"
                fontSize="7"
                fontFamily="system-ui, sans-serif"
                fill="white"
                opacity={0.5}
              >
                {item.label}
              </text>

              <text
                x={cardX}
                y={cardY + 10}
                textAnchor="middle"
                fontSize="11"
                fontFamily="monospace"
                fontWeight="600"
                fill={item.color}
              >
                {item.value}
              </text>

              <circle
                cx={cardX + 25}
                cy={cardY - 12}
                r={3}
                fill={item.color}
                style={{
                  opacity: 0.5 + Math.sin(time * 3 + i) * 0.5,
                }}
              />
            </g>
          );
        })}
      </g>

      <text
        x={cx}
        y={height - 8}
        textAnchor="middle"
        fontSize="9"
        fontFamily="system-ui, sans-serif"
        fill="white"
        opacity={mounted ? 0.35 : 0}
      >
        Contact → Rich Lead Profile
      </text>
    </svg>
  );
}
