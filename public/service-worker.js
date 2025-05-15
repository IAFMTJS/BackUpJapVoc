/* global workbox, self, caches, fetch, Promise, Response, Request, IndexedDB */

// Version control
const APP_VERSION = '1.0.0';
const CACHE_NAME = `japvoc-cache-v${APP_VERSION}`;
const DATA_CACHE_NAME = `japvoc-data-v${APP_VERSION}`;
const ROMAJI_DATA_URL = '/romaji-data.json';

// Cache configuration
const CACHE_CONFIG = {
  assets: {
    name: CACHE_NAME,
    urls: [
      '/',
      '/index.html',
      '/manifest.json',
      '/offline.html',
      '/romaji-data.json'
    ],
    strategy: 'cache-first'
  },
  data: {
    name: DATA_CACHE_NAME,
    urls: [ROMAJI_DATA_URL],
    strategy: 'stale-while-revalidate'
  }
};

// Sync configuration
const SYNC_CONFIG = {
  tags: {
    progress: 'sync-progress',
    romaji: 'sync-romaji-data'
  },
  retry: {
    maxAttempts: 3,
    backoff: {
      initial: 1000,
      multiplier: 2
    }
  }
};

// Install event - cache initial assets and data
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing version:', APP_VERSION);
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(CACHE_CONFIG.assets.name).then(async cache => {
        console.log('[Service Worker] Caching static assets...');
        const urls = CACHE_CONFIG.assets.urls;
        const results = await Promise.allSettled(
          urls.map(url => 
            fetch(url)
              .then(response => {
                if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
                return cache.put(url, response);
              })
              .catch(error => {
                console.warn(`[Service Worker] Failed to cache ${url}:`, error);
                return null;
              })
          )
        );
        
        const failed = results.filter(r => r.status === 'rejected');
        if (failed.length > 0) {
          console.warn('[Service Worker] Some assets failed to cache:', failed);
        }
        return results;
      }),
      
      // Cache initial data
      caches.open(CACHE_CONFIG.data.name).then(async cache => {
        console.log('[Service Worker] Caching initial data...');
        try {
          const response = await fetch(ROMAJI_DATA_URL);
          if (!response.ok) throw new Error(`Failed to fetch romaji data: ${response.status}`);
          await cache.put(ROMAJI_DATA_URL, response);
          console.log('[Service Worker] Successfully cached romaji data');
        } catch (error) {
          console.warn('[Service Worker] Failed to cache romaji data:', error);
        }
      })
    ]).then(() => {
      console.log('[Service Worker] Cache operations completed');
      return self.skipWaiting();
    }).catch(error => {
      console.error('[Service Worker] Cache operation failed:', error);
      // Don't throw here, allow the service worker to activate even if caching fails
    })
  );
});

// Activate event - clean up old caches and take control
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating version:', APP_VERSION);
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (!Object.values(CACHE_CONFIG).some(config => config.name === cacheName)) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Take control of all clients
      self.clients.claim()
    ]).then(() => {
      console.log('[Service Worker] Activation complete');
      // Check for pending syncs
      return self.registration.sync.getTags().then(tags => {
        if (tags.includes(SYNC_CONFIG.tags.progress)) {
          return syncPendingProgress();
        }
      });
    })
  );
});

// Enhanced fetch handler with better caching strategies
self.addEventListener('fetch', (event) => {
  // Don't intercept requests for the service worker itself
  if (event.request.url.endsWith('service-worker.js')) {
    return;
  }
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip requests in development mode
  if (self.location.hostname === 'localhost') {
    return;
  }

  // Handle different types of requests
  if (event.request.url.includes(ROMAJI_DATA_URL)) {
    event.respondWith(handleRomajiDataRequest(event.request));
  } else if (event.request.url.includes('/api/')) {
    event.respondWith(handleApiRequest(event.request));
  } else {
    event.respondWith(handleAssetRequest(event.request));
  }
});

// Handle romaji data requests with stale-while-revalidate strategy
async function handleRomajiDataRequest(request) {
  const cache = await caches.open(CACHE_CONFIG.data.name);
  
  try {
    // Try to serve from cache first
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log('[Service Worker] Serving romaji data from cache');
      
      // Update cache in background
      fetch(request).then(async response => {
        if (response.ok) {
          await cache.put(request, response.clone());
          console.log('[Service Worker] Updated romaji data cache');
        }
      }).catch(error => {
        console.error('[Service Worker] Failed to update romaji data cache:', error);
      });
      
      return cachedResponse;
    }
    
    // If not in cache, fetch from network
    console.log('[Service Worker] Fetching romaji data from network');
    const response = await fetch(request);
    if (!response.ok) {
      throw new Error(`Failed to fetch romaji data: ${response.status}`);
    }
    
    // Cache the response
    await cache.put(request, response.clone());
    return response;
  } catch (error) {
    console.error('[Service Worker] Error handling romaji data request:', error);
    throw error;
  }
}

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  try {
    // Try network first
    const response = await fetch(request);
    if (response.ok) {
      return response;
    }
    throw new Error(`API request failed: ${response.status}`);
  } catch (error) {
    console.error('[Service Worker] API request failed:', error);
    
    // If offline, try to serve from cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If no cache, return offline response
    return new Response(
      JSON.stringify({ error: 'You are offline and no cached data is available' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle asset requests with network-first strategy in development
async function handleAssetRequest(request) {
  try {
    // Try network first
    const response = await fetch(request);
    if (!response.ok) {
      throw new Error(`Failed to fetch asset: ${response.status}`);
    }

    // Cache successful responses
    const cache = await caches.open(CACHE_CONFIG.assets.name);
    await cache.put(request, response.clone());
    
    return response;
  } catch (error) {
    console.log('[Service Worker] Network request failed, trying cache:', request.url);
    
    // If network fails, try cache
    const cache = await caches.open(CACHE_CONFIG.assets.name);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('[Service Worker] Serving from cache:', request.url);
      return cachedResponse;
    }

    // For HTML requests, return offline page
    if (request.headers.get('accept')?.includes('text/html')) {
      const offlinePage = await cache.match('/offline.html');
      if (offlinePage) {
        return offlinePage;
      } else {
        // If offline.html is missing, return a fallback response
        return new Response('<h1>Offline</h1><p>The application is offline and no offline page is available.</p>', {
          status: 503,
          headers: { 'Content-Type': 'text/html' }
        });
      }
    }

    // If all else fails, throw the error
    throw error;
  }
}

// Enhanced background sync with retry logic
self.addEventListener('sync', (event) => {
  if (event.tag === SYNC_CONFIG.tags.progress) {
    event.waitUntil(syncWithRetry(syncPendingProgress));
  } else if (event.tag === SYNC_CONFIG.tags.romaji) {
    event.waitUntil(syncWithRetry(syncRomajiData));
  }
});

// Retry logic for sync operations
async function syncWithRetry(syncFunction, attempt = 1) {
  try {
    await syncFunction();
  } catch (error) {
    console.error('[Service Worker] Sync attempt failed:', error);
    // Optionally add retry logic here
  }
}