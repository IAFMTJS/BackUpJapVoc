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
import { useLocalStorage } from '../hooks/useLocalStorage';

// Progress tracking types
export interface WordProgress {
  id: string;
  lastReviewed: number;
  reviewCount: number;
  masteryLevel: number; // 0-5
  nextReviewDate: number;
  notes?: string;
  favorite: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  section: 'dictionary' | 'mood' | 'culture';
}

export interface SectionProgress {
  totalItems: number;
  masteredItems: number;
  inProgressItems: number;
  notStartedItems: number;
  lastStudied: number;
  streak: number;
  averageMastery: number;
}

export interface ProgressState {
  words: { [key: string]: WordProgress };
  sections: {
    dictionary: SectionProgress;
    mood: SectionProgress;
    culture: SectionProgress;
  };
  preferences: {
    showRomaji: boolean;
    showEnglish: boolean;
    autoPlayAudio: boolean;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    dailyGoal: number;
    theme: 'light' | 'dark' | 'system';
  };
  statistics: {
    totalStudyTime: number;
    wordsLearned: number;
    currentStreak: number;
    longestStreak: number;
    lastStudyDate: number;
    dailyProgress: { [date: string]: number };
  };
}

const defaultProgress: ProgressState = {
  words: {},
  sections: {
    dictionary: {
      totalItems: 0,
      masteredItems: 0,
      inProgressItems: 0,
      notStartedItems: 0,
      lastStudied: 0,
      streak: 0,
      averageMastery: 0
    },
    mood: {
      totalItems: 0,
      masteredItems: 0,
      inProgressItems: 0,
      notStartedItems: 0,
      lastStudied: 0,
      streak: 0,
      averageMastery: 0
    },
    culture: {
      totalItems: 0,
      masteredItems: 0,
      inProgressItems: 0,
      notStartedItems: 0,
      lastStudied: 0,
      streak: 0,
      averageMastery: 0
    }
  },
  preferences: {
    showRomaji: true,
    showEnglish: true,
    autoPlayAudio: false,
    difficulty: 'beginner',
    dailyGoal: 20,
    theme: 'system'
  },
  statistics: {
    totalStudyTime: 0,
    wordsLearned: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastStudyDate: 0,
    dailyProgress: {}
  }
};

interface ProgressContextType {
  progress: ProgressState;
  updateWordProgress: (wordId: string, progress: Partial<WordProgress>) => void;
  updateSectionProgress: (section: keyof ProgressState['sections'], progress: Partial<SectionProgress>) => void;
  updatePreferences: (preferences: Partial<ProgressState['preferences']>) => void;
  updateStatistics: (stats: Partial<ProgressState['statistics']>) => void;
  resetProgress: () => void;
  exportProgress: () => string;
  importProgress: (data: string) => void;
  getWordProgress: (wordId: string) => WordProgress | undefined;
  getSectionProgress: (section: keyof ProgressState['sections']) => SectionProgress;
  getMasteryLevel: (wordId: string) => number;
  getNextReviewDate: (wordId: string) => number;
  toggleFavorite: (wordId: string) => void;
  addStudyTime: (minutes: number) => void;
  updateStreak: () => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

const DEFAULT_USER_ID = 'default';

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [progress, setProgress] = useLocalStorage<ProgressState>('progress', defaultProgress);
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
  
  // Track loading states for each data type
  const [loadingStates, setLoadingStates] = useState({
    settings: true,
    progress: true,
    streakData: true
  });

  // Helper function to update loading states
  const updateLoadingState = (key: keyof typeof loadingStates, value: boolean) => {
    setLoadingStates(prev => {
      const newStates = { ...prev, [key]: value };
      // Update overall loading state
      setIsLoading(Object.values(newStates).some(state => state));
      return newStates;
    });
  };

