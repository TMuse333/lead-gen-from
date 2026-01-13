"use client";

import { useState, useEffect, useId } from "react";

/**
 * ChatToOffer - Animated SVG showing input → chatbot → generated offer flow
 * Visualizes: User input flows into AI chatbot which processes and generates
 * a personalized timeline output
 */

interface Props {
  width?: number;
  height?: number;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}

export default function ChatToOffer({
  width = 400,
  height = 200,
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

  // Input messages that flow in
  const inputs = [
    { text: "Buying", delay: 0 },
    { text: "$500k", delay: 0.3 },
    { text: "3 bed", delay: 0.6 },
  ];

  // Output form fields that appear
  const outputs = [
    { label: "Timeline", value: "8 wks", delay: 0.2 },
    { label: "Phases", value: "6", delay: 0.4 },
    { label: "Tasks", value: "24", delay: 0.6 },
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
          <stop offset="100%" stopColor={primaryColor} stopOpacity="0.5" />
        </linearGradient>

        <linearGradient id={`output-grad-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.5" />
          <stop offset="50%" stopColor={accentColor} stopOpacity="1" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
        </linearGradient>

        <linearGradient id={`bot-grad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={primaryColor} />
          <stop offset="100%" stopColor={secondaryColor} />
        </linearGradient>

        <radialGradient id={`bot-glow-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={primaryColor} stopOpacity="0.4" />
          <stop offset="100%" stopColor={primaryColor} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* === LEFT SIDE: INPUT === */}
      <g>
        {/* Input label */}
        <text
          x={50}
          y={30}
          textAnchor="middle"
          fontSize="11"
          fontFamily="system-ui, sans-serif"
          fontWeight="600"
          fill={primaryColor}
          opacity={mounted ? 0.8 : 0}
          style={{ transition: "opacity 0.5s ease-out" }}
        >
          CHAT
        </text>

        {/* Input chat bubbles */}
        {inputs.map((input, i) => {
          const y = 55 + i * 35;
          const cycleTime = (time * 0.4 + input.delay) % 3;
          const isVisible = cycleTime > 0 && cycleTime < 2;
          const moveX = Math.min(cycleTime * 40, 60);

          return (
            <g
              key={`input-${i}`}
              style={{
                opacity: mounted && isVisible ? 1 : 0,
                transform: `translateX(${mounted && isVisible ? moveX : 0}px)`,
                transition: "opacity 0.3s ease-out, transform 0.5s ease-out",
              }}
            >
              <rect
                x={15}
                y={y - 12}
                width={55}
                height={24}
                rx={12}
                fill={primaryColor}
                fillOpacity={0.15}
                stroke={primaryColor}
                strokeWidth={1}
              />
              <text
                x={42}
                y={y + 4}
                textAnchor="middle"
                fontSize="10"
                fontFamily="monospace"
                fill={primaryColor}
              >
                {input.text}
              </text>
            </g>
          );
        })}

        {/* Flow arrow to center */}
        <path
          d={`M 90 ${cy} L ${cx - 55} ${cy}`}
          fill="none"
          stroke={`url(#input-grad-${id})`}
          strokeWidth={2}
          strokeDasharray="8 4"
          style={{
            strokeDashoffset: -time * 30,
            opacity: mounted ? 0.7 : 0,
            transition: "opacity 0.5s ease-out",
          }}
        />

        {/* Data particles flowing to center */}
        {mounted && [0, 1, 2].map((i) => {
          const progress = ((time * 0.5 + i * 0.33) % 1);
          const x = 90 + progress * (cx - 145);
          return (
            <circle
              key={`particle-in-${i}`}
              cx={x}
              cy={cy + Math.sin(progress * Math.PI * 2) * 5}
              r={3}
              fill={primaryColor}
              opacity={0.8}
            />
          );
        })}
      </g>

      {/* === CENTER: CHATBOT/AI === */}
      <g>
        {/* Ambient glow */}
        <circle
          cx={cx}
          cy={cy}
          r={55}
          fill={`url(#bot-glow-${id})`}
          style={{
            opacity: mounted ? 0.6 + Math.sin(time * 2) * 0.2 : 0,
            transition: "opacity 0.5s ease-out",
          }}
        />

        {/* Main chatbot circle */}
        <circle
          cx={cx}
          cy={cy}
          r={40}
          fill={`url(#bot-grad-${id})`}
          filter={`url(#glow-${id})`}
          style={{
            opacity: mounted ? 1 : 0,
            transform: `scale(${mounted ? 1 : 0})`,
            transformOrigin: `${cx}px ${cy}px`,
            transition: "all 0.5s ease-out",
          }}
        />

        {/* Chat bubble icon inside */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.2s",
          }}
        >
          {/* Main bubble */}
          <rect
            x={cx - 18}
            y={cy - 15}
            width={36}
            height={24}
            rx={8}
            fill="white"
            fillOpacity={0.95}
          />
          {/* Bubble tail */}
          <polygon
            points={`${cx - 8},${cy + 9} ${cx - 15},${cy + 18} ${cx - 2},${cy + 9}`}
            fill="white"
            fillOpacity={0.95}
          />
          {/* Typing dots */}
          {[0, 1, 2].map((i) => (
            <circle
              key={`dot-${i}`}
              cx={cx - 8 + i * 8}
              cy={cy - 3}
              r={3}
              fill={secondaryColor}
              style={{
                opacity: 0.4 + Math.sin(time * 4 + i * 0.8) * 0.6,
              }}
            />
          ))}
        </g>

        {/* "AI" label below */}
        <text
          x={cx}
          y={cy + 55}
          textAnchor="middle"
          fontSize="10"
          fontFamily="system-ui, sans-serif"
          fontWeight="600"
          fill="white"
          opacity={mounted ? 0.6 : 0}
          style={{ transition: "opacity 0.5s ease-out 0.3s" }}
        >
          AI ENGINE
        </text>

        {/* Processing ring */}
        <circle
          cx={cx}
          cy={cy}
          r={45}
          fill="none"
          stroke={primaryColor}
          strokeWidth={2}
          strokeDasharray="20 60"
          strokeLinecap="round"
          style={{
            opacity: mounted ? 0.5 : 0,
            transform: `rotate(${time * 60}deg)`,
            transformOrigin: `${cx}px ${cy}px`,
            transition: "opacity 0.5s ease-out",
          }}
        />
      </g>

      {/* === RIGHT SIDE: OUTPUT/TIMELINE === */}
      <g>
        {/* Output label */}
        <text
          x={width - 60}
          y={30}
          textAnchor="middle"
          fontSize="11"
          fontFamily="system-ui, sans-serif"
          fontWeight="600"
          fill={accentColor}
          opacity={mounted ? 0.8 : 0}
          style={{ transition: "opacity 0.5s ease-out" }}
        >
          TIMELINE
        </text>

        {/* Flow arrow from center */}
        <path
          d={`M ${cx + 55} ${cy} L ${width - 100} ${cy}`}
          fill="none"
          stroke={`url(#output-grad-${id})`}
          strokeWidth={2}
          strokeDasharray="8 4"
          style={{
            strokeDashoffset: -time * 30,
            opacity: mounted ? 0.7 : 0,
            transition: "opacity 0.5s ease-out",
          }}
        />

        {/* Data particles flowing from center */}
        {mounted && [0, 1, 2].map((i) => {
          const progress = ((time * 0.5 + i * 0.33) % 1);
          const x = cx + 55 + progress * (width - cx - 155);
          return (
            <circle
              key={`particle-out-${i}`}
              cx={x}
              cy={cy + Math.sin(progress * Math.PI * 2) * 5}
              r={3}
              fill={accentColor}
              opacity={0.8}
            />
          );
        })}

        {/* Output form/offer card */}
        <g
          style={{
            opacity: mounted ? 1 : 0,
            transform: `translateX(${mounted ? 0 : -20}px)`,
            transition: "all 0.5s ease-out 0.3s",
          }}
        >
          {/* Card background */}
          <rect
            x={width - 115}
            y={40}
            width={100}
            height={120}
            rx={8}
            fill="#1e293b"
            stroke={accentColor}
            strokeWidth={1.5}
            filter={`url(#glow-${id})`}
          />

          {/* Card header */}
          <rect
            x={width - 115}
            y={40}
            width={100}
            height={28}
            rx={8}
            fill={accentColor}
            fillOpacity={0.2}
          />
          <text
            x={width - 65}
            y={58}
            textAnchor="middle"
            fontSize="9"
            fontFamily="system-ui, sans-serif"
            fontWeight="600"
            fill={accentColor}
          >
            YOUR ROADMAP
          </text>

          {/* Output fields */}
          {outputs.map((output, i) => {
            const y = 80 + i * 25;
            const isVisible = ((time * 0.5) % 2) > output.delay;

            return (
              <g
                key={`output-${i}`}
                style={{
                  opacity: isVisible ? 1 : 0.3,
                  transition: "opacity 0.3s ease-out",
                }}
              >
                <text
                  x={width - 108}
                  y={y}
                  fontSize="8"
                  fontFamily="system-ui, sans-serif"
                  fill="white"
                  opacity={0.6}
                >
                  {output.label}
                </text>
                <text
                  x={width - 22}
                  y={y}
                  textAnchor="end"
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="600"
                  fill={accentColor}
                >
                  {output.value}
                </text>
              </g>
            );
          })}

          {/* Checkmark animation */}
          {mounted && ((time * 0.5) % 2) > 1 && (
            <g
              style={{
                opacity: 1,
                transition: "opacity 0.3s ease-out",
              }}
            >
              <circle
                cx={width - 65}
                cy={145}
                r={8}
                fill={accentColor}
              />
              <polyline
                points={`${width - 69},145 ${width - 66},148 ${width - 61},142`}
                fill="none"
                stroke="white"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          )}
        </g>
      </g>

      {/* Bottom flow label */}
      <text
        x={cx}
        y={height - 10}
        textAnchor="middle"
        fontSize="10"
        fontFamily="system-ui, sans-serif"
        fill="white"
        opacity={mounted ? 0.4 : 0}
        style={{ transition: "opacity 0.5s ease-out 0.5s" }}
      >
        Chat → AI Processing → Personalized Timeline
      </text>
    </svg>
  );
}
