// server/services/productService.ts
import { products } from "@shared/schema";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { sql } from "drizzle-orm";
import NodeCache from "node-cache";

// In-memory cache for products with 5 minute TTL
const productCache = new NodeCache({ stdTTL: 300 });

/**
 * Get all products for a user
 */
export async function getProductsByUser(userId: number) {
  // Check cache first
  const cacheKey = `user:${userId}:products`;
  const cachedProducts = productCache.get(cacheKey);
  
  if (cachedProducts) {
    return cachedProducts;
  }
  
  // Fetch from database
  const userProducts = await db.select()
    .from(products)
    .where(eq(products.userId, userId));
  
  // Store in cache and return
  productCache.set(cacheKey, userProducts);
  return userProducts;
}

/**
 * Get paginated products for a user
 */
export async function getProductsByUserPaginated(userId: number, offset: number, limit: number) {
  // For paginated results, we don't use cache to ensure freshness
  const userProducts = await db.select()
    .from(products)
    .where(eq(products.userId, userId))
    .limit(limit)
    .offset(offset)
    .orderBy(products.createdAt, "desc");
  
  return userProducts;
}

/**
 * Count total products for a user
 */
export async function countProductsByUser(userId: number) {
  const result = await db.select({ count: sql`count(*)` })
    .from(products)
    .where(eq(products.userId, userId));
  
  return Number(result[0]?.count || 0);
}

/**
 * Get a product by ID
 */
export async function getProduct(id: number) {
  // Check cache first
  const cacheKey = `product:${id}`;
  const cachedProduct = productCache.get(cacheKey);
  
  if (cachedProduct) {
    return cachedProduct;
  }
  
  // Fetch from database
  const [product] = await db.select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);
  
  // Store in cache if found
  if (product) {
    productCache.set(cacheKey, product);
  }
  
  return product;
}

/**
 * Create a new product
 */
export async function createProduct(productData: any) {
  const newProduct = await db.insert(products)
    .values(productData)
    .returning();
  
  // Invalidate cache for user's products
  productCache.del(`user:${productData.userId}:products`);
  
  // Cache the new product
  if (newProduct[0]) {
    productCache.set(`product:${newProduct[0].id}`, newProduct[0]);
  }
  
  return newProduct[0];
}

/**
 * Update a product
 */
export async function updateProduct(id: number, productData: any) {
  const updatedProduct = await db.update(products)
    .set(productData)
    .where(eq(products.id, id))
    .returning();
  
  // Invalidate caches
  productCache.del(`product:${id}`);
  productCache.del(`user:${productData.userId}:products`);
  
  return updatedProduct[0];
}

/**
 * Delete a product
 */
export async function deleteProduct(id: number, userId: number) {
  const result = await db.delete(products)
    .where(eq(products.id, id))
    .returning();
  
  // Invalidate caches
  productCache.del(`product:${id}`);
  productCache.del(`user:${userId}:products`);
  
  return result.length > 0;
}
