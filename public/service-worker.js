/* global workbox, self, caches, fetch, Promise, Response, Request, IndexedDB */

// Version control
const APP_VERSION = '1.0.0';
const CACHE_NAME = `japvoc-cache-v${APP_VERSION}`;
const DATA_CACHE_NAME = `japvoc-data-v${APP_VERSION}`;
const AUDIO_CACHE_NAME = `japvoc-audio-v${APP_VERSION}`;
const ROMAJI_DATA_URL = '/romaji-data.json';

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
  },
  audio: {
    name: AUDIO_CACHE_NAME,
    strategy: 'cache-first',
    patterns: ['/audio/'],
    preCacheUrls: [
      // Add essential audio files for level 1
      '/audio/level1/greetings.mp3',
      '/audio/level1/numbers.mp3',
      '/audio/level1/basic_phrases.mp3'
    ],
    optimization: AUDIO_OPTIMIZATION
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
      }),

      // Pre-cache common audio files
      caches.open(CACHE_CONFIG.audio.name).then(async cache => {
        console.log('[Service Worker] Pre-caching common audio files...');
        const urls = CACHE_CONFIG.audio.preCacheUrls;
        const results = await Promise.allSettled(
          urls.map(url => 
            fetch(url)
              .then(response => {
                if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
                return cache.put(url, response);
              })
              .catch(error => {
                console.warn(`[Service Worker] Failed to pre-cache ${url}:`, error);
                return null;
              })
          )
        );
        
        const failed = results.filter(r => r.status === 'rejected');
        if (failed.length > 0) {
          console.warn('[Service Worker] Some audio files failed to pre-cache:', failed);
        }
        return results;
      })
    ]).then(() => {
      console.log('[Service Worker] Cache operations completed');
      return self.skipWaiting();
    }).catch(error => {
      console.error('[Service Worker] Cache operation failed:', error);
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
  // Special handling for audio files
  if (request.url.includes('/audio/')) {
    return handleAudioRequest(request);
  }

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
        return new Response('<h1>Offline</h1><p>The application is offline and no offline page is available.</p>', {
          status: 503,
          headers: { 'Content-Type': 'text/html' }
        });
      }
    }

    throw error;
  }
}

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

// Update handleAudioRequest function
async function handleAudioRequest(request) {
  const cache = await caches.open(CACHE_CONFIG.audio.name);
  const quality = await getAudioQuality(); // Get user's preferred quality
  
  try {
    // Try cache first
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log('[Service Worker] Serving audio from cache:', request.url);
      
      // Update cache in background if online
      if (navigator.onLine) {
        fetch(request).then(async response => {
          if (response.ok) {
            const blob = await response.blob();
            const optimizedBlob = await optimizeAudio(blob, quality);
            await cache.put(request, new Response(optimizedBlob));
            console.log('[Service Worker] Updated audio cache:', request.url);
          }
        }).catch(error => {
          console.error('[Service Worker] Failed to update audio cache:', error);
        });
      }
      
      return cachedResponse;
    }
    
    // If not in cache and online, fetch and optimize
    if (navigator.onLine) {
      console.log('[Service Worker] Fetching audio from network:', request.url);
      const response = await fetch(request);
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.status}`);
      }
      
      // Optimize the audio
      const blob = await response.blob();
      const optimizedBlob = await optimizeAudio(blob, quality);
      
      // Cache the optimized version
      await cache.put(request, new Response(optimizedBlob));
      return new Response(optimizedBlob);
    }
    
    // If offline and not in cache, return fallback response
    return new Response(
      JSON.stringify({ 
        error: 'offline',
        message: 'Audio not available offline. Using text-to-speech as fallback.'
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('[Service Worker] Error handling audio request:', error);
    
    // If offline, return fallback response
    if (!navigator.onLine) {
      return new Response(
        JSON.stringify({ 
          error: 'offline',
          message: 'Audio not available offline. Using text-to-speech as fallback.'
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    throw error;
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