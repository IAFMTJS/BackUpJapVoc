import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import VocabularyQuiz from '../components/VocabularyQuiz';

const VocabularySection: React.FC = () => {
  const { getThemeClasses, isDarkMode } = useTheme();
  const themeClasses = getThemeClasses();

  return (
    <div className={`max-w-7xl mx-auto px-4 py-8 ${isDarkMode ? 'bg-dark' : 'bg-dark-lighter'}`}>
      <div className="flex items-center mb-8">
        <Link to="/" className={`${themeClasses.nav.link.default} mr-4`}>
          ← Back to Home
        </Link>
        <h1 className={`text-3xl font-bold ${themeClasses.text.primary}`}>
          Vocabulary Section
        </h1>
      </div>

      <div className={`${isDarkMode ? 'bg-dark-lighter border-dark-border' : 'bg-dark-lighter border-dark-border'} border shadow-lg rounded-lg p-6`}>
        <p className={`${themeClasses.text.secondary} mb-8`}>
          Test your knowledge of Japanese vocabulary words. 
          Choose a difficulty level, category, and number of questions to start the quiz.
        </p>
        <VocabularyQuiz />
      </div>
    </div>
  );
};

export default VocabularySection; 