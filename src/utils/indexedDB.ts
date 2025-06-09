import { ProgressItem, PendingProgressItem, Settings } from '../types';
import { DB_CONFIG as MainDBConfig } from './databaseConfig';
import safeIndexedDB from './safeIndexedDB';

// Use the same database configuration as databaseConfig.ts
const DB_CONFIG = {
  ...MainDBConfig,
  stores: {
    words: {
      name: 'words',
      keyPath: 'id',
      indexes: [
        { name: 'by-japanese', keyPath: 'japanese', unique: false },
        { name: 'by-english', keyPath: 'english', unique: false },
        { name: 'by-romaji', keyPath: 'romaji', unique: false },
        { name: 'by-level', keyPath: 'level', unique: false },
        { name: 'by-category', keyPath: 'category', unique: false },
        { name: 'by-jlpt', keyPath: 'jlptLevel', unique: false },
        { name: 'by-mastery', keyPath: 'mastery.level', unique: false },
        { name: 'by-last-viewed', keyPath: 'lastViewed', unique: false },
        { name: 'by-emotional-context', keyPath: 'emotionalContext.category', unique: false }
      ]
    },
    progress: {
      name: 'progress',
      keyPath: 'id',
      indexes: [
        { name: 'userId', keyPath: 'userId', unique: false },
        { name: 'section', keyPath: 'section', unique: false },
        { name: 'timestamp', keyPath: 'timestamp', unique: false }
      ]
    },
    pending: {
      name: 'pending',
      keyPath: 'id',
      indexes: [
        { name: 'userId', keyPath: 'userId', unique: false },
        { name: 'timestamp', keyPath: 'timestamp', unique: false },
        { name: 'status', keyPath: 'status', unique: false }
      ]
    },
    settings: {
      name: 'settings',
      keyPath: 'userId',
      indexes: [
        { name: 'lastSync', keyPath: 'lastSync', unique: false }
      ]
    },
    srsItems: {
      name: 'srsItems',
      keyPath: 'id',
      indexes: [
        { name: 'wordId', keyPath: 'word.japanese', unique: true },
        { name: 'level', keyPath: 'level', unique: false },
        { name: 'nextReview', keyPath: 'nextReview', unique: false },
        { name: 'lastReview', keyPath: 'lastReview', unique: false }
      ]
    }
  }
} as const;

// Migration types
type Migration = {
  version: number;
  upgrade: (db: IDBDatabase, transaction: IDBTransaction) => Promise<void>;
};

