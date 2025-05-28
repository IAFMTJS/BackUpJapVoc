import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useProgress } from '../context/ProgressContext';
import { useWordLevel } from '../context/WordLevelContext';
import { Box, Typography, Button, Card, CardContent, LinearProgress, Chip, Stack, TextField } from '@mui/material';
import { JapaneseWord } from '../types';
import { useSound } from '../context/SoundContext';
import { allWords } from '../data/japaneseWords';
import { useDatabase } from '../context/DatabaseContext';

interface SRSItem {
  word: JapaneseWord;
  level: number; // 0-5, where 5 is mastered
  nextReview: Date;
  lastReview: Date;
  correctCount: number;
  incorrectCount: number;
  lastAnswer?: string; // Store the last answer for reference
  notes?: string; // Allow users to add notes
}

interface SRSManagerProps {
  onComplete?: () => void;
}

const SRSManager: React.FC<SRSManagerProps> = ({ onComplete }) => {
  const { isDarkMode, getThemeClasses } = useTheme();
  const themeClasses = getThemeClasses();
  const { settings } = useApp();
  const { progress, updateProgress } = useProgress();
  const { currentLevel, userProgress } = useWordLevel();
  const { playSound } = useSound();
  const db = useDatabase();
  
  const [currentItem, setCurrentItem] = useState<SRSItem | null>(null);
  const [reviewQueue, setReviewQueue] = useState<SRSItem[]>([]);
  const [isReviewing, setIsReviewing] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  // SRS intervals in hours
  const intervals = [1, 6, 24, 72, 168, 336]; // 1h, 6h, 1d, 3d, 1w, 2w

  const calculateNextReview = (currentLevel: number, lastReview: Date): Date => {
    const interval = intervals[Math.min(currentLevel, intervals.length - 1)];
    const nextReview = new Date(lastReview);
    nextReview.setHours(nextReview.getHours() + interval);
    return nextReview;
  };

  // Load review queue from IndexedDB
  const loadReviewQueue = useCallback(async () => {
    if (!db) return;
    
    try {
      const transaction = db.transaction(['srsItems'], 'readonly');
      const store = transaction.objectStore('srsItems');
      const index = store.index('nextReview');
      const now = new Date();
      
      const request = index.openCursor(IDBKeyRange.upperBound(now));
      const items: SRSItem[] = [];
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const item = cursor.value as SRSItem;
          if (item.word.level <= currentLevel) {
            items.push(item);
          }
          cursor.continue();
        } else {
          setReviewQueue(items);
        }
      };

      request.onerror = (event) => {
        console.error('Error loading review queue:', event);
        // Handle error appropriately
      };
    } catch (error) {
      console.error('Failed to load review queue:', error);
      // Handle error appropriately
    }
  }, [db, currentLevel]);

  useEffect(() => {
    loadReviewQueue();
  }, [loadReviewQueue]);

  // Add mastered words to SRS if not present
  useEffect(() => {
    if (!db || !userProgress) return;

    const addMasteredWords = async () => {
      try {
        const transaction = db.transaction(['srsItems'], 'readwrite');
        const store = transaction.objectStore('srsItems');
        const index = store.index('wordId');

        for (const word of allWords) {
          const progress = userProgress.wordProgress[word.japanese];
          if (progress?.mastered) {
            try {
              // Check if already in SRS
              const existingItem = await new Promise<SRSItem | undefined>((resolve, reject) => {
                const request = index.get(word.japanese);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
              });

              if (!existingItem) {
                // Not in SRS, add as mastered
                const now = new Date();
                const srsItem: SRSItem = {
                  id: `${word.japanese}-${Date.now()}`,
                  word,
                  level: 5,
                  nextReview: now,
                  lastReview: now,
                  correctCount: progress.correctAttempts,
                  incorrectCount: progress.incorrectAttempts,
                  lastAnswer: '',
                  notes: ''
                };
                await store.put(srsItem);
              }
            } catch (error) {
              console.error(`Error processing word ${word.japanese}:`, error);
              // Continue with next word even if this one fails
            }
          }
        }
      } catch (error) {
        console.error('Failed to add mastered words to SRS:', error);
        // Handle error appropriately
      }
    };

    addMasteredWords();
  }, [db, userProgress]);

  const handleStartReview = () => {
    if (reviewQueue.length > 0) {
      setCurrentItem(reviewQueue[0]);
      setIsReviewing(true);
      setShowAnswer(false);
      setUserAnswer('');
      setInputError(null);
      setNotes('');
      playSound('click');
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

  const handleAnswer = async (isCorrect: boolean) => {
    if (!currentItem || !db) return;

    try {
      const newLevel = isCorrect 
        ? Math.min(currentItem.level + 1, 5)
        : Math.max(currentItem.level - 1, 0);

      const updatedItem: SRSItem = {
        ...currentItem,
        level: newLevel,
        lastReview: new Date(),
        nextReview: calculateNextReview(newLevel, new Date()),
        correctCount: currentItem.correctCount + (isCorrect ? 1 : 0),
        incorrectCount: currentItem.incorrectCount + (isCorrect ? 0 : 1),
        lastAnswer: userAnswer,
        notes: notes
      };

      // Update IndexedDB
      const transaction = db.transaction(['srsItems'], 'readwrite');
      const store = transaction.objectStore('srsItems');
      await store.put(updatedItem);

      // Update progress
      updateProgress('srs', currentItem.word.japanese, isCorrect);
      playSound(isCorrect ? 'correct' : 'incorrect');

      // Move to next item or complete review
      const remainingItems = reviewQueue.slice(1);
      setReviewQueue(remainingItems);
      
      if (remainingItems.length > 0) {
        setCurrentItem(remainingItems[0]);
        setShowAnswer(false);
        setUserAnswer('');
        setInputError(null);
        setNotes('');
      } else {
        setIsReviewing(false);
        setCurrentItem(null);
        playSound('complete');
        if (onComplete) onComplete();
      }
    } catch (error) {
      console.error('Failed to update SRS item:', error);
      // Handle error appropriately
    }
  };

  const handleCheckAnswer = () => {
    if (!currentItem) return;
    
    const isValid = validateAnswer(userAnswer, currentItem.word.romaji);
    if (!isValid) {
      setInputError('Try again! Remember to check your spelling and spaces.');
      playSound('incorrect');
      return;
    }
    
    setShowAnswer(true);
    playSound('correct');
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

      {!isReviewing ? (
        <Box className={`text-center ${isDarkMode ? 'bg-gray-900 border border-gray-700 rounded-lg p-4' : ''}`}>
          <Typography variant="h6" className={`mb-4 ${isDarkMode ? 'text-blue-200' : 'text-gray-600'}`}>
            {reviewQueue.length} items due for review
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            onClick={handleStartReview}
            disabled={reviewQueue.length === 0}
            style={isDarkMode ? { background: '#1976d2', color: '#fff' } : {}}
          >
            Start Review
          </Button>
        </Box>
      ) : (
        renderReviewCard()
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