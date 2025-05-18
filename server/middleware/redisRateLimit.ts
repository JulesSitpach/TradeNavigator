// server/middleware/redisRateLimit.ts
import { Request, Response, NextFunction } from 'express';
import { getRedisClient } from '../utils/redis';
import { logger } from '../utils/logger';
import { config } from '../config';

// Use existing rate limiter if Redis is disabled
import { standardLimiter, authLimiter } from './rateLimit';

/**
 * Create a Redis-based rate limiter middleware
 * @param options Rate limiting options
 */
export function createRedisRateLimiter({
  windowMs = 60000, // 1 minute
  max = 100,        // 100 requests per window
  keyPrefix = 'rl:',
  statusCode = 429,
  message = 'Too many requests, please try again later.',
  keyGenerator = (req: Request) => `${keyPrefix}${req.ip}`
} = {}) {
  const redisClient = getRedisClient();
  
  // If Redis is disabled, fall back to in-memory rate limiter
  if (!redisClient) {
    return standardLimiter;
  }
  
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = keyGenerator(req);
      const windowSizeInSeconds = Math.ceil(windowMs / 1000);
      
      // Get current timestamp
      const now = Math.floor(Date.now() / 1000);
      
      // Remove old requests outside the window
      await redisClient.zremrangebyscore(key, 0, now - windowSizeInSeconds);
      
      // Count requests in current window
      const requestCount = await redisClient.zcard(key);
      
      // Set key expiration to window size
      await redisClient.expire(key, windowSizeInSeconds);
      
      // Set rate limit info in response headers
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - requestCount));
      
      // If under limit, add current request and proceed
      if (requestCount < max) {
        await redisClient.zadd(key, now, `${now}-${Math.random().toString(36).substring(2, 15)}`);
        return next();
      }
      
      // Otherwise return rate limit exceeded
      res.status(statusCode).json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message,
          retryAfter: windowSizeInSeconds
        }
      });
      
    } catch (error) {
      logger.error('Redis rate limiter error:', error);
      // On Redis error, fall back to allowing the request
      next();
    }
  };
}

// Create standard and auth-specific rate limiters
export const redisStandardLimiter = createRedisRateLimiter({
  windowMs: config.getServerConfig().RATE_LIMIT_WINDOW_MS,
  max: config.getServerConfig().RATE_LIMIT_MAX,
  keyPrefix: 'rl:standard:'
});

export const redisAuthLimiter = createRedisRateLimiter({
  windowMs: config.getServerConfig().RATE_LIMIT_WINDOW_MS,
  max: Math.floor(config.getServerConfig().RATE_LIMIT_MAX / 5), // Stricter limit for auth endpoints
  keyPrefix: 'rl:auth:'
});

// Return appropriate rate limiter based on Redis configuration
export const getStandardRateLimiter = () => {
  return config.getServerConfig().USE_REDIS_CACHE ? redisStandardLimiter : standardLimiter;
};

export const getAuthRateLimiter = () => {
  return config.getServerConfig().USE_REDIS_CACHE ? redisAuthLimiter : authLimiter;
};