/* global workbox, self, caches, fetch, Promise, Response, Request, IndexedDB */

// Version control
const APP_VERSION = '1.0.0';
const CACHE_NAME = `japvoc-cache-v${APP_VERSION}`;
const DATA_CACHE_NAME = `japvoc-data-v${APP_VERSION}`;
const AUDIO_CACHE_NAME = `japvoc-audio-v${APP_VERSION}`;
const OFFLINE_CACHE_NAME = `japvoc-offline-v${APP_VERSION}`;
const ROMAJI_DATA_URL = '/romaji-data.json';

// Database setup
const DB_NAME = 'japvoc-db';
const DB_VERSION = 1;

// Import push notification handler
importScripts('/push-handler.js');

// Cache configuration
const CACHE_CONFIG = {
  version: '1.0.0',
  assets: {
    name: 'japvoc-assets-v1',
    urls: [
      '/',
      '/index.html',
      '/offline.html',
      '/manifest.json',
      '/icons/icon-192x192.png',
      '/icons/icon-512x512.png',
      '/icons/badge-96x96.png',
      '/icons/achievement-192x192.png',
      '/icons/reminder-192x192.png',
      '/icons/streak-192x192.png',
      '/icons/new-content-192x192.png',
      '/icons/progress-192x192.png',
      '/assets/cityscape.svg',
      '/assets/noise.svg',
      '/assets/torii.svg'
    ]
  },
  data: {
    name: 'japvoc-data-v1',
    urls: [
      '/api/vocabulary',
      '/api/kanji',
      '/api/grammar',
      '/api/achievements'
    ]
  },
  audio: {
    name: 'japvoc-audio-v1',
    urls: []
  },
  offline: {
    name: 'japvoc-offline-v1',
    urls: [
      '/offline.html'
    ]
  }
};

// Cache management
const CacheManager = {
  async preloadCriticalAssets() {
    const cache = await caches.open(CACHE_CONFIG.assets.name);
    await cache.addAll(CACHE_CONFIG.assets.urls);
  },

  async cleanupOldCaches() {
    const cacheNames = await caches.keys();
    const currentCaches = Object.values(CACHE_CONFIG).map(config => config.name);
    
    await Promise.all(
      cacheNames
        .filter(name => !currentCaches.includes(name))
        .map(name => caches.delete(name))
    );
  },

  async updateCacheVersion() {
    const cache = await caches.open(CACHE_CONFIG.assets.name);
    const response = await cache.match('/version.json');
    
    if (response) {
      const data = await response.json();
      if (data.version !== CACHE_CONFIG.version) {
        await this.cleanupOldCaches();
        await this.preloadCriticalAssets();
      }
    }
  }
};

// Offline support
const OfflineManager = {
  async getOfflineResponse(request) {
    const cache = await caches.open(CACHE_CONFIG.offline.name);
    const offlineResponse = await cache.match('/offline.html');
    
    if (offlineResponse) {
      return new Response(offlineResponse.body, {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' }
    });
  },

  async handleOfflineRequest(request) {
    try {
      // Try to get from cache first
      const cache = await caches.match(request);
      if (cache) return cache;

      // If not in cache, try network
      const response = await fetch(request);
      
      // Cache the response if it's successful
      if (response.ok) {
        const cache = await caches.open(
          request.url.includes('/api/') ? CACHE_CONFIG.data.name :
          request.url.includes('/audio/') ? CACHE_CONFIG.audio.name :
          CACHE_CONFIG.assets.name
        );
        cache.put(request, response.clone());
      }
      
      return response;
    } catch (error) {
      // If offline, return offline page for HTML requests
      if (request.headers.get('accept').includes('text/html')) {
        return this.getOfflineResponse(request);
      }
      throw error;
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
    const cache = await caches.open(CACHE_CONFIG.data.name);
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
    const cache = await caches.open(CACHE_CONFIG.assets.name);
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
    const cache = await caches.open(CACHE_CONFIG.audio.name);
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
        const cache = await caches.open(CACHE_CONFIG.assets.name);
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

// Service worker event listeners
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      CacheManager.preloadCriticalAssets(),
      CacheManager.updateCacheVersion()
    ])
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      CacheManager.cleanupOldCaches(),
      clients.claim()
    ])
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
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

