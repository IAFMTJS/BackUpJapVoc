import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { useSound } from '../context/SoundContext';
import { useProgress } from '../context/ProgressContext';
import { useTheme } from '../context/ThemeContext';
import { QuizWord, quizWords } from '../data/quizData';
import { Kanji, kanjiList } from '../data/kanjiData';
import { playAudio, playDynamicAudio } from '../utils/audio';
import { analyzeStrokeAdvanced, validateStrokeAdvanced, calculateStrokeOrderScoreAdvanced } from '../utils/advancedStrokeRecognition';
import { initDatabase, savePracticeSession, getPracticeSessions, saveKanjiProgress, getKanjiProgress, saveStrokeData, getStrokeData } from '../utils/offlineSupport';
import { debounce, throttle, memoize, measureAsync, measureSync, caches, performanceMonitor } from '../utils/performanceOptimization';
import { Point, StrokeData, PracticeSession, KanjiProgress } from '../types/stroke';
import { DailyChallengeCard, CharacterDecompositionView, MasteryIndicator, PracticeGrid } from './practice';

// New types for enhanced features
type PracticeMode = 'standard' | 'practice' | 'custom' | 'daily' | 'compound';
type MasteryLevel = 'beginner' | 'intermediate' | 'advanced' | 'master';
type WritingMode = 'hiragana' | 'katakana';
type Difficulty = 'easy' | 'medium' | 'hard';
type PracticeType = 'copy' | 'convert' | 'translate';
type InputMode = 'draw' | 'type';
type StrokeType = 'horizontal' | 'vertical' | 'diagonal' | 'curve';

interface PracticeHistory {
  date: Date;
  mode: PracticeMode;
  characters: string[];
  score: number;
  mistakes: string[];
  timeSpent: number;
}

interface CharacterDecomposition {
  character: string;
  components: string[];
  meanings: string[];
  readings: string[];
  strokeCount: number;
  radicals: string[];
}

interface PracticeProgress {
  character: string;
  attempts: number;
  correctStrokes: number;
  totalStrokes: number;
  lastPracticed: Date;
  masteryLevel: MasteryLevel;
  mistakes: string[];
  averageTime: number;
}

interface CustomWordList {
  id: string;
  name: string;
  description: string;
  characters: string[];
  createdAt: Date;
  lastModified: Date;
  practiceCount: number;
}

interface DailyChallenge {
  date: Date;
  characters: string[];
  difficulty: Difficulty;
  theme: string;
  bonusPoints: number;
  timeLimit: number;
  completed: boolean;
  score: number;
}

interface StrokeFeedback {
  isCorrect: boolean;
  message: string;
  expectedStroke: StrokeType;
  actualStroke: StrokeType;
  confidence: number;
  suggestions?: string[];
}

interface PracticeContentItem {
  japanese: string;
  english: string;
  romaji: string;
  isHiragana: boolean;
  isKatakana: boolean;
  difficulty: Difficulty;
  category?: string;
}

type PracticeItem = QuizWord | PracticeContentItem;

type PracticeContent = {
  hiragana: {
    easy: PracticeContentItem[];
    medium: PracticeContentItem[];
    hard: PracticeContentItem[];
  };
  katakana: {
    easy: PracticeContentItem[];
    medium: PracticeContentItem[];
    hard: PracticeContentItem[];
  };
};

