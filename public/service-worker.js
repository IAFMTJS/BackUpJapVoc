/* global workbox, self, caches, fetch, Promise, Response, Request, IndexedDB */

// Version control
const APP_VERSION = '1.0.0';
const CACHE_NAME = `japvoc-cache-v${APP_VERSION}`;
const DATA_CACHE_NAME = `japvoc-data-v${APP_VERSION}`;
const AUDIO_CACHE_NAME = `japvoc-audio-v${APP_VERSION}`;
const OFFLINE_CACHE_NAME = `japvoc-offline-v${APP_VERSION}`;
const ROMAJI_DATA_URL = '/romaji-data.json';

// Cache configuration
const CACHE_CONFIG = {
  assets: {
    name: CACHE_NAME,
    patterns: [
      /\.(?:js|css|png|jpg|jpeg|gif|svg|ico|webp)$/,
      /^\/icons\//,
      /^\/css\//,
      /^\/js\//,
      /fonts\.googleapis\.com/,
      /fonts\.gstatic\.com/
    ],
    strategy: 'cache-first'
  },
  data: {
    name: DATA_CACHE_NAME,
    patterns: [
      /^\/api\//,
      /^\/data\//,
      /\.json$/
    ],
    strategy: 'network-first'
  },
  audio: {
    name: AUDIO_CACHE_NAME,
    patterns: [/^\/audio\//],
    urls: [
      // START AUTO-GENERATED AUDIO FILES
      '/audio/a7301e6094f19390049008f9f85103453e987c54.mp3',
      // ... existing code ...
      // END AUTO-GENERATED AUDIO FILES
    ]
  },
  offline: {
    name: OFFLINE_CACHE_NAME,
    urls: [
      '/offline.html',
      '/icons/offline-icon.png',
      '/css/offline.css'
    ],
    strategy: 'cache-first'
  }
};

// Database configuration
const DB_NAME = 'JapVocDB';
const DB_VERSION = 9;

// Import push notification handler
importScripts('/push-handler.js');

// Cache management utilities
const CacheManager = {
  async preloadCriticalAssets() {
    const criticalAssets = [
      '/css/critical.css',
      '/js/critical.js',
      '/icons/icon-192x192.png',
      '/icons/icon-512x512.png'
    ];

    const cache = await caches.open(CACHE_NAME);
    await Promise.all(
      criticalAssets.map(url => 
        cache.add(url).catch(err => console.warn(`Failed to preload ${url}:`, err))
      )
    );
  },

  async cleanupOldCaches() {
    const cacheNames = await caches.keys();
    const currentCaches = [CACHE_NAME, DATA_CACHE_NAME, AUDIO_CACHE_NAME, OFFLINE_CACHE_NAME];
    
    await Promise.all(
      cacheNames
        .filter(name => !currentCaches.includes(name))
        .map(name => caches.delete(name))
    );
  },

  async updateCacheVersion() {
    const cache = await caches.open(CACHE_NAME);
    const response = await fetch('/version.json');
    const version = await response.json();
    await cache.put('/version.json', new Response(JSON.stringify(version)));
  }
};

// Offline support utilities
const OfflineManager = {
  async getOfflineResponse(request) {
    const cache = await caches.open(OFFLINE_CACHE_NAME);
    const offlineResponse = await cache.match('/offline.html');
    
    if (request.headers.get('accept').includes('application/json')) {
      return new Response(JSON.stringify({
        error: 'offline',
        message: 'You are currently offline. Please check your connection.',
        timestamp: Date.now()
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return offlineResponse;
  },

  async handleOfflineRequest(request) {
    try {
      const response = await fetch(request);
      if (!response.ok) throw new Error('Network response was not ok');
      return response;
    } catch (error) {
      console.log('Offline request failed:', request.url);
      return this.getOfflineResponse(request);
    }
  }
};

// Database connection management
let dbConnection = null;
let connectionPromise = null;

// Database helpers
async function openDatabase() {
  // If we already have a connection, return it
  if (dbConnection) {
    return dbConnection;
  }

  // If we have a pending connection, wait for it
  if (connectionPromise) {
    return connectionPromise;
  }

  // Create a new connection
  connectionPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => {
      connectionPromise = null;
      reject(request.error);
    };

    request.onsuccess = () => {
      dbConnection = request.result;
      connectionPromise = null;
      resolve(dbConnection);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create stores if they don't exist
      if (!db.objectStoreNames.contains('pendingChanges')) {
        db.createObjectStore('pendingChanges', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'userId' });
      }
    };

    // Handle connection close
    request.result.onclose = () => {
      dbConnection = null;
      connectionPromise = null;
    };
  });

  return connectionPromise;
}

// Get pending changes
async function getPendingChanges(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingChanges'], 'readonly');
    const store = transaction.objectStore('pendingChanges');
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Mark change as synced
async function markChangeAsSynced(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingChanges'], 'readwrite');
    const store = transaction.objectStore('pendingChanges');
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Cache management
const CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/static/js/main.js',
  '/static/css/main.css',
  '/static/media/logo.svg'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', (event) => {
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

// Request handling function
async function handleRequest(request) {
  // Skip cross-origin requests
  if (!request.url.startsWith(self.location.origin)) {
    return fetch(request);
  }

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return fetch(request);
  }

  try {
    // Check cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Try network request
    const networkResponse = await fetch(request);
    
    // Don't cache if not a success response
    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
      return networkResponse;
    }

    // Cache the response
    const responseToCache = networkResponse.clone();
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, responseToCache);

    return networkResponse;
  } catch (error) {
    console.error('Fetch failed:', error);
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    // Return offline response for API requests
    if (request.url.includes('/api/')) {
      return new Response(JSON.stringify({
        error: 'offline',
        message: 'You are currently offline. Please check your connection.',
        timestamp: Date.now()
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    throw error;
  }
}

// Update fetch event listener
self.addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

// Add a function to notify clients about updates
const notifyClientsAboutUpdate = async () => {
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    try {
      client.postMessage({ type: 'UPDATE_AVAILABLE' });
    } catch (error) {
      console.error('Failed to notify client about update:', error);
    }
  });
};

// Update the main install event listener
self.addEventListener('install', event => {
  console.log('Service worker installing...');
  event.waitUntil(
    Promise.all([
      // Skip waiting to activate immediately
      self.skipWaiting(),
      // Preload critical assets
      CacheManager.preloadCriticalAssets(),
      // Update cache version
      CacheManager.updateCacheVersion()
    ]).then(() => {
      console.log('Service worker installed successfully');
    }).catch(error => {
      console.error('Service worker installation failed:', error);
    })
  );
});

// Update the main activate event listener
self.addEventListener('activate', event => {
  console.log('Service worker activating...');
  event.waitUntil(
    Promise.all([
      // Take control of all clients immediately
      self.clients.claim(),
      // Clean up old caches
      CacheManager.cleanupOldCaches()
    ]).then(() => {
      console.log('Service worker activated successfully');
      // Notify clients about the update
      notifyClientsAboutUpdate();
    }).catch(error => {
      console.error('Service worker activation failed:', error);
    })
  );
});

// Add a function to handle font fetching with retries
const fetchFontWithRetry = async (url, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        credentials: 'omit',
        mode: 'cors',
        cache: 'no-cache'
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response;
    } catch (error) {
      console.warn(`Font fetch attempt ${i + 1} failed for ${url}:`, error);
      if (i === retries - 1) {
        // On last retry, return null instead of throwing
        console.warn(`All font fetch attempts failed for ${url}`);
        return null;
      }
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  return null;
};

// Update the font caching strategy
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('fonts.googleapis.com') || 
      event.request.url.includes('fonts.gstatic.com')) {
    event.respondWith(
      (async () => {
        try {
          // Try to get from cache first
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }

          // If not in cache, fetch with retry
          const response = await fetchFontWithRetry(event.request.url);
          if (!response) {
            // If font fetch fails, return a fallback response
            return new Response('', {
              status: 200,
              headers: new Headers({
                'Content-Type': 'text/css',
                'Cache-Control': 'no-cache'
              })
            });
          }

          // Cache the successful response
          const cache = await caches.open('font-cache');
          await cache.put(event.request, response.clone());
          return response;
        } catch (error) {
          console.warn('Font fetch error:', error);
          // Return a fallback response instead of throwing
          return new Response('', {
            status: 200,
            headers: new Headers({
              'Content-Type': 'text/css',
              'Cache-Control': 'no-cache'
            })
          });
        }
      })()
    );
  }
});

