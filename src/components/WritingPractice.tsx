import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { useSound } from '../context/SoundContext';
import { useProgress } from '../context/ProgressContext';
import { useTheme } from '../context/ThemeContext';
import { QuizWord, quizWords } from '../data/quizData';
import { Kanji, kanjiList } from '../data/kanjiData';
import { playAudio, playDynamicAudio } from '../utils/audio';

type WritingMode = 'hiragana' | 'katakana';
type Difficulty = 'easy' | 'medium' | 'hard';
type PracticeType = 'copy' | 'convert' | 'translate';
type InputMode = 'draw' | 'type';
type StrokeType = 'horizontal' | 'vertical' | 'diagonal' | 'curve';

interface StrokeFeedback {
  isCorrect: boolean;
  message: string;
  expectedStroke: StrokeType;
  actualStroke: StrokeType;
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

interface PracticeState {
  currentWord: PracticeItem | null;
  userInput: string;
  translationInput: string;
  isCorrect: boolean | null;
  isTranslationCorrect: boolean | null;
  score: number;
  totalAttempts: number;
  timeRemaining: number;
  isDrawing: boolean;
  lastX: number;
  lastY: number;
  currentStroke: number;
  strokeFeedback: StrokeFeedback | null;
  showStrokeGuide: boolean;
  showAnimation: boolean;
  strokePoints?: { x: number; y: number }[];
  displayMode: 'japanese' | 'romaji' | 'english';
  inputMode: InputMode;
}

const WritingPractice: React.FC<WritingPracticeProps> = ({ mode: initialMode, onComplete }) => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { playSound } = useSound();
  const { updateProgress, setTotalItems } = useProgress();
  const { isDarkMode } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<WritingMode>(initialMode);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [practiceType, setPracticeType] = useState<PracticeType>('copy');
  const [requireTranslation, setRequireTranslation] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>('type');
  const [state, setState] = useState<PracticeState>({
    currentWord: null,
    userInput: '',
    translationInput: '',
    isCorrect: null,
    isTranslationCorrect: null,
    score: 0,
    totalAttempts: 0,
    timeRemaining: settings.timeLimit,
    isDrawing: false,
    lastX: 0,
    lastY: 0,
    currentStroke: 0,
    strokeFeedback: null,
    showStrokeGuide: true,
    showAnimation: false,
    displayMode: 'japanese',
    inputMode: 'type'
  });

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

