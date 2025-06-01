import React, { createContext, useContext, useState, useEffect } from 'react';
import { DictionaryItem } from '../types/dictionary';
import { databasePromise, getDatabase, StoreName } from '../utils/databaseConfig';
import { quizWords } from '../data/quizData';

interface WordContextType {
  quizWords: DictionaryItem[];
  isLoading: boolean;
  error: string | null;
  refreshQuizWords: () => Promise<void>;
  addQuizWord: (word: Omit<DictionaryItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateQuizWord: (word: DictionaryItem) => Promise<void>;
  deleteQuizWord: (id: string) => Promise<void>;
  getWordsByLevel: (level: number) => DictionaryItem[];
  getWordsByCategory: (category: string) => DictionaryItem[];
  getWordsByJLPT: (level: string) => DictionaryItem[];
}

const WordContext = createContext<WordContextType | undefined>(undefined);

export const useWord = () => {
  const context = useContext(WordContext);
  if (!context) {
    throw new Error('useWord must be used within a WordProvider');
  }
  return context;
};

export const WordProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [quizWords, setQuizWords] = useState<DictionaryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initializeDatabase = async () => {
    try {
      const db = await databasePromise;
      const tx = db.transaction('quizWords', 'readonly');
      const store = tx.objectStore('quizWords');
      const count = await store.count();

      if (count === 0) {
        // Initialize with quiz words
        const initTx = db.transaction('quizWords', 'readwrite');
        const initStore = initTx.objectStore('quizWords');

        // Convert quiz words to dictionary items
        const dictionaryWords = quizWords.map((word, index) => ({
          id: `quiz-${index + 1}`,
          japanese: word.japanese,
          english: word.english,
          romaji: word.romaji,
          type: 'word',
          level: word.difficulty === 'easy' ? 1 : word.difficulty === 'medium' ? 2 : 3,
          category: word.category,
          jlptLevel: word.difficulty === 'easy' ? 'N5' : word.difficulty === 'medium' ? 'N4' : 'N3',
          frequency: 1,
          mastery: 0,
          readings: [word.japanese],
          meanings: [word.english],
          examples: [],
          etymology: null,
          kanji: [],
          radicals: [],
          tags: [],
          notes: '',
          lastViewed: null,
          emotionalContext: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          isHiragana: word.isHiragana,
          isKatakana: word.isKatakana,
          audioUrl: null
        }));

        // Add all words to the database
        for (const word of dictionaryWords) {
          await initStore.add(word);
        }

        console.log(`[WordContext] Initialized database with ${dictionaryWords.length} quiz words`);
        setQuizWords(dictionaryWords);
      }
    } catch (err) {
      console.error('[WordContext] Error initializing database:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize database');
    }
  };

  const loadQuizWords = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // First ensure database is initialized
      await initializeDatabase();

      // Then load words
      const db = await getDatabase();
      const tx = db.transaction('quizWords', 'readonly');
      const store = tx.objectStore('quizWords');
      const wordsData = await store.getAll();
      
      setQuizWords(wordsData);
      console.log(`[WordContext] Successfully loaded ${wordsData.length} quiz words`);
    } catch (err) {
      console.error('[WordContext] Error loading quiz words:', err);
      setError(err instanceof Error ? err.message : 'Failed to load quiz words');
      setQuizWords([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuizWords();
  }, []);

  const getWordsByLevel = (level: number): DictionaryItem[] => {
    return quizWords.filter(word => word.level === level);
  };

  const getWordsByCategory = (category: string): DictionaryItem[] => {
    return quizWords.filter(word => word.category === category);
  };

  const getWordsByJLPT = (level: string): DictionaryItem[] => {
    return quizWords.filter(word => word.jlptLevel === level);
  };

  const addQuizWord = async (wordData: Omit<DictionaryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const db = await getDatabase();
      const tx = db.transaction('quizWords', 'readwrite');
      const store = tx.objectStore('quizWords');

      const newWord: DictionaryItem = {
        ...wordData,
        id: `quiz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await store.add(newWord);
      setQuizWords(prev => [...prev, newWord]);
    } catch (err) {
      console.error('[WordContext] Error adding quiz word:', err);
      throw err;
    }
  };

  const updateQuizWord = async (word: DictionaryItem) => {
    try {
      const db = await getDatabase();
      const tx = db.transaction('quizWords', 'readwrite');
      const store = tx.objectStore('quizWords');

      const updatedWord = {
        ...word,
        updatedAt: new Date()
      };

      await store.put(updatedWord);
      setQuizWords(prev => prev.map(w => w.id === word.id ? updatedWord : w));
    } catch (err) {
      console.error('[WordContext] Error updating quiz word:', err);
      throw err;
    }
  };

  const deleteQuizWord = async (id: string) => {
    try {
      const db = await getDatabase();
      const tx = db.transaction('quizWords', 'readwrite');
      const store = tx.objectStore('quizWords');

      await store.delete(id);
      setQuizWords(prev => prev.filter(w => w.id !== id));
    } catch (err) {
      console.error('[WordContext] Error deleting quiz word:', err);
      throw err;
    }
  };

  const value = {
    quizWords,
    isLoading,
    error,
    refreshQuizWords: loadQuizWords,
    addQuizWord,
    updateQuizWord,
    deleteQuizWord,
    getWordsByLevel,
    getWordsByCategory,
    getWordsByJLPT
  };

  return (
    <WordContext.Provider value={value}>
      {children}
    </WordContext.Provider>
  );
}; 