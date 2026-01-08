// components/ux/chatWithTracker/modals/ContactCollectionModal.tsx
/**
 * Mandatory contact collection modal for all offers
 * Collects name, email, and phone before generating results
 * User can skip but will see a re-trigger button
 */
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  User,
  Phone,
  Sparkles,
  ArrowRight,
  Shield,
  Loader2,
  CheckCircle2,
  X,
} from 'lucide-react';

export interface ContactData {
  name: string;
  email: string;
  phone: string;
}

interface ContactCollectionModalProps {
  isOpen: boolean;
  onSubmit: (contact: ContactData) => void;
  onSkip?: () => void;
  businessName: string;
  /** Custom title for the modal */
  title?: string;
  /** Custom subtitle */
  subtitle?: string;
  /** Which fields are required (default: name and email required, phone optional) */
  requiredFields?: {
    name?: boolean;
    email?: boolean;
    phone?: boolean;
  };
  /** Pre-fill values if already collected during chat */
  initialValues?: Partial<ContactData>;
  /** Whether the user can skip/close the modal */
  allowSkip?: boolean;
}

export function ContactCollectionModal({
  isOpen,
  onSubmit,
  onSkip,
  businessName,
  title = "One Last Step!",
  subtitle = "Enter your contact info to unlock your personalized results",
  requiredFields = { name: true, email: true, phone: false },
  initialValues = {},
  allowSkip = true,
}: ContactCollectionModalProps) {
  const [formData, setFormData] = useState<ContactData>({
    name: initialValues.name || '',
    email: initialValues.email || '',
    phone: initialValues.phone || '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length >= 10;
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ContactData, string>> = {};

    if (requiredFields.name && !formData.name.trim()) {
      newErrors.name = 'Please enter your name';
    }

    if (requiredFields.email) {
      if (!formData.email.trim()) {
        newErrors.email = 'Please enter your email address';
      } else if (!validateEmail(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (requiredFields.phone && !formData.phone.trim()) {
      newErrors.phone = 'Please enter your phone number';
    } else if (formData.phone.trim() && !validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    onSubmit({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
    });
  };

  const handleChange = (field: keyof ContactData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSkip = () => {
    if (onSkip && allowSkip) {
      onSkip();
    }
  };

  const formatPhoneNumber = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const isFieldValid = (field: keyof ContactData): boolean => {
    const value = formData[field].trim();
    if (!value) return false;
    if (field === 'email') return validateEmail(value);
    if (field === 'phone') return !value || validatePhone(value);
    return true;
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
            onClick={allowSkip ? handleSkip : undefined}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-700 relative">
              {/* Glowing effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 blur-xl -z-10" />

              {/* Close button */}
              {allowSkip && (
                <button
                  onClick={handleSkip}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors z-10"
                  disabled={isSubmitting}
                >
                  <X className="h-5 w-5" />
                </button>
              )}

              {/* Header with glow */}
              <div className="relative bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 border-b border-slate-700 p-6 text-center overflow-hidden">
                {/* Animated glow orbs */}
                <div className="absolute top-0 left-1/4 w-32 h-32 bg-cyan-500/30 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-blue-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                  className="relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full mb-4 shadow-lg shadow-cyan-500/30"
                >
                  <Sparkles className="h-8 w-8 text-white" />
                  {/* Glow ring */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 animate-ping opacity-30" />
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="relative text-2xl font-bold text-white mb-2"
                >
                  {title}
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="relative text-slate-300"
                >
                  {subtitle}
                </motion.p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Name Input */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label htmlFor="contact-name" className="block text-sm font-medium text-slate-300 mb-2">
                    Full Name {requiredFields.name && <span className="text-cyan-400">*</span>}
                  </label>
                  <div className="relative">
                    <User className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${
                      focusedField === 'name' ? 'text-cyan-400' : 'text-slate-400'
                    }`} />
                    <input
                      id="contact-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="John Smith"
                      className={`
                        w-full pl-10 pr-10 py-3
                        bg-slate-800 border rounded-lg
                        text-white placeholder-slate-500
                        focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
                        transition-all duration-200
                        ${errors.name ? 'border-red-500' : 'border-slate-600'}
                        ${focusedField === 'name' ? 'shadow-lg shadow-cyan-500/20' : ''}
                      `}
                      autoFocus
                      disabled={isSubmitting}
                    />
                    {isFieldValid('name') && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      </motion.div>
                    )}
                  </div>
                  {errors.name && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-red-400"
                    >
                      {errors.name}
                    </motion.p>
                  )}
                </motion.div>

                {/* Email Input */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label htmlFor="contact-email" className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address {requiredFields.email && <span className="text-cyan-400">*</span>}
                  </label>
                  <div className="relative">
                    <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${
                      focusedField === 'email' ? 'text-cyan-400' : 'text-slate-400'
                    }`} />
                    <input
                      id="contact-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="you@example.com"
                      className={`
                        w-full pl-10 pr-10 py-3
                        bg-slate-800 border rounded-lg
                        text-white placeholder-slate-500
                        focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
                        transition-all duration-200
                        ${errors.email ? 'border-red-500' : 'border-slate-600'}
                        ${focusedField === 'email' ? 'shadow-lg shadow-cyan-500/20' : ''}
                      `}
                      disabled={isSubmitting}
                    />
                    {isFieldValid('email') && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      </motion.div>
                    )}
                  </div>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-red-400"
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </motion.div>

                {/* Phone Input */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label htmlFor="contact-phone" className="block text-sm font-medium text-slate-300 mb-2">
                    Phone Number {requiredFields.phone ? <span className="text-cyan-400">*</span> : <span className="text-slate-500">(optional)</span>}
                  </label>
                  <div className="relative">
                    <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${
                      focusedField === 'phone' ? 'text-cyan-400' : 'text-slate-400'
                    }`} />
                    <input
                      id="contact-phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', formatPhoneNumber(e.target.value))}
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="(555) 123-4567"
                      className={`
                        w-full pl-10 pr-10 py-3
                        bg-slate-800 border rounded-lg
                        text-white placeholder-slate-500
                        focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
                        transition-all duration-200
                        ${errors.phone ? 'border-red-500' : 'border-slate-600'}
                        ${focusedField === 'phone' ? 'shadow-lg shadow-cyan-500/20' : ''}
                      `}
                      disabled={isSubmitting}
                    />
                    {formData.phone && isFieldValid('phone') && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      </motion.div>
                    )}
                  </div>
                  {errors.phone && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-red-400"
                    >
                      {errors.phone}
                    </motion.p>
                  )}
                </motion.div>

                {/* Benefits */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-2 py-2"
                >
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-sm shadow-cyan-500" />
                    <span>Get your personalized timeline instantly</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-sm shadow-cyan-500" />
                    <span>Expert guidance from {businessName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-sm shadow-cyan-500" />
                    <span>Connect with a local expert who can help</span>
                  </div>
                </motion.div>

                {/* Submit Button with glow */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  className="relative w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-lg shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
                >
                  {/* Button glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 opacity-0 hover:opacity-20 transition-opacity" />

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
                {allowSkip && onSkip && (
                  <motion.button
                    type="button"
                    onClick={handleSkip}
                    disabled={isSubmitting}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="w-full py-2 text-slate-400 hover:text-slate-300 text-sm transition-colors disabled:opacity-50"
                  >
                    I'll do this later
                  </motion.button>
                )}

                {/* Privacy note */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-2"
                >
                  <Shield className="h-3 w-3" />
                  <span>We respect your privacy. No spam, ever.</span>
                </motion.div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Re-trigger button shown after user skips the contact modal
 */
interface ContactRetriggerButtonProps {
  onClick: () => void;
  className?: string;
}

export function ContactRetriggerButton({ onClick, className = '' }: ContactRetriggerButtonProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-3
        bg-gradient-to-r from-cyan-500 to-blue-500
        hover:from-cyan-600 hover:to-blue-600
        text-white font-medium rounded-xl
        shadow-lg shadow-cyan-500/30
        transition-all
        ${className}
      `}
    >
      <Sparkles className="h-4 w-4" />
      <span>Complete to Get Results</span>
      <ArrowRight className="h-4 w-4" />
    </motion.button>
  );
}