// Add message handling
self.addEventListener('message', (event) => {
  if (!event.data) return;

  switch (event.data.type) {
    case 'SKIP_WAITING':
      console.log('Skipping waiting...');
      self.skipWaiting();
      break;
    case 'CLIENT_UNLOADING':
      console.log('Client unloading:', event.data.clientId);
      break;
    default:
      console.log('Unknown message type:', event.data.type);
  }
});

// Add error handling
self.addEventListener('error', (event) => {
  console.error('Service worker error:', event.error);
  notifyClientsAboutUpdate();
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled rejection in service worker:', event.reason);
  notifyClientsAboutUpdate();
});

// Background sync
self.addEventListener('sync', async (event) => {
  if (event.tag === 'sync-changes') {
    try {
      const db = await openDatabase();
      const changes = await getPendingChanges(db);
      
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
          
          await markChangeAsSynced(db, change.id);
        } catch (error) {
          console.error('Error syncing change:', error);
        }
      }
    } catch (error) {
      console.error('Error in background sync:', error);
    }
  }
});

// Audio conversion utilities
function audioBufferToWav(buffer) {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  
  const dataLength = buffer.length * numChannels * bytesPerSample;
  const bufferLength = 44 + dataLength;
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);
  
  // Write WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);
  
  // Write audio data
  const offset = 44;
  const channelData = [];
  for (let i = 0; i < numChannels; i++) {
    channelData.push(buffer.getChannelData(i));
  }
  
  let pos = 0;
  while (pos < buffer.length) {
    for (let i = 0; i < numChannels; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i][pos]));
      const value = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset + pos * blockAlign + i * bytesPerSample, value, true);
    }
    pos++;
  }
  
  return arrayBuffer;
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

