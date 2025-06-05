import { IDBPDatabase } from 'idb';
import { openDB, deleteDB } from 'idb';
import { JapVocDB, StoreName } from '../types/database';
import { kanjiList } from '../data/kanjiData';

// Remove timeout constant and simplify initialization state
let isInitializing = false;
let initPromise: Promise<IDBPDatabase<JapVocDB>> | null = null;
let activeConnections: IDBPDatabase<JapVocDB>[] = [];

// Add force reset flag
let forceReset = false;

// Database configuration
export const DB_CONFIG = {
  name: 'JapVocDB',
  version: 8,
  stores: {
    words: {
      keyPath: 'id',
      indexes: {
        'by-japanese': { keyPath: 'japanese' },
        'by-english': { keyPath: 'english' },
        'by-romaji': { keyPath: 'romaji' },
        'by-level': { keyPath: 'level' },
        'by-category': { keyPath: 'category' },
        'by-jlpt': { keyPath: 'jlptLevel' },
        'by-frequency': { keyPath: 'frequency.rank' },
        'by-mastery': { keyPath: 'mastery.level' },
        'by-last-viewed': { keyPath: 'lastViewed' },
        'by-emotional-context': { keyPath: 'emotionalContext.category' }
      }
    },
    quizWords: {
      keyPath: 'id',
      indexes: {
        'by-japanese': { keyPath: 'japanese' },
        'by-english': { keyPath: 'english' },
        'by-romaji': { keyPath: 'romaji' },
        'by-level': { keyPath: 'level' },
        'by-category': { keyPath: 'category' },
        'by-jlpt': { keyPath: 'jlptLevel' }
      }
    },
    learningWords: {
      keyPath: 'id',
      indexes: {
        'by-japanese': { keyPath: 'japanese' },
        'by-english': { keyPath: 'english' },
        'by-romaji': { keyPath: 'romaji' },
        'by-level': { keyPath: 'level' },
        'by-category': { keyPath: 'category' },
        'by-jlpt': { keyPath: 'jlptLevel' },
        'by-mastery': { keyPath: 'mastery' }
      }
    },
    learningProgress: {
      keyPath: 'wordId',
      indexes: {
        'by-mastery': { keyPath: 'masteryLevel' },
        'by-next-review': { keyPath: 'nextReview' },
        'by-last-reviewed': { keyPath: 'lastReviewed' },
        'by-difficulty': { keyPath: 'difficulty' }
      }
    },
    audioFiles: {
      keyPath: 'id',
      indexes: {
        'by-word': { keyPath: 'wordId' },
        'by-type': { keyPath: 'type' }
      }
    },
    wordRelationships: {
      keyPath: 'id',
      indexes: {
        'by-word': { keyPath: 'wordId' },
        'by-type': { keyPath: 'relationships.type' },
        'by-strength': { keyPath: 'relationships.strength' }
      }
    },
    wordEtymology: {
      keyPath: 'id',
      indexes: {
        'by-word': { keyPath: 'wordId' },
        'by-origin': { keyPath: 'etymology.origin' }
      }
    },
    wordFrequency: {
      keyPath: 'id',
      indexes: {
        'by-word': { keyPath: 'wordId' },
        'by-rank': { keyPath: 'frequency.rank' }
      }
    },
    searchHistory: {
      keyPath: 'id',
      indexes: {
        'by-query': { keyPath: 'query' },
        'by-timestamp': { keyPath: 'timestamp' }
      }
    },
    wordCloud: {
      keyPath: 'id',
      indexes: {
        'by-category': { keyPath: 'category' },
        'by-timestamp': { keyPath: 'timestamp' }
      }
    },
    learningPaths: {
      keyPath: 'id',
      indexes: {
        'by-difficulty': { keyPath: 'difficulty' },
        'by-progress': { keyPath: 'progress' },
        'by-last-updated': { keyPath: 'lastUpdated' }
      }
    },
    progress: {
      keyPath: 'id',
      indexes: {
        'userId': { keyPath: 'userId' },
        'section': { keyPath: 'section' },
        'timestamp': { keyPath: 'timestamp' }
      }
    },
    pending: {
      keyPath: 'id',
      indexes: {
        'by-user': { keyPath: 'userId' },
        'by-timestamp': { keyPath: 'timestamp' },
        'by-status': { keyPath: 'status' }
      }
    },
    settings: {
      keyPath: 'userId',
      indexes: {
        'by-last-sync': { keyPath: 'lastSync' }
      }
    },
    srsItems: {
      keyPath: 'id',
      indexes: {
        'by-word': { keyPath: 'word.japanese' },
        'by-level': { keyPath: 'level' },
        'by-next-review': { keyPath: 'nextReview' },
        'by-last-review': { keyPath: 'lastReview' }
      }
    },
    practiceSessions: {
      keyPath: 'id',
      indexes: {
        'by-date': { keyPath: 'timestamp' },
        'by-kanji': { keyPath: 'kanji' }
      }
    },
    kanjiProgress: {
      keyPath: 'kanjiId',
      indexes: {
        'by-mastery': { keyPath: 'masteryLevel' },
        'by-next-review': { keyPath: 'nextReview' },
        'by-last-reviewed': { keyPath: 'lastReviewed' },
        'by-writing-score': { keyPath: 'writingScore' },
        'by-reading-score': { keyPath: 'readingScore' }
      }
    },
    strokeData: {
      keyPath: 'id',
      indexes: {
        'by-kanji': { keyPath: 'kanji' },
        'by-timestamp': { keyPath: 'timestamp' }
      }
    },
    pendingSync: {
      keyPath: 'id',
      indexes: {
        'by-type': { keyPath: 'type' },
        'by-synced': { keyPath: 'synced' }
      }
    },
    moodWords: {
      keyPath: 'id',
      indexes: {
        'by-category': { keyPath: 'category' },
        'by-emotion': { keyPath: 'emotion' }
      }
    },
    kanji: {
      keyPath: 'id',
      indexes: {
        'by-character': { keyPath: 'character' },
        'by-level': { keyPath: 'level' },
        'by-jlpt': { keyPath: 'jlptLevel' },
        'by-frequency': { keyPath: 'frequency' },
        'by-radical': { keyPath: 'radicals' },
        'by-stroke-count': { keyPath: 'strokeCount' },
        'by-reading': { keyPath: 'readings.type' }
      }
    },
    kanjiStrokes: {
      keyPath: 'kanjiId',
      indexes: {
        'by-stroke-count': { keyPath: 'strokeCount' },
        'by-difficulty': { keyPath: 'difficulty' }
      }
    },
    kanjiExamples: {
      keyPath: 'id',
      indexes: {
        'by-kanji': { keyPath: 'kanjiId' },
        'by-word': { keyPath: 'wordId' },
        'by-frequency': { keyPath: 'frequency' }
      }
    }
  }
};

