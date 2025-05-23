import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={toggleDarkMode}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2 ${
          isDarkMode ? 'bg-sage-600' : 'bg-charcoal-200'
        }`}
        aria-label="Toggle dark mode"
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-ivory-100 transition-transform ${
            isDarkMode ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      <span className={`text-sm font-medium ${isDarkMode ? 'text-ivory-300' : 'text-charcoal-600'}`}>
        {isDarkMode ? 'Dark Mode' : 'Light Mode'}
      </span>
    </div>
  );
};

export default ThemeToggle; 