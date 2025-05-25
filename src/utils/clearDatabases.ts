import { deleteDB } from 'idb';

const DATABASES = [
  'JapVocDB',
  'JapVocOfflineDB',
  'DictionaryDB',
  'JapaneseAudioDB',
  'japvoc-sync',
  'japvoc-romaji-cache'
];

export async function clearAllDatabases(): Promise<void> {
  console.log('[clearDatabases] Starting database clearing process...', {
    timestamp: new Date().toISOString(),
    databases: DATABASES
  });
  
  const results = {
    successful: [] as string[],
    failed: [] as { name: string; error: string }[]
  };

  // Process databases sequentially
  for (const dbName of DATABASES) {
    try {
      console.log(`[clearDatabases] Attempting to delete database: ${dbName}`);
      
      // Simple delete attempt
      await deleteDB(dbName, {
        blocked() {
          console.warn(`[clearDatabases] Database ${dbName} is blocked, waiting...`);
        }
      });

      // Verify deletion
      const isDeleted = await new Promise<boolean>(resolve => {
        const request = indexedDB.open(dbName);
        request.onerror = () => resolve(true); // Database doesn't exist
        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          db.close();
          resolve(false); // Database still exists
        };
      });

      if (!isDeleted) {
        throw new Error(`Database ${dbName} still exists after deletion`);
      }

      console.log(`[clearDatabases] Successfully deleted database: ${dbName}`);
      results.successful.push(dbName);
    } catch (error) {
      console.warn(`[clearDatabases] Failed to delete ${dbName}:`, error);
      results.failed.push({ 
        name: dbName, 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  }

  // Log final results
  console.log('[clearDatabases] Database clearing process completed', {
    timestamp: new Date().toISOString(),
    successful: results.successful,
    failed: results.failed,
    totalAttempted: DATABASES.length,
    totalSuccessful: results.successful.length,
    totalFailed: results.failed.length
  });

  // Throw error if any critical databases failed to clear
  const criticalDatabases = ['JapVocDB', 'JapVocOfflineDB', 'DictionaryDB'];
  const failedCritical = results.failed.filter(f => criticalDatabases.includes(f.name));
  if (failedCritical.length > 0) {
    throw new Error(`Failed to clear critical databases: ${failedCritical.map(f => f.name).join(', ')}`);
  }

  // Log warnings for non-critical failures
  if (results.failed.length > 0) {
    console.warn('[clearDatabases] Some non-critical databases failed to clear:', 
      results.failed.filter(f => !criticalDatabases.includes(f.name)));
  }
} 