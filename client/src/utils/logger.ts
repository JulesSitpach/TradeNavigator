/**
 * Simple logger for the application
 */
export const logger = {
  info: (message: string, ...args: any[]) => {
    console.log(`[INFO] ${message}`, ...args);
  },
  
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
  
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
  },
  
  debug: (message: string, ...args: any[]) => {
    if (import.meta.env.DEV) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }
};