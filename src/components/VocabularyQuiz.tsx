import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { allWords } from '../data/japaneseWords';
import { useProgress } from '../context/ProgressContext';
import { useSound } from '../context/SoundContext';
import { useWordLevel } from '../context/WordLevelContext';
import { useAchievements } from '../context/AchievementContext';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, Button, Alert, LinearProgress, Tooltip, Card, CardContent, Checkbox, FormControlLabel, Collapse, IconButton, List, ListItem, ListItemText, Tabs, Tab, Divider } from '@mui/material';
import { playAudio, playDynamicAudio } from '../utils/audio';
import { useHotkeys } from 'react-hotkeys-hook';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { DifficultyIndicator } from './DifficultyIndicator';
import { ExpandMore as ExpandMoreIcon, VolumeUp as VolumeUpIcon, Mic as MicIcon, Stop as StopIcon, Info as InfoIcon, School as SchoolIcon, Brush as BrushIcon, Translate as TranslateIcon } from '@mui/icons-material';
import { Chip } from '@mui/material';
import { RecordVoiceOver as RecordVoiceOverIcon, CheckCircle as CheckCircleIcon, Error as ErrorIcon, Timer as TimerIcon, Help as HelpIcon } from '@mui/icons-material';

type Difficulty = 'easy' | 'medium' | 'hard' | 'extraHard';
type QuizType = 'multiple-choice' | 'writing';
type AnswerType = 'romaji' | 'english';
type QuizMode = 'setup' | 'quiz' | 'result' | 'review' | 'learn' | 'pronunciation' | 'comparison';

interface WordComparison {
  word: any;
  similarWords: any[];
  differences: string[];
}

interface PronunciationPractice {
  word: any;
  userRecording: string | null;
  isCorrect: boolean | null;
  feedback: string | null;
}

interface KanjiComponent {
  character: string;
  meaning: string;
  reading: string;
  position: string;
}

interface KanjiInfo {
  components: KanjiComponent[];
  mnemonics: string[];
  strokeOrder: string[];
  usageContext: string[];
  radicals: string[];
  onyomi: string[];
  kunyomi: string[];
}

interface QuizSettings {
  category: string;
  difficulty: Difficulty;
  questionCount: number;
  quizType: QuizType;
  answerType: AnswerType;
  level: number;
  practiceMode: boolean;
  showExamples: boolean;
  learnMode: boolean;
  showJLPTLevel: boolean;
  pronunciationMode: boolean;
  comparisonMode: boolean;
  showSimilarWords: boolean;
  showKanjiInfo: boolean;
  showStrokeOrder: boolean;
  showMnemonics: boolean;
  showComponents: boolean;
}

interface WordStats {
  correctAnswers: number;
  incorrectAnswers: number;
  lastSeen: Date | null;
  nextReview: Date | null;
  reviewCount: number;
}

interface QuizState {
  mode: QuizMode;
  currentQuestion: number;
  selectedAnswer: number | null;
  showFeedback: boolean;
  isCorrect: boolean | null;
  showCorrect: boolean;
  currentWord: any | null;
  questions: any[];
  score: number;
  totalQuestions: number;
  completed: boolean;
  markedForReview: Set<number>;
  skippedQuestions: Set<number>;
  mistakes: Array<{
    word: any;
    userAnswer: string;
    correctAnswer: string;
    questionIndex: number;
  }>;
  practiceMode: boolean;
  wordStats: Record<string, WordStats>;
  showExamples: boolean;
  learnProgress: number;
  currentComparison: WordComparison | null;
  pronunciationPractice: PronunciationPractice | null;
}

interface WordDifficulty {
  [key: string]: {
    correct: number;
    incorrect: number;
    lastSeen: number;
  };
}

const INITIAL_WORD_STATS: WordStats = {
  correctAnswers: 0,
  incorrectAnswers: 0,
  lastSeen: null,
  nextReview: null,
  reviewCount: 0
};

const SPACED_REPETITION_INTERVALS = [
  1, // 1 day
  3, // 3 days
  7, // 1 week
  14, // 2 weeks
  30, // 1 month
  90, // 3 months
  180 // 6 months
];

const DEFAULT_QUIZ_SETTINGS: QuizSettings = {
  category: 'all',
  difficulty: 'easy',
  questionCount: 10,
  quizType: 'multiple-choice',
  answerType: 'romaji',
  level: 1,
  practiceMode: false,
  showExamples: true,
  learnMode: false,
  showJLPTLevel: true,
  pronunciationMode: false,
  comparisonMode: false,
  showSimilarWords: true,
  showKanjiInfo: true,
  showStrokeOrder: true,
  showMnemonics: true,
  showComponents: true
};

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

