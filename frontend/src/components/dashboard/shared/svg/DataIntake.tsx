"use client";

import { useState, useEffect } from "react";

/**
 * DataIntake - Data gently falling into database, outputting insights
 * Attempting to match user's isometric style from HeroExp
 */

const CONFIG = {
  // Matching user's cyan palette
  primaryCyan: "#00caff",
  lightCyan: "#00e4ff",
  accentCyan: "#33ddff",
  midCyan: "#00c1ff",
  deepBlue: "#2800e3",
  // Grays from original
  lightGray: "#e1e1e3",
  strokeDark: "#006f89",
};

interface Props {
  width?: number;
  height?: number;
}

export default function DataIntake({ width = 320, height = 380 }: Props) {
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

  const cx = width / 2;

  // Gentle falling data particles - slow and calm
  const fallingData = Array.from({ length: 12 }, (_, i) => ({
    x: 80 + (i % 4) * 45 + ((i % 3) * 12),
    offset: i * 0.083,
    char: i % 2 === 0 ? "1" : "0",
    speed: 0.06 + (i % 3) * 0.015,
  }));

  // Output insights flowing out
  const outputData = Array.from({ length: 6 }, (_, i) => ({
    offset: i * 0.167,
    speed: 0.08,
  }));

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ overflow: "visible" }}
    >
      <defs>
        {/* Matching user's style block approach */}
        <filter id="di-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <linearGradient id="di-db-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={CONFIG.lightCyan} />
          <stop offset="100%" stopColor={CONFIG.primaryCyan} />
        </linearGradient>

        <linearGradient id="di-output-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={CONFIG.accentCyan} />
          <stop offset="100%" stopColor={CONFIG.deepBlue} />
        </linearGradient>
      </defs>

      {/* === FALLING DATA SECTION === */}
      {/* Gentle binary rain flowing toward funnel - all converge to center */}
      {mounted && fallingData.map((particle, i) => {
        const t = ((time * particle.speed + particle.offset) % 1);
        const startY = 15;
        const endY = 120;
        const y = startY + (endY - startY) * t;

        // Eased convergence - starts slow, accelerates toward center
        // Using cubic easing for smooth "suction" feel
        const easeT = t * t * (3 - 2 * t); // smoothstep
        const driftX = particle.x + (cx - particle.x) * easeT;

        // Fade in at top, fade out as it enters funnel
        const opacity = t < 0.1 ? t * 8 : t > 0.85 ? (1 - t) * 6 : 0.7;

        return (
          <text
            key={i}
            x={driftX}
            y={y}
            textAnchor="middle"
            fontSize="11"
            fontFamily="monospace"
            fontWeight="bold"
            fill={CONFIG.primaryCyan}
            opacity={opacity}
          >
            {particle.char}
          </text>
        );
      })}

      {/* === INTAKE FUNNEL === */}
      {/* Trying to match isometric style - funnel/collector */}
      <g
        style={{
          opacity: mounted ? 1 : 0,
          transition: "opacity 0.5s ease-out 0.2s",
        }}
      >
        {/* Funnel shadow */}
        <ellipse
          cx={cx}
          cy={138}
          rx={55}
          ry={12}
          fill={CONFIG.lightGray}
          opacity={0.2}
        />

        {/* Funnel top opening */}
        <ellipse
          cx={cx}
          cy={120}
          rx={50}
          ry={10}
          fill={CONFIG.midCyan}
          stroke={CONFIG.strokeDark}
          strokeWidth="1"
        />

        {/* Funnel body - isometric-ish cone */}
        <path
          d={`M ${cx - 50} 120
              Q ${cx - 35} 145 ${cx - 15} 155
              L ${cx + 15} 155
              Q ${cx + 35} 145 ${cx + 50} 120
              Z`}
          fill={CONFIG.primaryCyan}
          stroke={CONFIG.strokeDark}
          strokeWidth="1"
        />

        {/* Funnel inner glow */}
        <ellipse
          cx={cx}
          cy={122}
          rx={35}
          ry={6}
          fill={CONFIG.lightCyan}
          opacity={0.5}
        />

        {/* Funnel spout */}
        <rect
          x={cx - 8}
          y={155}
          width={16}
          height={20}
          fill={CONFIG.primaryCyan}
          stroke={CONFIG.strokeDark}
          strokeWidth="1"
        />
      </g>

      {/* === DATABASE - Isometric Cylinder === */}
      {/* Attempting user's isometric layering style */}
      <g
        style={{
          opacity: mounted ? 1 : 0,
          transition: "opacity 0.5s ease-out 0.3s",
        }}
      >
        {/* DB Shadow */}
        <ellipse
          cx={cx + 8}
          cy={268}
          rx={48}
          ry={12}
          fill={CONFIG.lightGray}
          opacity={0.25}
        />

        {/* DB Body - cylinder back */}
        <path
          d={`M ${cx - 45} 195
              L ${cx - 45} 255
              Q ${cx - 45} 267 ${cx} 267
              Q ${cx + 45} 267 ${cx + 45} 255
              L ${cx + 45} 195`}
          fill={CONFIG.primaryCyan}
          stroke={CONFIG.strokeDark}
          strokeWidth="1.5"
        />

        {/* DB middle ring */}
        <ellipse
          cx={cx}
          cy={225}
          rx={45}
          ry={10}
          fill="none"
          stroke={CONFIG.strokeDark}
          strokeWidth="1"
          opacity={0.5}
        />

        {/* DB top surface */}
        <ellipse
          cx={cx}
          cy={195}
          rx={45}
          ry={10}
          fill={CONFIG.lightCyan}
          stroke={CONFIG.strokeDark}
          strokeWidth="1.5"
        />

        {/* DB highlight */}
        <ellipse
          cx={cx}
          cy={195}
          rx={30}
          ry={6}
          fill={CONFIG.accentCyan}
          opacity={0.4}
        />

        {/* DB Icon - data symbol inside */}
        <g filter="url(#di-glow)">
          {/* Stack of data layers */}
          {[0, 1, 2].map((i) => (
            <rect
              key={i}
              x={cx - 20}
              y={210 + i * 14}
              width={40}
              height={8}
              rx={2}
              fill={CONFIG.lightGray}
              opacity={mounted ? 0.7 + Math.sin(time * 1.5 + i * 0.5) * 0.2 : 0.7}
            />
          ))}
        </g>

        {/* Processing indicator - gentle pulse */}
        <circle
          cx={cx + 32}
          cy={230}
          r={5}
          fill={CONFIG.lightCyan}
          opacity={mounted ? 0.5 + Math.sin(time * 2) * 0.4 : 0.5}
        />
      </g>

      {/* === OUTPUT SECTION === */}
      {/* Data flowing from DB to output */}
      <g
        style={{
          opacity: mounted ? 1 : 0,
          transition: "opacity 0.5s ease-out 0.4s",
        }}
      >
        {/* Output pipe */}
        <path
          d={`M ${cx} 267
              L ${cx} 285
              Q ${cx} 295 ${cx + 20} 300
              L ${cx + 60} 300`}
          fill="none"
          stroke={CONFIG.primaryCyan}
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d={`M ${cx} 267
              L ${cx} 285
              Q ${cx} 295 ${cx + 20} 300
              L ${cx + 60} 300`}
          fill="none"
          stroke={CONFIG.lightCyan}
          strokeWidth="4"
          strokeLinecap="round"
          opacity={0.6}
        />

        {/* Flowing output particles */}
        {mounted && outputData.map((particle, i) => {
          const t = ((time * particle.speed + particle.offset) % 1);

          // Follow the pipe path
          let x, y;
          if (t < 0.4) {
            // Vertical section
            x = cx;
            y = 270 + (t / 0.4) * 20;
          } else {
            // Curved + horizontal section
            const curveT = (t - 0.4) / 0.6;
            x = cx + curveT * 65;
            y = 290 + Math.sin(curveT * Math.PI * 0.5) * 10;
          }

          const opacity = t < 0.1 ? t * 8 : t > 0.85 ? (1 - t) * 6 : 0.8;

          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={3}
              fill={CONFIG.accentCyan}
              opacity={opacity}
            />
          );
        })}

        {/* Output result - Document/Insight card */}
        <g transform={`translate(${cx + 70}, 280)`}>
          {/* Card shadow */}
          <rect
            x={4}
            y={4}
            width={70}
            height={50}
            rx={4}
            fill={CONFIG.lightGray}
            opacity={0.2}
          />

          {/* Card body */}
          <rect
            x={0}
            y={0}
            width={70}
            height={50}
            rx={4}
            fill={CONFIG.lightGray}
            stroke={CONFIG.strokeDark}
            strokeWidth="1"
          />

          {/* Card header bar */}
          <rect
            x={0}
            y={0}
            width={70}
            height={12}
            rx={4}
            fill={CONFIG.deepBlue}
          />
          <rect
            x={0}
            y={8}
            width={70}
            height={4}
            fill={CONFIG.deepBlue}
          />

          {/* Chart/graph lines inside */}
          <polyline
            points="8,28 20,35 32,25 44,38 56,22 62,30"
            fill="none"
            stroke={CONFIG.primaryCyan}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data point dots */}
          {[8, 20, 32, 44, 56].map((px, i) => (
            <circle
              key={i}
              cx={px}
              cy={[28, 35, 25, 38, 22][i]}
              r={2.5}
              fill={CONFIG.lightCyan}
              opacity={mounted ? 0.8 + Math.sin(time * 2 + i * 0.5) * 0.2 : 0.8}
            />
          ))}

          {/* Checkmark badge */}
          <circle
            cx={62}
            cy={42}
            r={8}
            fill={CONFIG.lightCyan}
            stroke={CONFIG.strokeDark}
            strokeWidth="1"
          />
          <polyline
            points="57,42 60,45 67,38"
            fill="none"
            stroke={CONFIG.deepBlue}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </g>

      {/* === ISOMETRIC CUBE DECORATIONS === */}
      {/* Trying to replicate user's 3D cube style */}
      <g
        filter="url(#di-glow)"
        style={{
          opacity: mounted ? 0.8 + Math.sin(time * 1.5) * 0.15 : 0,
          transition: "opacity 0.5s ease-out 0.5s",
        }}
      >
        {/* Small floating cube - left side */}
        <g transform="translate(35, 200)">
          {/* Top face */}
          <path
            d="M 0,-8 L 12,0 L 0,8 L -12,0 Z"
            fill={CONFIG.lightCyan}
            stroke={CONFIG.strokeDark}
            strokeWidth="0.8"
          />
          {/* Left face */}
          <path
            d="M -12,0 L 0,8 L 0,20 L -12,12 Z"
            fill={CONFIG.primaryCyan}
            stroke={CONFIG.strokeDark}
            strokeWidth="0.8"
          />
          {/* Right face */}
          <path
            d="M 12,0 L 0,8 L 0,20 L 12,12 Z"
            fill={CONFIG.midCyan}
            stroke={CONFIG.strokeDark}
            strokeWidth="0.8"
          />
        </g>

        {/* Small floating cube - right side */}
        <g transform="translate(285, 180)">
          {/* Top face */}
          <path
            d="M 0,-8 L 12,0 L 0,8 L -12,0 Z"
            fill={CONFIG.lightCyan}
            stroke={CONFIG.strokeDark}
            strokeWidth="0.8"
          />
          {/* Left face */}
          <path
            d="M -12,0 L 0,8 L 0,20 L -12,12 Z"
            fill={CONFIG.primaryCyan}
            stroke={CONFIG.strokeDark}
            strokeWidth="0.8"
          />
          {/* Right face */}
          <path
            d="M 12,0 L 0,8 L 0,20 L 12,12 Z"
            fill={CONFIG.midCyan}
            stroke={CONFIG.strokeDark}
            strokeWidth="0.8"
          />
        </g>
      </g>

      {/* === LABELS === */}
      <text
        x={cx}
        y={height - 10}
        textAnchor="middle"
        fontSize="9"
        fontFamily="monospace"
        fill={CONFIG.strokeDark}
        opacity={mounted ? 0.6 : 0}
        style={{ transition: "opacity 0.5s ease-out 0.6s" }}
      >
        RAW DATA → PROCESS → INSIGHT
      </text>
    </svg>
  );
}
