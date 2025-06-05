import { SimpleDictionaryItem } from '../types/dictionary';

let dictionaryCache: SimpleDictionaryItem[] | null = null;
let dictionaryLoadPromise: Promise<SimpleDictionaryItem[]> | null = null;
const CACHE_TIMEOUT = 5 * 60 * 1000; // 5 minutes
let lastCacheTime = 0;

// Split the dictionary into chunks for more efficient loading
const CHUNK_SIZE = 1000;
let dictionaryChunks: SimpleDictionaryItem[][] = [];

async function loadDictionaryChunk(chunkIndex: number): Promise<SimpleDictionaryItem[]> {
  try {
    const response = await fetch(`/data/dictionary_words.json?chunk=${chunkIndex}&size=${CHUNK_SIZE}`);
    if (!response.ok) {
      throw new Error('Failed to load dictionary chunk');
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading dictionary chunk ${chunkIndex}:`, error);
    throw error;
  }
}

async function loadDictionary(): Promise<SimpleDictionaryItem[]> {
  const now = Date.now();
  
  // Return cached data if it's still valid
  if (dictionaryCache && (now - lastCacheTime) < CACHE_TIMEOUT) {
    return dictionaryCache;
  }

  // If there's an ongoing load, return that promise
  if (dictionaryLoadPromise) {
    return dictionaryLoadPromise;
  }

  // Start a new load
  dictionaryLoadPromise = (async () => {
    try {
      // First, try to get the total count
      const countResponse = await fetch('/data/dictionary_words.json?count=true');
      if (!countResponse.ok) {
        throw new Error('Failed to get dictionary count');
      }
      const { total } = await countResponse.json();
      
      // Calculate number of chunks needed
      const numChunks = Math.ceil(total / CHUNK_SIZE);
      
      // Load chunks in parallel with a concurrency limit
      const concurrencyLimit = 3;
      const chunks: SimpleDictionaryItem[][] = [];
      
      for (let i = 0; i < numChunks; i += concurrencyLimit) {
        const chunkPromises = Array.from(
          { length: Math.min(concurrencyLimit, numChunks - i) },
          (_, j) => loadDictionaryChunk(i + j)
        );
        const loadedChunks = await Promise.all(chunkPromises);
        chunks.push(...loadedChunks);
      }

      // Combine all chunks
      const allWords = chunks.flat();
      dictionaryCache = allWords;
      dictionaryChunks = chunks;
      lastCacheTime = now;
      return allWords;
    } catch (error) {
      console.error('Error loading dictionary:', error);
      throw error;
    } finally {
      dictionaryLoadPromise = null;
    }
  })();

  return dictionaryLoadPromise;
}

export async function getDictionaryPage(
  page: number,
  limit: number,
  search?: string,
  category?: string,
  level?: string
): Promise<{
  words: SimpleDictionaryItem[];
  total: number;
  hasMore: boolean;
}> {
  try {
    // Start loading the dictionary immediately
    const dictionaryPromise = loadDictionary();
    
    // If this is the first page and no filters, return a minimal set immediately
    if (page === 1 && !search && (!category || category === 'all') && (!level || level === 'all')) {
      // Try to use the first chunk if available
      if (dictionaryChunks.length > 0) {
        return {
          words: dictionaryChunks[0].slice(0, limit),
          total: dictionaryCache?.length || 0,
          hasMore: (dictionaryCache?.length || 0) > limit
        };
      }
      
      // Otherwise wait for the full load
      const allWords = await dictionaryPromise;
      return {
        words: allWords.slice(0, limit),
        total: allWords.length,
        hasMore: allWords.length > limit
      };
    }

    // For filtered or subsequent pages, wait for full load
    const allWords = await dictionaryPromise;
    
    // Apply filters
    let filteredWords = allWords;
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
    const words = filteredWords.slice(start, end);
    const hasMore = end < total;

    return {
      words,
      total,
      hasMore
    };
  } catch (error) {
    console.error('Error getting dictionary page:', error);
    throw error;
  }
}

// API route handler
export async function handleDictionaryRequest(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const search = url.searchParams.get('search') || '';
    const category = url.searchParams.get('category') || 'all';
    const level = url.searchParams.get('level') || 'all';
    const countOnly = url.searchParams.get('count') === 'true';
    const chunk = parseInt(url.searchParams.get('chunk') || '0');
    const size = parseInt(url.searchParams.get('size') || CHUNK_SIZE.toString());

    if (countOnly) {
      const allWords = await loadDictionary();
      return new Response(JSON.stringify({ total: allWords.length }), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600'
        }
      });
    }

    if (chunk >= 0) {
      const allWords = await loadDictionary();
      const start = chunk * size;
      const end = start + size;
      const chunkWords = allWords.slice(start, end);
      return new Response(JSON.stringify(chunkWords), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600'
        }
      });
    }

    const result = await getDictionaryPage(page, limit, search, category, level);
    
    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    console.error('Error handling dictionary request:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to load dictionary',
        message: error.message || 'An unexpected error occurred'
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 