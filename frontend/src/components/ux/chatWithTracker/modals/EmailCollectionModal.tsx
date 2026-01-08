// components/ux/chatWithTracker/modals/EmailCollectionModal.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Sparkles, ArrowRight, Shield, Loader2 } from 'lucide-react';

interface EmailCollectionModalProps {
  isOpen: boolean;
  onSubmit: (email: string) => void;
  onSkip?: () => void;
  businessName: string;
  /** If true, email is required and skip is not allowed */
  required?: boolean;
}

export function EmailCollectionModal({
  isOpen,
  onSubmit,
  onSkip,
  businessName,
  required = true,
}: EmailCollectionModalProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    onSubmit(email.trim());
  };

  const handleSkip = () => {
    if (onSkip && !required) {
      onSkip();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-700">
              {/* Header */}
              <div className="relative bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-b border-slate-700 p-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full mb-4"
                >
                  <Sparkles className="h-8 w-8 text-white" />
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold text-white mb-2"
                >
                  Almost There!
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-slate-300"
                >
                  Enter your email to receive your personalized results
                </motion.p>
              </div>

              {/* Content */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError(null);
                      }}
                      placeholder="you@example.com"
                      className={`
                        w-full pl-10 pr-4 py-3
                        bg-slate-800 border rounded-lg
                        text-white placeholder-slate-500
                        focus:outline-none focus:ring-2 focus:ring-cyan-500
                        transition-colors
                        ${error ? 'border-red-500' : 'border-slate-600'}
                      `}
                      autoFocus
                      disabled={isSubmitting}
                    />
                  </div>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-red-400"
                    >
                      {error}
                    </motion.p>
                  )}
                </div>

                {/* Benefits */}
                <div className="space-y-2 py-2">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    <span>Personalized timeline delivered to your inbox</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    <span>Expert tips from {businessName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    <span>Save your progress for future reference</span>
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Get My Results
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </motion.button>

                {/* Skip option */}
                {!required && onSkip && (
                  <button
                    type="button"
                    onClick={handleSkip}
                    disabled={isSubmitting}
                    className="w-full py-2 text-slate-400 hover:text-slate-300 text-sm transition-colors disabled:opacity-50"
                  >
                    Skip for now
                  </button>
                )}

                {/* Privacy note */}
                <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-2">
                  <Shield className="h-3 w-3" />
                  <span>We respect your privacy. No spam, ever.</span>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
