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
let isInitialized = false;

// Add persistent audio elements for iOS
let persistentAudioElements: { [key: string]: HTMLAudioElement } = {};
let audioContextPromise: Promise<AudioContext | null> | null = null;

// Modified initializeAudio function with better iOS handling
export const initializeAudio = () => {
  if (audioContextPromise) {
    return audioContextPromise;
  }

  audioContextPromise = new Promise(async (resolve) => {
    console.log('[initializeAudio] Attempting to initialize audio context...');
    
    if (isInitialized && audioContext) {
      console.log('[initializeAudio] Audio context already initialized:', audioContext.state);
      resolve(audioContext);
      return;
    }

    try {
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

        // Add persistent event listeners for common user interactions
        const events = ['click', 'touchstart', 'keydown'];
        events.forEach(event => {
          document.addEventListener(event, resumeContext, { passive: true });
        });

        // Store the event listeners for cleanup
        audioContext.addEventListener('statechange', () => {
          if (audioContext?.state === 'closed') {
            events.forEach(event => {
              document.removeEventListener(event, resumeContext);
            });
          }
        });

        // Pre-create some audio elements for iOS
        for (let i = 0; i < 3; i++) {
          const audio = new Audio();
          audio.preload = 'auto';
          persistentAudioElements[`audio_${i}`] = audio;
        }
      }

      isInitialized = true;
      console.log('[initializeAudio] Audio context created successfully:', audioContext.state);
      resolve(audioContext);
    } catch (error) {
      console.error('[initializeAudio] Failed to create audio context:', error);
      resolve(null);
    }
  });

  return audioContextPromise;
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

// Helper to get audio filename from Japanese text
async function getAudioFilename(text: string): Promise<string> {
  // Always use SHA1 hash for consistency
  const hash = SHA1(text).toString();
  console.log('[getAudioFilename] Generated hash for:', { text, hash });
  return `${hash}.mp3`;
}

