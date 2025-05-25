import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Achievement, 
  AchievementCategory, 
  AchievementContextType, 
  AchievementProgress,
  INITIAL_ACHIEVEMENTS 
} from '../types/achievements';
import { useAuth } from './AuthContext'; // Assuming you have an auth context
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const AchievementsContext = createContext<AchievementContextType | undefined>(undefined);

export const useAchievements = () => {
  const context = useContext(AchievementsContext);
  if (!context) {
    throw new Error('useAchievements must be used within an AchievementsProvider');
  }
  return context;
};

export const AchievementsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [progress, setProgress] = useState<AchievementProgress>({});
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);

  // Load achievements progress from Firestore
  useEffect(() => {
    const loadAchievementsProgress = async () => {
      if (!user) return;

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
    };

    loadAchievementsProgress();
  }, [user]);

  const updateAchievementProgress = async (
    achievementId: string, 
    newProgress: number, 
    unlocked: boolean = false
  ) => {
    if (!user) return;

    const userAchievementsRef = doc(db, 'users', user.uid, 'achievements', 'progress');
    const updateData: Partial<AchievementProgress> = {
      [achievementId]: {
        progress: newProgress,
        ...(unlocked && { unlockedAt: new Date() })
      }
    };

    await updateDoc(userAchievementsRef, updateData);

    setProgress(prev => ({
      ...prev,
      [achievementId]: {
        progress: newProgress,
        ...(unlocked && { unlockedAt: new Date() })
      }
    }));

    setAchievements(prev => 
      prev.map(achievement => 
        achievement.id === achievementId
          ? {
              ...achievement,
              progress: newProgress,
              ...(unlocked && { unlockedAt: new Date() })
            }
          : achievement
      )
    );

    if (unlocked) {
      const achievement = achievements.find(a => a.id === achievementId);
      if (achievement) {
        setUnlockedAchievements(prev => [...prev, { ...achievement, unlockedAt: new Date() }]);
      }
    }
  };

  const checkAchievements = useCallback((category: AchievementCategory, value: number) => {
    achievements
      .filter(achievement => 
        achievement.category === category && 
        !achievement.unlockedAt &&
        achievement.progress < achievement.requirement
      )
      .forEach(achievement => {
        const newProgress = Math.min(value, achievement.requirement);
        const unlocked = newProgress >= achievement.requirement;
        updateAchievementProgress(achievement.id, newProgress, unlocked);
      });
  }, [achievements]);

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
    isAchievementUnlocked
  };

  return (
    <AchievementsContext.Provider value={value}>
      {children}
    </AchievementsContext.Provider>
  );
}; 