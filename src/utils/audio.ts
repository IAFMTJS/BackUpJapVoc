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

// Simplified audio playback function that uses AudioService consistently
export const playAudio = async (
  text: string, 
  type: 'word' | 'example' = 'word'
): Promise<void> => {
  if (!isInitialized) {
    await initializeAudio();
  }

  try {
    // Always use AudioService for consistent voice selection
    await audioService.playAudio(text, {
      useTTS: true, // Always prefer TTS for better Japanese pronunciation
      rate: 0.9,    // Slightly slower for better clarity
      pitch: 1
    });
  } catch (error) {
    console.error('[playAudio] Error playing audio:', error);
    // Fallback to basic TTS if AudioService fails
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
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

// Debug function to help identify voice issues
export const debugVoices = () => {
  if (!('speechSynthesis' in window)) {
    console.log('Speech synthesis not supported');
    return;
  }

  const allVoices = window.speechSynthesis.getVoices();
  const audioService = AudioService.getInstance();
  const status = audioService.getTTSStatus();
  
  console.log('=== VOICE DEBUG INFO ===');
  console.log('All available voices:', allVoices.map(v => `${v.name} (${v.lang})`));
  console.log('AudioService status:', status);
  console.log('Best voice:', status.bestVoice);
  console.log('Japanese voices:', allVoices.filter(v => v.lang.includes('ja') || v.lang.includes('JP')));
  console.log('========================');
}; 