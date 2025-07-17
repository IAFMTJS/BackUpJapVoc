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
      '/offline.html',
      '/version.json',
      '/manifest.json',
      '/index.html'
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
    try {
      const cache = await caches.open(CACHE_NAME);
      const response = await fetch('/version.json');
      const version = await response.json();
      await cache.put('/version.json', new Response(JSON.stringify(version)));
    } catch (error) {
      console.warn('Failed to update cache version:', error);
    }
  }
};

// Offline support utilities
const OfflineManager = {
  async getOfflineResponse(request) {
    const cache = await caches.open(OFFLINE_CACHE_NAME);
    const offlineResponse = await cache.match('/offline.html');
    
    if (request.headers.get('accept')?.includes('application/json')) {
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

// Install event listener
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

// Activate event listener
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

// Fetch event listener
self.addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  // Add validation to prevent undefined message type errors
  if (!event.data || typeof event.data.type === 'undefined') {
    console.log('Received message without type:', event.data);
    return;
  }

  switch (event.data.type) {
    case 'SKIP_WAITING':
      console.log('Skip waiting requested');
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
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
      view.setInt16(offset + (i * numChannels + channel) * 2, sample * 0x7FFF, true);
    }
  }
  
  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

async function convertToMp3(wavBlob, bitrate) {
  // This would require a Web Audio API implementation
  // For now, return the WAV blob
  return wavBlob;
}

class TimestampTrigger {
  constructor(timestamp) {
    this.timestamp = timestamp;
  }
  
  shouldTrigger() {
    return Date.now() >= this.timestamp;
  }
}

async function optimizeAudio(audioBlob, quality = 'high') {
  const arrayBuffer = await audioBlob.arrayBuffer();
  const audioContext = new OfflineAudioContext(1, 44100 * 60, 44100); // 1 minute max
  
  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
    
    const renderedBuffer = await audioContext.startRendering();
    return audioBufferToWav(renderedBuffer);
  } catch (error) {
    console.error('Audio optimization failed:', error);
    return audioBlob;
  }
}

async function getAudioQuality() {
  // Check device capabilities
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const sampleRate = audioContext.sampleRate;
  
  if (sampleRate >= 48000) return 'high';
  if (sampleRate >= 44100) return 'medium';
  return 'low';
}

class SyncManager {
  static async syncWithRetry(syncFunction, attempt = 1) {
    try {
      return await syncFunction();
    } catch (error) {
      if (attempt < 3) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        return this.syncWithRetry(syncFunction, attempt + 1);
      }
      throw error;
    }
  }
  
  static async handleSync(event) {
    try {
      const db = await openDatabase();
      const changes = await getPendingChanges(db);
      
      for (const change of changes) {
        await this.syncWithRetry(async () => {
          const response = await fetch('/api/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(change.data)
          });
          
          if (!response.ok) {
            throw new Error(`Sync failed: ${response.status}`);
          }
          
          await markChangeAsSynced(db, change.id);
        });
      }
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
}

// Sync functions
async function syncVocabulary() {
  try {
    const db = await openDatabase();
    const response = await fetch('/api/vocabulary');
    const vocabulary = await response.json();
    
    // Store in IndexedDB
    const transaction = db.transaction(['vocabulary'], 'readwrite');
    const store = transaction.objectStore('vocabulary');
    await store.clear();
    
    for (const word of vocabulary) {
      await store.add(word);
    }
  } catch (error) {
    console.error('Vocabulary sync failed:', error);
  }
}

async function syncProgress() {
  try {
    const db = await openDatabase();
    const response = await fetch('/api/progress');
    const progress = await response.json();
    
    // Store in IndexedDB
    const transaction = db.transaction(['progress'], 'readwrite');
    const store = transaction.objectStore('progress');
    await store.clear();
    
    for (const item of progress) {
      await store.add(item);
    }
  } catch (error) {
    console.error('Progress sync failed:', error);
  }
}

async function syncSettings() {
  try {
    const db = await openDatabase();
    const response = await fetch('/api/settings');
    const settings = await response.json();
    
    // Store in IndexedDB
    const transaction = db.transaction(['settings'], 'readwrite');
    const store = transaction.objectStore('settings');
    await store.clear();
    
    for (const setting of settings) {
      await store.add(setting);
    }
  } catch (error) {
    console.error('Settings sync failed:', error);
  }
}

async function updateVocabularyCache() {
  try {
    const response = await fetch('/api/vocabulary/cache');
    const cache = await response.json();
    
    const cacheStorage = await caches.open(DATA_CACHE_NAME);
    await cacheStorage.put('/api/vocabulary/cache', new Response(JSON.stringify(cache)));
  } catch (error) {
    console.error('Vocabulary cache update failed:', error);
  }
}

async function syncRomajiData() {
  try {
    const response = await fetch(ROMAJI_DATA_URL);
    const romajiData = await response.json();
    
    const cache = await caches.open(DATA_CACHE_NAME);
    await cache.put(ROMAJI_DATA_URL, new Response(JSON.stringify(romajiData)));
  } catch (error) {
    console.error('Romaji data sync failed:', error);
  }
}