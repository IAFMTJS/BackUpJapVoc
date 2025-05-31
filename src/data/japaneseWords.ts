import { JapaneseWord, ExampleSentence } from './types';
import { quizWords } from './quizData';

// Initialize with quiz words
let processedQuizWords = quizWords.map(word => ({
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
export let quizWordList: JapaneseWord[] = [];
export let quizWordsByLevel: { [key: number]: JapaneseWord[] } = {};
export let quizWordsByDifficulty: {
  beginner: JapaneseWord[];
  intermediate: JapaneseWord[];
  advanced: JapaneseWord[];
} = {
  beginner: [],
  intermediate: [],
  advanced: []
};
export let quizWordsByCategory: { [key: string]: JapaneseWord[] } = {};
export let quizWordsByJLPT: { [key: string]: JapaneseWord[] } = {};

function parseLevel(level: number, category: string): {
  level: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  jlptLevel?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
} {
  // Default to beginner if level is not specified
  if (!level) level = 1;

  let difficulty: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
  let jlptLevel: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | undefined;

  // Map levels to difficulty
  if (level <= 3) {
    difficulty = 'beginner';
    jlptLevel = 'N5';
  } else if (level <= 6) {
    difficulty = 'intermediate';
    jlptLevel = 'N4';
  } else {
    difficulty = 'advanced';
    jlptLevel = 'N3';
  }

  // Override JLPT level based on category if needed
  if (category === 'advanced' || level > 8) {
    jlptLevel = 'N2';
  }

  return { level, difficulty, jlptLevel };
}

function processExamples(word: any): ExampleSentence[] {
  if (!word.examples || !Array.isArray(word.examples)) return [];
  
  return word.examples
    .filter((ex: any) => ex.japanese && ex.english)
    .map((ex: any) => ({
      japanese: ex.japanese,
      english: ex.english,
      romaji: ex.romaji || ''
    }));
}

export function initializeQuizWords() {
  quizWordList = processedQuizWords.map((w, idx) => {
    const { level, difficulty, jlptLevel } = parseLevel(w.level, w.category);
    
    return {
      id: `qw-${idx + 1}`,
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
  quizWordsByLevel = {};
  quizWordList.forEach(word => {
    if (!quizWordsByLevel[word.level]) quizWordsByLevel[word.level] = [];
    quizWordsByLevel[word.level].push(word);
  });

  // Group by difficulty
  quizWordsByDifficulty = {
    beginner: [],
    intermediate: [],
    advanced: []
  };
  quizWordList.forEach(word => {
    quizWordsByDifficulty[word.difficulty].push(word);
  });

  // Group by category
  quizWordsByCategory = {};
  quizWordList.forEach(word => {
    const cat = word.category || 'noun';
    if (!quizWordsByCategory[cat]) quizWordsByCategory[cat] = [];
    quizWordsByCategory[cat].push(word);
  });

  // Group by JLPT level
  quizWordsByJLPT = {};
  quizWordList.forEach(word => {
    if (word.jlptLevel) {
      if (!quizWordsByJLPT[word.jlptLevel]) quizWordsByJLPT[word.jlptLevel] = [];
      quizWordsByJLPT[word.jlptLevel].push(word);
    }
  });

  // Log the number of words in each category
  console.log('Quiz words by category:');
  Object.entries(quizWordsByCategory).forEach(([category, words]) => {
    console.log(`${category}: ${words.length} words`);
  });
}

// Initialize quiz words on module load
initializeQuizWords();

// Export a function to check if words are loaded
export function areWordsLoaded(): boolean {
  return quizWordList.length > 0;
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