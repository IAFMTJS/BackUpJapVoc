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
    selection: string;
    title: string;
    subtitle: string;
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
      // Remove theme class management from body
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
        container: 'bg-[#0a0a23] min-h-screen',
        text: {
          primary: 'neon-blue',
          secondary: 'neon-pink',
          muted: 'text-gray-400',
        },
        card: 'neon-card',
        button: {
          primary: 'neon-btn',
          secondary: 'neon-btn blue',
        },
        input: 'bg-[#181830] border border-[#00f7ff] text-[#00f7ff] focus:ring-2 focus:ring-[#ff3afc] rounded-lg',
        nav: {
          background: 'bg-transparent',
          link: {
            default: 'neon-blue',
            active: 'neon-pink underline',
          },
        },
        progress: {
          background: 'bg-[#181830]',
          bar: 'bg-neon-pink',
        },
        toggle: {
          active: 'bg-neon-pink',
          default: 'bg-[#181830]',
        },
        focus: {
          ring: 'focus:ring-[#00f7ff] focus:ring-2',
        },
        selection: 'selection:bg-[#ff00c8] selection:text-[#00f7ff]',
        title: 'neon-blue',
        subtitle: 'neon-pink',
      };
    }
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
      container: 'bg-white min-h-screen',
      text: {
        primary: 'text-gray-900',
        secondary: 'text-gray-600',
        muted: 'text-gray-400',
      },
      card: 'bg-white border border-gray-200 rounded-2xl p-6 shadow',
      button: {
        primary: 'bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-100 transition',
        secondary: 'bg-gray-100 text-gray-700 border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-200 transition',
      },
      input: 'bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 rounded-lg',
      nav: {
        background: 'bg-white',
        link: {
          default: 'text-gray-700 hover:text-gray-900',
          active: 'text-gray-900 underline',
        },
      },
      progress: {
        background: 'bg-gray-200',
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
  };

  const value = {
    theme,
    setTheme,
    getThemeClasses,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <div className={`theme-${theme} ${theme === 'neon' ? 'theme-neon' : ''}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Return a default theme context if the provider is not available
    return {
      theme: 'dark' as const,
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
  }
  return context;
}; 