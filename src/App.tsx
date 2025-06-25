import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, CssBaseline } from '@mui/material';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import Navigation from './components/Navigation';
import { useTheme } from './context/ThemeContext.tsx';
import { useProgress } from './context/ProgressContext.tsx';
import { useSettings } from './context/SettingsContext.tsx';
import { useAccessibility } from './context/AccessibilityContext.tsx';
import { useAchievements } from './context/AchievementContext.tsx';
import { useAudio } from './context/AudioContext.tsx';
import { useAuth } from './context/AuthContext.tsx';
import { useNotifications } from './context/NotificationContext.tsx';
import { useProfile } from './context/ProfileContext.tsx';
import { useQuiz } from './context/QuizContext.tsx';
import { useSRS } from './context/SRSContext.tsx';
import { useVocabulary } from './context/VocabularyContext.tsx';
import { useVirtualSensei } from './context/VirtualSenseiContext.tsx';

// Import all context providers
import { ThemeProvider } from './context/ThemeContext.tsx';
import { ProgressProvider } from './context/ProgressContext.tsx';
import { SettingsProvider } from './context/SettingsContext.tsx';
import { AccessibilityProvider } from './context/AccessibilityContext.tsx';
import { AchievementProvider } from './context/AchievementContext.tsx';
import { AudioProvider } from './context/AudioContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { NotificationProvider } from './context/NotificationContext.tsx';
import { ProfileProvider } from './context/ProfileContext.tsx';
import { QuizProvider } from './context/QuizContext.tsx';
import { SRSProvider } from './context/SRSContext.tsx';
import { VocabularyProvider } from './context/VocabularyContext.tsx';
import { VirtualSenseiProvider } from './context/VirtualSenseiContext.tsx';
import { AppProvider } from './context/AppContext.tsx';

// Error boundary component for better error handling
const ErrorFallback: React.FC<{ componentName: string; error: Error }> = ({ componentName, error }) => {
  console.error(`Error in ${componentName}:`, error);
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      p: 3,
      textAlign: 'center'
    }}>
      <Typography variant="h5" color="error" gutterBottom>
        Something went wrong
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Failed to load {componentName}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {error.message}
      </Typography>
      <Box sx={{ mt: 2 }}>
        <button 
          onClick={() => window.location.reload()} 
          style={{
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reload Page
        </button>
      </Box>
    </Box>
  );
};

// Validate Material-UI components to prevent React error #130
const validateMaterialUIComponents = () => {
  try {
    // Test if Material-UI components are properly loaded
    if (!Box || !CircularProgress || !Typography || !CssBaseline) {
      throw new Error('Material-UI components not properly loaded');
    }
    return true;
  } catch (error) {
    console.error('Material-UI validation failed:', error);
    return false;
  }
};

// Enhanced lazy loading with better error handling
const createLazyComponent = (importFn: () => Promise<any>, componentName: string) => {
  return React.lazy(() => 
    importFn()
      .then(module => {
        // Validate the module has a default export
        if (!module || !module.default) {
          throw new Error(`Module ${componentName} does not have a default export`);
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
const TriviaSection = createLazyComponent(() => import('./pages/TriviaSection'), 'Trivia section');
const AnimeSection = createLazyComponent(() => import('./pages/AnimeSection'), 'Anime section');
const FAQScoring = createLazyComponent(() => import('./pages/FAQScoring'), 'FAQ Scoring');
const FAQLearning = createLazyComponent(() => import('./pages/FAQLearning'), 'FAQ Learning');
const FAQFeatures = createLazyComponent(() => import('./pages/FAQFeatures'), 'FAQ Features');
const FAQProgress = createLazyComponent(() => import('./pages/FAQProgress'), 'FAQ Progress');
const LearningPathPage = createLazyComponent(() => import('./pages/LearningPathPage'), 'Learning Path');
const LessonNumbers = createLazyComponent(() => import('./components/LessonNumbers'), 'Lesson Numbers');
const Login = createLazyComponent(() => import('./components/Login'), 'Login');
const Signup = createLazyComponent(() => import('./components/Signup'), 'Signup');
const ResetPassword = createLazyComponent(() => import('./components/ResetPassword'), 'Reset Password');
const EmailVerification = createLazyComponent(() => import('./components/EmailVerification'), 'Email Verification');
const ProfilePage = createLazyComponent(() => import('./pages/ProfilePage'), 'Profile Page');

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
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                backgroundColor: theme === 'dark' ? '#181830' : '#ffffff',
                color: theme === 'dark' ? '#ffffff' : '#1f2937',
              },
            },
          },
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
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                backgroundColor: '#181830',
                color: '#ffffff',
              },
            },
          },
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
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};

