import { motion } from 'framer-motion';

interface AnimatedParticlesProps {
  progress: number;
}

export function AnimatedParticles({ progress }: AnimatedParticlesProps) {
  if (progress <= 30) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(Math.floor(progress / 15))].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-blue-400 rounded-full"
          initial={{ x: Math.random() * 100 + '%', y: '100%', opacity: 0 }}
          animate={{
            y: '-20%',
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
}