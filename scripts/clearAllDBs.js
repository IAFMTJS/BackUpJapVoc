const { deleteDB } = require('idb');

async function clearAllDatabases() {
  console.log('Clearing all databases...');
  
  const databases = [
    'DictionaryDB',
    'JapVocDB',
    'japvoc-romaji-cache'
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

  console.log('Database clearing complete');
}

clearAllDatabases().catch(console.error); 