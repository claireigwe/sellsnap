type LogLevel = 'info' | 'warn' | 'error';

type LogPayload = Record<string, unknown>;

/**
 * Structured logger.
 * Outputs JSON in production for queryability.
 * Outputs human-readable logs in development.
 *
 * Never log: passwords, session tokens, full card numbers,
 * CVVs, Flutterwave secret keys, webhook secrets.
 */
function log(level: LogLevel, message: string, payload?: LogPayload) {
  const timestamp = new Date().toISOString();

  const entry = {
    timestamp,
    level,
    message,
    ...payload,
  };

  if (process.env.NODE_ENV === 'production') {
    // Structured JSON for production log aggregators
    if (level === 'error') {
      console.error(JSON.stringify(entry));
    } else if (level === 'warn') {
      console.warn(JSON.stringify(entry));
    } else {
      console.log(JSON.stringify(entry));
    }
  } else {
    // Human-readable for development
    const prefix = `[${timestamp}] ${level.toUpperCase()}`;
    if (level === 'error') {
      console.error(prefix, message, payload ?? '');
    } else if (level === 'warn') {
      console.warn(prefix, message, payload ?? '');
    } else {
      console.log(prefix, message, payload ?? '');
    }
  }
}

export const logger = {
  info: (message: string, payload?: LogPayload) => log('info', message, payload),
  warn: (message: string, payload?: LogPayload) => log('warn', message, payload),
  error: (message: string, payload?: LogPayload) => log('error', message, payload),
};
