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
  db: IDBPDatabase<JapVocDB> | null;
  isReady: boolean;
  error: string | null;
  isInitializing: boolean;
  retryInitialization: () => Promise<void>;
  forceReset: () => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType>({
  db: null,
  isReady: false,
  error: null,
  isInitializing: false,
  retryInitialization: async () => {},
  forceReset: async () => {}
});

// Add debug logging utility
const DEBUG = true;
function log(component: string, message: string, data?: any) {
  if (DEBUG) {
    const timestamp = new Date().toISOString();
    if (data) {
      console.log(`[${timestamp}] [${component}] ${message}`, data);
    } else {
      console.log(`[${timestamp}] [${component}] ${message}`);
    }
  }
}

// Create the provider component
export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [db, setDb] = useState<IDBPDatabase<JapVocDB> | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [initPromise, setInitPromise] = useState<Promise<void> | null>(null);

  // Debug logging for state changes
  useEffect(() => {
    log('DatabaseContext', 'State updated', {
      hasDatabase: !!db,
      isReady,
      isInitializing,
      error,
      retryCount
    });
  }, [db, isReady, isInitializing, error, retryCount]);

  const retryInitialization = async () => {
    log('DatabaseContext', 'Retrying initialization');
    setError(null);
    setRetryCount(0);
    setIsInitializing(true);
    await initializeDatabase();
  };

  const forceReset = async () => {
    log('DatabaseContext', 'Force reset requested');
    try {
      setError(null);
      setIsInitializing(true);
      await forceDatabaseReset();
      log('DatabaseContext', 'Force reset completed, reloading page');
      window.location.reload();
    } catch (err) {
      log('DatabaseContext', 'Error during force reset', err);
      setError('Failed to reset database. Please try clearing your browser data manually.');
      setIsInitializing(false);
    }
  };

  const initializeDatabase = async () => {
    if (initPromise) {
      log('DatabaseContext', 'Database initialization already in progress, waiting...');
      return initPromise;
    }

    const promise = (async () => {
      try {
        log('DatabaseContext', 'Starting database initialization...');
        setIsInitializing(true);
        setError(null);

        // Use the shared databasePromise
        log('DatabaseContext', 'Waiting for database promise...');
        const database = await databasePromise;
        log('DatabaseContext', 'Database promise resolved');
        
        // Verify database is ready
        const ready = await isDatabaseReady();
        log('DatabaseContext', 'Database ready check', { ready });
        
        if (!ready) {
          log('DatabaseContext', 'Database not ready after initialization');
          if (retryCount < 3) {
            log('DatabaseContext', `Retrying initialization (${retryCount + 1}/3)...`);
            setRetryCount(prev => prev + 1);
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
            setInitPromise(null);
            return initializeDatabase();
          }
          throw new Error('Database not ready after multiple attempts');
        }

        // Update state in a single batch to avoid race conditions
        log('DatabaseContext', 'Updating database state...');
        await new Promise<void>(resolve => {
          setDb(database);
          setIsReady(true);
          setError(null);
          setIsInitializing(false);
          // Use requestAnimationFrame to ensure state updates are processed
          requestAnimationFrame(() => {
            log('DatabaseContext', 'Database state updated', {
              hasDatabase: !!database,
              isReady: true,
              isInitializing: false
            });
            resolve();
          });
        });

        log('DatabaseContext', 'Database initialized successfully');
      } catch (err) {
        log('DatabaseContext', 'Failed to initialize database', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize database');
        setIsReady(false);
        setIsInitializing(false);
        
        if (retryCount < 3) {
          log('DatabaseContext', `Retrying initialization (${retryCount + 1}/3)...`);
          setRetryCount(prev => prev + 1);
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          setInitPromise(null);
          return initializeDatabase();
        }
      } finally {
        setInitPromise(null);
      }
    })();

    setInitPromise(promise);
    return promise;
  };

  useEffect(() => {
    let mounted = true;
    log('DatabaseContext', 'Provider mounted');

    const init = async () => {
      try {
        log('DatabaseContext', 'Starting initial database initialization');
        await initializeDatabase();
        log('DatabaseContext', 'Initial database initialization completed');
      } catch (err) {
        if (mounted) {
          log('DatabaseContext', 'Initial initialization failed', err);
          setError(err instanceof Error ? err.message : 'Failed to initialize database');
          setIsReady(false);
          setIsInitializing(false);
        }
      }
    };

    init();

    return () => {
      log('DatabaseContext', 'Provider unmounting');
      mounted = false;
      if (db) {
        log('DatabaseContext', 'Closing database connection...');
        try {
          db.close();
        } catch (error) {
          log('DatabaseContext', 'Error closing database', error);
        }
      }
    };
  }, []);

  // Show loading state while initializing
  if (isInitializing && !error) {
    log('DatabaseContext', 'Rendering loading state');
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">
            {retryCount > 0 ? `Retrying database initialization (${retryCount}/3)...` : 'Initializing database...'}
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    log('DatabaseContext', 'Rendering error state', { error });
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Database Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <div className="space-y-3">
            <button
              onClick={retryInitialization}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Retry Initialization
            </button>
            <button
              onClick={forceReset}
              className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            >
              Force Reset Database
            </button>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            If the error persists, try clearing your browser data or using a different browser.
          </p>
        </div>
      </div>
    );
  }

  log('DatabaseContext', 'Rendering provider with children');
  return (
    <DatabaseContext.Provider value={{ 
      db, 
      isReady, 
      error, 
      isInitializing,
      retryInitialization,
      forceReset
    }}>
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