const practiceContent: PracticeContent = {
  hiragana: {
    easy: [
      { japanese: 'あ', english: 'a', romaji: 'a', isHiragana: true, isKatakana: false, difficulty: 'easy' },
      { japanese: 'い', english: 'i', romaji: 'i', isHiragana: true, isKatakana: false, difficulty: 'easy' },
      { japanese: 'う', english: 'u', romaji: 'u', isHiragana: true, isKatakana: false, difficulty: 'easy' },
      { japanese: 'え', english: 'e', romaji: 'e', isHiragana: true, isKatakana: false, difficulty: 'easy' },
      { japanese: 'お', english: 'o', romaji: 'o', isHiragana: true, isKatakana: false, difficulty: 'easy' }
    ],
    medium: [
      { japanese: 'かき', english: 'writing', romaji: 'kaki', isHiragana: true, isKatakana: false, difficulty: 'medium' },
      { japanese: 'さかな', english: 'fish', romaji: 'sakana', isHiragana: true, isKatakana: false, difficulty: 'medium' },
      { japanese: 'たまご', english: 'egg', romaji: 'tamago', isHiragana: true, isKatakana: false, difficulty: 'medium' }
    ],
    hard: [
      { japanese: 'わたしはがくせいです', english: 'I am a student', romaji: 'watashi wa gakusei desu', isHiragana: true, isKatakana: false, difficulty: 'hard' },
      { japanese: 'にほんごをべんきょうしています', english: 'I am studying Japanese', romaji: 'nihongo wo benkyou shiteimasu', isHiragana: true, isKatakana: false, difficulty: 'hard' }
    ]
  },
  katakana: {
    easy: [
      { japanese: 'ア', english: 'a', romaji: 'a', isHiragana: false, isKatakana: true, difficulty: 'easy' },
      { japanese: 'イ', english: 'i', romaji: 'i', isHiragana: false, isKatakana: true, difficulty: 'easy' },
      { japanese: 'ウ', english: 'u', romaji: 'u', isHiragana: false, isKatakana: true, difficulty: 'easy' },
      { japanese: 'エ', english: 'e', romaji: 'e', isHiragana: false, isKatakana: true, difficulty: 'easy' },
      { japanese: 'オ', english: 'o', romaji: 'o', isHiragana: false, isKatakana: true, difficulty: 'easy' }
    ],
    medium: [
      { japanese: 'カメラ', english: 'camera', romaji: 'kamera', isHiragana: false, isKatakana: true, difficulty: 'medium' },
      { japanese: 'テレビ', english: 'TV', romaji: 'terebi', isHiragana: false, isKatakana: true, difficulty: 'medium' },
      { japanese: 'パソコン', english: 'computer', romaji: 'pasokon', isHiragana: false, isKatakana: true, difficulty: 'medium' }
    ],
    hard: [
      { japanese: 'アメリカからきました', english: 'I am from America', romaji: 'amerika kara kimashita', isHiragana: false, isKatakana: true, difficulty: 'hard' },
      { japanese: 'コーヒーがすきです', english: 'I like coffee', romaji: 'koohii ga suki desu', isHiragana: false, isKatakana: true, difficulty: 'hard' }
    ]
  }
};

// Stroke order data
const hiraganaStrokeOrder: { [key: string]: StrokeType[] } = {
  'あ': ['curve', 'horizontal', 'vertical'],
  'い': ['diagonal', 'diagonal'],
  'う': ['curve', 'horizontal'],
  'え': ['vertical', 'horizontal', 'diagonal'],
  'お': ['horizontal', 'vertical', 'curve'],
  // Add more hiragana stroke orders as needed
};

const katakanaStrokeOrder: { [key: string]: StrokeType[] } = {
  'ア': ['diagonal', 'horizontal'],
  'イ': ['vertical', 'diagonal'],
  'ウ': ['horizontal', 'vertical'],
  'エ': ['horizontal', 'vertical', 'horizontal'],
  'オ': ['horizontal', 'vertical', 'horizontal'],
  // Add more katakana stroke orders as needed
};

function getHiraganaStrokeOrder(char: string): StrokeType[] | null {
  return hiraganaStrokeOrder[char] || null;
}

function getKatakanaStrokeOrder(char: string): StrokeType[] | null {
  return katakanaStrokeOrder[char] || null;
}

function isQuizWord(item: PracticeItem): item is QuizWord {
  return 'isHiragana' in item && 'isKatakana' in item && !('difficulty' in item);
}

function isPracticeContentItem(item: PracticeItem): item is PracticeContentItem {
  return 'difficulty' in item;
}

interface WritingPracticeProps {
  mode: WritingMode;
  onComplete?: () => void;
}

interface WritingPracticeState {
  currentWord: QuizWord | null;
  userInput: string;
  translationInput: string;
  isCorrect: boolean | null;
  score: number;
  totalAttempts: number;
  currentStroke: number;
  showAnimation: boolean;
  displayMode: 'japanese' | 'english';
  
  practiceMode: PracticeMode;
  masteryLevel: MasteryLevel;
  practiceHistory: PracticeHistory[];
  currentProgress: PracticeProgress[];
  customWordLists: CustomWordList[];
  dailyChallenge: DailyChallenge | null;
  characterDecomposition: CharacterDecomposition | null;
  strokeData: StrokeData[];
  
  showStrokeGuide: boolean;
  showDecomposition: boolean;
  showProgressMap: boolean;
  isAnimating: boolean;
  showFeedback: boolean;
  feedback: StrokeFeedback | null;
  practiceGrid: boolean;
  showComparison: boolean;
}

