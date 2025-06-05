import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface SettingsDB extends DBSchema {
  settings: {
    key: string;
    value: any;
  };
}

const DB_NAME = 'japanese-vocabulary-settings';
const DB_VERSION = 1;
const STORE_NAME = 'settings';

let db: IDBPDatabase<SettingsDB> | null = null;

const initDB = async () => {
  if (!db) {
    db = await openDB<SettingsDB>(DB_NAME, DB_VERSION, {
      upgrade(database) {
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME);
        }
      },
    });
  }
  return db;
};

export const saveSettings = async (settings: Record<string, any>) => {
  const database = await initDB();
  const tx = database.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  
  // Save each setting individually
  await Promise.all(
    Object.entries(settings).map(([key, value]) => 
      store.put(value, key)
    )
  );
  
  await tx.done;
};

export const loadSettings = async (): Promise<Record<string, any>> => {
  const database = await initDB();
  const tx = database.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  
  const keys = await store.getAllKeys();
  const values = await Promise.all(
    keys.map(key => store.get(key))
  );
  
  const settings: Record<string, any> = {};
  keys.forEach((key, index) => {
    if (values[index] !== undefined) {
      settings[key] = values[index];
    }
  });
  
  return settings;
};

export const resetSettings = async () => {
  const database = await initDB();
  const tx = database.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await store.clear();
  await tx.done;
};

export const deleteSetting = async (key: string) => {
  const database = await initDB();
  const tx = database.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await store.delete(key);
  await tx.done;
}; 