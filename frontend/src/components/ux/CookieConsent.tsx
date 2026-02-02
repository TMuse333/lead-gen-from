// src/components/ux/CookieConsent.tsx
/**
 * Cookie Consent Banner Component
 * Displays a minimal consent banner for GDPR/CCPA compliance
 * Uses the bot's color theme and stores consent in localStorage
 */

'use client';

import { useState, useEffect } from 'react';
import { X, Cookie, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CONSENT_KEY = 'chatbot_cookie_consent';
const CONSENT_TIMESTAMP_KEY = 'chatbot_cookie_consent_timestamp';

export type ConsentStatus = 'pending' | 'accepted' | 'declined';

interface CookieConsentProps {
  onConsentChange?: (status: ConsentStatus) => void;
  embedMode?: boolean;
}

export function getCookieConsent(): ConsentStatus {
  if (typeof window === 'undefined') return 'pending';
  const consent = localStorage.getItem(CONSENT_KEY);
  if (consent === 'accepted' || consent === 'declined') {
    return consent;
  }
  return 'pending';
}

export function setCookieConsent(status: 'accepted' | 'declined'): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CONSENT_KEY, status);
  localStorage.setItem(CONSENT_TIMESTAMP_KEY, new Date().toISOString());
}

export default function CookieConsent({ onConsentChange, embedMode = false }: CookieConsentProps) {
  const [visible, setVisible] = useState(false);
  const [consentStatus, setConsentStatus] = useState<ConsentStatus>('pending');

  useEffect(() => {
    const status = getCookieConsent();
    setConsentStatus(status);
    if (status === 'pending') {
      // Delay showing the banner slightly for better UX
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
    // Notify parent of existing consent
    onConsentChange?.(status);
  }, [onConsentChange]);

  const handleAccept = () => {
    setCookieConsent('accepted');
    setConsentStatus('accepted');
    setVisible(false);
    onConsentChange?.('accepted');
  };

  const handleDecline = () => {
    setCookieConsent('declined');
    setConsentStatus('declined');
    setVisible(false);
    onConsentChange?.('declined');
  };

  // Don't render anything if consent already given
  if (consentStatus !== 'pending') {
    return null;
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`fixed ${embedMode ? 'bottom-2 left-2 right-2' : 'bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md'} z-50`}
        >
          <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg shadow-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
              <div className="flex items-center gap-2 text-cyan-400">
                <Cookie className="w-4 h-4" />
                <span className="text-sm font-medium">Cookie Notice</span>
              </div>
              <button
                onClick={handleDecline}
                className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="px-4 py-3">
              <p className="text-sm text-slate-300 leading-relaxed">
                We use cookies to improve your experience and analyze how you interact with our chatbot.
                This helps us provide better service.
              </p>

              <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                <Shield className="w-3 h-3" />
                <span>Your data is processed securely and never sold.</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 px-4 py-3 bg-slate-800/50">
              <button
                onClick={handleDecline}
                className="flex-1 px-3 py-2 text-sm font-medium text-slate-300 bg-slate-700/50 hover:bg-slate-700 rounded-md transition-colors"
              >
                Decline
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 px-3 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded-md transition-colors"
              >
                Accept
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Hook to check if analytics tracking is allowed
 */
export function useTrackingConsent(): boolean {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const consent = getCookieConsent();
    setAllowed(consent === 'accepted');
  }, []);

  return allowed;
}
