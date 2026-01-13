"use client";

import { useState, useEffect, useId } from "react";

interface Props {
  width?: number;
  height?: number;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}

export default function IntentClassifier({
  width = 380,
  height = 220,
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

  const intents = [
    { id: "buy", label: "BUY", icon: "key", color: accentColor },
    { id: "sell", label: "SELL", icon: "tag", color: "#f59e0b" },
    { id: "browse", label: "BROWSE", icon: "search", color: secondaryColor },
    { id: "refinance", label: "REFI", icon: "refresh", color: "#8b5cf6" },
  ];

  const cycleTime = time * 0.3;
  const activeIndex = Math.floor(cycleTime % 4);

  const textFragments = [
    "looking to buy",
    "Halifax area",
    "$500k budget",
    "3 bedroom",
  ];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ overflow: "visible" }}
    >
      <defs>
        <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <linearGradient id={`input-grad-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={primaryColor} stopOpacity="0" />
          <stop offset="50%" stopColor={primaryColor} stopOpacity="1" />
          <stop offset="100%" stopColor={primaryColor} stopOpacity="0" />
        </linearGradient>

        <linearGradient id={`analyze-grad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={primaryColor} />
          <stop offset="100%" stopColor={secondaryColor} />
        </linearGradient>
      </defs>

      <g>
        <text
          x={40}
          y={20}
          fontSize="10"
          fontFamily="system-ui, sans-serif"
          fontWeight="600"
          fill={primaryColor}
          opacity={mounted ? 0.7 : 0}
          style={{ transition: "opacity 0.5s ease-out" }}
        >
          RAW INPUT
        </text>

        <rect
          x={20}
          y={35}
          width={100}
          height={150}
          rx={8}
          fill="#1e293b"
          stroke={primaryColor}
          strokeWidth={1}
          strokeOpacity={0.3}
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.3s ease-out",
          }}
        />

        {textFragments.map((text, i) => {
          const baseY = 55 + i * 32;
          const pulse = Math.sin(time * 2 + i * 0.5) * 0.2;

          return (
            <text
              key={i}
              x={30}
              y={baseY}
              fontSize="9"
              fontFamily="monospace"
              fill={primaryColor}
              style={{
                opacity: mounted ? 0.6 + pulse : 0,
                transition: "opacity 0.3s ease-out",
              }}
            >
              {text}
            </text>
          );
        })}

        {mounted && (
          <rect
            x={25}
            y={45 + ((time * 40) % 130)}
            width={90}
            height={2}
            fill={primaryColor}
            opacity={0.6}
            rx={1}
          />
        )}
      </g>

      <g>
        <path
          d={`M 120 110 Q 150 110 170 110`}
          fill="none"
          stroke={`url(#input-grad-${id})`}
          strokeWidth={2}
          strokeDasharray="6 4"
          style={{
            strokeDashoffset: -time * 25,
            opacity: mounted ? 0.6 : 0,
          }}
        />

        <g
          style={{
            opacity: mounted ? 1 : 0,
            transform: `scale(${mounted ? 1 : 0})`,
            transformOrigin: `${cx - 10}px 110px`,
            transition: "all 0.5s ease-out 0.2s",
          }}
        >
          <circle
            cx={cx - 10}
            cy={110}
            r={45}
            fill={primaryColor}
            fillOpacity={0.1}
            style={{
              transform: `scale(${1 + Math.sin(time * 2) * 0.05})`,
              transformOrigin: `${cx - 10}px 110px`,
            }}
          />

          <circle
            cx={cx - 10}
            cy={110}
            r={35}
            fill={`url(#analyze-grad-${id})`}
            filter={`url(#glow-${id})`}
          />

          <g transform={`translate(${cx - 10}, 110)`}>
            {[
              { x: 0, y: -12 },
              { x: -15, y: 0 },
              { x: 15, y: 0 },
              { x: -10, y: 12 },
              { x: 10, y: 12 },
            ].map((node, i) => (
              <circle
                key={i}
                cx={node.x}
                cy={node.y}
                r={4}
                fill="white"
                opacity={0.7 + Math.sin(time * 3 + i) * 0.3}
              />
            ))}
            <path
              d="M 0 -12 L -15 0 M 0 -12 L 15 0 M -15 0 L -10 12 M 15 0 L 10 12 M -10 12 L 10 12"
              stroke="white"
              strokeWidth={1.5}
              strokeOpacity={0.5}
              fill="none"
            />
          </g>

          <circle
            cx={cx - 10}
            cy={110}
            r={40}
            fill="none"
            stroke={primaryColor}
            strokeWidth={2}
            strokeDasharray="15 45"
            strokeLinecap="round"
            style={{
              transform: `rotate(${time * 60}deg)`,
              transformOrigin: `${cx - 10}px 110px`,
              opacity: 0.6,
            }}
          />
        </g>

        <text
          x={cx - 10}
          y={165}
          textAnchor="middle"
          fontSize="9"
          fontFamily="system-ui, sans-serif"
          fontWeight="600"
          fill="white"
          opacity={mounted ? 0.5 : 0}
        >
          CLASSIFIER
        </text>
      </g>

      <g>
        <text
          x={width - 70}
          y={20}
          textAnchor="middle"
          fontSize="10"
          fontFamily="system-ui, sans-serif"
          fontWeight="600"
          fill={accentColor}
          opacity={mounted ? 0.7 : 0}
          style={{ transition: "opacity 0.5s ease-out" }}
        >
          DETECTED
        </text>

        {intents.map((intent, i) => {
          const y = 50 + i * 42;
          const isActive = activeIndex === i;

          return (
            <path
              key={`flow-${i}`}
              d={`M ${cx + 25} 110 Q ${cx + 60} ${60 + i * 30} ${width - 120} ${y}`}
              fill="none"
              stroke={intent.color}
              strokeWidth={isActive ? 2 : 1}
              strokeOpacity={isActive ? 0.8 : 0.2}
              strokeDasharray="4 4"
              style={{
                strokeDashoffset: -time * 20,
                transition: "stroke-opacity 0.3s, stroke-width 0.3s",
              }}
            />
          );
        })}

        {intents.map((intent, i) => {
          const y = 50 + i * 42;
          const isActive = activeIndex === i;
          const cardWidth = 95;

          return (
            <g
              key={intent.id}
              style={{
                opacity: mounted ? 1 : 0,
                transform: `translateX(${mounted ? 0 : 20}px)`,
                transition: `all 0.3s ease-out ${0.1 + i * 0.1}s`,
              }}
            >
              <rect
                x={width - 115}
                y={y - 15}
                width={cardWidth}
                height={30}
                rx={6}
                fill={isActive ? intent.color : "#1e293b"}
                fillOpacity={isActive ? 0.3 : 1}
                stroke={intent.color}
                strokeWidth={isActive ? 2 : 1}
                strokeOpacity={isActive ? 1 : 0.3}
                filter={isActive ? `url(#glow-${id})` : "none"}
                style={{ transition: "all 0.3s ease-out" }}
              />

              <circle
                cx={width - 100}
                cy={y}
                r={8}
                fill={intent.color}
                fillOpacity={isActive ? 1 : 0.3}
                style={{ transition: "fill-opacity 0.3s" }}
              />

              {intent.icon === "key" && (
                <path
                  d={`M ${width - 103} ${y - 2} L ${width - 97} ${y + 2} M ${width - 98} ${y + 1} L ${width - 98} ${y + 4}`}
                  stroke="white"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  fill="none"
                />
              )}
              {intent.icon === "tag" && (
                <path
                  d={`M ${width - 103} ${y - 3} L ${width - 97} ${y} L ${width - 103} ${y + 3} Z`}
                  stroke="white"
                  strokeWidth={1.5}
                  fill="none"
                />
              )}
              {intent.icon === "search" && (
                <>
                  <circle cx={width - 101} cy={y - 1} r={3} stroke="white" strokeWidth={1.5} fill="none" />
                  <line x1={width - 99} y1={y + 1} x2={width - 97} y2={y + 3} stroke="white" strokeWidth={1.5} />
                </>
              )}
              {intent.icon === "refresh" && (
                <path
                  d={`M ${width - 103} ${y} A 4 4 0 1 1 ${width - 97} ${y}`}
                  stroke="white"
                  strokeWidth={1.5}
                  fill="none"
                  strokeLinecap="round"
                />
              )}

              <text
                x={width - 85}
                y={y + 4}
                fontSize="10"
                fontFamily="system-ui, sans-serif"
                fontWeight="600"
                fill={isActive ? intent.color : "white"}
                opacity={isActive ? 1 : 0.5}
                style={{ transition: "all 0.3s" }}
              >
                {intent.label}
              </text>

              {isActive && (
                <text
                  x={width - 25}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="8"
                  fontFamily="monospace"
                  fill={intent.color}
                >
                  94%
                </text>
              )}
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
        style={{ transition: "opacity 0.5s ease-out 0.5s" }}
      >
        Real-time Intent Classification
      </text>
    </svg>
  );
}
