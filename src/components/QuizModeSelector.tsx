import React from 'react';
import { useTheme } from '../context/ThemeContext';

export type QuizMode = 'multiple-choice' | 'writing' | 'flashcards';

interface QuizModeSelectorProps {
  selectedMode: QuizMode;
  onModeSelect: (mode: QuizMode) => void;
  availableModes?: QuizMode[];
}

const QuizModeSelector: React.FC<QuizModeSelectorProps> = ({
  selectedMode,
  onModeSelect,
  availableModes = ['multiple-choice', 'writing', 'flashcards'],
}) => {
  const { isDarkMode, getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();

  const getModeLabel = (mode: QuizMode): string => {
    switch (mode) {
      case 'multiple-choice':
        return 'Multiple Choice';
      case 'writing':
        return 'Writing';
      case 'flashcards':
        return 'Flashcards';
      default:
        return mode;
    }
  };

  return (
    <div className={`flex flex-wrap gap-3 p-4 rounded-xl ${themeClasses.card} border ${themeClasses.border} ${isDarkMode ? 'shadow-[0_0_20px_rgba(0,149,255,0.2)]' : ''}`}>
      {availableModes.map((mode) => (
        <button
          key={mode}
          onClick={() => onModeSelect(mode)}
          className={`px-4 py-2 rounded-lg transition-all duration-300 font-medium ${
            selectedMode === mode
              ? isDarkMode
                ? 'bg-neon-blue text-white shadow-[0_0_10px_rgba(0,149,255,0.4)]'
                : themeClasses.button.primary
              : isDarkMode
                ? 'bg-neon-blue/10 text-neon-blue hover:bg-neon-blue/20 hover:shadow-[0_0_10px_rgba(0,149,255,0.2)]'
                : themeClasses.button.secondary
          }`}
        >
          {getModeLabel(mode)}
        </button>
      ))}
    </div>
  );
};

export default QuizModeSelector; 