// Migration definitions
const migrations: Migration[] = [
  {
    version: 2,
    upgrade: async (db: IDBDatabase, transaction: IDBTransaction) => {
      console.log('[IndexedDB] Starting migration to version 1...');
      try {
        // Create words store
        console.log('[IndexedDB] Creating words store...');
        const wordsStore = db.createObjectStore(DB_CONFIG.stores.words.name, {
          keyPath: DB_CONFIG.stores.words.keyPath
        });
        console.log('[IndexedDB] Creating words store indexes...');
        DB_CONFIG.stores.words.indexes.forEach(index => {
          wordsStore.createIndex(index.name, index.keyPath, { unique: index.unique });
        });
        console.log('[IndexedDB] Words store created successfully');

        // Create progress store
        console.log('[IndexedDB] Creating progress store...');
        const progressStore = db.createObjectStore(DB_CONFIG.stores.progress.name, {
          keyPath: DB_CONFIG.stores.progress.keyPath
        });
        console.log('[IndexedDB] Creating progress store indexes...');
        DB_CONFIG.stores.progress.indexes.forEach(index => {
          progressStore.createIndex(index.name, index.keyPath, { unique: index.unique });
        });
        console.log('[IndexedDB] Progress store created successfully');

        // Create pending store
        console.log('[IndexedDB] Creating pending store...');
        const pendingStore = db.createObjectStore(DB_CONFIG.stores.pending.name, {
          keyPath: DB_CONFIG.stores.pending.keyPath
        });
        console.log('[IndexedDB] Creating pending store indexes...');
        DB_CONFIG.stores.pending.indexes.forEach(index => {
          pendingStore.createIndex(index.name, index.keyPath, { unique: index.unique });
        });
        console.log('[IndexedDB] Pending store created successfully');

        // Create settings store
        console.log('[IndexedDB] Creating settings store...');
        const settingsStore = db.createObjectStore(DB_CONFIG.stores.settings.name, {
          keyPath: DB_CONFIG.stores.settings.keyPath
        });
        console.log('[IndexedDB] Creating settings store indexes...');
        DB_CONFIG.stores.settings.indexes.forEach(index => {
          settingsStore.createIndex(index.name, index.keyPath, { unique: index.unique });
        });
        console.log('[IndexedDB] Settings store created successfully');

        // Create SRS items store
        console.log('[IndexedDB] Creating SRS items store...');
        const srsStore = db.createObjectStore(DB_CONFIG.stores.srsItems.name, {
          keyPath: DB_CONFIG.stores.srsItems.keyPath
        });
        console.log('[IndexedDB] Creating SRS items store indexes...');
        DB_CONFIG.stores.srsItems.indexes.forEach(index => {
          srsStore.createIndex(index.name, index.keyPath, { unique: index.unique });
        });
        console.log('[IndexedDB] SRS items store created successfully');

        // Initialize default settings
        console.log('[IndexedDB] Initializing default settings...');
        const defaultSettings: Settings = {
          userId: 'default',
          lastSync: Date.now(),
          offlineMode: false,
          notifications: true,
          theme: 'light',
          fontSize: 'medium',
          quizSettings: {
            showRomaji: true,
            showHiragana: true,
            showKatakana: true,
            showKanji: true,
            randomize: true,
            timeLimit: 30
          }
        };

        await new Promise<void>((resolve, reject) => {
          try {
            const request = transaction.objectStore(DB_CONFIG.stores.settings.name).add(defaultSettings);
            request.onsuccess = () => {
              console.log('[IndexedDB] Default settings initialized successfully');
              resolve();
            };
            request.onerror = () => {
              console.error('[IndexedDB] Failed to initialize default settings:', request.error);
              reject(request.error);
            };
          } catch (error) {
            console.error('[IndexedDB] Error during default settings initialization:', error);
            reject(error);
          }
        });

        console.log('[IndexedDB] Migration to version 1 completed successfully');
      } catch (error) {
        console.error('[IndexedDB] Migration to version 1 failed:', error);
        throw error;
      }
    }
  }
];

// Database connection management
let dbConnection: IDBDatabase | null = null;
let connectionPromise: Promise<IDBDatabase> | null = null;
let isInitializing = false;
let connectionTimeout: NodeJS.Timeout | null = null;
const INIT_TIMEOUT = 60000; // 60 seconds
const MAX_RETRIES = 5;
const RETRY_DELAY = 2000;

// Helper function to cleanup connection state
function cleanupConnectionState() {
  if (connectionTimeout) {
    clearTimeout(connectionTimeout);
    connectionTimeout = null;
  }
  connectionPromise = null;
  isInitializing = false;
}

// Helper function to delete the database
export const deleteDB = async (dbName: string): Promise<void> => {
  console.log(`Deleting database: ${dbName}`);
  try {
    // Close any existing connections
    const db = await openDB();
    if (db) {
      db.close();
    }

    // Use safe IndexedDB wrapper
    await safeIndexedDB.deleteDatabase(dbName);
    console.log(`Database ${dbName} deleted successfully`);
  } catch (error) {
    console.error('Error in deleteDB:', error);
    
    // Handle specific permission errors
    if (error instanceof Error && (error.message.includes('access denied') || error.message.includes('permission'))) {
      console.warn('IndexedDB deletion access denied - continuing without deletion');
      return;
    }
    
    throw error;
  }
};

