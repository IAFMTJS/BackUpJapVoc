import { DictionaryItem } from './dictionary';

// Quiz difficulty levels
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

// Quiz categories
export type QuizCategory =
  | 'basic'
  | 'greeting'
  | 'pronoun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'noun'
  | 'particle'
  | 'number'
  | 'time'
  | 'family'
  | 'food'
  | 'animal'
  | 'weather'
  | 'body'
  | 'work'
  | 'school'
  | 'transportation'
  | 'shopping'
  | 'emotion'
  | 'direction'
  | 'color'
  | 'language'
  | 'other';

// Quiz question types
export type QuestionType =
  | 'multiple-choice'
  | 'typing'
  | 'listening'
  | 'matching'
  | 'fill-in-blank'
  | 'sentence-construction';

// Quiz question interface
export interface QuizQuestion {
  id: string;
  type: QuestionType;
  word: string;
  correctAnswer: string;
  options?: string[];
  hint?: string;
  explanation?: string;
  difficulty: Difficulty;
  category: QuizCategory;
  points: number;
}

// Quiz session interface
export interface QuizSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  score: number;
  totalPoints: number;
  settings: QuizSettings;
  progress: QuizProgress;
}

// Quiz settings interface
export interface QuizSettings {
  difficulty: Difficulty;
  category?: QuizCategory;
  questionCount: number;
  timeLimit?: number; // in seconds
  allowHints: boolean;
  allowRetries: boolean;
  showExplanation: boolean;
  shuffleQuestions: boolean;
  includeAudio: boolean;
  includeWriting: boolean;
}

// Quiz progress interface
export interface QuizProgress {
  correctAnswers: number;
  incorrectAnswers: number;
  skippedQuestions: number;
  timeSpent: number; // in seconds
  hintsUsed: number;
  retriesUsed: number;
  currentStreak: number;
  bestStreak: number;
}

// Quiz result interface
export interface QuizResult {
  sessionId: string;
  score: number;
  totalPoints: number;
  accuracy: number;
  timeSpent: number;
  completedQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedQuestions: number;
  hintsUsed: number;
  retriesUsed: number;
  bestStreak: number;
  difficulty: Difficulty;
  category?: QuizCategory;
  startTime: Date;
  endTime: Date;
  performance: {
    byCategory: Record<QuizCategory, {
      correct: number;
      total: number;
      accuracy: number;
    }>;
    byDifficulty: Record<Difficulty, {
      correct: number;
      total: number;
      accuracy: number;
    }>;
  };
}

// Quiz feedback interface
export interface QuizFeedback {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
  hintsUsed: number;
  retriesUsed: number;
  feedback?: string;
}

// Quiz statistics interface
export interface QuizStats {
  totalQuizzes: number;
  averageScore: number;
  bestScore: number;
  totalTimeSpent: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  byDifficulty: Record<Difficulty, {
    quizzes: number;
    averageScore: number;
    bestScore: number;
    accuracy: number;
  }>;
  byCategory: Record<QuizCategory, {
    quizzes: number;
    averageScore: number;
    bestScore: number;
    accuracy: number;
  }>;
  recentResults: QuizResult[];
  streaks: {
    current: number;
    best: number;
    lastQuizDate?: Date;
  };
}

// Quiz error types
export type QuizError =
  | 'INSUFFICIENT_WORDS'
  | 'INVALID_SETTINGS'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'INVALID_ANSWER'
  | 'SESSION_EXPIRED'
  | 'UNKNOWN_ERROR';

// Quiz error interface
export interface QuizErrorDetails {
  type: QuizError;
  message: string;
  code?: number;
  details?: any;
}

export type QuizType = 'multiple-choice' | 'writing';
export type AnswerType = 'romaji' | 'english';
export type QuizMode = 'setup' | 'quiz' | 'result' | 'review' | 'learn' | 'pronunciation' | 'comparison' | 'active' | 'completed';

export interface WordComparison {
  word: any;
  similarWords: any[];
  differences: string[];
}

export interface PronunciationPractice {
  word: DictionaryItem;
  attempts: number;
  lastAttempt: Date | null;
  isCorrect: boolean | null;
  userRecording?: string;
  feedback?: string;
}

export interface KanjiComponent {
  character: string;
  meaning: string;
  reading: string;
  position: string;
}

export interface KanjiInfo {
  components: KanjiComponent[];
  mnemonics: string[];
  strokeOrder: string[];
  usageContext: string[];
  radicals: string[];
  onyomi: string[];
  kunyomi: string[];
}

export interface WordStats {
  attempts: number;
  correct: number;
  lastAttempt: Date;
  difficulty: number;
  correctAnswers: number;
  incorrectAnswers: number;
  lastSeen: Date | null;
  nextReview: Date | null;
  reviewCount: number;
}

export interface QuizState {
  mode: QuizMode;
  currentQuestion: number;
  selectedAnswer: QuizOption | null;
  showFeedback: boolean;
  isCorrect: boolean | null;
  showCorrect: boolean;
  currentWord: DictionaryItem | null;
  questions: DictionaryItem[];
  score: number;
  totalQuestions: number;
  completed: boolean;
  markedForReview: Set<number>;
  skippedQuestions: Set<number>;
  mistakes: Array<{ word: DictionaryItem; userAnswer: string }>;
  practiceMode: boolean;
  wordStats: Record<string, WordStats>;
  showExamples: boolean;
  pronunciationPractice: PronunciationPractice | null;
  currentComparison: { word1: DictionaryItem; word2: DictionaryItem } | null;
  learnProgress?: number;
}

export interface WordDifficulty {
  [key: string]: {
    correct: number;
    incorrect: number;
    lastSeen: number;
  };
}

export const INITIAL_WORD_STATS: WordStats = {
  correctAnswers: 0,
  incorrectAnswers: 0,
  lastSeen: null,
  nextReview: null,
  reviewCount: 0
};

export const SPACED_REPETITION_INTERVALS = [
  1, // 1 day
  3, // 3 days
  7, // 1 week
  14, // 2 weeks
  30, // 1 month
  90, // 3 months
  180 // 6 months
];

export const DEFAULT_QUIZ_SETTINGS: QuizSettings = {
  filterType: 'all',
  level: 1,
  category: 'all',
  jlptLevel: 'N5',
  questionCount: 10,
  includeLearned: true,
  includeUnlearned: true,
  showJLPTLevel: true,
  practiceMode: false,
  difficulty: 'all',
  showExamples: true,
  showRomaji: true,
  showHiragana: true,
  showKatakana: true,
  showKanjiInfo: true,
  useReviewMode: false,
  reviewSettings: {
    includeDueWords: false,
    includeNeedsReview: false,
    reviewThreshold: 0.5
  },
  timeLimit: 0
};

export interface QuizOption {
  text: string;
  isCorrect: boolean;
}

export interface AchievementData {
  type: 'quiz_completion' | 'streak' | 'mastery';
  data: {
    score?: number;
    streak?: number;
    totalQuestions?: number;
    wordId?: string;
    mastery?: number;
  };
} 