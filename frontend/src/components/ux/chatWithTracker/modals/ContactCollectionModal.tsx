// components/ux/chatWithTracker/modals/ContactCollectionModal.tsx
/**
 * Mandatory contact collection modal for all offers
 * Collects name, email, and phone before generating results
 * User can skip but will see a re-trigger button
 *
 * Uses CSS variables for theming (injected by colorUtils.ts):
 * --color-primary, --color-secondary, --color-background, --color-surface,
 * --color-text, --color-text-secondary, --color-border, --color-gradient-from, --color-gradient-to
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
  MessageCircle,
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
  title = "Great news!",
  subtitle = "I have everything I need to create your personalized phase-by-phase analysis. Just need your contact info to send it over!",
  requiredFields = { name: true, email: true, phone: true },
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
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={allowSkip ? handleSkip : undefined}
          />

          {/* Modal - Compact version for iframe embedding */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300,
              duration: 0.5,
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
          >
            <div
              className="rounded-xl shadow-2xl max-w-md w-full overflow-hidden relative max-h-[95vh] overflow-y-auto"
              style={{
                backgroundColor: 'var(--color-surface, #1e293b)',
                borderColor: 'var(--color-border, #334155)',
                borderWidth: '1px',
                borderStyle: 'solid',
              }}
            >
              {/* Glowing effect using theme colors */}
              <div
                className="absolute inset-0 rounded-xl blur-xl -z-10 opacity-20"
                style={{
                  background: `linear-gradient(to right, var(--color-gradient-from, #06b6d4), var(--color-gradient-to, #3b82f6))`,
                }}
              />

              {/* Close button */}
              {allowSkip && (
                <button
                  onClick={handleSkip}
                  className="absolute top-3 right-3 p-1.5 rounded-lg transition-colors z-10 hover:opacity-80"
                  style={{
                    color: 'var(--color-text-secondary, #94a3b8)',
                    backgroundColor: 'var(--color-surface, #1e293b)',
                  }}
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {/* Compact Header */}
              <div
                className="relative p-4 overflow-hidden"
                style={{
                  background: `linear-gradient(to right, color-mix(in srgb, var(--color-gradient-from, #06b6d4) 10%, transparent), color-mix(in srgb, var(--color-gradient-to, #3b82f6) 10%, transparent))`,
                  borderBottom: '1px solid var(--color-border, #334155)',
                }}
              >
                {/* Bot avatar and message - compact */}
                <div className="relative flex items-start gap-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                    style={{
                      background: `linear-gradient(to bottom right, var(--color-gradient-from, #06b6d4), var(--color-gradient-to, #3b82f6))`,
                    }}
                  >
                    <MessageCircle className="h-5 w-5 text-white" />
                  </motion.div>

                  <div className="flex-1 pr-6">
                    <h2
                      className="text-lg font-semibold mb-0.5"
                      style={{ color: 'var(--color-text, #f0f9ff)' }}
                    >
                      {title}
                    </h2>
                    <p
                      className="text-sm leading-snug"
                      style={{ color: 'var(--color-text-secondary, #94a3b8)' }}
                    >
                      {subtitle}
                    </p>
                  </div>
                </div>
              </div>

              {/* Form - Compact version */}
              <form onSubmit={handleSubmit} className="p-4 space-y-3">
                {/* Name Input */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label
                    htmlFor="contact-name"
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: 'var(--color-text-secondary, #94a3b8)' }}
                  >
                    Full Name {requiredFields.name && <span style={{ color: 'var(--color-primary, #06b6d4)' }}>*</span>}
                  </label>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors"
                      style={{ color: focusedField === 'name' ? 'var(--color-primary, #06b6d4)' : 'var(--color-text-secondary, #94a3b8)' }}
                    />
                    <input
                      id="contact-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="John Smith"
                      className="w-full pl-9 pr-9 py-2.5 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: 'var(--color-background, #0f172a)',
                        borderColor: errors.name ? 'var(--color-error, #ef4444)' : 'var(--color-border, #334155)',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        color: 'var(--color-text, #f0f9ff)',
                        '--tw-ring-color': 'var(--color-primary, #06b6d4)',
                      } as React.CSSProperties}
                      autoFocus
                      disabled={isSubmitting}
                    />
                    {isFieldValid('name') && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-3 top-1/2 -translate-y-1/2">
                        <CheckCircle2 className="h-4 w-4" style={{ color: 'var(--color-success, #10b981)' }} />
                      </motion.div>
                    )}
                  </div>
                  {errors.name && (
                    <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-1 text-xs" style={{ color: 'var(--color-error, #ef4444)' }}>
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
                  <label
                    htmlFor="contact-email"
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: 'var(--color-text-secondary, #94a3b8)' }}
                  >
                    Email Address {requiredFields.email && <span style={{ color: 'var(--color-primary, #06b6d4)' }}>*</span>}
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors"
                      style={{ color: focusedField === 'email' ? 'var(--color-primary, #06b6d4)' : 'var(--color-text-secondary, #94a3b8)' }}
                    />
                    <input
                      id="contact-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="you@example.com"
                      className="w-full pl-9 pr-9 py-2.5 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: 'var(--color-background, #0f172a)',
                        borderColor: errors.email ? 'var(--color-error, #ef4444)' : 'var(--color-border, #334155)',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        color: 'var(--color-text, #f0f9ff)',
                        '--tw-ring-color': 'var(--color-primary, #06b6d4)',
                      } as React.CSSProperties}
                      disabled={isSubmitting}
                    />
                    {isFieldValid('email') && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-3 top-1/2 -translate-y-1/2">
                        <CheckCircle2 className="h-4 w-4" style={{ color: 'var(--color-success, #10b981)' }} />
                      </motion.div>
                    )}
                  </div>
                  {errors.email && (
                    <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-1 text-xs" style={{ color: 'var(--color-error, #ef4444)' }}>
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
                  <label
                    htmlFor="contact-phone"
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: 'var(--color-text-secondary, #94a3b8)' }}
                  >
                    Phone Number {requiredFields.phone ? <span style={{ color: 'var(--color-primary, #06b6d4)' }}>*</span> : <span style={{ color: 'var(--color-text-secondary, #94a3b8)', opacity: 0.7 }}>(optional)</span>}
                  </label>
                  <div className="relative">
                    <Phone
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors"
                      style={{ color: focusedField === 'phone' ? 'var(--color-primary, #06b6d4)' : 'var(--color-text-secondary, #94a3b8)' }}
                    />
                    <input
                      id="contact-phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', formatPhoneNumber(e.target.value))}
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="(555) 123-4567"
                      className="w-full pl-9 pr-9 py-2.5 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: 'var(--color-background, #0f172a)',
                        borderColor: errors.phone ? 'var(--color-error, #ef4444)' : 'var(--color-border, #334155)',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        color: 'var(--color-text, #f0f9ff)',
                        '--tw-ring-color': 'var(--color-primary, #06b6d4)',
                      } as React.CSSProperties}
                      disabled={isSubmitting}
                    />
                    {formData.phone && isFieldValid('phone') && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-3 top-1/2 -translate-y-1/2">
                        <CheckCircle2 className="h-4 w-4" style={{ color: 'var(--color-success, #10b981)' }} />
                      </motion.div>
                    )}
                  </div>
                  {errors.phone && (
                    <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-1 text-xs" style={{ color: 'var(--color-error, #ef4444)' }}>
                      {errors.phone}
                    </motion.p>
                  )}
                </motion.div>

                {/* Submit Button with theme colors */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  className="relative w-full px-4 py-3 text-white font-semibold rounded-lg shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden mt-4"
                  style={{
                    background: `linear-gradient(to right, var(--color-gradient-from, #06b6d4), var(--color-gradient-to, #3b82f6))`,
                  }}
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
                {allowSkip && onSkip && (
                  <motion.button
                    type="button"
                    onClick={handleSkip}
                    disabled={isSubmitting}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="w-full py-1.5 text-sm transition-colors disabled:opacity-50 hover:opacity-80"
                    style={{ color: 'var(--color-text-secondary, #94a3b8)' }}
                  >
                    I'll do this later
                  </motion.button>
                )}

                {/* Privacy note */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="flex items-center justify-center gap-1.5 text-xs pt-1"
                  style={{ color: 'var(--color-text-secondary, #94a3b8)', opacity: 0.7 }}
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
      className={`flex items-center gap-2 px-4 py-3 text-white font-medium rounded-xl shadow-lg transition-all ${className}`}
      style={{
        background: `linear-gradient(to right, var(--color-gradient-from, #06b6d4), var(--color-gradient-to, #3b82f6))`,
      }}
    >
      <Sparkles className="h-4 w-4" />
      <span>Complete to Get Results</span>
      <ArrowRight className="h-4 w-4" />
    </motion.button>
  );
}
