/**
 * Tiered Caching System for TradeNavigator
 * 
 * This module implements a multi-level caching strategy:
 * 1. Memory cache (fastest, but lost on page refresh)
 * 2. LocalStorage (persists across sessions, limited size)
 * 3. IndexedDB (large data storage, persists across sessions)
 */

// Cache version for managing updates
const CACHE_VERSION = '1.0.0';

// Memory cache for fastest access
const memoryCache: Record<string, {
  data: any;
  timestamp: number;
  expiresAt?: number;
}> = {};

/**
 * Set an item in the tiered cache system
 * @param key The cache key
 * @param data The data to cache
 * @param options Cache options
 */
export async function setCache(
  key: string,
  data: any,
  options: {
    /** Time-to-live in milliseconds */
    ttl?: number;
    /** Storage levels to use */
    storage?: ('memory' | 'localStorage' | 'indexedDB')[];
  } = {}
): Promise<void> {
  const { ttl, storage = ['memory', 'localStorage', 'indexedDB'] } = options;
  const timestamp = Date.now();
  const expiresAt = ttl ? timestamp + ttl : undefined;
  
  const cacheItem = {
    data,
    timestamp,
    expiresAt,
    version: CACHE_VERSION
  };

  // Always store in memory for fastest access
  if (storage.includes('memory')) {
    memoryCache[key] = { data, timestamp, expiresAt };
  }

  // Store in localStorage if requested
  if (storage.includes('localStorage')) {
    try {
      localStorage.setItem(key, JSON.stringify(cacheItem));
    } catch (error) {
      console.warn('Failed to store in localStorage:', error);
    }
  }

  // Store in IndexedDB if requested
  if (storage.includes('indexedDB')) {
    try {
      await storeInIndexedDB(key, cacheItem);
    } catch (error) {
      console.warn('Failed to store in IndexedDB:', error);
    }
  }
}

/**
 * Get an item from the tiered cache system
 * @param key The cache key
 * @returns The cached data or null if not found or expired
 */
export async function getCache<T = any>(key: string): Promise<T | null> {
  // Try memory cache first (fastest)
  if (memoryCache[key]) {
    if (!isExpired(memoryCache[key].expiresAt)) {
      return memoryCache[key].data as T;
    }
    // If expired, remove from memory cache
    delete memoryCache[key];
  }

  // Try localStorage next
  try {
    const storedItem = localStorage.getItem(key);
    if (storedItem) {
      const parsedItem = JSON.parse(storedItem);
      // Check version and expiration
      if (parsedItem.version === CACHE_VERSION && !isExpired(parsedItem.expiresAt)) {
        // Update memory cache for faster subsequent access
        memoryCache[key] = {
          data: parsedItem.data,
          timestamp: parsedItem.timestamp,
          expiresAt: parsedItem.expiresAt
        };
        return parsedItem.data as T;
      } else {
        // Clean up expired or outdated item
        localStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.warn('Error retrieving from localStorage:', error);
  }

  // Finally try IndexedDB
  try {
    const dbItem = await getFromIndexedDB(key);
    if (dbItem && dbItem.version === CACHE_VERSION && !isExpired(dbItem.expiresAt)) {
      // Update memory cache for faster subsequent access
      memoryCache[key] = {
        data: dbItem.data,
        timestamp: dbItem.timestamp,
        expiresAt: dbItem.expiresAt
      };
      return dbItem.data as T;
    } else if (dbItem) {
      // Clean up expired or outdated item
      await removeFromIndexedDB(key);
    }
  } catch (error) {
    console.warn('Error retrieving from IndexedDB:', error);
  }

  return null;
}

/**
 * Clear an item from all cache layers
 * @param key The cache key to clear
 */
export async function clearCache(key: string): Promise<void> {
  // Clear from memory
  delete memoryCache[key];
  
  // Clear from localStorage
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('Error removing from localStorage:', error);
  }
  
  // Clear from IndexedDB
  try {
    await removeFromIndexedDB(key);
  } catch (error) {
    console.warn('Error removing from IndexedDB:', error);
  }
}

/**
 * Clear all cached data
 */
export async function clearAllCache(): Promise<void> {
  // Clear memory cache
  Object.keys(memoryCache).forEach(key => {
    delete memoryCache[key];
  });
  
  // Clear localStorage (only TradeNavigator keys)
  try {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('tn_')) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Error clearing localStorage:', error);
  }
  
  // Clear IndexedDB
  try {
    await clearIndexedDB();
  } catch (error) {
    console.warn('Error clearing IndexedDB:', error);
  }
}

// Helper function to check if a cache item is expired
function isExpired(expiresAt?: number): boolean {
  if (!expiresAt) return false;
  return Date.now() > expiresAt;
}

// IndexedDB helpers
const DB_NAME = 'TradeNavigatorCache';
const STORE_NAME = 'cache';
const DB_VERSION = 1;

async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
  });
}

async function storeInIndexedDB(key: string, value: any): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const request = store.put({ key, ...value });
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
    
    transaction.oncomplete = () => db.close();
  });
}

async function getFromIndexedDB(key: string): Promise<any> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    const request = store.get(key);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      resolve(request.result || null);
    };
    
    transaction.oncomplete = () => db.close();
  });
}

async function removeFromIndexedDB(key: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const request = store.delete(key);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
    
    transaction.oncomplete = () => db.close();
  });
}

async function clearIndexedDB(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const request = store.clear();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
    
    transaction.oncomplete = () => db.close();
  });
}
