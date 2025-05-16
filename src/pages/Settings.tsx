import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import type { Settings } from '../context/AppContext';
import { useProgress } from '../context/ProgressContext';
import { downloadOfflineData } from '../utils/offlineData';
import AudioManager from '../components/AudioManager';

const SettingsPage: React.FC = () => {
  const { theme, isDarkMode, setTheme, toggleDarkMode } = useTheme();
  const { settings, updateSettings } = useApp();
  const { progress: progressData, resetProgress } = useProgress();
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [downloadError, setDownloadError] = React.useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = React.useState(false);

  const getThemeClasses = () => {
    const baseClasses = {
      container: isDarkMode ? 'bg-gray-800' : 'bg-white',
      text: isDarkMode ? 'text-gray-100' : 'text-gray-900',
      subtext: isDarkMode ? 'text-gray-300' : 'text-gray-600',
      border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
      hover: isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50',
      input: isDarkMode 
        ? 'bg-gray-700 border-gray-600 text-gray-100' 
        : 'bg-white border-gray-300 text-gray-900',
      select: isDarkMode 
        ? 'bg-gray-700 border-gray-600 text-gray-100' 
        : 'bg-white border-gray-300 text-gray-900',
      card: isDarkMode ? 'bg-gray-700' : 'bg-gray-50',
    };
    return baseClasses;
  };

  const themeClasses = getThemeClasses();

  const renderToggle = (settingKey: keyof Settings, label: string, description?: string) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <span className={`text-sm font-medium ${themeClasses.text}`}>{label}</span>
        {description && (
          <p className={`text-xs mt-1 ${themeClasses.subtext}`}>{description}</p>
        )}
      </div>
      <button
        onClick={() => updateSettings({ [settingKey]: !settings[settingKey] })}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          settings[settingKey] ? 'bg-blue-600' : isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            settings[settingKey] ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const renderSelect = (
    settingKey: keyof Settings,
    label: string,
    options: { value: string; label: string }[],
    description?: string
  ) => (
    <div className="py-3">
      <div className="mb-2">
        <label className={`text-sm font-medium ${themeClasses.text}`}>{label}</label>
        {description && (
          <p className={`text-xs mt-1 ${themeClasses.subtext}`}>{description}</p>
        )}
      </div>
      <select
        value={settings[settingKey] as string}
        onChange={(e) => updateSettings({ [settingKey]: e.target.value })}
        className={`w-full p-2 rounded-lg border ${themeClasses.select}`}
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

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link to="/" className={`${isDarkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline mr-4`}>
              ← Back to Home
            </Link>
            <h1 className={`text-3xl font-bold ${themeClasses.text}`}>Settings</h1>
          </div>
        </div>

        <div className="space-y-6">
          {/* Theme Settings */}
          <div className={`rounded-lg shadow-md p-6 ${themeClasses.container}`}>
            <h2 className={`text-xl font-semibold mb-6 ${themeClasses.text}`}>Appearance</h2>
            
            <div className="space-y-4">
              <div className="py-3">
                <label className={`text-sm font-medium ${themeClasses.text}`}>Theme</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as 'light' | 'blue' | 'green')}
                  className={`w-full mt-2 p-2 rounded-lg border ${themeClasses.select}`}
                >
                  <option value="light">Light Theme</option>
                  <option value="blue">Blue Theme</option>
                  <option value="green">Green Theme</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <span className={`text-sm font-medium ${themeClasses.text}`}>Dark Mode</span>
                  <p className={`text-xs mt-1 ${themeClasses.subtext}`}>
                    Switch between light and dark color schemes
                  </p>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    isDarkMode ? 'bg-blue-600' : isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isDarkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* General Settings */}
          <div className={`rounded-lg shadow-md p-6 ${themeClasses.container}`}>
            <h2 className={`text-xl font-semibold mb-6 ${themeClasses.text}`}>General Settings</h2>
            
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
              {/* Download Offline Data Button */}
              <div className="flex items-center gap-4 mt-2">
                <button
                  onClick={handleDownloadOfflineData}
                  disabled={isDownloading}
                  className={`px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors ${isDownloading ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  {isDownloading ? 'Downloading...' : 'Download Offline Data'}
                </button>
                {downloadSuccess && <span className="text-green-600 font-semibold">Offline data opgeslagen!</span>}
                {downloadError && <span className="text-red-600 font-semibold">{downloadError}</span>}
              </div>
            </div>
          </div>

          {/* Audio Settings */}
          <div className={`rounded-lg shadow-md p-6 ${themeClasses.container}`}>
            <h2 className={`text-xl font-semibold mb-6 ${themeClasses.text}`}>Audio Settings</h2>
            <div className="space-y-4">
              {renderToggle('autoPlay', 'Auto Play', 'Automatically play audio for new words')}
              <div className="mt-6">
                <AudioManager />
              </div>
            </div>
          </div>

          {/* Vocabulary Settings */}
          <div className={`rounded-lg shadow-md p-6 ${themeClasses.container}`}>
            <h2 className={`text-xl font-semibold mb-6 ${themeClasses.text}`}>Vocabulary Settings</h2>
            
            <div className="space-y-4">
              {renderToggle('showRomajiVocabulary', 'Show Romaji in Vocabulary', 'Display romaji in vocabulary exercises')}
              {renderToggle('showRomajiReading', 'Show Romaji in Reading', 'Display romaji in reading exercises')}
              {renderToggle('showRomajiJLPT', 'Show Romaji in JLPT', 'Display romaji in JLPT preparation')}
            </div>
          </div>

          {/* Game Settings */}
          <div className={`rounded-lg shadow-md p-6 ${themeClasses.container}`}>
            <h2 className={`text-xl font-semibold mb-6 ${themeClasses.text}`}>Game Settings</h2>
            
            <div className="space-y-4">
              {renderToggle('showKanjiGames', 'Show Kanji in Games', 'Display kanji in game exercises')}
              {renderToggle('showRomajiGames', 'Show Romaji in Games', 'Display romaji in game exercises')}
              {renderToggle('useHiraganaGames', 'Use Hiragana in Games', 'Use hiragana instead of katakana in games')}
            </div>
          </div>

          {/* Progress Section */}
          <div className={`rounded-lg shadow-md p-6 ${themeClasses.container} md:col-span-2`}>
            <h2 className={`text-xl font-semibold mb-6 ${themeClasses.text}`}>Progress</h2>
            <div className="space-y-4">
              {Object.entries(progressData).map(([section, stats]) => (
                <div key={section} className="border-b pb-2 mb-2 last:border-b-0 last:pb-0 last:mb-0">
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${themeClasses.text}`}>{section.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                    <span className={`text-xs ${themeClasses.subtext}`}>Last Attempt: {stats.lastAttempt ? new Date(stats.lastAttempt).toLocaleString() : 'Never'}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-1 text-sm">
                    <span>Total Questions: {stats.totalQuestions}</span>
                    <span>Correct: {stats.correctAnswers}</span>
                    <span>Best Streak: {stats.bestStreak}</span>
                    <span>Avg. Time: {stats.averageTime ? stats.averageTime.toFixed(2) : 0}s</span>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={resetProgress}
              className="mt-6 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              Reset All Progress
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 