import { getDatabase, addToStore, getFromStore, updateInStore, deleteFromStore, clearStore, StoreName } from './utils/databaseConfig';

// Cache configuration
const CACHE_NAME = 'japvoc-cache-v1';
const CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/static/js/main.js',
  '/static/css/main.css',
  '/static/media/logo.svg'
];

// Database operations
async function getPendingChanges() {
  try {
    const db = await getDatabase();
    const tx = db.transaction('pendingSync', 'readonly');
    const index = tx.store.index('by-synced');
    return index.getAll(false);
  } catch (error) {
    console.error('Error getting pending changes:', error);
    throw error;
  }
}

async function markChangeAsSynced(id: string) {
  try {
    const item = await getFromStore('pendingSync', id);
    if (item) {
      await updateInStore('pendingSync', { ...item, synced: true });
    }
  } catch (error) {
    console.error('Error marking change as synced:', error);
    throw error;
  }
}

// Background sync handler
self.addEventListener('sync', async (event: SyncEvent) => {
  if (event.tag === 'sync-changes') {
    try {
      const changes = await getPendingChanges();
      
      for (const change of changes) {
        try {
          // Attempt to sync the change
          const response = await fetch('/api/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(change.data)
          });
          
          if (!response.ok) {
            throw new Error(`Sync failed with status ${response.status}`);
          }
          
          await markChangeAsSynced(change.id);
        } catch (error) {
          console.error('Error syncing change:', error);
        }
      }
    } catch (error) {
      console.error('Error in background sync:', error);
    }
  }
});

// Cache management
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event: FetchEvent) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }

        return fetch(event.request)
          .then(response => {
            // Don't cache if not a success response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          });
      })
      .catch(error => {
        console.error('Fetch failed:', error);
        // Return a fallback response if available
        return caches.match('/offline.html');
      })
  );
}); 