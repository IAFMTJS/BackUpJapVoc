import React, { useState, useEffect } from 'react';
import { useWordLevel } from '../context/WordLevelContext';
import { JapaneseWord } from '../data/types';
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
        container: 'bg-charcoal-800',
        text: 'text-ivory-100',
        card: 'bg-charcoal-700 hover:bg-charcoal-600',
        input: 'bg-charcoal-700 border-charcoal-600 text-ivory-100',
        button: {
          primary: 'bg-sage-600 hover:bg-sage-700 text-ivory-100',
          secondary: 'bg-charcoal-600 hover:bg-charcoal-500 text-ivory-100',
          outline: 'border-2 border-sage-500 text-sage-300 hover:bg-sage-700/20',
        },
        progress: {
          bg: 'bg-charcoal-600',
          bar: 'bg-sage-500',
        },
      };
    }

    return {
      container: 'bg-ivory-100',
      text: 'text-charcoal-800',
      card: 'bg-ivory-50 hover:bg-sage-50',
      input: 'bg-ivory-50 border-sage-200 text-charcoal-800',
      button: {
        primary: 'bg-sage-600 hover:bg-sage-700 text-ivory-100',
        secondary: 'bg-charcoal-200 hover:bg-charcoal-300 text-charcoal-800',
        outline: 'border-2 border-sage-500 text-sage-600 hover:bg-sage-50',
      },
      progress: {
        bg: 'bg-charcoal-100',
        bar: 'bg-sage-500',
      },
    };
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

  const handlePlayAudio = (japanese: string) => {
    playAudio(japanese);
  };

  const renderPracticeContent = () => {
    if (!currentWord) return null;

    const progress = ((practiceState.currentWordIndex + 1) / practiceState.words.length) * 100;

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className={`${themeClasses.container} rounded-2xl shadow-soft p-8`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className={`text-3xl font-serif font-medium mb-2 ${themeClasses.text}`}>
                Word Level Practice
              </h1>
              <p className={`text-lg ${themeClasses.text}`}>
                Practice vocabulary words at your current level
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <select
                value={currentLevel}
                onChange={(e) => setCurrentLevel(Number(e.target.value))}
                className={`px-4 py-2 rounded-lg ${themeClasses.input} focus:outline-none focus:ring-2 focus:ring-sage-500`}
              >
                {Array.from({ length: 5 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Level {i + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className={`text-sm font-medium ${themeClasses.text}`}>
                Level Progress
              </span>
              <span className={`text-sm ${themeClasses.text}`}>
                {progress}%
              </span>
            </div>
            <div className={`w-full h-2 rounded-full ${themeClasses.progress.bg}`}>
              <div
                className={`h-2 rounded-full transition-all duration-300 ${themeClasses.progress.bar}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="space-y-6">
            {currentWord && (
              <div className={`p-6 rounded-xl ${themeClasses.card} shadow-card`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className={`text-2xl font-serif font-medium mb-2 ${themeClasses.text}`}>
                      {currentWord.japanese}
                    </h2>
                    <p className={`text-lg ${themeClasses.text}`}>
                      {currentWord.reading}
                    </p>
                  </div>
                  <button
                    onClick={handleShowHint}
                    className={`px-4 py-2 rounded-lg font-medium ${themeClasses.button.outline}`}
                  >
                    Hint
                  </button>
                </div>

                <div className="space-y-4">
                  <input
                    type="text"
                    value={practiceState.userInput}
                    onChange={handleInputChange}
                    placeholder="Type the meaning..."
                    className={`w-full px-4 py-3 rounded-lg ${themeClasses.input} focus:outline-none focus:ring-2 focus:ring-sage-500`}
                    onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
                  />

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={handleNext}
                      className={`px-6 py-2 rounded-lg font-medium ${themeClasses.button.secondary}`}
                    >
                      Skip
                    </button>
                    <button
                      onClick={checkAnswer}
                      className={`px-6 py-2 rounded-lg font-medium ${themeClasses.button.primary}`}
                    >
                      Submit
                    </button>
                  </div>
                </div>

                {practiceState.showHint && (
                  <div className={`mt-4 p-4 rounded-lg bg-sage-700/20 border border-sage-600/30 ${
                    isDarkMode ? 'text-sage-300' : 'text-sage-700'
                  }`}>
                    {currentWord.hint}
                  </div>
                )}

                {practiceState.isCorrect !== null && (
                  <div className={`mt-4 p-4 rounded-lg ${
                    practiceState.isCorrect
                      ? 'bg-sage-700/20 border border-sage-600/30 text-sage-300'
                      : 'bg-accent-rust/20 border border-accent-rust/30 text-accent-rust'
                  }`}>
                    <p className="font-medium mb-2">
                      {practiceState.isCorrect ? 'Correct!' : 'Incorrect'}
                    </p>
                    <p>
                      {practiceState.isCorrect
                        ? 'Great job! Keep up the good work.'
                        : `The correct answer was: ${currentWord.meaning}`}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
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