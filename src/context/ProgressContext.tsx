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
  consecutiveCorrect: number;
  lastAnswerCorrect: boolean;
  correctAnswers: number; // Total number of correct answers
  incorrectAnswers: number; // Total number of incorrect answers
  strokeOrderProgress?: {
    correctStrokes: number;
    totalStrokes: number;
    lastScore: number;
  };
  lastPracticeDate?: number;
  practiceHistory?: Array<{
    date: number;
    score: number;
    type: 'writing' | 'reading' | 'meaning' | 'quiz';
  }>;
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
    studySessions: {
      timestamp: number;
      duration: number;
      wordsLearned: number;
      accuracy: number;
      averageMastery: number;
    }[];
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
    dailyProgress: {},
    studySessions: []
  }
};

interface ProgressContextType {
  progress: ProgressState;
  isLoading: boolean;
  error: string | null;
  isSyncing: boolean;
  lastSyncTime: number | null;
  updateWordProgress: (wordId: string, progress: Partial<WordProgress>) => void;
  updateSectionProgress: (section: keyof ProgressState['sections'], progress: Partial<SectionProgress>) => void;
  updatePreferences: (preferences: Partial<ProgressState['preferences']>) => void;
  updateStatistics: (stats: Partial<ProgressState['statistics']>) => void;
  addStudySession: (session: {
    timestamp: number;
    duration: number;
    wordsLearned: number;
    accuracy: number;
    averageMastery: number;
  }) => void;
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
  const { currentUser } = useAuth();
  const [localProgress, setLocalProgress] = useLocalStorage<ProgressState>('progress', defaultProgress);
  const [progress, setProgress] = useState<ProgressState>(defaultProgress);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  
  // Settings state
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  
  // Sync state
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
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
  
