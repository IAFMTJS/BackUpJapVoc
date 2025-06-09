import FallbackStorage from './fallbackStorage';

// Utility to check if IndexedDB is available
function isIndexedDBAvailable() {
  try {
    if (typeof window === 'undefined' || !window.indexedDB) return false;
    // Test if we can actually open a database
    const testRequest = window.indexedDB.open('__test__', 1);
    testRequest.onerror = () => {
      // IndexedDB is not available
    };
    testRequest.onsuccess = () => {
      // Clean up test database
      const db = testRequest.result;
      db.close();
      window.indexedDB.deleteDatabase('__test__');
    };
    return true;
  } catch (e) {
    return false;
  }
}

// Safe IndexedDB utility functions
export const safeIndexedDB = {
  open: (name: string, version?: number): Promise<IDBDatabase> => {
    if (!isIndexedDBAvailable()) {
      console.warn('IndexedDB not available, using fallback storage');
      return Promise.reject(new Error('IndexedDB is not available - using fallback storage'));
    }
    
    return new Promise((resolve, reject) => {
      try {
        const request = window.indexedDB.open(name, version);
        
        request.onerror = (event) => {
          const error = request.error;
          console.warn(`Failed to open IndexedDB "${name}":`, error);
          
          // Handle specific permission errors
          if (error?.name === 'NotAllowedError' || error?.name === 'SecurityError') {
            console.warn('IndexedDB access denied - using fallback storage');
            reject(new Error('IndexedDB access denied. Using fallback storage instead.'));
          } else {
            reject(error || new Error('Failed to open IndexedDB'));
          }
        };
        
        request.onsuccess = () => {
          resolve(request.result);
        };
        
        request.onblocked = (event) => {
          console.warn('IndexedDB blocked:', event);
          reject(new Error('IndexedDB is blocked by another connection'));
        };
        
        request.onupgradeneeded = (event) => {
          // Handle upgrade if needed
          console.log('IndexedDB upgrade needed:', event);
        };
      } catch (error) {
        console.warn('Error opening IndexedDB:', error);
        reject(error);
      }
    });
  },
  
  deleteDatabase: (name: string): Promise<void> => {
    if (!isIndexedDBAvailable()) {
      console.warn('IndexedDB not available for deletion');
      return Promise.resolve();
    }
    
    return new Promise((resolve, reject) => {
      try {
        const request = window.indexedDB.deleteDatabase(name);
        
        request.onerror = (event) => {
          const error = request.error;
          console.warn(`Failed to delete IndexedDB "${name}":`, error);
          reject(error || new Error('Failed to delete IndexedDB'));
        };
        
        request.onsuccess = () => {
          resolve();
        };
      } catch (error) {
        console.warn('Error deleting IndexedDB:', error);
        reject(error);
      }
    });
  },
  
  // Check if IndexedDB is available without throwing
  isAvailable: (): boolean => {
    return isIndexedDBAvailable();
  },

  // Get fallback storage instance
  getFallbackStorage: (): FallbackStorage => {
    return FallbackStorage.getInstance();
  }
};

export default safeIndexedDB; 