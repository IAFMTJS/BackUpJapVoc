// Audio utility wrapper for AudioService
import AudioService from '../services/AudioService';

// Create a singleton instance
const audioService = AudioService.getInstance();

// Track iOS status
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

// Initialize audio on first user interaction
let isInitialized = false;
const initializeAudio = async () => {
  if (isInitialized) return true;
  
  try {
    // AudioService handles initialization
    isInitialized = true;
    return true;
  } catch (error) {
    console.error('[initializeAudio] Error initializing audio:', error);
    return false;
  }
};

// Main audio playback function
export const playAudio = async (text: string, type: 'word' | 'example' = 'word'): Promise<void> => {
  if (!isInitialized) {
    await initializeAudio();
  }

  try {
    await audioService.playAudio(text, {
      useTTS: isIOS, // Prefer TTS on iOS
    });
  } catch (error) {
    console.error('[playAudio] Error playing audio:', error);
    // Fallback to Web Speech API
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    window.speechSynthesis.speak(utterance);
  }
};

// Dynamic audio playback (same as regular for now)
export const playDynamicAudio = async (text: string): Promise<void> => {
  await playAudio(text);
};

// Queue management
export const queueAudio = (text: string) => {
  playAudio(text);
};

export const clearAudioQueue = () => {
  audioService.stopAudio();
};

// Cache management
export const initializeAudioCache = async (): Promise<boolean> => {
  try {
    await initializeAudio();
    return true;
  } catch (error) {
    console.error('[initializeAudioCache] Error initializing audio:', error);
    return false;
  }
};

export const hasAudio = async (text: string): Promise<boolean> => {
  return true; // AudioService handles this internally
};

// Mood word audio generation
export const generateMoodWordAudio = async (word: string): Promise<string | undefined> => {
  try {
    await playAudio(word);
    return undefined;
  } catch (error) {
    console.error('[generateMoodWordAudio] Error:', error);
    return undefined;
  }
};

// Export AudioService for direct access if needed
export { audioService as AudioService }; 