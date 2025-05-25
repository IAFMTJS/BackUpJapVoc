import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Stack, LinearProgress, Chip, Alert } from '@mui/material';
import { DictionaryItem } from '../types/dictionary';
import { useProgress } from '../context/ProgressContext';
import { useSettings } from '../context/SettingsContext';

interface SpacedRepetitionProps {
  open: boolean;
  item: DictionaryItem;
  onClose: () => void;
}

interface ReviewSchedule {
  nextReview: Date;
  interval: number; // in days
  easeFactor: number;
  repetitions: number;
  lastReview: Date | null;
}

const SpacedRepetition: React.FC<SpacedRepetitionProps> = ({ open, item, onClose }) => {
  const { updateProgress } = useProgress();
  const { settings } = useSettings();
  const [schedule, setSchedule] = useState<ReviewSchedule>({
    nextReview: new Date(),
    interval: 1,
    easeFactor: 2.5,
    repetitions: 0,
    lastReview: null
  });
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  useEffect(() => {
    // Load existing schedule from progress
    const loadSchedule = async () => {
      const progress = await updateProgress(item);
      if (progress?.spacedRepetition) {
        setSchedule(progress.spacedRepetition);
      }
    };
    loadSchedule();
  }, [item]);

  const calculateNextReview = (quality: number) => {
    // SuperMemo 2 algorithm
    let { interval, easeFactor, repetitions } = schedule;
    
    if (quality >= 3) { // Successful recall
      repetitions += 1;
      if (repetitions === 1) {
        interval = 1;
      } else if (repetitions === 2) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
    } else { // Failed recall
      repetitions = 0;
      interval = 1;
    }

    // Update ease factor
    easeFactor = Math.max(1.3, easeFactor + (0.1 - (3 - quality) * (0.08 + (3 - quality) * 0.02)));

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    return {
      nextReview,
      interval,
      easeFactor,
      repetitions,
      lastReview: new Date()
    };
  };

  const handleQualityRating = async (quality: number) => {
    const newSchedule = calculateNextReview(quality);
    setSchedule(newSchedule);
    setFeedback(quality >= 3 ? 'correct' : 'incorrect');

    // Update progress
    await updateProgress(item, {
      spacedRepetition: newSchedule,
      lastReviewed: new Date(),
      mastery: quality >= 3 ? 'learning' : 'notStarted'
    });

    // Show feedback for 1.5 seconds
    setTimeout(() => {
      setFeedback(null);
      setShowAnswer(false);
      setUserAnswer('');
      onClose();
    }, 1500);
  };

  const renderReviewCard = () => {
    const isKanji = 'character' in item;
    const question = isKanji ? item.character : item.japanese;
    const answer = isKanji ? item.meaning : item.english;

    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h3" sx={{ fontFamily: 'Noto Sans JP, sans-serif', mb: 2 }}>
          {question}
        </Typography>
        
        {showAnswer ? (
          <Stack spacing={2}>
            <Typography variant="h6" color="text.secondary">
              {answer}
            </Typography>
            {isKanji && (
              <Typography variant="body1" color="text.secondary">
                Reading: {item.reading}
              </Typography>
            )}
            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleQualityRating(0)}
                disabled={feedback !== null}
              >
                Hard
              </Button>
              <Button
                variant="outlined"
                color="warning"
                onClick={() => handleQualityRating(2)}
                disabled={feedback !== null}
              >
                Good
              </Button>
              <Button
                variant="outlined"
                color="success"
                onClick={() => handleQualityRating(4)}
                disabled={feedback !== null}
              >
                Easy
              </Button>
            </Stack>
          </Stack>
        ) : (
          <Button
            variant="contained"
            onClick={() => setShowAnswer(true)}
            sx={{ mt: 2 }}
          >
            Show Answer
          </Button>
        )}

        {feedback && (
          <Alert
            severity={feedback === 'correct' ? 'success' : 'error'}
            sx={{ mt: 2 }}
          >
            {feedback === 'correct' ? 'Correct!' : 'Try again next time!'}
          </Alert>
        )}
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
        Spaced Repetition Review
        <Typography variant="subtitle2" color="text.secondary">
          {schedule.lastReview ? `Last reviewed: ${schedule.lastReview.toLocaleDateString()}` : 'First review'}
        </Typography>
      </DialogTitle>
      <DialogContent>
        {renderReviewCard()}
        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle2" gutterBottom>
            Progress
          </Typography>
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Repetitions:
              </Typography>
              <Chip label={schedule.repetitions} size="small" />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Next Review:
              </Typography>
              <Chip
                label={schedule.nextReview.toLocaleDateString()}
                size="small"
                color={schedule.nextReview <= new Date() ? 'error' : 'default'}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Ease Factor:
              </Typography>
              <Chip
                label={schedule.easeFactor.toFixed(2)}
                size="small"
                color={schedule.easeFactor >= 2.5 ? 'success' : 'warning'}
              />
            </Box>
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SpacedRepetition; 