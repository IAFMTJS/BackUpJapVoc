import React, { createContext, useContext, useState, useEffect } from 'react';
import { Kanji } from '../types/kanji';
import { databasePromise, getDatabase, StoreName } from '../utils/databaseConfig';
import { kanjiList } from '../data/kanjiData';

interface KanjiDictionaryContextType {
  kanji: Kanji[];
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  searchKanji: (query: string) => Kanji[];
  getKanjiByLevel: (level: number) => Kanji[];
  getKanjiByCategory: (category: string) => Kanji[];
  getKanjiByJLPT: (level: string) => Kanji[];
  refreshKanji: () => Promise<void>;
  addKanji: (kanji: Omit<Kanji, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateKanji: (kanji: Kanji) => Promise<void>;
  deleteKanji: (id: string) => Promise<void>;
}

const KanjiDictionaryContext = createContext<KanjiDictionaryContextType | undefined>(undefined);

export const useKanjiDictionary = () => {
  const context = useContext(KanjiDictionaryContext);
  if (!context) {
    throw new Error('useKanjiDictionary must be used within a KanjiDictionaryProvider');
  }
  return context;
};

export const KanjiDictionaryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [kanji, setKanji] = useState<Kanji[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const preloadData = async () => {
      try {
        console.log('[Debug] Starting kanji dictionary data preload...');
        const db = await databasePromise;
        
        // Use a single transaction for both checking and writing
        const tx = db.transaction('kanji', 'readwrite');
        const store = tx.objectStore('kanji');
        
        // Check if we already have data
        const count = await store.count();
        console.log('[Debug] Current kanji count in database:', count);

        if (count === 0) {
          console.log('[Debug] Database empty, loading from kanjiList...');
          
          const dictionaryKanji = kanjiList.map((kanji, index) => ({
            id: `kanji-${kanji.character}`,
            character: kanji.character,
            meanings: [kanji.english],
            readings: {
              on: kanji.onyomi,
              kun: kanji.kunyomi
            },
            examples: kanji.examples,
            jlpt: parseInt(kanji.jlptLevel?.replace('N', '') || '5'),
            difficulty: kanji.difficulty,
            category: kanji.category,
            hint: kanji.hint,
            strokeCount: kanji.strokeCount,
            radicals: kanji.radicals,
            createdAt: new Date(),
            updatedAt: new Date()
          }));

          console.log('[Debug] First few kanji to be added:', dictionaryKanji.slice(0, 3));
          
          // Use Promise.all to add all kanji in parallel
          await Promise.all(dictionaryKanji.map(kanji => store.put(kanji)));
          
          setKanji(dictionaryKanji);
          console.log(`[KanjiDictionaryContext] Preloaded ${dictionaryKanji.length} kanji`);
        } else {
          console.log('[Debug] Loading existing kanji from database...');
          const kanjiData = await store.getAll();
          console.log('[Debug] First few kanji loaded:', kanjiData.slice(0, 3));
          setKanji(kanjiData);
          console.log(`[KanjiDictionaryContext] Loaded ${kanjiData.length} existing kanji`);
        }
        
        setIsInitialized(true);
        console.log('[Debug] Kanji dictionary initialization complete');
      } catch (err) {
        console.error('[KanjiDictionaryContext] Error preloading data:', err);
        setError(err instanceof Error ? err.message : 'Failed to preload kanji dictionary data');
        // Even if there's an error, we should set initialized to true to prevent infinite loading
        setIsInitialized(true);
      }
    };

    preloadData();
  }, []);

  const searchKanji = (query: string): Kanji[] => {
    if (!isInitialized) return [];
    const searchTerm = query.toLowerCase();
    return kanji.filter(k => 
      k.character.includes(searchTerm) ||
      k.meanings.some(m => m.toLowerCase().includes(searchTerm)) ||
      k.readings.on.some(r => r.toLowerCase().includes(searchTerm)) ||
      k.readings.kun.some(r => r.toLowerCase().includes(searchTerm))
    );
  };

  const getKanjiByLevel = (level: number): Kanji[] => {
    return kanji.filter(k => k.jlpt === level);
  };

  const getKanjiByCategory = (category: string): Kanji[] => {
    return kanji.filter(k => k.category === category);
  };

  const getKanjiByJLPT = (level: string): Kanji[] => {
    return kanji.filter(k => k.jlpt?.toString() === level.replace('N', ''));
  };

  const addKanji = async (kanjiData: Omit<Kanji, 'id' | 'createdAt' | 'updatedAt'>) => {
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
      console.error('[KanjiDictionaryContext] Error adding kanji:', err);
      throw err;
    }
  };

  const updateKanji = async (kanji: Kanji) => {
    try {
      const db = await getDatabase();
      const tx = db.transaction('kanji', 'readwrite');
      const store = tx.objectStore('kanji');

      const updatedKanji = {
        ...kanji,
        updatedAt: new Date()
      };

      await store.put(updatedKanji);
      setKanji(prev => prev.map(k => k.id === kanji.id ? updatedKanji : k));
    } catch (err) {
      console.error('[KanjiDictionaryContext] Error updating kanji:', err);
      throw err;
    }
  };

  const deleteKanji = async (id: string) => {
    try {
      const db = await getDatabase();
      const tx = db.transaction('kanji', 'readwrite');
      const store = tx.objectStore('kanji');

      await store.delete(id);
      setKanji(prev => prev.filter(k => k.id !== id));
    } catch (err) {
      console.error('[KanjiDictionaryContext] Error deleting kanji:', err);
      throw err;
    }
  };

  const value = {
    kanji,
    isLoading,
    error,
    isInitialized,
    searchKanji,
    getKanjiByLevel,
    getKanjiByCategory,
    getKanjiByJLPT,
    refreshKanji: () => Promise.resolve(),
    addKanji,
    updateKanji,
    deleteKanji
  };

  return (
    <KanjiDictionaryContext.Provider value={value}>
      {children}
    </KanjiDictionaryContext.Provider>
  );
}; 