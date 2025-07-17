import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useProgress } from '../context/ProgressContext';
import { useSettings } from '../context/SettingsContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { playAudio } from '../utils/audio';
import { shuffleArray } from '../utils/array';
import { Word } from '../types/word';
import { getWordList } from '../utils/wordList';
import AudioManager from '../components/AudioManager';
import JapaneseCityscape from '../components/visualizations/JapaneseCityscape';

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    <span className="ml-3 text-lg">Loading games...</span>
  </div>
);

// --- Game 1: Multiple Choice Quiz ---
const MultipleChoiceQuiz: React.FC<{ availableWords: Word[] }> = ({ availableWords }) => {
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  
  if (availableWords.length < 4) {
    return (
      <div className="text-center p-4">
        <p className={`text-lg mb-4 ${themeClasses.text.primary}`}>Need at least 4 words to start the quiz.</p>
        <p className={`text-sm ${themeClasses.text.muted}`}>
          Complete some vocabulary lessons to unlock more words!
        </p>
      </div>
    );
  }

  const word = availableWords[qIndex % availableWords.length];
  const options = useMemo(() => {
    const others = availableWords.filter(w => w.japanese !== word.japanese);
    const shuffled = shuffleArray(others).slice(0, 3);
    return shuffleArray([...shuffled, word]);
  }, [qIndex, availableWords, word]);

  return (
    <div className="flex flex-col items-center p-6">
      <div className={`text-2xl mb-6 text-center ${themeClasses.text.primary}`}>
        What is the meaning of: <b className="text-blue-600 dark:text-blue-400">{word.japanese}</b>?
      </div>
      <div className="flex flex-col gap-3 w-full max-w-md">
        {options.map((opt, i) => (
          <button
            key={i}
            className={`px-6 py-3 rounded-nav text-lg transition-colors ${
              selected === i
                ? opt.english === word.english
                  ? 'bg-status-success text-text-primary dark:text-text-dark-primary'
                  : 'bg-status-error text-text-primary dark:text-text-dark-primary'
                : themeClasses.button.secondary
            }`}
            onClick={() => setSelected(i)}
            disabled={selected !== null}
          >
            {opt.english}
          </button>
        ))}
      </div>
      {selected !== null && (
        <button
          className={`mt-6 px-6 py-2 ${themeClasses.button.primary}`}
          onClick={() => {
            setQIndex(i => i + 1);
            setSelected(null);
          }}
        >
          Next Question
        </button>
      )}
    </div>
  );
};

// --- Game 2: Audio Match ---
const AudioMatch: React.FC<{ availableWords: Word[] }> = ({ availableWords }) => {
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  
  if (availableWords.length < 4) {
    return (
      <div className="text-center p-4">
        <p className={`text-lg mb-4 ${themeClasses.text.primary}`}>Need at least 4 words to start the audio match game.</p>
        <p className={`text-sm ${themeClasses.text.muted}`}>
          Complete some vocabulary lessons to unlock more words!
        </p>
      </div>
    );
  }

  const word = availableWords[qIndex % availableWords.length];
  const options = useMemo(() => {
    const others = availableWords.filter(w => w.japanese !== word.japanese);
    const shuffled = shuffleArray(others).slice(0, 3);
    return shuffleArray([...shuffled, word]);
  }, [qIndex, availableWords, word]);

  const handlePlayAudio = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      await playAudio(word.japanese);
    } catch (error) {
      console.error('Error playing audio:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-6">
      <button
        className={`mb-6 px-6 py-3 ${themeClasses.button.primary} text-xl ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={handlePlayAudio}
        disabled={isPlaying}
      >
        {isPlaying ? 'Playing...' : '🔊 Play Audio'}
      </button>
      <div className="flex flex-col gap-3 w-full max-w-md">
        {options.map((opt, i) => (
          <button
            key={i}
            className={`px-6 py-3 rounded-nav text-lg transition-colors ${
              selected === i
                ? opt.japanese === word.japanese
                  ? 'bg-status-success text-text-primary dark:text-text-dark-primary'
                  : 'bg-status-error text-text-primary dark:text-text-dark-primary'
                : themeClasses.button.secondary
            }`}
            onClick={() => setSelected(i)}
            disabled={selected !== null}
          >
            {opt.japanese}
          </button>
        ))}
      </div>
      {selected !== null && (
        <button
          className={`mt-6 px-6 py-2 ${themeClasses.button.primary}`}
          onClick={() => {
            setQIndex(i => i + 1);
            setSelected(null);
          }}
        >
          Next Question
        </button>
      )}
    </div>
  );
};

const Games: React.FC = () => {
  const { getThemeClasses, theme } = useTheme();
  const { progress: globalProgress, isLoading: isProgressLoading } = useProgress();
  const { settings: globalSettings, isLoading: isSettingsLoading } = useSettings();
  const { settings: accessibilitySettings, isLoading: isAccessibilityLoading } = useAccessibility();
  const [activeGame, setActiveGame] = useState<'quiz' | 'audio'>('quiz');

  const themeClasses = getThemeClasses();

  // Check if any context is still loading
  const isLoading = isProgressLoading || isSettingsLoading || isAccessibilityLoading;

  // Get all available words
  const availableWords = useMemo(() => {
    if (isLoading) return [];
    const allWords = getWordList();
    return allWords.filter(word => {
      const progress = globalProgress?.[`quiz-${word.japanese}`];
      return !progress || progress.correct < 3; // Show words that aren't mastered yet
    });
  }, [globalProgress, isLoading]);

  // Show loading state if any context is still loading
  if (isLoading) {
    return (
      <div className={themeClasses.container}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Link to="/" className={`${themeClasses.nav.link.default} mr-4`}>
                ← Back to Home
              </Link>
              <h1 className={`text-3xl font-bold ${themeClasses.text.primary}`}>
                Learning Games
              </h1>
            </div>
          </div>
          <div className={`p-6 rounded-nav ${themeClasses.card}`}>
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${themeClasses.container} relative min-h-screen`}>
      {/* Theme-specific cityscape background */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-15">
        <JapaneseCityscape 
          width={800}
          height={400}
          theme={theme}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link to="/" className={`${themeClasses.nav.link.default} mr-4`}>
              ← Back to Home
            </Link>
            <h1 className={`text-3xl font-bold ${themeClasses.text.primary}`}>
              Learning Games
            </h1>
          </div>
        </div>

        {/* Game selection */}
        <div className="mb-8">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveGame('quiz')}
              className={`px-6 py-3 rounded-nav font-medium transition-colors ${
                activeGame === 'quiz'
                  ? 'bg-japanese-red text-text-primary dark:text-text-dark-primary'
                  : `${themeClasses.button.secondary}`
              }`}
            >
              Multiple Choice Quiz
            </button>
            <button
              onClick={() => setActiveGame('audio')}
              className={`px-6 py-3 rounded-nav font-medium transition-colors ${
                activeGame === 'audio'
                  ? 'bg-japanese-red text-text-primary dark:text-text-dark-primary'
                  : `${themeClasses.button.secondary}`
              }`}
            >
              Audio Match
            </button>
          </div>
        </div>

        {/* Game content */}
        <div className={`p-6 rounded-nav ${themeClasses.card}`}>
          {activeGame === 'quiz' ? (
            <MultipleChoiceQuiz availableWords={availableWords} />
          ) : (
            <AudioMatch availableWords={availableWords} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Games; 