  // Load progress from Firebase when user is authenticated
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const loadProgress = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!currentUser) {
          console.log('[ProgressContext] No user, using local progress');
          setProgress(localProgress);
          setIsLoading(false);
          return;
        }

        console.log('[ProgressContext] Loading progress for user:', {
          userId: currentUser.uid,
          email: currentUser.email,
          path: `users/${currentUser.uid}/progress/data`
        });
        
        const userProgressRef = doc(db, 'users', currentUser.uid, 'progress', 'data');
        
        // Set up real-time listener for progress updates
        unsubscribe = onSnapshot(userProgressRef, 
          (doc) => {
            try {
              if (doc.exists()) {
                console.log('[ProgressContext] Progress data found in Firebase');
                const firebaseProgress = doc.data() as ProgressState;
                setProgress(firebaseProgress);
                // Update local storage as backup
                setLocalProgress(firebaseProgress);
              } else {
                console.log('[ProgressContext] No progress in Firebase, initializing with local data');
                // If no progress exists in Firebase, initialize with local progress
                setDoc(userProgressRef, localProgress).catch(err => {
                  console.error('[ProgressContext] Failed to initialize Firebase progress:', err);
                  setError('Failed to initialize progress data. Using local backup.');
                });
                setProgress(localProgress);
              }
              setLastSyncTime(Date.now());
            } catch (err) {
              console.error('[ProgressContext] Error processing progress data:', err);
              setError('Error processing progress data. Using local backup.');
              setProgress(localProgress);
            } finally {
              setIsLoading(false);
            }
          },
          (error) => {
            console.error('[ProgressContext] Firebase listener error:', error);
            setError('Failed to load progress data. Using local backup.');
            setProgress(localProgress);
            setIsLoading(false);
          }
        );
      } catch (error) {
        console.error('[ProgressContext] Error setting up progress listener:', error);
        setError('Failed to connect to progress database. Using local backup.');
        setProgress(localProgress);
        setIsLoading(false);
      }
    };

    loadProgress();

    return () => {
      if (unsubscribe) {
        console.log('[ProgressContext] Cleaning up progress listener');
        unsubscribe();
      }
    };
  }, [currentUser]);

  // Update progress in Firebase when it changes
  const updateProgress = useCallback(async (newProgress: ProgressState) => {
    if (!currentUser) {
      // For unauthenticated users, only update local storage
      setLocalProgress(newProgress);
      setProgress(newProgress);
      return;
    }

    try {
      setIsSyncing(true);
      const userProgressRef = doc(db, 'users', currentUser.uid, 'progress', 'data');
      await updateDoc(userProgressRef, newProgress);
      setProgress(newProgress);
      setLocalProgress(newProgress);
      setLastSyncTime(Date.now());
    } catch (error) {
      console.error('Error updating progress:', error);
      setError('Failed to save progress. Changes are stored locally.');
      // Still update local state
      setProgress(newProgress);
      setLocalProgress(newProgress);
    } finally {
      setIsSyncing(false);
    }
  }, [currentUser, setLocalProgress]);

  // Update word progress
  const updateWordProgress = useCallback((wordId: string, progress: Partial<WordProgress>) => {
    setProgress(prev => {
      const currentProgress = prev.words[wordId] || {
        id: wordId,
        lastReviewed: Date.now(),
        reviewCount: 0,
        masteryLevel: 0,
        nextReviewDate: Date.now(),
        favorite: false,
        difficulty: 'medium',
        category: 'dictionary',
        section: 'dictionary',
        consecutiveCorrect: 0,
        lastAnswerCorrect: false,
        correctAnswers: 0,
        incorrectAnswers: 0,
        practiceHistory: []
      };

      // Calculate new mastery level based on correct/incorrect answers and streak
      let newMasteryLevel = currentProgress.masteryLevel;
      if (progress.correctAnswers !== undefined || progress.incorrectAnswers !== undefined) {
        const totalAnswers = (progress.correctAnswers || currentProgress.correctAnswers) + 
                            (progress.incorrectAnswers || currentProgress.incorrectAnswers);
        const correctRatio = (progress.correctAnswers || currentProgress.correctAnswers) / totalAnswers;
        
        // Base mastery on correct ratio and consecutive correct answers
        const streakBonus = Math.min((progress.consecutiveCorrect || currentProgress.consecutiveCorrect) * 0.1, 0.5);
        newMasteryLevel = Math.min(5, Math.max(0, (correctRatio * 4) + streakBonus));
      }

      // Update consecutive correct answers
      if (progress.lastAnswerCorrect !== undefined) {
        if (progress.lastAnswerCorrect) {
          currentProgress.consecutiveCorrect = (currentProgress.lastAnswerCorrect ? currentProgress.consecutiveCorrect : 0) + 1;
        } else {
          currentProgress.consecutiveCorrect = 0;
        }
      }

      // For kana, require two consecutive correct answers for mastery
      const isKana = currentProgress.category === 'hiragana' || currentProgress.category === 'katakana';
      if (isKana) {
        if (currentProgress.consecutiveCorrect >= 2) {
          newMasteryLevel = 5; // Full mastery for kana
        } else {
          newMasteryLevel = Math.min(newMasteryLevel, 4); // Cap at 4 until two consecutive correct
        }
      }

      // Add practice history entry if score is provided
      const practiceHistory = [...(currentProgress.practiceHistory || [])];
      if (progress.strokeOrderProgress?.lastScore !== undefined) {
        practiceHistory.push({
          date: Date.now(),
          score: progress.strokeOrderProgress.lastScore,
          type: 'writing'
        });
      }

      const updatedProgress = {
        ...currentProgress,
        ...progress,
        masteryLevel: newMasteryLevel,
        lastReviewed: Date.now(),
        practiceHistory: practiceHistory.slice(-10) // Keep last 10 practice sessions
      };

      return {
        ...prev,
        words: {
          ...prev.words,
          [wordId]: updatedProgress
        }
      };
    });
  }, []);

  // Update section progress
  const updateSectionProgress = useCallback((section: keyof ProgressState['sections'], sectionProgress: Partial<SectionProgress>) => {
    setProgress(prev => {
      const newProgress = {
        ...prev,
        sections: {
          ...prev.sections,
          [section]: {
            ...prev.sections[section],
            ...sectionProgress,
            lastUpdated: Date.now()
          }
        }
      };
      updateProgress(newProgress);
      return newProgress;
    });
  }, [updateProgress]);

  // Update preferences
  const updatePreferences = useCallback((preferences: Partial<ProgressState['preferences']>) => {
    setProgress(prev => {
      const newProgress = {
        ...prev,
        preferences: {
          ...prev.preferences,
          ...preferences
        }
      };
      updateProgress(newProgress);
      return newProgress;
    });
  }, [updateProgress]);

  // Update statistics
  const updateStatistics = useCallback((stats: Partial<ProgressState['statistics']>) => {
    setProgress(prev => {
      const newProgress = {
        ...prev,
        statistics: {
          ...prev.statistics,
          ...stats,
          lastUpdated: Date.now()
        }
      };
      updateProgress(newProgress);
      return newProgress;
    });
  }, [updateProgress]);

  // Add a study session
  const addStudySession = useCallback((session: {
    timestamp: number;
    duration: number;
    wordsLearned: number;
    accuracy: number;
    averageMastery: number;
  }) => {
    setProgress(prev => {
      const newProgress = {
        ...prev,
        statistics: {
          ...prev.statistics,
          studySessions: [...(prev.statistics.studySessions || []), session],
          totalStudyTime: prev.statistics.totalStudyTime + session.duration,
          wordsLearned: prev.statistics.wordsLearned + session.wordsLearned,
          lastStudyDate: session.timestamp
        }
      };
      updateProgress(newProgress);
      return newProgress;
    });
  }, [updateProgress]);

  // Reset progress
  const resetProgress = useCallback(() => {
    const newProgress = defaultProgress;
    updateProgress(newProgress);
  }, [updateProgress]);

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
    const wordProgress = progress.words[wordId];
    if (!wordProgress) return 0;
    
    // For kanji, consider mastery based on multiple factors
    if (wordProgress.category === 'kanji') {
      const { masteryLevel, correctAnswers, incorrectAnswers, consecutiveCorrect } = wordProgress;
      const totalAnswers = correctAnswers + incorrectAnswers;
      
      if (totalAnswers === 0) return 0;
      
      // Calculate mastery based on:
      // 1. Overall mastery level (0-5)
      // 2. Correct answer ratio
      // 3. Consecutive correct answers
      const correctRatio = correctAnswers / totalAnswers;
      const streakBonus = Math.min(consecutiveCorrect * 0.1, 0.5);
      return Math.min(5, Math.max(0, (correctRatio * 4) + streakBonus));
    }
    
    // For kana, use simpler mastery calculation
    return wordProgress.masteryLevel;
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
    isLoading,
    error,
    isSyncing,
    lastSyncTime,
    updateWordProgress,
    updateSectionProgress,
    updatePreferences,
    updateStatistics,
    addStudySession,
    resetProgress,
    exportProgress,
    importProgress,
    getWordProgress,
    getSectionProgress,
    getMasteryLevel,
    getNextReviewDate,
    toggleFavorite,
    addStudyTime,
    updateStreak: () => {
      // Implementation needed
    }
  };
  
  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}; 