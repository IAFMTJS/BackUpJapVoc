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
const DB_VERSION = 9; // Match version with databaseConfig.ts
const DB_NAME = 'JapVocDB'; // Match name with databaseConfig.ts

// Update the import function to handle async conversion
export async function importDictionaryData(): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    console.log('[Dictionary] Starting dictionary data import process...');
    
    // Load the audio map first
    console.log('[Dictionary] Loading audio map...');
    await loadAudioMap();
    console.log('[Dictionary] Audio map loaded successfully');
    
    console.log('[Dictionary] Starting dictionary data import...');

    // Open database with upgrade handler
    console.log('[Dictionary] Opening database...');
    const db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion) {
        console.log(`[Dictionary] Upgrading database from version ${oldVersion} to ${newVersion}`);
        
        // Create stores if they don't exist
        if (!db.objectStoreNames.contains('words')) {
          console.log('[Dictionary] Creating words store');
          const wordStore = db.createObjectStore('words', { keyPath: 'id' });
          wordStore.createIndex('by-japanese', 'japanese');
          wordStore.createIndex('by-english', 'english');
          wordStore.createIndex('by-romaji', 'romaji');
          wordStore.createIndex('by-level', 'level');
          wordStore.createIndex('by-category', 'category');
          wordStore.createIndex('by-jlpt', 'jlptLevel');
          wordStore.createIndex('by-frequency', 'frequency.rank');
          wordStore.createIndex('by-mastery', 'mastery.level');
          wordStore.createIndex('by-last-viewed', 'lastViewed');
          wordStore.createIndex('by-emotional-context', 'emotionalContext.category');
        }
        
        if (!db.objectStoreNames.contains('wordRelationships')) {
          console.log('[Dictionary] Creating wordRelationships store');
          const relStore = db.createObjectStore('wordRelationships', { keyPath: 'id' });
          relStore.createIndex('by-word', 'wordId');
          relStore.createIndex('by-type', 'type');
        }
        
        if (!db.objectStoreNames.contains('wordEtymology')) {
          console.log('[Dictionary] Creating wordEtymology store');
          const etymStore = db.createObjectStore('wordEtymology', { keyPath: 'id' });
          etymStore.createIndex('by-word', 'wordId');
        }
        
        if (!db.objectStoreNames.contains('wordFrequency')) {
          console.log('[Dictionary] Creating wordFrequency store');
          const freqStore = db.createObjectStore('wordFrequency', { keyPath: 'id' });
          freqStore.createIndex('by-word', 'wordId');
          freqStore.createIndex('by-rank', 'rank');
        }
      },
      blocked() {
        console.log('[Dictionary] Database upgrade blocked');
      },
      blocking() {
        console.log('[Dictionary] Database upgrade blocking');
      },
      terminated() {
        console.log('[Dictionary] Database connection terminated');
      }
    });
    console.log('[Dictionary] Database opened successfully');

    // Fetch processed words
    console.log('[Dictionary] Fetching processed words from /data/processed_words.json...');
    const response = await fetch('/data/processed_words.json');
    if (!response.ok) {
      console.error('[Dictionary] Failed to fetch processed words:', response.status, response.statusText);
      throw new Error(`Failed to fetch processed words: ${response.status} ${response.statusText}`);
    }
    const processedWords: ProcessedWord[] = await response.json();
    console.log(`[Dictionary] Successfully loaded ${processedWords.length} processed words`);

    // Convert to dictionary items (now async)
    console.log('[Dictionary] Converting words to dictionary format...');
    const dictionaryItems = await Promise.all(
      processedWords.map((word, index) => 
        convertToDictionaryItem(word, `dict-${index + 1}`)
      )
    );
    console.log(`[Dictionary] Successfully converted ${dictionaryItems.length} words to dictionary format`);

    // Generate relationships, etymology, and frequency data
    console.log('[Dictionary] Generating word relationships...');
    const relationships = generateWordRelationships(dictionaryItems);
    console.log('[Dictionary] Generating etymology data...');
    const etymologyData = generateEtymologyData(dictionaryItems);
    console.log('[Dictionary] Generating frequency data...');
    const frequencyData = generateFrequencyData(dictionaryItems);

    // Import all data in a single transaction
    console.log('[Dictionary] Starting data import transaction...');
    const tx = db.transaction(['words', 'wordRelationships', 'wordEtymology', 'wordFrequency'], 'readwrite');
    
    // Clear existing data
    console.log('[Dictionary] Clearing existing data...');
    await Promise.all([
      tx.objectStore('words').clear(),
      tx.objectStore('wordRelationships').clear(),
      tx.objectStore('wordEtymology').clear(),
      tx.objectStore('wordFrequency').clear()
    ]);
    console.log('[Dictionary] Existing data cleared successfully');

    // Add new data
    console.log('[Dictionary] Adding new data to database...');
    await Promise.all([
      ...dictionaryItems.map(item => tx.objectStore('words').put(item)),
      ...relationships.map(rel => tx.objectStore('wordRelationships').put(rel)),
      ...etymologyData.map(etym => tx.objectStore('wordEtymology').put(etym)),
      ...frequencyData.map(freq => tx.objectStore('wordFrequency').put(freq))
    ]);
    console.log('[Dictionary] New data added successfully');

    // Wait for transaction to complete
    console.log('[Dictionary] Waiting for transaction to complete...');
    await tx.done;
    console.log('[Dictionary] Transaction completed successfully');

    console.log('[Dictionary] Dictionary data import completed successfully');
    return { success: true, count: dictionaryItems.length };
  } catch (error) {
    console.error('[Dictionary] Error during dictionary data import:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred during dictionary data import' 
    };
  }
} 