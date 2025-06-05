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
import { useAchievements } from './AchievementContext';
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
  lastSyncTime: Date | null;
  updateProgress: (wordId: string, mastery: number, studyTime: number) => Promise<void>;
  updateSectionProgress: (section: string, progress: number) => Promise<void>;
  refreshProgress: () => Promise<void>;
  getSectionProgress: (section: keyof ProgressState['sections']) => SectionProgress;
  getWordProgress: (wordId: string) => WordProgress;
  getMasteryLevel: (wordId: string) => number;
  getNextReviewDate: (wordId: string) => number;
  toggleFavorite: (wordId: string) => void;
  addStudyTime: (duration: number) => void;
  updateStreak: () => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

const DEFAULT_USER_ID = 'default';

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { updateAchievementProgress } = useAchievements();
  const [localProgress, setLocalProgress] = useLocalStorage<ProgressState>('progress', defaultProgress);
  const [progress, setProgress] = useState<ProgressState>(defaultProgress);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  
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
          setLastSyncTime(new Date(userSettings.lastSync));
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
  
  // Initialize progress data
  useEffect(() => {
    const initializeProgress = async () => {
      try {
        console.log('[ProgressContext] Starting progress initialization');
        setIsLoading(true);
        setError(null);

        // Load progress from IndexedDB first
        console.log('[ProgressContext] Loading from IndexedDB...');
        const userId = currentUser?.uid || DEFAULT_USER_ID;
        const dbProgress = await getProgress(userId);
        
        if (dbProgress && dbProgress.length > 0) {
          // Convert array of progress items to a single progress state
          const progressState = dbProgress.reduce((acc, item) => ({
            ...acc,
            words: {
              ...acc.words,
              ...item.words
            },
            statistics: {
              ...acc.statistics,
              ...item.statistics
            }
          }), defaultProgress);

          console.log('[ProgressContext] Loaded progress from IndexedDB:', {
            wordCount: Object.keys(progressState.words).length,
            hasStatistics: !!progressState.statistics
          });
          setProgress(progressState);
          setLocalProgress(progressState);
          setIsLoading(false);
        } else if (localProgress) {
          console.log('[ProgressContext] Using local storage progress:', {
            wordCount: Object.keys(localProgress.words).length,
            hasStatistics: !!localProgress.statistics
          });
          setProgress(localProgress);
          setIsLoading(false);
          // Save to IndexedDB for persistence
          await saveProgress({ id: userId, ...localProgress }).catch(console.error);
        } else {
          console.log('[ProgressContext] No existing progress found, using default');
          setProgress(defaultProgress);
          setLocalProgress(defaultProgress);
          setIsLoading(false);
          await saveProgress({ id: userId, ...defaultProgress }).catch(console.error);
        }

        // If user is authenticated, sync with Firebase in the background
        if (currentUser) {
          console.log('[ProgressContext] User authenticated, syncing with Firebase...');
          const userProgressRef = doc(db, 'users', currentUser.uid, 'progress', 'data');
          const docSnap = await getDoc(userProgressRef);
          
          if (docSnap.exists()) {
            const firebaseProgress = docSnap.data() as ProgressState;
            console.log('[ProgressContext] Loaded progress from Firebase:', {
              wordCount: Object.keys(firebaseProgress.words).length,
              hasStatistics: !!firebaseProgress.statistics
            });
            
            // Merge Firebase progress with local progress
            const mergedProgress = {
              ...progress,
              words: {
                ...progress.words,
                ...firebaseProgress.words
              },
              statistics: {
                ...progress.statistics,
                ...firebaseProgress.statistics,
                lastUpdated: Date.now()
              }
            };
            
            console.log('[ProgressContext] Merged progress:', {
              wordCount: Object.keys(mergedProgress.words).length,
              hasStatistics: !!mergedProgress.statistics
            });
            
            setProgress(mergedProgress);
            setLocalProgress(mergedProgress);
            await saveProgress({ id: userId, ...mergedProgress }).catch(console.error);
          } else {
            console.log('[ProgressContext] No Firebase progress, initializing with current progress');
            // Initialize Firebase with current progress
            await setDoc(userProgressRef, progress).catch(console.error);
          }
        }

        // Update section progress based on word progress
        console.log('[ProgressContext] Updating section progress...');
        const updatedSections = {
          dictionary: calculateSectionProgress(progress.words, 'dictionary'),
          mood: calculateSectionProgress(progress.words, 'mood'),
          culture: calculateSectionProgress(progress.words, 'culture')
        };

        setProgress(prev => {
          const newProgress = {
            ...prev,
            sections: updatedSections
          };
          console.log('[ProgressContext] Final progress state:', {
            wordCount: Object.keys(newProgress.words).length,
            hasStatistics: !!newProgress.statistics,
            sections: newProgress.sections
          });
          // Save to IndexedDB with userId
          saveProgress({ id: userId, ...newProgress }).catch(console.error);
          return newProgress;
        });

      } catch (err) {
        console.error('[ProgressContext] Error initializing progress:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize progress');
        setIsLoading(false); // Make sure to set loading to false on error
      }
    };

    initializeProgress();
  }, [currentUser]);

  // Helper function to calculate section progress
  const calculateSectionProgress = (words: Record<string, WordProgress>, section: string): SectionProgress => {
    const sectionWords = Object.values(words).filter(w => w.section === section);
    const totalItems = sectionWords.length;
    const masteredItems = sectionWords.filter(w => w.masteryLevel >= 0.8).length;
    const inProgressItems = sectionWords.filter(w => w.masteryLevel > 0 && w.masteryLevel < 0.8).length;
    const notStartedItems = sectionWords.filter(w => w.masteryLevel === 0).length;
    const averageMastery = sectionWords.reduce((sum, w) => sum + w.masteryLevel, 0) / totalItems || 0;

    return {
      totalItems,
      masteredItems,
      inProgressItems,
      notStartedItems,
      lastStudied: Math.max(...sectionWords.map(w => w.lastReviewed), 0),
      streak: calculateStreak(sectionWords),
      averageMastery
    };
  };

  // Helper function to calculate streak
  const calculateStreak = (words: WordProgress[]): number => {
    const today = new Date().toISOString().split('T')[0];
    const lastReviewDates = words
      .map(w => new Date(w.lastReviewed).toISOString().split('T')[0])
      .sort()
      .filter((date, index, array) => array.indexOf(date) === index);

    let streak = 0;
    let currentDate = new Date(today);
    
    while (lastReviewDates.includes(currentDate.toISOString().split('T')[0])) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  };

  // Track achievement progress
  const calculateAchievementProgress = useCallback((progress: ProgressState) => {
    const achievements = INITIAL_ACHIEVEMENTS;
    const updates: Record<string, { progress: number; unlocked: boolean }> = {};

    // Calculate progress for each achievement
    achievements.forEach(achievement => {
      let newProgress = 0;
      let unlocked = false;

      switch (achievement.id) {
        case 'vocab_beginner':
          newProgress = Object.keys(progress).length;
          unlocked = newProgress >= 10;
          break;
        case 'vocab_intermediate':
          newProgress = Object.keys(progress).length;
          unlocked = newProgress >= 50;
          break;
        case 'vocab_master':
          newProgress = Object.keys(progress).length;
          unlocked = newProgress >= 200;
          break;
        case 'kanji_beginner':
          newProgress = Object.keys(progress).filter(key => key.startsWith('kanji-')).length;
          unlocked = newProgress >= 5;
          break;
        case 'kanji_intermediate':
          newProgress = Object.keys(progress).filter(key => key.startsWith('kanji-')).length;
          unlocked = newProgress >= 25;
          break;
        case 'kanji_master':
          newProgress = Object.keys(progress).filter(key => key.startsWith('kanji-')).length;
          unlocked = newProgress >= 100;
          break;
        case 'streak_3':
          const streak = calculateStreak(progress);
          newProgress = Math.min(streak, 3);
          unlocked = streak >= 3;
          break;
        case 'streak_7':
          const streak7 = calculateStreak(progress);
          newProgress = Math.min(streak7, 7);
          unlocked = streak7 >= 7;
          break;
        case 'streak_30':
          const streak30 = calculateStreak(progress);
          newProgress = Math.min(streak30, 30);
          unlocked = streak30 >= 30;
          break;
      }

      if (newProgress > 0) {
        updates[achievement.id] = { progress: newProgress, unlocked };
      }
    });

    return updates;
  }, []);

  // Update progress in Firebase when it changes
  const updateProgress = useCallback(async (wordId: string, mastery: number, studyTime: number) => {
    if (!currentUser) {
      // For unauthenticated users, only update local storage
      setLocalProgress(prev => ({
        ...prev,
        words: {
          ...prev.words,
          [wordId]: {
            ...prev.words[wordId],
            mastery,
            lastAttempted: new Date().toISOString(),
            studyTime: (prev.words[wordId]?.studyTime || 0) + studyTime
          }
        },
        statistics: {
          ...prev.statistics,
          totalStudyTime: (prev.statistics.totalStudyTime || 0) + studyTime,
          averageMastery: (prev.statistics.averageMastery || 0) + mastery,
          masteredWords: Object.values(prev.words).filter(w => w.mastery >= 0.8).length,
          totalWords: Object.keys(prev.words).length
        }
      }));
      setProgress(prev => ({
        ...prev,
        words: {
          ...prev.words,
          [wordId]: {
            ...prev.words[wordId],
            mastery,
            lastAttempted: new Date().toISOString(),
            studyTime: (prev.words[wordId]?.studyTime || 0) + studyTime
          }
        },
        statistics: {
          ...prev.statistics,
          totalStudyTime: (prev.statistics.totalStudyTime || 0) + studyTime,
          averageMastery: (prev.statistics.averageMastery || 0) + mastery,
          masteredWords: Object.values(prev.words).filter(w => w.mastery >= 0.8).length,
          totalWords: Object.keys(prev.words).length
        }
      }));
      return;
    }

    try {
      setIsSyncing(true);
      const userProgressRef = doc(db, 'users', currentUser.uid, 'progress', 'data');
      const docSnap = await getDoc(userProgressRef);
      
      if (docSnap.exists()) {
        const firebaseProgress = docSnap.data() as ProgressState;
        const updatedProgress = {
          ...firebaseProgress,
          words: {
            ...firebaseProgress.words,
            [wordId]: {
              ...firebaseProgress.words[wordId],
              mastery,
              lastAttempted: new Date().toISOString(),
              studyTime: (firebaseProgress.words[wordId]?.studyTime || 0) + studyTime
            }
          },
          statistics: {
            ...firebaseProgress.statistics,
            totalStudyTime: (firebaseProgress.statistics.totalStudyTime || 0) + studyTime,
            averageMastery: (firebaseProgress.statistics.averageMastery || 0) + mastery,
            masteredWords: Object.values(firebaseProgress.words).filter(w => w.mastery >= 0.8).length,
            totalWords: Object.keys(firebaseProgress.words).length
          }
        };
        
        await updateDoc(userProgressRef, updatedProgress);
        setProgress(updatedProgress);
        setLocalProgress(updatedProgress);
        setLastSyncTime(new Date());

        // Update achievements
        const achievementUpdates = calculateAchievementProgress(updatedProgress);
        
        // Notify AchievementProvider of updates
        Object.entries(achievementUpdates).forEach(([achievementId, { progress, unlocked }]) => {
          updateAchievementProgress(achievementId, progress, unlocked);
        });

      } else {
        console.log('[ProgressContext] No Firebase progress, initializing with current progress');
        // Initialize Firebase with current progress
        await setDoc(userProgressRef, {
          ...progress,
          words: {
            ...progress.words,
            [wordId]: {
              ...progress.words[wordId],
              mastery,
              lastAttempted: new Date().toISOString(),
              studyTime: (progress.words[wordId]?.studyTime || 0) + studyTime
            }
          },
          statistics: {
            ...progress.statistics,
            totalStudyTime: (progress.statistics.totalStudyTime || 0) + studyTime,
            averageMastery: (progress.statistics.averageMastery || 0) + mastery,
            masteredWords: Object.values(progress.words).filter(w => w.mastery >= 0.8).length,
            totalWords: Object.keys(progress.words).length
          }
        }).catch(console.error);
      }
    } catch (err) {
      console.error('[ProgressContext] Error updating progress:', err);
      setError(err instanceof Error ? err.message : 'Failed to update progress');
      // Still update local state
      setProgress(prev => ({
        ...prev,
        words: {
          ...prev.words,
          [wordId]: {
            ...prev.words[wordId],
            mastery,
            lastAttempted: new Date().toISOString(),
            studyTime: (prev.words[wordId]?.studyTime || 0) + studyTime
          }
        },
        statistics: {
          ...prev.statistics,
          totalStudyTime: (prev.statistics.totalStudyTime || 0) + studyTime,
          averageMastery: (prev.statistics.averageMastery || 0) + mastery,
          masteredWords: Object.values(prev.words).filter(w => w.mastery >= 0.8).length,
          totalWords: Object.keys(prev.words).length
        }
      }));
    } finally {
      setIsSyncing(false);
    }
  }, [currentUser, progress, calculateAchievementProgress, updateAchievementProgress]);

  // Update section progress
  const updateSectionProgress = useCallback(async (section: string, progress: number) => {
    if (!currentUser) {
      // For unauthenticated users, only update local storage
      setLocalProgress(prev => ({
        ...prev,
        sections: {
          ...prev.sections,
          [section]: {
            ...prev.sections[section],
            progress
          }
        }
      }));
      setProgress(prev => ({
        ...prev,
        sections: {
          ...prev.sections,
          [section]: {
            ...prev.sections[section],
            progress
          }
        }
      }));
      return;
    }

    try {
      setIsSyncing(true);
      const userProgressRef = doc(db, 'users', currentUser.uid, 'progress', 'data');
      const docSnap = await getDoc(userProgressRef);
      
      if (docSnap.exists()) {
        const firebaseProgress = docSnap.data() as ProgressState;
        const updatedProgress = {
          ...firebaseProgress,
          sections: {
            ...firebaseProgress.sections,
            [section]: {
              ...firebaseProgress.sections[section],
              progress
            }
          }
        };
        
        await updateDoc(userProgressRef, updatedProgress);
        setProgress(updatedProgress);
        setLocalProgress(updatedProgress);
        setLastSyncTime(new Date());

        // Update achievements
        const achievementUpdates = calculateAchievementProgress(updatedProgress);
        
        // Notify AchievementProvider of updates
        Object.entries(achievementUpdates).forEach(([achievementId, { progress, unlocked }]) => {
          updateAchievementProgress(achievementId, progress, unlocked);
        });

      } else {
        console.log('[ProgressContext] No Firebase progress, initializing with current progress');
        // Initialize Firebase with current progress
        await setDoc(userProgressRef, {
          ...progress,
          sections: {
            ...progress.sections,
            [section]: {
              ...progress.sections[section],
              progress
            }
          }
        }).catch(console.error);
      }
    } catch (err) {
      console.error('[ProgressContext] Error updating section progress:', err);
      setError(err instanceof Error ? err.message : 'Failed to update section progress');
      // Still update local state
      setProgress(prev => ({
        ...prev,
        sections: {
          ...prev.sections,
          [section]: {
            ...prev.sections[section],
            progress
          }
        }
      }));
    } finally {
      setIsSyncing(false);
    }
  }, [currentUser, progress, calculateAchievementProgress, updateAchievementProgress]);

  // Refresh progress from storage/backend
  const refreshProgress = useCallback(async () => {
    try {
      setIsSyncing(true);
      const savedProgress = localStorage.getItem('progress');
      if (savedProgress) {
        setProgress(JSON.parse(savedProgress));
      }
      setLastSyncTime(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh progress');
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Add getSectionProgress function
  const getSectionProgress = useCallback((section: keyof ProgressState['sections']): SectionProgress => {
    return progress.sections[section] || {
      totalItems: 0,
      masteredItems: 0,
      inProgressItems: 0,
      notStartedItems: 0,
      lastStudied: 0,
      streak: 0,
      averageMastery: 0
    };
  }, [progress.sections]);

  const value: ProgressContextType = {
    progress,
    isLoading,
    error,
    isSyncing,
    lastSyncTime,
    updateProgress,
    updateSectionProgress,
    refreshProgress,
    getSectionProgress,
    getWordProgress: (wordId: string) => progress.words[wordId],
    getMasteryLevel: (wordId: string) => progress.words[wordId]?.masteryLevel || 0,
    getNextReviewDate: (wordId: string) => progress.words[wordId]?.nextReviewDate || 0,
    toggleFavorite: (wordId: string) => {
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
    },
    addStudyTime: (duration: number) => {
      setProgress(prev => ({
        ...prev,
        statistics: {
          ...prev.statistics,
          totalStudyTime: (prev.statistics.totalStudyTime || 0) + duration
        }
      }));
    },
    updateStreak: () => {
      const today = new Date().toISOString().split('T')[0];
      const lastStudyDate = new Date(progress.statistics.lastStudyDate).toISOString().split('T')[0];
      
      if (today !== lastStudyDate) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (lastStudyDate === yesterdayStr) {
          // Consecutive day
          setProgress(prev => ({
            ...prev,
            statistics: {
              ...prev.statistics,
              currentStreak: (prev.statistics.currentStreak || 0) + 1,
              longestStreak: Math.max(prev.statistics.currentStreak + 1, prev.statistics.longestStreak || 0)
            }
          }));
        } else {
          // Streak broken
          setProgress(prev => ({
            ...prev,
            statistics: {
              ...prev.statistics,
              currentStreak: 1
            }
          }));
        }
      }
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
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}; 