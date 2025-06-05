import React from 'react';
import { ProgressProvider } from '../../context/ProgressContext';
import { AchievementProvider } from '../../context/AchievementContext';

export const ProgressAndAchievementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AchievementProvider>
      <ProgressProvider>
        {children}
      </ProgressProvider>
    </AchievementProvider>
  );
}; 