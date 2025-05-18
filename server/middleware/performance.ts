/**
 * Performance Monitoring Middleware
 * Tracks API request performance and reports metrics
 */

import { Request, Response, NextFunction } from 'express';
import { metrics } from '../monitoring/metrics';
import { config } from '../config';

/**
 * Record request performance metrics
 */
export function performanceMonitoring() {
  if (!config.getServerConfig().ENABLE_METRICS) {
    // Skip middleware if metrics are disabled
    return (req: Request, res: Response, next: NextFunction) => next();
  }
  
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip metrics endpoint
    if (req.path === '/metrics') {
      return next();
    }
    
    // Record start time
    const start = process.hrtime();
    
    // Track request size
    const requestSize = req.headers['content-length'] 
      ? parseInt(req.headers['content-length'], 10) 
      : 0;
    
    // Track original response methods
    const originalWrite = res.write;
    const originalEnd = res.end;
    let responseSize = 0;
    
    // Override response write to track response size
    res.write = function(chunk, ...args) {
      if (chunk) {
        if (typeof chunk === 'string') {
          responseSize += Buffer.byteLength(chunk);
        } else {
          responseSize += chunk.length;
        }
      }
      return originalWrite.apply(res, [chunk, ...args]);
    };
    
    // Override response end to track response size and record metrics
    res.end = function(chunk, ...args) {
      // Calculate final response size if chunk is provided
      if (chunk) {
        if (typeof chunk === 'string') {
          responseSize += Buffer.byteLength(chunk);
        } else if (Buffer.isBuffer(chunk)) {
          responseSize += chunk.length;
        }
      }
      
      // Calculate duration
      const [seconds, nanoseconds] = process.hrtime(start);
      const duration = seconds + nanoseconds / 1e9;
      
      // Record metrics
      metrics.observeHttpRequest(
        req.method,
        req.path,
        res.statusCode,
        duration,
        requestSize,
        responseSize
      );
      
      // Restore original end method
      return originalEnd.apply(res, [chunk, ...args]);
    };
    
    next();
  };
}

/**
 * Update application-level metrics (memory, CPU, connections)
 * To be called periodically
 */
export function updateApplicationMetrics(activeConnections: number = 0) {
  if (!config.getServerConfig().ENABLE_METRICS) {
    return;
  }
  
  metrics.updateApplicationMetrics();
  metrics.updateActiveConnections(activeConnections);
}

/**
 * Track cache operations (hits/misses)
 */
export function trackCacheOperation(cacheName: string, hit: boolean) {
  if (!config.getServerConfig().ENABLE_METRICS) {
    return;
  }
  
  metrics.recordCacheOperation(cacheName, hit);
}

/**
 * Track database query performance
 */
export function trackDbQuery(type: string, table: string, duration: number, status: 'success' | 'error' = 'success') {
  if (!config.getServerConfig().ENABLE_METRICS) {
    return;
  }
  
  metrics.observeDbQuery(type, table, duration, status);
}

/**
 * Track external API request performance
 */
export function trackExternalApiRequest(api: string, endpoint: string, duration: number, status: string) {
  if (!config.getServerConfig().ENABLE_METRICS) {
    return;
  }
  
  metrics.observeExternalApiRequest(api, endpoint, duration, status);
}

/**
 * Set up a metrics endpoint for Prometheus scraping
 */
export function setupMetricsEndpoint(app: any) {
  if (!config.getServerConfig().ENABLE_METRICS) {
    return;
  }
  
  app.get('/metrics', async (req: Request, res: Response) => {
    res.set('Content-Type', metrics.getRegistry().contentType);
    res.end(await metrics.getMetrics());
  });
}
