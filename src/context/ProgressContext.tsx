import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  ProgressItem,
  PendingProgressItem,
  Settings,
  ApiResponse,
  SyncRequest,
  SyncResponse
} from '../types';
import {
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
  restoreBackup
} from '../utils/indexedDB';
import { useAuth } from './AuthContext';
import { 
  db,
  auth,
  functions,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  increment,
  arrayUnion,
  arrayRemove,
  deleteDoc,
  onSnapshot,
  type DocumentReference,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Firestore
} from '../utils/firebase';

// Progress tracking types
export interface ProgressItem {
  id: string;
  userId: string;
  section: string;
  itemId: string;
  correct: number;
  incorrect: number;
  total?: number;  // Optional total property for tracking total items
  lastAttempted: number;
  timestamp: number;
  version: string;
}

interface ProgressContextType {
  // Progress state
  progress: Record<string, ProgressItem>;
  pendingProgress: PendingProgressItem[];
  isLoading: boolean;
  error: string | null;
  
  // Settings state
  settings: Settings | null;
  isSettingsLoading: boolean;
  settingsError: string | null;
  
  // Progress actions
  updateProgress: (section: string, itemId: string, correct: boolean) => Promise<void>;
  setTotalItems: (section: string, total: number) => void;
  syncProgress: () => Promise<void>;
  clearProgress: () => Promise<void>;
  
  // Settings actions
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
  
  // Backup actions
  createDataBackup: () => Promise<{
    progress: ProgressItem[];
    pending: PendingProgressItem[];
    settings: Settings[];
  }>;
  restoreDataBackup: (backup: {
    progress: ProgressItem[];
    pending: PendingProgressItem[];
    settings: Settings[];
  }) => Promise<void>;
  
  // Status
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: number | null;
  
  // Streak tracking
  currentStreak: number;
  bestStreak: number;
  lastStudyDate: Date | null;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

const DEFAULT_USER_ID = 'default';

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<Record<string, ProgressItem>>({});
  const [pendingProgress, setPendingProgress] = useState<PendingProgressItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Settings state
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  
  // Sync state
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  
  // Streak tracking
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [lastStudyDate, setLastStudyDate] = useState<Date | null>(null);
  
  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Load settings first
        const userSettings = await getSettings(DEFAULT_USER_ID);
        setSettings(userSettings ?? null);
        
        // Load progress
        const userProgress = await getProgress(DEFAULT_USER_ID);
        const progressMap = userProgress.reduce((acc, item) => {
          acc[`${item.section}-${item.itemId}`] = item;
          return acc;
        }, {} as Record<string, ProgressItem>);
        setProgress(progressMap);
        
        // Load pending progress
        const pending = await getPendingProgress(DEFAULT_USER_ID);
        setPendingProgress(pending);
        
        // Update last sync time from settings
        if (userSettings) {
          setLastSyncTime(userSettings.lastSync);
        }
        
