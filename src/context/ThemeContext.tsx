import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import safeLocalStorage from '../utils/safeLocalStorage';

type Theme = 'dark' | 'light';

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
    selection: string;
    title: string;
    subtitle: string;
  };
  toggleTheme: () => void;
}

// Move defaultThemeContext outside of any component or function
const defaultThemeContextValue: ThemeContextType = {
  theme: 'light', // Default to light theme for Japanese learning platform
  setTheme: () => {},
  getThemeClasses: () => ({
    container: 'bg-light min-h-screen',
    text: {
      primary: 'text-text-primary',
      secondary: 'text-text-secondary',
      muted: 'text-text-muted',
    },
    card: 'bg-light-secondary border border-border-light rounded-card p-6 shadow-card',
    button: {
      primary: 'bg-japanese-red text-white border border-japanese-red rounded-button px-4 py-2 hover:bg-japanese-redLight hover:border-japanese-redLight shadow-button hover:shadow-button-hover transition-all duration-300',
      secondary: 'bg-light-secondary text-text-primary border border-border-light rounded-nav px-4 py-2 hover:bg-light-tertiary hover:border-border-medium transition-all duration-300',
    },
    input: 'bg-white border border-border-light text-text-primary focus:border-japanese-red focus:shadow-input-focus rounded-input transition-all duration-300',
    nav: {
      background: 'bg-light/95 backdrop-blur-md border-b border-border-light',
      link: {
        default: 'text-text-secondary hover:text-text-primary transition-colors duration-300',
        active: 'text-text-primary font-semibold',
      },
    },
    progress: {
      background: 'bg-light-tertiary',
      bar: 'bg-accent-orange',
    },
    toggle: {
      active: 'bg-japanese-red',
      default: 'bg-border-light',
    },
    focus: {
      ring: 'focus:ring-2 focus:ring-japanese-red/20 focus:outline-none',
    },
    selection: 'selection:bg-japanese-red/20 selection:text-text-primary',
    title: 'text-text-primary font-display font-bold',
    subtitle: 'text-text-secondary font-medium',
  }),
  toggleTheme: () => {},
};

