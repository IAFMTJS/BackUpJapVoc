import safeIndexedDB from './safeIndexedDB';
import FallbackStorage from './fallbackStorage';

// Comprehensive database wrapper that handles IndexedDB failures gracefully
export class SafeDatabase {
  private static instance: SafeDatabase;
  private fallbackStorage: FallbackStorage;
  private isUsingFallback: boolean = false;

  private constructor() {
    this.fallbackStorage = FallbackStorage.getInstance();
  }

  static getInstance(): SafeDatabase {
    if (!SafeDatabase.instance) {
      SafeDatabase.instance = new SafeDatabase();
    }
    return SafeDatabase.instance;
  }

  // Check if we're using fallback storage
  isUsingFallbackStorage(): boolean {
    return this.isUsingFallback;
  }

  // Generic set method that works with both IndexedDB and fallback
  async set(key: string, value: any): Promise<void> {
    if (this.isUsingFallback) {
      await this.fallbackStorage.setItem(key, value);
      return;
    }

    try {
      // Try to use IndexedDB first
      const db = await safeIndexedDB.open('SafeDB', 1);
      const transaction = db.transaction(['data'], 'readwrite');
      const store = transaction.objectStore('data');
      
      return new Promise((resolve, reject) => {
        const request = store.put({ key, value, timestamp: Date.now() });
        request.onsuccess = () => resolve();
        request.onerror = () => {
          console.warn('IndexedDB write failed, switching to fallback storage');
          this.isUsingFallback = true;
          this.fallbackStorage.setItem(key, value).then(resolve).catch(reject);
        };
      });
    } catch (error) {
      console.warn('IndexedDB not available, using fallback storage');
      this.isUsingFallback = true;
      await this.fallbackStorage.setItem(key, value);
    }
  }

  // Generic get method that works with both IndexedDB and fallback
  async get(key: string): Promise<any | null> {
    if (this.isUsingFallback) {
      return await this.fallbackStorage.getItem(key);
    }

    try {
      // Try to use IndexedDB first
      const db = await safeIndexedDB.open('SafeDB', 1);
      const transaction = db.transaction(['data'], 'readonly');
      const store = transaction.objectStore('data');
      
      return new Promise((resolve) => {
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result?.value || null);
        request.onerror = () => {
          console.warn('IndexedDB read failed, switching to fallback storage');
          this.isUsingFallback = true;
          this.fallbackStorage.getItem(key).then(resolve);
        };
      });
    } catch (error) {
      console.warn('IndexedDB not available, using fallback storage');
      this.isUsingFallback = true;
      return await this.fallbackStorage.getItem(key);
    }
  }

  // Generic delete method
  async delete(key: string): Promise<void> {
    if (this.isUsingFallback) {
      await this.fallbackStorage.removeItem(key);
      return;
    }

    try {
      const db = await safeIndexedDB.open('SafeDB', 1);
      const transaction = db.transaction(['data'], 'readwrite');
      const store = transaction.objectStore('data');
      
      return new Promise((resolve, reject) => {
        const request = store.delete(key);
        request.onsuccess = () => resolve();
        request.onerror = () => {
          console.warn('IndexedDB delete failed, switching to fallback storage');
          this.isUsingFallback = true;
          this.fallbackStorage.removeItem(key).then(resolve).catch(reject);
        };
      });
    } catch (error) {
      console.warn('IndexedDB not available, using fallback storage');
      this.isUsingFallback = true;
      await this.fallbackStorage.removeItem(key);
    }
  }

  // Generic clear method
  async clear(): Promise<void> {
    if (this.isUsingFallback) {
      await this.fallbackStorage.clear();
      return;
    }

    try {
      const db = await safeIndexedDB.open('SafeDB', 1);
      const transaction = db.transaction(['data'], 'readwrite');
      const store = transaction.objectStore('data');
      
      return new Promise((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => {
          console.warn('IndexedDB clear failed, switching to fallback storage');
          this.isUsingFallback = true;
          this.fallbackStorage.clear().then(resolve).catch(reject);
        };
      });
    } catch (error) {
      console.warn('IndexedDB not available, using fallback storage');
      this.isUsingFallback = true;
      await this.fallbackStorage.clear();
    }
  }

  // Get all keys
  async getAllKeys(): Promise<string[]> {
    if (this.isUsingFallback) {
      return await this.fallbackStorage.getAllKeys();
    }

    try {
      const db = await safeIndexedDB.open('SafeDB', 1);
      const transaction = db.transaction(['data'], 'readonly');
      const store = transaction.objectStore('data');
      
      return new Promise((resolve) => {
        const request = store.getAllKeys();
        request.onsuccess = () => resolve(Array.from(request.result as IDBValidKey[]).map(key => key.toString()));
        request.onerror = () => {
          console.warn('IndexedDB getAllKeys failed, switching to fallback storage');
          this.isUsingFallback = true;
          this.fallbackStorage.getAllKeys().then(resolve);
        };
      });
    } catch (error) {
      console.warn('IndexedDB not available, using fallback storage');
      this.isUsingFallback = true;
      return await this.fallbackStorage.getAllKeys();
    }
  }

  // Get storage statistics
  async getStats(): Promise<{ type: 'indexeddb' | 'fallback'; size: number; maxSize?: number; usage?: number }> {
    if (this.isUsingFallback) {
      const stats = this.fallbackStorage.getStats();
      return {
        type: 'fallback',
        size: stats.size,
        maxSize: stats.maxSize,
        usage: stats.usage
      };
    }

    try {
      const db = await safeIndexedDB.open('SafeDB', 1);
      const transaction = db.transaction(['data'], 'readonly');
      const store = transaction.objectStore('data');
      
      return new Promise((resolve) => {
        const request = store.count();
        request.onsuccess = () => resolve({ type: 'indexeddb', size: request.result });
        request.onerror = () => {
          console.warn('IndexedDB stats failed, switching to fallback storage');
          this.isUsingFallback = true;
          const stats = this.fallbackStorage.getStats();
          resolve({
            type: 'fallback',
            size: stats.size,
            maxSize: stats.maxSize,
            usage: stats.usage
          });
        };
      });
    } catch (error) {
      console.warn('IndexedDB not available, using fallback storage');
      this.isUsingFallback = true;
      const stats = this.fallbackStorage.getStats();
      return {
        type: 'fallback',
        size: stats.size,
        maxSize: stats.maxSize,
        usage: stats.usage
      };
    }
  }
}

// Initialize the database with proper store creation
export async function initializeSafeDatabase(): Promise<void> {
  try {
    const db = await safeIndexedDB.open('SafeDB', 1);
    
    // Create the data store if it doesn't exist
    if (!db.objectStoreNames.contains('data')) {
      db.createObjectStore('data', { keyPath: 'key' });
    }
    
    console.log('Safe database initialized successfully');
  } catch (error) {
    console.warn('Failed to initialize IndexedDB, will use fallback storage:', error);
  }
}

export default SafeDatabase; 