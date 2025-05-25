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
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Load theme from localStorage or default to 'dark'
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as Theme) || 'dark';
    }
    return 'dark';
  });

  // Persist theme to localStorage and update body class
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
      document.body.classList.remove('theme-dark', 'theme-light', 'theme-neon');
      document.body.classList.add(`theme-${theme}`);
    }
  }, [theme]);

  // Toggle logic cycles through dark -> light -> neon -> dark
  const toggleTheme = () => {
    setTheme((prev) =>
      prev === 'dark' ? 'light' : prev === 'light' ? 'neon' : 'dark'
    );
  };

  const getThemeClasses = () => {
    if (theme === 'neon') {
      return {
        container: 'bg-midnight bg-tokyo-noise min-h-screen font-techno text-white',
        text: {
          primary: 'text-white drop-shadow-[0_0_8px_#00f7ff]',
          secondary: 'text-neon-cyan',
          muted: 'text-electric-purple/80',
        },
        card: 'bg-black/60 border-2 border-electric-purple rounded-2xl p-6 shadow-neon-cyan',
        button: {
          primary: 'bg-neon-pink text-white font-techno px-6 py-3 rounded-lg shadow-neon-pink hover:bg-neon-cyan hover:shadow-neon-cyan transition animate-neon-pulse',
          secondary: 'bg-black/70 text-neon-cyan border border-neon-cyan rounded-lg px-4 py-2 font-techno hover:bg-electric-purple hover:text-white transition',
        },
        input: 'bg-black/70 border border-neon-cyan text-neon-cyan rounded-xl px-4 py-2 focus:border-neon-pink focus:ring-1 focus:ring-neon-pink/20 font-techno',
        nav: {
          background: 'bg-black/70 backdrop-blur-md shadow-neon-pink',
          link: {
            default: 'text-neon-cyan hover:text-neon-pink transition drop-shadow-[0_0_8px_#00f7ff] hover:drop-shadow-[0_0_16px_#ff00c8] font-techno',
            active: 'text-neon-pink bg-black/80 px-4 py-2 rounded-lg font-bold drop-shadow-[0_0_16px_#ff00c8] font-techno',
          },
        },
        progress: {
          background: 'bg-electric-purple/40',
          bar: 'bg-neon-pink animate-neon-pulse',
        },
        toggle: {
          active: 'bg-neon-pink',
          default: 'bg-black/70',
        },
        focus: {
          ring: 'focus:ring-neon-cyan/40',
        },
      };
    }
    // ... existing code for dark and light ...
    return {
      container: theme === 'dark' ? 'bg-dark min-h-screen' : 'bg-white min-h-screen',
      text: {
        primary: theme === 'dark' ? 'text-text-primary' : 'text-gray-900',
        secondary: theme === 'dark' ? 'text-text-secondary' : 'text-gray-600',
        muted: theme === 'dark' ? 'text-text-muted' : 'text-gray-400',
      },
      card: theme === 'dark'
        ? 'bg-dark-lighter border border-dark-border rounded-2xl p-6 transition-all duration-200 hover:shadow-card hover:-translate-y-0.5'
        : 'bg-white border border-gray-200 rounded-2xl p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5',
      button: {
        primary: theme === 'dark'
          ? 'bg-dark-lighter hover:bg-dark-lightest text-text-primary border border-dark-border rounded-xl px-6 py-3 font-semibold uppercase text-sm tracking-wider transition-all duration-200 hover:-translate-y-0.5'
          : 'bg-blue-600 hover:bg-blue-700 text-white border border-blue-700 rounded-xl px-6 py-3 font-semibold uppercase text-sm tracking-wider transition-all duration-200 hover:-translate-y-0.5',
        secondary: theme === 'dark'
          ? 'bg-dark hover:bg-dark-lighter text-text-secondary border border-dark-border rounded-xl px-4 py-2 font-medium text-sm transition-all duration-200'
          : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-xl px-4 py-2 font-medium text-sm transition-all duration-200',
      },
      input: theme === 'dark'
        ? 'bg-dark-lighter border border-dark-border text-text-primary rounded-xl px-4 py-2 focus:border-accent-red focus:ring-1 focus:ring-accent-red/10 transition-all duration-200'
        : 'bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 transition-all duration-200',
      nav: {
        background: theme === 'dark' ? 'bg-dark border-b border-dark-border' : 'bg-white border-b border-gray-200',
        link: {
          default: theme === 'dark'
            ? 'text-text-primary hover:text-text-primary hover:bg-dark-lighter px-4 py-2 rounded-lg transition-colors duration-200'
            : 'text-gray-900 hover:text-blue-600 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors duration-200',
          active: theme === 'dark'
            ? 'text-text-primary bg-dark-lighter px-4 py-2 rounded-lg font-medium'
            : 'text-blue-600 bg-gray-100 px-4 py-2 rounded-lg font-medium',
        },
      },
      progress: {
        background: theme === 'dark' ? 'bg-dark-lighter' : 'bg-gray-200',
        bar: theme === 'dark' ? 'bg-accent-red' : 'bg-blue-600',
      },
      toggle: {
        active: theme === 'dark' ? 'bg-accent-red' : 'bg-blue-600',
        default: theme === 'dark' ? 'bg-dark-lighter' : 'bg-gray-200',
      },
      focus: {
        ring: theme === 'dark' ? 'focus:ring-accent-red/20' : 'focus:ring-blue-500/20',
      },
    };
  };

  const value = {
    theme,
    setTheme,
    getThemeClasses,
    toggleTheme,
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