import { SHA1 } from 'crypto-js';
import { getAudio, setAudio } from '../utils/AudioCache';

interface AudioCacheStats {
  totalSize: number;
  fileCount: number;
  lastAccessed: { [key: string]: number };
}

interface AudioQualitySettings {
  quality: 'high' | 'low';
  preloadLevel: number;
  maxCacheSize: number;
}

export class AudioManager {
  private static instance: AudioManager;
  private cacheStats: AudioCacheStats = {
    totalSize: 0,
    fileCount: 0,
    lastAccessed: {}
  };
  private settings: AudioQualitySettings = {
    quality: 'high',
    preloadLevel: 1,
    maxCacheSize: 50 * 1024 * 1024 // 50MB default
  };
  private downloadProgress: { [key: string]: number } = {};
  private downloadCallbacks: { [key: string]: ((progress: number) => void)[] } = {};

  private constructor() {
    this.initializeCache();
  }

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  private async initializeCache() {
    try {
      const cache = await caches.open('japvoc-audio-v1.0.0');
      const keys = await cache.keys();
      
      // Update cache stats
      this.cacheStats.fileCount = keys.length;
      this.cacheStats.totalSize = await this.calculateCacheSize(cache);
      
      // Initialize last accessed times
      for (const request of keys) {
        const url = request.url;
        this.cacheStats.lastAccessed[url] = Date.now();
      }
    } catch (error) {
      console.error('Failed to initialize audio cache:', error);
    }
  }

  private async calculateCacheSize(cache: Cache): Promise<number> {
    const keys = await cache.keys();
    let totalSize = 0;
    
    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
    
    return totalSize;
  }

  async preloadLevelAudio(level: number, onProgress?: (progress: number) => void) {
    const audioFiles = await this.getLevelAudioFiles(level);
    let loaded = 0;
    const total = audioFiles.length;
    for (const file of audioFiles) {
      try {
        // Use filename from path
        const filename = file.split('/').pop() || file;
        // Check if already cached in IndexedDB
        const alreadyCached = await getAudio(filename);
        if (!alreadyCached) {
          const response = await fetch(file);
          if (!response.ok) throw new Error(`Failed to fetch ${file}`);
          const blob = await response.blob();
          await setAudio(filename, blob);
          this.cacheStats.totalSize += blob.size;
          this.cacheStats.fileCount++;
        }
        loaded++;
        const progress = (loaded / total) * 100;
        onProgress?.(progress);
      } catch (error) {
        console.error(`Failed to preload audio file ${file}:`, error);
      }
    }
  }

  private async getLevelAudioFiles(level: number): Promise<string[]> {
    // This would be replaced with actual logic to get audio files for a level
    return [`/audio/level${level}/*.mp3`];
  }

  private async manageCacheSize() {
    if (this.cacheStats.totalSize > this.settings.maxCacheSize) {
      await this.cleanupLeastUsedAudio();
    }
  }

  private async cleanupLeastUsedAudio() {
    const cache = await caches.open('japvoc-audio-v1.0.0');
    const keys = await cache.keys();
    
    // Sort by last accessed time
    const sortedKeys = keys.sort((a, b) => {
      const timeA = this.cacheStats.lastAccessed[a.url] || 0;
      const timeB = this.cacheStats.lastAccessed[b.url] || 0;
      return timeA - timeB;
    });
    
    // Remove oldest files until we're under the limit
    for (const request of sortedKeys) {
      if (this.cacheStats.totalSize <= this.settings.maxCacheSize) break;
      
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        this.cacheStats.totalSize -= blob.size;
        this.cacheStats.fileCount--;
        delete this.cacheStats.lastAccessed[request.url];
        await cache.delete(request);
      }
    }
  }

  async playAudio(text: string, onProgress?: (progress: number) => void): Promise<void> {
    const hash = SHA1(text).toString();
    const filename = `${hash}.mp3`;
    const audioPath = `/audio/${filename}`;
    this.cacheStats.lastAccessed[audioPath] = Date.now();
    try {
      // Try to play from IndexedDB cache first
      let blob = await getAudio(filename);
      if (!blob) {
        // If not in cache, fetch and cache
        const response = await fetch(audioPath);
        if (!response.ok) throw new Error(`Failed to fetch audio: ${response.status}`);
        blob = await response.blob();
        await setAudio(filename, blob);
        this.cacheStats.totalSize += blob.size;
        this.cacheStats.fileCount++;
      }
      // Play the audio from blob
      const audio = new Audio(URL.createObjectURL(blob));
      await audio.play();
    } catch (error) {
      console.error('Failed to play audio:', error);
      this.useWebSpeechFallback(text);
    }
  }

  private useWebSpeechFallback(text: string) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    speechSynthesis.speak(utterance);
  }

  setQualitySettings(settings: Partial<AudioQualitySettings>) {
    this.settings = { ...this.settings, ...settings };
  }

  getCacheStats(): AudioCacheStats {
    return { ...this.cacheStats };
  }

  getDownloadProgress(file: string): number {
    return this.downloadProgress[file] || 0;
  }

  onDownloadProgress(file: string, callback: (progress: number) => void) {
    if (!this.downloadCallbacks[file]) {
      this.downloadCallbacks[file] = [];
    }
    this.downloadCallbacks[file].push(callback);
  }
} 