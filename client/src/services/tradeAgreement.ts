/**
 * Trade Agreement Repository Service
 * 
 * This service provides functionality for managing and accessing trade agreements:
 * - Comprehensive cache of trade agreements by country pairs
 * - Storage of full text and simplified summaries
 * - Delta updates to minimize bandwidth usage
 * - Searchable index of agreement provisions
 */

import { getCache, setCache } from './cache';

const AGREEMENT_CACHE_PREFIX = 'tn_agreement_';
const AGREEMENT_INDEX_KEY = 'tn_agreement_index';
const AGREEMENT_VERSION_KEY = 'tn_agreement_version';

// Time constants
const HOUR = 3600 * 1000;
const DAY = 24 * HOUR;

// Types
export interface TradeAgreement {
  id: string;
  name: string;
  countries: string[];
  effectiveDate: string;
  expirationDate?: string;
  summary: string;
  fullText?: string;
  provisions: AgreementProvision[];
  lastUpdated: string;
  version: string;
}

export interface AgreementProvision {
  id: string;
  title: string;
  content: string;
  tags: string[];
  chapter: string;
  article: string;
}

export interface AgreementDelta {
  id: string;
  version: string;
  changes: {
    provisions: {
      added: AgreementProvision[];
      modified: AgreementProvision[];
      removed: string[];
    }
  };
}

/**
 * Get a trade agreement by country pair
 * @param country1 First country code
 * @param country2 Second country code
 * @returns The trade agreement data or null if not found
 */
export async function getTradeAgreementByCountries(
  country1: string, 
  country2: string
): Promise<TradeAgreement | null> {
  // Sort country codes to ensure consistent caching regardless of order
  const countryPair = [country1, country2].sort().join('_');
  const cacheKey = `${AGREEMENT_CACHE_PREFIX}countries_${countryPair}`;
  
  // Try to get from cache first
  const cachedAgreement = await getCache<TradeAgreement>(cacheKey);
  if (cachedAgreement) {
    return cachedAgreement;
  }
  
  // If not in cache, fetch from API
  try {
    const agreement = await fetchTradeAgreementByCountries(country1, country2);
    if (agreement) {
      // Cache the result for future use
      await setCache(cacheKey, agreement, {
        ttl: 7 * DAY, // Cache for a week
        storage: ['memory', 'localStorage', 'indexedDB']
      });
      
      // Also cache by ID for direct lookups
      await setCache(`${AGREEMENT_CACHE_PREFIX}id_${agreement.id}`, agreement, {
        ttl: 7 * DAY,
        storage: ['memory', 'localStorage', 'indexedDB']
      });
      
      // Update the agreement index
      await updateAgreementIndex(agreement);
      
      return agreement;
    }
  } catch (error) {
    console.error('Error fetching trade agreement:', error);
  }
  
  return null;
}

/**
 * Get a trade agreement by its ID
 * @param id The agreement ID
 * @returns The trade agreement data or null if not found
 */
export async function getTradeAgreementById(id: string): Promise<TradeAgreement | null> {
  const cacheKey = `${AGREEMENT_CACHE_PREFIX}id_${id}`;
  
  // Try to get from cache first
  const cachedAgreement = await getCache<TradeAgreement>(cacheKey);
  if (cachedAgreement) {
    return cachedAgreement;
  }
  
  // If not in cache, fetch from API
  try {
    const agreement = await fetchTradeAgreementById(id);
    if (agreement) {
      // Cache the result for future use
      await setCache(cacheKey, agreement, {
        ttl: 7 * DAY, // Cache for a week
        storage: ['memory', 'localStorage', 'indexedDB']
      });
      
      // Also cache by country pair for country-based lookups
      if (agreement.countries.length >= 2) {
        const countryPairs = generateCountryPairs(agreement.countries);
        
        await Promise.all(
          countryPairs.map(async (pair) => {
            const pairCacheKey = `${AGREEMENT_CACHE_PREFIX}countries_${pair}`;
            await setCache(pairCacheKey, agreement, {
              ttl: 7 * DAY,
              storage: ['memory', 'localStorage', 'indexedDB']
            });
          })
        );
      }
      
      // Update the agreement index
      await updateAgreementIndex(agreement);
      
      return agreement;
    }
  } catch (error) {
    console.error('Error fetching trade agreement:', error);
  }
  
  return null;
}

/**
 * Search for provisions within trade agreements
 * @param query The search query
 * @param options Search options
 * @returns Matching provisions with their agreement context
 */
