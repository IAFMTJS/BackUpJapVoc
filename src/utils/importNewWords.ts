import { openDB } from 'idb';
import { DictionaryItem, EmotionalContext } from '../types/dictionary';
import { parseDocxContent, validateParsedWords } from './docxParser';

export interface ImportedWord {
  japanese: string;
  romaji: string;
  english: string;
  audioUrl?: string;
  emotionalContext?: EmotionalContext;
}

// Function to parse the docx file content
async function parseDocxFile(file: File): Promise<ImportedWord[]> {
  const words = await parseDocxContent(file);
  const validation = validateParsedWords(words);
  
  if (!validation.valid) {
    throw new Error('Invalid word data:\n' + validation.errors.join('\n'));
  }
  
  return words;
}

// Function to generate audio URL for a word
async function generateAudioUrl(word: string): Promise<string | undefined> {
  try {
    // You can implement this to use a text-to-speech API or your existing audio system
    // For now, return undefined
    return undefined;
  } catch (error) {
    console.error('Error generating audio URL:', error);
    return undefined;
  }
}

// Function to convert imported words to dictionary items
async function convertToDictionaryItems(words: ImportedWord[]): Promise<DictionaryItem[]> {
  return Promise.all(words.map(async (word, index) => {
    const audioUrl = await generateAudioUrl(word.japanese);
    
    return {
      id: `new-word-${Date.now()}-${index}`,
      japanese: word.japanese,
      romaji: word.romaji,
      english: word.english,
      audioUrl,
      level: 1, // Default level for new words
      category: word.emotionalContext ? `emotional-${word.emotionalContext.category}` : 'new-words',
      jlptLevel: 'N5', // Default to N5, can be updated later
      frequency: {
        rank: 9999, // Default rank for new words
        source: 'manual-import'
      },
      mastery: {
        level: 0,
        lastReviewed: new Date(),
        correctAttempts: 0,
        incorrectAttempts: 0
      },
      examples: [],
      notes: word.emotionalContext?.usageNotes || '',
      tags: [
        'new-import',
        ...(word.emotionalContext ? [
          `emotion-${word.emotionalContext.category}`,
          `intensity-${word.emotionalContext.intensity}`,
          ...(word.emotionalContext.relatedEmotions || []).map(e => `related-${e}`)
        ] : [])
      ],
      emotionalContext: word.emotionalContext,
      lastViewed: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }));
}

// Main import function
export async function importNewWords(file: File): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    // Parse the docx file
    const importedWords = await parseDocxFile(file);
    if (!importedWords.length) {
      return { success: false, count: 0, error: 'No words found in the file' };
    }

    // Convert to dictionary items
    const dictionaryItems = await convertToDictionaryItems(importedWords);

    // Open the database
    const db = await openDB('DictionaryDB', 1);

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
    console.error('Error importing new words:', error);
    return { 
      success: false, 
      count: 0, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

// Function to validate imported words
export function validateImportedWords(words: ImportedWord[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  words.forEach((word, index) => {
    if (!word.japanese) {
      errors.push(`Word at index ${index} is missing Japanese text`);
    }
    if (!word.romaji) {
      errors.push(`Word at index ${index} is missing romaji`);
    }
    if (!word.english) {
      errors.push(`Word at index ${index} is missing English translation`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
} 