// Modified playAudio function with better iOS handling
export const playAudio = async (text: string, type: 'word' | 'example' = 'word'): Promise<void> => {
  console.log('[playAudio] Starting playback for:', { text, type, audioContextState: audioContext?.state });
  
  const originalText = text;
  
  // Initialize audio context if needed
  if (!audioContext || !isInitialized) {
    console.log('[playAudio] Audio context not initialized, attempting to initialize...');
    audioContext = await initializeAudio();
    if (!audioContext) {
      console.log('[playAudio] Failed to initialize audio context, using Web Speech API fallback');
      useWebSpeechFallback(originalText);
      return;
    }
  }

  // For iOS, ensure context is resumed and wait for it
  if (isIOS) {
    if (audioContext.state === 'suspended') {
      console.log('[playAudio] iOS: Audio context is suspended, attempting to resume...');
      try {
        await audioContext.resume();
        // Add a small delay to ensure the context is fully resumed
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log('[playAudio] iOS: Audio context resumed successfully');
      } catch (error) {
        console.error('[playAudio] iOS: Failed to resume audio context:', error);
        useWebSpeechFallback(originalText);
        return;
      }
    }
  }

  try {
    const filename = await getAudioFilename(text);
    let blob = await getAudio(filename);
    
    if (!blob) {
      try {
        console.log('[playAudio] Audio not in cache, attempting to fetch from server...');
        const response = await fetch(`/audio/${filename}`);
        
        if (response.ok) {
          blob = await response.blob();
          await setAudio(filename, blob);
          console.log('[playAudio] Audio fetched and cached successfully');
        } else if (response.status === 404) {
          console.log('[playAudio] Audio not found on server, using Web Speech API');
          useWebSpeechFallback(originalText);
          return;
        } else {
          console.warn(`[playAudio] Server returned ${response.status}, using Web Speech API`);
          useWebSpeechFallback(originalText);
          return;
        }
      } catch (fetchError) {
        if (!(fetchError instanceof Error && fetchError.message.includes('404'))) {
          console.warn('[playAudio] Error fetching audio:', fetchError);
        }
        useWebSpeechFallback(originalText);
        return;
      }
    }

    if (blob) {
      const url = URL.createObjectURL(blob);
      
      let audioElement: HTMLAudioElement;
      
      if (isIOS) {
        // For iOS, try to use a persistent audio element
        const availableElement = Object.values(persistentAudioElements).find(audio => 
          audio.paused && !audio.src
        );
        
        if (availableElement) {
          audioElement = availableElement;
        } else {
          // If no persistent element is available, create a new one
          audioElement = new Audio();
        }
      } else {
        // For non-iOS devices, clean up existing player
        if (audioPlayer) {
          audioPlayer.pause();
          URL.revokeObjectURL(audioPlayer.src);
        }
        audioElement = new Audio();
      }

      // Set up the audio element
      audioElement.src = url;
      audioElement.preload = 'auto';
      
      // Add error handling
      audioElement.addEventListener('error', (e) => {
        console.error('[playAudio] Audio playback error:', e);
        URL.revokeObjectURL(url);
        useWebSpeechFallback(originalText);
      });

      // Add iOS-specific handling
      if (isIOS) {
        audioElement.addEventListener('play', () => {
          console.log('[playAudio] iOS: Audio started playing');
        });
        
        // Add load event handler for iOS
        audioElement.addEventListener('load', () => {
          console.log('[playAudio] iOS: Audio loaded successfully');
        });
      }

      try {
        // For iOS, we need to load the audio first
        if (isIOS) {
          await new Promise((resolve, reject) => {
            audioElement.addEventListener('canplaythrough', resolve, { once: true });
            audioElement.addEventListener('error', reject, { once: true });
            audioElement.load();
          });
        }
        
        await audioElement.play();
        console.log('[playAudio] Audio playback started successfully');
        
        // Store the current player for non-iOS devices
        if (!isIOS) {
          audioPlayer = audioElement;
        }
      } catch (error) {
        console.error('[playAudio] Failed to play audio:', error);
        URL.revokeObjectURL(url);
        useWebSpeechFallback(originalText);
        return;
      }

      // Clean up when done
      audioElement.onended = () => {
        console.log('[playAudio] Audio playback ended');
        URL.revokeObjectURL(url);
        if (!isIOS) {
          audioPlayer = null;
        } else {
          // For iOS, reset the persistent element
          audioElement.src = '';
          audioElement.load();
        }
      };
    } else {
      console.log('[playAudio] No audio blob available, using Web Speech API');
      useWebSpeechFallback(originalText);
    }
  } catch (error) {
    console.error('[playAudio] Unexpected error:', error);
    useWebSpeechFallback(originalText);
  }
};

