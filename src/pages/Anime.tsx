import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Anime: React.FC = () => {
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
            <h1 className={`text-3xl font-bold ${themeClasses.text.primary}`}>
              Anime & Manga Learning
            </h1>
          </div>
        </div>
        <div className={`p-6 rounded-nav ${themeClasses.card}`}>
          <p className={themeClasses.text.secondary}>
            Learn Japanese through anime and manga - coming soon...
          </p>
        </div>
      </div>
    </div>
  );
};

export default Anime; 