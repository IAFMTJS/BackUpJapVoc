import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DictionaryItem } from '../types/dictionary';
import { databasePromise, getDatabase, StoreName } from '../utils/databaseConfig';

interface LearningProgress {
  wordId: string;
  masteryLevel: number;
  lastReviewed: Date;
  nextReview: Date;
  correctAnswers: number;
  mistakes: number;
  streak: number;
  difficulty: number;
  reviewHistory: Array<{
    date: Date;
    isCorrect: boolean;
    timeSpent: number;
    difficulty: number;
  }>;
  tags: string[];
  notes: string;
  examples: string[];
  pronunciationScore: number;
  writingScore: number;
}

interface LearningSettings {
  adaptiveDifficulty: boolean;
  spacedRepetition: boolean;
  dailyGoal: number;
  reviewInterval: number;
  showPronunciation: boolean;
  showWriting: boolean;
  showExamples: boolean;
  showMnemonics: boolean;
  difficultyAdjustment: number;
  streakBonus: number;
  masteryThreshold: number;
}

interface LearningContextType {
  learningWords: DictionaryItem[];
  learningProgress: Record<string, LearningProgress>;
  isLoading: boolean;
  error: string | null;
  refreshLearningData: () => Promise<void>;
  addLearningWord: (word: Omit<DictionaryItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateLearningWord: (word: DictionaryItem) => Promise<void>;
  deleteLearningWord: (id: string) => Promise<void>;
  updateProgress: (wordId: string, progress: Partial<LearningProgress>) => Promise<void>;
  getWordsByLevel: (level: number) => DictionaryItem[];
  getWordsByCategory: (category: string) => DictionaryItem[];
  getWordsByJLPT: (level: string) => DictionaryItem[];
  getWordsForReview: () => DictionaryItem[];
  getMasteredWords: () => DictionaryItem[];
  getWordsNeedingReview: () => DictionaryItem[];
  learningSettings: LearningSettings;
  updateLearningSettings: (settings: Partial<LearningSettings>) => void;
  getAdaptiveDifficulty: (wordId: string) => number;
  getNextReviewDate: (wordId: string, isCorrect: boolean) => Date;
  calculateMasteryLevel: (wordId: string) => number;
  getRecommendedWords: (count: number) => DictionaryItem[];
  getLearningPath: () => LearningPath;
  updatePronunciationScore: (wordId: string, score: number) => void;
  updateWritingScore: (wordId: string, score: number) => void;
  addNote: (wordId: string, note: string) => void;
  addExample: (wordId: string, example: string) => void;
  getSimilarWords: (wordId: string) => DictionaryItem[];
  getWordStats: (wordId: string) => WordStats;
}

const LearningContext = createContext<LearningContextType | undefined>(undefined);

export const useLearning = () => {
  const context = useContext(LearningContext);
  if (!context) {
    throw new Error('useLearning must be used within a LearningProvider');
  }
  return context;
};

export const LearningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [learningWords, setLearningWords] = useState<DictionaryItem[]>([]);
  const [learningProgress, setLearningProgress] = useState<Record<string, LearningProgress>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [learningSettings, setLearningSettings] = useState<LearningSettings>({
    adaptiveDifficulty: true,
    spacedRepetition: true,
    dailyGoal: 20,
    reviewInterval: 1,
    showPronunciation: true,
    showWriting: true,
    showExamples: true,
    showMnemonics: true,
    difficultyAdjustment: 0.1,
    streakBonus: 1.2,
    masteryThreshold: 5
  });

  const loadLearningData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const db = await getDatabase();

      // Load learning words
      const wordsTx = db.transaction('learningWords', 'readonly');
      const wordsStore = wordsTx.objectStore('learningWords');
      const wordsData = await wordsStore.getAll();
      
      // Load learning progress
      const progressTx = db.transaction('learningProgress', 'readonly');
      const progressStore = progressTx.objectStore('learningProgress');
      const progressData = await progressStore.getAll();
      
      const progressMap = progressData.reduce((acc, progress) => ({
        ...acc,
        [progress.wordId]: progress
      }), {});

