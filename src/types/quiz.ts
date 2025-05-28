export type Difficulty = 'easy' | 'medium' | 'hard' | 'extraHard';
export type QuizType = 'multiple-choice' | 'writing';
export type AnswerType = 'romaji' | 'english';
export type QuizMode = 'setup' | 'quiz' | 'result' | 'review' | 'learn' | 'pronunciation' | 'comparison';

export interface WordComparison {
  word: any;
  similarWords: any[];
  differences: string[];
}

export interface PronunciationPractice {
  word: any;
  userRecording: string | null;
  isCorrect: boolean | null;
  feedback: string | null;
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

export interface QuizSettings {
  category: string;
  difficulty: Difficulty;
  questionCount: number;
  quizType: QuizType;
  answerType: AnswerType;
  level: number;
  practiceMode: boolean;
  showExamples: boolean;
  learnMode: boolean;
  showJLPTLevel: boolean;
  pronunciationMode: boolean;
  comparisonMode: boolean;
  showSimilarWords: boolean;
  showKanjiInfo: boolean;
  showStrokeOrder: boolean;
  showMnemonics: boolean;
  showComponents: boolean;
  showHiragana: boolean;
  showKatakana: boolean;
  showRomaji: boolean;
}

export interface WordStats {
  correctAnswers: number;
  incorrectAnswers: number;
  lastSeen: Date | null;
  nextReview: Date | null;
  reviewCount: number;
}

export interface QuizState {
  mode: QuizMode;
  currentQuestion: number;
  selectedAnswer: string | null;
  showFeedback: boolean;
  isCorrect: boolean | null;
  showCorrect: boolean;
  currentWord: any | null;
  questions: any[];
  score: number;
  totalQuestions: number;
  completed: boolean;
  markedForReview: Set<number>;
  skippedQuestions: Set<number>;
  mistakes: Array<{
    word: any;
    userAnswer: string;
    correctAnswer: string;
    questionIndex: number;
  }>;
  practiceMode: boolean;
  wordStats: Record<string, WordStats>;
  showExamples: boolean;
  learnProgress: number;
  currentComparison: WordComparison | null;
  pronunciationPractice: PronunciationPractice | null;
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
  category: 'all',
  difficulty: 'easy',
  questionCount: 10,
  quizType: 'multiple-choice',
  answerType: 'romaji',
  level: 1,
  practiceMode: false,
  showExamples: true,
  learnMode: false,
  showJLPTLevel: true,
  pronunciationMode: false,
  comparisonMode: false,
  showSimilarWords: true,
  showKanjiInfo: true,
  showStrokeOrder: true,
  showMnemonics: true,
  showComponents: true,
  showHiragana: true,
  showKatakana: true,
  showRomaji: true
}; 