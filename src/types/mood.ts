export type EmotionalCategory = 
  | 'happiness'
  | 'sadness'
  | 'anger'
  | 'love'
  | 'fear'
  | 'surprise'
  | 'disgust'
  | 'neutral'
  | 'gratitude'
  | 'empathy'
  | 'respect'
  | 'determination'
  | 'romantic'
  | 'angry'
  | 'annoyed'
  | 'empathetic'
  | 'motivational'
  | 'playful'
  | 'positive'
  | 'indifferent';

export type FormalityLevel = 'casual' | 'polite' | 'formal';

export interface EmotionalContext {
  category: EmotionalCategory;
  originalCategory: string;
  intensity: number;
  relatedEmotions: string[];
  emoji: string;
  usageNotes: string[];
}

export interface MoodWord {
  id: string;
  japanese: string;
  romaji: string;
  english: string;
  emotionalContext: EmotionalContext;
  mastered: boolean;
  lastReviewed: Date;
  formality: FormalityLevel;
  commonResponses: string[];
}

export interface MoodWordStats {
  total: number;
  mastered: number;
  byCategory: Record<EmotionalCategory, number>;
  byFormality: Record<FormalityLevel, number>;
}

export const EMOTIONAL_CATEGORIES: Record<EmotionalCategory, { 
  name: string;
  emoji: string;
  description: string;
}> = {
  happiness: {
    name: 'Happiness',
    emoji: '😊',
    description: 'Expressions of joy, contentment, and positive feelings'
  },
  sadness: {
    name: 'Sadness',
    emoji: '😢',
    description: 'Expressions of sorrow, grief, and melancholy'
  },
  anger: {
    name: 'Anger',
    emoji: '😠',
    description: 'Expressions of frustration, irritation, and rage'
  },
  love: {
    name: 'Love',
    emoji: '❤️',
    description: 'Expressions of affection, care, and deep emotional connection'
  },
  fear: {
    name: 'Fear',
    emoji: '😨',
    description: 'Expressions of anxiety, worry, and apprehension'
  },
  surprise: {
    name: 'Surprise',
    emoji: '😲',
    description: 'Expressions of astonishment and unexpected events'
  },
  disgust: {
    name: 'Disgust',
    emoji: '🤢',
    description: 'Expressions of strong aversion and repulsion'
  },
  neutral: {
    name: 'Neutral',
    emoji: '😐',
    description: 'Expressions of calmness and emotional balance'
  },
  gratitude: {
    name: 'Gratitude',
    emoji: '🙏',
    description: 'Expressions of thankfulness and appreciation'
  },
  empathy: {
    name: 'Empathy',
    emoji: '🤝',
    description: 'Expressions of understanding and shared feelings'
  },
  respect: {
    name: 'Respect',
    emoji: '🙇',
    description: 'Expressions of honor, esteem, and deference'
  },
  determination: {
    name: 'Determination',
    emoji: '💪',
    description: 'Expressions of resolve, willpower, and perseverance'
  },
  romantic: {
    name: 'Romantic',
    emoji: '💕',
    description: 'Expressions of romantic love and passion'
  },
  angry: {
    name: 'Angry',
    emoji: '😡',
    description: 'Expressions of strong anger and frustration'
  },
  annoyed: {
    name: 'Annoyed',
    emoji: '😤',
    description: 'Expressions of irritation and annoyance'
  },
  empathetic: {
    name: 'Empathetic',
    emoji: '🤗',
    description: 'Expressions of deep empathy and understanding'
  },
  motivational: {
    name: 'Motivational',
    emoji: '🔥',
    description: 'Expressions of motivation and encouragement'
  },
  playful: {
    name: 'Playful',
    emoji: '😋',
    description: 'Expressions of playfulness and fun'
  },
  positive: {
    name: 'Positive',
    emoji: '✨',
    description: 'Expressions of positivity and optimism'
  },
  indifferent: {
    name: 'Indifferent',
    emoji: '😑',
    description: 'Expressions of indifference and apathy'
  }
}; 