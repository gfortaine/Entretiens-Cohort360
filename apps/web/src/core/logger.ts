/**
 * Production-ready structured logger
 * 
 * Features:
 * - Log levels (debug, info, warn, error)
 * - Structured JSON output for production
 * - Console formatting for development
 * - Context enrichment (user, session, request ID)
 * - Performance timing support
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  component?: string;
  action?: string;
  userId?: string | number;
  prescriptionId?: number;
  duration?: number;
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const isProduction = import.meta.env.PROD;
const minLevel: LogLevel = isProduction ? 'info' : 'debug';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[minLevel];
}

function formatError(error: unknown): LogEntry['error'] | undefined {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: isProduction ? undefined : error.stack,
    };
  }
  if (error) {
    return {
      name: 'UnknownError',
      message: String(error),
    };
  }
  return undefined;
}

function createLogEntry(
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: unknown
): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
    error: formatError(error),
  };
}

function output(entry: LogEntry): void {
  if (isProduction) {
    // Production: structured JSON for log aggregation (Datadog, etc.)
    const consoleMethod = entry.level === 'error' ? console.error :
                          entry.level === 'warn' ? console.warn :
                          console.log;
    consoleMethod(JSON.stringify(entry));
  } else {
    // Development: human-readable format
    const colors: Record<LogLevel, string> = {
      debug: '\x1b[36m', // cyan
      info: '\x1b[32m',  // green
      warn: '\x1b[33m',  // yellow
      error: '\x1b[31m', // red
    };
    const reset = '\x1b[0m';
    const prefix = `${colors[entry.level]}[${entry.level.toUpperCase()}]${reset}`;
    
    const contextStr = entry.context 
      ? ` ${JSON.stringify(entry.context)}`
      : '';
    
    const consoleMethod = entry.level === 'error' ? console.error :
                          entry.level === 'warn' ? console.warn :
                          entry.level === 'debug' ? console.debug :
                          console.log;
    
    consoleMethod(`${prefix} ${entry.message}${contextStr}`);
    
    if (entry.error?.stack) {
      console.error(entry.error.stack);
    }
  }
}

/**
 * Main logger instance
 */
export const logger = {
  debug(message: string, context?: LogContext): void {
    if (shouldLog('debug')) {
      output(createLogEntry('debug', message, context));
    }
  },

  info(message: string, context?: LogContext): void {
    if (shouldLog('info')) {
      output(createLogEntry('info', message, context));
    }
  },

  warn(message: string, context?: LogContext): void {
    if (shouldLog('warn')) {
      output(createLogEntry('warn', message, context));
    }
  },

  error(message: string, error?: unknown, context?: LogContext): void {
    if (shouldLog('error')) {
      output(createLogEntry('error', message, context, error));
    }
  },

  /**
   * Performance timing helper
   * @example
   * const end = logger.time('API call');
   * await fetchData();
   * end(); // logs duration
   */
  time(label: string, context?: LogContext): () => void {
    const start = performance.now();
    return () => {
      const duration = Math.round(performance.now() - start);
      this.info(`${label} completed`, { ...context, duration });
    };
  },
};

/**
 * Report error to monitoring service (Sentry, Datadog, etc.)
 * In production, this would send to external service
 */
export function reportError(error: Error, context?: LogContext): void {
  logger.error('Reported error', error, context);
  
  // Production: send to monitoring service
  if (isProduction && typeof window !== 'undefined') {
    // Example: Sentry.captureException(error, { extra: context });
    // Example: datadog.addError(error, context);
  }
}

export default logger;
