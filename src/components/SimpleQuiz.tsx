import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DictionaryItem } from '../types/dictionary';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

interface SimpleQuizProps {
  words: DictionaryItem[];
  onComplete?: (results: QuizResults) => void;
  onCancel?: () => void;
}

interface QuizResults {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  timeSpent: number;
  completedAt: Date;
}

interface QuizState {
  currentQuestionIndex: number;
  selectedAnswer: string | null;
  showFeedback: boolean;
  isCorrect: boolean | null;
  score: number;
  startTime: Date | null;
  endTime: Date | null;
}

const SimpleQuiz: React.FC<SimpleQuizProps> = ({ words, onComplete, onCancel }) => {
  const { theme } = useTheme();
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    selectedAnswer: null,
    showFeedback: false,
    isCorrect: null,
    score: 0,
    startTime: null,
    endTime: null
  });

  // Memoize shuffled words to prevent re-shuffling on every render
  const shuffledWords = useMemo(() => {
    return [...words]
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(words.length, 10));
  }, [words]);

  // Memoize options for current question to prevent re-generation
  const options = useMemo(() => {
    if (shuffledWords.length === 0 || quizState.currentQuestionIndex >= shuffledWords.length) {
      return [];
    }

    const currentWord = shuffledWords[quizState.currentQuestionIndex];
    const otherWords = shuffledWords.filter(w => w !== currentWord);
    const randomOptions = otherWords
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(w => w.english);
    
    // Add correct answer and shuffle
    return [...randomOptions, currentWord.english]
      .sort(() => Math.random() - 0.5);
  }, [shuffledWords, quizState.currentQuestionIndex]);

  // Initialize quiz
  useEffect(() => {
    if (shuffledWords.length > 0) {
      setQuizState(prev => ({ ...prev, startTime: new Date() }));
    }
  }, [shuffledWords]);

  const handleAnswerSelect = useCallback((answer: string) => {
    if (quizState.showFeedback) return; // Prevent multiple selections

    const currentWord = shuffledWords[quizState.currentQuestionIndex];
    const isCorrect = answer === currentWord.english;

    setQuizState(prev => ({
      ...prev,
      selectedAnswer: answer,
      showFeedback: true,
      isCorrect,
      score: isCorrect ? prev.score + 1 : prev.score
    }));

    // Move to next question after delay
    const timer = setTimeout(() => {
      if (quizState.currentQuestionIndex < shuffledWords.length - 1) {
        setQuizState(prev => ({
          ...prev,
          currentQuestionIndex: prev.currentQuestionIndex + 1,
          selectedAnswer: null,
          showFeedback: false,
          isCorrect: null
        }));
      } else {
        // Quiz completed
        const endTime = new Date();
        setQuizState(prev => ({ ...prev, endTime }));
        
        if (onComplete && prev.startTime) {
          onComplete({
            score: prev.score,
            totalQuestions: shuffledWords.length,
            correctAnswers: prev.score,
            incorrectAnswers: shuffledWords.length - prev.score,
            timeSpent: (endTime.getTime() - prev.startTime.getTime()) / 1000,
            completedAt: endTime
          });
        }
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [quizState.currentQuestionIndex, quizState.showFeedback, shuffledWords, onComplete]);

  if (shuffledWords.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg">Loading quiz...</p>
        </div>
      </div>
    );
  }

  const currentWord = shuffledWords[quizState.currentQuestionIndex];
  const progress = ((quizState.currentQuestionIndex + 1) / shuffledWords.length) * 100;

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Header with progress and cancel button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
            <div 
              className="bg-japanese-red h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-sm text-text-muted dark:text-text-dark-muted">
            Question {quizState.currentQuestionIndex + 1} of {shuffledWords.length}
          </div>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="ml-4 px-4 py-2 text-text-muted dark:text-text-dark-muted hover:text-text-secondary dark:text-text-dark-secondary dark:text-gray-400 dark:hover:text-text-secondary dark:text-text-dark-secondary transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Question card with stable animations */}
      <motion.div
        key={`question-${quizState.currentQuestionIndex}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-white dark:bg-dark-elevated dark:bg-gray-800 rounded-nav shadow-lg p-6 mb-6"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">
          {currentWord.japanese}
          {currentWord.hiragana && (
            <span className="text-lg text-text-secondary dark:text-text-dark-secondary dark:text-text-secondary dark:text-text-dark-secondary ml-2">
              ({currentWord.hiragana})
            </span>
          )}
        </h2>

        {/* Answer options */}
        <div className="grid gap-3">
          {options.map((option, index) => (
            <motion.button
              key={`option-${quizState.currentQuestionIndex}-${index}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.1 }}
              className={`p-4 rounded-nav text-left transition-colors duration-200 font-medium ${
                quizState.selectedAnswer === option
                  ? quizState.isCorrect
                    ? 'bg-green-600 text-text-primary dark:text-text-dark-primary border-2 border-green-700'
                    : 'bg-red-600 text-text-primary dark:text-text-dark-primary border-2 border-red-700'
                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 border-2 border-transparent text-text-primary dark:text-text-dark-primary dark:text-text-primary dark:text-text-dark-primary'
              }`}
              onClick={() => !quizState.showFeedback && handleAnswerSelect(option)}
              disabled={quizState.showFeedback}
            >
              {option}
            </motion.button>
          ))}
        </div>

        {/* Feedback with stable animation */}
        <AnimatePresence mode="wait">
          {quizState.showFeedback && (
            <motion.div
              key={`feedback-${quizState.currentQuestionIndex}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`mt-4 p-4 rounded-nav text-center font-semibold ${
                quizState.isCorrect
                  ? 'bg-green-600 dark:bg-green-900 text-text-primary dark:text-text-dark-primary dark:text-green-200'
                  : 'bg-red-600 dark:bg-red-900 text-text-primary dark:text-text-dark-primary dark:text-red-200'
              }`}
            >
              {quizState.isCorrect ? '✓ Correct!' : '✗ Incorrect!'}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Score display */}
      <div className="text-center text-lg font-semibold">
        Score: {quizState.score} / {quizState.currentQuestionIndex + 1}
      </div>
    </div>
  );
};

export default SimpleQuiz; 