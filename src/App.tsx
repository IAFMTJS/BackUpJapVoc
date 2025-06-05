import React, { Suspense, lazy, useEffect, useState, createContext, useContext, useRef, useCallback } from 'react';
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
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import LoadingSpinner from './components/LoadingSpinner';
import { databasePromise, initializeDatabase, forceDatabaseReset } from './utils/databaseConfig';
import { CircularProgress, Box, Typography, Button, LinearProgress } from '@mui/material';
import { KnowingNavigation } from './components/KnowingNavigation';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import Login from './components/Login';
import { AchievementProvider } from './context/AchievementContext';
import { KanjiProvider } from './context/KanjiContext';
import AnimeTriviaPage from './pages/trivia/AnimeTriviaPage';
import MangaTriviaPage from './pages/trivia/MangaTriviaPage';
import GamesTriviaPage from './pages/trivia/GamesTriviaPage';
import ShintoTriviaPage from './pages/trivia/ShintoTriviaPage';
import HistoryTriviaPage from './pages/trivia/HistoryTriviaPage';
import CuisineTriviaPage from './pages/trivia/CuisineTriviaPage';
import MythologyTriviaPage from './pages/trivia/MythologyTriviaPage';
import TriviaHomePage from './pages/trivia/TriviaHomePage';
import AnimeSection from './pages/AnimeSection';
import { RefreshIcon } from './index';
import { InitializationProvider, withInitialization } from './context/InitializationContext';
import { useInitialization } from './context/InitializationContext';
import KanjiDictionary from './pages/learning/KanjiDictionary';
import { KanjiDictionaryProvider } from './context/KanjiDictionaryContext';
import SRSManager from './components/SRSManager';
import SRSStats from './components/SRSStats';
import SRSSettings from './components/SRSSettings';
import { ProgressAndAchievementProvider } from './components/providers/ProgressAndAchievementProvider';

// Optimize lazy loading with better chunk names and preloading hints
const HomePage = lazy(() => import(/* webpackChunkName: "home", webpackPrefetch: true */ './pages/Home'));
const Settings = lazy(() => import(/* webpackChunkName: "settings", webpackPrefetch: true */ './pages/Settings'));
const LearningLayout = lazy(() => import(/* webpackChunkName: "learning" */ './pages/learning/LearningLayout'));
const Romaji = lazy(() => import(/* webpackChunkName: "romaji" */ './pages/learning/Romaji'));
const QuizPage = lazy(() => import(/* webpackChunkName: "quiz" */ './pages/learning/QuizPage'));
const Kana = lazy(() => import(/* webpackChunkName: "kana" */ './pages/learning/Kana'));
const Dictionary = lazy(() => import(/* webpackChunkName: "dictionary" */ './pages/Dictionary'));
const KnowingDictionary = lazy(() => import(/* webpackChunkName: "knowing-dict" */ './pages/KnowingDictionary'));
const SRSPage = lazy(() => import(/* webpackChunkName: "srs" */ './pages/SRSPage'));
const GamesPage = lazy(() => import(/* webpackChunkName: "games" */ './pages/GamesPage'));
const Progress = lazy(() => import(/* webpackChunkName: "progress" */ './pages/Progress'));
const KnowingCenter = lazy(() => import(/* webpackChunkName: "knowing" */ './pages/KnowingCenter'));
const CultureAndRules = lazy(() => import(/* webpackChunkName: "culture" */ './pages/CultureAndRules'));
const MoodPage = lazy(() => import(/* webpackChunkName: "mood" */ './pages/MoodPage'));
const ProgressPage = lazy(() => import(/* webpackChunkName: "progress-page" */ './pages/ProgressPage'));
const FavoritesPage = lazy(() => import(/* webpackChunkName: "favorites" */ './pages/FavoritesPage'));
const SettingsPage = lazy(() => import(/* webpackChunkName: "settings-page" */ './pages/Settings'));
const TriviaSection = lazy(() => import(/* webpackChunkName: "trivia" */ './pages/TriviaSection'));
const FAQScoring = lazy(() => import(/* webpackChunkName: "faq-scoring" */ './pages/FAQScoring'));
const FAQLearning = lazy(() => import(/* webpackChunkName: "faq-learning" */ './pages/FAQLearning'));
const FAQFeatures = lazy(() => import(/* webpackChunkName: "faq-features" */ './pages/FAQFeatures'));
const FAQProgress = lazy(() => import(/* webpackChunkName: "faq-progress" */ './pages/FAQProgress'));
const Writing = lazy(() => import(/* webpackChunkName: "writing" */ './pages/Writing'));
const Signup = lazy(() => import(/* webpackChunkName: "signup" */ './components/Signup'));

