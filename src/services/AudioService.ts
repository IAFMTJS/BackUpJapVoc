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
          window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
        }

        // Initialize AudioContext only when needed
        this.audioGenerator = AudioGenerationManager.getInstance();
        this.isInitialized = true;
      }
    } catch (error) {
      console.error('Error initializing AudioService:', error);
      // Continue with limited functionality
      this.isInitialized = true;
    }
  }

  private loadVoices() {
    try {
      if ('speechSynthesis' in window) {
        const allVoices = window.speechSynthesis.getVoices();
        // Only keep Kyoko voice
        this.ttsVoices = allVoices.filter(voice => 
          voice.name.toLowerCase().includes('kyoko')
        );
        
        // Set default voice to Kyoko, or null if not available
        this.defaultVoice = this.ttsVoices[0] || null;
        
        if (this.ttsVoices.length === 0) {
          console.warn('Kyoko voice not found. Text-to-speech may not work as expected.');
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
    utterance.voice = options.voice ? 
      this.ttsVoices.find(v => v.name === options.voice) || this.defaultVoice :
      this.defaultVoice;
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.lang = 'ja-JP';

    return new Promise<void>((resolve, reject) => {
      utterance.onend = () => resolve();
      utterance.onerror = (error) => reject(error);
      window.speechSynthesis.speak(utterance);
    });
  }

  public async playAudio(text: string, options: AudioOptions = {}) {
    if (!this.isInitialized) {
      console.warn('AudioService not fully initialized');
      return;
    }

    // Stop any currently playing audio
    this.stopAudio();

    // For iOS, prefer TTS for better performance
    if (this.isIOS && (options.useTTS !== false)) {
      return this.playTTS(text, options);
    }

    try {
      // Initialize AudioContext on first use
      await this.initializeAudioContext();

      // Try to get pre-recorded audio first
      if (this.audioGenerator) {
        const audioUrl = await this.audioGenerator.getAudio({
          text,
          voice: options.voice,
          rate: options.rate,
          pitch: options.pitch
        });

        // Create and play audio element
        const audio = new Audio(audioUrl);
        this.currentAudio = audio;
        
        return new Promise<void>((resolve, reject) => {
          audio.onended = () => {
            this.currentAudio = null;
            resolve();
          };
          audio.onerror = (error) => {
            this.currentAudio = null;
            reject(error);
          };
          audio.play().catch(error => {
            // If playback fails, fall back to TTS
            console.log('Falling back to TTS for:', text);
            this.playTTS(text, options).then(resolve).catch(reject);
          });
        });
      } else {
        // If audio generator is not available, use TTS
        return this.playTTS(text, options);
      }
    } catch (error) {
      // Fallback to TTS if pre-recorded audio generation fails
      console.log('Falling back to TTS for:', text);
      return this.playTTS(text, options);
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
    // Return only Kyoko voice
    return this.ttsVoices.filter(voice => 
      voice.name.toLowerCase().includes('kyoko')
    );
  }

  public isTTSSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  public isPreRecordedSupported(): boolean {
    return 'AudioContext' in window || 'webkitAudioContext' in window;
  }

  public getCacheStats() {
    if (!this.audioGenerator) {
      return { size: 0, entryCount: 0 };
    }
    return {
      size: this.audioGenerator.getCacheSize(),
      entryCount: this.audioGenerator.getCacheEntryCount()
    };
  }

  public clearAudioCache() {
    if (this.audioGenerator) {
      this.audioGenerator.clearCache();
    }
  }
}

export default AudioService; 