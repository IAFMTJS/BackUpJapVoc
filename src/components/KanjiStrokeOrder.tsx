import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Stack, IconButton, Slider, Paper } from '@mui/material';
import { PlayArrow, Pause, SkipNext, SkipPrevious, Speed, Replay } from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';

interface KanjiStrokeOrderProps {
  open: boolean;
  kanji: string;
  onClose: () => void;
}

interface Stroke {
  path: string;
  order: number;
}

const KanjiStrokeOrder: React.FC<KanjiStrokeOrderProps> = ({ open, kanji, onClose }) => {
  const { theme } = useTheme();
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStrokeData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch stroke data from KanjiVG API
        const response = await fetch(`https://kanjivg.tagaini.net/kanji/${encodeURIComponent(kanji)}.svg`);
        if (!response.ok) {
          throw new Error('Failed to fetch stroke data');
        }
        
        const svgText = await response.text();
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
        
        // Extract stroke paths and their order
        const strokeElements = svgDoc.querySelectorAll('path[data-stroke]');
        const strokeData: Stroke[] = Array.from(strokeElements).map((element, index) => ({
          path: element.getAttribute('d') || '',
          order: parseInt(element.getAttribute('data-stroke') || `${index + 1}`)
        }));

        setStrokes(strokeData.sort((a, b) => a.order - b.order));
        setCurrentStroke(0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stroke data');
      } finally {
        setIsLoading(false);
      }
    };

    if (open && kanji) {
      fetchStrokeData();
    }
  }, [open, kanji]);

  useEffect(() => {
    let animationInterval: NodeJS.Timeout;
    
    if (isPlaying && currentStroke < strokes.length) {
      animationInterval = setInterval(() => {
        setCurrentStroke(prev => {
          if (prev >= strokes.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000 / speed);
    }

    return () => {
      if (animationInterval) {
        clearInterval(animationInterval);
      }
    };
  }, [isPlaying, currentStroke, strokes.length, speed]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setCurrentStroke(prev => Math.min(prev + 1, strokes.length - 1));
    setIsPlaying(false);
  };

  const handlePrevious = () => {
    setCurrentStroke(prev => Math.max(prev - 1, 0));
    setIsPlaying(false);
  };

  const handleReset = () => {
    setCurrentStroke(0);
    setIsPlaying(false);
  };

  const handleSpeedChange = (_: Event, newValue: number | number[]) => {
    setSpeed(newValue as number);
  };

  const renderStrokeAnimation = () => {
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <Typography>Loading stroke data...</Typography>
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ position: 'relative', width: '100%', height: 200 }}>
        <svg
          viewBox="0 0 109 109"
          style={{
            width: '100%',
            height: '100%',
            stroke: theme.palette.primary.main,
            strokeWidth: 3,
            fill: 'none'
          }}
        >
          {strokes.slice(0, currentStroke + 1).map((stroke, index) => (
            <path
              key={index}
              d={stroke.path}
              style={{
                stroke: index === currentStroke ? theme.palette.primary.main : theme.palette.text.primary,
                strokeWidth: index === currentStroke ? 3 : 2,
                fill: 'none',
                transition: 'stroke 0.3s ease'
              }}
            />
          ))}
        </svg>
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="h4" sx={{ fontFamily: 'Noto Sans JP, sans-serif' }}>
            {kanji}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Stroke Order
          </Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Paper
          elevation={3}
          sx={{
            p: 2,
            mb: 2,
            bgcolor: theme.palette.background.paper,
            borderRadius: 2
          }}
        >
          {renderStrokeAnimation()}
        </Paper>

        <Stack spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={handlePrevious} disabled={currentStroke === 0}>
              <SkipPrevious />
            </IconButton>
            <IconButton onClick={handlePlayPause}>
              {isPlaying ? <Pause /> : <PlayArrow />}
            </IconButton>
            <IconButton onClick={handleNext} disabled={currentStroke === strokes.length - 1}>
              <SkipNext />
            </IconButton>
            <IconButton onClick={handleReset}>
              <Replay />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Speed sx={{ color: 'text.secondary' }} />
            <Slider
              value={speed}
              onChange={handleSpeedChange}
              min={0.5}
              max={2}
              step={0.1}
              marks={[
                { value: 0.5, label: '0.5x' },
                { value: 1, label: '1x' },
                { value: 2, label: '2x' }
              ]}
              sx={{ flex: 1 }}
            />
          </Box>

          <Typography variant="body2" color="text.secondary" align="center">
            Stroke {currentStroke + 1} of {strokes.length}
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default KanjiStrokeOrder; 