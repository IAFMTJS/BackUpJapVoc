// Audio player utility
import { SHA1 } from 'crypto-js';
import { getAudio, setAudio } from './AudioCache';

let audioPlayer: HTMLAudioElement | null = null;
let audioQueue: string[] = [];
let isPlaying = false;
let audioMap: { [key: string]: string } = {};

// Load audio map
const loadAudioMap = async () => {
  try {
    const response = await fetch('/audio/audio_map.txt');
    if (!response.ok) throw new Error('Failed to load audio map');
    const text = await response.text();
    
    // Parse the audio map
    audioMap = text.split('\n').reduce((map, line) => {
      const [japanese, filename] = line.split(' => ');
      if (japanese && filename) {
        map[japanese.trim()] = filename.trim();
      }
      return map;
    }, {} as { [key: string]: string });
    
    console.log('Audio map loaded successfully');
    return true;
  } catch (error) {
    console.error('Failed to load audio map:', error);
    return false;
  }
};

// Helper to get audio filename from Japanese text
async function getAudioFilename(text: string): Promise<string> {
  // If audio map is empty, try to load it
  if (Object.keys(audioMap).length === 0) {
    await loadAudioMap();
  }
  
  // Try to find exact match
  if (audioMap[text]) {
    return audioMap[text];
  }
  
  // If no exact match, try to find a partial match
  const partialMatch = Object.entries(audioMap).find(([key]) => text.includes(key));
  if (partialMatch) {
    return partialMatch[1];
  }
  
  // If no match found, use SHA-1 hash as fallback
  return `${SHA1(text).toString()}.mp3`;
}

// Play audio with retry and fallback
export const playAudio = async (text: string, type: 'word' | 'example' = 'word'): Promise<void> => {
  const filename = await getAudioFilename(text);
  const audioPath = `/audio/${filename}`;
  console.log(`[playAudio] Requested:`, { text, filename, audioPath });
  if (audioMap[text]) {
    console.log(`[playAudio] Found in audio map: ${text} => ${filename}`);
  } else {
    console.warn(`[playAudio] Not found in audio map, using SHA1 fallback for: ${text}`);
  }
  try {
    // Try to play from IndexedDB cache first
    let blob = await getAudio(filename);
    if (!blob) {
      // If not in cache, fetch and cache
      const response = await fetch(audioPath);
      if (!response.ok) {
        console.error(`[playAudio] Failed to fetch audio from server:`, { audioPath, status: response.status });
        throw new Error(`Failed to fetch audio: ${response.status}`);
      }
      blob = await response.blob();
      await setAudio(filename, blob);
    }
    // Play the audio from blob
    const url = URL.createObjectURL(blob);
    if (audioPlayer) {
      audioPlayer.pause();
      URL.revokeObjectURL(audioPlayer.src);
    }
    audioPlayer = new Audio(url);
    await audioPlayer.play();
    audioPlayer.onended = () => {
      URL.revokeObjectURL(url);
      audioPlayer = null;
    };
  } catch (error) {
    console.error(`[playAudio] Failed to play audio for:`, { text, filename, audioPath, error });
    // Fallback to Web Speech API
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
      window.speechSynthesis.speak(utterance);
    } else {
      console.error('[playAudio] Web Speech API not supported');
    }
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
    const cache = await caches.open('japvoc-audio-v1.0.0');
    await loadAudioMap(); // Load audio map during initialization
    console.log('Audio cache initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize audio cache:', error);
    return false;
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