// Enhanced cache configuration
const CACHE_CONFIG = {
  assets: {
    name: CACHE_NAME,
    urls: [
      '/',
      '/index.html',
      '/manifest.json',
      '/offline.html',
      '/romaji-data.json',
      '/version.json',
      '/_headers',
      '/_redirects'
    ],
    strategy: 'cache-first',
    patterns: [
      /\.(js|css|png|jpg|jpeg|gif|svg|woff2?|ttf|eot)$/,
      /^\/icons\//,
      /^\/splash\//
    ]
  },
  data: {
    name: DATA_CACHE_NAME,
    urls: [ROMAJI_DATA_URL],
    strategy: 'stale-while-revalidate',
    patterns: [
      /^\/api\/vocabulary/,
      /^\/api\/progress/,
      /^\/api\/settings/
    ]
  },
  audio: {
    name: AUDIO_CACHE_NAME,
    strategy: 'cache-first',
    patterns: ['/audio/'],
    preCacheUrls: [
      // BEGIN AUTO-GENERATED AUDIO FILES
      '/audio/35c470fc44f701e2b13e6853b010716330f233e8.mp3',
      '/audio/1bc30944cc7b4277e636fd02fcf44b9176cdb70f.mp3',
      '/audio/7952955d07ebd7be5572274b649902e395186f8b.mp3',
      '/audio/5ef30d1d7674c4dcde3406bdbf7342effbfe0ef4.mp3',
      '/audio/ff0654738483d03489f1d80aaf29216fd2038780.mp3',
      '/audio/aa903f64a63bc06e222d2b55a65ee0428e05e217.mp3',
      '/audio/4141f79900d07f635e8f5198ab3e2852af5a0b28.mp3',
      '/audio/9b2d0130eeac92ee317db7cd73000f90791abf67.mp3',
      '/audio/6cf53d8c43f014582debec85c8341be4a23a62ec.mp3',
      '/audio/f65e8a1b890dc04d72d82474a683a9ac235d2b7d.mp3',
      '/audio/a36d79b74219bbd075189eeb82390646796e504f.mp3',
      '/audio/d7051e23dec3ac7d79b123517aceb93afdb006a6.mp3',
      '/audio/ed255082b606949fa00a2ca4e580948d2785286e.mp3',
      '/audio/2e47f556b0e1fab54a0b26d92fd838ce969480b2.mp3',
      '/audio/1feefc999d9808abb3255018883aeed47ffb4893.mp3',
      '/audio/79b34510edac86355c26310b32253beb0568d1d9.mp3',
      '/audio/a7301e6094f19390049008f9f85103453e987c54.mp3',
      '/audio/487041462ad515d2ee1c6a71188ea1051c49cb22.mp3',
      '/audio/6f32e6c9158f189bf5037215e8ce6522e9b42186.mp3',
      '/audio/dde518278804306aa84b37b883831c4b2421965b.mp3',
      '/audio/4811df85fff06322d7cecefada6c3d39c24afaae.mp3',
      '/audio/3cd52ede9ebbb99fcfe8e9f67bb0abfe8e203a21.mp3',
      '/audio/b552053e2e5fcf7bbb695b8c780cbd6274d64dec.mp3',
      '/audio/9f16efc178cbd84674b839bb6d3107a79ece19e5.mp3',
      '/audio/fb7a441e6291175a6621ebf63290c0f664daf45c.mp3',
      '/audio/7d85370b42097f8cbe0c5083b2e119f2a26c0a69.mp3',
      '/audio/efcd4348742a6f05d4641e2f366bf4c69c9dea5c.mp3',
      '/audio/7083027eb78f3d53786e25a4d98a507e0bf661eb.mp3',
      '/audio/5b54c06466192bedf9cf27a7ef6a2ef517848e7e.mp3',
      '/audio/78d8add21e95cab9f10153283a309952fb181116.mp3',
      '/audio/161735137b876d33e0b7f1e234cac5b1b67e2c39.mp3',
      '/audio/fb64d64701972f2463311975bf3769039929b1c6.mp3',
      '/audio/5ce1929f85602d80a45a145537bba93246571654.mp3',
      '/audio/a5803ef8f3bfdd7ba2aeaa9ab77bfbb91ed73d5a.mp3',
      '/audio/78a3ddd2b0e9f8b82687252ebbb889659d021a97.mp3',
      '/audio/fdf751ddc228185552a088ea4c4fdc239519f561.mp3',
      '/audio/36695ab24f023b8f1e6b3582238a87d99257fbf0.mp3',
      '/audio/b2ea0946558eea310ce3a6f9ce2b5aaf33aac8c3.mp3',
      '/audio/2c8d01873f7b731335d8ae7cb7051e8b947b821a.mp3',
      '/audio/16b4ebf5c78ca1b7828e34398fb426240707c38c.mp3',
      '/audio/32512432ff9e16313bed01ec0da9352a9d842972.mp3',
      '/audio/44723421dd50c16fafedf12a3529268c276491a0.mp3',
      '/audio/9bbd5f166f07a2d0f7df177cbab5c92963bb2bec.mp3',
      '/audio/4a856cc4b62ac5ffedfa6c8e54b94731539bae81.mp3',
      '/audio/817c8eb5f50dcd6f7dac7be528d7b489c7d2192d.mp3',
      '/audio/6449ed77e84c72fcfe2d4ff64e92382f95835384.mp3',
      '/audio/7ce90c3d2c1b7a15370e4f530e56ed970585cf1b.mp3',
      '/audio/8acd5f16e0be2b2ad68c12a30c03bbf250189740.mp3',
      '/audio/92a21bb184ea5b34226e3e1bae3cf263d049dbbc.mp3',
      '/audio/f3e4533d8214d7c80f08b2f3d57ca2122e1be45e.mp3',
      '/audio/2415f127305a6c8b7891f8fa7e4ac09b2d2076a2.mp3',
      '/audio/3060b62edfaa55fe2c744ef4ffd91d0b00cf9b16.mp3',
      '/audio/64a25dfacbaa9d0792a0752e62c1beeb64764b07.mp3',
      '/audio/7cbd667af7eeda14e214fb5d5d841c6b8cbc7b1a.mp3',
      '/audio/90e307a946f49d98fdd4f42428177ba3fb09f491.mp3',
      '/audio/d608de4f1f9cbc22d50c2c33b488fc81d11d6860.mp3',
      '/audio/c5f25f83e3fa6bc79535895546e070ffa6026e26.mp3',
      '/audio/b15e158e51e9349ac9c0b772d1afe71f622ab285.mp3',
      '/audio/422ff5c1401b11ee4bea0818705594c94c18d420.mp3',
      '/audio/0591ddd6847c7eec323acc236f1450a09dfb3b0a.mp3',
      '/audio/111dc144c67876931b2544db502e7ff72ba38b13.mp3',
      '/audio/d3bba2f2e44c71466d01ffe6f5b955e579cf0716.mp3',
      '/audio/cd9486cdb84c6c696e304a4d3be5faba4756ab39.mp3',
      '/audio/e0f9ccbfacec4b942b8063ad8b03d336f102ad24.mp3',
      '/audio/70f2e96435bce13cb5cd0c64f8f549fd81620d94.mp3',
      '/audio/5a3c5f71eeac31a3a36b291abd58fe83fa373232.mp3',
      '/audio/24afcca10e22ce78092cfa2b2f3c01d263681e6a.mp3',
      '/audio/76a69d7d6a0e5e4b4f3d72a804fe50dadee922e6.mp3',
      '/audio/cce1862bcbd9c1bf60687d077910f829f7466c6b.mp3',
      '/audio/c7c8dbec1c1e1794ad2c425a4bc0cfa551c6f976.mp3',
      '/audio/3b92e6656400f3e9f58e38b22c4c7224e879a014.mp3',
      '/audio/0434c8e4bc053d36479a9b15161d97d82994629d.mp3',
      '/audio/93b7a3f069a95653134afcb9baadb5d813dff08b.mp3',
      '/audio/a27700e6bb8898b77c8537e741e9f70f59b8e171.mp3',
      '/audio/161db3be959cdecd56448886639742f8733bb8b5.mp3',
      '/audio/34ee3369fb55d4b180cb6618b253344f295c1e15.mp3',
      '/audio/b1b5b34f5a3144f4f89be859f6234cbf254feb8e.mp3',
      '/audio/e46d9b5d536b83590641437c8f5d2853b72c583d.mp3',
      '/audio/6aa2d29516935fb0772a4a5d9bd6050e00503bb3.mp3',
      '/audio/d3b5743f33f88fc18ea872d34be5c0d62aeeadf8.mp3',
      '/audio/d66707a7428b83f1e4945cadd3b289c08ea26197.mp3',
      '/audio/65e2870669034764a370875215f4fe619962775f.mp3',
      '/audio/cc8795eb68ac76124cf9ce5205528f069738cad9.mp3',
      '/audio/588b2e6c03e050ae61ca2addc47e103855496561.mp3',
      '/audio/b149255e26de159e479ce84a14b3593fd7a5fc05.mp3',
      '/audio/47ec74955f635ff341d1b6e6b93fd17841d2732c.mp3',
      '/audio/f0300b558ab74b3b88be1ca51e81ed9ba91a0adb.mp3',
      '/audio/80f51ffc97514ae458da15c680a4d31b1e895090.mp3',
      '/audio/9cff285eef0287b4aa9d03dcb112a1140798ef27.mp3',
      '/audio/34bb4820eeee175810f7d360908dc5d553ea54db.mp3',
      '/audio/fc3b067ddb4da84e731ecd64cd239151997530a5.mp3',
      '/audio/194fcf63b3a27bb6c52522316612841fc86a2a3d.mp3',
      '/audio/7d112215d06a33e37cfc3214210341eab171c596.mp3',
      '/audio/ac3dc2206016f6123d5c6d7d8af5a60460bedd98.mp3',
      '/audio/49892cbddf2d1e22081631e3ad82d0eb2fa54924.mp3',
      '/audio/b8b0c6f72bac041fd0b46758578419786e2c22ac.mp3',
      '/audio/bf017acf7b410ce001773f391882c9f3d7414520.mp3',
      '/audio/ef7507293e56a0d2049722edafcdf78b5bbcaa7b.mp3',
      '/audio/41e345bbe377df918774599b9280ce3fc522bf1e.mp3',
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

// Cache management utilities
const CacheManager = {
  async preloadCriticalAssets() {
    const criticalAssets = [
      '/css/critical.css',
      '/js/critical.js',
      '/icons/icon-192x192.png',
      '/icons/icon-512x512.png'
    ];

    const cache = await caches.open(CACHE_CONFIG.assets.name);
    await Promise.all(
      criticalAssets.map(url => 
        cache.add(url).catch(err => console.warn(`Failed to preload ${url}:`, err))
      )
    );
  },

  async cleanupOldCaches() {
    const cacheNames = await caches.keys();
    const currentCaches = Object.values(CACHE_CONFIG).map(config => config.name);
    
    await Promise.all(
      cacheNames
        .filter(name => !currentCaches.includes(name))
        .map(name => caches.delete(name))
    );
  },

  async updateCacheVersion() {
    const cache = await caches.open(CACHE_CONFIG.assets.name);
    const response = await fetch('/version.json');
    const version = await response.json();
    await cache.put('/version.json', new Response(JSON.stringify(version)));
  }
};

// Offline support utilities
const OfflineManager = {
  async getOfflineResponse(request) {
    const cache = await caches.open(CACHE_CONFIG.offline.name);
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
    const cache = await caches.open(CACHE_CONFIG.audio.name);
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
      self.clients.claim()
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
        const cache = await caches.open(CACHE_CONFIG.data.name);
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
    const cache = await caches.open(CACHE_CONFIG.data.name);
    
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
    
    const cache = await caches.open(CACHE_CONFIG.data.name);
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