const VocabularyQuiz: React.FC = () => {
  const { isDarkMode, getThemeClasses } = useTheme();
  const { settings: appSettings } = useApp();
  const { updateProgress, progress } = useProgress();
  const { currentLevel, unlockedLevels } = useWordLevel();
  const { playSound } = useSound();
  const { checkAchievements } = useAchievements();
  const themeClasses = getThemeClasses();

  const [settings, setSettings] = useState<QuizSettings>(DEFAULT_QUIZ_SETTINGS);

  const [quizState, setQuizState] = useState<QuizState>({
    mode: 'setup',
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
    markedForReview: new Set(),
    skippedQuestions: new Set(),
    mistakes: [],
    practiceMode: false,
    wordStats: {},
    showExamples: false,
    learnProgress: 0,
    currentComparison: null,
    pronunciationPractice: null
  });

  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [wordDifficulties, setWordDifficulties] = useState<WordDifficulty>({});
  const [showAnimation, setShowAnimation] = useState(false);
  const [learnModeWords, setLearnModeWords] = useState<any[]>([]);
  const [recording, setRecording] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [activeKanjiTab, setActiveKanjiTab] = useState(0);

  const [ref, inView] = useInView({ triggerOnce: true });
  const controls = useAnimation();

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [inView, controls]);

  // Add debug effect for quiz state
  useEffect(() => {
    console.log('Quiz State Updated:', {
      mode: quizState.mode,
      currentQuestion: quizState.currentQuestion,
      showFeedback: quizState.showFeedback,
      isCorrect: quizState.isCorrect,
      questions: quizState.questions.length,
      currentWord: quizState.currentWord,
      score: quizState.score,
      totalQuestions: quizState.totalQuestions
    });
  }, [quizState]);

  // Add debug effect for quiz initialization
  useEffect(() => {
    if (quizState.mode === 'quiz') {
      console.log('Quiz Initialized:', {
        totalQuestions: quizState.totalQuestions,
        currentWord: quizState.currentWord,
        questions: quizState.questions,
        settings: settings
      });
    }
  }, [quizState.mode, quizState.totalQuestions, quizState.currentWord, quizState.questions, settings]);

  // Get available categories
  const getAvailableCategories = useCallback(() => {
    const categorySet = new Set<string>();
    allWords.forEach(word => {
      if (word.category && word.category !== 'hiragana' && word.category !== 'katakana') {
        categorySet.add(word.category);
      }
    });
    return Array.from(categorySet).map(cat => ({ 
      id: cat, 
      name: cat.charAt(0).toUpperCase() + cat.slice(1) 
    }));
  }, []);

  const [categories] = useState(getAvailableCategories());

  // Filter words based on settings
  const getFilteredWords = useCallback(() => {
    return allWords.filter(word => {
      // Filter by level
      if (word.level > settings.level) {
        return false;
      }

      // Filter by category
      if (settings.category !== 'all' && word.category !== settings.category) {
        return false;
      }

      return true;
    });
  }, [settings.category, settings.level]);

  const handleStartQuiz = useCallback(() => {
    const filteredWords = getFilteredWords();
    console.log('Starting Quiz:', {
      filteredWordsCount: filteredWords.length,
      settings: settings,
      questionCount: settings.questionCount
    });

    if (filteredWords.length === 0) {
      alert('No words available for the selected settings. Please try different settings.');
      return;
    }

    // Use improved randomization
    const selectedQuestions = getRandomSubset(filteredWords, settings.questionCount);

    console.log('Selected Questions:', {
      count: selectedQuestions.length,
      firstWord: selectedQuestions[0]
    });

    setQuizState(prev => {
      const newState = {
        mode: 'quiz',
        currentQuestion: 0,
        selectedAnswer: null,
        showFeedback: false,
        isCorrect: null,
        showCorrect: false,
        currentWord: selectedQuestions[0],
        questions: selectedQuestions,
        score: 0,
        totalQuestions: selectedQuestions.length,
        completed: false,
        markedForReview: new Set(),
        skippedQuestions: new Set(),
        mistakes: [],
        practiceMode: settings.practiceMode,
        wordStats: {},
        showExamples: false,
        learnProgress: 0,
        currentComparison: null,
        pronunciationPractice: null
      };
      console.log('Setting New Quiz State:', newState);
      return newState;
    });

    setScore(0);
    setCurrentStreak(0);
    setBestStreak(0);
  }, [getFilteredWords, settings.questionCount, settings.practiceMode, settings]);

  const generateOptions = useCallback((correctWord: any, allWords: any[]) => {
    const otherWords = allWords.filter(word => 
      word.category === correctWord.category && 
      word.english !== correctWord.english
    );
    // Use improved randomization for options
    const selectedOptions = getRandomSubset(otherWords, 3).map(word => word.english);
    return shuffleArray([...selectedOptions, correctWord.english]);
  }, []);

  const calculateWordDifficulty = useCallback((word: string) => {
    const stats = wordDifficulties[word] || { correct: 0, incorrect: 0, lastSeen: 0 };
    const total = stats.correct + stats.incorrect;
    if (total === 0) return 'neutral';
    const accuracy = stats.correct / total;
    if (accuracy >= 0.8) return 'easy';
    if (accuracy >= 0.5) return 'medium';
    return 'hard';
  }, [wordDifficulties]);

  const updateWordDifficulty = useCallback((word: string, isCorrect: boolean) => {
    setWordDifficulties(prev => {
      const current = prev[word] || { correct: 0, incorrect: 0, lastSeen: 0 };
      return {
        ...prev,
        [word]: {
          correct: isCorrect ? current.correct + 1 : current.correct,
          incorrect: isCorrect ? current.incorrect : current.incorrect + 1,
          lastSeen: Date.now()
        }
      };
    });
  }, []);

  const updateWordStats = useCallback((wordId: string, isCorrect: boolean) => {
    setQuizState(prev => {
      const currentStats = prev.wordStats[wordId] || { ...INITIAL_WORD_STATS };
      const now = new Date();
      
      const newStats: WordStats = {
        ...currentStats,
        correctAnswers: isCorrect ? currentStats.correctAnswers + 1 : currentStats.correctAnswers,
        incorrectAnswers: !isCorrect ? currentStats.incorrectAnswers + 1 : currentStats.incorrectAnswers,
        lastSeen: now,
        reviewCount: currentStats.reviewCount + 1
      };

      // Calculate next review date based on spaced repetition
      const intervalIndex = Math.min(
        Math.floor(newStats.correctAnswers / 2),
        SPACED_REPETITION_INTERVALS.length - 1
      );
      const daysToAdd = SPACED_REPETITION_INTERVALS[intervalIndex];
      newStats.nextReview = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

      return {
        ...prev,
        wordStats: {
          ...prev.wordStats,
          [wordId]: newStats
        }
      };
    });
  }, []);

  const getWordsDueForReview = useCallback(() => {
    const now = new Date();
    return quizState.questions.filter(word => {
      const stats = quizState.wordStats[word.japanese] || INITIAL_WORD_STATS;
      if (!stats.nextReview) return true; // Words without a next review date should be included
      return stats.nextReview <= now;
    });
  }, [quizState.questions, quizState.wordStats]);

  const handleStartReviewQuiz = useCallback(() => {
    const wordsToReview = getWordsDueForReview();
    const selectedWords = wordsToReview.length > 0 
      ? wordsToReview 
      : quizState.questions.filter(word => !quizState.wordStats[word.japanese]?.nextReview);
    
    // Use improved randomization for review quiz
    const quizWords = getRandomSubset(selectedWords, settings.questionCount);

    setQuizState({
      mode: 'quiz',
      currentQuestion: 0,
      selectedAnswer: null,
      showFeedback: false,
      isCorrect: null,
      showCorrect: false,
      currentWord: quizWords[0],
      questions: quizWords,
      score: 0,
      totalQuestions: quizWords.length,
      completed: false,
      markedForReview: new Set(),
      skippedQuestions: new Set(),
      mistakes: [],
      practiceMode: settings.practiceMode,
      wordStats: { ...quizState.wordStats },
      showExamples: false,
      learnProgress: 0,
      currentComparison: null,
      pronunciationPractice: null
    });
  }, [getWordsDueForReview, settings.questionCount, settings.practiceMode, quizState.questions, quizState.wordStats]);

  const checkAnswer = useCallback((answer: string) => {
    console.log('Checking Answer:', {
      answer,
      currentWord: quizState.currentWord,
      showFeedback: quizState.showFeedback,
      mode: quizState.mode
    });

    if (quizState.mode !== 'quiz' || !quizState.currentWord) {
      console.log('Invalid quiz state for checking answer');
      return;
    }

    if (quizState.showFeedback) {
      console.log('Already showing feedback, ignoring answer check');
      return;
    }

    const currentWord = quizState.currentWord;
    let isCorrect = false;

    // Normalize answers for comparison
    const normalizeAnswer = (ans: string) => ans.toLowerCase().trim();
    const normalizedUserAnswer = normalizeAnswer(answer);
    const normalizedCorrectAnswer = normalizeAnswer(currentWord.english);
    const normalizedRomaji = normalizeAnswer(currentWord.romaji);

    // Check if answer matches either English or romaji
    isCorrect = normalizedUserAnswer === normalizedCorrectAnswer || 
                normalizedUserAnswer === normalizedRomaji;
    
    console.log('Answer Check Result:', {
      userAnswer: normalizedUserAnswer,
      correctAnswer: normalizedCorrectAnswer,
      romaji: normalizedRomaji,
      isCorrect
    });

    // Update word stats first
    updateWordStats(currentWord.japanese, isCorrect);

    // Batch state updates together
    const newState = {
      ...quizState,
      showFeedback: true,
      isCorrect,
      selectedAnswer: answer,
      score: isCorrect ? quizState.score + 1 : quizState.score,
      mistakes: !quizState.practiceMode && !isCorrect 
        ? [...quizState.mistakes, {
            word: currentWord,
            userAnswer: answer,
            correctAnswer: currentWord.english,
            questionIndex: quizState.currentQuestion
          }]
        : quizState.mistakes
    };

    console.log('Updating quiz state with feedback:', newState);
    setQuizState(newState);

    // Update streak
    if (isCorrect) {
      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      if (newStreak > bestStreak) {
        setBestStreak(newStreak);
      }
    } else {
      setCurrentStreak(0);
    }

    // Update progress and achievements
    updateProgress('vocabulary', currentWord.japanese, isCorrect);
    updateWordDifficulty(currentWord.japanese, isCorrect);
    
    const masteredWords = Object.values(progress)
      .filter(p => p.section === 'vocabulary' && p.correct >= 3)
      .length;
    checkAchievements('vocabulary', masteredWords);

    setShowAnimation(true);
    setTimeout(() => setShowAnimation(false), 1000);

    // Play appropriate sound
    playSound(isCorrect ? 'correct' : 'incorrect');
  }, [quizState, progress, checkAchievements, updateProgress, updateWordDifficulty, playSound, currentStreak, bestStreak]);

  const handleNextQuestion = useCallback(() => {
    console.log('Handling Next Question:', {
      showFeedback: quizState.showFeedback,
      currentQuestion: quizState.currentQuestion,
      totalQuestions: quizState.questions.length,
      mode: quizState.mode
    });

    if (quizState.mode !== 'quiz') {
      console.log('Not in quiz mode, ignoring next question');
      return;
    }

    if (!quizState.showFeedback) {
      console.log('Cannot proceed: Feedback not shown');
      return;
    }

    if (quizState.currentQuestion + 1 >= quizState.questions.length) {
      console.log('Quiz completed, showing results');
      const newState = {
        ...quizState,
        mode: 'result',
        completed: true
      };
      console.log('Updating state for results:', newState);
      setQuizState(newState);
      return;
    }

    const nextQuestionIndex = quizState.currentQuestion + 1;
    const newState = {
      ...quizState,
      currentQuestion: nextQuestionIndex,
      currentWord: quizState.questions[nextQuestionIndex],
      showFeedback: false,
      isCorrect: null,
      showCorrect: false,
      selectedAnswer: null,
      showExamples: false
    };
    console.log('Updating state for next question:', newState);
    setQuizState(newState);
    setUserAnswer('');
  }, [quizState]);

  const handleRestart = useCallback(() => {
    setQuizState({
      mode: 'setup',
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
      markedForReview: new Set(),
      skippedQuestions: new Set(),
      mistakes: [],
      practiceMode: false,
      wordStats: {},
      showExamples: false,
      learnProgress: 0,
      currentComparison: null,
      pronunciationPractice: null
    });
    setScore(0);
    setCurrentStreak(0);
    setBestStreak(0);
    setUserAnswer('');
  }, []);

  const handlePlayAudio = (japanese: string) => {
    playAudio(japanese);
  };

  // Add keyboard shortcuts
  useHotkeys('1,2,3,4', (e) => {
    if (quizState.mode === 'quiz' && !quizState.showFeedback) {
      const index = parseInt(e.key) - 1;
      if (index >= 0 && index < 4) {
        const options = generateOptions(quizState.currentWord, quizState.questions);
        checkAnswer(options[index]);
      }
    }
  });

  useHotkeys('enter', () => {
    if (quizState.mode === 'quiz' && quizState.showFeedback) {
      handleNextQuestion();
    }
  });

  useHotkeys('s', () => {
    if (quizState.mode === 'quiz' && !quizState.showFeedback) {
      handleSkipQuestion();
    }
  });

  useHotkeys('m', () => {
    if (quizState.mode === 'quiz') {
      toggleMarkForReview();
    }
  });

  const handleSkipQuestion = useCallback(() => {
    if (quizState.mode !== 'quiz' || quizState.showFeedback) return;

    setQuizState(prev => ({
      ...prev,
      skippedQuestions: new Set([...prev.skippedQuestions, prev.currentQuestion]),
      showFeedback: true,
      isCorrect: false,
      showCorrect: true
    }));

    setCurrentStreak(0);
    playSound('incorrect');
  }, [quizState.mode, quizState.showFeedback, playSound]);

  const toggleMarkForReview = useCallback(() => {
    if (quizState.mode !== 'quiz') return;

    setQuizState(prev => {
      const newMarkedForReview = new Set(prev.markedForReview);
      if (newMarkedForReview.has(prev.currentQuestion)) {
        newMarkedForReview.delete(prev.currentQuestion);
      } else {
        newMarkedForReview.add(prev.currentQuestion);
      }
      return { ...prev, markedForReview: newMarkedForReview };
    });
  }, [quizState.mode]);

  const startReviewMistakes = useCallback(() => {
    if (quizState.mistakes.length === 0) return;

    const reviewQuestions = quizState.mistakes.map(mistake => mistake.word);
    setQuizState(prev => ({
      ...prev,
      mode: 'review',
      currentQuestion: 0,
      selectedAnswer: null,
      showFeedback: false,
      isCorrect: null,
      showCorrect: false,
      currentWord: reviewQuestions[0],
      questions: reviewQuestions,
      score: 0,
      totalQuestions: reviewQuestions.length,
      completed: false,
      mistakes: [],
      practiceMode: true
    }));
  }, [quizState.mistakes]);

  const renderProgressBar = () => {
    if (quizState.mode !== 'quiz') return null;

    const progress = ((quizState.currentQuestion + 1) / quizState.questions.length) * 100;
    const skippedCount = quizState.skippedQuestions.size;
    const markedCount = quizState.markedForReview.size;

    return (
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <div className={`text-sm ${themeClasses.text}`}>
            Progress: {quizState.currentQuestion + 1}/{quizState.questions.length}
          </div>
          <div className="flex gap-4">
            {skippedCount > 0 && (
              <Tooltip title="Skipped Questions">
                <span className={`text-sm ${isDarkMode ? 'text-neon-pink' : 'text-red-500'}`}>
                  ⏭️ {skippedCount}
                </span>
              </Tooltip>
            )}
            {markedCount > 0 && (
              <Tooltip title="Marked for Review">
                <span className={`text-sm ${isDarkMode ? 'text-neon-blue' : 'text-blue-500'}`}>
                  📌 {markedCount}
                </span>
              </Tooltip>
            )}
          </div>
        </div>
        <LinearProgress 
          variant="determinate" 
          value={progress}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: isDarkMode ? '#0095ff' : '#1976d2',
            }
          }}
        />
      </div>
    );
  };

  const renderFeedbackAnimation = () => (
    <AnimatePresence>
      {showAnimation && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 ${
            quizState.isCorrect 
              ? isDarkMode ? 'text-neon-blue' : 'text-green-500'
              : isDarkMode ? 'text-neon-pink' : 'text-red-500'
          }`}
        >
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: quizState.isCorrect ? [0, 10, -10, 0] : [0, -10, 10, 0]
            }}
            transition={{ duration: 0.5 }}
            className="text-6xl"
          >
            {quizState.isCorrect ? '✓' : '✗'}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderExamples = (word: any) => {
    if (!word.examples || word.examples.length === 0) return null;

    return (
      <Collapse in={quizState.showExamples}>
        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            Example Sentences
          </Typography>
          {word.examples.map((example, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Typography variant="body1" sx={{ fontFamily: 'Noto Sans JP' }}>
                {example}
              </Typography>
            </Box>
          ))}
        </Box>
      </Collapse>
    );
  };

  const renderKanjiInfo = (word: any) => {
    const kanji = extractKanji(word.japanese);
    if (kanji.length === 0) return null;

    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Kanji Information
        </Typography>
        <Tabs
          value={activeKanjiTab}
          onChange={(_, newValue) => setActiveKanjiTab(newValue)}
          sx={{ mb: 2 }}
        >
          <Tab icon={<InfoIcon />} label="Components" />
          <Tab icon={<SchoolIcon />} label="Mnemonics" />
          <Tab icon={<BrushIcon />} label="Stroke Order" />
          <Tab icon={<TranslateIcon />} label="Usage" />
        </Tabs>

        {kanji.map((char, index) => {
          const info = getKanjiInfo(char);
          return (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h5" sx={{ fontFamily: 'Noto Sans JP', mb: 2 }}>
                  {char}
                </Typography>

                {activeKanjiTab === 0 && (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Components
                    </Typography>
                    <List dense>
                      {info.components.map((comp, i) => (
                        <ListItem key={i}>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography sx={{ fontFamily: 'Noto Sans JP' }}>
                                  {comp.character}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  ({comp.position})
                                </Typography>
                              </Box>
                            }
                            secondary={`${comp.meaning} - ${comp.reading}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
                      Radicals: {info.radicals.join(', ')}
                    </Typography>
                  </Box>
                )}

                {activeKanjiTab === 1 && (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Mnemonics
                    </Typography>
                    <List dense>
                      {info.mnemonics.map((mnemonic, i) => (
                        <ListItem key={i}>
                          <ListItemText primary={mnemonic} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {activeKanjiTab === 2 && (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Stroke Order
                    </Typography>
                    <List dense>
                      {info.strokeOrder.map((step, i) => (
                        <ListItem key={i}>
                          <ListItemText primary={`${i + 1}. ${step}`} />
                        </ListItem>
                      ))}
                    </List>
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Readings:
                      </Typography>
                      <Typography variant="body2">
                        On'yomi: {info.onyomi.join(', ')}
                      </Typography>
                      <Typography variant="body2">
                        Kun'yomi: {info.kunyomi.join(', ')}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {activeKanjiTab === 3 && (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Usage Context
                    </Typography>
                    <List dense>
                      {info.usageContext.map((context, i) => (
                        <ListItem key={i}>
                          <ListItemText primary={context} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </CardContent>
            </Card>
          );
        })}
      </Box>
    );
  };

  const renderQuizSetup = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`container mx-auto px-4 py-8 ${isDarkMode ? 'bg-dark' : 'bg-dark-lighter'}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column - Main Settings */}
        <Card className={`${isDarkMode ? 'bg-dark-lighter border-dark-border' : 'bg-dark-lighter border-dark-border'} border shadow-lg`}>
          <CardContent className="p-6">
            <Typography variant="h5" gutterBottom className={themeClasses.text}>
              Quiz Settings
            </Typography>

            <div className="space-y-6">
              {/* Category Selection */}
              <div className="space-y-4">
                <Typography variant="subtitle1" sx={{ color: isDarkMode ? 'text.primary' : 'text.primary' }}>
                  Category
                </Typography>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'writing', label: 'Writing Practice' },
                    { id: 'hiragana', label: 'Hiragana' },
                    { id: 'katakana', label: 'Katakana' },
                    { id: 'kanji', label: 'Kanji' },
                    { id: 'compound', label: 'Compound' },
                    { id: 'daily', label: 'Daily' }
                  ].map((category) => (
                    <motion.button
                      key={category.id}
                      type="button"
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      onClick={() => setSettings(prev => ({
                        ...prev,
                        category: category.id
                      }))}
                      className={`p-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                        settings.category === category.id
                          ? isDarkMode 
                            ? 'bg-neon-blue text-white shadow-[0_0_10px_rgba(0,149,255,0.4)]' 
                            : 'bg-blue-600 text-white shadow-lg'
                          : isDarkMode 
                            ? 'bg-dark-lighter text-gray-300 hover:bg-gray-700' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Practice Mode Selection */}
              <div className="space-y-4">
                <Typography variant="subtitle1" sx={{ color: isDarkMode ? 'text.primary' : 'text.primary' }}>
                  Practice Mode
                </Typography>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'standard', label: 'Standard' },
                    { id: 'practice', label: 'Practice' },
                    { id: 'custom', label: 'Custom' }
                  ].map((mode) => (
                    <motion.button
                      key={mode.id}
                      type="button"
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      onClick={() => setSettings(prev => ({
                        ...prev,
                        practiceMode: mode.id === 'practice',
                        quizType: mode.id === 'custom' ? 'writing' : 'multiple-choice'
                      }))}
                      className={`p-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                        (mode.id === 'practice' && settings.practiceMode) || 
                        (mode.id === 'custom' && settings.quizType === 'writing') ||
                        (mode.id === 'standard' && !settings.practiceMode && settings.quizType === 'multiple-choice')
                          ? isDarkMode 
                            ? 'bg-neon-blue text-white shadow-[0_0_10px_rgba(0,149,255,0.4)]' 
                            : 'bg-blue-600 text-white shadow-lg'
                          : isDarkMode 
                            ? 'bg-dark-lighter text-gray-300 hover:bg-gray-700' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {mode.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              <FormControl fullWidth>
                <InputLabel id="difficulty-label">Difficulty</InputLabel>
                <Select
                  value={settings.difficulty}
                  label="Difficulty"
                  labelId="difficulty-label"
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    difficulty: e.target.value as Difficulty
                  }))}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: isDarkMode ? '#0095ff' : '#1976d2',
                    },
                    '& .MuiSelect-icon': {
                      color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                    },
                  }}
                >
                  <MenuItem value="easy">Easy (English → Japanese)</MenuItem>
                  <MenuItem value="medium">Medium (Japanese → English)</MenuItem>
                  <MenuItem value="hard">Hard (Mixed)</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel id="question-count-label">Number of Questions</InputLabel>
                <Select
                  value={settings.questionCount}
                  label="Number of Questions"
                  labelId="question-count-label"
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    questionCount: e.target.value as number
                  }))}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: isDarkMode ? '#0095ff' : '#1976d2',
                    },
                    '& .MuiSelect-icon': {
                      color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                    },
                  }}
                >
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={15}>15</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                  <MenuItem value={30}>30</MenuItem>
                </Select>
              </FormControl>

              <div className="space-y-4">
                <Typography variant="subtitle1" sx={{ color: isDarkMode ? 'text.primary' : 'text.primary' }}>
                  Quiz Options
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={settings.practiceMode}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        practiceMode: e.target.checked
                      }))}
                      sx={{ color: isDarkMode ? 'primary.main' : 'primary.main' }}
                    />
                  }
                  label="Practice Mode (No Scoring)"
                  sx={{ color: isDarkMode ? 'text.primary' : 'text.primary' }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={settings.showExamples}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        showExamples: e.target.checked
                      }))}
                      sx={{ color: isDarkMode ? 'primary.main' : 'primary.main' }}
                    />
                  }
                  label="Show Example Sentences"
                  sx={{ color: isDarkMode ? 'text.primary' : 'text.primary' }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Additional Features */}
        <div className="space-y-6">
          {/* Learning Features Card */}
          <Card className={`${isDarkMode ? 'bg-dark-lighter border-dark-border' : 'bg-dark-lighter border-dark-border'} border shadow-lg`}>
            <CardContent className="p-6">
              <Typography variant="h6" gutterBottom className={themeClasses.text}>
                Learning Features
              </Typography>
              <div className="space-y-4">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={settings.learnMode}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        learnMode: e.target.checked
                      }))}
                      className={themeClasses.checkbox}
                    />
                  }
                  label="Learn Mode (Study before Quiz)"
                  className={themeClasses.text}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={settings.pronunciationMode}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        pronunciationMode: e.target.checked
                      }))}
                      className={themeClasses.checkbox}
                    />
                  }
                  label="Pronunciation Practice"
                  className={themeClasses.text}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={settings.comparisonMode}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        comparisonMode: e.target.checked
                      }))}
                      className={themeClasses.checkbox}
                    />
                  }
                  label="Word Comparison Mode"
                  className={themeClasses.text}
                />
              </div>
            </CardContent>
          </Card>

          {/* Kanji Learning Card */}
          <Card className={`${isDarkMode ? 'bg-dark-lighter border-dark-border' : 'bg-dark-lighter border-dark-border'} border shadow-lg`}>
            <CardContent className="p-6">
              <Typography variant="h6" gutterBottom className={themeClasses.text}>
                Kanji Learning Options
              </Typography>
              <div className="space-y-4">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={settings.showKanjiInfo}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        showKanjiInfo: e.target.checked
                      }))}
                      className={themeClasses.checkbox}
                    />
                  }
                  label="Show Kanji Information"
                  className={themeClasses.text}
                />
                <Collapse in={settings.showKanjiInfo}>
                  <div className="pl-8 space-y-2">
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={settings.showComponents}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            showComponents: e.target.checked
                          }))}
                          className={themeClasses.checkbox}
                        />
                      }
                      label="Show Kanji Components"
                      className={themeClasses.text}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={settings.showMnemonics}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            showMnemonics: e.target.checked
                          }))}
                          className={themeClasses.checkbox}
                        />
                      }
                      label="Show Mnemonics"
                      className={themeClasses.text}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={settings.showStrokeOrder}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            showStrokeOrder: e.target.checked
                          }))}
                          className={themeClasses.checkbox}
                        />
                      }
                      label="Show Stroke Order"
                      className={themeClasses.text}
                    />
                  </div>
                </Collapse>
              </div>
            </CardContent>
          </Card>

          {/* Start Button */}
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={() => {
              if (settings.learnMode) {
                startLearnMode();
              } else if (settings.pronunciationMode) {
                setQuizState(prev => ({
                  ...prev,
                  mode: 'pronunciation',
                  currentQuestion: 0,
                  questions: getFilteredWords().slice(0, settings.questionCount),
                  currentWord: getFilteredWords()[0]
                }));
              } else if (settings.comparisonMode) {
                startComparisonMode();
              } else {
                handleStartQuiz();
              }
            }}
            className={`py-4 text-lg font-medium transition-all duration-300 ${
              isDarkMode 
                ? 'bg-neon-blue hover:bg-neon-blue/90 text-white shadow-[0_0_10px_rgba(0,149,255,0.4)] hover:shadow-[0_0_20px_rgba(0,149,255,0.6)]' 
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {settings.learnMode ? 'Start Learning' : 
             settings.pronunciationMode ? 'Start Pronunciation Practice' :
             settings.comparisonMode ? 'Start Word Comparison' :
             'Start Quiz'}
          </Button>
        </div>
      </div>
    </motion.div>
  );

  const renderQuizContent = () => {
    if (!quizState.currentWord) return null;

    const difficulty = calculateWordDifficulty(quizState.currentWord.japanese);

    return (
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={cardVariants}
        className={`container mx-auto px-4 py-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} min-h-screen`}
      >
        <div className="max-w-4xl mx-auto">
          {/* Progress Section with enhanced visuals */}
          <motion.div
            ref={ref}
            initial="hidden"
            animate={controls}
            variants={cardVariants}
          >
            <Card 
              sx={{
                backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                borderColor: isDarkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(209, 213, 219, 0.5)',
                backdropFilter: 'blur(8px)',
                marginBottom: '2rem'
              }}
            >
              <CardContent className="p-6">
                <div className="relative mb-6">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                  />
                  {renderProgressBar()}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {[
                    { label: 'Question', value: `${quizState.currentQuestion + 1}/${quizState.questions.length}` },
                    ...(!quizState.practiceMode ? [{ label: 'Score', value: `${score}/${quizState.currentQuestion + 1}`, highlight: true }] : []),
                    { label: 'Current Streak', value: currentStreak, highlight: true },
                    { label: 'Best Streak', value: bestStreak, highlight: true }
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      className={`text-center p-4 rounded-lg ${
                        isDarkMode ? 'bg-dark-lighter border-dark-border' : 'bg-dark-lighter border-dark-border'
                      } border backdrop-blur-sm`}
                    >
                      <Typography variant="subtitle2" className={`${themeClasses.text} mb-1`}>
                        {stat.label}
                      </Typography>
                      <Typography 
                        variant="h6" 
                        className={`${
                          stat.highlight 
                            ? isDarkMode 
                              ? 'text-neon-blue' 
                              : 'text-blue-600'
                            : themeClasses.text
                        } font-bold`}
                      >
                        {stat.value}
                      </Typography>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Question Section with enhanced animations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              key={quizState.currentQuestion}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Card 
                sx={{
                  backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                  borderColor: isDarkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(209, 213, 219, 0.5)',
                  backdropFilter: 'blur(8px)'
                }}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <Typography variant="h5" className={`${themeClasses.text} font-bold`}>
                      {settings.difficulty === 'medium' ? 'Type the romaji' : 'Type the romaji or English'}
                    </Typography>
                    <DifficultyIndicator difficulty={difficulty} />
                  </div>

                  <motion.div
                    key={quizState.currentWord.japanese}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="text-center mb-8"
                  >
                    <div className={`text-4xl mb-4 ${themeClasses.text} ${isDarkMode ? 'neon-glow' : ''} font-bold tracking-wide`}>
                      {quizState.currentWord.japanese}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handlePlayAudio(quizState.currentWord.japanese)}
                        className={`ml-2 p-2 rounded-full hover:bg-opacity-10 ${
                          isDarkMode 
                            ? 'hover:bg-neon-blue/20 text-neon-blue' 
                            : 'hover:bg-gray-100 text-gray-600'
                        }`}
                        title="Play Audio"
                      >
                        🔊
                      </motion.button>
                    </div>
                  </motion.div>

                  {settings.difficulty === 'easy' ? (
                    <div className="space-y-3">
                      {generateOptions(quizState.currentWord, quizState.questions).map((option, index) => (
                        <motion.button
                          key={index}
                          type="button"
                          variants={buttonVariants}
                          whileHover="hover"
                          whileTap="tap"
                          onClick={() => {
                            if (!quizState.showFeedback) {
                              checkAnswer(option);
                            }
                          }}
                          disabled={quizState.showFeedback}
                          style={{
                            width: '100%',
                            padding: '1rem',
                            textAlign: 'left',
                            borderRadius: '0.5rem',
                            transition: 'all 0.3s',
                            backgroundColor: quizState.selectedAnswer === option
                              ? quizState.isCorrect
                                ? isDarkMode ? 'rgba(0, 149, 255, 0.2)' : 'rgba(220, 252, 231, 1)'
                                : isDarkMode ? 'rgba(255, 0, 128, 0.2)' : 'rgba(254, 226, 226, 1)'
                              : isDarkMode ? 'rgba(55, 65, 81, 1)' : 'rgba(255, 255, 255, 1)',
                            color: quizState.selectedAnswer === option
                              ? quizState.isCorrect
                                ? isDarkMode ? '#0095ff' : '#166534'
                                : isDarkMode ? '#ff0080' : '#991b1b'
                              : isDarkMode ? '#f3f4f6' : '#111827',
                            border: `1px solid ${isDarkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(209, 213, 219, 0.5)'}`,
                            cursor: quizState.showFeedback ? 'not-allowed' : 'pointer',
                            opacity: quizState.showFeedback ? 0.7 : 1
                          }}
                        >
                          {option}
                        </motion.button>
                      ))}
                    </div>
                  ) : (
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!quizState.showFeedback && userAnswer.trim()) {
                          checkAnswer(userAnswer);
                        }
                      }}
                    >
                      <motion.input
                        type="text"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder={settings.difficulty === 'medium' ? 'Type the romaji' : 'Type the romaji or English'}
                        style={{
                          width: '100%',
                          padding: '1rem',
                          borderRadius: '0.5rem',
                          marginBottom: '1rem',
                          backgroundColor: isDarkMode ? 'rgba(55, 65, 81, 1)' : 'rgba(255, 255, 255, 1)',
                          color: isDarkMode ? '#f3f4f6' : '#111827',
                          border: `1px solid ${isDarkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(209, 213, 219, 0.5)'}`,
                          outline: 'none',
                          transition: 'all 0.3s'
                        }}
                        disabled={quizState.showFeedback}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                      />
                      <motion.button
                        type="submit"
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                        disabled={quizState.showFeedback || !userAnswer.trim()}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          borderRadius: '0.5rem',
                          fontWeight: 500,
                          transition: 'all 0.3s',
                          backgroundColor: isDarkMode ? '#ff0080' : '#2563eb',
                          color: '#ffffff',
                          cursor: (quizState.showFeedback || !userAnswer.trim()) ? 'not-allowed' : 'pointer',
                          opacity: (quizState.showFeedback || !userAnswer.trim()) ? 0.5 : 1,
                          border: 'none',
                          boxShadow: isDarkMode 
                            ? '0 0 10px rgba(255, 0, 128, 0.4)' 
                            : '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        Check Answer
                      </motion.button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Feedback and Examples Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <AnimatePresence>
                {quizState.showFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Card 
                      sx={{
                        backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                        borderColor: isDarkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(209, 213, 219, 0.5)',
                        backdropFilter: 'blur(8px)'
                      }}
                    >
                      <CardContent className="p-6">
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className={`text-lg font-medium mb-4 ${
                            quizState.isCorrect 
                              ? isDarkMode 
                                ? 'text-neon-blue' 
                                : 'text-green-800'
                              : isDarkMode 
                                ? 'text-neon-pink' 
                                : 'text-red-800'
                          }`}
                        >
                          {quizState.isCorrect ? '✓ Correct!' : '✗ Incorrect!'}
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="space-y-2"
                        >
                          <Typography className={themeClasses.text}>
                            Correct Answer: {quizState.currentWord.english}
                          </Typography>
                          <Typography className={themeClasses.text}>
                            Romaji: {quizState.currentWord.romaji}
                          </Typography>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                        >
                          <Button
                            type="button"
                            onClick={() => {
                              handleNextQuestion();
                            }}
                            fullWidth
                            sx={{
                              marginTop: '1rem',
                              padding: '0.75rem',
                              backgroundColor: isDarkMode ? '#0095ff' : '#2563eb',
                              color: '#ffffff',
                              '&:hover': {
                                backgroundColor: isDarkMode ? 'rgba(0, 149, 255, 0.9)' : '#1d4ed8'
                              },
                              boxShadow: isDarkMode 
                                ? '0 0 10px rgba(0, 149, 255, 0.4)' 
                                : '0 4px 6px rgba(0, 0, 0, 0.1)'
                            }}
                          >
                            {quizState.currentQuestion + 1 < quizState.questions.length ? 'Next Question' : 'Finish Quiz'}
                          </Button>
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderResult = () => {
    const totalQuestions = quizState.questions.length;
    const correctAnswers = quizState.score;
    const accuracy = (correctAnswers / totalQuestions) * 100;
    const mistakes = quizState.mistakes;
    const markedForReview = quizState.markedForReview;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-2xl mx-auto p-4"
      >
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Quiz Results
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Performance
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Score:</Typography>
                <Typography>
                  {correctAnswers} / {totalQuestions} ({accuracy.toFixed(1)}%)
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={accuracy}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  bgcolor: 'background.paper',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 5,
                    bgcolor: accuracy >= 70 ? 'success.main' : accuracy >= 40 ? 'warning.main' : 'error.main'
                  }
                }}
              />
            </Box>

            {mistakes.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Mistakes ({mistakes.length})
                </Typography>
                <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                  {mistakes.map((mistake, index) => (
                    <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
                      <Typography variant="body1" sx={{ fontFamily: 'Noto Sans JP' }}>
                        {mistake.word.japanese} ({mistake.word.romaji})
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {mistake.word.english}
                      </Typography>
                      <Typography variant="caption" color="error">
                        Your answer: {mistake.userAnswer}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {markedForReview.size > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Marked for Review ({markedForReview.size})
                </Typography>
                <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                  {Array.from(markedForReview).map((wordId, index) => {
                    const word = quizState.questions.find(w => w.japanese === wordId);
                    if (!word) return null;
                    return (
                      <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
                        <Typography variant="body1" sx={{ fontFamily: 'Noto Sans JP' }}>
                          {word.japanese} ({word.romaji})
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {word.english}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => {
                  setQuizState(prev => ({
                    ...prev,
                    mode: 'quiz',
                    currentQuestion: 0,
                    score: 0,
                    mistakes: [],
                    markedForReview: new Set(),
                    skippedQuestions: new Set(),
                    showFeedback: false,
                    isCorrect: null,
                    selectedAnswer: null,
                    showExamples: false
                  }));
                }}
              >
                Try Again
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  setQuizState(prev => ({
                    ...prev,
                    mode: 'setup',
                    currentQuestion: 0,
                    score: 0,
                    mistakes: [],
                    markedForReview: new Set(),
                    skippedQuestions: new Set(),
                    showFeedback: false,
                    isCorrect: null,
                    selectedAnswer: null,
                    showExamples: false
                  }));
                }}
              >
                New Quiz
              </Button>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const renderLearnMode = () => {
    if (!quizState.currentWord) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-2xl mx-auto p-6"
      >
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Learn Mode
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <LinearProgress 
                variant="determinate" 
                value={(quizState.learnProgress / learnModeWords.length) * 100}
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary">
                Progress: {quizState.learnProgress + 1} / {learnModeWords.length}
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" sx={{ fontFamily: 'Noto Sans JP', mb: 1 }}>
                {quizState.currentWord.japanese}
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {quizState.currentWord.romaji}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {quizState.currentWord.english}
              </Typography>
              {settings.showJLPTLevel && (
                <Chip 
                  label={`JLPT N${quizState.currentWord.level}`}
                  color="primary"
                  size="small"
                  sx={{ mt: 1 }}
                />
              )}
            </Box>

            {quizState.currentWord.examples && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Example Sentences
                </Typography>
                {quizState.currentWord.examples.map((example: string, index: number) => (
                  <Typography 
                    key={index} 
                    variant="body1" 
                    sx={{ fontFamily: 'Noto Sans JP', mb: 1 }}
                  >
                    {example}
                  </Typography>
                ))}
              </Box>
            )}

            {settings.showKanjiInfo && renderKanjiInfo(quizState.currentWord)}

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => {
                  if (quizState.learnProgress < learnModeWords.length - 1) {
                    setQuizState(prev => ({
                      ...prev,
                      learnProgress: prev.learnProgress + 1,
                      currentWord: learnModeWords[prev.learnProgress + 1]
                    }));
                  } else {
                    setQuizState(prev => ({
                      ...prev,
                      mode: 'setup'
                    }));
                  }
                }}
              >
                {quizState.learnProgress < learnModeWords.length - 1 ? 'Next Word' : 'Finish Learning'}
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  setQuizState(prev => ({
                    ...prev,
                    mode: 'quiz',
                    currentQuestion: 0,
                    score: 0,
                    questions: learnModeWords,
                    currentWord: learnModeWords[0]
                  }));
                }}
              >
                Start Quiz
              </Button>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const renderPronunciationPractice = () => {
    if (!quizState.currentWord) return null;

    // Get relevant tips based on the current word
    const getRelevantTips = (word: any): PronunciationTip[] => {
      const tips: PronunciationTip[] = [];
      
      // Check for long vowels
      if (word.japanese.match(/[あいうえお]{2,}/)) {
        tips.push(pronunciationTips.vowels);
      }
      
      // Check for potential pitch accent words
      if (word.japanese.length <= 3) {
        tips.push(pronunciationTips.pitch);
      }
      
      // Always include consonant tips
      tips.push(pronunciationTips.consonants);
      
      return tips;
    };

    const relevantTips = getRelevantTips(quizState.currentWord);

    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={pronunciationVariants}
        className={`max-w-2xl mx-auto p-4 sm:p-6 ${isDarkMode ? 'bg-dark' : 'bg-dark-lighter'} min-h-screen`}
      >
        <Card className={`${isDarkMode ? 'bg-dark-lighter border-dark-border' : 'bg-dark-lighter border-dark-border'} border shadow-lg backdrop-blur-sm bg-opacity-90`}>
          <CardContent className="p-4 sm:p-6">
            {/* Progress Section - Made more compact for mobile */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 sm:mb-6"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                <Typography variant="subtitle1" className={themeClasses.text}>
                  Word {quizState.currentQuestion + 1} of {quizState.questions.length}
                </Typography>
                <Chip
                  icon={<TimerIcon />}
                  label={`${Math.floor((quizState.currentQuestion + 1) / quizState.questions.length * 100)}% Complete`}
                  color="primary"
                  variant="outlined"
                  className="w-full sm:w-auto"
                />
              </div>
              <LinearProgress 
                variant="determinate" 
                value={((quizState.currentQuestion + 1) / quizState.questions.length) * 100}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: isDarkMode ? '#0095ff' : '#1976d2',
                  }
                }}
              />
            </motion.div>

            {/* Word Display Section - Improved mobile layout */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-6 sm:mb-8"
            >
              <motion.div
                animate={isRecording ? "recording" : "visible"}
                variants={pronunciationVariants}
                className={`text-4xl sm:text-5xl mb-3 sm:mb-4 ${themeClasses.text} ${isDarkMode ? 'neon-glow' : ''} font-bold tracking-wide`}
              >
                {quizState.currentWord.japanese}
              </motion.div>
              <Typography variant="h6" color="text.secondary" gutterBottom className="text-lg sm:text-xl">
                {quizState.currentWord.romaji}
              </Typography>
              <Typography variant="body1" className="mb-4 text-base sm:text-lg">
                {quizState.currentWord.english}
              </Typography>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePlayAudio(quizState.currentWord.japanese)}
                className={`inline-flex items-center px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base ${
                  isDarkMode 
                    ? 'bg-dark-lighter text-text-primary hover:bg-dark-lightest' 
                    : 'bg-dark-lighter text-text-primary hover:bg-dark-lightest'
                } transition-colors duration-200`}
              >
                <VolumeUpIcon className="mr-2" style={{ fontSize: '1.25rem' }} />
                Listen to Correct Pronunciation
              </motion.button>
            </motion.div>

            {/* Recording Section - Enhanced mobile experience */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-6 sm:mb-8"
            >
              <motion.div
                animate={isRecording ? "pulse" : "visible"}
                variants={pronunciationVariants}
                className={`p-4 sm:p-6 rounded-full mb-3 sm:mb-4 inline-block ${
                  isRecording 
                    ? isDarkMode 
                      ? 'bg-neon-pink/20 text-neon-pink' 
                      : 'bg-red-100 text-red-600'
                    : isDarkMode 
                      ? 'bg-gray-700/50' 
                      : 'bg-gray-100'
                }`}
              >
                <RecordVoiceOverIcon style={{ fontSize: '2.5rem' }} />
              </motion.div>
              <Typography variant="h6" gutterBottom className={`${themeClasses.text} text-lg sm:text-xl`}>
                {isRecording ? 'Recording...' : 'Ready to Record'}
              </Typography>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={isRecording ? () => {
                  recording?.stop();
                  setIsRecording(false);
                } : startPronunciationPractice}
                className={`inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium text-sm sm:text-base ${
                  isRecording
                    ? isDarkMode 
                      ? 'bg-dark-lighter text-text-primary hover:bg-dark-lightest' 
                      : 'bg-dark-lighter text-text-primary hover:bg-dark-lightest'
                    : isDarkMode 
                      ? 'bg-dark-lighter text-text-primary hover:bg-dark-lightest' 
                      : 'bg-dark-lighter text-text-primary hover:bg-dark-lightest'
                } transition-colors duration-200 shadow-lg`}
              >
                {isRecording ? (
                  <>
                    <StopIcon className="mr-2" style={{ fontSize: '1.25rem' }} />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <MicIcon className="mr-2" style={{ fontSize: '1.25rem' }} />
                    Start Recording
                  </>
                )}
              </motion.button>
            </motion.div>

            {/* Feedback Section - Enhanced with detailed tips */}
            <AnimatePresence>
              {quizState.pronunciationPractice?.userRecording && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-6 sm:mb-8"
                >
                  <Card className={`${isDarkMode ? 'bg-dark-lighter border-dark-border' : 'bg-dark-lighter border-dark-border'} border shadow-lg backdrop-blur-sm bg-opacity-90`}>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center mb-4">
                        {quizState.pronunciationPractice.isCorrect ? (
                          <CheckCircleIcon className="text-green-500 mr-2" />
                        ) : (
                          <ErrorIcon className="text-red-500 mr-2" />
                        )}
                        <Typography variant="h6" className={themeClasses.text}>
                          Your Recording
                        </Typography>
                      </div>
                      <audio 
                        src={quizState.pronunciationPractice.userRecording} 
                        controls 
                        className="w-full mb-4"
                      />
                      <Alert 
                        severity={quizState.pronunciationPractice.isCorrect ? "success" : "warning"}
                        icon={quizState.pronunciationPractice.isCorrect ? <CheckCircleIcon /> : <ErrorIcon />}
                        className="mb-4"
                      >
                        {quizState.pronunciationPractice.feedback}
                      </Alert>

                      {/* Detailed Pronunciation Tips */}
                      <div className="space-y-4">
                        {relevantTips.map((tip, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-4 rounded-lg ${
                              isDarkMode ? 'bg-gray-600/50' : 'bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center mb-2">
                              <HelpIcon className="mr-2 text-blue-500" />
                              <Typography variant="subtitle1" className={themeClasses.text}>
                                {tip.title}
                              </Typography>
                            </div>
                            <Typography variant="body2" className={`${themeClasses.text} mb-3`}>
                              {tip.description}
                            </Typography>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                  Examples:
                                </Typography>
                                <ul className="list-disc list-inside space-y-1">
                                  {tip.examples.map((example, i) => (
                                    <li key={i} className={themeClasses.text}>
                                      {example}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                  Common Mistakes:
                                </Typography>
                                <ul className="list-disc list-inside space-y-1">
                                  {tip.commonMistakes.map((mistake, i) => (
                                    <li key={i} className={themeClasses.text}>
                                      {mistake}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons - Improved mobile layout */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setQuizState(prev => ({
                    ...prev,
                    mode: 'setup'
                  }));
                }}
                className={`w-full py-2 sm:py-3 rounded-lg text-sm sm:text-base ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-100' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                Back to Setup
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const nextWord = quizState.questions[
                    (quizState.currentQuestion + 1) % quizState.questions.length
                  ];
                  setQuizState(prev => ({
                    ...prev,
                    currentWord: nextWord,
                    pronunciationPractice: null
                  }));
                }}
                className={`w-full py-2 sm:py-3 rounded-lg text-sm sm:text-base ${
                  isDarkMode 
                    ? 'bg-neon-blue hover:bg-neon-blue/90 text-white shadow-[0_0_10px_rgba(0,149,255,0.4)] hover:shadow-[0_0_20px_rgba(0,149,255,0.6)]' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Next Word
              </motion.button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const startLearnMode = useCallback(() => {
    const filteredWords = getFilteredWords();
    const selectedWords = [...filteredWords]
      .sort(() => Math.random() - 0.5)
      .slice(0, settings.questionCount);

    setLearnModeWords(selectedWords);
    setQuizState(prev => ({
      ...prev,
      mode: 'learn',
      currentQuestion: 0,
      currentWord: selectedWords[0],
      learnProgress: 0
    }));
  }, [getFilteredWords, settings.questionCount]);

  const startPronunciationPractice = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        setAudioChunks(chunks);
        // Here you would typically send the audio to a pronunciation checking service
        // For now, we'll just simulate feedback
        setQuizState(prev => ({
          ...prev,
          pronunciationPractice: {
            word: prev.currentWord,
            userRecording: URL.createObjectURL(audioBlob),
            isCorrect: Math.random() > 0.5, // Simulated feedback
            feedback: "Good pronunciation! Try to emphasize the 'o' sound more."
          }
        }));
      };

      setRecording(mediaRecorder);
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  }, []);

  // Function to find similar words and their differences
  const findSimilarWords = useCallback((word: any) => {
    const similarWords = allWords.filter(w => 
      w.japanese !== word.japanese && 
      (
        // Same category
        w.category === word.category ||
        // Same JLPT level
        w.level === word.level ||
        // Similar meaning
        w.english.includes(word.english) ||
        word.english.includes(w.english) ||
        // Similar pronunciation
        w.romaji.includes(word.romaji) ||
        word.romaji.includes(w.romaji)
      )
    ).slice(0, 3);

    // Find differences between words
    const differences = similarWords.map(similarWord => {
      const diffs = [];
      if (similarWord.category !== word.category) {
        diffs.push(`Category: ${word.category} vs ${similarWord.category}`);
      }
      if (similarWord.level !== word.level) {
        diffs.push(`JLPT Level: N${word.level} vs N${similarWord.level}`);
      }
      if (similarWord.english !== word.english) {
        diffs.push(`Meaning: ${word.english} vs ${similarWord.english}`);
      }
      if (similarWord.romaji !== word.romaji) {
        diffs.push(`Pronunciation: ${word.romaji} vs ${similarWord.romaji}`);
      }
      return diffs;
    });

    return {
      word,
      similarWords,
      differences
    };
  }, []);

  // Function to start comparison mode
  const startComparisonMode = useCallback(() => {
    const filteredWords = getFilteredWords();
    const selectedWords = [...filteredWords]
      .sort(() => Math.random() - 0.5)
      .slice(0, settings.questionCount);

    setQuizState(prev => ({
      ...prev,
      mode: 'comparison',
      currentQuestion: 0,
      currentWord: selectedWords[0],
      questions: selectedWords,
      currentComparison: findSimilarWords(selectedWords[0])
    }));
  }, [getFilteredWords, settings.questionCount, findSimilarWords]);

  // Function to render comparison mode
  const renderComparisonMode = () => {
    if (!quizState.currentWord || !quizState.currentComparison) return null;

    const { word, similarWords, differences } = quizState.currentComparison;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-2xl mx-auto p-6"
      >
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Word Comparison
            </Typography>

            <Box sx={{ mb: 3 }}>
              <LinearProgress 
                variant="determinate" 
                value={((quizState.currentQuestion + 1) / quizState.questions.length) * 100}
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary">
                Progress: {quizState.currentQuestion + 1} / {quizState.questions.length}
              </Typography>
            </Box>

            {/* Main Word */}
            <Box sx={{ mb: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="h4" sx={{ fontFamily: 'Noto Sans JP', mb: 1 }}>
                {word.japanese}
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {word.romaji}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {word.english}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Chip 
                  label={`JLPT N${word.level}`}
                  color="primary"
                  size="small"
                />
                <Chip 
                  label={word.category}
                  color="secondary"
                  size="small"
                />
              </Box>
            </Box>

            {/* Similar Words */}
            <Typography variant="h6" gutterBottom>
              Similar Words
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {similarWords.map((similarWord, index) => (
                <Card key={index} variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontFamily: 'Noto Sans JP' }}>
                          {similarWord.japanese}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {similarWord.romaji}
                        </Typography>
                        <Typography variant="body1">
                          {similarWord.english}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Chip 
                            label={`JLPT N${similarWord.level}`}
                            color="primary"
                            size="small"
                          />
                          <Chip 
                            label={similarWord.category}
                            color="secondary"
                            size="small"
                          />
                        </Box>
                      </Box>
                      <Button
                        onClick={() => handlePlayAudio(similarWord.japanese)}
                        startIcon={<VolumeUpIcon />}
                        size="small"
                      >
                        Listen
                      </Button>
                    </Box>

                    {/* Differences */}
                    {differences[index].length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Key Differences:
                        </Typography>
                        <List dense>
                          {differences[index].map((diff, diffIndex) => (
                            <ListItem key={diffIndex}>
                              <ListItemText primary={diff} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>

            {settings.showKanjiInfo && renderKanjiInfo(word)}

            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setQuizState(prev => ({
                    ...prev,
                    mode: 'setup'
                  }));
                }}
              >
                Back to Setup
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  const nextIndex = (quizState.currentQuestion + 1) % quizState.questions.length;
                  const nextWord = quizState.questions[nextIndex];
                  setQuizState(prev => ({
                    ...prev,
                    currentQuestion: nextIndex,
                    currentWord: nextWord,
                    currentComparison: findSimilarWords(nextWord)
                  }));
                }}
              >
                Next Word
              </Button>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // Function to extract kanji from a word
  const extractKanji = useCallback((word: string) => {
    return word.match(/[\u4E00-\u9FAF]/g) || [];
  }, []);

  // Function to get kanji information
  const getKanjiInfo = useCallback((kanji: string): KanjiInfo => {
    // This would typically come from a kanji database
    // For now, using mock data
    return {
      components: [
        { character: '木', meaning: 'tree', reading: 'き', position: 'left' },
        { character: '目', meaning: 'eye', reading: 'め', position: 'right' }
      ],
      mnemonics: [
        'Think of a tree (木) with an eye (目) watching over it',
        'The kanji combines the radical for tree with the radical for eye'
      ],
      strokeOrder: [
        'Start with the tree radical (木)',
        'Then add the eye radical (目)',
        'Total of 12 strokes'
      ],
      usageContext: [
        'Common in nature-related words',
        'Often used in compound words',
        'Appears in JLPT N3 vocabulary'
      ],
      radicals: ['木 (tree)', '目 (eye)'],
      onyomi: ['もく', 'ぼく'],
      kunyomi: ['き', 'こ']
    };
  }, []);

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

export default VocabularyQuiz; 