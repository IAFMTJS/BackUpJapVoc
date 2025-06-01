import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Slider,
} from '@mui/material';
import {
  Undo as UndoIcon,
  Delete as DeleteIcon,
  VolumeUp as VolumeIcon,
  Check as CheckIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import { useAudio } from '../context/AudioContext';
import { useProgress } from '../context/ProgressContext';
import { Kanji } from '../data/kanjiData';
import { Point, Stroke, StrokeData, StrokeFeedback } from '../types/stroke';
import { analyzeStroke, validateStroke, calculateStrokeOrderScore } from '../utils/strokeValidation';
import { getStrokeData, saveStrokeData } from '../utils/offlineSupport';

interface Stroke {
  points: { x: number; y: number }[];
  color: string;
}

interface KanjiWithStrokes extends Kanji {
  strokes?: StrokeData[];
}

interface KanjiPracticeProps {
  kanji: Kanji[];
}

interface PracticeMode {
  type: 'trace' | 'freehand';
  showGrid: boolean;
  showGuide: boolean;
}

// Helper function to analyze SVG path and convert to stroke data
const analyzeSvgPath = (path: string): Partial<StrokeData> => {
  // Parse the SVG path commands
  const commands = path.match(/[MLHVCSQTAZmlhvcsqtaz][^MLHVCSQTAZmlhvcsqtaz]*/g) || [];
  
  // Extract points from the path
  const points: Point[] = [];
  let currentX = 0;
  let currentY = 0;
  
  commands.forEach(cmd => {
    const type = cmd[0];
    const values = cmd.slice(1).trim().split(/[\s,]+/).map(Number);
    
    switch (type) {
      case 'M': // Move to
        currentX = values[0];
        currentY = values[1];
        points.push({ x: currentX, y: currentY });
        break;
      case 'L': // Line to
        currentX = values[0];
        currentY = values[1];
        points.push({ x: currentX, y: currentY });
        break;
      case 'H': // Horizontal line
        currentX = values[0];
        points.push({ x: currentX, y: currentY });
        break;
      case 'V': // Vertical line
        currentY = values[0];
        points.push({ x: currentX, y: currentY });
        break;
      // Add more cases for other SVG path commands if needed
    }
  });
  
  if (points.length < 2) {
    return {
      type: 'point',
      direction: 0,
      length: 0
    };
  }
  
  // Calculate stroke direction and length
  const start = points[0];
  const end = points[points.length - 1];
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const direction = Math.atan2(dy, dx);
  
  // Determine stroke type based on path characteristics
  let type: StrokeData['type'] = 'line';
  if (length < 5) {
    type = 'dot';
  } else if (Math.abs(dx) < 5) {
    type = 'vertical';
  } else if (Math.abs(dy) < 5) {
    type = 'horizontal';
  } else if (points.length > 2) {
    // Check if the path is curved
    const isCurved = points.some((p, i) => {
      if (i < 2) return false;
      const prev = points[i - 1];
      const next = points[i + 1];
      if (!next) return false;
      
      // Calculate if the point deviates significantly from a straight line
      const lineLength = Math.sqrt(
        Math.pow(next.x - prev.x, 2) + Math.pow(next.y - prev.y, 2)
      );
      const pointDist = Math.abs(
        (next.y - prev.y) * p.x - (next.x - prev.x) * p.y + next.x * prev.y - next.y * prev.x
      ) / lineLength;
      
      return pointDist > 5;
    });
    
    if (isCurved) {
      type = 'curve';
    }
  }
  
  return {
    type,
    direction,
    length
  };
};

// Basic stroke data for common kanji
const basicStrokeData: Record<string, StrokeData[]> = {
  '人': [
    { type: 'vertical', direction: Math.PI/2, length: 1, order: 1, path: 'M 50 20 L 50 80' },
    { type: 'curve', direction: Math.PI/4, length: 0.8, order: 2, path: 'M 20 50 Q 35 35 50 50' }
  ],
  '日': [
    { type: 'vertical', direction: Math.PI/2, length: 1, order: 1, path: 'M 50 20 L 50 80' },
    { type: 'horizontal', direction: 0, length: 1, order: 2, path: 'M 20 50 L 80 50' },
    { type: 'vertical', direction: Math.PI/2, length: 1, order: 3, path: 'M 20 20 L 20 80' },
    { type: 'horizontal', direction: 0, length: 1, order: 4, path: 'M 20 20 L 80 20' }
  ],
  '月': [
    { type: 'vertical', direction: Math.PI/2, length: 1, order: 1, path: 'M 20 20 L 20 80' },
    { type: 'horizontal', direction: 0, length: 1, order: 2, path: 'M 20 20 L 80 20' },
    { type: 'vertical', direction: Math.PI/2, length: 1, order: 3, path: 'M 80 20 L 80 80' },
    { type: 'horizontal', direction: 0, length: 1, order: 4, path: 'M 20 80 L 80 80' }
  ],
  '時': [
    { type: 'vertical', direction: Math.PI/2, length: 1, order: 1, path: 'M 20 20 L 20 80' },
    { type: 'horizontal', direction: 0, length: 1, order: 2, path: 'M 20 20 L 80 20' },
    { type: 'vertical', direction: Math.PI/2, length: 1, order: 3, path: 'M 80 20 L 80 80' },
    { type: 'horizontal', direction: 0, length: 1, order: 4, path: 'M 20 80 L 80 80' },
    { type: 'vertical', direction: Math.PI/2, length: 0.5, order: 5, path: 'M 50 20 L 50 40' },
    { type: 'horizontal', direction: 0, length: 0.5, order: 6, path: 'M 35 50 L 65 50' },
    { type: 'vertical', direction: Math.PI/2, length: 0.5, order: 7, path: 'M 50 60 L 50 80' }
  ],
  '分': [
    { type: 'horizontal', direction: 0, length: 1, order: 1, path: 'M 20 20 L 80 20' },
    { type: 'vertical', direction: Math.PI/2, length: 1, order: 2, path: 'M 50 20 L 50 80' },
    { type: 'horizontal', direction: 0, length: 1, order: 3, path: 'M 20 50 L 80 50' },
    { type: 'vertical', direction: Math.PI/2, length: 1, order: 4, path: 'M 20 80 L 80 80' }
  ],
  '今': [
    { type: 'vertical', direction: Math.PI/2, length: 1, order: 1, path: 'M 50 20 L 50 80' },
    { type: 'horizontal', direction: 0, length: 1, order: 2, path: 'M 20 50 L 80 50' },
    { type: 'vertical', direction: Math.PI/2, length: 0.5, order: 3, path: 'M 20 20 L 20 40' },
    { type: 'horizontal', direction: 0, length: 0.5, order: 4, path: 'M 20 20 L 40 20' },
    { type: 'vertical', direction: Math.PI/2, length: 0.5, order: 5, path: 'M 80 20 L 80 40' },
    { type: 'horizontal', direction: 0, length: 0.5, order: 6, path: 'M 60 20 L 80 20' },
    { type: 'vertical', direction: Math.PI/2, length: 0.5, order: 7, path: 'M 20 60 L 20 80' },
    { type: 'horizontal', direction: 0, length: 0.5, order: 8, path: 'M 20 60 L 40 60' },
    { type: 'vertical', direction: Math.PI/2, length: 0.5, order: 9, path: 'M 80 60 L 80 80' }
  ],
  '先': [
    { type: 'vertical', direction: Math.PI/2, length: 1, order: 1, path: 'M 50 20 L 50 80' },
    { type: 'horizontal', direction: 0, length: 1, order: 2, path: 'M 20 50 L 80 50' },
    { type: 'vertical', direction: Math.PI/2, length: 0.5, order: 3, path: 'M 20 20 L 20 40' },
    { type: 'horizontal', direction: 0, length: 0.5, order: 4, path: 'M 20 20 L 40 20' },
    { type: 'vertical', direction: Math.PI/2, length: 0.5, order: 5, path: 'M 80 20 L 80 40' },
    { type: 'horizontal', direction: 0, length: 0.5, order: 6, path: 'M 60 20 L 80 20' }
  ],
  '後': [
    { type: 'vertical', direction: Math.PI/2, length: 1, order: 1, path: 'M 50 20 L 50 80' },
    { type: 'horizontal', direction: 0, length: 1, order: 2, path: 'M 20 50 L 80 50' },
    { type: 'vertical', direction: Math.PI/2, length: 0.5, order: 3, path: 'M 20 20 L 20 40' },
    { type: 'horizontal', direction: 0, length: 0.5, order: 4, path: 'M 20 20 L 40 20' },
    { type: 'vertical', direction: Math.PI/2, length: 0.5, order: 5, path: 'M 80 20 L 80 40' },
    { type: 'horizontal', direction: 0, length: 0.5, order: 6, path: 'M 60 20 L 80 20' }
  ]
};

const KanjiPractice: React.FC<KanjiPracticeProps> = ({ kanji }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { playAudio } = useAudio();
  const { updateProgress } = useProgress();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentKanji, setCurrentKanji] = useState<KanjiWithStrokes | null>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    isCorrect: boolean;
    message: string;
    accuracy: number;
    strokeFeedbacks?: StrokeFeedback[];
  } | null>(null);
  const [practiceMode, setPracticeMode] = useState<PracticeMode>({
    type: 'freehand',
    showGrid: true,
    showGuide: false
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStrokeIndex, setCurrentStrokeIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [comparisonResult, setComparisonResult] = useState<{
    similarity: number;
    feedback: string;
  } | null>(null);

  // Load stroke data for a kanji
  const loadStrokeData = async (kanjiChar: string): Promise<StrokeData[] | undefined> => {
    try {
      console.log(`Loading stroke data for kanji: ${kanjiChar}`);
      
      // First try to get from local database
      const strokeData = await getStrokeData(kanjiChar);
      if (strokeData && strokeData.strokes && strokeData.strokes.length > 0) {
        console.log(`Found stroke data in database for ${kanjiChar}`);
        return strokeData.strokes;
      }

      // If not in database, check if we have basic stroke data
      if (basicStrokeData[kanjiChar]) {
        console.log(`Using basic stroke data for ${kanjiChar}`);
        const basicData = basicStrokeData[kanjiChar];
        
        // Save to database for future use
        try {
          await saveStrokeData({
            id: kanjiChar,
            kanji: kanjiChar,
            strokes: basicData,
            timestamp: new Date()
          });
          console.log(`Saved basic stroke data to database for ${kanjiChar}`);
        } catch (saveErr) {
          console.warn(`Failed to save basic stroke data to database for ${kanjiChar}:`, saveErr);
        }
        
        return basicData;
      }

      // If no basic data, try to fetch from KanjiVG API
      console.log(`Attempting to fetch stroke data from KanjiVG for ${kanjiChar}`);
      try {
        const response = await fetch(`https://kanjivg.tagaini.net/kanji/${encodeURIComponent(kanjiChar)}.svg`);
        if (!response.ok) {
          throw new Error(`Failed to fetch stroke data: ${response.status} ${response.statusText}`);
        }
        
        const svgText = await response.text();
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
        
        // Extract stroke paths and their order
        const strokeElements = svgDoc.querySelectorAll('path[data-stroke]');
        if (strokeElements.length === 0) {
          console.warn(`No stroke elements found in SVG for ${kanjiChar}`);
          return undefined;
        }

        const analyzedStrokes: StrokeData[] = Array.from(strokeElements).map((element, index) => {
          const path = element.getAttribute('d') || '';
          const order = parseInt(element.getAttribute('data-stroke') || `${index + 1}`);
          
          // Analyze the SVG path to determine stroke characteristics
          const analysis = analyzeSvgPath(path);
          
          return {
            ...analysis,
            order,
            path
          } as StrokeData;
        });

        if (analyzedStrokes.length === 0) {
          console.warn(`No valid strokes analyzed for ${kanjiChar}`);
          return undefined;
        }

        // Save to database for future use
        try {
          await saveStrokeData({
            id: kanjiChar,
            kanji: kanjiChar,
            strokes: analyzedStrokes,
            timestamp: new Date()
          });
          console.log(`Saved KanjiVG stroke data to database for ${kanjiChar}`);
        } catch (saveErr) {
          console.warn(`Failed to save KanjiVG stroke data to database for ${kanjiChar}:`, saveErr);
        }

        return analyzedStrokes;
      } catch (err) {
        console.warn(`Failed to fetch stroke data for ${kanjiChar} from KanjiVG:`, err);
        return undefined;
      }
    } catch (err) {
      console.error(`Failed to load stroke data for ${kanjiChar}:`, err);
      return undefined;
    }
  };

  // Initialize current kanji with stroke data
  useEffect(() => {
    const initializeKanji = async () => {
      console.log('KanjiPractice: received kanji list:', kanji.map(k => k.character).join(', '));
      
      if (kanji.length === 0) {
        console.warn('KanjiPractice: Empty kanji list received');
        setIsLoading(false);
        return;
      }

      if (currentKanji) {
        console.log('KanjiPractice: Current kanji already set:', currentKanji.character);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      let foundValidKanji = false;

      try {
        // First try to find a kanji with basic stroke data
        for (const k of kanji) {
          if (basicStrokeData[k.character]) {
            console.log(`KanjiPractice: Found kanji with basic stroke data: ${k.character}`);
            const strokeData = await loadStrokeData(k.character);
            if (strokeData && strokeData.length > 0) {
              const kanjiWithStrokes: KanjiWithStrokes = {
                ...k,
                strokes: strokeData
              };
              setCurrentKanji(kanjiWithStrokes);
              console.log('KanjiPractice: Set initial kanji with basic stroke data:', kanjiWithStrokes.character);
              foundValidKanji = true;
              break;
            }
          }
        }

        // If no kanji with basic stroke data, try any kanji
        if (!foundValidKanji) {
          console.log('KanjiPractice: No kanji with basic stroke data found, trying all kanji');
          for (const k of kanji) {
            const strokeData = await loadStrokeData(k.character);
            if (strokeData && strokeData.length > 0) {
              const kanjiWithStrokes: KanjiWithStrokes = {
                ...k,
                strokes: strokeData
              };
              setCurrentKanji(kanjiWithStrokes);
              console.log('KanjiPractice: Set initial kanji:', kanjiWithStrokes.character);
              foundValidKanji = true;
              break;
            }
          }
        }

        if (!foundValidKanji) {
          console.warn('KanjiPractice: No kanji with valid strokes found in the list:', kanji.map(k => k.character).join(', '));
        }
      } catch (err) {
        console.error('KanjiPractice: Failed to initialize kanji:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeKanji();
  }, [kanji]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid if enabled
    if (practiceMode.showGrid) {
      drawGrid(ctx, canvas.width, canvas.height);
    }

    // Set up canvas styles for drawing
    ctx.strokeStyle = theme.palette.text.primary;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [theme, practiceMode.showGrid]);

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSize = Math.min(width, height) / 8; // 8x8 grid
    ctx.strokeStyle = theme.palette.divider;
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
  };

  const drawGuide = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!currentKanji || !practiceMode.showGuide) return;

    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.strokeStyle = theme.palette.text.primary;
    ctx.lineWidth = 2;

    // Draw the guide kanji
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.innerHTML = currentKanji.svg || '';
    const path = svg.querySelector('path');
    if (path) {
      const d = path.getAttribute('d');
      if (d) {
        const path2D = new Path2D(d);
        ctx.stroke(path2D);
      }
    }
    ctx.restore();
  };

  const redrawCanvas = (strokes: StrokeData[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid if enabled
    if (practiceMode.showGrid) {
      drawGrid(ctx, canvas.width, canvas.height);
    }

    // Draw guide if enabled
    drawGuide(ctx, canvas.width, canvas.height);

    // Draw strokes
    ctx.strokeStyle = theme.palette.text.primary;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    strokes.forEach(stroke => {
      if (stroke.points.length > 0) {
        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        stroke.points.forEach(point => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
      }
    });
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
    if (!currentKanji) return;

    // Calculate stroke accuracy
    const strokeFeedbacks = currentKanji.strokes.map((referenceStroke, index) => {
      const drawnStroke = drawnStrokes[index];
      if (!drawnStroke) {
        return { isCorrect: false, message: 'Missing stroke' };
      }
      return validateStroke(drawnStroke, referenceStroke);
    });

    const isCorrect = strokeFeedbacks.every(f => f.isCorrect);
    const averageAccuracy = strokeFeedbacks.reduce((acc, f) => acc + (f.accuracy || 0), 0) / strokeFeedbacks.length;

    let message = '';
    if (isCorrect) {
      if (averageAccuracy >= 0.7) {
        message = 'Excellent! The character looks very good!';
      } else if (averageAccuracy >= 0.5) {
        message = 'Good job! The character looks correct!';
      } else {
        message = 'Acceptable! Keep practicing to improve your strokes.';
      }
    } else {
      const incorrectStrokes = strokeFeedbacks.filter(f => !f.isCorrect).length;
      message = `Try again. ${incorrectStrokes} stroke${incorrectStrokes !== 1 ? 's' : ''} need${incorrectStrokes !== 1 ? '' : 's'} improvement.`;
    }

    const result = {
      isCorrect,
      message,
      accuracy: averageAccuracy,
      strokeFeedbacks
    };

    setVerificationResult(result);

    if (currentKanji) {
      // Update progress with the new mastery level system
      updateProgress(`kanji-${currentKanji.character}`, {
        category: 'kanji',
        section: 'writing',
        lastAnswerCorrect: isCorrect,
        correctAnswers: isCorrect ? 1 : 0,
        incorrectAnswers: isCorrect ? 0 : 1,
        lastReviewed: Date.now(),
        strokeOrderProgress: {
          correctStrokes: strokeFeedbacks.filter(f => f.isCorrect).length,
          totalStrokes: currentKanji.strokes.length,
          lastScore: averageAccuracy
        }
      });
    }
  };

  // Helper function to calculate stroke accuracy
  const calculateStrokeAccuracy = (drawnStroke: StrokeData, expectedStroke: StrokeData): number => {
    // Calculate direction accuracy (25% weight) - even more lenient threshold
    const directionMatch = Math.abs(drawnStroke.direction - expectedStroke.direction) < 0.6; // Increased from 0.4
    const directionAccuracy = directionMatch ? 1 : 0.6; // More partial credit for close matches

    // Calculate length accuracy (25% weight) - even more lenient threshold
    const lengthMatch = Math.abs(drawnStroke.length - expectedStroke.length) / expectedStroke.length < 0.7; // Increased from 0.5
    const lengthAccuracy = lengthMatch ? 1 : 0.6; // More partial credit for close matches

    // Calculate type accuracy (50% weight) - most important but still forgiving
    const typeMatch = drawnStroke.type === expectedStroke.type;
    const typeAccuracy = typeMatch ? 1 : 0.4; // More credit even for wrong type

    // Calculate weighted average
    return (directionAccuracy * 0.25) + (lengthAccuracy * 0.25) + (typeAccuracy * 0.5);
  };

  // Helper function to generate stroke suggestions
  const generateStrokeSuggestions = (drawnStroke: StrokeData, expectedStroke: StrokeData): string[] => {
    const suggestions: string[] = [];
    
    if (Math.abs(drawnStroke.direction - expectedStroke.direction) >= 0.6) { // Increased threshold
      suggestions.push(`Try to draw the stroke more ${drawnStroke.direction > expectedStroke.direction ? 'horizontally' : 'vertically'}`);
    }
    
    if (Math.abs(drawnStroke.length - expectedStroke.length) / expectedStroke.length >= 0.7) { // Increased threshold
      suggestions.push(`The stroke should be ${drawnStroke.length > expectedStroke.length ? 'shorter' : 'longer'}`);
    }
    
    if (drawnStroke.type !== expectedStroke.type) {
      suggestions.push(`This should be a ${expectedStroke.type} stroke`);
    }
    
    return suggestions;
  };

  const endDrawing = () => {
    if (!isDrawing || !currentStroke) return;

    setIsDrawing(false);
    const newStrokes = [...strokes, currentStroke];
    setStrokes(newStrokes);
    setCurrentStroke(null);

    if (practiceMode.type === 'practice') {
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

    if (practiceMode.type === 'practice' && newStrokes.length > 0) {
      verifyDrawing(newStrokes);
    } else {
      setVerificationResult(null);
    }
  };

  const handleKanjiChange = async (selected: Kanji) => {
    setIsLoading(true);
    try {
      const strokeData = await loadStrokeData(selected.character);
      if (strokeData && strokeData.length > 0) {
        const kanjiWithStrokes: KanjiWithStrokes = {
          ...selected,
          strokes: strokeData
        };
        setCurrentKanji(kanjiWithStrokes);
        console.log('KanjiPractice: selected kanji:', kanjiWithStrokes);
      } else {
        setCurrentKanji(null);
        console.warn('KanjiPractice: selected kanji has no valid strokes:', selected);
      }
    } catch (err) {
      console.error('Failed to load stroke data:', err);
      setCurrentKanji(null);
    } finally {
      setIsLoading(false);
    }
    clearCanvas();
  };

  const handlePracticeModeChange = () => {
    setPracticeMode(prev => ({ ...prev, type: prev.type === 'practice' ? 'freehand' : 'practice' }));
    clearCanvas();
  };

  const playStrokeAnimation = () => {
    if (!currentKanji) return;

    setIsPlaying(true);
    let strokeIndex = 0;

    const animate = () => {
      if (strokeIndex >= (currentKanji.strokes || 0)) {
        setIsPlaying(false);
        return;
      }

      setCurrentStrokeIndex(strokeIndex);
      strokeIndex++;

      setTimeout(animate, 1000 / playbackSpeed);
    };

    animate();
  };

  const pauseAnimation = () => {
    setIsPlaying(false);
  };

  // Touch event handlers for mobile
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
    if (practiceMode.type === 'practice') {
      verifyDrawing(newStrokes);
    }
  };

  const playKanjiReading = (reading: string) => {
    if (reading) {
      playAudio(reading);
    }
  };

  const compareWithKanji = () => {
    if (!currentKanji) return;

    // Simple comparison based on bounding box and basic shape
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get the drawn image data
    const drawnData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Create a temporary canvas for the reference kanji
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // Draw the reference kanji
    tempCtx.fillStyle = 'white';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.strokeStyle = 'black';
    tempCtx.lineWidth = 3;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.innerHTML = currentKanji.svg || '';
    const path = svg.querySelector('path');
    if (path) {
      const d = path.getAttribute('d');
      if (d) {
        const path2D = new Path2D(d);
        tempCtx.stroke(path2D);
      }
    }

    // Get the reference image data
    const referenceData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);

    // Compare the two images
    let matchingPixels = 0;
    let totalPixels = 0;
    for (let i = 0; i < drawnData.data.length; i += 4) {
      if (drawnData.data[i + 3] > 0 || referenceData.data[i + 3] > 0) {
        totalPixels++;
        if (Math.abs(drawnData.data[i] - referenceData.data[i]) < 50) {
          matchingPixels++;
        }
      }
    }

    const similarity = (matchingPixels / totalPixels) * 100;
    let feedback = '';
    if (similarity > 80) {
      feedback = 'Excellent! The kanji looks very accurate.';
    } else if (similarity > 60) {
      feedback = 'Good! The overall shape is recognizable, but could be more precise.';
    } else if (similarity > 40) {
      feedback = 'Fair. The basic shape is there, but needs improvement.';
    } else {
      feedback = 'Try again. Focus on the overall shape and proportions.';
    }

    setComparisonResult({ similarity, feedback });
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Loading stroke data...
          </Typography>
          <LinearProgress sx={{ width: '100%', maxWidth: 300 }} />
        </Box>
      );
    }

    if (!currentKanji) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
          <Typography variant="h6" color="error" gutterBottom>
            No valid kanji available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please select a different kanji or try again later.
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" sx={{ fontFamily: 'Noto Sans JP' }}>
            {currentKanji.character}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant={practiceMode.type === 'trace' ? 'contained' : 'outlined'}
              onClick={() => setPracticeMode(prev => ({ ...prev, type: 'trace' }))}
            >
              Trace
            </Button>
            <Button
              variant={practiceMode.type === 'freehand' ? 'contained' : 'outlined'}
              onClick={() => setPracticeMode(prev => ({ ...prev, type: 'freehand' }))}
            >
              Freehand
            </Button>
            <Button
              variant={practiceMode.showGrid ? 'contained' : 'outlined'}
              onClick={() => setPracticeMode(prev => ({ ...prev, showGrid: !prev.showGrid }))}
            >
              Grid
            </Button>
            <Button
              variant={practiceMode.showGuide ? 'contained' : 'outlined'}
              onClick={() => setPracticeMode(prev => ({ ...prev, showGuide: !prev.showGuide }))}
            >
              Guide
            </Button>
          </Box>
        </Box>

        <Box sx={{ position: 'relative', width: '100%', maxWidth: 400, height: 400, mx: 'auto' }}>
          <canvas
            ref={canvasRef}
            style={{
              border: `2px solid ${theme.palette.divider}`,
              borderRadius: 8,
              touchAction: 'none',
              backgroundColor: 'white'
            }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={endDrawing}
            onMouseLeave={endDrawing}
            onTouchStart={startDrawingTouch}
            onTouchMove={drawTouch}
            onTouchEnd={endDrawingTouch}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            onClick={undoLastStroke}
            disabled={strokes.length === 0}
            startIcon={<UndoIcon />}
          >
            Undo
          </Button>
          <Button
            variant="outlined"
            onClick={clearCanvas}
            disabled={strokes.length === 0}
            startIcon={<DeleteIcon />}
          >
            Clear
          </Button>
          <Button
            variant="contained"
            onClick={compareWithKanji}
            disabled={strokes.length === 0}
            startIcon={<CheckIcon />}
          >
            Check
          </Button>
        </Box>

        {comparisonResult && (
          <Paper sx={{ p: 2, mt: 2, bgcolor: 'background.paper' }}>
            <Typography variant="h6" color="primary">
              Similarity: {Math.round(comparisonResult.similarity)}%
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {comparisonResult.feedback}
            </Typography>
          </Paper>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          {renderContent()}
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper 
            sx={{ 
              p: 2, 
              position: 'sticky', 
              top: 16,
              height: 'calc(100vh - 32px)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ flexShrink: 0 }}>
              Available Kanji
            </Typography>
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))',
              gap: 1,
              overflowY: 'auto',
              p: 1,
              flexGrow: 1,
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: theme.palette.background.default,
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: theme.palette.divider,
                borderRadius: '4px',
                '&:hover': {
                  background: theme.palette.action.hover,
                },
              },
            }}>
              {kanji.map((k, index) => (
                <Button
                  key={`${k.character}-${index}`}
                  variant={currentKanji?.character === k.character ? 'contained' : 'outlined'}
                  onClick={() => handleKanjiChange(k)}
                  disabled={isLoading}
                  sx={{ 
                    minWidth: 40,
                    height: 40,
                    p: 0,
                    fontFamily: 'Noto Sans JP',
                    fontSize: '1.2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      transition: 'transform 0.2s',
                    }
                  }}
                >
                  {k.character}
                </Button>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default KanjiPractice;