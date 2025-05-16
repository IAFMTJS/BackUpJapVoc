export interface JapaneseWord {
  id: string;
  japanese: string;
  english: string;
  romaji: string;
  hiragana: string;
  kanji?: string;
  level: number;
  category: string;
  examples: ExampleSentence[];
  notes?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  jlptLevel?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  isHiragana?: boolean;
  isKatakana?: boolean;
}

export interface ExampleSentence {
  japanese: string;
  english: string;
  romaji: string;
  notes?: string;
}

export interface WordLevel {
  level: number;
  requiredScore: number;
  words: JapaneseWord[];
  description: string;
  unlocked: boolean;
  requirements: LevelRequirement[];
  jlptLevel: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  practiceCategories: string[];
  readingMaterials: {
    title: string;
    difficulty: 'easy' | 'medium' | 'hard';
    content: string;
    vocabulary: string[];
  }[];
  requiredWordMastery: {
    minWords: number;
    masteryThreshold: number;
  };
}

export interface LevelRequirement {
  type: 'quiz' | 'practice' | 'reading';
  description: string;
  target: number;
  current: number;
  completed: boolean;
}

export interface WordProgress {
  wordId: string;
  correctAttempts: number;
  incorrectAttempts: number;
  lastPracticed: Date;
  mastered: boolean;
}

export interface LevelProgress {
  level: number;
  completed: boolean;
  score: number;
  wordsMastered: number;
  totalWords: number;
  unlockedAt?: Date;
  completedAt?: Date;
}

export interface QuizAttempt {
  level: number;
  score: number;
  date: Date;
}

export interface JLPTTest {
  level: string;
  score: number;
  date: Date;
}

export interface ReadingPractice {
  level: number;
  completed: boolean;
  date: Date;
}

export interface UserProgress {
  currentLevel: number;
  levels: LevelProgress[];
  wordProgress: Record<string, WordProgress>;
  quizHistory: QuizAttempt[];
  jlptTests: JLPTTest[];
  readingPractice: ReadingPractice[];
  totalScore: number;
  lastUpdated: Date;
} 