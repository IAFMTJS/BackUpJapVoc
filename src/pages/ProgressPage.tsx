import React, { useState, lazy, Suspense } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import { useSettings } from '../context/SettingsContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { ProgressItem } from '../types';
import { quizWords } from '../data/quizData';
import { kanjiList } from '../data/kanjiData';
import { beginnerPhrases } from './AnimeSection';
import { romajiWords, romajiSentences, romajiStories } from '../data/romajiWords';
import JapaneseCityscape from '../components/visualizations/JapaneseCityscape';
import { Paper, Box } from '@mui/material';

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    <span className="ml-3 text-lg">Loading progress...</span>
  </div>
);

// Lazy load heavy components
const LazyDictionary = lazy(() => import('../components/Dictionary'));
const LazyLearningProgress = lazy(() => import('../components/LearningProgress'));
const LazyProgressVisuals = lazy(() => import('../components/ProgressVisuals'));

// Loading fallback component for lazy-loaded components
const ComponentLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    <span className="ml-3 text-sm">Loading component...</span>
  </div>
);

type TabType = 'progress' | 'dictionary';

const sections = [
  { 
    id: 'vocabulary', 
    name: 'Vocabulary Quiz', 
    icon: '📝', 
    total: quizWords.filter(item => item.isHiragana || item.isKatakana).length,
    description: 'Test your knowledge of Japanese vocabulary'
  },
  { 
    id: 'dictionary', 
    name: 'Dictionary', 
    icon: '📖', 
    total: quizWords.filter(item => item.isHiragana || item.isKatakana).length + kanjiList.length,
    description: 'Learn and track vocabulary progress'
  },
  { 
    id: 'kanji', 
    name: 'Kanji', 
    icon: '🀄', 
    total: kanjiList.length,
    description: 'Master Japanese characters'
  },
  { 
    id: 'games', 
    name: 'Games', 
    icon: '🎮', 
    total: 50,
    description: 'Learn through interactive games',
    path: '/games'
  },
  { 
    id: 'vocabulary-builder', 
    name: 'Vocabulary Builder', 
    icon: '📚', 
    total: quizWords.length,
    description: 'Build your vocabulary systematically'
  },
  { 
    id: 'anime', 
    name: 'Anime Section', 
    icon: '🎬', 
    total: beginnerPhrases.length,
    description: 'Learn from anime and manga'
  },
  {
    id: 'romaji',
    name: 'Romaji Practice',
    icon: '🔤',
    total: romajiWords.length + romajiSentences.length + romajiStories.length,
    description: 'Master Romaji words, sentences, and stories'
  },
];

const ProgressPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('progress');
  const { getThemeClasses, theme } = useTheme();
  const { 
    progress, 
    isLoading: isProgressLoading, 
    error: progressError,
    settings,
    isSettingsLoading,
    settingsError
  } = useProgress();
  const { settings: accessibilitySettings, isLoading: isAccessibilityLoading } = useAccessibility();

  const themeClasses = getThemeClasses();

  // Show error state if there's a critical error
  if (progressError) {
    return (
      <div className={themeClasses.container}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Link to="/" className={`${themeClasses.nav.link.default} mr-4`}>
                ← Back to Home
              </Link>
              <h1 className={`text-3xl font-bold ${themeClasses.text.primary}`}>
                Learning Progress
              </h1>
            </div>
          </div>
          <div className={`p-6 rounded-lg ${themeClasses.card} ${themeClasses.error}`}>
            <h2 className={`text-xl font-semibold mb-4 ${themeClasses.text.error}`}>
              Error Loading Progress
            </h2>
            <p className={`mb-4 ${themeClasses.text.muted}`}>
              {progressError}
            </p>
            <button
              onClick={() => window.location.reload()}
              className={`px-4 py-2 rounded ${themeClasses.button.primary}`}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render the page header
  const renderHeader = () => (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center">
        <Link to="/" className={`${themeClasses.nav.link.default} mr-4`}>
          ← Back to Home
        </Link>
        <h1 className={`text-3xl font-bold ${themeClasses.text.primary}`}>
          Learning Progress
        </h1>
      </div>
    </div>
  );

  // Render loading states for specific sections
  const renderLoadingState = (section: string) => (
    <div className={`p-4 rounded-lg ${themeClasses.card} mb-4`}>
      <div className="flex items-center">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-sm">Loading {section}...</span>
      </div>
    </div>
  );

  return (
    <div className={themeClasses.container}>
      {/* Decorative cityscape background */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-10">
        <JapaneseCityscape 
          width={1000}
          height={500}
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            transform: 'scaleX(-1)',
            filter: theme === 'dark' ? 'brightness(0.6)' : 'brightness(0.9)'
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {renderHeader()}

        {/* Main content area */}
        <div className="space-y-6">
          {/* Progress Visualization */}
          <div className={`p-6 rounded-lg ${themeClasses.card}`}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3,
                borderRadius: 4,
                background: theme => theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.05)' 
                  : 'rgba(0, 0, 0, 0.02)',
                backdropFilter: 'blur(10px)',
                border: theme => `1px solid ${theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.1)' 
                  : 'rgba(0, 0, 0, 0.1)'}`
              }}
            >
              {isProgressLoading ? (
                renderLoadingState('progress visualization')
              ) : (
                <Suspense fallback={<ComponentLoadingFallback />}>
                  <LazyProgressVisuals />
                </Suspense>
              )}
            </Paper>
          </div>

          {/* Dictionary Section */}
          {activeTab === 'dictionary' && (
            <Box sx={{ mt: 4 }}>
              {isSettingsLoading ? (
                renderLoadingState('dictionary settings')
              ) : (
                <Suspense fallback={<ComponentLoadingFallback />}>
                  <LazyDictionary />
                </Suspense>
              )}
            </Box>
          )}

          {/* Progress Section */}
          {activeTab === 'progress' && (
            <Box sx={{ mt: 4 }}>
              {isProgressLoading ? (
                renderLoadingState('learning progress')
              ) : (
                <Suspense fallback={<ComponentLoadingFallback />}>
                  <LazyLearningProgress />
                </Suspense>
              )}
            </Box>
          )}

          {/* Accessibility Settings Notice */}
          {isAccessibilityLoading && (
            <div className={`p-4 rounded-lg ${themeClasses.card} bg-yellow-50 dark:bg-yellow-900/20`}>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Loading accessibility settings...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressPage; 