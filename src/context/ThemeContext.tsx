import React, { createContext, useContext, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'blue' | 'green';

interface ThemeContextType {
  theme: Theme;
  isDarkMode: boolean;
  setTheme: (theme: Theme) => void;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const value = {
    theme,
    isDarkMode,
    setTheme,
    toggleDarkMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      <div className={`${isDarkMode ? 'dark' : ''} theme-${theme}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}; 