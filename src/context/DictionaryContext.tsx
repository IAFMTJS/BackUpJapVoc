import React, { createContext, useContext, useState, useEffect } from 'react';
import { DictionaryItem } from '../types/dictionary';
import { openDB } from 'idb';
import { quizWords } from '../data/quizData';

// Database configuration
const DB_CONFIG = {
  name: 'japanese-dictionary',
  version: 1,
  stores: {
    words: { keyPath: 'id' }
  }
};

interface DictionaryContextType {
  words: DictionaryItem[];
  isLoading: boolean;
  error: string | null;
  searchWords: (query: string) => DictionaryItem[];
  getWordsByLevel: (level: number) => DictionaryItem[];
  getWordsByCategory: (category: string) => DictionaryItem[];
  getWordsByJLPT: (level: string) => DictionaryItem[];
  refreshWords: () => Promise<void>;
  addWord: (word: Omit<DictionaryItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateWord: (word: DictionaryItem) => Promise<void>;
  deleteWord: (id: string) => Promise<void>;
}

const DictionaryContext = createContext<DictionaryContextType | undefined>(undefined);

export const useDictionary = () => {
  const context = useContext(DictionaryContext);
  if (!context) {
    throw new Error('useDictionary must be used within a DictionaryProvider');
  }
  return context;
};

export const DictionaryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [words, setWords] = useState<DictionaryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initializeDatabase = async () => {
    try {
      const db = await openDB(DB_CONFIG.name, DB_CONFIG.version, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('words')) {
            const store = db.createObjectStore('words', { keyPath: 'id' });
            store.createIndex('by-level', 'level');
            store.createIndex('by-category', 'category');
            store.createIndex('by-jlpt', 'jlptLevel');
          }
        }
      });

      // Check if we need to initialize the database
      const tx = db.transaction('words', 'readonly');
      const store = tx.objectStore('words');
      const count = await store.count();

      if (count === 0) {
        // Initialize with quiz words
        const initTx = db.transaction('words', 'readwrite');
        const initStore = initTx.objectStore('words');

        // Convert quiz words to dictionary items
        const dictionaryWords = quizWords.map((word, index) => ({
          id: `word-${index + 1}`,
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

        console.log(`[DictionaryContext] Initialized database with ${dictionaryWords.length} words`);
        setWords(dictionaryWords);
      }
    } catch (err) {
      console.error('[DictionaryContext] Error initializing database:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize database');
    }
  };

  const loadWords = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // First ensure database is initialized
      await initializeDatabase();

      // Then load words
      const db = await openDB(DB_CONFIG.name, DB_CONFIG.version);
      const tx = db.transaction('words', 'readonly');
      const store = tx.objectStore('words');
      const wordsData = await store.getAll();
      
      setWords(wordsData);
      console.log(`[DictionaryContext] Successfully loaded ${wordsData.length} words`);
    } catch (err) {
      console.error('[DictionaryContext] Error loading words:', err);
      setError(err instanceof Error ? err.message : 'Failed to load words');
      setWords([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWords();
  }, []);

  const searchWords = (query: string): DictionaryItem[] => {
    const searchTerm = query.toLowerCase();
    return words.filter(word => 
      word.japanese.toLowerCase().includes(searchTerm) ||
      word.english.toLowerCase().includes(searchTerm) ||
      word.romaji.toLowerCase().includes(searchTerm)
    );
  };

  const getWordsByLevel = (level: number): DictionaryItem[] => {
    return words.filter(word => word.level === level);
  };

  const getWordsByCategory = (category: string): DictionaryItem[] => {
    return words.filter(word => word.category === category);
  };

  const getWordsByJLPT = (level: string): DictionaryItem[] => {
    return words.filter(word => word.jlptLevel === level);
  };

  const addWord = async (wordData: Omit<DictionaryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const db = await openDB(DB_CONFIG.name, DB_CONFIG.version);
      const tx = db.transaction('words', 'readwrite');
      const store = tx.objectStore('words');

      const newWord: DictionaryItem = {
        ...wordData,
        id: `word-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await store.add(newWord);
      setWords(prev => [...prev, newWord]);
    } catch (err) {
      console.error('[DictionaryContext] Error adding word:', err);
      throw err;
    }
  };

  const updateWord = async (word: DictionaryItem) => {
    try {
      const db = await openDB(DB_CONFIG.name, DB_CONFIG.version);
      const tx = db.transaction('words', 'readwrite');
      const store = tx.objectStore('words');

      const updatedWord = {
        ...word,
        updatedAt: new Date()
      };

      await store.put(updatedWord);
      setWords(prev => prev.map(w => w.id === word.id ? updatedWord : w));
    } catch (err) {
      console.error('[DictionaryContext] Error updating word:', err);
      throw err;
    }
  };

  const deleteWord = async (id: string) => {
    try {
      const db = await openDB(DB_CONFIG.name, DB_CONFIG.version);
      const tx = db.transaction('words', 'readwrite');
      const store = tx.objectStore('words');

      await store.delete(id);
      setWords(prev => prev.filter(w => w.id !== id));
    } catch (err) {
      console.error('[DictionaryContext] Error deleting word:', err);
      throw err;
    }
  };

  const value = {
    words,
    isLoading,
    error,
    searchWords,
    getWordsByLevel,
    getWordsByCategory,
    getWordsByJLPT,
    refreshWords: loadWords,
    addWord,
    updateWord,
    deleteWord
  };

  return (
    <DictionaryContext.Provider value={value}>
      {children}
    </DictionaryContext.Provider>
  );
}; 