// Enhanced loading component with better visual feedback and progress
const LoadingFallback = ({ progress }: { progress?: { step: string; progress: number } }) => (
  <Box sx={{ 
    display: 'flex', 
    flexDirection: 'column',
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    gap: 2
  }}>
    <CircularProgress size={40} />
    {progress && (
      <>
        <Typography variant="body1" color="text.secondary">
          {progress.step}
        </Typography>
        <Box sx={{ width: 200, mt: 1 }}>
          <LinearProgress 
            variant="determinate" 
            value={progress.progress} 
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
      </>
    )}
  </Box>
);

// Enhanced error boundary component
const RouteErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ErrorBoundary
    fallback={({ error, resetErrorBoundary }) => (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        gap: 2,
        p: 3
      }}>
        <Typography variant="h5" color="error" gutterBottom>
          Something went wrong
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 2 }}>
          {error.message}
        </Typography>
        <Button 
          variant="contained" 
          onClick={resetErrorBoundary}
          startIcon={<RefreshIcon />}
        >
          Try Again
        </Button>
      </Box>
    )}
  >
    {children}
  </ErrorBoundary>
);

// Preload critical components
const preloadCriticalComponents = () => {
  // Preload home page and settings as they're most commonly accessed
  const preloadHome = () => import('./pages/Home');
  const preloadSettings = () => import('./pages/Settings');
  
  // Use requestIdleCallback for non-critical preloading
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      preloadHome();
      preloadSettings();
    });
  } else {
    // Fallback for browsers that don't support requestIdleCallback
    setTimeout(() => {
      preloadHome();
      preloadSettings();
    }, 2000);
  }
};

// Optimize theme wrapper to reduce re-renders
export const ThemeWrapper = React.memo<{ children: React.ReactNode }>(({ children }) => {
  const themeContext = useTheme();
  const [isThemeReady, setIsThemeReady] = React.useState(false);

  const muiTheme = React.useMemo(() => {
    const theme = themeContext?.theme || 'dark';
    return createTheme({
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
              border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            },
          },
        },
      },
    });
  }, [themeContext?.theme]);

  React.useEffect(() => {
    if (muiTheme) {
      setIsThemeReady(true);
    }
  }, [muiTheme]);

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
});

// Add debug logging utility
const DEBUG = true;
function log(component: string, message: string, data?: any) {
  if (DEBUG) {
    const timestamp = new Date().toISOString();
    if (data) {
      console.log(`[${timestamp}] [${component}] ${message}`, data);
    } else {
      console.log(`[${timestamp}] [${component}] ${message}`);
    }
  }
}

// Add AbortController for managing async operations
const createAbortController = () => new AbortController();

// Add a context initialization coordinator
const ContextInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const { db, isReady, error: dbError } = useDatabase();

  useEffect(() => {
    if (!db || !isReady || dbError) return;

    const initializeContexts = async () => {
      try {
        // Wait for all critical contexts to be ready
        await Promise.all([
          // Add any critical context initialization promises here
          // For example, if you need to wait for specific data to be loaded
          new Promise(resolve => setTimeout(resolve, 100)) // Small delay to ensure contexts are mounted
        ]);

        setIsInitialized(true);
      } catch (error) {
        console.error('Context initialization failed:', error);
        setInitError(error instanceof Error ? error.message : 'Failed to initialize contexts');
      }
    };

    initializeContexts();
  }, [db, isReady, dbError]);

  if (!isInitialized || !isReady) {
    return <LoadingFallback />;
  }

  if (initError) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        gap: 2,
        p: 3
      }}>
        <Typography variant="h5" color="error" gutterBottom>
          Initialization Error
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 2 }}>
          {initError}
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => window.location.reload()}
          startIcon={<RefreshIcon />}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return <>{children}</>;
};