      setLearningWords(wordsData);
      setLearningProgress(progressMap);
      console.log(`[LearningContext] Successfully loaded ${wordsData.length} learning words and progress data`);
    } catch (err) {
      console.error('[LearningContext] Error loading learning data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load learning data');
      setLearningWords([]);
      setLearningProgress({});
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLearningData();
  }, []);

  const getWordsByLevel = (level: number): DictionaryItem[] => {
    return learningWords.filter(word => word.level === level);
  };

  const getWordsByCategory = (category: string): DictionaryItem[] => {
    return learningWords.filter(word => word.category === category);
  };

  const getWordsByJLPT = (level: string): DictionaryItem[] => {
    return learningWords.filter(word => word.jlptLevel === level);
  };

  const getWordsForReview = (): DictionaryItem[] => {
    const now = new Date();
    return learningWords.filter(word => {
      const progress = learningProgress[word.id];
      return progress && progress.nextReview <= now;
    });
  };

  const getMasteredWords = (): DictionaryItem[] => {
    return learningWords.filter(word => {
      const progress = learningProgress[word.id];
      return progress && progress.masteryLevel >= 0.8; // 80% mastery threshold
    });
  };

  const getWordsNeedingReview = (): DictionaryItem[] => {
    const now = new Date();
    return learningWords.filter(word => {
      const progress = learningProgress[word.id];
      return progress && progress.masteryLevel < 0.8 && progress.nextReview <= now;
    });
  };

  const addLearningWord = async (wordData: Omit<DictionaryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const db = await getDatabase();
      const tx = db.transaction('learningWords', 'readwrite');
      const store = tx.objectStore('learningWords');

      const newWord: DictionaryItem = {
        ...wordData,
        id: `learn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await store.add(newWord);
      setLearningWords(prev => [...prev, newWord]);

      // Initialize progress for the new word
      const progressTx = db.transaction('learningProgress', 'readwrite');
      const progressStore = progressTx.objectStore('learningProgress');
      const initialProgress: LearningProgress = {
        wordId: newWord.id,
        masteryLevel: 0,
        lastReviewed: new Date(),
        nextReview: new Date(),
        correctAnswers: 0,
        mistakes: 0,
        streak: 0,
        difficulty: 1,
        reviewHistory: [],
        tags: [],
        notes: '',
        examples: [],
        pronunciationScore: 0,
        writingScore: 0
      };
      await progressStore.add(initialProgress);
      setLearningProgress(prev => ({
        ...prev,
        [newWord.id]: initialProgress
      }));
    } catch (err) {
      console.error('[LearningContext] Error adding learning word:', err);
      throw err;
    }
  };

  const updateLearningWord = async (word: DictionaryItem) => {
    try {
      const db = await getDatabase();
      const tx = db.transaction('learningWords', 'readwrite');
      const store = tx.objectStore('learningWords');

      const updatedWord = {
        ...word,
        updatedAt: new Date()
      };

      await store.put(updatedWord);
      setLearningWords(prev => prev.map(w => w.id === word.id ? updatedWord : w));
    } catch (err) {
      console.error('[LearningContext] Error updating learning word:', err);
      throw err;
    }
  };

  const deleteLearningWord = async (id: string) => {
    try {
      const db = await getDatabase();
      
      // Delete word
      const wordTx = db.transaction('learningWords', 'readwrite');
      const wordStore = wordTx.objectStore('learningWords');
      await wordStore.delete(id);
      
      // Delete progress
      const progressTx = db.transaction('learningProgress', 'readwrite');
      const progressStore = progressTx.objectStore('learningProgress');
      await progressStore.delete(id);

      setLearningWords(prev => prev.filter(w => w.id !== id));
      setLearningProgress(prev => {
        const { [id]: _, ...rest } = prev;
        return rest;
      });
    } catch (err) {
      console.error('[LearningContext] Error deleting learning word:', err);
      throw err;
    }
  };

  const updateProgress = async (wordId: string, progress: Partial<LearningProgress>) => {
    try {
      const db = await getDatabase();
      const tx = db.transaction('learningProgress', 'readwrite');
      const store = tx.objectStore('learningProgress');

      const currentProgress = learningProgress[wordId];
      if (!currentProgress) {
        throw new Error(`No progress found for word ${wordId}`);
      }

      const updatedProgress = {
        ...currentProgress,
        ...progress,
        lastReviewed: new Date()
      };

      await store.put(updatedProgress);
      setLearningProgress(prev => ({
        ...prev,
        [wordId]: updatedProgress
      }));
    } catch (err) {
      console.error('[LearningContext] Error updating progress:', err);
      throw err;
    }
  };

  // Calculate adaptive difficulty based on user performance
  const getAdaptiveDifficulty = useCallback((wordId: string): number => {
    const progress = learningProgress[wordId];
    if (!progress) return 1;

    const baseDifficulty = progress.difficulty || 1;
    const successRate = progress.correctAnswers / (progress.correctAnswers + progress.mistakes);
    const streakBonus = Math.min(progress.streak * learningSettings.streakBonus, 2);
    
    return Math.max(0.5, Math.min(5, baseDifficulty * (successRate * streakBonus)));
  }, [learningProgress, learningSettings.streakBonus]);

  // Calculate next review date using spaced repetition
  const getNextReviewDate = useCallback((wordId: string, isCorrect: boolean): Date => {
    const progress = learningProgress[wordId];
    if (!progress || !learningSettings.spacedRepetition) {
      return new Date(Date.now() + 24 * 60 * 60 * 1000); // Default to 1 day
    }

    const intervals = [1, 3, 7, 14, 30, 90, 180]; // Days
    const currentInterval = progress.masteryLevel;
    const nextInterval = isCorrect 
      ? Math.min(currentInterval + 1, intervals.length - 1)
      : Math.max(currentInterval - 1, 0);

    return new Date(Date.now() + intervals[nextInterval] * 24 * 60 * 60 * 1000);
  }, [learningProgress, learningSettings.spacedRepetition]);

  // Calculate mastery level based on performance
  const calculateMasteryLevel = useCallback((wordId: string): number => {
    const progress = learningProgress[wordId];
    if (!progress) return 0;

    const totalAttempts = progress.correctAnswers + progress.mistakes;
    if (totalAttempts < 3) return 0;

    const successRate = progress.correctAnswers / totalAttempts;
    const streakBonus = Math.min(progress.streak / 5, 1);
    const timeBonus = progress.reviewHistory.length > 10 ? 1 : progress.reviewHistory.length / 10;

    return Math.min(5, Math.floor((successRate * 3 + streakBonus + timeBonus) * 1.5));
  }, [learningProgress]);

  // Get recommended words for review
  const getRecommendedWords = useCallback((count: number): DictionaryItem[] => {
    const now = new Date();
    return learningWords
      .filter(word => {
        const progress = learningProgress[word.id];
        return !progress || progress.nextReview <= now;
      })
      .sort((a, b) => {
        const progressA = learningProgress[a.id];
        const progressB = learningProgress[b.id];
        const priorityA = progressA ? calculateMasteryLevel(a.id) : 0;
        const priorityB = progressB ? calculateMasteryLevel(b.id) : 0;
        return priorityA - priorityB;
      })
      .slice(0, count);
  }, [learningWords, learningProgress, calculateMasteryLevel]);

  const value = {
    learningWords,
    learningProgress,
    isLoading,
    error,
    refreshLearningData: loadLearningData,
    addLearningWord,
    updateLearningWord,
    deleteLearningWord,
    updateProgress,
    getWordsByLevel,
    getWordsByCategory,
    getWordsByJLPT,
    getWordsForReview,
    getMasteredWords,
    getWordsNeedingReview,
    learningSettings,
    updateLearningSettings: (settings: Partial<LearningSettings>) => 
      setLearningSettings(prev => ({ ...prev, ...settings })),
    getAdaptiveDifficulty,
    getNextReviewDate,
    calculateMasteryLevel,
    getRecommendedWords,
  };

  return (
    <LearningContext.Provider value={value}>
      {children}
    </LearningContext.Provider>
  );
}; 