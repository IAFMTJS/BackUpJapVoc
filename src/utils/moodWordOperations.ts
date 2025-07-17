import { MoodWord, EmotionalCategory } from '../types/mood';
import { MOOD_WORDS } from '../data/moodWords';
import { getDatabase, addToStore, clearStore, getAllFromStore, updateInStore, deleteFromStore } from './databaseConfig';

const STORE_NAME = 'moodWords';

// Map JSON categories to application categories
const CATEGORY_MAP: Record<string, EmotionalCategory> = {
  'romantic': 'romantic',
  'angry': 'angry',
  'happy': 'happiness',
  'sad': 'sadness',
  'scared': 'fear',
  'annoyed': 'annoyed',
  'indifferent': 'indifferent',
  'motivational': 'motivational',
  'empathetic': 'empathetic',
  'respect': 'respect',
  'flirting': 'romantic',
  'gratitude': 'gratitude',
  'pride': 'happiness',
  'embarrassment': 'neutral',
  'excitement': 'happiness',
  'loneliness': 'sadness',
  'nostalgia': 'sadness',
  'determination': 'determination',
  'relief': 'happiness',
  'playful': 'playful',
  'positive': 'positive',
  'anger': 'anger',
  'love': 'love',
  'fear': 'fear',
  'surprise': 'surprise',
  'disgust': 'disgust',
  'neutral': 'neutral',
  'empathy': 'empathy'
};

// Load additional mood words from JSON file
async function loadAdditionalMoodWords(): Promise<MoodWord[]> {
  try {
    const response = await fetch('/data/mood_words.json');
    if (!response.ok) {
      throw new Error('Failed to fetch mood words JSON');
    }
    const jsonWords = await response.json();
    
    // Convert JSON format to MoodWord format
    return jsonWords.map((word: any, index: number) => {
      // Map the category to our application's categories
      const mappedCategory = CATEGORY_MAP[word.category] || 'neutral';
      
      return {
        id: `${mappedCategory}-${index + 1}`,
        japanese: word.japanese,
        romaji: word.romaji,
        english: word.english,
        emotionalContext: {
          category: mappedCategory,
          originalCategory: word.category,
          intensity: getIntensityValue(word.intensity),
          usageNotes: Array.isArray(word.usage_notes) ? word.usage_notes.join('. ') : word.usage_notes,
          relatedEmotions: word.related_emotions || [],
          emoji: getEmojiForCategory(mappedCategory)
        },
        mastered: false,
        lastReviewed: new Date(),
        formality: determineFormality(word),
        commonResponses: word.common_responses || []
      };
    });
  } catch (error) {
    console.error('Error loading additional mood words:', error);
    return [];
  }
}

// Helper function to get emoji for category
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
    'empathy': '🤝',
    'respect': '🙇',
    'determination': '💪',
    'romantic': '💕',
    'angry': '😡',
    'annoyed': '😤',
    'empathetic': '🤗',
    'motivational': '🔥',
    'playful': '😋',
    'positive': '✨',
    'indifferent': '😑'
  };
  return emojiMap[category] || '😐';
}

// Helper function to convert intensity string to number
function getIntensityValue(intensity: string): number {
  const intensityMap: Record<string, number> = {
    'low': 2,
    'medium': 5,
    'high': 8
  };
  return intensityMap[intensity] || 5;
}

// Helper function to determine formality
function determineFormality(word: any): 'formal' | 'neutral' | 'casual' {
  if (word.japanese.includes('です') || word.japanese.includes('ます')) {
    return 'formal';
  }
  if (word.japanese.includes('だ') || word.japanese.includes('だよ')) {
    return 'casual';
  }
  return 'neutral';
}

