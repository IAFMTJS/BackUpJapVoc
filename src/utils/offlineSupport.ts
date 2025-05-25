import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { StrokeData, PracticeSession, KanjiProgress } from '../types/stroke';

// Define the database schema
interface JapVocDB extends DBSchema {
  practiceSessions: {
    key: string;
    value: PracticeSession;
    indexes: {
      'by-date': Date;
      'by-kanji': string;
    };
  };
  kanjiProgress: {
    key: string;
    value: KanjiProgress;
    indexes: {
      'by-mastery': number;
      'by-last-practiced': Date;
    };
  };
  strokeData: {
    key: string;
    value: {
      kanji: string;
      strokes: StrokeData[];
      timestamp: Date;
    };
    indexes: {
      'by-kanji': string;
      'by-timestamp': Date;
    };
  };
  pendingSync: {
    key: string;
    value: {
      type: 'practice' | 'progress' | 'stroke';
      data: any;
      timestamp: Date;
      synced: boolean;
    };
    indexes: {
      'by-type': string;
      'by-synced': boolean;
    };
  };
}

// Database configuration
const DB_CONFIG = {
  name: 'JapVocDB',
  version: 1,
  stores: {
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
    }
  }
};

// Initialize the database
let db: IDBPDatabase<JapVocDB> | null = null;

