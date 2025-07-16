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
  section: 'hiragana' | 'katakana' | 'kanji' | 'dictionary' | 'mood' | 'culture' | 'trivia' | 'anime';
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
    hiragana: SectionProgress;
    katakana: SectionProgress;
    kanji: SectionProgress;
    dictionary: SectionProgress;
    mood: SectionProgress;
    culture: SectionProgress;
    trivia: SectionProgress;
    anime: SectionProgress;
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
    totalQuizzes: number;
    averageQuizScore: number;
    bestQuizScore: number;
    totalStudyTime: number;
    lastQuizDate: number;
    quizHistory: {
      timestamp: number;
      type: string;
      score: number;
      totalQuestions: number;
      timeSpent: number;
      category: string;
    }[];
    lessonsCompleted: number;
    lastLessonDate: number;
    lessonHistory: {
      timestamp: number;
      lessonId: string;
      timeSpent: number;
      wordsLearned: number;
      exercisesCompleted: number;
      totalExercises: number;
    }[];
    practiceSessions: number;
    lastPracticeDate: number;
    practiceHistory: {
      timestamp: number;
      type: 'writing' | 'reading' | 'listening' | 'speaking';
      timeSpent: number;
      wordsPracticed: number;
      accuracy: number;
    }[];
    srsReviews: number;
    lastSRSDate: number;
    achievements: {
      id: string;
      title: string;
      description: string;
      points: number;
      category: string;
      unlockedAt: number;
    }[];
    totalPoints: number;
  };
}

