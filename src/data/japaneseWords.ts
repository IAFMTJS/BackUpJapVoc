import { JapaneseWord, ExampleSentence } from './types';
import processedWords from './processed_words.json';

console.log('Loading processed words...');
console.log('Number of processed words:', processedWords?.length || 0);

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

// Map processedWords to JapaneseWord[]
console.log('Mapping processed words to JapaneseWord[]...');
export const allWords: JapaneseWord[] = (processedWords as any[]).map((w, idx) => {
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
console.log('Finished mapping words. Total words:', allWords.length);

// Group by level
export const wordsByLevel: Record<number, JapaneseWord[]> = {};
allWords.forEach(word => {
  if (!wordsByLevel[word.level]) wordsByLevel[word.level] = [];
  wordsByLevel[word.level].push(word);
});

// Group by difficulty
export const wordsByDifficulty: Record<'beginner' | 'intermediate' | 'advanced', JapaneseWord[]> = {
  beginner: [],
  intermediate: [],
  advanced: []
};
allWords.forEach(word => {
  wordsByDifficulty[word.difficulty].push(word);
});

// Group by category
export const wordsByCategory: Record<string, JapaneseWord[]> = {};
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
export const wordsByJLPT: Record<string, JapaneseWord[]> = {};
allWords.forEach(word => {
  if (word.jlptLevel) {
    if (!wordsByJLPT[word.jlptLevel]) wordsByJLPT[word.jlptLevel] = [];
    wordsByJLPT[word.jlptLevel].push(word);
  }
});

// Log the number of words in each JLPT level
console.log('Words by JLPT level:');
Object.entries(wordsByJLPT).forEach(([level, words]) => {
  console.log(`${level}: ${words.length} words`);
});

// We'll continue adding more words in subsequent edits... 