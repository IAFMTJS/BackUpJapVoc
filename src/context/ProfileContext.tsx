import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import safeLocalStorage from '../utils/safeLocalStorage';

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  level: number;
  experience: number;
  joinDate: Date;
  lastActive: Date;
  preferences: {
    language: string;
    timezone: string;
    notifications: boolean;
    privacy: 'public' | 'private' | 'friends';
  };
  stats: {
    totalWordsLearned: number;
    totalStudyTime: number;
    currentStreak: number;
    longestStreak: number;
    lessonsCompleted: number;
    achievementsUnlocked: number;
  };
}

interface ProfileContextType {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateStats: (stats: Partial<UserProfile['stats']>) => void;
  updatePreferences: (preferences: Partial<UserProfile['preferences']>) => void;
  resetProfile: () => void;
}

const defaultProfile: UserProfile = {
  id: 'default',
  username: 'Learner',
  level: 1,
  experience: 0,
  joinDate: new Date(),
  lastActive: new Date(),
  preferences: {
    language: 'en',
    timezone: 'UTC',
    notifications: true,
    privacy: 'public',
  },
  stats: {
    totalWordsLearned: 0,
    totalStudyTime: 0,
    currentStreak: 0,
    longestStreak: 0,
    lessonsCompleted: 0,
    achievementsUnlocked: 0,
  },
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load profile from localStorage on mount
  useEffect(() => {
    try {
      const savedProfile = safeLocalStorage.getItem('userProfile');
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        // Convert date strings back to Date objects
        parsedProfile.joinDate = new Date(parsedProfile.joinDate);
        parsedProfile.lastActive = new Date(parsedProfile.lastActive);
        setProfile(parsedProfile);
      } else {
        setProfile(defaultProfile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile');
      setProfile(defaultProfile);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save profile to localStorage whenever it changes
  useEffect(() => {
    if (profile) {
      try {
        safeLocalStorage.setItem('userProfile', JSON.stringify(profile));
      } catch (error) {
        console.error('Error saving profile:', error);
      }
    }
  }, [profile]);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      return updated;
    });
  };

  const updateStats = (stats: Partial<UserProfile['stats']>) => {
    setProfile(prev => {
      if (!prev) return null;
      const updated = {
        ...prev,
        stats: { ...prev.stats, ...stats }
      };
      return updated;
    });
  };

  const updatePreferences = (preferences: Partial<UserProfile['preferences']>) => {
    setProfile(prev => {
      if (!prev) return null;
      const updated = {
        ...prev,
        preferences: { ...prev.preferences, ...preferences }
      };
      return updated;
    });
  };

  const resetProfile = () => {
    setProfile(defaultProfile);
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        isLoading,
        error,
        updateProfile,
        updateStats,
        updatePreferences,
        resetProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = (): ProfileContextType => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}; 