// Helper function to wait
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Open database with migration support and retry logic
export const openDB = async (retryCount = 0): Promise<IDBDatabase> => {
  console.log(`[IndexedDB] Starting main database initialization (attempt ${retryCount + 1}/${MAX_RETRIES + 1})...`, {
    timestamp: new Date().toISOString()
  });
  
  // If we already have a connection, return it
  if (dbConnection) {
    console.log('[IndexedDB] Using existing database connection', {
      timestamp: new Date().toISOString()
    });
    return dbConnection;
  }

  // If we have a pending connection, wait for it
  if (connectionPromise) {
    console.log('[IndexedDB] Waiting for existing connection promise', {
      timestamp: new Date().toISOString()
    });
    return connectionPromise;
  }

  // If another initialization is in progress, wait
  if (isInitializing) {
    console.log('[IndexedDB] Another initialization in progress, waiting...', {
      timestamp: new Date().toISOString()
    });
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (dbConnection) {
          clearInterval(checkInterval);
          resolve(dbConnection);
        }
      }, 100);
      
      // Add timeout
      connectionTimeout = setTimeout(() => {
        clearInterval(checkInterval);
        cleanupConnectionState();
        reject(new Error('Database initialization timeout while waiting for existing connection'));
      }, INIT_TIMEOUT);
    });
  }

  try {
    console.log('[IndexedDB] Opening new database connection...', {
      timestamp: new Date().toISOString()
    });
    isInitializing = true;
    
    connectionPromise = new Promise<IDBDatabase>((resolve, reject) => {
      connectionTimeout = setTimeout(() => {
        console.error('[IndexedDB] Database connection timeout reached', {
          timestamp: new Date().toISOString()
        });
        cleanupConnectionState();
        reject(new Error('Database connection timeout'));
      }, INIT_TIMEOUT);

      const request = indexedDB.open(DB_CONFIG.name, DB_CONFIG.version);
      
      request.onerror = async (event) => {
        cleanupConnectionState();
        console.error('[IndexedDB] Database opening error:', {
          error: request.error,
          event: event,
          timestamp: new Date().toISOString()
        });

        // Handle specific permission errors
        if (request.error?.name === 'NotAllowedError' || request.error?.name === 'SecurityError') {
          console.warn('[IndexedDB] Access denied - likely due to privacy settings or incognito mode');
          reject(new Error('IndexedDB access denied. Please check your browser settings or try a different browser mode.'));
          return;
        }

        // If we have retries left, try to recover
        if (retryCount < MAX_RETRIES) {
          console.log(`[IndexedDB] Attempting recovery (${retryCount + 1}/${MAX_RETRIES})...`, {
            timestamp: new Date().toISOString()
          });
          
          try {
            // Try to delete the database if it's corrupted
            await deleteDB(DB_CONFIG.name);
            await wait(RETRY_DELAY);
            // Retry the connection
            const db = await openDB(retryCount + 1);
            resolve(db);
          } catch (retryError) {
            console.error('[IndexedDB] Recovery attempt failed:', retryError);
            reject(retryError);
          }
        } else {
          reject(request.error);
        }
      };

      request.onsuccess = (event) => {
        if (connectionTimeout) {
          clearTimeout(connectionTimeout);
          connectionTimeout = null;
        }
        console.log('[IndexedDB] Database opened successfully', {
          timestamp: new Date().toISOString()
        });
        dbConnection = request.result;
        
        dbConnection.onerror = (event) => {
          console.error('[IndexedDB] Database error:', {
            error: event.target?.error,
            event: event,
            timestamp: new Date().toISOString()
          });
        };

        dbConnection.onversionchange = async (event) => {
          console.log('[IndexedDB] Database version change detected:', {
            oldVersion: event.oldVersion,
            newVersion: event.newVersion,
            timestamp: new Date().toISOString()
          });
          
          // Close the connection and try to reopen
          if (dbConnection) {
            try {
              dbConnection.close();
            } catch (error) {
              console.error('[IndexedDB] Error closing database during version change:', error);
            }
            dbConnection = null;
          }
          
          cleanupConnectionState();
          
          // Try to reopen the database
          try {
            const newDb = await openDB(0);
            resolve(newDb);
          } catch (error) {
            console.error('[IndexedDB] Failed to reopen database after version change:', error);
            reject(error);
          }
        };

        dbConnection.onclose = () => {
          console.log('[IndexedDB] Database connection closed', {
            timestamp: new Date().toISOString()
          });
          dbConnection = null;
          cleanupConnectionState();
        };

        resolve(dbConnection);
      };

      request.onupgradeneeded = async (event) => {
        console.log('[IndexedDB] Database upgrade needed:', {
          oldVersion: event.oldVersion,
          newVersion: event.newVersion,
          timestamp: new Date().toISOString()
        });
        
        const db = request.result;
        const transaction = event.target.transaction;

        if (!transaction) {
          const error = new Error('Transaction is null during database upgrade');
          console.error('[IndexedDB] Upgrade error:', error);
          clearTimeout(connectionTimeout);
          reject(error);
          return;
        }

        try {
          // Run migrations with timeout
          const migrationsToRun = migrations.filter(
            migration => migration.version > event.oldVersion && migration.version <= event.newVersion
          );

          console.log(`[IndexedDB] Running ${migrationsToRun.length} migrations...`);
          
          for (const migration of migrationsToRun) {
            console.log(`[IndexedDB] Running migration to version ${migration.version}...`);
            try {
              await Promise.race([
                migration.upgrade(db, transaction),
                new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('Migration timeout')), INIT_TIMEOUT)
                )
              ]);
              console.log(`[IndexedDB] Migration to version ${migration.version} completed successfully`);
            } catch (migrationError) {
              console.error(`[IndexedDB] Migration to version ${migration.version} failed:`, migrationError);
              // If we have retries left, try to recover
              if (retryCount < MAX_RETRIES) {
                console.log(`[IndexedDB] Attempting recovery after migration failure (${retryCount + 1}/${MAX_RETRIES})...`);
                await deleteDB(DB_CONFIG.name);
                await wait(RETRY_DELAY);
                const newDb = await openDB(retryCount + 1);
                resolve(newDb);
                return;
              }
              throw migrationError;
            }
          }
        } catch (error) {
          console.error('[IndexedDB] Migration failed:', error);
          clearTimeout(connectionTimeout);
          reject(error);
        }
      };

      request.onblocked = async (event) => {
        console.warn('[IndexedDB] Database blocked:', {
          event: event,
          timestamp: new Date().toISOString()
        });
        
        // Try to close any existing connections
        if (dbConnection) {
          try {
            dbConnection.close();
          } catch (error) {
            console.error('[IndexedDB] Error closing blocked database:', error);
          }
          dbConnection = null;
        }
        
        // If we have retries left, try to recover
        if (retryCount < MAX_RETRIES) {
          console.log(`[IndexedDB] Attempting recovery after block (${retryCount + 1}/${MAX_RETRIES})...`);
          try {
            await deleteDB(DB_CONFIG.name);
            await wait(RETRY_DELAY);
            const newDb = await openDB(retryCount + 1);
            resolve(newDb);
          } catch (error) {
            console.error('[IndexedDB] Recovery after block failed:', error);
            reject(error);
          }
        }
      };
    });

    const db = await connectionPromise;
    console.log('[IndexedDB] Main database initialization completed successfully', {
      timestamp: new Date().toISOString()
    });
    cleanupConnectionState();
    return db;
  } catch (error) {
    console.error('[IndexedDB] Failed to initialize main database:', {
      error: error,
      timestamp: new Date().toISOString()
    });
    cleanupConnectionState();
    
    // If we have retries left, try one more time
    if (retryCount < MAX_RETRIES) {
      console.log(`[IndexedDB] Attempting final recovery (${retryCount + 1}/${MAX_RETRIES})...`, {
        timestamp: new Date().toISOString()
      });
      try {
        await deleteDB(DB_CONFIG.name);
        await wait(RETRY_DELAY);
        return openDB(retryCount + 1);
      } catch (retryError) {
        console.error('[IndexedDB] Final recovery attempt failed:', retryError);
        throw retryError;
      }
    }
    
    throw error;
  }
};