  const getFilteredWords = (): PracticeItem[] => {
    const items: PracticeItem[] = [];
    
    // Add practice content based on mode and difficulty
    if (practiceType === 'copy') {
      const content = practiceContent[mode][difficulty];
      items.push(...content);
    } else {
      // For convert and translate practice, use quiz words
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

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setState(prev => ({
      ...prev,
      isDrawing: true,
      lastX: x,
      lastY: y,
      strokePoints: [{ x, y }]
    }));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!state.isDrawing || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(state.lastX, state.lastY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();

    setState(prev => ({
      ...prev,
      lastX: x,
      lastY: y,
      strokePoints: [...(prev.strokePoints || []), { x, y }]
    }));
  };

  const handleMouseUp = () => {
    if (!state.isDrawing || !state.strokePoints || !canvasRef.current) return;
    
    const feedback = analyzeStroke(state.strokePoints, state.currentWord);
    if (feedback) {
      setState((prev: PracticeState) => ({
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
  };

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

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6 flex flex-wrap gap-4 justify-center">
        <select
          value={mode}
          onChange={(e) => {
            setMode(e.target.value as WritingMode);
            startNewPractice();
          }}
          className={`px-4 py-2 rounded-lg ${
            isDarkMode 
              ? 'bg-gray-700 text-white border-gray-600' 
              : 'bg-white text-gray-800 border-gray-300'
          } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
        >
          <option value="hiragana">Hiragana</option>
          <option value="katakana">Katakana</option>
        </select>

        <select
          value={difficulty}
          onChange={(e) => {
            setDifficulty(e.target.value as Difficulty);
            startNewPractice();
          }}
          className={`px-4 py-2 rounded-lg ${
            isDarkMode 
              ? 'bg-gray-700 text-white border-gray-600' 
              : 'bg-white text-gray-800 border-gray-300'
          } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
        >
          <option value="easy">Easy (Basic Characters)</option>
          <option value="medium">Medium (Common Words)</option>
          <option value="hard">Hard (Sentences)</option>
        </select>

        <select
          value={practiceType}
          onChange={(e) => setPracticeType(e.target.value as PracticeType)}
          className={`px-4 py-2 rounded-lg ${
            isDarkMode 
              ? 'bg-gray-700 text-white border-gray-600' 
              : 'bg-white text-gray-800 border-gray-300'
          } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
        >
          <option value="copy">Copy Writing</option>
          <option value="convert">Convert (Japanese ↔ Romaji)</option>
          <option value="translate">Translate (Japanese ↔ English)</option>
        </select>

        <select
          value={inputMode}
          onChange={(e) => setInputMode(e.target.value as InputMode)}
          className={`px-4 py-2 rounded-lg ${
            isDarkMode 
              ? 'bg-gray-700 text-white border-gray-600' 
              : 'bg-white text-gray-800 border-gray-300'
          } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
        >
          <option value="type">Type Answer</option>
          <option value="draw">Draw Characters</option>
        </select>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={requireTranslation}
            onChange={(e) => setRequireTranslation(e.target.checked)}
            className="form-checkbox h-5 w-5 text-blue-600"
          />
          <span className={isDarkMode ? 'text-white' : 'text-gray-800'}>
            Require Translation
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={state.showStrokeGuide}
            onChange={(e) => setState(prev => ({ ...prev, showStrokeGuide: e.target.checked }))}
            className="form-checkbox h-5 w-5 text-blue-600"
          />
          <span className={isDarkMode ? 'text-white' : 'text-gray-800'}>
            Show Stroke Guide
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={state.showAnimation}
            onChange={(e) => setState(prev => ({ ...prev, showAnimation: e.target.checked }))}
            className="form-checkbox h-5 w-5 text-blue-600"
          />
          <span className={isDarkMode ? 'text-white' : 'text-gray-800'}>
            Show Animation
          </span>
        </label>
      </div>

      <div className="text-center mb-8">
        {state.currentWord && (
          <>
            <div className="text-4xl font-bold mb-4">
              {getDisplayText(state.currentWord, state.displayMode)}
            </div>
            {inputMode === 'draw' && state.showStrokeGuide && getStrokeOrder(state.currentWord) && (
              <div className="text-sm text-gray-500 mb-2">
                Follow the stroke order guide
              </div>
            )}
            {inputMode === 'draw' && state.strokeFeedback && (
              <div className={`text-sm ${state.strokeFeedback.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                {state.strokeFeedback.message}
              </div>
            )}
            <button
              onClick={() => handlePlayAudio(state.currentWord && 'japanese' in state.currentWord ? state.currentWord.japanese : '')}
              className="ml-2 p-2 rounded-full hover:bg-opacity-10"
              title="Play Audio"
            >
              🔊
            </button>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {inputMode === 'type' ? (
            <div className={`p-4 rounded-lg ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } shadow-md`}>
              <h2 className={`text-xl font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                {state.currentWord && getDisplayText(state.currentWord, state.displayMode)}
              </h2>
              <div className="space-y-4">
                <input
                  type="text"
                  value={state.userInput}
                  onChange={(e) => setState(prev => ({ ...prev, userInput: e.target.value }))}
                  placeholder={
                    practiceType === 'copy'
                      ? "Enter the text above..." 
                      : practiceType === 'convert'
                        ? state.displayMode === 'romaji' 
                          ? "Enter the Japanese text or romaji..."
                          : "Enter the romaji..."
                        : "Enter the Japanese translation..."
                  }
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 text-white border-gray-600' 
                      : 'bg-white text-gray-800 border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                
                {(practiceType === 'convert' || practiceType === 'translate') && (
                  <input
                    type="text"
                    value={state.translationInput}
                    onChange={(e) => setState(prev => ({ ...prev, translationInput: e.target.value }))}
                    placeholder="Enter the English translation..."
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 text-white border-gray-600' 
                        : 'bg-white text-gray-800 border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={300}
                height={300}
                className={`border-2 rounded-lg ${
                  isDarkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white'
                }`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
              <button
                onClick={clearCanvas}
                className={`absolute top-2 right-2 px-2 py-1 rounded ${
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'
                }`}
              >
                Clear
              </button>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Submit
            </button>
            <button
              onClick={handleNext}
              className={`px-4 py-2 rounded-lg ${
                isDarkMode 
                  ? 'bg-gray-700 text-white hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Next
            </button>
          </div>
        </div>

        <div className={`p-4 rounded-lg ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        } shadow-md`}>
          <div className="space-y-4">
            <div>
              <h3 className={`text-lg font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                Progress
              </h3>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                Score: {state.score} / 10
              </p>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                Attempts: {state.totalAttempts}
              </p>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                Current Stroke: {state.currentStroke}
              </p>
            </div>

            {settings.useTimer && (
              <div>
                <h3 className={`text-lg font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  Time Remaining
                </h3>
                <p className={`text-2xl font-bold ${
                  state.timeRemaining <= 10 
                    ? 'text-red-500' 
                    : isDarkMode 
                      ? 'text-white' 
                      : 'text-gray-800'
                }`}>
                  {state.timeRemaining}s
                </p>
              </div>
            )}

            {state.isCorrect !== null && (
              <div className={`p-4 rounded-lg ${
                state.isCorrect 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                <p className="font-semibold">
                  {state.isCorrect ? 'Correct!' : 'Incorrect. Try again!'}
                </p>
                {!state.isCorrect && state.currentWord && (
                  <p className="mt-2">
                    Correct answer: {state.currentWord && 'japanese' in state.currentWord
                      ? state.currentWord.japanese
                      : ''}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WritingPractice;
