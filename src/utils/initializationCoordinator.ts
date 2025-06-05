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

const INIT_TIMEOUT = process.env.NODE_ENV === 'production' ? 60000 : 30000; // 60 seconds timeout for initialization in production
const DB_TIMEOUT = process.env.NODE_ENV === 'production' ? 20000 : 10000; // 20 seconds timeout for database in production
const CRITICAL_DATA_TIMEOUT = process.env.NODE_ENV === 'production' ? 30000 : 15000; // 30 seconds timeout for critical data in production

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
  private lastProgressUpdate: number = Date.now();
  private progressUpdateTimeout: NodeJS.Timeout | null = null;

  subscribe(listener: (state: InitState) => void) {
    console.log('[InitializationCoordinator] New subscriber added');
    this.listeners.push(listener);
    // Immediately notify the new subscriber of current state
    listener(this.state);
    return () => {
      console.log('[InitializationCoordinator] Subscriber removed');
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private updateState(update: Partial<InitState>) {
    const oldState = { ...this.state };
    this.state = { ...this.state, ...update };
    console.log('[InitializationCoordinator] State updated:', {
      from: oldState,
      to: this.state,
      update
    });
    this.listeners.forEach(listener => listener(this.state));
  }

  private updateProgress(step: string, progress: number, details?: string) {
    const now = Date.now();
    console.log('[InitializationCoordinator] Progress update:', { 
      step, 
      progress, 
      details,
      timeSinceLastUpdate: now - this.lastProgressUpdate 
    });

    // If progress hasn't changed in 5 seconds, force an update
    if (this.progressUpdateTimeout) {
      clearTimeout(this.progressUpdateTimeout);
    }

    this.progressUpdateTimeout = setTimeout(() => {
      if (this.state.progress.progress === progress && 
          this.state.progress.step === step &&
          !this.state.isInitialized) {
        console.warn('[InitializationCoordinator] Progress stalled, forcing update');
        this.updateState({
          progress: { 
            step: `${step} (stalled)`, 
            progress: Math.min(progress + 1, 99),
            details: 'Progress stalled, forcing update...'
          }
        });
      }
    }, 5000);

    this.lastProgressUpdate = now;
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
      
      // Add retry logic for database initialization
      let retryCount = 0;
      const maxRetries = process.env.NODE_ENV === 'production' ? 3 : 1;
      
      while (retryCount < maxRetries) {
        try {
          // Initialize the database using the correct function
          await this.withTimeout(
            initializeDatabase(),
            DB_TIMEOUT,
            'Database initialization timed out'
          );
          
          // Wait for the database to be ready
          const db = await this.withTimeout(
            getDatabase(),
            DB_TIMEOUT,
            'Database connection timed out'
          );

          if (!db) {
            throw new Error('Database initialization failed - no database instance returned');
          }

          // Wait for database to be ready
          await this.withTimeout(
            isDatabaseReady(),
            DB_TIMEOUT,
            'Database ready check timed out'
          );

          this.updateProgress('Database initialized', 30);
          return db;
        } catch (error) {
          retryCount++;
          if (retryCount >= maxRetries) {
            throw error;
          }
          console.warn(`Database initialization attempt ${retryCount} failed, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
        }
      }
      
      throw new Error('Database initialization failed after all retries');
    } catch (error) {
      if (error instanceof Error) {
        const errorMessage = process.env.NODE_ENV === 'production' 
          ? 'Database initialization failed. Please try refreshing the page.'
          : `Database initialization failed: ${error.message}`;
        throw new Error(errorMessage);
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
      console.warn('[InitializationCoordinator] Initialization already in progress');
      return;
    }

    console.log('[InitializationCoordinator] Starting initialization process');
    this.abortController = new AbortController();
    const signal = this.abortController.signal;
    this.lastProgressUpdate = Date.now();

    try {
      this.updateState({
        isInitializing: true,
        error: null,
        progress: { step: 'Starting initialization...', progress: 0 }
      });

      // Add a safety timeout to force completion
      const safetyTimeout = setTimeout(() => {
        if (!this.state.isInitialized) {
          console.warn('[InitializationCoordinator] Safety timeout reached, forcing completion');
          // In production, we'll try to continue with partial initialization
          if (process.env.NODE_ENV === 'production') {
            this.updateState({
              isInitialized: true,
              isInitializing: false,
              criticalDataLoaded: this.state.criticalDataLoaded,
              progress: { 
                step: 'Initialization partially complete (safety timeout)', 
                progress: 100,
                details: 'Some features may be limited'
              }
            });
          } else {
            this.updateState({
              isInitialized: true,
              isInitializing: false,
              criticalDataLoaded: true,
              progress: { step: 'Initialization complete (safety timeout)', progress: 100 }
            });
          }
        }
      }, INIT_TIMEOUT);

      console.log('[InitializationCoordinator] Initializing database...');
      const db = await this.initializeDatabase();
      if (signal.aborted) {
        console.log('[InitializationCoordinator] Initialization aborted after database init');
        return;
      }

      console.log('[InitializationCoordinator] Loading critical data...');
      await this.loadCriticalData(db);
      if (signal.aborted) {
        console.log('[InitializationCoordinator] Initialization aborted after critical data load');
        return;
      }

      console.log('[InitializationCoordinator] Critical data loaded, updating state');
      this.updateState({ criticalDataLoaded: true });

      console.log('[InitializationCoordinator] Loading non-critical data...');
      await this.loadNonCriticalData(db);
      if (signal.aborted) {
        console.log('[InitializationCoordinator] Initialization aborted after non-critical data load');
        return;
      }

      clearTimeout(safetyTimeout);
      console.log('[InitializationCoordinator] Initialization complete, updating final state');
      this.updateState({
        isInitialized: true,
        isInitializing: false,
        progress: { step: 'Initialization complete', progress: 100 }
      });
    } catch (error) {
      console.error('[InitializationCoordinator] Initialization failed:', error);
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
      console.log('[InitializationCoordinator] Cleanup after initialization');
      if (this.progressUpdateTimeout) {
        clearTimeout(this.progressUpdateTimeout);
      }
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