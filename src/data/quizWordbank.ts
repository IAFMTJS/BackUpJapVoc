import { JapaneseWord } from './types';
import { Difficulty, QuizCategory } from '../types/quiz';

interface QuizWord extends JapaneseWord {
  quizMetadata: {
    difficulty: Difficulty;
    category: QuizCategory;
    hints: string[];
    commonMistakes: string[];
    exampleSentences: {
      japanese: string;
      english: string;
      romaji: string;
    }[];
    relatedWords: string[];
    usageNotes?: string;
    pronunciationTips?: string[];
  };
}

// Quiz-specific categories
const QUIZ_CATEGORIES: QuizCategory[] = [
  'basic',
  'greeting',
  'pronoun',
  'verb',
  'adjective',
  'adverb',
  'noun',
  'particle',
  'number',
  'time',
  'family',
  'food',
  'animal',
  'weather',
  'body',
  'work',
  'school',
  'transportation',
  'shopping',
  'emotion',
  'direction',
  'color',
  'language',
  'other'
];

// Difficulty mapping based on level and JLPT
const getDifficulty = (level: number, jlptLevel: string): Difficulty => {
  if (level <= 2) return 'easy';
  if (level <= 4) return 'medium';
  if (level <= 6) return 'hard';
  return 'expert';
};

// Category mapping from processed words to quiz categories
const categoryMapping: Record<string, QuizCategory> = {
  // Basic Categories
  'greeting': 'greeting',
  'question': 'basic',
  'pronoun': 'pronoun',
  
  // Parts of Speech
  'verb': 'verb',
  'adjective': 'adjective',
  'adverb': 'adverb',
  'particle': 'particle',
  'conjunction': 'other',
  'interjection': 'other',
  
  // Topic Categories
  'food': 'food',
  'drink': 'food',
  'animal': 'animal',
  'animals': 'animal',
  'color': 'color',
  'colors': 'color',
  'number': 'number',
  'numbers': 'number',
  'family': 'family',
  'weather': 'weather',
  'time': 'time',
  'body': 'body',
  'work': 'work',
  'emotion': 'emotion',
  'emotions': 'emotion',
  'school': 'school',
  'education': 'school',
  'clothing': 'other',
  'clothes': 'other',
  'transportation': 'transportation',
  'nature': 'other',
  'house': 'other',
  'housing': 'other',
  'city': 'other',
  'technology': 'other',
  'health': 'body',
  'hobbies': 'other',
  'travel': 'other',
  'shopping': 'shopping',
  'money': 'other',
  'direction': 'direction',
  'location': 'direction',
  'measurement': 'other',
  'language': 'language',
  
  // Special Categories
  'idiom': 'other',
  'proverb': 'other',
  'onomatopoeia': 'other',
  'honorific': 'other',
  'slang': 'other',
  
  // Writing Systems
  'hiragana': 'basic',
  'katakana': 'basic'
};

// Generate hints based on word properties
const generateHints = (word: any): string[] => {
  const hints: string[] = [];
  
  // Add JLPT level hint
  if (word.jlptLevel) {
    hints.push(`This word appears in JLPT ${word.jlptLevel}`);
  }
  
  // Add category hint
  if (word.category) {
    hints.push(`This is a ${word.category} word`);
  }
  
  // Add writing system hint
  if (word.kanji) {
    hints.push('This word uses kanji');
  } else if (/^[ぁ-んァ-ンー]+$/.test(word.kana)) {
    hints.push('This word is written in hiragana/katakana only');
  }
  
  // Add length hint
  if (word.kana.length <= 2) {
    hints.push('This is a short word');
  } else if (word.kana.length >= 4) {
    hints.push('This is a longer word');
  }
  
  return hints;
};

// Generate common mistakes based on word properties
const generateCommonMistakes = (word: any): string[] => {
  const mistakes: string[] = [];
  
  // Add romaji-specific mistakes
  if (word.romaji) {
    if (word.romaji.includes('ō')) {
      mistakes.push('Remember that "ō" is a long "o" sound');
    }
    if (word.romaji.includes('ū')) {
      mistakes.push('Remember that "ū" is a long "u" sound');
    }
    if (word.romaji.includes('nn')) {
      mistakes.push('Remember that "nn" represents the small tsu (っ)');
    }
  }
  
  // Add kanji-specific mistakes
  if (word.kanji) {
    mistakes.push('Watch out for similar-looking kanji');
  }
  
  return mistakes;
};

