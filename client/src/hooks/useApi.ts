import { useState, useEffect, useCallback } from 'react';
import { apiRequest, ApiEndpoint, ApiResponse } from '../services/apiClient';

/**
 * Custom hook for making API requests with resilience features
 * @param endpoint API endpoint
 * @param path Path within the endpoint
 * @param options Request options
 * @returns [data, loading, error, refresh, source]
 */
export function useApi<T = any>(
  endpoint: ApiEndpoint,
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    params?: Record<string, string>;
    body?: any;
    useCache?: boolean;
    cacheTtl?: number;
    bypassCircuitBreaker?: boolean;
    fallbackToCache?: boolean;
    skipInitialRequest?: boolean;
    refreshInterval?: number;
  } = {}
): [
  T | null,
  boolean,
  Error | null,
  (body?: any) => Promise<ApiResponse<T>>,
  'api' | 'cache' | 'fallback'
] {
  const {
    method = 'GET',
    params = {},
    body,
    useCache = true,
    cacheTtl,
    bypassCircuitBreaker = false,
    fallbackToCache = true,
    skipInitialRequest = false,
    refreshInterval
  } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(!skipInitialRequest);
  const [error, setError] = useState<Error | null>(null);
  const [source, setSource] = useState<'api' | 'cache' | 'fallback'>('api');
  
  // Function to make the API request
  const makeRequest = useCallback(async (customBody?: any): Promise<ApiResponse<T>> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest<T>(endpoint, path, {
        method,
        params,
        body: customBody !== undefined ? customBody : body,
        useCache,
        cacheTtl,
        bypassCircuitBreaker,
        fallbackToCache
      });
      
      setData(response.data);
      setSource(response.source);
      
      if (response.error) {
        setError(response.error);
      }
      
      setLoading(false);
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setLoading(false);
      return {
        data: null,
        error,
        source: 'api',
        status: 500
      };
    }
  }, [endpoint, path, method, params, body, useCache, cacheTtl, bypassCircuitBreaker, fallbackToCache]);
  
  // Make initial request
  useEffect(() => {
    if (!skipInitialRequest) {
      makeRequest();
    }
  }, [skipInitialRequest, makeRequest]);
  
  // Set up refresh interval if specified
  useEffect(() => {
    if (!refreshInterval) return;
    
    const intervalId = setInterval(() => {
      makeRequest();
    }, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [refreshInterval, makeRequest]);
  
  return [data, loading, error, makeRequest, source];
}

/**
 * Custom hook for handling API request states with type safety
 * @returns State handling functions
 */
export function useApiState<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Reset state
  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);
  
  // Set state from API response
  const setFromResponse = useCallback((response: ApiResponse<T>) => {
    setData(response.data);
    setError(response.error);
    setLoading(false);
  }, []);
  
  // Start loading
  const startLoading = useCallback(() => {
    setLoading(true);
    setError(null);
  }, []);
  
  return {
    data,
    loading,
    error,
    setData,
    setLoading,
    setError,
    reset,
    setFromResponse,
    startLoading,
    isSuccess: data !== null && error === null,
    isError: error !== null
  };
}
