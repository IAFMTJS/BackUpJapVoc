import React, { useEffect, lazy, Suspense, useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { AppProvider } from './context/AppContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ProgressProvider, useProgress } from './context/ProgressContext';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { SoundProvider } from './context/SoundContext';
import { WordLevelProvider } from './context/WordLevelContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { AchievementProvider } from './context/AchievementContext';
import { initializeSecurity } from './utils/security';
import { initializeAudioCache } from './utils/audio';
import { initDatabase } from './utils/offlineSupport';
import { initDictionaryDB } from './utils/dictionaryOfflineSupport';
import { openDB, closeDB } from './utils/indexedDB';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Vocabulary from './pages/VocabularySection';
import Dictionary from './pages/Section2';
import Writing from './pages/WritingPracticePage';
import Kanji from './pages/Section4';
import Settings from './pages/Settings';
import HowToUse from './pages/HowToUsePage';
import Progress from './pages/ProgressPage';
import Games from './pages/GamesPage';
import Romaji from './pages/RomajiSection';
import Login from './components/Login';
import Signup from './components/Signup';
import ResetPassword from './components/ResetPassword';
import UpdatePassword from './components/UpdatePassword';
import ProtectedRoute from './components/ProtectedRoute';
import SessionWarning from './components/SessionWarning';
import EmailVerification from './components/EmailVerification';
import GuestBanner from './components/GuestBanner';
import VirtualTeacherPanel from './components/VirtualTeacherPanel';
import { useNavigate, useLocation } from 'react-router-dom';
import SRSPage from './pages/SRSPage';
import AnimeSection from './pages/AnimeSection';
import WordLevelsPage from './pages/WordLevelsPage';
import Achievements from './components/Achievements';
import { AchievementTracker } from './components/AchievementTracker';
import './App.css';
import './styles/progress.css';
import { pwaUtils } from './utils/pwa';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { clearAllDatabases } from './utils/clearDatabases';

// Lazy load heavy components
const LazyProgress = lazy(() => import('./pages/ProgressPage'));
const LazyDictionary = lazy(() => import('./pages/Section2'));
const LazyVocabulary = lazy(() => import('./pages/VocabularySection'));
const LazyWriting = lazy(() => import('./pages/WritingPracticePage'));
const LazyKanji = lazy(() => import('./pages/Section4'));
const LazyGames = lazy(() => import('./pages/GamesPage'));
const LazyRomaji = lazy(() => import('./pages/RomajiSection'));
const LazySettings = lazy(() => import('./pages/Settings'));
const LazySRSPage = lazy(() => import('./pages/SRSPage'));

// Separate component to handle Material-UI theming
const MuiThemeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useTheme();
  
  const muiTheme = createTheme({
    palette: {
      mode: theme === 'dark' ? 'dark' : 'light',
      primary: {
        main: '#0095ff', // neon blue
      },
      secondary: {
        main: '#ff4081', // accent color
      },
      background: {
        default: theme === 'dark' ? '#1a1a1a' : '#ffffff',
        paper: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
      },
    },
  });

  return (
    <MuiThemeProvider theme={muiTheme}>
      {children}
    </MuiThemeProvider>
  );
};

