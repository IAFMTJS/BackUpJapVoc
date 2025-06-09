import { deleteDB } from 'idb';
import { DB_CONFIG } from './databaseConfig';
import safeIndexedDB from './safeIndexedDB';

export async function forceDatabaseReset(): Promise<void> {
  console.log('[Database] Force reset requested');
  
  try {
    // Close any existing connections
    try {
      const request = indexedDB.open(DB_CONFIG.name);
      request.onerror = () => {
        console.log('[Database] Database already closed or deleted');
      };
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        db.close();
        console.log('[Database] Closed existing connection');
      };
    } catch (error) {
      console.warn('[Database] Error closing existing connections:', error);
    }

    // Wait a bit to ensure connections are closed
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('[Database] Attempting to delete database...');
    try {
      await safeIndexedDB.deleteDatabase(DB_CONFIG.name);
      console.log('[Database] Database deleted successfully');
    } catch (error) {
      console.warn('[Database] Failed to delete database:', error);
      // Try alternative method
      try {
        await deleteDB(DB_CONFIG.name, {
          blocked() {
            console.warn('[Database] Database deletion blocked, will retry...');
          }
        });
        console.log('[Database] Database deleted successfully using alternative method');
      } catch (altError) {
        console.error('[Database] Alternative deletion method also failed:', altError);
        throw new Error('Failed to reset database - please check your browser settings');
      }
    }
    
    // Wait a bit before proceeding
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (error) {
    console.error('[Database] Error during force reset:', error);
    throw error;
  }
} 