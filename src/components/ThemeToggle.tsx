import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-full transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-dark-secondary text-text-dark-primary hover:bg-dark-tertiary'
          : 'bg-light-secondary text-text-primary hover:bg-light-tertiary'
      }`}
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
    >
      <span className="text-lg">
        {theme === 'dark' ? '🌞' : '🌙'}
      </span>
    </button>
  );
};

export default ThemeToggle; 