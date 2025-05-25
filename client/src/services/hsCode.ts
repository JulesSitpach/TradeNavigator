/**
 * HS Code Database Service
 * 
 * This service provides functionality for managing and accessing HS codes:
 * - Local caching of frequently used HS codes
 * - Background synchronization for updated codes
 * - Versioning for cached HS data
 */

import { getCache, setCache, clearCache } from './cache';

const HS_CODE_CACHE_PREFIX = 'tn_hs_code_';
const HS_CODE_LIST_KEY = 'tn_hs_code_list';
const HS_CODE_VERSION_KEY = 'tn_hs_code_version';
const HS_CODE_LAST_SYNC_KEY = 'tn_hs_code_last_sync';

// Time constants
const HOUR = 3600 * 1000;
const DAY = 24 * HOUR;

// Types
export interface HSCode {
  code: string;
  description: string;
  section?: string;
  chapter?: string;
  notes?: string;
  lastUpdated?: string;
  version?: string;
}

/**
 * Get an HS code by its code number
 * @param code The HS code to retrieve
 * @returns The HS code data or null if not found
 */
export async function getHSCode(code: string): Promise<HSCode | null> {
  const cacheKey = `${HS_CODE_CACHE_PREFIX}${code}`;
  
  // Try to get from cache first
  const cachedCode = await getCache<HSCode>(cacheKey);
  if (cachedCode) {
    return cachedCode;
  }
  
  // If not in cache, fetch from API
  try {
    const hsCode = await fetchHSCode(code);
    if (hsCode) {
      // Cache the result for future use
      await setCache(cacheKey, hsCode, {
        ttl: 7 * DAY, // Cache for a week
        storage: ['memory', 'localStorage', 'indexedDB']
      });
      
      // Add to the list of cached codes
      await addToHSCodeList(code);
      
      return hsCode;
    }
  } catch (error) {
    console.error('Error fetching HS code:', error);
  }
  
  return null;
}

/**
 * Search for HS codes by description or partial code
 * @param query The search query
 * @param options Search options
 * @returns A list of matching HS codes
 */
export async function searchHSCodes(
  query: string,
  options: {
    limit?: number;
    offset?: number;
    useCache?: boolean;
  } = {}
): Promise<HSCode[]> {
  const { limit = 20, offset = 0, useCache = true } = options;
  
  // Generate a cache key for this search
  const cacheKey = `${HS_CODE_CACHE_PREFIX}search_${query.toLowerCase()}_${limit}_${offset}`;
  
  // Try to get from cache if enabled
  if (useCache) {
    const cachedResults = await getCache<HSCode[]>(cacheKey);
    if (cachedResults) {
      return cachedResults;
    }
  }
  
  // If not in cache or cache disabled, fetch from API
  try {
    const results = await fetchHSCodeSearch(query, limit, offset);
    
    // Cache the results for a shorter period (searches are less likely to be repeated exactly)
    if (useCache && results.length > 0) {
      await setCache(cacheKey, results, {
        ttl: 1 * DAY, // Cache for a day
        storage: ['memory', 'localStorage'] // Don't use IndexedDB for search results
      });
    }
    
    return results;
  } catch (error) {
    console.error('Error searching HS codes:', error);
    return [];
  }
}

/**
 * Check for updates to the HS code database
 * @param forceSync Force a synchronization even if not needed
 * @returns True if updates were available and applied
 */
export async function syncHSCodes(forceSync = false): Promise<boolean> {
  // Check when we last synced
  const lastSync = await getCache<number>(HS_CODE_LAST_SYNC_KEY) || 0;
  const currentVersion = await getCache<string>(HS_CODE_VERSION_KEY) || '';
  
  // Only sync if forced or it's been more than a day since last sync
  if (!forceSync && Date.now() - lastSync < DAY) {
    return false;
  }
  
  try {
    // Check for a new version
    const { version, hasUpdates } = await checkHSCodeVersion(currentVersion);
    
    // Update the last sync time regardless of whether there were updates
    await setCache(HS_CODE_LAST_SYNC_KEY, Date.now(), {
      storage: ['localStorage']
    });
    
    if (!hasUpdates) {
      return false;
    }
    
    // If we have updates, store the new version
    await setCache(HS_CODE_VERSION_KEY, version, {
      storage: ['localStorage', 'indexedDB']
    });
    
    // Get the list of cached codes so we can update them
    const cachedCodes = await getHSCodeList();
    
    // Fetch updates for all cached codes
    await Promise.all(
      cachedCodes.map(async (code) => {
        const cacheKey = `${HS_CODE_CACHE_PREFIX}${code}`;
        
        // Clear existing cache for this code
        await clearCache(cacheKey);
        
        // Fetch and cache the updated version
        const updatedCode = await fetchHSCode(code);
        if (updatedCode) {
          await setCache(cacheKey, updatedCode, {
            ttl: 7 * DAY,
            storage: ['memory', 'localStorage', 'indexedDB']
          });
        }
      })
    );
    
    return true;
  } catch (error) {
    console.error('Error syncing HS codes:', error);
    return false;
  }
}

// Private helper functions

/**
 * Fetch an HS code from the API
 */
async function fetchHSCode(code: string): Promise<HSCode | null> {
  // In a real implementation, this would make an API call
  // For now, just simulate a delay and return mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock data
      resolve({
        code,
        description: `Sample HS code ${code} description`,
        section: 'Sample Section',
        chapter: 'Sample Chapter',
        lastUpdated: new Date().toISOString(),
        version: '2022.1'
      });
    }, 300);
  });
}

/**
 * Search for HS codes via the API
 */
async function fetchHSCodeSearch(query: string, limit: number, offset: number): Promise<HSCode[]> {
  // In a real implementation, this would make an API call
  // For now, just simulate a delay and return mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock search results
      const results: HSCode[] = [];
      for (let i = 0; i < limit; i++) {
        const mockCode = `${Math.floor(1000 + Math.random() * 9000)}`;
        results.push({
          code: mockCode,
          description: `Result ${i + offset} for "${query}" - HS code ${mockCode}`,
          section: 'Sample Section',
          chapter: 'Sample Chapter',
          lastUpdated: new Date().toISOString(),
          version: '2022.1'
        });
      }
      resolve(results);
    }, 500);
  });
}

/**
 * Check if there's a new version of the HS code database
 */
async function checkHSCodeVersion(currentVersion: string): Promise<{ version: string; hasUpdates: boolean }> {
  // In a real implementation, this would check with the server
  // For now, just simulate a check
  return new Promise((resolve) => {
    setTimeout(() => {
      const serverVersion = '2022.2';
      resolve({
        version: serverVersion,
        hasUpdates: serverVersion !== currentVersion
      });
    }, 200);
  });
}

/**
 * Get the list of cached HS codes
 */
async function getHSCodeList(): Promise<string[]> {
  return await getCache<string[]>(HS_CODE_LIST_KEY) || [];
}

/**
 * Add an HS code to the list of cached codes
 */
async function addToHSCodeList(code: string): Promise<void> {
  const codes = await getHSCodeList();
  
  // Only add if not already in the list
  if (!codes.includes(code)) {
    codes.push(code);
    await setCache(HS_CODE_LIST_KEY, codes, {
      storage: ['localStorage', 'indexedDB']
    });
  }
}
