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

// Chunk loading error handler for mobile devices
export const setupChunkErrorHandling = () => {
  // Store retry attempts for each chunk
  const retryAttempts = new Map<string, number>();
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000; // 2 seconds

  // Override webpack chunk loading to add retry logic
  if (typeof window !== 'undefined' && window.webpackChunkBackupJapVoc) {
    const originalPush = window.webpackChunkBackupJapVoc.push;
    
    window.webpackChunkBackupJapVoc.push = function(chunk: any) {
      try {
        return originalPush.call(this, chunk);
      } catch (error) {
        console.error('Chunk loading error:', error);
        
        // Try to identify which chunk failed
        const chunkId = chunk?.[0] || 'unknown';
        const attempts = retryAttempts.get(chunkId) || 0;
        
        if (attempts < MAX_RETRIES) {
          retryAttempts.set(chunkId, attempts + 1);
          console.log(`Retrying chunk ${chunkId} (attempt ${attempts + 1}/${MAX_RETRIES})`);
          
          // Retry after delay
          setTimeout(() => {
            try {
              originalPush.call(this, chunk);
            } catch (retryError) {
              console.error(`Chunk retry failed for ${chunkId}:`, retryError);
            }
          }, RETRY_DELAY);
        } else {
          console.error(`Max retries exceeded for chunk ${chunkId}`);
          // Show user-friendly error message
          showChunkErrorToUser(chunkId);
        }
        
        return [];
      }
    };
  }

  // Handle webpack chunk loading errors
  window.addEventListener('error', (event) => {
    if (event.error && event.error.message && event.error.message.includes('Loading chunk')) {
      console.error('Chunk loading error detected:', event.error);
      
      // Extract chunk ID from error message
      const chunkMatch = event.error.message.match(/Loading chunk (\d+) failed/);
      if (chunkMatch) {
        const chunkId = chunkMatch[1];
        const attempts = retryAttempts.get(chunkId) || 0;
        
        if (attempts < MAX_RETRIES) {
          retryAttempts.set(chunkId, attempts + 1);
          console.log(`Retrying failed chunk ${chunkId} (attempt ${attempts + 1}/${MAX_RETRIES})`);
          
          // Force page reload as fallback
          setTimeout(() => {
            console.log('Reloading page due to chunk loading failure');
            window.location.reload();
          }, RETRY_DELAY);
        } else {
          showChunkErrorToUser(chunkId);
        }
      }
    }
  });

  // Handle unhandled promise rejections (common with chunk loading)
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && typeof event.reason === 'string' && event.reason.includes('Loading chunk')) {
      console.error('Unhandled chunk loading rejection:', event.reason);
      event.preventDefault(); // Prevent default error handling
      
      // Show user-friendly error message
      showChunkErrorToUser('unknown');
    }
  });
};

// Show user-friendly error message
const showChunkErrorToUser = (chunkId: string) => {
  // Create error notification
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #ef4444;
    color: white;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 10000;
    max-width: 300px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  
  errorDiv.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 8px;">Loading Error</div>
    <div style="font-size: 14px; margin-bottom: 12px;">
      There was an issue loading part of the application. Please try refreshing the page.
    </div>
    <button onclick="window.location.reload()" style="
      background: white;
      color: #ef4444;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
    ">Refresh Page</button>
    <button onclick="this.parentElement.remove()" style="
      background: transparent;
      color: white;
      border: 1px solid white;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      margin-left: 8px;
    ">Dismiss</button>
  `;
  
  document.body.appendChild(errorDiv);
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (errorDiv.parentElement) {
      errorDiv.remove();
    }
  }, 10000);
};

// Add global webpack chunk loading global
declare global {
  interface Window {
    webpackChunkBackupJapVoc: any[];
  }
} 