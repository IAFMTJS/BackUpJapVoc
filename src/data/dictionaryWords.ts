import { JapaneseWord, ExampleSentence } from './types';

// Initialize empty arrays
export let dictionaryWords: JapaneseWord[] = [];
export let dictionaryWordsByLevel: { [key: number]: JapaneseWord[] } = {};
export let dictionaryWordsByDifficulty: {
  beginner: JapaneseWord[];
  intermediate: JapaneseWord[];
  advanced: JapaneseWord[];
} = {
  beginner: [],
  intermediate: [],
  advanced: []
};
export let dictionaryWordsByCategory: { [key: string]: JapaneseWord[] } = {};
export let dictionaryWordsByJLPT: { [key: string]: JapaneseWord[] } = {};

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

export function initializeDictionaryWords(words: any[]) {
  dictionaryWords = words.map((w, idx) => {
    const { level, difficulty, jlptLevel } = parseLevel(w.level, w.category);
    
    return {
      id: `dw-${idx + 1}`,
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
  dictionaryWordsByLevel = {};
  dictionaryWords.forEach(word => {
    if (!dictionaryWordsByLevel[word.level]) dictionaryWordsByLevel[word.level] = [];
    dictionaryWordsByLevel[word.level].push(word);
  });

  // Group by difficulty
  dictionaryWordsByDifficulty = {
    beginner: [],
    intermediate: [],
    advanced: []
  };
  dictionaryWords.forEach(word => {
    dictionaryWordsByDifficulty[word.difficulty].push(word);
  });

  // Group by category
  dictionaryWordsByCategory = {};
  dictionaryWords.forEach(word => {
    const cat = word.category || 'noun';
    if (!dictionaryWordsByCategory[cat]) dictionaryWordsByCategory[cat] = [];
    dictionaryWordsByCategory[cat].push(word);
  });

  // Group by JLPT level
  dictionaryWordsByJLPT = {};
  dictionaryWords.forEach(word => {
    if (word.jlptLevel) {
      if (!dictionaryWordsByJLPT[word.jlptLevel]) dictionaryWordsByJLPT[word.jlptLevel] = [];
      dictionaryWordsByJLPT[word.jlptLevel].push(word);
    }
  });

  // Log the number of words in each category
  console.log('Dictionary words by category:');
  Object.entries(dictionaryWordsByCategory).forEach(([category, words]) => {
    console.log(`${category}: ${words.length} words`);
  });
} 