export async function searchAgreementProvisions(
  query: string,
  options: {
    countries?: string[];
    tags?: string[];
    limit?: number;
    offset?: number;
  } = {}
): Promise<Array<{
  provision: AgreementProvision;
  agreement: {
    id: string;
    name: string;
    countries: string[];
  };
}>> {
  const { countries, tags, limit = 20, offset = 0 } = options;
  
  // In a real implementation, you might search local cache first for simple queries
  // and fall back to API for more complex searches
  
  try {
    // For now, just call the API directly
    return await fetchProvisionSearch(query, { countries, tags, limit, offset });
  } catch (error) {
    console.error('Error searching agreement provisions:', error);
    return [];
  }
}

/**
 * Check for updates to a specific trade agreement
 * @param agreementId The agreement ID to check
 * @returns The delta updates if available, or null if no updates
 */
export async function checkAgreementUpdates(agreementId: string): Promise<AgreementDelta | null> {
  // Get the current cached version if available
  const cacheKey = `${AGREEMENT_CACHE_PREFIX}id_${agreementId}`;
  const cachedAgreement = await getCache<TradeAgreement>(cacheKey);
  
  if (!cachedAgreement) {
    // If not cached, just fetch the full agreement
    await getTradeAgreementById(agreementId);
    return null;
  }
  
  try {
    // Check for delta updates since our cached version
    const delta = await fetchAgreementDelta(agreementId, cachedAgreement.version);
    
    if (delta) {
      // Apply the delta updates to our cached copy
      const updatedAgreement = applyDeltaToAgreement(cachedAgreement, delta);
      
      // Update the cache with the new version
      await setCache(cacheKey, updatedAgreement, {
        ttl: 7 * DAY,
        storage: ['memory', 'localStorage', 'indexedDB']
      });
      
      // Also update country pair caches
      if (updatedAgreement.countries.length >= 2) {
        const countryPairs = generateCountryPairs(updatedAgreement.countries);
        
        await Promise.all(
          countryPairs.map(async (pair) => {
            const pairCacheKey = `${AGREEMENT_CACHE_PREFIX}countries_${pair}`;
            await setCache(pairCacheKey, updatedAgreement, {
              ttl: 7 * DAY,
              storage: ['memory', 'localStorage', 'indexedDB']
            });
          })
        );
      }
      
      // Update the agreement index
      await updateAgreementIndex(updatedAgreement);
      
      return delta;
    }
  } catch (error) {
    console.error('Error checking for agreement updates:', error);
  }
  
  return null;
}

// Private helper functions

/**
 * Fetch a trade agreement by country pair from the API
 */
async function fetchTradeAgreementByCountries(country1: string, country2: string): Promise<TradeAgreement | null> {
  // In a real implementation, this would make an API call
  // For now, just simulate a delay and return mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock agreement data
      resolve({
        id: `agreement_${country1}_${country2}`,
        name: `${country1}-${country2} Trade Agreement`,
        countries: [country1, country2],
        effectiveDate: '2022-01-01',
        summary: `This is a sample trade agreement between ${country1} and ${country2}.`,
        provisions: [
          {
            id: 'prov1',
            title: 'Tariff Reductions',
            content: 'Both parties agree to reduce tariffs by 5% annually.',
            tags: ['tariffs', 'reductions'],
            chapter: '1',
            article: '1.1'
          },
          {
            id: 'prov2',
            title: 'Rules of Origin',
            content: 'Products must have 60% local content to qualify for preferential treatment.',
            tags: ['rules of origin', 'content requirements'],
            chapter: '2',
            article: '2.1'
          }
        ],
        lastUpdated: new Date().toISOString(),
        version: '1.0'
      });
    }, 400);
  });
}

/**
 * Fetch a trade agreement by ID from the API
 */
async function fetchTradeAgreementById(id: string): Promise<TradeAgreement | null> {
  // In a real implementation, this would make an API call
  // For now, just simulate a delay and return mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock agreement data
      const countryA = 'US';
      const countryB = 'CA';
      
      resolve({
        id,
        name: `${countryA}-${countryB} Trade Agreement`,
        countries: [countryA, countryB],
        effectiveDate: '2022-01-01',
        summary: `This is a sample trade agreement between ${countryA} and ${countryB}.`,
        provisions: [
          {
            id: 'prov1',
            title: 'Tariff Reductions',
            content: 'Both parties agree to reduce tariffs by 5% annually.',
            tags: ['tariffs', 'reductions'],
            chapter: '1',
            article: '1.1'
          },
          {
            id: 'prov2',
            title: 'Rules of Origin',
            content: 'Products must have 60% local content to qualify for preferential treatment.',
            tags: ['rules of origin', 'content requirements'],
            chapter: '2',
            article: '2.1'
          }
        ],
        lastUpdated: new Date().toISOString(),
        version: '1.0'
      });
    }, 400);
  });
}

/**
 * Search for provisions within agreements
 */
