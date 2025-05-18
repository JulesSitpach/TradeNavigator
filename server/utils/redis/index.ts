// server/utils/redis/index.ts
import Redis from 'ioredis';
import { logger } from '../logger';
import { config } from '../../config';

// Use existing Redis configuration from config
const redisUrl = config.getServerConfig().REDIS_URL;
const useRedisCache = config.getServerConfig().USE_REDIS_CACHE;

// Redis client singleton (or null if Redis is disabled)
let redisClient: Redis | null = null;

/**
 * Initialize Redis client if enabled
 */
export function initRedisClient(): Redis | null {
  // Only initialize if Redis is enabled
  if (!useRedisCache) {
    logger.info('Redis cache is disabled. Using in-memory cache.');
    return null;
  }
  
  try {
    // Create Redis client from URL
    const client = new Redis(redisUrl || 'redis://localhost:6379', {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      // Optional: Enable auto-reconnect
      autoReconnect: true,
      // Optional: Enable offline queue to store commands when disconnected
      enableOfflineQueue: true,
      // Optional: Set connection timeout
      connectTimeout: 10000,
    });
    
    // Set up event listeners
    client.on('connect', () => {
      logger.info('Redis client connected');
    });
    
    client.on('error', (err) => {
      logger.error('Redis client error', err);
    });
    
    client.on('ready', () => {
      logger.info('Redis client ready');
    });
    
    client.on('reconnecting', () => {
      logger.warn('Redis client reconnecting');
    });
    
    redisClient = client;
    return client;
  } catch (error) {
    logger.error('Failed to initialize Redis client:', error);
    return null;
  }
}

/**
 * Get the Redis client instance
 */
export function getRedisClient(): Redis | null {
  if (!redisClient && useRedisCache) {
    return initRedisClient();
  }
  return redisClient;
}

/**
 * Health check method for Redis
 */
export const isRedisHealthy = async (): Promise<boolean> => {
  // If Redis is disabled, consider it "healthy"
  if (!useRedisCache) {
    return true;
  }
  
  const client = getRedisClient();
  if (!client) {
    return false;
  }
  
  try {
    const result = await client.ping();
    return result === 'PONG';
  } catch (error) {
    logger.error('Redis health check failed', error);
    return false;
  }
};

/**
 * Graceful shutdown for Redis connection
 */
export const closeRedisConnection = async (): Promise<void> => {
  if (!redisClient) {
    return;
  }
  
  try {
    await redisClient.quit();
    logger.info('Redis connection closed');
    redisClient = null;
  } catch (error) {
    logger.error('Error closing Redis connection', error);
    // Force disconnect if quit doesn't work
    redisClient.disconnect();
    redisClient = null;
  }
};

// Initialize Redis when this module is imported
initRedisClient();

// Export default instance
export default getRedisClient();
