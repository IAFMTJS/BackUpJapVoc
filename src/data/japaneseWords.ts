import { JapaneseWord, ExampleSentence } from './types';
import processedWords from './processed_words.json';

// Helper to convert JLPT level string to number and difficulty
function parseLevel(level: string): { level: number; difficulty: 'beginner' | 'intermediate' | 'advanced'; jlptLevel?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' } {
  const jlptLevel = (level || '').toUpperCase() as 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | undefined;
  
  switch (jlptLevel) {
    case 'N5':
      return { level: 1, difficulty: 'beginner', jlptLevel: 'N5' };
    case 'N4':
      return { level: 2, difficulty: 'beginner', jlptLevel: 'N4' };
    case 'N3':
      return { level: 3, difficulty: 'intermediate', jlptLevel: 'N3' };
    case 'N2':
      return { level: 4, difficulty: 'intermediate', jlptLevel: 'N2' };
    case 'N1':
      return { level: 5, difficulty: 'advanced', jlptLevel: 'N1' };
    default:
      // fallback: try to parse as number, else level 1
      const n = parseInt(level, 10);
      const fallbackLevel = isNaN(n) ? 1 : n;
      return {
        level: fallbackLevel,
        difficulty: fallbackLevel <= 2 ? 'beginner' : fallbackLevel <= 4 ? 'intermediate' : 'advanced'
      };
  }
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
export const allWords: JapaneseWord[] = (processedWords as any[]).map((w, idx) => {
  const { level, difficulty, jlptLevel } = parseLevel(w.level);
  
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
    notes: w.notes || ''
  };
});

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

// Group by JLPT level
export const wordsByJLPT: Record<string, JapaneseWord[]> = {};
allWords.forEach(word => {
  if (word.jlptLevel) {
    if (!wordsByJLPT[word.jlptLevel]) wordsByJLPT[word.jlptLevel] = [];
    wordsByJLPT[word.jlptLevel].push(word);
  }
});

// We'll continue adding more words in subsequent edits... 