const App: React.FC = () => {
  console.log('[App] Component rendering...');
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);

  // Initialize all contexts
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('[App] Initializing application...');
        
        // Force dark mode class for CSS frameworks
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
        
        // Validate Material-UI components
        if (!validateMaterialUIComponents()) {
          throw new Error('Material-UI components validation failed');
        }

        // Add a small delay to ensure all contexts are properly initialized
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('[App] Application initialized successfully');
        setIsInitialized(true);
      } catch (error) {
        console.error('[App] Initialization error:', error);
        setInitializationError(error instanceof Error ? error.message : 'Unknown initialization error');
      }
    };

    initializeApp();
  }, []);

  // Show initialization error if any
  if (initializationError) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        p: 3,
        textAlign: 'center'
      }}>
        <Typography variant="h5" color="error" gutterBottom>
          Initialization Error
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {initializationError}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </Box>
      </Box>
    );
  }

  // Show loading state while initializing
  if (!isInitialized) {
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
            Initializing application...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <ThemeProvider>
      <SettingsProvider>
        <AccessibilityProvider>
          <AudioProvider>
            <AuthProvider>
              <NotificationProvider>
                <ProfileProvider>
                  <QuizProvider>
                    <SRSProvider>
                      <VocabularyProvider>
                        <VirtualSenseiProvider>
                          <ProgressProvider>
                            <AchievementProvider>
                              <AppProvider>
                                <ThemeWrapper>
                                  <Router>
                                    <Box sx={{ 
                                      display: 'flex', 
                                      flexDirection: 'column', 
                                      minHeight: '100vh',
                                      bgcolor: 'background.default',
                                      color: 'text.primary'
                                    }}>
                                      <Navigation />
                                      <Box component="main" sx={{ flexGrow: 1 }}>
                                        <Suspense fallback={<LoadingFallback />}>
                                          <Routes>
                                            {/* Home */}
                                            <Route path="/" element={<Home />} />
                                            
                                            {/* Settings */}
                                            <Route path="/settings" element={<Settings />} />
                                            
                                            {/* Learning Path (Virtual Sensei) */}
                                            <Route path="/learning-path" element={<LearningPathPage />} />
                                            <Route path="/learning-path/lesson/:lessonId" element={<LessonNumbers />} />
                                            
                                            {/* Learning Section */}
                                            <Route path="/learning" element={<LearningLayout />}>
                                              <Route path="kana" element={<Kana />} />
                                              <Route path="kanji-dictionary" element={<KanjiDictionary />} />
                                              <Route path="romaji" element={<Romaji />} />
                                              <Route path="quiz" element={<QuizPage />} />
                                            </Route>
                                            
                                            {/* Knowing Center */}
                                            <Route path="/knowing" element={<KnowingCenter />}>
                                              <Route path="dictionary" element={<KnowingDictionary />} />
                                              <Route path="mood" element={<MoodPage />} />
                                              <Route path="culture" element={<CultureAndRules />} />
                                              <Route path="progress" element={<ProgressPage />} />
                                              <Route path="favorites" element={<FavoritesPage />} />
                                            </Route>
                                            
                                            {/* SRS */}
                                            <Route path="/srs" element={<SRSPage />} />
                                            
                                            {/* Trivia */}
                                            <Route path="/trivia" element={<TriviaSection />} />
                                            <Route path="/trivia/anime" element={<AnimeSection />} />
                                            <Route path="/trivia/games" element={<GamesPage />} />
                                            
                                            {/* FAQ */}
                                            <Route path="/faq/scoring" element={<FAQScoring />} />
                                            <Route path="/faq/learning" element={<FAQLearning />} />
                                            <Route path="/faq/features" element={<FAQFeatures />} />
                                            <Route path="/faq/progress" element={<FAQProgress />} />
                                            
                                            {/* Progress */}
                                            <Route path="/progress" element={<Progress />} />
                                            
                                            {/* Dictionary */}
                                            <Route path="/dictionary" element={<Dictionary />} />
                                            
                                            {/* Login and Signup */}
                                            <Route path="/login" element={<Login />} />
                                            <Route path="/signup" element={<Signup />} />
                                            <Route path="/reset-password" element={<ResetPassword />} />
                                            <Route path="/email-verification" element={<EmailVerification />} />
                                            <Route path="/profile" element={<ProfilePage />} />
                                            
                                            {/* Catch all - redirect to home */}
                                            <Route path="*" element={<Navigate to="/" replace />} />
                                          </Routes>
                                        </Suspense>
                                      </Box>
                                    </Box>
                                  </Router>
                                </ThemeWrapper>
                              </AppProvider>
                            </AchievementProvider>
                          </ProgressProvider>
                        </VirtualSenseiProvider>
                      </VocabularyProvider>
                    </SRSProvider>
                  </QuizProvider>
                </ProfileProvider>
              </NotificationProvider>
            </AuthProvider>
          </AudioProvider>
        </AccessibilityProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
};

export default App; 