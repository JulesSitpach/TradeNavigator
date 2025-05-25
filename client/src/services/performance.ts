/**
 * Performance Optimization Service
 * 
 * This module provides utilities for performance optimization:
 * - Dynamic asset loading with code splitting
 * - Resource prioritization based on user behavior
 * - Predictive preloading for likely next pages
 * - Calculation efficiency with memoization
 */

// Type for resource loading priorities
export enum ResourcePriority {
  CRITICAL = 'critical', // Must load before anything else
  HIGH = 'high',         // Should load early in the page lifecycle
  MEDIUM = 'medium',     // Standard priority
  LOW = 'low',           // Load after high priority items
  LAZY = 'lazy'          // Only load when needed or when idle
}

// Resource types
export type ResourceType = 
  | 'script'
  | 'style'
  | 'image'
  | 'font'
  | 'data'
  | 'module';

interface Resource {
  id: string;
  type: ResourceType;
  priority: ResourcePriority;
  url?: string;
  loadCallback?: () => Promise<any>;
  dependencies?: string[];
  loaded: boolean;
  loadTime?: number;
  size?: number;
}

// Lazy loaded resources
const resources: Record<string, Resource> = {};

// Usage statistics for resource prediction
interface UsageStats {
  pageTransitions: Record<string, Record<string, number>>;
  resourceUsage: Record<string, {
    useCount: number;
    lastUsed: number;
    avgLoadTime: number;
  }>;
}

// Initialize or load existing usage stats
let usageStats: UsageStats = {
  pageTransitions: {},
  resourceUsage: {}
};

// Try to load saved stats from localStorage
try {
  const savedStats = localStorage.getItem('tn_resource_stats');
  if (savedStats) {
    usageStats = JSON.parse(savedStats);
  }
} catch (error) {
  console.warn('Failed to load resource usage stats:', error);
}

/**
 * Register a resource for optimized loading
 * @param resource The resource to register
 * @returns The resource ID
 */
export function registerResource(resource: Omit<Resource, 'loaded'>): string {
  const newResource: Resource = {
    ...resource,
    loaded: false
  };
  
  resources[resource.id] = newResource;
  return resource.id;
}

/**
 * Load a resource
 * @param resourceId The resource ID to load
 * @returns Promise that resolves when the resource is loaded
 */
export async function loadResource(resourceId: string): Promise<any> {
  // Check if resource exists
  if (!resources[resourceId]) {
    throw new Error(`Resource ${resourceId} not registered`);
  }
  
  // If already loaded, just return
  if (resources[resourceId].loaded) {
    return;
  }
  
  const resource = resources[resourceId];
  
  // Check dependencies first
  if (resource.dependencies && resource.dependencies.length > 0) {
    await Promise.all(
      resource.dependencies.map(depId => loadResource(depId))
    );
  }
  
  // Record start time for performance tracking
  const startTime = performance.now();
  
  // Load resource based on type
  try {
    let result;
    
    if (resource.loadCallback) {
      // Use custom load callback
      result = await resource.loadCallback();
    } else if (resource.url) {
      // Load based on resource type
      switch (resource.type) {
        case 'script':
          result = await loadScript(resource.url);
          break;
        case 'style':
          result = await loadStyle(resource.url);
          break;
        case 'image':
          result = await preloadImage(resource.url);
          break;
        case 'font':
          result = await loadFont(resource.url);
          break;
        case 'data':
          result = await fetchData(resource.url);
          break;
        case 'module':
          result = await import(/* webpackChunkName: "[request]" */ resource.url);
          break;
        default:
          throw new Error(`Unknown resource type: ${resource.type}`);
      }
    } else {
      throw new Error(`Resource ${resourceId} has no URL or load callback`);
    }
    
    // Calculate load time
    const loadTime = performance.now() - startTime;
    
    // Update resource state
    resources[resourceId] = {
      ...resource,
      loaded: true,
      loadTime
    };
    
    // Update usage stats
    updateResourceStats(resourceId, loadTime);
    
    return result;
  } catch (error) {
    console.error(`Failed to load resource ${resourceId}:`, error);
    throw error;
  }
}

