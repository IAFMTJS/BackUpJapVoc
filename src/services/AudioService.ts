import AudioGenerationManager from '../utils/audioGeneration';

interface AudioOptions {
  useTTS?: boolean;
  voice?: string;
  rate?: number;
  pitch?: number;
}

class AudioService {
  private static instance: AudioService;
  private audioContext: AudioContext | null = null;
  private audioCache: Map<string, AudioBuffer> = new Map();
  private isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  private currentAudio: HTMLAudioElement | null = null;
  private ttsVoices: SpeechSynthesisVoice[] = [];
  private defaultVoice: SpeechSynthesisVoice | null = null;
  private audioGenerator: AudioGenerationManager | null = null;
  private isInitialized = false;

  private constructor() {
    try {
      if (typeof window !== 'undefined') {
        // Initialize Web Speech API
        if ('speechSynthesis' in window) {
          this.loadVoices();
          
          // Listen for voice changes and reload
          window.speechSynthesis.onvoiceschanged = () => {
            console.log('Voices changed, reloading...');
            this.loadVoices();
          };
        }
        this.isInitialized = true;
      }
    } catch (error) {
      console.error('Error initializing AudioService:', error);
      // Continue with limited functionality
      this.isInitialized = true;
    }
  }

  private getAudioGenerator(): AudioGenerationManager {
    if (!this.audioGenerator) {
      this.audioGenerator = AudioGenerationManager.getInstance();
    }
    return this.audioGenerator;
  }

  private loadVoices() {
    try {
      if ('speechSynthesis' in window) {
        const allVoices = window.speechSynthesis.getVoices();
        
        // First try to find Japanese voices, then any available voice
        this.ttsVoices = allVoices.filter(voice => 
          voice.lang.includes('ja') || voice.lang.includes('JP')
        );
        
        // If no Japanese voices found, use any available voice
        if (this.ttsVoices.length === 0) {
          this.ttsVoices = allVoices;
          console.warn('No Japanese voices found, using any available voice');
        }
        
        // Set default voice to first available
        this.defaultVoice = this.ttsVoices[0] || null;
        
        if (this.ttsVoices.length === 0) {
          console.warn('No voices found. Text-to-speech may not work.');
        } else {
          console.log(`Loaded ${this.ttsVoices.length} voices for TTS`);
        }
      }
    } catch (error) {
      console.error('Error loading voices:', error);
      this.ttsVoices = [];
      this.defaultVoice = null;
    }
  }

  private async initializeAudioContext() {
    if (this.audioContext) return;

    try {
      if ('AudioContext' in window || 'webkitAudioContext' in window) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    } catch (error) {
      console.error('Error initializing AudioContext:', error);
      // Continue without AudioContext
    }
  }

  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  private async loadAudioFile(url: string): Promise<AudioBuffer> {
    if (this.audioCache.has(url)) {
      return this.audioCache.get(url)!;
    }

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);
      this.audioCache.set(url, audioBuffer);
      return audioBuffer;
    } catch (error) {
      console.error('Error loading audio file:', error);
      throw error;
    }
  }

  private async playAudioBuffer(buffer: AudioBuffer) {
    if (!this.audioContext) return;

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);
    source.start(0);
  }

  private async playTTS(text: string, options: AudioOptions = {}) {
    if (!('speechSynthesis' in window)) {
      throw new Error('Speech synthesis not supported');
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to set voice if specified and available
    if (options.voice && this.ttsVoices.length > 0) {
      const selectedVoice = this.ttsVoices.find(v => v.name === options.voice);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    } else if (this.defaultVoice) {
      utterance.voice = this.defaultVoice;
    }
    
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.lang = 'ja-JP';

    return new Promise<void>((resolve, reject) => {
      utterance.onend = () => resolve();
      utterance.onerror = (error) => {
        console.error('TTS error:', error);
        reject(error);
      };
      
      try {
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.error('Error starting TTS:', error);
        reject(error);
      }
    });
  }

  public async playAudio(text: string, options: AudioOptions = {}) {
    if (!this.isInitialized) {
      console.warn('AudioService not fully initialized');
      return;
    }

    // Stop any currently playing audio
    this.stopAudio();

    // Always try TTS first for better reliability
    try {
      return await this.playTTS(text, options);
    } catch (error) {
      console.error('TTS failed, trying fallback:', error);
      
      // Fallback: try to use any available voice without specific requirements
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ja-JP';
        utterance.rate = options.rate || 1;
        utterance.pitch = options.pitch || 1;
        
        return new Promise<void>((resolve, reject) => {
          utterance.onend = () => resolve();
          utterance.onerror = (error) => reject(error);
          window.speechSynthesis.speak(utterance);
        });
      } catch (fallbackError) {
        console.error('All TTS methods failed:', fallbackError);
        throw new Error('Text-to-speech is not available');
      }
    }
  }

  private getAudioHash(text: string): string {
    // Simple hash function for now - you might want to use a more robust one
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  public stopAudio() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    // Return all available voices
    return this.ttsVoices;
  }

  public isTTSSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  public isPreRecordedSupported(): boolean {
    return 'AudioContext' in window || 'webkitAudioContext' in window;
  }

  public getCacheStats() {
    return {
      size: this.getAudioGenerator().getCacheSize(),
      entryCount: this.getAudioGenerator().getCacheEntryCount()
    };
  }

  public clearAudioCache() {
    this.getAudioGenerator().clearCache();
  }

  public reloadVoices() {
    this.loadVoices();
  }

  public getTTSStatus() {
    return {
      supported: 'speechSynthesis' in window,
      voicesLoaded: this.ttsVoices.length,
      defaultVoice: this.defaultVoice?.name || 'None',
      availableVoices: this.ttsVoices.map(v => ({ name: v.name, lang: v.lang }))
    };
  }
}

export default AudioService; 