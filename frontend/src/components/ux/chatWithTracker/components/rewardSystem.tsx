// components/chat/RewardSystem.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Star, Coins, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Reward {
  id: string;
  type: 'star' | 'coin' | 'zap';
  x: number;
  y: number;
  value: number;
}

interface RewardSystemProps {
  trigger: number; // Increment this to trigger new rewards
}

export function RewardSystem({ trigger }: RewardSystemProps) {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [totalCoins, setTotalCoins] = useState(0);
  const [totalStars, setTotalStars] = useState(0);

  useEffect(() => {
    if (trigger === 0) return;

    // Generate random rewards
    const newRewards: Reward[] = [];
    const rewardCount = Math.floor(Math.random() * 3) + 3; // 3-5 rewards

    for (let i = 0; i < rewardCount; i++) {
      const types: ('star' | 'coin' | 'zap')[] = ['star', 'coin', 'zap'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      newRewards.push({
        id: `${trigger}-${i}-${Date.now()}`, // More unique ID
        type,
        x: Math.random() * 80 + 10, // 10-90%
        y: 50, // Start from middle
        value: type === 'coin' ? 10 : type === 'star' ? 1 : 5,
      });
    }

    setRewards((prev) => [...prev, ...newRewards]);

    // Update totals
    newRewards.forEach((r) => {
      if (r.type === 'coin') setTotalCoins((c) => c + r.value);
      if (r.type === 'star') setTotalStars((s) => s + r.value);
    });

    // Clean up old rewards after animation
    setTimeout(() => {
      setRewards((prev) => prev.filter((r) => !r.id.startsWith(`${trigger}-`)));
    }, 2000);
  }, [trigger]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'star':
        return <Star className="w-full h-full text-yellow-400 fill-yellow-400" />;
      case 'coin':
        return <Coins className="w-full h-full text-amber-500" />;
      case 'zap':
        return <Zap className="w-full h-full text-blue-500 fill-blue-500" />;
    }
  };

  return (
    <>
      {/* Score Display */}
      <div className="fixed top-4 right-4 flex gap-3 z-50">
        {/* Stars - FIXED: Use unique key */}
        <motion.div
          className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-white px-4 py-2 rounded-full shadow-lg font-bold flex items-center gap-2"
          key={`stars-${totalStars}`} // ✅ Unique prefix
          animate={{ scale: [1, 1.2, 1] }}
        >
          <Star className="w-5 h-5 fill-white" />
          {totalStars}
        </motion.div>
        
        {/* Coins - FIXED: Use unique key */}
        <motion.div
          className="bg-gradient-to-br from-amber-400 to-amber-600 text-white px-4 py-2 rounded-full shadow-lg font-bold flex items-center gap-2"
          key={`coins-${totalCoins}`} // ✅ Unique prefix
          animate={{ scale: [1, 1.2, 1] }}
        >
          <Coins className="w-5 h-5" />
          {totalCoins}
        </motion.div>
      </div>

      {/* Animated Rewards */}
      <AnimatePresence>
        {rewards.map((reward) => (
          <motion.div
            key={reward.id}
            className="fixed w-8 h-8 pointer-events-none z-40"
            initial={{
              x: `${reward.x}vw`,
              y: '50vh',
              scale: 0,
              rotate: 0,
            }}
            animate={{
              y: '-10vh',
              scale: [0, 1.5, 1],
              rotate: 360,
            }}
            exit={{
              y: '-20vh',
              opacity: 0,
              scale: 0,
            }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          >
            {getIcon(reward.type)}
          </motion.div>
        ))}
      </AnimatePresence>
    </>
  );
}