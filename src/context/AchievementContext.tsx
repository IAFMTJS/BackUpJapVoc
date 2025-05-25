import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useProgress } from './ProgressContext';
import { useWordLevel } from './WordLevelContext';
import { v4 as uuidv4 } from 'uuid';

// Achievement types
export type AchievementCategory = 'learning' | 'mastery' | 'streak' | 'challenge' | 'social' | 'special';
export type AchievementDifficulty = 'easy' | 'medium' | 'hard' | 'expert';
export type AchievementStatus = 'locked' | 'in_progress' | 'completed';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  difficulty: AchievementDifficulty;
  status: AchievementStatus;
  progress: number;
  maxProgress: number;
  unlockedAt?: Date;
  icon: string;
  points: number;
  requirements: {
    type: string;
    value: number;
  }[];
  rewards: {
    type: string;
    value: number | string;
  }[];
}

interface AchievementContextType {
  achievements: Achievement[];
  unlockedAchievements: Achievement[];
  inProgressAchievements: Achievement[];
  totalPoints: number;
  isLoading: boolean;
  error: string | null;
  unlockAchievement: (achievementId: string) => Promise<void>;
  updateProgress: (achievementId: string, progress: number) => Promise<void>;
  getAchievementProgress: (achievementId: string) => number;
  getNextAchievement: () => Achievement | null;
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

// Initial achievements
const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_word',
    title: 'First Steps',
    description: 'Learn your first Japanese word',
    category: 'learning',
    difficulty: 'easy',
    status: 'locked',
    progress: 0,
    maxProgress: 1,
    icon: '🎯',
    points: 10,
    requirements: [{ type: 'words_learned', value: 1 }],
    rewards: [{ type: 'points', value: 10 }]
  },
  {
    id: 'word_master',
    title: 'Word Master',
    description: 'Master 10 words',
    category: 'mastery',
    difficulty: 'medium',
    status: 'locked',
    progress: 0,
    maxProgress: 10,
    icon: '📚',
    points: 50,
    requirements: [{ type: 'words_mastered', value: 10 }],
    rewards: [{ type: 'points', value: 50 }]
  },
  {
    id: 'streak_3',
    title: 'Consistent Learner',
    description: 'Maintain a 3-day study streak',
    category: 'streak',
    difficulty: 'easy',
    status: 'locked',
    progress: 0,
    maxProgress: 3,
    icon: '🔥',
    points: 30,
    requirements: [{ type: 'study_streak', value: 3 }],
    rewards: [{ type: 'points', value: 30 }]
  },
  {
    id: 'perfect_quiz',
    title: 'Perfect Score',
    description: 'Complete a quiz with 100% accuracy',
    category: 'mastery',
    difficulty: 'hard',
    status: 'locked',
    progress: 0,
    maxProgress: 1,
    icon: '⭐',
    points: 100,
    requirements: [{ type: 'perfect_quiz', value: 1 }],
    rewards: [{ type: 'points', value: 100 }]
  },
  {
    id: 'kanji_beginner',
    title: 'Kanji Beginner',
    description: 'Learn 10 kanji characters',
    category: 'learning',
    difficulty: 'medium',
    status: 'locked',
    progress: 0,
    maxProgress: 10,
    icon: '🀄',
    points: 40,
    requirements: [{ type: 'kanji_learned', value: 10 }],
    rewards: [{ type: 'points', value: 40 }]
  }
];

