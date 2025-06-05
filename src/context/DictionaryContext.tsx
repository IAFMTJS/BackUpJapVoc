import React, { createContext, useContext, useState, useEffect } from 'react';
import { DictionaryItem } from '../types/dictionary';
import { databasePromise, getDatabase, StoreName } from '../utils/databaseConfig';
import { quizWords } from '../data/quizData';

interface DictionaryContextType {
  words: DictionaryItem[];
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const preloadData = async () => {
      try {
        console.log('[Debug] Starting dictionary data preload...');
        const db = await databasePromise;
        const tx = db.transaction('words', 'readonly');
        const store = tx.objectStore('words');
        const count = await store.count();
        console.log('[Debug] Current word count in database:', count);

        if (count === 0) {
          console.log('[Debug] Database empty, loading from JSON...');
          const response = await fetch('/data/dictionary_words.json');
          if (!response.ok) {
            throw new Error('Failed to load dictionary words');
          }
          const jsonWords = await response.json();
          console.log('[Debug] Loaded words from JSON:', jsonWords.length);
          
          const initTx = db.transaction('words', 'readwrite');
          const initStore = initTx.objectStore('words');
          
          const dictionaryWords = jsonWords.map((word: any, index: number) => ({
            id: word.id || `word-${index + 1}`,
            japanese: word.japanese,
            english: word.english,
            romaji: word.romaji,
            type: 'word',
            level: word.level || 1,
            category: word.category || 'noun',
            jlptLevel: word.jlptLevel || 'N5',
            frequency: word.frequency || 1,
            mastery: 0,
            readings: [word.japanese],
            meanings: [word.english],
            examples: word.examples || [],
            etymology: null,
            kanji: word.kanji || [],
            radicals: [],
            tags: [],
            notes: word.notes || '',
            lastViewed: null,
            emotionalContext: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            isHiragana: word.isHiragana || false,
            isKatakana: word.isKatakana || false,
            audioUrl: word.audioUrl || null
          }));

          console.log('[Debug] First few words to be added:', dictionaryWords.slice(0, 3));
          
          for (const word of dictionaryWords) {
            await initStore.add(word);
          }
          
          setWords(dictionaryWords);
          console.log(`[DictionaryContext] Preloaded ${dictionaryWords.length} words`);
        } else {
          console.log('[Debug] Loading existing words from database...');
          const wordsData = await store.getAll();
          console.log('[Debug] First few words loaded:', wordsData.slice(0, 3));
          setWords(wordsData);
          console.log(`[DictionaryContext] Loaded ${wordsData.length} existing words`);
        }
        
        setIsInitialized(true);
        console.log('[Debug] Dictionary initialization complete');
      } catch (err) {
        console.error('[DictionaryContext] Error preloading data:', err);
        setError(err instanceof Error ? err.message : 'Failed to preload dictionary data');
      }
    };

    preloadData();
  }, []);

  const searchWords = (query: string): DictionaryItem[] => {
    if (!isInitialized) return [];
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
      const db = await getDatabase();
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
      const db = await getDatabase();
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
      const db = await getDatabase();
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
    isInitialized,
    searchWords,
    getWordsByLevel,
    getWordsByCategory,
    getWordsByJLPT,
    refreshWords: () => Promise.resolve(),
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