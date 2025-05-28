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
import { initializeAudioCache } from './utils/audio';
import { importWords } from './utils/importWords';
import { initializeMoodWords } from './utils/initMoodWords';
import { ThemeProvider } from './context/ThemeContext';
import { ProgressProvider } from './context/ProgressContext';
import { SettingsProvider } from './context/SettingsContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { DatabaseProvider } from './context/DatabaseContext';
import { AudioProvider } from './context/AudioContext';

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
const Mood = lazy(() => import('./pages/MoodPage'));

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
  const themeContext = useTheme();
  const [isThemeReady, setIsThemeReady] = React.useState(false);

  // Create a stable theme object with proper type checking
  const muiTheme = React.useMemo(() => {
    // Default to dark theme if context is not ready
    const theme = themeContext?.theme || 'dark';
    
    return createTheme({
      palette: {
        mode: theme === 'dark' || theme === 'neon' ? 'dark' : 'light',
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
  }, [themeContext?.theme]);

  // Ensure theme is ready before rendering children
  React.useEffect(() => {
    if (muiTheme && muiTheme.palette && muiTheme.palette.mode) {
      setIsThemeReady(true);
    }
  }, [muiTheme]);

  if (!isThemeReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#181830]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-white">Loading theme...</p>
        </div>
      </div>
    );
  }

  return (
    <MuiThemeProvider theme={muiTheme}>
      {children}
    </MuiThemeProvider>
  );
};

const App: React.FC = () => {
  // Initialize audio on first user interaction
  useEffect(() => {
    let isInitialized = false;
    const handleUserInteraction = async () => {
      if (!isInitialized) {
        console.log('[App] Initializing audio on user interaction...');
        const success = await initializeAudioCache();
        if (success) {
          isInitialized = true;
          console.log('[App] Audio initialized successfully');
          
          // For iOS, we need to ensure the context is resumed
          if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream) {
            try {
              const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
              if (audioContext.state === 'suspended') {
                await audioContext.resume();
                console.log('[App] iOS: Audio context resumed successfully');
              }
            } catch (error) {
              console.error('[App] iOS: Failed to resume audio context:', error);
            }
          }
        }
      }
    };

    // Add event listeners for user interaction
    const events = ['click', 'touchstart', 'keydown'];
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true });
    });

    // Also try to initialize on load for non-iOS devices
    if (!(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream)) {
      handleUserInteraction();
    }

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, []);

  // Loading state for context initialization
  const [isContextsReady, setIsContextsReady] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);

  // Check if all contexts are ready with better error handling
  useEffect(() => {
    const checkContextsReady = async () => {
      try {
        // Initialize database first
        await initDictionaryDB();
        
        // Initialize mood words
        console.log('Initializing mood words...');
        await initializeMoodWords();
        console.log('Mood words initialized successfully');
        
        // Add a small delay to ensure all contexts are properly initialized
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Verify theme context is ready
        const root = document.getElementById('root');
        if (root && !root.getAttribute('data-theme')) {
          root.setAttribute('data-theme', 'dark');
        }
        
        setIsContextsReady(true);
      } catch (error) {
        console.error('Context initialization failed:', error);
        setInitError(error instanceof Error ? error : new Error('Failed to initialize contexts'));
      }
    };

    checkContextsReady();
  }, []);

  if (initError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#181830]">
        <div className="text-center p-6 bg-white/10 backdrop-blur-lg rounded-lg">
          <h2 className="text-xl font-bold text-red-400 mb-2">Initialization Error</h2>
          <p className="text-gray-300 mb-4">{initError.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!isContextsReady) {
    return <LoadingFallback />;
  }

  return (
    <Router>
      <ThemeProvider>
        <DatabaseProvider>
          <AudioProvider>
            <ProgressProvider>
              <SettingsProvider>
                <AccessibilityProvider>
                  <ErrorBoundary
                    fallback={
                      <div className="flex items-center justify-center min-h-screen bg-[#181830]">
                        <div className="text-center p-6 bg-white/10 backdrop-blur-lg rounded-lg">
                          <h2 className="text-xl font-bold text-red-400 mb-2">Application Error</h2>
                          <p className="text-gray-300 mb-4">An error occurred while loading the application.</p>
                          <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                          >
                            Reload Application
                          </button>
                        </div>
                      </div>
                    }
                  >
                    <div className="min-h-screen" data-theme="dark">
                      <Navigation />
                      <main className="pt-16">
                        <ErrorBoundary>
                          <Suspense fallback={<LoadingFallback />}>
                            <Routes>
                              <Route path="/" element={
                                <ErrorBoundary>
                                  <Home />
                                </ErrorBoundary>
                              } />
                              <Route path="/settings" element={
                                <ErrorBoundary>
                                  <Settings />
                                </ErrorBoundary>
                              } />
                              <Route path="/vocabulary" element={
                                <ErrorBoundary>
                                  <Vocabulary />
                                </ErrorBoundary>
                              } />
                              <Route path="/dictionary" element={
                                <ErrorBoundary>
                                  <Dictionary />
                                </ErrorBoundary>
                              } />
                              <Route path="/writing" element={
                                <ErrorBoundary>
                                  <Writing />
                                </ErrorBoundary>
                              } />
                              <Route path="/kanji" element={
                                <ErrorBoundary>
                                  <Kanji />
                                </ErrorBoundary>
                              } />
                              <Route path="/romaji" element={
                                <ErrorBoundary>
                                  <Romaji />
                                </ErrorBoundary>
                              } />
                              <Route path="/srs" element={
                                <ErrorBoundary>
                                  <SRS />
                                </ErrorBoundary>
                              } />
                              <Route path="/games" element={
                                <ErrorBoundary>
                                  <GamesPage />
                                </ErrorBoundary>
                              } />
                              <Route path="/anime" element={
                                <ErrorBoundary>
                                  <Anime />
                                </ErrorBoundary>
                              } />
                              <Route path="/progress" element={
                                <ErrorBoundary>
                                  <Progress />
                                </ErrorBoundary>
                              } />
                              <Route path="/achievements" element={
                                <ErrorBoundary>
                                  <Achievements />
                                </ErrorBoundary>
                              } />
                              <Route path="/word-levels" element={
                                <ErrorBoundary>
                                  <WordLevels />
                                </ErrorBoundary>
                              } />
                              <Route
                                path="/mood"
                                element={
                                  <ErrorBoundary>
                                    <Suspense fallback={<LoadingFallback />}>
                                      <Mood />
                                    </Suspense>
                                  </ErrorBoundary>
                                }
                              />
                            </Routes>
                          </Suspense>
                        </ErrorBoundary>
                      </main>
                      <OfflineStatus />
                      <PushNotifications />
                    </div>
                  </ErrorBoundary>
                </AccessibilityProvider>
              </SettingsProvider>
            </ProgressProvider>
          </AudioProvider>
        </DatabaseProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App; 