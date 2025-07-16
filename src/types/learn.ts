export type Level = {
  id: number;
  title: string;
  description: string;
  category: "kana" | "vocab" | "kanji" | "grammar" | "mixed";
  estimatedTime: string;
  minScore: number;
  nextUnlocks: number[];
  exercises: ExerciseBlock[];
};

export type ExerciseBlock = {
  title: string;
  instruction: string;
  exerciseType: "multipleChoice" | "typeAnswer" | "memoryGame" | "audioListen" | "grammarFill";
  pointsPerItem: number;
  items: ExerciseItem[];
};

export type ExerciseItem = {
  question: string;
  answer: string;
  options?: string[];
  audio?: string;
  hint?: string;
};

export type UserProgress = {
  [levelId: string]: {
    score: number;
    passed: boolean;
    unlocked: boolean;
    timestamp: string;
    completedAt?: string;
    attempts: number;
  };
};

export type LevelProgress = {
  score: number;
  passed: boolean;
  unlocked: boolean;
  timestamp: string;
  completedAt?: string;
  attempts: number;
};

export type ExerciseResult = {
  exerciseIndex: number;
  itemIndex: number;
  correct: boolean;
  userAnswer: string;
  correctAnswer: string;
  timeSpent: number;
};

export type LevelResult = {
  levelId: number;
  score: number;
  totalPoints: number;
  maxPoints: number;
  passed: boolean;
  completedAt: string;
  exerciseResults: ExerciseResult[];
  timeSpent: number;
}; 