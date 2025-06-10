import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { QuizState, QuizSettings, DEFAULT_QUIZ_SETTINGS, INITIAL_WORD_STATS, QuizMode, Difficulty, WordStats, WordDifficulty } from '../types/quiz';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useProgress } from '../context/ProgressContext';
import { useWordLevel } from '../context/WordLevelContext';
import { useAchievements } from '../context/AchievementContext';
import { useWords } from '../context/WordContext';
import { DictionaryItem } from '../types/dictionary';
import { JapaneseWord } from '../data/types';
import { Achievement } from '../types/achievements';
import { KanjiComponent } from '../types/quiz';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, Button, Alert, LinearProgress, Tooltip, Card, CardContent, Checkbox, FormControlLabel, Collapse, IconButton, List, ListItem, ListItemText, Tabs, Tab, Divider, CircularProgress, Snackbar } from '@mui/material';
import { playAudio, playDynamicAudio } from '../utils/audio';
import { useHotkeys } from 'react-hotkeys-hook';
import { useInView } from 'react-intersection-observer';
import { DifficultyIndicator } from './DifficultyIndicator';
import { ExpandMore as ExpandMoreIcon, VolumeUp as VolumeUpIcon, Mic as MicIcon, Stop as StopIcon, Info as InfoIcon, School as SchoolIcon, Brush as BrushIcon, Translate as TranslateIcon } from '@mui/icons-material';
import { Chip } from '@mui/material';
import { RecordVoiceOver as RecordVoiceOverIcon, CheckCircle as CheckCircleIcon, Error as ErrorIcon, Timer as TimerIcon, Help as HelpIcon } from '@mui/icons-material';
import QuizContent from './QuizContent';
import { openDB } from 'idb';
import { DictionaryItem as DictionaryItemType } from '../types/dictionary';
import { IDBPDatabase } from 'idb';
import { importDictionaryData } from '../utils/importDictionaryData';
import { KanjiComponent as KanjiComponentType } from '../types/quiz';
import { QuizState as ImportedQuizState } from '../types/quiz';
import { useLearning } from '../context/LearningContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { areWordsLoaded, waitForWords } from '../data/japaneseWords';
import { useSettings } from '../context/SettingsContext';
import { useNavigate } from 'react-router-dom';
import { calculateMastery } from '../utils/progress';
import { checkAchievements } from '../utils/achievements';
import {
  QuizWord,
  initializeQuizWordbank,
  getRandomQuizWords,
  waitForQuizWordbank
} from '../data/quizWordbank';
import {
  QuizQuestion,
  QuizSession,
  QuizProgress,
  QuizResult,
  QuizFeedback,
  QuizCategory,
  QuestionType
} from '../types/quiz';
import { styled } from '@mui/material/styles';
import { playSound } from '../utils/sound';
import { validateAnswer, getAccuracyFeedback, AnswerValidationResult } from '../utils/answerValidation';

// Define local types to avoid conflicts
type WordComparison = {
  word: JapaneseWord;
  similarWords: JapaneseWord[];
  differences: string[];
};

type PronunciationPractice = {
  word: JapaneseWord;
  userRecording: string;
  isCorrect: boolean;
  feedback: string;
};

type QuizType = 'multiple-choice' | 'writing';
type AnswerType = 'multiple-choice' | 'text' | 'audio';

// Add new types for quiz options
type QuizOption = {
  text: string;
  isCorrect: boolean;
  hint?: string;
};

// Add new types for enhanced quiz features
interface QuizFeedback {
  type: 'correct' | 'incorrect' | 'hint' | 'achievement' | 'error';
  message: string;
  animation?: string;
  sound?: string;
}

interface QuizAnimation {
  type: 'fade' | 'slide' | 'bounce' | 'scale';
  duration: number;
  delay?: number;
}

// Add new quiz modes
type QuizMode = QuizMode;

// Add new animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: {
      duration: 0.3,
      ease: "easeIn"
    }
  }
};

const buttonVariants = {
  hover: { 
    scale: 1.02,
    transition: { duration: 0.2 }
  },
  tap: { 
    scale: 0.98,
    transition: { duration: 0.1 }
  }
};

const progressVariants = {
  initial: { width: 0 },
  animate: { 
    width: "100%",
    transition: { duration: 0.5, ease: "easeInOut" }
  }
};