// Helper function to verify stores exist
async function verifyStores(db: IDBPDatabase<JapVocDB>): Promise<void> {
  const requiredStores = Object.keys(DB_CONFIG.stores);
  const existingStores = Array.from(db.objectStoreNames);
  const missingStores = requiredStores.filter(store => !existingStores.includes(store));
  
  if (missingStores.length > 0) {
    console.error('[Database] Missing required stores:', missingStores);
    throw new Error(`Missing required stores: ${missingStores.join(', ')}`);
  }
  
  console.log('[Database] All required stores verified:', existingStores);
}

// Helper function to create stores
function createStores(db: IDBPDatabase<JapVocDB>): void {
  console.log('[Database] Creating stores...');
  
  Object.entries(DB_CONFIG.stores).forEach(([storeName, storeConfig]) => {
    if (!db.objectStoreNames.contains(storeName)) {
      console.log(`[Database] Creating store: ${storeName}`);
      try {
        const store = db.createObjectStore(storeName, { keyPath: storeConfig.keyPath });
        
        // Create all indexes for the store
        Object.entries(storeConfig.indexes).forEach(([indexName, indexConfig]) => {
          console.log(`[Database] Creating index ${indexName} for ${storeName}`);
          try {
            store.createIndex(indexName, indexConfig.keyPath, { unique: indexConfig.unique });
          } catch (error) {
            console.error(`[Database] Error creating index ${indexName} for ${storeName}:`, error);
            throw error;
          }
        });
      } catch (error) {
        console.error(`[Database] Error creating store ${storeName}:`, error);
        throw error;
      }
    } else {
      console.log(`[Database] Store ${storeName} already exists`);
    }
  });
}

