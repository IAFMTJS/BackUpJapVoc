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