// Add new animation variants for pronunciation practice
const pronunciationVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  },
  pulse: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  recording: {
    scale: [1, 1.2, 1],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Add new types for pronunciation tips
interface PronunciationTip {
  title: string;
  description: string;
  examples: string[];
  commonMistakes: string[];
}

// Add pronunciation tips data
const pronunciationTips: Record<string, PronunciationTip> = {
  vowels: {
    title: "Vowel Length",
    description: "Japanese vowels can be short or long. Long vowels are held for approximately twice the duration of short vowels.",
    examples: [
      "おばさん (obasan) - aunt",
      "おばあさん (obaasan) - grandmother",
      "えき (eki) - station",
      "ええ (ee) - yes"
    ],
    commonMistakes: [
      "Shortening long vowels (おばあさん → おばさん)",
      "Not holding long vowels long enough",
      "Confusing similar vowel sounds (え vs い)"
    ]
  },
  pitch: {
    title: "Pitch Accent",
    description: "Japanese uses pitch accent rather than stress accent. The pitch of your voice should rise and fall in specific patterns.",
    examples: [
      "はし (hashi) - bridge (high-low)",
      "はし (hashi) - chopsticks (low-high)",
      "あめ (ame) - rain (high-low)",
      "あめ (ame) - candy (low-high)"
    ],
    commonMistakes: [
      "Using English stress patterns",
      "Not maintaining consistent pitch",
      "Over-emphasizing pitch changes"
    ]
  },
  consonants: {
    title: "Consonant Sounds",
    description: "Japanese consonants are generally softer than English ones. Pay special attention to the 'r' sound and double consonants.",
    examples: [
      "ら (ra) - softer than English 'r'",
      "っ (small tsu) - creates a pause",
      "き (ki) - sharper than English 'key'",
      "し (shi) - between 'she' and 'see'"
    ],
    commonMistakes: [
      "Using English 'r' sound",
      "Not pausing for double consonants",
      "Over-aspirating consonants"
    ]
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

// Add missing type definitions
type AchievementData = {
  type: 'quiz_completion';
  data: {
    score: number;
    streak: number;
    totalQuestions: number;
  };
};

type KanjiInfo = {
  components: KanjiComponent[];
  mnemonics: string[];
  strokeOrder: string[];
  usageContext: string[];
  radicals: string[];
  onyomi: string[];
  kunyomi: string[];
};

// Rename our local QuizState to avoid conflict
type LocalQuizState = {
  mode: QuizMode;
  currentQuestion: number;
  selectedAnswer: QuizOption | null;
  showFeedback: boolean;
  isCorrect: boolean | null;
  showCorrect: boolean;
  currentWord: DictionaryItem | null;
  questions: DictionaryItem[];
  score: number;
  totalQuestions: number;
  completed: boolean;
  markedForReview: Set<string>;
  skippedQuestions: Set<number>;
  mistakes: Array<{ word: DictionaryItem; userAnswer: string }>;
  practiceMode: boolean;
  wordStats: Record<string, WordStats>;
  showExamples: boolean;
  learnProgress: number;
  currentComparison: {
    word: DictionaryItem;
    similarWords: DictionaryItem[];
    differences: string[][];
  } | null;
  pronunciationPractice: {
    word: DictionaryItem;
    userRecording: string;
    isCorrect: boolean;
    feedback: string;
  } | null;
  streak: number;
  timeRemaining: number;
  reviewMode: boolean;
  reviewWords: DictionaryItem[];
  reviewIndex: number;
  showResults: boolean;
  results: {
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    timeSpent: number;
    averageResponseTime: number;
    streak: number;
    accuracy: number;
    wordsMastered: number;
    wordsNeedingReview: number;
    completionTime: number;
    score: number;
    level: number;
    experienceGained: number;
    achievements: Achievement[];
  };
  lastValidation?: AnswerValidationResult;
  showSuggestions: boolean;
  currentAnswer: string;
  isAnswered: boolean;
};

// Update theme classes type
interface ThemeClasses {
  container: string;
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
  card: string;
  button: {
    primary: string;
    secondary: string;
  };
  input: string;
  nav: {
    background: string;
    link: {
      default: string;
      active: string;
    };
  };
  checkbox: string;
  subtitle: string;
}

// Add proper type definitions
type WordUsage = {
  example: string;
  translation: string;
};

interface VocabularyQuizProps {
  onQuizComplete?: (wordId: string, isCorrect: boolean) => void;
  initialLevel?: number; // Optional initial level to start with
}

// Update the QuizSettings type to use the correct Difficulty type
type QuizSettings = QuizSettings;

// Add database check function
const isDictionaryInitialized = async (): Promise<boolean> => {
  try {
    const db = await openDB('DictionaryDB', 3);
    const tx = db.transaction('words', 'readonly');
    const store = tx.objectStore('words');
    const count = await store.count();
    return count > 0;
  } catch (error) {
    console.error('Error checking dictionary initialization:', error);
    return false;
  }
};

// Styled components
const QuizContainer = styled(Box)(({ theme }) => ({
  maxWidth: '800px',
  margin: '0 auto',
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

const QuestionCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  position: 'relative',
  overflow: 'visible',
}));

const AnswerButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'left',
  justifyContent: 'flex-start',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[2],
  },
}));

const ProgressBar = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '4px',
  backgroundColor: theme.palette.grey[200],
  borderRadius: '2px',
  overflow: 'hidden',
}));

const ProgressFill = styled(Box)<{ progress: number }>(({ theme, progress }) => ({
  width: `${progress}%`,
  height: '100%',
  backgroundColor: theme.palette.primary.main,
  transition: 'width 0.3s ease-in-out',
}));

// Default quiz settings
const defaultSettings: QuizSettings = {
  difficulty: 'medium',
  questionCount: 10,
  timeLimit: 30,
  allowHints: true,
  allowRetries: true,
  showExplanation: true,
  shuffleQuestions: true,
  includeAudio: true,
  includeWriting: true,
};

