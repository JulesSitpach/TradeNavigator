// server/utils/cacheDecorator.ts
import { CacheService } from './cacheService';

/**
 * Method decorator for caching function results
 * @param prefix Cache key prefix
 * @param ttl Cache TTL in seconds
 * @param keyGenerator Optional function to generate cache key from method arguments
 */
export function Cacheable(
  prefix: string,
  ttl = 300,
  keyGenerator?: (...args: any[]) => string
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // Generate cache key
      const key = keyGenerator
        ? keyGenerator(...args)
        : `${prefix}:${propertyKey}:${JSON.stringify(args)}`;

      // Try to get from cache or call the original method
      return CacheService.getOrFetch(key, () => originalMethod.apply(this, args), ttl);
    };

    return descriptor;
  };
}

/**
 * Method decorator for invalidating cache entries
 * @param pattern Pattern to match for invalidation
 */
export function InvalidateCache(pattern: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);
      await CacheService.deletePattern(pattern);
      return result;
    };

    return descriptor;
  };
}