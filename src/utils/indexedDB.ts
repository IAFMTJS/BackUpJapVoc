// Re-export all database functions and types from databaseConfig.ts
export {
  DB_CONFIG,
  addBulkToStore,
  addToStore,
  clearStore,
  databasePromise,
  deleteBulkFromStore,
  deleteFromStore,
  forceDatabaseReset,
  getAllFromStore,
  getDatabase,
  getFromStore,
  initializeDatabase,
  isDatabaseReady,
  safeDatabaseReset,
  updateBulkInStore,
  updateInStore,
  // Progress and settings functions
  saveProgress,
  saveBulkProgress,
  getProgress,
  savePendingProgress,
  saveBulkPendingProgress,
  getPendingProgress,
  clearPendingProgress,
  saveSettings,
  getSettings,
  createBackup,
  restoreBackup,
  type StoreName
} from './databaseConfig';

// Re-export types
export type { IndexedDBConfig } from './indexedDB.d'; 