const WritingPractice: React.FC<WritingPracticeProps> = ({ mode: initialMode, onComplete }) => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { playSound } = useSound();
  const { updateProgress, setTotalItems } = useProgress();
  const { isDarkMode, getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<WritingMode>(initialMode);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [practiceType, setPracticeType] = useState<PracticeType>('copy');
  const [requireTranslation, setRequireTranslation] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>('type');
  const [state, setState] = useState<WritingPracticeState>({
    currentWord: null,
    userInput: '',
    translationInput: '',
    isCorrect: null,
    score: 0,
    totalAttempts: 0,
    currentStroke: 0,
    showAnimation: false,
    displayMode: 'japanese',
    
    practiceMode: 'standard',
    masteryLevel: 'beginner',
    practiceHistory: [],
    currentProgress: [],
    customWordLists: [],
    dailyChallenge: null,
    characterDecomposition: null,
    strokeData: [],
    
    showStrokeGuide: true,
    showDecomposition: false,
    showProgressMap: false,
    isAnimating: false,
    showFeedback: false,
    feedback: null,
    practiceGrid: false,
    showComparison: false
  });

  // Memoized functions for performance
  const getFilteredWords = memoize(() => {
    return measureSync('getFilteredWords', () => {
      const items: PracticeItem[] = [];
      
      if (practiceType === 'copy') {
        const content = practiceContent[mode][difficulty];
        items.push(...content);
      } else {
        const filteredQuizWords = quizWords.filter(word => {
          if (mode === 'hiragana') {
            return word.isHiragana && /^[\u3040-\u309F]+$/.test(word.japanese);
          } else if (mode === 'katakana') {
            return word.isKatakana && /^[\u30A0-\u30FF]+$/.test(word.japanese);
          }
          return false;
        });
        items.push(...filteredQuizWords);
      }

      return items;
    });
  });

  // Debounced stroke analysis
  const analyzeStrokeDebounced = useCallback(
    debounce((points: Point[], word: PracticeItem | null) => {
      if (!word) return null;
      
      return measureSync('analyzeStroke', () => {
        const strokeData = analyzeStrokeAdvanced(points);
        const strokeOrder = getStrokeOrder(word);
        if (!strokeOrder) return null;

        const validation = validateStrokeAdvanced(strokeData, strokeOrder[state.currentStroke]);
        
        // Save stroke data for offline use
        saveStrokeData(word.japanese, [strokeData]);

        return {
          ...validation,
          strokeData
        };
      });
    }, 100),
    [state.currentStroke]
  );

  // Throttled mouse move handler
  const handleMouseMove = useCallback(
    throttle((e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!state.isDrawing || !canvasRef.current) return;
      
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      ctx.beginPath();
      ctx.moveTo(state.lastX, state.lastY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = isDarkMode ? '#fff' : '#000';
      ctx.lineWidth = 2;
      ctx.stroke();

      setState(prev => ({
        ...prev,
        lastX: x,
        lastY: y,
        strokePoints: [...(prev.strokePoints || []), { x, y, timestamp: Date.now() }]
      }));
    }, 16), // ~60fps
    [state.isDrawing, state.lastX, state.lastY, isDarkMode]
  );

  // Optimized stroke validation
  const validateStroke = useCallback(
    async (points: Point[], word: PracticeItem | null) => {
      if (!word) return null;

      return measureAsync('validateStroke', async () => {
        // Check cache first
        const cacheKey = `${word.japanese}-${state.currentStroke}`;
        const cached = caches.strokeData.get(cacheKey);
        if (cached) {
          return cached;
        }

        const feedback = await analyzeStrokeDebounced(points, word);
        if (feedback) {
          caches.strokeData.set(cacheKey, feedback);
        }
        return feedback;
      });
    },
    [analyzeStrokeDebounced, state.currentStroke]
  );

  // Optimized practice session handling
  const savePracticeProgress = useCallback(
    async (progress: PracticeProgress) => {
      await measureAsync('savePracticeProgress', async () => {
        // Save to offline storage
        await saveKanjiProgress({
          kanji: progress.character,
          masteryLevel: progress.masteryLevel,
          lastPracticed: new Date(),
          practiceHistory: [{
            timestamp: new Date(),
            score: progress.correctStrokes / progress.totalStrokes,
            mistakes: progress.mistakes
          }],
          compoundWordProgress: [],
          strokeOrderProgress: []
        });

        // Save practice session
        await savePracticeSession({
          kanji: progress.character,
          strokes: [],
          score: progress.correctStrokes / progress.totalStrokes,
          feedback: [],
          timestamp: new Date(),
          duration: 0,
          mistakes: progress.mistakes
        });
      });
    },
    []
  );

  // Optimized practice history loading
  const loadPracticeHistory = useCallback(
    async () => {
      return measureAsync('loadPracticeHistory', async () => {
        const sessions = await getPracticeSessions();
        return sessions.map(session => ({
          date: session.timestamp,
          mode: 'standard' as PracticeMode,
          characters: [session.kanji],
          score: session.score,
          mistakes: session.mistakes,
          timeSpent: session.duration
        }));
      });
    },
    []
  );

  // Optimized daily challenge generation
  const generateDailyChallenge = useCallback(
    () => {
      return measureSync('generateDailyChallenge', () => {
        const today = new Date();
        const characters = ['日', '月', '火', '水', '木', '金', '土'];
        const difficulty = 'medium' as Difficulty;
        
        return {
          date: today,
          characters,
          difficulty,
          theme: 'Days of the Week',
          bonusPoints: 50,
          timeLimit: 300,
          completed: false,
          score: 0
        };
      });
    },
    []
  );

  const getStrokeOrder = (word: PracticeItem): StrokeType[] | null => {
    if (!word) return null;

    // For single characters in practice content
    if (isPracticeContentItem(word) && word.japanese.length === 1) {
      const char = word.japanese;
      if (mode === 'hiragana' && /^[\u3040-\u309F]$/.test(char)) {
        return getHiraganaStrokeOrder(char);
      } else if (mode === 'katakana' && /^[\u30A0-\u30FF]$/.test(char)) {
        return getKatakanaStrokeOrder(char);
      }
    }
    
    // For quiz words
    if (isQuizWord(word) && word.japanese.length === 1) {
      const char = word.japanese;
      if (word.isHiragana && /^[\u3040-\u309F]$/.test(char)) {
        return getHiraganaStrokeOrder(char);
      } else if (word.isKatakana && /^[\u30A0-\u30FF]$/.test(char)) {
        return getKatakanaStrokeOrder(char);
      }
    }

    return null;
  };

  const analyzeStroke = (points: { x: number; y: number }[], word: PracticeItem | null): StrokeFeedback | null => {
    if (!word) return null;
    
    const strokeOrder = getStrokeOrder(word);
    if (!strokeOrder) return null;

    // Determine stroke type based on points
    const dx = points[points.length - 1].x - points[0].x;
    const dy = points[points.length - 1].y - points[0].y;
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    
    let strokeType: StrokeType;
    if (Math.abs(angle) < 30) {
      strokeType = 'horizontal';
    } else if (Math.abs(angle - 90) < 30 || Math.abs(angle + 90) < 30) {
      strokeType = 'vertical';
    } else if (Math.abs(angle - 45) < 30 || Math.abs(angle + 135) < 30) {
      strokeType = 'diagonal';
    } else {
      strokeType = 'curve';
    }

    // Check if stroke matches expected order
    const expectedStroke = strokeOrder[state.currentStroke];
    const isCorrect = strokeType === expectedStroke;

    return {
      isCorrect,
      message: isCorrect ? 'Correct stroke!' : `Expected ${expectedStroke} stroke`,
      expectedStroke,
      actualStroke: strokeType
    };
  };

  const getDisplayMode = (): 'japanese' | 'romaji' | 'english' => {
    if (difficulty === 'easy') {
      return 'japanese'; // Always show in hiragana/katakana
    }
    if (difficulty === 'medium') {
      // Randomly show in romaji or japanese
      return Math.random() < 0.5 ? 'japanese' : 'romaji';
    }
    if (difficulty === 'hard') {
      return 'english'; // Always show in English
    }
    return 'japanese';
  };

  const getDisplayText = (word: PracticeItem, displayMode: 'japanese' | 'romaji' | 'english'): string => {
    if (!word) return '';
    
    if (isQuizWord(word)) {
      switch (displayMode) {
        case 'japanese':
          return word.japanese;
        case 'romaji':
          return word.romaji || '';
        case 'english':
          return word.english;
        default:
          return word.japanese;
      }
    } else if (isPracticeContentItem(word)) {
      switch (displayMode) {
        case 'japanese':
          return word.japanese;
        case 'romaji':
          return word.romaji;
        case 'english':
          return word.english;
        default:
          return word.japanese;
      }
    }
    return '';
  };

  const getExpectedInput = (word: PracticeItem, displayMode: 'japanese' | 'romaji' | 'english'): string => {
    if (!word) return '';

    if (isQuizWord(word)) {
      switch (displayMode) {
        case 'japanese':
          return word.japanese;
        case 'romaji':
          return word.romaji || '';
        case 'english':
          return word.english;
        default:
          return word.japanese;
      }
    } else if (isPracticeContentItem(word)) {
      switch (displayMode) {
        case 'japanese':
          return word.japanese;
        case 'romaji':
          return word.romaji;
        case 'english':
          return word.english;
        default:
          return word.japanese;
      }
    }
    return '';
  };

  const validateInput = (input: string, expected: string, displayMode: 'japanese' | 'romaji' | 'english'): boolean => {
    const normalizedInput = input.trim().toLowerCase();
    const normalizedExpected = expected.trim().toLowerCase();
    const currentWord = state.currentWord;

    if (!currentWord) return false;

    if (difficulty === 'easy') {
      // Vraag is in hiragana/katakana, antwoord mag alles zijn
      return (
        normalizedInput === currentWord.japanese.toLowerCase() ||
        normalizedInput === (currentWord.romaji || '').toLowerCase()
      );
    }

    if (difficulty === 'medium') {
      if (state.displayMode === 'romaji') {
        // Vraag is romaji, verwacht hiragana/katakana
        return normalizedInput === currentWord.japanese.toLowerCase();
      } else {
        // Vraag is hiragana/katakana, verwacht romaji
        return normalizedInput === (currentWord.romaji || '').toLowerCase();
      }
    }

    if (difficulty === 'hard') {
      // Vraag is Engels, verwacht Japans (hiragana, katakana of kanji)
      return normalizedInput === currentWord.japanese.toLowerCase();
    }

    return false;
  };

  const checkAnswer = () => {
    if (!state.currentWord) return;

    const expectedInput = getExpectedInput(state.currentWord, state.displayMode);
    const isCorrect = validateInput(state.userInput, expectedInput, state.displayMode);
    
    let isTranslationCorrect = true;
    if (requireTranslation && state.currentWord) {
      const expectedTranslation = isQuizWord(state.currentWord) 
        ? state.currentWord.english 
        : state.currentWord.english;
      isTranslationCorrect = state.translationInput.trim().toLowerCase() === expectedTranslation.toLowerCase();
    }

    setState(prev => ({
      ...prev,
      isCorrect,
      isTranslationCorrect: requireTranslation ? isTranslationCorrect : null,
      score: isCorrect && (!requireTranslation || isTranslationCorrect) ? prev.score + 1 : prev.score,
      totalAttempts: prev.totalAttempts + 1
    }));

    if (isCorrect && (!requireTranslation || isTranslationCorrect)) {
      playSound('correct');
      if (state.currentWord) {
        updateProgress(mode, {
          totalQuestions: 1,
          correctAnswers: 1,
          bestStreak: state.score + 1,
          highScore: state.score + 1,
          lastAttempt: new Date().toISOString()
        });
      }
    } else {
      playSound('incorrect');
      if (state.currentWord) {
        updateProgress(mode, {
          totalQuestions: 1,
          correctAnswers: 0,
          lastAttempt: new Date().toISOString()
        });
      }
    }

    if (state.score + (isCorrect && (!requireTranslation || isTranslationCorrect) ? 1 : 0) >= 10) {
      playSound('complete');
      if (onComplete) onComplete();
      else navigate('/');
    }
  };

  const startNewPractice = () => {
    const items = getFilteredWords();
    if (items.length === 0) {
      setState(prev => ({ ...prev, currentWord: null }));
      return;
    }

    const randomIndex = Math.floor(Math.random() * items.length);
    const newWord = items[randomIndex];
    
    setState(prev => ({
      ...prev,
      currentWord: newWord,
      userInput: '',
      translationInput: '',
      isCorrect: null,
      isTranslationCorrect: null,
      currentStroke: 0,
      strokeFeedback: null,
      strokePoints: undefined,
      displayMode: getDisplayMode()
    }));

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        drawStrokeGuide(ctx);
      }
    }
  };

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setState(prev => ({
      ...prev,
      isDrawing: true,
      lastX: x,
      lastY: y,
      strokePoints: [{ x, y, timestamp: Date.now() }]
    }));
  }, []);

  const handleMouseUp = useCallback(async () => {
    if (!state.isDrawing || !state.strokePoints || !canvasRef.current) return;
    
    const feedback = await validateStroke(state.strokePoints, state.currentWord);
    if (feedback) {
      setState(prev => ({
        ...prev,
        isDrawing: false,
        strokeFeedback: feedback,
        currentStroke: feedback.isCorrect ? prev.currentStroke + 1 : prev.currentStroke,
        strokePoints: undefined
      }));

      if (feedback.isCorrect) {
        playSound('correct');
      } else {
        playSound('incorrect');
      }
    }
  }, [state.isDrawing, state.strokePoints, state.currentWord, validateStroke]);

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    drawStrokeGuide(ctx);
  };

  const showStrokeGuide = () => {
    if (!state.currentWord || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const char = state.currentWord && 'japanese' in state.currentWord
      ? state.currentWord.japanese
      : '';
    
    const strokeOrder = getStrokeOrder(state.currentWord);
    if (!strokeOrder) return;

    // Draw stroke order guide
    ctx.strokeStyle = isDarkMode ? '#4a5568' : '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    
    // Draw each stroke's guide
    strokeOrder.forEach((stroke, index) => {
      if (index >= state.currentStroke) {
        // Draw guide for current and future strokes
        drawStrokeGuide(ctx);
      }
    });
    
    ctx.setLineDash([]);
  };

  const drawStrokeGuide = (ctx: CanvasRenderingContext2D) => {
    if (!state.currentWord || !canvasRef.current) return;
    
    const strokeOrder = getStrokeOrder(state.currentWord);
    if (!strokeOrder) return;

    // Draw each stroke's guide
    strokeOrder.forEach((stroke, index) => {
      if (index >= state.currentStroke) {
        // Draw guide for current and future strokes
        ctx.strokeStyle = index === state.currentStroke ? '#4CAF50' : '#E0E0E0';
        ctx.lineWidth = 2;
        
        // Draw guide based on stroke type
        const centerX = ctx.canvas.width / 2;
        const centerY = ctx.canvas.height / 2;
        const size = Math.min(ctx.canvas.width, ctx.canvas.height) * 0.6;
        
        ctx.beginPath();
        switch (stroke) {
          case 'horizontal':
            ctx.moveTo(centerX - size/2, centerY);
            ctx.lineTo(centerX + size/2, centerY);
            break;
          case 'vertical':
            ctx.moveTo(centerX, centerY - size/2);
            ctx.lineTo(centerX, centerY + size/2);
            break;
          case 'diagonal':
            ctx.moveTo(centerX - size/2, centerY - size/2);
            ctx.lineTo(centerX + size/2, centerY + size/2);
            break;
          case 'curve':
            ctx.arc(centerX, centerY, size/2, 0, Math.PI * 2);
            break;
        }
        ctx.stroke();
      }
    });
  };

  useEffect(() => {
    if (state.showStrokeGuide) {
      showStrokeGuide();
    }
  }, [state.showStrokeGuide, state.currentStroke]);

  const handleSubmit = () => {
    checkAnswer();
  };

  const handleNext = () => {
    clearCanvas();
    startNewPractice();
  };

  useEffect(() => {
    if (settings.useTimer && state.timeRemaining > 0) {
      const timer = setInterval(() => {
        setState(prev => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1,
        }));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [settings.useTimer, state.timeRemaining]);

  useEffect(() => {
    if (state.timeRemaining === 0) {
      playSound('incorrect');
      handleNext();
    }
  }, [state.timeRemaining]);

  useEffect(() => {
    startNewPractice();
  }, [mode, difficulty, practiceType]);

  // Initialize total items count when component loads or mode changes
  useEffect(() => {
    const items = getFilteredWords();
    setTotalItems(mode, items.length);
  }, [mode, difficulty]);

  const handlePlayAudio = (japanese: string) => {
    playAudio(japanese);
  };

  // Utility functions for enhanced features
  const calculateMasteryLevel = (progress: PracticeProgress): MasteryLevel => {
    const accuracy = progress.correctStrokes / progress.totalStrokes;
    const attempts = progress.attempts;
    
    if (accuracy >= 0.95 && attempts >= 10) return 'master';
    if (accuracy >= 0.85 && attempts >= 5) return 'advanced';
    if (accuracy >= 0.7 && attempts >= 3) return 'intermediate';
    return 'beginner';
  };

  const validateStrokeAdvanced = (
    stroke: StrokeData,
    expectedStroke: StrokeData,
    tolerance: number = 0.2
  ): StrokeFeedback => {
    const directionMatch = Math.abs(stroke.direction - expectedStroke.direction) < tolerance;
    const lengthMatch = Math.abs(stroke.length - expectedStroke.length) / expectedStroke.length < tolerance;
    const typeMatch = stroke.type === expectedStroke.type;
    
    const confidence = (directionMatch ? 0.4 : 0) + (lengthMatch ? 0.4 : 0) + (typeMatch ? 0.2 : 0);
    
    return {
      isCorrect: confidence > 0.8,
      message: confidence > 0.8 ? 'Correct stroke!' : 'Try again',
      expectedStroke: expectedStroke.type,
      actualStroke: stroke.type,
      confidence,
      suggestions: confidence < 0.8 ? getStrokeSuggestions(stroke, expectedStroke) : undefined
    };
  };

  const getStrokeSuggestions = (stroke: StrokeData, expected: StrokeData): string[] => {
    const suggestions: string[] = [];
    
    if (stroke.type !== expected.type) {
      suggestions.push(`Try a ${expected.type} stroke instead of ${stroke.type}`);
    }
    
    if (Math.abs(stroke.direction - expected.direction) > 0.2) {
      const direction = stroke.direction > expected.direction ? 'more' : 'less';
      suggestions.push(`Adjust the angle to be ${direction} horizontal`);
    }
    
    if (Math.abs(stroke.length - expected.length) / expected.length > 0.2) {
      const length = stroke.length > expected.length ? 'shorter' : 'longer';
      suggestions.push(`Make the stroke ${length}`);
    }
    
    return suggestions;
  };

  const decomposeCharacter = (character: string): CharacterDecomposition => {
    // This would typically use a kanji decomposition API or database
    // For now, return a mock implementation
    return {
      character,
      components: [],
      meanings: [],
      readings: [],
      strokeCount: 0,
      radicals: []
    };
  };

  const createCustomWordList = (name: string, description: string, characters: string[]): CustomWordList => {
    return {
      id: Date.now().toString(),
      name,
      description,
      characters,
      createdAt: new Date(),
      lastModified: new Date(),
      practiceCount: 0
    };
  };

  return (
    <div className={`container mx-auto px-4 py-8 ${isDarkMode ? 'bg-dark' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto">
        {/* Practice Mode Selector */}
        <div className="mb-6">
          <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-neon-blue' : 'text-gray-700'}`}>
            Practice Mode
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {(['standard', 'practice', 'custom', 'daily', 'compound'] as PracticeMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setState(prev => ({ ...prev, practiceMode: mode }))}
                className={`p-3 rounded-lg transition-all duration-300 ${
                  state.practiceMode === mode
                    ? isDarkMode
                      ? 'bg-neon-blue text-white shadow-[0_0_10px_rgba(0,149,255,0.4)]'
                      : 'bg-blue-500 text-white'
                    : isDarkMode
                      ? 'bg-dark-lighter text-text-primary hover:bg-dark-lightest'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Daily Challenge Card */}
        {state.practiceMode === 'daily' && state.dailyChallenge && (
          <div className="mb-6">
            <DailyChallengeCard
              challenge={state.dailyChallenge}
              onStart={() => {
                // Start daily challenge logic
                setState(prev => ({
                  ...prev,
                  currentWord: quizWords.find(w => state.dailyChallenge?.characters.includes(w.japanese)) || null
                }));
              }}
              isDarkMode={isDarkMode}
            />
          </div>
        )}

        {/* Main Practice Area */}
        <div className={`${isDarkMode ? 'bg-dark-lighter' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6 border ${isDarkMode ? 'border-dark-border' : 'border-gray-200'}`}>
          {/* Character Display and Input */}
          <div className="mb-6">
            <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-neon-blue' : 'text-gray-800'}`}>
              {state.currentWord?.japanese || 'Practice Writing'}
            </h2>
            {state.currentWord && (
              <div className={`text-lg ${isDarkMode ? 'text-text-primary' : 'text-gray-600'}`}>
                {state.displayMode === 'japanese' ? state.currentWord.english : state.currentWord.japanese}
              </div>
            )}
          </div>

          {/* Writing Canvas */}
          {inputMode === 'draw' && (
            <div className="mb-6">
              <canvas
                ref={canvasRef}
                className={`w-full h-64 border-2 rounded-lg ${
                  isDarkMode 
                    ? 'border-neon-blue/30 bg-black/50' 
                    : 'border-gray-300 bg-white'
                }`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
              <div className="flex justify-between mt-4">
                <button
                  onClick={clearCanvas}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-neon-blue/10 text-neon-blue hover:bg-neon-blue/20 hover:shadow-[0_0_10px_rgba(0,149,255,0.2)]' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Clear
                </button>
                <button
                  onClick={undoStroke}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-neon-pink/10 text-neon-pink hover:bg-neon-pink/20 hover:shadow-[0_0_10px_rgba(255,0,128,0.2)]' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Undo Stroke
                </button>
              </div>
            </div>
          )}

          {/* Text Input */}
          {inputMode === 'type' && (
            <div className="mb-6">
              <input
                type="text"
                value={state.userInput}
                onChange={(e) => setState(prev => ({ ...prev, userInput: e.target.value }))}
                placeholder="Type your answer..."
                className={`w-full p-4 rounded-lg ${
                  isDarkMode 
                    ? 'bg-dark-lighter border-dark-border text-text-primary' 
                    : 'bg-white border-gray-300 text-gray-800'
                } border`}
                disabled={state.isCorrect !== null}
              />
            </div>
          )}

          {/* Translation Input */}
          {requireTranslation && (
            <div className="mb-6">
              <input
                type="text"
                value={state.translationInput}
                onChange={(e) => setState(prev => ({ ...prev, translationInput: e.target.value }))}
                placeholder="Enter translation..."
                className={`w-full p-4 rounded-lg ${
                  isDarkMode 
                    ? 'bg-dark-lighter border-dark-border text-text-primary' 
                    : 'bg-white border-gray-300 text-gray-800'
                } border`}
                disabled={state.isCorrect !== null}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleSubmit}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-neon-pink hover:bg-neon-pink/90 text-white shadow-[0_0_10px_rgba(255,0,128,0.4)]' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              Submit
            </button>
            <button
              onClick={handleNext}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-neon-blue hover:bg-neon-blue/90 text-white shadow-[0_0_10px_rgba(0,149,255,0.4)]' 
                  : 'bg-gray-500 hover:bg-gray-600 text-white'
              }`}
            >
              Next
            </button>
          </div>

          {/* Feedback Display */}
          {state.isCorrect !== null && (
            <div className={`mt-6 p-4 rounded-lg ${
              state.isCorrect 
                ? isDarkMode 
                  ? 'bg-neon-blue/20 border-neon-blue/30' 
                  : 'bg-green-100 border-green-200'
                : isDarkMode 
                  ? 'bg-neon-pink/20 border-neon-pink/30' 
                  : 'bg-red-100 border-red-200'
            } border`}>
              <div className={`text-lg font-medium mb-2 ${
                state.isCorrect 
                  ? isDarkMode 
                    ? 'text-neon-blue' 
                    : 'text-green-800'
                  : isDarkMode 
                    ? 'text-neon-pink' 
                    : 'text-red-800'
              }`}>
                {state.isCorrect ? 'Correct!' : 'Incorrect!'}
              </div>
              {!state.isCorrect && state.currentWord && (
                <div className={`${isDarkMode ? 'text-text-primary' : 'text-gray-800'} mb-2`}>
                  Correct Answer: {state.currentWord.japanese}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Character Analysis */}
        {state.characterDecomposition && (
          <div className="mb-6">
            <CharacterDecompositionView
              decomposition={state.characterDecomposition}
              isDarkMode={isDarkMode}
            />
          </div>
        )}

        {/* Mastery Progress */}
        {state.currentProgress.length > 0 && (
          <div className="mb-6">
            <MasteryIndicator
              level={state.masteryLevel}
              progress={state.currentProgress[0]}
              isDarkMode={isDarkMode}
            />
          </div>
        )}

        {/* Practice Grid */}
        {state.practiceGrid && state.currentWord && (
          <div className="mb-6">
            <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-neon-blue' : 'text-gray-700'}`}>
              Practice Similar Characters
            </h3>
            <PracticeGrid
              characters={['日', '月', '火', '水', '木', '金', '土']} // Example characters
              onSelect={(char) => {
                setState(prev => ({
                  ...prev,
                  currentWord: quizWords.find(w => w.japanese === char) || null,
                  userInput: '',
                  isCorrect: null
                }));
              }}
              isDarkMode={isDarkMode}
            />
          </div>
        )}

        {/* Settings Panel */}
        <div className={`${isDarkMode ? 'bg-dark-lighter' : 'bg-white'} rounded-lg shadow-lg p-6 border ${isDarkMode ? 'border-dark-border' : 'border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-neon-blue' : 'text-gray-700'}`}>
            Settings
          </h3>
          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={state.showAnimation}
                onChange={(e) => setState(prev => ({ ...prev, showAnimation: e.target.checked }))}
                className={`form-checkbox h-5 w-5 ${
                  isDarkMode ? 'text-neon-blue border-dark-border' : 'text-blue-500 border-gray-300'
                }`}
              />
              <span className={isDarkMode ? 'text-text-primary' : 'text-gray-700'}>
                Show Animation
              </span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={state.showStrokeGuide}
                onChange={(e) => setState(prev => ({ ...prev, showStrokeGuide: e.target.checked }))}
                className={`form-checkbox h-5 w-5 ${
                  isDarkMode ? 'text-neon-blue border-dark-border' : 'text-blue-500 border-gray-300'
                }`}
              />
              <span className={isDarkMode ? 'text-text-primary' : 'text-gray-700'}>
                Show Stroke Guide
              </span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={state.showDecomposition}
                onChange={(e) => setState(prev => ({ ...prev, showDecomposition: e.target.checked }))}
                className={`form-checkbox h-5 w-5 ${
                  isDarkMode ? 'text-neon-blue border-dark-border' : 'text-blue-500 border-gray-300'
                }`}
              />
              <span className={isDarkMode ? 'text-text-primary' : 'text-gray-700'}>
                Show Character Analysis
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WritingPractice;