async function convertToMp3(wavBlob, bitrate) {
  // For now, return the WAV blob as we don't have MP3 conversion
  // In a real implementation, you would use a library like lamejs
  return wavBlob;
}

// Custom TimestampTrigger polyfill
class TimestampTrigger {
  constructor(timestamp) {
    this.timestamp = timestamp;
  }
}

// Add audio optimization configuration
const AUDIO_OPTIMIZATION = {
  high: {
    bitrate: '128k',
    sampleRate: 44100
  },
  low: {
    bitrate: '64k',
    sampleRate: 22050
  }
};

// Add audio optimization function
async function optimizeAudio(audioBlob, quality = 'high') {
  const config = AUDIO_OPTIMIZATION[quality];
  
  // Create an audio context
  const audioContext = new AudioContext({ sampleRate: config.sampleRate });
  
  try {
    // Decode the audio data
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // Create a new buffer with the target sample rate
    const offlineContext = new OfflineAudioContext(
      audioBuffer.numberOfChannels,
      audioBuffer.duration * config.sampleRate,
      config.sampleRate
    );
    
    // Create a source node
    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineContext.destination);
    source.start();
    
    // Render the audio
    const renderedBuffer = await offlineContext.startRendering();
    
    // Convert to blob with appropriate bitrate
    const wavBlob = await new Promise(resolve => {
      const wav = audioBufferToWav(renderedBuffer);
      resolve(new Blob([wav], { type: 'audio/wav' }));
    });
    
    // Convert to MP3 with specified bitrate
    const mp3Blob = await convertToMp3(wavBlob, config.bitrate);
    
    return mp3Blob;
  } finally {
    audioContext.close();
  }
}

// Add helper function to get user's preferred audio quality
async function getAudioQuality() {
  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    const settings = await cache.match('/audio-settings.json');
    if (settings) {
      const data = await settings.json();
      return data.quality || 'high';
    }
  } catch (error) {
    console.error('[Service Worker] Failed to get audio quality settings:', error);
  }
  return 'high'; // Default to high quality
}