// Close database connection
export async function closeDB(): Promise<void> {
  console.log('[IndexedDB] Closing database connection...', {
    timestamp: new Date().toISOString()
  });
  
  cleanupConnectionState();
  
  if (dbConnection) {
    try {
      dbConnection.close();
    } catch (error) {
      console.error('[IndexedDB] Error closing database:', error);
    } finally {
      dbConnection = null;
    }
  }
}

// Generic store operations
type StoreName = keyof typeof DB_CONFIG.stores;
type StoreConfig = typeof DB_CONFIG.stores[StoreName];

// Add item to store
export async function addToStore<T extends { id: string }>(
  storeName: StoreName,
  item: T
): Promise<T> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(item);

    request.onsuccess = () => resolve(item);
    request.onerror = () => reject(request.error);
  });
}

// Add multiple items to store
export async function addBulkToStore<T extends { id: string }>(
  storeName: StoreName,
  items: T[]
): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    
    const promises = items.map(item => 
      new Promise<void>((resolveItem, rejectItem) => {
        const request = store.add(item);
        request.onsuccess = () => resolveItem();
        request.onerror = () => rejectItem(request.error);
      })
    );

    Promise.all(promises)
      .then(() => resolve(items))
      .catch(reject);
  });
}

// Get item from store
export async function getFromStore<T extends { id: string }>(
  storeName: StoreName,
  id: string
): Promise<T | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Get items by index
export async function getByIndex<T extends { id: string }>(
  storeName: StoreName,
  indexName: string,
  value: any
): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Update item in store
export async function updateInStore<T extends { id: string }>(
  storeName: StoreName,
  item: T
): Promise<T> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(item);

    request.onsuccess = () => resolve(item);
    request.onerror = () => reject(request.error);
  });
}

