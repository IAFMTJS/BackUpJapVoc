import { openDB } from 'idb';
import { DictionaryItem, EmotionalContext } from '../types/dictionary';
import { EMOTIONAL_CATEGORIES } from './processMoodWords';

// Function to convert common words to dictionary items
async function convertToDictionaryItems(words: any[]): Promise<DictionaryItem[]> {
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

// Main import function
export async function importWords(): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    // Import common words
    const commonWordsResponse = await fetch('/src/data/common-words.json');
    const commonWords = await commonWordsResponse.json();

    // Import processed words
    const processedWordsResponse = await fetch('/src/data/processed_words.json');
    const processedWords = await processedWordsResponse.json();

    // Convert all words to dictionary items
    const allWords = [...commonWords, ...processedWords];
    const dictionaryItems = await convertToDictionaryItems(allWords);

    // Open the database
    const db = await openDB('JapVocDB', 1);

    // Start a transaction
    const tx = db.transaction('words', 'readwrite');
    const store = tx.objectStore('words');

    // Add all words
    for (const item of dictionaryItems) {
      await store.put(item);
    }

    // Wait for the transaction to complete
    await tx.done;

    return { success: true, count: dictionaryItems.length };
  } catch (error) {
    console.error('Error importing words:', error);
    return { 
      success: false, 
      count: 0, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
} 