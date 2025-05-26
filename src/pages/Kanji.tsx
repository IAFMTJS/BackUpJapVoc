import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { useProgress } from '../context/ProgressContext';
import { useAccessibility } from '../context/AccessibilityContext';
import KanjiPractice from '../components/Kanji';

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    <span className="ml-3 text-lg">Loading kanji practice...</span>
  </div>
);

const Kanji: React.FC = () => {
  const { getThemeClasses } = useTheme();
  const { settings: globalSettings, isLoading: isSettingsLoading } = useSettings();
  const { progress, isLoading: isProgressLoading } = useProgress();
  const { settings: accessibilitySettings, isLoading: isAccessibilityLoading } = useAccessibility();

  const themeClasses = getThemeClasses();

  // Check if any context is still loading
  const isLoading = isSettingsLoading || isProgressLoading || isAccessibilityLoading;

  // Show loading state if any context is still loading
  if (isLoading) {
    return (
      <div className={themeClasses.container}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Link to="/" className={`${themeClasses.nav.link.default} mr-4`}>
                ← Back to Home
              </Link>
              <h1 className={`text-3xl font-bold ${themeClasses.text.primary}`}>
                Kanji Learning
              </h1>
            </div>
          </div>
          <div className={`p-6 rounded-lg ${themeClasses.card}`}>
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={themeClasses.container}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link to="/" className={`${themeClasses.nav.link.default} mr-4`}>
              ← Back to Home
            </Link>
            <h1 className={`text-3xl font-bold ${themeClasses.text.primary}`}>
              Kanji Learning
            </h1>
          </div>
        </div>
        <div className={`p-6 rounded-lg ${themeClasses.card}`}>
          <KanjiPractice />
        </div>
      </div>
    </div>
  );
};

export default Kanji; 