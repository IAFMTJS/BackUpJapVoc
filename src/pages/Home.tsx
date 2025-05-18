import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import Progress from '../components/Progress';

const Home: React.FC = () => {
  const { theme, isDarkMode } = useTheme();
  const navigate = useNavigate();

  const getThemeClasses = () => {
    if (isDarkMode) {
      return {
        container: 'bg-gray-800',
        text: 'text-gray-100',
        card: 'bg-gray-700',
        border: 'border-gray-600',
        button: {
          primary: 'bg-blue-600 hover:bg-blue-700 text-white',
          secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
        },
      };
    }

    switch (theme) {
      case 'blue':
        return {
          container: 'bg-blue-50',
          text: 'text-blue-900',
          card: 'bg-white',
          border: 'border-blue-200',
          button: {
            primary: 'bg-blue-600 hover:bg-blue-700 text-white',
            secondary: 'bg-blue-100 hover:bg-blue-200 text-blue-900',
          },
        };
      case 'green':
        return {
          container: 'bg-green-50',
          text: 'text-green-900',
          card: 'bg-white',
          border: 'border-green-200',
          button: {
            primary: 'bg-green-600 hover:bg-green-700 text-white',
            secondary: 'bg-green-100 hover:bg-green-200 text-green-900',
          },
        };
      default:
        return {
          container: 'bg-white',
          text: 'text-gray-900',
          card: 'bg-gray-50',
          border: 'border-gray-200',
          button: {
            primary: 'bg-blue-600 hover:bg-blue-700 text-white',
            secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900',
          },
        };
    }
  };

  const themeClasses = getThemeClasses();

  const sections = [
    { id: 'vocabulary', name: 'Vocabulary Quiz', icon: '📝', path: '/vocabulary' },
    { id: 'section2', name: 'Dictionary', icon: '📚', path: '/section2' },
    { id: 'section3', name: 'Writing Practice', icon: '✍️', path: '/section3' },
    { id: 'section4', name: 'Kanji Quiz', icon: '📝', path: '/section4' },
    { id: 'section5', name: 'Vocabulary Builder', icon: '📝', path: '/section5' },
    { id: 'section6', name: 'Reading Practice', icon: '📖', path: '/section6' },
    { id: 'section7', name: 'JLPT Preparation', icon: '🎓', path: '/section7' },
    { id: 'games', name: 'Interactive Games', icon: '🎮', path: '/games' },
    { id: 'romaji', name: 'Romaji Learning', icon: '🔤', path: '/romaji', description: 'Master Japanese words, sentences, and stories using romaji and audio.' },
  ];

  return (
    <div className={`min-h-screen py-8 px-4 ${themeClasses.container}`}>
      <div className="max-w-4xl mx-auto">
        <h1 className={`text-4xl font-bold mb-8 ${themeClasses.text}`}>Welcome to JapVoc!</h1>
        <div className="flex justify-center my-6">
          <button
            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 text-lg font-semibold transition"
            onClick={() => navigate('/how-to-use')}
          >
            How to Use This Site
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          {sections.map((section) => (
            <Link
              key={section.id}
              to={section.path}
              className={`block rounded-lg shadow-md p-6 ${themeClasses.card} border ${themeClasses.border} hover:shadow-lg transition`}
            >
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-2xl sm:text-3xl">{section.icon}</span>
                <h2 className={`text-base sm:text-lg font-semibold ${themeClasses.text}`}>{section.name}</h2>
              </div>
              <p className={`text-sm ${themeClasses.text} opacity-75`}>
                {section.description || 'Click to start learning'}
              </p>
            </Link>
          ))}
          <Link to="/anime" className={`block rounded-lg shadow-md p-6 bg-gradient-to-br from-pink-500 to-purple-600 text-white border-0 hover:shadow-xl transition font-bold text-lg flex flex-col items-center justify-center`}>
            <span className="text-3xl mb-2">🎌</span>
            Anime & Manga Phrases
            <span className="text-sm font-normal mt-1">Learn real phrases from your favorite shows!</span>
          </Link>
        </div>
        <div className="text-center">
          <h1 className={`text-3xl sm:text-4xl font-bold mb-4 ${themeClasses.text}`}>Welcome to JapVoc</h1>
          <p className={`text-base sm:text-lg ${themeClasses.text} opacity-75 max-w-2xl mx-auto`}>
            Your comprehensive Japanese learning companion
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home; 