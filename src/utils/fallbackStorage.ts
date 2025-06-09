// Fallback storage for when IndexedDB is not available
// This provides a simple in-memory storage that persists for the session
import safeLocalStorage from './safeLocalStorage';

interface FallbackStorageItem {
  key: string;
  value: any;
  timestamp: number;
}

class FallbackStorage {
  private static instance: FallbackStorage;
  private storage: Map<string, FallbackStorageItem> = new Map();
  private readonly MAX_SIZE = 1000; // Maximum number of items to store in memory

  private constructor() {
    // Load from localStorage if available (as a backup)
    this.loadFromLocalStorage();
  }

  static getInstance(): FallbackStorage {
    if (!FallbackStorage.instance) {
      FallbackStorage.instance = new FallbackStorage();
    }
    return FallbackStorage.instance;
  }

  private loadFromLocalStorage() {
    try {
      const saved = safeLocalStorage.getItem('fallbackStorage');
      if (saved) {
        const data = JSON.parse(saved);
        this.storage = new Map(Object.entries(data));
      }
    } catch (error) {
      console.warn('Failed to load fallback storage from localStorage:', error);
    }
  }

  private saveToLocalStorage() {
    try {
      const data = Object.fromEntries(this.storage);
      safeLocalStorage.setItem('fallbackStorage', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save fallback storage to localStorage:', error);
    }
  }

  async setItem(key: string, value: any): Promise<void> {
    // Clean up old items if we're at capacity
    if (this.storage.size >= this.MAX_SIZE) {
      const oldestKey = this.storage.keys().next().value;
      this.storage.delete(oldestKey);
    }

    this.storage.set(key, {
      key,
      value,
      timestamp: Date.now()
    });

    this.saveToLocalStorage();
  }

  async getItem(key: string): Promise<any | null> {
    const item = this.storage.get(key);
    return item ? item.value : null;
  }

  async removeItem(key: string): Promise<void> {
    this.storage.delete(key);
    this.saveToLocalStorage();
  }

  async clear(): Promise<void> {
    this.storage.clear();
    this.saveToLocalStorage();
  }

  async getAllKeys(): Promise<string[]> {
    return Array.from(this.storage.keys());
  }

  async hasItem(key: string): Promise<boolean> {
    return this.storage.has(key);
  }

  // Get storage statistics
  getStats(): { size: number; maxSize: number; usage: number } {
    return {
      size: this.storage.size,
      maxSize: this.MAX_SIZE,
      usage: (this.storage.size / this.MAX_SIZE) * 100
    };
  }
}

export default FallbackStorage; 