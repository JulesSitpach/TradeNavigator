// server/utils/dbCache.ts
import { CacheService } from './cacheService';
import { logger } from './logger';

const DB_CACHE_PREFIX = 'db';
const DEFAULT_TTL = 300; // 5 minutes

/**
 * Cache wrapper for database queries
 * @param queryName Unique name for the query
 * @param queryFn Function to execute the query if not in cache
 * @param params Query parameters
 * @param ttl Cache TTL in seconds
 * @returns Cached or fresh query results
 */
export async function cachedQuery<T>(
  queryName: string,
  queryFn: (...args: any[]) => Promise<T>,
  params: any[] = [],
  ttl = DEFAULT_TTL
): Promise<T> {
  // Generate cache key based on query name and parameters
  const paramsHash = JSON.stringify(params);
  const cacheKey = `${DB_CACHE_PREFIX}:${queryName}:${paramsHash}`;
  
  try {
    return await CacheService.getOrFetch(cacheKey, () => queryFn(...params), ttl);
  } catch (error) {
    logger.error(`Database query cache error for ${queryName}:`, error);
    // On cache error, still try to execute the query
    return queryFn(...params);
  }
}

/**
 * Invalidate cache for a specific query or query pattern
 * @param queryPattern Query name pattern to invalidate
 */
export async function invalidateQueryCache(queryPattern: string): Promise<void> {
  await CacheService.deletePattern(`${DB_CACHE_PREFIX}:${queryPattern}`);
}

/**
 * Clear all database query caches
 */
export async function clearQueryCache(): Promise<void> {
  await CacheService.deletePattern(DB_CACHE_PREFIX);
}