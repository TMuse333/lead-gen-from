import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

export default function MarketStatsGrid({ summary }: { summary: string }) {
  const stats = [
    { label: 'Avg Sale', value: '$492K', trend: 'up' },
    { label: 'Median', value: '$475K' },
    { label: 'Days on Market', value: '15' },
    { label: 'Trend', value: '+3.2%', trend: 'up' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <TrendingUp className="text-blue-600" size={28} />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Market Snapshot</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-blue-50 dark:bg-gray-700 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stat.value}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">{stat.label}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-gray-600 dark:text-gray-300 text-sm">{summary}</p>
    </motion.div>
  );
}