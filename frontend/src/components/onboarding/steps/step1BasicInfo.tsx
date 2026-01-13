"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { User, Mail, Phone, Building2, ArrowRight, Info } from "lucide-react";
import { useOnboardingStore } from "@/stores/onboardingStore/onboarding.store";
import { sanitizeBusinessName } from "@/lib/utils/sanitizeBusinessName";

export default function Step1BasicInfo() {
  const { data: session } = useSession();
  const {
    agentFirstName,
    agentLastName,
    agentEmail,
    agentPhone,
    businessName,
    setAgentFirstName,
    setAgentLastName,
    setAgentEmail,
    setAgentPhone,
    setBusinessName,
    setCurrentStep,
    markStepComplete,
  } = useOnboardingStore();

  // Local display state for business name (user-friendly version)
  const [businessDisplayName, setBusinessDisplayName] = useState('');

  // Pre-fill email from session on mount
  useEffect(() => {
    if (session?.user?.email && !agentEmail) {
      setAgentEmail(session.user.email);
    }
  }, [session?.user?.email, agentEmail, setAgentEmail]);

  // Sync display name with store on mount (if resuming)
  useEffect(() => {
    if (businessName && !businessDisplayName) {
      // If we're resuming, the store has the sanitized name
      // Try to make it readable again
      const readable = businessName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      setBusinessDisplayName(readable);
    }
  }, [businessName, businessDisplayName]);

  // Calculate sanitized name from display name
  const sanitizedBusinessName = businessDisplayName ? sanitizeBusinessName(businessDisplayName) : '';

  const handleBusinessNameChange = (value: string) => {
    setBusinessDisplayName(value);
    const sanitized = sanitizeBusinessName(value);
    setBusinessName(sanitized);
  };

  // Validation
  const isFirstNameValid = agentFirstName.trim().length > 0;
  const isEmailValid = agentEmail.trim().length > 0 && agentEmail.includes('@');
  const isBusinessNameValid = sanitizedBusinessName.length > 0;
  const canProceed = isFirstNameValid && isEmailValid && isBusinessNameValid;

  const handleNext = () => {
    if (canProceed) {
      markStepComplete(1);
      setCurrentStep(2); // Go directly to Complete step (no wizard)
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300 bg-clip-text text-transparent mb-2">
          Let's Get Started
        </h2>
        <p className="text-cyan-200/70">
          Tell us a bit about yourself so your bot can represent you
        </p>
      </div>

      {/* Name Fields Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* First Name */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-cyan-200 mb-2">
            First Name <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-cyan-400/50" />
            <input
              id="firstName"
              type="text"
              value={agentFirstName}
              onChange={(e) => setAgentFirstName(e.target.value)}
              placeholder="John"
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/5 border border-cyan-500/30 text-white placeholder-cyan-200/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
            />
          </div>
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-cyan-200 mb-2">
            Last Name <span className="text-cyan-200/50">(optional)</span>
          </label>
          <input
            id="lastName"
            type="text"
            value={agentLastName}
            onChange={(e) => setAgentLastName(e.target.value)}
            placeholder="Smith"
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-cyan-500/30 text-white placeholder-cyan-200/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-cyan-200 mb-2">
          Email <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-cyan-400/50" />
          <input
            id="email"
            type="email"
            value={agentEmail}
            onChange={(e) => setAgentEmail(e.target.value)}
            placeholder="john@example.com"
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/5 border border-cyan-500/30 text-white placeholder-cyan-200/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
          />
        </div>
        <p className="text-xs text-cyan-200/50 mt-1.5">
          We'll send you lead notifications at this email
        </p>
      </div>

      {/* Business Name */}
      <div>
        <label htmlFor="businessName" className="block text-sm font-medium text-cyan-200 mb-2">
          Business Name <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-cyan-400/50" />
          <input
            id="businessName"
            type="text"
            value={businessDisplayName}
            onChange={(e) => handleBusinessNameChange(e.target.value)}
            placeholder="John Smith Real Estate"
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/5 border border-cyan-500/30 text-white placeholder-cyan-200/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
          />
        </div>
        {businessDisplayName && sanitizedBusinessName && (
          <div className="mt-2 flex items-start gap-2 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <Info className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-cyan-200/80">
                Bot URL: <span className="font-mono font-semibold text-cyan-300">{sanitizedBusinessName}</span>
              </p>
              <p className="text-xs text-cyan-200/60 mt-1">
                This URL-friendly format is used for your chatbot link
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-cyan-200 mb-2">
          Phone <span className="text-cyan-200/50">(optional)</span>
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-cyan-400/50" />
          <input
            id="phone"
            type="tel"
            value={agentPhone}
            onChange={(e) => setAgentPhone(e.target.value)}
            placeholder="(555) 123-4567"
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/5 border border-cyan-500/30 text-white placeholder-cyan-200/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
          />
        </div>
        <p className="text-xs text-cyan-200/50 mt-1.5">
          Displayed on your timeline results page for leads to contact you
        </p>
      </div>

      {/* Next Button */}
      <div className="flex justify-end pt-6 border-t border-cyan-500/20">
        <motion.button
          onClick={handleNext}
          disabled={!canProceed}
          whileHover={canProceed ? { scale: 1.02 } : {}}
          whileTap={canProceed ? { scale: 0.98 } : {}}
          className={`
            flex items-center gap-2 px-8 py-3 rounded-full font-semibold transition-all
            ${canProceed
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg hover:shadow-cyan-400/50'
              : 'bg-slate-700 text-slate-400 cursor-not-allowed'
            }
          `}
        >
          Continue
          <ArrowRight className="h-5 w-5" />
        </motion.button>
      </div>
    </motion.div>
  );
}
