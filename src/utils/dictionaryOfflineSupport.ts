import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { DictionaryItem, WordRelationship, WordEtymology, WordFrequency } from '../types/dictionary';

// Define the database schema
interface DictionaryDB extends DBSchema {
  words: {
    key: string;
    value: DictionaryItem;
    indexes: {
      'by-japanese': string;
      'by-english': string;
      'by-romaji': string;
      'by-level': number;
      'by-category': string;
      'by-jlpt': string;
      'by-frequency': number;
      'by-mastery': number;
      'by-last-viewed': Date;
    };
  };
  wordRelationships: {
    key: string;
    value: {
      wordId: string;
      relationships: WordRelationship[];
      timestamp: Date;
    };
    indexes: {
      'by-word': string;
      'by-type': string;
      'by-strength': number;
    };
  };
  wordEtymology: {
    key: string;
    value: {
      wordId: string;
      etymology: WordEtymology;
      timestamp: Date;
    };
    indexes: {
      'by-word': string;
      'by-origin': string;
    };
  };
  wordFrequency: {
    key: string;
    value: {
      wordId: string;
      frequency: WordFrequency;
      timestamp: Date;
    };
    indexes: {
      'by-word': string;
      'by-rank': number;
    };
  };
  searchHistory: {
    key: string;
    value: {
      query: string;
      timestamp: Date;
      results: string[];
    };
    indexes: {
      'by-query': string;
      'by-timestamp': Date;
    };
  };
  wordCloud: {
    key: string;
    value: {
      category: string;
      words: Array<{
        word: string;
        weight: number;
        relationships: number;
      }>;
      timestamp: Date;
    };
    indexes: {
      'by-category': string;
      'by-timestamp': Date;
    };
  };
  learningPaths: {
    key: string;
    value: {
      id: string;
      name: string;
      description: string;
      words: string[];
      prerequisites: string[];
      difficulty: number;
      progress: number;
      lastUpdated: Date;
    };
    indexes: {
      'by-difficulty': number;
      'by-progress': number;
      'by-last-updated': Date;
    };
  };
}

// Database configuration
const DB_CONFIG = {
  name: 'DictionaryDB',
  version: 1,
  stores: {
    words: {
      keyPath: 'id',
      indexes: {
        'by-japanese': { keyPath: 'japanese' },
        'by-english': { keyPath: 'english' },
        'by-romaji': { keyPath: 'romaji' },
        'by-level': { keyPath: 'level' },
        'by-category': { keyPath: 'category' },
        'by-jlpt': { keyPath: 'jlptLevel' },
        'by-frequency': { keyPath: 'frequency.rank' },
        'by-mastery': { keyPath: 'mastery.level' },
        'by-last-viewed': { keyPath: 'lastViewed' }
      }
    },
    wordRelationships: {
      keyPath: 'id',
      indexes: {
        'by-word': { keyPath: 'wordId' },
        'by-type': { keyPath: 'relationships.type' },
        'by-strength': { keyPath: 'relationships.strength' }
      }
    },
    wordEtymology: {
      keyPath: 'id',
      indexes: {
        'by-word': { keyPath: 'wordId' },
        'by-origin': { keyPath: 'etymology.origin' }
      }
    },
    wordFrequency: {
      keyPath: 'id',
      indexes: {
        'by-word': { keyPath: 'wordId' },
        'by-rank': { keyPath: 'frequency.rank' }
      }
    },
    searchHistory: {
      keyPath: 'id',
      indexes: {
        'by-query': { keyPath: 'query' },
        'by-timestamp': { keyPath: 'timestamp' }
      }
    },
    wordCloud: {
      keyPath: 'id',
      indexes: {
        'by-category': { keyPath: 'category' },
        'by-timestamp': { keyPath: 'timestamp' }
      }
    },
    learningPaths: {
      keyPath: 'id',
      indexes: {
        'by-difficulty': { keyPath: 'difficulty' },
        'by-progress': { keyPath: 'progress' },
        'by-last-updated': { keyPath: 'lastUpdated' }
      }
    }
  }
};

