const { deleteDB } = require('idb');

async function clearAllDatabases() {
  console.log('Clearing all databases...');
  
  const databases = [
    'DictionaryDB',
    'JapVocDB',
    'japvoc-romaji-cache',
    'JapaneseAudioDB',
    'AudioCacheDB',
    'JapVocAudioDB'
  ];

  for (const dbName of databases) {
    try {
      console.log(`Deleting database: ${dbName}`);
      await deleteDB(dbName);
      console.log(`Successfully deleted ${dbName}`);
    } catch (error) {
      console.error(`Error deleting ${dbName}:`, error);
    }
  }

  // Also clear localStorage items that might be related to database state
  if (typeof window !== 'undefined') {
    try {
      const keysToRemove = [
        'dbVersion',
        'lastSync',
        'audioCacheVersion',
        'databaseInitialized'
      ];
      
      keysToRemove.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
          console.log(`Removed localStorage key: ${key}`);
        }
      });
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  console.log('Database clearing complete');
}

clearAllDatabases().catch(console.error); 