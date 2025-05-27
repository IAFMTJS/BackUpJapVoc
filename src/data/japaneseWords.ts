import { JapaneseWord, ExampleSentence } from './types';
import { quizWords } from './quizData';

// Initialize with quiz words
let processedWords = quizWords.map(word => ({
  kanji: word.japanese,
  kana: word.japanese,
  english: word.english,
  romaji: word.romaji,
  category: word.category,
  level: word.difficulty === 'easy' ? 1 : word.difficulty === 'medium' ? 2 : 3,
  examples: word.examples || [],
  notes: word.notes || '',
  jlptLevel: word.jlptLevel
}));

// Initialize empty arrays
export let allWords: JapaneseWord[] = [];
export let wordsByLevel: Record<number, JapaneseWord[]> = {};
export let wordsByDifficulty: Record<'beginner' | 'intermediate' | 'advanced', JapaneseWord[]> = {
  beginner: [],
  intermediate: [],
  advanced: []
};
export let wordsByCategory: Record<string, JapaneseWord[]> = {};
export let wordsByJLPT: Record<string, JapaneseWord[]> = {};

// Process the words immediately
console.log('Initializing dictionary with', processedWords.length, 'words...');
processWords();
console.log('Dictionary initialization complete. Total words:', allWords.length);

// Helper to convert JLPT level string to number and difficulty
function parseLevel(level: string | number | undefined | null, category?: string): { level: number; difficulty: 'beginner' | 'intermediate' | 'advanced'; jlptLevel?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' } {
  // If level is a number, handle it directly
  if (typeof level === 'number') {
    return {
      level: level,
      difficulty: level <= 2 ? 'beginner' : level <= 4 ? 'intermediate' : 'advanced'
    };
  }

  // If level is a string, try to parse as JLPT level first
  const jlptLevel = level ? (level.toUpperCase() as 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | undefined) : undefined;
  
  // Define level distribution based on JLPT and category
  const levelDistribution = {
    'N5': {
      greeting: 1,
      number: 1,
      pronoun: 1,
      question: 1,
      particle: 2,
      verb: 2,
      adjective: 2,
      adverb: 2,
      default: 1
    },
    'N4': {
      verb: 2,
      adjective: 2,
      adverb: 2,
      particle: 2,
      time: 3,
      food: 3,
      drink: 3,
      transportation: 3,
      shopping: 3,
      default: 2
    },
    'N3': {
      family: 4,
      emotion: 4,
      body: 4,
      health: 4,
      housing: 4,
      work: 5,
      education: 5,
      hobby: 5,
      travel: 5,
      money: 5,
      default: 3
    },
    'N2': {
      verb: 6,
      adjective: 6,
      adverb: 6,
      conjunction: 6,
      idiom: 7,
      proverb: 7,
      onomatopoeia: 7,
      technology: 8,
      business: 8,
      academic: 8,
      default: 6
    },
    'N1': {
      literature: 9,
      formal: 9,
      advanced: 9,
      slang: 10,
      colloquial: 10,
      nuanced: 10,
      default: 9
    }
  };

  if (jlptLevel) {
    const distribution = levelDistribution[jlptLevel];
    const wordLevel = category ? (distribution[category] || distribution.default) : distribution.default;
    
    return {
      level: wordLevel,
      difficulty: wordLevel <= 2 ? 'beginner' : wordLevel <= 4 ? 'intermediate' : 'advanced',
      jlptLevel
    };
  }

  // Default to level 1 for unknown words
  return {
    level: 1,
    difficulty: 'beginner'
  };
}

// Helper to process example sentences
function processExamples(word: any): ExampleSentence[] {
  const examples: ExampleSentence[] = [];
  
  // Add example from the word data if available
  if (word.example) {
    examples.push({
      japanese: word.example,
      english: word.exampleTranslation || '',
      romaji: word.exampleRomaji || '',
      notes: word.exampleNotes
    });
  }
  
  // Add any additional examples
  if (word.additionalExamples) {
    word.additionalExamples.forEach((ex: any) => {
      examples.push({
        japanese: ex.japanese,
        english: ex.english,
        romaji: ex.romaji,
        notes: ex.notes
      });
    });
  }
  
  return examples;
}

function processWords() {
  allWords = processedWords.map((w, idx) => {
    const { level, difficulty, jlptLevel } = parseLevel(w.level, w.category);
    
    return {
      id: `cw-${idx + 1}`,
      japanese: w.kanji && w.kanji.length > 0 ? w.kanji : w.kana,
      english: w.english,
      romaji: w.romaji,
      hiragana: w.kana,
      kanji: w.kanji || undefined,
      level,
      difficulty,
      jlptLevel,
      category: w.category || 'noun',
      examples: processExamples(w),
      notes: w.notes || '',
      isHiragana: /^[\u3040-\u309F]+$/.test(w.kana),
      isKatakana: /^[\u30A0-\u30FF]+$/.test(w.kana)
    };
  });

  // Group by level
  wordsByLevel = {};
  allWords.forEach(word => {
    if (!wordsByLevel[word.level]) wordsByLevel[word.level] = [];
    wordsByLevel[word.level].push(word);
  });

  // Group by difficulty
  wordsByDifficulty = {
    beginner: [],
    intermediate: [],
    advanced: []
  };
  allWords.forEach(word => {
    wordsByDifficulty[word.difficulty].push(word);
  });

  // Group by category
  wordsByCategory = {};
  allWords.forEach(word => {
    const cat = word.category || 'noun';
    if (!wordsByCategory[cat]) wordsByCategory[cat] = [];
    wordsByCategory[cat].push(word);
  });

  // Log the number of words in each category
  console.log('Words by category:');
  Object.entries(wordsByCategory).forEach(([category, words]) => {
    console.log(`${category}: ${words.length} words`);
  });

  // Group by JLPT level
  wordsByJLPT = {};
  allWords.forEach(word => {
    if (word.jlptLevel) {
      if (!wordsByJLPT[word.jlptLevel]) wordsByJLPT[word.jlptLevel] = [];
      wordsByJLPT[word.jlptLevel].push(word);
    }
  });
}

// Export a function to check if words are loaded
export function areWordsLoaded(): boolean {
  return allWords.length > 0;
}

// Export a function to wait for words to be loaded
export async function waitForWords(): Promise<void> {
  if (areWordsLoaded()) {
    return Promise.resolve();
  }
  
  // If words aren't loaded yet, wait a bit and try again
  return new Promise((resolve) => {
    const checkWords = () => {
      if (areWordsLoaded()) {
        resolve();
      } else {
        setTimeout(checkWords, 100);
      }
    };
    checkWords();
  });
}

// We'll continue adding more words in subsequent edits... 