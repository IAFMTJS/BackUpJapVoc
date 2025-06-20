// Utility functions for handling chunk loading errors

export interface ChunkErrorInfo {
  chunkId: string;
  error: Error;
  timestamp: number;
  userAgent: string;
  url: string;
}

export class ChunkErrorHandler {
  private static instance: ChunkErrorHandler;
  private errorLog: ChunkErrorInfo[] = [];
  private maxLogSize = 10;

  static getInstance(): ChunkErrorHandler {
    if (!ChunkErrorHandler.instance) {
      ChunkErrorHandler.instance = new ChunkErrorHandler();
    }
    return ChunkErrorHandler.instance;
  }

  logChunkError(chunkId: string, error: Error): void {
    const errorInfo: ChunkErrorInfo = {
      chunkId,
      error,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.errorLog.push(errorInfo);
    
    // Keep only the last N errors
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }

    console.error(`Chunk loading error for chunk ${chunkId}:`, error);
    console.error('Error details:', errorInfo);

    // Store in localStorage for debugging
    try {
      localStorage.setItem('chunkErrorLog', JSON.stringify(this.errorLog));
    } catch (e) {
      console.warn('Could not save chunk error log to localStorage:', e);
    }
  }

  getErrorLog(): ChunkErrorInfo[] {
    return [...this.errorLog];
  }

  clearErrorLog(): void {
    this.errorLog = [];
    try {
      localStorage.removeItem('chunkErrorLog');
    } catch (e) {
      console.warn('Could not clear chunk error log from localStorage:', e);
    }
  }

  isChunkError(error: Error): boolean {
    return error.message.includes('Loading chunk') || 
           error.message.includes('ChunkLoadError') ||
           error.message.includes('99.505cc745.chunk.js') ||
           error.message.includes('chunk');
  }

  clearChunkCache(): void {
    // Clear webpack chunk cache
    if (window.webpackChunkBackupJapVoc) {
      window.webpackChunkBackupJapVoc = [];
    }

    // Clear any cached chunks from localStorage
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.includes('webpack') || key.includes('chunk')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.warn('Could not clear localStorage:', e);
    }

    // Clear service worker cache if available
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.unregister();
        });
      });
    }
  }

  async retryChunkLoad(chunkId: string): Promise<boolean> {
    try {
      // Clear the specific chunk from cache
      this.clearChunkCache();
      
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Force a page reload to retry
      window.location.reload();
      return true;
    } catch (error) {
      console.error('Failed to retry chunk load:', error);
      return false;
    }
  }
}

// Global chunk error handler instance
export const chunkErrorHandler = ChunkErrorHandler.getInstance();

// Export utility functions
export const handleChunkError = (error: Error): void => {
  if (chunkErrorHandler.isChunkError(error)) {
    // Extract chunk ID from error message
    const chunkMatch = error.message.match(/chunk\s+(\d+)/i);
    const chunkId = chunkMatch ? chunkMatch[1] : 'unknown';
    
    chunkErrorHandler.logChunkError(chunkId, error);
  }
};

export const setupChunkErrorHandling = (): void => {
  // Add global error listener
  window.addEventListener('error', (event) => {
    if (event.error && chunkErrorHandler.isChunkError(event.error)) {
      handleChunkError(event.error);
    }
  });

  // Add unhandled rejection listener
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && chunkErrorHandler.isChunkError(event.reason)) {
      handleChunkError(event.reason);
      event.preventDefault(); // Prevent default browser error handling
    }
  });
}; 