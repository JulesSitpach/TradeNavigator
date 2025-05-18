// server/services/exampleCachedService.ts
import { Cacheable, InvalidateCache } from '../utils/cacheDecorator';
import { logger } from '../utils/logger';

/**
 * Example service demonstrating cache decorators
 */
export class ExampleCachedService {
  /**
   * Get product by ID with caching
   * Cache key format: "product:getById:123"
   * TTL: 5 minutes (300 seconds)
   */
  @Cacheable('product', 300)
  async getById(id: string): Promise<any> {
    logger.info(`Cache miss for product ID: ${id}`);
    
    // Simulate database query
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      id,
      name: `Product ${id}`,
      price: Math.floor(Math.random() * 100) + 1,
      createdAt: new Date().toISOString()
    };
  }
  
  /**
   * Get all products with caching
   * Cache key: "product:getAll"
   * TTL: 2 minutes (120 seconds)
   */
  @Cacheable('product', 120, () => 'getAll')
  async getAll(): Promise<any[]> {
    logger.info('Cache miss for all products');
    
    // Simulate database query
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return Array.from({ length: 5 }, (_, i) => ({
      id: `${i + 1}`,
      name: `Product ${i + 1}`,
      price: Math.floor(Math.random() * 100) + 1,
      createdAt: new Date().toISOString()
    }));
  }
  
  /**
   * Update product and invalidate related caches
   */
  @InvalidateCache('product')
  async updateProduct(id: string, data: any): Promise<any> {
    logger.info(`Updating product ID: ${id}`);
    
    // Simulate database update
    await new Promise(resolve => setTimeout(resolve, 150));
    
    return {
      id,
      ...data,
      updatedAt: new Date().toISOString()
    };
  }
}