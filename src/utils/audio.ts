// Audio player utility
import { SHA1 } from 'crypto-js';
import { getAudio, setAudio } from './AudioCache';

let audioPlayer: HTMLAudioElement | null = null;
let audioQueue: string[] = [];
let isPlaying = false;
let audioMap: { [key: string]: string } = {};

// Add iOS detection
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

// Add audio context initialization
let audioContext: AudioContext | null = null;

// Initialize audio context on user interaction
export const initializeAudio = () => {
  console.log('[initializeAudio] Attempting to initialize audio context...');
  if (!audioContext) {
    try {
      // Create audio context with better iOS compatibility
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioContext = new AudioContextClass({
        latencyHint: 'interactive',
        sampleRate: 44100
      });
      
      // Set up audio context state change listener
      audioContext.addEventListener('statechange', () => {
        console.log('[initializeAudio] Audio context state changed:', audioContext?.state);
      });

      // For iOS, we need to resume the context on any user interaction
      if (isIOS) {
        const resumeContext = async () => {
          if (audioContext && audioContext.state === 'suspended') {
            try {
              await audioContext.resume();
              console.log('[initializeAudio] iOS: Audio context resumed on user interaction');
            } catch (error) {
              console.error('[initializeAudio] iOS: Failed to resume audio context:', error);
            }
          }
        };

        // Add event listeners for common user interactions
        ['click', 'touchstart', 'keydown'].forEach(event => {
          document.addEventListener(event, resumeContext, { once: true });
        });
      }

      console.log('[initializeAudio] Audio context created successfully:', audioContext.state);
    } catch (error) {
      console.error('[initializeAudio] Failed to create audio context:', error);
      return null;
    }
  } else {
    console.log('[initializeAudio] Audio context already exists:', audioContext.state);
  }
  return audioContext;
};

// Load audio map with retries
const loadAudioMap = async (retries = 3): Promise<boolean> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`[loadAudioMap] Attempt ${attempt}/${retries} to load audio map...`);
      const response = await fetch('/audio/audio_map.txt');
      if (!response.ok) throw new Error(`Failed to load audio map: ${response.status}`);
      const text = await response.text();
      
      // Parse the audio map with better error handling
      const newMap: { [key: string]: string } = {};
      const lines = text.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        const [japanese, filename] = line.split(' => ').map(s => s.trim());
        if (japanese && filename) {
          newMap[japanese] = filename;
        } else {
          console.warn('[loadAudioMap] Skipping invalid line:', line);
        }
      }
      
      if (Object.keys(newMap).length === 0) {
        throw new Error('Audio map is empty after parsing');
      }
      
      audioMap = newMap;
      console.log(`[loadAudioMap] Successfully loaded ${Object.keys(audioMap).length} audio mappings`);
      return true;
    } catch (error) {
      console.error(`[loadAudioMap] Attempt ${attempt} failed:`, error);
      if (attempt === retries) {
        console.error('[loadAudioMap] All attempts to load audio map failed');
        return false;
      }
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  return false;
};

// Helper to get audio filename from Japanese text with better matching
async function getAudioFilename(text: string): Promise<string> {
  // If audio map is empty, try to load it
  if (Object.keys(audioMap).length === 0) {
    const success = await loadAudioMap();
    if (!success) {
      console.warn('[getAudioFilename] Failed to load audio map, using hash fallback');
      return `${SHA1(text).toString()}.mp3`;
    }
  }
  
  // Try exact match first
  if (audioMap[text]) {
    console.log('[getAudioFilename] Found exact match for:', text);
    return audioMap[text];
  }
  
  // Try to find a partial match, preferring longer matches
  const partialMatches = Object.entries(audioMap)
    .filter(([key]) => text.includes(key))
    .sort(([a], [b]) => b.length - a.length); // Sort by length descending
    
  if (partialMatches.length > 0) {
    const [match, filename] = partialMatches[0];
    console.log('[getAudioFilename] Found partial match:', { text, match, filename });
    return filename;
  }
  
  // If no match found, use SHA-1 hash as fallback
  const hash = SHA1(text).toString();
  console.log('[getAudioFilename] No match found, using hash:', hash);
  return `${hash}.mp3`;
}

