import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProgressProvider, useProgress } from './context/ProgressContext';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { SoundProvider } from './context/SoundContext';
import { WordLevelProvider } from './context/WordLevelContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { initializeSecurity } from './utils/security';
import { initializeAudioCache } from './utils/audio';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Section2 from './pages/Section2';
import Section3 from './pages/Section3';
import Section4 from './pages/Section4';
import Section5 from './pages/Section5';
import Section6 from './pages/Section6';
import Section7 from './pages/Section7';
import AnimeSection from './pages/AnimeSection';
import ProgressPage from './pages/ProgressPage';
import SettingsPage from './pages/Settings';
import WritingPracticePage from './pages/WritingPracticePage';
import WordLevelsPage from './pages/WordLevelsPage';
import VocabularySection from './pages/VocabularySection';
import Login from './components/Login';
import Signup from './components/Signup';
import ResetPassword from './components/ResetPassword';
import UpdatePassword from './components/UpdatePassword';
import ProtectedRoute from './components/ProtectedRoute';
import SessionWarning from './components/SessionWarning';
import EmailVerification from './components/EmailVerification';
import GuestBanner from './components/GuestBanner';
import ProgressSection from './pages/ProgressSection';
import SRSPage from './pages/SRSPage';
import KanaSection from './pages/KanaSection';
import GamesPage from './pages/GamesPage';
import RomajiSection from './pages/RomajiSection';
import VirtualTeacherPanel from './components/VirtualTeacherPanel';
import { useNavigate, useLocation } from 'react-router-dom';
import HowToUsePage from './pages/HowToUsePage';

const App = () => {
  useEffect(() => {
    // Initialize security measures
    initializeSecurity();
    
    // Initialize audio cache
    initializeAudioCache().catch(error => {
      console.error('Failed to initialize audio cache:', error);
    });
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
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
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
          <ProgressProvider>
            <SettingsProvider>
              <SoundProvider>
                <WordLevelProvider>
                  <AccessibilityProvider>
                    <Router>
                      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
                        <GuestBanner />
                        <Navigation />
                        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                          <div className="max-w-7xl mx-auto">
                            <EmailVerification />
                            <Routes>
                              <Route path="/login" element={<Login />} />
                              <Route path="/signup" element={<Signup />} />
                              <Route path="/reset-password" element={<ResetPassword />} />
                              <Route path="/update-password" element={<UpdatePassword />} />
                              <Route path="/" element={<Home />} />
                              <Route path="/progress" element={<ProgressPage />} />
                              <Route path="/progress-section" element={<ProgressSection />} />
                              <Route path="/settings" element={<SettingsPage />} />
                              <Route path="/srs" element={<SRSPage />} />
                              <Route path="/kana" element={<KanaSection />} />
                              <Route path="/section2" element={<Section2 />} />
                              <Route path="/section3" element={<Section3 />} />
                              <Route path="/section4" element={<Section4 />} />
                              <Route path="/section5" element={<Section5 />} />
                              <Route path="/section6" element={<Section6 />} />
                              <Route path="/section7" element={<Section7 />} />
                              <Route path="/anime" element={<AnimeSection />} />
                              <Route path="/writing-practice" element={<WritingPracticePage />} />
                              <Route path="/word-levels" element={<WordLevelsPage />} />
                              <Route path="/vocabulary" element={<VocabularySection />} />
                              <Route path="/games" element={<GamesPage />} />
                              <Route path="/romaji" element={<RomajiSection />} />
                              <Route path="/how-to-use" element={<HowToUsePage />} />
                            </Routes>
                          </div>
                        </main>
                        <SessionWarning />
                        {/* Add the Virtual Teacher Panel globally */}
                        <VirtualTeacherPanelWrapper />
                      </div>
                    </Router>
                  </AccessibilityProvider>
                </WordLevelProvider>
              </SoundProvider>
            </SettingsProvider>
          </ProgressProvider>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App; 