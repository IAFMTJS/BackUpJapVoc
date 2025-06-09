import React, { Suspense, lazy, useEffect, useState, createContext, useContext } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, createTheme, Theme } from '@mui/material/styles';
import { useTheme } from './context/ThemeContext';
import Navigation from './components/Navigation';
import ThemeToggle from './components/ThemeToggle';
import ErrorBoundary from './components/ErrorBoundary';
import OfflineStatus from './components/OfflineStatus';
import PushNotifications from './components/PushNotifications';
import MainLayout from './components/MainLayout';
import './App.css';
import { openDB, deleteDB, DB_CONFIG } from './utils/indexedDB';
import { initializeAudioCache } from './utils/audio';
import { importWords } from './utils/importWords';
import { initializeMoodWords } from './utils/initMoodWords';
import { importDictionaryData } from './utils/importDictionaryData';
import { ThemeProvider } from './context/ThemeContext';
import { ProgressProvider } from './context/ProgressContext';
import { SettingsProvider } from './context/SettingsContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { DatabaseProvider, useDatabase } from './context/DatabaseContext';
import { AudioProvider } from './context/AudioContext';
import { WordLevelProvider } from './context/WordLevelContext';
import { WordProvider } from './context/WordContext';
import { DictionaryProvider } from './context/DictionaryContext';
import { LearningProvider } from './context/LearningContext';
import LoadingSpinner from './components/LoadingSpinner';
import { databasePromise, initializeDatabase, forceDatabaseReset } from './utils/databaseConfig';
import { CircularProgress, Box } from '@mui/material';
import { KnowingNavigation } from './components/KnowingNavigation';
import ProfilePage from './pages/ProfilePage';
import Login from './components/Login';
import { AchievementProvider } from './context/AchievementContext';
import { KanjiProvider } from './context/KanjiContext';

