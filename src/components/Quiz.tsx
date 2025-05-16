import React, { useState, useCallback, useEffect, useMemo, useRef, ChangeEvent, FormEvent } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { allWords as quizWords, Category } from '../data/japaneseWords';
import { useProgress } from '../context/ProgressContext';
import { kuroshiroInstance } from '../utils/kuroshiro';
import { CSSTransition, CSSTransitionProps } from 'react-transition-group';
import { useSound } from '../context/SoundContext';
import { v4 as uuidv4 } from 'uuid';
import { useWordLevel } from '../context/WordLevelContext';
import { wordLevels } from '../data/wordLevels';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, Stack, Chip, Button, Alert, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { playAudio, playDynamicAudio } from '../utils/audio';

// Add type declaration for react-transition-group
declare module 'react-transition-group' {
  export interface CSSTransitionProps {
    in?: boolean;
    timeout?: number | { enter?: number; exit?: number };
    classNames?: string | { enter?: string; exit?: string; enterActive?: string; exitActive?: string };
    unmountOnExit?: boolean;
    appear?: boolean;
    onEnter?: (node: HTMLElement, isAppearing: boolean) => void;
    onEntering?: (node: HTMLElement, isAppearing: boolean) => void;
    onEntered?: (node: HTMLElement, isAppearing: boolean) => void;
    onExit?: (node: HTMLElement) => void;
    onExiting?: (node: HTMLElement) => void;
    onExited?: (node: HTMLElement) => void;
  }
}

type Difficulty = 'easy' | 'medium' | 'hard' | 'extraHard';
type QuizType = 'multiple-choice' | 'writing';
type AnswerType = 'hiragana' | 'katakana' | 'romaji';
type QuizMode = 'setup' | 'quiz' | 'result' | 'complete';

interface QuizSettings {
  category: Category;
  difficulty: Difficulty;
  questionCount: number;
  quizType: QuizType;
  answerType?: AnswerType;
  showRomaji: boolean;
  showHiragana: boolean;
  showKanji: boolean;
  level: number;
}

interface QuizState {
  mode: QuizMode;
  currentQuestion: number;
  selectedAnswer: number | null;
  showFeedback: boolean;
  isCorrect: boolean | null;
  showCorrect: boolean;
  showResult?: boolean;
  timeEnded?: Date;
  currentWord: QuizWord | null;
  options: string[];
  score: number;
  totalQuestions: number;
  completed: boolean;
}

interface QuizWord {
  id?: string;
  japanese: string;
  english: string;
  category: Category;
  difficulty: Difficulty;
  romaji?: string;
  examples?: Array<{
    japanese: string;
    english: string;
    romaji: string;
    notes?: string;
  }>;
  notes?: string;
  jlptLevel?: string;
  isHiragana: boolean;
  isKatakana: boolean;
}

interface ThemeClasses {
  container: string;
  text: string;
  input: string;
  button: {
    primary: string;
    secondary: string;
  };
}

