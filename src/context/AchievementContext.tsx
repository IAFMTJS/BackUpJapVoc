import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useProgress } from './ProgressContext';
import { useWordLevel } from './WordLevelContext';
import { useAuth } from './AuthContext';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { v4 as uuidv4 } from 'uuid';
import { 
  Achievement, 
  AchievementCategory, 
  AchievementContextType, 
  AchievementProgress,
  INITIAL_ACHIEVEMENTS 
} from '../types/achievements';

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

export const AchievementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { progress: userProgress } = useProgress();
  const { currentLevel, unlockedLevels } = useWordLevel();
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [progress, setProgress] = useState<AchievementProgress>({});
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load achievements from Firestore
  useEffect(() => {
    const loadAchievements = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const userAchievementsRef = doc(db, 'users', user.uid, 'achievements', 'progress');
        const docSnap = await getDoc(userAchievementsRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as AchievementProgress;
          setProgress(data);
          
          // Update achievements with progress
          const updatedAchievements = achievements.map(achievement => ({
            ...achievement,
            progress: data[achievement.id]?.progress || 0,
            unlockedAt: data[achievement.id]?.unlockedAt?.toDate()
          }));
          
          setAchievements(updatedAchievements);
          setUnlockedAchievements(updatedAchievements.filter(a => a.unlockedAt));
        } else {
          // Initialize achievements progress for new users
          const initialProgress: AchievementProgress = {};
          achievements.forEach(achievement => {
            initialProgress[achievement.id] = { progress: 0 };
          });
          await setDoc(userAchievementsRef, initialProgress);
          setProgress(initialProgress);
        }
      } catch (err) {
        console.error('Error loading achievements:', err);
        setError('Failed to load achievements');
      } finally {
        setIsLoading(false);
      }
    };

    loadAchievements();
  }, [user]);

  // Update achievement progress based on user actions
  useEffect(() => {
    const updateAchievementProgress = async () => {
      if (!user) return;

      const updates: Partial<AchievementProgress> = {};
      
      achievements.forEach(achievement => {
        let newProgress = 0;

        switch (achievement.id) {
          case 'first_word':
            newProgress = Object.keys(userProgress).length > 0 ? 1 : 0;
            break;
          case 'word_master':
            newProgress = Object.values(userProgress).filter(p => p.correct >= 3).length;
            break;
          case 'streak_3':
            const streak = calculateStreak(userProgress);
            newProgress = Math.min(streak, 3);
            break;
          case 'perfect_quiz':
            // This will be updated when quiz is completed
            break;
          case 'kanji_beginner':
            newProgress = Object.keys(userProgress).filter(key => key.startsWith('kanji-')).length;
            break;
        }

        if (newProgress !== progress[achievement.id]?.progress) {
          updates[achievement.id] = {
            progress: newProgress,
            ...(newProgress >= achievement.maxProgress && !progress[achievement.id]?.unlockedAt && {
              unlockedAt: new Date()
            })
          };
        }
      });

      if (Object.keys(updates).length > 0) {
        try {
          const userAchievementsRef = doc(db, 'users', user.uid, 'achievements', 'progress');
          await updateDoc(userAchievementsRef, updates);
          setProgress(prev => ({ ...prev, ...updates }));
          
          // Update achievements state
          setAchievements(prev => prev.map(achievement => {
            const update = updates[achievement.id];
            if (!update) return achievement;
            
            const updated = {
              ...achievement,
              progress: update.progress,
              unlockedAt: update.unlockedAt || achievement.unlockedAt
            };
            
            if (update.unlockedAt && !achievement.unlockedAt) {
              setUnlockedAchievements(prev => [...prev, updated]);
            }
            
            return updated;
          }));
        } catch (err) {
          console.error('Error updating achievements:', err);
          setError('Failed to update achievements');
        }
      }
    };

    updateAchievementProgress();
  }, [user, userProgress, achievements, progress]);

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

  const checkAchievements = useCallback((category: AchievementCategory, value: number) => {
    if (!user) return;

    const updates: Partial<AchievementProgress> = {};
    
    achievements
      .filter(achievement => 
        achievement.category === category && 
        !achievement.unlockedAt &&
        achievement.progress < achievement.maxProgress
      )
      .forEach(achievement => {
        const newProgress = Math.min(value, achievement.maxProgress);
        if (newProgress !== progress[achievement.id]?.progress) {
          updates[achievement.id] = {
            progress: newProgress,
            ...(newProgress >= achievement.maxProgress && {
              unlockedAt: new Date()
            })
          };
        }
      });

    if (Object.keys(updates).length > 0) {
      const userAchievementsRef = doc(db, 'users', user.uid, 'achievements', 'progress');
      updateDoc(userAchievementsRef, updates)
        .then(() => {
          setProgress(prev => ({ ...prev, ...updates }));
          setAchievements(prev => prev.map(achievement => {
            const update = updates[achievement.id];
            if (!update) return achievement;
            
            const updated = {
              ...achievement,
              progress: update.progress,
              unlockedAt: update.unlockedAt || achievement.unlockedAt
            };
            
            if (update.unlockedAt && !achievement.unlockedAt) {
              setUnlockedAchievements(prev => [...prev, updated]);
            }
            
            return updated;
          }));
        })
        .catch(err => {
          console.error('Error updating achievements:', err);
          setError('Failed to update achievements');
        });
    }
  }, [user, achievements, progress]);

  const getAchievementProgress = useCallback((achievementId: string) => {
    return progress[achievementId]?.progress || 0;
  }, [progress]);

  const isAchievementUnlocked = useCallback((achievementId: string) => {
    return !!progress[achievementId]?.unlockedAt;
  }, [progress]);

  const value: AchievementContextType = {
    achievements,
    progress,
    unlockedAchievements,
    checkAchievements,
    getAchievementProgress,
    isAchievementUnlocked,
    isLoading,
    error
  };

  return (
    <AchievementContext.Provider value={value}>
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