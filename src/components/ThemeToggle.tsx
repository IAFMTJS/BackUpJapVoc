import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const themes = [
    { id: 'dark', label: 'Dark', icon: '🌙' },
    { id: 'light', label: 'Light', icon: '☀️' },
    { id: 'neon', label: 'Neon', icon: '✨' },
  ] as const;

  return (
    <div className="flex items-center space-x-2">
      {themes.map(({ id, label, icon }) => (
        <button
          key={id}
          onClick={() => setTheme(id)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            theme === id
              ? 'bg-dark-lighter text-text-primary'
              : 'text-text-secondary hover:bg-dark-lighter/50'
          }`}
          aria-label={`Switch to ${label} theme`}
        >
          <span className="mr-1.5">{icon}</span>
          {label}
        </button>
      ))}
    </div>
  );
};

export default ThemeToggle; 