// Initialize the database
let db: IDBPDatabase<DictionaryDB> | null = null;

export const initDictionaryDB = async (): Promise<void> => {
  try {
    db = await openDB<DictionaryDB>(DB_CONFIG.name, DB_CONFIG.version, {
      upgrade(database) {
        // Create object stores
        for (const [storeName, storeConfig] of Object.entries(DB_CONFIG.stores)) {
          if (!database.objectStoreNames.contains(storeName)) {
            const store = database.createObjectStore(storeName, {
              keyPath: storeConfig.keyPath
            });

            // Create indexes
            for (const [indexName, indexConfig] of Object.entries(storeConfig.indexes)) {
              store.createIndex(indexName, indexConfig.keyPath);
            }
          }
        }
      }
    });
    console.log('Dictionary database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize dictionary database:', error);
    throw error;
  }
};

// Word management
export const saveWord = async (word: DictionaryItem): Promise<void> => {
  if (!db) throw new Error('Database not initialized');

  try {
    await db.put('words', word);
  } catch (error) {
    console.error('Failed to save word:', error);
    throw error;
  }
};

export const getWord = async (id: string): Promise<DictionaryItem | undefined> => {
  if (!db) throw new Error('Database not initialized');

  try {
    return await db.get('words', id);
  } catch (error) {
    console.error('Failed to get word:', error);
    throw error;
  }
};

// Advanced search functionality
export const searchWords = async (
  query: string,
  options: {
    searchFields?: ('japanese' | 'english' | 'romaji')[];
    filters?: {
      level?: number;
      category?: string;
      jlptLevel?: string;
      minMastery?: number;
      maxMastery?: number;
    };
    sortBy?: 'frequency' | 'mastery' | 'lastViewed';
    limit?: number;
  } = {}
): Promise<DictionaryItem[]> => {
  if (!db) throw new Error('Database not initialized');

  try {
    const {
      searchFields = ['japanese', 'english', 'romaji'],
      filters = {},
      sortBy = 'frequency',
      limit = 50
    } = options;

    // Save search to history
    await db.add('searchHistory', {
      id: `${Date.now()}-${query}`,
      query,
      timestamp: new Date(),
      results: []
    });

    // Build search query
    const searchTerms = query.toLowerCase().split(/\s+/);
    let results: DictionaryItem[] = [];

    // Search in specified fields
    for (const field of searchFields) {
      const index = db.transaction('words').store.index(`by-${field}`);
      const words = await index.getAll();
      
      const matches = words.filter(word => {
        const value = word[field]?.toLowerCase() || '';
        return searchTerms.every(term => value.includes(term));
      });

      results = [...results, ...matches];
    }

    // Apply filters
    if (filters.level) {
      results = results.filter(word => word.level === filters.level);
    }
    if (filters.category) {
      results = results.filter(word => word.category === filters.category);
    }
    if (filters.jlptLevel) {
      results = results.filter(word => word.jlptLevel === filters.jlptLevel);
    }
    if (filters.minMastery !== undefined) {
      results = results.filter(word => word.mastery.level >= filters.minMastery!);
    }
    if (filters.maxMastery !== undefined) {
      results = results.filter(word => word.mastery.level <= filters.maxMastery!);
    }

    // Remove duplicates
    results = Array.from(new Map(results.map(word => [word.id, word])).values());

    // Sort results
    switch (sortBy) {
      case 'frequency':
        results.sort((a, b) => (a.frequency?.rank || 0) - (b.frequency?.rank || 0));
        break;
      case 'mastery':
        results.sort((a, b) => (b.mastery?.level || 0) - (a.mastery?.level || 0));
        break;
      case 'lastViewed':
        results.sort((a, b) => (b.lastViewed?.getTime() || 0) - (a.lastViewed?.getTime() || 0));
        break;
    }

    return results.slice(0, limit);
  } catch (error) {
    console.error('Failed to search words:', error);
    throw error;
  }
};

