import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback, useRef } from 'react';

// Safe localStorage utility functions
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(`Failed to read from localStorage for key "${key}":`, error);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn(`Failed to write to localStorage for key "${key}":`, error);
    }
  }
};

interface Progress {
  completed: number;
  total: number;
  quizStats?: {
    totalQuizzes: number;
    averageScore: number;
    bestScore: number;
    lastQuizDate: string;
    categories: {
      [category: string]: {
        attempts: number;
        averageScore: number;
        bestScore: number;
      }
    }
  }
}

interface ProgressData {
  [key: string]: Progress;
}

export interface Settings {
  showRomaji: boolean;
  showHints: boolean;
  autoPlay: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  showRomajiVocabulary: boolean;
  showRomajiReading: boolean;
  showRomajiJLPT: boolean;
  showKanjiGames: boolean;
  showRomajiGames: boolean;
  useHiraganaGames: boolean;
  showHiragana: boolean;
  showKatakana: boolean;
}

interface QuizData {
  score: number;
  date: string;
  category: string;
  difficulty: string;
  quizType: string;
  timeTaken: number;
  totalQuestions: number;
  correctAnswers: number;
}

interface AppContextType {
  progress: ProgressData;
  settings: Settings;
  updateProgress: (section: string, completed: number, total: number, quizData?: QuizData) => void;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

const defaultProgress: ProgressData = {
  section1: { 
    completed: 0, 
    total: 0,
    quizStats: {
      totalQuizzes: 0,
      averageScore: 0,
      bestScore: 0,
      lastQuizDate: '',
      categories: {}
    }
  },
  section3: { completed: 0, total: 0 },
  section5: { completed: 0, total: 0 },
  section6: { completed: 0, total: 0 },
  section7: { completed: 0, total: 0 },
  section8: { completed: 0, total: 0 },
  anime: { 
    completed: 0, 
    total: 0,
    quizStats: {
      totalQuizzes: 0,
      averageScore: 0,
      bestScore: 0,
      lastQuizDate: '',
      categories: {}
    }
  }
};

export const defaultSettings: Settings = {
  showRomaji: true,
  showHints: true,
  autoPlay: false,
  difficulty: 'medium',
  showRomajiVocabulary: true,
  showRomajiReading: true,
  showRomajiJLPT: true,
  showKanjiGames: true,
  showRomajiGames: true,
  useHiraganaGames: true,
  showHiragana: true,
  showKatakana: true
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [progress, setProgress] = useState<ProgressData>(() => {
    const savedProgress = safeLocalStorage.getItem('appProgress');
    return savedProgress ? JSON.parse(savedProgress) : defaultProgress;
  });

  const [settings, setSettings] = useState<Settings>(() => {
    const savedSettings = safeLocalStorage.getItem('appSettings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  // Use refs to store timeouts and prevent memory leaks
  const progressTimeoutRef = useRef<NodeJS.Timeout>();
  const settingsTimeoutRef = useRef<NodeJS.Timeout>();

  // Improved debouncing with cleanup
  const debouncedLocalStorageWrite = useCallback((key: string, value: any, timeoutRef: React.MutableRefObject<NodeJS.Timeout | undefined>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      safeLocalStorage.setItem(key, JSON.stringify(value));
      timeoutRef.current = undefined;
    }, 300); // Reduced debounce time for better responsiveness
  }, []);

  // Memoize progress update function
  const updateProgress = useCallback((
    section: string,
    completed: number,
    total: number,
    quizData?: QuizData
  ) => {
    setProgress(prev => {
      const sectionProgress = prev[section] || { 
        completed: 0, 
        total: 0
      };

      const newProgress: ProgressData = {
        ...prev,
        [section]: {
          ...sectionProgress,
          completed,
          total,
          ...(quizData && {
            quizStats: {
              totalQuizzes: (sectionProgress.quizStats?.totalQuizzes || 0) + 1,
              averageScore: ((sectionProgress.quizStats?.averageScore || 0) * (sectionProgress.quizStats?.totalQuizzes || 0) + quizData.score) / 
                           ((sectionProgress.quizStats?.totalQuizzes || 0) + 1),
              bestScore: Math.max(sectionProgress.quizStats?.bestScore || 0, quizData.score),
              lastQuizDate: quizData.date,
              categories: {
                ...sectionProgress.quizStats?.categories,
                [quizData.category]: {
                  attempts: (sectionProgress.quizStats?.categories?.[quizData.category]?.attempts || 0) + 1,
                  averageScore: ((sectionProgress.quizStats?.categories?.[quizData.category]?.averageScore || 0) * 
                               (sectionProgress.quizStats?.categories?.[quizData.category]?.attempts || 0) + quizData.score) / 
                               ((sectionProgress.quizStats?.categories?.[quizData.category]?.attempts || 0) + 1),
                  bestScore: Math.max(sectionProgress.quizStats?.categories?.[quizData.category]?.bestScore || 0, quizData.score)
                }
              }
            }
          })
        }
      };

      debouncedLocalStorageWrite('appProgress', newProgress, progressTimeoutRef);
      return newProgress;
    });
  }, [debouncedLocalStorageWrite]);

  // Memoize settings update function
  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    setSettings(prev => {
      const updatedSettings = { ...prev, ...newSettings };
      debouncedLocalStorageWrite('appSettings', updatedSettings, settingsTimeoutRef);
      return updatedSettings;
    });
  }, [debouncedLocalStorageWrite]);

  // Cleanup timeouts on unmount
  React.useEffect(() => {
    return () => {
      if (progressTimeoutRef.current) clearTimeout(progressTimeoutRef.current);
      if (settingsTimeoutRef.current) clearTimeout(settingsTimeoutRef.current);
    };
  }, []);

  // Memoize context value
  const value = useMemo(() => ({
    progress,
    settings,
    updateProgress,
    updateSettings
  }), [progress, settings, updateProgress, updateSettings]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}; 