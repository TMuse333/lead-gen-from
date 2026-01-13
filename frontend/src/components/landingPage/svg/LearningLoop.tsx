"use client";

import { useState, useEffect, useId } from "react";

interface Props {
  width?: number;
  height?: number;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}

export default function LearningLoop({
  width = 320,
  height = 320,
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
  const loopRadius = 90;

  const stages = [
    { label: "INTERACT", icon: "chat", angle: -90, color: primaryColor },
    { label: "OUTCOME", icon: "chart", angle: 0, color: "#f59e0b" },
    { label: "ANALYZE", icon: "brain", angle: 90, color: secondaryColor },
    { label: "IMPROVE", icon: "up", angle: 180, color: accentColor },
  ];

  const activeIndex = Math.floor((time * 0.5) % 4);

  const particleAngle = (time * 45) % 360;
  const particleRad = (particleAngle * Math.PI) / 180;

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

        <linearGradient id={`loop-grad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={primaryColor} />
          <stop offset="33%" stopColor="#f59e0b" />
          <stop offset="66%" stopColor={secondaryColor} />
          <stop offset="100%" stopColor={accentColor} />
        </linearGradient>

        <radialGradient id={`center-grad-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={primaryColor} stopOpacity="0.2" />
          <stop offset="100%" stopColor={primaryColor} stopOpacity="0" />
        </radialGradient>

        <marker
          id={`arrow-${id}`}
          markerWidth="6"
          markerHeight="6"
          refX="3"
          refY="3"
          orient="auto"
        >
          <path d="M 0 0 L 6 3 L 0 6 Z" fill={primaryColor} opacity={0.5} />
        </marker>
      </defs>

      <text
        x={cx}
        y={25}
        textAnchor="middle"
        fontSize="11"
        fontFamily="system-ui, sans-serif"
        fontWeight="600"
        fill="white"
        opacity={mounted ? 0.7 : 0}
        style={{ transition: "opacity 0.5s" }}
      >
        CONTINUOUS LEARNING
      </text>

      <g>
        <circle
          cx={cx}
          cy={cy}
          r={60}
          fill={`url(#center-grad-${id})`}
          style={{
            opacity: mounted ? 0.8 : 0,
            transform: `scale(${1 + Math.sin(time * 2) * 0.05})`,
            transformOrigin: `${cx}px ${cy}px`,
          }}
        />

        <circle
          cx={cx}
          cy={cy}
          r={35}
          fill="#1e293b"
          stroke={`url(#loop-grad-${id})`}
          strokeWidth={3}
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
          <ellipse cx={cx - 8} cy={cy - 5} rx={12} ry={15} fill="none" stroke={primaryColor} strokeWidth={2} />
          <ellipse cx={cx + 8} cy={cy - 5} rx={12} ry={15} fill="none" stroke={secondaryColor} strokeWidth={2} />
          <path
            d={`M ${cx} ${cy - 20} Q ${cx} ${cy + 5} ${cx} ${cy + 15}`}
            stroke="white"
            strokeWidth={2}
            fill="none"
            opacity={0.5}
          />
          {[
            { x: -12, y: -8 },
            { x: 12, y: -8 },
            { x: -8, y: 5 },
            { x: 8, y: 5 },
            { x: 0, y: -12 },
          ].map((pos, i) => (
            <circle
              key={i}
              cx={cx + pos.x}
              cy={cy + pos.y}
              r={2}
              fill="white"
              opacity={0.5 + Math.sin(time * 3 + i) * 0.3}
            />
          ))}
        </g>

        <text
          x={cx}
          y={cy + 50}
          textAnchor="middle"
          fontSize="10"
          fontFamily="system-ui, sans-serif"
          fontWeight="600"
          fill="white"
          opacity={mounted ? 0.5 : 0}
        >
          AI MODEL
        </text>
      </g>

      <circle
        cx={cx}
        cy={cy}
        r={loopRadius}
        fill="none"
        stroke="white"
        strokeWidth={2}
        strokeOpacity={0.1}
        style={{
          opacity: mounted ? 1 : 0,
          transition: "opacity 0.5s",
        }}
      />

      <circle
        cx={cx}
        cy={cy}
        r={loopRadius}
        fill="none"
        stroke={`url(#loop-grad-${id})`}
        strokeWidth={3}
        strokeDasharray="20 15"
        strokeLinecap="round"
        style={{
          opacity: mounted ? 0.6 : 0,
          strokeDashoffset: -time * 30,
          transition: "opacity 0.5s",
        }}
      />

      {mounted && [45, 135, 225, 315].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x = cx + Math.cos(rad) * loopRadius;
        const y = cy + Math.sin(rad) * loopRadius;
        const rotation = angle + 90;

        return (
          <polygon
            key={angle}
            points="-5,-4 5,0 -5,4"
            fill={primaryColor}
            opacity={0.5}
            style={{
              transform: `translate(${x}px, ${y}px) rotate(${rotation}deg)`,
            }}
          />
        );
      })}

      {mounted && (
        <circle
          cx={cx + Math.cos(particleRad - Math.PI / 2) * loopRadius}
          cy={cy + Math.sin(particleRad - Math.PI / 2) * loopRadius}
          r={6}
          fill="white"
          filter={`url(#glow-${id})`}
        />
      )}

      {stages.map((stage, i) => {
        const angleRad = (stage.angle * Math.PI) / 180;
        const nodeX = cx + Math.cos(angleRad) * loopRadius;
        const nodeY = cy + Math.sin(angleRad) * loopRadius;
        const isActive = activeIndex === i;

        const labelRadius = loopRadius + 35;
        const labelX = cx + Math.cos(angleRad) * labelRadius;
        const labelY = cy + Math.sin(angleRad) * labelRadius;

        return (
          <g key={stage.label}>
            <line
              x1={cx + Math.cos(angleRad) * 35}
              y1={cy + Math.sin(angleRad) * 35}
              x2={cx + Math.cos(angleRad) * (loopRadius - 18)}
              y2={cy + Math.sin(angleRad) * (loopRadius - 18)}
              stroke={stage.color}
              strokeWidth={isActive ? 2 : 1}
              strokeOpacity={isActive ? 0.6 : 0.2}
              strokeDasharray={isActive ? "none" : "4 4"}
              style={{ transition: "all 0.3s" }}
            />

            <g
              style={{
                opacity: mounted ? 1 : 0,
                transform: `scale(${mounted ? 1 : 0})`,
                transformOrigin: `${nodeX}px ${nodeY}px`,
                transition: `all 0.3s ease-out ${i * 0.1}s`,
              }}
            >
              {isActive && (
                <circle
                  cx={nodeX}
                  cy={nodeY}
                  r={22}
                  fill="none"
                  stroke={stage.color}
                  strokeWidth={2}
                  opacity={0.4 + Math.sin(time * 4) * 0.3}
                />
              )}

              <circle
                cx={nodeX}
                cy={nodeY}
                r={18}
                fill={isActive ? stage.color : "#1e293b"}
                stroke={stage.color}
                strokeWidth={2}
                filter={isActive ? `url(#glow-${id})` : "none"}
                style={{ transition: "fill 0.3s" }}
              />

              <g
                style={{
                  opacity: isActive ? 1 : 0.6,
                  transition: "opacity 0.3s",
                }}
              >
                {stage.icon === "chat" && (
                  <>
                    <rect x={nodeX - 8} y={nodeY - 6} width={16} height={10} rx={3} fill="white" />
                    <polygon points={`${nodeX - 4},${nodeY + 4} ${nodeX - 7},${nodeY + 8} ${nodeX - 1},${nodeY + 4}`} fill="white" />
                  </>
                )}
                {stage.icon === "chart" && (
                  <>
                    <rect x={nodeX - 7} y={nodeY} width={4} height={6} fill="white" />
                    <rect x={nodeX - 1} y={nodeY - 4} width={4} height={10} fill="white" />
                    <rect x={nodeX + 5} y={nodeY - 2} width={4} height={8} fill="white" />
                  </>
                )}
                {stage.icon === "brain" && (
                  <>
                    <circle cx={nodeX - 4} cy={nodeY} r={5} stroke="white" strokeWidth={1.5} fill="none" />
                    <circle cx={nodeX + 4} cy={nodeY} r={5} stroke="white" strokeWidth={1.5} fill="none" />
                  </>
                )}
                {stage.icon === "up" && (
                  <path
                    d={`M ${nodeX} ${nodeY - 6} L ${nodeX - 6} ${nodeY + 2} L ${nodeX - 2} ${nodeY + 2} L ${nodeX - 2} ${nodeY + 6} L ${nodeX + 2} ${nodeY + 6} L ${nodeX + 2} ${nodeY + 2} L ${nodeX + 6} ${nodeY + 2} Z`}
                    fill="white"
                  />
                )}
              </g>
            </g>

            <text
              x={labelX}
              y={labelY + 4}
              textAnchor="middle"
              fontSize="9"
              fontFamily="system-ui, sans-serif"
              fontWeight="600"
              fill={isActive ? stage.color : "white"}
              opacity={isActive ? 1 : 0.4}
              style={{ transition: "all 0.3s" }}
            >
              {stage.label}
            </text>
          </g>
        );
      })}

      {mounted && (
        <>
          <g opacity={0.5}>
            <text x={30} y={height - 25} fontSize="8" fontFamily="monospace" fill="white" opacity={0.4}>
              Iterations
            </text>
            <text x={30} y={height - 10} fontSize="14" fontFamily="monospace" fontWeight="600" fill={primaryColor}>
              {Math.floor(time * 2).toLocaleString()}
            </text>
          </g>
          <g opacity={0.5}>
            <text x={width - 30} y={height - 25} fontSize="8" fontFamily="monospace" fill="white" opacity={0.4} textAnchor="end">
              Accuracy
            </text>
            <text x={width - 30} y={height - 10} fontSize="14" fontFamily="monospace" fontWeight="600" fill={accentColor} textAnchor="end">
              {(92 + Math.sin(time * 0.5) * 3).toFixed(1)}%
            </text>
          </g>
        </>
      )}
    </svg>
  );
}
