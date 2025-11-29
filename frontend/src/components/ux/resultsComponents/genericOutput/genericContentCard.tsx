'use client';

import { motion } from 'framer-motion';
import { MessageSquare, CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * Generic content card component
 * Displays any LLM output as a flexible card with title and content
 */
interface GenericContentCardProps {
  title?: string;
  content: string | React.ReactNode;
  type?: 'info' | 'success' | 'warning' | 'default';
  icon?: React.ReactNode;
  className?: string;
}

export function GenericContentCard({
  title,
  content,
  type = 'default',
  icon,
  className = '',
}: GenericContentCardProps) {
  const typeStyles = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      iconBg: 'bg-blue-500',
      icon: <MessageSquare className="h-5 w-5 text-white" />,
      titleColor: 'text-blue-900',
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      iconBg: 'bg-green-500',
      icon: <CheckCircle2 className="h-5 w-5 text-white" />,
      titleColor: 'text-green-900',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      iconBg: 'bg-yellow-500',
      icon: <AlertCircle className="h-5 w-5 text-white" />,
      titleColor: 'text-yellow-900',
    },
    default: {
      bg: 'bg-white',
      border: 'border-gray-200',
      iconBg: 'bg-gray-500',
      icon: <MessageSquare className="h-5 w-5 text-white" />,
      titleColor: 'text-gray-900',
    },
  };

  const styles = typeStyles[type];
  const displayIcon = icon || styles.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`${styles.bg} ${styles.border} border-2 rounded-xl p-6 shadow-md ${className}`}
    >
      {(title || displayIcon) && (
        <div className="flex items-center gap-3 mb-4">
          {displayIcon && (
            <div className={`${styles.iconBg} p-2 rounded-lg`}>
              {displayIcon}
            </div>
          )}
          {title && (
            <h3 className={`text-lg font-bold ${styles.titleColor}`}>
              {title}
            </h3>
          )}
        </div>
      )}
      
      <div className="text-gray-700">
        {typeof content === 'string' ? (
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
          </div>
        ) : (
          content
        )}
      </div>
    </motion.div>
  );
}