export const VocabularyQuiz: React.FC<VocabularyQuizProps> = ({
  onQuizComplete,
  initialLevel
}) => {
  const { theme } = useTheme();
  const { getWordsForCurrentLevel, getWordsByCategory, getWordsByJLPTLevel, getAllWords, calculateWordDifficulty, updateWordProgress } = useWordLevel();
  const { checkAchievements } = useAchievements();
  const { updateProgress } = useProgress();
  const { getWordsByLevel, getRecommendedWords } = useLearning();
  const { settings: accessibilitySettings } = useAccessibility();
  const { quizWords } = useWords();
  const [currentWords, setCurrentWords] = useState<JapaneseWord[]>([]);
  const [quizState, setQuizState] = useState<LocalQuizState>({
    mode: 'setup' as QuizMode,
    currentQuestion: 0,
    selectedAnswer: null,
    showFeedback: false,
    isCorrect: null,
    showCorrect: false,
    currentWord: null,
    questions: [],
    score: 0,
    totalQuestions: 0,
    completed: false,
    markedForReview: new Set<string>(),
    skippedQuestions: new Set<number>(),
    mistakes: [],
    practiceMode: false,
    wordStats: {},
    showExamples: false,
    learnProgress: 0,
    currentComparison: null,
    pronunciationPractice: null,
    streak: 0,
    timeRemaining: DEFAULT_QUIZ_SETTINGS.timeLimit || 30,
    reviewMode: false,
    reviewWords: [],
    reviewIndex: 0,
    showResults: false,
    results: {
      totalQuestions: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      timeSpent: 0,
      averageResponseTime: 0,
      streak: 0,
      accuracy: 0,
      wordsMastered: 0,
      wordsNeedingReview: 0,
      completionTime: 0,
      score: 0,
      level: initialLevel || 1,
      experienceGained: 0,
      achievements: []
    },
    lastValidation: undefined,
    showSuggestions: false,
    currentAnswer: '',
    isAnswered: false
  });

  // Initialize settings
  const [settings, setSettings] = useState<QuizSettings>({
    filterType: 'all',
    level: initialLevel || 1,
    category: 'all',
    jlptLevel: 'N5',
    questionCount: 10,
    includeLearned: true,
    includeUnlearned: true,
    showJLPTLevel: true,
    practiceMode: false,
    difficulty: 'all',
    showExamples: true,
    showRomaji: true,
    showHiragana: true,
    showKatakana: true,
    showKanjiInfo: true,
    useReviewMode: false,
    reviewSettings: {
      includeDueWords: false,
      includeNeedsReview: false,
      reviewThreshold: 0.5
    },
    timeLimit: 30
  });

  // Add new state for enhanced features
  const [feedback, setFeedback] = useState<QuizFeedback | null>(null);
  const [showPronunciation, setShowPronunciation] = useState(false);
  const [showWriting, setShowWriting] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [session, setSession] = useState<QuizSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  // Initialize quiz wordbank
  useEffect(() => {
    initializeQuizWordbank();
  }, []);

  // Update initialization effect
  useEffect(() => {
    const initializeQuiz = async () => {
      try {
        setIsInitializing(true);
        console.log('Initializing quiz...');
        
        // Check if dictionary is initialized
        const isInitialized = await isDictionaryInitialized();
        if (!isInitialized) {
          console.log('Dictionary not initialized, importing data...');
          const result = await importDictionaryData();
          if (!result.success) {
            throw new Error(result.error || 'Failed to import dictionary data');
          }
          console.log(`Successfully imported ${result.count} words`);
        }
        
        // Wait for words to be loaded
        if (!areWordsLoaded()) {
          console.log('Waiting for words to load...');
          await waitForWords();
        }
        
        console.log('Words loaded successfully');
        setIsInitializing(false);
        setError(null); // Clear any previous errors
      } catch (error) {
        console.error('Error initializing quiz:', error);
        setError(error instanceof Error ? error.message : 'Failed to load quiz words. Please refresh the page.');
        setIsInitializing(false);
      }
    };

    initializeQuiz();
  }, []);

  // Function to get available words based on settings
  const getAvailableWords = useCallback(() => {
    console.log('Getting available words...');
    console.log('Settings:', settings);
    
    let words: DictionaryItem[] = [];
    
    // First get words based on the main filter type
    switch (settings.filterType) {
      case 'level':
        words = getWordsForCurrentLevel();
        break;
      case 'category':
        words = getWordsByCategory(settings.category);
        break;
      case 'jlpt':
        words = getWordsByJLPTLevel(settings.jlptLevel);
        break;
      case 'all':
      default:
        words = getAllWords();
        break;
    }
    
    // Apply difficulty filter
    if (settings.difficulty !== 'all') {
      words = words.filter(word => {
        const wordDifficulty = calculateWordDifficulty(word);
        return wordDifficulty === settings.difficulty;
      });
    }
    
    // If review mode is enabled, filter words based on review settings
    if (settings.useReviewMode && settings.reviewSettings) {
      const reviewWords = getRecommendedWords(settings.questionCount);
      if (reviewWords.length > 0) {
        // Only use review words if there are enough available
        if (reviewWords.length >= settings.questionCount * 0.5) {
          words = reviewWords;
        } else {
          console.log('Not enough review words available, using regular word selection');
        }
      }
    }
    
    // Apply learned/unlearned filter
    if (!settings.includeLearned) {
      words = words.filter(word => !word.learningStatus?.isLearned);
    }
    if (!settings.includeUnlearned) {
      words = words.filter(word => word.learningStatus?.isLearned);
    }
    
    console.log('Available words:', words);
    return words;
  }, [
    settings,
    getWordsForCurrentLevel,
    getWordsByCategory,
    getWordsByJLPTLevel,
    getAllWords,
    calculateWordDifficulty,
    getRecommendedWords
  ]);

  // Function to start the quiz
  const handleStartQuiz = useCallback(() => {
    console.log('Starting quiz...');
    if (isInitializing) {
      console.log('Quiz is still initializing');
      setFeedback({
        type: 'hint',
        message: 'Please wait while the quiz is initializing...'
      });
      return;
    }

    if (initializationError) {
      console.log('Quiz initialization failed');
      setFeedback({
        type: 'error',
        message: initializationError
      });
      return;
    }

    setIsLoading(true);
    try {
      const availableWords = getAvailableWords();
      console.log('Available words count:', availableWords?.length);
      
      if (!availableWords || availableWords.length === 0) {
        console.log('No words available');
        setFeedback({
          type: 'hint',
          message: 'No words available for this level. Try adjusting your settings.'
        });
        setIsLoading(false);
        return;
      }

      // Select random words for the quiz
      const selectedWords = shuffleArray(availableWords).slice(0, settings.questionCount);
      console.log('Selected words:', selectedWords);
      
      if (selectedWords.length === 0) {
        console.log('No words selected');
        setFeedback({
          type: 'hint',
          message: 'Could not select words for the quiz. Please try again.'
        });
        setIsLoading(false);
        return;
      }

      setStartTime(new Date());
      setCurrentStreak(0);
      setTimeSpent(0);
      
      // Update quiz state with selected words
      const newState: LocalQuizState = {
        mode: 'quiz',  // Changed from 'active' to 'quiz'
        currentQuestion: 0,
        selectedAnswer: null,
        showFeedback: false,
        isCorrect: null,
        showCorrect: false,
        currentWord: selectedWords[0],
        questions: selectedWords,
        score: 0,
        totalQuestions: selectedWords.length,
        completed: false,
        markedForReview: new Set<string>(),
        skippedQuestions: new Set<number>(),
        mistakes: [],
        practiceMode: false,
        wordStats: {},
        showExamples: false,
        learnProgress: 0,
        currentComparison: null,
        pronunciationPractice: null,
        streak: 0,
        timeRemaining: settings.timeLimit,
        reviewMode: false,
        reviewWords: [],
        reviewIndex: 0,
        showResults: false,
        results: {
          totalQuestions: selectedWords.length,
          correctAnswers: 0,
          incorrectAnswers: 0,
          timeSpent: 0,
          averageResponseTime: 0,
          streak: 0,
          accuracy: 0,
          wordsMastered: 0,
          wordsNeedingReview: 0,
          completionTime: 0,
          score: 0,
          level: settings.level,
          experienceGained: 0,
          achievements: []
        },
        lastValidation: undefined,
        showSuggestions: false,
        currentAnswer: '',
        isAnswered: false
      };

      console.log('Setting new quiz state:', newState);
      setQuizState(newState);

      // Play start sound if enabled
      if (accessibilitySettings.screenReader) {
        playSound('quiz-start' as any);
      }
    } catch (error) {
      console.error('Error starting quiz:', error);
      setFeedback({
        type: 'error',
        message: 'Error starting quiz. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  }, [settings, isInitializing, initializationError, getAvailableWords, accessibilitySettings.screenReader, playSound]);

  // Function to handle answer selection
  const handleAnswer = useCallback((answer: string) => {
    if (!quizState.currentWord || quizState.showFeedback) return;

    // Check if we're in session-based quiz mode
    if (session && currentQuestion) {
      const isCorrect = answer === currentQuestion.correctAnswer;
      const timeSpent = settings.timeLimit ? settings.timeLimit - (timeLeft || 0) : 0;
      
      // Update feedback
      const newFeedback: QuizFeedback = {
        questionId: currentQuestion.id,
        userAnswer: answer,
        isCorrect,
        timeSpent,
        hintsUsed: session.progress.hintsUsed,
        retriesUsed: session.progress.retriesUsed,
        feedback: isCorrect ? 'Correct!' : `Incorrect. The correct answer is: ${currentQuestion.correctAnswer}`,
      };
      setFeedback(newFeedback);

      // Update session progress
      const newProgress: QuizProgress = {
        ...session.progress,
        correctAnswers: isCorrect ? session.progress.correctAnswers + 1 : session.progress.correctAnswers,
        incorrectAnswers: isCorrect ? session.progress.incorrectAnswers : session.progress.incorrectAnswers + 1,
        timeSpent: session.progress.timeSpent + timeSpent,
        currentStreak: isCorrect ? session.progress.currentStreak + 1 : 0,
        bestStreak: Math.max(session.progress.bestStreak, isCorrect ? session.progress.currentStreak + 1 : 0),
      };

      const newScore = isCorrect ? session.score + currentQuestion.points : session.score;
      
      setSession({
        ...session,
        score: newScore,
        progress: newProgress,
      });

      // Show explanation if enabled
      if (settings.showExplanation) {
        setShowExplanation(true);
      } else {
        moveToNextQuestion();
      }
    } else {
      // Original quiz state based handling
      const isCorrect = quizState.currentWord.meanings?.includes(answer) || false;
      const timeSpentOnQuestion = startTime 
        ? (new Date().getTime() - startTime.getTime()) / 1000 
        : 0;

      // Update streak
      if (isCorrect) {
        setCurrentStreak(prev => {
          const newStreak = prev + 1;
          if (newStreak > bestStreak) {
            setBestStreak(newStreak);
          }
          return newStreak;
        });
      } else {
        setCurrentStreak(0);
      }

      // Generate feedback
      const feedback: QuizFeedback = {
        type: isCorrect ? 'correct' : 'incorrect',
        message: isCorrect 
          ? `Correct! ${currentStreak > 2 ? `🔥 ${currentStreak} streak!` : ''}`
          : `Incorrect. The correct answer is: ${quizState.currentWord.meanings?.[0] || ''}`,
        animation: isCorrect ? 'bounce' : 'shake',
        sound: isCorrect ? 'correct.mp3' : 'incorrect.mp3'
      };

      // Update quiz state
      setQuizState(prev => {
        const newState = {
          ...prev,
          showFeedback: true,
          isCorrect,
          score: isCorrect ? prev.score + 1 : prev.score,
          mistakes: !isCorrect ? [...prev.mistakes, { word: prev.currentWord!, userAnswer: answer }] : prev.mistakes
        };

        // Check if quiz is complete
        if (prev.currentQuestion + 1 >= prev.totalQuestions) {
          newState.completed = true;
          newState.mode = 'completed' as QuizMode;
          if (onQuizComplete) {
            onQuizComplete(prev.currentWord!.id, isCorrect);
          }
        }

        return newState;
      });

      setFeedback(feedback);
      setStartTime(new Date());

      // Update progress and achievements using the imported checkAchievements
      updateProgress('vocabulary', quizState.currentWord!.id, isCorrect);
      checkAchievements('vocabulary', { type: 'quiz_completion', data: { score: isCorrect ? 1 : 0 } });
    }
  }, [
    quizState,
    session,
    currentQuestion,
    settings,
    timeLeft,
    startTime,
    currentStreak,
    bestStreak,
    accessibilitySettings.screenReader,
    playSound,
    onQuizComplete,
    updateProgress,
    checkAchievements,
    moveToNextQuestion
  ]);

  // Function to move to next question
  const handleNextQuestion = useCallback(() => {
    if (quizState.completed) return;

    setQuizState(prev => {
      const nextQuestion = prev.currentQuestion + 1;
      return {
        ...prev,
        currentQuestion: nextQuestion,
        currentWord: prev.questions[nextQuestion],
        showFeedback: false,
        isCorrect: null,
        showCorrect: false
      };
    });

    setFeedback(null);
    setStartTime(new Date());
  }, [quizState.completed]);

  // Function to render quiz setup
  const renderQuizSetup = () => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Quiz Setup
      </Typography>
      
      {isInitializing && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CircularProgress size={20} sx={{ mr: 1 }} />
          <Typography>Loading quiz words...</Typography>
        </Box>
      )}

      {initializationError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {initializationError}
        </Alert>
      )}

      {!isInitializing && !initializationError && (
        <>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Filter Type</InputLabel>
            <Select
              value={settings.filterType}
              onChange={(e) => setSettings(prev => ({ ...prev, filterType: e.target.value as QuizSettings['filterType'] }))}
              label="Filter Type"
            >
              <MenuItem value="all">All Words</MenuItem>
              <MenuItem value="level">By Level</MenuItem>
              <MenuItem value="category">By Category</MenuItem>
              <MenuItem value="jlpt">By JLPT Level</MenuItem>
            </Select>
          </FormControl>

          {settings.filterType === 'level' && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Level</InputLabel>
              <Select
                value={settings.level}
                onChange={(e) => setSettings(prev => ({ ...prev, level: Number(e.target.value) }))}
                label="Level"
              >
                {[1, 2, 3, 4, 5].map((level) => (
                  <MenuItem key={level} value={level}>
                    Level {level}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {settings.filterType === 'category' && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={settings.category}
                onChange={(e) => setSettings(prev => ({ ...prev, category: e.target.value }))}
                label="Category"
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="verbs">Verbs</MenuItem>
                <MenuItem value="adjectives">Adjectives</MenuItem>
                <MenuItem value="nouns">Nouns</MenuItem>
                <MenuItem value="adverbs">Adverbs</MenuItem>
                <MenuItem value="expressions">Expressions</MenuItem>
              </Select>
            </FormControl>
          )}

          {settings.filterType === 'jlpt' && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>JLPT Level</InputLabel>
              <Select
                value={settings.jlptLevel}
                onChange={(e) => setSettings(prev => ({ ...prev, jlptLevel: e.target.value }))}
                label="JLPT Level"
              >
                <MenuItem value="N5">N5</MenuItem>
                <MenuItem value="N4">N4</MenuItem>
                <MenuItem value="N3">N3</MenuItem>
                <MenuItem value="N2">N2</MenuItem>
                <MenuItem value="N1">N1</MenuItem>
              </Select>
            </FormControl>
          )}

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Number of Questions</InputLabel>
            <Select
              value={settings.questionCount}
              onChange={(e) => setSettings(prev => ({ ...prev, questionCount: Number(e.target.value) }))}
              label="Number of Questions"
            >
              {[5, 10, 15, 20].map((count) => (
                <MenuItem key={count} value={count}>
                  {count} Questions
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Difficulty</InputLabel>
            <Select
              value={settings.difficulty}
              onChange={(e) => setSettings(prev => ({ ...prev, difficulty: e.target.value as Difficulty }))}
              label="Difficulty"
            >
              <MenuItem value="all">All Difficulties</MenuItem>
              <MenuItem value="easy">Easy</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="hard">Hard</MenuItem>
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Checkbox
                checked={settings.useReviewMode}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  useReviewMode: e.target.checked,
                  reviewSettings: e.target.checked ? prev.reviewSettings : undefined
                }))}
              />
            }
            label="Enable Review Mode"
            sx={{ mb: 2 }}
          />

          {settings.useReviewMode && (
            <Collapse in={settings.useReviewMode}>
              <Box sx={{ pl: 2, mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={settings.reviewSettings?.includeDueWords}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        reviewSettings: {
                          ...prev.reviewSettings!,
                          includeDueWords: e.target.checked
                        }
                      }))}
                    />
                  }
                  label="Include Due Words"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={settings.reviewSettings?.includeNeedsReview}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        reviewSettings: {
                          ...prev.reviewSettings!,
                          includeNeedsReview: e.target.checked
                        }
                      }))}
                    />
                  }
                  label="Include Words Needing Review"
                />
                <FormControl fullWidth sx={{ mt: 1 }}>
                  <InputLabel>Review Threshold</InputLabel>
                  <Select
                    value={settings.reviewSettings?.reviewThreshold || 0.5}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      reviewSettings: {
                        ...prev.reviewSettings!,
                        reviewThreshold: Number(e.target.value)
                      }
                    }))}
                    label="Review Threshold"
                  >
                    <MenuItem value={0.3}>Low (30%)</MenuItem>
                    <MenuItem value={0.5}>Medium (50%)</MenuItem>
                    <MenuItem value={0.7}>High (70%)</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Collapse>
          )}

          <FormControlLabel
            control={
              <Checkbox
                checked={settings.includeLearned}
                onChange={(e) => setSettings(prev => ({ ...prev, includeLearned: e.target.checked }))}
              />
            }
            label="Include Learned Words"
            sx={{ mb: 1 }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={settings.includeUnlearned}
                onChange={(e) => setSettings(prev => ({ ...prev, includeUnlearned: e.target.checked }))}
              />
            }
            label="Include Unlearned Words"
            sx={{ mb: 2 }}
          />

          <Button
            variant="contained"
            color="primary"
            onClick={handleStartQuiz}
            disabled={isLoading || isInitializing}
            fullWidth
          >
            {isLoading ? 'Starting Quiz...' : 'Start Quiz'}
          </Button>
        </>
      )}
    </Box>
  );

  // Function to render quiz content
  const renderQuizContent = () => {
    if (!quizState.currentWord) return null;

    return (
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={cardVariants}
        className="quiz-content"
      >
        <div className="quiz-header">
          <div className="progress-info">
            <Typography variant="h6">
              Question {quizState.currentQuestion + 1} of {quizState.totalQuestions}
            </Typography>
            <Typography variant="h6">
              Score: {quizState.score}
            </Typography>
            {currentStreak > 0 && (
              <Typography variant="h6" className="streak">
                🔥 {currentStreak} streak
              </Typography>
            )}
          </div>
        </div>

        <motion.div
          className="word-card"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Typography variant="h4" className="word">
            {quizState.currentWord.japanese}
          </Typography>
          {quizState.currentWord.readings && quizState.currentWord.readings.length > 0 && (
            <Typography variant="subtitle1" className="reading">
              {quizState.currentWord.readings.join(', ')}
            </Typography>
          )}
          {settings.showRomaji && quizState.currentWord.romaji && (
            <Typography variant="subtitle2" className="romaji">
              {quizState.currentWord.romaji}
            </Typography>
          )}
        </motion.div>

        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`feedback ${feedback.type}`}
            >
              {feedback.message}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="answer-options">
          {generateAnswerOptions(quizState.currentWord, getWordsForCurrentLevel()).map((option, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAnswer(option.text)}
              className={`answer-option ${option.isCorrect ? 'correct' : ''}`}
              disabled={quizState.showFeedback}
            >
              {option.text}
            </motion.button>
          ))}
        </div>

        {quizState.showFeedback && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleNextQuestion}
              disabled={quizState.completed}
            >
              {quizState.completed ? 'Quiz Complete' : 'Next Question'}
            </Button>
          </Box>
        )}
      </motion.div>
    );
  };

  // Function to render quiz results
  const renderQuizResults = () => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Quiz Completed!
      </Typography>
      <Typography variant="h6" gutterBottom>
        Score: {quizState.score} out of {quizState.totalQuestions}
      </Typography>
      <Typography variant="body1" gutterBottom>
        Accuracy: {((quizState.score / quizState.totalQuestions) * 100).toFixed(1)}%
      </Typography>
      {quizState.mistakes.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Words to Review:
          </Typography>
          <List>
            {quizState.mistakes.map((mistake, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={mistake.word.japanese}
                  secondary={`Your answer: ${mistake.userAnswer}`}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setQuizState(prev => ({ ...prev, mode: 'setup' }))}
          fullWidth
        >
          Start New Quiz
        </Button>
      </Box>
    </Box>
  );

  // Update the answer options to handle meanings correctly
  const generateAnswerOptions = useCallback((word: DictionaryItem, allWords: DictionaryItem[]): QuizOption[] => {
    if (!word.meanings || word.meanings.length === 0) return [];

    const options: QuizOption[] = [];
    options.push({ text: word.meanings[0], isCorrect: true }); // Add the first meaning as a correct option

    // Get words for the current level to use as distractors
    const levelWords = getWordsForCurrentLevel();

    // Add incorrect options from other words
    while (options.length < 4) {
      const randomWord = levelWords[Math.floor(Math.random() * levelWords.length)];
      if (randomWord.id !== word.id && randomWord.meanings && randomWord.meanings.length > 0) {
        randomWord.meanings.forEach(meaning => {
          if (options.length < 4 && !options.some(opt => opt.text === meaning)) {
            options.push({ text: meaning, isCorrect: false });
          }
        });
      }
    }

    return shuffleArray(options);
  }, [getWordsForCurrentLevel]);

  // Update the state setter to use the correct type
  const updateQuizState = useCallback((updater: (prev: LocalQuizState) => Partial<LocalQuizState>) => {
    setQuizState(prev => ({
      ...prev,
      ...updater(prev)
    }));
  }, []);

  // Update the settings setter to use the correct type
  const updateQuizSettings = useCallback((updater: (prev: QuizSettings) => Partial<QuizSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...updater(prev)
    }));
  }, []);

  // Initialize quiz session
  const initializeSession = useCallback(async () => {
    try {
      await waitForQuizWordbank();
      
      // Get random words for the quiz
      const words = getRandomQuizWords(
        [], // Will be populated by quizWordbank
        settings.questionCount,
        {
          difficulty: settings.difficulty,
          category: settings.category,
        }
      );

      if (words.length < settings.questionCount) {
        throw new Error('Not enough words available for the quiz');
      }

      // Create questions from words
      const questions: QuizQuestion[] = words.map((word, index) => ({
        id: `q-${index}`,
        type: 'multiple-choice',
        word: word.kanji || word.kana,
        correctAnswer: word.english,
        options: generateOptions(word, words),
        hint: word.quizMetadata.hints[0],
        explanation: word.quizMetadata.usageNotes,
        difficulty: word.quizMetadata.difficulty,
        category: word.quizMetadata.category,
        points: calculatePoints(word.quizMetadata.difficulty),
      }));

      // Create new session
      const newSession: QuizSession = {
        id: `session-${Date.now()}`,
        startTime: new Date(),
        questions,
        currentQuestionIndex: 0,
        score: 0,
        totalPoints: questions.reduce((sum, q) => sum + q.points, 0),
        settings: settings,
        progress: {
          correctAnswers: 0,
          incorrectAnswers: 0,
          skippedQuestions: 0,
          timeSpent: 0,
          hintsUsed: 0,
          retriesUsed: 0,
          currentStreak: 0,
          bestStreak: 0,
        },
      };

      setSession(newSession);
      setCurrentQuestion(questions[0]);
      setTimeLeft(settings.timeLimit || null);
      setIsLoading(false);
      setError(null); // Clear any previous errors
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize quiz session');
      setIsLoading(false);
    }
  }, [settings]);

  // Start quiz
  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  // Timer effect
  useEffect(() => {
    if (!timeLeft || !session || isComplete) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(timer);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, session, isComplete]);

  // Generate answer options
  const generateOptions = (word: QuizWord, allWords: QuizWord[]): string[] => {
    const options = [word.english];
    const otherWords = allWords.filter(w => w.id !== word.id);
    
    while (options.length < 4 && otherWords.length > 0) {
      const randomIndex = Math.floor(Math.random() * otherWords.length);
      const randomWord = otherWords[randomIndex];
      
      if (!options.includes(randomWord.english)) {
        options.push(randomWord.english);
      }
      
      otherWords.splice(randomIndex, 1);
    }
    
    return options.sort(() => Math.random() - 0.5);
  };

  // Calculate points based on difficulty
  const calculatePoints = (difficulty: Difficulty): number => {
    switch (difficulty) {
      case 'easy': return 1;
      case 'medium': return 2;
      case 'hard': return 3;
      case 'expert': return 4;
      default: return 1;
    }
  };

  // Handle timeout
  const handleTimeout = () => {
    if (!session || !currentQuestion) return;

    const newProgress: QuizProgress = {
      ...session.progress,
      skippedQuestions: session.progress.skippedQuestions + 1,
      timeSpent: session.progress.timeSpent + (settings.timeLimit || 0),
      currentStreak: 0,
    };

    setSession({
      ...session,
      progress: newProgress,
    });

    setFeedback({
      questionId: currentQuestion.id,
      userAnswer: '',
      isCorrect: false,
      timeSpent: settings.timeLimit || 0,
      hintsUsed: session.progress.hintsUsed,
      retriesUsed: session.progress.retriesUsed,
      feedback: 'Time\'s up!',
    });

    if (settings.showExplanation) {
      setShowExplanation(true);
    } else {
      moveToNextQuestion();
    }
  };

  // Move to next question
  const moveToNextQuestion = () => {
    if (!session) return;

    const nextIndex = session.currentQuestionIndex + 1;
    
    if (nextIndex >= session.questions.length) {
      completeQuiz();
    } else {
      setCurrentQuestion(session.questions[nextIndex]);
      setSession({
        ...session,
        currentQuestionIndex: nextIndex,
      });
      setUserAnswer('');
      setFeedback(null);
      setShowExplanation(false);
      setTimeLeft(settings.timeLimit || null);
    }
  };

  // Complete quiz
  const completeQuiz = () => {
    if (!session) return;

    playSound('quiz-complete.mp3' as any);

    const result: QuizResult = {
      sessionId: session.id,
      score: session.score,
      totalPoints: session.totalPoints,
      accuracy: (session.progress.correctAnswers / session.questions.length) * 100,
      timeSpent: session.progress.timeSpent,
      completedQuestions: session.questions.length,
      correctAnswers: session.progress.correctAnswers,
      incorrectAnswers: session.progress.incorrectAnswers,
      skippedQuestions: session.progress.skippedQuestions,
      hintsUsed: session.progress.hintsUsed,
      retriesUsed: session.progress.retriesUsed,
      bestStreak: session.progress.bestStreak,
      difficulty: settings.difficulty,
      category: settings.category,
      startTime: session.startTime,
      endTime: new Date(),
      performance: calculatePerformance(session),
    };

    // Update progress
    updateProgress({
      quizzesCompleted: 1,
      wordsLearned: session.progress.correctAnswers,
      timeSpent: session.progress.timeSpent,
      accuracy: result.accuracy,
    });

    // Check achievements
    checkAchievements(result, checkAchievements);

    // Update word progress
    session.questions.forEach((question, index) => {
      const word = session.questions[index];
      if (word) {
        const mastery = calculateMastery(
          session.progress.correctAnswers,
          session.progress.incorrectAnswers,
          session.progress.timeSpent
        );
        updateWordProgress(word.id, mastery);
      }
    });

    setIsComplete(true);
    onQuizComplete?.(session.id, result.score === session.totalPoints);
  };

  // Calculate performance metrics
  const calculatePerformance = (session: QuizSession) => {
    const byCategory: Record<QuizCategory, { correct: number; total: number; accuracy: number }> = {} as any;
    const byDifficulty: Record<Difficulty, { correct: number; total: number; accuracy: number }> = {} as any;

    session.questions.forEach(question => {
      // Category performance
      if (!byCategory[question.category]) {
        byCategory[question.category] = { correct: 0, total: 0, accuracy: 0 };
      }
      byCategory[question.category].total++;
      if (session.progress.correctAnswers > 0) {
        byCategory[question.category].correct++;
      }
      byCategory[question.category].accuracy =
        byCategory[question.category].total > 0 ? (byCategory[question.category].correct / byCategory[question.category].total) * 100 : 0;

      // Difficulty performance
      if (!byDifficulty[question.difficulty]) {
        byDifficulty[question.difficulty] = { correct: 0, total: 0, accuracy: 0 };
      }
      byDifficulty[question.difficulty].total++;
      if (session.progress.correctAnswers > 0) {
        byDifficulty[question.difficulty].correct++;
      }
      byDifficulty[question.difficulty].accuracy =
        byDifficulty[question.difficulty].total > 0 ? (byDifficulty[question.difficulty].correct / byDifficulty[question.difficulty].total) * 100 : 0;
    });

    return { byCategory, byDifficulty };
  };

  // Render loading state
  if (isLoading) {
    return (
      <QuizContainer>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </QuizContainer>
    );
  }

  // Render error state
  if (error) {
    return (
      <QuizContainer>
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => {
          setError(null);
          setIsInitializing(true);
          initializeSession();
        }}>
          Retry
        </Button>
      </QuizContainer>
    );
  }

  // Render quiz completion
  if (isComplete && session) {
    const result: QuizResult = {
      sessionId: session.id,
      score: session.score,
      totalPoints: session.totalPoints,
      accuracy: (session.progress.correctAnswers / session.questions.length) * 100,
      timeSpent: session.progress.timeSpent,
      completedQuestions: session.questions.length,
      correctAnswers: session.progress.correctAnswers,
      incorrectAnswers: session.progress.incorrectAnswers,
      skippedQuestions: session.progress.skippedQuestions,
      hintsUsed: session.progress.hintsUsed,
      retriesUsed: session.progress.retriesUsed,
      bestStreak: session.progress.bestStreak,
      difficulty: settings.difficulty,
      category: settings.category,
      startTime: session.startTime,
      endTime: new Date(),
      performance: calculatePerformance(session),
    };

    return (
      <QuizContainer>
        <Card>
          <Box p={3}>
            <Typography variant="h4" gutterBottom>
              Quiz Complete!
            </Typography>
            <Typography variant="h6" gutterBottom>
              Score: {result.score} / {result.totalPoints}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Accuracy: {result.accuracy.toFixed(1)}%
            </Typography>
            <Typography variant="body1" gutterBottom>
              Time Spent: {Math.floor(result.timeSpent / 60)}m {result.timeSpent % 60}s
            </Typography>
            <Typography variant="body1" gutterBottom>
              Best Streak: {result.bestStreak}
            </Typography>
            <Box mt={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/vocabulary')}
                sx={{ mr: 1 }}
              >
                Back to Vocabulary
              </Button>
              <Button
                variant="outlined"
                onClick={initializeSession}
              >
                Try Again
              </Button>
            </Box>
          </Box>
        </Card>
      </QuizContainer>
    );
  }

  // Render current question
  if (!currentQuestion || !session) return null;

  return (
    <QuizContainer>
      <ProgressBar>
        <ProgressFill
          progress={(session.currentQuestionIndex / session.questions.length) * 100}
        />
      </ProgressBar>

      <Typography variant="h6">
        Question {session.currentQuestionIndex + 1} of {session.questions.length}
      </Typography>

      <QuestionCard>
        <Typography variant="h5" gutterBottom>
          {currentQuestion.word}
        </Typography>

        {timeLeft !== null && (
          <Typography variant="body2" color="textSecondary">
            Time Left: {timeLeft}s
          </Typography>
        )}

        <Box display="flex" flexDirection="column" gap={1}>
          {currentQuestion.options?.map((option, index) => (
            <AnswerButton
              key={index}
              variant="outlined"
              fullWidth
              onClick={() => handleAnswer(option)}
              disabled={!!feedback}
              sx={{
                backgroundColor: feedback
                  ? option === currentQuestion.correctAnswer
                    ? 'success.light'
                    : option === feedback.userAnswer
                    ? 'error.light'
                    : 'transparent'
                  : 'transparent',
              }}
            >
              {option}
            </AnswerButton>
          ))}
        </Box>

        {feedback && showExplanation && (
          <Box mt={2}>
            <Typography variant="body1" color={feedback.isCorrect ? 'success.main' : 'error.main'}>
              {feedback.feedback}
            </Typography>
            {currentQuestion.explanation && (
              <Typography variant="body2" color="textSecondary" mt={1}>
                {currentQuestion.explanation}
              </Typography>
            )}
            <Button
              variant="contained"
              onClick={moveToNextQuestion}
              sx={{ mt: 2 }}
            >
              Next Question
            </Button>
          </Box>
        )}
      </QuestionCard>

      <Snackbar
        open={!!feedback && !showExplanation}
        autoHideDuration={2000}
        onClose={() => setFeedback(null)}
      >
        <Alert
          severity={feedback?.isCorrect ? 'success' : 'error'}
          onClose={() => setFeedback(null)}
        >
          {feedback?.feedback}
        </Alert>
      </Snackbar>

      {quizState.isAnswered && quizState.lastValidation && (
        <div className={`answer-feedback ${quizState.lastValidation.isCorrect ? 'correct' : 'incorrect'}`}>
          <p>{quizState.lastValidation.feedback}</p>
          {quizState.lastValidation.matchedMeaning && (
            <p className="matched-meaning">Matched: {quizState.lastValidation.matchedMeaning}</p>
          )}
          {quizState.showSuggestions && quizState.lastValidation.suggestions && (
            <div className="suggestions">
              <p>Did you mean:</p>
              <ul>
                {quizState.lastValidation.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="accuracy-feedback">
            {getAccuracyFeedback(quizState.lastValidation.accuracy)}
          </p>
        </div>
      )}
    </QuizContainer>
  );
};

export default VocabularyQuiz; 