import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DictionaryList from '../components/DictionaryList';
import SettingsPanel from '../components/Settings';
import { useTheme } from '../context/ThemeContext';

const Section2: React.FC = () => {
  const [dictionaryMode, setDictionaryMode] = useState<'all' | 'hiragana' | 'katakana' | 'kanji'>('all');
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();

  return (
    <div className={themeClasses.container}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link to="/" className={`${themeClasses.nav.link.default} mr-4`}>
              ← Back to Home
            </Link>
            <h1 className={`text-3xl font-bold ${themeClasses.text.primary}`}>Japanese Dictionary</h1>
          </div>
          <div className="flex gap-4">
            {(['all', 'hiragana', 'katakana', 'kanji'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setDictionaryMode(mode)}
                className={`px-4 py-2 rounded-lg ${
                  dictionaryMode === mode
                    ? themeClasses.button.primary
                    : themeClasses.button.secondary
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className={themeClasses.card}>
              <p className={`mb-8 ${themeClasses.text.secondary}`}>
                Search and learn Japanese vocabulary. Filter by category and difficulty level.
              </p>
              <DictionaryList mode={dictionaryMode} />
            </div>
          </div>
          <div>
            <SettingsPanel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Section2; 