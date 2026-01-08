'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { getFieldType, getFieldLabel, getFieldDescription } from '@/lib/chat/importantFields';

interface ImportantInfoModalProps {
  isOpen: boolean;
  mappingKey: string;
  question: string;
  onSubmit: (value: string) => void;
  onSkip: () => void;
  onClose: () => void;
}

export default function ImportantInfoModal({
  isOpen,
  mappingKey,
  question,
  onSubmit,
  onSkip,
  onClose,
}: ImportantInfoModalProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);

  const fieldType = getFieldType(mappingKey);
  const fieldLabel = getFieldLabel(mappingKey);
  const fieldDescription = getFieldDescription(mappingKey);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setValue('');
      setError(null);
      setIsValid(false);
    }
  }, [isOpen]);

  // Validate input based on field type
  useEffect(() => {
    if (!value.trim()) {
      setIsValid(false);
      setError(null);
      return;
    }

    let valid = false;
    let errorMsg: string | null = null;

    switch (fieldType) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        valid = emailRegex.test(value.trim());
        errorMsg = valid ? null : 'Please enter a valid email address';
        break;
      
      case 'phone':
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        const digitsOnly = value.replace(/\D/g, '');
        valid = phoneRegex.test(value) && digitsOnly.length >= 10;
        errorMsg = valid ? null : 'Please enter a valid phone number (at least 10 digits)';
        break;
      
      case 'address':
        valid = value.trim().length >= 5;
        errorMsg = valid ? null : 'Please enter a complete address';
        break;
      
      default:
        valid = value.trim().length > 0;
        errorMsg = valid ? null : 'Please enter a value';
    }

    setIsValid(valid);
    setError(errorMsg);
  }, [value, fieldType]);

  const handleSubmit = () => {
    if (isValid && value.trim()) {
      onSubmit(value.trim());
      setValue('');
      setError(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid) {
      handleSubmit();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const getIcon = () => {
    switch (fieldType) {
      case 'email':
        return <Mail className="w-12 h-12" />;
      case 'phone':
        return <Phone className="w-12 h-12" />;
      case 'address':
        return <MapPin className="w-12 h-12" />;
      default:
        return null;
    }
  };

  const getInputType = () => {
    switch (fieldType) {
      case 'email':
        return 'email';
      case 'phone':
        return 'tel';
      default:
        return 'text';
    }
  };

  const getPlaceholder = () => {
    switch (fieldType) {
      case 'email':
        return 'your.email@example.com';
      case 'phone':
        return '(555) 123-4567';
      case 'address':
        return '123 Main St, City, State 12345';
      default:
        return 'Enter your information...';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Hero Banner Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-cyan-500/20 w-full max-w-lg overflow-hidden"
        >
          {/* Hero banner background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10 pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500" />
          
          {/* Close button - smaller, top right */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition-colors z-10"
          >
            <X size={16} />
          </button>

          {/* Hero Content */}
          <div className="p-8 space-y-6 relative z-10">
            {/* Icon and Title */}
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                {getIcon() && (
                  <div className="p-3 bg-cyan-500/20 rounded-2xl text-cyan-400">
                    {getIcon()}
                  </div>
                )}
              </div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-cyan-200 via-blue-200 to-cyan-200 bg-clip-text text-transparent">
                {fieldLabel}
              </h3>
              <p className="text-slate-300 text-base leading-relaxed max-w-md mx-auto">
                {fieldDescription}
              </p>
            </div>

            {/* Input Field */}
            <div>
              <label htmlFor="important-input" className="sr-only">
                {fieldLabel}
              </label>
              <input
                id="important-input"
                type={getInputType()}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={getPlaceholder()}
                autoFocus
                className={`
                  w-full px-6 py-4 bg-slate-900/80 backdrop-blur-sm border-2 rounded-xl
                  text-lg text-cyan-100 placeholder:text-slate-500
                  focus:outline-none focus:ring-2 transition-all
                  ${error 
                    ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500' 
                    : isValid 
                    ? 'border-green-500/50 focus:ring-green-500/50 focus:border-green-500' 
                    : 'border-cyan-500/30 focus:border-cyan-500 focus:ring-cyan-500/50'
                  }
                `}
              />
              
              {/* Validation Feedback */}
              {value && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 flex items-center gap-2"
                >
                  {isValid ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      <p className="text-sm text-green-400">Looks good!</p>
                    </>
                  ) : error ? (
                    <>
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      <p className="text-sm text-red-400">{error}</p>
                    </>
                  ) : null}
                </motion.div>
              )}
            </div>

            {/* CTA Buttons - Flex column layout */}
            <div className="flex flex-col items-center gap-4">
              {/* Big glowing CTA button */}
              <motion.button
                onClick={handleSubmit}
                disabled={!isValid}
                whileHover={isValid ? { scale: 1.02 } : {}}
                whileTap={isValid ? { scale: 0.98 } : {}}
                className="relative w-full px-8 py-5 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
              >
                {/* Glowing effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Generate Your Offer
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </span>
              </motion.button>
              
              {/* Small exit button below */}
              <button
                onClick={onSkip}
                className="px-4 py-1.5 text-slate-400 hover:text-slate-300 text-sm rounded-lg transition-colors hover:bg-slate-700/30"
              >
                Skip for now
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
