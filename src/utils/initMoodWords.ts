import { importMoodWords, initMoodWordsDB, loadAllMoodWords } from './moodWordOperations';

// Function to check if mood words are already loaded
async function areMoodWordsLoaded(): Promise<boolean> {
  try {
    const words = await loadAllMoodWords();
    return words.length > 0;
  } catch (error) {
    console.error('Error checking if mood words are loaded:', error);
    return false;
  }
}

// Function to load mood words from JSON file
async function loadMoodWordsFromJSON(): Promise<any[]> {
  try {
    const response = await fetch('/data/mood_words.json');
    if (!response.ok) {
      throw new Error(`Failed to load mood words: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading mood words from JSON:', error);
    throw error;
  }
}

// Main initialization function
export async function initializeMoodWords(): Promise<void> {
  try {
    // Initialize database
    await initMoodWordsDB();

    // Check if words are already loaded
    const wordsLoaded = await areMoodWordsLoaded();
    if (wordsLoaded) {
      console.log('Mood words are already loaded');
      return;
    }

    // Load and import words
    console.log('Loading mood words from JSON...');
    const moodWords = await loadMoodWordsFromJSON();
    console.log(`Found ${moodWords.length} mood words in JSON`);
    
    await importMoodWords(moodWords);
    console.log('Mood words initialization completed successfully');
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
    const words = await loadAllMoodWords();
    return {
      initialized: true,
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