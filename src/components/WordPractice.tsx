import React, { useState, useEffect, useRef, useCallback } from 'react';
import { QuizWord, Difficulty, Category, quizWords } from '../data/quizData';
import { useTheme } from '../context/ThemeContext';
import { useProgress } from '../context/ProgressContext';
import { checkAnswer, calculateScore, calculateAverageTime } from '../utils/quizUtils';
import QuizModeSelector, { QuizMode } from './QuizModeSelector';
import { Chip } from '@mui/material';
import { playAudio, playDynamicAudio } from '../utils/audio';
import { useSound } from '../context/SoundContext';

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

// Add Fisher-Yates shuffle algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Add function to get random subset without replacement
const getRandomSubset = <T,>(array: T[], count: number): T[] => {
  if (count >= array.length) return shuffleArray(array);
  const shuffled = shuffleArray(array);
  return shuffled.slice(0, count);
};

const WordPractice: React.FC = () => {
  const { theme, getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  const { playSound } = useSound();
  const { updateProgress } = useProgress();
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

  const getFilteredWords = () => {
    return quizWords.filter(word => {
      const matchesDifficulty = word.difficulty === selectedDifficulty;
      const matchesCategory = selectedCategory === 'all' || word.category === selectedCategory;
      return matchesDifficulty && matchesCategory;
    });
  };

  const getRandomWord = useCallback(() => {
    // Filter out words that have been used recently
    const availableWords = getFilteredWords().filter(word => !usedWords.has(word.japanese));
    
    // If all words have been used, reset the used words set
    if (availableWords.length === 0) {
      setUsedWords(new Set());
      return getFilteredWords()[Math.floor(Math.random() * getFilteredWords().length)];
    }
    
    // Use improved randomization
    return getRandomSubset(availableWords, 1)[0];
  }, [usedWords]);

  const generateOptions = useCallback((word: typeof quizWords[0]) => {
    // Get other words in the same category
    const otherWords = getFilteredWords().filter(w => 
      w.category === word.category && 
      w.japanese !== word.japanese
    );
    
    // Use improved randomization for options
    const selectedOptions = getRandomSubset(otherWords, 3).map(w => w.english);
    return shuffleArray([...selectedOptions, word.english]);
  }, []);

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
    
    // Generate initial set of questions
    const initialQuestions = getRandomSubset(getFilteredWords(), 10);
    setQuestions(initialQuestions);
    
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

  const handleNextQuestion = useCallback(() => {
    if (!currentWord) return;

    // Add current word to used words
    setUsedWords(prev => new Set([...prev, currentWord.japanese]));

    // Get next word using improved randomization
    const nextWord = getRandomWord();
    setCurrentWord(nextWord);
    setOptions(generateOptions(nextWord));
    setTimeLeft(getTimeForDifficulty(selectedDifficulty));
    setShowHint(false);
    setUserAnswer('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentWord, getRandomWord, generateOptions, selectedDifficulty]);

  const handlePlayAudio = (japanese: string) => {
    playAudio(japanese);
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

  return (
    <div className={`min-h-screen ${themeClasses.container}`}>
      <div className="container mx-auto px-4 py-8">
        <div className={`max-w-2xl mx-auto ${themeClasses.card}`}>
          <h2 className={`text-2xl font-bold mb-4 ${themeClasses.text.primary} ${theme === 'dark' ? 'neon-glow' : ''}`}>
            Word Practice
          </h2>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-xl ${themeClasses.card} border ${themeClasses.border}`}>
                <h3 className={`text-lg font-semibold mb-4 ${themeClasses.text.primary} ${theme === 'dark' ? 'neon-glow' : ''}`}>
                  Practice Mode
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      value="japanese-to-english"
                      checked={quizMode === 'japanese-to-english'}
                      onChange={(e) => setQuizMode('japanese-to-english')}
                      className={`form-radio h-5 w-5 ${themeClasses.radio}`}
                    />
                    <span className={themeClasses.text.primary}>Japanese → English</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      value="english-to-japanese"
                      checked={quizMode === 'english-to-japanese'}
                      onChange={(e) => setQuizMode('english-to-japanese')}
                      className={`form-radio h-5 w-5 ${themeClasses.radio}`}
                    />
                    <span className={themeClasses.text.primary}>English → Japanese</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      value="listening"
                      checked={quizMode === 'listening'}
                      onChange={(e) => setQuizMode('listening')}
                      className={`form-radio h-5 w-5 ${themeClasses.radio}`}
                    />
                    <span className={themeClasses.text.primary}>Listening Practice</span>
                  </label>
                </div>
              </div>

              <div className={`p-6 rounded-xl ${themeClasses.card} border ${themeClasses.border}`}>
                <h3 className={`text-lg font-semibold mb-4 ${themeClasses.text.primary} ${theme === 'dark' ? 'neon-glow' : ''}`}>
                  Difficulty
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      value="easy"
                      checked={selectedDifficulty === 'easy'}
                      onChange={(e) => setSelectedDifficulty('easy')}
                      className={`form-radio h-5 w-5 ${themeClasses.radio}`}
                    />
                    <span className={themeClasses.text.primary}>Easy (Basic Words)</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      value="medium"
                      checked={selectedDifficulty === 'medium'}
                      onChange={(e) => setSelectedDifficulty('medium')}
                      className={`form-radio h-5 w-5 ${themeClasses.radio}`}
                    />
                    <span className={themeClasses.text.primary}>Medium (Common Phrases)</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      value="hard"
                      checked={selectedDifficulty === 'hard'}
                      onChange={(e) => setSelectedDifficulty('hard')}
                      className={`form-radio h-5 w-5 ${themeClasses.radio}`}
                    />
                    <span className={themeClasses.text.primary}>Hard (Sentences)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className={`${themeClasses.card} border ${themeClasses.border} p-6 rounded-xl ${theme === 'dark' ? 'shadow-[0_0_20px_rgba(0,149,255,0.2)]' : ''}`}>
              <div className="mb-6">
                <h2 className={`text-3xl font-bold mb-4 ${themeClasses.text.primary} ${theme === 'dark' ? 'neon-glow' : ''}`}>
                  {currentWord?.japanese || ''}
                </h2>
                {quizMode === 'listening' && (
                  <button
                    onClick={() => handlePlayAudio(currentWord?.japanese || '')}
                    className={`p-3 rounded-lg ${themeClasses.button.secondary} transition-all duration-300 ${
                      theme === 'dark' ? 'hover:shadow-[0_0_10px_rgba(0,149,255,0.4)]' : ''
                    }`}
                  >
                    🔊 Play Audio
                  </button>
                )}
              </div>

              <div className="mb-6">
                <input
                  ref={inputRef}
                  type={quizMode === 'japanese-to-english' ? 'text' : quizMode === 'english-to-japanese' ? 'text' : 'text'}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder={
                    quizMode === 'japanese-to-english' ? 'Enter English translation...' :
                    quizMode === 'english-to-japanese' ? 'Enter Japanese translation...' :
                    'Enter what you hear...'
                  }
                  className={`w-full p-4 rounded-lg ${themeClasses.input}`}
                  disabled={showResult}
                />
              </div>

              <div className="flex flex-wrap gap-4 justify-center">
                <button
                  onClick={handleAnswer}
                  className={themeClasses.button.primary}
                  disabled={!userAnswer.trim()}
                >
                  Check Answer
                </button>
                <button
                  onClick={() => setShowHint(!showHint)}
                  className={themeClasses.button.secondary}
                >
                  {showHint ? 'Hide Hint' : 'Show Hint'}
                </button>
              </div>

              {showResult && (
                <div className={`mt-6 p-4 rounded-lg ${
                  isCorrect 
                    ? theme === 'dark' 
                      ? 'bg-neon-blue/20 border-neon-blue/30' 
                      : 'bg-green-100 border-green-200'
                    : theme === 'dark' 
                      ? 'bg-neon-pink/20 border-neon-pink/30' 
                      : 'bg-red-100 border-red-200'
                } border`}>
                  <div className={`text-lg font-medium mb-2 ${
                    isCorrect 
                      ? theme === 'dark' 
                        ? 'text-neon-blue' 
                        : 'text-green-800'
                      : theme === 'dark' 
                        ? 'text-neon-pink' 
                        : 'text-red-800'
                  }`}>
                    {isCorrect ? 'Correct!' : 'Incorrect!'}
                  </div>
                  {!isCorrect && currentWord && (
                    <div className={`${themeClasses.text.secondary} mb-2`}>
                      Correct Answer: {currentWord.english}
                    </div>
                  )}
                </div>
              )}

              {showHint && currentWord && (
                <div className={`mt-6 p-4 rounded-lg ${themeClasses.card}`}>
                  <h3 className={`text-lg font-semibold mb-2 ${themeClasses.text.primary}`}>
                    Hint
                  </h3>
                  <p className={themeClasses.text.secondary}>
                    {currentWord.hint || 'Try to remember the context where this word is commonly used.'}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className={`text-lg font-semibold mb-2 ${themeClasses.text.primary}`}>
                    Progress
                  </h3>
                  <div className={`grid grid-cols-2 gap-4 ${themeClasses.text.secondary}`}>
                    <div>
                      <div className="text-sm opacity-75">Score</div>
                      <div className="text-xl font-bold">{score}</div>
                    </div>
                    <div>
                      <div className="text-sm opacity-75">Attempts</div>
                      <div className="text-xl font-bold">{totalQuestions}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordPractice; 