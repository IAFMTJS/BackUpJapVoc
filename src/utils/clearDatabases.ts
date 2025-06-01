import { databasePromise } from './databaseConfig';

export async function clearDatabases(): Promise<void> {
  try {
    // Delete the main database
    const db = await databasePromise;
    db.close();
    await window.indexedDB.deleteDatabase('JapVocDB');
    console.log('Successfully cleared JapVocDB database');
  } catch (error) {
    console.error('Error clearing databases:', error);
    throw error;
  }
} 