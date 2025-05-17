export interface AnimePhrase {
  japanese: string;
  romaji: string;
  english: string;
  context: string;
  example: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'greeting' | 'emotion' | 'action' | 'question' | 'response';
  animeImage?: string;
  characterName?: string;
  animeTitle?: string;
  id?: string;
}

export interface DifficultyRating {
  level: 1 | 2 | 3 | 4 | 5;
  aspects: {
    wordComplexity: number;
    grammarPatterns: number;
    speakingSpeed: number;
    culturalReferences: number;
    subtitleAvailability: number;
  };
  userRating?: number;
}

export interface WordBreakdown {
  word: string;
  meaning: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  partOfSpeech?: string;
  kanji?: string;
  furigana?: string;
}

export interface Prerequisite {
  type: 'grammar' | 'vocabulary' | 'cultural';
  name: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  completed?: boolean;
}

export interface LearningPath {
  steps: {
    order: number;
    title: string;
    description: string;
    type: 'grammar' | 'vocabulary' | 'cultural';
    resources?: string[];
    completed?: boolean;
  }[];
  estimatedTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
} 