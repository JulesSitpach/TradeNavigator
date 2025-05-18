// server/middleware/requestLogger.ts
import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

/**
 * Middleware for logging HTTP requests
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  // Skip logging for static assets in production
  if (process.env.NODE_ENV === 'production' && req.path.startsWith('/static')) {
    return next();
  }
  
  const start = Date.now();
  const { method, url, ip } = req;
  
  // Log request start
  logger.debug(`Request started: ${method} ${url}`, { ip });
  
  // Store original end function
  const originalEnd = res.end;
  
  // Override end function
  res.end = function (chunk?: any, encoding?: any, callback?: any): any {
    // Restore original end
    res.end = originalEnd;
    
    // Get response duration
    const duration = Date.now() - start;
    
    // Call original end
    const result = res.end(chunk, encoding, callback);
    
    // Log completed request
    logger.http(req, res, duration);
    
    if (res.statusCode >= 400) {
      const logLevel = res.statusCode >= 500 ? 'error' : 'warn';
      logger[logLevel](`Request failed: ${method} ${url} ${res.statusCode}`, {
        ip,
        duration,
        userAgent: req.get('user-agent')
      });
    }
    
    return result;
  };
  
  next();
}

export default requestLogger;