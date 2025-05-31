import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { useProgress } from '../context/ProgressContext';
import { useTheme } from '../context/ThemeContext';
import { QuizWord, quizWords } from '../data/quizData';
import { Kanji, kanjiList } from '../data/kanjiData';
import { playAudio, playDynamicAudio } from '../utils/audio';
import { analyzeStrokeAdvanced, validateStrokeAdvanced, calculateStrokeOrderScoreAdvanced } from '../utils/advancedStrokeRecognition';
import { 
  initOfflineSupport as initDatabase,
  updateKanjiProgress as saveKanjiProgress,
  getKanjiProgress,
  saveStrokeData,
  getStrokeData,
  savePracticeSession,
  getPracticeSessions
} from '../utils/offlineSupport';
import { debounce, throttle, memoize, measureAsync, measureSync, caches, performanceMonitor } from '../utils/performanceOptimization';
import { Point, StrokeData, PracticeSession, KanjiProgress } from '../types/stroke';
import { DailyChallengeCard, CharacterDecompositionView, MasteryIndicator, PracticeGrid } from './practice';
import { motion, AnimatePresence } from 'framer-motion';
import { useLearning } from '../context/LearningContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { Box, Typography, Button, Slider, IconButton, Tooltip } from '@mui/material';
import { 
  Undo as UndoIcon, 
  Redo as RedoIcon, 
  Clear as ClearIcon,
  Check as CheckIcon,
  VolumeUp as VolumeUpIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { DictionaryItem } from '../types/dictionary';
import WritingCanvas from './WritingCanvas';
import { hiraganaList, katakanaList } from '../data/kanaData';

// New types for enhanced features
type PracticeMode = 'standard' | 'practice' | 'custom' | 'daily' | 'compound' | 'kanji' | 'hiragana' | 'katakana';
type MasteryLevel = 'beginner' | 'intermediate' | 'advanced' | 'master';
type WritingMode = 'hiragana' | 'katakana' | 'kanji';
type Difficulty = 'easy' | 'medium' | 'hard';
type PracticeType = 'copy' | 'convert' | 'translate' | 'free' | 'guided' | 'quiz';
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
  currentCharacter: string;
  showOverlay: boolean;
  showGrid: boolean;
  characterList: string[];
  currentIndex: number;
  searchTerm: string;
  selectedCategory: string;
  selectedDifficulty: string;
}

