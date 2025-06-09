// Unified Audio Cache Utility using IndexedDB

import { getDatabase } from './databaseConfig';
import safeIndexedDB from './safeIndexedDB';

const DB_NAME = 'JapaneseAudioDB';
const STORE_NAME = 'audioFiles';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return safeIndexedDB.open(DB_NAME, DB_VERSION).catch((error) => {
    console.warn('Failed to open audio cache database:', error);
    throw new Error('Audio cache unavailable - please check your browser settings');
  });
}

export async function getAudio(id: string): Promise<Blob | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction([STORE_NAME], 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result ? req.result.blob : null);
      req.onerror = () => {
        console.warn('Error getting audio from cache:', req.error);
        resolve(null);
      };
    });
  } catch (error) {
    console.warn('Audio cache unavailable:', error);
    return null;
  }
}

export async function setAudio(id: string, blob: Blob): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put({ id, blob });
      req.onsuccess = () => resolve();
      req.onerror = () => {
        console.warn('Error setting audio in cache:', req.error);
        reject(req.error);
      };
    });
  } catch (error) {
    console.warn('Audio cache unavailable for writing:', error);
    // Don't throw - just log the warning
  }
}

export async function hasAudio(id: string): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction([STORE_NAME], 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getKey(id);
      req.onsuccess = () => resolve(!!req.result);
      req.onerror = () => {
        console.warn('Error checking audio in cache:', req.error);
        resolve(false);
      };
    });
  } catch (error) {
    console.warn('Audio cache unavailable for checking:', error);
    return false;
  }
}

export async function clearCache(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => {
        console.warn('Error clearing audio cache:', req.error);
        reject(req.error);
      };
    });
  } catch (error) {
    console.warn('Audio cache unavailable for clearing:', error);
    throw error;
  }
}

export async function getCacheStats(): Promise<{ fileCount: number; totalSize: number }> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction([STORE_NAME], 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const files = req.result || [];
        const fileCount = files.length;
        const totalSize = files.reduce((sum: number, f: any) => sum + (f.blob?.size || 0), 0);
        resolve({ fileCount, totalSize });
      };
      req.onerror = () => {
        console.warn('Error getting cache stats:', req.error);
        resolve({ fileCount: 0, totalSize: 0 });
      };
    });
  } catch (error) {
    console.warn('Audio cache unavailable for stats:', error);
    return { fileCount: 0, totalSize: 0 };
  }
}

export class AudioCache {
  private static instance: AudioCache;
  private cache: Map<string, Blob> = new Map();
  private db: IDBDatabase | null = null;

  private constructor() {
    this.initializeCache();
  }

  static getInstance(): AudioCache {
    if (!AudioCache.instance) {
      AudioCache.instance = new AudioCache();
    }
    return AudioCache.instance;
  }

  private async initializeCache() {
    try {
      this.db = await getDatabase();
      // Load cached audio files from IndexedDB
      const tx = this.db.transaction('audioCache', 'readonly');
      const store = tx.objectStore('audioCache');
      const cachedFiles = await store.getAll();
      
      // Convert cached files to Blobs and store in memory
      for (const file of cachedFiles) {
        this.cache.set(file.key, new Blob([file.data], { type: 'audio/mpeg' }));
      }
    } catch (error) {
      console.warn('Error initializing audio cache:', error);
      // Continue without cache - app will still work
    }
  }
} 