import { openDB } from 'idb';
import { MoodWord, EmotionalCategory } from '../types/mood';
import { generateMoodWordAudio } from './audio';

// Category mapping from JSON categories to UI categories
const categoryMapping: Record<string, EmotionalCategory> = {
  // Positive Feelings
  'romantic': 'love',
  'playful': 'happiness',
  'positive': 'happiness',
  'happy': 'happiness',
  'joyful': 'happiness',
  
  // Challenging Emotions
  'angry': 'anger',
  'annoyed': 'anger',
  'frustrated': 'anger',
  'indifferent': 'neutral',
  'disappointed': 'sadness',
  
  // Social Emotions
  'respect': 'respect',
  'empathetic': 'empathy',
  'grateful': 'gratitude',
  
  // Complex Feelings
  'motivational': 'determination',
  'determined': 'determination',
  'focused': 'determination'
};

// Default category for unmapped emotions
const DEFAULT_CATEGORY: EmotionalCategory = 'neutral';

// Database name and version
const DB_NAME = 'MoodWordsDB';
const DB_VERSION = 1;
const STORE_NAME = 'moodWords';

// Initialize the database
export async function initMoodWordsDB() {
  try {
    const db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('category', 'emotionalContext.category');
          store.createIndex('mastered', 'mastered');
          store.createIndex('lastReviewed', 'lastReviewed');
        }
      },
    });
    console.log('Mood words database initialized successfully');
    return db;
  } catch (error) {
    console.error('Error initializing mood words database:', error);
    throw error;
  }
}

// Convert JSON mood word to our MoodWord type
async function convertToMoodWord(jsonWord: any): Promise<MoodWord> {
  if (!jsonWord || typeof jsonWord !== 'object') {
    throw new Error('Invalid mood word data: word is not an object');
  }

  if (!jsonWord.category) {
    throw new Error(`Invalid mood word data: missing category for word "${jsonWord.japanese || 'unknown'}"`);
  }

  const category = categoryMapping[jsonWord.category.toLowerCase()] || DEFAULT_CATEGORY;
  
  // Convert intensity string to number
  const intensityMap: Record<string, number> = {
    'low': 1,
    'medium': 2,
    'high': 3,
    'very high': 4
  };

  // Generate audio URL for the word
  const audioUrl = await generateMoodWordAudio(jsonWord.japanese);
  
  return {
    id: crypto.randomUUID(),
    japanese: jsonWord.japanese || '',
    romaji: jsonWord.romaji || '',
    english: jsonWord.english || '',
    audioUrl,
    emotionalContext: {
      category,
      originalCategory: jsonWord.category,
      intensity: intensityMap[jsonWord.intensity?.toLowerCase()] || 1,
      relatedEmotions: jsonWord.related_emotions || [],
      emoji: getEmojiForCategory(category),
      usageNotes: jsonWord.usage_notes || []
    },
    mastered: false,
    lastReviewed: new Date(),
    formality: jsonWord.formality || 'polite',
    commonResponses: jsonWord.common_responses || []
  };
}

// Get emoji for category
function getEmojiForCategory(category: EmotionalCategory): string {
  const emojiMap: Record<EmotionalCategory, string> = {
    'happiness': '😊',
    'sadness': '😢',
    'anger': '😠',
    'love': '❤️',
    'fear': '😨',
    'surprise': '😲',
    'disgust': '🤢',
    'neutral': '😐',
    'gratitude': '🙏',
    'empathy': '🤗',
    'respect': '🙇',
    'determination': '💪'
  };
  return emojiMap[category] || '😐';
}

// Import mood words from JSON
export async function importMoodWords(jsonData: any[]): Promise<void> {
  let db;
  try {
    if (!Array.isArray(jsonData)) {
      throw new Error('Invalid mood words data: expected an array');
    }

    db = await initMoodWordsDB();
    
    // Convert all words first
    console.log(`Converting ${jsonData.length} mood words...`);
    const moodWords = await Promise.all(jsonData.map(async (word, index) => {
      try {
        return await convertToMoodWord(word);
      } catch (error) {
        console.error(`Error converting word at index ${index}:`, error);
        throw error;
      }
    }));

    // Then store all words in a single transaction
    console.log('Storing converted words in database...');
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    // Clear existing words first
    await store.clear();

    // Add all words in parallel but within the same transaction
    await Promise.all(moodWords.map(word => store.add(word)));
    
    // Wait for transaction to complete
    await tx.done;
    
    console.log(`Successfully imported ${moodWords.length} mood words`);
  } catch (error) {
    console.error('Error importing mood words:', error);
    throw error;
  } finally {
    if (db) {
      db.close();
    }
  }
}

// Update word mastery status
export async function updateWordMastery(wordId: string, mastered: boolean): Promise<void> {
  let db;
  try {
    db = await openDB(DB_NAME, DB_VERSION);
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    const word = await store.get(wordId);
    if (word) {
      word.mastered = mastered;
      word.lastReviewed = new Date();
      await store.put(word);
    }
    
    await tx.done;
  } catch (error) {
    console.error('Error updating word mastery:', error);
    throw error;
  } finally {
    if (db) {
      db.close();
    }
  }
}

// Update word audio in database
export async function updateWordAudio(wordId: string, audioUrl: string): Promise<void> {
  let db;
  try {
    db = await openDB(DB_NAME, DB_VERSION);
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    const word = await store.get(wordId);
    if (word) {
      word.audioUrl = audioUrl;
      await store.put(word);
    }
    
    await tx.done;
  } catch (error) {
    console.error('Error updating word audio:', error);
    throw error;
  } finally {
    if (db) {
      db.close();
    }
  }
}

// Load all mood words from database
export async function loadAllMoodWords(): Promise<MoodWord[]> {
  let db;
  try {
    db = await openDB(DB_NAME, DB_VERSION);
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const words = await store.getAll();
    await tx.done;
    return words;
  } catch (error) {
    console.error('Error loading mood words:', error);
    throw error;
  } finally {
    if (db) {
      db.close();
    }
  }
}

// Get words by category
export async function getWordsByCategory(category: EmotionalCategory): Promise<MoodWord[]> {
  let db;
  try {
    db = await openDB(DB_NAME, DB_VERSION);
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('category');
    const words = await index.getAll(category);
    await tx.done;
    return words;
  } catch (error) {
    console.error('Error getting words by category:', error);
    throw error;
  } finally {
    if (db) {
      db.close();
    }
  }
}

// Get mastery statistics
export async function getMasteryStats(): Promise<{ total: number; mastered: number }> {
  let db;
  try {
    db = await openDB(DB_NAME, DB_VERSION);
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const allWords = await store.getAll();
    await tx.done;
    
    return {
      total: allWords.length,
      mastered: allWords.filter(word => word.mastered).length
    };
  } catch (error) {
    console.error('Error getting mastery stats:', error);
    throw error;
  } finally {
    if (db) {
      db.close();
    }
  }
} 