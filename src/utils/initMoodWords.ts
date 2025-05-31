import { getDatabase, getAllFromStore } from './databaseConfig';
import { MoodWord } from '../types/mood';
import { initializeMoodWords as initializeMoodWordsInDB } from './moodWordOperations';
import { MOOD_WORDS } from '../data/moodWords';

// Main initialization function
export async function initializeMoodWords(): Promise<void> {
  try {
    await initializeMoodWordsInDB();
    console.log('Mood words initialized successfully');
  } catch (error) {
    console.error('Error initializing mood words:', error);
    throw error;
  }
}

// Export a function to check initialization status
export async function getMoodWordsStatus(): Promise<{
  initialized: boolean;
  wordCount: number;
}> {
  try {
    const db = await getDatabase();
    const words = await getAllFromStore<MoodWord>(db, 'moodWords');
    return {
      initialized: words.length > 0,
      wordCount: words.length
    };
  } catch (error) {
    console.error('Error getting mood words status:', error);
    return {
      initialized: false,
      wordCount: 0
    };
  }
} 