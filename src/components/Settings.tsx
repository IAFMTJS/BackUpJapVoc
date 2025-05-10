import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import type { Settings } from '../context/AppContext';

type SettingsKey = keyof Settings;

const Settings: React.FC = () => {
  const { theme, isDarkMode } = useTheme();
  const { settings, updateSettings } = useApp();

  const getThemeClasses = () => {
    const themeClasses = {
      text: isDarkMode ? 'text-gray-100' : 'text-gray-900',
      bg: isDarkMode ? 'bg-gray-800' : 'bg-white',
      border: isDarkMode ? 'border-gray-700' : 'border-gray-200'
    };
    return themeClasses;
  };

  const renderToggle = (settingKey: keyof Settings, label: string) => (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${getThemeClasses().text}`}>{label}</span>
      <button
        onClick={() => updateSettings({ [settingKey]: !settings[settingKey] })}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          settings[settingKey] ? 'bg-blue-600' : 'bg-gray-200'
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

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${getThemeClasses().bg}`}>
      <h2 className={`text-xl font-semibold mb-6 ${getThemeClasses().text}`}>Settings</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className={`font-medium mb-4 ${getThemeClasses().text}`}>General Settings</h3>
          <div className="space-y-4">
            {renderToggle('showRomaji', 'Show Romaji')}
            {renderToggle('showHints', 'Show Hints')}
            {renderToggle('autoPlay', 'Auto Play')}
          </div>
        </div>

        <div>
          <h3 className={`font-medium mb-4 ${getThemeClasses().text}`}>Section-Specific Settings</h3>
          <div className="space-y-4">
            <div>
              <h4 className={`text-sm font-medium mb-2 ${getThemeClasses().text}`}>Vocabulary Builder</h4>
              {renderToggle('showRomajiVocabulary', 'Show Romaji')}
            </div>
            <div>
              <h4 className={`text-sm font-medium mb-2 ${getThemeClasses().text}`}>Reading Practice</h4>
              {renderToggle('showRomajiReading', 'Show Romaji')}
            </div>
            <div>
              <h4 className={`text-sm font-medium mb-2 ${getThemeClasses().text}`}>JLPT Preparation</h4>
              {renderToggle('showRomajiJLPT', 'Show Romaji')}
            </div>
            <div>
              <h4 className={`text-sm font-medium mb-2 ${getThemeClasses().text}`}>Games</h4>
              {renderToggle('showKanjiGames', 'Show Kanji')}
              {renderToggle('showRomajiGames', 'Show Romaji')}
              {renderToggle('useHiraganaGames', 'Use Hiragana (instead of Katakana)')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 