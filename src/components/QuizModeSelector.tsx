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
  const { theme, isDarkMode } = useTheme();

  const getThemeClasses = () => {
    if (isDarkMode) {
      return {
        container: 'bg-charcoal-800',
        text: 'text-ivory-100',
        button: {
          active: 'bg-sage-600 text-ivory-100',
          inactive: 'bg-charcoal-700 text-ivory-300 hover:bg-charcoal-600 hover:text-ivory-100',
        },
      };
    }

    return {
      container: 'bg-ivory-100',
      text: 'text-charcoal-800',
      button: {
        active: 'bg-sage-600 text-ivory-100',
        inactive: 'bg-ivory-50 text-charcoal-600 hover:bg-sage-50 hover:text-sage-700',
      },
    };
  };

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
    <div className={`flex flex-wrap gap-3 p-4 rounded-xl ${themeClasses.container} shadow-soft`}>
      {availableModes.map((mode) => (
        <button
          key={mode}
          onClick={() => onModeSelect(mode)}
          className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
            selectedMode === mode ? themeClasses.button.active : themeClasses.button.inactive
          }`}
        >
          {getModeLabel(mode)}
        </button>
      ))}
    </div>
  );
};

export default QuizModeSelector; 