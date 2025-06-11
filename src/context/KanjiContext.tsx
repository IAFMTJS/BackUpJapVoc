import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { databasePromise, getDatabase, StoreName } from '../utils/databaseConfig';

// Types
export interface Kanji {
  id: string;
  character: string;
  level: number;
  jlptLevel: string;
  frequency: number;
  radicals: string[];
  strokeCount: number;
  readings: {
    onyomi: string[];
    kunyomi: string[];
    nanori: string[];
  };
  meanings: string[];
  examples: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface KanjiProgress {
  kanjiId: string;
  masteryLevel: number;
  nextReview: Date;
  lastReviewed: Date;
  writingScore: number;
  readingScore: number;
  reviewHistory: Array<{
    date: Date;
    type: 'writing' | 'reading' | 'meaning';
    isCorrect: boolean;
    timeSpent: number;
  }>;
  notes?: string;
}

export interface KanjiStroke {
  kanjiId: string;
  strokeCount: number;
  difficulty: number;
  strokes: Array<{
    path: string;
    order: number;
    startPoint: [number, number];
    endPoint: [number, number];
  }>;
}

export interface KanjiExample {
  id: string;
  kanjiId: string;
  wordId: string;
  word: string;
  reading: string;
  meaning: string;
  frequency: number;
}

interface KanjiContextType {
  kanji: Kanji[];
  kanjiProgress: Record<string, KanjiProgress>;
  isLoading: boolean;
  error: string | null;
  refreshKanji: () => Promise<void>;
  addKanji: (kanji: Omit<Kanji, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateKanji: (kanji: Kanji) => Promise<void>;
  deleteKanji: (id: string) => Promise<void>;
  updateProgress: (kanjiId: string, progress: Partial<KanjiProgress>) => Promise<void>;
  getKanjiByLevel: (level: number) => Kanji[];
  getKanjiByJLPT: (level: string) => Kanji[];
  getKanjiByRadical: (radical: string) => Kanji[];
  getKanjiForReview: () => Kanji[];
  getMasteredKanji: () => Kanji[];
  getKanjiNeedingReview: () => Kanji[];
  getStrokeOrder: (kanjiId: string) => KanjiStroke | undefined;
  getExamples: (kanjiId: string) => KanjiExample[];
  calculateMasteryLevel: (kanjiId: string) => number;
  getNextReviewDate: (kanjiId: string, isCorrect: boolean) => Date;
  updateWritingScore: (kanjiId: string, score: number) => void;
  updateReadingScore: (kanjiId: string, score: number) => void;
  addNote: (kanjiId: string, note: string) => void;
  getSimilarKanji: (kanjiId: string) => Kanji[];
  getKanjiStats: (kanjiId: string) => {
    masteryLevel: number;
    writingScore: number;
    readingScore: number;
    reviewCount: number;
    lastReviewed: Date;
    nextReview: Date;
  };
}

const KanjiContext = createContext<KanjiContextType | undefined>(undefined);

export const useKanji = () => {
  const context = useContext(KanjiContext);
  if (context === undefined) {
    console.warn('[useKanji] Context is undefined, returning default values');
    // Return default context values instead of throwing an error
    return {
      kanji: [],
      isLoading: false,
      error: null,
      searchKanji: () => [],
      getKanjiByLevel: () => [],
      addKanji: async () => {},
      updateKanji: async () => {},
      deleteKanji: async () => {}
    };
  }
  return context;
};

export const KanjiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [kanji, setKanji] = useState<Kanji[]>([]);
  const [kanjiProgress, setKanjiProgress] = useState<Record<string, KanjiProgress>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadKanjiData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const db = await databasePromise;
      
      // Load kanji
      const kanjiTx = db.transaction('kanji', 'readonly');
      const kanjiStore = kanjiTx.objectStore('kanji');
      const kanjiData = await kanjiStore.getAll();
      
      // Load progress
      const progressTx = db.transaction('kanjiProgress', 'readonly');
      const progressStore = progressTx.objectStore('kanjiProgress');
      const progressData = await progressStore.getAll();
      
      // Convert progress array to record
      const progressRecord = progressData.reduce((acc, curr) => ({
        ...acc,
        [curr.kanjiId]: curr
      }), {});

      setKanji(kanjiData);
      setKanjiProgress(progressRecord);
      console.log('[KanjiContext] Successfully loaded kanji data');
    } catch (err) {
      console.error('[KanjiContext] Error loading kanji data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load kanji data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadKanjiData();
  }, []);

