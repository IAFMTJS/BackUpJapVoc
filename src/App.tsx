import React, { Suspense, lazy, useEffect, useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, createTheme, Theme } from '@mui/material/styles';
import { useTheme } from './context/ThemeContext';
import Navigation from './components/Navigation';
import ThemeToggle from './components/ThemeToggle';
import ErrorBoundary from './components/ErrorBoundary';
import OfflineStatus from './components/OfflineStatus';
import PushNotifications from './components/PushNotifications';
import { initDictionaryDB } from './utils/dictionaryOfflineSupport';
import './App.css';
import { openDB } from './utils/indexedDB';
import GamesPage from './pages/GamesPage';
import { initializeAudio } from './utils/audio';

// Lazy load all route components
const Home = lazy(() => import('./pages/Home'));
const Settings = lazy(() => import('./pages/Settings'));
const Vocabulary = lazy(() => import('./pages/VocabularySection'));
const Dictionary = lazy(() => import('./pages/Dictionary'));
const Writing = lazy(() => import('./pages/WritingPracticePage'));
const Kanji = lazy(() => import('./pages/Kanji'));
const Romaji = lazy(() => import('./pages/RomajiSection'));
const SRS = lazy(() => import('./pages/SRSPage'));
const Anime = lazy(() => import('./pages/AnimeSection'));
const Progress = lazy(() => import('./pages/ProgressPage'));
const Achievements = lazy(() => import('./pages/Achievements'));
const WordLevels = lazy(() => import('./pages/WordLevelsPage'));

// Loading component with better visual feedback
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-lg text-gray-600 dark:text-gray-300">Loading page...</p>
    </div>
  </div>
);

// Theme wrapper component to handle Material-UI theme
export const ThemeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useTheme();
  
  const muiTheme = createTheme({
    palette: {
      mode: theme === 'dark' ? 'dark' : 'light',
      primary: {
        main: theme === 'neon' ? '#00f7ff' : theme === 'dark' ? '#3b82f6' : '#2563eb',
      },
      secondary: {
        main: theme === 'neon' ? '#ff3afc' : theme === 'dark' ? '#8b5cf6' : '#7c3aed',
      },
      background: {
        default: theme === 'neon' ? '#0a0a23' : theme === 'dark' ? '#181830' : '#ffffff',
        paper: theme === 'neon' ? '#181830' : theme === 'dark' ? '#23233a' : '#ffffff',
      },
      text: {
        primary: theme === 'neon' ? '#00f7ff' : theme === 'dark' ? '#ffffff' : '#1f2937',
        secondary: theme === 'neon' ? '#ff3afc' : theme === 'dark' ? '#d1d5db' : '#4b5563',
      },
    },
    spacing: (factor: number) => `${8 * factor}px`,
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            background: theme === 'neon' ? 'rgba(24, 24, 48, 0.8)' : 
                      theme === 'dark' ? 'rgba(35, 35, 58, 0.8)' : 
                      'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${
              theme === 'neon' ? 'rgba(0, 247, 255, 0.1)' :
              theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' :
              'rgba(0, 0, 0, 0.1)'
            }`,
          },
        },
      },
    },
  });

  // Ensure the theme is properly memoized to prevent unnecessary re-renders
  const memoizedTheme = React.useMemo(() => muiTheme, [theme]);

  return (
    <MuiThemeProvider theme={memoizedTheme}>
      {children}
    </MuiThemeProvider>
  );
};

// Create a context for the database
export const DatabaseContext = createContext<IDBDatabase | null>(null);

// Create a hook to use the database
export const useDatabase = () => {
  const db = useContext(DatabaseContext);
  if (!db) {
    throw new Error('Database not initialized. Make sure you are using this hook within a DatabaseProvider.');
  }
  return db;
};

// Database provider component
const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        console.log('Initializing main database...');
        const database = await openDB();
        setDb(database);
        console.log('Main database initialized successfully');
      } catch (err) {
        console.error('Failed to initialize main database:', err);
        setError(err instanceof Error ? err : new Error('Failed to initialize database'));
      } finally {
        setIsInitializing(false);
      }
    };

    initializeDatabase();
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Database Error</h2>
          <p className="text-gray-600 dark:text-gray-300">{error.message}</p>
        </div>
      </div>
    );
  }

  if (isInitializing) {
    return <LoadingFallback />;
  }

  return (
    <DatabaseContext.Provider value={db}>
      {children}
    </DatabaseContext.Provider>
  );
};

const App: React.FC = () => {
  // Initialize audio on first user interaction
  useEffect(() => {
    const handleUserInteraction = () => {
      initializeAudio();
      // Remove listeners after first interaction
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);

  return (
    <Router>
      <ErrorBoundary>
        <DatabaseProvider>
          <div className="min-h-screen">
            <Navigation />
            <main className="pt-16">
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/vocabulary" element={<Vocabulary />} />
                  <Route path="/dictionary" element={<Dictionary />} />
                  <Route path="/writing" element={<Writing />} />
                  <Route path="/kanji" element={<Kanji />} />
                  <Route path="/romaji" element={<Romaji />} />
                  <Route path="/srs" element={<SRS />} />
                  <Route path="/games" element={<GamesPage />} />
                  <Route path="/anime" element={<Anime />} />
                  <Route path="/progress" element={<Progress />} />
                  <Route path="/achievements" element={<Achievements />} />
                  <Route path="/word-levels" element={<WordLevels />} />
                </Routes>
              </Suspense>
            </main>
            <OfflineStatus />
            <PushNotifications />
          </div>
        </DatabaseProvider>
      </ErrorBoundary>
    </Router>
  );
};

export default App; 