// Update multiple items in store
export async function updateBulkInStore<T extends { id: string }>(
  storeName: StoreName,
  items: T[]
): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    
    const promises = items.map(item => 
      new Promise<void>((resolveItem, rejectItem) => {
        const request = store.put(item);
        request.onsuccess = () => resolveItem();
        request.onerror = () => rejectItem(request.error);
      })
    );

    Promise.all(promises)
      .then(() => resolve(items))
      .catch(reject);
  });
}

// Delete item from store
export async function deleteFromStore(
  storeName: StoreName,
  id: string
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Delete multiple items from store
export async function deleteBulkFromStore(
  storeName: StoreName,
  ids: string[]
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    
    const promises = ids.map(id => 
      new Promise<void>((resolveItem, rejectItem) => {
        const request = store.delete(id);
        request.onsuccess = () => resolveItem();
        request.onerror = () => rejectItem(request.error);
      })
    );

    Promise.all(promises)
      .then(() => resolve())
      .catch(reject);
  });
}

// Clear store
export async function clearStore(storeName: StoreName): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Progress-specific operations
export async function saveProgress(progress: ProgressItem): Promise<ProgressItem> {
  return updateInStore('progress', progress);
}

export async function saveBulkProgress(progressItems: ProgressItem[]): Promise<ProgressItem[]> {
  return updateBulkInStore('progress', progressItems);
}

export async function getProgress(userId: string, section?: string): Promise<ProgressItem[]> {
  if (section) {
    return getByIndex<ProgressItem>('progress', 'section', section);
  }
  return getByIndex<ProgressItem>('progress', 'userId', userId);
}

export async function savePendingProgress(pending: PendingProgressItem): Promise<PendingProgressItem> {
  return addToStore('pending', pending);
}

export async function saveBulkPendingProgress(pendingItems: PendingProgressItem[]): Promise<PendingProgressItem[]> {
  return addBulkToStore('pending', pendingItems);
}

export async function getPendingProgress(userId: string): Promise<PendingProgressItem[]> {
  return getByIndex<PendingProgressItem>('pending', 'userId', userId);
}

export async function clearPendingProgress(userId: string): Promise<void> {
  const pending = await getPendingProgress(userId);
  const ids = pending.map(item => item.id);
  return deleteBulkFromStore('pending', ids);
}

// Settings operations
export async function saveSettings(settings: Settings): Promise<Settings> {
  return updateInStore('settings', settings);
}

export async function getSettings(userId: string): Promise<Settings | undefined> {
  return getFromStore<Settings>('settings', userId);
}

// Backup and restore operations
export async function createBackup(): Promise<{
  progress: ProgressItem[];
  pending: PendingProgressItem[];
  settings: Settings[];
}> {
  const db = await openDB();
  const transaction = db.transaction(['progress', 'pending', 'settings'], 'readonly');
  
  const [progress, pending, settings] = await Promise.all([
    new Promise<ProgressItem[]>((resolve, reject) => {
      const request = transaction.objectStore('progress').getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    }),
    new Promise<PendingProgressItem[]>((resolve, reject) => {
      const request = transaction.objectStore('pending').getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    }),
    new Promise<Settings[]>((resolve, reject) => {
      const request = transaction.objectStore('settings').getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    })
  ]);

  return { progress, pending, settings };
}

export async function restoreBackup(backup: {
  progress: ProgressItem[];
  pending: PendingProgressItem[];
  settings: Settings[];
}): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction(['progress', 'pending', 'settings'], 'readwrite');

  await Promise.all([
    clearStore('progress'),
    clearStore('pending'),
    clearStore('settings')
  ]);

  await Promise.all([
    addBulkToStore('progress', backup.progress),
    addBulkToStore('pending', backup.pending),
    addBulkToStore('settings', backup.settings)
  ]);
}

// Export database configuration for use in other files
export { DB_CONFIG }; 