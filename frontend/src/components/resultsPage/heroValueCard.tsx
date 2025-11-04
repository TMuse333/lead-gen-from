import { motion } from 'framer-motion';
import { Home } from 'lucide-react';

interface ValueEstimation {
  low: number;
  high: number;
  confidence: number;
  reasoning: string;
}

export default function HeroValueCard({ value }: { value: ValueEstimation }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl shadow-xl p-8 mb-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <Home size={32} />
        <h2 className="text-2xl font-bold">Estimated Property Value</h2>
      </div>
      <div className="text-center my-6">
        <div className="text-5xl font-bold mb-2">
          ${value.low.toLocaleString()} - ${value.high.toLocaleString()}
        </div>
        <div className="text-blue-100 text-lg">
          {Math.round(value.confidence * 100)}% Confidence
        </div>
      </div>
      <div className="bg-white/10 backdrop-blur rounded-lg p-4">
        <p className="text-blue-50">{value.reasoning}</p>
      </div>
    </motion.div>
  );
}