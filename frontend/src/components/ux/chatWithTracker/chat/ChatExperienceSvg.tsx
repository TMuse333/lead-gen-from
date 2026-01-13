// components/chat/ChatExperienceSvg.tsx
'use client';

import { useState, useEffect, useId } from 'react';

/**
 * Neural Network AI SVG for chat header
 * Adapted from svg_sandbox NeuralNetwork component
 */

interface Props {
  width?: number;
  height?: number;
}

export default function ChatExperienceSvg({ width = 180, height = 180 }: Props) {
  const [mounted, setMounted] = useState(false);
  const [animProgress, setAnimProgress] = useState(0);
  const [time, setTime] = useState(0);
  const id = useId().replace(/:/g, '');

  const primaryColor = '#06b6d4'; // cyan-500
  const secondaryColor = '#3b82f6'; // blue-500
  const electricColor = '#22d3ee'; // cyan-400

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let frame: number;
    let start: number;
    const duration = 4000;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const p = Math.min(elapsed / duration, 1);
      setAnimProgress(p);
      setTime(elapsed / 1000);
      if (p < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        const loop = (ts: number) => {
          setTime(ts / 1000);
          frame = requestAnimationFrame(loop);
        };
        frame = requestAnimationFrame(loop);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  const p = animProgress;
  const cx = width / 2;
  const cy = height / 2;
  const scale = Math.min(width, height) / 200;

  // Neural nodes positions
  const nodes = [
    { x: cx, y: cy, layer: 'center' },
    // Inner ring
    { x: cx - 45 * scale, y: cy - 35 * scale, layer: 'inner' },
    { x: cx + 45 * scale, y: cy - 35 * scale, layer: 'inner' },
    { x: cx - 50 * scale, y: cy + 30 * scale, layer: 'inner' },
    { x: cx + 50 * scale, y: cy + 30 * scale, layer: 'inner' },
    // Outer ring
    { x: cx - 75 * scale, y: cy - 50 * scale, layer: 'outer' },
    { x: cx + 75 * scale, y: cy - 50 * scale, layer: 'outer' },
    { x: cx - 80 * scale, y: cy + 20 * scale, layer: 'outer' },
    { x: cx + 80 * scale, y: cy + 20 * scale, layer: 'outer' },
    { x: cx, y: cy + 65 * scale, layer: 'outer' },
  ];

  // Connections
  const connections = [
    [0, 1], [0, 2], [0, 3], [0, 4],
    [1, 5], [2, 6], [3, 7], [4, 8],
    [3, 9], [4, 9],
    [1, 2], [3, 4],
  ];

  // Get point along a line at t (0-1)
  const getPointOnLine = (x1: number, y1: number, x2: number, y2: number, t: number) => ({
    x: x1 + (x2 - x1) * t,
    y: y1 + (y2 - y1) * t,
  });

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ overflow: 'visible' }}
      className="mx-auto"
    >
      <defs>
        <filter id={`nn-glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <radialGradient id={`nn-center-grad-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="50%" stopColor={electricColor} stopOpacity="1" />
          <stop offset="100%" stopColor={primaryColor} stopOpacity="0.9" />
        </radialGradient>
      </defs>

      {/* Connections */}
      {connections.map(([from, to], i) => {
        const fromNode = nodes[from];
        const toNode = nodes[to];
        const delay = i * 0.08;
        const isActive = p > delay;

        return (
          <g key={`conn-${i}`}>
            {/* Base line */}
            <line
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              stroke={primaryColor}
              strokeWidth={1.5 * scale}
              strokeOpacity={mounted && isActive ? 0.4 : 0}
              style={{ transition: `stroke-opacity 0.5s ease-out ${delay}s` }}
            />

            {/* Flowing binary digits */}
            {mounted && isActive && [0, 1, 2].map((bitIndex) => {
              const speed = 0.25 + (i % 3) * 0.05;
              const offset = bitIndex / 3;
              const t = ((time * speed + offset + i * 0.1) % 1);
              const point = getPointOnLine(fromNode.x, fromNode.y, toNode.x, toNode.y, t);
              const bit = (i + bitIndex) % 2 === 0 ? '0' : '1';

              return (
                <text
                  key={`bit-${i}-${bitIndex}`}
                  x={point.x}
                  y={point.y + 3 * scale}
                  textAnchor="middle"
                  fontSize={7 * scale}
                  fontFamily="monospace"
                  fontWeight="bold"
                  fill={electricColor}
                  opacity={0.9}
                >
                  {bit}
                </text>
              );
            })}
          </g>
        );
      })}

      {/* Outer nodes */}
      {nodes.slice(1).map((node, i) => {
        const isInner = node.layer === 'inner';
        const baseRadius = (isInner ? 8 : 5) * scale;
        const delay = (i + 1) * 0.08;
        const isActive = p > delay;
        const nodeScale = mounted && isActive ? 1 : 0;

        return (
          <g key={`node-${i + 1}`}>
            {/* Node circle */}
            <circle
              cx={node.x}
              cy={node.y}
              r={baseRadius}
              fill={isInner ? primaryColor : secondaryColor}
              stroke={electricColor}
              strokeWidth={1 * scale}
              filter={`url(#nn-glow-${id})`}
              style={{
                transform: `scale(${nodeScale})`,
                transformOrigin: `${node.x}px ${node.y}px`,
                transition: `transform 0.4s ease-out ${delay}s`,
              }}
            />
            {/* Inner dot */}
            <circle
              cx={node.x}
              cy={node.y}
              r={baseRadius * 0.35}
              fill={electricColor}
              style={{
                transform: `scale(${nodeScale})`,
                transformOrigin: `${node.x}px ${node.y}px`,
                transition: `transform 0.4s ease-out ${delay}s`,
              }}
            />
          </g>
        );
      })}

      {/* Center node - Digital Brain/Chip */}
      <g
        style={{
          transform: `scale(${mounted ? 1 : 0})`,
          transformOrigin: `${cx}px ${cy}px`,
          transition: 'transform 0.5s ease-out',
        }}
      >
        {/* Main circle */}
        <circle
          cx={cx}
          cy={cy}
          r={28 * scale}
          fill={`url(#nn-center-grad-${id})`}
          filter={`url(#nn-glow-${id})`}
        />

        {/* Chip/processor icon */}
        <g transform={`translate(${cx}, ${cy})`}>
          {/* Outer square (chip body) */}
          <rect
            x={-14 * scale}
            y={-14 * scale}
            width={28 * scale}
            height={28 * scale}
            rx={4 * scale}
            fill="none"
            stroke="#ffffff"
            strokeWidth={1.5 * scale}
          />

          {/* Inner square (die) */}
          <rect
            x={-8 * scale}
            y={-8 * scale}
            width={16 * scale}
            height={16 * scale}
            rx={2 * scale}
            fill={primaryColor}
            stroke="#ffffff"
            strokeWidth={1 * scale}
          />

          {/* Circuit traces inside */}
          <path
            d={`M ${-4 * scale} ${-4 * scale} L ${-4 * scale} 0 L 0 0 L 0 ${4 * scale}`}
            fill="none"
            stroke="#ffffff"
            strokeWidth={1 * scale}
            strokeLinecap="round"
          />
          <path
            d={`M ${4 * scale} ${-4 * scale} L ${4 * scale} ${-2 * scale} L ${2 * scale} ${-2 * scale}`}
            fill="none"
            stroke="#ffffff"
            strokeWidth={1 * scale}
            strokeLinecap="round"
          />
          <path
            d={`M ${4 * scale} ${4 * scale} L ${2 * scale} ${4 * scale} L ${2 * scale} ${2 * scale}`}
            fill="none"
            stroke="#ffffff"
            strokeWidth={1 * scale}
            strokeLinecap="round"
          />

          {/* Connection pins on chip edges */}
          {[-8, 0, 8].map((offset) => (
            <g key={`pins-${offset}`}>
              {/* Top pins */}
              <line
                x1={offset * scale}
                y1={-14 * scale}
                x2={offset * scale}
                y2={-18 * scale}
                stroke="#ffffff"
                strokeWidth={1.5 * scale}
                strokeLinecap="round"
              />
              {/* Bottom pins */}
              <line
                x1={offset * scale}
                y1={14 * scale}
                x2={offset * scale}
                y2={18 * scale}
                stroke="#ffffff"
                strokeWidth={1.5 * scale}
                strokeLinecap="round"
              />
            </g>
          ))}
          {[-8, 8].map((offset) => (
            <g key={`side-pins-${offset}`}>
              {/* Left pins */}
              <line
                x1={-14 * scale}
                y1={offset * scale}
                x2={-18 * scale}
                y2={offset * scale}
                stroke="#ffffff"
                strokeWidth={1.5 * scale}
                strokeLinecap="round"
              />
              {/* Right pins */}
              <line
                x1={14 * scale}
                y1={offset * scale}
                x2={18 * scale}
                y2={offset * scale}
                stroke="#ffffff"
                strokeWidth={1.5 * scale}
                strokeLinecap="round"
              />
            </g>
          ))}
        </g>
      </g>
    </svg>
  );
}
