import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const { isDarkMode } = useTheme();

  const getThemeClasses = () => {
    if (isDarkMode) {
      return {
        container: 'bg-charcoal-800',
        text: 'text-ivory-100',
        card: 'bg-charcoal-700 hover:bg-charcoal-600',
        button: {
          primary: 'bg-sage-600 hover:bg-sage-700 text-ivory-100',
          secondary: 'bg-accent-wood hover:bg-accent-gold text-ivory-100',
        },
        tag: 'bg-sage-700/20 text-sage-300',
      };
    }

    return {
      container: 'bg-ivory-100',
      text: 'text-charcoal-800',
      card: 'bg-ivory-50 hover:bg-sage-50',
      button: {
        primary: 'bg-sage-600 hover:bg-sage-700 text-ivory-100',
        secondary: 'bg-accent-wood hover:bg-accent-gold text-ivory-100',
      },
      tag: 'bg-sage-100 text-sage-700',
    };
  };

  const themeClasses = getThemeClasses();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className={`${themeClasses.container} rounded-2xl shadow-soft p-8 mb-12`}>
        <h1 className={`text-4xl font-serif font-medium mb-6 ${themeClasses.text}`}>
          Japanese Vocabulary Practice
        </h1>
        <p className={`text-xl mb-12 leading-relaxed ${themeClasses.text}`}>
          Choose a practice mode to begin your journey in mastering Japanese vocabulary and language skills.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link
            to="/word-practice"
            className={`${themeClasses.card} p-8 rounded-xl shadow-card transition-all duration-300 transform hover:scale-[1.02] group`}
          >
            <h2 className={`text-2xl font-serif font-medium mb-4 ${themeClasses.text}`}>
              Word Practice
            </h2>
            <p className={`mb-6 leading-relaxed ${themeClasses.text}`}>
              Practice vocabulary words with multiple choice or writing exercises.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${themeClasses.tag}`}>
                Multiple Choice
              </span>
              <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${themeClasses.tag}`}>
                Writing
              </span>
              <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${themeClasses.tag}`}>
                Flashcards
              </span>
            </div>
          </Link>

          <Link
            to="/sentence-practice"
            className={`${themeClasses.card} p-8 rounded-xl shadow-card transition-all duration-300 transform hover:scale-[1.02] group`}
          >
            <h2 className={`text-2xl font-serif font-medium mb-4 ${themeClasses.text}`}>
              Sentence Practice
            </h2>
            <p className={`mb-6 leading-relaxed ${themeClasses.text}`}>
              Practice grammar patterns and sentence construction.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${themeClasses.tag}`}>
                Translation
              </span>
              <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${themeClasses.tag}`}>
                Fill in the Blank
              </span>
              <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${themeClasses.tag}`}>
                Pattern Practice
              </span>
            </div>
          </Link>

          <Link
            to="/kanji-practice"
            className={`${themeClasses.card} p-8 rounded-xl shadow-card transition-all duration-300 transform hover:scale-[1.02] group`}
          >
            <h2 className={`text-2xl font-serif font-medium mb-4 ${themeClasses.text}`}>
              Kanji Practice
            </h2>
            <p className={`mb-6 leading-relaxed ${themeClasses.text}`}>
              Learn and practice kanji characters with stroke order and readings.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${themeClasses.tag}`}>
                Flashcards
              </span>
              <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${themeClasses.tag}`}>
                Writing
              </span>
              <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${themeClasses.tag}`}>
                Reading
              </span>
            </div>
          </Link>

          <Link
            to="/progress"
            className={`${themeClasses.card} p-8 rounded-xl shadow-card transition-all duration-300 transform hover:scale-[1.02] group`}
          >
            <h2 className={`text-2xl font-serif font-medium mb-4 ${themeClasses.text}`}>
              Progress Tracking
            </h2>
            <p className={`mb-6 leading-relaxed ${themeClasses.text}`}>
              Monitor your learning journey with detailed statistics and achievements.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${themeClasses.tag}`}>
                Statistics
              </span>
              <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${themeClasses.tag}`}>
                Streaks
              </span>
              <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${themeClasses.tag}`}>
                Achievements
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home; 