// Wrap providers with initialization
const DatabaseProviderWithInit = withInitialization(DatabaseProvider, 'DatabaseProvider');
const AuthProviderWithInit = withInitialization(AuthProvider, 'AuthProvider');
const ThemeProviderWithInit = withInitialization(ThemeProvider, 'ThemeProvider');
const SettingsProviderWithInit = withInitialization(SettingsProvider, 'SettingsProvider');
const AccessibilityProviderWithInit = withInitialization(AccessibilityProvider, 'AccessibilityProvider');
const WordProviderWithInit = withInitialization(WordProvider, 'WordProvider');
const WordLevelProviderWithInit = withInitialization(WordLevelProvider, 'WordLevelProvider');
const AchievementProviderWithInit = withInitialization(AchievementProvider, 'AchievementProvider');
const ProgressProviderWithInit = withInitialization(ProgressProvider, 'ProgressProvider');
const LearningProviderWithInit = withInitialization(LearningProvider, 'LearningProvider');
const AppProviderWithInit = withInitialization(AppProvider, 'AppProvider');
const DictionaryProviderWithInit = withInitialization(DictionaryProvider, 'DictionaryProvider');

// Update the App component to use initialization
function App() {
  return (
    <ErrorBoundary>
      <DatabaseProviderWithInit>
        <KanjiProvider>
          <AudioProvider>
            <DictionaryProviderWithInit>
              <AuthProviderWithInit>
                <ThemeProviderWithInit>
                  <ThemeWrapper>
                    <AppProviderWithInit>
                      <SettingsProviderWithInit>
                        <AccessibilityProviderWithInit>
                          <WordProviderWithInit>
                            <WordLevelProviderWithInit>
                              <ProgressAndAchievementProvider>
                                <LearningProviderWithInit>
                                  <Suspense fallback={<LoadingFallback />}>
                                    <Routes>
                                      <Route path="/login" element={
                                        <RouteErrorBoundary>
                                          <Login />
                                        </RouteErrorBoundary>
                                      } />
                                      <Route path="/register" element={
                                        <RouteErrorBoundary>
                                          <Signup />
                                        </RouteErrorBoundary>
                                      } />
                                      <Route element={
                                        <RouteErrorBoundary>
                                          <MainLayout>
                                            <Outlet />
                                          </MainLayout>
                                        </RouteErrorBoundary>
                                      }>
                                        {/* Always render Home route, but show loading state if not ready */}
                                        <Route path="/" element={
                                          <RouteErrorBoundary>
                                            <HomePage />
                                          </RouteErrorBoundary>
                                        } />
                                        {/* Other routes */}
                                        <Route path="/settings" element={
                                          <RouteErrorBoundary>
                                            <Settings />
                                          </RouteErrorBoundary>
                                        } />
                                        <Route path="/learning" element={<LearningLayout />}>
                                          <Route index element={<Navigate to="/learning/kana" replace />} />
                                          <Route path="kana" element={<Kana />} />
                                          <Route path="kanji-dictionary" element={
                                            <RouteErrorBoundary>
                                              <KanjiDictionaryProvider>
                                                <KanjiDictionary />
                                              </KanjiDictionaryProvider>
                                            </RouteErrorBoundary>
                                          } />
                                          <Route path="romaji" element={<Romaji />} />
                                          <Route path="quiz" element={<QuizPage />} />
                                          <Route path="writing" element={
                                            <RouteErrorBoundary>
                                              <Writing />
                                            </RouteErrorBoundary>
                                          } />
                                        </Route>
                                        <Route path="/srs" element={
                                          <RouteErrorBoundary>
                                            <SRSPage />
                                          </RouteErrorBoundary>
                                        }>
                                          <Route index element={<SRSPage />} />
                                          <Route path="review" element={
                                            <RouteErrorBoundary>
                                              <SRSManager />
                                            </RouteErrorBoundary>
                                          } />
                                          <Route path="stats" element={
                                            <RouteErrorBoundary>
                                              <SRSStats />
                                            </RouteErrorBoundary>
                                          } />
                                          <Route path="settings" element={
                                            <RouteErrorBoundary>
                                              <SRSSettings />
                                            </RouteErrorBoundary>
                                          } />
                                        </Route>
                                        <Route path="/games" element={
                                          <RouteErrorBoundary>
                                            <GamesPage />
                                          </RouteErrorBoundary>
                                        } />
                                        <Route path="/anime" element={
                                          <RouteErrorBoundary>
                                            <AnimeSection />
                                          </RouteErrorBoundary>
                                        } />
                                        <Route path="/progress" element={
                                          <RouteErrorBoundary>
                                            <ProgressProvider>
                                              <WordLevelProvider>
                                                <AchievementProvider>
                                                  <ProgressPage />
                                                </AchievementProvider>
                                              </WordLevelProvider>
                                            </ProgressProvider>
                                          </RouteErrorBoundary>
                                        } />
                                        <Route path="/profile" element={
                                          <RouteErrorBoundary>
                                            <ProgressProvider>
                                              <WordLevelProvider>
                                                <AchievementProvider>
                                                  <ProfilePage />
                                                </AchievementProvider>
                                              </WordLevelProvider>
                                            </ProgressProvider>
                                          </RouteErrorBoundary>
                                        } />
                                        <Route path="/profile/edit" element={
                                          <RouteErrorBoundary>
                                            <ProgressProvider>
                                              <WordLevelProvider>
                                                <AchievementProvider>
                                                  <EditProfilePage />
                                                </AchievementProvider>
                                              </WordLevelProvider>
                                            </ProgressProvider>
                                          </RouteErrorBoundary>
                                        } />
                                        <Route path="/knowing" element={
                                          <RouteErrorBoundary>
                                            <ProgressProvider>
                                              <KnowingNavigation>
                                                <Outlet />
                                              </KnowingNavigation>
                                            </ProgressProvider>
                                          </RouteErrorBoundary>
                                        }>
                                          <Route index element={<KnowingCenter />} />
                                          <Route path="dictionary" element={<KnowingDictionary />} />
                                          <Route path="kanji-dictionary" element={
                                            <RouteErrorBoundary>
                                              <KanjiDictionaryProvider>
                                                <KanjiDictionary />
                                              </KanjiDictionaryProvider>
                                            </RouteErrorBoundary>
                                          } />
                                          <Route path="mood" element={<MoodPage />} />
                                          <Route path="culture" element={<CultureAndRules />} />
                                          <Route path="favorites" element={<FavoritesPage />} />
                                          <Route path="settings" element={<SettingsPage />} />
                                          <Route path="*" element={<Navigate to="/knowing" replace />} />
                                        </Route>
                                        <Route path="/trivia" element={<TriviaHomePage />} />
                                        <Route path="/trivia/anime" element={<AnimeSection />} />
                                        <Route path="/trivia/games" element={<GamesTriviaPage />} />
                                        <Route path="/trivia/shinto" element={<ShintoTriviaPage />} />
                                        <Route path="/trivia/history" element={<HistoryTriviaPage />} />
                                        <Route path="/trivia/cuisine" element={<CuisineTriviaPage />} />
                                        <Route path="/trivia/mythology" element={<MythologyTriviaPage />} />
                                        <Route path="/trivia/*" element={<Navigate to="/trivia" replace />} />
                                        <Route path="/faq" element={
                                          <RouteErrorBoundary>
                                            <Outlet />
                                          </RouteErrorBoundary>
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
                                </LearningProviderWithInit>
                              </ProgressAndAchievementProvider>
                            </WordLevelProviderWithInit>
                          </WordProviderWithInit>
                        </AccessibilityProviderWithInit>
                      </SettingsProviderWithInit>
                    </AppProviderWithInit>
                  </ThemeWrapper>
                </ThemeProviderWithInit>
              </AuthProviderWithInit>
            </DictionaryProviderWithInit>
          </AudioProvider>
        </KanjiProvider>
      </DatabaseProviderWithInit>
    </ErrorBoundary>
  );
}

// Create a new AppWrapper component to handle initialization
function AppWrapper() {
  const { state, retry } = useInitialization();

  // Show loading state during initialization
  if (state.isInitializing || !state.isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg">{state.progress.step}</p>
          {state.progress.details && (
            <p className="text-sm text-gray-500 mt-2">{state.progress.details}</p>
          )}
          {state.error && (
            <div className="mt-4">
              <p className="text-sm text-red-500">{state.error}</p>
              <button
                onClick={retry}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Retry
              </button>
            </div>
          )}
          {state.progress.progress > 0 && (
            <div className="w-64 mx-auto mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${state.progress.progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return <App />;
}

export default AppWrapper; 