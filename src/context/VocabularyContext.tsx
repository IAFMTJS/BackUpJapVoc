import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import safeLocalStorage from '../utils/safeLocalStorage';

export interface VocabularyWord {
  id: string;
  japanese: string;
  reading: string;
  english: string;
  romaji: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  jlptLevel?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  tags: string[];
  examples: string[];
  audioUrl?: string;
  mastered: boolean;
  lastReviewed?: Date;
  reviewCount: number;
  correctCount: number;
}

export interface VocabularyStats {
  totalWords: number;
  masteredWords: number;
  learningWords: number;
  reviewWords: number;
  accuracyRate: number;
  averageDifficulty: number;
  categories: Record<string, number>;
  jlptLevels: Record<string, number>;
}

interface VocabularyContextType {
  words: VocabularyWord[];
  stats: VocabularyStats;
  isLoading: boolean;
  error: string | null;
  addWord: (word: Omit<VocabularyWord, 'id' | 'mastered' | 'reviewCount' | 'correctCount'>) => void;
  updateWord: (id: string, updates: Partial<VocabularyWord>) => void;
  removeWord: (id: string) => void;
  markAsMastered: (id: string) => void;
  recordReview: (id: string, isCorrect: boolean) => void;
  getWordsByCategory: (category: string) => VocabularyWord[];
  getWordsByDifficulty: (difficulty: VocabularyWord['difficulty']) => VocabularyWord[];
  getWordsByJLPTLevel: (level: VocabularyWord['jlptLevel']) => VocabularyWord[];
  searchWords: (query: string) => VocabularyWord[];
  updateStats: () => void;
}

const defaultStats: VocabularyStats = {
  totalWords: 0,
  masteredWords: 0,
  learningWords: 0,
  reviewWords: 0,
  accuracyRate: 0,
  averageDifficulty: 1,
  categories: {},
  jlptLevels: {},
};

const VocabularyContext = createContext<VocabularyContextType | undefined>(undefined);

export const VocabularyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [stats, setStats] = useState<VocabularyStats>(defaultStats);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load words from localStorage on mount
  useEffect(() => {
    try {
      const savedWords = safeLocalStorage.getItem('vocabularyWords');
      if (savedWords) {
        const parsedWords = JSON.parse(savedWords);
        // Convert date strings back to Date objects
        const wordsWithDates = parsedWords.map((word: any) => ({
          ...word,
          lastReviewed: word.lastReviewed ? new Date(word.lastReviewed) : undefined,
        }));
        setWords(wordsWithDates);
      }
    } catch (error) {
      console.error('Error loading vocabulary words:', error);
    }
  }, []);

  // Save words to localStorage whenever they change
  useEffect(() => {
    try {
      safeLocalStorage.setItem('vocabularyWords', JSON.stringify(words));
    } catch (error) {
      console.error('Error saving vocabulary words:', error);
    }
  }, [words]);

  // Update stats whenever words change
  useEffect(() => {
    updateStats();
  }, [words]);

  const addWord = (word: Omit<VocabularyWord, 'id' | 'mastered' | 'reviewCount' | 'correctCount'>) => {
    const newWord: VocabularyWord = {
      ...word,
      id: Date.now().toString(),
      mastered: false,
      reviewCount: 0,
      correctCount: 0,
    };
    setWords(prev => [...prev, newWord]);
  };

  const updateWord = (id: string, updates: Partial<VocabularyWord>) => {
    setWords(prev => {
      return prev.map(word => {
        if (word.id !== id) return word;
        return { ...word, ...updates };
      });
    });
  };

  const removeWord = (id: string) => {
    setWords(prev => prev.filter(word => word.id !== id));
  };

  const markAsMastered = (id: string) => {
    updateWord(id, { mastered: true });
  };

  const recordReview = (id: string, isCorrect: boolean) => {
    setWords(prev => {
      return prev.map(word => {
        if (word.id !== id) return word;
        return {
          ...word,
          lastReviewed: new Date(),
          reviewCount: word.reviewCount + 1,
          correctCount: word.correctCount + (isCorrect ? 1 : 0),
        };
      });
    });
  };

  const getWordsByCategory = (category: string): VocabularyWord[] => {
    return words.filter(word => word.category === category);
  };

  const getWordsByDifficulty = (difficulty: VocabularyWord['difficulty']): VocabularyWord[] => {
    return words.filter(word => word.difficulty === difficulty);
  };

  const getWordsByJLPTLevel = (level: VocabularyWord['jlptLevel']): VocabularyWord[] => {
    return words.filter(word => word.jlptLevel === level);
  };

  const searchWords = (query: string): VocabularyWord[] => {
    const lowerQuery = query.toLowerCase();
    return words.filter(word => 
      word.japanese.toLowerCase().includes(lowerQuery) ||
      word.reading.toLowerCase().includes(lowerQuery) ||
      word.english.toLowerCase().includes(lowerQuery) ||
      word.romaji.toLowerCase().includes(lowerQuery) ||
      word.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  };

  const updateStats = () => {
    const masteredWords = words.filter(word => word.mastered);
    const learningWords = words.filter(word => !word.mastered && word.reviewCount < 5);
    const reviewWords = words.filter(word => !word.mastered && word.reviewCount >= 5);

    // Calculate accuracy rate
    const totalReviews = words.reduce((sum, word) => sum + word.reviewCount, 0);
    const totalCorrect = words.reduce((sum, word) => sum + word.correctCount, 0);
    const accuracyRate = totalReviews > 0 ? (totalCorrect / totalReviews) * 100 : 0;

    // Calculate average difficulty
    const difficultyMap = { beginner: 1, intermediate: 2, advanced: 3 };
    const averageDifficulty = words.length > 0 
      ? words.reduce((sum, word) => sum + difficultyMap[word.difficulty], 0) / words.length 
      : 1;

    // Count categories
    const categories: Record<string, number> = {};
    words.forEach(word => {
      categories[word.category] = (categories[word.category] || 0) + 1;
    });

    // Count JLPT levels
    const jlptLevels: Record<string, number> = {};
    words.forEach(word => {
      if (word.jlptLevel) {
        jlptLevels[word.jlptLevel] = (jlptLevels[word.jlptLevel] || 0) + 1;
      }
    });

    setStats({
      totalWords: words.length,
      masteredWords: masteredWords.length,
      learningWords: learningWords.length,
      reviewWords: reviewWords.length,
      accuracyRate,
      averageDifficulty,
      categories,
      jlptLevels,
    });
  };

  return (
    <VocabularyContext.Provider
      value={{
        words,
        stats,
        isLoading,
        error,
        addWord,
        updateWord,
        removeWord,
        markAsMastered,
        recordReview,
        getWordsByCategory,
        getWordsByDifficulty,
        getWordsByJLPTLevel,
        searchWords,
        updateStats,
      }}
    >
      {children}
    </VocabularyContext.Provider>
  );
};

export const useVocabulary = (): VocabularyContextType => {
  const context = useContext(VocabularyContext);
  if (context === undefined) {
    throw new Error('useVocabulary must be used within a VocabularyProvider');
  }
  return context;
}; 