  const getKanjiByLevel = useCallback((level: number): Kanji[] => {
    return kanji.filter(k => k.level === level);
  }, [kanji]);

  const getKanjiByJLPT = useCallback((level: string): Kanji[] => {
    return kanji.filter(k => k.jlptLevel === level);
  }, [kanji]);

  const getKanjiByRadical = useCallback((radical: string): Kanji[] => {
    return kanji.filter(k => k.radicals.includes(radical));
  }, [kanji]);

  const getKanjiForReview = useCallback((): Kanji[] => {
    const now = new Date();
    return kanji.filter(k => {
      const progress = kanjiProgress[k.id];
      return progress && progress.nextReview <= now;
    });
  }, [kanji, kanjiProgress]);

  const getMasteredKanji = useCallback((): Kanji[] => {
    return kanji.filter(k => {
      const progress = kanjiProgress[k.id];
      return progress && progress.masteryLevel >= 0.8; // 80% mastery threshold
    });
  }, [kanji, kanjiProgress]);

  const getKanjiNeedingReview = useCallback((): Kanji[] => {
    const now = new Date();
    return kanji.filter(k => {
      const progress = kanjiProgress[k.id];
      return progress && progress.masteryLevel < 0.8 && progress.nextReview <= now;
    });
  }, [kanji, kanjiProgress]);

  const getStrokeOrder = useCallback(async (kanjiId: string): Promise<KanjiStroke | undefined> => {
    try {
      const db = await getDatabase();
      const tx = db.transaction('kanjiStrokes', 'readonly');
      const store = tx.objectStore('kanjiStrokes');
      return store.get(kanjiId);
    } catch (err) {
      console.error('[KanjiContext] Error getting stroke order:', err);
      return undefined;
    }
  }, []);

  const getExamples = useCallback(async (kanjiId: string): Promise<KanjiExample[]> => {
    try {
      const db = await getDatabase();
      const tx = db.transaction('kanjiExamples', 'readonly');
      const store = tx.objectStore('kanjiExamples');
      const index = store.index('by-kanji');
      return index.getAll(kanjiId);
    } catch (err) {
      console.error('[KanjiContext] Error getting examples:', err);
      return [];
    }
  }, []);

  const calculateMasteryLevel = useCallback((kanjiId: string): number => {
    const progress = kanjiProgress[kanjiId];
    if (!progress) return 0;

    // Calculate mastery based on writing and reading scores
    const writingWeight = 0.6;
    const readingWeight = 0.4;
    
    return (progress.writingScore * writingWeight + progress.readingScore * readingWeight);
  }, [kanjiProgress]);

  const getNextReviewDate = useCallback((kanjiId: string, isCorrect: boolean): Date => {
    const progress = kanjiProgress[kanjiId];
    if (!progress) return new Date();

    const now = new Date();
    const masteryLevel = calculateMasteryLevel(kanjiId);
    
    // SRS intervals based on mastery level
    let interval: number;
    if (isCorrect) {
      if (masteryLevel >= 0.8) interval = 7 * 24 * 60 * 60 * 1000; // 7 days
      else if (masteryLevel >= 0.6) interval = 3 * 24 * 60 * 60 * 1000; // 3 days
      else if (masteryLevel >= 0.4) interval = 24 * 60 * 60 * 1000; // 1 day
      else interval = 12 * 60 * 60 * 1000; // 12 hours
    } else {
      interval = 30 * 60 * 1000; // 30 minutes
    }

    return new Date(now.getTime() + interval);
  }, [kanjiProgress, calculateMasteryLevel]);

  const updateProgress = async (kanjiId: string, newProgress: Partial<KanjiProgress>) => {
    try {
      const db = await getDatabase();
      const tx = db.transaction('kanjiProgress', 'readwrite');
      const store = tx.objectStore('kanjiProgress');

      const currentProgress = kanjiProgress[kanjiId] || {
        kanjiId,
        masteryLevel: 0,
        nextReview: new Date(),
        lastReviewed: new Date(),
        writingScore: 0,
        readingScore: 0,
        reviewHistory: []
      };

      const updatedProgress: KanjiProgress = {
        ...currentProgress,
        ...newProgress,
        lastReviewed: new Date()
      };

      await store.put(updatedProgress);
      setKanjiProgress(prev => ({
        ...prev,
        [kanjiId]: updatedProgress
      }));
    } catch (err) {
      console.error('[KanjiContext] Error updating progress:', err);
      throw err;
    }
  };