// Enhanced sync handling
class SyncManager {
  static async syncWithRetry(syncFunction, attempt = 1) {
    const MAX_ATTEMPTS = 3;
    const BACKOFF_MULTIPLIER = 2;
    const INITIAL_DELAY = 1000;

    try {
      await syncFunction();
    } catch (error) {
      if (attempt < MAX_ATTEMPTS) {
        const delay = INITIAL_DELAY * Math.pow(BACKOFF_MULTIPLIER, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.syncWithRetry(syncFunction, attempt + 1);
      }
      throw error;
    }
  }

  static async handleSync(event) {
    const { tag } = event;
    
    switch (tag) {
      case 'sync-vocabulary':
        await this.syncWithRetry(syncVocabulary);
        break;
      case 'sync-progress':
        await this.syncWithRetry(syncProgress);
        break;
      case 'sync-settings':
        await this.syncWithRetry(syncSettings);
        break;
      default:
        console.warn('Unknown sync tag:', tag);
    }
  }
}

// Update service worker event listeners
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      CacheManager.preloadCriticalAssets(),
      CacheManager.updateCacheVersion()
    ])
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      CacheManager.cleanupOldCaches(),
      clients.claim()
    ])
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

self.addEventListener('sync', event => {
  event.waitUntil(SyncManager.handleSync(event));
});

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-vocabulary') {
    event.waitUntil(syncVocabulary());
  }
});

async function syncVocabulary() {
  const db = await openDatabase();
  const pendingItems = await db.getAll('pendingVocabulary');
  
  for (const item of pendingItems) {
    try {
      const response = await fetch('/api/vocabulary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item.data)
      });
      
      if (response.ok) {
        await db.delete('pendingVocabulary', item.id);
      }
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
}

// Sync progress data
async function syncProgress() {
  const db = await openDatabase();
  const pendingProgress = await db.getAll('pendingProgress');
  
  for (const item of pendingProgress) {
    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item.data)
      });
      
      if (response.ok) {
        await db.delete('pendingProgress', item.id);
        // Notify the client of successful sync
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'SYNC_COMPLETE',
              payload: { type: 'progress', id: item.id }
            });
          });
        });
      }
    } catch (error) {
      console.error('Progress sync failed:', error);
      throw error; // Let the retry mechanism handle it
    }
  }
}

// Sync settings
async function syncSettings() {
  const db = await openDatabase();
  const pendingSettings = await db.getAll('pendingSettings');
  
  for (const item of pendingSettings) {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item.data)
      });
      
      if (response.ok) {
        await db.delete('pendingSettings', item.id);
        // Update local settings cache
        const cache = await caches.open(DATA_CACHE_NAME);
        await cache.put('/settings.json', response.clone());
      }
    } catch (error) {
      console.error('Settings sync failed:', error);
      throw error;
    }
  }
}

// Periodic sync for background updates
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-vocabulary') {
    event.waitUntil(updateVocabularyCache());
  }
});

// Update vocabulary cache periodically
async function updateVocabularyCache() {
  try {
    const response = await fetch('/api/vocabulary/updates');
    if (!response.ok) throw new Error('Failed to fetch vocabulary updates');
    
    const updates = await response.json();
    const cache = await caches.open(DATA_CACHE_NAME);
    
    // Update cache with new vocabulary
    for (const item of updates) {
      await cache.put(`/vocabulary/${item.id}.json`, new Response(JSON.stringify(item)));
    }
    
    // Notify clients of the update
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'VOCABULARY_UPDATED',
          payload: { count: updates.length }
        });
      });
    });
  } catch (error) {
    console.error('Failed to update vocabulary cache:', error);
  }
}

// Add missing syncRomajiData function
async function syncRomajiData() {
  try {
    const response = await fetch(ROMAJI_DATA_URL);
    if (!response.ok) throw new Error(`Failed to fetch romaji data: ${response.status}`);
    
    const cache = await caches.open(DATA_CACHE_NAME);
    await cache.put(ROMAJI_DATA_URL, response.clone());
    
    // Notify clients of the update
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'ROMAJI_DATA_UPDATED'
        });
      });
    });
  } catch (error) {
    console.error('Failed to sync romaji data:', error);
    throw error;
  }
}