/**
 * Development-only logger utility
 * All logs are stripped in production builds
 */

const isDev = process.env.NODE_ENV === 'development';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerOptions {
  prefix?: string;
  emoji?: string;
}

function createLogFn(level: LogLevel, options: LoggerOptions = {}) {
  return (...args: unknown[]) => {
    if (!isDev) return;

    const prefix = options.emoji
      ? `${options.emoji} ${options.prefix || ''}`
      : options.prefix || '';

    const consoleFn = level === 'debug' ? console.log : console[level];

    if (prefix) {
      consoleFn(`[${prefix}]`, ...args);
    } else {
      consoleFn(...args);
    }
  };
}

/**
 * Main logger - only outputs in development
 */
export const logger = {
  debug: createLogFn('debug'),
  info: createLogFn('info'),
  warn: createLogFn('warn'),
  error: createLogFn('error'),

  /**
   * Create a namespaced logger with a prefix
   * @example const log = logger.create('ChatBot', '🤖');
   */
  create: (prefix: string, emoji?: string) => ({
    debug: createLogFn('debug', { prefix, emoji }),
    info: createLogFn('info', { prefix, emoji }),
    warn: createLogFn('warn', { prefix, emoji }),
    error: createLogFn('error', { prefix, emoji }),
  }),
};

/**
 * For truly critical errors that should always be logged (even in production)
 * Use sparingly - only for errors that need monitoring
 */
export const criticalError = (context: string, error: unknown) => {
  console.error(`[CRITICAL: ${context}]`, error);
};

export default logger;