  const updateWritingScore = useCallback(async (kanjiId: string, score: number) => {
    await updateProgress(kanjiId, {
      writingScore: score,
      nextReview: getNextReviewDate(kanjiId, score >= 0.8)
    });
  }, [updateProgress, getNextReviewDate]);

  const updateReadingScore = useCallback(async (kanjiId: string, score: number) => {
    await updateProgress(kanjiId, {
      readingScore: score,
      nextReview: getNextReviewDate(kanjiId, score >= 0.8)
    });
  }, [updateProgress, getNextReviewDate]);

  const addNote = useCallback(async (kanjiId: string, note: string) => {
    await updateProgress(kanjiId, { notes: note });
  }, [updateProgress]);

  const getSimilarKanji = useCallback((kanjiId: string): Kanji[] => {
    const targetKanji = kanji.find(k => k.id === kanjiId);
    if (!targetKanji) return [];

    return kanji.filter(k => 
      k.id !== kanjiId && (
        k.radicals.some(r => targetKanji.radicals.includes(r)) ||
        Math.abs(k.strokeCount - targetKanji.strokeCount) <= 2
      )
    );
  }, [kanji]);

  const getKanjiStats = useCallback((kanjiId: string) => {
    const progress = kanjiProgress[kanjiId];
    if (!progress) {
      return {
        masteryLevel: 0,
        writingScore: 0,
        readingScore: 0,
        reviewCount: 0,
        lastReviewed: new Date(),
        nextReview: new Date()
      };
    }

    return {
      masteryLevel: calculateMasteryLevel(kanjiId),
      writingScore: progress.writingScore,
      readingScore: progress.readingScore,
      reviewCount: progress.reviewHistory.length,
      lastReviewed: progress.lastReviewed,
      nextReview: progress.nextReview
    };
  }, [kanjiProgress, calculateMasteryLevel]);

  const value = {
    kanji,
    kanjiProgress,
    isLoading,
    error,
    refreshKanji: loadKanjiData,
    addKanji: async (kanjiData) => {
      try {
        const db = await getDatabase();
        const tx = db.transaction('kanji', 'readwrite');
        const store = tx.objectStore('kanji');

        const newKanji: Kanji = {
          ...kanjiData,
          id: `kanji-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await store.add(newKanji);
        setKanji(prev => [...prev, newKanji]);
      } catch (err) {
        console.error('[KanjiContext] Error adding kanji:', err);
        throw err;
      }
    },
    updateKanji: async (kanjiData) => {
      try {
        const db = await getDatabase();
        const tx = db.transaction('kanji', 'readwrite');
        const store = tx.objectStore('kanji');

        const updatedKanji = {
          ...kanjiData,
          updatedAt: new Date()
        };

        await store.put(updatedKanji);
        setKanji(prev => prev.map(k => k.id === kanjiData.id ? updatedKanji : k));
      } catch (err) {
        console.error('[KanjiContext] Error updating kanji:', err);
        throw err;
      }
    },
    deleteKanji: async (id) => {
      try {
        const db = await getDatabase();
        const tx = db.transaction(['kanji', 'kanjiProgress', 'kanjiStrokes', 'kanjiExamples'], 'readwrite');
        
        await Promise.all([
          tx.objectStore('kanji').delete(id),
          tx.objectStore('kanjiProgress').delete(id),
          tx.objectStore('kanjiStrokes').delete(id),
          tx.objectStore('kanjiExamples').delete(id)
        ]);

        setKanji(prev => prev.filter(k => k.id !== id));
        setKanjiProgress(prev => {
          const { [id]: _, ...rest } = prev;
          return rest;
        });
      } catch (err) {
        console.error('[KanjiContext] Error deleting kanji:', err);
        throw err;
      }
    },
    updateProgress,
    getKanjiByLevel,
    getKanjiByJLPT,
    getKanjiByRadical,
    getKanjiForReview,
    getMasteredKanji,
    getKanjiNeedingReview,
    getStrokeOrder,
    getExamples,
    calculateMasteryLevel,
    getNextReviewDate,
    updateWritingScore,
    updateReadingScore,
    addNote,
    getSimilarKanji,
    getKanjiStats
  };

  return (
    <KanjiContext.Provider value={value}>
      {children}
    </KanjiContext.Provider>
  );
}; 