import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
    <div className="flex flex-col justify-center items-center h-screen p-6 text-center">
      <h2 className="text-2xl font-bold text-red-600 mb-4">
        Something went wrong
      </h2>
      <p className="text-text-secondary dark:text-text-dark-secondary mb-2">
        Failed to load {componentName}
      </p>
      <p className="text-sm text-text-muted dark:text-text-dark-muted mb-4">
        {error.message}
      </p>
      <button 
        onClick={() => window.location.reload()} 
        className="px-4 py-2 bg-japanese-red text-white rounded-button hover:bg-japanese-redLight shadow-button hover:shadow-button-hover transition-all duration-300"
      >
        Reload Page
      </button>
    </div>
  );
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

// Learn module components
const LearnIndex = createLazyComponent(() => import('./pages/learn/index'), 'Learn Index');
const LearnLevel = createLazyComponent(() => import('./pages/learn/[levelId]'), 'Learn Level');
const ExerciseTest = createLazyComponent(() => import('./components/learn/ExerciseTest'), 'Exercise Test');
const Signup = createLazyComponent(() => import('./components/Signup'), 'Signup');
const ResetPassword = createLazyComponent(() => import('./components/ResetPassword'), 'Reset Password');
const EmailVerification = createLazyComponent(() => import('./components/EmailVerification'), 'Email Verification');
const ProfilePage = createLazyComponent(() => import('./pages/ProfilePage'), 'Profile Page');

// Loading component with better visual feedback
const LoadingFallback = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-japanese-red"></div>
  </div>
);

// Main App component
const App: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize any app-wide settings or configurations here
        console.log('App initialized successfully');
        
        // Add database reset utility to window for debugging
        if (typeof window !== 'undefined') {
          (window as any).resetJapVocDatabase = async () => {
            console.log('🔄 Resetting JapVoc databases...');
            const databases = [
              'DictionaryDB',
              'JapVocDB',
              'japvoc-romaji-cache',
              'JapaneseAudioDB',
              'AudioCacheDB',
              'JapVocAudioDB'
            ];

            for (const dbName of databases) {
              try {
                await window.indexedDB.deleteDatabase(dbName);
                console.log(`✅ Deleted: ${dbName}`);
              } catch (error) {
                console.warn(`⚠️ Error deleting ${dbName}:`, error);
              }
            }

            // Clear localStorage
            const keysToRemove = [
              'dbVersion',
              'lastSync',
              'audioCacheVersion',
              'databaseInitialized'
            ];
            
            keysToRemove.forEach(key => {
              if (localStorage.getItem(key)) {
                localStorage.removeItem(key);
                console.log(`🗑️ Removed: ${key}`);
              }
            });

            console.log('🎉 Database reset complete! Refreshing page...');
            setTimeout(() => window.location.reload(), 1000);
          };
          
          console.log('🔧 Database reset utility available: window.resetJapVocDatabase()');
        }
        
        setIsInitialized(true);
      } catch (err) {
        console.error('Failed to initialize app:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      }
    };

    initializeApp();
  }, []);

  if (error) {
    return <ErrorFallback componentName="App" error={new Error(error)} />;
  }

  if (!isInitialized) {
    return <LoadingFallback />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-light dark:bg-dark text-text-primary dark:text-text-dark-primary">
        <Navigation />
        <main className="flex-1">
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/learning" element={<LearningLayout />} />
              <Route path="/learning/kana" element={<Kana />} />
              <Route path="/learning/kanji-dictionary" element={<KanjiDictionary />} />
              <Route path="/learning/romaji" element={<Romaji />} />
              <Route path="/learning/quiz" element={<QuizPage />} />
              <Route path="/dictionary" element={<Dictionary />} />
              <Route path="/knowing/dictionary" element={<KnowingDictionary />} />
              <Route path="/srs" element={<SRSPage />} />
              <Route path="/games" element={<GamesPage />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/knowing" element={<KnowingCenter />} />
              <Route path="/culture" element={<CultureAndRules />} />
              <Route path="/mood" element={<MoodPage />} />
              <Route path="/progress-page" element={<ProgressPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/trivia" element={<TriviaSection />} />
              <Route path="/anime" element={<AnimeSection />} />
              <Route path="/faq/scoring" element={<FAQScoring />} />
              <Route path="/faq/learning" element={<FAQLearning />} />
              <Route path="/faq/features" element={<FAQFeatures />} />
              <Route path="/faq/progress" element={<FAQProgress />} />
              <Route path="/learning-path" element={<LearningPathPage />} />
              <Route path="/lesson-numbers" element={<LessonNumbers />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/email-verification" element={<EmailVerification />} />
              <Route path="/profile" element={<ProfilePage />} />
              
              {/* Learn module routes */}
              <Route path="/learn" element={<LearnIndex />} />
              <Route path="/learn/:levelId" element={<LearnLevel />} />
              <Route path="/exercise-test" element={<ExerciseTest />} />
              
              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </Router>
  );
};

// App wrapper with all providers
const AppWrapper: React.FC = () => {
  return (
    <ThemeProvider>
      <AppProvider>
        <AuthProvider>
          <SettingsProvider>
            <AccessibilityProvider>
              <AudioProvider>
                <NotificationProvider>
                  <ProfileProvider>
                    <ProgressProvider>
                      <AchievementProvider>
                        <VocabularyProvider>
                          <QuizProvider>
                            <SRSProvider>
                              <VirtualSenseiProvider>
                                <App />
                              </VirtualSenseiProvider>
                            </SRSProvider>
                          </QuizProvider>
                        </VocabularyProvider>
                      </AchievementProvider>
                    </ProgressProvider>
                  </ProfileProvider>
                </NotificationProvider>
              </AudioProvider>
            </AccessibilityProvider>
          </SettingsProvider>
        </AuthProvider>
      </AppProvider>
    </ThemeProvider>
  );
};

export default AppWrapper; 