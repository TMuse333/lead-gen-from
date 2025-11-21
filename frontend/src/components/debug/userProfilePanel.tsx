// components/debug/UserProfilePanel.tsx
import { useUserProfile } from '@/stores/profileStore/userProfile.store';
import { motion } from 'framer-motion';
import { X, User, Target, Clock, Home, DollarSign, MapPin, Sparkles } from 'lucide-react';

export function UserProfilePanel() {
  const { userProfile, userInput } = useUserProfile();

  if (!userProfile || Object.keys(userProfile).length <= 1) {
    return null; // Don't show if empty (only intent exists)
  }

  const fieldIcons: Record<string, React.ReactNode> = {
    intent: <Target className="w-4 h-4" />,
    budget: <DollarSign className="w-4 h-4" />,
    timeline: <Clock className="w-4 h-4" />,
    bedrooms: <Home className="w-4 h-4" />,
    locations: <MapPin className="w-4 h-4" />,
    firstTimeBuyer: <Sparkles className="w-4 h-4" />,
    email: <User className="w-4 h-4" />,
  };

  const formatValue = (key: string, value: any): string => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return value.join(', ') || '—';
    if (typeof value === 'object') {
      if ('min' in value && 'max' in value) {
        return value.max ? `$${value.min.toLocaleString()}–$${value.max.toLocaleString()}` : `Up to $${value.max?.toLocaleString() || value.min.toLocaleString()}`;
      }
      return JSON.stringify(value);
    }
    if (key === 'budget' && typeof value === 'number') {
      return `$${value.toLocaleString()}`;
    }
    return String(value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="fixed top-4 right-4 z-50 w-80"
    >
      <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-white" />
            <span className="text-white font-semibold text-sm">AI Knows About You</span>
          </div>
          <button
            onClick={() => {}}
            className="text-white/70 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3 max-h-96 overflow-y-auto">
          {Object.entries(userProfile).map(([key, value]) => {
            if (key === 'intent' && value === userProfile.intent) {
              // Skip intent if it's just the flow name (not useful to show)
              const flowName = value.charAt(0).toUpperCase() + value.slice(1);
              return (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      {fieldIcons[key] || <User className="w-4 h-4 text-white" />}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Intent</p>
                      <p className="font-semibold text-indigo-600">{flowName}er Journey</p>
                    </div>
                  </div>
                </div>
              );
            }

            if (value === undefined || value === null || (Array.isArray(value) && value.length === 0)) {
              return null;
            }

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 }}
                className="flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center opacity-80">
                    {fieldIcons[key] || <Sparkles className="w-4 h-4 text-white" />}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p className="font-semibold text-gray-800">
                      {formatValue(key, value)}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-green-600 font-medium opacity-0 group-hover:opacity-100 transition">
                  Updated
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-5 py-3 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            {Object.keys(userInput).length} answers collected • Live AI memory
          </p>
        </div>
      </div>
    </motion.div>
  );
}