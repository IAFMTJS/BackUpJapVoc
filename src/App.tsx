import React, { Suspense, lazy, useEffect, useState, createContext, useContext } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, createTheme, Theme } from '@mui/material/styles';
import { useTheme } from './context/ThemeContext';
import Navigation from './components/Navigation';
import ThemeToggle from './components/ThemeToggle';
import ErrorBoundary from './components/ErrorBoundary';
import ErrorFallback from './components/ErrorFallback';
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
import { CircularProgress, Box, Typography, Paper, Button } from '@mui/material';
import { KnowingNavigation } from './components/KnowingNavigation';
import ProfilePage from './pages/ProfilePage';
import Login from './components/Login';
import { AchievementProvider } from './context/AchievementContext';
import { KanjiProvider } from './context/KanjiContext';
import { initializeApp as initializeSafeApp, isRestrictedEnvironment } from './utils/initializeApp';
import { setupChunkErrorHandling } from './utils/chunkErrorHandler';

// Safety check for Material-UI components
const validateMaterialUIComponents = () => {
  const requiredComponents = {
    MuiThemeProvider,
    createTheme,
    CircularProgress,
    Box,
    Typography,
    Paper,
    Button
  };
  
  for (const [name, component] of Object.entries(requiredComponents)) {
    if (!component) {
      console.error(`Material-UI component ${name} is not available`);
      throw new Error(`Missing Material-UI component: ${name}`);
    }
  }
  
  console.log('All Material-UI components validated successfully');
};

// Validate components on import
try {
  validateMaterialUIComponents();
} catch (error) {
  console.error('Material-UI validation failed:', error);
}

// Lazy load all route components with error handling
const createLazyComponent = (importFn: () => Promise<any>, componentName: string) => {
  return lazy(() => 
    importFn()
      .then(module => {
        // Ensure the module has a default export
        if (!module || !module.default) {
          console.error(`Module for ${componentName} has no default export`);
          throw new Error(`Invalid module for ${componentName}`);
        }
        
        // Additional safety check for React components
        const Component = module.default;
        if (typeof Component !== 'function') {
          console.error(`Module for ${componentName} default export is not a function`);
          throw new Error(`Invalid component for ${componentName}`);
        }
        
        // Check if it's a valid React component
        if (!Component.prototype || !Component.prototype.isReactComponent) {
          // For functional components, check if they can be called
          try {
            // This is a basic check - in production, we'll just return the component
            return module;
          } catch (error) {
            console.error(`Component for ${componentName} is not a valid React component`);
            throw new Error(`Invalid React component for ${componentName}`);
          }
        }
        
        return module;
      })
      .catch(error => {
        console.error(`Failed to load ${componentName}:`, error);
        // Return a fallback component that won't cause React error #130
        return {
          default: () => {
            console.error(`Rendering fallback for ${componentName} due to loading error:`, error);
            return (
              <ErrorFallback 
                componentName={componentName} 
                error={error instanceof Error ? error : new Error(`Failed to load ${componentName}`)}
              />
            );
          }
        };
      })
  );
};

