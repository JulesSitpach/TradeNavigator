/**
 * Simple caching service for storing API responses and calculation results
 */
export class CachingService {
  private cache: Map<string, { data: any; expiry: number }> = new Map();

  /**
   * Set value in cache with TTL
   */
  set(key: string, value: any, ttlSeconds: number = 3600): void {
    const expiryTime = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, {
      data: value,
      expiry: expiryTime
    });
  }

  /**
   * Get value from cache if not expired
   */
  get(key: string): any | null {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }
    
    // Check if expired
    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  /**
   * Delete entry from cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
  }
}

export default new CachingService();