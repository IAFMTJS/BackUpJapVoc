// Basic point type for stroke coordinates
export interface Point {
  x: number;
  y: number;
  timestamp?: number;
}

// Stroke types that can be recognized
export type StrokeType = 'horizontal' | 'vertical' | 'diagonal' | 'curve';

// Data structure for a single stroke
export interface StrokeData {
  type: StrokeType;
  direction: number;  // in degrees
  length: number;     // normalized length
  curvature: number;  // 0-1 value indicating curve intensity
  points: Point[];    // raw points of the stroke
}

// Feedback for stroke validation
export interface StrokeFeedback {
  isCorrect: boolean;
  message: string;
  expectedStroke: StrokeType;
  actualStroke: StrokeType;
  confidence: number;
  suggestions?: string[];
}

// Compound word practice data
export interface CompoundWordData {
  word: string;
  reading: string;
  meaning: string;
  kanji: string[];
  difficulty: number;
  examples: string[];
  relatedWords: string[];
}

// Stroke order data for a kanji
export interface KanjiStrokeData {
  character: string;
  strokes: StrokeType[];
  compoundWords: CompoundWordData[];
  difficulty: number;
  radicals: string[];
  meanings: string[];
  readings: {
    onyomi: string[];
    kunyomi: string[];
  };
}

// Practice session data
export interface PracticeSession {
  kanji: string;
  strokes: StrokeData[];
  score: number;
  feedback: StrokeFeedback[];
  timestamp: number;
  duration: number;
  mistakes: {
    strokeIndex: number;
    feedback: StrokeFeedback;
  }[];
}

// Progress tracking for kanji practice
export interface KanjiProgress {
  kanji: string;
  masteryLevel: number;
  lastPracticed: number;
  practiceHistory: PracticeSession[];
  compoundWordProgress: {
    [word: string]: {
      attempts: number;
      successes: number;
      lastPracticed: number;
    };
  };
  strokeOrderProgress: {
    correctStrokes: number;
    totalStrokes: number;
    lastScore: number;
  };
} 