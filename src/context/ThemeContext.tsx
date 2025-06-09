import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import safeLocalStorage from '../utils/safeLocalStorage';

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
    selection: string;
    title: string;
    subtitle: string;
  };
  toggleTheme: () => void;
}

// Move defaultThemeContext outside of any component or function
const defaultThemeContextValue: ThemeContextType = {
  theme: 'dark',
  setTheme: () => {},
  getThemeClasses: () => ({
    container: 'bg-[#181830] min-h-screen',
    text: {
      primary: 'text-white',
      secondary: 'text-gray-300',
      muted: 'text-gray-500',
    },
    card: 'bg-[#23233a] border border-[#2a2a40] rounded-2xl p-6 shadow-md',
    button: {
      primary: 'bg-[#23233a] text-white border border-[#2a2a40] rounded-lg px-4 py-2 hover:bg-[#2a2a40] transition',
      secondary: 'bg-[#23233a] text-gray-300 border border-[#2a2a40] rounded-lg px-4 py-2 hover:bg-[#2a2a40] transition',
    },
    input: 'bg-[#23233a] border border-[#2a2a40] text-white focus:ring-2 focus:ring-blue-500 rounded-lg',
    nav: {
      background: 'bg-[#181830]',
      link: {
        default: 'text-gray-300 hover:text-white',
        active: 'text-white underline',
      },
    },
    progress: {
      background: 'bg-[#23233a]',
      bar: 'bg-blue-500',
    },
    toggle: {
      active: 'bg-blue-600',
      default: 'bg-gray-700',
    },
    focus: {
      ring: 'focus:ring-blue-500 focus:ring-2',
    },
    selection: 'selection:bg-blue-500/20 selection:text-white',
    title: 'text-white',
    subtitle: 'text-gray-300',
  }),
  toggleTheme: () => {},
};

// Create context with default value
const ThemeContext = createContext<ThemeContextType>(defaultThemeContextValue);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Load theme from localStorage or default to 'dark' with validation
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedTheme = safeLocalStorage.getItem('theme');
        return (savedTheme && ['dark', 'light', 'neon'].includes(savedTheme)) 
          ? (savedTheme as Theme) 
          : 'dark';
      } catch (error) {
        console.error('Failed to load theme from localStorage:', error);
        return 'dark';
      }
    }
    return 'dark';
  });

  // Persist theme to localStorage and update body class
  useEffect(() => {
    if (typeof window !== 'undefined' && theme) {
      try {
        safeLocalStorage.setItem('theme', theme);
        document.documentElement.classList.remove('theme-dark', 'theme-light', 'theme-neon');
        document.documentElement.classList.add(`theme-${theme}`);
      } catch (error) {
        console.error('Failed to save theme to localStorage:', error);
      }
    }
  }, [theme]);

  // Validate theme before setting it
  const setThemeWithValidation = React.useCallback((newTheme: Theme) => {
    if (['dark', 'light', 'neon'].includes(newTheme)) {
      setTheme(newTheme);
    } else {
      console.warn(`Invalid theme value: ${newTheme}. Defaulting to 'dark'`);
      setTheme('dark');
    }
  }, []);

  // Toggle logic cycles through dark -> light -> neon -> dark
  const toggleTheme = React.useCallback(() => {
    setThemeWithValidation(
      theme === 'dark' ? 'light' : theme === 'light' ? 'neon' : 'dark'
    );
  }, [theme, setThemeWithValidation]);

  const getThemeClasses = React.useCallback(() => {
    if (theme === 'dark') {
      return {
        container: 'bg-[#181830] min-h-screen',
        text: {
          primary: 'text-white',
          secondary: 'text-gray-300',
          muted: 'text-gray-500',
        },
        card: 'bg-[#23233a] border border-[#2a2a40] rounded-2xl p-6 shadow-md',
        button: {
          primary: 'bg-[#23233a] text-white border border-[#2a2a40] rounded-lg px-4 py-2 hover:bg-[#2a2a40] transition',
          secondary: 'bg-[#23233a] text-gray-300 border border-[#2a2a40] rounded-lg px-4 py-2 hover:bg-[#2a2a40] transition',
        },
        input: 'bg-[#23233a] border border-[#2a2a40] text-white focus:ring-2 focus:ring-blue-500 rounded-lg',
        nav: {
          background: 'bg-[#181830]',
          link: {
            default: 'text-gray-300 hover:text-white',
            active: 'text-white underline',
          },
        },
        progress: {
          background: 'bg-[#23233a]',
          bar: 'bg-blue-500',
        },
        toggle: {
          active: 'bg-blue-600',
          default: 'bg-gray-700',
        },
        focus: {
          ring: 'focus:ring-blue-500 focus:ring-2',
        },
        selection: 'selection:bg-blue-500/20 selection:text-white',
        title: 'text-white',
        subtitle: 'text-gray-300',
      };
    }
    // Light theme
    return {
      container: 'bg-gray-50 min-h-screen',
      text: {
        primary: 'text-gray-900',
        secondary: 'text-gray-600',
        muted: 'text-gray-400',
      },
      card: 'bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow',
      button: {
        primary: 'bg-white text-gray-900 border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 hover:border-gray-300 transition-colors',
        secondary: 'bg-gray-50 text-gray-700 border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-100 hover:border-gray-300 transition-colors',
      },
      input: 'bg-white border border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-500 rounded-lg hover:border-gray-300 transition-colors',
      nav: {
        background: 'bg-white border-b border-gray-200',
        link: {
          default: 'text-gray-600 hover:text-gray-900 transition-colors',
          active: 'text-gray-900 font-medium',
        },
      },
      progress: {
        background: 'bg-gray-100',
        bar: 'bg-blue-500',
      },
      toggle: {
        active: 'bg-blue-500',
        default: 'bg-gray-200',
      },
      focus: {
        ring: 'focus:ring-blue-500 focus:ring-2',
      },
      selection: 'selection:bg-blue-500/20 selection:text-gray-900',
      title: 'text-gray-900',
      subtitle: 'text-gray-600',
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