import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { useTheme } from './context/ThemeContext';
import Navigation from './components/Navigation';
import ThemeToggle from './components/ThemeToggle';
import ErrorBoundary from './components/ErrorBoundary';
import OfflineStatus from './components/OfflineStatus';
import PushNotifications from './components/PushNotifications';
import { initDatabase } from './utils/offlineSupport';
import { initDictionaryDB } from './utils/dictionaryOfflineSupport';
import './App.css';

// Lazy load all route components
const Home = lazy(() => import('./pages/Home'));
const Settings = lazy(() => import('./pages/Settings'));
const Vocabulary = lazy(() => import('./pages/VocabularySection'));
const Dictionary = lazy(() => import('./pages/Dictionary'));
const Writing = lazy(() => import('./pages/WritingPracticePage'));
const Kanji = lazy(() => import('./pages/Kanji'));
const Romaji = lazy(() => import('./pages/RomajiSection'));
const SRS = lazy(() => import('./pages/SRSPage'));
const Games = lazy(() => import('./pages/Games'));
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

  return (
    <MuiThemeProvider theme={muiTheme}>
      {children}
    </MuiThemeProvider>
  );
};

const App: React.FC = () => {
  useEffect(() => {
    const initializeDatabases = async () => {
      console.log('Initializing databases...');
      try {
        await Promise.all([
          initDatabase(),
          initDictionaryDB()
        ]);
        console.log('All databases initialized successfully');
      } catch (error) {
        console.error('Error initializing databases:', error);
      }
    };

    initializeDatabases();
  }, []);

  return (
    <Router>
      <ErrorBoundary>
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
                <Route path="/games" element={<Games />} />
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
      </ErrorBoundary>
    </Router>
  );
};

export default App; 