async function fetchProvisionSearch(
  query: string,
  options: {
    countries?: string[];
    tags?: string[];
    limit?: number;
    offset?: number;
  }
): Promise<Array<{
  provision: AgreementProvision;
  agreement: {
    id: string;
    name: string;
    countries: string[];
  };
}>> {
  // In a real implementation, this would make an API call
  // For now, just simulate a delay and return mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock search results
      const results = [];
      for (let i = 0; i < (options.limit || 5); i++) {
        results.push({
          provision: {
            id: `prov${i + (options.offset || 0)}`,
            title: `Sample Provision ${i + (options.offset || 0)}`,
            content: `This provision contains the search term "${query}" and is related to trade.`,
            tags: ['sample', 'search'],
            chapter: `${Math.floor(Math.random() * 10) + 1}`,
            article: `${Math.floor(Math.random() * 10) + 1}.${Math.floor(Math.random() * 10) + 1}`
          },
          agreement: {
            id: `agreement_${i}`,
            name: `Sample Agreement ${i}`,
            countries: options.countries || ['US', 'CA']
          }
        });
      }
      resolve(results);
    }, 600);
  });
}

/**
 * Fetch delta updates for an agreement
 */
async function fetchAgreementDelta(agreementId: string, currentVersion: string): Promise<AgreementDelta | null> {
  // In a real implementation, this would make an API call to get only the changes
  // For now, just simulate a delay and return mock delta data
  return new Promise((resolve) => {
    setTimeout(() => {
      // Only return delta if the version is outdated
      if (currentVersion === '1.0') {
        resolve({
          id: agreementId,
          version: '1.1',
          changes: {
            provisions: {
              added: [
                {
                  id: 'prov3',
                  title: 'Digital Trade',
                  content: 'Provisions for e-commerce and digital services.',
                  tags: ['digital', 'e-commerce'],
                  chapter: '3',
                  article: '3.1'
                }
              ],
              modified: [
                {
                  id: 'prov1',
                  title: 'Tariff Reductions - Amended',
                  content: 'Both parties agree to reduce tariffs by 7% annually.',
                  tags: ['tariffs', 'reductions'],
                  chapter: '1',
                  article: '1.1'
                }
              ],
              removed: ['prov2']
            }
          }
        });
      } else {
        // No updates if already on latest version
        resolve(null);
      }
    }, 300);
  });
}

/**
 * Apply delta updates to an existing agreement
 */
function applyDeltaToAgreement(agreement: TradeAgreement, delta: AgreementDelta): TradeAgreement {
  // Create a deep copy of the original agreement
  const updatedAgreement = JSON.parse(JSON.stringify(agreement)) as TradeAgreement;
  
  // Update the version
  updatedAgreement.version = delta.version;
  updatedAgreement.lastUpdated = new Date().toISOString();
  
  // Apply provision changes
  if (delta.changes.provisions) {
    // Process removals first
    if (delta.changes.provisions.removed && delta.changes.provisions.removed.length > 0) {
      updatedAgreement.provisions = updatedAgreement.provisions.filter(
        (provision) => !delta.changes.provisions.removed.includes(provision.id)
      );
    }
    
    // Process modifications
    if (delta.changes.provisions.modified && delta.changes.provisions.modified.length > 0) {
      for (const modifiedProvision of delta.changes.provisions.modified) {
        const index = updatedAgreement.provisions.findIndex((p) => p.id === modifiedProvision.id);
        if (index !== -1) {
          updatedAgreement.provisions[index] = modifiedProvision;
        }
      }
    }
    
    // Process additions
    if (delta.changes.provisions.added && delta.changes.provisions.added.length > 0) {
      updatedAgreement.provisions = [
        ...updatedAgreement.provisions,
        ...delta.changes.provisions.added
      ];
    }
  }
  
  return updatedAgreement;
}

/**
 * Update the agreement index with a new or updated agreement
 */
async function updateAgreementIndex(agreement: TradeAgreement): Promise<void> {
  // Get the current index
  const index = await getCache<Record<string, {
    id: string;
    name: string;
    countries: string[];
    lastUpdated: string;
  }>>(AGREEMENT_INDEX_KEY) || {};
  
  // Update or add this agreement to the index
  index[agreement.id] = {
    id: agreement.id,
    name: agreement.name,
    countries: agreement.countries,
    lastUpdated: agreement.lastUpdated
  };
  
  // Save the updated index
  await setCache(AGREEMENT_INDEX_KEY, index, {
    storage: ['localStorage', 'indexedDB']
  });
}

/**
 * Generate all possible country pairs from an array of countries
 */
function generateCountryPairs(countries: string[]): string[] {
  const pairs: string[] = [];
  
  for (let i = 0; i < countries.length; i++) {
    for (let j = i + 1; j < countries.length; j++) {
      // Always sort to ensure consistent caching
      pairs.push([countries[i], countries[j]].sort().join('_'));
    }
  }
  
  return pairs;
}
