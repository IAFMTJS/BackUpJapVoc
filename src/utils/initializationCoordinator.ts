import { 
  DB_CONFIG, 
  initializeDatabase, 
  getDatabase, 
  isDatabaseReady 
} from './indexedDB';
import { importWords } from './importWords';
import { importDictionaryData } from './importDictionaryData';
import { initializeMoodWords } from './initMoodWords';
import { initializeAudioCache } from './audio';

export type InitProgress = {
  step: string;
  progress: number;
  details?: string;
  error?: string;
};

export type InitState = {
  isInitialized: boolean;
  isInitializing: boolean;
  criticalDataLoaded: boolean;
  error: string | null;
  progress: InitProgress;
};

const INIT_TIMEOUT = 30000; // 30 seconds timeout for initialization
const DB_TIMEOUT = 10000; // 10 seconds timeout for database
const CRITICAL_DATA_TIMEOUT = 15000; // 15 seconds timeout for critical data

class InitializationCoordinator {
  private state: InitState = {
    isInitialized: false,
    isInitializing: false,
    criticalDataLoaded: false,
    error: null,
    progress: { step: 'Starting initialization...', progress: 0 }
  };

  private listeners: ((state: InitState) => void)[] = [];
  private abortController: AbortController | null = null;

  subscribe(listener: (state: InitState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private updateState(update: Partial<InitState>) {
    this.state = { ...this.state, ...update };
    this.listeners.forEach(listener => listener(this.state));
  }

  private updateProgress(step: string, progress: number, details?: string) {
    this.updateState({
      progress: { step, progress, details }
    });
  }

  private async withTimeout<T>(
    promise: Promise<T>,
    timeout: number,
    errorMessage: string
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(errorMessage)), timeout);
    });

    return Promise.race([promise, timeoutPromise]);
  }

  private async initializeDatabase() {
    try {
      this.updateProgress('Initializing database...', 10);
      
      // Initialize the database using the correct function
      await initializeDatabase();
      
      // Wait for the database to be ready
      const db = await getDatabase();
      if (!db) {
        throw new Error('Database initialization failed - no database instance returned');
      }

      // Wait for database to be ready
      await isDatabaseReady();

      this.updateProgress('Database initialized', 30);
      return db;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Database initialization failed: ${error.message}`);
      }
      throw error;
    }
  }

  private async loadCriticalData(db: IDBDatabase) {
    try {
      console.log('[Initialization] Starting critical data loading...');
      this.updateProgress('Loading critical data...', 40);
      
      // First check if we already have data
      const tx = db.transaction('words', 'readonly');
      const store = tx.objectStore('words');
      const count = await store.count();
      
      if (count > 0) {
        console.log(`[Initialization] Found ${count} existing words, skipping import`);
        this.updateProgress('Critical data already loaded', 60);
        return { wordsResult: { success: true }, dictionaryResult: { success: true } };
      }

      // If no data exists, load it once
      console.log('[Initialization] No existing data found, starting import...');
      const importPromise = importWords(db).catch(error => {
        console.error('[Initialization] Word import failed:', error);
        return null;
      });

      const result = await this.withTimeout(
        importPromise,
        CRITICAL_DATA_TIMEOUT,
        'Critical data loading timed out'
      );

      if (!result) {
        console.error('[Initialization] Import failed');
        throw new Error('Failed to load critical data');
      }

      this.updateProgress('Critical data loaded', 60);
      return { wordsResult: result, dictionaryResult: { success: true } };
    } catch (error) {
      console.error('[Initialization] Critical data loading failed:', error);
      if (error instanceof Error) {
        throw new Error(`Critical data loading failed: ${error.message}`);
      }
      throw error;
    }
  }

  private async loadNonCriticalData(db: IDBDatabase) {
    try {
      this.updateProgress('Loading additional data...', 70);
      
      await Promise.allSettled([
        initializeMoodWords(db).catch(error => {
          console.warn('Mood words initialization failed:', error);
        }),
        initializeAudioCache(db).catch(error => {
          console.warn('Audio cache initialization failed:', error);
        })
      ]);

      this.updateProgress('Additional data loaded', 90);
    } catch (error) {
      console.warn('Non-critical data loading had issues:', error);
      // Don't throw, as this is non-critical
    }
  }

  async initialize() {
    if (this.state.isInitializing) {
      console.warn('Initialization already in progress');
      return;
    }

    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    try {
      this.updateState({
        isInitializing: true,
        error: null,
        progress: { step: 'Starting initialization...', progress: 0 }
      });

      // Initialize database with timeout
      const db = await this.initializeDatabase();
      if (signal.aborted) return;

      // Load critical data with timeout
      await this.loadCriticalData(db);
      if (signal.aborted) return;

      this.updateState({ criticalDataLoaded: true });

      // Load non-critical data (no timeout, as it's not blocking)
      await this.loadNonCriticalData(db);
      if (signal.aborted) return;

      // Complete initialization
      this.updateState({
        isInitialized: true,
        isInitializing: false,
        progress: { step: 'Initialization complete', progress: 100 }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error';
      this.updateState({
        isInitialized: false,
        isInitializing: false,
        error: errorMessage,
        progress: {
          step: 'Initialization failed',
          progress: this.state.progress.progress,
          error: errorMessage
        }
      });
      throw error;
    } finally {
      this.abortController = null;
    }
  }

  abort() {
    if (this.abortController) {
      this.abortController.abort();
      this.updateState({
        isInitializing: false,
        error: 'Initialization aborted',
        progress: {
          step: 'Initialization aborted',
          progress: this.state.progress.progress,
          error: 'Initialization was aborted'
        }
      });
    }
  }

  getState(): InitState {
    return { ...this.state };
  }
}

// Create a singleton instance
export const initializationCoordinator = new InitializationCoordinator(); 