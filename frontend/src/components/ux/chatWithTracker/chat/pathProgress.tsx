// components/chat/PathProgress.tsx
'use client';

import { motion } from 'framer-motion';
import { Star, CheckCircle2, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PathNode {
  id: number;
  label: string;
  completed: boolean;
  current: boolean;
  x: number;
  y: number;
}

interface PathProgressProps {
  totalSteps: number;
  currentStep: number;
  completedSteps: number;
}

export function PathProgress({ totalSteps, currentStep, completedSteps }: PathProgressProps) {
  const [nodes, setNodes] = useState<PathNode[]>([]);

  useEffect(() => {
    // Create a winding path
    const newNodes: PathNode[] = [];
    for (let i = 0; i < totalSteps; i++) {
      const progress = i / (totalSteps - 1);
      // Create S-curve path
      const x = 20 + Math.sin(progress * Math.PI * 2) * 30;
      const y = progress * 80 + 10;
      
      newNodes.push({
        id: i,
        label: `Step ${i + 1}`,
        completed: i < completedSteps,
        current: i === currentStep,
        x,
        y,
      });
    }
    setNodes(newNodes);
  }, [totalSteps, currentStep, completedSteps]);

  return (
    <div className="relative h-full w-20 flex-shrink-0">
      {/* Path Lines */}
      <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
        {nodes.map((node, i) => {
          if (i === 0) return null;
          const prev = nodes[i - 1];
          return (
            <motion.line
              key={`line-${i}`}
              x1={`${prev.x}%`}
              y1={`${prev.y}%`}
              x2={`${node.x}%`}
              y2={`${node.y}%`}
              stroke={node.completed ? 'url(#gradient-complete)' : '#E5E7EB'}
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: node.completed ? 1 : 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            />
          );
        })}
        
        {/* Gradient Definitions */}
        <defs>
          <linearGradient id="gradient-complete" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
      </svg>

      {/* Path Nodes */}
      {nodes.map((node, i) => (
        <motion.div
          key={node.id}
          className="absolute"
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
        >
          {/* Node Circle */}
          <div className="relative">
            <motion.div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-3 ${
                node.completed
                  ? 'bg-gradient-to-br from-purple-500 to-blue-500 border-purple-300 shadow-lg shadow-purple-500/50'
                  : node.current
                  ? 'bg-white border-blue-500 shadow-lg shadow-blue-500/50'
                  : 'bg-gray-100 border-gray-300'
              }`}
              animate={
                node.current
                  ? {
                      scale: [1, 1.2, 1],
                      boxShadow: [
                        '0 0 0 0 rgba(59, 130, 246, 0.7)',
                        '0 0 0 10px rgba(59, 130, 246, 0)',
                      ],
                    }
                  : {}
              }
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {node.completed ? (
                <CheckCircle2 className="w-5 h-5 text-white" />
              ) : node.current ? (
                <Star className="w-5 h-5 text-blue-600" />
              ) : (
                <Lock className="w-4 h-4 text-gray-400" />
              )}
            </motion.div>

            {/* Sparkle Effect */}
            {node.completed && (
              <>
                {[0, 1, 2].map((sparkle) => (
                  <motion.div
                    key={sparkle}
                    className="absolute top-0 left-0 w-2 h-2 bg-yellow-400 rounded-full"
                    animate={{
                      x: [0, Math.cos(sparkle * 120) * 20],
                      y: [0, Math.sin(sparkle * 120) * 20],
                      opacity: [1, 0],
                      scale: [1, 0],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: sparkle * 0.2,
                    }}
                  />
                ))}
              </>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}