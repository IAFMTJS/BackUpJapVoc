import React, { useState, useEffect, useCallback } from 'react';
import { useProgress } from '../context/ProgressContext';
import { useAudio } from '../context/AudioContext';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Paper,
  Divider,
  Chip
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  VolumeUp as VolumeUpIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import { kanjiData } from '../data/kanjiData';

interface KanjiPracticeProps {
  kanji: Kanji[];
}

interface PracticeMode {
  type: 'trace' | 'freehand';
  showGrid: boolean;
  showGuide: boolean;
}

const KanjiPractice: React.FC<KanjiPracticeProps> = ({ kanji }) => {
  const { playAudio } = useAudio();
  const { updateProgress, trackPracticeSession } = useProgress();
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
  const [strokeOrder, setStrokeOrder] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [totalStrokes, setTotalStrokes] = useState<number>(0);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());

  // Track practice session completion
  const completePracticeSession = useCallback(() => {
    const sessionDuration = Math.round((Date.now() - sessionStartTime) / 1000); // in seconds
    const accuracy = totalStrokes > 0 ? score / totalStrokes : 0;

    trackPracticeSession({
      practiceType: 'writing',
      timeSpent: sessionDuration,
      wordsPracticed: [currentKanji?.character || ''],
      accuracy,
      strokesCorrect: score,
      totalStrokes
    });
  }, [trackPracticeSession, sessionStartTime, totalStrokes, score, currentKanji]);

  // Call completePracticeSession when practice is finished
  useEffect(() => {
    if (isComplete) {
      completePracticeSession();
    }
  }, [isComplete, completePracticeSession]);

  // Load stroke data for a kanji
  const loadStrokeData = async (kanjiChar: string): Promise<StrokeData[] | undefined> => {
    try {
      console.log(`Loading stroke data for kanji: ${kanjiChar}`);
      
      // First check if we have basic stroke data
      if (basicStrokeData[kanjiChar]) {
        console.log(`Using basic stroke data for ${kanjiChar}`);
        return basicStrokeData[kanjiChar];
      }

      // Generate fallback stroke data for kanji without predefined data
      console.log(`Generating fallback stroke data for ${kanjiChar}`);
      const fallbackData = generateFallbackStrokeData(kanjiChar);
      if (fallbackData && fallbackData.length > 0) {
        console.log(`Generated fallback stroke data for ${kanjiChar}`);
        return fallbackData;
      }

      // If all else fails, create a simple stroke
      console.log(`Creating simple stroke data for ${kanjiChar}`);
      const simpleStroke: StrokeData = {
        type: 'horizontal',
        direction: 0,
        length: 1,
        curvature: 0,
        points: [{ x: 20, y: 50 }, { x: 80, y: 50 }],
        order: 1,
        path: 'M 20 50 L 80 50'
      };
      
      return [simpleStroke];
    } catch (err) {
      console.error(`Failed to load stroke data for ${kanjiChar}:`, err);
      
      // Return a simple fallback stroke
      const fallbackStroke: StrokeData = {
        type: 'horizontal',
        direction: 0,
        length: 1,
        curvature: 0,
        points: [{ x: 20, y: 50 }, { x: 80, y: 50 }],
        order: 1,
        path: 'M 20 50 L 80 50'
      };
      
      return [fallbackStroke];
    }
  };

  // Generate fallback stroke data for kanji without predefined data
  const generateFallbackStrokeData = (kanjiChar: string): StrokeData[] => {
    // Simple fallback: create basic strokes based on character complexity
    const strokes: StrokeData[] = [];
    const strokeCount = getKanjiStrokeCount(kanjiChar);
    
    if (strokeCount <= 0) return [];
    
    // Generate basic strokes based on stroke count
    for (let i = 0; i < strokeCount; i++) {
      const strokeType = i % 4 === 0 ? 'horizontal' : 
                        i % 4 === 1 ? 'vertical' : 
                        i % 4 === 2 ? 'curve' : 'diagonal';
      
      const direction = (i * Math.PI / 4) % (2 * Math.PI);
      const length = 0.8 + (Math.random() * 0.4); // Random length between 0.8 and 1.2
      const curvature = strokeType === 'curve' ? 0.5 : 0;
      
      // Generate points for the stroke
      const centerX = 50;
      const centerY = 50;
      const baseLength = 30;
      const actualLength = baseLength * length;
      
      let startX, startY, endX, endY;
      
      switch (strokeType) {
        case 'horizontal':
          startX = centerX - actualLength / 2;
          startY = centerY + (i - 2) * 10;
          endX = centerX + actualLength / 2;
          endY = startY;
          break;
        case 'vertical':
          startX = centerX + (i - 2) * 10;
          startY = centerY - actualLength / 2;
          endX = startX;
          endY = centerY + actualLength / 2;
          break;
        case 'curve':
          startX = centerX - actualLength / 2;
          startY = centerY + actualLength / 2;
          endX = centerX + actualLength / 2;
          endY = centerY - actualLength / 2;
          break;
        case 'diagonal':
          startX = centerX - actualLength / 2;
          startY = centerY - actualLength / 2;
          endX = centerX + actualLength / 2;
          endY = centerY + actualLength / 2;
          break;
        default:
          startX = centerX - actualLength / 2;
          startY = centerY;
          endX = centerX + actualLength / 2;
          endY = centerY;
      }
      
      const points = [
        { x: startX, y: startY },
        { x: endX, y: endY }
      ];
      
      strokes.push({
        type: strokeType,
        direction,
        length,
        curvature,
        points,
        order: i + 1,
        path: generateStrokePath(strokeType, direction, length, i)
      });
    }
    
    return strokes;
  };

  // Get stroke count for a kanji character
  const getKanjiStrokeCount = (kanjiChar: string): number => {
    // Look up stroke count from kanji data
    const kanjiData = kanjiList.find(k => k.character === kanjiChar);
    if (kanjiData && kanjiData.strokeCount) {
      return kanjiData.strokeCount;
    }
    
    // Fallback: estimate stroke count based on character complexity
    const complexity = kanjiChar.length;
    if (complexity <= 1) return 1;
    if (complexity <= 3) return 2;
    if (complexity <= 5) return 3;
    if (complexity <= 7) return 4;
    return 5; // Default for complex characters
  };

  // Generate SVG path for a stroke
  const generateStrokePath = (type: string, direction: number, length: number, index: number): string => {
    const centerX = 50;
    const centerY = 50;
    const baseLength = 30;
    const actualLength = baseLength * length;
    
    let startX, startY, endX, endY;
    
    switch (type) {
      case 'horizontal':
        startX = centerX - actualLength / 2;
        startY = centerY + (index - 2) * 10;
        endX = centerX + actualLength / 2;
        endY = startY;
        break;
      case 'vertical':
        startX = centerX + (index - 2) * 10;
        startY = centerY - actualLength / 2;
        endX = startX;
        endY = centerY + actualLength / 2;
        break;
      case 'curve':
        startX = centerX - actualLength / 2;
        startY = centerY + actualLength / 2;
        endX = centerX + actualLength / 2;
        endY = centerY - actualLength / 2;
        return `M ${startX} ${startY} Q ${centerX} ${centerY} ${endX} ${endY}`;
      case 'diagonal':
        startX = centerX - actualLength / 2;
        startY = centerY - actualLength / 2;
        endX = centerX + actualLength / 2;
        endY = centerY + actualLength / 2;
        break;
      default:
        startX = centerX - actualLength / 2;
        startY = centerY;
        endX = centerX + actualLength / 2;
        endY = centerY;
    }
    
    return `M ${startX} ${startY} L ${endX} ${endY}`;
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
          <CircularProgress sx={{ width: '100%', maxWidth: 300 }} />
        </Box>
      );
    }

    if (!currentKanji) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
          <Typography variant="h6" color="error" gutterBottom>
            No valid kanji available for practice
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
            The selected kanji don't have stroke data available. Try selecting different kanji or check your internet connection.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => window.location.reload()}
            sx={{ mt: 1 }}
          >
            Reload Page
          </Button>
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