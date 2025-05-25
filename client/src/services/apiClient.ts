/**
 * API Client with Resilience and Failover
 * 
 * This module provides a robust API client with:
 * - Circuit breaker pattern for failing APIs
 * - Retry mechanisms with exponential backoff
 * - Fallback paths using cached data
 * - Background synchronization
 */

import { getCache, setCache } from './cache';

// Configuration constants
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 300;
const CIRCUIT_BREAKER_THRESHOLD = 5; // Number of failures before circuit opens
const CIRCUIT_HALF_OPEN_TIMEOUT_MS = 30000; // 30 seconds

// Cache keys
const CIRCUIT_STATE_KEY = 'tn_circuit_state';

// Types
export enum ApiEndpoint {
  HS_CODES = 'hs-codes',
  TRADE_AGREEMENTS = 'trade-agreements',
  TARIFF_RATES = 'tariff-rates',
  REGULATORY_REQUIREMENTS = 'regulatory-requirements',
  COUNTRY_DATA = 'country-data',
}

interface CircuitBreakerState {
  [endpoint: string]: {
    status: 'closed' | 'open' | 'half-open';
    failureCount: number;
    lastFailure: number;
    nextAttempt: number;
  };
}

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  params?: Record<string, string>;
  body?: any;
  headers?: Record<string, string>;
  useCache?: boolean;
  cacheTtl?: number;
  bypassCircuitBreaker?: boolean;
  fallbackToCache?: boolean;
  retries?: number;
}

export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
  source: 'api' | 'cache' | 'fallback';
  status: number;
}

/**
 * Make an API request with resilience features
 * @param endpoint The API endpoint
 * @param path The path within the endpoint
 * @param options Request options
 * @returns The API response
 */
export async function apiRequest<T = any>(
  endpoint: ApiEndpoint,
  path: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    params = {},
    body,
    headers = {},
    useCache = true,
    cacheTtl = 3600000, // 1 hour by default
    bypassCircuitBreaker = false,
    fallbackToCache = true,
    retries = MAX_RETRIES
  } = options;
  
  // Generate cache key
  const queryString = new URLSearchParams(params).toString();
  const cacheKey = `tn_api_${endpoint}_${path}_${queryString}_${method}`;
  
  // Check if this endpoint's circuit breaker is open
  if (!bypassCircuitBreaker) {
    const circuitState = await getCircuitBreakerState();
    const endpointCircuit = circuitState[endpoint];
    
    if (endpointCircuit && endpointCircuit.status === 'open') {
      // Check if it's time to try again (half-open)
      if (Date.now() >= endpointCircuit.nextAttempt) {
        // Update to half-open state
        await updateCircuitBreakerState(endpoint, 'half-open');
      } else if (fallbackToCache) {
        // Circuit is open and it's not time to retry, use cache if available
        const cachedResponse = await getCache<ApiResponse<T>>(cacheKey);
        if (cachedResponse) {
          return {
            ...cachedResponse,
            source: 'cache'
          };
        }
        
        // No cache, return fallback data
        return createFallbackResponse<T>(endpoint, path, params);
      } else {
        // Circuit is open and fallback not allowed
        return {
          data: null,
          error: new Error(`API ${endpoint} is currently unavailable (circuit open)`),
          source: 'fallback',
          status: 503
        };
      }
    }
  }
  
  // Try to get from cache first if it's a GET request and caching is enabled
  if (method === 'GET' && useCache) {
    const cachedResponse = await getCache<ApiResponse<T>>(cacheKey);
    if (cachedResponse) {
      return {
        ...cachedResponse,
        source: 'cache'
      };
    }
  }
  
  // Prepare for API request with retries
  let retryCount = 0;
  let lastError: Error | null = null;
  
  while (retryCount <= retries) {
    try {
      // Calculate backoff time if this is a retry
      if (retryCount > 0) {
        const backoffMs = INITIAL_BACKOFF_MS * Math.pow(2, retryCount - 1);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      }
      
      // Make the actual API request
      const response = await executeApiRequest<T>(endpoint, path, {
        method,
        params,
        body,
        headers
      });
      
      // If successful, reset circuit breaker (if it was in half-open state)
      const circuitState = await getCircuitBreakerState();
      if (circuitState[endpoint]?.status === 'half-open') {
        await updateCircuitBreakerState(endpoint, 'closed');
      }
      
      // Cache successful GET responses
      if (method === 'GET' && useCache) {
        await setCache(cacheKey, response, {
          ttl: cacheTtl,
          storage: ['memory', 'localStorage']
        });
      }
      
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      retryCount++;
      
      // If this is a 4xx error (client error), don't retry
      if (lastError.name === 'ApiError' && lastError.message.startsWith('4')) {
        break;
      }
    }
  }
  
  // All retries failed, update circuit breaker state
  if (!bypassCircuitBreaker) {
    await recordApiFailure(endpoint);
  }
  
  // If fallback is enabled, try to get from cache or generate fallback data
  if (fallbackToCache) {
    const cachedResponse = await getCache<ApiResponse<T>>(cacheKey);
    if (cachedResponse) {
      return {
        ...cachedResponse,
        source: 'cache'
      };
    }
    
    return createFallbackResponse<T>(endpoint, path, params);
  }
  
  // No fallback, return error
  return {
    data: null,
    error: lastError,
    source: 'api',
    status: 500
  };
}