// Helper function for Web Speech API fallback with better voice selection
const useWebSpeechFallback = (text: string) => {
  console.log('[useWebSpeechFallback] Using Web Speech API for:', text);
  
  if (!('speechSynthesis' in window)) {
    console.error('[useWebSpeechFallback] Web Speech API not supported');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Handle blob URLs - extract the original text if possible
  let textToSpeak = text;
  if (text.startsWith('blob:')) {
    // If we have a blob URL, we need to get the original text
    // For now, we'll use a placeholder and log a warning
    console.warn('[useWebSpeechFallback] Received blob URL instead of text, using fallback text');
    textToSpeak = 'テキスト'; // Fallback text
  }

  const utterance = new SpeechSynthesisUtterance(textToSpeak);
  utterance.lang = 'ja-JP';
  utterance.rate = 0.8;
  utterance.pitch = 1;
  
  // Try to find a Japanese voice with better selection
  const voices = window.speechSynthesis.getVoices();
  const japaneseVoice = voices.find(voice => 
    voice.lang.includes('ja') && 
    (voice.name.includes('Google') || voice.name.includes('Microsoft'))
  ) || voices.find(voice => voice.lang.includes('ja'));

  if (japaneseVoice) {
    utterance.voice = japaneseVoice;
    console.log('[useWebSpeechFallback] Using Japanese voice:', japaneseVoice.name);
  } else {
    console.warn('[useWebSpeechFallback] No Japanese voice found, using default voice');
  }

  // Add error handling with more detailed logging
  utterance.onerror = (event) => {
    console.error('[useWebSpeechFallback] Speech synthesis error:', {
      error: event.error,
      elapsedTime: event.elapsedTime,
      name: event.name,
      utterance: event.utterance
    });
  };

  // Add end handling with cleanup
  utterance.onend = () => {
    console.log('[useWebSpeechFallback] Speech synthesis completed');
    // Clean up any resources if needed
    if (text.startsWith('blob:')) {
      URL.revokeObjectURL(text);
    }
  };

  // Add boundary handling for better debugging
  utterance.onboundary = (event) => {
    console.log('[useWebSpeechFallback] Speech boundary:', {
      name: event.name,
      elapsedTime: event.elapsedTime,
      charIndex: event.charIndex
    });
  };

  // Speak the text with better error handling
  try {
    // For iOS, we need to ensure the context is active
    if (isIOS && audioContext?.state === 'suspended') {
      audioContext.resume().then(() => {
        window.speechSynthesis.speak(utterance);
      }).catch(error => {
        console.error('[useWebSpeechFallback] iOS: Failed to resume audio context:', error);
      });
    } else {
      window.speechSynthesis.speak(utterance);
    }
  } catch (error) {
    console.error('[useWebSpeechFallback] Failed to start speech synthesis:', error);
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

// Add a function to generate audio URL for a mood word
export const generateMoodWordAudio = async (word: string): Promise<string | undefined> => {
  try {
    // First try to get from cache
    const hash = SHA1(word).toString();
    const filename = `${hash}.mp3`;
    const cachedBlob = await getAudio(filename);
    
    if (cachedBlob) {
      console.log(`[generateMoodWordAudio] Using cached audio for: ${word}`);
      return URL.createObjectURL(cachedBlob);
    }

    // If not in cache, try to fetch from server
    try {
      const response = await fetch(`/audio/${filename}`);
      if (response.ok) {
        const blob = await response.blob();
        await setAudio(filename, blob);
        console.log(`[generateMoodWordAudio] Fetched and cached audio for: ${word}`);
        return URL.createObjectURL(blob);
      }
      // Don't log 404s as errors since they're expected
      if (response.status !== 404) {
        console.warn(`[generateMoodWordAudio] Server returned ${response.status} for: ${word}`);
      }
    } catch (fetchError) {
      // Only log non-404 errors
      if (!(fetchError instanceof Error && fetchError.message.includes('404'))) {
        console.warn(`[generateMoodWordAudio] Error fetching audio: ${fetchError}`);
      }
    }

    // If not found on server, use Web Speech API as fallback
    if ('speechSynthesis' in window) {
      console.log(`[generateMoodWordAudio] Using Web Speech API for: ${word}`);
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.8;
      utterance.pitch = 1;
      
      // Get Japanese voice
      const voices = window.speechSynthesis.getVoices();
      const japaneseVoice = voices.find(voice => voice.lang.includes('ja'));
      if (japaneseVoice) {
        utterance.voice = japaneseVoice;
        console.log(`[generateMoodWordAudio] Using Japanese voice: ${japaneseVoice.name}`);
      } else {
        console.warn('[generateMoodWordAudio] No Japanese voice found, using default voice');
      }

      // Create audio blob from speech synthesis
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const mediaStreamDestination = audioContext.createMediaStreamDestination();
      const mediaRecorder = new MediaRecorder(mediaStreamDestination.stream);
      const audioChunks: Blob[] = [];

      return new Promise((resolve) => {
        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          try {
            const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
            await setAudio(filename, audioBlob);
            console.log(`[generateMoodWordAudio] Generated and cached audio for: ${word}`);
            resolve(URL.createObjectURL(audioBlob));
          } catch (error) {
            console.error(`[generateMoodWordAudio] Error saving generated audio: ${error}`);
            resolve(undefined);
          } finally {
            audioContext.close();
          }
        };

        mediaRecorder.start();
        window.speechSynthesis.speak(utterance);
        
        utterance.onend = () => {
          mediaRecorder.stop();
        };

        // Add timeout in case speech synthesis fails
        setTimeout(() => {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            console.warn(`[generateMoodWordAudio] Speech synthesis timed out for: ${word}`);
          }
        }, 5000);
      });
    }

    console.warn(`[generateMoodWordAudio] Web Speech API not available for: ${word}`);
    return undefined;
  } catch (error) {
    console.error(`[generateMoodWordAudio] Unexpected error for word ${word}:`, error);
    return undefined;
  }
}; 