import React, { useState, useEffect, useRef } from 'react';
import { GrammarExample, GrammarDifficulty, GrammarCategory, grammarExamples } from '../data/grammarData';
import { useTheme } from '../context/ThemeContext';
import { useProgress } from '../context/ProgressContext';
import { checkAnswer, calculateScore, calculateAverageTime } from '../utils/quizUtils';
import { playAudio, playDynamicAudio } from '../utils/audio';

// Sound effects
const correctSound = new Audio('/sounds/correct.mp3');
const incorrectSound = new Audio('/sounds/incorrect.mp3');
const timeUpSound = new Audio('/sounds/timeup.mp3');

const SentencePractice: React.FC = () => {
  const { theme, isDarkMode } = useTheme();
  const [selectedDifficulty, setSelectedDifficulty] = useState<GrammarDifficulty>('easy');
  const [selectedCategory, setSelectedCategory] = useState<GrammarCategory>('basic');
  const [currentExample, setCurrentExample] = useState<GrammarExample | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [usedExamples, setUsedExamples] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(30);
  const [showHint, setShowHint] = useState(false);
  const [timerActive, setTimerActive] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [streak, setStreak] = useState(0);
  const [averageTime, setAverageTime] = useState(0);
  const [questionsRemaining, setQuestionsRemaining] = useState(10);
  const [quizComplete, setQuizComplete] = useState(false);
  const [mode, setMode] = useState<'translate' | 'fill-blank'>('fill-blank');
  const progressRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { updateProgress } = useProgress();

  const getFilteredExamples = () => {
    return grammarExamples.filter(example => {
      const matchesDifficulty = example.difficulty === selectedDifficulty;
      const matchesCategory = selectedCategory === 'all' || example.category === selectedCategory;
      return matchesDifficulty && matchesCategory;
    });
  };

  const getRandomExample = () => {
    const filteredExamples = getFilteredExamples();
    const availableExamples = filteredExamples.filter(example => !usedExamples.has(example.japanese));
    
    if (availableExamples.length === 0) {
      setUsedExamples(new Set());
      return filteredExamples[Math.floor(Math.random() * filteredExamples.length)];
    }
    
    return availableExamples[Math.floor(Math.random() * availableExamples.length)];
  };

  const startNewPractice = () => {
    setScore(0);
    setTotalQuestions(0);
    setShowResult(false);
    setUsedExamples(new Set());
    setCurrentExample(getRandomExample());
    setTimeLeft(30);
    setShowHint(false);
    setTimerActive(true);
    setStreak(0);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const playSound = (sound: HTMLAudioElement) => {
    if (soundEnabled) {
      sound.currentTime = 0;
      sound.play().catch(() => {
        setSoundEnabled(false);
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!timerActive) return;

    const isAnswerCorrect = checkAnswer(userAnswer, currentExample?.english.toLowerCase() || '');
    const pointsEarned = calculateScore(isAnswerCorrect, streak);

    if (isAnswerCorrect) {
      correctSound.play();
      setScore(prev => prev + pointsEarned);
      setStreak(prev => prev + 1);
    } else {
      incorrectSound.play();
      setStreak(0);
    }

    setTotalQuestions(prev => prev + 1);
    setUsedExamples(prev => new Set([...prev, currentExample?.japanese || '']));
    setIsCorrect(isAnswerCorrect);
    setShowResult(true);
    setTimerActive(false);
    setUserAnswer('');

    // Update progress
    updateProgress('sentencePractice', {
      totalQuestions: totalQuestions + 1,
      correctAnswers: isAnswerCorrect ? (score + 1) : score,
      bestStreak: Math.max(streak, streak + (isAnswerCorrect ? 1 : 0)),
      averageTime: ((averageTime * totalQuestions) + (30 - timeLeft)) / (totalQuestions + 1)
    });

    if (questionsRemaining <= 1) {
      setQuizComplete(true);
    }
  };

  const handleNext = () => {
    setUserAnswer('');
    setShowResult(false);
    setCurrentExample(getRandomExample());
    setTimeLeft(30);
    setShowHint(false);
    setTimerActive(true);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const getBlankedSentence = (sentence: string, blankIndex: number) => {
    const words = sentence.split(' ');
    if (blankIndex < 0 || blankIndex >= words.length) return sentence;
    words[blankIndex] = '____';
    return words.join(' ');
  };

  const handleBlankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!timerActive) return;
    // For now, blankIndex is always 0
    const blankIndex = 0;
    const correctWord = currentExample?.japanese.split(' ')[blankIndex] || '';
    const isAnswerCorrect = userAnswer.trim() === correctWord;
    const pointsEarned = calculateScore(isAnswerCorrect, streak);

    if (isAnswerCorrect) {
      correctSound.play();
      setScore(prev => prev + pointsEarned);
      setStreak(prev => prev + 1);
    } else {
      incorrectSound.play();
      setStreak(0);
    }

    setTotalQuestions(prev => prev + 1);
    setUsedExamples(prev => new Set([...prev, currentExample?.japanese || '']));
    setIsCorrect(isAnswerCorrect);
    setShowResult(true);
    setTimerActive(false);
    setUserAnswer('');

    // Update progress
    updateProgress('sentencePractice', {
      totalQuestions: totalQuestions + 1,
      correctAnswers: isAnswerCorrect ? (score + 1) : score,
      bestStreak: Math.max(streak, streak + (isAnswerCorrect ? 1 : 0)),
      averageTime: ((averageTime * totalQuestions) + (30 - timeLeft)) / (totalQuestions + 1)
    });

    if (questionsRemaining <= 1) {
      setQuizComplete(true);
    }
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

  useEffect(() => {
    startNewPractice();
  }, [selectedDifficulty, selectedCategory]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timerActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !showResult) {
      playSound(timeUpSound);
      handleSubmit(new Event('submit') as any);
    }
    return () => clearInterval(timer);
  }, [timeLeft, timerActive]);

  useEffect(() => {
    if (progressRef.current) {
      const progress = (timeLeft / 30) * 100;
      progressRef.current.style.width = `${progress}%`;
    }
  }, [timeLeft]);

  const getThemeClasses = () => {
    if (isDarkMode) {
      return {
        container: 'bg-dark-card',
        text: 'text-dark-text',
        input: 'bg-dark-bg border-dark-border text-dark-text',
        button: {
          primary: 'bg-primary hover:bg-primary-dark text-white',
          secondary: 'bg-secondary hover:bg-secondary-dark text-white',
          hint: 'bg-yellow-500 hover:bg-yellow-600 text-white',
        },
        hint: 'bg-yellow-900/20 border-yellow-800/30 text-yellow-200',
        result: {
          correct: 'bg-green-900/20 border-green-800/30 text-green-200',
          incorrect: 'bg-red-900/20 border-red-800/30 text-red-200',
        },
      };
    }

    switch (theme) {
      case 'blue':
        return {
          container: 'bg-blue-card',
          text: 'text-blue-text',
          input: 'bg-white border-blue-border text-blue-text',
          button: {
            primary: 'bg-primary hover:bg-primary-dark text-white',
            secondary: 'bg-secondary hover:bg-secondary-dark text-white',
            hint: 'bg-yellow-500 hover:bg-yellow-600 text-white',
          },
          hint: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          result: {
            correct: 'bg-green-50 border-green-200 text-green-800',
            incorrect: 'bg-red-50 border-red-200 text-red-800',
          },
        };
      case 'green':
        return {
          container: 'bg-green-card',
          text: 'text-green-text',
          input: 'bg-white border-green-border text-green-text',
          button: {
            primary: 'bg-primary hover:bg-primary-dark text-white',
            secondary: 'bg-secondary hover:bg-secondary-dark text-white',
            hint: 'bg-yellow-500 hover:bg-yellow-600 text-white',
          },
          hint: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          result: {
            correct: 'bg-green-50 border-green-200 text-green-800',
            incorrect: 'bg-red-50 border-red-200 text-red-800',
          },
        };
      default:
        return {
          container: 'bg-white',
          text: 'text-gray-800',
          input: 'bg-white border-gray-200 text-gray-800',
          button: {
            primary: 'bg-primary hover:bg-primary-dark text-white',
            secondary: 'bg-secondary hover:bg-secondary-dark text-white',
            hint: 'bg-yellow-500 hover:bg-yellow-600 text-white',
          },
          hint: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          result: {
            correct: 'bg-green-50 border-green-200 text-green-800',
            incorrect: 'bg-red-50 border-red-200 text-red-800',
          },
        };
    }
  };

  const themeClasses = getThemeClasses();

  return (
    <div className="max-w-2xl mx-auto">
      <div className={`mb-8 ${themeClasses.container} rounded-lg shadow-md p-6`}>
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value as GrammarDifficulty)}
            className={`flex-1 p-3 border rounded-lg ${themeClasses.input} focus:ring-2 focus:ring-primary focus:border-primary`}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as GrammarCategory)}
            className={`flex-1 p-3 border rounded-lg ${themeClasses.input} focus:ring-2 focus:ring-primary focus:border-primary`}
          >
            <option value="basic">Basic Patterns</option>
            <option value="particles">Particles</option>
            <option value="verbs">Verbs</option>
            <option value="adjectives">Adjectives</option>
            <option value="all">All Categories</option>
          </select>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-3 rounded-lg transition-colors ${
              soundEnabled ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
            } text-white`}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className={`text-lg font-semibold ${themeClasses.text}`}>
            Score: {score}/{totalQuestions}
            {streak > 2 && (
              <span className="ml-2 text-yellow-500">
                🔥 {streak} streak!
              </span>
            )}
          </div>
          <div className={`text-lg font-semibold ${timeLeft <= 15 ? 'text-red-500 animate-pulse' : themeClasses.text}`}>
            Time: {timeLeft}s
          </div>
        </div>

        <div className="w-full h-2 bg-gray-200 dark:bg-dark-border rounded-full overflow-hidden">
          <div
            ref={progressRef}
            className={`h-full transition-all duration-1000 ${
              timeLeft <= 15 ? 'bg-red-500' : 'bg-primary'
            }`}
            style={{ width: '100%' }}
          />
        </div>

        <div className="mb-4">
          <label className="mr-2">Mode:</label>
          <select value={mode} onChange={e => setMode(e.target.value as 'translate' | 'fill-blank')}>
            <option value="translate">Translate</option>
            <option value="fill-blank">Fill in the Blank</option>
          </select>
        </div>
      </div>

      {currentExample && mode === 'fill-blank' && (
        <div className={`${themeClasses.container} rounded-lg shadow-md p-6`}>
          <div className={`text-3xl font-bold text-center mb-4 ${themeClasses.text}`}>
            {getBlankedSentence(currentExample.japanese, 0)}
          </div>
          <button
            onClick={() => handlePlayAudio(currentExample.japanese, currentExample.id)}
            className="ml-2 p-2 rounded-full hover:bg-opacity-10"
            title="Play Audio"
          >
            🔊
          </button>
          <form onSubmit={handleBlankSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type the missing word"
              className={`w-full p-3 border rounded-lg ${themeClasses.input} focus:ring-2 focus:ring-primary focus:border-primary`}
              disabled={showResult}
            />
            {!showResult ? (
              <button
                type="submit"
                className={`w-full ${themeClasses.button.primary} py-3 rounded-lg transition-colors`}
              >
                Check Answer
              </button>
            ) : (
              <div className="space-y-4">
                <div className={`text-center p-4 rounded-lg ${
                  isCorrect ? themeClasses.result.correct : themeClasses.result.incorrect
                }`}>
                  {isCorrect ? 'Correct! 🎉' : `Incorrect. The answer is: ${currentExample.japanese.split(' ')[0]}`}
                </div>
                <button
                  type="button"
                  onClick={handleNext}
                  className={`w-full ${themeClasses.button.secondary} py-3 rounded-lg transition-colors`}
                >
                  Next Example
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {currentExample && mode === 'translate' && (
        <div className={`${themeClasses.container} rounded-lg shadow-md p-6 transform transition-all duration-300 hover:shadow-lg`}>
          <div className={`text-3xl font-bold text-center mb-4 ${themeClasses.text}`}>
            {currentExample.japanese}
          </div>
          
          <div className={`text-lg text-center mb-6 ${themeClasses.input} p-4 rounded-lg`}>
            Pattern: {currentExample.pattern}
          </div>

          {!showHint && !showResult && (
            <button
              onClick={() => setShowHint(true)}
              className={`w-full mb-6 ${themeClasses.button.hint} py-3 rounded-lg transition-colors`}
            >
              Show Hint
            </button>
          )}

          {showHint && !showResult && (
            <div className={`mb-6 p-4 rounded-lg ${themeClasses.hint}`}>
              <p>{currentExample.hint}</p>
            </div>
          )}

          <button
            onClick={() => handlePlayAudio(currentExample.japanese, currentExample.id)}
            className="ml-2 p-2 rounded-full hover:bg-opacity-10"
            title="Play Audio"
          >
            🔊
          </button>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              ref={inputRef}
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type the English translation"
              className={`w-full p-3 border rounded-lg ${themeClasses.input} focus:ring-2 focus:ring-primary focus:border-primary`}
              disabled={showResult}
            />

            {!showResult ? (
              <button
                type="submit"
                className={`w-full ${themeClasses.button.primary} py-3 rounded-lg transition-colors`}
              >
                Check Answer
              </button>
            ) : (
              <div className="space-y-4">
                <div className={`text-center p-4 rounded-lg ${
                  isCorrect ? themeClasses.result.correct : themeClasses.result.incorrect
                }`}>
                  {isCorrect ? 'Correct! 🎉' : `Incorrect. The answer is: ${currentExample.english}`}
                </div>
                <button
                  type="button"
                  onClick={handleNext}
                  className={`w-full ${themeClasses.button.secondary} py-3 rounded-lg transition-colors`}
                >
                  Next Example
                </button>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

export default SentencePractice; 