export const initDatabase = async (): Promise<void> => {
  try {
    db = await openDB<JapVocDB>(DB_CONFIG.name, DB_CONFIG.version, {
      upgrade(database) {
        // Create object stores
        for (const [storeName, storeConfig] of Object.entries(DB_CONFIG.stores)) {
          if (!database.objectStoreNames.contains(storeName)) {
            const store = database.createObjectStore(storeName, {
              keyPath: storeConfig.keyPath
            });

            // Create indexes
            for (const [indexName, indexConfig] of Object.entries(storeConfig.indexes)) {
              store.createIndex(indexName, indexConfig.keyPath);
            }
          }
        }
      }
    });
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

// Practice session management
export const savePracticeSession = async (session: PracticeSession): Promise<void> => {
  if (!db) throw new Error('Database not initialized');

  try {
    // Save to local database
    await db.add('practiceSessions', {
      ...session,
      id: `${session.kanji}-${session.timestamp.getTime()}`
    });

    // Add to pending sync
    await db.add('pendingSync', {
      id: `practice-${Date.now()}`,
      type: 'practice',
      data: session,
      timestamp: new Date(),
      synced: false
    });
  } catch (error) {
    console.error('Failed to save practice session:', error);
    throw error;
  }
};

export const getPracticeSessions = async (
  kanji?: string,
  startDate?: Date,
  endDate?: Date
): Promise<PracticeSession[]> => {
  if (!db) throw new Error('Database not initialized');

  try {
    let sessions: PracticeSession[] = [];

    if (kanji) {
      // Get sessions for specific kanji
      const index = db.transaction('practiceSessions').store.index('by-kanji');
      sessions = await index.getAll(kanji);
    } else if (startDate && endDate) {
      // Get sessions within date range
      const index = db.transaction('practiceSessions').store.index('by-date');
      sessions = await index.getAll(IDBKeyRange.bound(startDate, endDate));
    } else {
      // Get all sessions
      sessions = await db.getAll('practiceSessions');
    }

    return sessions;
  } catch (error) {
    console.error('Failed to get practice sessions:', error);
    throw error;
  }
};

// Kanji progress management
export const saveKanjiProgress = async (progress: KanjiProgress): Promise<void> => {
  if (!db) throw new Error('Database not initialized');

  try {
    // Save to local database
    await db.put('kanjiProgress', progress);

    // Add to pending sync
    await db.add('pendingSync', {
      id: `progress-${Date.now()}`,
      type: 'progress',
      data: progress,
      timestamp: new Date(),
      synced: false
    });
  } catch (error) {
    console.error('Failed to save kanji progress:', error);
    throw error;
  }
};

export const getKanjiProgress = async (
  kanji?: string,
  minMastery?: number
): Promise<KanjiProgress[]> => {
  if (!db) throw new Error('Database not initialized');

  try {
    let progress: KanjiProgress[] = [];

    if (kanji) {
      // Get progress for specific kanji
      const data = await db.get('kanjiProgress', kanji);
      if (data) progress = [data];
    } else if (minMastery !== undefined) {
      // Get progress for kanji with minimum mastery level
      const index = db.transaction('kanjiProgress').store.index('by-mastery');
      progress = await index.getAll(IDBKeyRange.lowerBound(minMastery));
    } else {
      // Get all progress
      progress = await db.getAll('kanjiProgress');
    }

    return progress;
  } catch (error) {
    console.error('Failed to get kanji progress:', error);
    throw error;
  }
};

// Stroke data management
export const saveStrokeData = async (
  kanji: string,
  strokes: StrokeData[]
): Promise<void> => {
  if (!db) throw new Error('Database not initialized');

  try {
    const id = `${kanji}-${Date.now()}`;
    // Save to local database
    await db.add('strokeData', {
      id,
      kanji,
      strokes,
      timestamp: new Date()
    });

    // Add to pending sync
    await db.add('pendingSync', {
      id: `stroke-${Date.now()}`,
      type: 'stroke',
      data: { kanji, strokes },
      timestamp: new Date(),
      synced: false
    });
  } catch (error) {
    console.error('Failed to save stroke data:', error);
    throw error;
  }
};

export const getStrokeData = async (
  kanji: string,
  limit: number = 10
): Promise<StrokeData[][]> => {
  if (!db) throw new Error('Database not initialized');

  try {
    const index = db.transaction('strokeData').store.index('by-kanji');
    const data = await index.getAll(kanji);
    
    // Sort by timestamp and get most recent
    return data
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
      .map(item => item.strokes);
  } catch (error) {
    console.error('Failed to get stroke data:', error);
    throw error;
  }
};

// Sync management
export const getPendingSync = async (): Promise<any[]> => {
  if (!db) throw new Error('Database not initialized');

  try {
    const index = db.transaction('pendingSync').store.index('by-synced');
    return await index.getAll(false);
  } catch (error) {
    console.error('Failed to get pending sync items:', error);
    throw error;
  }
};

export const markAsSynced = async (id: string): Promise<void> => {
  if (!db) throw new Error('Database not initialized');

  try {
    const item = await db.get('pendingSync', id);
    if (item) {
      item.synced = true;
      await db.put('pendingSync', item);
    }
  } catch (error) {
    console.error('Failed to mark item as synced:', error);
    throw error;
  }
};

// Cache management
export const clearOldData = async (daysToKeep: number = 30): Promise<void> => {
  if (!db) throw new Error('Database not initialized');

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    // Clear old practice sessions
    const sessionsIndex = db.transaction('practiceSessions').store.index('by-date');
    const oldSessions = await sessionsIndex.getAllKeys(IDBKeyRange.upperBound(cutoffDate));
    for (const key of oldSessions) {
      await db.delete('practiceSessions', key);
    }

    // Clear old stroke data
    const strokeIndex = db.transaction('strokeData').store.index('by-timestamp');
    const oldStrokes = await strokeIndex.getAllKeys(IDBKeyRange.upperBound(cutoffDate));
    for (const key of oldStrokes) {
      await db.delete('strokeData', key);
    }

    // Clear synced pending items
    const pendingIndex = db.transaction('pendingSync').store.index('by-synced');
    const syncedItems = await pendingIndex.getAllKeys(true);
    for (const key of syncedItems) {
      await db.delete('pendingSync', key);
    }
  } catch (error) {
    console.error('Failed to clear old data:', error);
    throw error;
  }
};

// Export database instance for direct access if needed
export const getDatabase = (): IDBPDatabase<JapVocDB> => {
  if (!db) throw new Error('Database not initialized');
  return db;
}; 