// Initialize mood words in the database
export async function initializeMoodWords(): Promise<void> {
  try {
    const db = await getDatabase();
    
    // Clear existing words
    await clearStore(STORE_NAME);
    
    // Load additional words from JSON
    const additionalWords = await loadAdditionalMoodWords();
    console.log(`Loaded ${additionalWords.length} additional mood words from JSON`);
    
    // Combine hardcoded and additional words
    const allWords = [...MOOD_WORDS, ...additionalWords];
    
    // Add all words to the database
    await Promise.all(allWords.map(word => addToStore(STORE_NAME, word)));
    
    console.log(`Successfully initialized ${allWords.length} total mood words`);
  } catch (error) {
    console.error('Error initializing mood words:', error);
    throw error;
  }
}

// Get all mood words
export async function getAllMoodWords(): Promise<MoodWord[]> {
  try {
    const db = await getDatabase();
    const words = await getAllFromStore<MoodWord>(db, STORE_NAME);
    
    // If no words in database, initialize them
    if (words.length === 0) {
      await initializeMoodWords();
      // After initialization, get the words again
      const initializedWords = await getAllFromStore<MoodWord>(db, STORE_NAME);
      return initializedWords.length > 0 ? initializedWords : MOOD_WORDS;
    }
    
    return words;
  } catch (error) {
    console.error('Error getting all mood words:', error);
    // Fallback to built-in data if database fails
    return MOOD_WORDS;
  }
}

// Get mood words by category
export async function getMoodWordsByCategory(category: EmotionalCategory): Promise<MoodWord[]> {
  try {
    const db = await getDatabase();
    const allWords = await getAllFromStore<MoodWord>(db, STORE_NAME);
    return allWords.filter(word => word.emotionalContext.category === category);
  } catch (error) {
    console.error('Error getting mood words by category:', error);
    // Fallback to built-in data
    return MOOD_WORDS.filter(word => word.emotionalContext.category === category);
  }
}

// Update mood word
export async function updateMoodWord(word: MoodWord): Promise<void> {
  try {
    const db = await getDatabase();
    await updateInStore(STORE_NAME, word);
  } catch (error) {
    console.error('Error updating mood word:', error);
    throw error;
  }
}

// Delete mood word
export async function deleteMoodWord(id: string): Promise<void> {
  try {
    const db = await getDatabase();
    await deleteFromStore(STORE_NAME, id);
  } catch (error) {
    console.error('Error deleting mood word:', error);
    throw error;
  }
}

// Mark word as mastered
export async function markWordAsMastered(id: string, mastered: boolean = true): Promise<void> {
  try {
    const db = await getDatabase();
    const words = await getAllFromStore<MoodWord>(db, STORE_NAME);
    const word = words.find(w => w.id === id);
    
    if (word) {
      await updateInStore(STORE_NAME, { 
        ...word, 
        mastered,
        lastReviewed: new Date()
      });
    }
  } catch (error) {
    console.error('Error marking word as mastered:', error);
    throw error;
  }
}

// Get mastered words
export async function getMasteredWords(): Promise<MoodWord[]> {
  try {
    const db = await getDatabase();
    const allWords = await getAllFromStore<MoodWord>(db, STORE_NAME);
    return allWords.filter(word => word.mastered);
  } catch (error) {
    console.error('Error getting mastered words:', error);
    // Fallback to built-in data
    return MOOD_WORDS.filter(word => word.mastered);
  }
}

// Get words by last reviewed date
export async function getWordsByLastReviewed(startDate: Date, endDate: Date): Promise<MoodWord[]> {
  try {
    const db = await getDatabase();
    const allWords = await getAllFromStore<MoodWord>(db, STORE_NAME);
    return allWords.filter(word => {
      const reviewedDate = new Date(word.lastReviewed);
      return reviewedDate >= startDate && reviewedDate <= endDate;
    });
  } catch (error) {
    console.error('Error getting words by last reviewed date:', error);
    // Fallback to built-in data
    return MOOD_WORDS.filter(word => {
      const reviewedDate = new Date(word.lastReviewed);
      return reviewedDate >= startDate && reviewedDate <= endDate;
    });
  }
} 