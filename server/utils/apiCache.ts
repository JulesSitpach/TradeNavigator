// server/utils/apiCache.ts
import { CacheService } from './cacheService';
import { ExternalAPIError } from './errors';

/**
 * Cache wrapper for external API calls
 * @param key Cache key
 * @param ttl Cache time-to-live in seconds
 * @param fetchFn Function to fetch data if not in cache
 * @returns Cached or fetched data
 */
export async function cachedApiCall<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl = 600
): Promise<T> {
  try {
    // Use the unified cache service
    return await CacheService.getOrFetch(key, fetchFn, ttl);
  } catch (error: any) {
    throw new ExternalAPIError(`API call failed: ${error.message}`);
  }
}

/**
 * Invalidate cache for a specific key or pattern
 * @param keyPattern Key or pattern to invalidate
 */
export async function invalidateCache(keyPattern: string): Promise<void> {
  await CacheService.deletePattern(keyPattern);
}

/**
 * Clear entire cache
 */
export async function clearCache(): Promise<void> {
  await CacheService.clear();
}
