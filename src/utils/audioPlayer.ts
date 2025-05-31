class AudioPlayer {
  private audioContext: AudioContext | null = null;
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private isPlaying: boolean = false;
  private currentSource: AudioBufferSourceNode | null = null;

  constructor() {
    // Initialize audio context on user interaction
    if (typeof window !== 'undefined') {
      window.addEventListener('click', this.initializeAudioContext.bind(this), { once: true });
    }
  }

  private async initializeAudioContext() {
    if (this.audioContext) return;

    try {
      // Create audio context with iOS compatibility
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContext();
      
      // Resume audio context (required for iOS)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
    } catch (error) {
      console.error('[AudioPlayer] Failed to initialize audio context:', error);
    }
  }

  async loadAudio(url: string): Promise<AudioBuffer> {
    if (!this.audioContext) {
      await this.initializeAudioContext();
    }

    if (!this.audioContext) {
      throw new Error('Audio context not available');
    }

    // Return cached buffer if available
    if (this.audioBuffers.has(url)) {
      return this.audioBuffers.get(url)!;
    }

    try {
      // Fetch and decode audio data
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      // Cache the buffer
      this.audioBuffers.set(url, audioBuffer);
      
      return audioBuffer;
    } catch (error) {
      console.error('[AudioPlayer] Failed to load audio:', error);
      throw error;
    }
  }

  async playAudio(url: string): Promise<void> {
    if (this.isPlaying) {
      this.stopAudio();
    }

    try {
      const buffer = await this.loadAudio(url);
      
      if (!this.audioContext) {
        throw new Error('Audio context not available');
      }

      // Create and configure source
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioContext.destination);
      
      // Store current source for stopping
      this.currentSource = source;
      this.isPlaying = true;

      // Play the audio
      source.start(0);
      
      // Handle playback end
      source.onended = () => {
        this.isPlaying = false;
        this.currentSource = null;
      };
    } catch (error) {
      console.error('[AudioPlayer] Failed to play audio:', error);
      this.isPlaying = false;
      throw error;
    }
  }

  stopAudio(): void {
    if (this.currentSource) {
      try {
        this.currentSource.stop();
      } catch (error) {
        // Ignore errors from already stopped sources
      }
      this.currentSource = null;
    }
    this.isPlaying = false;
  }

  isAudioPlaying(): boolean {
    return this.isPlaying;
  }

  // Clean up resources
  dispose(): void {
    this.stopAudio();
    this.audioBuffers.clear();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// Create a singleton instance
export const audioPlayer = new AudioPlayer(); 