const Home = createLazyComponent(() => import('./pages/Home'), 'Home page');
const Settings = createLazyComponent(() => import('./pages/Settings'), 'Settings page');
const LearningLayout = createLazyComponent(() => import('./pages/learning/LearningLayout'), 'Learning Layout');
const KanjiDictionary = createLazyComponent(() => import('./pages/learning/KanjiDictionary'), 'Kanji Dictionary');
const Romaji = createLazyComponent(() => import('./pages/learning/Romaji'), 'Romaji page');
const QuizPage = createLazyComponent(() => import('./pages/learning/QuizPage'), 'Quiz page');
const Kana = createLazyComponent(() => import('./pages/learning/Kana'), 'Kana page');
const Dictionary = createLazyComponent(() => import('./pages/Dictionary'), 'Dictionary page');
const KnowingDictionary = createLazyComponent(() => import('./pages/KnowingDictionary'), 'Knowing Dictionary');
const SRSPage = createLazyComponent(() => import('./pages/SRSPage'), 'SRS page');
const GamesPage = createLazyComponent(() => import('./pages/GamesPage'), 'Games page');
const Progress = createLazyComponent(() => import('./pages/Progress'), 'Progress page');
const KnowingCenter = createLazyComponent(() => import('./pages/KnowingCenter'), 'Knowing Center');
const CultureAndRules = createLazyComponent(() => import('./pages/CultureAndRules'), 'Culture & Rules');
const MoodPage = createLazyComponent(() => import('./pages/MoodPage'), 'Mood page');
const ProgressPage = createLazyComponent(() => import('./pages/ProgressPage'), 'Progress page');
const FavoritesPage = createLazyComponent(() => import('./pages/FavoritesPage'), 'Favorites page');
const SettingsPage = createLazyComponent(() => import('./pages/Settings'), 'Settings page');
const TriviaSection = createLazyComponent(() => import('./pages/TriviaSection'), 'Trivia section');
const AnimeSection = createLazyComponent(() => import('./pages/AnimeSection'), 'Anime section');
const FAQScoring = createLazyComponent(() => import('./pages/FAQScoring'), 'FAQ Scoring');
const FAQLearning = createLazyComponent(() => import('./pages/FAQLearning'), 'FAQ Learning');
const FAQFeatures = createLazyComponent(() => import('./pages/FAQFeatures'), 'FAQ Features');
const FAQProgress = createLazyComponent(() => import('./pages/FAQProgress'), 'FAQ Progress');
const LearningPathPage = createLazyComponent(() => import('./pages/LearningPathPage'), 'Learning Path');
const LessonNumbers = createLazyComponent(() => import('./components/LessonNumbers'), 'Lesson Numbers');

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
    try {
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

      const createdTheme = createTheme(themeConfig);
      
      // Validate the created theme
      if (!createdTheme || !createdTheme.palette) {
        console.error('Failed to create valid Material-UI theme');
        throw new Error('Invalid theme configuration');
      }
      
      return createdTheme;
    } catch (error) {
      console.error('Error creating Material-UI theme:', error);
      // Return a minimal fallback theme
      return createTheme({
        palette: {
          mode: 'dark',
          primary: { main: '#3b82f6' },
          secondary: { main: '#8b5cf6' },
          background: { default: '#181830', paper: '#23233a' },
          text: { primary: '#ffffff', secondary: '#d1d5db' },
        },
      });
    }
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
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          bgcolor: '#181830'
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              border: '2px solid transparent',
              borderTop: '2px solid #3b82f6',
              borderBottom: '2px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              mx: 'auto',
              mb: 2
            }}
          />
          <Typography variant="h6" sx={{ color: 'white' }}>
            Loading theme...
          </Typography>
        </Box>
      </Box>
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

  // Add global chunk loading error handler
  useEffect(() => {
    setupChunkErrorHandling();
  }, []);

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
    try {
      updateProgress('Initializing safe storage...', 1);
      
      // Initialize safe storage first
      await initializeSafeApp();
      
      // Check if we're in a restricted environment
      const restricted = isRestrictedEnvironment();
      if (restricted) {
        console.warn('Running in restricted environment - some features may be limited');
        updateProgress('Limited storage mode - some features may not persist', 2);
      } else {
        updateProgress('Storage initialized successfully', 2);
      }

      updateProgress('Initializing database...', 3);
      await initializeDatabase();
      updateProgress('Database initialized', 4);

      updateProgress('Loading words...', 5);
      await importWords();
      updateProgress('Words loaded', 6);

      updateProgress('Loading dictionary data...', 7);
      await importDictionaryData();
      updateProgress('Dictionary data loaded', 8);

      updateProgress('Initializing mood words...', 9);
      await initializeMoodWords();
      updateProgress('Mood words initialized', 10);

      updateProgress('Initializing audio cache...', 11);
      await initAudioCache();
      updateProgress('Audio cache initialized', 12);

      updateProgress('App ready!', 13);
      setIsInitializing(false);
    } catch (error) {
      console.error('[App] Initialization error:', error);
      
      // Handle specific database permission errors
      if (error instanceof Error && error.message.includes('permission') || error.message.includes('access denied')) {
        setInitError('Storage access denied. The app will work with limited functionality. Please check your browser settings or try a different browser mode.');
      } else {
        setInitError(`Initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    initializeApp();
  }, []);

  if (isInitializing) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          bgcolor: 'grey.100'
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={48} sx={{ mb: 2 }} />
          <Typography variant="h6" sx={{ color: 'text.primary', mb: 2 }}>
            {initProgress}
          </Typography>
          <Box sx={{ width: 256, bgcolor: 'grey.300', borderRadius: 1, height: 10, mb: 1 }}>
            <Box
              sx={{
                bgcolor: 'primary.main',
                height: 10,
                borderRadius: 1,
                transition: 'width 0.5s ease',
                width: `${(initStep / 13) * 100}%`
              }}
            />
          </Box>
        </Box>
      </Box>
    );
  }

  if (initError) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          bgcolor: 'grey.100',
          p: 2
        }}
      >
        <Paper
          sx={{
            maxWidth: 400,
            width: '100%',
            p: 3,
            borderRadius: 2,
            boxShadow: 3
          }}
        >
          <Typography variant="h5" color="error" sx={{ mb: 2, fontWeight: 'bold' }}>
            Initialization Error
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
            {initError}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Button
              variant="contained"
              onClick={initializeApp}
              fullWidth
              sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
            >
              Retry Initialization
            </Button>
            <Button
              variant="contained"
              onClick={handleForceReset}
              fullWidth
              sx={{ bgcolor: 'error.main', '&:hover': { bgcolor: 'error.dark' } }}
            >
              Force Reset Database
            </Button>
          </Box>
          <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary', fontSize: '0.875rem' }}>
            If the error persists, try clearing your browser data or using a different browser.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <ErrorBoundary>
      <SettingsProvider>
        <AccessibilityProvider>
          <ProgressProvider>
            <AchievementProvider>
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
                              <Route path="/learning-path" element={
                                <ErrorBoundary>
                                  <LearningPathPage />
                                </ErrorBoundary>
                              } />
                              <Route path="/learning-path/lesson/:lessonId" element={
                                <ErrorBoundary>
                                  <LessonNumbers />
                                </ErrorBoundary>
                              } />
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
                                  <WordLevelProvider>
                                    <ProgressPage />
                                  </WordLevelProvider>
                                </ErrorBoundary>
                              } />
                              <Route path="/profile" element={
                                <ErrorBoundary>
                                  <ProfilePage />
                                </ErrorBoundary>
                              } />
                              <Route path="/knowing" element={
                                <ErrorBoundary>
                                  <WordLevelProvider>
                                    <ErrorBoundary>
                                      <KnowingNavigation>
                                        <Outlet />
                                      </KnowingNavigation>
                                    </ErrorBoundary>
                                  </WordLevelProvider>
                                </ErrorBoundary>
                              }>
                                <Route index element={
                                  <ErrorBoundary>
                                    <KnowingCenter />
                                  </ErrorBoundary>
                                } />
                                <Route path="dictionary" element={
                                  <ErrorBoundary>
                                    <KnowingDictionary />
                                  </ErrorBoundary>
                                } />
                                <Route path="mood" element={
                                  <ErrorBoundary>
                                    <MoodPage />
                                  </ErrorBoundary>
                                } />
                                <Route path="culture" element={
                                  <ErrorBoundary>
                                    <CultureAndRules />
                                  </ErrorBoundary>
                                } />
                                <Route path="progress" element={
                                  <ErrorBoundary>
                                    <ProgressPage />
                                  </ErrorBoundary>
                                } />
                                <Route path="favorites" element={
                                  <ErrorBoundary>
                                    <FavoritesPage />
                                  </ErrorBoundary>
                                } />
                                <Route path="settings" element={
                                  <ErrorBoundary>
                                    <SettingsPage />
                                  </ErrorBoundary>
                                } />
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
            </AchievementProvider>
          </ProgressProvider>
        </AccessibilityProvider>
      </SettingsProvider>
    </ErrorBoundary>
  );
};

export default App; 