export const AchievementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { progress } = useProgress();
  const { currentLevel, unlockedLevels } = useWordLevel();

  // Load achievements from storage
  useEffect(() => {
    const loadAchievements = async () => {
      try {
        const storedAchievements = localStorage.getItem('achievements');
        if (storedAchievements) {
          setAchievements(JSON.parse(storedAchievements));
        }
      } catch (err) {
        console.error('Error loading achievements:', err);
        setError('Failed to load achievements');
      } finally {
        setIsLoading(false);
      }
    };

    loadAchievements();
  }, []);

  // Save achievements to storage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('achievements', JSON.stringify(achievements));
    }
  }, [achievements, isLoading]);

  // Update achievement progress based on user actions
  useEffect(() => {
    const updateAchievementProgress = async () => {
      setAchievements(prevAchievements => prevAchievements.map(achievement => {
        let newProgress = 0;

        switch (achievement.id) {
          case 'first_word':
            newProgress = Object.keys(progress).length > 0 ? 1 : 0;
            break;
          case 'word_master':
            newProgress = Object.values(progress).filter(p => p.correct >= 3).length;
            break;
          case 'streak_3':
            // Calculate streak from progress data
            const streak = calculateStreak(progress);
            newProgress = Math.min(streak, 3);
            break;
          case 'perfect_quiz':
            // This will be updated when quiz is completed
            break;
          case 'kanji_beginner':
            newProgress = Object.keys(progress).filter(key => key.startsWith('kanji-')).length;
            break;
        }

        const status = newProgress >= achievement.maxProgress ? 'completed' :
                      newProgress > 0 ? 'in_progress' : 'locked';

        return {
          ...achievement,
          progress: newProgress,
          status,
          unlockedAt: status === 'completed' && !achievement.unlockedAt ? new Date() : achievement.unlockedAt
        };
      }));
    };

    updateAchievementProgress();
  }, [progress]); // Only depend on progress changes

  const calculateStreak = (progress: Record<string, any>) => {
    const dates = Object.values(progress)
      .map(p => new Date(p.lastAttempted))
      .filter(d => !isNaN(d.getTime()));
    
    if (dates.length === 0) return 0;

    const sortedDates = dates.sort((a, b) => b.getTime() - a.getTime());
    let streak = 1;
    let currentDate = new Date(sortedDates[0]);
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i]);
      prevDate.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streak++;
        currentDate = prevDate;
      } else if (diffDays > 1) {
        break;
      }
    }

    return streak;
  };

  const unlockAchievement = useCallback(async (achievementId: string) => {
    setAchievements(prev => prev.map(achievement => 
      achievement.id === achievementId
        ? { ...achievement, status: 'completed', unlockedAt: new Date() }
        : achievement
    ));
  }, []);

  const updateProgress = useCallback(async (achievementId: string, progress: number) => {
    setAchievements(prev => prev.map(achievement => 
      achievement.id === achievementId
        ? { 
            ...achievement, 
            progress: Math.min(progress, achievement.maxProgress),
            status: progress >= achievement.maxProgress ? 'completed' : 'in_progress',
            unlockedAt: progress >= achievement.maxProgress && !achievement.unlockedAt 
              ? new Date() 
              : achievement.unlockedAt
          }
        : achievement
    ));
  }, []);

  const getAchievementProgress = useCallback((achievementId: string) => {
    const achievement = achievements.find(a => a.id === achievementId);
    return achievement ? achievement.progress : 0;
  }, [achievements]);

  const getNextAchievement = useCallback(() => {
    return achievements
      .filter(a => a.status === 'in_progress')
      .sort((a, b) => (b.maxProgress - b.progress) - (a.maxProgress - a.progress))[0] || null;
  }, [achievements]);

  const unlockedAchievements = achievements.filter(a => a.status === 'completed');
  const inProgressAchievements = achievements.filter(a => a.status === 'in_progress');
  const totalPoints = unlockedAchievements.reduce((sum, a) => sum + a.points, 0);

  return (
    <AchievementContext.Provider value={{
      achievements,
      unlockedAchievements,
      inProgressAchievements,
      totalPoints,
      isLoading,
      error,
      unlockAchievement,
      updateProgress,
      getAchievementProgress,
      getNextAchievement
    }}>
      {children}
    </AchievementContext.Provider>
  );
};

export const useAchievements = () => {
  const context = useContext(AchievementContext);
  if (context === undefined) {
    throw new Error('useAchievements must be used within an AchievementProvider');
  }
  return context;
}; 