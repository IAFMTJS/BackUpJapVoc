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

// Define voice types for different contexts
type VoiceContext = 'happy' | 'serious' | 'neutral';

// Cache for available voices
let availableVoices: SpeechSynthesisVoice[] = [];

// Initialize voices
const initializeVoices = () => {
  if ('speechSynthesis' in window) {
    // Get all voices
    availableVoices = window.speechSynthesis.getVoices();
    
    // If voices aren't loaded yet, wait for them
    if (availableVoices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        availableVoices = window.speechSynthesis.getVoices();
      };
    }
  }
};

// Get appropriate voice based on context
const getVoiceForContext = (context: VoiceContext): SpeechSynthesisVoice | null => {
  if (!availableVoices.length) {
    initializeVoices();
  }

  // Filter Japanese voices
  const japaneseVoices = availableVoices.filter(voice => 
    voice.lang.includes('ja') || voice.lang.includes('JP')
  );

  if (japaneseVoices.length === 0) {
    return null;
  }

  // Always prefer female voices
  return japaneseVoices.find(voice => 
    voice.name.toLowerCase().includes('female') || 
    voice.name.toLowerCase().includes('kyoko') ||
    voice.name.toLowerCase().includes('haruka')
  ) || japaneseVoices[0];
};

// Track if audio is currently playing
let isPlaying = false;

// Enhanced audio playback function with context
export const playAudioWithContext = async (
  text: string, 
  context: VoiceContext = 'neutral',
  options: { rate?: number; pitch?: number } = {}
): Promise<void> => {
  if (!('speechSynthesis' in window)) {
    throw new Error('Speech synthesis not supported');
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  
  // Get appropriate voice for context
  const voice = getVoiceForContext(context);
  if (voice) {
    utterance.voice = voice;
  }

  // Apply custom options or defaults
  utterance.rate = options.rate || 0.8;
  utterance.pitch = options.pitch || 1;

  return new Promise<void>((resolve, reject) => {
    utterance.onend = () => resolve();
    utterance.onerror = (error) => reject(error);
    window.speechSynthesis.speak(utterance);
  });
};

// Update the existing playAudio function to use context
export const playAudio = async (
  text: string, 
  type: 'word' | 'example' = 'word',
  context: VoiceContext = 'neutral'
): Promise<void> => {
  if (isPlaying) {
    // If already playing, cancel current playback first
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    audioService.stopAudio();
    isPlaying = false;
  }

  if (!isInitialized) {
    await initializeAudio();
  }

  isPlaying = true;

  try {
    // For individual kanji readings or if TTS is explicitly requested, use Web Speech API directly
    if (text.length === 1 || type === 'example') {
      if (!('speechSynthesis' in window)) {
        throw new Error('Speech synthesis not supported');
      }
      await playAudioWithContext(text, context);
      return;
    }

    // For words, try the audio service first
    try {
      await audioService.playAudio(text, {
        useTTS: false, // Don't use TTS initially
      });
    } catch (audioError) {
      console.log('Falling back to TTS for:', text);
      // If audio service fails, fall back to Web Speech API
      if (!('speechSynthesis' in window)) {
        throw new Error('Speech synthesis not supported');
      }
      await playAudioWithContext(text, context);
    }
  } catch (error) {
    console.error('[playAudio] Error playing audio:', error);
    isPlaying = false;
    throw new Error('Failed to play audio');
  } finally {
    isPlaying = false;
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
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  isPlaying = false;
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