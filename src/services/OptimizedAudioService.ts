import { getAudio, setAudio } from '../utils/AudioCache';

interface AudioLoadOptions {
  priority?: 'high' | 'normal' | 'low';
  preload?: boolean;
  quality?: 'high' | 'medium' | 'low';
}

interface DeviceCapabilities {
  isMobile: boolean;
  hasLowMemory: boolean;
  hasSlowNetwork: boolean;
  hasLowBattery: boolean;
}

interface CacheProgress {
  cached: number;
  total: number;
  status: 'idle' | 'loading' | 'complete' | 'error';
}

class OptimizedAudioService {
  private static instance: OptimizedAudioService;
  private audioContext: AudioContext | null = null;
  private memoryCache: Map<string, AudioBuffer> = new Map();
  private loadingQueue: Map<string, Promise<AudioBuffer>> = new Map();
  private preloadQueue: Set<string> = new Set();
  private isInitialized = false;
  private currentProgress: CacheProgress = {
    cached: 0,
    total: 0,
    status: 'idle'
  };
  private progressCallbacks: Set<(progress: CacheProgress) => void> = new Set();
  private deviceCapabilities: DeviceCapabilities = {
    isMobile: false,
    hasLowMemory: false,
    hasSlowNetwork: false,
    hasLowBattery: false
  };
  private readonly MOBILE_MAX_MEMORY_CACHE_SIZE = 20; // Reduced for mobile
  private readonly DESKTOP_MAX_MEMORY_CACHE_SIZE = 50;
  private readonly MOBILE_PRELOAD_BATCH_SIZE = 3; // Reduced for mobile
  private readonly DESKTOP_PRELOAD_BATCH_SIZE = 5;
  private readonly QUALITY_SETTINGS = {
    high: { bitrate: 128, sampleRate: 44100 },
    medium: { bitrate: 96, sampleRate: 32000 },
    low: { bitrate: 64, sampleRate: 22050 }
  };

  private constructor() {
    if (typeof window !== 'undefined') {
      this.detectDeviceCapabilities();
      // Initialize on first user interaction
      window.addEventListener('click', this.initialize.bind(this), { once: true });
      // Monitor device state
      this.setupDeviceMonitoring();
    }
  }

  static getInstance(): OptimizedAudioService {
    if (!OptimizedAudioService.instance) {
      OptimizedAudioService.instance = new OptimizedAudioService();
    }
    return OptimizedAudioService.instance;
  }

