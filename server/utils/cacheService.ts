// server/utils/cacheService.ts
import NodeCache from 'node-cache';
import { getRedisClient } from './redis';
import { RedisCache } from './redis/redisCache';
import { logger } from './logger';
import { config } from '../config';

// Get cache configuration
const useRedisCache = config.getServerConfig().USE_REDIS_CACHE;
const cacheTtl = config.getServerConfig().CACHE_TTL || 300;

// Create in-memory cache for fallback
const memoryCache = new NodeCache({ stdTTL: cacheTtl });

/**
 * Unified cache service that uses Redis if enabled, otherwise falls back to in-memory cache
 */
export class CacheService {
  /**
   * Get or fetch a value from cache
   * @param key Cache key
   * @param fetchFn Function to call when cache miss occurs
   * @param ttl TTL in seconds (optional, defaults to config setting)
   * @returns Cached value or fresh data
   */
  static async getOrFetch<T>(key: string, fetchFn: () => Promise<T>, ttl = cacheTtl): Promise<T> {
    // If Redis is enabled, use RedisCache
    if (useRedisCache && getRedisClient()) {
      return RedisCache.getOrFetch(key, fetchFn, { ttl });
    }
    
    // Otherwise use in-memory cache
    const cachedData = memoryCache.get<T>(key);
    if (cachedData !== undefined) {
      return cachedData;
    }
    
    try {
      const data = await fetchFn();
      memoryCache.set(key, data, ttl);
      return data;
    } catch (error) {
      logger.error(`Cache fetch error for key ${key}:`, error);
      throw error;
    }
  }
  
  /**
   * Set a value in cache
   * @param key Cache key
   * @param data Data to cache
   * @param ttl TTL in seconds (optional)
   */
  static async set<T>(key: string, data: T, ttl = cacheTtl): Promise<void> {
    // If Redis is enabled, use RedisCache
    if (useRedisCache && getRedisClient()) {
      await RedisCache.set(key, data, ttl);
      return;
    }
    
    // Otherwise use in-memory cache
    memoryCache.set(key, data, ttl);
  }
  
  /**
   * Get a value from cache
   * @param key Cache key
   * @returns Cached value or null if not found
   */
  static async get<T>(key: string): Promise<T | null> {
    // If Redis is enabled, use RedisCache
    if (useRedisCache && getRedisClient()) {
      return RedisCache.get<T>(key);
    }
    
    // Otherwise use in-memory cache
    const value = memoryCache.get<T>(key);
    return value !== undefined ? value : null;
  }
  
  /**
   * Delete a key from cache
   * @param key Cache key to delete
   */
  static async delete(key: string): Promise<void> {
    // If Redis is enabled, use RedisCache
    if (useRedisCache && getRedisClient()) {
      await RedisCache.delete(key);
      return;
    }
    
    // Otherwise use in-memory cache
    memoryCache.del(key);
  }
  
  /**
   * Delete multiple keys matching a pattern
   * @param pattern Pattern to match for deletion
   */
  static async deletePattern(pattern: string): Promise<void> {
    // If Redis is enabled, use RedisCache
    if (useRedisCache && getRedisClient()) {
      await RedisCache.deletePattern(pattern);
      return;
    }
    
    // Otherwise use in-memory cache
    const keys = memoryCache.keys().filter(key => key.includes(pattern));
    if (keys.length > 0) {
      memoryCache.del(keys);
    }
  }
  
  /**
   * Clear all cached data
   */
  static async clear(): Promise<void> {
    // If Redis is enabled, use RedisCache
    if (useRedisCache && getRedisClient()) {
      await RedisCache.clear();
      return;
    }
    
    // Otherwise clear in-memory cache
    memoryCache.flushAll();
  }
}