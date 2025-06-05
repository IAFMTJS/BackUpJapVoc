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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Undo as UndoIcon,
  Delete as DeleteIcon,
  VolumeUp as VolumeIcon,
  Check as CheckIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { useAudio } from '../../context/AudioContext';
import { useProgress } from '../../context/ProgressContext';
import { useKanjiDictionary } from '../../context/KanjiDictionaryContext';

interface KanjiPracticeProps {
  initialKanji?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

interface Stroke {
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

const KanjiPractice: React.FC<KanjiPracticeProps> = ({ initialKanji, difficulty = 'beginner' }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { playAudio } = useAudio();
  const { updateWordProgress } = useProgress();
  const { kanji, isInitialized } = useKanjiDictionary();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentKanji, setCurrentKanji] = useState(initialKanji || '');
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    isCorrect: boolean;
    message: string;
    accuracy: number;
  } | null>(null);
  const [practiceMode, setPracticeMode] = useState<'practice' | 'free'>('practice');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [availableKanji, setAvailableKanji] = useState<string[]>([]);

  // Filter kanji based on difficulty/level
  useEffect(() => {
    if (!isInitialized || !kanji.length) return;

    let filteredKanji = kanji;
    if (difficulty === 'beginner') {
      filteredKanji = kanji.filter(k => k.jlpt === 5);
    } else if (difficulty === 'intermediate') {
      filteredKanji = kanji.filter(k => k.jlpt === 3 || k.jlpt === 4);
    } else if (difficulty === 'advanced') {
      filteredKanji = kanji.filter(k => k.jlpt === 1 || k.jlpt === 2);
    }

    if (selectedLevel !== 'all') {
      filteredKanji = filteredKanji.filter(k => k.jlpt?.toString() === selectedLevel.replace('N', ''));
    }

    setAvailableKanji(filteredKanji.map(k => k.character));
    if (!currentKanji && filteredKanji.length > 0) {
      setCurrentKanji(filteredKanji[0].character);
    }
  }, [kanji, isInitialized, difficulty, selectedLevel]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      redrawCanvas();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = theme.palette.background.paper;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all strokes
    [...strokes, currentStroke].forEach(stroke => {
      if (!stroke) return;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const points = stroke.points;
      if (points.length > 0) {
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
      }
      ctx.stroke();
    });
  };

  useEffect(() => {
    redrawCanvas();
  }, [strokes, currentStroke]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setCurrentStroke({
      points: [{ x, y }],
      color: theme.palette.primary.main,
      width: 3,
    });
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStroke || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentStroke(prev => ({
      ...prev!,
      points: [...prev!.points, { x, y }],
    }));
  };

  const endDrawing = () => {
    if (!isDrawing || !currentStroke) return;
    setStrokes(prev => [...prev, currentStroke]);
    setCurrentStroke(null);
    setIsDrawing(false);
  };

  const startDrawingTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    setIsDrawing(true);
    setCurrentStroke({
      points: [{ x, y }],
      color: theme.palette.primary.main,
      width: 3,
    });
  };

  const drawTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStroke || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    setCurrentStroke(prev => ({
      ...prev!,
      points: [...prev!.points, { x, y }],
    }));
  };

  const endDrawingTouch = () => {
    endDrawing();
  };

  const handleUndo = () => {
    setStrokes(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setStrokes([]);
    setCurrentStroke(null);
  };

  const handlePracticeModeChange = () => {
    setPracticeMode(prev => prev === 'practice' ? 'free' : 'practice');
    handleClear();
  };

  const handleKanjiChange = (newKanji: string) => {
    setCurrentKanji(newKanji);
    handleClear();
    setVerificationResult(null);
  };

  const handleVerify = () => {
    // TODO: Implement kanji stroke verification
    // For now, just show a placeholder message
    setVerificationResult({
      isCorrect: true,
      message: 'Great job! Keep practicing!',
      accuracy: 0.95,
    });

    // Update progress
    updateWordProgress(currentKanji, {
      lastReviewed: Date.now(),
      reviewCount: 1,
      nextReviewDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
      category: 'kanji',
      section: 'writing',
      difficulty,
      lastAnswerCorrect: true,
      correctAnswers: 1,
      incorrectAnswers: 0,
    });
  };

  const handleLevelChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedLevel(event.target.value as string);
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
                <Tooltip title="Listen to Reading">
                  <IconButton onClick={() => playAudio(currentKanji)}>
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
                    {currentKanji}
                  </Typography>
                </Box>
              )}
            </Box>

            <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center' }}>
              <Tooltip title="Undo Last Stroke">
                <IconButton onClick={handleUndo} disabled={strokes.length === 0}>
                  <UndoIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Clear Canvas">
                <IconButton onClick={handleClear} disabled={strokes.length === 0}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Verify Writing">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleVerify}
                  disabled={strokes.length === 0}
                  startIcon={<CheckIcon />}
                >
                  Verify
                </Button>
              </Tooltip>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth>
                <InputLabel>JLPT Level</InputLabel>
                <Select
                  value={selectedLevel}
                  onChange={handleLevelChange}
                  label="JLPT Level"
                >
                  <MenuItem value="all">All Levels</MenuItem>
                  <MenuItem value="N5">N5</MenuItem>
                  <MenuItem value="N4">N4</MenuItem>
                  <MenuItem value="N3">N3</MenuItem>
                  <MenuItem value="N2">N2</MenuItem>
                  <MenuItem value="N1">N1</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Available Kanji:
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 1,
                maxHeight: '400px',
                overflowY: 'auto',
                p: 1,
                border: 1,
                borderColor: 'divider',
                borderRadius: 1
              }}>
                {availableKanji.map((kanji) => (
                  <Button
                    key={kanji}
                    variant={currentKanji === kanji ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => handleKanjiChange(kanji)}
                    sx={{ minWidth: '40px' }}
                  >
                    {kanji}
                  </Button>
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default KanjiPractice; 