interface QuizContext {
  updateProgress: (wordId: string, isCorrect: boolean) => void;
  progress: Record<string, { correct: number; total: number }>;
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  className?: string;
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

interface LevelStats {
  level: number;
  totalWords: number;
  masteredWords: number;
  inProgressWords: number;
  notStartedWords: number;
  averageScore: number;
}

const categories = [
  // Basic Categories
  { id: 'greeting', name: 'Greetings' },
  { id: 'question', name: 'Questions' },
  { id: 'pronoun', name: 'Pronouns' },
  
  // Parts of Speech
  { id: 'verb', name: 'Verbs' },
  { id: 'adjective', name: 'Adjectives' },
  { id: 'adverb', name: 'Adverbs' },
  { id: 'particle', name: 'Particles' },
  { id: 'conjunction', name: 'Conjunctions' },
  { id: 'interjection', name: 'Interjections' },
  
  // Topic Categories
  { id: 'food', name: 'Food & Drinks' },
  { id: 'drink', name: 'Drinks' },
  { id: 'animals', name: 'Animals' },
  { id: 'colors', name: 'Colors' },
  { id: 'numbers', name: 'Numbers' },
  { id: 'family', name: 'Family' },
  { id: 'weather', name: 'Weather' },
  { id: 'time', name: 'Time & Dates' },
  { id: 'transportation', name: 'Transportation' },
  { id: 'clothing', name: 'Clothing' },
  { id: 'body', name: 'Body Parts' },
  { id: 'emotions', name: 'Emotions' },
  { id: 'school', name: 'School' },
  { id: 'work', name: 'Work' },
  { id: 'hobbies', name: 'Hobbies' },
  { id: 'nature', name: 'Nature' },
  { id: 'house', name: 'House' },
  { id: 'city', name: 'City' },
  { id: 'technology', name: 'Technology' },
  { id: 'health', name: 'Health' },
  { id: 'travel', name: 'Travel' },
  { id: 'shopping', name: 'Shopping' },
  { id: 'money', name: 'Money' },
  { id: 'direction', name: 'Directions' },
  { id: 'location', name: 'Locations' },
  { id: 'measurement', name: 'Measurements' },
  
  // Special Categories
  { id: 'idiom', name: 'Idioms' },
  { id: 'proverb', name: 'Proverbs' },
  { id: 'onomatopoeia', name: 'Onomatopoeia' },
  { id: 'honorific', name: 'Honorifics' },
  { id: 'slang', name: 'Slang' },
  
  // Writing Systems
  { id: 'hiragana', name: 'Hiragana' },
  { id: 'katakana', name: 'Katakana' },
  
  // All Categories
  { id: 'all', name: 'All Categories' }
] as const;

const motivationalMessages = {
  positive: [
    "Great job!",
    "You're on fire!",
    "Amazing streak!",
    "Keep it up!",
    "Impressive!",
    "You're crushing it!",
    "Fantastic!",
    "Superb!"
  ],
  encouragement: [
    "Keep going!",
    "You can do it!",
    "Don't give up!",
    "Stay focused!",
    "Almost there!",
    "Try again!",
    "Believe in yourself!"
  ]
};

const Quiz: React.FC = () => {
  const { theme, isDarkMode } = useTheme();
  const { settings: appSettings } = useApp();
  const { updateProgress, progress } = useProgress();
  const { currentLevel, unlockedLevels, updateWordProgress, updateQuizProgress } = useWordLevel();
  const [questions, setQuestions] = useState<typeof quizWords>([]);
  const [quizState, setQuizState] = useState<QuizState>({
    mode: 'setup',
    currentQuestion: 0,
    selectedAnswer: null,
    showFeedback: false,
    isCorrect: null,
    showCorrect: false,
    currentWord: null,
    options: [],
    score: 0,
    totalQuestions: 0,
    completed: false
  });
  const [settings, setSettings] = useState<QuizSettings>({
    category: 'all',
    difficulty: 'easy',
    questionCount: 10,
    quizType: 'multiple-choice',
    answerType: 'romaji',
    showRomaji: true,
    showHiragana: true,
    showKanji: true,
    level: currentLevel
  });
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [timeStarted, setTimeStarted] = useState<Date | null>(null);
  const [timeEnded, setTimeEnded] = useState<Date | null>(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState(false);
  const [romajiCache, setRomajiCache] = useState<Record<string, string>>({});
  const [selectedGame, setSelectedGame] = useState<string>('matching');
  const inputRef = useRef<HTMLInputElement>(null);
  const [motivation, setMotivation] = useState<string | null>(null);
  const motivationTimeout = useRef<NodeJS.Timeout | null>(null);
  const { playSound } = useSound();
  const [extraHardInput, setExtraHardInput] = useState({ english: '', japanese: '' });
  const [levelStats, setLevelStats] = useState<LevelStats[]>([]);
  const [questionsLoaded, setQuestionsLoaded] = useState(false);

  const getThemeClasses = () => {
    if (isDarkMode) {
      return {
        container: 'bg-dark-card',
        text: 'text-dark-text',
        input: 'bg-dark-bg border-dark-border text-dark-text',
        button: {
          primary: 'bg-primary hover:bg-primary-dark text-white',
          secondary: 'bg-secondary hover:bg-secondary-dark text-white',
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
            primary: 'bg-blue-600 hover:bg-blue-700 text-white',
            secondary: 'bg-blue-100 hover:bg-blue-200 text-blue-800',
          },
        };
      case 'green':
        return {
          container: 'bg-green-card',
          text: 'text-green-text',
          input: 'bg-white border-green-border text-green-text',
          button: {
            primary: 'bg-green-600 hover:bg-green-700 text-white',
            secondary: 'bg-green-100 hover:bg-green-200 text-green-800',
          },
        };
      default:
        return {
          container: 'bg-white',
          text: 'text-gray-800',
          input: 'bg-white border-gray-200 text-gray-800',
          button: {
            primary: 'bg-blue-600 hover:bg-blue-700 text-white',
            secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800',
          },
        };
    }
  };

  const themeClasses = useMemo(() => getThemeClasses(), [theme, isDarkMode]);

  const generateOptions = useCallback((correctWord: QuizWord, allWords: QuizWord[]): string[] => {
    // Get other words from the same category and difficulty, excluding the correct answer
    const otherWords = allWords.filter(word => 
      word.category === correctWord.category && 
      word.difficulty === correctWord.difficulty &&
      word.english !== correctWord.english
    );
    // Shuffle and take 3 random options
    const shuffled = [...otherWords]
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(word => word.english);
    // Add the correct answer and shuffle all options
    const allOptions = [...shuffled, correctWord.english]
      .sort(() => Math.random() - 0.5);
    // Ensure there are always 4 options, and the correct answer is included
    if (!allOptions.includes(correctWord.english)) {
      allOptions[0] = correctWord.english;
    }
    return allOptions.slice(0, 4);
  }, []);

  const generateQuiz = useCallback((): void => {
    let filteredWords = quizWords.filter(word => {
      if (settings.category === 'hiragana') return word.isHiragana;
      if (settings.category === 'katakana') return word.isKatakana;
      return settings.category === 'all' || word.category === settings.category;
    });

    const questionCount = Math.min(settings.questionCount, 50);
    const shuffled = [...filteredWords]
      .sort(() => Math.random() - 0.5)
      .slice(0, questionCount);
    
    setQuestions(shuffled);
    setQuizState((prev: QuizState) => ({
      ...prev,
      currentQuestion: 0,
      selectedAnswer: null,
      showFeedback: false,
      isCorrect: null,
      showCorrect: false,
      currentWord: null,
      options: [],
      score: 0,
      totalQuestions: 0,
      completed: false
    }));
  }, [settings.category, settings.questionCount]);

  const handleStartQuiz = (): void => {
    generateQuiz();
    setQuizState((prev: QuizState) => ({
      ...prev,
      mode: 'quiz'
    }));
    setTimeStarted(new Date());
    setTimeEnded(null);
    setCurrentStreak(0);
    setBestStreak(0);
    setShowFeedback(false);
    setFeedback(false);
  };

  const showMotivation = useCallback((type: 'positive' | 'encouragement') => {
    // 30% chance to show a popup
    if (Math.random() < 0.3) {
      const messages = motivationalMessages[type];
      const message = messages[Math.floor(Math.random() * messages.length)];
      setMotivation(message);
      if (motivationTimeout.current) clearTimeout(motivationTimeout.current);
      motivationTimeout.current = setTimeout(() => setMotivation(null), 2000);
    }
  }, []);

  const getMotivation = (streak: number): string => {
    if (streak >= 5) return 'Incredible streak! 🌟';
    if (streak >= 3) return 'Great job! Keep it up! 🎯';
    if (streak >= 1) return 'Nice! 👍';
    return 'Keep trying! 💪';
  };

  const checkAnswer = useCallback((answer: string, selectedIndex: number): void => {
    const currentWord = questions[quizState.currentQuestion];
    let isCorrect = false;
    if (settings.difficulty === 'easy') {
      // For multiple-choice, check if the answer matches the correct English
      if (settings.quizType === 'multiple-choice') {
        isCorrect = answer.trim().toLowerCase() === currentWord.english.toLowerCase();
      } else {
        // For writing mode, accept correct romaji or English
        isCorrect = answer.trim().toLowerCase() === (currentWord.romaji || '').toLowerCase() ||
                    answer.trim().toLowerCase() === currentWord.english.toLowerCase();
      }
    } else if (settings.difficulty === 'medium') {
      isCorrect = answer.trim().toLowerCase() === (currentWord.romaji || '').toLowerCase();
    } else if (settings.difficulty === 'hard') {
      isCorrect =
        answer.trim().toLowerCase() === (currentWord.romaji || '').toLowerCase() ||
        answer.trim().toLowerCase() === currentWord.english.toLowerCase();
    } else if (settings.difficulty === 'extraHard') {
      isCorrect =
        extraHardInput.english.trim().toLowerCase() === currentWord.english.toLowerCase() &&
        (extraHardInput.japanese.trim().toLowerCase() === (currentWord.romaji || '').toLowerCase() ||
         extraHardInput.japanese.trim() === currentWord.japanese);
    }
    
    setQuizState((prev: QuizState) => ({
      ...prev,
      selectedAnswer: selectedIndex,
      showFeedback: true,
      isCorrect,
      showCorrect: true
    }));

    if (isCorrect) {
      setScore((prev: number) => prev + 1);
      setCurrentStreak((prev: number) => {
        const newStreak = prev + 1;
        if (newStreak > bestStreak) {
          setBestStreak(newStreak);
        }
        return newStreak;
      });
      playSound('correct');
    } else {
      setCurrentStreak(0);
      playSound('incorrect');
    }

    // Determine section for progress tracking
    let section: string = 'vocabulary';
    if (settings.category === 'hiragana') section = 'hiragana';
    else if (settings.category === 'katakana') section = 'katakana';
    updateProgress(section, currentWord.japanese, isCorrect);
  }, [questions, quizState.currentQuestion, bestStreak, playSound, updateProgress, settings.difficulty, extraHardInput]);

  // Add a function to check if a word is marked
  const isWordMarked = useCallback((word: QuizWord) => {
    const section = settings.category === 'hiragana' ? 'hiragana' : 
                   settings.category === 'katakana' ? 'katakana' : 'vocabulary';
    const key = `${section}-${word.japanese}`;
    const itemProgress = progress[key];
    console.log('Checking marked status for', key, 'Progress:', itemProgress);
    return itemProgress?.correct > 0;
  }, [settings.category, progress]);

  const handlePlayAudio = (text: string, id?: string) => {
    if (id) {
      // Use pre-generated audio if we have an ID
      playAudio(id);
    } else {
      // Fallback to dynamic audio for content without an ID
      playDynamicAudio(text);
    }
  };

  // Refactored renderWord: only kana+romaji for H&K, only Japanese for others
  const renderWord = useCallback((word: QuizWord | undefined) => {
    if (!word) return <div className="text-red-600">No word loaded.</div>;
    const isHKQuiz = (settings.category === 'hiragana' || settings.category === 'katakana');
    return (
      <div className={`p-4 rounded-lg ${
        (() => {
          const itemProgress = progress[(settings.category === 'hiragana' ? 'hiragana' : settings.category === 'katakana' ? 'katakana' : 'vocabulary') + '-' + word.japanese];
          const masteryLevel = itemProgress?.correct || 0;
          return masteryLevel === 0 ? 'bg-gray-100 dark:bg-gray-800' :
            masteryLevel === 1 ? 'bg-yellow-100 dark:bg-yellow-900' :
            masteryLevel === 2 ? 'bg-orange-100 dark:bg-orange-900' :
            'bg-green-100 dark:bg-green-900';
        })()
      }`}>
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              {word.japanese}
              <button
                onClick={() => handlePlayAudio(word.japanese, word.id)}
                className="ml-2 p-2 rounded-full hover:bg-opacity-10"
                title="Play Audio"
              >
                🔊
              </button>
            </h3>
            {isHKQuiz && (
              <p className="text-gray-600 dark:text-gray-300">{word.romaji || <span className="text-red-500">No romaji</span>}</p>
            )}
            {/* No English or romaji for non-H&K */}
          </div>
          <div className={`text-lg ${
            (() => {
              const itemProgress = progress[(settings.category === 'hiragana' ? 'hiragana' : settings.category === 'katakana' ? 'katakana' : 'vocabulary') + '-' + word.japanese];
              const masteryLevel = itemProgress?.correct || 0;
              return masteryLevel === 0 ? 'text-gray-400' :
                masteryLevel === 1 ? 'text-yellow-500' :
                masteryLevel === 2 ? 'text-orange-500' :
                'text-green-500';
            })()
          }`}>
            {(() => {
              const itemProgress = progress[(settings.category === 'hiragana' ? 'hiragana' : settings.category === 'katakana' ? 'katakana' : 'vocabulary') + '-' + word.japanese];
              const masteryLevel = itemProgress?.correct || 0;
              return masteryLevel === 0 ? '○' :
                masteryLevel === 1 ? '✓' :
                masteryLevel === 2 ? '✓✓' : '★';
            })()}
          </div>
        </div>
      </div>
    );
  }, [settings.category, progress]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setUserAnswer(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!userAnswer.trim()) return;
    checkAnswer(userAnswer.trim(), -1);
  };

  const handleOptionSelect = (option: string, index: number): void => {
    if (quizState.showFeedback) return;
    checkAnswer(option, index);
  };

  const handleNextQuestion = () => {
    if (!quizState.showFeedback) return; // Prevent skipping questions
    
    if (quizState.currentQuestion + 1 >= questions.length) {
      setQuizState(prev => ({ 
        ...prev, 
        mode: 'result',
        showResult: true,
        timeEnded: new Date()
      }));
      return;
    }

    const nextQuestionIndex = quizState.currentQuestion + 1;
    setQuizState(prev => ({
      ...prev,
      currentQuestion: nextQuestionIndex,
      showFeedback: false,
      isCorrect: null,
      showCorrect: false,
      selectedAnswer: null
    }));

    setUserAnswer('');
  };

  const handleRestart = (): void => {
    setQuizState((prev: QuizState) => ({
      ...prev,
      mode: 'setup',
      currentQuestion: 0,
      selectedAnswer: null,
      showFeedback: false,
      isCorrect: null,
      showCorrect: false,
      currentWord: null,
      options: [],
      score: 0,
      totalQuestions: 0,
      completed: false
    }));
    setScore(0);
    setTimeStarted(null);
    setTimeEnded(null);
    setCurrentStreak(0);
    setBestStreak(0);
    setShowFeedback(false);
    setFeedback(false);
  };

  const handleError = (err: Error): void => {
    console.error('Error:', err);
    // Show error toast
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-out';
    toast.textContent = 'An error occurred. Please try again.';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  };

  // Memoize filtered questions to prevent recalculation
  const filteredQuestions = useMemo(() => {
    let filtered = quizWords.filter(word => {
      const matchesCategory = settings.category === 'all' || word.category === settings.category;
      return matchesCategory;
    });
    return [...filtered].sort(() => Math.random() - 0.5).slice(0, settings.questionCount);
  }, [settings.category, settings.questionCount]);

  // Memoize options generation
  const currentOptions = useMemo(() => {
    if (settings.quizType === 'multiple-choice' && questions.length > 0 && questions[quizState.currentQuestion]) {
      return generateOptions(questions[quizState.currentQuestion], questions);
    }
    return [];
  }, [quizState.currentQuestion, questions, settings.quizType, generateOptions]);

  // Optimize romaji conversion with batch processing
  const updateRomajiBatch = useCallback(async (words: typeof quizWords) => {
    const newWords = words.filter(word => !romajiCache[word.japanese]);
    if (newWords.length === 0) return;

    const batchSize = 5; // Process in small batches to prevent UI blocking
    for (let i = 0; i < newWords.length; i += batchSize) {
      const batch = newWords.slice(i, i + batchSize);
      const newRomajiMap = { ...romajiCache };
      
      await Promise.all(batch.map(async (word) => {
        if (!newRomajiMap[word.japanese]) {
          try {
            newRomajiMap[word.japanese] = await kuroshiroInstance.convert(word.japanese);
          } catch (error) {
            console.error('Error converting to romaji:', error);
            newRomajiMap[word.japanese] = word.japanese;
          }
        }
      }));
      
      setRomajiCache(newRomajiMap);
    }
  }, [romajiCache]);

  // Update romaji only when questions change
  useEffect(() => {
    if (appSettings.showRomaji && questions.length > 0) {
      updateRomajiBatch(questions);
    }
  }, [questions, appSettings.showRomaji, updateRomajiBatch]);

  // Memoize the current word to prevent unnecessary re-renders
  const currentWord = useMemo(() => questions[quizState.currentQuestion], [questions, quizState.currentQuestion]);

  // Refactored renderQuizPrompt: always show kana and romaji (fallback if missing)
  const renderQuizPrompt = (word: QuizWord | undefined) => {
    if (!word) return <div className="text-red-600">No question loaded.</div>;
    return (
      <>
        <div className="text-3xl font-bold mb-2 flex items-center gap-2">
          {word.japanese}
          <button
            onClick={() => handlePlayAudio(word.japanese, word.id)}
            className="ml-2 p-2 rounded-full hover:bg-opacity-10"
            title="Play Audio"
          >
            🔊
          </button>
        </div>
        <div className="text-lg text-gray-500 mb-2">{word.romaji || <span className="text-red-500">No romaji available</span>}</div>
      </>
    );
  };

  // Get available words based on current level and settings
  const getAvailableWords = useCallback(() => {
    return quizWords.filter(word => {
      // For hiragana/katakana, always include all such characters
      if (settings.category === 'hiragana') return word.isHiragana;
      if (settings.category === 'katakana') return word.isKatakana;
      // For 'all', include all words for unlocked levels
      if (settings.category === 'all') {
        const wordLevel = wordLevels.find(level => level.words.some(w => w.japanese === word.japanese));
        return !wordLevel || unlockedLevels.includes(wordLevel.level);
      }
      // Otherwise, filter by category and unlocked level
      const wordLevel = wordLevels.find(level => level.words.some(w => w.japanese === word.japanese));
      return word.category === settings.category && (!wordLevel || unlockedLevels.includes(wordLevel.level));
    });
  }, [settings.category, unlockedLevels]);

  // Start a new quiz
  const startQuiz = useCallback(() => {
    const availableWords = getAvailableWords();
    
    if (availableWords.length === 0) {
      // Show alert that no words are available for the current settings
      return;
    }

    // Select a random word from available words
    const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    
    // Generate options (including the correct answer)
    const options = generateOptions(randomWord, availableWords);
    
    setQuizState({
      currentWord: randomWord,
      options,
      isCorrect: false,
      showFeedback: false,
      score: 0,
      totalQuestions: 0,
      completed: false
    });
  }, [getAvailableWords]);

  // Handle answer selection
  const handleAnswerSelect = (selectedAnswer: string) => {
    if (!quizState.currentWord) return;

    const isCorrect = selectedAnswer === quizState.currentWord.english;
    
    // Update word progress in the context
    updateWordProgress(quizState.currentWord.japanese, isCorrect);

    setQuizState(prev => ({
      ...prev,
      isCorrect,
      showFeedback: true,
      score: isCorrect ? prev.score + 1 : prev.score,
      totalQuestions: prev.totalQuestions + 1
    }));

    // If this was the last question, update quiz progress
    if (prev.totalQuestions + 1 >= 10) {
      const finalScore = (isCorrect ? prev.score + 1 : prev.score) / 10 * 100;
      updateQuizProgress(currentLevel, finalScore);
    }
  };

  // Render level selection
  const renderLevelSelection = () => (
    <FormControl fullWidth sx={{ mb: 2 }}>
      <InputLabel>Level</InputLabel>
      <Select
        value={settings.level}
        onChange={(e) => setSettings(prev => ({ ...prev, level: e.target.value as number }))}
        label="Level"
      >
        {wordLevels.map(level => (
          <MenuItem 
            key={level.level} 
            value={level.level}
            disabled={!unlockedLevels.includes(level.level)}
          >
            Level {level.level} {!unlockedLevels.includes(level.level) && '(Locked)'}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  // Render category selection with level restrictions
  const renderCategorySelection = () => {
    const currentLevelData = wordLevels.find(l => l.level === settings.level);
    const availableCategories = currentLevelData?.practiceCategories || [];

    return (
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Category</InputLabel>
        <Select
          value={settings.category}
          onChange={(e) => {
            const cat = e.target.value as Category;
            setSettings(prev => ({
              ...prev,
              category: cat,
              difficulty: (cat === 'hiragana' || cat === 'katakana') ? 'easy' : prev.difficulty
            }));
          }}
          className={`w-full p-3 rounded-lg border ${themeClasses.input}`}
        >
          <MenuItem value="all">All Categories</MenuItem>
          {availableCategories.map(category => (
            <MenuItem key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  };

  // Add function to calculate level statistics
  const calculateLevelStats = useCallback(() => {
    const stats: LevelStats[] = [];
    
    // Get all unlocked levels
    const levels = wordLevels.filter(level => unlockedLevels.includes(level.level));
    
    levels.forEach(level => {
      const levelWords = quizWords.filter(word => 
        level.words.some(w => w.japanese === word.japanese)
      );
      
      // Calculate average score for this level
      const levelScores = levelWords.map(word => {
        const key = `vocabulary-${word.japanese}`;
        const itemProgress = progress[key];
        return itemProgress ? (itemProgress.correct / itemProgress.total) * 100 : 0;
      });
      const averageScore = levelScores.length > 0 
        ? levelScores.reduce((a, b) => a + b, 0) / levelScores.length 
        : 0;
      
      const levelStat: LevelStats = {
        level: level.level,
        totalWords: levelWords.length,
        masteredWords: levelWords.filter(word => {
          const key = `vocabulary-${word.japanese}`;
          return progress[key]?.correct >= 3;
        }).length,
        inProgressWords: levelWords.filter(word => {
          const key = `vocabulary-${word.japanese}`;
          return progress[key]?.correct > 0 && progress[key]?.correct < 3;
        }).length,
        notStartedWords: levelWords.filter(word => {
          const key = `vocabulary-${word.japanese}`;
          return !progress[key] || progress[key]?.correct === 0;
        }).length,
        averageScore
      };
      
      stats.push(levelStat);
    });
    
    setLevelStats(stats);
  }, [progress, unlockedLevels]);

  // Update level stats when progress or unlocked levels change
  useEffect(() => {
    calculateLevelStats();
  }, [calculateLevelStats, progress, unlockedLevels]);

  // Add level statistics section to the quiz setup UI
  const renderLevelStats = () => (
    <Box sx={{ mb: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
      <Typography variant="h6" gutterBottom>
        Level Progress
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
        {levelStats.map((stats) => (
          <Box
            key={stats.level}
            sx={{
              p: 2,
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              bgcolor: settings.level === stats.level ? 'action.selected' : 'background.paper',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }}
            onClick={() => setSettings(prev => ({ ...prev, level: stats.level }))}
          >
            <Typography variant="subtitle1" gutterBottom>
              Level {stats.level}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2">
                Total Words: {stats.totalWords}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Box sx={{ width: '100%', height: 8, bgcolor: 'grey.200', borderRadius: 1, overflow: 'hidden' }}>
                  <Box
                    sx={{
                      width: `${(stats.masteredWords / stats.totalWords) * 100}%`,
                      height: '100%',
                      bgcolor: 'success.main'
                    }}
                  />
                  <Box
                    sx={{
                      width: `${(stats.inProgressWords / stats.totalWords) * 100}%`,
                      height: '100%',
                      bgcolor: 'warning.main',
                      position: 'relative',
                      top: -8
                    }}
                  />
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Mastered: {stats.masteredWords} | In Progress: {stats.inProgressWords}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average Score: {Math.round(stats.averageScore)}%
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );

  // Utility functions for H&K quizzes
  function getHiraganaWords() {
    return quizWords.filter(word => /[\u3040-\u309F]/.test(word.japanese));
  }
  function getKatakanaWords() {
    return quizWords.filter(word => /[\u30A0-\u30FF]/.test(word.japanese));
  }

  // Add explicit question loading for H&K quizzes
  const handleLoadQuestions = () => {
    let words = [];
    if (settings.category === 'hiragana') words = getHiraganaWords();
    else if (settings.category === 'katakana') words = getKatakanaWords();
    else words = quizWords;
    // Shuffle and pick N questions
    words = words.sort(() => Math.random() - 0.5).slice(0, settings.questionCount);
    setQuestions(words);
    setQuestionsLoaded(true);
  };

  // Modify the quiz setup UI to include level statistics
  const renderQuizSetup = () => (
    <div className="space-y-6">
      {/* Level Statistics */}
      {renderLevelStats()}

      {/* Existing quiz setup UI */}
      <div>
        <label className={`block mb-2 ${themeClasses.text}`}>Select Level:</label>
        <select
          value={settings.level}
          onChange={(e) => setSettings(prev => ({ ...prev, level: Number(e.target.value) }))}
          className={`w-full p-3 rounded-lg border ${themeClasses.input}`}
        >
          {wordLevels
            .filter(level => unlockedLevels.includes(level.level))
            .map(level => (
              <option key={level.level} value={level.level}>
                Level {level.level} ({levelStats.find(s => s.level === level.level)?.totalWords || 0} words)
              </option>
            ))}
        </select>
      </div>

      <div>
        <label className={`block mb-2 ${themeClasses.text}`}>Select Category:</label>
        <select
          value={settings.category}
          onChange={(e) => {
            const cat = e.target.value as Category;
            setSettings(prev => ({
              ...prev,
              category: cat,
              difficulty: (cat === 'hiragana' || cat === 'katakana') ? 'easy' : prev.difficulty
            }));
          }}
          className={`w-full p-3 rounded-lg border ${themeClasses.input}`}
        >
          <optgroup label="Basic Categories">
            <option value="greeting">Greetings</option>
            <option value="question">Questions</option>
            <option value="pronoun">Pronouns</option>
          </optgroup>
          
          <optgroup label="Parts of Speech">
            <option value="verb">Verbs</option>
            <option value="adjective">Adjectives</option>
            <option value="adverb">Adverbs</option>
            <option value="particle">Particles</option>
            <option value="conjunction">Conjunctions</option>
            <option value="interjection">Interjections</option>
          </optgroup>
          
          <optgroup label="Topic Categories">
            <option value="food">Food & Drinks</option>
            <option value="drink">Drinks</option>
            <option value="animals">Animals</option>
            <option value="colors">Colors</option>
            <option value="numbers">Numbers</option>
            <option value="family">Family</option>
            <option value="weather">Weather</option>
            <option value="time">Time & Dates</option>
            <option value="transportation">Transportation</option>
            <option value="clothing">Clothing</option>
            <option value="body">Body Parts</option>
            <option value="emotions">Emotions</option>
            <option value="school">School</option>
            <option value="work">Work</option>
            <option value="hobbies">Hobbies</option>
            <option value="nature">Nature</option>
            <option value="house">House</option>
            <option value="city">City</option>
            <option value="technology">Technology</option>
            <option value="health">Health</option>
            <option value="travel">Travel</option>
            <option value="shopping">Shopping</option>
            <option value="money">Money</option>
            <option value="direction">Directions</option>
            <option value="location">Locations</option>
            <option value="measurement">Measurements</option>
          </optgroup>
          
          <optgroup label="Special Categories">
            <option value="idiom">Idioms</option>
            <option value="proverb">Proverbs</option>
            <option value="onomatopoeia">Onomatopoeia</option>
            <option value="honorific">Honorifics</option>
            <option value="slang">Slang</option>
          </optgroup>
          
          <optgroup label="Writing Systems">
            <option value="hiragana">Hiragana</option>
            <option value="katakana">Katakana</option>
          </optgroup>
          
          <optgroup label="All Categories">
            <option value="all">All Categories</option>
          </optgroup>
        </select>
      </div>

      <div>
        <label className={`block mb-2 ${themeClasses.text}`}>Select Difficulty:</label>
        <select
          value={settings.difficulty}
          onChange={(e) => setSettings(prev => ({ ...prev, difficulty: e.target.value as Difficulty }))}
          className={`w-full p-3 rounded-lg border ${themeClasses.input}`}
        >
          <option value="easy">Easy (Show kana + romaji)</option>
          <option value="medium">Medium (Show kana only, answer in romaji)</option>
          <option value="hard">Hard (Show kana only, answer in romaji or English)</option>
          <option value="extraHard">Extra Hard (Show kana, answer in English AND Japanese)</option>
        </select>
      </div>

      {settings.difficulty === 'hard' && (
        <div>
          <label className={`block mb-2 ${themeClasses.text}`}>Answer Type:</label>
          <select
            value={settings.answerType}
            onChange={(e) => setSettings(prev => ({ ...prev, answerType: e.target.value as AnswerType }))}
            className={`w-full p-3 rounded-lg border ${themeClasses.input}`}
          >
            <option value="hiragana">Hiragana</option>
            <option value="katakana">Katakana</option>
            <option value="romaji">Romaji</option>
          </select>
        </div>
      )}

      <div>
        <label className={`block mb-2 ${themeClasses.text}`}>Number of Questions:</label>
        <select
          value={settings.questionCount}
          onChange={(e) => {
            const value = Math.min(Number(e.target.value), 50);
            setSettings(prev => ({ ...prev, questionCount: value }));
          }}
          className={`w-full p-3 rounded-lg border ${themeClasses.input}`}
        >
          <option value="5">5 Questions</option>
          <option value="10">10 Questions</option>
          <option value="15">15 Questions</option>
          <option value="20">20 Questions</option>
          <option value="25">25 Questions</option>
          <option value="30">30 Questions</option>
          <option value="35">35 Questions</option>
          <option value="40">40 Questions</option>
          <option value="45">45 Questions</option>
          <option value="50">50 Questions</option>
        </select>
      </div>

      {/* Only show Load Questions for H&K */}
      {(settings.category === 'hiragana' || settings.category === 'katakana') && !questionsLoaded && (
        <button
          onClick={handleLoadQuestions}
          className={`w-full p-3 rounded-lg ${themeClasses.button.primary}`}
        >
          Load Questions
        </button>
      )}

      {/* Only show Start Quiz if questions are loaded for H&K, or always for others */}
      {((settings.category === 'hiragana' || settings.category === 'katakana') ? questionsLoaded : true) && (
        <button
          onClick={handleStartQuiz}
          className={`w-full p-3 rounded-lg ${themeClasses.button.primary}`}
        >
          Start Quiz
        </button>
      )}
    </div>
  );

  // Update the quiz content rendering to use the new setup UI
  const renderQuizContent = () => {
    if (quizState.mode === 'setup') {
      return renderQuizSetup();
    } else if (quizState.mode === 'quiz') {
      if (!currentWord) return <div>Loading…</div>;
      return (
        <div className="space-y-4">
          {renderWord(questions[quizState.currentQuestion])}
          <div className="mb-6">
            <div className="text-sm text-gray-600 mb-4">
              Question {quizState.currentQuestion + 1} of {questions.length}
            </div>
            <div className="flex justify-between items-center">
              <div className={`text-sm ${themeClasses.text}`}>
                Score: {score}/{quizState.currentQuestion + 1}
              </div>
              <div className={`text-sm ${themeClasses.text}`}>
                {settings.difficulty.charAt(0).toUpperCase() + settings.difficulty.slice(1)}
              </div>
            </div>
          </div>

          {/* In the quiz UI, use writing mode for H&K Quiz */}
          {(settings.category === 'hiragana' || settings.category === 'katakana') && isHKQuiz ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {settings.difficulty === 'extraHard' ? (
                <>
                  <input
                    type="text"
                    value={extraHardInput.english}
                    onChange={e => setExtraHardInput({ ...extraHardInput, english: e.target.value })}
                    placeholder="Enter English meaning"
                    className="w-full p-3 rounded-lg border mb-2"
                  />
                  <input
                    type="text"
                    value={extraHardInput.japanese}
                    onChange={e => setExtraHardInput({ ...extraHardInput, japanese: e.target.value })}
                    placeholder="Enter Japanese (romaji or kana)"
                    className="w-full p-3 rounded-lg border"
                  />
                </>
              ) : (
                <input
                  type="text"
                  value={userAnswer}
                  onChange={handleInputChange}
                  placeholder={settings.difficulty === 'medium' ? 'Type the romaji' : settings.difficulty === 'hard' ? 'Type the romaji or English' : 'Type your answer'}
                  className={`w-full p-3 rounded-lg border ${themeClasses.input}`}
                />
              )}
              <button
                type="submit"
                className={`w-full p-3 rounded-lg ${themeClasses.button.primary}`}
                disabled={quizState.showFeedback}
              >
                Check Answer
              </button>
            </form>
          ) : (
            <div className="space-y-3">
              {currentOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => !quizState.showFeedback && checkAnswer(option, index)}
                  className={`w-full text-left p-4 rounded-lg transition-all ${
                    quizState.selectedAnswer === index
                      ? quizState.isCorrect
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                  disabled={quizState.showFeedback}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {quizState.showFeedback && (
            <div className="mt-4">
              {quizState.isCorrect ? (
                <div className="text-green-700 font-semibold">Correct!</div>
              ) : (
                <div className="text-red-700 font-semibold">
                  Incorrect! The correct answer is: <span className="underline">{
                    currentWord
                      ? (currentWord.english || 'No English available')
                      : 'No answer available'
                  }</span>
                </div>
              )}
              {/* Always show romaji for the answer */}
              <div className="text-gray-700 mt-2">
                Romaji: <span className="font-semibold">{currentWord && currentWord.romaji ? currentWord.romaji : <span className="text-red-500">No romaji available</span>}</span>
              </div>
              
              {/* Show example sentences if available */}
              {currentWord?.examples && currentWord.examples.length > 0 && (
                <div className="mt-4">
                  <div className="text-gray-700 font-semibold mb-2">Example Usage:</div>
                  {currentWord.examples.map((example, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mb-2">
                      <div className="text-lg">{example.japanese}</div>
                      <div className="text-gray-600 dark:text-gray-400">{example.romaji}</div>
                      <div className="text-gray-700 dark:text-gray-300">{example.english}</div>
                      {example.notes && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 italic mt-1">
                          Note: {example.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Show additional notes if available */}
              {currentWord?.notes && (
                <div className="mt-4">
                  <div className="text-gray-700 font-semibold mb-2">Additional Notes:</div>
                  <div className="text-gray-600 dark:text-gray-400">{currentWord.notes}</div>
                </div>
              )}

              <button
                onClick={handleNextQuestion}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {quizState.currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
              </button>
            </div>
          )}
        </div>
      );
    } else {
      const timeSpent = timeEnded && timeStarted 
        ? Math.round((timeEnded.getTime() - timeStarted.getTime()) / 1000)
        : 0;
      const minutes = Math.floor(timeSpent / 60);
      const seconds = timeSpent % 60;
      const accuracy = Math.round((score / questions.length) * 100);

      return (
        <div className="text-center">
          <h2 className={`text-2xl font-bold mb-4 ${themeClasses.text}`}>Quiz Complete!</h2>
          <div className={`text-xl mb-4 ${themeClasses.text}`}>
            Score: {score}/{questions.length}
          </div>
          <div className={`text-lg mb-6 ${themeClasses.text}`}>
            Best Streak: {bestStreak}
          </div>
          <button
            onClick={handleRestart}
            className={`px-6 py-3 rounded-lg ${themeClasses.button.primary}`}
          >
            Restart Quiz
          </button>
        </div>
      );
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Japanese Quiz
      </Typography>

      {!quizState.currentWord && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Quiz Settings
          </Typography>
          <Stack spacing={2}>
            {renderLevelSelection()}
            {renderCategorySelection()}
            {/* ... other settings ... */}
          </Stack>
          {/* ... existing button ... */}
          {getAvailableWords().length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              No words available for the current settings. Try changing the level or category.
            </Alert>
          )}
        </Box>
      )}

      {/* ... rest of the quiz UI ... */}
      {questions.length === 0 && (
        <div className="text-center text-blue-600 mt-8">No questions available for these settings. Try changing the level, category, or difficulty.</div>
      )}
    </Box>
  );
};

export default Quiz;