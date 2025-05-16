import React, { useState, useEffect } from 'react';
import { useWordLevel } from '../context/WordLevelContext';
import { JapaneseWord } from '../data/wordLevels';
import { useTheme } from '../context/ThemeContext';
import { playAudio, playDynamicAudio } from '../utils/audio';
import { QuizWord } from '../data/quizData';

type PracticeMode = 'japanese-to-english' | 'english-to-japanese' | 'typing';

interface PracticeState {
  currentWordIndex: number;
  words: JapaneseWord[];
  userInput: string;
  isCorrect: boolean | null;
  showHint: boolean;
  score: number;
  mistakes: number;
  completed: boolean;
}

const WordLevelPractice: React.FC = () => {
  const {
    currentLevel,
    getWordsForCurrentLevel,
    updateWordProgress,
    settings
  } = useWordLevel();
  const { theme, isDarkMode } = useTheme();

  const [practiceMode, setPracticeMode] = useState<PracticeMode>('japanese-to-english');
  const [practiceState, setPracticeState] = useState<PracticeState>({
    currentWordIndex: 0,
    words: [],
    userInput: '',
    isCorrect: null,
    showHint: false,
    score: 0,
    mistakes: 0,
    completed: false
  });

  const [showResults, setShowResults] = useState(false);

  const getThemeClasses = () => {
    if (isDarkMode) {
      return {
        container: 'bg-dark-card',
        text: 'text-dark-text',
        card: 'bg-dark-bg border-dark-border',
        input: 'bg-dark-bg border-dark-border text-dark-text',
        button: {
          primary: 'bg-primary hover:bg-primary-dark text-white',
          secondary: 'bg-secondary hover:bg-secondary-dark text-white',
          outline: 'border-2 border-primary text-primary hover:bg-primary/10',
        },
        progress: {
          bg: 'bg-gray-700',
          bar: 'bg-primary',
        },
      };
    }

    switch (theme) {
      case 'blue':
        return {
          container: 'bg-blue-card',
          text: 'text-blue-text',
          card: 'bg-white border-blue-border',
          input: 'bg-white border-blue-border text-blue-text',
          button: {
            primary: 'bg-blue-600 hover:bg-blue-700 text-white',
            secondary: 'bg-blue-100 hover:bg-blue-200 text-blue-800',
            outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
          },
          progress: {
            bg: 'bg-blue-100',
            bar: 'bg-blue-600',
          },
        };
      case 'green':
        return {
          container: 'bg-green-card',
          text: 'text-green-text',
          card: 'bg-white border-green-border',
          input: 'bg-white border-green-border text-green-text',
          button: {
            primary: 'bg-green-600 hover:bg-green-700 text-white',
            secondary: 'bg-green-100 hover:bg-green-200 text-green-800',
            outline: 'border-2 border-green-600 text-green-600 hover:bg-green-50',
          },
          progress: {
            bg: 'bg-green-100',
            bar: 'bg-green-600',
          },
        };
      default:
        return {
          container: 'bg-white',
          text: 'text-gray-800',
          card: 'bg-gray-50 border-gray-200',
          input: 'bg-white border-gray-200 text-gray-800',
          button: {
            primary: 'bg-blue-600 hover:bg-blue-700 text-white',
            secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800',
            outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
          },
          progress: {
            bg: 'bg-gray-200',
            bar: 'bg-blue-600',
          },
        };
    }
  };

  const themeClasses = getThemeClasses();

  useEffect(() => {
    initializePractice();
  }, [currentLevel, practiceMode]);

  const initializePractice = () => {
    const words = getWordsForCurrentLevel();
    const shuffledWords = [...words].sort(() => Math.random() - 0.5);
    setPracticeState({
      currentWordIndex: 0,
      words: shuffledWords,
      userInput: '',
      isCorrect: null,
      showHint: false,
      score: 0,
      mistakes: 0,
      completed: false
    });
  };

  const currentWord = practiceState.words[practiceState.currentWordIndex];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPracticeState(prev => ({
      ...prev,
      userInput: e.target.value,
      isCorrect: null,
      showHint: false
    }));
  };

  const checkAnswer = () => {
    if (!currentWord) return;

    let isCorrect = false;
    const userAnswer = practiceState.userInput.trim().toLowerCase();

    switch (practiceMode) {
      case 'japanese-to-english':
        isCorrect = currentWord.english.toLowerCase() === userAnswer;
        break;
      case 'english-to-japanese':
        isCorrect = currentWord.japanese === userAnswer;
        break;
      case 'typing':
        isCorrect = currentWord.romaji.toLowerCase() === userAnswer;
        break;
    }

    setPracticeState(prev => ({
      ...prev,
      isCorrect,
      score: isCorrect ? prev.score + 1 : prev.score,
      mistakes: isCorrect ? prev.mistakes : prev.mistakes + 1
    }));

    updateWordProgress(currentWord.id, isCorrect);
  };

  const handleNext = () => {
    if (practiceState.currentWordIndex === practiceState.words.length - 1) {
      setPracticeState(prev => ({ ...prev, completed: true }));
      setShowResults(true);
    } else {
      setPracticeState(prev => ({
        ...prev,
        currentWordIndex: prev.currentWordIndex + 1,
        userInput: '',
        isCorrect: null,
        showHint: false
      }));
    }
  };

  const handleShowHint = () => {
    setPracticeState(prev => ({ ...prev, showHint: true }));
  };

  const handlePlayAudio = (text: string, id?: string) => {
    if (id) {
      // Use pre-generated audio if we have an ID
      playAudio(id);
    } else {
      // Fallback to dynamic audio for content without an ID
      playDynamicAudio(text);
    }
  };

  const renderPracticeContent = () => {
    if (!currentWord) return null;

    const progress = ((practiceState.currentWordIndex + 1) / practiceState.words.length) * 100;

    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-6">
          <div className={`h-2 rounded-full ${themeClasses.progress.bg}`}>
            <div
              className={`h-2 rounded-full transition-all duration-300 ${themeClasses.progress.bar}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className={`mt-2 text-sm ${themeClasses.text}`}>
            Word {practiceState.currentWordIndex + 1} of {practiceState.words.length}
          </p>
        </div>

        <div className={`p-6 rounded-lg shadow-md ${themeClasses.card}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-2xl font-bold ${themeClasses.text}`}>
              {practiceMode === 'japanese-to-english' ? currentWord.japanese :
               practiceMode === 'english-to-japanese' ? currentWord.english :
               currentWord.romaji}
            </h2>
            <button
              onClick={() => handlePlayAudio(currentWord.japanese, currentWord.id)}
              className="ml-2 p-2 rounded-full hover:bg-opacity-10"
              title="Play Audio"
            >
              🔊
            </button>
          </div>

          {practiceState.showHint && (
            <p className={`mb-4 text-sm ${themeClasses.text}`}>
              Hint: {practiceMode === 'japanese-to-english' ? currentWord.romaji :
                    practiceMode === 'english-to-japanese' ? currentWord.romaji :
                    currentWord.japanese}
            </p>
          )}

          <input
            type="text"
            value={practiceState.userInput}
            onChange={handleInputChange}
            onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
            placeholder={
              practiceMode === 'japanese-to-english' ? 'Enter English translation' :
              practiceMode === 'english-to-japanese' ? 'Enter Japanese word' :
              'Type the romaji'
            }
            className={`w-full px-4 py-2 mb-4 rounded-lg border ${themeClasses.input} ${
              practiceState.isCorrect === false ? 'border-red-500' : ''
            }`}
          />

          {practiceState.isCorrect === false && (
            <p className="mb-4 text-sm text-red-600">
              Correct answer: {
                practiceMode === 'japanese-to-english' ? currentWord.english :
                practiceMode === 'english-to-japanese' ? currentWord.japanese :
                currentWord.romaji
              }
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={checkAnswer}
              disabled={!practiceState.userInput.trim()}
              className={`px-4 py-2 rounded-lg ${themeClasses.button.primary} disabled:opacity-50`}
            >
              Check
            </button>
            <button
              onClick={handleShowHint}
              disabled={practiceState.showHint}
              className={`px-4 py-2 rounded-lg ${themeClasses.button.secondary} disabled:opacity-50`}
            >
              Hint
            </button>
            {practiceState.isCorrect !== null && (
              <button
                onClick={handleNext}
                className={`px-4 py-2 rounded-lg ${
                  practiceState.isCorrect ? themeClasses.button.primary : themeClasses.button.secondary
                }`}
              >
                Next
              </button>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <p className={`${themeClasses.text}`}>
            Score: {practiceState.score}
          </p>
          <p className="text-red-600">
            Mistakes: {practiceState.mistakes}
          </p>
        </div>
      </div>
    );
  };

  const renderResults = () => (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center ${showResults ? '' : 'hidden'}`}>
      <div className={`max-w-md w-full mx-4 p-6 rounded-lg shadow-xl ${themeClasses.card}`}>
        <h2 className={`text-2xl font-bold mb-4 ${themeClasses.text}`}>Practice Results</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className={`text-xl font-semibold mb-2 ${themeClasses.text}`}>
              Level {currentLevel} Practice Complete!
            </h3>
            <p className={`${themeClasses.text}`}>
              You got {practiceState.score} out of {practiceState.words.length} words correct.
            </p>
            <p className={`text-sm ${themeClasses.text}`}>
              Accuracy: {((practiceState.score / practiceState.words.length) * 100).toFixed(1)}%
            </p>
          </div>

          <div>
            <h4 className={`text-lg font-medium mb-2 ${themeClasses.text}`}>
              Practice Mode
            </h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setPracticeMode('japanese-to-english')}
                className={`px-3 py-1 rounded-full ${
                  practiceMode === 'japanese-to-english'
                    ? themeClasses.button.primary
                    : themeClasses.button.outline
                }`}
              >
                Japanese to English
              </button>
              <button
                onClick={() => setPracticeMode('english-to-japanese')}
                className={`px-3 py-1 rounded-full ${
                  practiceMode === 'english-to-japanese'
                    ? themeClasses.button.primary
                    : themeClasses.button.outline
                }`}
              >
                English to Japanese
              </button>
              <button
                onClick={() => setPracticeMode('typing')}
                className={`px-3 py-1 rounded-full ${
                  practiceMode === 'typing'
                    ? themeClasses.button.primary
                    : themeClasses.button.outline
                }`}
              >
                Typing Practice
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={() => setShowResults(false)}
            className={`px-4 py-2 rounded-lg ${themeClasses.button.outline}`}
          >
            Close
          </button>
          <button
            onClick={() => {
              setShowResults(false);
              initializePractice();
            }}
            className={`px-4 py-2 rounded-lg ${themeClasses.button.primary}`}
          >
            Practice Again
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-center gap-2 mb-6">
        <button
          onClick={() => setPracticeMode('japanese-to-english')}
          className={`px-4 py-2 rounded-lg ${
            practiceMode === 'japanese-to-english'
              ? themeClasses.button.primary
              : themeClasses.button.outline
          }`}
        >
          Japanese → English
        </button>
        <button
          onClick={() => setPracticeMode('english-to-japanese')}
          className={`px-4 py-2 rounded-lg ${
            practiceMode === 'english-to-japanese'
              ? themeClasses.button.primary
              : themeClasses.button.outline
          }`}
        >
          English → Japanese
        </button>
        <button
          onClick={() => setPracticeMode('typing')}
          className={`px-4 py-2 rounded-lg ${
            practiceMode === 'typing'
              ? themeClasses.button.primary
              : themeClasses.button.outline
          }`}
        >
          Typing Practice
        </button>
      </div>

      {renderPracticeContent()}
      {renderResults()}
    </div>
  );
};

export default WordLevelPractice; 