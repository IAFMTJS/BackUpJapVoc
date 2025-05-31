import React, { useState } from 'react';
import WritingPractice from '../../components/WritingPractice';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

type WritingMode = 'hiragana' | 'katakana' | 'kanji';

const Writing: React.FC = () => {
  const navigate = useNavigate();
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  const [selectedMode, setSelectedMode] = useState<WritingMode>('hiragana');

  const handleComplete = () => {
    // You can add any completion logic here, like showing a summary or returning to the main menu
    navigate('/');
  };

  return (
    <div className={themeClasses.container}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-4 ${themeClasses.text.primary}`}>Writing Practice</h1>
          <div className="flex space-x-4">
            {(['hiragana', 'katakana', 'kanji'] as WritingMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setSelectedMode(mode)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedMode === mode
                    ? themeClasses.button.primary
                    : themeClasses.button.secondary
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <WritingPractice mode={selectedMode} onComplete={handleComplete} />
      </div>
    </div>
  );
};

export default Writing; 