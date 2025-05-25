// Service Worker for TradeNavigator
// Provides offline capabilities and caching strategies

const CACHE_NAME = 'tradenavigator-v1';
const OFFLINE_URL = '/offline.html';
const OFFLINE_ASSET_URLS = [
  '/offline.html',
  '/offline.css',
  '/offline-logo.svg',
  '/favicon.ico'
];

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/index.css',
  '/assets/index.js',
  ...OFFLINE_ASSET_URLS
];

// Cache API data paths
const API_CACHE_URLS = [
  '/api/hs-codes',
  '/api/trade-agreements',
  '/api/countries'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      
      // Cache offline page and essential assets first
      await cache.addAll(OFFLINE_ASSET_URLS);
      
      // Then attempt to cache other assets
      try {
        await cache.addAll(PRECACHE_ASSETS);
      } catch (error) {
        console.error('Pre-caching failed:', error);
      }
      
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Clean up old caches
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
      
      // Take control of all clients immediately
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }
  
  // Handle API requests with stale-while-revalidate strategy
  if (API_CACHE_URLS.some(endpoint => url.pathname.includes(endpoint))) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // For HTML navigation requests, use network-first strategy
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }
  
  // For assets, use cache-first strategy
  event.respondWith(handleAssetRequest(request));
});

// Handle navigation requests (HTML pages)
async function handleNavigationRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // If successful, cache the response and return it
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    // If network fails, try to get from cache
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If not in cache, return offline page
    return caches.match(OFFLINE_URL);
  }
}

// Handle API requests
async function handleApiRequest(request) {
  // Try to get from cache first
  const cachedResponse = await caches.match(request);
  
  // Clone the request because it's a stream that can only be consumed once
  const fetchPromise = fetch(request.clone())
    .then((networkResponse) => {
      if (networkResponse.ok) {
        // Update the cache with the new response
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });
      }
      return networkResponse;
    })
    .catch((error) => {
      console.error('Fetch failed for API request:', error);
      // Return a custom offline response for API
      return new Response(
        JSON.stringify({
          error: 'You are offline',
          offline: true,
          timestamp: new Date().toISOString()
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    });
  
  // Return cached response if available, otherwise wait for fetch
  return cachedResponse || fetchPromise;
}

// Handle asset requests (CSS, JS, images, etc.)
async function handleAssetRequest(request) {
  // Try cache first
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // If not in cache, try network
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Failed to fetch asset:', request.url, error);
    
    // For image requests that fail, you could return a placeholder
    if (request.destination === 'image') {
      return caches.match('/offline-placeholder.png');
    }
    
    // For other assets, just let the request fail
    throw error;
  }
}

// Handle background sync for pending submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-calculations') {
    event.waitUntil(syncPendingCalculations());
  } else if (event.tag === 'sync-user-preferences') {
    event.waitUntil(syncUserPreferences());
  }
});

// Sync pending calculations with the server
async function syncPendingCalculations() {
  try {
    const db = await openDB();
    const pendingItems = await db.getAll('pendingCalculations');
    
    for (const item of pendingItems) {
      try {
        const response = await fetch('/api/calculations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data)
        });
        
        if (response.ok) {
          await db.delete('pendingCalculations', item.id);
        }
      } catch (error) {
        console.error('Failed to sync calculation:', error);
      }
    }
    
    // Send notification to client if there are synced items
    if (pendingItems.length > 0) {
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'SYNC_COMPLETE',
          payload: {
            count: pendingItems.length,
            timestamp: new Date().toISOString()
          }
        });
      });
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Sync user preferences with the server
async function syncUserPreferences() {
  try {
    const db = await openDB();
    const preferences = await db.get('userPreferences', 'current');
    
    if (!preferences) return;
    
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences.data)
      });
      
      if (response.ok) {
        preferences.synced = true;
        await db.put('userPreferences', preferences);
        
        // Notify clients about successful sync
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'PREFERENCES_SYNCED',
            payload: { timestamp: new Date().toISOString() }
          });
        });
      }
    } catch (error) {
      console.error('Failed to sync preferences:', error);
    }
  } catch (error) {
    console.error('Background sync for preferences failed:', error);
  }
}

// Handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    
    const options = {
      body: data.message,
      icon: '/notification-icon.png',
      badge: '/notification-badge.png',
      data: {
        url: data.url || '/',
        timestamp: new Date().toISOString(),
        id: data.id
      },
      actions: data.actions || []
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  } catch (error) {
    console.error('Push notification error:', error);
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data.url;
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clientsArr => {
      // Check if a window is already open and focus it
      const hadWindowToFocus = clientsArr.some(windowClient => {
        if (windowClient.url === urlToOpen) {
          return windowClient.focus();
        }
      });
      
      // If no window is open, open a new one
      if (!hadWindowToFocus) {
        self.clients.openWindow(urlToOpen);
      }
    })
  );
});

// Simple IndexedDB wrapper
async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('TradeNavigatorOfflineDB', 1);
    
    request.onupgradeneeded = event => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('pendingCalculations')) {
        db.createObjectStore('pendingCalculations', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('userPreferences')) {
        db.createObjectStore('userPreferences', { keyPath: 'id' });
      }
    };
    
    request.onsuccess = event => resolve({
      get: (store, key) => {
        return new Promise((resolve, reject) => {
          const transaction = event.target.result.transaction(store, 'readonly');
          const objectStore = transaction.objectStore(store);
          const request = objectStore.get(key);
          
          request.onsuccess = e => resolve(e.target.result);
          request.onerror = e => reject(e.target.error);
        });
      },
      getAll: (store) => {
        return new Promise((resolve, reject) => {
          const transaction = event.target.result.transaction(store, 'readonly');
          const objectStore = transaction.objectStore(store);
          const request = objectStore.getAll();
          
          request.onsuccess = e => resolve(e.target.result);
          request.onerror = e => reject(e.target.error);
        });
      },
      put: (store, item) => {
        return new Promise((resolve, reject) => {
          const transaction = event.target.result.transaction(store, 'readwrite');
          const objectStore = transaction.objectStore(store);
          const request = objectStore.put(item);
          
          request.onsuccess = e => resolve(e.target.result);
          request.onerror = e => reject(e.target.error);
        });
      },
      delete: (store, key) => {
        return new Promise((resolve, reject) => {
          const transaction = event.target.result.transaction(store, 'readwrite');
          const objectStore = transaction.objectStore(store);
          const request = objectStore.delete(key);
          
          request.onsuccess = e => resolve();
          request.onerror = e => reject(e.target.error);
        });
      }
    });
    
    request.onerror = event => reject(event.target.error);
  });
}