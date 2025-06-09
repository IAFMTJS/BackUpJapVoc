import AudioService from '../services/AudioService';
import safeLocalStorage from './safeLocalStorage';

interface AudioGenerationOptions {
  text: string;
  voice?: string;
  rate?: number;
  pitch?: number;
  quality?: 'low' | 'medium' | 'high';
}

interface AudioCacheEntry {
  url: string;
  timestamp: number;
  size: number;
}

class AudioGenerationManager {
  private static instance: AudioGenerationManager;
  private audioService: AudioService | null = null;
  private cache: Map<string, AudioCacheEntry> = new Map();
  private isGenerating: boolean = false;
  private generationQueue: AudioGenerationOptions[] = [];
  private readonly MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB
  private readonly CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

  private constructor() {
    this.loadCache();
  }

  public static getInstance(): AudioGenerationManager {
    if (!AudioGenerationManager.instance) {
      AudioGenerationManager.instance = new AudioGenerationManager();
    }
    return AudioGenerationManager.instance;
  }

  private loadCache() {
    try {
      const savedCache = safeLocalStorage.getItem('audioCache');
      if (savedCache) {
        const parsed = JSON.parse(savedCache);
        this.cache = new Map(Object.entries(parsed));
        this.cleanCache();
      }
    } catch (error) {
      console.error('Error loading audio cache:', error);
      this.cache.clear();
    }
  }

  private saveCache() {
    try {
      const cacheObject = Object.fromEntries(this.cache);
      safeLocalStorage.setItem('audioCache', JSON.stringify(cacheObject));
    } catch (error) {
      console.error('Error saving audio cache:', error);
    }
  }

  private cleanCache() {
    const now = Date.now();
    let totalSize = 0;
    const entries = Array.from(this.cache.entries());

    // Remove expired entries
    entries.forEach(([key, entry]) => {
      if (now - entry.timestamp > this.CACHE_EXPIRY) {
        this.cache.delete(key);
      } else {
        totalSize += entry.size;
      }
    });

    // If still over size limit, remove oldest entries
    if (totalSize > this.MAX_CACHE_SIZE) {
      entries
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .forEach(([key, entry]) => {
          if (totalSize > this.MAX_CACHE_SIZE) {
            this.cache.delete(key);
            totalSize -= entry.size;
          }
        });
    }

    this.saveCache();
  }

  private getAudioService(): AudioService {
    if (!this.audioService) {
      this.audioService = AudioService.getInstance();
    }
    return this.audioService;
  }

  private async generateAudio(options: AudioGenerationOptions): Promise<string> {
    const { text, voice, rate, pitch, quality = 'medium' } = options;
    const cacheKey = this.getCacheKey(text, voice, rate, pitch, quality);

    // Check if we have a valid cached version
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_EXPIRY) {
      return cached.url;
    }

    // Generate new audio
    try {
      // Use Web Speech API to generate audio
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = voice ? 
        this.getAudioService().getAvailableVoices().find(v => v.name === voice) || null :
        null;
      utterance.rate = rate || 1;
      utterance.pitch = pitch || 1;
      utterance.lang = 'ja-JP';

      // Create audio context for recording
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const mediaStreamDestination = audioContext.createMediaStreamDestination();
      const mediaRecorder = new MediaRecorder(mediaStreamDestination.stream);
      
      const audioChunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      return new Promise((resolve, reject) => {
        mediaRecorder.onstop = async () => {
          try {
            const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
            const audioUrl = URL.createObjectURL(audioBlob);
            
            // Update cache
            this.cache.set(cacheKey, {
              url: audioUrl,
              timestamp: Date.now(),
              size: audioBlob.size
            });
            
            this.cleanCache();
            this.saveCache();
            
            resolve(audioUrl);
          } catch (error) {
            reject(error);
          }
        };

        // Start recording
        mediaRecorder.start();
        
        // Speak the text
        window.speechSynthesis.speak(utterance);
        
        // Stop recording when speech ends
        utterance.onend = () => {
          mediaRecorder.stop();
        };
        
        utterance.onerror = (error) => {
          reject(error);
        };
      });
    } catch (error) {
      console.error('Error generating audio:', error);
      throw error;
    }
  }

  private getCacheKey(text: string, voice?: string, rate?: number, pitch?: number, quality?: string): string {
    return `${text}|${voice || ''}|${rate || 1}|${pitch || 1}|${quality || 'medium'}`;
  }

  public async getAudio(options: AudioGenerationOptions): Promise<string> {
    const cacheKey = this.getCacheKey(options.text, options.voice, options.rate, options.pitch, options.quality);
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_EXPIRY) {
      return cached.url;
    }

    // Add to generation queue if not already generating
    if (!this.isGenerating) {
      this.isGenerating = true;
      try {
        const url = await this.generateAudio(options);
        this.isGenerating = false;
        
        // Process next item in queue if any
        if (this.generationQueue.length > 0) {
          const nextOptions = this.generationQueue.shift();
          if (nextOptions) {
            this.getAudio(nextOptions);
          }
        }
        
        return url;
      } catch (error) {
        this.isGenerating = false;
        throw error;
      }
    } else {
      // Add to queue if already generating
      return new Promise((resolve, reject) => {
        this.generationQueue.push({
          ...options,
          onComplete: resolve,
          onError: reject
        });
      });
    }
  }

  public clearCache() {
    this.cache.clear();
    this.saveCache();
  }

  public getCacheSize(): number {
    return Array.from(this.cache.values()).reduce((total, entry) => total + entry.size, 0);
  }

  public getCacheEntryCount(): number {
    return this.cache.size;
  }
}

export default AudioGenerationManager; 