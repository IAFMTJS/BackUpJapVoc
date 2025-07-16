import React, { useState, useCallback, useEffect, useRef, TouchEvent, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useProgress } from '../context/ProgressContext';
import { useAchievements } from '../context/AchievementContext';
import { useAudio } from '../context/AudioContext';
import { Kanji, kanjiList } from '../data/kanjiData';
import { playAudio, playDynamicAudio } from '../utils/audio';
import { analyzeStroke, validateStroke, calculateStrokeOrderScore } from '../utils/strokeValidation';
import { generatePracticeSets, generateWordExercises, calculatePracticeScore, DIFFICULTY_LEVELS } from '../utils/compoundWordPractice';
import { Point, StrokeData, StrokeFeedback, CompoundWordData, KanjiStrokeData } from '../types/stroke';
import { Box, Button, Card, CardContent, Typography, Tabs, Tab, Grid, Paper, List, ListItem, ListItemText, CircularProgress, Tooltip, IconButton, TextField } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Brush, School, Translate, Info, Help, Check, Close, Replay, Timer, EmojiEvents, VolumeUp, Undo, Redo } from '@mui/icons-material';

type QuizMode = 'stroke' | 'compound' | 'meaning' | 'reading';
type QuizDifficulty = 'easy' | 'medium' | 'hard' | 'all';

// Add new question types
type QuestionType = 'multiple-choice' | 'fill-in-blank' | 'matching' | 'context';

interface Question {
  type: QuestionType;
  question: string;
  correctAnswer: string;
  options?: string[];
  context?: string;
  hint?: string;
  audioUrl?: string;
}

interface QuizState {
  mode: 'setup' | 'quiz' | 'result' | 'review';
  currentQuestion: string;
  correctAnswer: string;
  selectedAnswer: string | null;
  options?: string[];
  userInput: string;
  context?: string;
  hint?: string;
  showFeedback: boolean;
  isCorrect: boolean | null;
  strokes: StrokeData[];
  currentStroke: Point[];
  compoundWordProgress: { [word: string]: { attempts: number; successes: number } };
  questions: Kanji[];
}

interface QuizSettings {
  mode: QuizMode;
  difficulty: QuizDifficulty;
  questionCount: number;
  useTimer: boolean;
  timeLimit: number;
  showHints: boolean;
  requireStrokeOrder: boolean;
}

interface StrokeValidationResult {
  isCorrect: boolean;
  accuracy: number;
  feedback: string[];
  suggestions: string[];
  expectedStroke: StrokeData;
  actualStroke: StrokeData;
}

interface CompoundWordExercise {
  type: 'reading' | 'meaning' | 'usage' | 'writing';
  question: string;
  answer: string;
  options?: string[];
  hints?: string[];
  context?: string;
  difficulty: number;
  relatedWords?: string[];
}

interface KanjiQuizProps {
  kanji: Kanji[];
  difficulty: 'easy' | 'medium' | 'hard';
}

// Update quiz settings to match the difficulty levels
const QUIZ_SETTINGS: Record<'easy' | 'medium' | 'hard', QuizSettings> = {
  easy: {
    mode: 'meaning',
    difficulty: 'easy',
    questionCount: 10,
    useTimer: true,
    timeLimit: 45,
    showHints: true,
    requireStrokeOrder: false
  },
  medium: {
    mode: 'reading',
    difficulty: 'medium',
    questionCount: 15,
    useTimer: true,
    timeLimit: 30,
    showHints: true,
    requireStrokeOrder: false
  },
  hard: {
    mode: 'compound',
    difficulty: 'hard',
    questionCount: 20,
    useTimer: true,
    timeLimit: 20,
    showHints: false,
    requireStrokeOrder: true
  }
};

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