/**
 * Get the current status of all circuit breakers
 * @returns The circuit breaker state for all endpoints
 */
export async function getCircuitBreakerStatus(): Promise<Record<string, 'closed' | 'open' | 'half-open'>> {
  const circuitState = await getCircuitBreakerState();
  
  const status: Record<string, 'closed' | 'open' | 'half-open'> = {};
  
  // Default all endpoints to closed if not explicitly set
  Object.values(ApiEndpoint).forEach(endpoint => {
    status[endpoint] = circuitState[endpoint]?.status || 'closed';
  });
  
  return status;
}

/**
 * Reset a circuit breaker to closed state
 * @param endpoint The endpoint to reset
 */
export async function resetCircuitBreaker(endpoint: ApiEndpoint): Promise<void> {
  await updateCircuitBreakerState(endpoint, 'closed');
}

/**
 * Add a request to the background sync queue
 * @param request The request details to queue
 * @returns A unique ID for the queued request
 */
export async function addToSyncQueue(request: {
  endpoint: ApiEndpoint;
  path: string;
  method: 'POST' | 'PUT' | 'DELETE';
  body: any;
}): Promise<string> {
  const requestId = Date.now().toString(36) + Math.random().toString(36).substring(2);
  
  // Get current queue
  const queue = await getCache<Array<{
    id: string;
    endpoint: ApiEndpoint;
    path: string;
    method: string;
    body: any;
    timestamp: number;
    attempts: number;
  }>>('tn_sync_queue') || [];
  
  // Add request to queue
  queue.push({
    id: requestId,
    ...request,
    timestamp: Date.now(),
    attempts: 0
  });
  
  // Save updated queue
  await setCache('tn_sync_queue', queue, {
    storage: ['localStorage', 'indexedDB']
  });
  
  // Try to process the queue if online
  if (navigator.onLine) {
    processSyncQueue().catch(err => console.error('Error processing sync queue:', err));
  }
  
  return requestId;
}

/**
 * Process the background sync queue
 * @returns Results of the sync operation
 */
export async function processSyncQueue(): Promise<{
  processed: number;
  successful: number;
  failed: number;
  remaining: number;
}> {
  // Can't process if offline
  if (!navigator.onLine) {
    return {
      processed: 0,
      successful: 0,
      failed: 0,
      remaining: 0
    };
  }
  
  // Get current queue
  const queue = await getCache<Array<{
    id: string;
    endpoint: ApiEndpoint;
    path: string;
    method: string;
    body: any;
    timestamp: number;
    attempts: number;
  }>>('tn_sync_queue') || [];
  
  if (queue.length === 0) {
    return {
      processed: 0,
      successful: 0,
      failed: 0,
      remaining: 0
    };
  }
  
  // Process queue items (up to 5 at a time)
  const itemsToProcess = queue.slice(0, 5);
  const remainingItems = queue.slice(5);
  
  let successful = 0;
  let failed = 0;
  
  // Process each item
  const results = await Promise.allSettled(
    itemsToProcess.map(async (item) => {
      try {
        // Try to make the API request
        await executeApiRequest(item.endpoint, item.path, {
          method: item.method as any,
          body: item.body
        });
        
        // Success
        successful++;
        return 'success';
      } catch (error) {
        // Increment attempt count
        item.attempts++;
        
        // If we've tried too many times, mark as failed
        if (item.attempts >= 5) {
          failed++;
          return 'failed';
        }
        
        // Otherwise, add back to the queue for retry
        remainingItems.push(item);
        return 'retry';
      }
    })
  );
  
  // Save updated queue
  await setCache('tn_sync_queue', remainingItems, {
    storage: ['localStorage', 'indexedDB']
  });
  
  return {
    processed: itemsToProcess.length,
    successful,
    failed,
    remaining: remainingItems.length
  };
}