const defaultProgress: ProgressState = {
  words: {},
  sections: {
    hiragana: {
      totalItems: 0,
      masteredItems: 0,
      inProgressItems: 0,
      notStartedItems: 0,
      lastStudied: 0,
      streak: 0,
      averageMastery: 0
    },
    katakana: {
      totalItems: 0,
      masteredItems: 0,
      inProgressItems: 0,
      notStartedItems: 0,
      lastStudied: 0,
      streak: 0,
      averageMastery: 0
    },
    kanji: {
      totalItems: 0,
      masteredItems: 0,
      inProgressItems: 0,
      notStartedItems: 0,
      lastStudied: 0,
      streak: 0,
      averageMastery: 0
    },
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
    },
    trivia: {
      totalItems: 0,
      masteredItems: 0,
      inProgressItems: 0,
      notStartedItems: 0,
      lastStudied: 0,
      streak: 0,
      averageMastery: 0
    },
    anime: {
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
    studySessions: [],
    totalQuizzes: 0,
    averageQuizScore: 0,
    bestQuizScore: 0,
    totalStudyTime: 0,
    lastQuizDate: 0,
    quizHistory: [],
    lessonsCompleted: 0,
    lastLessonDate: 0,
    lessonHistory: [],
    practiceSessions: 0,
    lastPracticeDate: 0,
    practiceHistory: [],
    srsReviews: 0,
    lastSRSDate: 0,
    achievements: [],
    totalPoints: 0
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
  trackQuizCompletion: (quizData: {
    quizType: string;
    score: number;
    totalQuestions: number;
    timeSpent: number;
    wordsUsed: string[];
    category?: string;
  }) => void;
  trackLessonCompletion: (lessonData: {
    lessonId: string;
    timeSpent: number;
    wordsLearned: string[];
    exercisesCompleted: number;
    totalExercises: number;
  }) => void;
  trackPracticeSession: (practiceData: {
    practiceType: 'writing' | 'reading' | 'listening' | 'speaking';
    timeSpent: number;
    wordsPracticed: string[];
    accuracy: number;
    strokesCorrect?: number;
    totalStrokes?: number;
  }) => void;
  trackSRSReview: (srsData: {
    wordId: string;
    difficulty: 'easy' | 'medium' | 'hard';
    timeSpent: number;
    nextReviewInterval: number;
  }) => void;
  trackAchievement: (achievementData: {
    achievementId: string;
    title: string;
    description: string;
    points: number;
    category: string;
  }) => void;
  // Lesson completion functions
  markLessonCompleted: (lessonId: string) => void;
  isLessonCompleted: (lessonId: string) => boolean;
  getCompletedLessons: () => string[];
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

const DEFAULT_USER_ID = 'default';

// Helper function to migrate old progress data to new format
const migrateProgressData = (oldProgress: any): ProgressState => {
  // If it's already the new format, return as is
  if (oldProgress.sections && 
      oldProgress.sections.hiragana && 
      oldProgress.sections.katakana && 
      oldProgress.sections.kanji && 
      oldProgress.sections.trivia && 
      oldProgress.sections.anime) {
    return oldProgress as ProgressState;
  }

  console.log('[ProgressContext] Migrating progress data to new format');
  
  // Start with default progress
  const migratedProgress: ProgressState = {
    ...defaultProgress,
    // Preserve existing data
    words: oldProgress.words || {},
    preferences: oldProgress.preferences || defaultProgress.preferences,
    statistics: oldProgress.statistics || defaultProgress.statistics
  };

  // Migrate existing sections if they exist
  if (oldProgress.sections) {
    if (oldProgress.sections.dictionary) {
      migratedProgress.sections.dictionary = oldProgress.sections.dictionary;
    }
    if (oldProgress.sections.mood) {
      migratedProgress.sections.mood = oldProgress.sections.mood;
    }
    if (oldProgress.sections.culture) {
      migratedProgress.sections.culture = oldProgress.sections.culture;
    }
  }

  // Update word sections to use new section types
  const updatedWords: { [key: string]: WordProgress } = {};
  Object.entries(migratedProgress.words).forEach(([wordId, word]) => {
    updatedWords[wordId] = {
      ...word,
      // Ensure all words have a valid section
      section: word.section && ['hiragana', 'katakana', 'kanji', 'dictionary', 'mood', 'culture', 'trivia', 'anime'].includes(word.section) 
        ? word.section 
        : 'dictionary'
    };
  });
  migratedProgress.words = updatedWords;

  // Recalculate section progress based on migrated words
  const recalculateSectionProgress = (words: { [key: string]: WordProgress }) => {
    const sections = { ...defaultProgress.sections };
    
    Object.values(words).forEach(word => {
      const section = word.section;
      if (sections[section]) {
        sections[section].totalItems++;
        if (word.masteryLevel >= 5) {
          sections[section].masteredItems++;
        } else if (word.masteryLevel > 0) {
          sections[section].inProgressItems++;
        } else {
          sections[section].notStartedItems++;
        }
      }
    });
    
    return sections;
  };

  migratedProgress.sections = recalculateSectionProgress(updatedWords);

  return migratedProgress;
};

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

  // Add lesson completion tracking
  const [completedLessons, setCompletedLessons] = useState<string[]>(() => {
    const saved = localStorage.getItem('completedLessons');
    return saved ? JSON.parse(saved) : [];
  });

  // Save completed lessons to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('completedLessons', JSON.stringify(completedLessons));
  }, [completedLessons]);

  // Function to mark a lesson as completed
  const markLessonCompleted = useCallback((lessonId: string) => {
    setCompletedLessons(prev => {
      if (!prev.includes(lessonId)) {
        return [...prev, lessonId];
      }
      return prev;
    });
  }, []);

  // Function to check if a lesson is completed
  const isLessonCompleted = useCallback((lessonId: string) => {
    return completedLessons.includes(lessonId);
  }, [completedLessons]);

  // Function to get all completed lessons
  const getCompletedLessons = useCallback(() => {
    return completedLessons;
  }, [completedLessons]);

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
          const migratedLocalProgress = migrateProgressData(localProgress);
          setProgress(migratedLocalProgress);
          // Update local storage with migrated data
          if (migratedLocalProgress !== localProgress) {
            setLocalProgress(migratedLocalProgress);
          }
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
                const migratedProgress = migrateProgressData(firebaseProgress);
                setProgress(migratedProgress);
                // Update local storage as backup
                setLocalProgress(migratedProgress);
              } else {
                console.log('[ProgressContext] No progress in Firebase, initializing with local data');
                const migratedLocalProgress = migrateProgressData(localProgress);
                // If no progress exists in Firebase, initialize with migrated local progress
                setDoc(userProgressRef, migratedLocalProgress).catch(err => {
                  console.error('[ProgressContext] Failed to initialize Firebase progress:', err);
                  setError('Failed to initialize progress data. Using local backup.');
                });
                setProgress(migratedLocalProgress);
                // Update local storage with migrated data
                if (migratedLocalProgress !== localProgress) {
                  setLocalProgress(migratedLocalProgress);
                }
              }
              setLastSyncTime(Date.now());
            } catch (err) {
              console.error('[ProgressContext] Error processing progress data:', err);
              setError('Error processing progress data. Using local backup.');
              const migratedLocalProgress = migrateProgressData(localProgress);
              setProgress(migratedLocalProgress);
            } finally {
              setIsLoading(false);
            }
          },
          (error) => {
            console.error('[ProgressContext] Firebase listener error:', error);
            setError('Failed to load progress data. Using local backup.');
            const migratedLocalProgress = migrateProgressData(localProgress);
            setProgress(migratedLocalProgress);
            setIsLoading(false);
          }
        );
      } catch (error) {
        console.error('[ProgressContext] Error setting up progress listener:', error);
        setError('Failed to connect to progress database. Using local backup.');
        const migratedLocalProgress = migrateProgressData(localProgress);
        setProgress(migratedLocalProgress);
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

  // Helper function to recalculate section progress based on word progress
  const recalculateSectionProgress = useCallback((words: { [key: string]: WordProgress }) => {
    const sectionStats = {
      hiragana: { total: 0, mastered: 0, inProgress: 0, notStarted: 0, totalMastery: 0 },
      katakana: { total: 0, mastered: 0, inProgress: 0, notStarted: 0, totalMastery: 0 },
      kanji: { total: 0, mastered: 0, inProgress: 0, notStarted: 0, totalMastery: 0 },
      dictionary: { total: 0, mastered: 0, inProgress: 0, notStarted: 0, totalMastery: 0 },
      mood: { total: 0, mastered: 0, inProgress: 0, notStarted: 0, totalMastery: 0 },
      culture: { total: 0, mastered: 0, inProgress: 0, notStarted: 0, totalMastery: 0 },
      trivia: { total: 0, mastered: 0, inProgress: 0, notStarted: 0, totalMastery: 0 },
      anime: { total: 0, mastered: 0, inProgress: 0, notStarted: 0, totalMastery: 0 }
    };

    // Count words by section
    Object.values(words).forEach(word => {
      const section = word.section;
      if (sectionStats[section]) {
        sectionStats[section].total++;
        sectionStats[section].totalMastery += word.masteryLevel;

        if (word.masteryLevel >= 4) {
          sectionStats[section].mastered++;
        } else if (word.masteryLevel > 0) {
          sectionStats[section].inProgress++;
        } else {
          sectionStats[section].notStarted++;
        }
      }
    });

    // Convert to SectionProgress format
    const updatedSections: ProgressState['sections'] = {
      hiragana: {
        totalItems: sectionStats.hiragana.total,
        masteredItems: sectionStats.hiragana.mastered,
        inProgressItems: sectionStats.hiragana.inProgress,
        notStartedItems: sectionStats.hiragana.notStarted,
        lastStudied: Date.now(),
        streak: 0, // This would need to be calculated separately
        averageMastery: sectionStats.hiragana.total > 0 ? sectionStats.hiragana.totalMastery / sectionStats.hiragana.total : 0
      },
      katakana: {
        totalItems: sectionStats.katakana.total,
        masteredItems: sectionStats.katakana.mastered,
        inProgressItems: sectionStats.katakana.inProgress,
        notStartedItems: sectionStats.katakana.notStarted,
        lastStudied: Date.now(),
        streak: 0,
        averageMastery: sectionStats.katakana.total > 0 ? sectionStats.katakana.totalMastery / sectionStats.katakana.total : 0
      },
      kanji: {
        totalItems: sectionStats.kanji.total,
        masteredItems: sectionStats.kanji.mastered,
        inProgressItems: sectionStats.kanji.inProgress,
        notStartedItems: sectionStats.kanji.notStarted,
        lastStudied: Date.now(),
        streak: 0,
        averageMastery: sectionStats.kanji.total > 0 ? sectionStats.kanji.totalMastery / sectionStats.kanji.total : 0
      },
      dictionary: {
        totalItems: sectionStats.dictionary.total,
        masteredItems: sectionStats.dictionary.mastered,
        inProgressItems: sectionStats.dictionary.inProgress,
        notStartedItems: sectionStats.dictionary.notStarted,
        lastStudied: Date.now(),
        streak: 0,
        averageMastery: sectionStats.dictionary.total > 0 ? sectionStats.dictionary.totalMastery / sectionStats.dictionary.total : 0
      },
      mood: {
        totalItems: sectionStats.mood.total,
        masteredItems: sectionStats.mood.mastered,
        inProgressItems: sectionStats.mood.inProgress,
        notStartedItems: sectionStats.mood.notStarted,
        lastStudied: Date.now(),
        streak: 0,
        averageMastery: sectionStats.mood.total > 0 ? sectionStats.mood.totalMastery / sectionStats.mood.total : 0
      },
      culture: {
        totalItems: sectionStats.culture.total,
        masteredItems: sectionStats.culture.mastered,
        inProgressItems: sectionStats.culture.inProgress,
        notStartedItems: sectionStats.culture.notStarted,
        lastStudied: Date.now(),
        streak: 0,
        averageMastery: sectionStats.culture.total > 0 ? sectionStats.culture.totalMastery / sectionStats.culture.total : 0
      },
      trivia: {
        totalItems: sectionStats.trivia.total,
        masteredItems: sectionStats.trivia.mastered,
        inProgressItems: sectionStats.trivia.inProgress,
        notStartedItems: sectionStats.trivia.notStarted,
        lastStudied: Date.now(),
        streak: 0,
        averageMastery: sectionStats.trivia.total > 0 ? sectionStats.trivia.totalMastery / sectionStats.trivia.total : 0
      },
      anime: {
        totalItems: sectionStats.anime.total,
        masteredItems: sectionStats.anime.mastered,
        inProgressItems: sectionStats.anime.inProgress,
        notStartedItems: sectionStats.anime.notStarted,
        lastStudied: Date.now(),
        streak: 0,
        averageMastery: sectionStats.anime.total > 0 ? sectionStats.anime.totalMastery / sectionStats.anime.total : 0
      }
    };

    return updatedSections;
  }, []);



  // Update word progress with debouncing and better error handling
  const updateWordProgress = useCallback((wordId: string, progressUpdate: Partial<WordProgress>) => {
    setProgress(prev => {
      const currentProgress = prev.words[wordId] || {
        id: wordId,
        lastReviewed: Date.now(),
        reviewCount: 0,
        masteryLevel: 0,
        nextReviewDate: Date.now() + 24 * 60 * 60 * 1000, // 1 day from now
        notes: '',
        favorite: false,
        difficulty: 'medium' as const,
        category: '',
        section: 'dictionary' as const,
        consecutiveCorrect: 0,
        lastAnswerCorrect: false,
        correctAnswers: 0,
        incorrectAnswers: 0
      };

      const updatedProgress = {
        ...currentProgress,
        ...progressUpdate,
        lastReviewed: Date.now()
      };

      const updatedWords = {
        ...prev.words,
        [wordId]: updatedProgress
      };

      // Recalculate section progress based on updated words
      const updatedSections = recalculateSectionProgress(updatedWords);

      const newProgress = {
        ...prev,
        words: updatedWords,
        sections: updatedSections
      };

      // Update local storage immediately for better UX
      setLocalProgress(newProgress);

      // Debounce Firebase update to prevent excessive writes
      const timeoutId = setTimeout(() => {
        if (currentUser) {
          updateProgress(newProgress).catch(err => {
            console.error('[ProgressContext] Failed to sync word progress:', err);
            setError('Progress sync failed. Changes saved locally.');
          });
        }
      }, 1000);

      return newProgress;
    });
  }, [currentUser, setLocalProgress, updateProgress, recalculateSectionProgress]);

  // Update section progress
  const updateSectionProgress = useCallback((section: keyof ProgressState['sections'], progressUpdate: Partial<SectionProgress>) => {
    setProgress(prev => {
      const newProgress = {
        ...prev,
        sections: {
          ...prev.sections,
          [section]: {
            ...prev.sections[section],
            ...progressUpdate
          }
        }
      };

      // Update local storage immediately
      setLocalProgress(newProgress);

      // Sync to Firebase if user is authenticated
      if (currentUser) {
        updateProgress(newProgress).catch(err => {
          console.error('[ProgressContext] Failed to sync section progress:', err);
          setError('Progress sync failed. Changes saved locally.');
        });
      }

      return newProgress;
    });
  }, [currentUser, setLocalProgress, updateProgress]);

  // Update preferences with immediate local update
  const updatePreferences = useCallback((preferencesUpdate: Partial<ProgressState['preferences']>) => {
    setProgress(prev => {
      const newProgress = {
        ...prev,
        preferences: {
          ...prev.preferences,
          ...preferencesUpdate
        }
      };

      // Update local storage immediately
      setLocalProgress(newProgress);

      // Sync to Firebase if user is authenticated
      if (currentUser) {
        updateProgress(newProgress).catch(err => {
          console.error('[ProgressContext] Failed to sync preferences:', err);
          setError('Settings sync failed. Changes saved locally.');
        });
      }

      return newProgress;
    });
  }, [currentUser, setLocalProgress, updateProgress]);

  // Update statistics with better error handling
  const updateStatistics = useCallback((statsUpdate: Partial<ProgressState['statistics']>) => {
    setProgress(prev => {
      const newProgress = {
        ...prev,
        statistics: {
          ...prev.statistics,
          ...statsUpdate
        }
      };

      // Update local storage immediately
      setLocalProgress(newProgress);

      // Sync to Firebase if user is authenticated
      if (currentUser) {
        updateProgress(newProgress).catch(err => {
          console.error('[ProgressContext] Failed to sync statistics:', err);
          setError('Statistics sync failed. Changes saved locally.');
        });
      }

      return newProgress;
    });
  }, [currentUser, setLocalProgress, updateProgress]);

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
    setProgress(prev => {
      const newProgress = {
        ...prev,
        words: {
          ...prev.words,
          [wordId]: {
            ...prev.words[wordId],
            favorite: !prev.words[wordId]?.favorite
          }
        }
      };
      
      // Persist changes
      updateProgress(newProgress);
      
      return newProgress;
    });
  };

  const addStudyTime = (minutes: number) => {
    setProgress(prev => {
      const newProgress = {
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
      };
      
      // Persist changes
      updateProgress(newProgress);
      
      return newProgress;
    });
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
  
  // Comprehensive progress tracking methods
  const trackQuizCompletion = useCallback((quizData: {
    quizType: string;
    score: number;
    totalQuestions: number;
    timeSpent: number;
    wordsUsed: string[];
    category?: string;
  }) => {
    setProgress(prev => {
      const newProgress = {
        ...prev,
        statistics: {
          ...prev.statistics,
          totalQuizzes: (prev.statistics.totalQuizzes || 0) + 1,
          averageQuizScore: ((prev.statistics.averageQuizScore || 0) * (prev.statistics.totalQuizzes || 0) + quizData.score) / 
                           ((prev.statistics.totalQuizzes || 0) + 1),
          bestQuizScore: Math.max(prev.statistics.bestQuizScore || 0, quizData.score),
          totalStudyTime: prev.statistics.totalStudyTime + quizData.timeSpent,
          lastQuizDate: Date.now(),
          quizHistory: [...(prev.statistics.quizHistory || []), {
            timestamp: Date.now(),
            type: quizData.quizType,
            score: quizData.score,
            totalQuestions: quizData.totalQuestions,
            timeSpent: quizData.timeSpent,
            category: quizData.category
          }]
        }
      };

      // Update word progress for words used in quiz
      const updatedWords = { ...prev.words };
      quizData.wordsUsed.forEach(wordId => {
        const currentWord = updatedWords[wordId] || {
          id: wordId,
          lastReviewed: Date.now(),
          reviewCount: 0,
          masteryLevel: 0,
          nextReviewDate: Date.now() + 24 * 60 * 60 * 1000,
          notes: '',
          favorite: false,
          difficulty: 'medium' as const,
          category: quizData.category || 'general',
          section: 'dictionary' as const,
          consecutiveCorrect: 0,
          lastAnswerCorrect: false,
          correctAnswers: 0,
          incorrectAnswers: 0
        };

        updatedWords[wordId] = {
          ...currentWord,
          reviewCount: currentWord.reviewCount + 1,
          lastReviewed: Date.now(),
          lastAnswerCorrect: quizData.score >= quizData.totalQuestions * 0.8,
          correctAnswers: currentWord.correctAnswers + (quizData.score >= quizData.totalQuestions * 0.8 ? 1 : 0),
          incorrectAnswers: currentWord.incorrectAnswers + (quizData.score < quizData.totalQuestions * 0.8 ? 1 : 0),
          consecutiveCorrect: quizData.score >= quizData.totalQuestions * 0.8 ? 
            currentWord.consecutiveCorrect + 1 : 0,
          masteryLevel: Math.min(5, Math.max(0, 
            (currentWord.correctAnswers + (quizData.score >= quizData.totalQuestions * 0.8 ? 1 : 0)) / 
            (currentWord.correctAnswers + currentWord.incorrectAnswers + 1) * 5
          ))
        };
      });

      newProgress.words = updatedWords;
      
      // Persist changes
      updateProgress(newProgress);
      
      return newProgress;
    });
  }, [updateProgress]);

  const trackLessonCompletion = useCallback((lessonData: {
    lessonId: string;
    timeSpent: number;
    wordsLearned: string[];
    exercisesCompleted: number;
    totalExercises: number;
  }) => {
    setProgress(prev => {
      const newProgress = {
        ...prev,
        statistics: {
          ...prev.statistics,
          lessonsCompleted: (prev.statistics.lessonsCompleted || 0) + 1,
          totalStudyTime: prev.statistics.totalStudyTime + lessonData.timeSpent,
          lastLessonDate: Date.now(),
          lessonHistory: [...(prev.statistics.lessonHistory || []), {
            timestamp: Date.now(),
            lessonId: lessonData.lessonId,
            timeSpent: lessonData.timeSpent,
            wordsLearned: lessonData.wordsLearned.length,
            exercisesCompleted: lessonData.exercisesCompleted,
            totalExercises: lessonData.totalExercises
          }]
        }
      };

      // Update word progress for words learned in lesson
      const updatedWords = { ...prev.words };
      lessonData.wordsLearned.forEach(wordId => {
        const currentWord = updatedWords[wordId] || {
          id: wordId,
          lastReviewed: Date.now(),
          reviewCount: 0,
          masteryLevel: 0,
          nextReviewDate: Date.now() + 24 * 60 * 60 * 1000,
          notes: '',
          favorite: false,
          difficulty: 'medium' as const,
          category: 'lesson',
          section: 'dictionary' as const,
          consecutiveCorrect: 0,
          lastAnswerCorrect: false,
          correctAnswers: 0,
          incorrectAnswers: 0
        };

        updatedWords[wordId] = {
          ...currentWord,
          reviewCount: currentWord.reviewCount + 1,
          lastReviewed: Date.now(),
          masteryLevel: Math.min(5, currentWord.masteryLevel + 1)
        };
      });

      newProgress.words = updatedWords;
      
      // Persist changes
      updateProgress(newProgress);
      
      return newProgress;
    });
  }, [updateProgress]);

  const trackPracticeSession = useCallback((practiceData: {
    practiceType: 'writing' | 'reading' | 'listening' | 'speaking';
    timeSpent: number;
    wordsPracticed: string[];
    accuracy: number;
    strokesCorrect?: number;
    totalStrokes?: number;
  }) => {
    setProgress(prev => {
      const newProgress = {
        ...prev,
        statistics: {
          ...prev.statistics,
          practiceSessions: (prev.statistics.practiceSessions || 0) + 1,
          totalStudyTime: prev.statistics.totalStudyTime + practiceData.timeSpent,
          lastPracticeDate: Date.now(),
          practiceHistory: [...(prev.statistics.practiceHistory || []), {
            timestamp: Date.now(),
            type: practiceData.practiceType,
            timeSpent: practiceData.timeSpent,
            wordsPracticed: practiceData.wordsPracticed.length,
            accuracy: practiceData.accuracy
          }]
        }
      };

      // Update word progress for practiced words
      const updatedWords = { ...prev.words };
      practiceData.wordsPracticed.forEach(wordId => {
        const currentWord = updatedWords[wordId] || {
          id: wordId,
          lastReviewed: Date.now(),
          reviewCount: 0,
          masteryLevel: 0,
          nextReviewDate: Date.now() + 24 * 60 * 60 * 1000,
          notes: '',
          favorite: false,
          difficulty: 'medium' as const,
          category: 'practice',
          section: 'dictionary' as const,
          consecutiveCorrect: 0,
          lastAnswerCorrect: false,
          correctAnswers: 0,
          incorrectAnswers: 0
        };

        const isCorrect = practiceData.accuracy >= 0.8;
        updatedWords[wordId] = {
          ...currentWord,
          reviewCount: currentWord.reviewCount + 1,
          lastReviewed: Date.now(),
          lastAnswerCorrect: isCorrect,
          correctAnswers: currentWord.correctAnswers + (isCorrect ? 1 : 0),
          incorrectAnswers: currentWord.incorrectAnswers + (isCorrect ? 0 : 1),
          consecutiveCorrect: isCorrect ? currentWord.consecutiveCorrect + 1 : 0,
          lastPracticeDate: Date.now(),
          practiceHistory: [...(currentWord.practiceHistory || []), {
            date: Date.now(),
            score: practiceData.accuracy,
            type: practiceData.practiceType
          }],
          ...(practiceData.strokesCorrect && practiceData.totalStrokes && {
            strokeOrderProgress: {
              correctStrokes: practiceData.strokesCorrect,
              totalStrokes: practiceData.totalStrokes,
              lastScore: practiceData.accuracy
            }
          })
        };
      });

      newProgress.words = updatedWords;
      
      // Persist changes
      updateProgress(newProgress);
      
      return newProgress;
    });
  }, [updateProgress]);

  const trackSRSReview = useCallback((srsData: {
    wordId: string;
    difficulty: 'easy' | 'medium' | 'hard';
    timeSpent: number;
    nextReviewInterval: number;
  }) => {
    setProgress(prev => {
      const newProgress = {
        ...prev,
        statistics: {
          ...prev.statistics,
          srsReviews: (prev.statistics.srsReviews || 0) + 1,
          totalStudyTime: prev.statistics.totalStudyTime + srsData.timeSpent,
          lastSRSDate: Date.now()
        }
      };

      // Update word progress for SRS review
      const currentWord = prev.words[srsData.wordId];
      if (currentWord) {
        const difficultyMultiplier = srsData.difficulty === 'easy' ? 1.5 : 
                                   srsData.difficulty === 'medium' ? 1.0 : 0.5;
        
        newProgress.words = {
          ...prev.words,
          [srsData.wordId]: {
            ...currentWord,
            reviewCount: currentWord.reviewCount + 1,
            lastReviewed: Date.now(),
            nextReviewDate: Date.now() + srsData.nextReviewInterval,
            difficulty: srsData.difficulty,
            masteryLevel: Math.min(5, currentWord.masteryLevel + difficultyMultiplier)
          }
        };
      }

      // Persist changes
      updateProgress(newProgress);
      
      return newProgress;
    });
  }, [updateProgress]);

  const trackAchievement = useCallback((achievementData: {
    achievementId: string;
    title: string;
    description: string;
    points: number;
    category: string;
  }) => {
    setProgress(prev => {
      const newProgress = {
        ...prev,
        statistics: {
          ...prev.statistics,
          achievements: [...(prev.statistics.achievements || []), {
            id: achievementData.achievementId,
            title: achievementData.title,
            description: achievementData.description,
            points: achievementData.points,
            category: achievementData.category,
            unlockedAt: Date.now()
          }],
          totalPoints: (prev.statistics.totalPoints || 0) + achievementData.points
        }
      };

      // Persist changes
      updateProgress(newProgress);

      return newProgress;
    });
  }, [updateProgress]);

  const updateStreak = useCallback(() => {
    setProgress(prev => {
      const today = new Date().toDateString();
      const lastStudyDate = prev.statistics.lastStudyDate;
      const lastStudyDay = lastStudyDate ? new Date(lastStudyDate).toDateString() : null;
      
      let newStreak = prev.statistics.currentStreak || 0;
      
      if (lastStudyDay === today) {
        // Already studied today, no change
        return prev;
      } else if (lastStudyDay === new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()) {
        // Studied yesterday, increment streak
        newStreak += 1;
      } else if (lastStudyDay !== today) {
        // Missed a day, reset streak
        newStreak = 1;
      }

      const newProgress = {
        ...prev,
        statistics: {
          ...prev.statistics,
          currentStreak: newStreak,
          longestStreak: Math.max(prev.statistics.longestStreak || 0, newStreak),
          lastStudyDate: Date.now()
        }
      };

      // Persist changes
      updateProgress(newProgress);

      return newProgress;
    });
  }, [updateProgress]);

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
    updateStreak,
    trackQuizCompletion,
    trackLessonCompletion,
    trackPracticeSession,
    trackSRSReview,
    trackAchievement,
    markLessonCompleted,
    isLessonCompleted,
    getCompletedLessons
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
    console.warn('[useProgress] Context is undefined, returning default values');
    // Return default context values instead of throwing an error
    return {
      progress: defaultProgress,
      statistics: defaultProgress.statistics,
      sections: defaultProgress.sections,
      updateProgress: () => {},
      trackQuizCompletion: () => {},
      trackLessonCompletion: () => {},
      trackPracticeSession: () => {},
      trackSRSReview: () => {},
      trackAchievement: () => {},
      updateWordProgress: () => {},
      toggleFavorite: () => {},
      addStudyTime: () => {},
      updateStreak: () => {},
      getSectionProgress: () => ({ totalItems: 0, masteredItems: 0, inProgressItems: 0, notStartedItems: 0, percentComplete: 0, averageMastery: 0, lastStudied: 0, streak: 0 }),
      getWordProgress: () => ({ mastery: 0, lastStudied: 0, reviewCount: 0, nextReview: 0, favorite: false }),
      isLoading: false,
      error: null
    };
  }
  return context;
}; 