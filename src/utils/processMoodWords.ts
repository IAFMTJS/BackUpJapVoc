import { EmotionalCategory, EmotionalContext } from '../types/dictionary';

export interface MoodWord {
  id: string;
  japanese: string;
  romaji: string;
  english: string;
  audioUrl?: string;
  mastered: boolean;
  lastReviewed: Date;
  emotionalContext: EmotionalContext;
}

// Emotional categories with their associated emojis and colors
export const EMOTIONAL_CATEGORIES: Record<EmotionalCategory, { emoji: string; color: string }> = {
  flirting: { emoji: '😘', color: '#ff69b4' },
  anger: { emoji: '😠', color: '#ff4444' },
  love: { emoji: '❤️', color: '#ff1493' },
  happiness: { emoji: '😊', color: '#ffd700' },
  sadness: { emoji: '😢', color: '#4169e1' },
  surprise: { emoji: '😲', color: '#ffa500' },
  fear: { emoji: '😨', color: '#800080' },
  disgust: { emoji: '🤢', color: '#556b2f' },
  neutral: { emoji: '😐', color: '#808080' },
  respect: { emoji: '🙏', color: '#9370db' },
  shame: { emoji: '😔', color: '#8b4513' },
  gratitude: { emoji: '🙏', color: '#32cd32' },
  pride: { emoji: '😌', color: '#daa520' },
  embarrassment: { emoji: '😳', color: '#ff69b4' },
  excitement: { emoji: '🤩', color: '#ff4500' },
  loneliness: { emoji: '😔', color: '#4682b4' },
  nostalgia: { emoji: '🥺', color: '#dda0dd' },
  determination: { emoji: '💪', color: '#b22222' },
  relief: { emoji: '😌', color: '#98fb98' }
};

// Sample mood words (to be replaced with actual data from JAPJAP NEW WORDS)
export const sampleMoodWords: MoodWord[] = [
  {
    id: '1',
    japanese: '嬉しい',
    romaji: 'ureshii',
    english: 'happy, glad',
    mastered: false,
    lastReviewed: new Date(),
    emotionalContext: {
      category: 'happiness',
      emoji: EMOTIONAL_CATEGORIES.happiness.emoji,
      intensity: 4,
      usageNotes: 'Used to express joy or happiness about something',
      relatedEmotions: ['joy', 'delight']
    }
  },
  {
    id: '2',
    japanese: '悲しい',
    romaji: 'kanashii',
    english: 'sad, sorrowful',
    mastered: false,
    lastReviewed: new Date(),
    emotionalContext: {
      category: 'sadness',
      emoji: EMOTIONAL_CATEGORIES.sadness.emoji,
      intensity: 3,
      usageNotes: 'Expresses deep sadness or sorrow',
      relatedEmotions: ['grief', 'melancholy']
    }
  },
  {
    id: '3',
    japanese: '怒る',
    romaji: 'okoru',
    english: 'to get angry',
    mastered: false,
    lastReviewed: new Date(),
    emotionalContext: {
      category: 'anger',
      emoji: EMOTIONAL_CATEGORIES.anger.emoji,
      intensity: 4,
      usageNotes: 'Used when expressing anger or frustration',
      relatedEmotions: ['frustration', 'irritation']
    }
  },
  {
    id: '4',
    japanese: '大好き',
    romaji: 'daisuki',
    english: 'really like, love',
    mastered: false,
    lastReviewed: new Date(),
    emotionalContext: {
      category: 'love',
      emoji: EMOTIONAL_CATEGORIES.love.emoji,
      intensity: 5,
      usageNotes: 'Strong expression of liking or love',
      relatedEmotions: ['affection', 'adoration']
    }
  },
  {
    id: '5',
    japanese: '怖い',
    romaji: 'kowai',
    english: 'scary, frightening',
    mastered: false,
    lastReviewed: new Date(),
    emotionalContext: {
      category: 'fear',
      emoji: EMOTIONAL_CATEGORIES.fear.emoji,
      intensity: 4,
      usageNotes: 'Expresses fear or being scared',
      relatedEmotions: ['anxiety', 'terror']
    }
  }
];

// Function to load mood words from IndexedDB
export async function loadMoodWords(db: IDBDatabase): Promise<MoodWord[]> {
  try {
    const transaction = db.transaction('moodWords', 'readonly');
    const store = transaction.objectStore('moodWords');
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const words = request.result;
        console.log(`Loaded ${words.length} mood words from database`);
        resolve(words);
      };

      request.onerror = () => {
        console.error('Error loading mood words:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error in loadMoodWords:', error);
    throw error;
  }
}

// Function to save a mood word to IndexedDB
export async function saveMoodWord(db: IDBDatabase, word: MoodWord): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('words', 'readwrite');
    const store = transaction.objectStore('words');
    const request = store.put(word);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Function to update a mood word's mastery status
export async function updateWordMastery(
  db: IDBDatabase,
  wordId: string,
  mastered: boolean
): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('words', 'readwrite');
    const store = transaction.objectStore('words');
    const request = store.get(wordId);

    request.onsuccess = () => {
      const word = request.result;
      if (word) {
        word.mastered = mastered;
        word.lastReviewed = new Date();
        const updateRequest = store.put(word);
        updateRequest.onsuccess = () => resolve();
        updateRequest.onerror = () => reject(updateRequest.error);
      } else {
        reject(new Error('Word not found'));
      }
    };

    request.onerror = () => reject(request.error);
  });
} 