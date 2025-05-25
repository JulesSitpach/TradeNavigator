import { useState, useEffect, useCallback } from 'react';
import { getCache, setCache } from '../services/cache';

/**
 * Custom hook for using cached data with automatic updates
 * @param key Cache key
 * @param fetchData Function to fetch fresh data
 * @param options Caching options
 * @returns [data, isLoading, error, refreshData]
 */
export function useCachedData<T>(
  key: string,
  fetchData: () => Promise<T>,
  options: {
    ttl?: number;
    storage?: ('memory' | 'localStorage' | 'indexedDB')[];
    skipCache?: boolean;
    refreshInterval?: number;
  } = {}
): [T | null, boolean, Error | null, () => Promise<void>] {
  const {
    ttl,
    storage = ['memory', 'localStorage'],
    skipCache = false,
    refreshInterval
  } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Function to load data (either from cache or fetch)
  const loadData = useCallback(async (forceRefresh: boolean = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Try to get from cache first (unless skipped or forced refresh)
      if (!skipCache && !forceRefresh) {
        const cachedData = await getCache<T>(key);
        if (cachedData) {
          setData(cachedData);
          setIsLoading(false);
          return;
        }
      }
      
      // If not in cache or forced refresh, fetch fresh data
      const freshData = await fetchData();
      
      // Update state
      setData(freshData);
      
      // Cache the data for future use
      if (!skipCache) {
        await setCache(key, freshData, { ttl, storage });
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [key, fetchData, skipCache, ttl, storage]);
  
  // Function to manually refresh data
  const refreshData = useCallback(async () => {
    await loadData(true);
  }, [loadData]);
  
  // Initial data load
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  // Set up refresh interval if specified
  useEffect(() => {
    if (!refreshInterval) return;
    
    const intervalId = setInterval(() => {
      loadData(true);
    }, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [refreshInterval, loadData]);
  
  return [data, isLoading, error, refreshData];
}

/**
 * Custom hook for caching form values to prevent data loss
 * @param formId Unique identifier for the form
 * @param initialValues Initial form values
 * @returns [formValues, updateFormValue, resetForm]
 */
export function useCachedForm<T extends Record<string, any>>(
  formId: string,
  initialValues: T
): [
  T,
  (field: keyof T, value: any) => void,
  () => void
] {
  const cacheKey = `tn_form_${formId}`;
  
  // Initialize state from cache or initial values
  const [formValues, setFormValues] = useState<T>(() => {
    try {
      const cached = localStorage.getItem(cacheKey);
      return cached ? JSON.parse(cached) : initialValues;
    } catch (error) {
      console.warn('Error loading cached form values:', error);
      return initialValues;
    }
  });
  
  // Update a single form field
  const updateFormValue = useCallback((field: keyof T, value: any) => {
    setFormValues(prev => {
      const updated = { ...prev, [field]: value };
      
      // Save to localStorage
      try {
        localStorage.setItem(cacheKey, JSON.stringify(updated));
      } catch (error) {
        console.warn('Error caching form values:', error);
      }
      
      return updated;
    });
  }, [cacheKey]);
  
  // Reset form to initial values
  const resetForm = useCallback(() => {
    setFormValues(initialValues);
    
    // Clear from localStorage
    try {
      localStorage.removeItem(cacheKey);
    } catch (error) {
      console.warn('Error clearing cached form values:', error);
    }
  }, [cacheKey, initialValues]);
  
  return [formValues, updateFormValue, resetForm];
}
