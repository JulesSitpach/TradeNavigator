// server/middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';

/**
 * Standard rate limiter for most API endpoints
 * 100 requests per minute
 */
export const standardLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting in test environment
  skip: () => process.env.NODE_ENV === 'test' || process.env.DISABLE_RATE_LIMIT === 'true',
  message: {
    message: 'Too many requests, please try again after a minute'
  }
});

/**
 * Strict rate limiter for auth endpoints
 * 10 requests per 15 minutes
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting in test environment
  skip: () => process.env.NODE_ENV === 'test' || process.env.DISABLE_RATE_LIMIT === 'true',
  message: {
    message: 'Too many login attempts, please try again after 15 minutes'
  }
});

/**
 * Heavy operations limiter
 * 20 requests per minute
 */
export const heavyOperationsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting in test environment
  skip: () => process.env.NODE_ENV === 'test' || process.env.DISABLE_RATE_LIMIT === 'true',
  message: {
    message: 'Too many requests for this resource, please try again after a minute'
  }
});
