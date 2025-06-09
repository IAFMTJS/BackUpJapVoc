import { initializeSafeDatabase } from './safeDatabase';
import safeIndexedDB from './safeIndexedDB';
import safeLocalStorage from './safeLocalStorage';

// App initialization that handles storage permission issues gracefully
export async function initializeApp(): Promise<void> {
  console.log('Initializing app with safe storage...');

  try {
    // Try to initialize the safe database
    await initializeSafeDatabase();
    console.log('Safe database initialized successfully');
  } catch (error) {
    console.warn('Failed to initialize IndexedDB, will use fallback storage:', error);
  }

  // Check if we're using fallback storage
  if (!safeIndexedDB.isAvailable()) {
    console.warn('IndexedDB not available - using fallback storage for this session');
  }

  // Log storage status
  const storageStatus = {
    indexedDB: safeIndexedDB.isAvailable(),
    localStorage: safeLocalStorage.getItem('__test__') !== null, // Test if localStorage is available
    fallbackStorage: true // Always available
  };

  console.log('Storage status:', storageStatus);

  // Show user-friendly message if storage is limited
  if (!storageStatus.indexedDB) {
    console.warn('Limited storage available - some features may not persist between sessions');
  }
}

// Check if the app is running in a restricted environment
export function isRestrictedEnvironment(): boolean {
  const checks = {
    indexedDB: safeIndexedDB.isAvailable(),
    localStorage: safeLocalStorage.getItem('__test__') !== null, // Test if localStorage is available
    serviceWorker: 'serviceWorker' in navigator,
    cookies: navigator.cookieEnabled
  };

  const restricted = !checks.indexedDB || !checks.localStorage;
  
  if (restricted) {
    console.warn('Running in restricted environment:', checks);
  }

  return restricted;
}

// Get storage capabilities
export function getStorageCapabilities(): {
  indexedDB: boolean;
  localStorage: boolean;
  serviceWorker: boolean;
  cookies: boolean;
  restricted: boolean;
} {
  const capabilities = {
    indexedDB: safeIndexedDB.isAvailable(),
    localStorage: safeLocalStorage.getItem('__test__') !== null, // Test if localStorage is available
    serviceWorker: 'serviceWorker' in navigator,
    cookies: navigator.cookieEnabled
  };

  return {
    ...capabilities,
    restricted: !capabilities.indexedDB || !capabilities.localStorage
  };
}

export default initializeApp; 