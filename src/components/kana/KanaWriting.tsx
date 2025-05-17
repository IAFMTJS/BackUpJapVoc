import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Box, Typography, Paper, Button, Grid, Slider, IconButton } from '@mui/material';
import { Undo, Redo, Clear, PlayArrow, Pause } from '@mui/icons-material';
import { basicKana } from './BasicKana';
import { yōonKana } from './YōonKana';
import { dakuonKana } from './DakuonKana';

interface Stroke {
  points: { x: number; y: number }[];
  color: string;
}

interface KanaStrokeData {
  kana: string;
  strokes: Stroke[];
  gridSize: number;
}

const KanaWriting: React.FC = () => {
  const { isDarkMode } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentKana, setCurrentKana] = useState<KanaStrokeData | null>(null);
  const [currentStroke, setCurrentStroke] = useState<number>(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeHistory, setStrokeHistory] = useState<Stroke[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [gridSize, setGridSize] = useState(100);
  const [showGrid, setShowGrid] = useState(true);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = gridSize * 2;
    canvas.height = gridSize * 2;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid if enabled
    if (showGrid) {
      ctx.strokeStyle = isDarkMode ? '#4B5563' : '#E5E7EB';
      ctx.lineWidth = 0.5;
      
      // Draw vertical lines
      for (let i = 0; i <= gridSize * 2; i += gridSize / 4) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, gridSize * 2);
        ctx.stroke();
      }
      
      // Draw horizontal lines
      for (let i = 0; i <= gridSize * 2; i += gridSize / 4) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(gridSize * 2, i);
        ctx.stroke();
      }
    }
  }, [gridSize, showGrid, isDarkMode]);

  // Draw current strokes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentKana) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid if enabled
    if (showGrid) {
      ctx.strokeStyle = isDarkMode ? '#4B5563' : '#E5E7EB';
      ctx.lineWidth = 0.5;
      
      // Draw vertical lines
      for (let i = 0; i <= gridSize * 2; i += gridSize / 4) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, gridSize * 2);
        ctx.stroke();
      }
      
      // Draw horizontal lines
      for (let i = 0; i <= gridSize * 2; i += gridSize / 4) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(gridSize * 2, i);
        ctx.stroke();
      }
    }

    // Draw completed strokes
    for (let i = 0; i < currentStroke; i++) {
      const stroke = currentKana.strokes[i];
      if (!stroke) continue;

      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const points = stroke.points;
      ctx.moveTo(points[0].x, points[0].y);
      for (let j = 1; j < points.length; j++) {
        ctx.lineTo(points[j].x, points[j].y);
      }
      ctx.stroke();
    }

    // Draw current stroke
    if (isDrawing && currentKana.strokes[currentStroke]) {
      const stroke = currentKana.strokes[currentStroke];
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const points = stroke.points;
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
    }
  }, [currentKana, currentStroke, isDrawing, gridSize, showGrid, isDarkMode]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!currentKana || currentStroke >= currentKana.strokes.length) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setStrokeHistory(prev => [...prev.slice(0, historyIndex + 1), []]);
    setHistoryIndex(prev => prev + 1);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentKana) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setStrokeHistory(prev => {
      const newHistory = [...prev];
      newHistory[historyIndex] = [
        ...newHistory[historyIndex],
        { x, y, color: currentKana.strokes[currentStroke].color }
      ];
      return newHistory;
    });
  };

  const endDrawing = () => {
    if (!isDrawing || !currentKana) return;

    setIsDrawing(false);
    if (currentStroke < currentKana.strokes.length - 1) {
      setCurrentStroke(prev => prev + 1);
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setCurrentStroke(prev => Math.max(0, prev - 1));
    }
  };

  const redo = () => {
    if (historyIndex < strokeHistory.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setCurrentStroke(prev => Math.min(currentKana?.strokes.length || 0, prev + 1));
    }
  };

  const clear = () => {
    setCurrentStroke(0);
    setStrokeHistory([]);
    setHistoryIndex(-1);
  };

  const playStrokeAnimation = () => {
    if (!currentKana) return;

    setIsPlaying(true);
    let strokeIndex = 0;

    const animate = () => {
      if (strokeIndex >= currentKana.strokes.length) {
        setIsPlaying(false);
        return;
      }

      setCurrentStroke(strokeIndex);
      strokeIndex++;

      setTimeout(animate, 1000 / playbackSpeed);
    };

    animate();
  };

  const pauseAnimation = () => {
    setIsPlaying(false);
  };

  return (
    <Box>
      <Box className="mb-6">
        <Typography variant="h6" className={`mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Kana Writing Practice
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Paper className={`p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <Box className="relative">
                <canvas
                  ref={canvasRef}
                  className={`border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={endDrawing}
                  onMouseLeave={endDrawing}
                />
                <Box className="absolute top-4 right-4 flex space-x-2">
                  <IconButton onClick={undo} disabled={historyIndex <= 0}>
                    <Undo />
                  </IconButton>
                  <IconButton onClick={redo} disabled={historyIndex >= strokeHistory.length - 1}>
                    <Redo />
                  </IconButton>
                  <IconButton onClick={clear}>
                    <Clear />
                  </IconButton>
                  {isPlaying ? (
                    <IconButton onClick={pauseAnimation}>
                      <Pause />
                    </IconButton>
                  ) : (
                    <IconButton onClick={playStrokeAnimation}>
                      <PlayArrow />
                    </IconButton>
                  )}
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper className={`p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <Typography variant="subtitle1" className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                Controls
              </Typography>
              
              <Box className="mt-4 space-y-4">
                <Box>
                  <Typography variant="body2" className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Playback Speed
                  </Typography>
                  <Slider
                    value={playbackSpeed}
                    onChange={(_, value) => setPlaybackSpeed(value as number)}
                    min={0.5}
                    max={2}
                    step={0.1}
                    marks={[
                      { value: 0.5, label: '0.5x' },
                      { value: 1, label: '1x' },
                      { value: 2, label: '2x' }
                    ]}
                  />
                </Box>

                <Box>
                  <Typography variant="body2" className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Grid Size
                  </Typography>
                  <Slider
                    value={gridSize}
                    onChange={(_, value) => setGridSize(value as number)}
                    min={50}
                    max={200}
                    step={10}
                    marks={[
                      { value: 50, label: 'Small' },
                      { value: 100, label: 'Medium' },
                      { value: 200, label: 'Large' }
                    ]}
                  />
                </Box>

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => setShowGrid(!showGrid)}
                >
                  {showGrid ? 'Hide Grid' : 'Show Grid'}
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Box className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <Typography variant="body1" className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
            <strong>Writing Tips:</strong>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Follow the stroke order shown in the animation</li>
              <li>Pay attention to stroke direction and ending points</li>
              <li>Practice writing each character multiple times</li>
              <li>Use the grid to maintain proper proportions</li>
              <li>Try writing without looking at the animation</li>
            </ul>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default KanaWriting; 