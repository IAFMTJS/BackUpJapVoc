import { openDB } from 'idb';
import { DictionaryItem, EmotionalContext } from '../types/dictionary';
import { DB_CONFIG } from './databaseConfig';
import { EMOTIONAL_CATEGORIES } from './processMoodWords';

// Function to convert common words to dictionary items
async function convertToDictionaryItems(words: any[]): Promise<DictionaryItem[]> {
  console.log('[convertToDictionaryItems] Converting words to dictionary format...');
  return words.map(word => {
    // Determine if this word has an emotional context
    let emotionalContext: EmotionalContext | undefined;
    if (word.category?.toLowerCase().includes('emotion')) {
      // Find the matching emotional category
      const category = Object.keys(EMOTIONAL_CATEGORIES).find(cat => 
        word.english.toLowerCase().includes(cat.toLowerCase())
      );
      
      if (category) {
        emotionalContext = {
          category,
          emoji: EMOTIONAL_CATEGORIES[category].emoji,
          intensity: 3, // Default intensity
          usageNotes: `Expresses ${category}`,
          relatedEmotions: []
        };
      }
    }

    return {
      id: word.id || `word-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      japanese: word.japanese,
      english: word.english,
      romaji: word.romaji,
      type: 'word',
      level: word.level || 1,
      jlptLevel: word.jlpt || 'N5',
      category: word.category || 'general',
      frequency: {
        rank: word.level ? 10000 - (word.level * 1000) : 9999,
        source: 'common-words'
      },
      mastery: {
        level: 0,
        lastReviewed: new Date(),
        correctAttempts: 0,
        incorrectAttempts: 0
      },
      examples: word.examples || [],
      notes: word.notes || '',
      tags: [
        word.category?.toLowerCase() || 'general',
        ...(emotionalContext ? ['emotional', `emotion-${emotionalContext.category}`] : [])
      ],
      emotionalContext,
      lastViewed: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
  });
}

// Function to load words from JSON files
async function loadWordsFromJSON(): Promise<any[]> {
  console.log('[ImportWords] Loading words from JSON file...');
  try {
    // Load dictionary words
    console.log('[ImportWords] Fetching dictionary words...');
    const response = await fetch('/data/dictionary_words.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch dictionary words: ${response.status} ${response.statusText}`);
    }
    const words = await response.json();
    console.log(`[ImportWords] Successfully loaded ${words.length} dictionary words`);

    // Convert to dictionary format
    console.log('[ImportWords] Converting words to dictionary format...');
    const dictionaryItems = words.map((word: any, index: number) => ({
      id: word.id || `word-${index + 1}`,
      japanese: word.japanese,
      english: word.english,
      romaji: word.romaji,
      hiragana: word.hiragana,
      kanji: word.kanji,
      level: word.level || 1,
      category: word.category || 'noun',
      jlptLevel: word.jlptLevel,
      examples: word.examples || [],
      notes: word.notes || '',
      lastViewed: new Date(),
      mastery: {
        level: 0,
        lastReviewed: new Date(),
        reviewCount: 0
      },
      frequency: {
        rank: word.frequency || 0,
        source: 'dictionary'
      },
      emotionalContext: {
        category: word.emotionalContext?.category || 'neutral',
        intensity: word.emotionalContext?.intensity || 0
      }
    }));

    console.log(`[ImportWords] Converted ${dictionaryItems.length} words to dictionary format`);
    return dictionaryItems;
  } catch (error) {
    console.error('[ImportWords] Error loading words from JSON:', error);
    throw error;
  }
}

// Main import function
export async function importWords(): Promise<{ success: boolean; error?: string }> {
  console.log('[ImportWords] Starting word import process');
  try {
    // Get database instance
    console.log('[ImportWords] Getting database instance');
    const db = await openDB(DB_CONFIG.name, DB_CONFIG.version);
    
    // Check if words are already imported
    console.log('[ImportWords] Checking if words are already imported');
    const tx = db.transaction('words', 'readonly');
    const store = tx.objectStore('words');
    const count = await store.count();
    
    if (count > 0) {
      console.log(`[ImportWords] Found ${count} existing words, skipping import`);
      return { success: true };
    }

    // Load words from JSON
    console.log('[ImportWords] Loading words from JSON');
    const words = await loadWordsFromJSON();
    console.log(`[ImportWords] Loaded ${words.length} words from JSON`);

    // Import words in batches
    const BATCH_SIZE = 100;
    console.log(`[ImportWords] Starting batch import with size ${BATCH_SIZE}`);
    
    for (let i = 0; i < words.length; i += BATCH_SIZE) {
      const batch = words.slice(i, i + BATCH_SIZE);
      console.log(`[ImportWords] Importing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(words.length / BATCH_SIZE)}`);
      
      const batchTx = db.transaction('words', 'readwrite');
      const batchStore = batchTx.objectStore('words');
      
      await Promise.all(batch.map(word => batchStore.add(word)));
      await batchTx.done;
      
      console.log(`[ImportWords] Completed batch ${Math.floor(i / BATCH_SIZE) + 1}`);
    }

    console.log('[ImportWords] Word import completed successfully');
    return { success: true };
  } catch (error) {
    console.error('[ImportWords] Error during word import:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to import words' 
    };
  }
} 