// Helper function to cleanup initialization state
function cleanupInitState() {
  console.log('[Database] Cleaning up initialization state');
  isInitializing = false;
  initPromise = null;
  forceReset = false;
  
  // Close all active connections
  activeConnections.forEach(conn => {
    try {
      console.log('[Database] Closing active connection');
      conn.close();
    } catch (error) {
      console.warn('[Database] Error closing connection:', error);
    }
  });
  activeConnections = [];
}

// Function to force reset the database
export async function forceDatabaseReset(): Promise<void> {
  console.log('[Database] Force reset requested');
  try {
    // Close all existing connections
    if (activeConnections.length > 0) {
      console.log('[Database] Closing existing connections');
      activeConnections.forEach(conn => conn.close());
      activeConnections = [];
    }

    // Delete the database
    console.log('[Database] Deleting database');
    await deleteDB(DB_CONFIG.name);
    
    // Wait a bit before proceeding
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('[Database] Database reset complete');
  } catch (error) {
    console.error('[Database] Error during force reset:', error);
    throw error;
  }
}

// Function to ensure database is ready
async function ensureDatabaseReady(): Promise<IDBPDatabase<JapVocDB>> {
  console.log('[Database] Ensuring database is ready...');
  
  try {
    // Try to open the database with a higher version to force upgrade
    const targetVersion = forceReset ? DB_CONFIG.version + 1 : DB_CONFIG.version;
    const db = await openDB<JapVocDB>(DB_CONFIG.name, targetVersion, {
      upgrade(db, oldVersion, newVersion) {
        console.log(`[Database] Upgrading database from version ${oldVersion} to ${newVersion}`);
        
        // Delete all existing stores to ensure clean upgrade
        Array.from(db.objectStoreNames).forEach(storeName => {
          console.log(`[Database] Deleting existing store: ${storeName}`);
          db.deleteObjectStore(storeName);
        });

        // Create all stores
        Object.entries(DB_CONFIG.stores).forEach(([storeName, storeConfig]) => {
          console.log(`[Database] Creating store: ${storeName}`);
          const store = db.createObjectStore(storeName, { keyPath: storeConfig.keyPath });
          
          // Create all indexes for the store
          Object.entries(storeConfig.indexes).forEach(([indexName, indexConfig]) => {
            console.log(`[Database] Creating index ${indexName} for ${storeName}`);
            store.createIndex(indexName, indexConfig.keyPath, { unique: indexConfig.unique || false });
          });
        });
      },
      blocked() {
        console.warn('[Database] Database upgrade blocked by other connections');
        cleanupInitState();
      },
      blocking() {
        console.warn('[Database] Database upgrade is blocking other connections');
      }
    });

    // Track the connection
    activeConnections.push(db);

    // Add connection close handler
    db.addEventListener('close', () => {
      console.log('[Database] Connection closed');
      activeConnections = activeConnections.filter(conn => conn !== db);
    });

    // Verify stores
    await verifyStores(db);

    return db;
  } catch (error) {
    console.error('[Database] Error ensuring database is ready:', error);
    throw error;
  }
}

