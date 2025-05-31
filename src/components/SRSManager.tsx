import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useProgress } from '../context/ProgressContext';
import { useWordLevel } from '../context/WordLevelContext';
import { Box, Typography, Button, Card, CardContent, LinearProgress, Chip, Stack, TextField } from '@mui/material';
import { JapaneseWord } from '../data/types';
import { useDatabase } from '../context/DatabaseContext';

interface SRSItem {
  word: JapaneseWord;
  level: number; // 0-5, where 5 is mastered
  nextReview: Date;
  lastReview: Date;
  correctCount: number;
  incorrectCount: number;
  lastAnswer?: string;
  notes?: string;
}

interface SRSManagerProps {
  onComplete?: () => void;
}

const SRSManager: React.FC<SRSManagerProps> = ({ onComplete }) => {
  const { isDarkMode, getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  const { settings } = useApp();
  const { progress, updateProgress } = useProgress();
  const { getWordsForCurrentLevel, getWordsByCategory, getWordsByJLPTLevel, updateWordProgress } = useWordLevel();
  const db = useDatabase();
  
  const [srsItems, setSRSItems] = useState<SRSItem[]>([]);
  const [currentItem, setCurrentItem] = useState<SRSItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  // SRS intervals in hours
  const intervals = [1, 6, 24, 72, 168, 336]; // 1h, 6h, 1d, 3d, 1w, 2w

  // Load SRS items from the current level
  const loadSRSItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const words = getWordsForCurrentLevel();
      const items = words.map(word => ({
        word,
        level: 0,
        nextReview: new Date(),
        lastReview: new Date(),
        correctCount: 0,
        incorrectCount: 0
      }));
      setSRSItems(items);
      setCurrentItem(items[0] || null);
    } catch (error) {
      console.error('Error loading SRS items:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getWordsForCurrentLevel]);

  useEffect(() => {
    loadSRSItems();
  }, [loadSRSItems]);

  const handleAnswer = useCallback((isCorrect: boolean) => {
    if (!currentItem) return;

    // Update word progress in WordLevelContext
    updateWordProgress(currentItem.word.id, isCorrect);

    // Update SRS item
    setSRSItems(prev => prev.map(item => {
      if (item.word.id === currentItem.word.id) {
        const newLevel = isCorrect ? Math.min(item.level + 1, 5) : Math.max(item.level - 1, 0);
        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + (isCorrect ? Math.pow(2, newLevel) : 1));

        return {
          ...item,
          level: newLevel,
          nextReview,
          lastReview: new Date(),
          correctCount: isCorrect ? item.correctCount + 1 : item.correctCount,
          incorrectCount: isCorrect ? item.incorrectCount : item.incorrectCount + 1,
          lastAnswer: isCorrect ? 'correct' : 'incorrect'
        };
      }
      return item;
    }));

    // Move to next item
    const currentIndex = srsItems.findIndex(item => item.word.id === currentItem.word.id);
    const nextItem = srsItems[currentIndex + 1] || null;
    setCurrentItem(nextItem);
  }, [currentItem, srsItems, updateWordProgress]);

  const handleStartReview = () => {
    if (srsItems.length > 0) {
      setCurrentItem(srsItems[0]);
      setShowAnswer(false);
      setUserAnswer('');
      setInputError(null);
      setNotes('');
    }
  };

  const validateAnswer = (answer: string, correctAnswer: string): boolean => {
    // Normalize both answers (remove spaces, convert to lowercase)
    const normalizedAnswer = answer.trim().toLowerCase();
    const normalizedCorrect = correctAnswer.trim().toLowerCase();
    
    // Check for exact match
    if (normalizedAnswer === normalizedCorrect) return true;
    
    // Check for romaji match if enabled
    if (settings.showRomaji && currentItem?.word.romaji) {
      const normalizedRomaji = currentItem.word.romaji.trim().toLowerCase();
      if (normalizedAnswer === normalizedRomaji) return true;
    }
    
    return false;
  };

  const handleCheckAnswer = () => {
    if (!currentItem) return;
    
    const isValid = validateAnswer(userAnswer, currentItem.word.romaji);
    if (!isValid) {
      setInputError('Try again! Remember to check your spelling and spaces.');
      return;
    }
    
    setShowAnswer(true);
  };

  const renderReviewCard = () => {
    if (!currentItem) return null;

    return (
      <Card className={`mb-4 ${isDarkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'}`}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h5" component="div" className={isDarkMode ? 'text-white' : 'text-gray-900'}>
              {currentItem.word.japanese}
            </Typography>
            
            {showAnswer && (
              <>
                <Typography variant="body1" className={isDarkMode ? 'text-blue-200' : 'text-gray-600'}>
                  Romaji: {currentItem.word.romaji}
                </Typography>
                <Typography variant="body1" className={isDarkMode ? 'text-green-200' : 'text-gray-600'}>
                  English: {currentItem.word.english}
                </Typography>
                <TextField
                  multiline
                  rows={2}
                  label="Notes (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  InputLabelProps={{ style: isDarkMode ? { color: '#bbb' } : {} }}
                  InputProps={{
                    style: isDarkMode ? { color: '#fff', background: '#222' } : {},
                  }}
                />
              </>
            )}

            {!showAnswer && (
              <Box>
                <TextField
                  fullWidth
                  value={userAnswer}
                  onChange={(e) => {
                    setUserAnswer(e.target.value);
                    setInputError(null);
                  }}
                  error={!!inputError}
                  helperText={inputError}
                  placeholder="Type your answer..."
                  InputLabelProps={{ style: isDarkMode ? { color: '#bbb' } : {} }}
                  InputProps={{
                    style: isDarkMode ? { color: '#fff', background: '#222' } : {},
                  }}
                  className={isDarkMode ? '' : 'bg-white text-gray-900'}
                />
              </Box>
            )}

            <Box className="flex gap-2">
              {!showAnswer ? (
                <Button 
                  variant="contained" 
                  onClick={handleCheckAnswer}
                  disabled={!userAnswer.trim()}
                  style={isDarkMode ? { background: '#1976d2', color: '#fff' } : {}}
                >
                  Check Answer
                </Button>
              ) : (
                <>
                  <Button 
                    variant="contained" 
                    color="error"
                    onClick={() => handleAnswer(false)}
                    style={isDarkMode ? { background: '#d32f2f', color: '#fff' } : {}}
                  >
                    Incorrect
                  </Button>
                  <Button 
                    variant="contained" 
                    color="success"
                    onClick={() => handleAnswer(true)}
                    style={isDarkMode ? { background: '#388e3c', color: '#fff' } : {}}
                  >
                    Correct
                  </Button>
                </>
              )}
            </Box>

            <Box className="mt-4">
              <Typography variant="body2" className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                Progress: {currentItem.level}/5
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(currentItem.level / 5) * 100} 
                className="mt-1"
                sx={isDarkMode ? { backgroundColor: '#333', '& .MuiLinearProgress-bar': { backgroundColor: '#90caf9' } } : {}}
              />
            </Box>
          </Stack>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box className="max-w-2xl mx-auto p-4">
      <Typography variant="h4" component="h1" className={`mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Spaced Repetition Review
      </Typography>

      {!isLoading ? (
        <>
          {!currentItem ? (
            <Box className={`text-center ${isDarkMode ? 'bg-gray-900 border border-gray-700 rounded-lg p-4' : ''}`}>
              <Typography variant="h6" className={`mb-4 ${isDarkMode ? 'text-blue-200' : 'text-gray-600'}`}>
                {srsItems.length} items due for review
              </Typography>
              <Button 
                variant="contained" 
                size="large"
                onClick={handleStartReview}
                disabled={srsItems.length === 0}
                style={isDarkMode ? { background: '#1976d2', color: '#fff' } : {}}
              >
                Start Review
              </Button>
            </Box>
          ) : (
            renderReviewCard()
          )}
        </>
      ) : (
        <Box className={`text-center ${isDarkMode ? 'bg-gray-900 border border-gray-700 rounded-lg p-4' : ''}`}>
          <Typography variant="h6" className={`mb-4 ${isDarkMode ? 'text-blue-200' : 'text-gray-600'}`}>
            Loading...
          </Typography>
        </Box>
      )}

      <Box className="mt-8">
        <Typography variant="h6" className={themeClasses.text.primary}>
          SRS Levels
        </Typography>
        <Stack spacing={1}>
          {intervals.map((interval, index) => (
            <Chip
              key={interval}
              label={`Level ${index + 1}: ${interval}h`}
              className={themeClasses.card}
              sx={{
                color: isDarkMode ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: isDarkMode ? 'var(--background-lighter)' : 'var(--background)',
                border: `1px solid ${isDarkMode ? 'var(--border-color)' : 'var(--border-color-light)'}`
              }}
            />
          ))}
        </Stack>
      </Box>
    </Box>
  );
};

export default SRSManager; 