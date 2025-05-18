// server/utils/redis/cacheEvents.ts
import { getRedisClient } from './index';
import { CacheService } from '../cacheService';
import { logger } from '../logger';
import { config } from '../../config';

const CACHE_CHANNEL = 'cache:invalidation';
const useRedisCache = config.getServerConfig().USE_REDIS_CACHE;

// Create a subscriber instance
let subscriber: ReturnType<typeof getRedisClient> = null;

/**
 * Set up pub/sub for cache invalidation
 */
export function setupCacheInvalidationEvents() {
  // Only set up if Redis is enabled
  if (!useRedisCache) {
    logger.info('Redis cache is disabled. Cache invalidation events will not be available.');
    return null;
  }
  
  const redisClient = getRedisClient();
  if (!redisClient) {
    return null;
  }
  
  try {
    // Create a duplicate connection for subscription
    // (Redis clients in subscribe mode can't be used for other commands)
    subscriber = redisClient.duplicate();
    
    subscriber.subscribe(CACHE_CHANNEL, (err) => {
      if (err) {
        logger.error('Redis cache invalidation subscription error:', err);
        return;
      }
      
      logger.info('Cache invalidation events initialized');
    });
    
    subscriber.on('message', async (channel, message) => {
      if (channel !== CACHE_CHANNEL) {
        return;
      }
      
      try {
        const invalidationEvent = JSON.parse(message);
        
        if (invalidationEvent.type === 'key') {
          await CacheService.delete(invalidationEvent.key);
          logger.debug(`Cache invalidated for key: ${invalidationEvent.key}`);
        } else if (invalidationEvent.type === 'pattern') {
          await CacheService.deletePattern(invalidationEvent.pattern);
          logger.debug(`Cache invalidated for pattern: ${invalidationEvent.pattern}`);
        } else if (invalidationEvent.type === 'all') {
          await CacheService.clear();
          logger.debug('Cache completely invalidated');
        }
      } catch (error) {
        logger.error('Error processing cache invalidation event:', error);
      }
    });
    
    return subscriber;
  } catch (error) {
    logger.error('Failed to set up cache invalidation events:', error);
    return null;
  }
}

/**
 * Publish a cache invalidation event
 * @param type Type of invalidation
 * @param key Key or pattern to invalidate
 */
export async function publishCacheInvalidation(
  type: 'key' | 'pattern' | 'all',
  key?: string
): Promise<void> {
  // If Redis is disabled, fall back to direct invalidation
  if (!useRedisCache) {
    if (type === 'key' && key) {
      await CacheService.delete(key);
    } else if (type === 'pattern' && key) {
      await CacheService.deletePattern(key);
    } else if (type === 'all') {
      await CacheService.clear();
    }
    return;
  }
  
  const redisClient = getRedisClient();
  if (!redisClient) {
    // If Redis client not available, fall back to direct invalidation
    if (type === 'key' && key) {
      await CacheService.delete(key);
    } else if (type === 'pattern' && key) {
      await CacheService.deletePattern(key);
    } else if (type === 'all') {
      await CacheService.clear();
    }
    return;
  }
  
  const message = JSON.stringify({
    type,
    key,
    timestamp: Date.now()
  });
  
  try {
    await redisClient.publish(CACHE_CHANNEL, message);
    logger.debug(`Published cache invalidation event: ${type} ${key || ''}`);
  } catch (error) {
    logger.error('Error publishing cache invalidation event:', error);
    
    // Fall back to direct invalidation
    if (type === 'key' && key) {
      await CacheService.delete(key);
    } else if (type === 'pattern' && key) {
      await CacheService.deletePattern(key);
    } else if (type === 'all') {
      await CacheService.clear();
    }
  }
}

/**
 * Close the subscriber connection
 */
export async function closeSubscriber(): Promise<void> {
  if (subscriber) {
    try {
      await subscriber.unsubscribe();
      await subscriber.quit();
      subscriber = null;
      logger.info('Cache invalidation subscriber closed');
    } catch (error) {
      logger.error('Error closing cache invalidation subscriber:', error);
      if (subscriber) {
        subscriber.disconnect();
        subscriber = null;
      }
    }
  }
}