// Initialize database with proper error handling
export async function initializeDatabase(): Promise<IDBPDatabase<JapVocDB>> {
  if (isInitializing && initPromise) {
    console.log('[Database] Database initialization already in progress, waiting...');
    return initPromise;
  }

  if (forceReset) {
    console.log('[Database] Force reset requested, deleting existing database...');
    try {
      await deleteDB(DB_CONFIG.name);
      console.log('[Database] Existing database deleted');
    } catch (error) {
      console.warn('[Database] Error deleting database:', error);
      // Continue anyway, as the database might not exist
    }
    forceReset = false;
  }

  isInitializing = true;
  console.log('[Database] Starting database initialization...');

  try {
    // Create a new promise for this initialization attempt
    initPromise = (async () => {
      let retryCount = 0;
      const maxRetries = process.env.NODE_ENV === 'production' ? 3 : 1;
      const baseDelay = 1000; // Base delay in milliseconds

      while (retryCount < maxRetries) {
        try {
          console.log(`[Database] Initialization attempt ${retryCount + 1}/${maxRetries}`);
          
          const db = await openDB<JapVocDB>(DB_CONFIG.name, DB_CONFIG.version, {
            upgrade(db, oldVersion, newVersion, transaction) {
              console.log(`[Database] Upgrading database from version ${oldVersion} to ${newVersion}`);

              // Create all stores fresh
              Object.entries(DB_CONFIG.stores).forEach(([storeName, storeConfig]) => {
                // Only create store if it doesn't exist
                if (!db.objectStoreNames.contains(storeName)) {
                  console.log(`[Database] Creating store: ${storeName}`);
                  try {
                    const store = db.createObjectStore(storeName, { keyPath: storeConfig.keyPath });
                    
                    // Create indexes
                    Object.entries(storeConfig.indexes).forEach(([indexName, indexConfig]) => {
                      console.log(`[Database] Creating index: ${storeName}.${indexName}`);
                      try {
                        store.createIndex(indexName, indexConfig.keyPath, { unique: indexConfig.unique || false });
                      } catch (error) {
                        console.warn(`[Database] Error creating index ${indexName} for ${storeName}:`, error);
                        // Continue with other indexes even if one fails
                      }
                    });
                  } catch (error) {
                    console.error(`[Database] Error creating store ${storeName}:`, error);
                    throw error; // Re-throw store creation errors as they are critical
                  }
                } else {
                  console.log(`[Database] Store ${storeName} already exists`);
                }
              });
            },
            blocked() {
              console.warn('[Database] Database upgrade blocked by other connections');
              cleanupInitState();
            },
            blocking() {
              console.warn('[Database] Database upgrade is blocking other connections');
            },
            terminated() {
              console.warn('[Database] Database connection terminated');
              cleanupInitState();
            }
          });

          console.log('[Database] Database opened successfully');
          
          // Track the connection
          activeConnections.push(db);
          
          // Add connection close handler
          db.addEventListener('close', () => {
            console.log('[Database] Connection closed');
            activeConnections = activeConnections.filter(conn => conn !== db);
          });

          // Verify database is working by attempting a simple operation
          try {
            const tx = db.transaction('words', 'readonly');
            await tx.done;
            console.log('[Database] Database verification successful');
          } catch (error) {
            console.error('[Database] Database verification failed:', error);
            throw new Error('Database verification failed');
          }

          return db;
        } catch (error) {
          retryCount++;
          console.error(`[Database] Initialization attempt ${retryCount} failed:`, error);
          
          if (retryCount >= maxRetries) {
            throw error;
          }

          // Calculate delay with exponential backoff
          const delay = baseDelay * Math.pow(2, retryCount - 1);
          console.log(`[Database] Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      throw new Error('Database initialization failed after all retries');
    })();

    const db = await initPromise;
    console.log('[Database] Database initialization completed successfully');
    return db;
  } catch (error) {
    console.error('[Database] Error in initializeDatabase:', error);
    cleanupInitState();
    
    // Provide more user-friendly error messages in production
    if (process.env.NODE_ENV === 'production') {
      if (error instanceof Error) {
        if (error.message.includes('QuotaExceededError')) {
          throw new Error('Storage quota exceeded. Please clear some space in your browser storage.');
        } else if (error.message.includes('blocked')) {
          throw new Error('Database is blocked by another tab. Please close other tabs and try again.');
        } else if (error.message.includes('verification failed')) {
          throw new Error('Database verification failed. Please try refreshing the page.');
        }
      }
      throw new Error('Database initialization failed. Please try refreshing the page or clearing your browser data.');
    }
    throw error;
  } finally {
    isInitializing = false;
  }
}

// Helper function to get database instance
export async function getDatabase(): Promise<IDBPDatabase<JapVocDB>> {
  try {
    const db = await openDB<JapVocDB>(DB_CONFIG.name, DB_CONFIG.version);
    return db;
  } catch (error) {
    if (error instanceof Error && error.message.includes('version change')) {
      return initializeDatabase();
    }
    throw error;
  }
}

// Helper function to check if database is ready
export async function isDatabaseReady(): Promise<boolean> {
  try {
    const db = await getDatabase();
    const requiredStores = Object.keys(DB_CONFIG.stores);
    const existingStores = Array.from(db.objectStoreNames);
    return requiredStores.every(store => existingStores.includes(store));
  } catch (error) {
    console.error('[Database] Error checking database readiness:', error);
    return false;
  }
}

// Export the database promise for components that need to wait for initialization
export const databasePromise = (async () => {
  let retryCount = 0;
  const maxRetries = 3;
  
  while (retryCount < maxRetries) {
    try {
      console.log(`[Database] Attempting database initialization (attempt ${retryCount + 1}/${maxRetries})`);
      const db = await initializeDatabase();
      console.log('[Database] Database initialization successful');
      return db;
    } catch (error) {
      console.error(`[Database] Database initialization failed (attempt ${retryCount + 1}/${maxRetries}):`, error);
      retryCount++;
      
      if (retryCount < maxRetries) {
        console.log('[Database] Waiting before retry...');
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
      } else {
        console.error('[Database] Max retries reached, giving up');
        throw error;
      }
    }
  }
  
  throw new Error('Failed to initialize database after multiple attempts');
})();

// Export store names as a type
export type StoreName = keyof JapVocDB;

// Export database operations
export async function addToStore<T extends { id: string }>(
  storeName: StoreName,
  item: T
): Promise<T> {
  const db = await getDatabase();
  return db.add(storeName, item);
}

export async function addBulkToStore<T extends { id: string }>(
  storeName: StoreName,
  items: T[]
): Promise<T[]> {
  const db = await getDatabase();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.store;
  
  await Promise.all(items.map(item => store.add(item)));
  await tx.done;
  
  return items;
}

export async function getFromStore<T extends { id: string }>(
  storeName: StoreName,
  id: string
): Promise<T | undefined> {
  const db = await getDatabase();
  return db.get(storeName, id);
}

export async function updateInStore<T extends { id: string }>(
  storeName: StoreName,
  item: T
): Promise<T> {
  const db = await getDatabase();
  await db.put(storeName, item);
  return item;
}

export async function updateBulkInStore<T extends { id: string }>(
  storeName: StoreName,
  items: T[]
): Promise<T[]> {
  const db = await getDatabase();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.store;
  
  await Promise.all(items.map(item => store.put(item)));
  await tx.done;
  
  return items;
}

export async function deleteFromStore(
  storeName: StoreName,
  id: string
): Promise<void> {
  const db = await getDatabase();
  await db.delete(storeName, id);
}

export async function deleteBulkFromStore(
  storeName: StoreName,
  ids: string[]
): Promise<void> {
  const db = await getDatabase();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.store;
  
  await Promise.all(ids.map(id => store.delete(id)));
  await tx.done;
}

export async function clearStore(storeName: StoreName): Promise<void> {
  const db = await getDatabase();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.store;
  
  await store.clear();
  await tx.done;
}

export async function getAllFromStore<T>(
  db: IDBPDatabase<JapVocDB>,
  storeName: StoreName
): Promise<T[]> {
  const tx = db.transaction(storeName, 'readonly');
  const store = tx.store;
  return store.getAll();
}

// Function to safely reset database while preserving data
export async function safeDatabaseReset(): Promise<void> {
  console.log('[Database] Starting safe database reset...');
  try {
    // Create backup first
    const db = await getDatabase();
    const backup = {
      progress: await getAllFromStore(db, 'progress'),
      pending: await getAllFromStore(db, 'pending'),
      settings: await getAllFromStore(db, 'settings')
    };

    // Force reset the database
    await forceDatabaseReset();

    // Wait for database to be ready
    const newDb = await initializeDatabase();

    // Restore data
    if (backup.progress.length > 0) {
      await addBulkToStore('progress', backup.progress);
    }
    if (backup.pending.length > 0) {
      await addBulkToStore('pending', backup.pending);
    }
    if (backup.settings.length > 0) {
      await addBulkToStore('settings', backup.settings);
    }

    console.log('[Database] Safe database reset completed successfully');
  } catch (error) {
    console.error('[Database] Error during safe database reset:', error);
    throw error;
  }
}

// Progress and settings related functions
export async function saveProgress(progress: { id: string; [key: string]: any }): Promise<void> {
  const db = await getDatabase();
  await db.put('progress', progress);
}

export async function saveBulkProgress(items: Array<{ id: string; [key: string]: any }>): Promise<void> {
  const db = await getDatabase();
  const tx = db.transaction('progress', 'readwrite');
  await Promise.all(items.map(item => tx.store.put(item)));
  await tx.done;
}

export async function getProgress(userId: string): Promise<any> {
  const db = await getDatabase();
  return db.get('progress', userId);
}

export async function savePendingProgress(progress: { id: string; [key: string]: any }): Promise<void> {
  const db = await getDatabase();
  await db.put('pending', progress);
}

export async function saveBulkPendingProgress(items: Array<{ id: string; [key: string]: any }>): Promise<void> {
  const db = await getDatabase();
  const tx = db.transaction('pending', 'readwrite');
  await Promise.all(items.map(item => tx.store.put(item)));
  await tx.done;
}

export async function getPendingProgress(userId: string): Promise<any> {
  const db = await getDatabase();
  return db.get('pending', userId);
}

export async function clearPendingProgress(): Promise<void> {
  const db = await getDatabase();
  await db.clear('pending');
}

export async function saveSettings(settings: { userId: string; [key: string]: any }): Promise<void> {
  const db = await getDatabase();
  await db.put('settings', settings);
}

export async function getSettings(userId: string): Promise<any> {
  const db = await getDatabase();
  return db.get('settings', userId);
}

export async function createBackup(): Promise<any> {
  const db = await getDatabase();
  const backup = {
    progress: await getAllFromStore(db, 'progress'),
    pending: await getAllFromStore(db, 'pending'),
    settings: await getAllFromStore(db, 'settings')
  };
  return backup;
}

export async function restoreBackup(backup: any): Promise<void> {
  const db = await getDatabase();
  const tx = db.transaction(['progress', 'pending', 'settings'], 'readwrite');
  
  if (backup.progress?.length) {
    await Promise.all(backup.progress.map((item: any) => tx.objectStore('progress').put(item)));
  }
  if (backup.pending?.length) {
    await Promise.all(backup.pending.map((item: any) => tx.objectStore('pending').put(item)));
  }
  if (backup.settings?.length) {
    await Promise.all(backup.settings.map((item: any) => tx.objectStore('settings').put(item)));
  }
  
  await tx.done;
} 