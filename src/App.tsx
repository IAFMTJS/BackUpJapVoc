import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import ThemeToggle from './components/ThemeToggle';
import ErrorBoundary from './components/ErrorBoundary';
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

// Database initialization component
const DatabaseInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initializeDatabases = async () => {
      try {
        console.log('Initializing databases...');
        await Promise.all([
          initDatabase(),
          initDictionaryDB()
        ]);
        console.log('All databases initialized successfully');
        setIsInitialized(true);
      } catch (err) {
        console.error('Failed to initialize databases:', err);
        setError(err instanceof Error ? err : new Error('Failed to initialize databases'));
      }
    };

    initializeDatabases();
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error initializing application</div>
          <p className="text-gray-600 dark:text-gray-300">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300">Initializing application...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <Router>
      <DatabaseInitializer>
        <div className="app-background">
          {/* Cityscape SVG as background */}
          <img
            src="/assets/cityscape.svg"
            alt="Neon Cityscape"
            className="cityscape-bg"
            draggable={false}
          />
          <Navigation />
          <div className="flex justify-end p-4">
            <ThemeToggle />
          </div>
          <ErrorBoundary>
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
          </ErrorBoundary>
        </div>
      </DatabaseInitializer>
    </Router>
  );
} 