  private async initialize() {
    if (this.isInitialized) return;
    
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.isInitialized = true;
      
      // Start preloading high-priority audio files
      this.startPreloadQueue();
    } catch (error) {
      console.error('[OptimizedAudioService] Initialization error:', error);
    }
  }

  private async startPreloadQueue() {
    if (this.preloadQueue.size === 0) {
      this.updateProgress(this.currentProgress.cached, this.currentProgress.total, 'complete');
      return;
    }

    const batch = Array.from(this.preloadQueue).slice(0, this.PRELOAD_BATCH_SIZE);
    this.preloadQueue = new Set(Array.from(this.preloadQueue).slice(this.PRELOAD_BATCH_SIZE));

    try {
      await Promise.all(
        batch.map(async url => {
          try {
            await this.loadAudio(url, { priority: 'low', preload: true });
            this.updateProgress(
              this.currentProgress.cached + 1,
              this.currentProgress.total
            );
          } catch (error) {
            console.error(`Failed to preload audio file ${url}:`, error);
          }
        })
      );

      // Continue with next batch if queue is not empty
      if (this.preloadQueue.size > 0) {
        setTimeout(() => this.startPreloadQueue(), 1000);
      } else {
        this.updateProgress(this.currentProgress.cached, this.currentProgress.total, 'complete');
      }
    } catch (error) {
      console.error('Error in preload queue:', error);
      this.updateProgress(this.currentProgress.cached, this.currentProgress.total, 'error');
    }
  }

  private async loadAudioFromCache(url: string): Promise<AudioBuffer | null> {
    try {
      const filename = url.split('/').pop() || url;
      const cachedBlob = await getAudio(filename);
      
      if (cachedBlob && this.audioContext) {
        const arrayBuffer = await cachedBlob.arrayBuffer();
        return await this.audioContext.decodeAudioData(arrayBuffer);
      }
    } catch (error) {
      console.warn('[OptimizedAudioService] Cache load error:', error);
    }
    return null;
  }

  private async loadAudioFromNetwork(url: string, options: AudioLoadOptions): Promise<AudioBuffer> {
    if (!this.audioContext) {
      throw new Error('Audio context not initialized');
    }

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      // Cache the audio file
      const filename = url.split('/').pop() || url;
      const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
      await setAudio(filename, blob);

      return audioBuffer;
    } catch (error) {
      console.error('[OptimizedAudioService] Network load error:', error);
      throw error;
    }
  }

  private manageMemoryCache() {
    if (this.memoryCache.size > this.MAX_MEMORY_CACHE_SIZE) {
      // Remove oldest entries when cache is full
      const entriesToRemove = this.memoryCache.size - this.MAX_MEMORY_CACHE_SIZE;
      const keys = Array.from(this.memoryCache.keys()).slice(0, entriesToRemove);
      keys.forEach(key => this.memoryCache.delete(key));
    }
  }

  private detectDeviceCapabilities() {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    
    // Check for low memory devices (less than 4GB RAM)
    const hasLowMemory = isMobile && (navigator as any).deviceMemory < 4;
    
    // Check for slow network
    const hasSlowNetwork = isMobile && (navigator as any).connection?.effectiveType === '2g';
    
    // Check for low battery
    const hasLowBattery = isMobile && (navigator as any).getBattery?.()?.then(battery => battery.level < 0.2);

    this.deviceCapabilities = {
      isMobile,
      hasLowMemory,
      hasSlowNetwork,
      hasLowBattery: false // Will be updated by battery monitoring
    };
  }

  private setupDeviceMonitoring() {
    // Monitor network changes
    if ('connection' in navigator) {
      (navigator as any).connection.addEventListener('change', () => {
        this.deviceCapabilities.hasSlowNetwork = (navigator as any).connection.effectiveType === '2g';
        this.adjustResourceUsage();
      });
    }

    // Monitor battery status
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then(battery => {
        battery.addEventListener('levelchange', () => {
          this.deviceCapabilities.hasLowBattery = battery.level < 0.2;
          this.adjustResourceUsage();
        });
      });
    }

    // Monitor memory pressure
    if ('memory' in performance) {
      setInterval(() => {
        const memoryInfo = (performance as any).memory;
        if (memoryInfo && memoryInfo.usedJSHeapSize > memoryInfo.jsHeapSizeLimit * 0.8) {
          this.deviceCapabilities.hasLowMemory = true;
          this.adjustResourceUsage();
        }
      }, 5000);
    }
  }

  private adjustResourceUsage() {
    // Clear memory cache if device is under pressure
    if (this.deviceCapabilities.hasLowMemory || this.deviceCapabilities.hasLowBattery) {
      this.memoryCache.clear();
    }

    // Adjust preload batch size based on network
    if (this.deviceCapabilities.hasSlowNetwork) {
      this.PRELOAD_BATCH_SIZE = 2;
    } else {
      this.PRELOAD_BATCH_SIZE = this.deviceCapabilities.isMobile ? 
        this.MOBILE_PRELOAD_BATCH_SIZE : 
        this.DESKTOP_PRELOAD_BATCH_SIZE;
    }
  }

  private getMaxMemoryCacheSize(): number {
    return this.deviceCapabilities.isMobile ? 
      this.MOBILE_MAX_MEMORY_CACHE_SIZE : 
      this.DESKTOP_MAX_MEMORY_CACHE_SIZE;
  }

  private getQualitySetting(): 'high' | 'medium' | 'low' {
    if (this.deviceCapabilities.hasSlowNetwork || this.deviceCapabilities.hasLowBattery) {
      return 'low';
    }
    if (this.deviceCapabilities.hasLowMemory) {
      return 'medium';
    }
    return 'high';
  }

  async loadAudio(url: string, options: AudioLoadOptions = {}): Promise<AudioBuffer> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Adjust quality based on device capabilities
    const quality = this.getQualitySetting();
    options.quality = options.quality || quality;

    // Return from memory cache if available
    if (this.memoryCache.has(url)) {
      return this.memoryCache.get(url)!;
    }

    // Return existing loading promise if already loading
    if (this.loadingQueue.has(url)) {
      return this.loadingQueue.get(url)!;
    }

    // Create new loading promise
    const loadPromise = (async () => {
      try {
        // Try loading from cache first
        let audioBuffer = await this.loadAudioFromCache(url);
        
        // If not in cache, load from network
        if (!audioBuffer) {
          audioBuffer = await this.loadAudioFromNetwork(url, options);
        }

        // Store in memory cache if we have space
        if (this.memoryCache.size < this.getMaxMemoryCacheSize()) {
          this.memoryCache.set(url, audioBuffer);
        }

        return audioBuffer;
      } finally {
        this.loadingQueue.delete(url);
      }
    })();

    // Store loading promise
    this.loadingQueue.set(url, loadPromise);

    return loadPromise;
  }

  async playAudio(url: string, options: AudioLoadOptions = {}): Promise<void> {
    try {
      const buffer = await this.loadAudio(url, options);
      
      if (!this.audioContext) {
        throw new Error('Audio context not available');
      }

      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioContext.destination);
      
      return new Promise((resolve, reject) => {
        source.onended = resolve;
        source.onerror = reject;
        source.start(0);
      });
    } catch (error) {
      console.error('[OptimizedAudioService] Play error:', error);
      throw error;
    }
  }

  preloadAudio(urls: string[]): void {
    if (urls.length === 0) return;
    
    // Reset progress
    this.updateProgress(0, urls.length, 'loading');
    
    // Add all URLs to preload queue
    urls.forEach(url => this.preloadQueue.add(url));
    
    // Start preloading if not already in progress
    if (this.preloadQueue.size > 0 && !this.loadingQueue.size) {
      this.startPreloadQueue();
    }
  }

  clearCache(): void {
    this.memoryCache.clear();
    this.loadingQueue.clear();
    this.preloadQueue.clear();
  }

  private updateProgress(cached: number, total: number, status: CacheProgress['status'] = 'loading') {
    this.currentProgress = { cached, total, status };
    this.progressCallbacks.forEach(callback => callback(this.currentProgress));
  }

  getCacheProgress(): CacheProgress {
    return { ...this.currentProgress };
  }

  onProgressUpdate(callback: (progress: CacheProgress) => void): () => void {
    this.progressCallbacks.add(callback);
    // Immediately send current progress
    callback(this.currentProgress);
    // Return cleanup function
    return () => this.progressCallbacks.delete(callback);
  }
}

export const optimizedAudioService = OptimizedAudioService.getInstance(); 