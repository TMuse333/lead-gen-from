// components/debug/UserProfilePanel.tsx
'use client';

import { useEffect, useState } from 'react';
import { useUserProfile } from '@/stores/profileStore/userProfile.store';
import { motion } from 'framer-motion';
import { X, User, Target, Clock, Home, DollarSign, MapPin, Sparkles, Loader2 } from 'lucide-react';

export function UserProfilePanel() {
  const [isHydrated, setIsHydrated] = useState(false);
  const { userProfile, userInput } = useUserProfile();

  // This runs once when Zustand finishes loading from localStorage
  useEffect(() => {
    const unsub = useUserProfile.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });

    // In case it already hydrated (SSR or fast load)
    if (useUserProfile.persist.hasHydrated()) {
      setIsHydrated(true);
    }

    return unsub;
  }, []);

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
    if (Array.isArray(value)) return value.length ? value.join(', ') : '—';
    if (typeof value === 'object') {
      if ('min' in value || 'max' in value) {
        const min = value.min?.toLocaleString();
        const max = value.max?.toLocaleString();
        return max ? `$${min}–$${max}` : `Up to $${max || min}`;
      }
      return JSON.stringify(value);
    }
    if (key === 'budget' && typeof value === 'number') {
      return `$${value.toLocaleString()}`;
    }
    return String(value);
  };

  // Always render the panel — even when loading or empty
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
            <span className="text-white font-semibold text-sm">AI Memory</span>
          </div>
          {!isHydrated && (
            <Loader2 className="w-4 h-4 text-white animate-spin" />
          )}
        </div>

        {/* Loading State */}
        {!isHydrated ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 mx-auto text-violet-600 animate-spin" />
            <p className="text-sm text-gray-500 mt-3">Loading your profile...</p>
          </div>
        ) : (
          <>
            {/* Content */}
            <div className="p-5 space-y-3 max-h-96 overflow-y-auto">
              {userProfile && Object.keys(userProfile).length > 1 ? (
                Object.entries(userProfile).map(([key, value]) => {
                  if (key === 'intent') {
                    let flowName: string;
                    if (typeof value === 'string' && value.length > 0) {
                      flowName = value.charAt(0).toUpperCase() + value.slice(1);
                    } else {
                      flowName = String(value);
                    }
                    return (
                      <div key={key} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Target className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Journey</p>
                            <p className="font-semibold text-indigo-600">{flowName}er</p>
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
                      className="flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
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
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Start chatting — I'll remember everything</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-5 py-3 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                {Object.keys(userInput).length} answers collected • Persistent memory
              </p>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}