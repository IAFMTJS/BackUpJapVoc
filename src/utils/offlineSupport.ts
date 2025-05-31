import { getDatabase, addToStore, getFromStore, updateInStore, deleteFromStore, clearStore, StoreName } from './databaseConfig';
import { StrokeData, PracticeSession, KanjiProgress } from '../types/stroke';

// Initialize the database
export const initOfflineSupport = async (): Promise<void> => {
  try {
    // The database is now initialized through the centralized configuration
    await getDatabase();
    console.log('Offline support initialized successfully');
  } catch (error) {
    console.error('Failed to initialize offline support:', error);
    throw error;
  }
};

// Practice session operations
export const savePracticeSession = async (session: PracticeSession): Promise<void> => {
  try {
    await addToStore('practiceSessions', session);
  } catch (error) {
    console.error('Failed to save practice session:', error);
    throw error;
  }
};

export const getPracticeSessions = async (): Promise<PracticeSession[]> => {
  try {
    const db = await getDatabase();
    const tx = db.transaction('practiceSessions', 'readonly');
    const store = tx.store;
    return store.getAll();
  } catch (error) {
    console.error('Failed to get practice sessions:', error);
    throw error;
  }
};

// Kanji progress operations
export const updateKanjiProgress = async (progress: KanjiProgress): Promise<void> => {
  try {
    await updateInStore('kanjiProgress', progress);
  } catch (error) {
    console.error('Failed to update kanji progress:', error);
    throw error;
  }
};

export const getKanjiProgress = async (kanji: string): Promise<KanjiProgress | undefined> => {
  try {
    return await getFromStore('kanjiProgress', kanji);
  } catch (error) {
    console.error('Failed to get kanji progress:', error);
    throw error;
  }
};

// Stroke data operations
export const saveStrokeData = async (data: { id: string; kanji: string; strokes: StrokeData[]; timestamp: Date }): Promise<void> => {
  try {
    await addToStore('strokeData', data);
  } catch (error) {
    console.error('Failed to save stroke data:', error);
    throw error;
  }
};

export const getStrokeData = async (kanji: string): Promise<{ id: string; kanji: string; strokes: StrokeData[]; timestamp: Date } | undefined> => {
  try {
    const db = await getDatabase();
    const tx = db.transaction('strokeData', 'readonly');
    const index = tx.store.index('by-kanji');
    const results = await index.getAll(kanji);
    return results[0]; // Return the most recent stroke data
  } catch (error) {
    console.error('Failed to get stroke data:', error);
    throw error;
  }
};

// Sync management
export const getPendingSync = async (): Promise<any[]> => {
  try {
    const db = await getDatabase();
    const tx = db.transaction('pendingSync', 'readonly');
    const index = tx.store.index('by-synced');
    return index.getAll(false);
  } catch (error) {
    console.error('Failed to get pending sync items:', error);
    throw error;
  }
};

export const markAsSynced = async (id: string): Promise<void> => {
  try {
    const item = await getFromStore('pendingSync', id);
    if (item) {
      await updateInStore('pendingSync', { ...item, synced: true });
    }
  } catch (error) {
    console.error('Failed to mark item as synced:', error);
    throw error;
  }
};

export const clearPendingSync = async (): Promise<void> => {
  try {
    await clearStore('pendingSync');
  } catch (error) {
    console.error('Failed to clear pending sync:', error);
    throw error;
  }
};

export async function initializeOfflineData() {
  try {
    const db = await getDatabase();
    // ... rest of the function
  } catch (error) {
    console.error('Error initializing offline data:', error);
    throw error;
  }
}

export async function syncOfflineData() {
  try {
    const db = await getDatabase();
    // ... rest of the function
  } catch (error) {
    console.error('Error syncing offline data:', error);
    throw error;
  }
}

export async function getOfflineData() {
  try {
    const db = await getDatabase();
    // ... rest of the function
  } catch (error) {
    console.error('Error getting offline data:', error);
    throw error;
  }
}

export async function clearOfflineData() {
  try {
    const db = await getDatabase();
    // ... rest of the function
  } catch (error) {
    console.error('Error clearing offline data:', error);
    throw error;
  }
} 