// Database Reset Utility
// This can be used both programmatically and from the browser console

export async function resetAllDatabases(): Promise<void> {
  console.log('🔄 Starting database reset...');
  
  const databases = [
    'DictionaryDB',
    'JapVocDB',
    'japvoc-romaji-cache',
    'JapaneseAudioDB',
    'AudioCacheDB',
    'JapVocAudioDB'
  ];

  let deletedCount = 0;
  
  for (const dbName of databases) {
    try {
      await window.indexedDB.deleteDatabase(dbName);
      console.log(`✅ Deleted database: ${dbName}`);
      deletedCount++;
    } catch (error) {
      console.warn(`⚠️ Error deleting ${dbName}:`, error);
    }
  }

  // Clear localStorage items
  const keysToRemove = [
    'dbVersion',
    'lastSync',
    'audioCacheVersion',
    'databaseInitialized',
    'theme',
    'audioSettings'
  ];
  
  let clearedKeys = 0;
  keysToRemove.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log(`🗑️ Removed localStorage key: ${key}`);
      clearedKeys++;
    }
  });

  console.log(`🎉 Database reset complete! Deleted ${deletedCount} databases and cleared ${clearedKeys} localStorage keys.`);
  console.log('💡 Please refresh the page to reinitialize the application.');
}

// Make it available globally for browser console access
if (typeof window !== 'undefined') {
  (window as any).resetJapVocDatabase = resetAllDatabases;
  console.log('🔧 Database reset utility available as: window.resetJapVocDatabase()');
}

export default resetAllDatabases; 