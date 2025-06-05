import { SimpleDictionaryItem } from '../types/dictionary';

let dictionaryCache: SimpleDictionaryItem[] | null = null;
let dictionaryLoadPromise: Promise<SimpleDictionaryItem[]> | null = null;

export async function loadDictionaryWords(): Promise<SimpleDictionaryItem[]> {
  // Return cached data if available
  if (dictionaryCache) {
    return dictionaryCache;
  }

  // If there's an ongoing load, return that promise
  if (dictionaryLoadPromise) {
    return dictionaryLoadPromise;
  }

  // Start a new load
  dictionaryLoadPromise = (async () => {
    try {
      const response = await fetch('/data/dictionary_words.json');
      if (!response.ok) {
        throw new Error('Failed to load dictionary words');
      }
      const words = await response.json();
      dictionaryCache = words;
      return words;
    } catch (error) {
      console.error('Error loading dictionary words:', error);
      throw error;
    } finally {
      dictionaryLoadPromise = null;
    }
  })();

  return dictionaryLoadPromise;
}

export function getDictionaryPage(
  words: SimpleDictionaryItem[],
  page: number,
  limit: number,
  search?: string,
  category?: string,
  level?: string
): {
  words: SimpleDictionaryItem[];
  total: number;
  hasMore: boolean;
} {
  // Apply filters
  let filteredWords = words;
  if (search) {
    const searchLower = search.toLowerCase();
    filteredWords = filteredWords.filter(word => 
      word.japanese.toLowerCase().includes(searchLower) ||
      word.english.toLowerCase().includes(searchLower) ||
      word.romaji.toLowerCase().includes(searchLower)
    );
  }
  if (category && category !== 'all') {
    filteredWords = filteredWords.filter(word => word.category === category);
  }
  if (level && level !== 'all') {
    filteredWords = filteredWords.filter(word => word.level.toString() === level);
  }

  // Calculate pagination
  const total = filteredWords.length;
  const start = (page - 1) * limit;
  const end = start + limit;
  const pageWords = filteredWords.slice(start, end);
  const hasMore = end < total;

  return {
    words: pageWords,
    total,
    hasMore
  };
} 