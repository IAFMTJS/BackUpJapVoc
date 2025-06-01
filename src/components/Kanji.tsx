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
import { useAudio } from '../context/AudioContext';
import { useProgress } from '../context/ProgressContext';
import { useDictionary } from '../context/DictionaryContext';
import { DictionaryItem } from '../types/dictionary';

interface KanjiPracticeProps {
  initialKanji?: string;
  jlptLevel?: string;
}

interface Stroke {
  points: { x: number; y: number }[];
  color: string;
}

interface KanjiStrokeData {
  kanji: string;
  readings: {
    onyomi: string[];
    kunyomi: string[];
  };
  meanings: string[];
  strokes: number;
  jlpt: string;
  referencePoints: { x: number; y: number }[];
  strokeOrder: number[][];
  keyFeatures: {
    center: { x: number; y: number };
    width: number;
    height: number;
    radicals: { x: number; y: number; type: string }[];
  };
}

const KanjiPractice: React.FC<KanjiPracticeProps> = ({ initialKanji, jlptLevel }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { playAudio } = useAudio();
  const { updateWordProgress } = useProgress();
  const { words } = useDictionary();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentKanji, setCurrentKanji] = useState<DictionaryItem | null>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    isCorrect: boolean;
    message: string;
    accuracy: number;
  } | null>(null);
  const [practiceMode, setPracticeMode] = useState<'practice' | 'free'>('practice');
  const [selectedJLPT, setSelectedJLPT] = useState(jlptLevel || 'N5');
  const [availableKanji, setAvailableKanji] = useState<DictionaryItem[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStrokeIndex, setCurrentStrokeIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Initialize available kanji based on JLPT level
  useEffect(() => {
    const filteredKanji = words.filter(word => 
      word.kanji && 
      word.jlpt === selectedJLPT
    );
    setAvailableKanji(filteredKanji);
    if (filteredKanji.length > 0 && !currentKanji) {
      setCurrentKanji(filteredKanji[0]);
    }
  }, [selectedJLPT, words]);

  // Initialize canvas
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
    if (!currentKanji) return;

    // Basic verification for now - can be enhanced with more sophisticated stroke order validation
    const isCorrect = drawnStrokes.length > 0;
    const accuracy = 0.8; // Placeholder - implement actual stroke order validation

    const result = {
      isCorrect,
      message: isCorrect 
        ? 'Good job! The character looks correct!' 
        : 'Try again, focus on the stroke order and proportions',
      accuracy
    };

    setVerificationResult(result);

    if (isCorrect) {
      updateWordProgress(currentKanji.kanji!, {
        masteryLevel: 1,
        lastReviewed: Date.now(),
        reviewCount: 1,
        nextReviewDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
        category: 'kanji',
        section: 'writing',
        difficulty: selectedJLPT,
        consecutiveCorrect: 1,
        lastAnswerCorrect: true
      });
    }
  };

  const endDrawing = () => {
    if (!isDrawing || !currentStroke) return;

    setIsDrawing(false);
    const newStrokes = [...strokes, currentStroke];
    setStrokes(newStrokes);
    setCurrentStroke(null);

    if (practiceMode === 'practice') {
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

    if (practiceMode === 'practice' && newStrokes.length > 0) {
      verifyDrawing(newStrokes);
    } else {
      setVerificationResult(null);
    }
  };

  const handleKanjiChange = (kanji: DictionaryItem) => {
    setCurrentKanji(kanji);
    clearCanvas();
  };

  const handlePracticeModeChange = () => {
    setPracticeMode(prev => prev === 'practice' ? 'free' : 'practice');
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
                Practice Writing Kanji
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
                {currentKanji?.readings?.onyomi?.[0] && (
                  <Tooltip title="Listen to Onyomi">
                    <IconButton onClick={() => playAudio(currentKanji.readings.onyomi[0])}>
                      <VolumeIcon />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title={isPlaying ? 'Pause Animation' : 'Play Stroke Order'}>
                  <IconButton onClick={isPlaying ? pauseAnimation : playStrokeAnimation}>
                    {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
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
              {showHint && practiceMode === 'practice' && currentKanji && (
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
                    {currentKanji.kanji}
                  </Typography>
                </Box>
              )}
            </Box>

            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
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
            {currentKanji && (
              <>
                <Typography variant="subtitle1" gutterBottom>
                  Current Kanji: {currentKanji.kanji}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  JLPT Level: {currentKanji.jlpt}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Strokes: {currentKanji.strokes}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Meanings: {currentKanji.meanings.join(', ')}
                </Typography>
                {currentKanji.readings.onyomi.length > 0 && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Onyomi: {currentKanji.readings.onyomi.join(', ')}
                  </Typography>
                )}
                {currentKanji.readings.kunyomi.length > 0 && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Kunyomi: {currentKanji.readings.kunyomi.join(', ')}
                  </Typography>
                )}
              </>
            )}

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                JLPT Level:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {['N5', 'N4', 'N3', 'N2', 'N1'].map((level) => (
                  <Button
                    key={level}
                    variant={selectedJLPT === level ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setSelectedJLPT(level)}
                  >
                    {level}
                  </Button>
                ))}
              </Box>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Available Kanji:
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
                {availableKanji.map((kanji) => (
                  <Button
                    key={kanji.kanji}
                    variant={currentKanji?.kanji === kanji.kanji ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => handleKanjiChange(kanji)}
                    sx={{ minWidth: '40px' }}
                  >
                    {kanji.kanji}
                  </Button>
                ))}
              </Box>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Practice Tips:
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • Pay attention to stroke order
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • Use the grid to maintain proper proportions
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                • Practice both writing and reading
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Learn the radicals to understand kanji structure
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default KanjiPractice; 