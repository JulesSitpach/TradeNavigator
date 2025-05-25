import { useEffect, useRef, useCallback } from 'react';
import {
  preloadLikelyResources,
  trackPageTransition,
  memoize,
  memoizeAsync,
  runInWorker
} from '../services/performance';

/**
 * Hook for tracking and optimizing page navigation
 * @param currentPageId Current page identifier
 * @param previousPageId Optional previous page identifier
 */
export function usePageNavigation(currentPageId: string, previousPageId?: string) {
  const prevPageRef = useRef<string | undefined>(previousPageId);
  
  useEffect(() => {
    // Track the page navigation
    if (prevPageRef.current && prevPageRef.current !== currentPageId) {
      trackPageTransition(prevPageRef.current, currentPageId);
    }
    
    // Update ref for next navigation
    prevPageRef.current = currentPageId;
    
    // Preload resources likely to be needed from this page
    preloadLikelyResources(currentPageId);
  }, [currentPageId]);
}

/**
 * Hook for memoizing expensive function results
 * @param fn The function to memoize
 * @param deps Dependencies array for recalculating the memoized function
 * @param resolver Optional key resolver function
 * @returns Memoized function
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  fn: T,
  deps: React.DependencyList,
  resolver?: (...args: Parameters<T>) => string
): T {
  // Create the memoized function
  const memoizedFn = useCallback(
    memoize(fn, resolver),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps
  );
  
  return memoizedFn;
}

/**
 * Hook for memoizing async function results with TTL
 * @param fn The async function to memoize
 * @param ttl Time-to-live in milliseconds for cached results
 * @param deps Dependencies array for recalculating the memoized function
 * @param resolver Optional key resolver function
 * @returns Memoized async function
 */
export function useMemoizedAsyncCallback<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  ttl: number = 5 * 60 * 1000, // 5 minutes default
  deps: React.DependencyList,
  resolver?: (...args: Parameters<T>) => string
): T {
  // Create the memoized function
  const memoizedFn = useCallback(
    memoizeAsync(fn, ttl, resolver),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps
  );
  
  return memoizedFn;
}

/**
 * Hook for running computations in a worker thread
 * @returns Function to run computation in worker
 */
export function useWorkerComputation() {
  /**
   * Run a computation in a worker thread
   * @param fn The function to run
   * @param args Arguments for the function
   * @returns Promise that resolves with the result
   */
  const runComputation = useCallback(<T>(
    fn: (...args: any[]) => T,
    ...args: any[]
  ): Promise<T> => {
    return runInWorker(fn, ...args);
  }, []);
  
  return runComputation;
}

/**
 * Hook for lazy loading a component when it comes into view
 * @param observerOptions IntersectionObserver options
 * @returns [ref, isVisible]
 */
export function useLazyLoad(observerOptions: IntersectionObserverInit = {}) {
  const elementRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Once visible, stop observing
          observer.disconnect();
        }
      },
      observerOptions
    );
    
    observer.observe(element);
    
    return () => {
      observer.disconnect();
    };
  }, [observerOptions]);
  
  return [elementRef, isVisible] as const;
}

// Missing import for useState
import { useState } from 'react';
