import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Grid,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  Undo as UndoIcon,
  Delete as DeleteIcon,
  VolumeUp as VolumeIcon,
  Check as CheckIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
} from '@mui/icons-material';
import { useAudio } from '../../context/AudioContext';
import { useProgress } from '../../context/ProgressContext';
import { kanaData } from './KanaChart';

interface KanaPracticeProps {
  type: 'hiragana' | 'katakana';
  initialKana?: string;
}

interface Stroke {
  points: { x: number; y: number }[];
  color: string;
}

interface KanaStrokeData {
  kana: string;
  romaji: string;
  referencePoints: { x: number; y: number }[];
  keyFeatures: {
    center: { x: number; y: number };
    width: number;
    height: number;
    topPoints: { x: number; y: number }[];
    bottomPoints: { x: number; y: number }[];
    leftPoints: { x: number; y: number }[];
    rightPoints: { x: number; y: number }[];
  };
  gridSize: number;
  category: string;
}

// Define kana categories with complete character lists
const getKanaCategories = (type: 'hiragana' | 'katakana') => ({
  gojuon: {
    title: 'Gojuon (Basic)',
    description: 'Basic kana characters',
    kana: type === 'hiragana' ? [
      // Vowels
      'あ', 'い', 'う', 'え', 'お',
      // K series
      'か', 'き', 'く', 'け', 'こ',
      // S series
      'さ', 'し', 'す', 'せ', 'そ',
      // T series
      'た', 'ち', 'つ', 'て', 'と',
      // N series
      'な', 'に', 'ぬ', 'ね', 'の',
      // H series
      'は', 'ひ', 'ふ', 'へ', 'ほ',
      // M series
      'ま', 'み', 'む', 'め', 'も',
      // Y series
      'や', 'ゆ', 'よ',
      // R series
      'ら', 'り', 'る', 'れ', 'ろ',
      // W series
      'わ', 'を',
      // N
      'ん'
    ] : [
      // Vowels
      'ア', 'イ', 'ウ', 'エ', 'オ',
      // K series
      'カ', 'キ', 'ク', 'ケ', 'コ',
      // S series
      'サ', 'シ', 'ス', 'セ', 'ソ',
      // T series
      'タ', 'チ', 'ツ', 'テ', 'ト',
      // N series
      'ナ', 'ニ', 'ヌ', 'ネ', 'ノ',
      // H series
      'ハ', 'ヒ', 'フ', 'ヘ', 'ホ',
      // M series
      'マ', 'ミ', 'ム', 'メ', 'モ',
      // Y series
      'ヤ', 'ユ', 'ヨ',
      // R series
      'ラ', 'リ', 'ル', 'レ', 'ロ',
      // W series
      'ワ', 'ヲ',
      // N
      'ン'
    ]
  },
  dakuon: {
    title: 'Dakuon (Voiced)',
    description: 'Voiced kana characters',
    kana: type === 'hiragana' ? [
      // G series
      'が', 'ぎ', 'ぐ', 'げ', 'ご',
      // Z series
      'ざ', 'じ', 'ず', 'ぜ', 'ぞ',
      // D series
      'だ', 'ぢ', 'づ', 'で', 'ど',
      // B series
      'ば', 'び', 'ぶ', 'べ', 'ぼ'
    ] : [
      // G series
      'ガ', 'ギ', 'グ', 'ゲ', 'ゴ',
      // Z series
      'ザ', 'ジ', 'ズ', 'ゼ', 'ゾ',
      // D series
      'ダ', 'ヂ', 'ヅ', 'デ', 'ド',
      // B series
      'バ', 'ビ', 'ブ', 'ベ', 'ボ'
    ]
  },
  handakuon: {
    title: 'Handakuon (Semi-voiced)',
    description: 'Semi-voiced kana characters',
    kana: type === 'hiragana' ? [
      // P series
      'ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ'
    ] : [
      // P series
      'パ', 'ピ', 'プ', 'ペ', 'ポ'
    ]
  },
  yoon: {
    title: 'Yoon (Contracted)',
    description: 'Contracted kana characters',
    kana: type === 'hiragana' ? [
      // K series
      'きゃ', 'きゅ', 'きょ',
      // S series
      'しゃ', 'しゅ', 'しょ',
      // T series
      'ちゃ', 'ちゅ', 'ちょ',
      // N series
      'にゃ', 'にゅ', 'にょ',
      // H series
      'ひゃ', 'ひゅ', 'ひょ',
      // M series
      'みゃ', 'みゅ', 'みょ',
      // R series
      'りゃ', 'りゅ', 'りょ',
      // G series
      'ぎゃ', 'ぎゅ', 'ぎょ',
      // J series
      'じゃ', 'じゅ', 'じょ',
      // B series
      'びゃ', 'びゅ', 'びょ',
      // P series
      'ぴゃ', 'ぴゅ', 'ぴょ'
    ] : [
      // K series
      'キャ', 'キュ', 'キョ',
      // S series
      'シャ', 'シュ', 'ショ',
      // T series
      'チャ', 'チュ', 'チョ',
      // N series
      'ニャ', 'ニュ', 'ニョ',
      // H series
      'ヒャ', 'ヒュ', 'ヒョ',
      // M series
      'ミャ', 'ミュ', 'ミョ',
      // R series
      'リャ', 'リュ', 'リョ',
      // G series
      'ギャ', 'ギュ', 'ギョ',
      // J series
      'ジャ', 'ジュ', 'ジョ',
      // B series
      'ビャ', 'ビュ', 'ビョ',
      // P series
      'ピャ', 'ピュ', 'ピョ'
    ]
  }
});

