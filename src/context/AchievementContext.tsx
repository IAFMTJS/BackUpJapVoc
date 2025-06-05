import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { 
  Achievement, 
  AchievementCategory, 
  AchievementContextType, 
  AchievementProgress,
  INITIAL_ACHIEVEMENTS 
} from '../types/achievements';

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

export const AchievementProvider: React.FC<{ 
  children: React.ReactNode;
  onProgressUpdate?: (achievementId: string, progress: number, unlocked: boolean) => void;
}> = ({ children, onProgressUpdate }) => {
  const { user } = useAuth();
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

  const updateAchievementProgress = useCallback(async (
    achievementId: string,
    newProgress: number,
    unlocked: boolean = false
  ) => {
    if (!user) return;

    try {
      const userAchievementsRef = doc(db, 'users', user.uid, 'achievements', 'progress');
      const updateData: Partial<AchievementProgress> = {
        [achievementId]: {
          progress: newProgress,
          ...(unlocked && { unlockedAt: new Date() })
        }
      };

      await updateDoc(userAchievementsRef, updateData);
      setProgress(prev => ({ ...prev, ...updateData }));

      setAchievements(prev => prev.map(achievement => {
        if (achievement.id !== achievementId) return achievement;
        
        const updated = {
          ...achievement,
          progress: newProgress,
          ...(unlocked && { unlockedAt: new Date() })
        };
        
        if (unlocked && !achievement.unlockedAt) {
          setUnlockedAchievements(prev => [...prev, updated]);
        }
        
        return updated;
      }));

      // Notify parent component of progress update
      onProgressUpdate?.(achievementId, newProgress, unlocked);
    } catch (err) {
      console.error('Error updating achievement progress:', err);
      setError('Failed to update achievement progress');
    }
  }, [user, onProgressUpdate]);

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
    updateAchievementProgress,
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