// Modified playAudio function with better iOS handling and error recovery
export const playAudio = async (text: string, type: 'word' | 'example' = 'word'): Promise<void> => {
  console.log('[playAudio] Starting playback for:', { text, type, audioContextState: audioContext?.state });
  
  // Initialize audio context if needed
  if (!audioContext) {
    console.log('[playAudio] Audio context not initialized, attempting to initialize...');
    audioContext = initializeAudio();
    if (!audioContext) {
      console.warn('[playAudio] Failed to initialize audio context, using Web Speech API fallback');
      useWebSpeechFallback(text);
      return;
    }
  }

  // For iOS, ensure context is resumed
  if (isIOS && audioContext.state === 'suspended') {
    console.log('[playAudio] iOS: Audio context is suspended, attempting to resume...');
    try {
      await audioContext.resume();
      console.log('[playAudio] iOS: Audio context resumed successfully');
    } catch (error) {
      console.error('[playAudio] iOS: Failed to resume audio context:', error);
      useWebSpeechFallback(text);
      return;
    }
  }

  const filename = await getAudioFilename(text);
  const audioPath = `/audio/${filename}`;
  console.log(`[playAudio] Requested:`, { text, filename, audioPath, audioContextState: audioContext.state });

  try {
    // Try to play from IndexedDB cache first
    let blob = await getAudio(filename);
    if (!blob) {
      // If not in cache, fetch and cache
      console.log('[playAudio] Audio not in cache, fetching from server...');
      const response = await fetch(audioPath);
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.status}`);
      }
      blob = await response.blob();
      await setAudio(filename, blob);
      console.log('[playAudio] Audio fetched and cached successfully');
    }

    // Handle iOS audio restrictions
    if (isIOS) {
      // iOS requires audio to be loaded and played in the same user interaction
      const url = URL.createObjectURL(blob);
      if (audioPlayer) {
        audioPlayer.pause();
        URL.revokeObjectURL(audioPlayer.src);
      }
      audioPlayer = new Audio(url);
      audioPlayer.preload = 'auto';
      
      // Add iOS-specific event listeners
      audioPlayer.addEventListener('play', () => {
        console.log('[playAudio] iOS: Audio started playing');
      });
      
      audioPlayer.addEventListener('error', (e) => {
        console.error('[playAudio] iOS: Audio playback error:', e);
        URL.revokeObjectURL(url);
        useWebSpeechFallback(text);
      });

      try {
        // For iOS, we need to play immediately after user interaction
        await audioPlayer.play();
        console.log('[playAudio] iOS: Audio playback started successfully');
      } catch (error) {
        console.error('[playAudio] iOS: Failed to play audio:', error);
        URL.revokeObjectURL(url);
        useWebSpeechFallback(text);
      }

      audioPlayer.onended = () => {
        console.log('[playAudio] iOS: Audio playback ended');
        URL.revokeObjectURL(url);
        audioPlayer = null;
      };
    } else {
      // Non-iOS platforms use standard playback
      const url = URL.createObjectURL(blob);
      if (audioPlayer) {
        audioPlayer.pause();
        URL.revokeObjectURL(audioPlayer.src);
      }
      audioPlayer = new Audio(url);
      
      audioPlayer.addEventListener('error', (e) => {
        console.error('[playAudio] Audio playback error:', e);
        URL.revokeObjectURL(url);
        useWebSpeechFallback(text);
      });

      try {
        await audioPlayer.play();
        console.log('[playAudio] Audio playback started successfully');
      } catch (error) {
        console.error('[playAudio] Failed to play audio:', error);
        URL.revokeObjectURL(url);
        useWebSpeechFallback(text);
      }

      audioPlayer.onended = () => {
        console.log('[playAudio] Audio playback ended');
        URL.revokeObjectURL(url);
        audioPlayer = null;
      };
    }
  } catch (error) {
    console.error('[playAudio] Failed to play audio:', error);
    useWebSpeechFallback(text);
  }
};

// Helper function for Web Speech API fallback
const useWebSpeechFallback = (text: string) => {
  console.log('[useWebSpeechFallback] Using Web Speech API for:', text);
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.8;
    utterance.pitch = 1;
    
    // Try to find a Japanese voice
    const voices = window.speechSynthesis.getVoices();
    const japaneseVoice = voices.find(voice => voice.lang.includes('ja'));
    if (japaneseVoice) {
      utterance.voice = japaneseVoice;
      console.log('[useWebSpeechFallback] Using Japanese voice:', japaneseVoice.name);
    } else {
      console.warn('[useWebSpeechFallback] No Japanese voice found, using default voice');
    }
    
    window.speechSynthesis.speak(utterance);
  } else {
    console.error('[useWebSpeechFallback] Web Speech API not supported');
  }
};

// Queue management
const processQueue = async () => {
  if (isPlaying || audioQueue.length === 0) return;
  
  isPlaying = true;
  const nextText = audioQueue.shift();
  if (!nextText) {
    isPlaying = false;
    return;
  }

  try {
    await playAudio(nextText);
  } catch (error) {
    console.error('Error playing audio from queue:', error);
  } finally {
    isPlaying = false;
    processQueue(); // Process next item in queue
  }
};

// Add to queue
export const queueAudio = (text: string) => {
  audioQueue.push(text);
  if (!isPlaying) {
    processQueue();
  }
};

// Clear queue
export const clearAudioQueue = () => {
  audioQueue = [];
  if (audioPlayer) {
    audioPlayer.pause();
    URL.revokeObjectURL(audioPlayer.src);
    audioPlayer = null;
  }
  isPlaying = false;
};

// Initialize cache
export const initializeAudioCache = async () => {
  try {
    // Only open the cache, don't preload everything
    const cache = await caches.open('japvoc-audio-v1.0.0');
    
    // Load only the audio map initially
    const success = await loadAudioMap();
    if (!success) {
      console.warn('Failed to load audio map, will use Web Speech API fallback');
    }
    
    // Don't preload all audio files, let them load on demand
    console.log('Audio cache initialized successfully (lazy loading enabled)');
    return true;
  } catch (error) {
    console.error('Failed to initialize audio cache:', error);
    return false;
  }
};

// Add a function to load audio files on demand
export const loadAudioFile = async (filename: string): Promise<Blob | null> => {
  try {
    const cache = await caches.open('japvoc-audio-v1.0.0');
    const cachedResponse = await cache.match(`/audio/${filename}`);
    
    if (cachedResponse) {
      return await cachedResponse.blob();
    }
    
    // If not in cache, fetch and cache it
    const response = await fetch(`/audio/${filename}`);
    if (!response.ok) throw new Error(`Failed to fetch audio: ${response.status}`);
    
    const blob = await response.blob();
    await cache.put(`/audio/${filename}`, new Response(blob));
    return blob;
  } catch (error) {
    console.error(`Failed to load audio file ${filename}:`, error);
    return null;
  }
};

// Check if audio is available
export const hasAudio = async (text: string): Promise<boolean> => {
  const filename = await getAudioFilename(text);
  const audioPath = `/audio/${filename}`;
  
  try {
    const cache = await caches.open('japvoc-audio-v1.0.0');
    const cachedResponse = await cache.match(audioPath);
    if (cachedResponse) return true;
    
    // If not in cache, check if file exists
    const response = await fetch(audioPath, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Error checking audio availability:', error);
    return false;
  }
};

// Modified playDynamicAudio with iOS handling
export const playDynamicAudio = async (text: string): Promise<void> => {
  if (!audioContext) {
    console.log('[playDynamicAudio] Audio context not initialized, waiting for user interaction');
    return;
  }

  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.8;
    utterance.pitch = 1;

    // Try to find a Japanese voice
    const voices = window.speechSynthesis.getVoices();
    const japaneseVoice = voices.find(voice => voice.lang.includes('ja'));
    if (japaneseVoice) {
      utterance.voice = japaneseVoice;
    }

    // iOS-specific handling for speech synthesis
    if (isIOS) {
      // iOS requires speech synthesis to be started in user interaction
      try {
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.error('[playDynamicAudio] iOS: Failed to use speech synthesis:', error);
      }
    } else {
      window.speechSynthesis.speak(utterance);
    }
  } else {
    console.error('[playDynamicAudio] Web Speech API not supported');
  }
}; 