const WritingPractice: React.FC<WritingPracticeProps> = ({ mode: initialMode, onComplete }) => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { updateProgress, updateSectionProgress } = useProgress();
  const { isDarkMode, getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { updateWritingScore } = useLearning();
  const { settings: accessibilitySettings } = useAccessibility();

  // Separate state for mode and settings to avoid unnecessary re-renders
  const [mode, setMode] = useState<PracticeMode>(initialMode);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [practiceType, setPracticeType] = useState<PracticeType>('copy');
  const [requireTranslation, setRequireTranslation] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>('draw');

  // Add new state for tracking
  const [showTracking, setShowTracking] = useState(true);
  const [showRomaji, setShowRomaji] = useState(true);
  const [showMeaning, setShowMeaning] = useState(true);

  // Add these state variables near the top of the component
  const [strokes, setStrokes] = useState<Point[][]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<Point | null>(null);

  // Add these new state variables after the existing state declarations
  const [showGrid, setShowGrid] = useState(true);
  const [gridSize, setGridSize] = useState(40);
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [currentStrokeIndex, setCurrentStrokeIndex] = useState(0);
  const [strokeOrderGuide, setStrokeOrderGuide] = useState<{x: number, y: number, type: StrokeType}[]>([]);

  // Update mode when initialMode changes
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Main practice state
  const [state, setState] = useState<WritingPracticeState>(() => ({
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
    showComparison: false,
    currentCharacter: '',
    showOverlay: false,
    showGrid: true,
    characterList: [],
    currentIndex: 0,
    searchTerm: '',
    selectedCategory: 'all',
    selectedDifficulty: 'all'
  }));

  // Initialize character list based on mode
  useEffect(() => {
    const initializeCharacterList = () => {
      let characters: string[] = [];
      
      switch (mode) {
        case 'kanji':
          let filteredKanji = kanjiList;
          if (state.selectedCategory !== 'all') {
            filteredKanji = filteredKanji.filter(k => k.category === state.selectedCategory);
          }
          if (state.selectedDifficulty !== 'all') {
            filteredKanji = filteredKanji.filter(k => k.difficulty === state.selectedDifficulty);
          }
          characters = filteredKanji.map(k => k.character);
          break;
        case 'hiragana':
          characters = hiraganaList.map(k => k.character);
          break;
        case 'katakana':
          characters = katakanaList.map(k => k.character);
          break;
      }

      // If no characters found, use default characters based on mode
      if (characters.length === 0) {
        switch (mode) {
          case 'kanji':
            characters = ['日', '月', '火', '水', '木', '金', '土']; // Basic kanji
            break;
          case 'hiragana':
            characters = ['あ', 'い', 'う', 'え', 'お', 'か', 'き', 'く', 'け', 'こ']; // Basic hiragana
            break;
          case 'katakana':
            characters = ['ア', 'イ', 'ウ', 'エ', 'オ', 'カ', 'キ', 'ク', 'ケ', 'コ']; // Basic katakana
            break;
        }
      }

      setState(prev => ({
        ...prev,
        characterList: characters,
        currentIndex: 0,
        currentCharacter: characters[0] || ''
      }));
    };

    initializeCharacterList();
  }, [mode, state.selectedCategory, state.selectedDifficulty]);

  // Set current character when list or index changes
  useEffect(() => {
    if (state.characterList.length > 0) {
      const newCharacter = state.characterList[state.currentIndex];
      if (newCharacter !== state.currentCharacter) {
        setState(prev => ({
          ...prev,
          currentCharacter: newCharacter
        }));
        // Clear canvas when character changes
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          }
        }
      }
    }
  }, [state.characterList, state.currentIndex]);

  // Filter characters based on search term
  useEffect(() => {
    if (!state.searchTerm.trim()) {
      // Reset to original list based on mode
      switch (mode) {
        case 'kanji':
          let filteredKanji = kanjiList;
          if (state.selectedCategory !== 'all') {
            filteredKanji = filteredKanji.filter(k => k.category === state.selectedCategory);
          }
          if (state.selectedDifficulty !== 'all') {
            filteredKanji = filteredKanji.filter(k => k.difficulty === state.selectedDifficulty);
          }
          setState(prev => ({
            ...prev,
            characterList: filteredKanji.map(k => k.character)
          }));
          break;
        case 'hiragana':
          setState(prev => ({
            ...prev,
            characterList: hiraganaList.map(k => k.character)
          }));
          break;
        case 'katakana':
          setState(prev => ({
            ...prev,
            characterList: katakanaList.map(k => k.character)
          }));
          break;
      }
      return;
    }

    const searchLower = state.searchTerm.toLowerCase();
    switch (mode) {
      case 'kanji':
        const filteredKanji = kanjiList.filter(k => 
          k.character.includes(state.searchTerm) ||
          k.english.toLowerCase().includes(searchLower) ||
          k.onyomi.some(r => r.toLowerCase().includes(searchLower)) ||
          k.kunyomi.some(r => r.toLowerCase().includes(searchLower))
        );
        setState(prev => ({
          ...prev,
          characterList: filteredKanji.map(k => k.character)
        }));
        break;
      case 'hiragana':
        const filteredHiragana = hiraganaList.filter(k =>
          k.character.includes(state.searchTerm) ||
          k.romaji.toLowerCase().includes(searchLower)
        );
        setState(prev => ({
          ...prev,
          characterList: filteredHiragana.map(k => k.character)
        }));
        break;
      case 'katakana':
        const filteredKatakana = katakanaList.filter(k =>
          k.character.includes(state.searchTerm) ||
          k.romaji.toLowerCase().includes(searchLower)
        );
        setState(prev => ({
          ...prev,
          characterList: filteredKatakana.map(k => k.character)
        }));
        break;
    }
    setState(prev => ({
      ...prev,
      currentIndex: 0
    }));
  }, [state.searchTerm, mode, state.selectedCategory, state.selectedDifficulty]);

  // Memoized functions with proper dependency tracking
  const getFilteredWords = useCallback(() => {
    return measureSync('getFilteredWords', () => {
      const items: PracticeItem[] = [];
      
      if (practiceType === 'copy') {
        if (mode === 'kanji') {
          // For kanji mode, use quiz words that contain kanji
          const kanjiWords = quizWords.filter(word => /[\u4E00-\u9FFF]/.test(word.japanese));
          items.push(...kanjiWords);
        } else if (mode === 'hiragana' || mode === 'katakana') {
          // Only access practiceContent for hiragana and katakana modes
          const content = practiceContent[mode][difficulty];
          items.push(...content);
        }
      } else {
        const filteredQuizWords = quizWords.filter(word => {
          if (mode === 'hiragana') {
            return word.isHiragana && /^[\u3040-\u309F]+$/.test(word.japanese);
          } else if (mode === 'katakana') {
            return word.isKatakana && /^[\u30A0-\u30FF]+$/.test(word.japanese);
          } else if (mode === 'kanji') {
            return /[\u4E00-\u9FFF]/.test(word.japanese);
          }
          return false;
        });
        items.push(...filteredQuizWords);
      }

      return items;
    });
  }, [mode, difficulty, practiceType]);

  // Initialize component
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        // Initialize database if needed
        await initDatabase();
        
        // Load practice history
        const history = await loadPracticeHistory();
        setState(prev => ({
          ...prev,
          practiceHistory: history
        }));

        // Start first practice session
        startNewPractice();
      } catch (error) {
        console.error('Error initializing component:', error);
        // Set error state
        setState(prev => ({
          ...prev,
          feedback: {
            isCorrect: false,
            message: 'Error initializing practice session',
            expectedStroke: 'horizontal',
            actualStroke: 'horizontal',
            confidence: 0
          }
        }));
      }
    };

    initializeComponent();
  }, []); // Empty dependency array since this should only run once

  // Update total items when mode or difficulty changes
  useEffect(() => {
    const items = getFilteredWords();
    updateSectionProgress('dictionary', {
      totalItems: items.length
    });
  }, [mode, difficulty, getFilteredWords, updateSectionProgress]);

  // Start new practice when mode, difficulty, or practice type changes
  useEffect(() => {
    if (state.practiceMode !== 'daily') { // Don't restart if in daily challenge mode
      startNewPractice();
    }
  }, [mode, difficulty, practiceType, state.practiceMode]);

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

  // Add this utility function after the state declarations
  const getCanvasCoordinates = useCallback((clientX: number, clientY: number): Point | null => {
    if (!canvasRef.current) return null;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }, []);

  // Update the mouse event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const point = getCanvasCoordinates(e.clientX, e.clientY);
    if (!point) return;
    
    setIsDrawing(true);
    setCurrentStroke([point]);
    
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
      ctx.strokeStyle = isDarkMode ? '#fff' : '#000';
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, [isDarkMode, strokeWidth, getCanvasCoordinates]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    
    const point = getCanvasCoordinates(e.clientX, e.clientY);
    if (!point) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
      setCurrentStroke(prev => [...prev, point]);
    }
  }, [isDrawing, getCanvasCoordinates]);

  const handleMouseUp = useCallback(() => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    if (currentStroke.length > 1) {
      setStrokes(prev => [...prev, currentStroke]);
      // Advance to next stroke
      const strokeOrder = getStrokeOrder(state.currentWord);
      if (strokeOrder) {
        setCurrentStrokeIndex(prev => Math.min(prev + 1, strokeOrder.length - 1));
      }
    }
    setCurrentStroke([]);
  }, [isDrawing, currentStroke, state.currentWord]);

  const handleMouseLeave = useCallback(() => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      drawGrid(ctx);
      setStrokes([]);
      setCurrentStroke([]);
      setCurrentStrokeIndex(0);
      
      // Redraw tracking guide if enabled
      if (showTracking && state.currentCharacter) {
        ctx.globalAlpha = 0.2;
        ctx.font = '120px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = isDarkMode ? '#fff' : '#000';
        ctx.fillText(
          state.currentCharacter,
          canvasRef.current.width / 2,
          canvasRef.current.height / 2
        );
        ctx.globalAlpha = 1.0;
      }
    }
  }, [showTracking, state.currentCharacter, isDarkMode, drawGrid]);

  // Update the touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!canvasRef.current) return;
    
    const touch = e.touches[0];
    const point = getCanvasCoordinates(touch.clientX, touch.clientY);
    if (!point) return;
    
    setIsDrawing(true);
    setCurrentStroke([point]);
    
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
      ctx.strokeStyle = isDarkMode ? '#fff' : '#000';
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, [isDarkMode, strokeWidth, getCanvasCoordinates]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing || !canvasRef.current) return;
    
    const touch = e.touches[0];
    const point = getCanvasCoordinates(touch.clientX, touch.clientY);
    if (!point) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
      setCurrentStroke(prev => [...prev, point]);
    }
  }, [isDrawing, getCanvasCoordinates]);

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    handleMouseUp();
  }, [handleMouseUp]);

  // Restore the getStrokeOrder function
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

  // Restore other utility functions
  const getDisplayMode = (): 'japanese' | 'english' => 'japanese';

  const getDisplayText = (word: PracticeItem, displayMode: 'japanese' | 'english'): string => {
    if (!word) return '';
    
    if (isQuizWord(word)) {
      return word.japanese;
    } else if (isPracticeContentItem(word)) {
      return word.japanese;
    }
    return '';
  };

  const getExpectedInput = (word: PracticeItem, displayMode: 'japanese' | 'english'): string => {
    if (!word) return '';

    if (isQuizWord(word)) {
      return `${word.japanese} (${word.romaji || ''})`;
    } else if (isPracticeContentItem(word)) {
      return `${word.japanese} (${word.romaji})`;
    }
    return '';
  };

  const validateInput = (input: string, expected: string, displayMode: 'japanese' | 'english'): boolean => {
    const normalizedInput = input.trim().toLowerCase();
    const normalizedExpected = expected.trim().toLowerCase();
    const currentWord = state.currentWord;

    if (!currentWord) return false;

    return (
      normalizedInput === currentWord.japanese.toLowerCase() ||
      normalizedInput === (currentWord.romaji || '').toLowerCase()
    );
  };

  // Add calculateStrokeAccuracy function
  const calculateStrokeAccuracy = useCallback((drawnStroke: Point[], expectedStroke: StrokeType): number => {
    if (!drawnStroke.length) return 0;

    // Calculate the bounding box of the drawn stroke
    const xCoords = drawnStroke.map(p => p.x);
    const yCoords = drawnStroke.map(p => p.y);
    const minX = Math.min(...xCoords);
    const maxX = Math.max(...xCoords);
    const minY = Math.min(...yCoords);
    const maxY = Math.max(...yCoords);
    const width = maxX - minX;
    const height = maxY - minY;

    // Calculate the center point of the drawn stroke
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    // Get canvas dimensions
    if (!canvasRef.current) return 0;
    const canvasWidth = canvasRef.current.width;
    const canvasHeight = canvasRef.current.height;
    const canvasCenterX = canvasWidth / 2;
    const canvasCenterY = canvasHeight / 2;

    // Calculate various accuracy metrics
    let accuracy = 0;

    // 1. Position accuracy (how close to the center)
    const positionAccuracy = 1 - Math.min(
      Math.sqrt(Math.pow(centerX - canvasCenterX, 2) + Math.pow(centerY - canvasCenterY, 2)) / 
      Math.sqrt(Math.pow(canvasWidth/2, 2) + Math.pow(canvasHeight/2, 2)),
      1
    );
    accuracy += positionAccuracy * 0.3; // 30% weight

    // 2. Size accuracy (appropriate size for the character)
    const expectedSize = Math.min(canvasWidth, canvasHeight) * 0.6;
    const actualSize = Math.max(width, height);
    const sizeAccuracy = 1 - Math.min(Math.abs(actualSize - expectedSize) / expectedSize, 1);
    accuracy += sizeAccuracy * 0.2; // 20% weight

    // 3. Stroke type accuracy
    const strokeAnalysis = analyzeStrokeAdvanced(drawnStroke);
    const typeAccuracy = strokeAnalysis === expectedStroke ? 1 : 0;
    accuracy += typeAccuracy * 0.3; // 30% weight

    // 4. Smoothness (pen pressure consistency)
    const pointDistances = [];
    for (let i = 1; i < drawnStroke.length; i++) {
      const dx = drawnStroke[i].x - drawnStroke[i-1].x;
      const dy = drawnStroke[i].y - drawnStroke[i-1].y;
      pointDistances.push(Math.sqrt(dx * dx + dy * dy));
    }
    const avgDistance = pointDistances.reduce((a, b) => a + b, 0) / pointDistances.length;
    const distanceVariance = pointDistances.reduce((a, b) => a + Math.pow(b - avgDistance, 2), 0) / pointDistances.length;
    const smoothnessAccuracy = 1 - Math.min(distanceVariance / avgDistance, 1);
    accuracy += smoothnessAccuracy * 0.2; // 20% weight

    return Math.round(accuracy * 100);
  }, []);

  // Update handleSubmit to not clear strokes immediately
  const handleSubmit = useCallback(() => {
    if (!state.currentWord) return;

    // For drawing mode, analyze the strokes
    if (inputMode === 'draw') {
      const strokeOrder = getStrokeOrder(state.currentWord);
      if (!strokeOrder) return;

      let totalAccuracy = 0;
      const strokeAccuracies: number[] = [];

      // Calculate accuracy for each stroke
      strokes.forEach((stroke, index) => {
        if (index < strokeOrder.length && stroke && stroke.length > 0) {
          const accuracy = calculateStrokeAccuracy(stroke, strokeOrder[index]);
          strokeAccuracies.push(accuracy);
          totalAccuracy += accuracy;
        }
      });

      const averageAccuracy = Math.round(totalAccuracy / Math.max(strokes.length, 1));
      const isCorrect = averageAccuracy >= 50; // Lowered threshold from 70% to 50%

      // Get the last stroke for feedback, ensuring it exists
      const lastStroke = strokes[strokes.length - 1] || [];
      const lastStrokeType = lastStroke.length > 0 ? analyzeStrokeAdvanced(lastStroke) : 'horizontal';

      // Build detailed per-stroke feedback
      const perStrokeFeedback = strokeAccuracies.map((acc, i) => {
        let msg = `Stroke ${i + 1}: ${acc}%`;
        if (acc < 50) msg += ' (needs improvement)';
        else if (acc < 70) msg += ' (almost there)';
        else msg += ' (good)';
        return msg;
      });

      // Update state with feedback but don't clear strokes
      setState(prev => ({
        ...prev,
        isCorrect,
        feedback: {
          isCorrect,
          message: isCorrect
            ? `Great job! Accuracy: ${averageAccuracy}%. ${strokeAccuracies.length < strokeOrder.length ? 'Complete all strokes for full credit.' : 'You can improve individual strokes for a higher score.'}`
            : `Try again! Accuracy: ${averageAccuracy}%. ${strokeAccuracies.length < strokeOrder.length ? 'Complete all strokes.' : 'Focus on stroke shape and position.'}`,
          expectedStroke: strokeOrder[strokes.length - 1] || 'horizontal',
          actualStroke: lastStrokeType,
          confidence: averageAccuracy,
          suggestions: [
            ...perStrokeFeedback,
            ...strokeAccuracies.map((acc, i) => acc < 50 ? `Stroke ${i + 1} is below 50%. Try to match the direction, length, and type more closely.` : null).filter(Boolean)
          ]
        }
      }));

      // Update progress
      if (isCorrect) {
        updateProgress(mode, {
          totalQuestions: 1,
          correctAnswers: 1,
          bestStreak: state.score + 1,
          highScore: state.score + 1,
          lastAttempt: new Date().toISOString()
        });
        updateWritingScore(mode, averageAccuracy);
      } else {
        updateProgress(mode, {
          totalQuestions: 1,
          correctAnswers: 0,
          lastAttempt: new Date().toISOString()
        });
      }

      // Play feedback sound
      if (settings.soundEnabled) {
        playDynamicAudio(isCorrect ? 'correct' : 'incorrect');
      }

      // Save practice session
      savePracticeSession({
        mode,
        character: state.currentWord.japanese,
        strokes: strokes.map(stroke => ({
          points: stroke,
          type: analyzeStrokeAdvanced(stroke)
        })),
        accuracy: averageAccuracy,
        strokeAccuracies,
        isCorrect,
        timestamp: new Date().toISOString()
      });

      return;
    }

    // For typing mode, validate text input
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

    // Update progress
    if (isCorrect && (!requireTranslation || isTranslationCorrect)) {
      updateProgress(mode, {
        totalQuestions: 1,
        correctAnswers: 1,
        bestStreak: state.score + 1,
        highScore: state.score + 1,
        lastAttempt: new Date().toISOString()
      });
    } else {
      updateProgress(mode, {
        totalQuestions: 1,
        correctAnswers: 0,
        lastAttempt: new Date().toISOString()
      });
    }

    // Play feedback sound
    if (settings.soundEnabled) {
      playDynamicAudio(isCorrect ? 'correct' : 'incorrect');
    }

    // Save practice session
    savePracticeSession({
      mode,
      character: state.currentWord.japanese,
      input: state.userInput,
      translation: state.translationInput,
      isCorrect,
      isTranslationCorrect,
      timestamp: new Date().toISOString()
    });

    // Check if practice is complete
    if (state.score + (isCorrect && (!requireTranslation || isTranslationCorrect) ? 1 : 0) >= 10) {
      if (onComplete) onComplete();
      else navigate('/');
    }
  }, [
    state.currentWord,
    state.userInput,
    state.translationInput,
    state.displayMode,
    state.score,
    inputMode,
    strokes,
    mode,
    requireTranslation,
    settings.soundEnabled,
    updateProgress,
    updateWritingScore,
    navigate,
    onComplete,
    getExpectedInput,
    validateInput,
    getStrokeOrder,
    calculateStrokeAccuracy,
    analyzeStrokeAdvanced,
    playDynamicAudio,
    savePracticeSession
  ]);

  // Update startNewPractice to clear strokes only when moving to next question
  const startNewPractice = useCallback(() => {
    const items = getFilteredWords();
    if (items.length === 0) {
      setState(prev => ({
        ...prev,
        currentWord: null,
        feedback: {
          isCorrect: false,
          message: 'No words available for the selected mode and difficulty',
          expectedStroke: 'horizontal',
          actualStroke: 'horizontal',
          confidence: 0
        }
      }));
      return;
    }

    // Select a random word from the filtered list
    const randomIndex = Math.floor(Math.random() * items.length);
    const selectedWord = items[randomIndex];

    // Reset practice state
    setState(prev => ({
      ...prev,
      currentWord: selectedWord,
      userInput: '',
      translationInput: '',
      isCorrect: null,
      feedback: null,
      currentStroke: 0,
      showAnimation: false
    }));

    // Clear canvas and reset strokes only when moving to next question
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        drawGrid(ctx);
        
        // Draw tracking guide if enabled
        if (showTracking && selectedWord) {
          ctx.globalAlpha = 0.2;
          ctx.font = '120px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = isDarkMode ? '#fff' : '#000';
          ctx.fillText(
            selectedWord.japanese,
            canvasRef.current.width / 2,
            canvasRef.current.height / 2
          );
          ctx.globalAlpha = 1.0;

          // Draw stroke order guide
          drawStrokeOrderGuide(ctx);
        }
      }
    }

    // Reset strokes state
    setStrokes([]);
    setCurrentStroke([]);
    setCurrentStrokeIndex(0);

    // Play audio if enabled
    if (settings.soundEnabled && selectedWord) {
      playAudio(selectedWord.japanese);
    }
  }, [
    getFilteredWords,
    showTracking,
    isDarkMode,
    drawGrid,
    drawStrokeOrderGuide,
    settings.soundEnabled,
    playAudio
  ]);

  // Add drawGrid function
  const drawGrid = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!showGrid || !canvasRef.current) return;
    
    const { width, height } = canvasRef.current;
    ctx.strokeStyle = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 0.5;

    // Draw vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw center lines
    ctx.strokeStyle = isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
  }, [showGrid, gridSize, isDarkMode]);

  // Add drawStrokeOrderGuide function
  const drawStrokeOrderGuide = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!canvasRef.current || !state.currentCharacter) return;

    const { width, height } = canvasRef.current;
    const centerX = width / 2;
    const centerY = height / 2;
    const size = Math.min(width, height) * 0.6;
    
    const strokeOrder = getStrokeOrder(state.currentWord);
    if (!strokeOrder) return;

    // Draw each stroke's guide
    strokeOrder.forEach((stroke, index) => {
      // Set stroke style based on whether it's the current stroke
      if (index === currentStrokeIndex) {
        ctx.strokeStyle = isDarkMode ? '#FF4081' : '#D81B60';
        ctx.lineWidth = 3;
      } else if (index < currentStrokeIndex) {
        ctx.strokeStyle = isDarkMode ? '#4CAF50' : '#2E7D32';
        ctx.lineWidth = 2;
      } else {
        ctx.strokeStyle = isDarkMode ? 'rgba(76, 175, 80, 0.3)' : 'rgba(46, 125, 50, 0.3)';
        ctx.lineWidth = 1;
      }

      // Draw the stroke guide
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

      // Draw stroke number
      if (index === currentStrokeIndex) {
        ctx.fillStyle = isDarkMode ? '#FF4081' : '#D81B60';
        ctx.font = '16px sans-serif';
        ctx.fillText((index + 1).toString(), centerX - size/2 + 10, centerY - size/2 + 20);
      }
    });
  }, [state.currentCharacter, state.currentWord, currentStrokeIndex, isDarkMode]);

  // Add clearCanvas function
  const clearCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      drawGrid(ctx);
      setStrokes([]);
      setCurrentStroke([]);
      
      // Draw tracking guide and stroke order
      if (showTracking && state.currentCharacter) {
        // Draw character outline
        ctx.globalAlpha = 0.2;
        ctx.font = '120px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = isDarkMode ? '#fff' : '#000';
        ctx.fillText(
          state.currentCharacter,
          canvasRef.current.width / 2,
          canvasRef.current.height / 2
        );
        ctx.globalAlpha = 1.0;

        // Draw stroke order guide
        drawStrokeOrderGuide(ctx);
      }
    }
  }, [showTracking, state.currentCharacter, isDarkMode, drawGrid, drawStrokeOrderGuide]);

  // Add renderModeSelector function
  const renderModeSelector = () => {
    return (
      <div className={`${isDarkMode ? 'bg-dark-lighter' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6 border ${isDarkMode ? 'border-dark-border' : 'border-gray-200'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-neon-blue' : 'text-gray-800'}`}>
          Practice Mode
        </h3>
        <div className="flex flex-wrap gap-4">
          {['hiragana', 'katakana', 'kanji'].map((writingMode) => (
            <button
              key={writingMode}
              onClick={() => setMode(writingMode as WritingMode)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                mode === writingMode
                  ? isDarkMode 
                    ? 'bg-neon-blue text-white shadow-[0_0_10px_rgba(0,149,255,0.4)]' 
                    : 'bg-blue-500 text-white'
                  : isDarkMode 
                    ? 'bg-dark-lighter text-text-primary hover:bg-dark-border' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {writingMode.charAt(0).toUpperCase() + writingMode.slice(1)}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Add renderDifficultySelector function
  const renderDifficultySelector = () => {
    return (
      <div className={`${isDarkMode ? 'bg-dark-lighter' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6 border ${isDarkMode ? 'border-dark-border' : 'border-gray-200'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-neon-blue' : 'text-gray-800'}`}>
          Difficulty
        </h3>
        <div className="flex flex-wrap gap-4">
          {['easy', 'medium', 'hard'].map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficulty(diff as Difficulty)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                difficulty === diff
                  ? isDarkMode 
                    ? 'bg-neon-blue text-white shadow-[0_0_10px_rgba(0,149,255,0.4)]' 
                    : 'bg-blue-500 text-white'
                  : isDarkMode 
                    ? 'bg-dark-lighter text-text-primary hover:bg-dark-border' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {diff.charAt(0).toUpperCase() + diff.slice(1)}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Add undoStroke function
  const undoStroke = useCallback(() => {
    if (strokes.length === 0) return;

    // Remove the last stroke from the strokes array
    const newStrokes = strokes.slice(0, -1);
    setStrokes(newStrokes);

    // Redraw the canvas with remaining strokes
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        // Clear the canvas
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        
        // Redraw the grid
        drawGrid(ctx);

        // Redraw all remaining strokes
        ctx.strokeStyle = isDarkMode ? '#fff' : '#000';
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        newStrokes.forEach(stroke => {
          if (stroke.length > 0) {
            ctx.beginPath();
            ctx.moveTo(stroke[0].x, stroke[0].y);
            stroke.forEach(point => {
              ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();
          }
        });

        // Redraw tracking guide if enabled
        if (showTracking && state.currentCharacter) {
          ctx.globalAlpha = 0.2;
          ctx.font = '120px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = isDarkMode ? '#fff' : '#000';
          ctx.fillText(
            state.currentCharacter,
            canvasRef.current.width / 2,
            canvasRef.current.height / 2
          );
          ctx.globalAlpha = 1.0;

          // Redraw stroke order guide
          drawStrokeOrderGuide(ctx);
        }
      }
    }

    // Update current stroke index
    setCurrentStrokeIndex(prev => Math.max(0, prev - 1));
  }, [strokes, isDarkMode, strokeWidth, showTracking, state.currentCharacter, drawGrid, drawStrokeOrderGuide]);

  // Add getCharacterDetails function
  const getCharacterDetails = useCallback((character: string) => {
    if (!character) return null;

    switch (mode) {
      case 'kanji':
        const kanjiDetails = kanjiList.find(k => k.character === character);
        if (kanjiDetails) {
          return {
            readings: [...kanjiDetails.onyomi, ...kanjiDetails.kunyomi],
            meaning: kanjiDetails.english,
            strokeCount: kanjiDetails.strokes,
            radicals: kanjiDetails.radicals || []
          };
        }
        break;

      case 'hiragana':
        const hiraganaDetails = hiraganaList.find(k => k.character === character);
        if (hiraganaDetails) {
          return {
            readings: [hiraganaDetails.romaji],
            meaning: hiraganaDetails.english || '',
            strokeCount: hiraganaDetails.strokes || 0,
            radicals: []
          };
        }
        break;

      case 'katakana':
        const katakanaDetails = katakanaList.find(k => k.character === character);
        if (katakanaDetails) {
          return {
            readings: [katakanaDetails.romaji],
            meaning: katakanaDetails.english || '',
            strokeCount: katakanaDetails.strokes || 0,
            radicals: []
          };
        }
        break;
    }

    return null;
  }, [mode]);

  return (
    <div className={`container mx-auto px-4 py-8 ${isDarkMode ? 'bg-dark' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto">
        {renderModeSelector()}
        {renderDifficultySelector()}
        {state.characterList.length > 0 ? (
          <div className={`${isDarkMode ? 'bg-dark-lighter' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6 border ${isDarkMode ? 'border-dark-border' : 'border-gray-200'}`}>
            <div className="flex flex-col items-center mb-6">
              <h2 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-neon-blue' : 'text-gray-800'}`}>
                {state.currentCharacter}
              </h2>
              {getCharacterDetails(state.currentCharacter) && (
                <div className={`text-center ${isDarkMode ? 'text-text-primary' : 'text-gray-600'}`}>
                  {showRomaji && (
                    <p className="text-xl mb-2">
                      {getCharacterDetails(state.currentCharacter)?.readings.join('・')}
                    </p>
                  )}
                  {showMeaning && (
                    <p className="text-lg">
                      {getCharacterDetails(state.currentCharacter)?.meaning}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Tracking Options */}
            <div className="flex flex-wrap gap-4 mb-6 justify-center">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showTracking}
                  onChange={(e) => setShowTracking(e.target.checked)}
                  className={`form-checkbox h-5 w-5 ${
                    isDarkMode ? 'text-neon-blue border-dark-border' : 'text-blue-500 border-gray-300'
                  }`}
                />
                <span className={isDarkMode ? 'text-text-primary' : 'text-gray-700'}>
                  Show Tracking
                </span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showRomaji}
                  onChange={(e) => setShowRomaji(e.target.checked)}
                  className={`form-checkbox h-5 w-5 ${
                    isDarkMode ? 'text-neon-blue border-dark-border' : 'text-blue-500 border-gray-300'
                  }`}
                />
                <span className={isDarkMode ? 'text-text-primary' : 'text-gray-700'}>
                  Show Romaji
                </span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showMeaning}
                  onChange={(e) => setShowMeaning(e.target.checked)}
                  className={`form-checkbox h-5 w-5 ${
                    isDarkMode ? 'text-neon-blue border-dark-border' : 'text-blue-500 border-gray-300'
                  }`}
                />
                <span className={isDarkMode ? 'text-text-primary' : 'text-gray-700'}>
                  Show Meaning
                </span>
              </label>
            </div>

            {/* Writing Canvas */}
            <div className="mb-6">
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  className={`w-full h-64 border-2 rounded-lg ${
                    isDarkMode 
                      ? 'border-neon-blue/30 bg-black/50' 
                      : 'border-gray-300 bg-white'
                  } touch-none`}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseLeave}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  width={800}
                  height={400}
                />
                {showTracking && state.currentCharacter && (
                  <div 
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{ opacity: 0.2 }}
                  >
                    <span className="text-8xl text-gray-400">
                      {state.currentCharacter}
                    </span>
                  </div>
                )}
              </div>

              {/* Canvas Controls */}
              <div className="flex flex-wrap gap-4 mt-4 justify-center">
                <div className="flex items-center space-x-2">
                  <label className={isDarkMode ? 'text-text-primary' : 'text-gray-700'}>
                    Grid:
                  </label>
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={(e) => setShowGrid(e.target.checked)}
                    className={`form-checkbox h-5 w-5 ${
                      isDarkMode ? 'text-neon-blue border-dark-border' : 'text-blue-500 border-gray-300'
                    }`}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <label className={isDarkMode ? 'text-text-primary' : 'text-gray-700'}>
                    Stroke Width:
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={strokeWidth}
                    onChange={(e) => setStrokeWidth(Number(e.target.value))}
                    className="w-24"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <label className={isDarkMode ? 'text-text-primary' : 'text-gray-700'}>
                    Grid Size:
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="80"
                    step="10"
                    value={gridSize}
                    onChange={(e) => setGridSize(Number(e.target.value))}
                    className="w-24"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between mt-4">
                <button
                  onClick={clearCanvas}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-neon-blue/10 text-neon-blue hover:bg-neon-blue/20' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Clear
                </button>
                <button
                  onClick={undoStroke}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-neon-pink/10 text-neon-pink hover:bg-neon-pink/20' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Undo Stroke
                </button>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <button
                onClick={() => {
                  setState(prev => ({
                    ...prev,
                    currentIndex: Math.max(0, prev.currentIndex - 1)
                  }));
                  clearCanvas();
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-neon-blue/10 text-neon-blue hover:bg-neon-blue/20' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                disabled={state.currentIndex === 0}
              >
                Previous
              </button>
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
                onClick={() => {
                  setState(prev => ({
                    ...prev,
                    currentIndex: Math.min(prev.characterList.length - 1, prev.currentIndex + 1)
                  }));
                  clearCanvas();
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-neon-blue/10 text-neon-blue hover:bg-neon-blue/20' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                disabled={state.currentIndex === state.characterList.length - 1}
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
                  {state.isCorrect ? 'Correct!' : 'Try Again!'}
                </div>
                {state.feedback && (
                  <div className={`${isDarkMode ? 'text-text-primary' : 'text-gray-800'}`}>
                    <p className="mb-2">{state.feedback.message}</p>
                    {state.feedback.suggestions && state.feedback.suggestions.length > 0 && (
                      <ul className="list-disc list-inside mt-2">
                        {state.feedback.suggestions.map((suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className={`${isDarkMode ? 'bg-dark-lighter' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6 border ${isDarkMode ? 'border-dark-border' : 'border-gray-200'}`}>
            <div className="text-center">
              <p className={`text-lg ${isDarkMode ? 'text-text-primary' : 'text-gray-700'}`}>
                No characters available for the selected mode and filters.
              </p>
              <button
                onClick={() => {
                  setState(prev => ({
                    ...prev,
                    selectedCategory: 'all',
                    selectedDifficulty: 'all',
                    searchTerm: ''
                  }));
                }}
                className={`mt-4 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-neon-blue text-white hover:bg-neon-blue/90' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WritingPractice;