const App = () => {
  const [initError, setInitError] = useState<string | null>(null);
  const [initProgress, setInitProgress] = useState<{
    step: string;
    status: 'pending' | 'loading' | 'complete' | 'error';
    error?: string;
  }[]>([]);
  const initRef = useRef<boolean>(false);

  useEffect(() => {
    const initializeApp = async () => {
      // Prevent multiple initialization attempts
      if (initRef.current) {
        console.log('[App] Initialization already in progress, skipping...');
        return;
      }
      initRef.current = true;

      const steps = [
        { id: 'security', name: 'Security initialization' },
        { id: 'database', name: 'Database initialization' },
        { id: 'pwa', name: 'PWA features' },
        { id: 'audio', name: 'Audio cache' },
        { id: 'kuroshiro', name: 'Japanese text analyzer' }
      ];

      // Initialize progress tracking
      setInitProgress(steps.map(step => ({
        step: step.name,
        status: 'pending'
      })));

      const updateStepStatus = (stepId: string, status: 'loading' | 'complete' | 'error', error?: string) => {
        setInitProgress(prev => prev.map(step => 
          step.step === steps.find(s => s.id === stepId)?.name
            ? { ...step, status, error }
            : step
        ));
      };

      try {
        // Step 1: Security initialization (required)
        updateStepStatus('security', 'loading');
        try {
          await initializeSecurity();
          updateStepStatus('security', 'complete');
        } catch (error) {
          console.error('[App] Security initialization failed:', error);
          updateStepStatus('security', 'error', error instanceof Error ? error.message : 'Security initialization failed');
          throw error;
        }

        // Step 2: Database initialization (required)
        updateStepStatus('database', 'loading');
        try {
          // Initialize databases sequentially with detailed logging
          console.log('[App] Starting sequential database initialization...', {
            timestamp: new Date().toISOString(),
            attempt: 1
          });
          
          // 1. Main database
          console.log('[App] Initializing main database...', {
            timestamp: new Date().toISOString()
          });
          try {
            // Clear any existing database connections first
            await closeDB();
            await openDB();
            console.log('[App] Main database initialized successfully', {
              timestamp: new Date().toISOString()
            });
          } catch (error) {
            console.error('[App] Main database initialization failed:', {
              error,
              message: error instanceof Error ? error.message : 'Unknown error',
              timestamp: new Date().toISOString()
            });
            throw error;
          }

          // 2. Offline support database
          console.log('[App] Initializing offline support database...', {
            timestamp: new Date().toISOString()
          });
          try {
            await initDatabase();
            console.log('[App] Offline support database initialized successfully', {
              timestamp: new Date().toISOString()
            });
          } catch (error) {
            console.error('[App] Offline support database initialization failed:', {
              error,
              message: error instanceof Error ? error.message : 'Unknown error',
              timestamp: new Date().toISOString()
            });
            throw error;
          }

          // 3. Dictionary database
          console.log('[App] Initializing dictionary database...', {
            timestamp: new Date().toISOString()
          });
          try {
            await initDictionaryDB();
            console.log('[App] Dictionary database initialized successfully', {
              timestamp: new Date().toISOString()
            });
          } catch (error) {
            console.error('[App] Dictionary database initialization failed:', {
              error,
              message: error instanceof Error ? error.message : 'Unknown error',
              timestamp: new Date().toISOString()
            });
            throw error;
          }

          console.log('[App] All databases initialized successfully', {
            timestamp: new Date().toISOString()
          });
          updateStepStatus('database', 'complete');
        } catch (error) {
          console.error('[App] Database initialization failed:', {
            error,
            message: error instanceof Error ? error.message : 'Database initialization failed',
            timestamp: new Date().toISOString()
          });
          updateStepStatus('database', 'error', error instanceof Error ? error.message : 'Database initialization failed');
          throw error;
        }

        // Step 3: Initialize PWA features (optional)
        updateStepStatus('pwa', 'loading');
        try {
          // Start PWA initialization but don't wait for it
          const pwaInitPromise = pwaUtils.initialize();
          
          // Set a timeout for the PWA initialization
          const pwaTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('PWA initialization timeout')), 5000)
          );

          // Race between initialization and timeout
          await Promise.race([pwaInitPromise, pwaTimeout])
            .then(() => {
              console.log('[App] PWA initialization completed successfully');
              updateStepStatus('pwa', 'complete');
            })
            .catch(error => {
              console.warn('[App] PWA initialization timed out or failed:', error);
              // Mark as complete anyway since it's optional
              updateStepStatus('pwa', 'complete');
            });

          // Continue with other initializations regardless of PWA status
        } catch (error) {
          console.warn('[App] PWA initialization failed:', error);
          // Mark as complete anyway since it's optional
          updateStepStatus('pwa', 'complete');
        }

        // Step 4: Initialize audio cache (optional)
        updateStepStatus('audio', 'loading');
        try {
          await initializeAudioCache();
          updateStepStatus('audio', 'complete');
        } catch (error) {
          console.warn('[App] Audio cache initialization failed:', error);
          updateStepStatus('audio', 'error', error instanceof Error ? error.message : 'Audio cache initialization failed');
          // Don't throw, continue with other initializations
        }

        // Step 5: Initialize Kuroshiro (optional)
        updateStepStatus('kuroshiro', 'loading');
        try {
          await kuroshiroInstance.init();
          updateStepStatus('kuroshiro', 'complete');
        } catch (error) {
          console.warn('[App] Kuroshiro initialization failed:', error);
          updateStepStatus('kuroshiro', 'error', error instanceof Error ? error.message : 'Kuroshiro initialization failed');
          // Don't throw, continue with other initializations
        }

      } catch (error) {
        console.error('[App] Initialization failed:', error);
        setInitError(error instanceof Error ? error.message : 'Failed to initialize application');
      } finally {
        initRef.current = false;
      }
    };

    initializeApp();

    // Cleanup function
    return () => {
      console.log('[App] Running cleanup...', {
        timestamp: new Date().toISOString()
      });
      closeDB().catch(error => {
        console.error('[App] Error during cleanup:', error);
      });
    };
  }, []);

  // Loading screen component with progress
  const LoadingScreen = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center mb-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Initializing application...</p>
      </div>
      <div className="w-full max-w-md space-y-2">
        {initProgress.map((step, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded-full ${
              step.status === 'complete' ? 'bg-green-500' :
              step.status === 'error' ? 'bg-red-500' :
              step.status === 'loading' ? 'bg-blue-500 animate-pulse' :
              'bg-gray-300'
            }`}></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">{step.step}</span>
            {step.error && (
              <span className="text-xs text-red-500">({step.error})</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  if (initError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">Initialization Error</h2>
          <p className="text-gray-600 dark:text-gray-400">{initError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (initProgress.some(step => step.status === 'loading' || step.status === 'pending')) {
    return <LoadingScreen />;
  }

  // --- Virtual Teacher Panel global integration ---
  // Use hooks inside a wrapper component
  const VirtualTeacherPanelWrapper = () => {
    const { progress } = useProgress();
    const navigate = useNavigate();
    const location = useLocation();
    // Hide on login, signup, reset-password, update-password, settings
    const hiddenPaths = ['/login', '/signup', '/reset-password', '/update-password', '/settings'];
    if (hiddenPaths.includes(location.pathname)) return null;
    // Aggregate progress for the panel
    // These are example calculations; adjust as needed for your app's logic
    const masteredWords = Object.values(progress).filter(p => p.section === 'Words' && p.correct >= 1).length;
    const practicedSentences = Object.values(progress).filter(p => p.section === 'Sentences' && p.correct >= 1).length;
    const listeningCount = Object.values(progress).filter(p => p.section === 'Listening' && p.correct >= 1).length;
    const timedScore = Object.values(progress).filter(p => p.section === 'Timed' && p.correct >= 1).length;
    const reviewCount = Object.values(progress).filter(p => p.section === 'Review' && p.correct >= 1).length;
    const handleGoToSection = (section) => {
      // Map section names to routes
      const map = {
        'Practice': '/romaji',
        'Words': '/vocabulary',
        'Sentences': '/romaji',
        'Stories': '/romaji',
        'Games': '/games',
        'Review': '/progress',
        'Listening': '/romaji',
        'Timed': '/romaji',
      };
      navigate(map[section] || '/');
    };
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <VirtualTeacherPanel
          masteredWords={masteredWords}
          practicedSentences={practicedSentences}
          listeningCount={listeningCount}
          timedScore={timedScore}
          reviewCount={reviewCount}
          onGoToSection={handleGoToSection}
        />
      </div>
    );
  };
  // --- end Virtual Teacher Panel wrapper ---

  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <WordLevelProvider>
            <ProgressProvider>
              <SettingsProvider>
                <SoundProvider>
                  <AccessibilityProvider>
                    <MuiThemeWrapper>
                      <Router>
                        <div className="min-h-screen bg-dark">
                          <GuestBanner />
                          <Navigation />
                          <main className="flex-1 container mx-auto px-4 py-6">
                            <div className="max-w-7xl mx-auto">
                              <EmailVerification />
                              <AchievementProvider>
                                <AchievementTracker />
                                <Routes>
                                  <Route path="/login" element={<Login />} />
                                  <Route path="/signup" element={<Signup />} />
                                  <Route path="/reset-password" element={<ResetPassword />} />
                                  <Route path="/update-password" element={<UpdatePassword />} />
                                  <Route path="/" element={<Home />} />
                                  <Route 
                                    path="/vocabulary" 
                                    element={
                                      <ProtectedRoute>
                                        <Suspense fallback={<LoadingFallback />}>
                                          <LazyVocabulary />
                                        </Suspense>
                                      </ProtectedRoute>
                                    } 
                                  />
                                  <Route 
                                    path="/dictionary" 
                                    element={
                                      <ProtectedRoute>
                                        <Suspense fallback={<LoadingFallback />}>
                                          <LazyDictionary />
                                        </Suspense>
                                      </ProtectedRoute>
                                    } 
                                  />
                                  <Route 
                                    path="/writing" 
                                    element={
                                      <ProtectedRoute>
                                        <Suspense fallback={<LoadingFallback />}>
                                          <LazyWriting />
                                        </Suspense>
                                      </ProtectedRoute>
                                    } 
                                  />
                                  <Route 
                                    path="/kanji" 
                                    element={
                                      <ProtectedRoute>
                                        <Suspense fallback={<LoadingFallback />}>
                                          <LazyKanji />
                                        </Suspense>
                                      </ProtectedRoute>
                                    } 
                                  />
                                  <Route 
                                    path="/settings" 
                                    element={
                                      <ProtectedRoute>
                                        <Suspense fallback={<LoadingFallback />}>
                                          <LazySettings />
                                        </Suspense>
                                      </ProtectedRoute>
                                    } 
                                  />
                                  <Route 
                                    path="/progress" 
                                    element={
                                      <ProtectedRoute>
                                        <Suspense fallback={<LoadingFallback />}>
                                          <LazyProgress />
                                        </Suspense>
                                      </ProtectedRoute>
                                    } 
                                  />
                                  <Route 
                                    path="/games" 
                                    element={
                                      <ProtectedRoute>
                                        <Suspense fallback={<LoadingFallback />}>
                                          <LazyGames />
                                        </Suspense>
                                      </ProtectedRoute>
                                    } 
                                  />
                                  <Route 
                                    path="/romaji" 
                                    element={
                                      <ProtectedRoute>
                                        <Suspense fallback={<LoadingFallback />}>
                                          <LazyRomaji />
                                        </Suspense>
                                      </ProtectedRoute>
                                    } 
                                  />
                                  <Route path="/how-to-use" element={<HowToUse />} />
                                  <Route 
                                    path="/srs" 
                                    element={
                                      <ProtectedRoute>
                                        <Suspense fallback={<LoadingFallback />}>
                                          <LazySRSPage />
                                        </Suspense>
                                      </ProtectedRoute>
                                    } 
                                  />
                                  <Route path="/anime" element={<ProtectedRoute><AnimeSection /></ProtectedRoute>} />
                                  <Route path="/word-levels" element={<ProtectedRoute><WordLevelsPage /></ProtectedRoute>} />
                                  <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
                                </Routes>
                              </AchievementProvider>
                            </div>
                          </main>
                          <SessionWarning />
                          <VirtualTeacherPanelWrapper />
                        </div>
                      </Router>
                    </MuiThemeWrapper>
                  </AccessibilityProvider>
                </SoundProvider>
              </SettingsProvider>
            </ProgressProvider>
          </WordLevelProvider>
        </AppProvider>
      </AuthProvider>
      <PWAInstallPrompt />
    </ThemeProvider>
  );
};

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

export default App; 