"use client";

import { useState, useEffect } from "react";

/**
 * ConversationFlow - Chat bubbles with AI data flow
 * Represents intelligent chatbot conversations
 */

const CONFIG = {
  primaryColor: "#06b6d4", // cyan-500
  secondaryColor: "#3b82f6", // blue-500
  userColor: "#64748b", // slate-500
  aiColor: "#06b6d4", // cyan
};

interface Props {
  size?: number;
  progress?: number;
  autoAnimate?: boolean;
}

export default function ConversationFlow({
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
    const duration = 5000;

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
  const width = size * 1.2;
  const height = size;

  const messages = [
    { type: "user", text: "I want to buy", y: 30, delay: 0 },
    { type: "ai", text: "Great! Tell me more", y: 65, delay: 0.15 },
    { type: "user", text: "3 bed, $500k", y: 100, delay: 0.3 },
    { type: "ai", text: "I found 12 homes!", y: 135, delay: 0.45 },
  ];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ overflow: "visible" }}
    >
      <defs>
        <filter id="chat-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <linearGradient id="ai-bubble" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={CONFIG.primaryColor} />
          <stop offset="100%" stopColor={CONFIG.secondaryColor} />
        </linearGradient>

        <linearGradient id="data-flow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={CONFIG.primaryColor} stopOpacity="0" />
          <stop offset="50%" stopColor={CONFIG.primaryColor} stopOpacity="1" />
          <stop offset="100%" stopColor={CONFIG.primaryColor} stopOpacity="0" />
        </linearGradient>
      </defs>

      <style>
        {`
          @keyframes typing {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
          }
          @keyframes data-pulse {
            0% { stroke-dashoffset: 20; }
            100% { stroke-dashoffset: 0; }
          }
        `}
      </style>

      {/* Central data flow line */}
      <line
        x1={width / 2}
        y1={10}
        x2={width / 2}
        y2={height - 10}
        stroke="url(#data-flow)"
        strokeWidth="2"
        strokeDasharray="4 4"
        strokeOpacity={mounted ? 0.5 : 0}
        style={{
          transition: "stroke-opacity 0.5s ease-out",
          animation: mounted ? "data-pulse 2s linear infinite" : "none",
        }}
      />

      {/* Chat bubbles */}
      {messages.map((msg, i) => {
        const isUser = msg.type === "user";
        const bubbleX = isUser ? 20 : width - 20;
        const bubbleWidth = 90;
        const isVisible = p > msg.delay;
        const scale = mounted && isVisible ? 1 : 0;

        return (
          <g
            key={i}
            style={{
              transform: `scale(${scale})`,
              transformOrigin: `${isUser ? bubbleX + bubbleWidth / 2 : bubbleX - bubbleWidth / 2}px ${msg.y + 12}px`,
              transition: `transform 0.4s ease-out ${msg.delay}s`,
            }}
          >
            {/* Bubble */}
            <rect
              x={isUser ? bubbleX : bubbleX - bubbleWidth}
              y={msg.y}
              width={bubbleWidth}
              height={28}
              rx={14}
              fill={isUser ? CONFIG.userColor : "url(#ai-bubble)"}
              filter={!isUser ? "url(#chat-glow)" : undefined}
            />

            {/* Tail */}
            <polygon
              points={
                isUser
                  ? `${bubbleX + 5},${msg.y + 20} ${bubbleX - 5},${msg.y + 28} ${bubbleX + 5},${msg.y + 28}`
                  : `${bubbleX - 5},${msg.y + 20} ${bubbleX + 5},${msg.y + 28} ${bubbleX - 5},${msg.y + 28}`
              }
              fill={isUser ? CONFIG.userColor : CONFIG.secondaryColor}
            />

            {/* Text */}
            <text
              x={isUser ? bubbleX + bubbleWidth / 2 : bubbleX - bubbleWidth / 2}
              y={msg.y + 18}
              textAnchor="middle"
              fontSize="10"
              fontFamily="monospace"
              fill="white"
            >
              {msg.text}
            </text>

            {/* AI indicator */}
            {!isUser && isVisible && (
              <circle
                cx={bubbleX - bubbleWidth - 10}
                cy={msg.y + 14}
                r={6}
                fill={CONFIG.primaryColor}
                filter="url(#chat-glow)"
              >
                <animate
                  attributeName="r"
                  values="5;7;5"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              </circle>
            )}
          </g>
        );
      })}

      {/* Data particles flowing between bubbles */}
      {mounted && p > 0.6 && (
        <>
          {[0, 1, 2].map((i) => {
            const yOffset = (p * 100 + i * 50) % (height - 40);
            return (
              <circle
                key={`particle-${i}`}
                cx={width / 2}
                cy={20 + yOffset}
                r={3}
                fill={CONFIG.primaryColor}
                fillOpacity={0.8}
              />
            );
          })}
        </>
      )}

      {/* Qualification badge */}
      {mounted && p > 0.8 && (
        <g
          style={{
            opacity: p > 0.9 ? 1 : 0,
            transition: "opacity 0.5s ease-out",
          }}
        >
          <rect
            x={width / 2 - 45}
            y={height - 25}
            width={90}
            height={20}
            rx={10}
            fill={CONFIG.primaryColor}
            fillOpacity="0.2"
          />
          <text
            x={width / 2}
            y={height - 11}
            textAnchor="middle"
            fontSize="10"
            fontFamily="monospace"
            fill={CONFIG.primaryColor}
          >
            QUALIFIED LEAD
          </text>
        </g>
      )}
    </svg>
  );
}
