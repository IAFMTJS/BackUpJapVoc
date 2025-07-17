import React, { useState, useEffect } from 'react';
import { useWordLevel } from '../context/WordLevelContext';
import { JapaneseWord } from '../data/types';
import { useTheme } from '../context/ThemeContext';
import { playAudio, playDynamicAudio } from '../utils/audio';
import { QuizWord } from '../data/quizData';
import { useSound } from '../context/SoundContext';
import { useProgress } from '../context/ProgressContext';

type PracticeMode = 'japanese-to-english' | 'english-to-japanese' | 'typing' | 'listening';

interface PracticeState {
  currentWordIndex: number;
  words: JapaneseWord[];
  userInput: string;
  isCorrect: boolean | null;
  showHint: boolean;
  score: number;
  mistakes: number;
  completed: boolean;
  streak: number;
}

interface WordLevelPracticeProps {
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
}

const WordLevelPractice: React.FC<WordLevelPracticeProps> = ({ level }) => {
  const {
    currentLevel,
    getWordsForCurrentLevel,
    updateWordProgress,
    settings
  } = useWordLevel();
  const { theme, isDarkMode, getThemeClasses } = useTheme();
  const { playSound } = useSound();
  const { updateProgress } = useProgress();

  const [practiceMode, setPracticeMode] = useState<PracticeMode>('japanese-to-english');
  const [practiceState, setPracticeState] = useState<PracticeState>({
    currentWordIndex: 0,
    words: [],
    userInput: '',
    isCorrect: null,
    showHint: false,
    score: 0,
    mistakes: 0,
    completed: false,
    streak: 0
  });

  const [showResults, setShowResults] = useState(false);

  const themeClasses = getThemeClasses();

  // Add a comment to trigger re-lint
  // Component updated to use neon Tokyo theme with proper button styles

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
      completed: false,
      streak: 0
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
      case 'listening':
        // Implementation for listening practice
        break;
    }

    setPracticeState(prev => ({
      ...prev,
      isCorrect,
      score: isCorrect ? prev.score + 1 : prev.score,
      mistakes: isCorrect ? prev.mistakes : prev.mistakes + 1,
      streak: isCorrect ? prev.streak + 1 : 0
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

    return (
      <div className={`${themeClasses.card} border ${themeClasses.border} p-6 rounded-card ${isDarkMode ? 'shadow-[0_0_20px_rgba(0,149,255,0.2)]' : ''}`}>
        <div className="mb-6">
          <h2 className={`text-3xl font-bold mb-4 ${themeClasses.text}`}>
            {currentWord.japanese}
          </h2>
          {currentWord.hiragana && (
            <p className={`text-lg ${themeClasses.text} opacity-75`}>
              {currentWord.hiragana}
            </p>
          )}
        </div>

        <div className="mb-6">
          <input
            type="text"
            value={practiceState.userInput}
            onChange={(e) => setPracticeState(prev => ({ ...prev, userInput: e.target.value }))}
            placeholder={
              practiceMode === 'japanese-to-english' ? 'Enter English translation...' :
              practiceMode === 'english-to-japanese' ? 'Enter Japanese translation...' :
              'Enter what you hear...'
            }
            className={`w-full p-4 rounded-nav ${themeClasses.input}`}
            disabled={practiceState.isCorrect !== null}
          />
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={checkAnswer}
            className={`px-6 py-3 rounded-nav font-medium ${themeClasses.button.primary}`}
          >
            Check Answer
          </button>
          <button
            onClick={handleNext}
            className={`px-6 py-3 rounded-nav font-medium ${themeClasses.button.secondary}`}
          >
            Next
          </button>
          <button
            onClick={() => setPracticeState(prev => ({ ...prev, showHint: !prev.showHint }))}
            className={`px-6 py-3 rounded-nav font-medium ${themeClasses.button.secondary}`}
          >
            {practiceState.showHint ? 'Hide Hint' : 'Show Hint'}
          </button>
        </div>

        {practiceState.isCorrect !== null && (
          <div className={`mt-6 p-4 rounded-nav ${
            practiceState.isCorrect 
              ? isDarkMode 
                ? 'bg-blue-100 border-blue-300' 
                : 'bg-green-100 border-green-200'
              : isDarkMode 
                ? 'bg-red-100 border-red-300' 
                : 'bg-red-100 border-red-200'
          } border`}>
            <div className={`text-lg font-medium mb-2 ${
              practiceState.isCorrect 
                ? isDarkMode 
                  ? 'text-blue-600' 
                  : 'text-green-800'
                : isDarkMode 
                  ? 'text-red-600' 
                  : 'text-red-800'
            }`}>
              {practiceState.isCorrect ? 'Correct!' : 'Incorrect!'}
            </div>
            {!practiceState.isCorrect && currentWord && (
              <div className={`${themeClasses.text} mb-2`}>
                Correct Answer: {currentWord.english}
              </div>
            )}
          </div>
        )}

        {practiceState.showHint && currentWord && (
          <div className={`mt-6 p-4 rounded-nav ${themeClasses.card} border ${themeClasses.border}`}>
            <h3 className={`text-lg font-semibold mb-2 ${themeClasses.text}`}>
              Hint
            </h3>
            <p className={themeClasses.text}>
              {currentWord.notes || 'Try to remember the context where this word is commonly used.'}
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderResults = () => (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center ${showResults ? '' : 'hidden'}`}>
      <div className={`max-w-md w-full mx-4 p-6 rounded-nav shadow-xl ${themeClasses.card}`}>
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
                    : themeClasses.button.secondary
                }`}
              >
                Japanese to English
              </button>
              <button
                onClick={() => setPracticeMode('english-to-japanese')}
                className={`px-3 py-1 rounded-full ${
                  practiceMode === 'english-to-japanese'
                    ? themeClasses.button.primary
                    : themeClasses.button.secondary
                }`}
              >
                English to Japanese
              </button>
              <button
                onClick={() => setPracticeMode('typing')}
                className={`px-3 py-1 rounded-full ${
                  practiceMode === 'typing'
                    ? themeClasses.button.primary
                    : themeClasses.button.secondary
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
            className={`px-4 py-2 rounded-nav ${themeClasses.button.secondary}`}
          >
            Close
          </button>
          <button
            onClick={() => {
              setShowResults(false);
              initializePractice();
            }}
            className={`px-4 py-2 rounded-nav ${themeClasses.button.primary}`}
          >
            Practice Again
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`max-w-4xl mx-auto p-4 ${themeClasses.container}`}>
      <div className={`mb-6 ${themeClasses.card} border ${themeClasses.border} p-6 rounded-card ${isDarkMode ? 'shadow-[0_0_20px_rgba(0,149,255,0.2)]' : ''}`}>
        <h2 className={`text-2xl font-bold mb-4 ${themeClasses.text}`}>
          JLPT {level} Word Practice
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-6 rounded-card ${themeClasses.card} border ${themeClasses.border}`}>
            <h3 className={`text-lg font-semibold mb-4 ${themeClasses.text}`}>
              Practice Mode
            </h3>
            <div className="space-y-3">
              {['japanese-to-english', 'english-to-japanese', 'listening'].map((mode) => (
                <label key={mode} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    value={mode}
                    checked={practiceMode === mode}
                    onChange={(e) => setPracticeMode(e.target.value as PracticeMode)}
                    className={`form-radio h-5 w-5 text-blue-500`}
                  />
                  <span className={themeClasses.text}>
                    {mode === 'japanese-to-english' && 'Japanese → English'}
                    {mode === 'english-to-japanese' && 'English → Japanese'}
                    {mode === 'listening' && 'Listening Practice'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className={`p-6 rounded-card ${themeClasses.card} border ${themeClasses.border}`}>
            <h3 className={`text-lg font-semibold mb-4 ${themeClasses.text}`}>
              Progress
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className={`text-sm ${themeClasses.text} opacity-75`}>Score</div>
                <div className={`text-xl font-bold ${themeClasses.text}`}>{practiceState.score}</div>
              </div>
              <div>
                <div className={`text-sm ${themeClasses.text} opacity-75`}>Attempts</div>
                <div className={`text-xl font-bold ${themeClasses.text}`}>{practiceState.mistakes + practiceState.score}</div>
              </div>
              <div>
                <div className={`text-sm ${themeClasses.text} opacity-75`}>Streak</div>
                <div className={`text-xl font-bold ${themeClasses.text}`}>
                  {practiceState.streak > 0 && (
                    <span className="text-red-500">
                      🔥 {practiceState.streak}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <div className={`text-sm ${themeClasses.text} opacity-75`}>Accuracy</div>
                <div className={`text-xl font-bold ${themeClasses.text}`}>
                  {practiceState.mistakes + practiceState.score > 0 ? Math.round((practiceState.score / (practiceState.mistakes + practiceState.score)) * 100) : 0}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {renderPracticeContent()}
      {renderResults()}
    </div>
  );
};

export default WordLevelPractice; 