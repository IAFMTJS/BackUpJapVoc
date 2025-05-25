export type AchievementCategory = 
  | 'vocabulary'
  | 'kanji'
  | 'streak'
  | 'special';

export type AchievementTier = 
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  tier: AchievementTier;
  icon: string;
  requirement: number;
  progress: number;
  unlockedAt?: Date;
  xpReward: number;
}

export interface AchievementProgress {
  [achievementId: string]: {
    progress: number;
    unlockedAt?: Date;
  };
}

export interface AchievementContextType {
  achievements: Achievement[];
  progress: AchievementProgress;
  unlockedAchievements: Achievement[];
  checkAchievements: (category: AchievementCategory, value: number) => void;
  getAchievementProgress: (achievementId: string) => number;
  isAchievementUnlocked: (achievementId: string) => boolean;
}

// Initial achievements data
export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'vocab_beginner',
    title: 'Vocabulary Beginner',
    description: 'Learn your first 10 vocabulary words',
    category: 'vocabulary',
    tier: 'bronze',
    icon: '📚',
    requirement: 10,
    progress: 0,
    xpReward: 100
  },
  {
    id: 'vocab_intermediate',
    title: 'Vocabulary Intermediate',
    description: 'Learn 50 vocabulary words',
    category: 'vocabulary',
    tier: 'silver',
    icon: '📖',
    requirement: 50,
    progress: 0,
    xpReward: 250
  },
  {
    id: 'vocab_master',
    title: 'Vocabulary Master',
    description: 'Learn 200 vocabulary words',
    category: 'vocabulary',
    tier: 'gold',
    icon: '🎓',
    requirement: 200,
    progress: 0,
    xpReward: 500
  },
  {
    id: 'kanji_beginner',
    title: 'Kanji Beginner',
    description: 'Learn your first 5 kanji',
    category: 'kanji',
    tier: 'bronze',
    icon: '✍️',
    requirement: 5,
    progress: 0,
    xpReward: 100
  },
  {
    id: 'kanji_intermediate',
    title: 'Kanji Intermediate',
    description: 'Learn 25 kanji',
    category: 'kanji',
    tier: 'silver',
    icon: '🖋️',
    requirement: 25,
    progress: 0,
    xpReward: 250
  },
  {
    id: 'kanji_master',
    title: 'Kanji Master',
    description: 'Learn 100 kanji',
    category: 'kanji',
    tier: 'gold',
    icon: '🏆',
    requirement: 100,
    progress: 0,
    xpReward: 500
  },
  {
    id: 'streak_3',
    title: 'Getting Started',
    description: 'Maintain a 3-day study streak',
    category: 'streak',
    tier: 'bronze',
    icon: '🔥',
    requirement: 3,
    progress: 0,
    xpReward: 100
  },
  {
    id: 'streak_7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day study streak',
    category: 'streak',
    tier: 'silver',
    icon: '⚡',
    requirement: 7,
    progress: 0,
    xpReward: 250
  },
  {
    id: 'streak_30',
    title: 'Monthly Master',
    description: 'Maintain a 30-day study streak',
    category: 'streak',
    tier: 'gold',
    icon: '🌟',
    requirement: 30,
    progress: 0,
    xpReward: 500
  }
]; 