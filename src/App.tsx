import React, { useEffect } from 'react';
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
  useEffect(() => {
    // Initialize security measures (this is lightweight)
    initializeSecurity();
    
    // Initialize audio cache in the background without blocking
    const initAudio = async () => {
      try {
        // Add a small delay to let the UI render first
        await new Promise(resolve => setTimeout(resolve, 1000));
        await initializeAudioCache();
      } catch (error) {
        console.error('Failed to initialize audio cache:', error);
      }
    };
    initAudio();
  }, []);

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
              <AchievementProvider>
                <AchievementTracker />
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
                                <Routes>
                                  <Route path="/login" element={<Login />} />
                                  <Route path="/signup" element={<Signup />} />
                                  <Route path="/reset-password" element={<ResetPassword />} />
                                  <Route path="/update-password" element={<UpdatePassword />} />
                                  <Route path="/" element={<Home />} />
                                  <Route path="/vocabulary" element={<ProtectedRoute><Vocabulary /></ProtectedRoute>} />
                                  <Route path="/dictionary" element={<ProtectedRoute><Dictionary /></ProtectedRoute>} />
                                  <Route path="/writing" element={<ProtectedRoute><Writing /></ProtectedRoute>} />
                                  <Route path="/kanji" element={<ProtectedRoute><Kanji /></ProtectedRoute>} />
                                  <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                                  <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
                                  <Route path="/games" element={<ProtectedRoute><Games /></ProtectedRoute>} />
                                  <Route path="/romaji" element={<ProtectedRoute><Romaji /></ProtectedRoute>} />
                                  <Route path="/how-to-use" element={<HowToUse />} />
                                  <Route path="/srs" element={<ProtectedRoute><SRSPage /></ProtectedRoute>} />
                                  <Route path="/anime" element={<ProtectedRoute><AnimeSection /></ProtectedRoute>} />
                                  <Route path="/word-levels" element={<ProtectedRoute><WordLevelsPage /></ProtectedRoute>} />
                                  <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
                                </Routes>
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
              </AchievementProvider>
            </ProgressProvider>
          </WordLevelProvider>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App; 