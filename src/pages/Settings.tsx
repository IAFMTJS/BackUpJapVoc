import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useSettings } from '../context/SettingsContext';
import type { Settings } from '../context/AppContext';
import { useProgress } from '../context/ProgressContext';
import { downloadOfflineData } from '../utils/offlineData';
import AudioManager from '../components/AudioManager';
import { useAccessibility } from '../context/AccessibilityContext';
import JapaneseCityscape from '../components/visualizations/JapaneseCityscape';
import { useDatabase } from '../context/DatabaseContext';

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    <span className="ml-3 text-lg">Loading settings...</span>
  </div>
);

const SettingsPage: React.FC = () => {
  const { getThemeClasses, theme } = useTheme();
  const { settings: appSettings, updateSettings: updateAppSettings } = useApp();
  const { 
    settings: globalSettings, 
    updateSettings: updateGlobalSettings, 
    isLoading: isSettingsLoading,
    error: settingsError 
  } = useSettings();
  const { 
    progress: progressData, 
    resetProgress, 
    isLoading: isProgressLoading,
    error: progressError 
  } = useProgress();
  const { 
    settings: accessibilitySettings, 
    updateSettings: updateAccessibilitySettings, 
    isLoading: isAccessibilityLoading 
  } = useAccessibility();
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [downloadError, setDownloadError] = React.useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = React.useState(false);

  const themeClasses = getThemeClasses();

  // Show error state if there's a critical error
  if (settingsError || progressError) {
    return (
      <div className={themeClasses.container}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Link to="/" className={`${themeClasses.nav.link.default} mr-4`}>
                ← Back to Home
              </Link>
              <h1 className={`text-3xl font-bold ${themeClasses.text.primary}`}>
                Settings
              </h1>
            </div>
          </div>
          <div className={`p-6 rounded-lg ${themeClasses.card} ${themeClasses.error}`}>
            <h2 className={`text-xl font-semibold mb-4 ${themeClasses.text.error}`}>
              Error Loading Settings
            </h2>
            <p className={`mb-4 ${themeClasses.text.muted}`}>
              {settingsError || progressError}
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
          Settings
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

  const renderToggle = (key: keyof Settings, label: string, description?: string) => (
    <div className="flex items-center justify-between">
      <div className="flex-grow">
        <label htmlFor={key} className={`text-sm font-medium ${themeClasses.text.primary}`}>
          {label}
        </label>
        {description && (
          <p className={`mt-1 text-xs ${themeClasses.text.muted}`}>{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={globalSettings[key as keyof typeof globalSettings]}
        onClick={() => {
          const newValue = !globalSettings[key as keyof typeof globalSettings];
          updateGlobalSettings({ [key]: newValue });
        }}
        className={`${
          globalSettings[key as keyof typeof globalSettings] ? themeClasses.toggle.active : themeClasses.toggle.default
        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          themeClasses.focus.ring
        }`}
      >
        <span
          aria-hidden="true"
          className={`${
            globalSettings[key as keyof typeof globalSettings] ? 'translate-x-5' : 'translate-x-0'
          } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
      </button>
    </div>
  );

  const renderSelect = (
    key: keyof Settings,
    label: string,
    options: { value: string; label: string }[],
    description?: string
  ) => (
    <div>
      <label htmlFor={key} className={`block text-sm font-medium ${themeClasses.text.primary}`}>
        {label}
      </label>
      {description && (
        <p className={`mt-1 text-xs ${themeClasses.text.muted}`}>{description}</p>
      )}
      <select
        id={key}
        value={globalSettings[key] as string}
        onChange={(e) => updateGlobalSettings({ [key]: e.target.value })}
        className={`mt-1 block w-full rounded-lg ${themeClasses.select} text-sm`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  const handleDownloadOfflineData = async () => {
    setIsDownloading(true);
    setDownloadError(null);
    setDownloadSuccess(false);
    try {
      await downloadOfflineData();
      setDownloadSuccess(true);
    } catch (err) {
      setDownloadError('Er is een fout opgetreden bij het downloaden van de offline data.');
    } finally {
      setIsDownloading(false);
    }
  };

  const renderAccessibilitySettings = () => (
    <div className={`rounded-lg shadow-md p-6 ${themeClasses.container}`}>
      <h2 className={`text-xl font-semibold mb-6 ${themeClasses.text.primary}`}>Accessibility Settings</h2>
      
      <div className="space-y-4">
        <div>
          <label className={`block mb-2 ${themeClasses.text.primary}`}>Font Size</label>
          <select
            value={accessibilitySettings.fontSize}
            onChange={(e) => updateAccessibilitySettings({ fontSize: e.target.value as 'small' | 'medium' | 'large' })}
            className={`w-full p-2 rounded ${themeClasses.select}`}
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="highContrast"
            checked={accessibilitySettings.highContrast}
            onChange={(e) => updateAccessibilitySettings({ highContrast: e.target.checked })}
            className={`form-checkbox h-5 w-5 ${themeClasses.checkbox}`}
          />
          <label htmlFor="highContrast" className={themeClasses.text.primary}>
            High Contrast Mode
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="reducedMotion"
            checked={accessibilitySettings.reducedMotion}
            onChange={(e) => updateAccessibilitySettings({ reducedMotion: e.target.checked })}
            className={`form-checkbox h-5 w-5 ${themeClasses.checkbox}`}
          />
          <label htmlFor="reducedMotion" className={themeClasses.text.primary}>
            Reduced Motion
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="screenReader"
            checked={accessibilitySettings.screenReader}
            onChange={(e) => updateAccessibilitySettings({ screenReader: e.target.checked })}
            className={`form-checkbox h-5 w-5 ${themeClasses.checkbox}`}
          />
          <label htmlFor="screenReader" className={themeClasses.text.primary}>
            Screen Reader Optimizations
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="keyboardNavigation"
            checked={accessibilitySettings.keyboardNavigation}
            onChange={(e) => updateAccessibilitySettings({ keyboardNavigation: e.target.checked })}
            className={`form-checkbox h-5 w-5 ${themeClasses.checkbox}`}
          />
          <label htmlFor="keyboardNavigation" className={themeClasses.text.primary}>
            Enhanced Keyboard Navigation
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="focusHighlight"
            checked={accessibilitySettings.focusHighlight}
            onChange={(e) => updateAccessibilitySettings({ focusHighlight: e.target.checked })}
            className={`form-checkbox h-5 w-5 ${themeClasses.checkbox}`}
          />
          <label htmlFor="focusHighlight" className={themeClasses.text.primary}>
            Focus Highlight
          </label>
        </div>

        <button
          onClick={() => updateAccessibilitySettings(defaultSettings)}
          className={`mt-4 px-4 py-2 rounded ${themeClasses.button}`}
        >
          Reset Accessibility Settings
        </button>
      </div>
    </div>
  );

  return (
    <div className={`${themeClasses.container} relative min-h-screen`}>
      {/* Theme-specific cityscape background */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-15">
        <JapaneseCityscape 
          width={800}
          height={400}
          style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            filter: theme === 'dark' 
              ? 'brightness(0.5) saturate(0.8)' 
              : 'brightness(1.1) saturate(1.2)'
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        {renderHeader()}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* App Settings Section */}
          <div className={`rounded-lg shadow-md p-4 ${themeClasses.container} lg:col-span-2`}>
            <h2 className={`text-lg font-semibold mb-4 ${themeClasses.text.primary}`}>App Settings</h2>
            {isSettingsLoading ? (
              renderLoadingState('app settings')
            ) : (
              <div className="space-y-4">
                <div className="py-2">
                  <label className={`text-sm font-medium ${themeClasses.text.primary}`}>Theme</label>
                  <select
                    className={themeClasses.input}
                    defaultValue="dark"
                    disabled
                  >
                    <option value="dark">Dark Theme</option>
                    <option value="light" disabled>Light Theme (Coming Soon)</option>
                    <option value="neon" disabled>Neon Theme (Coming Soon)</option>
                  </select>
                  <p className={`text-sm mt-1 ${themeClasses.text.muted}`}>
                    More themes will be available in future updates
                  </p>
                </div>

                <div className="space-y-4">
                  {renderToggle('showRomaji', 'Show Romaji', 'Display romaji for Japanese text')}
                  {renderToggle('showHints', 'Show Hints', 'Display hints during exercises')}
                  {renderToggle('autoPlay', 'Auto Play', 'Automatically play audio for new words')}
                  
                  {renderSelect(
                    'difficulty',
                    'Default Difficulty',
                    [
                      { value: 'easy', label: 'Easy' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'hard', label: 'Hard' }
                    ],
                    'Set the default difficulty level for exercises'
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Audio Settings */}
          <div className={themeClasses.card}>
            <h2 className={`text-lg font-semibold mb-4 ${themeClasses.text.primary}`}>Audio Settings</h2>
            <div className="space-y-3">
              {renderToggle('autoPlay', 'Auto Play', 'Automatically play audio for new words')}
              <div className="mt-4">
                <AudioManager />
              </div>
            </div>
          </div>

          {/* Vocabulary Settings */}
          <div className={themeClasses.card}>
            <h2 className={`text-lg font-semibold mb-4 ${themeClasses.text.primary}`}>Vocabulary Settings</h2>
            
            <div className="space-y-3">
              {renderToggle('showRomajiVocabulary', 'Show Romaji in Vocabulary', 'Display romaji in vocabulary exercises')}
              {renderToggle('showRomajiReading', 'Show Romaji in Reading', 'Display romaji in reading exercises')}
            </div>
          </div>

          {/* Game Settings */}
          <div className={themeClasses.card}>
            <h2 className={`text-lg font-semibold mb-4 ${themeClasses.text.primary}`}>Game Settings</h2>
            
            <div className="space-y-3">
              {renderToggle('showKanjiGames', 'Show Kanji in Games', 'Display kanji in game exercises')}
              {renderToggle('showRomajiGames', 'Show Romaji in Games', 'Display romaji in game exercises')}
              {renderToggle('useHiraganaGames', 'Use Hiragana in Games', 'Use hiragana instead of katakana in games')}
            </div>
          </div>

          {/* Accessibility Settings */}
          <div className={`rounded-lg shadow-md p-4 ${themeClasses.container}`}>
            <h2 className={`text-lg font-semibold mb-4 ${themeClasses.text.primary}`}>Accessibility</h2>
            {isAccessibilityLoading ? (
              renderLoadingState('accessibility settings')
            ) : (
              <div className="space-y-4">
                {renderAccessibilitySettings()}
              </div>
            )}
          </div>

          {/* Progress Section */}
          <div className={`rounded-lg shadow-md p-4 ${themeClasses.container} lg:col-span-2`}>
            <h2 className={`text-lg font-semibold mb-4 ${themeClasses.text.primary}`}>Progress</h2>
            {isProgressLoading ? (
              renderLoadingState('progress data')
            ) : (
              <div className="space-y-3">
                {Object.entries(progressData).map(([section, stats]) => (
                  <div key={section} className="border-b pb-2 mb-2 last:border-b-0 last:pb-0 last:mb-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${themeClasses.text.primary}`}>
                        {section.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                      <span className={`text-xs ${themeClasses.text.muted}`}>
                        Last: {stats.lastAttempt ? new Date(stats.lastAttempt).toLocaleDateString() : 'Never'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1 text-xs">
                      <span>Total: {stats.totalQuestions}</span>
                      <span>Correct: {stats.correctAnswers}</span>
                      <span>Streak: {stats.bestStreak}</span>
                      <span>Avg: {stats.averageTime ? stats.averageTime.toFixed(1) : 0}s</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={handleDownloadOfflineData}
                disabled={isDownloading}
                className={`px-3 py-1.5 rounded-lg ${themeClasses.button.success} text-sm ${isDownloading ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {isDownloading ? 'Downloading...' : 'Download Offline Data'}
              </button>
              <button
                onClick={resetProgress}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-300 ${
                  themeClasses.button
                }`}
              >
                Reset All Progress
              </button>
            </div>
            {downloadSuccess && <span className={`text-sm font-semibold mt-2 block ${themeClasses.text.success}`}>Offline data opgeslagen!</span>}
            {downloadError && <span className={`text-sm font-semibold mt-2 block ${themeClasses.text.error}`}>{downloadError}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 