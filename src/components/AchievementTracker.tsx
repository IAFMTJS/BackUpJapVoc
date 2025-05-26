import React, { useEffect } from 'react';
import { useProgress } from '../context/ProgressContext';
import { useAchievements } from '../context/AchievementsContext';

export const AchievementTracker: React.FC = () => {
  const { currentStreak } = useProgress();
  const { checkAchievements } = useAchievements();

  // Check achievements when streak changes
  useEffect(() => {
    if (currentStreak > 0) {
      checkAchievements('streak', currentStreak);
    }
  }, [currentStreak, checkAchievements]);

  return null; // This is a utility component, no UI needed
}; 