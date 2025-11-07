import { motion } from 'framer-motion';
import { Phone, Mail } from 'lucide-react';

export default function AgentCTA({ agentInfo }: { agentInfo: { name: string; phone: string; email: string } }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center"
    >
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Ready to Move Forward?</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Let’s create your custom selling strategy.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <a
          href={`tel:${agentInfo.phone}`}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          <Phone size={20} /> Call {agentInfo.phone}
        </a>
        <a
          href={`mailto:${agentInfo.email}`}
          className="inline-flex items-center justify-center gap-2 bg-white dark:bg-gray-700 text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition font-semibold border-2 border-blue-600"
        >
          <Mail size={20} /> Email Me
        </a>
      </div>
      <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
        Full report sent to your email.
      </p>
    </motion.div>
  );
}