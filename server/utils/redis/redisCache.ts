// server/utils/redis/redisCache.ts
import { getRedisClient } from './index';
import { logger } from '../logger';
import { config } from '../../config';

// Default TTL from config (seconds)
const DEFAULT_TTL = config.getServerConfig().CACHE_TTL || 300;
const KEY_PREFIX = 'tn:';

/**
 * Redis-specific cache implementation
 */
export class RedisCache {
  /**
   * Get a value from cache or fetch it using the provided function
   * @param key Cache key
   * @param fetchFn Function to fetch data if not in cache
   * @param options Caching options
   * @returns Promise with the cached or fetched data
   */
  static async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: {
      ttl?: number;
      prefix?: string;
      serialize?: (data: T) => string;
      deserialize?: (data: string) => T;
    } = {}
  ): Promise<T> {
    const {
      ttl = DEFAULT_TTL,
      prefix = KEY_PREFIX,
      serialize = JSON.stringify,
      deserialize = JSON.parse,
    } = options;

    const cacheKey = `${prefix}${key}`;
    const client = getRedisClient();
    
    // If Redis is disabled or client unavailable, just fetch the data
    if (!client) {
      return await fetchFn();
    }

    try {
      // Try to get from cache first
      const cachedData = await client.get(cacheKey);
      
      if (cachedData) {
        return deserialize(cachedData);
      }
      
      // Not in cache, fetch fresh data
      const data = await fetchFn();
      
      // Store in cache with TTL
      await client.set(cacheKey, serialize(data), 'EX', ttl);
      
      return data;
    } catch (error) {
      logger.error(`Redis cache error for key ${cacheKey}:`, error);
      
      // On cache error, still try to fetch the data
      try {
        return await fetchFn();
      } catch (fetchError: any) {
        logger.error(`Failed to fetch data: ${fetchError.message}`);
        throw fetchError;
      }
    }
  }

  /**
   * Store a value in the cache
   * @param key Cache key
   * @param data Data to cache
   * @param ttl Time-to-live in seconds
   * @param options Caching options
   */
  static async set<T>(
    key: string,
    data: T,
    ttl = DEFAULT_TTL,
    options: {
      prefix?: string;
      serialize?: (data: T) => string;
    } = {}
  ): Promise<void> {
    const {
      prefix = KEY_PREFIX,
      serialize = JSON.stringify,
    } = options;

    const cacheKey = `${prefix}${key}`;
    const client = getRedisClient();
    
    // If Redis is disabled or client unavailable, do nothing
    if (!client) {
      return;
    }
    
    try {
      await client.set(cacheKey, serialize(data), 'EX', ttl);
    } catch (error) {
      logger.error(`Redis set error for key ${cacheKey}:`, error);
    }
  }
  
  /**
   * Get a value from the cache
   * @param key Cache key
   * @param options Caching options
   * @returns Promise with the cached data or null if not found
   */
  static async get<T>(
    key: string,
    options: {
      prefix?: string;
      deserialize?: (data: string) => T;
    } = {}
  ): Promise<T | null> {
    const {
      prefix = KEY_PREFIX,
      deserialize = JSON.parse,
    } = options;

    const cacheKey = `${prefix}${key}`;
    const client = getRedisClient();
    
    // If Redis is disabled or client unavailable, return null
    if (!client) {
      return null;
    }
    
    try {
      const cachedData = await client.get(cacheKey);
      
      if (cachedData) {
        return deserialize(cachedData);
      }
      
      return null;
    } catch (error) {
      logger.error(`Redis get error for key ${cacheKey}:`, error);
      return null;
    }
  }
  
  /**
   * Delete a specific key from the cache
   * @param key Cache key
   * @param options Caching options
   */
  static async delete(
    key: string,
    options: {
      prefix?: string;
    } = {}
  ): Promise<void> {
    const { prefix = KEY_PREFIX } = options;
    const cacheKey = `${prefix}${key}`;
    const client = getRedisClient();
    
    // If Redis is disabled or client unavailable, do nothing
    if (!client) {
      return;
    }
    
    try {
      await client.del(cacheKey);
    } catch (error) {
      logger.error(`Redis delete error for key ${cacheKey}:`, error);
    }
  }
  
  /**
   * Delete multiple keys matching a pattern
   * @param pattern Key pattern to match for deletion
   * @param options Caching options
   */
  static async deletePattern(
    pattern: string,
    options: {
      prefix?: string;
    } = {}
  ): Promise<void> {
    const { prefix = KEY_PREFIX } = options;
    const cachePattern = `${prefix}${pattern}*`;
    const client = getRedisClient();
    
    // If Redis is disabled or client unavailable, do nothing
    if (!client) {
      return;
    }
    
    try {
      // Use SCAN instead of KEYS for production environments to avoid blocking
      let cursor = '0';
      do {
        const [nextCursor, keys] = await client.scan(
          cursor,
          'MATCH',
          cachePattern,
          'COUNT',
          100
        );
        
        cursor = nextCursor;
        
        if (keys.length > 0) {
          await client.del(...keys);
        }
      } while (cursor !== '0');
    } catch (error) {
      logger.error(`Redis delete pattern error for pattern ${cachePattern}:`, error);
    }
  }
  
  /**
   * Check if a key exists in the cache
   * @param key Cache key
   * @param options Caching options
   * @returns Promise that resolves to true if the key exists
   */
  static async exists(
    key: string,
    options: {
      prefix?: string;
    } = {}
  ): Promise<boolean> {
    const { prefix = KEY_PREFIX } = options;
    const cacheKey = `${prefix}${key}`;
    const client = getRedisClient();
    
    // If Redis is disabled or client unavailable, return false
    if (!client) {
      return false;
    }
    
    try {
      const exists = await client.exists(cacheKey);
      return exists === 1;
    } catch (error) {
      logger.error(`Redis exists error for key ${cacheKey}:`, error);
      return false;
    }
  }
  
  /**
   * Get the TTL (time-to-live) for a key in seconds
   * @param key Cache key
   * @param options Caching options
   * @returns Promise that resolves to the TTL in seconds, -1 if no TTL, -2 if key doesn't exist
   */
  static async ttl(
    key: string,
    options: {
      prefix?: string;
    } = {}
  ): Promise<number> {
    const { prefix = KEY_PREFIX } = options;
    const cacheKey = `${prefix}${key}`;
    const client = getRedisClient();
    
    // If Redis is disabled or client unavailable, return -2 (key doesn't exist)
    if (!client) {
      return -2;
    }
    
    try {
      return await client.ttl(cacheKey);
    } catch (error) {
      logger.error(`Redis TTL error for key ${cacheKey}:`, error);
      return -2;
    }
  }
  
  /**
   * Clear all keys with the configured prefix
   */
  static async clear(): Promise<void> {
    const client = getRedisClient();
    
    // If Redis is disabled or client unavailable, do nothing
    if (!client) {
      return;
    }
    
    try {
      // Use SCAN to find all keys with our prefix
      const pattern = `${KEY_PREFIX}*`;
      let cursor = '0';
      
      do {
        const [nextCursor, keys] = await client.scan(
          cursor,
          'MATCH',
          pattern,
          'COUNT',
          100
        );
        
        cursor = nextCursor;
        
        if (keys.length > 0) {
          await client.del(...keys);
        }
      } while (cursor !== '0');
      
      logger.info('Redis cache cleared');
    } catch (error) {
      logger.error('Redis clear cache error:', error);
    }
  }
}