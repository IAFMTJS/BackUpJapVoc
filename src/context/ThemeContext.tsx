import React, { createContext, useContext, useState, ReactNode } from 'react';

type Theme = 'dark' | 'light' | 'neon';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  getThemeClasses: () => {
    container: string;
    text: {
      primary: string;
      secondary: string;
      muted: string;
    };
    card: string;
    button: {
      primary: string;
      secondary: string;
    };
    input: string;
    nav: {
      background: string;
      link: {
        default: string;
        active: string;
      };
    };
    progress: {
      background: string;
      bar: string;
    };
    toggle: {
      active: string;
      default: string;
    };
    focus: {
      ring: string;
    };
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('dark');

  const getThemeClasses = () => {
    // For now, we only implement the dark theme
    return {
      container: 'bg-dark min-h-screen',
      text: {
        primary: 'text-text-primary',
        secondary: 'text-text-secondary',
        muted: 'text-text-muted',
      },
      card: 'bg-dark-lighter border border-dark-border rounded-2xl p-6 transition-all duration-200 hover:shadow-card hover:-translate-y-0.5',
      button: {
        primary: 'bg-dark-lighter hover:bg-dark-lightest text-text-primary border border-dark-border rounded-xl px-6 py-3 font-semibold uppercase text-sm tracking-wider transition-all duration-200 hover:-translate-y-0.5',
        secondary: 'bg-dark hover:bg-dark-lighter text-text-secondary border border-dark-border rounded-xl px-4 py-2 font-medium text-sm transition-all duration-200',
      },
      input: 'bg-dark-lighter border border-dark-border text-text-primary rounded-xl px-4 py-2 focus:border-accent-red focus:ring-1 focus:ring-accent-red/10 transition-all duration-200',
      nav: {
        background: 'bg-dark border-b border-dark-border',
        link: {
          default: 'text-text-primary hover:text-text-primary hover:bg-dark-lighter px-4 py-2 rounded-lg transition-colors duration-200',
          active: 'text-text-primary bg-dark-lighter px-4 py-2 rounded-lg font-medium',
        },
      },
      progress: {
        background: 'bg-dark-lighter',
        bar: 'bg-accent-red',
      },
      toggle: {
        active: 'bg-accent-red',
        default: 'bg-dark-lighter',
      },
      focus: {
        ring: 'focus:ring-accent-red/20',
      },
    };
  };

  const value = {
    theme,
    setTheme,
    getThemeClasses,
  };

  return (
    <ThemeContext.Provider value={value}>
      <div className={`theme-${theme}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 