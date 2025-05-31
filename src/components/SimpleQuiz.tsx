import React, { useState, useEffect, useCallback } from 'react';
import { DictionaryItem } from '../types/dictionary';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

interface SimpleQuizProps {
  words: DictionaryItem[];
  onComplete?: (results: QuizResults) => void;
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

const SimpleQuiz: React.FC<SimpleQuizProps> = ({ words, onComplete }) => {
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

  const [shuffledWords, setShuffledWords] = useState<DictionaryItem[]>([]);
  const [options, setOptions] = useState<string[]>([]);

  // Initialize quiz
  useEffect(() => {
    // Shuffle words and take first 10
    const shuffled = [...words]
      .sort(() => Math.random() - 0.5)
      .slice(0, 10);
    setShuffledWords(shuffled);
    setQuizState(prev => ({ ...prev, startTime: new Date() }));
  }, [words]);

  // Generate options for current question
  useEffect(() => {
    if (shuffledWords.length === 0) return;

    const currentWord = shuffledWords[quizState.currentQuestionIndex];
    const otherWords = shuffledWords.filter(w => w !== currentWord);
    const randomOptions = otherWords
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(w => w.english);
    
    // Add correct answer and shuffle
    const allOptions = [...randomOptions, currentWord.english]
      .sort(() => Math.random() - 0.5);
    
    setOptions(allOptions);
  }, [quizState.currentQuestionIndex, shuffledWords]);

  const handleAnswerSelect = useCallback((answer: string) => {
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
    setTimeout(() => {
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
  }, [quizState.currentQuestionIndex, shuffledWords, onComplete]);

  if (shuffledWords.length === 0) {
    return <div className="text-center p-4">Loading quiz...</div>;
  }

  const currentWord = shuffledWords[quizState.currentQuestionIndex];
  const progress = ((quizState.currentQuestionIndex + 1) / shuffledWords.length) * 100;

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question counter */}
      <div className="text-sm text-gray-600 mb-4">
        Question {quizState.currentQuestionIndex + 1} of {shuffledWords.length}
      </div>

      {/* Question card */}
      <motion.div
        key={quizState.currentQuestionIndex}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">
          {currentWord.japanese}
          {currentWord.hiragana && (
            <span className="text-lg text-gray-600 dark:text-gray-400 ml-2">
              ({currentWord.hiragana})
            </span>
          )}
        </h2>

        {/* Answer options */}
        <div className="grid gap-3">
          {options.map((option, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-4 rounded-lg text-left transition-colors ${
                quizState.selectedAnswer === option
                  ? quizState.isCorrect
                    ? 'bg-green-100 dark:bg-green-900'
                    : 'bg-red-100 dark:bg-red-900'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              onClick={() => !quizState.showFeedback && handleAnswerSelect(option)}
              disabled={quizState.showFeedback}
            >
              {option}
            </motion.button>
          ))}
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {quizState.showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mt-4 p-4 rounded-lg text-center ${
                quizState.isCorrect
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                  : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
              }`}
            >
              {quizState.isCorrect ? 'Correct!' : 'Incorrect!'}
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