const KanjiQuiz: React.FC<KanjiQuizProps> = ({ kanji, difficulty }) => {
  const { getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  const { settings } = useApp();
  const progressContext = useProgress();
  const { updateProgress, progress, updateWordProgress } = progressContext || {};
  const { checkAchievements } = useAchievements();
  const { playAudio } = useAudio();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [quizState, setQuizState] = useState<QuizState>({
    mode: 'setup',
    currentQuestion: '',
    correctAnswer: '',
    selectedAnswer: null,
    options: [],
    userInput: '',
    context: undefined,
    hint: undefined,
    showFeedback: false,
    isCorrect: null,
    strokes: [],
    currentStroke: [],
    compoundWordProgress: {},
    questions: []
  });
  const [quizSettings, setQuizSettings] = useState<QuizSettings>(QUIZ_SETTINGS.medium);
  const [currentKanji, setCurrentKanji] = useState<Kanji | null>(null);
  const [compoundWords, setCompoundWords] = useState<CompoundWordData[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showStrokeGuide, setShowStrokeGuide] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [strokeValidationResult, setStrokeValidationResult] = useState<StrokeFeedback | null>(null);
  const [strokeGuideOpacity, setStrokeGuideOpacity] = useState(0.3);
  const [currentExercise, setCurrentExercise] = useState<CompoundWordData | null>(null);
  const [exerciseHistory, setExerciseHistory] = useState<CompoundWordData[]>([]);
  const [learningContext, setLearningContext] = useState<string[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const strokeHistory = useRef<StrokeData[][]>([]);
  const historyIndex = useRef(-1);
  const [showContext, setShowContext] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [questionType, setQuestionType] = useState<QuestionType>('multiple-choice');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizStartTime, setQuizStartTime] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      // Clear any active timers
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Clear stroke history
      strokeHistory.current = [];
      historyIndex.current = -1;
    };
  }, []);

  // Initialize canvas for stroke input
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Set up canvas styles
    ctx.strokeStyle = themeClasses.text.primary;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [themeClasses]);

  // Timer effect - OPTIMIZED
  useEffect(() => {
    if (quizState.mode === 'quiz' && quizSettings.useTimer && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Time's up - handle quiz completion
            handleQuizComplete(score);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      timerRef.current = timer;
      
      return () => {
        clearInterval(timer);
        timerRef.current = null;
      };
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [quizState.mode, quizSettings.useTimer, timeLeft, score]);

  // Handle stroke input - OPTIMIZED
  const handleStrokeStart = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      timestamp: Date.now()
    };

    setQuizState(prev => ({
      ...prev,
      currentStroke: [point]
    }));

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  }, []);

  const handleStrokeMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      timestamp: Date.now()
    };

    setQuizState(prev => {
      if (prev.currentStroke.length === 0) return prev;
      return {
        ...prev,
        currentStroke: [...prev.currentStroke, point]
      };
    });

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  }, []);

  const handleStrokeEnd = useCallback(() => {
    setQuizState(prev => {
      if (prev.currentStroke.length < 2) return prev;

      const strokeData = analyzeStroke(prev.currentStroke);
      const newStrokes = [...prev.strokes, strokeData];
      
      // Update history
      historyIndex.current++;
      strokeHistory.current = strokeHistory.current.slice(0, historyIndex.current);
      strokeHistory.current.push(newStrokes);
      setCanUndo(true);
      setCanRedo(false);

      // Validate stroke
      if (quizSettings.mode === 'stroke' && currentKanji) {
        const expectedStroke = currentKanji.strokes[prev.strokes.length];
        const validationResult = validateStrokeEnhanced(strokeData, expectedStroke);
        setStrokeValidationResult(validationResult);
        
        if (validationResult.isCorrect) {
          setStreak(streak => streak + 1);
          setStrokeGuideOpacity(opacity => Math.max(0.1, opacity - 0.05));
        } else {
          setStrokeGuideOpacity(opacity => Math.min(0.5, opacity + 0.1));
        }
      }

      return {
        ...prev,
        strokes: newStrokes,
        currentStroke: []
      };
    });
  }, [quizSettings.mode, currentKanji]);

  // Add touch support
  const handleTouchStart = (e: TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const point = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
      timestamp: Date.now()
    };

    handleStrokeStart({ clientX: touch.clientX, clientY: touch.clientY } as React.MouseEvent<HTMLCanvasElement>);
  };

  const handleTouchMove = (e: TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleStrokeMove({ clientX: touch.clientX, clientY: touch.clientY } as React.MouseEvent<HTMLCanvasElement>);
  };

  const handleTouchEnd = (e: TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    handleStrokeEnd();
  };

  // Add undo/redo functionality
  const handleUndo = () => {
    if (historyIndex.current > 0) {
      historyIndex.current--;
      const previousStrokes = strokeHistory.current[historyIndex.current];
      setQuizState(prev => ({ ...prev, strokes: previousStrokes }));
      setCanUndo(historyIndex.current > 0);
      setCanRedo(true);
      redrawCanvas(previousStrokes);
    }
  };

  const handleRedo = () => {
    if (historyIndex.current < strokeHistory.current.length - 1) {
      historyIndex.current++;
      const nextStrokes = strokeHistory.current[historyIndex.current];
      setQuizState(prev => ({ ...prev, strokes: nextStrokes }));
      setCanUndo(true);
      setCanRedo(historyIndex.current < strokeHistory.current.length - 1);
      redrawCanvas(nextStrokes);
    }
  };

  const redrawCanvas = useCallback((strokes: StrokeData[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas styles
    ctx.strokeStyle = themeClasses.text.primary;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Draw strokes
    ctx.beginPath();
    strokes.forEach(stroke => {
      if (stroke.points.length > 0) {
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        stroke.points.forEach(point => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
      }
    });
  }, [themeClasses.text.primary]);

  // Helper function to generate compound word exercises
  const generateCompoundExercise = useCallback((word: CompoundWordData, difficulty: number) => {
    const exerciseType = Math.random() < 0.5 ? 'reading' : 'meaning';
    const options = exerciseType === 'reading' 
      ? generateReadingOptions(word, difficulty)
      : generateMeaningOptions(word, difficulty);

    // Generate context based on difficulty
    let context = '';
    if (difficulty <= 2) {
      // Easy: Simple sentence with the word
      context = `この${word.word}は${word.meaning}です。`;
    } else if (difficulty <= 4) {
      // Medium: More complex sentence with additional context
      const relatedWords = word.relatedWords?.slice(0, 2) || [];
      context = `${word.word}は${relatedWords.map(w => w.word).join('や')}などと${word.meaning}を表します。`;
    } else {
      // Hard: Complex sentence with multiple related words
      const relatedWords = word.relatedWords?.slice(0, 3) || [];
      const example = word.examples?.[0] || '';
      context = example || `${word.word}は${relatedWords.map(w => w.word).join('、')}などの${word.meaning}に関連する言葉です。`;
    }

    return {
      type: exerciseType,
      question: exerciseType === 'reading' ? word.word : word.meaning,
      correctAnswer: exerciseType === 'reading' ? word.reading : word.word,
      options: shuffleArray(options),
      context,
      hint: exerciseType === 'reading' 
        ? `Hint: This word is read as "${word.reading}" and means "${word.meaning}"`
        : `Hint: This word is written as "${word.word}" and read as "${word.reading}"`
    };
  }, []);

  // Helper function to generate meaning/reading questions - MEMOIZED
  const generateQuestion = useCallback((kanji: Kanji, mode: 'meaning' | 'reading'): Question => {
    const types: QuestionType[] = ['multiple-choice', 'fill-in-blank', 'matching', 'context'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    switch (type) {
      case 'multiple-choice':
        return {
          type: 'multiple-choice',
          question: mode === 'meaning' ? kanji.character : kanji.english,
          correctAnswer: mode === 'meaning' ? kanji.english : (kanji.onyomi[0] || kanji.kunyomi[0]),
          options: generateOptions(kanji, mode),
          hint: mode === 'meaning' 
            ? `This kanji is read as "${kanji.onyomi[0] || kanji.kunyomi[0]}"`
            : `This kanji means "${kanji.english}"`
        };

      case 'fill-in-blank':
        const context = generateContext(kanji, mode);
        return {
          type: 'fill-in-blank',
          question: context.text.replace('___', '_____'),
          correctAnswer: context.answer,
          hint: context.hint
        };

      case 'matching':
        const pairs = generateMatchingPairs(kanji, mode);
        return {
          type: 'matching',
          question: 'Match the kanji with their meanings/readings:',
          correctAnswer: JSON.stringify(pairs.correct),
          options: pairs.options
        };

      case 'context':
        const contextQuestion = generateContextQuestion(kanji, mode);
        return {
          type: 'context',
          question: contextQuestion.text,
          correctAnswer: contextQuestion.answer,
          options: contextQuestion.options,
          context: contextQuestion.context,
          hint: contextQuestion.hint,
          audioUrl: mode === 'reading' ? kanji.audioUrl : undefined
        };
    }
  }, [shuffledQuestions]);

  // Memoize expensive operations
  const memoizedQuizSettings = useMemo(() => QUIZ_SETTINGS[difficulty], [difficulty]);
  
  // Memoize shuffled questions to prevent regeneration on every render
  const shuffledQuestions = useMemo(() => {
    // If no kanji are available for the selected difficulty, use all kanji as fallback
    const availableKanji = kanji.length > 0 ? kanji : kanjiList;
    if (availableKanji.length === 0) return [];
    
    // Limit the number of questions to the available kanji count
    const maxQuestions = Math.min(memoizedQuizSettings.questionCount, availableKanji.length);
    return shuffleArray(availableKanji).slice(0, maxQuestions);
  }, [kanji, memoizedQuizSettings.questionCount]);

  // Memoize current question data
  const currentQuestionData = useMemo(() => {
    if (quizState.mode !== 'quiz' || !shuffledQuestions.length || currentQuestionIndex >= shuffledQuestions.length) {
      return null;
    }
    
    const kanjiItem = shuffledQuestions[currentQuestionIndex];
    let exercise;
    
    if (memoizedQuizSettings.mode === 'compound') {
      const availableWords = kanjiItem.compoundWords?.filter(word => 
        calculateWordDifficulty(word) <= memoizedQuizSettings.difficulty
      ) || [];
      if (availableWords.length === 0) {
        const word = kanjiItem.compoundWords?.[0];
        if (word) exercise = generateCompoundExercise(word, 1);
      } else {
        const word = availableWords[Math.floor(Math.random() * availableWords.length)];
        exercise = generateCompoundExercise(word, calculateWordDifficulty(word));
      }
    } else if (memoizedQuizSettings.mode === 'meaning' || memoizedQuizSettings.mode === 'reading') {
      exercise = generateQuestion(kanjiItem, memoizedQuizSettings.mode);
    }
    
    return { kanjiItem, exercise };
  }, [quizState.mode, shuffledQuestions, currentQuestionIndex, memoizedQuizSettings, generateCompoundExercise, generateQuestion]);

  // Helper functions for question generation
  const generateOptions = (kanji: Kanji, mode: 'meaning' | 'reading'): string[] => {
    // Use shuffledQuestions instead of quizState.questions to avoid undefined errors
    const otherKanji = shuffledQuestions.filter(k => k.character !== kanji.character);
    if (otherKanji.length === 0) {
      // Fallback to all kanji if no other kanji available
      const allOtherKanji = kanjiList.filter(k => k.character !== kanji.character);
      const options = getRandomSubset(allOtherKanji, 3).map(k => 
        mode === 'meaning' ? k.english : (k.onyomi[0] || k.kunyomi[0])
      );
      return shuffleArray([...options, mode === 'meaning' ? kanji.english : (kanji.onyomi[0] || kanji.kunyomi[0])]);
    }
    const options = getRandomSubset(otherKanji, 3).map(k => 
      mode === 'meaning' ? k.english : (k.onyomi[0] || k.kunyomi[0])
    );
    return shuffleArray([...options, mode === 'meaning' ? kanji.english : (kanji.onyomi[0] || kanji.kunyomi[0])]);
  };

  const generateContext = (kanji: Kanji, mode: 'meaning' | 'reading'): { text: string; answer: string; hint: string } => {
    const examples = kanji.examples || [];
    if (examples.length > 0) {
      const example = examples[Math.floor(Math.random() * examples.length)];
      const words = example.word.split('');
      const index = words.findIndex(char => char === kanji.character);
      if (index !== -1) {
        words[index] = '___';
        return {
          text: words.join(''),
          answer: mode === 'meaning' ? kanji.english : (kanji.onyomi[0] || kanji.kunyomi[0]),
          hint: `The missing ${mode === 'meaning' ? 'meaning' : 'reading'} is used in this word: ${example.word}`
        };
      }
    }
    // Fallback to simple sentence
    return {
      text: `この${kanji.character}は___です。`,
      answer: mode === 'meaning' ? kanji.english : (kanji.onyomi[0] || kanji.kunyomi[0]),
      hint: `Complete the sentence with the ${mode === 'meaning' ? 'meaning' : 'reading'} of ${kanji.character}`
    };
  };

  const generateMatchingPairs = (current: Kanji, mode: 'meaning' | 'reading'): { correct: [string, string][]; options: string[] } => {
    const pairs: [string, string][] = [[current.character, mode === 'meaning' ? current.english : (current.onyomi[0] || current.kunyomi[0])]];
    // Use shuffledQuestions instead of quizState.questions to avoid undefined errors
    const otherKanji = shuffledQuestions.filter(k => k.character !== current.character);
    if (otherKanji.length === 0) {
      // Fallback to all kanji if no other kanji available
      const allOtherKanji = kanjiList.filter(k => k.character !== current.character);
      const randomOthers = getRandomSubset(allOtherKanji, 2);
      randomOthers.forEach(k => {
        pairs.push([k.character, mode === 'meaning' ? k.english : (k.onyomi[0] || k.kunyomi[0])]);
      });
    } else {
      const randomOthers = getRandomSubset(otherKanji, 2);
      randomOthers.forEach(k => {
        pairs.push([k.character, mode === 'meaning' ? k.english : (k.onyomi[0] || k.kunyomi[0])]);
      });
    }
    return {
      correct: pairs,
      options: shuffleArray(pairs.map(([char, value]) => `${char} - ${value}`))
    };
  };

  const generateContextQuestion = (kanji: Kanji, mode: 'meaning' | 'reading'): {
    text: string;
    answer: string;
    options: string[];
    context: string;
    hint: string;
  } => {
    const examples = kanji.examples || [];
    const example = examples[Math.floor(Math.random() * examples.length)] || {
      word: kanji.character,
      reading: kanji.onyomi[0] || kanji.kunyomi[0],
      meaning: kanji.english
    };

    return {
      text: `What is the ${mode === 'meaning' ? 'meaning' : 'reading'} of ${kanji.character} in this context?`,
      answer: mode === 'meaning' ? kanji.english : (kanji.onyomi[0] || kanji.kunyomi[0]),
      options: generateOptions(kanji, mode),
      context: `${example.word} (${example.reading}) - ${example.meaning}`,
      hint: `Look at how ${kanji.character} is used in the word "${example.word}"`
    };
  };

  // Initialize quiz settings based on difficulty prop
  useEffect(() => {
    setQuizSettings(QUIZ_SETTINGS[difficulty]);
  }, [difficulty]);

  // Update startQuiz to use the current quiz settings
  const startQuiz = useCallback(() => {
    if (kanji.length === 0) return;
    
    setQuizState({
      mode: 'quiz',
      currentQuestion: '',
      correctAnswer: '',
      selectedAnswer: null,
      options: [],
      userInput: '',
      context: undefined,
      hint: undefined,
      showFeedback: false,
      isCorrect: null,
      strokes: [],
      currentStroke: [],
      compoundWordProgress: {},
      questions: shuffledQuestions // Use memoized questions
    });
    
    setCurrentQuestionIndex(0);
    setScore(0);
    setStreak(0);
    setTimeLeft(memoizedQuizSettings.timeLimit);
    setShowStrokeGuide(false);
    setActiveTab(memoizedQuizSettings.mode === 'stroke' ? 0 : 
                 memoizedQuizSettings.mode === 'compound' ? 1 :
                 memoizedQuizSettings.mode === 'meaning' ? 2 : 3);
    setQuizStartTime(Date.now());
  }, [kanji.length, shuffledQuestions, memoizedQuizSettings]);

  // Auto-start quiz when component mounts or difficulty changes
  useEffect(() => {
    startQuiz();
  }, [startQuiz]);

  // Load question for the current index - OPTIMIZED
  useEffect(() => {
    if (!currentQuestionData) return;
    
    const { kanjiItem, exercise } = currentQuestionData;
    setCurrentKanji(kanjiItem);
    
    if (exercise) {
      setQuizState(prev => ({
        ...prev,
        currentQuestion: exercise.question,
        correctAnswer: exercise.correctAnswer,
        options: exercise.options,
        context: exercise.context,
        hint: exercise.hint,
        userInput: '',
        selectedAnswer: null,
        showFeedback: false,
        isCorrect: null
      }));
      setQuestionType(exercise.type);
      setShowContext(false);
      setHintUsed(false);
    }
  }, [currentQuestionData]);

  // Handle quiz completion - OPTIMIZED
  const handleQuizComplete = useCallback((finalScore: number) => {
    setScore(finalScore);
    setQuizState(prev => ({ ...prev, mode: 'result' }));

    // Update progress
    if (currentKanji && updateWordProgress) {
      updateWordProgress(currentKanji.character, {
        masteryLevel: finalScore / 100, // Convert score to 0-1 range
        reviewCount: (progress.words[currentKanji.character]?.reviewCount || 0) + 1,
        lastReviewed: Date.now(),
        nextReviewDate: Date.now() + (24 * 60 * 60 * 1000), // Review in 24 hours
        consecutiveCorrect: streak,
        lastAnswerCorrect: finalScore >= 70 // Consider 70% or higher as correct
      });

      // Check achievements
      checkAchievements('kanji', {
        character: currentKanji.character,
        score: finalScore,
        streak: streak,
        mode: memoizedQuizSettings.mode
      });
    }
  }, [currentKanji, updateWordProgress, progress.words, streak, checkAchievements, memoizedQuizSettings.mode]);

  // Play audio for readings - ENHANCED
  const playKanjiReading = useCallback((reading: string) => {
    if (reading) {
      playAudio(reading, 'word', 'neutral');
    }
  }, [playAudio]);

  // Play audio for current question
  const playCurrentQuestionAudio = useCallback(() => {
    if (!currentKanji) return;
    
    switch (memoizedQuizSettings.mode) {
      case 'reading':
        // Play the kanji character
        playAudio(currentKanji.character, 'word', 'neutral');
        break;
      case 'meaning':
        // Play the correct reading when showing meaning
        const reading = currentKanji.onyomi[0] || currentKanji.kunyomi[0];
        if (reading) {
          playAudio(reading, 'word', 'neutral');
        }
        break;
      case 'compound':
        // Play the compound word
        if (quizState.currentQuestion) {
          playAudio(quizState.currentQuestion, 'word', 'neutral');
        }
        break;
      default:
        break;
    }
  }, [currentKanji, memoizedQuizSettings.mode, quizState.currentQuestion, playAudio]);

  // Play feedback audio
  const playFeedbackAudio = useCallback((isCorrect: boolean) => {
    if (isCorrect) {
      // Play success sound
      playAudio('正解です！', 'word', 'happy');
    } else {
      // Play correct answer
      if (memoizedQuizSettings.mode === 'reading') {
        const reading = currentKanji?.onyomi[0] || currentKanji?.kunyomi[0];
        if (reading) {
          playAudio(`正解は${reading}です`, 'word', 'neutral');
        }
      } else if (memoizedQuizSettings.mode === 'meaning') {
        const reading = currentKanji?.onyomi[0] || currentKanji?.kunyomi[0];
        if (reading) {
          playAudio(`正解は${reading}です`, 'word', 'neutral');
        }
      }
    }
  }, [memoizedQuizSettings.mode, currentKanji, playAudio]);

  // Render quiz content based on mode - OPTIMIZED
  const renderQuizContent = useCallback(() => {
    if (!currentKanji) return null;

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {memoizedQuizSettings.useTimer && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Timer color="primary" />
            <Typography variant="h6" color={timeLeft <= 10 ? 'error' : 'text.primary'}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4" sx={{ fontFamily: 'Noto Sans JP' }}>
            {currentKanji.character}
          </Typography>
          
          {/* Audio button for current question */}
          <Tooltip title="Play question audio">
            <IconButton 
              size="small"
              onClick={playCurrentQuestionAudio}
              color="primary"
            >
              <VolumeUp fontSize="small" />
            </IconButton>
          </Tooltip>
          
          {memoizedQuizSettings.mode === 'reading' && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {currentKanji.onyomi.map((reading, index) => (
                <Tooltip key={`onyomi-${index}`} title={`Play ${reading}`}>
                  <IconButton 
                    size="small"
                    onClick={() => playKanjiReading(reading)}
                  >
                    <VolumeUp fontSize="small" />
                  </IconButton>
                </Tooltip>
              ))}
              {currentKanji.kunyomi.map((reading, index) => (
                <Tooltip key={`kunyomi-${index}`} title={`Play ${reading}`}>
                  <IconButton 
                    size="small"
                    onClick={() => playKanjiReading(reading)}
                  >
                    <VolumeUp fontSize="small" />
                  </IconButton>
                </Tooltip>
              ))}
            </Box>
          )}
        </Box>

        {(() => {
          switch (memoizedQuizSettings.mode) {
            case 'stroke':
              return renderStrokeQuiz();
            case 'compound':
              return renderCompoundQuiz();
            case 'meaning':
              return renderMeaningQuiz();
            case 'reading':
              return renderReadingQuiz();
            default:
              return null;
          }
        })()}

        {quizState.showFeedback && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Paper
                sx={{
                  p: 2,
                  bgcolor: quizState.isCorrect ? 'success.light' : 'error.light',
                  color: 'white'
                }}
              >
                <Typography>
                  {quizState.isCorrect
                    ? 'Correct!'
                    : `Incorrect. ${memoizedQuizSettings.mode === 'reading' ? 'The correct reading is: ' + currentKanji.onyomi[0] : 
                       memoizedQuizSettings.mode === 'meaning' ? 'The correct meaning is: ' + currentKanji.english :
                       'Try again!'}`}
                </Typography>
                {quizState.isCorrect && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      Current streak: {streak}
                    </Typography>
                  </Box>
                )}
              </Paper>
            </motion.div>
          </AnimatePresence>
        )}
      </Box>
    );
  }, [currentKanji, memoizedQuizSettings, timeLeft, streak, quizState.showFeedback, quizState.isCorrect, quizState.correctAnswer, playKanjiReading, playCurrentQuestionAudio, playAudio, playFeedbackAudio, renderStrokeQuiz, renderCompoundQuiz, renderMeaningQuiz, renderReadingQuiz]);

  // Render stroke practice quiz
  const renderStrokeQuiz = () => {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Typography variant="h4" sx={{ fontFamily: 'Noto Sans JP' }}>
          {currentKanji.character}
        </Typography>
        
        <Box sx={{ position: 'relative', width: '100%', maxWidth: 400, height: 400 }}>
          <canvas
            ref={canvasRef}
            style={{
              border: `2px solid ${themeClasses.border}`,
              borderRadius: 8,
              touchAction: 'none'
            }}
            onMouseDown={handleStrokeStart}
            onMouseMove={handleStrokeMove}
            onMouseUp={handleStrokeEnd}
            onMouseLeave={handleStrokeEnd}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
          
          {showStrokeGuide && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: 'none',
                opacity: strokeGuideOpacity,
                transition: 'opacity 0.3s ease'
              }}
            >
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 100 100"
                preserveAspectRatio="xMidYMid meet"
              >
                {currentKanji.strokes.map((stroke, index) => (
                  <path
                    key={index}
                    d={stroke.path}
                    fill="none"
                    stroke={themeClasses.text.primary}
                    strokeWidth={2}
                    opacity={index === quizState.strokes.length ? 1 : 0.3}
                    strokeDasharray={index === quizState.strokes.length ? "none" : "5,5"}
                  />
                ))}
              </svg>
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setShowStrokeGuide(!showStrokeGuide)}
            startIcon={<Help />}
          >
            {showStrokeGuide ? 'Hide Guide' : 'Show Guide'}
          </Button>
          <Button
            variant="outlined"
            onClick={handleUndo}
            disabled={!canUndo}
            startIcon={<Undo />}
          >
            Undo
          </Button>
          <Button
            variant="outlined"
            onClick={handleRedo}
            disabled={!canRedo}
            startIcon={<Redo />}
          >
            Redo
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              const canvas = canvasRef.current;
              if (!canvas) return;
              const ctx = canvas.getContext('2d');
              if (!ctx) return;
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              setQuizState(prev => ({ ...prev, strokes: [] }));
              setStrokeValidationResult(null);
              strokeHistory.current = [[]];
              historyIndex.current = 0;
              setCanUndo(false);
              setCanRedo(false);
            }}
            startIcon={<Replay />}
          >
            Clear
          </Button>
          <Button
            variant="contained"
            onClick={handleAnswer}
            disabled={quizState.strokes.length === 0}
            startIcon={<Check />}
          >
            Submit
          </Button>
        </Box>

        {strokeValidationResult && (
          <Paper sx={{ p: 2, mt: 2, bgcolor: 'background.paper' }}>
            <Typography variant="body1" color={strokeValidationResult.isCorrect ? 'success.main' : 'error.main'}>
              {strokeValidationResult.isCorrect ? 'Correct stroke!' : 'Try again'}
            </Typography>
            {strokeValidationResult.suggestions.map((suggestion, index) => (
              <Typography key={index} variant="body2" color="text.secondary">
                • {suggestion}
              </Typography>
            ))}
          </Paper>
        )}
      </Box>
    );
  };

  // Render compound word quiz
  const renderCompoundQuiz = () => {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Typography variant="h4" sx={{ fontFamily: 'Noto Sans JP' }}>
          {quizState.currentQuestion}
        </Typography>

        {quizState.context && (
          <Paper sx={{ p: 2, width: '100%', maxWidth: 600, bgcolor: 'background.paper' }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              Context:
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                fontFamily: 'Noto Sans JP',
                opacity: showContext ? 1 : 0.3,
                transition: 'opacity 0.3s ease'
              }}
            >
              {quizState.context}
            </Typography>
            <Button
              size="small"
              onClick={() => setShowContext(!showContext)}
              sx={{ mt: 1 }}
            >
              {showContext ? 'Hide Context' : 'Show Context'}
            </Button>
          </Paper>
        )}

        <Grid container spacing={2} sx={{ width: '100%', maxWidth: 600 }}>
          {quizState.options.map((option, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleAnswer(option)}
                disabled={quizState.selectedAnswer !== null}
                sx={{
                  height: 60,
                  fontFamily: 'Noto Sans JP',
                  fontSize: '1.2rem',
                  position: 'relative'
                }}
              >
                {option}
                {quizState.selectedAnswer === option && (
                  <Box
                    sx={{
                      position: 'absolute',
                      right: 8,
                      color: option === quizState.correctAnswer ? 'success.main' : 'error.main'
                    }}
                  >
                    {option === quizState.correctAnswer ? <Check /> : <Close />}
                  </Box>
                )}
              </Button>
            </Grid>
          ))}
        </Grid>

        {quizState.hint && !hintUsed && (
          <Button
            variant="text"
            onClick={() => {
              setHintUsed(true);
              // Play audio for the word if it's a reading question
              if (quizState.correctAnswer.includes('[')) {
                playAudio(quizState.correctAnswer);
              }
            }}
            startIcon={<Help />}
          >
            Need a hint?
          </Button>
        )}

        {hintUsed && quizState.hint && (
          <Paper sx={{ p: 2, width: '100%', maxWidth: 600, bgcolor: 'background.paper' }}>
            <Typography variant="body1" color="text.secondary">
              {quizState.hint}
            </Typography>
            {quizState.correctAnswer.includes('[') && (
              <IconButton
                onClick={() => playAudio(quizState.correctAnswer)}
                sx={{ mt: 1 }}
              >
                <VolumeUp />
              </IconButton>
            )}
          </Paper>
        )}

        {quizState.selectedAnswer && (
          <Paper
            sx={{
              p: 2,
              width: '100%',
              maxWidth: 600,
              bgcolor: quizState.selectedAnswer === quizState.correctAnswer
                ? 'success.light'
                : 'error.light'
            }}
          >
            <Typography variant="body1" color="text.primary">
              {quizState.selectedAnswer === quizState.correctAnswer
                ? 'Correct!'
                : `Incorrect. The correct answer is: ${quizState.correctAnswer}`}
            </Typography>
            {quizState.selectedAnswer === quizState.correctAnswer && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {quizState.context}
              </Typography>
            )}
          </Paper>
        )}
      </Box>
    );
  };

  // Render meaning quiz
  const renderMeaningQuiz = () => {
    return renderQuestion('meaning');
  };

  // Render reading quiz
  const renderReadingQuiz = () => {
    return renderQuestion('reading');
  };

  const renderQuestion = (mode: 'meaning' | 'reading') => {
    if (!quizState.currentQuestion) {
      return <Typography color="text.secondary">No question available.</Typography>;
    }
    if (questionType === 'multiple-choice' && (!quizState.options || quizState.options.length === 0)) {
      return <Typography color="text.secondary">No answer options available.</Typography>;
    }
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Typography variant="h4" sx={{ fontFamily: 'Noto Sans JP' }}>
          {quizState.currentQuestion}
        </Typography>

        {quizState.context && (
          <Paper sx={{ p: 2, width: '100%', maxWidth: 600, bgcolor: 'background.paper' }}>
            <Typography variant="body1" color="text.primary" sx={{ mb: 1, fontWeight: 500 }}>
              Context:
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                fontFamily: 'Noto Sans JP',
                opacity: showContext ? 1 : 0.5,
                transition: 'opacity 0.3s ease',
                color: 'text.primary'
              }}
            >
              {quizState.context}
            </Typography>
            <Button
              size="small"
              onClick={() => setShowContext(!showContext)}
              sx={{ mt: 1 }}
            >
              {showContext ? 'Hide Context' : 'Show Context'}
            </Button>
          </Paper>
        )}

        {questionType === 'multiple-choice' && (
          <Grid container spacing={2} sx={{ width: '100%', maxWidth: 600 }}>
            {quizState.options?.map((option, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => handleAnswer(option)}
                  disabled={quizState.selectedAnswer !== null}
                  sx={{
                    height: 60,
                    fontFamily: mode === 'reading' ? 'Noto Sans JP' : 'inherit',
                    fontSize: '1.2rem',
                    position: 'relative'
                  }}
                >
                  {option}
                  {quizState.selectedAnswer === option && (
                    <Box
                      sx={{
                        position: 'absolute',
                        right: 8,
                        color: option === quizState.correctAnswer ? 'success.main' : 'error.main'
                      }}
                    >
                      {option === quizState.correctAnswer ? <Check /> : <Close />}
                    </Box>
                  )}
                </Button>
              </Grid>
            ))}
          </Grid>
        )}

        {questionType === 'fill-in-blank' && (
          <Box sx={{ width: '100%', maxWidth: 600 }}>
            <TextField
              fullWidth
              variant="outlined"
              value={quizState.userInput}
              onChange={(e) => setQuizState(prev => ({ ...prev, userInput: e.target.value }))}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAnswer(quizState.userInput);
                }
              }}
              disabled={quizState.selectedAnswer !== null}
              sx={{ mb: 2 }}
            />
            <Button
              fullWidth
              variant="contained"
              onClick={() => handleAnswer(quizState.userInput)}
              disabled={!quizState.userInput || quizState.selectedAnswer !== null}
            >
              Submit
            </Button>
          </Box>
        )}

        {questionType === 'matching' && (
          <Box sx={{ width: '100%', maxWidth: 600 }}>
            <List>
              {quizState.options?.map((option, index) => (
                <ListItem key={index}>
                  <ListItemText primary={option} />
                </ListItem>
              ))}
            </List>
            <TextField
              fullWidth
              variant="outlined"
              value={quizState.userInput}
              onChange={(e) => setQuizState(prev => ({ ...prev, userInput: e.target.value }))}
              placeholder="Enter your matches (e.g., '1-2, 3-4')"
              disabled={quizState.selectedAnswer !== null}
              sx={{ mb: 2 }}
            />
            <Button
              fullWidth
              variant="contained"
              onClick={() => handleAnswer(quizState.userInput)}
              disabled={!quizState.userInput || quizState.selectedAnswer !== null}
            >
              Submit
            </Button>
          </Box>
        )}

        {quizState.hint && !hintUsed && (
          <Button
            variant="text"
            onClick={() => {
              setHintUsed(true);
              if (mode === 'reading' && currentKanji?.audioUrl) {
                playAudio(currentKanji.audioUrl);
              }
            }}
            startIcon={<Help />}
          >
            Need a hint?
          </Button>
        )}

        {hintUsed && quizState.hint && (
          <Paper sx={{ p: 2, width: '100%', maxWidth: 600, bgcolor: 'background.paper' }}>
            <Typography variant="body1" color="text.secondary">
              {quizState.hint}
            </Typography>
            {mode === 'reading' && currentKanji?.audioUrl && (
              <IconButton
                onClick={() => playAudio(currentKanji.audioUrl)}
                sx={{ mt: 1 }}
              >
                <VolumeUp />
              </IconButton>
            )}
          </Paper>
        )}

        {quizState.selectedAnswer && (
          <Paper
            sx={{
              p: 2,
              width: '100%',
              maxWidth: 600,
              bgcolor: quizState.selectedAnswer === quizState.correctAnswer
                ? 'success.light'
                : 'error.light'
            }}
          >
            <Typography variant="body1" color="text.primary">
              {quizState.selectedAnswer === quizState.correctAnswer
                ? 'Correct!'
                : `Incorrect. The correct answer is: ${quizState.correctAnswer}`}
            </Typography>
            {quizState.selectedAnswer === quizState.correctAnswer && quizState.context && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {quizState.context}
              </Typography>
            )}
          </Paper>
        )}
      </Box>
    );
  };

  // Render quiz setup
  const renderQuizSetup = () => {
    const availableKanji = kanji.length > 0 ? kanji : kanjiList;
    const isUsingFallback = kanji.length === 0 && kanjiList.length > 0;
    
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="h5">Quiz Settings</Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Current Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
        </Typography>

        {isUsingFallback && (
          <Box sx={{ 
            backgroundColor: 'warning.light', 
            color: 'warning.contrastText', 
            p: 2, 
            borderRadius: 1,
            mb: 2
          }}>
            <Typography variant="body2">
              <strong>Note:</strong> No kanji available for {difficulty} difficulty. Using all available kanji instead.
            </Typography>
          </Box>
        )}

        <Typography variant="body2" color="text.secondary">
          Available kanji: {availableKanji.length}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab icon={<Brush />} label="Stroke Practice" />
            <Tab icon={<School />} label="Compound Words" />
            <Tab icon={<Translate />} label="Meaning Quiz" />
            <Tab icon={<Info />} label="Reading Quiz" />
          </Tabs>

          <Box sx={{ mt: 2 }}>
            {activeTab === 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography>Practice writing kanji with stroke order validation</Typography>
                <Typography variant="body2" color="text.secondary">
                  {difficulty === 'easy' ? 'Basic stroke practice for beginners' : 
                   difficulty === 'medium' ? 'Intermediate stroke practice with feedback' : 
                   'Advanced stroke practice with detailed validation'}
                </Typography>
                <Button
                  variant="contained"
                  disabled={availableKanji.length === 0}
                  onClick={() => {
                    setQuizSettings(prev => ({ ...prev, mode: 'stroke' }));
                    startQuiz();
                  }}
                >
                  Start Stroke Practice
                </Button>
              </Box>
            )}

            {activeTab === 1 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography>Practice compound words using the kanji</Typography>
                <Typography variant="body2" color="text.secondary">
                  {difficulty === 'easy' ? 'Simple compound words for beginners' : 
                   difficulty === 'medium' ? 'Intermediate compound word practice' : 
                   'Advanced compound word exercises with context'}
                </Typography>
                <Button
                  variant="contained"
                  disabled={availableKanji.length === 0}
                  onClick={() => {
                    setQuizSettings(prev => ({ ...prev, mode: 'compound' }));
                    startQuiz();
                  }}
                >
                  Start Compound Word Practice
                </Button>
              </Box>
            )}

            {activeTab === 2 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography>Test your knowledge of kanji meanings</Typography>
                <Typography variant="body2" color="text.secondary">
                  {difficulty === 'easy' ? 'Basic meaning recognition' : 
                   difficulty === 'medium' ? 'Intermediate meaning practice with context' : 
                   'Advanced meaning exercises with usage examples'}
                </Typography>
                <Button
                  variant="contained"
                  disabled={availableKanji.length === 0}
                  onClick={() => {
                    setQuizSettings(prev => ({ ...prev, mode: 'meaning' }));
                    startQuiz();
                  }}
                >
                  Start Meaning Quiz
                </Button>
              </Box>
            )}

            {activeTab === 3 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography>Test your knowledge of kanji readings</Typography>
                <Typography variant="body2" color="text.secondary">
                  {difficulty === 'easy' ? 'Basic reading practice (onyomi/kunyomi)' : 
                   difficulty === 'medium' ? 'Intermediate reading practice with context' : 
                   'Advanced reading exercises with compound words'}
                </Typography>
                <Button
                  variant="contained"
                  disabled={availableKanji.length === 0}
                  onClick={() => {
                    setQuizSettings(prev => ({ ...prev, mode: 'reading' }));
                    startQuiz();
                  }}
                >
                  Start Reading Quiz
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    );
  };

  // Render quiz result
  const renderQuizResult = () => {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
        <Typography variant="h4">
          Quiz Complete!
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5">
            Final Score: {score}
          </Typography>
          <Typography>
            {score >= 90 ? 'Excellent! 🌟' :
             score >= 80 ? 'Great job! 🎯' :
             score >= 70 ? 'Good work! 👍' :
             'Keep practicing! 💪'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={() => setQuizState(prev => ({ ...prev, mode: 'setup' }))}
          >
            Try Again
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              // Navigate to progress page or show detailed results
            }}
          >
            View Progress
          </Button>
        </Box>
      </Box>
    );
  };

  // Update handleAnswer to advance to the next question - OPTIMIZED
  const handleAnswer = useCallback((answer: string) => {
    let isCorrect = false;
    if (questionType === 'matching') {
      try {
        const userMatches = JSON.parse(answer);
        const correctMatches = JSON.parse(quizState.correctAnswer);
        isCorrect = JSON.stringify(userMatches.sort()) === JSON.stringify(correctMatches.sort());
      } catch {
        isCorrect = false;
      }
    } else {
      isCorrect = answer === quizState.correctAnswer;
    }
    
    setQuizState(prev => ({
      ...prev,
      selectedAnswer: answer,
      showFeedback: true,
      isCorrect
    }));
    
    // Play audio feedback
    playFeedbackAudio(isCorrect);
    
    if (isCorrect) {
      setStreak(prev => prev + 1);
      if (memoizedQuizSettings.mode === 'reading' && currentKanji?.audioUrl) {
        playAudio(currentKanji.audioUrl);
      }
    } else {
      setStreak(0);
    }
    
    // Use setTimeout to show feedback before advancing
    const timeoutId = setTimeout(() => {
      if (currentQuestionIndex + 1 < memoizedQuizSettings.questionCount && currentQuestionIndex + 1 < shuffledQuestions.length) {
        setCurrentQuestionIndex(idx => idx + 1);
      } else {
        handleQuizComplete(score);
      }
    }, 2000);
    
    // Cleanup timeout on unmount
    return () => clearTimeout(timeoutId);
  }, [questionType, quizState.correctAnswer, memoizedQuizSettings.mode, currentKanji, playAudio, currentQuestionIndex, memoizedQuizSettings.questionCount, shuffledQuestions.length, score, handleQuizComplete, playFeedbackAudio]);

  // Complete quiz and update progress
  const completeQuiz = useCallback(() => {
    if (!quizState.questions.length) return;

    const accuracy = (score / quizState.questions.length) * 100;
    const timeSpent = Math.round((Date.now() - quizStartTime) / 1000); // Convert to seconds

    // Track quiz completion using the unified progress system
    if (progressContext?.trackQuizCompletion) {
      progressContext.trackQuizCompletion({
        quizType: `kanji-${quizSettings.mode}`,
        score: score,
        totalQuestions: quizState.questions.length,
        timeSpent: timeSpent,
        wordsUsed: quizState.questions.map(q => q.character),
        category: 'kanji'
      });
    }

    // Update individual kanji progress
    quizState.questions.forEach((kanji, index) => {
      const isCorrect = score > index; // Simplified logic - you might want to track individual answers
      
      if (updateWordProgress) {
        updateWordProgress(kanji.character, {
          lastReviewed: Date.now(),
          reviewCount: (progress.words[kanji.character]?.reviewCount || 0) + 1,
          nextReviewDate: Date.now() + (isCorrect ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000),
          category: 'kanji',
          section: 'kanji',
          difficulty: difficulty,
          lastAnswerCorrect: isCorrect,
          correctAnswers: (progress.words[kanji.character]?.correctAnswers || 0) + (isCorrect ? 1 : 0),
          incorrectAnswers: (progress.words[kanji.character]?.incorrectAnswers || 0) + (isCorrect ? 0 : 1),
          consecutiveCorrect: isCorrect ? 
            (progress.words[kanji.character]?.consecutiveCorrect || 0) + 1 : 0,
          masteryLevel: Math.min(5, Math.max(0, 
            ((progress.words[kanji.character]?.correctAnswers || 0) + (isCorrect ? 1 : 0)) / 
            ((progress.words[kanji.character]?.correctAnswers || 0) + (progress.words[kanji.character]?.incorrectAnswers || 0) + 1) * 5
          ))
        });
      }
    });

    setQuizCompleted(true);
  }, [quizState.questions, score, quizStartTime, quizSettings.mode, difficulty, progressContext, updateWordProgress, progress]);

  if (!kanji || !Array.isArray(kanji) || kanji.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Card sx={{ maxWidth: 800, mx: 'auto' }}>
          <CardContent>
            <Typography variant="h6" color="text.secondary" align="center">
              No kanji available for quiz. Please select some kanji first.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Card sx={{ maxWidth: 800, mx: 'auto' }}>
        <CardContent>
          {kanji.length === 0 ? (
            <Typography variant="h6" color="text.secondary" align="center">
              No kanji available for quiz. Please select some kanji first.
            </Typography>
          ) : (
            <>
              {quizState.mode === 'setup' && renderQuizSetup()}
              {quizState.mode === 'quiz' && renderQuizContent()}
              {quizState.mode === 'result' && renderQuizResult()}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

// Helper functions
const calculateWordDifficulty = (word: CompoundWordData): number => {
  let difficulty = 1; // Base difficulty
  
  // Increase difficulty based on word length
  difficulty += word.word.length * 0.2;
  
  // Increase difficulty if word has multiple readings
  if (word.reading.includes('・')) {
    difficulty += 0.5;
  }
  
  // Increase difficulty based on kanji complexity
  word.kanji.forEach(char => {
    const kanjiData = kanjiList.find(k => k.character === char);
    if (kanjiData) {
      difficulty += kanjiData.strokes * 0.1;
      if (kanjiData.jlptLevel >= 3) difficulty += 0.3;
    }
  });
  
  // Normalize difficulty to a scale of 1-5
  return Math.min(5, Math.max(1, Math.round(difficulty)));
};

const getKanjiProgress = (character: string) => {
  const key = `kanji-${character}`;
  const progressData = progress[key];
  
  if (!progressData) {
    return {
      masteryLevel: 0,
      lastPracticed: 0,
      practiceHistory: [],
      compoundWordProgress: {},
      strokeOrderProgress: {
        correctStrokes: 0,
        totalStrokes: 0,
        lastScore: 0
      }
    };
  }

  // Calculate mastery level based on correct answers and streak
  const masteryLevel = progressData.correct >= 5 ? 2 :
                      progressData.correct >= 3 ? 1 :
                      progressData.correct >= 1 ? 0.5 : 0;

  return {
    masteryLevel,
    lastPracticed: progressData.lastAttempted || 0,
    practiceHistory: progressData.history || [],
    compoundWordProgress: progressData.compoundWordProgress || {},
    strokeOrderProgress: progressData.strokeOrderProgress || {
      correctStrokes: 0,
      totalStrokes: 0,
      lastScore: 0
    }
  };
};

// Enhance stroke validation
const validateStrokeEnhanced = (stroke: StrokeData, expectedStroke: StrokeData): StrokeFeedback => {
  const basicValidation = validateStroke(stroke, expectedStroke);
  const accuracy = calculateStrokeAccuracy(stroke, expectedStroke);
  const suggestions = generateStrokeSuggestions(stroke, expectedStroke);
  
  return {
    ...basicValidation,
    accuracy,
    suggestions,
    expectedStroke,
    actualStroke: stroke
  };
};

// Add new helper functions for stroke validation
const calculateStrokeAccuracy = (stroke: StrokeData, expectedStroke: StrokeData): number => {
  // Calculate direction accuracy (25% weight) - more lenient threshold
  const directionMatch = Math.abs(stroke.direction - expectedStroke.direction) < 0.6;
  const directionAccuracy = directionMatch ? 1 : 0.6; // More partial credit for close matches

  // Calculate length accuracy (25% weight) - more lenient threshold
  const lengthMatch = Math.abs(stroke.length - expectedStroke.length) / expectedStroke.length < 0.7;
  const lengthAccuracy = lengthMatch ? 1 : 0.6; // More partial credit for close matches

  // Calculate type accuracy (50% weight) - most important but still forgiving
  const typeMatch = stroke.type === expectedStroke.type;
  const typeAccuracy = typeMatch ? 1 : 0.4; // More credit even for wrong type

  // Calculate weighted average
  return (directionAccuracy * 0.25) + (lengthAccuracy * 0.25) + (typeAccuracy * 0.5);
};

const generateStrokeSuggestions = (stroke: StrokeData, expectedStroke: StrokeData): string[] => {
  const suggestions: string[] = [];
  
  if (Math.abs(stroke.direction - expectedStroke.direction) >= 0.6) {
    suggestions.push(`Try to draw the stroke more ${stroke.direction > expectedStroke.direction ? 'horizontally' : 'vertically'}`);
  }
  
  if (Math.abs(stroke.length - expectedStroke.length) / expectedStroke.length >= 0.7) {
    suggestions.push(`The stroke should be ${stroke.length > expectedStroke.length ? 'shorter' : 'longer'}`);
  }
  
  if (stroke.type !== expectedStroke.type) {
    suggestions.push(`This should be a ${expectedStroke.type} stroke`);
  }
  
  return suggestions;
};

// Enhance compound word practice
const generateEnhancedExercises = (word: CompoundWordData, kanji: KanjiStrokeData): CompoundWordExercise[] => {
  const exercises: CompoundWordExercise[] = [];
  
  // Reading exercise
  exercises.push({
    type: 'reading',
    question: `How do you read this word: ${word.word}?`,
    answer: word.reading,
    options: generateReadingOptions(word, kanji),
    hints: [`The word contains the kanji ${kanji.character}`, `It's a ${word.difficulty < 2 ? 'common' : 'less common'} word`],
    difficulty: word.difficulty,
    context: `This word appears in: ${word.examples[0]?.sentence || 'common usage'}`
  });
  
  // Meaning exercise
  exercises.push({
    type: 'meaning',
    question: `What does ${word.word} (${word.reading}) mean?`,
    answer: word.meaning,
    options: generateMeaningOptions(word),
    hints: [`The word is related to ${word.relatedWords?.[0] || 'common concepts'}`],
    difficulty: word.difficulty,
    context: `Usage example: ${word.examples[0]?.sentence || 'common in daily conversation'}`
  });
  
  // Usage exercise
  if (word.examples.length > 0) {
    exercises.push({
      type: 'usage',
      question: `Complete the sentence: ${word.examples[0].sentence.replace(word.word, '_____')}`,
      answer: word.word,
      options: [word.word, ...word.relatedWords?.slice(0, 3) || []],
      hints: [`The word is used to express ${word.meaning}`],
      difficulty: word.difficulty + 0.5,
      context: `This is a ${word.examples[0].context || 'common'} usage of the word`
    });
  }
  
  return exercises;
};

// Helper functions for compound word exercises
const generateReadingOptions = (word: CompoundWordData, kanji: KanjiStrokeData): string[] => {
  const options = [word.reading];
  const allReadings = new Set<string>();
  
  // Add readings from the kanji
  kanji.onyomi.forEach(reading => allReadings.add(reading));
  kanji.kunyomi.forEach(reading => allReadings.add(reading));
  
  // Add readings from related words
  word.relatedWords?.forEach(relatedWord => {
    if (relatedWord.reading) allReadings.add(relatedWord.reading);
  });
  
  // Convert to array and filter out the correct answer
  const availableReadings = Array.from(allReadings).filter(r => r !== word.reading);
  
  // Add random readings until we have 4 options
  while (options.length < 4 && availableReadings.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableReadings.length);
    const reading = availableReadings.splice(randomIndex, 1)[0];
    options.push(reading);
  }
  
  // If we still need more options, generate similar readings
  while (options.length < 4) {
    const baseReading = word.reading;
    const modifiedReading = baseReading.replace(/[あ-ん]/g, char => {
      const similarChars = {
        'あ': ['い', 'お'],
        'い': ['あ', 'う'],
        'う': ['い', 'え'],
        'え': ['う', 'お'],
        'お': ['あ', 'え'],
        // Add more similar characters as needed
      }[char] || [char];
      return similarChars[Math.floor(Math.random() * similarChars.length)];
    });
    if (!options.includes(modifiedReading)) {
      options.push(modifiedReading);
    }
  }
  
  return shuffleArray(options);
};

const generateMeaningOptions = (word: CompoundWordData): string[] => {
  const options = [word.meaning];
  const allMeanings = new Set<string>();
  
  // Add meanings from related words
  word.relatedWords?.forEach(relatedWord => {
    if (relatedWord.meaning) allMeanings.add(relatedWord.meaning);
  });
  
  // Add meanings from example sentences
  word.examples?.forEach(example => {
    if (example.meaning) allMeanings.add(example.meaning);
  });
  
  // Convert to array and filter out the correct answer
  const availableMeanings = Array.from(allMeanings).filter(m => m !== word.meaning);
  
  // Add random meanings until we have 4 options
  while (options.length < 4 && availableMeanings.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableMeanings.length);
    const meaning = availableMeanings.splice(randomIndex, 1)[0];
    options.push(meaning);
  }
  
  // If we still need more options, generate similar meanings
  while (options.length < 4) {
    const similarMeanings = [
      'similar concept',
      'related idea',
      'opposite meaning',
      'different context'
    ];
    const randomMeaning = similarMeanings[Math.floor(Math.random() * similarMeanings.length)];
    if (!options.includes(randomMeaning)) {
      options.push(randomMeaning);
    }
  }
  
  return shuffleArray(options);
};

export default KanjiQuiz; 