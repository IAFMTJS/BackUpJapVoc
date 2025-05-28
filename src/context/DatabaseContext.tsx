import React, { createContext, useContext, useState, useEffect } from 'react';
import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Define the database schema
interface JapVocDB extends DBSchema {
  words: {
    key: string;
    value: {
      id: string;
      japanese: string;
      english: string;
      romaji?: string;
      level?: number;
      category?: string;
      notes?: string;
      lastReviewed?: Date;
      mastery?: number;
    };
    indexes: {
      'by-japanese': string;
      'by-level': number;
      'by-category': string;
    };
  };
  wordRelationships: {
    key: string;
    value: {
      id: string;
      wordId: string;
      relatedWordId: string;
      relationshipType: string;
      strength: number;
    };
    indexes: {
      'by-word': string;
      'by-relationship': string;
    };
  };
  wordEtymology: {
    key: string;
    value: {
      id: string;
      wordId: string;
      origin: string;
      components: string[];
      meaning: string;
    };
    indexes: {
      'by-word': string;
    };
  };
  wordFrequency: {
    key: string;
    value: {
      id: string;
      wordId: string;
      frequency: number;
      source: string;
      lastUpdated: Date;
    };
    indexes: {
      'by-word': string;
      'by-frequency': number;
    };
  };
}

// Create the context
interface DatabaseContextType {
  db: IDBPDatabase<JapVocDB> | null;
  isReady: boolean;
  error: Error | null;
}

const DatabaseContext = createContext<DatabaseContextType>({
  db: null,
  isReady: false,
  error: null
});

// Create the provider component
export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [db, setDb] = useState<IDBPDatabase<JapVocDB> | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initDatabase = async () => {
      try {
        // Open the database
        const database = await openDB<JapVocDB>('JapVocDB', 1, {
          upgrade(db) {
            // Create object stores
            if (!db.objectStoreNames.contains('words')) {
              const wordStore = db.createObjectStore('words', { keyPath: 'id' });
              wordStore.createIndex('by-japanese', 'japanese');
              wordStore.createIndex('by-level', 'level');
              wordStore.createIndex('by-category', 'category');
            }

            if (!db.objectStoreNames.contains('wordRelationships')) {
              const relationshipStore = db.createObjectStore('wordRelationships', { keyPath: 'id' });
              relationshipStore.createIndex('by-word', 'wordId');
              relationshipStore.createIndex('by-relationship', 'relationshipType');
            }

            if (!db.objectStoreNames.contains('wordEtymology')) {
              const etymologyStore = db.createObjectStore('wordEtymology', { keyPath: 'id' });
              etymologyStore.createIndex('by-word', 'wordId');
            }

            if (!db.objectStoreNames.contains('wordFrequency')) {
              const frequencyStore = db.createObjectStore('wordFrequency', { keyPath: 'id' });
              frequencyStore.createIndex('by-word', 'wordId');
              frequencyStore.createIndex('by-frequency', 'frequency');
            }
          },
        });

        setDb(database);
        setIsReady(true);
        setError(null);
      } catch (err) {
        console.error('Failed to initialize database:', err);
        setError(err instanceof Error ? err : new Error('Failed to initialize database'));
        setIsReady(false);
      }
    };

    initDatabase();

    // Cleanup function
    return () => {
      if (db) {
        db.close();
      }
    };
  }, []);

  return (
    <DatabaseContext.Provider value={{ db, isReady, error }}>
      {children}
    </DatabaseContext.Provider>
  );
};

// Custom hook to use the database context
export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}; 