// Define reference data for kana characters with improved feature detection
const kanaStrokeData: Record<string, KanaStrokeData> = {};

// Helper function to generate placeholder data for remaining kana
const generatePlaceholderKanaData = (kana: string, romaji: string, category: string): KanaStrokeData => {
  // Define basic stroke patterns for different kana types
  const getReferencePoints = (kana: string, category: string) => {
    // Basic patterns for different categories
    const patterns: Record<string, { x: number; y: number }[]> = {
      // Vowels (あ, い, う, え, お)
      'あ': [
        { x: 30, y: 30 }, { x: 50, y: 30 }, // Top horizontal
        { x: 40, y: 30 }, { x: 40, y: 70 }, // Vertical
        { x: 30, y: 70 }, { x: 50, y: 70 }  // Bottom horizontal
      ],
      'い': [
        { x: 30, y: 30 }, { x: 30, y: 70 }, // Left vertical
        { x: 50, y: 30 }, { x: 50, y: 70 }  // Right vertical
      ],
      'う': [
        { x: 30, y: 30 }, { x: 50, y: 30 }, // Top horizontal
        { x: 40, y: 30 }, { x: 40, y: 70 }  // Vertical
      ],
      'え': [
        { x: 30, y: 30 }, { x: 50, y: 30 }, // Top horizontal
        { x: 40, y: 30 }, { x: 40, y: 70 }, // Vertical
        { x: 30, y: 70 }, { x: 50, y: 70 }  // Bottom horizontal
      ],
      'お': [
        { x: 30, y: 30 }, { x: 50, y: 30 }, // Top horizontal
        { x: 40, y: 30 }, { x: 40, y: 70 }, // Vertical
        { x: 30, y: 70 }, { x: 50, y: 70 }  // Bottom horizontal
      ],
      // K series (か, き, く, け, こ)
      'か': [
        { x: 30, y: 30 }, { x: 50, y: 30 }, // Top horizontal
        { x: 40, y: 30 }, { x: 40, y: 70 }, // Vertical
        { x: 30, y: 50 }, { x: 50, y: 50 }  // Middle horizontal
      ],
      'き': [
        { x: 30, y: 30 }, { x: 50, y: 30 }, // Top horizontal
        { x: 40, y: 30 }, { x: 40, y: 70 }, // Vertical
        { x: 30, y: 50 }, { x: 50, y: 50 }  // Middle horizontal
      ],
      'く': [
        { x: 30, y: 30 }, { x: 50, y: 50 }, // Diagonal
        { x: 30, y: 50 }, { x: 50, y: 70 }  // Diagonal
      ],
      'け': [
        { x: 30, y: 30 }, { x: 50, y: 30 }, // Top horizontal
        { x: 40, y: 30 }, { x: 40, y: 70 }, // Vertical
        { x: 30, y: 50 }, { x: 50, y: 50 }  // Middle horizontal
      ],
      'こ': [
        { x: 30, y: 30 }, { x: 50, y: 30 }, // Top horizontal
        { x: 30, y: 50 }, { x: 50, y: 50 }  // Bottom horizontal
      ],
      // Default pattern for other characters
      'default': [
        { x: 30, y: 30 }, { x: 50, y: 30 }, // Top horizontal
        { x: 40, y: 30 }, { x: 40, y: 70 }, // Vertical
        { x: 30, y: 70 }, { x: 50, y: 70 }  // Bottom horizontal
      ]
    };

    // Return specific pattern if available, otherwise use default
    return patterns[kana] || patterns['default'];
  };

  const referencePoints = getReferencePoints(kana, category);
  
  // Calculate key features based on reference points
  const minX = Math.min(...referencePoints.map(p => p.x));
  const maxX = Math.max(...referencePoints.map(p => p.x));
  const minY = Math.min(...referencePoints.map(p => p.y));
  const maxY = Math.max(...referencePoints.map(p => p.y));
  
  const center = {
    x: (minX + maxX) / 2,
    y: (minY + maxY) / 2
  };

  const width = maxX - minX;
  const height = maxY - minY;

  // Group points by their relative position
  const topPoints = referencePoints.filter(p => p.y <= minY + height * 0.3);
  const bottomPoints = referencePoints.filter(p => p.y >= minY + height * 0.7);
  const leftPoints = referencePoints.filter(p => p.x <= minX + width * 0.3);
  const rightPoints = referencePoints.filter(p => p.x >= minX + width * 0.7);

  return {
    kana,
    romaji,
    referencePoints,
    keyFeatures: {
      center,
      width,
      height,
      topPoints,
      bottomPoints,
      leftPoints,
      rightPoints
    },
    gridSize: 100,
    category
  };
};

