# Redis Caching Implementation Guide

This document provides an overview of the Redis caching implementation in the TradeNavigator project.

## Overview

We have implemented a comprehensive Redis-based caching strategy that provides:
- Distributed caching across multiple server instances
- Persistence for cache data
- Advanced data structure support
- Flexible cache invalidation strategies
- Session storage
- Rate limiting

## Configuration

Redis is configured via environment variables:

```env
# Cache Settings
CACHE_TTL=300                # Default cache TTL in seconds
USE_REDIS_CACHE=true         # Enable/disable Redis (falls back to in-memory)
REDIS_URL=redis://localhost:6379  # Redis connection URL
```

The system automatically falls back to in-memory caching if:
1. `USE_REDIS_CACHE` is set to `false`
2. Redis connection fails
3. Redis is temporarily unavailable

## Components

### Redis Connection Management

The `server/utils/redis/index.ts` file handles Redis connection setup, health checks, and graceful shutdown. It safely handles failures and reconnection attempts.

### Unified Cache Service

`server/utils/cacheService.ts` provides a unified interface for caching that works with both Redis and in-memory storage. This service is used by all other caching mechanisms.

### API Caching

`server/utils/apiCache.ts` facilitates caching for external API calls, reducing redundant requests.

### Database Query Caching

`server/utils/dbCache.ts` enables caching for expensive database queries, improving performance for read-heavy operations.

### Cache Decorators

`server/utils/cacheDecorator.ts` provides method decorators for easy cache integration in service classes:

```typescript
import { Cacheable, InvalidateCache } from '../utils/cacheDecorator';

export class ProductService {
  @Cacheable('product', 300)
  async getById(id: string): Promise<Product> {
    // Database query logic
  }

  @InvalidateCache('product')
  async updateProduct(id: string, data: ProductData): Promise<Product> {
    // Update logic
  }
}
```

### Event-Based Cache Invalidation

`server/utils/redis/cacheEvents.ts` implements a pub/sub mechanism for cross-instance cache invalidation, ensuring all server instances receive invalidation events.

### Session Storage

`server/utils/redis/sessionStore.ts` provides a Redis-based session store for Express, replacing the default PostgreSQL session storage when Redis is enabled.

### Rate Limiting

`server/middleware/redisRateLimit.ts` implements distributed rate limiting using Redis sorted sets, which is more accurate across multiple server instances than in-memory rate limiting.

## Usage Examples

### Basic Caching

```typescript
import { CacheService } from './utils/cacheService';

// Cache data for 5 minutes
await CacheService.set('user:123', userData, 300);

// Get cached data
const userData = await CacheService.get('user:123');

// Delete cached data
await CacheService.delete('user:123');

// Clear cache pattern
await CacheService.deletePattern('user:*');
```

### API Call Caching

```typescript
import { cachedApiCall } from './utils/apiCache';

const exchangeRates = await cachedApiCall(
  'exchange-rates:USD',
  () => fetchExchangeRates('USD'),
  3600 // 1 hour TTL
);
```

### Database Query Caching

```typescript
import { cachedQuery } from './utils/dbCache';

const products = await cachedQuery(
  'products.getAll',
  () => db.products.findMany({ where: { active: true } }),
  [],
  300 // 5 minutes TTL
);
```

### Event-Based Invalidation

```typescript
import { publishCacheInvalidation } from './utils/redis/cacheEvents';

// Invalidate a specific key
await publishCacheInvalidation('key', 'products:123');

// Invalidate a pattern (all products)
await publishCacheInvalidation('pattern', 'products');

// Invalidate the entire cache
await publishCacheInvalidation('all');
```

## Cache Invalidation Strategies

We've implemented three complementary cache invalidation strategies:

### 1. Time-Based Invalidation (TTL)

Every cached item has a time-to-live (TTL) value that automatically removes it from the cache after expiration.

```typescript
// Cache with a 5-minute TTL
await CacheService.set('key', value, 300);
```

### 2. Write-Through Caching

When data is updated, the cache is updated simultaneously.

```typescript
async function updateProduct(id, data) {
  // Update in database
  const updatedProduct = await db.products.update({
    where: { id },
    data
  });
  
  // Update cache directly
  await CacheService.set(`products:${id}`, updatedProduct, 600);
  
  return updatedProduct;
}
```

### 3. Event-Based Invalidation

When data is updated on one server instance, all other instances receive invalidation events via Redis pub/sub.

```typescript
async function deleteProduct(id) {
  // Delete from database
  await db.products.delete({ where: { id } });
  
  // Publish invalidation event to all server instances
  await publishCacheInvalidation('key', `products:${id}`);
  await publishCacheInvalidation('pattern', 'products:list');
}
```

## Monitoring and Troubleshooting

### Health Checks

The `/api/health/detailed` endpoint provides Redis health status:

```json
{
  "status": "healthy",
  "cache": {
    "type": "redis",
    "status": "healthy",
    "enabled": true
  }
}
```

### Common Issues

1. **Connection Errors**: Check Redis URL and ensure Redis is running
2. **Memory Issues**: Monitor Redis memory usage and adjust maxmemory settings
3. **Slow Performance**: Check network latency between app servers and Redis

### Best Practices

1. **Key Design**:
   - Use prefixes to organize keys (e.g., `products:123`, `users:456`)
   - Keep keys descriptive but concise
   - Include version in keys for schema changes (e.g., `products:v2:123`)

2. **TTL Strategy**:
   - Short-lived cache (seconds to minutes): Rapidly changing data
   - Medium-lived cache (minutes to hours): Semi-stable data
   - Long-lived cache (hours to days): Reference data that rarely changes

3. **Memory Management**:
   - Regularly monitor Redis memory usage
   - Consider using Redis eviction policies (e.g., `volatile-lru`)
   - Cache only necessary data, avoid large objects

## Future Improvements

1. **Redis Cluster**: Implement Redis Cluster for horizontal scaling
2. **Cache Analytics**: Add monitoring for cache hit/miss rates
3. **Cache Warmup**: Implement proactive cache warming for critical data
4. **Lua Scripts**: Use Redis Lua scripts for complex operations

## Conclusion

This Redis caching implementation provides a robust, scalable caching solution that significantly improves application performance. By centralizing cache logic and providing multiple strategy options, it enables flexible caching throughout the application while maintaining consistent behavior.