// Word relationships management
export const saveWordRelationships = async (
  wordId: string,
  relationships: WordRelationship[]
): Promise<void> => {
  if (!db) throw new Error('Database not initialized');

  try {
    await db.put('wordRelationships', {
      id: `${wordId}-${Date.now()}`,
      wordId,
      relationships,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Failed to save word relationships:', error);
    throw error;
  }
};

export const getWordRelationships = async (wordId: string): Promise<WordRelationship[]> => {
  if (!db) throw new Error('Database not initialized');

  try {
    const index = db.transaction('wordRelationships').store.index('by-word');
    const data = await index.getAll(wordId);
    return data.flatMap(item => item.relationships);
  } catch (error) {
    console.error('Failed to get word relationships:', error);
    throw error;
  }
};

// Word cloud management
export const generateWordCloud = async (category: string): Promise<Array<{
  word: string;
  weight: number;
  relationships: number;
}>> => {
  if (!db) throw new Error('Database not initialized');

  try {
    // Get all words in the category
    const index = db.transaction('words').store.index('by-category');
    const words = await index.getAll(category);

    // Calculate weights based on frequency and relationships
    const wordCloud = await Promise.all(words.map(async word => {
      const relationships = await getWordRelationships(word.id);
      const weight = (word.frequency?.rank || 0) * 0.7 + relationships.length * 0.3;

      return {
        word: word.japanese,
        weight,
        relationships: relationships.length
      };
    }));

    // Save word cloud
    await db.put('wordCloud', {
      id: `${category}-${Date.now()}`,
      category,
      words: wordCloud,
      timestamp: new Date()
    });

    return wordCloud;
  } catch (error) {
    console.error('Failed to generate word cloud:', error);
    throw error;
  }
};

// Learning path management
export const createLearningPath = async (
  name: string,
  description: string,
  words: string[],
  prerequisites: string[] = [],
  difficulty: number = 1
): Promise<string> => {
  if (!db) throw new Error('Database not initialized');

  try {
    const id = `${Date.now()}-${name}`;
    await db.add('learningPaths', {
      id,
      name,
      description,
      words,
      prerequisites,
      difficulty,
      progress: 0,
      lastUpdated: new Date()
    });
    return id;
  } catch (error) {
    console.error('Failed to create learning path:', error);
    throw error;
  }
};

export const updateLearningPathProgress = async (
  pathId: string,
  progress: number
): Promise<void> => {
  if (!db) throw new Error('Database not initialized');

  try {
    const path = await db.get('learningPaths', pathId);
    if (path) {
      path.progress = progress;
      path.lastUpdated = new Date();
      await db.put('learningPaths', path);
    }
  } catch (error) {
    console.error('Failed to update learning path progress:', error);
    throw error;
  }
};

export const getLearningPaths = async (
  options: {
    minDifficulty?: number;
    maxDifficulty?: number;
    minProgress?: number;
    maxProgress?: number;
  } = {}
): Promise<Array<{
  id: string;
  name: string;
  description: string;
  words: string[];
  prerequisites: string[];
  difficulty: number;
  progress: number;
  lastUpdated: Date;
}>> => {
  if (!db) throw new Error('Database not initialized');

  try {
    const {
      minDifficulty,
      maxDifficulty,
      minProgress,
      maxProgress
    } = options;

    let paths = await db.getAll('learningPaths');

    if (minDifficulty !== undefined) {
      paths = paths.filter(path => path.difficulty >= minDifficulty);
    }
    if (maxDifficulty !== undefined) {
      paths = paths.filter(path => path.difficulty <= maxDifficulty);
    }
    if (minProgress !== undefined) {
      paths = paths.filter(path => path.progress >= minProgress);
    }
    if (maxProgress !== undefined) {
      paths = paths.filter(path => path.progress <= maxProgress);
    }

    return paths;
  } catch (error) {
    console.error('Failed to get learning paths:', error);
    throw error;
  }
};

// Export database instance for direct access if needed
export const getDictionaryDB = (): IDBPDatabase<DictionaryDB> => {
  if (!db) throw new Error('Database not initialized');
  return db;
}; 