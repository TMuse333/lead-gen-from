import { motion } from 'framer-motion';

export default function NextSteps({ actions }: { actions: string[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 rounded-lg shadow-lg p-6 mb-6 border-l-4 border-green-500"
    >
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Your Next Steps</h3>
      <div className="space-y-3">
        {actions.map((action, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="flex-shrink-0 w-7 h-7 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
              {i + 1}
            </div>
            <p className="text-gray-700 dark:text-gray-200 flex-1">{action}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}