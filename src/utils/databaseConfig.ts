import { IDBPDatabase } from 'idb';
import { openDB, deleteDB } from 'idb';
import { JapVocDB, StoreName } from '../types/database';

// Remove timeout constant and simplify initialization state
let isInitializing = false;
let initPromise: Promise<IDBPDatabase<JapVocDB>> | null = null;
let activeConnections: IDBPDatabase<JapVocDB>[] = [];

// Add force reset flag
let forceReset = false;

// Database configuration
export const DB_CONFIG = {
  name: 'JapVocDB',
  version: 5,
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
        'by-user': { keyPath: 'userId' },
        'by-section': { keyPath: 'section' },
        'by-timestamp': { keyPath: 'timestamp' }
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
      keyPath: 'kanji',
      indexes: {
        'by-mastery': { keyPath: 'masteryLevel' },
        'by-last-practiced': { keyPath: 'lastPracticed' }
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
    await deleteDB(DB_CONFIG.name);
    forceReset = false;
  }

  isInitializing = true;
  console.log('[Database] Starting database initialization...');

  try {
    initPromise = openDB<JapVocDB>(DB_CONFIG.name, DB_CONFIG.version, {
      upgrade(db, oldVersion, newVersion) {
        console.log(`[Database] Upgrading database from version ${oldVersion} to ${newVersion}`);

        // Create or update stores
        Object.entries(DB_CONFIG.stores).forEach(([storeName, storeConfig]) => {
          if (!db.objectStoreNames.contains(storeName)) {
            console.log(`[Database] Creating store: ${storeName}`);
            const store = db.createObjectStore(storeName, { keyPath: storeConfig.keyPath });
            
            // Create indexes
            Object.entries(storeConfig.indexes).forEach(([indexName, indexConfig]) => {
              console.log(`[Database] Creating index: ${storeName}.${indexName}`);
              store.createIndex(indexName, indexConfig.keyPath);
            });
          }
        });
      },
      blocked() {
        console.warn('[Database] Database upgrade blocked by another connection');
      },
      blocking() {
        console.warn('[Database] Database upgrade blocking other connections');
      },
      terminated() {
        console.warn('[Database] Database connection terminated');
        isInitializing = false;
        initPromise = null;
      }
    });

    const db = await initPromise;
    console.log('[Database] Database initialized successfully');
    activeConnections.push(db);
    return db;
  } catch (error) {
    console.error('[Database] Error initializing database:', error);
    isInitializing = false;
    initPromise = null;
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
    await verifyStores(db);
    return true;
  } catch (error) {
    console.error('[Database] Error checking database readiness:', error);
    return false;
  }
}

// Export the database promise for components that need to wait for initialization
export const databasePromise = initializeDatabase();

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