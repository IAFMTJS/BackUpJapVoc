import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import safeLocalStorage from '../utils/safeLocalStorage';

export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'fill-blank' | 'matching' | 'true-false';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

export interface QuizSession {
  id: string;
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  answers: Record<string, string | string[]>;
  score: number;
  totalQuestions: number;
  startTime: Date;
  endTime?: Date;
  completed: boolean;
}

export interface QuizStats {
  totalQuizzes: number;
  totalQuestions: number;
  correctAnswers: number;
  averageScore: number;
  bestScore: number;
  totalTime: number;
  categories: Record<string, {
    questions: number;
    correct: number;
    averageScore: number;
  }>;
}

interface QuizContextType {
  currentSession: QuizSession | null;
  stats: QuizStats;
  isLoading: boolean;
  error: string | null;
  startQuiz: (questions: QuizQuestion[]) => void;
  answerQuestion: (questionId: string, answer: string | string[]) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  finishQuiz: () => void;
  resetQuiz: () => void;
  updateStats: (session: QuizSession) => void;
  getQuizHistory: () => QuizSession[];
}

const defaultStats: QuizStats = {
  totalQuizzes: 0,
  totalQuestions: 0,
  correctAnswers: 0,
  averageScore: 0,
  bestScore: 0,
  totalTime: 0,
  categories: {},
};

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentSession, setCurrentSession] = useState<QuizSession | null>(null);
  const [stats, setStats] = useState<QuizStats>(defaultStats);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load stats from localStorage on mount
  useEffect(() => {
    try {
      const savedStats = safeLocalStorage.getItem('quizStats');
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }
    } catch (error) {
      console.error('Error loading quiz stats:', error);
    }
  }, []);

  // Save stats to localStorage whenever they change
  useEffect(() => {
    try {
      safeLocalStorage.setItem('quizStats', JSON.stringify(stats));
    } catch (error) {
      console.error('Error saving quiz stats:', error);
    }
  }, [stats]);

  const startQuiz = (questions: QuizQuestion[]) => {
    const session: QuizSession = {
      id: Date.now().toString(),
      questions,
      currentQuestionIndex: 0,
      answers: {},
      score: 0,
      totalQuestions: questions.length,
      startTime: new Date(),
      completed: false,
    };
    setCurrentSession(session);
  };

  const answerQuestion = (questionId: string, answer: string | string[]) => {
    if (!currentSession) return;

    setCurrentSession(prev => {
      if (!prev) return prev;
      
      const question = prev.questions.find(q => q.id === questionId);
      if (!question) return prev;

      const isCorrect = Array.isArray(question.correctAnswer)
        ? JSON.stringify(answer.sort()) === JSON.stringify(question.correctAnswer.sort())
        : answer === question.correctAnswer;

      const newScore = isCorrect ? prev.score + 1 : prev.score;
      
      return {
        ...prev,
        answers: { ...prev.answers, [questionId]: answer },
        score: newScore,
      };
    });
  };

  const nextQuestion = () => {
    if (!currentSession) return;
    
    setCurrentSession(prev => {
      if (!prev) return prev;
      const nextIndex = Math.min(prev.currentQuestionIndex + 1, prev.questions.length - 1);
      return { ...prev, currentQuestionIndex: nextIndex };
    });
  };

  const previousQuestion = () => {
    if (!currentSession) return;
    
    setCurrentSession(prev => {
      if (!prev) return prev;
      const prevIndex = Math.max(prev.currentQuestionIndex - 1, 0);
      return { ...prev, currentQuestionIndex: prevIndex };
    });
  };

  const finishQuiz = () => {
    if (!currentSession) return;
    
    const completedSession: QuizSession = {
      ...currentSession,
      endTime: new Date(),
      completed: true,
    };
    
    updateStats(completedSession);
    setCurrentSession(null);
  };

  const resetQuiz = () => {
    setCurrentSession(null);
  };

  const updateStats = (session: QuizSession) => {
    if (!session.completed || !session.endTime) return;

    const timeSpent = session.endTime.getTime() - session.startTime.getTime();
    const scorePercentage = (session.score / session.totalQuestions) * 100;

    setStats(prev => {
      const newTotalQuizzes = prev.totalQuizzes + 1;
      const newTotalQuestions = prev.totalQuestions + session.totalQuestions;
      const newCorrectAnswers = prev.correctAnswers + session.score;
      const newTotalTime = prev.totalTime + timeSpent;
      const newAverageScore = newCorrectAnswers / newTotalQuestions * 100;
      const newBestScore = Math.max(prev.bestScore, scorePercentage);

      // Update category stats
      const newCategories = { ...prev.categories };
      session.questions.forEach(question => {
        if (!newCategories[question.category]) {
          newCategories[question.category] = { questions: 0, correct: 0, averageScore: 0 };
        }
        newCategories[question.category].questions += 1;
        
        const isCorrect = Array.isArray(question.correctAnswer)
          ? JSON.stringify(session.answers[question.id] || []).sort() === JSON.stringify(question.correctAnswer.sort())
          : session.answers[question.id] === question.correctAnswer;
        
        if (isCorrect) {
          newCategories[question.category].correct += 1;
        }
        
        newCategories[question.category].averageScore = 
          (newCategories[question.category].correct / newCategories[question.category].questions) * 100;
      });

      return {
        totalQuizzes: newTotalQuizzes,
        totalQuestions: newTotalQuestions,
        correctAnswers: newCorrectAnswers,
        averageScore: newAverageScore,
        bestScore: newBestScore,
        totalTime: newTotalTime,
        categories: newCategories,
      };
    });
  };

  const getQuizHistory = (): QuizSession[] => {
    try {
      const savedHistory = safeLocalStorage.getItem('quizHistory');
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (error) {
      console.error('Error loading quiz history:', error);
      return [];
    }
  };

  return (
    <QuizContext.Provider
      value={{
        currentSession,
        stats,
        isLoading,
        error,
        startQuiz,
        answerQuestion,
        nextQuestion,
        previousQuestion,
        finishQuiz,
        resetQuiz,
        updateStats,
        getQuizHistory,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = (): QuizContextType => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
}; 