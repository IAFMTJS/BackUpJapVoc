// Unified Audio Cache Utility using IndexedDB

import { getDatabase } from './databaseConfig';

const DB_NAME = 'JapaneseAudioDB';
const STORE_NAME = 'audioFiles';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

export async function getAudio(id: string): Promise<Blob | null> {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction([STORE_NAME], 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result ? req.result.blob : null);
    req.onerror = () => resolve(null);
  });
}

export async function setAudio(id: string, blob: Blob): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put({ id, blob });
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function hasAudio(id: string): Promise<boolean> {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction([STORE_NAME], 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getKey(id);
    req.onsuccess = () => resolve(!!req.result);
    req.onerror = () => resolve(false);
  });
}

export async function clearCache(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getCacheStats(): Promise<{ fileCount: number; totalSize: number }> {
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
    req.onerror = () => resolve({ fileCount: 0, totalSize: 0 });
  });
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
      console.error('Error initializing audio cache:', error);
    }
  }
} 