// Create context with default value
const ThemeContext = createContext<ThemeContextType>(defaultThemeContextValue);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Load theme from localStorage or default to 'light' with validation
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedTheme = safeLocalStorage.getItem('theme');
        return (savedTheme && ['dark', 'light'].includes(savedTheme)) 
          ? (savedTheme as Theme) 
          : 'light'; // Default to light theme
      } catch (error) {
        console.error('Failed to load theme from localStorage:', error);
        return 'light'; // Default to light theme
      }
    }
    return 'light'; // Default to light theme
  });

  // Persist theme to localStorage and update body class
  useEffect(() => {
    if (typeof window !== 'undefined' && theme) {
      try {
        safeLocalStorage.setItem('theme', theme);
        document.documentElement.classList.remove('theme-dark', 'theme-light', 'dark');
        document.documentElement.classList.add(`theme-${theme}`);
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        }
      } catch (error) {
        console.error('Failed to save theme to localStorage:', error);
      }
    }
  }, [theme]);

  // Validate theme before setting it
  const setThemeWithValidation = React.useCallback((newTheme: Theme) => {
    if (['dark', 'light'].includes(newTheme)) {
      setTheme(newTheme);
    } else {
      console.warn(`Invalid theme value: ${newTheme}. Defaulting to 'light'`);
      setTheme('light');
    }
  }, []);

  // Toggle logic cycles through light -> dark -> light
  const toggleTheme = React.useCallback(() => {
    setThemeWithValidation(
      theme === 'light' ? 'dark' : 'light'
    );
  }, [theme, setThemeWithValidation]);

  const getThemeClasses = React.useCallback(() => {
    if (theme === 'light') {
      // Japanese Learning Platform Light Theme
      return {
        container: 'bg-light min-h-screen',
        text: {
          primary: 'text-text-primary',
          secondary: 'text-text-secondary',
          muted: 'text-text-muted',
        },
        card: 'bg-light-secondary border border-border-light rounded-card p-6 shadow-card hover:shadow-hover transition-all duration-300',
        button: {
          primary: 'bg-japanese-red text-white border border-japanese-red rounded-button px-4 py-2 hover:bg-japanese-redLight hover:border-japanese-redLight shadow-button hover:shadow-button-hover transition-all duration-300 transform hover:-translate-y-0.5',
          secondary: 'bg-light-secondary text-text-primary border border-border-light rounded-nav px-4 py-2 hover:bg-light-tertiary hover:border-border-medium transition-all duration-300',
        },
        input: 'bg-white border border-border-light text-text-primary focus:border-japanese-red focus:shadow-input-focus rounded-input transition-all duration-300',
        nav: {
          background: 'bg-light/95 backdrop-blur-md border-b border-border-light shadow-nav',
          link: {
            default: 'text-text-secondary hover:text-text-primary transition-colors duration-300',
            active: 'text-text-primary font-semibold',
          },
        },
        progress: {
          background: 'bg-light-tertiary',
          bar: 'bg-accent-orange',
        },
        toggle: {
          active: 'bg-japanese-red',
          default: 'bg-border-light',
        },
        focus: {
          ring: 'focus:ring-2 focus:ring-japanese-red/20 focus:outline-none',
        },
        selection: 'selection:bg-japanese-red/20 selection:text-text-primary',
        title: 'text-text-primary font-display font-bold',
        subtitle: 'text-text-secondary font-medium',
      };
    }
    // Dark theme - Japanese Learning Platform Dark Theme
    return {
      container: 'bg-dark min-h-screen',
      text: {
        primary: 'text-text-dark-primary',
        secondary: 'text-text-dark-secondary',
        muted: 'text-text-dark-muted',
      },
      card: 'bg-dark-secondary border border-border-dark-light rounded-card p-6 shadow-dark-card hover:shadow-dark-hover transition-all duration-300',
      button: {
        primary: 'bg-japanese-red text-white border border-japanese-red rounded-button px-4 py-2 hover:bg-japanese-redLight hover:border-japanese-redLight shadow-dark-button hover:shadow-dark-glow transition-all duration-300 transform hover:-translate-y-0.5 animate-glow-pulse',
        secondary: 'bg-dark-secondary text-text-dark-primary border border-border-dark-light rounded-nav px-4 py-2 hover:bg-dark-tertiary hover:border-border-dark-medium transition-all duration-300',
      },
      input: 'bg-dark-elevated border border-border-dark-light text-text-dark-primary focus:border-japanese-red focus:shadow-dark-glow rounded-input transition-all duration-300',
      nav: {
        background: 'bg-dark/95 backdrop-blur-md border-b border-border-dark-light shadow-dark-card',
        link: {
          default: 'text-text-dark-secondary hover:text-text-dark-primary transition-colors duration-300',
          active: 'text-text-dark-primary font-semibold text-japanese-red',
        },
      },
      progress: {
        background: 'bg-dark-tertiary',
        bar: 'bg-accent-orange-dark',
      },
      toggle: {
        active: 'bg-japanese-red',
        default: 'bg-border-dark-light',
      },
      focus: {
        ring: 'focus:ring-2 focus:ring-japanese-red/30 focus:outline-none',
      },
      selection: 'selection:bg-japanese-red/30 selection:text-text-dark-primary',
      title: 'text-text-dark-primary font-display font-bold',
      subtitle: 'text-text-dark-secondary font-medium',
    };
  }, [theme]);

  const value = useMemo(() => ({
    theme,
    setTheme: setThemeWithValidation,
    getThemeClasses,
    toggleTheme,
  }), [theme, setThemeWithValidation, getThemeClasses, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      <div className={`theme-${theme}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

// Export a separate hook for safe context usage
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    console.warn('useTheme must be used within a ThemeProvider');
    return defaultThemeContextValue;
  }
  return context;
}; 