/**
 * Preload resources based on current page and user behavior
 * @param currentPageId Current page identifier
 */
export function preloadLikelyResources(currentPageId: string): void {
  // Record current page visit
  if (!usageStats.pageTransitions[currentPageId]) {
    usageStats.pageTransitions[currentPageId] = {};
  }
  
  // Get likely next pages
  const likelyNextPages = getPredictedNextPages(currentPageId);
  
  // Preload resources for likely next pages
  if (likelyNextPages.length > 0) {
    // Use requestIdleCallback if available, otherwise setTimeout
    const schedulePreload = window.requestIdleCallback || 
      ((cb) => setTimeout(cb, 1000));
    
    schedulePreload(() => {
      likelyNextPages.forEach(page => {
        const resourcesForPage = getResourcesForPage(page.id);
        
        // Preload high priority resources first
        const highPriorityResources = resourcesForPage.filter(
          id => resources[id]?.priority === ResourcePriority.HIGH
        );
        
        highPriorityResources.forEach(id => {
          loadResource(id).catch(err => {
            // Silently fail for preloads
            console.debug(`Preload failed for ${id}:`, err);
          });
        });
      });
    });
  }
}

/**
 * Create a memoized version of a function
 * @param fn The function to memoize
 * @param resolver Optional key resolver function
 * @returns Memoized function
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  resolver?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = resolver ? resolver(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key) as ReturnType<T>;
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Create a memoized async function with TTL
 * @param fn The async function to memoize
 * @param ttl Time-to-live in milliseconds for cached results
 * @param resolver Optional key resolver function
 * @returns Memoized async function
 */
export function memoizeAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  ttl: number = 5 * 60 * 1000, // 5 minutes default
  resolver?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, {
    value: Promise<ReturnType<T>>;
    timestamp: number;
  }>();
  
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const key = resolver ? resolver(...args) : JSON.stringify(args);
    const now = Date.now();
    
    const cached = cache.get(key);
    if (cached && (now - cached.timestamp < ttl)) {
      return cached.value;
    }
    
    const resultPromise = fn(...args);
    cache.set(key, {
      value: resultPromise,
      timestamp: now
    });
    
    // Handle promise rejection - remove from cache if it fails
    resultPromise.catch(() => {
      // Only remove if this is still the cached promise (might have been overwritten)
      const current = cache.get(key);
      if (current && current.value === resultPromise) {
        cache.delete(key);
      }
    });
    
    return resultPromise;
  }) as T;
}

/**
 * Run a computation in a worker thread for better performance
 * @param fn The function to run (must be serializable)
 * @param args Arguments for the function (must be serializable)
 * @returns Promise that resolves with the result
 */
export function runInWorker<T>(
  fn: (...args: any[]) => T,
  ...args: any[]
): Promise<T> {
  // Create a worker blob URL
  const fnString = fn.toString();
  const workerScript = `
    self.onmessage = function(e) {
      const fnToRun = ${fnString};
      const result = fnToRun(...e.data);
      self.postMessage(result);
    }
  `;
  
  const blob = new Blob([workerScript], { type: 'application/javascript' });
  const workerUrl = URL.createObjectURL(blob);
  
  return new Promise((resolve, reject) => {
    const worker = new Worker(workerUrl);
    
    worker.onmessage = (e) => {
      resolve(e.data);
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
    };
    
    worker.onerror = (e) => {
      reject(new Error(`Worker error: ${e.message}`));
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
    };
    
    worker.postMessage(args);
  });
}

/**
 * Track a page transition to improve preloading
 * @param fromPageId The page navigated from
 * @param toPageId The page navigated to
 */
