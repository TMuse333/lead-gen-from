// components/chat/GalaxyBackground.tsx
'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

interface Particle {
  id: number;
  x: number;
  duration: number;
  delay: number;
}

export function GalaxyBackground() {
  const [stars, setStars] = useState<Star[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mounted, setMounted] = useState(false);

  // Generate stars and particles only on client
  useEffect(() => {
    setMounted(true);
    
    const newStars = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
    }));
    setStars(newStars);

    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      duration: Math.random() * 10 + 15,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  // Don't render random elements until mounted (prevent hydration mismatch)
  if (!mounted) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Static gradient background only */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 opacity-10" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 opacity-10" />
      
      {/* Animated Orbs */}
      <motion.div
        className="absolute top-20 -left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      <motion.div
        className="absolute bottom-20 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
        animate={{
          x: [0, -100, 0],
          y: [0, 50, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Twinkling Stars */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
          }}
        />
      ))}

      {/* Floating Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 bg-purple-400/30 rounded-full"
          initial={{
            x: `${particle.x}%`,
            y: '100%',
          }}
          animate={{
            y: '-10%',
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
          }}
        />
      ))}
    </div>
  );
}