  // Load settings independently
  useEffect(() => {
    const loadSettings = async () => {
      try {
        updateLoadingState('settings', true);
        setSettingsError(null);
        const userSettings = await getSettings(DEFAULT_USER_ID);
        setSettings(userSettings ?? null);
        if (userSettings) {
          setLastSyncTime(userSettings.lastSync);
        }
      } catch (err) {
        console.error('[ProgressContext] Failed to load settings:', err);
        setSettingsError(err instanceof Error ? err.message : 'Failed to load settings');
      } finally {
        updateLoadingState('settings', false);
      }
    };
    
    loadSettings();
  }, []);

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
    const today = new Date().toISOString().split('T')[0];
    const lastStudyDate = new Date(progress.statistics.lastStudyDate).toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    setProgress(prev => {
      let newStreak = prev.statistics.currentStreak;
      
      if (lastStudyDate === yesterday) {
        newStreak += 1;
      } else if (lastStudyDate !== today) {
        newStreak = 1;
      }

      return {
        ...prev,
        statistics: {
          ...prev.statistics,
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, prev.statistics.longestStreak),
          lastStudyDate: Date.now()
        }
      };
    });
  };
  
  // Update progress with offline support
  const updateWordProgress = (wordId: string, newProgress: Partial<WordProgress>) => {
    setProgress(prev => ({
      ...prev,
      words: {
        ...prev.words,
        [wordId]: {
          ...prev.words[wordId],
          ...newProgress,
          lastReviewed: Date.now()
        }
      }
    }));
  };

  const updateSectionProgress = (section: keyof ProgressState['sections'], newProgress: Partial<SectionProgress>) => {
    setProgress(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [section]: {
          ...prev.sections[section],
          ...newProgress
        }
      }
    }));
  };

  const updatePreferences = (newPreferences: Partial<ProgressState['preferences']>) => {
    setProgress(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        ...newPreferences
      }
    }));
  };

  const updateStatistics = (newStats: Partial<ProgressState['statistics']>) => {
    setProgress(prev => ({
      ...prev,
      statistics: {
        ...prev.statistics,
        ...newStats
      }
    }));
  };

  const resetProgress = () => {
    setProgress(defaultProgress);
  };

  const exportProgress = () => {
    return JSON.stringify(progress);
  };

  const importProgress = (data: string) => {
    try {
      const importedProgress = JSON.parse(data);
      setProgress(importedProgress);
    } catch (error) {
      console.error('Error importing progress:', error);
    }
  };

  const getWordProgress = (wordId: string) => {
    return progress.words[wordId];
  };

  const getSectionProgress = (section: keyof ProgressState['sections']) => {
    return progress.sections[section];
  };

  const getMasteryLevel = (wordId: string) => {
    return progress.words[wordId]?.masteryLevel || 0;
  };

  const getNextReviewDate = (wordId: string) => {
    return progress.words[wordId]?.nextReviewDate || 0;
  };

  const toggleFavorite = (wordId: string) => {
    setProgress(prev => ({
      ...prev,
      words: {
        ...prev.words,
        [wordId]: {
          ...prev.words[wordId],
          favorite: !prev.words[wordId]?.favorite
        }
      }
    }));
  };

  const addStudyTime = (minutes: number) => {
    setProgress(prev => ({
      ...prev,
      statistics: {
        ...prev.statistics,
        totalStudyTime: prev.statistics.totalStudyTime + minutes,
        dailyProgress: {
          ...prev.statistics.dailyProgress,
          [new Date().toISOString().split('T')[0]]: 
            (prev.statistics.dailyProgress[new Date().toISOString().split('T')[0]] || 0) + minutes
        }
      }
    }));
  };

  // Sync progress with server
  const syncProgress = useCallback(async () => {
    if (!isOnline || isSyncing) {
      return;
    }
    
    try {
      setIsSyncing(true);
      setError(null);
      
      // Prepare sync request
      const syncRequest: SyncRequest = {
        userId: DEFAULT_USER_ID,
        progress: Object.values(progress.words),
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
        const syncedWords = Object.entries(progress.words).filter(([wordId, word]) => 
          synced.includes(wordId)
        ).map(([wordId, word]) => ({
          ...word,
          status: 'synced'
        }));
        setProgress(prev => ({
          ...prev,
          words: {
            ...prev.words,
            ...syncedWords.reduce((acc, word) => ({
              ...acc,
              [word.id]: word
            }), {} as Record<string, WordProgress>)
          }
        }));
        
        // Update failed items
        const failedWords = Object.entries(progress.words).filter(([wordId, word]) => 
          !synced.includes(wordId)
        ).map(([wordId, word]) => ({
          ...word,
          status: 'failed',
          retryCount: word.retryCount + 1,
          lastAttempt: Date.now()
        }));
        setProgress(prev => ({
          ...prev,
          words: {
            ...prev.words,
            ...failedWords.reduce((acc, word) => ({
              ...acc,
              [word.id]: word
            }), {} as Record<string, WordProgress>)
          }
        }));
        
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
      }
    } catch (err) {
      console.error('[ProgressContext] Sync failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to sync progress');
      throw err;
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, progress.words, settings]);
  
  const value: ProgressContextType = {
    progress,
    updateWordProgress,
    updateSectionProgress,
    updatePreferences,
    updateStatistics,
    resetProgress,
    exportProgress,
    importProgress,
    getWordProgress,
    getSectionProgress,
    getMasteryLevel,
    getNextReviewDate,
    toggleFavorite,
    addStudyTime,
    updateStreak
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