import React, { useState, lazy, Suspense, Component } from 'react';
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

// Lazy load heavy components with error handling
const LazyDictionary = lazy(() => {
  return import('../components/Dictionary').catch(error => {
    console.error('Error loading Dictionary component:', error);
    return { default: () => <div>Error loading Dictionary component</div> };
  });
});

const LazyLearningProgress = lazy(() => {
  return import('../components/LearningProgress').catch(error => {
    console.error('Error loading LearningProgress component:', error);
    return { default: () => <div>Error loading LearningProgress component</div> };
  });
});

const LazyProgressVisuals = lazy(() => {
  return import('../components/ProgressVisuals').catch(error => {
    console.error('Error loading ProgressVisuals component:', error);
    return { default: () => <div>Error loading ProgressVisuals component</div> };
  });
});

// Loading fallback component for lazy-loaded components
const ComponentLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    <span className="ml-3 text-sm">Loading component...</span>
  </div>
);

// Component error boundary
class ErrorBoundary extends Component<{ children: React.ReactNode; fallback: React.ReactNode }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Component error boundary wrapper
const ComponentErrorBoundary: React.FC<{ children: React.ReactNode; componentName: string }> = ({ children, componentName }) => (
  <ErrorBoundary
    fallback={
      <div className="p-4 text-center">
        <p className="text-red-500 mb-2">Error loading {componentName}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    }
  >
    {children}
  </ErrorBoundary>
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

  // Add error state for component loading
  const [componentError, setComponentError] = useState<string | null>(null);

  // Wrap lazy components with error boundary and suspense
  const renderLazyComponent = (Component: React.LazyExoticComponent<any>, componentName: string) => (
    <ErrorBoundary
      fallback={
        <div className="p-4 text-center">
          <p className="text-red-500 mb-2">Error loading {componentName}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      }
    >
      <Suspense fallback={<ComponentLoadingFallback />}>
        <Component />
      </Suspense>
    </ErrorBoundary>
  );

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

  // Loading state component
  const renderLoadingState = (component: string) => (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      <span className="ml-3 text-sm">Loading {component}...</span>
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
            <Paper>
              {isProgressLoading ? (
                renderLoadingState('progress data')
              ) : (
                renderLazyComponent(LazyProgressVisuals, 'Progress Visualization')
              )}
            </Paper>
          </div>

          {/* Dictionary Section */}
          <Box sx={{ mt: 4 }}>
            {isSettingsLoading ? (
              renderLoadingState('dictionary settings')
            ) : (
              renderLazyComponent(LazyDictionary, 'Dictionary')
            )}
          </Box>

          {/* Progress Section */}
          {activeTab === 'progress' && (
            <Box sx={{ mt: 4 }}>
              {isProgressLoading ? (
                renderLoadingState('learning progress')
              ) : (
                renderLazyComponent(LazyLearningProgress, 'Learning Progress')
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