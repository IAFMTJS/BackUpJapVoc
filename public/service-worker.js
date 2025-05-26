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
      /^\/js\//
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

// Database setup
const DB_NAME = 'japvoc-db';
const DB_VERSION = 1;

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

// Enhanced request handling
async function handleRequest(request) {
  try {
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
      return fetch(request);
    }

    // Handle API requests
    if (url.pathname.startsWith('/api/')) {
      return await handleApiRequest(request);
    }

    // Handle static assets
    if (CACHE_CONFIG.assets.patterns.some(pattern => pattern.test(url.pathname))) {
      return await handleAssetRequest(request);
    }

    // Handle audio files
    if (CACHE_CONFIG.audio.patterns.some(pattern => pattern.test(url.pathname))) {
      return await handleAudioRequest(request);
    }

    // Default to network-first for other requests
    return await networkFirst(request);
  } catch (error) {
    console.error('[Service Worker] Error handling request:', error);
    return new Response(
      JSON.stringify({ 
        error: 'service_worker_error',
        message: 'An error occurred while processing your request.',
        timestamp: Date.now()
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

async function handleApiRequest(request) {
  try {
    const cache = await caches.open(DATA_CACHE_NAME);
    const cachedResponse = await cache.match(request);

    // Try network first
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        // Cache the successful response
        await cache.put(request, networkResponse.clone());
        return networkResponse;
      }
      throw new Error(`Network response was not ok: ${networkResponse.status}`);
    } catch (error) {
      // If network fails and we have a cached response, use it
      if (cachedResponse) {
        return cachedResponse;
      }
      // If no cache and offline, return offline response
      if (!navigator.onLine) {
        return new Response(
          JSON.stringify({ 
            error: 'offline',
            message: 'You are currently offline. Please check your connection.',
            timestamp: Date.now()
          }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('[Service Worker] API request error:', error);
    throw error;
  }
}

async function handleAssetRequest(request) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      // Update cache in background if online
      if (navigator.onLine) {
        fetch(request).then(async response => {
          if (response.ok) {
            await cache.put(request, response);
          }
        }).catch(() => {});
      }
      return cachedResponse;
    }

    // If not in cache, try network
    if (navigator.onLine) {
      const response = await fetch(request);
      if (response.ok) {
        await cache.put(request, response.clone());
        return response;
      }
    }

    // If offline and no cache, return offline page for HTML requests
    if (request.headers.get('accept').includes('text/html')) {
      return await caches.match('/offline.html');
    }

    throw new Error('Asset not available offline');
  } catch (error) {
    console.error('[Service Worker] Asset request error:', error);
    throw error;
  }
}

async function handleAudioRequest(request) {
  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    const quality = await getAudioQuality();
    
    // Try cache first
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      // Update cache in background if online
      if (navigator.onLine) {
        fetch(request).then(async response => {
          if (response.ok) {
            const blob = await response.blob();
            const optimizedBlob = await optimizeAudio(blob, quality);
            await cache.put(request, new Response(optimizedBlob));
          }
        }).catch(() => {});
      }
      return cachedResponse;
    }

    // If not in cache and online, fetch and optimize
    if (navigator.onLine) {
      const response = await fetch(request);
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.status}`);
      }

      const blob = await response.blob();
      const optimizedBlob = await optimizeAudio(blob, quality);
      const optimizedResponse = new Response(optimizedBlob);
      
      await cache.put(request, optimizedResponse.clone());
      return optimizedResponse;
    }

    // If offline and not in cache, return fallback
    return new Response(
      JSON.stringify({ 
        error: 'offline',
        message: 'Audio not available offline. Using text-to-speech as fallback.',
        timestamp: Date.now()
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('[Service Worker] Audio request error:', error);
    throw error;
  }
}

async function networkFirst(request) {
  try {
    if (navigator.onLine) {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, networkResponse.clone());
        return networkResponse;
      }
    }

    // If network fails or offline, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // If no cache and HTML request, return offline page
    if (request.headers.get('accept').includes('text/html')) {
      return await caches.match('/offline.html');
    }

    throw new Error('Resource not available');
  } catch (error) {
    console.error('[Service Worker] Network-first request error:', error);
    throw error;
  }
}

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

// Modify the install event handler
self.addEventListener('install', (event) => {
  console.log('Service worker installing...');
  // Skip waiting to activate immediately
  event.waitUntil(
    Promise.all([
      self.skipWaiting(),
      // Clear old caches
      caches.keys().then(cacheNames => 
        Promise.all(cacheNames.map(name => caches.delete(name)))
      )
    ]).then(() => {
      console.log('Service worker installed and caches cleared');
      notifyClientsAboutUpdate();
    })
  );
});

// Modify the activate event handler
self.addEventListener('activate', (event) => {
  console.log('Service worker activating...');
  event.waitUntil(
    Promise.all([
      // Take control of all clients immediately
      self.clients.claim(),
      // Clear old caches again to be sure
      caches.keys().then(cacheNames => 
        Promise.all(cacheNames.map(name => caches.delete(name)))
      )
    ]).then(() => {
      console.log('Service worker activated and claimed clients');
      notifyClientsAboutUpdate();
    })
  );
});

// Add error handling for fetch events
self.addEventListener('fetch', (event) => {
  event.respondWith(
    (async () => {
      try {
        // Try network first
        const networkResponse = await fetch(event.request);
        if (networkResponse.ok) {
          // Cache the successful response
          const cache = await caches.open(CACHE_NAME);
          await cache.put(event.request, networkResponse.clone());
          return networkResponse;
        }
        throw new Error('Network response was not ok');
      } catch (error) {
        console.log('Network request failed, trying cache:', error);
        // Try cache if network fails
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        // If both network and cache fail, return a fallback
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        throw error;
      }
    })()
  );
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
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// Sync data with server
async function syncData() {
  try {
    const db = await openDatabase();
    const pendingChanges = await getPendingChanges(db);
    
    for (const change of pendingChanges) {
      try {
        await fetch(change.url, {
          method: change.method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await getAuthToken()}`
          },
          body: JSON.stringify(change.data)
        });
        
        await markChangeAsSynced(db, change.id);
      } catch (error) {
        console.error('Error syncing change:', error);
      }
    }
  } catch (error) {
    console.error('Error in background sync:', error);
  }
}

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
    const request = indexedDB.open('JapVocDB', 1);
    
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
        db.createObjectStore('settings');
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

async function getPendingChanges(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingChanges'], 'readonly');
    const store = transaction.objectStore('pendingChanges');
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function markChangeAsSynced(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingChanges'], 'readwrite');
    const store = transaction.objectStore('pendingChanges');
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function getAuthToken() {
  return new Promise((resolve) => {
    const request = indexedDB.open('JapVocDB', 1);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      const getRequest = store.get('authToken');
      
      getRequest.onsuccess = () => resolve(getRequest.result || '');
      getRequest.onerror = () => resolve('');
    };
    
    request.onerror = () => resolve('');
  });
}

// Open IndexedDB
async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object stores
      if (!db.objectStoreNames.contains('pendingVocabulary')) {
        db.createObjectStore('pendingVocabulary', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('pendingProgress')) {
        db.createObjectStore('pendingProgress', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('pendingSettings')) {
        db.createObjectStore('pendingSettings', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

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
  const db = await openDB();
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
  const db = await openDB();
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
  const db = await openDB();
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