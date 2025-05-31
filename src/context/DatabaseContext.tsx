import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  initializeDatabase, 
  getDatabase, 
  isDatabaseReady, 
  databasePromise,
  JapVocDB, 
  IDBPDatabase 
} from '../utils/databaseConfig';

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
  database: IDBPDatabase<JapVocDB> | null;
  isReady: boolean;
  error: string | null;
}

const DatabaseContext = createContext<DatabaseContextType>({
  database: null,
  isReady: false,
  error: null
});

// Create the provider component
export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [database, setDatabase] = useState<IDBPDatabase<JapVocDB> | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    console.log('[DatabaseContext] Starting database initialization...');

    const initDatabase = async () => {
      try {
        // Initialize database
        console.log('[DatabaseContext] Initializing database...');
        const db = await initializeDatabase();
        
        // Verify database is ready
        const ready = await isDatabaseReady();
        if (!ready) {
          throw new Error('Database not ready after initialization');
        }

        if (isMounted) {
          setDatabase(db);
          setIsReady(true);
        }
      } catch (err) {
        console.error('[DatabaseContext] Failed to initialize database:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize database');
          setIsReady(false);
        }
      }
    };

    initDatabase();

    // Cleanup function
    return () => {
      isMounted = false;
      if (database) {
        console.log('[DatabaseContext] Closing database connection...');
        database.close();
      }
    };
  }, []);

  // Debug logging for state changes
  useEffect(() => {
    console.log('[DatabaseContext] State updated:', {
      hasDatabase: !!database,
      isReady,
      error
    });
  }, [database, isReady, error]);

  return (
    <DatabaseContext.Provider value={{ database, isReady, error }}>
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