        // Load streak data
        if (user) {
          const userProgressRef = doc(db, 'users', user.uid, 'progress', 'data');
          const docSnap = await getDoc(userProgressRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setCurrentStreak(data.currentStreak || 0);
            setBestStreak(data.bestStreak || 0);
            setLastStudyDate(data.lastStudyDate?.toDate() || null);
          }
        }
      } catch (err) {
        console.error('[ProgressContext] Failed to load initial data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load progress data');
      } finally {
        setIsLoading(false);
        setIsSettingsLoading(false);
      }
    };
    
    loadInitialData();
  }, [user]);
  
  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      console.log('[ProgressContext] Online status detected');
      setIsOnline(true);
      // Trigger sync when coming back online
      syncProgress().catch(err => {
        console.error('[ProgressContext] Failed to sync after coming online:', err);
      });
    };
    
    const handleOffline = () => {
      console.log('[ProgressContext] Offline status detected');
      setIsOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Update streak when progress is made
  const updateStreak = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!lastStudyDate) {
      // First study session
      setCurrentStreak(1);
      setBestStreak(1);
      setLastStudyDate(today);
      return;
    }

    const lastDate = new Date(lastStudyDate);
    lastDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Already studied today, streak remains the same
      return;
    } else if (diffDays === 1) {
      // Studied yesterday, increment streak
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      setBestStreak(Math.max(bestStreak, newStreak));
      setLastStudyDate(today);
    } else {
      // Streak broken
      setCurrentStreak(1);
      setLastStudyDate(today);
    }
  };
  
  // Update progress with offline support
  const updateProgress = useCallback(async (section: string, itemId: string, correct: boolean) => {
    const key = `${section}-${itemId}`;
    const timestamp = Date.now();
    
    try {
      // Create or update progress item
      const existingProgress = progress[key];
      const updatedProgress: ProgressItem = {
        id: existingProgress?.id ?? uuidv4(),
        userId: DEFAULT_USER_ID,
        section,
        itemId,
        // If correct is false (unmarking), reset to 0, otherwise increment
        correct: correct ? (existingProgress?.correct ?? 0) + 1 : 0,
        incorrect: existingProgress?.incorrect ?? 0,
        lastAttempted: timestamp,
        timestamp: existingProgress?.timestamp ?? timestamp,
        version: '1.0.0' // TODO: Get from app version
      };
      
      // Update local state
      setProgress(prev => ({
        ...prev,
        [key]: updatedProgress
      }));
      
      if (isOnline) {
        // Try to save directly if online
        try {
          await saveProgress(updatedProgress);
        } catch (err) {
          console.error('[ProgressContext] Failed to save progress online:', err);
          // Fall back to pending if direct save fails
          throw err;
        }
      } else {
        // Save as pending if offline
        const pendingItem: PendingProgressItem = {
          id: updatedProgress.id,
          userId: updatedProgress.userId,
          section: updatedProgress.section,
          itemId: updatedProgress.itemId,
          correct: updatedProgress.correct,
          incorrect: updatedProgress.incorrect,
          lastAttempted: updatedProgress.lastAttempted,
          timestamp: updatedProgress.timestamp,
          version: updatedProgress.version,
          status: 'pending',
          retryCount: 0,
          lastAttempt: timestamp
        };
        
        await savePendingProgress(pendingItem);
        setPendingProgress(prev => [...prev, pendingItem]);
      }
      
      // Update streak
      updateStreak();
    } catch (err) {
      console.error('[ProgressContext] Failed to update progress:', err);
      setError(err instanceof Error ? err.message : 'Failed to update progress');
      throw err;
    }
  }, [progress, isOnline]);
  
  // Sync progress with server
  const syncProgress = useCallback(async () => {
    if (!isOnline || isSyncing || pendingProgress.length === 0) {
      return;
    }
    
    try {
      setIsSyncing(true);
      setError(null);
      
      // Group pending items by status
      const pendingItems = pendingProgress.filter(item => item.status === 'pending');
      if (pendingItems.length === 0) {
        return;
      }
      
      // Prepare sync request
      const syncRequest: SyncRequest = {
        userId: DEFAULT_USER_ID,
        progress: pendingItems,
        version: '1.0.0' // TODO: Get from app version
      };
      
      // Send to server
      const response = await fetch('/api/sync-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(syncRequest)
      });
      
      if (!response.ok) {
        throw new Error(`Sync failed with status: ${response.status}`);
      }
      
      const result = await response.json() as SyncResponse;
      
      if (!result.success) {
        throw new Error(result.error ?? 'Sync failed');
      }
      
      // Update local state based on sync result
      if (result.data) {
        const { synced, failed, conflicts } = result.data;
        
        // Update synced items
        const syncedItems = pendingItems.filter((_, index) => index < synced);
        await Promise.all(syncedItems.map(item => 
          saveProgress({ ...item, status: 'synced' })
        ));
        
        // Update failed items
        const failedItems = pendingItems.filter((_, index) => 
          index >= synced && index < synced + failed
        );
        await Promise.all(failedItems.map(item => 
          savePendingProgress({
            ...item,
            status: 'failed',
            retryCount: item.retryCount + 1,
            lastAttempt: Date.now()
          })
        ));
        
        // Handle conflicts
        if (conflicts.length > 0) {
          // TODO: Implement conflict resolution
          console.warn('[ProgressContext] Conflicts detected:', conflicts);
        }
        
        // Update settings with last sync time
        const newSettings: Settings = {
          ...settings!,
          lastSync: Date.now()
        };
        await saveSettings(newSettings);
        setSettings(newSettings);
        setLastSyncTime(newSettings.lastSync);
        
        // Update local state
        setPendingProgress(prev => 
          prev.filter(item => !syncedItems.some(synced => synced.id === item.id))
        );
      }
    } catch (err) {
      console.error('[ProgressContext] Sync failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to sync progress');
      throw err;
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, pendingProgress, settings]);
  
  // Clear all progress
  const clearProgress = useCallback(async () => {
    try {
      setError(null);
      
      // Clear from IndexedDB
      await Promise.all([
        clearPendingProgress(DEFAULT_USER_ID),
        // TODO: Add clearProgress function to IndexedDB utils
      ]);
      
      // Clear local state
      setProgress({});
      setPendingProgress([]);
      
      // Update settings
      if (settings) {
        const newSettings: Settings = {
          ...settings,
          lastSync: Date.now()
        };
        await saveSettings(newSettings);
        setSettings(newSettings);
        setLastSyncTime(newSettings.lastSync);
      }
    } catch (err) {
      console.error('[ProgressContext] Failed to clear progress:', err);
      setError(err instanceof Error ? err.message : 'Failed to clear progress');
      throw err;
    }
  }, [settings]);
  
  // Update settings
  const updateSettings = useCallback(async (newSettings: Partial<Settings>) => {
    if (!settings) {
      throw new Error('Settings not initialized');
    }
    
    try {
      setSettingsError(null);
      
      const updatedSettings: Settings = {
        ...settings,
        ...newSettings,
        lastSync: Date.now()
      };
      
      await saveSettings(updatedSettings);
      setSettings(updatedSettings);
      setLastSyncTime(updatedSettings.lastSync);
    } catch (err) {
      console.error('[ProgressContext] Failed to update settings:', err);
      setSettingsError(err instanceof Error ? err.message : 'Failed to update settings');
      throw err;
    }
  }, [settings]);
  
  // Create data backup
  const createDataBackup = useCallback(async () => {
    try {
      return await createBackup();
    } catch (err) {
      console.error('[ProgressContext] Failed to create backup:', err);
      throw err;
    }
  }, []);
  
  // Restore data backup
  const restoreDataBackup = useCallback(async (backup: {
    progress: ProgressItem[];
    pending: PendingProgressItem[];
    settings: Settings[];
  }) => {
    try {
      setError(null);
      setSettingsError(null);
      
      // Restore from backup
      await restoreBackup(backup);
      
      // Update local state
      const progressMap = backup.progress.reduce((acc, item) => {
        acc[`${item.section}-${item.itemId}`] = item;
        return acc;
      }, {} as Record<string, ProgressItem>);
      
      setProgress(progressMap);
      setPendingProgress(backup.pending);
      
      if (backup.settings.length > 0) {
        const userSettings = backup.settings.find(s => s.userId === DEFAULT_USER_ID);
        if (userSettings) {
          setSettings(userSettings);
          setLastSyncTime(userSettings.lastSync);
        }
      }
    } catch (err) {
      console.error('[ProgressContext] Failed to restore backup:', err);
      setError(err instanceof Error ? err.message : 'Failed to restore backup');
      throw err;
    }
  }, []);
  
  // Add setTotalItems function
  const setTotalItems = useCallback((section: string, total: number) => {
    setProgress(prev => {
      const sectionKey = `${section}-total`;
      const existingProgress = prev[sectionKey];
      
      if (existingProgress && existingProgress.total === total) {
        return prev;
      }

      const updatedProgress: ProgressItem = {
        id: existingProgress?.id ?? uuidv4(),
        userId: DEFAULT_USER_ID,
        section,
        itemId: 'total',
        correct: existingProgress?.correct ?? 0,
        incorrect: existingProgress?.incorrect ?? 0,
        total,
        lastAttempted: Date.now(),
        timestamp: existingProgress?.timestamp ?? Date.now(),
        version: '1.0.0'
      };

      return {
        ...prev,
        [sectionKey]: updatedProgress
      };
    });
  }, []);
  
  const value: ProgressContextType = {
    // Progress state
    progress,
    pendingProgress,
    isLoading,
    error,
    
    // Settings state
    settings,
    isSettingsLoading,
    settingsError,
    
    // Progress actions
    updateProgress,
    setTotalItems,
    syncProgress,
    clearProgress,
    
    // Settings actions
    updateSettings,
    
    // Backup actions
    createDataBackup,
    restoreDataBackup,
    
    // Status
    isOnline,
    isSyncing,
    lastSyncTime,
    
    // Streak tracking
    currentStreak,
    bestStreak,
    lastStudyDate
  };
  
  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}; 