// Private helper functions

/**
 * Execute an API request
 */
async function executeApiRequest<T>(
  endpoint: ApiEndpoint,
  path: string,
  options: {
    method: string;
    params?: Record<string, string>;
    body?: any;
    headers?: Record<string, string>;
  }
): Promise<ApiResponse<T>> {
  const { method, params, body, headers } = options;
  
  // In a real implementation, this would make an actual HTTP request
  // For now, just simulate API responses
  
  return new Promise((resolve, reject) => {
    // Simulate network latency
    setTimeout(() => {
      // Random chance of failure for testing
      if (Math.random() < 0.1) {
        const error = new Error('API request failed');
        // @ts-ignore
        error.name = 'ApiError';
        reject(error);
        return;
      }
      
      // Otherwise, return a mock success response
      resolve({
        data: { message: 'Success' } as any,
        error: null,
        source: 'api',
        status: 200
      });
    }, 300);
  });
}

/**
 * Get the current circuit breaker state
 */
async function getCircuitBreakerState(): Promise<CircuitBreakerState> {
  return await getCache<CircuitBreakerState>(CIRCUIT_STATE_KEY) || {};
}

/**
 * Update the circuit breaker state for an endpoint
 */
async function updateCircuitBreakerState(
  endpoint: ApiEndpoint,
  status: 'closed' | 'open' | 'half-open'
): Promise<void> {
  const circuitState = await getCircuitBreakerState();
  
  const now = Date.now();
  
  circuitState[endpoint] = {
    status,
    failureCount: status === 'closed' ? 0 : circuitState[endpoint]?.failureCount || 0,
    lastFailure: status === 'open' ? now : circuitState[endpoint]?.lastFailure || 0,
    nextAttempt: status === 'open' ? now + CIRCUIT_HALF_OPEN_TIMEOUT_MS : 0
  };
  
  await setCache(CIRCUIT_STATE_KEY, circuitState, {
    storage: ['localStorage']
  });
}

/**
 * Record an API failure and update circuit breaker if needed
 */
async function recordApiFailure(endpoint: ApiEndpoint): Promise<void> {
  const circuitState = await getCircuitBreakerState();
  
  // Initialize if not exists
  if (!circuitState[endpoint]) {
    circuitState[endpoint] = {
      status: 'closed',
      failureCount: 0,
      lastFailure: 0,
      nextAttempt: 0
    };
  }
  
  // Increment failure count
  circuitState[endpoint].failureCount++;
  circuitState[endpoint].lastFailure = Date.now();
  
  // If we've reached the threshold, open the circuit
  if (
    circuitState[endpoint].status !== 'open' &&
    circuitState[endpoint].failureCount >= CIRCUIT_BREAKER_THRESHOLD
  ) {
    circuitState[endpoint].status = 'open';
    circuitState[endpoint].nextAttempt = Date.now() + CIRCUIT_HALF_OPEN_TIMEOUT_MS;
  }
  
  await setCache(CIRCUIT_STATE_KEY, circuitState, {
    storage: ['localStorage']
  });
}

/**
 * Create a fallback response when API is unavailable
 */
function createFallbackResponse<T>(
  endpoint: ApiEndpoint,
  path: string,
  params?: Record<string, string>
): ApiResponse<T> {
  // In a real implementation, this would return sensible fallback data
  // based on the endpoint and parameters
  
  return {
    data: null,
    error: new Error(`API ${endpoint} is currently unavailable, using fallback data`),
    source: 'fallback',
    status: 503
  };
}

// Set up online/offline detection
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    // Process sync queue when we come back online
    processSyncQueue().catch(err => console.error('Error processing sync queue:', err));
  });
}
