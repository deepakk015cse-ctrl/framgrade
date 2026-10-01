export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface StructuredLog {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
}

export const logger = {
  info: (message: string, context?: Record<string, unknown>) => {
    log('info', message, context);
  },
  warn: (message: string, context?: Record<string, unknown>) => {
    log('warn', message, context);
  },
  error: (message: string, context?: Record<string, unknown>) => {
    log('error', message, context);
  },
  debug: (message: string, context?: Record<string, unknown>) => {
    if (process.env.NODE_ENV !== 'production') {
      log('debug', message, context);
    }
  },
};

function log(level: LogLevel, message: string, context?: Record<string, unknown>) {
  const payload: StructuredLog = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(context ? { context } : {}),
  };
  const str = `[${payload.timestamp}] [${level.toUpperCase()}] ${message}${
    context ? ' ' + JSON.stringify(context) : ''
  }`;
  if (level === 'error') {
    console.error(str);
  } else if (level === 'warn') {
    console.warn(str);
  } else {
    console.log(str);
  }
}