export function trackPageTransition(fromPageId: string, toPageId: string): void {
  if (!usageStats.pageTransitions[fromPageId]) {
    usageStats.pageTransitions[fromPageId] = {};
  }
  
  if (!usageStats.pageTransitions[fromPageId][toPageId]) {
    usageStats.pageTransitions[fromPageId][toPageId] = 0;
  }
  
  usageStats.pageTransitions[fromPageId][toPageId]++;
  
  // Save updated stats
  try {
    localStorage.setItem('tn_resource_stats', JSON.stringify(usageStats));
  } catch (error) {
    console.warn('Failed to save resource usage stats:', error);
  }
}

// Private helper functions

/**
 * Load a script
 */
async function loadScript(url: string): Promise<HTMLScriptElement> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    
    script.onload = () => resolve(script);
    script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
    
    document.head.appendChild(script);
  });
}

/**
 * Load a stylesheet
 */
async function loadStyle(url: string): Promise<HTMLLinkElement> {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    
    link.onload = () => resolve(link);
    link.onerror = () => reject(new Error(`Failed to load stylesheet: ${url}`));
    
    document.head.appendChild(link);
  });
}

/**
 * Preload an image
 */
async function preloadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    
    img.src = url;
  });
}

/**
 * Load a font
 */
async function loadFont(url: string): Promise<FontFace> {
  // Create a unique font family name
  const fontFamily = `font-${Math.random().toString(36).substring(2, 9)}`;
  
  const font = new FontFace(fontFamily, `url(${url})`);
  await font.load();
  
  // Add to document fonts
  document.fonts.add(font);
  
  return font;
}

/**
 * Fetch data
 */
async function fetchData(url: string): Promise<any> {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`);
  }
  
  // Check content type to determine how to parse
  const contentType = response.headers.get('content-type');
  
  if (contentType?.includes('application/json')) {
    return await response.json();
  } else {
    return await response.text();
  }
}

/**
 * Update resource usage statistics
 */
function updateResourceStats(resourceId: string, loadTime: number): void {
  if (!usageStats.resourceUsage[resourceId]) {
    usageStats.resourceUsage[resourceId] = {
      useCount: 0,
      lastUsed: 0,
      avgLoadTime: 0
    };
  }
  
  const stats = usageStats.resourceUsage[resourceId];
  
  // Update stats
  stats.useCount++;
  stats.lastUsed = Date.now();
  
  // Update average load time with exponential weighted average
  if (stats.useCount === 1) {
    stats.avgLoadTime = loadTime;
  } else {
    stats.avgLoadTime = 0.7 * stats.avgLoadTime + 0.3 * loadTime;
  }
  
  // Save updated stats
  try {
    localStorage.setItem('tn_resource_stats', JSON.stringify(usageStats));
  } catch (error) {
    console.warn('Failed to save resource usage stats:', error);
  }
}

/**
 * Get predicted next pages based on user behavior
 */
function getPredictedNextPages(currentPageId: string): Array<{
  id: string;
  probability: number;
}> {
  const transitions = usageStats.pageTransitions[currentPageId];
  
  if (!transitions) {
    return [];
  }
  
  // Calculate total transitions from current page
  const totalTransitions = Object.values(transitions).reduce((sum, count) => sum + count, 0);
  
  if (totalTransitions === 0) {
    return [];
  }
  
  // Calculate probabilities and sort by likelihood
  return Object.entries(transitions)
    .map(([pageId, count]) => ({
      id: pageId,
      probability: count / totalTransitions
    }))
    .filter(page => page.probability > 0.1) // Only include likely pages (>10%)
    .sort((a, b) => b.probability - a.probability);
}

/**
 * Get resources associated with a page
 * This is a placeholder - in a real implementation, this would be configurable
 */
function getResourcesForPage(pageId: string): string[] {
  // This would typically be configured elsewhere
  const pageResources: Record<string, string[]> = {
    'home': ['home-banner', 'featured-products'],
    'tariff-analysis': ['tariff-calculator', 'country-data'],
    'cost-breakdown': ['cost-calculator', 'chart-library'],
    'trade-regulations': ['regulations-data', 'compliance-checker'],
    'visualizations': ['chart-library', 'map-visualization'],
    // Add more page resources as needed
  };
  
  return pageResources[pageId] || [];
}
