// server/utils/logger.ts
// Log levels
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

// Current log level based on NODE_ENV
const getLogLevel = () => {
  const env = process.env.NODE_ENV || 'development';
  const logLevel = process.env.LOG_LEVEL || (env === 'production' ? 'info' : 'debug');
  return LOG_LEVELS[logLevel] || LOG_LEVELS.info;
};

const currentLevel = getLogLevel();

/**
 * Formatted timestamp for logs
 */
function getTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Format log message
 */
function formatMessage(level: string, message: string, meta?: any): string {
  const timestamp = getTimestamp();
  let formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  if (meta) {
    const metaString = typeof meta === 'string' 
      ? meta 
      : JSON.stringify(meta, null, 2);
    formattedMessage += `\n${metaString}`;
  }
  
  return formattedMessage;
}

/**
 * Logger interface
 */
export const logger = {
  /**
   * Log error message
   */
  error(message: string, meta?: any): void {
    if (currentLevel >= LOG_LEVELS.error) {
      console.error(formatMessage('error', message, meta));
    }
  },
  
  /**
   * Log warning message
   */
  warn(message: string, meta?: any): void {
    if (currentLevel >= LOG_LEVELS.warn) {
      console.warn(formatMessage('warn', message, meta));
    }
  },
  
  /**
   * Log info message
   */
  info(message: string, meta?: any): void {
    if (currentLevel >= LOG_LEVELS.info) {
      console.log(formatMessage('info', message, meta));
    }
  },
  
  /**
   * Log debug message
   */
  debug(message: string, meta?: any): void {
    if (currentLevel >= LOG_LEVELS.debug) {
      console.log(formatMessage('debug', message, meta));
    }
  },
  
  /**
   * Log HTTP request
   */
  http(req: any, res: any, duration: number): void {
    if (currentLevel >= LOG_LEVELS.info) {
      const { method, url } = req;
      const { statusCode } = res;
      
      this.info(`${method} ${url} ${statusCode} ${duration}ms`);
    }
  }
};

export default logger;