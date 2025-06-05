import { openDB } from 'idb';
import { DictionaryItem, WordRelationship, WordEtymology, WordFrequency } from '../types/dictionary';

interface ProcessedWord {
  kana: string;
  kanji: string;
  english: string;
  romaji: string;
  category: string;
  sheet: string;
  level: number;
  jlptLevel: string;
}

// Add this at the top of the file after imports
const audioMap = new Map<string, string>();

// Add this function to load the audio map
async function loadAudioMap() {
  try {
    const response = await fetch('/audio/audio_map.txt');
    const text = await response.text();
    const lines = text.split('\n');
    
    for (const line of lines) {
      const [word, hash] = line.split(' => ');
      if (word && hash) {
        audioMap.set(word.trim(), hash.trim());
      }
    }
    
    console.log(`[Dictionary] Loaded ${audioMap.size} audio mappings`);
  } catch (error) {
    console.error('[Dictionary] Failed to load audio map:', error);
  }
}

// Function to generate SHA-1 hash
async function sha1(str: string): Promise<string> {
  const buffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-1', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Convert processed word to dictionary item
async function convertToDictionaryItem(word: ProcessedWord, id: string): Promise<DictionaryItem> {
  const japanese = word.kanji && word.kanji.trim() !== '' ? word.kanji : word.kana;
  
  // Get audio hash from the map
  const audioHash = audioMap.get(japanese);
  
  return {
    id,
    japanese,
    english: word.english,
    romaji: word.romaji,
    level: word.level,
    category: word.category,
    jlptLevel: word.jlptLevel,
    examples: [], // Processed words don't have examples
    notes: '', // Processed words don't have notes
    isHiragana: /^[\u3040-\u309F]+$/.test(word.kana),
    isKatakana: /^[\u30A0-\u30FF]+$/.test(word.kana),
    audioUrl: audioHash ? `/audio/${audioHash}` : undefined,
    learningStatus: {
      isLearned: false,
      lastReviewed: new Date(),
      reviewCount: 0,
      correctAttempts: 0,
      incorrectAttempts: 0,
      masteryLevel: 0
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

// Generate relationships between words based on categories and levels
function generateWordRelationships(words: DictionaryItem[]): WordRelationship[] {
  const relationships: WordRelationship[] = [];
  const categoryGroups = new Map<string, DictionaryItem[]>();
  const levelGroups = new Map<number, DictionaryItem[]>();

  // Group words by category and level
  words.forEach(word => {
    if (!categoryGroups.has(word.category)) {
      categoryGroups.set(word.category, []);
    }
    categoryGroups.get(word.category)?.push(word);

    if (!levelGroups.has(word.level)) {
      levelGroups.set(word.level, []);
    }
    levelGroups.get(word.level)?.push(word);
  });

  // Create relationships
  words.forEach(word => {
    const relatedWords: { word: string; type: string; strength: number }[] = [];

    // Add category-based relationships
    const categoryWords = categoryGroups.get(word.category) || [];
    const categoryRelated = categoryWords
      .filter(w => w.id !== word.id)
      .slice(0, 3)
      .map(w => ({
        word: w.japanese,
        type: 'Same Category',
        strength: 0.8
      }));
    relatedWords.push(...categoryRelated);

    // Add level-based relationships
    const levelWords = levelGroups.get(word.level) || [];
    const levelRelated = levelWords
      .filter(w => w.id !== word.id && !categoryRelated.some(r => r.word === w.japanese))
      .slice(0, 2)
      .map(w => ({
        word: w.japanese,
        type: 'Same Level',
        strength: 0.6
      }));
    relatedWords.push(...levelRelated);

    if (relatedWords.length > 0) {
      relationships.push({
        id: `rel-${word.id}`,
        wordId: word.id,
        relationships: relatedWords
      });
    }
  });

  return relationships;
}

// Generate etymology data for words
function generateEtymologyData(words: DictionaryItem[]): WordEtymology[] {
  return words.map(word => ({
    id: `etym-${word.id}`,
    wordId: word.id,
    etymology: {
      origin: word.isKatakana ? 'Loanword' : 
              word.isHiragana ? 'Native Japanese' : 
              'Sino-Japanese',
      notes: word.isKatakana ? 'Borrowed from another language' :
             word.isHiragana ? 'Original Japanese word' :
             'Word of Chinese origin'
    }
  }));
}

// Generate frequency data for words
function generateFrequencyData(words: DictionaryItem[]): WordFrequency[] {
  return words.map((word, index) => ({
    id: `freq-${word.id}`,
    wordId: word.id,
    frequency: {
      rank: index + 1,
      context: `Common ${word.category} word`,
      usage: word.level <= 3 ? 'High' : word.level <= 5 ? 'Medium' : 'Low'
    }
  }));
}

// Add database version constant
const DB_VERSION = 8; // Match version with databaseConfig.ts
const DB_NAME = 'JapVocDB'; // Match name with databaseConfig.ts

// Add batch processing helper
async function processBatch<T, R>(
  items: T[],
  processFn: (item: T) => Promise<R>,
  batchSize: number = 50,
  storeName: string = 'unknown'
): Promise<R[]> {
  const results: R[] = [];
  const totalBatches = Math.ceil(items.length / batchSize);
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    console.log(`[Dictionary] Processing ${storeName} batch ${batchNum}/${totalBatches} (${batch.length} items)`);
    
    try {
      const batchResults = await Promise.all(batch.map(processFn));
      results.push(...batchResults);
      console.log(`[Dictionary] Successfully processed ${storeName} batch ${batchNum}/${totalBatches}`);
    } catch (error) {
      console.error(`[Dictionary] Error processing ${storeName} batch ${batchNum}/${totalBatches}:`, error);
      throw error; // Re-throw to handle in the main function
    }
  }
  return results;
}

// Update the import function to handle parallel loading and batch processing
export async function importDictionaryData(db?: IDBPDatabase): Promise<{ success: boolean; count?: number; error?: string }> {
  let database: IDBPDatabase | undefined;
  
  try {
    console.log('[Dictionary] Starting dictionary data import process...');
    
    // Start loading audio map and get database in parallel
    console.log('[Dictionary] Starting parallel operations...');
    const [audioMapPromise, dbConnection] = await Promise.all([
      (async () => {
        console.log('[Dictionary] Starting audio map loading...');
        try {
          await loadAudioMap();
          console.log('[Dictionary] Audio map loaded successfully');
        } catch (error) {
          console.error('[Dictionary] Failed to load audio map:', error);
          throw error;
        }
      })(),
      (async () => {
        if (db) {
          console.log('[Dictionary] Using provided database instance');
          return db;
        }
        console.log('[Dictionary] Opening new database connection...');
        try {
          const newDb = await openDB(DB_NAME, DB_VERSION, {
            upgrade(db, oldVersion, newVersion) {
              console.log(`[Dictionary] Upgrading database from version ${oldVersion} to ${newVersion}`);
              // Create stores if they don't exist
              if (!db.objectStoreNames.contains('words')) {
                console.log('[Dictionary] Creating words store');
                db.createObjectStore('words', { keyPath: 'id' });
              }
              if (!db.objectStoreNames.contains('wordRelationships')) {
                console.log('[Dictionary] Creating wordRelationships store');
                db.createObjectStore('wordRelationships', { keyPath: 'id' });
              }
              if (!db.objectStoreNames.contains('wordEtymology')) {
                console.log('[Dictionary] Creating wordEtymology store');
                db.createObjectStore('wordEtymology', { keyPath: 'id' });
              }
              if (!db.objectStoreNames.contains('wordFrequency')) {
                console.log('[Dictionary] Creating wordFrequency store');
                db.createObjectStore('wordFrequency', { keyPath: 'id' });
              }
            },
            blocked() {
              console.warn('[Dictionary] Database upgrade blocked by another connection');
            },
            blocking() {
              console.warn('[Dictionary] Database upgrade blocking other connections');
            },
            terminated() {
              console.warn('[Dictionary] Database connection terminated');
            }
          });
          console.log('[Dictionary] Database connection established successfully');
          return newDb;
        } catch (error) {
          console.error('[Dictionary] Failed to open database:', error);
          throw error;
        }
      })()
    ]);

    database = dbConnection;

    // Wait for audio map to load
    console.log('[Dictionary] Waiting for audio map to load...');
    await audioMapPromise;
    console.log('[Dictionary] Audio map loading completed');

    // Fetch and process words
    console.log('[Dictionary] Fetching processed words...');
    const response = await fetch('/data/processed_words.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch processed words: ${response.status} ${response.statusText}`);
    }
    console.log('[Dictionary] Successfully fetched processed words JSON');
    const processedWords: ProcessedWord[] = await response.json();
    console.log(`[Dictionary] Successfully loaded ${processedWords.length} processed words`);

    // Convert words in batches
    console.log('[Dictionary] Converting words to dictionary format...');
    const dictionaryItems = await processBatch(
      processedWords,
      (word, index) => convertToDictionaryItem(word, `dict-${index + 1}`),
      50,
      'word conversion'
    );
    console.log(`[Dictionary] Successfully converted ${dictionaryItems.length} words to dictionary format`);

    // Generate data in parallel
    console.log('[Dictionary] Generating word data...');
    const [relationships, etymologyData, frequencyData] = await Promise.all([
      Promise.resolve(generateWordRelationships(dictionaryItems)),
      Promise.resolve(generateEtymologyData(dictionaryItems)),
      Promise.resolve(generateFrequencyData(dictionaryItems))
    ]);
    console.log('[Dictionary] Successfully generated word data');

    // Import data sequentially by store to avoid transaction timeouts
    console.log('[Dictionary] Starting data import...');
    
    // Clear and import words
    console.log('[Dictionary] Processing words store...');
    const wordsTx = database.transaction('words', 'readwrite');
    const wordsStore = wordsTx.objectStore('words');
    await wordsStore.clear();
    await processBatch(dictionaryItems, item => wordsStore.put(item), 50, 'words');
    await wordsTx.done;
    console.log('[Dictionary] Words store import completed');

    // Clear and import relationships
    console.log('[Dictionary] Processing relationships store...');
    const relTx = database.transaction('wordRelationships', 'readwrite');
    const relStore = relTx.objectStore('wordRelationships');
    await relStore.clear();
    await processBatch(relationships, rel => relStore.put(rel), 50, 'relationships');
    await relTx.done;
    console.log('[Dictionary] Relationships store import completed');

    // Clear and import etymology
    console.log('[Dictionary] Processing etymology store...');
    const etymTx = database.transaction('wordEtymology', 'readwrite');
    const etymStore = etymTx.objectStore('wordEtymology');
    await etymStore.clear();
    await processBatch(etymologyData, etym => etymStore.put(etym), 50, 'etymology');
    await etymTx.done;
    console.log('[Dictionary] Etymology store import completed');

    // Clear and import frequency
    console.log('[Dictionary] Processing frequency store...');
    const freqTx = database.transaction('wordFrequency', 'readwrite');
    const freqStore = freqTx.objectStore('wordFrequency');
    await freqStore.clear();
    await processBatch(frequencyData, freq => freqStore.put(freq), 50, 'frequency');
    await freqTx.done;
    console.log('[Dictionary] Frequency store import completed');

    console.log('[Dictionary] Dictionary data import completed successfully');
    return { success: true, count: dictionaryItems.length };
  } catch (error) {
    console.error('[Dictionary] Error during dictionary data import:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred during dictionary data import' 
    };
  } finally {
    if (database && !db) {
      console.log('[Dictionary] Closing database connection...');
      database.close();
    }
  }
} 