const KanaPractice: React.FC<KanaPracticeProps> = ({ type, initialKana }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { playAudio } = useAudio();
  const progressContext = useProgress();
  const { updateWordProgress } = progressContext || {};
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentKana, setCurrentKana] = useState(initialKana || 'あ');
  const [currentRomaji, setCurrentRomaji] = useState('a');
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    isCorrect: boolean;
    message: string;
    accuracy: number;
  } | null>(null);
  const [practiceMode, setPracticeMode] = useState<'practice' | 'free'>('practice');
  const [selectedCategory, setSelectedCategory] = useState<string>('gojuon');
  const [availableKana, setAvailableKana] = useState<string[]>([]);

  // Initialize kanaStrokeData when type changes
  useEffect(() => {
    const kanaCategories = getKanaCategories(type);
    // Add placeholder data for all remaining kana
    Object.entries(kanaCategories).forEach(([category, data]) => {
      data.kana.forEach(kana => {
        if (!kanaStrokeData[kana]) {
          // Find romaji from the kana data in other components
          const findRomaji = (category: 'gojuon' | 'dakuon' | 'handakuon' | 'yoon') => {
            const foundRow = kanaData[type][category].find(r => r.kana.includes(kana));
            if (foundRow) {
              const index = foundRow.kana.indexOf(kana);
              return foundRow.romaji[index];
            }
            return '';
          };

          const romaji = findRomaji('gojuon') || 
                        findRomaji('dakuon') || 
                        findRomaji('handakuon') || 
                        findRomaji('yoon') || 
                        '';
          
          kanaStrokeData[kana] = generatePlaceholderKanaData(kana, romaji, category);
        }
      });
    });

    // Update available kana for the current category
    const category = kanaCategories[selectedCategory as keyof typeof kanaCategories];
    if (category) {
      setAvailableKana(category.kana.filter(kana => kanaStrokeData[kana]));
    }
  }, [type, selectedCategory]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Set canvas style
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3;

    // Draw grid
    drawGrid(ctx, canvas.width, canvas.height);
  }, []);

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = theme.palette.divider;
    ctx.lineWidth = 0.5;

    // Draw vertical lines
    for (let x = 0; x <= width; x += width / 8) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y <= height; y += height / 8) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    const newStroke: Stroke = {
      points: [{ x, y }],
      color: theme.palette.primary.main
    };
    setCurrentStroke(newStroke);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStroke) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    currentStroke.points.push({ x, y });

    // Redraw everything
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx, canvas.width, canvas.height);

    // Draw completed strokes
    strokes.forEach(stroke => {
      drawStroke(ctx, stroke);
    });

    // Draw current stroke
    drawStroke(ctx, currentStroke);
  };

  const drawStroke = (ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    if (stroke.points.length < 2) return;

    ctx.beginPath();
    ctx.strokeStyle = stroke.color;
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    
    ctx.stroke();
  };

  const verifyDrawing = (drawnStrokes: Stroke[]) => {
    const referenceData = kanaStrokeData[currentKana];
    if (!referenceData) {
      console.log('No referenceData for', currentKana);
      return;
    }

    // Combine all drawn points into a single array
    const allDrawnPoints = drawnStrokes.flatMap(stroke => stroke.points);

    // Require a minimum number of points
    if (allDrawnPoints.length < 10) {
      setVerificationResult({
        isCorrect: false,
        message: 'Please draw the full character.',
        accuracy: 0
      });
      return;
    }
    
    // Calculate similarity between drawn shape and reference shape
    const accuracy = calculateShapeAccuracy(allDrawnPoints, referenceData);
    const isCorrect = accuracy > 0.92; // Stricter threshold

    const result = {
      isCorrect,
      message: isCorrect 
        ? 'Good job! The character looks correct!' 
        : 'Try again, focus on the overall shape and proportions',
      accuracy
    };
    console.log('setVerificationResult called with:', result);
    setVerificationResult(result);

    if (isCorrect) {
      // Update progress when the character is drawn correctly
      if (updateWordProgress) {
        updateWordProgress(currentKana, {
          masteryLevel: 1,
          lastReviewed: Date.now(),
          reviewCount: 1,
          nextReviewDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
          category: type,
          section: 'writing',
          difficulty: 'beginner',
          consecutiveCorrect: 1,
          lastAnswerCorrect: true
        });
      }
    }
  };

  const calculateShapeAccuracy = (drawnPoints: { x: number; y: number }[], referenceData: KanaStrokeData): number => {
    // Normalize points to a common scale
    const normalizePoints = (points: { x: number; y: number }[]) => {
      const minX = Math.min(...points.map(p => p.x));
      const maxX = Math.max(...points.map(p => p.x));
      const minY = Math.min(...points.map(p => p.y));
      const maxY = Math.max(...points.map(p => p.y));
      const scale = Math.max(maxX - minX, maxY - minY);
      
      return {
        points: points.map(p => ({
          x: (p.x - minX) / scale,
          y: (p.y - minY) / scale
        })),
        bounds: {
          minX, maxX, minY, maxY,
          width: maxX - minX,
          height: maxY - minY
        }
      };
    };

    const normalizedDrawn = normalizePoints(drawnPoints);
    const normalizedReference = normalizePoints(referenceData.referencePoints);

    // Calculate center points
    const drawnCenter = {
      x: (normalizedDrawn.bounds.minX + normalizedDrawn.bounds.maxX) / 2,
      y: (normalizedDrawn.bounds.minY + normalizedDrawn.bounds.maxY) / 2
    };

    // Calculate aspect ratio similarity
    const drawnAspectRatio = normalizedDrawn.bounds.width / normalizedDrawn.bounds.height;
    const referenceAspectRatio = normalizedReference.bounds.width / normalizedReference.bounds.height;
    const aspectRatioScore = 1 - Math.min(1, Math.abs(drawnAspectRatio - referenceAspectRatio));

    // Calculate point distribution similarity
    const calculatePointDistribution = (points: { x: number; y: number }[], bounds: any) => {
      const gridSize = 5;
      const grid: number[][] = Array(gridSize).fill(0).map(() => Array(gridSize).fill(0));
      const width = bounds.width || 1;   // Prevent division by zero
      const height = bounds.height || 1; // Prevent division by zero

      points.forEach(point => {
        let gridX = Math.floor((point.x - bounds.minX) / width * (gridSize - 1));
        let gridY = Math.floor((point.y - bounds.minY) / height * (gridSize - 1));
        // Clamp to valid range
        gridX = Math.max(0, Math.min(gridSize - 1, gridX));
        gridY = Math.max(0, Math.min(gridSize - 1, gridY));
        grid[gridY][gridX]++;
      });

      return grid;
    };

    const drawnGrid = calculatePointDistribution(normalizedDrawn.points, normalizedDrawn.bounds);
    const referenceGrid = calculatePointDistribution(normalizedReference.points, normalizedReference.bounds);

    // Calculate grid similarity
    let gridScore = 0;
    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 5; x++) {
        const diff = Math.abs(drawnGrid[y][x] - referenceGrid[y][x]);
        gridScore += 1 - (diff / Math.max(drawnGrid[y][x], referenceGrid[y][x], 1));
      }
    }
    gridScore /= 25; // Normalize to 0-1

    // Calculate Hausdorff distance for overall shape
    const calculateDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      return Math.sqrt(dx * dx + dy * dy);
    };

    let maxDistance = 0;
    for (const drawnPoint of normalizedDrawn.points) {
      let minDistance = Infinity;
      for (const refPoint of normalizedReference.points) {
        const distance = calculateDistance(drawnPoint, refPoint);
        minDistance = Math.min(minDistance, distance);
      }
      maxDistance = Math.max(maxDistance, minDistance);
    }

    // Convert distance to similarity score (0 to 1)
    const shapeScore = Math.max(0, 1 - maxDistance * 2);

    // Combine scores with weights
    const finalScore = (
      shapeScore * 0.4 +      // Overall shape similarity
      aspectRatioScore * 0.3 + // Aspect ratio similarity
      gridScore * 0.3         // Point distribution similarity
    );

    // Adjust threshold based on character complexity
    const threshold = 0.6; // Lower threshold for simpler characters
    return Math.min(1, finalScore / threshold);
  };

  const endDrawing = () => {
    if (!isDrawing || !currentStroke) return;

    console.log('endDrawing called');
    console.log('practiceMode:', practiceMode);
    setIsDrawing(false);
    const newStrokes = [...strokes, currentStroke];
    setStrokes(newStrokes);
    setCurrentStroke(null);

    if (practiceMode === 'practice') {
      console.log('Calling verifyDrawing with newStrokes:', newStrokes);
      verifyDrawing(newStrokes);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx, canvas.width, canvas.height);
    setStrokes([]);
    setCurrentStroke(null);
    setVerificationResult(null);
  };

  const undoLastStroke = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx, canvas.width, canvas.height);
    
    const newStrokes = strokes.slice(0, -1);
    setStrokes(newStrokes);

    // Redraw remaining strokes
    newStrokes.forEach(stroke => {
      drawStroke(ctx, stroke);
    });

    // Verify the drawing after undoing
    if (practiceMode === 'practice' && newStrokes.length > 0) {
      verifyDrawing(newStrokes);
    } else {
      setVerificationResult(null);
    }
  };

  const handleKanaChange = (kana: string) => {
    setCurrentKana(kana);
    setCurrentRomaji(kanaStrokeData[kana]?.romaji || '');
    clearCanvas();
  };

  const handlePracticeModeChange = () => {
    setPracticeMode(prev => prev === 'practice' ? 'free' : 'practice');
    clearCanvas();
  };

  // Touch event handlers for mobile/iOS
  const startDrawingTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    setIsDrawing(true);
    const newStroke: Stroke = {
      points: [{ x, y }],
      color: theme.palette.primary.main
    };
    setCurrentStroke(newStroke);
  };

  const drawTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStroke) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    currentStroke.points.push({ x, y });
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx, canvas.width, canvas.height);
    strokes.forEach(stroke => {
      drawStroke(ctx, stroke);
    });
    drawStroke(ctx, currentStroke);
  };

  const endDrawingTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStroke) return;
    setIsDrawing(false);
    const newStrokes = [...strokes, currentStroke];
    setStrokes(newStrokes);
    setCurrentStroke(null);
    if (practiceMode === 'practice') {
      verifyDrawing(newStrokes);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3,
          bgcolor: 'background.paper',
          borderRadius: 2,
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" component="h2">
                Practice Writing {type === 'hiragana' ? 'Hiragana' : 'Katakana'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title={practiceMode === 'practice' ? 'Switch to Free Practice' : 'Switch to Practice Mode'}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handlePracticeModeChange}
                  >
                    {practiceMode === 'practice' ? 'Free Practice' : 'Practice Mode'}
                  </Button>
                </Tooltip>
                <Tooltip title="Show/Hide Hint">
                  <IconButton onClick={() => setShowHint(!showHint)}>
                    <CheckIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Listen">
                  <IconButton onClick={() => {
                    if (playAudio && typeof playAudio === 'function') {
                      playAudio(currentRomaji).catch(error => {
                        console.error('Error playing audio:', error);
                      });
                    }
                  }}>
                    <VolumeIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {verificationResult && (
              <Alert 
                severity={verificationResult.isCorrect ? 'success' : 'warning'}
                sx={{ mb: 2 }}
              >
                {verificationResult.message}
                {!verificationResult.isCorrect && (
                  <Typography variant="caption" display="block">
                    Accuracy: {Math.round(verificationResult.accuracy * 100)}%
                  </Typography>
                )}
              </Alert>
            )}

            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: isMobile ? '300px' : '400px',
                bgcolor: 'background.default',
                borderRadius: 1,
                overflow: 'hidden',
              }}
            >
              <canvas
                ref={canvasRef}
                style={{
                  width: '100%',
                  height: '100%',
                  touchAction: 'none',
                }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={endDrawing}
                onMouseLeave={endDrawing}
                onTouchStart={startDrawingTouch}
                onTouchMove={drawTouch}
                onTouchEnd={endDrawingTouch}
              />
              {showHint && practiceMode === 'practice' && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    opacity: 0.1,
                    pointerEvents: 'none',
                  }}
                >
                  <Typography variant="h1" component="div">
                    {currentKana}
                  </Typography>
                </Box>
              )}
            </Box>

            <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<UndoIcon />}
                onClick={undoLastStroke}
                disabled={strokes.length === 0}
              >
                Undo
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={clearCanvas}
                disabled={strokes.length === 0}
              >
                Clear
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" gutterBottom>
              Current Character: {currentKana}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Romaji: {currentRomaji}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Reference Points: {kanaStrokeData[currentKana]?.referencePoints.length || 0}
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Category:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {Object.entries(getKanaCategories(type)).map(([key, category]) => (
                  <Button
                    key={key}
                    variant={selectedCategory === key ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => {
                      setSelectedCategory(key);
                      if (category.kana.length > 0) {
                        handleKanaChange(category.kana[0]);
                      }
                    }}
                  >
                    {category.title}
                  </Button>
                ))}
              </Box>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Available Characters:
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 1,
                maxHeight: '200px',
                overflowY: 'auto',
                p: 1,
                border: 1,
                borderColor: 'divider',
                borderRadius: 1
              }}>
                {availableKana.map((kana) => (
                  <Button
                    key={kana}
                    variant={currentKana === kana ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => handleKanaChange(kana)}
                    sx={{ minWidth: '40px' }}
                  >
                    {kana}
                  </Button>
                ))}
              </Box>
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Practice Tips:
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • Focus on the overall shape of the character
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • Use the grid to maintain proper proportions
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • Try writing without looking at the hint
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Practice both the character's shape and its pronunciation
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default KanaPractice; 