import React from 'react';
import { Link } from 'react-router-dom';
import KanjiQuiz from '../components/KanjiQuiz';
import SettingsPanel from '../components/Settings';
import { useTheme } from '../context/ThemeContext';

const Section4: React.FC = () => {
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
            <h1 className={`text-3xl font-bold ${themeClasses.text.primary}`}>Kanji Quiz</h1>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className={themeClasses.card}>
              <p className={`mb-8 ${themeClasses.text.secondary}`}>
                Practice Kanji characters with interactive quizzes. Learn meanings, readings, and example words.
                Choose between meaning, reading, and kanji practice modes.
              </p>
              <KanjiQuiz />
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

export default Section4; 