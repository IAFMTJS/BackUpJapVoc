// Unified Audio Cache Utility using IndexedDB

import { getDatabase } from './databaseConfig';
import safeIndexedDB from './safeIndexedDB';

const DB_NAME = 'JapaneseAudioDB';
const STORE_NAME = 'audioFiles';
const DB_VERSION = 1;

// Initialize the audio database with proper schema
async function initializeAudioDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = safeIndexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => {
      console.warn('Failed to open audio cache database:', request.error);
      reject(new Error('Audio cache unavailable'));
    };
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create the object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        console.log('Created audio cache store:', STORE_NAME);
      }
    };
  });
}

function openDB(): Promise<IDBDatabase> {
  return initializeAudioDB().catch((error) => {
    console.warn('Failed to initialize audio cache database:', error);
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
      // Try to use the main database first
      const mainDb = await getDatabase();
      
      // Check if the audioFiles store exists in the main database
      if (mainDb.objectStoreNames.contains('audioFiles')) {
        // Load cached audio files from the main database
        const tx = mainDb.transaction('audioFiles', 'readonly');
        const store = tx.objectStore('audioFiles');
        const cachedFiles = await store.getAll();
        
        // Convert cached files to Blobs and store in memory
        for (const file of cachedFiles) {
          if (file.blob) {
            this.cache.set(file.id, file.blob);
          }
        }
      } else {
        console.warn('AudioFiles store not found in main database, using separate audio cache');
        // Fallback to separate audio database
        this.db = await openDB();
      }
    } catch (error) {
      console.warn('Error initializing audio cache:', error);
      // Continue without cache - app will still work
    }
  }
} 