// Lazy load all route components
const Home = lazy(() => import('./pages/Home'));
const Settings = lazy(() => import('./pages/Settings'));
const LearningLayout = lazy(() => import('./pages/learning/LearningLayout'));
const KanjiDictionary = lazy(() => import('./pages/learning/KanjiDictionary'));
const Romaji = lazy(() => import('./pages/learning/Romaji'));
const QuizPage = lazy(() => import('./pages/learning/QuizPage'));
const Kana = lazy(() => import('./pages/learning/Kana'));
const Dictionary = lazy(() => import('./pages/Dictionary'));
const KnowingDictionary = lazy(() => import('./pages/KnowingDictionary'));
const SRSPage = lazy(() => import('./pages/SRSPage'));
const GamesPage = lazy(() => import('./pages/GamesPage'));
const Progress = lazy(() => import('./pages/Progress'));
const KnowingCenter = lazy(() => import('./pages/KnowingCenter'));
const CultureAndRules = lazy(() => import('./pages/CultureAndRules'));
const MoodPage = lazy(() => import('./pages/MoodPage'));
const ProgressPage = lazy(() => import('./pages/ProgressPage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const SettingsPage = lazy(() => import('./pages/Settings'));
const TriviaSection = lazy(() => import('./pages/TriviaSection'));
const AnimeSection = lazy(() => import('./pages/AnimeSection'));
const FAQScoring = lazy(() => import('./pages/FAQScoring'));
const FAQLearning = lazy(() => import('./pages/FAQLearning'));
const FAQFeatures = lazy(() => import('./pages/FAQFeatures'));
const FAQProgress = lazy(() => import('./pages/FAQProgress'));

// Loading component with better visual feedback
const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </Box>
);

// Theme wrapper component to handle Material-UI theme
export const ThemeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const themeContext = useTheme();
  const [isThemeReady, setIsThemeReady] = React.useState(false);

  // Create a stable theme object with proper type checking
  const muiTheme = React.useMemo(() => {
    // Ensure we have a valid theme value
    const theme = themeContext?.theme || 'dark';
    
    // Create theme with safe defaults
    const themeConfig = {
      palette: {
        mode: theme === 'dark' ? 'dark' : 'light',
        primary: {
          main: theme === 'dark' ? '#3b82f6' : '#2563eb',
        },
        secondary: {
          main: theme === 'dark' ? '#8b5cf6' : '#7c3aed',
        },
        background: {
          default: theme === 'dark' ? '#181830' : '#ffffff',
          paper: theme === 'dark' ? '#23233a' : '#ffffff',
        },
        text: {
          primary: theme === 'dark' ? '#ffffff' : '#1f2937',
          secondary: theme === 'dark' ? '#d1d5db' : '#4b5563',
        },
      },
      components: {
        MuiCard: {
          styleOverrides: {
            root: {
              background: theme === 'dark' ? 'rgba(35, 35, 58, 0.8)' : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${
                theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
              }`,
            },
          },
        },
      },
    };

    return createTheme(themeConfig);
  }, [themeContext?.theme]);

  // Ensure theme is ready before rendering children
  React.useEffect(() => {
    if (muiTheme && muiTheme.palette && muiTheme.palette.mode) {
      // Add a small delay to ensure theme is fully initialized
      const timer = setTimeout(() => {
        setIsThemeReady(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [muiTheme]);

  // Show loading state while theme is initializing
  if (!isThemeReady || !muiTheme) {
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
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [initProgress, setInitProgress] = useState<string>('Initializing...');
  const [initStep, setInitStep] = useState<number>(0);
  const { db } = useDatabase();

  // Function to update progress with step tracking
  const updateProgress = (message: string, step: number) => {
    setInitProgress(message);
    setInitStep(step);
    console.log(`[App] Initialization step ${step}: ${message}`);
  };

  // Function to initialize audio cache with better error handling
  const initAudioCache = async (): Promise<void> => {
    if (!db) {
      console.warn('[App] Database not available for audio cache initialization');
      return;
    }

    try {
      const transaction = db.transaction(['audioFiles'], 'readwrite');
      const store = transaction.objectStore('audioFiles');
      
      // Get all words from the database
      const words = await db.getAll('words');
      console.log(`[App] Starting audio cache for ${words.length} words`);
      
      // Process words in smaller batches with delays
      const BATCH_SIZE = 5; // Reduced batch size for mobile
      const DELAY_BETWEEN_BATCHES = 2000; // Increased delay for mobile
      
      for (let i = 0; i < words.length; i += BATCH_SIZE) {
        const batch = words.slice(i, i + BATCH_SIZE);
        await Promise.all(
          batch.map(async (word) => {
            try {
              // Check if audio already exists
              const existing = await store.get(word.id);
              if (!existing) {
                // Generate and store audio
                await store.put({
                  id: word.id,
                  audio: null, // Will be generated on demand
                  timestamp: Date.now()
                });
              }
            } catch (error) {
              console.warn(`[App] Failed to process word ${word.id}:`, error);
            }
          })
        );
        
        // Add delay between batches
        if (i + BATCH_SIZE < words.length) {
          await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
        }
      }
    } catch (error) {
      console.warn('[App] Audio cache initialization warning:', error);
    }
  };

  const handleForceReset = async () => {
    try {
      setInitProgress('Resetting database...');
      await forceDatabaseReset();
      setInitError(null);
      initializeApp();
    } catch (error) {
      console.error('[App] Error during force reset:', error);
      setInitError('Failed to reset database. Please try clearing your browser data manually.');
    }
  };

  const initializeApp = async () => {
    setIsInitializing(true);
    setInitError(null);
    setInitStep(0);
    updateProgress('Starting initialization...', 0);

    try {
      console.log('[App] Starting application initialization');
      
      // Initialize database through the DatabaseContext
      updateProgress('Initializing database...', 1);
      await databasePromise; // Wait for the database promise from DatabaseContext
      console.log('[App] Database initialized successfully');

      // Import words with timeout
      updateProgress('Importing words...', 2);
      const importPromise = importWords();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Word import timed out')), 30000)
      );
      const importResult = await Promise.race([importPromise, timeoutPromise]);
      if (!importResult.success) {
        console.warn('[App] Word import warning:', importResult.error);
      }
      console.log('[App] Word import completed');

      // Import dictionary data with timeout
      updateProgress('Importing dictionary data...', 3);
      try {
        const dictPromise = importDictionaryData();
        const dictTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Dictionary import timed out')), 30000)
        );
        const dictResult = await Promise.race([dictPromise, dictTimeoutPromise]);
        if (!dictResult.success) {
          console.warn('[App] Dictionary import warning:', dictResult.error);
        } else {
          console.log(`[App] Dictionary import completed with ${dictResult.count} words`);
        }
      } catch (error) {
        console.warn('[App] Dictionary import warning:', error);
      }

      // Initialize mood words
      updateProgress('Initializing mood words...', 4);
      try {
        await initializeMoodWords();
        console.log('[App] Mood words initialized');
      } catch (error) {
        console.warn('[App] Mood words initialization warning:', error);
      }

      // Mark initialization as complete
      updateProgress('Initialization complete!', 5);
      console.log('[App] Core initialization completed');
      setIsInitializing(false);

      // Start audio cache initialization in the background
      console.log('[App] Starting background audio cache initialization...');
      initAudioCache().catch(error => {
        console.warn('[App] Audio cache initialization warning:', error);
      });

    } catch (error) {
      console.error('[App] Initialization error:', error);
      setInitError(error instanceof Error ? error.message : 'Failed to initialize application');
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    initializeApp();
  }, []);

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">{initProgress}</p>
          <div className="mt-4 w-64 bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${(initStep / 5) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Initialization Error</h2>
          <p className="text-gray-700 mb-4">{initError}</p>
          <div className="space-y-3">
            <button
              onClick={initializeApp}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Retry Initialization
            </button>
            <button
              onClick={handleForceReset}
              className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            >
              Force Reset Database
            </button>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            If the error persists, try clearing your browser data or using a different browser.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <WordProvider>
        <DictionaryProvider>
          <LearningProvider>
            <AudioProvider>
              <ThemeWrapper>
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    <Route path="/login" element={
                      <ErrorBoundary>
                        <Login />
                      </ErrorBoundary>
                    } />
                    <Route element={
                      <ErrorBoundary>
                        <MainLayout>
                          <Outlet />
                        </MainLayout>
                      </ErrorBoundary>
                    }>
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
                      <Route path="/learning" element={<LearningLayout />}>
                        <Route index element={<Navigate to="/learning/kana" replace />} />
                        <Route path="kana" element={<Kana />} />
                        <Route path="kanji" element={<Navigate to="/learning/kanji-dictionary" replace />} />
                        <Route path="kanji-dictionary" element={
                          <ErrorBoundary>
                            <KanjiProvider>
                              <KanjiDictionary />
                            </KanjiProvider>
                          </ErrorBoundary>
                        } />
                        <Route path="romaji" element={<Romaji />} />
                        <Route path="quiz" element={<QuizPage />} />
                      </Route>
                      <Route path="/srs" element={
                        <ErrorBoundary>
                          <SRSPage />
                        </ErrorBoundary>
                      } />
                      <Route path="/games" element={
                        <ErrorBoundary>
                          <GamesPage />
                        </ErrorBoundary>
                      } />
                      <Route path="/anime" element={
                        <ErrorBoundary>
                          <AnimeSection />
                        </ErrorBoundary>
                      } />
                      <Route path="/progress" element={
                        <ErrorBoundary>
                          <ProgressProvider>
                            <WordLevelProvider>
                              <AchievementProvider>
                                <ProgressPage />
                              </AchievementProvider>
                            </WordLevelProvider>
                          </ProgressProvider>
                        </ErrorBoundary>
                      } />
                      <Route path="/profile" element={
                        <ErrorBoundary>
                          <ProfilePage />
                        </ErrorBoundary>
                      } />
                      <Route path="/knowing" element={
                        <ErrorBoundary>
                          <ProgressProvider>
                            <KnowingNavigation>
                              <Outlet />
                            </KnowingNavigation>
                          </ProgressProvider>
                        </ErrorBoundary>
                      }>
                        <Route index element={<KnowingCenter />} />
                        <Route path="dictionary" element={<KnowingDictionary />} />
                        <Route path="mood" element={<MoodPage />} />
                        <Route path="culture" element={<CultureAndRules />} />
                        <Route path="favorites" element={<FavoritesPage />} />
                        <Route path="settings" element={<SettingsPage />} />
                        <Route path="*" element={<Navigate to="/knowing" replace />} />
                      </Route>
                      <Route path="/trivia" element={
                        <ErrorBoundary>
                          <TriviaSection />
                        </ErrorBoundary>
                      } />
                      <Route path="/faq" element={
                        <ErrorBoundary>
                          <Outlet />
                        </ErrorBoundary>
                      }>
                        <Route index element={<FAQFeatures />} />
                        <Route path="features" element={<FAQFeatures />} />
                        <Route path="learning" element={<FAQLearning />} />
                        <Route path="scoring" element={<FAQScoring />} />
                        <Route path="progress" element={<FAQProgress />} />
                        <Route path="*" element={<Navigate to="/faq" replace />} />
                      </Route>
                    </Route>
                  </Routes>
                </Suspense>
              </ThemeWrapper>
            </AudioProvider>
          </LearningProvider>
        </DictionaryProvider>
      </WordProvider>
    </ErrorBoundary>
  );
};

export default App; 