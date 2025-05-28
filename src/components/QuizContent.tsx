import React from 'react';
import { motion } from 'framer-motion';
import { QuizState, QuizSettings, WordComparison, PronunciationPractice } from '../types/quiz';

interface QuizContentProps {
  quizState: QuizState;
  settings: QuizSettings;
  themeClasses: {
    container: string;
    button: string;
    input: string;
    text: string;
    heading: string;
    card: string;
    correct: string;
    incorrect: string;
    neutral: string;
  };
  isDarkMode: boolean;
  learnModeWords: any[];
  onStartQuiz: () => void;
  onAnswerSelect: (answer: string) => void;
  onNextQuestion: () => void;
  onFinishQuiz: () => void;
  onMarkForReview: (questionIndex: number) => void;
  onSkipQuestion: (questionIndex: number) => void;
  onRetryQuestion: (questionIndex: number) => void;
  onToggleExamples: () => void;
  onUpdateLearnProgress: (progress: number) => void;
  onUpdateComparison: (comparison: WordComparison | null) => void;
  onUpdatePronunciationPractice: (practice: PronunciationPractice | null) => void;
}

const QuizContent: React.FC<QuizContentProps> = ({
  quizState,
  settings,
  themeClasses,
  isDarkMode,
  learnModeWords,
  onStartQuiz,
  onAnswerSelect,
  onNextQuestion,
  onFinishQuiz,
  onMarkForReview,
  onSkipQuestion,
  onRetryQuestion,
  onToggleExamples,
  onUpdateLearnProgress,
  onUpdateComparison,
  onUpdatePronunciationPractice
}) => {
  const renderQuizSetup = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto p-6"
    >
      {/* ... existing renderQuizSetup content ... */}
    </motion.div>
  );

  const renderLearnMode = () => {
    if (!quizState.currentWord) return null;
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-2xl mx-auto p-6"
      >
        {/* ... existing renderLearnMode content ... */}
      </motion.div>
    );
  };

  const renderPronunciationPractice = () => {
    if (!quizState.currentWord) return null;
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-2xl mx-auto p-6"
      >
        {/* ... existing renderPronunciationPractice content ... */}
      </motion.div>
    );
  };

  const renderComparisonMode = () => {
    if (!quizState.currentWord || !quizState.currentComparison) return null;
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-2xl mx-auto p-6"
      >
        {/* ... existing renderComparisonMode content ... */}
      </motion.div>
    );
  };

  const renderQuizContent = () => {
    if (!quizState.currentWord) return null;
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-2xl mx-auto p-6"
      >
        {/* ... existing renderQuizContent content ... */}
      </motion.div>
    );
  };

  const renderResult = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-2xl mx-auto p-6"
      >
        {/* ... existing renderResult content ... */}
      </motion.div>
    );
  };

  return (
    <div>
      {quizState.mode === 'setup' && renderQuizSetup()}
      {quizState.mode === 'learn' && renderLearnMode()}
      {quizState.mode === 'pronunciation' && renderPronunciationPractice()}
      {quizState.mode === 'comparison' && renderComparisonMode()}
      {quizState.mode === 'quiz' && renderQuizContent()}
      {quizState.mode === 'result' && renderResult()}
    </div>
  );
};

export default QuizContent; 