// Generate example sentences based on word properties
const generateExampleSentences = (word: any): { japanese: string; english: string; romaji: string; }[] => {
  const examples: { japanese: string; english: string; romaji: string; }[] = [];
  
  // Basic example for pronouns
  if (word.category === 'pronoun') {
    examples.push({
      japanese: `${word.kana}は学生です。`,
      english: `I am a student.`,
      romaji: `${word.romaji} wa gakusei desu.`
    });
  }
  
  // Basic example for nouns
  if (word.category === 'noun') {
    examples.push({
      japanese: `これは${word.kana}です。`,
      english: `This is ${word.english}.`,
      romaji: `Kore wa ${word.romaji} desu.`
    });
  }
  
  // Add more category-specific examples as needed
  
  return examples;
};

// Process words into quiz format
export const processQuizWords = async (): Promise<QuizWord[]> => {
  try {
    // Fetch processed words
    const response = await fetch('/data/processed_words.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch processed words: ${response.status}`);
    }
    const processedWords = await response.json();
    
    // Convert to quiz words
    const quizWords: QuizWord[] = processedWords.map((word: any) => ({
      id: word.id || `qw-${Math.random().toString(36).substr(2, 9)}`,
      kanji: word.kanji || '',
      kana: word.kana,
      english: word.english,
      romaji: word.romaji,
      level: word.level || 1,
      category: categoryMapping[word.category] || 'other',
      jlptLevel: word.jlptLevel || 'N5',
      examples: word.examples || [],
      notes: word.notes || '',
      quizMetadata: {
        difficulty: getDifficulty(word.level || 1, word.jlptLevel || 'N5'),
        category: categoryMapping[word.category] || 'other',
        hints: generateHints(word),
        commonMistakes: generateCommonMistakes(word),
        exampleSentences: generateExampleSentences(word),
        relatedWords: [], // To be implemented with word relationships
        usageNotes: word.notes,
        pronunciationTips: word.romaji ? [`Practice saying: ${word.romaji}`] : []
      }
    }));
    
    return quizWords;
  } catch (error) {
    console.error('Error processing quiz words:', error);
    return [];
  }
};

// Get words by difficulty
export const getWordsByDifficulty = (words: QuizWord[], difficulty: Difficulty): QuizWord[] => {
  return words.filter(word => word.quizMetadata.difficulty === difficulty);
};

// Get words by category
export const getWordsByCategory = (words: QuizWord[], category: QuizCategory): QuizWord[] => {
  return words.filter(word => word.quizMetadata.category === category);
};

// Get words by level
export const getWordsByLevel = (words: QuizWord[], level: number): QuizWord[] => {
  return words.filter(word => word.level === level);
};

// Get words by JLPT level
export const getWordsByJLPTLevel = (words: QuizWord[], jlptLevel: string): QuizWord[] => {
  return words.filter(word => word.jlptLevel === jlptLevel);
};

// Get random words for quiz
export const getRandomQuizWords = (
  words: QuizWord[],
  count: number,
  options: {
    difficulty?: Difficulty;
    category?: QuizCategory;
    level?: number;
    jlptLevel?: string;
  } = {}
): QuizWord[] => {
  let filteredWords = [...words];
  
  // Apply filters
  if (options.difficulty) {
    filteredWords = filteredWords.filter(word => word.quizMetadata.difficulty === options.difficulty);
  }
  if (options.category) {
    filteredWords = filteredWords.filter(word => word.quizMetadata.category === options.category);
  }
  if (options.level) {
    filteredWords = filteredWords.filter(word => word.level === options.level);
  }
  if (options.jlptLevel) {
    filteredWords = filteredWords.filter(word => word.jlptLevel === options.jlptLevel);
  }
  
  // Shuffle and return requested number of words
  return filteredWords
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
};

// Export the wordbank
export let quizWordbank: QuizWord[] = [];

// Initialize the wordbank
export const initializeQuizWordbank = async (): Promise<void> => {
  quizWordbank = await processQuizWords();
  console.log(`Initialized quiz wordbank with ${quizWordbank.length} words`);
};

// Check if wordbank is initialized
export const isQuizWordbankInitialized = (): boolean => {
  return quizWordbank.length > 0;
};

// Wait for wordbank to be initialized
export const waitForQuizWordbank = async (): Promise<void> => {
  while (!isQuizWordbankInitialized()) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}; 