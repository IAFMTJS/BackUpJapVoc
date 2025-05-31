import { deleteDB } from 'idb';
import { DB_CONFIG } from './databaseConfig';

export async function forceDatabaseReset(): Promise<void> {
  console.log('[Database] Force reset requested');
  
  try {
    // Close any existing connections
    const request = indexedDB.open(DB_CONFIG.name);
    request.onerror = () => {
      console.log('[Database] Database already closed or deleted');
    };
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      db.close();
      console.log('[Database] Closed existing connection');
    };

    // Wait a bit to ensure connections are closed
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('[Database] Attempting to delete database...');
    await deleteDB(DB_CONFIG.name, {
      blocked() {
        console.warn('[Database] Database deletion blocked, will retry...');
      }
    });
    console.log('[Database] Database deleted successfully');
    
    // Wait a bit before proceeding
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (error) {
    console.error('[Database] Error during force reset:', error);
    throw error;
  }
} 