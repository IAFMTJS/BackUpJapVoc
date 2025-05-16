import React, { useState, useEffect, useRef } from 'react';
import { QuizWord, Difficulty, Category, quizWords } from '../data/quizData';
import { useTheme } from '../context/ThemeContext';
import { useProgress } from '../context/ProgressContext';
import { checkAnswer, calculateScore, calculateAverageTime } from '../utils/quizUtils';
import QuizModeSelector, { QuizMode } from './QuizModeSelector';
import { Chip } from '@mui/material';
import { playAudio, playDynamicAudio } from '../utils/audio';

// Sound effects
const correctSound = new Audio('/sounds/correct.mp3');
const incorrectSound = new Audio('/sounds/incorrect.mp3');
const timeUpSound = new Audio('/sounds/timeup.mp3');

// Update the QuizWord interface
interface QuizWord {
  japanese: string;
  english: string;
  category: Category;
  difficulty: Difficulty;
  hint?: string;
  romaji?: string;
  isHiragana: boolean;
  isKatakana: boolean;
  examples?: Array<{
    japanese: string;
    english: string;
    romaji: string;
    notes?: string;
  }>;
  notes?: string;
  jlptLevel?: string;
  id?: string;
}

const WordPractice: React.FC = () => {
  const { theme, isDarkMode } = useTheme();
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('easy');
  const [selectedCategory, setSelectedCategory] = useState<Category>('food');
  const [questionCount, setQuestionCount] = useState(10);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentWord, setCurrentWord] = useState<QuizWord | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [timerActive, setTimerActive] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [streak, setStreak] = useState(0);
  const [averageTime, setAverageTime] = useState(0);
  const [quizMode, setQuizMode] = useState<QuizMode>('multiple-choice');
  const [options, setOptions] = useState<string[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [quizComplete, setQuizComplete] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [finalStreak, setFinalStreak] = useState(0);
  const progressRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { updateProgress } = useProgress();

  const getFilteredWords = () => {
    return quizWords.filter(word => {
      const matchesDifficulty = word.difficulty === selectedDifficulty;
      const matchesCategory = selectedCategory === 'all' || word.category === selectedCategory;
      return matchesDifficulty && matchesCategory;
    });
  };

  const getRandomWord = () => {
    const filteredWords = getFilteredWords();
    const availableWords = filteredWords.filter(word => !usedWords.has(word.japanese));
    
    if (availableWords.length === 0) {
      setUsedWords(new Set());
      return filteredWords[Math.floor(Math.random() * filteredWords.length)];
    }
    
    return availableWords[Math.floor(Math.random() * availableWords.length)];
  };

  const generateOptions = (correctWord: QuizWord) => {
    const filteredWords = getFilteredWords();
    const otherWords = filteredWords.filter(word => word.japanese !== correctWord.japanese);
    const shuffled = otherWords.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    const options = [...selected.map(word => word.english), correctWord.english];
    return options.sort(() => 0.5 - Math.random());
  };

  const getTimeForDifficulty = (difficulty: Difficulty): number => {
    switch (difficulty) {
      case 'easy':
        return 45;
      case 'medium':
        return 30;
      case 'hard':
        return 20;
      default:
        return 30;
    }
  };

  const getFeedbackMessage = (isCorrect: boolean, streak: number): string => {
    if (isCorrect) {
      if (streak > 5) return 'Incredible! You\'re on fire! 🔥';
      if (streak > 3) return 'Amazing streak! Keep it up! 💪';
      if (streak > 1) return 'Great job! You\'re getting better! 🌟';
      return 'Correct! Well done! ✅';
    } else {
      return 'Not quite right. Keep practicing! 💪';
    }
  };

  const startNewPractice = () => {
    setScore(0);
    setTotalQuestions(0);
    setShowResult(false);
    setUsedWords(new Set());
    const newWord = getRandomWord();
    setCurrentWord(newWord);
    setOptions(generateOptions(newWord));
    setTimeLeft(getTimeForDifficulty(selectedDifficulty));
    setShowHint(false);
    setTimerActive(true);
    setStreak(0);
    setFeedbackMessage('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const startQuiz = () => {
    setQuizStarted(true);
    startNewPractice();
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setScore(0);
    setTotalQuestions(0);
    setShowResult(false);
    setUsedWords(new Set());
    setCurrentWord(null);
    setTimeLeft(0);
    setShowHint(false);
    setTimerActive(false);
    setStreak(0);
    setFeedbackMessage('');
  };

  const playSound = (sound: HTMLAudioElement) => {
    if (soundEnabled) {
      sound.currentTime = 0;
      sound.play().catch(() => {
        setSoundEnabled(false);
      });
    }
  };

  const handleAnswer = (answer: string) => {
    if (!timerActive || !currentWord) return;

    const isAnswerCorrect = checkAnswer(answer, currentWord.english);
    const pointsEarned = calculateScore(isAnswerCorrect, streak);

    if (isAnswerCorrect) {
      playSound(correctSound);
      setStreak(prev => prev + 1);
    } else {
      playSound(incorrectSound);
      setStreak(0);
    }

    const newScore = score + pointsEarned;
    const newTotalQuestions = totalQuestions + 1;
    setScore(newScore);
    setTotalQuestions(newTotalQuestions);
    setUsedWords(prev => new Set([...prev, currentWord.japanese]));
    setIsCorrect(isAnswerCorrect);
    setShowResult(true);
    setTimerActive(false);
    setFeedbackMessage(getFeedbackMessage(isAnswerCorrect, streak));

    // Check if quiz is complete
    if (newTotalQuestions >= questionCount) {
      setQuizComplete(true);
      setFinalScore(newScore);
      setFinalStreak(streak);
      updateProgress('wordPractice', {
        correctAnswers: newScore,
        bestStreak: Math.max(streak, streak + (isAnswerCorrect ? 1 : 0)),
        averageTime: calculateAverageTime(averageTime, newTotalQuestions, timeLeft)
      });
    } else {
      updateProgress('wordPractice', {
        correctAnswers: newScore,
        bestStreak: Math.max(streak, streak + (isAnswerCorrect ? 1 : 0)),
        averageTime: calculateAverageTime(averageTime, newTotalQuestions, timeLeft)
      });
    }
    setAverageTime(calculateAverageTime(averageTime, newTotalQuestions, timeLeft));
  };

  const handleNext = () => {
    setUserAnswer('');
    setShowResult(false);
    const newWord = getRandomWord();
    setCurrentWord(newWord);
    setOptions(generateOptions(newWord));
    setTimeLeft(getTimeForDifficulty(selectedDifficulty));
    setShowHint(false);
    setTimerActive(true);
    setFeedbackMessage('');
    if (inputRef.current) {
      inputRef.current.focus();
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
  }, [selectedDifficulty, selectedCategory, quizMode]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timerActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !showResult) {
      playSound(timeUpSound);
      handleAnswer('');
    }
    return () => clearInterval(timer);
  }, [timeLeft, timerActive]);

  useEffect(() => {
    if (progressRef.current) {
      const maxTime = getTimeForDifficulty(selectedDifficulty);
      const progress = (timeLeft / maxTime) * 100;
      progressRef.current.style.width = `${progress}%`;
    }
  }, [timeLeft, selectedDifficulty]);

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
          inactive: 'bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-dark-border dark:hover:bg-dark-border/80 dark:text-dark-text',
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
            inactive: 'bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-dark-border dark:hover:bg-dark-border/80 dark:text-dark-text',
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
            inactive: 'bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-dark-border dark:hover:bg-dark-border/80 dark:text-dark-text',
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
            inactive: 'bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-dark-border dark:hover:bg-dark-border/80 dark:text-dark-text',
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
      {!quizStarted ? (
        <div className={`${themeClasses.container} rounded-lg shadow-md p-6`}>
          <h2 className={`text-2xl font-bold mb-6 ${themeClasses.text}`}>
            Quiz Setup
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className={`block mb-2 ${themeClasses.text}`}>Difficulty Level:</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value as Difficulty)}
                className={`w-full p-3 border rounded-lg ${themeClasses.input} focus:ring-2 focus:ring-primary focus:border-primary`}
              >
                <option value="easy">Easy (45s, 10 questions)</option>
                <option value="medium">Medium (30s, 15 questions)</option>
                <option value="hard">Hard (20s, 20 questions)</option>
              </select>
            </div>

            <div>
              <label className={`block mb-2 ${themeClasses.text}`}>Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as Category)}
                className={`w-full p-3 border rounded-lg ${themeClasses.input} focus:ring-2 focus:ring-primary focus:border-primary`}
              >
                <option value="food">Food</option>
                <option value="animals">Animals</option>
                <option value="colors">Colors</option>
                <option value="numbers">Numbers</option>
                <option value="family">Family</option>
                <option value="weather">Weather</option>
                <option value="time">Time</option>
                <option value="all">All Categories</option>
              </select>
            </div>

            <div>
              <label className={`block mb-2 ${themeClasses.text}`}>Number of Questions:</label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className={`w-full p-3 border rounded-lg ${themeClasses.input} focus:ring-2 focus:ring-primary focus:border-primary`}
              >
                <option value="5">5 Questions</option>
                <option value="10">10 Questions</option>
                <option value="15">15 Questions</option>
                <option value="20">20 Questions</option>
              </select>
            </div>

            <button
              onClick={startQuiz}
              className={`w-full ${themeClasses.button.primary} py-3 rounded-lg transition-colors`}
            >
              Start Quiz
            </button>
          </div>
        </div>
      ) : quizComplete ? (
        <div className={`${themeClasses.container} rounded-lg shadow-md p-6`}>
          <h2 className={`text-2xl font-bold mb-6 ${themeClasses.text}`}>
            Quiz Complete!
          </h2>
          
          <div className="space-y-6">
            <div className={`text-center p-6 rounded-lg ${themeClasses.result.correct}`}>
              <div className="text-4xl mb-4">🎉</div>
              <div className="text-2xl font-bold mb-2">
                Final Score: {finalScore}/{questionCount}
              </div>
              <div className="text-xl mb-4">
                Accuracy: {Math.round((finalScore / questionCount) * 100)}%
              </div>
              {finalStreak > 0 && (
                <div className="text-lg text-yellow-500">
                  Best Streak: {finalStreak} 🔥
                </div>
              )}
              <div className="text-sm opacity-75 mt-4">
                Average Time: {Math.round(averageTime)}s per question
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={resetQuiz}
                className={`flex-1 ${themeClasses.button.secondary} py-3 rounded-lg transition-colors`}
              >
                ← Back to Setup
              </button>
              <button
                onClick={() => {
                  setQuizComplete(false);
                  startNewPractice();
                }}
                className={`flex-1 ${themeClasses.button.primary} py-3 rounded-lg transition-colors`}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <QuizModeSelector
            selectedMode={quizMode}
            onModeSelect={setQuizMode}
            availableModes={['multiple-choice', 'writing', 'flashcards']}
          />

          <div className={`mb-8 ${themeClasses.container} rounded-lg shadow-md p-6`}>
            <div className="flex flex-wrap gap-4 mb-6">
              <button
                onClick={resetQuiz}
                className={`p-3 rounded-lg transition-colors ${themeClasses.button.secondary}`}
              >
                ← Back to Setup
              </button>

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
              <div className={`text-lg font-semibold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : themeClasses.text}`}>
                Time: {timeLeft}s
              </div>
            </div>

            <div className="w-full h-2 bg-gray-200 dark:bg-dark-border rounded-full overflow-hidden">
              <div
                ref={progressRef}
                className={`h-full transition-all duration-1000 ${
                  timeLeft <= 10 ? 'bg-red-500' : 'bg-primary'
                }`}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {currentWord && (
            <div className={`${themeClasses.container} rounded-lg shadow-md p-6 transform transition-all duration-300 hover:shadow-lg`}>
              <div className="flex justify-between items-center mb-4">
                <div className={`text-3xl font-bold text-center mb-4 ${themeClasses.text}`}>
                  {currentWord.japanese}
                  <button
                    onClick={() => handlePlayAudio(currentWord.japanese, currentWord.id)}
                    className="ml-2 p-2 rounded-full hover:bg-opacity-10"
                    title="Play Audio"
                  >
                    🔊
                  </button>
                </div>
                {selectedDifficulty === 'easy' && currentWord.romaji && (
                  <div className={`text-xl text-center mb-4 ${themeClasses.text} opacity-75`}>
                    {currentWord.romaji}
                  </div>
                )}

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
                    <p>{currentWord.hint}</p>
                  </div>
                )}

                {quizMode === 'multiple-choice' && !showResult && (
                  <div className="grid grid-cols-1 gap-3">
                    {options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswer(option)}
                        className={`p-4 rounded-lg text-left transition-colors ${
                          themeClasses.button.inactive
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}

                {quizMode === 'writing' && !showResult && (
                  <form onSubmit={(e) => { e.preventDefault(); handleAnswer(userAnswer); }} className="space-y-4">
                    <input
                      ref={inputRef}
                      type="text"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Type the English translation"
                      className={`w-full p-3 border rounded-lg ${themeClasses.input} focus:ring-2 focus:ring-primary focus:border-primary`}
                      disabled={showResult}
                    />

                    <button
                      type="submit"
                      className={`w-full ${themeClasses.button.primary} py-3 rounded-lg transition-colors`}
                    >
                      Check Answer
                    </button>
                  </form>
                )}

                {showResult && (
                  <div className="space-y-4">
                    <div className={`text-center p-6 rounded-lg ${
                      isCorrect ? themeClasses.result.correct : themeClasses.result.incorrect
                    }`}>
                      <div className="text-2xl mb-2">
                        {isCorrect ? '🎉' : '💪'}
                      </div>
                      <div className="text-xl font-bold mb-2">
                        {isCorrect ? 'Correct!' : 'Incorrect'}
                      </div>
                      <div className="mb-2">
                        {feedbackMessage}
                      </div>
                      <div className="text-sm opacity-75">
                        {!isCorrect && `The correct answer is: ${currentWord.english}`}
                      </div>
                    </div>
                    <button
                      onClick={handleNext}
                      className={`w-full ${themeClasses.button.secondary} py-3 rounded-lg transition-colors flex items-center justify-center gap-2`}
                    >
                      <span>Next Question</span>
                      <span>→</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WordPractice; 