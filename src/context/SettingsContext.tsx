import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import safeLocalStorage from '../utils/safeLocalStorage';

interface Settings {
  id: string;
  useTimer: boolean;
  timeLimit: number;
  showRomaji: boolean;
  showHints: boolean;
  soundEnabled: boolean;
  darkMode: boolean;
  dailyGoal: number;
  safeMode: boolean;
  // Navigation settings
  navigationSettings: {
    showHome: boolean;
    showLearning: boolean;
    showVSensei: boolean;
    showSRS: boolean;
    showGames: boolean;
    showProgress: boolean;
    showDictionary: boolean;
    showKnowing: boolean;
    showAnime: boolean;
    showSettings: boolean;
  };
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  isLoading: boolean;
  error: string | null;
}

const defaultSettings: Settings = {
  id: 'default',
  useTimer: true,
  timeLimit: 30,
  showRomaji: true,
  showHints: true,
  soundEnabled: true,
  darkMode: false,
  dailyGoal: 20,
  safeMode: false,
  navigationSettings: {
    showHome: true,
    showLearning: true,
    showVSensei: true,
    showSRS: true,
    showGames: true,
    showProgress: true,
    showDictionary: true,
    showKnowing: true,
    showAnime: true,
    showSettings: true,
  },
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const savedSettings = safeLocalStorage.getItem('settings');
      return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
    } catch (error) {
      console.error('Error loading settings:', error);
      return defaultSettings;
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateSettings = (newSettings: Partial<Settings>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      setSettings(prev => {
        const updated = { ...prev, ...newSettings };
        safeLocalStorage.setItem('settings', JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      console.error('Error updating settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to update settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SettingsContext.Provider value={{ 
      settings, 
      updateSettings, 
      isLoading, 
      error 
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    console.warn('[useSettings] Context is undefined, returning default values');
    // Return default context values instead of throwing an error
    return {
      settings: defaultSettings,
      updateSettings: () => {},
      isLoading: false,
      error: null
    };
  }
  return context;
}; 