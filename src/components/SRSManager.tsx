import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useProgress } from '../context/ProgressContext';
import { useWordLevel } from '../context/WordLevelContext';
import { Box, Typography, Button, Card, CardContent, LinearProgress, Chip, Stack, TextField, Alert } from '@mui/material';
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
  const { progress, updateWordProgress } = useProgress();
  const { getWordsForCurrentLevel, getWordsByCategory, getWordsByJLPTLevel, updateWordProgress: updateWordLevelProgress } = useWordLevel();
  const db = useDatabase();
  
  const [srsItems, setSRSItems] = useState<SRSItem[]>([]);
  const [currentItem, setCurrentItem] = useState<SRSItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [reviewCount, setReviewCount] = useState(0);

  // SRS intervals in hours - more conservative intervals for stability
  const intervals = [2, 12, 24, 72, 168, 336]; // 2h, 12h, 1d, 3d, 1w, 2w

  // Memoize SRS items to prevent unnecessary re-calculations
  const availableSRSItems = useMemo(() => {
    if (!progress || !progress.words) return [];
    
    const now = new Date();
    return Object.entries(progress.words)
      .filter(([_, wordProgress]) => {
        const nextReview = new Date(wordProgress.nextReviewDate);
        return nextReview <= now;
      })
      .map(([wordId, wordProgress]) => {
        // Find the word data
        const word = getWordsForCurrentLevel().find(w => w.id === wordId) || 
                    getWordsByCategory('all').find(w => w.id === wordId);
        
        if (!word) return null;
        
        return {
          word,
          level: wordProgress.masteryLevel || 0,
          nextReview: new Date(wordProgress.nextReviewDate),
          lastReview: new Date(wordProgress.lastReviewed),
          correctCount: wordProgress.correctAnswers || 0,
          incorrectCount: wordProgress.incorrectAnswers || 0,
          lastAnswer: wordProgress.lastAnswerCorrect ? 'correct' : 'incorrect',
          notes: wordProgress.notes
        };
      })
      .filter(Boolean) as SRSItem[];
  }, [progress, getWordsForCurrentLevel, getWordsByCategory]);

  // Load SRS items
  const loadSRSItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (availableSRSItems.length === 0) {
        setSRSItems([]);
        setCurrentItem(null);
        return;
      }

      // Shuffle items for better learning experience
      const shuffledItems = [...availableSRSItems].sort(() => Math.random() - 0.5);
      setSRSItems(shuffledItems);
      setCurrentItem(shuffledItems[0] || null);
    } catch (error) {
      console.error('Error loading SRS items:', error);
      setError('Failed to load review items. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [availableSRSItems]);

  useEffect(() => {
    loadSRSItems();
  }, [loadSRSItems]);

  const handleAnswer = useCallback(async (isCorrect: boolean) => {
    if (!currentItem) return;

    try {
      // Update word progress in both contexts
      const newMasteryLevel = isCorrect 
        ? Math.min(currentItem.level + 1, 5) 
        : Math.max(currentItem.level - 1, 0);

      const nextReview = new Date();
      const intervalHours = intervals[Math.min(newMasteryLevel, intervals.length - 1)];
      nextReview.setHours(nextReview.getHours() + intervalHours);

      // Update in ProgressContext
      await updateWordProgress(currentItem.word.id, {
        masteryLevel: newMasteryLevel,
        nextReviewDate: nextReview.getTime(),
        lastReviewed: Date.now(),
        correctAnswers: isCorrect ? currentItem.correctCount + 1 : currentItem.correctCount,
        incorrectAnswers: isCorrect ? currentItem.incorrectCount : currentItem.incorrectCount + 1,
        lastAnswerCorrect: isCorrect,
        consecutiveCorrect: isCorrect ? (currentItem.correctCount || 0) + 1 : 0
      });

      // Update in WordLevelContext
      updateWordLevelProgress(currentItem.word.id, isCorrect);

      // Update SRS items
      setSRSItems(prev => prev.map(item => {
        if (item.word.id === currentItem.word.id) {
          return {
            ...item,
            level: newMasteryLevel,
            nextReview,
            lastReview: new Date(),
            correctCount: isCorrect ? item.correctCount + 1 : item.correctCount,
            incorrectCount: isCorrect ? item.incorrectCount : item.incorrectCount + 1,
            lastAnswer: isCorrect ? 'correct' : 'incorrect'
          };
        }
        return item;
      }));

      setReviewCount(prev => prev + 1);

      // Move to next item
      const currentIndex = srsItems.findIndex(item => item.word.id === currentItem.word.id);
      const nextItem = srsItems[currentIndex + 1] || null;
      setCurrentItem(nextItem);
      setShowAnswer(false);
      setUserAnswer('');
      setInputError(null);
      setNotes('');

    } catch (error) {
      console.error('Error updating SRS item:', error);
      setError('Failed to update progress. Please try again.');
    }
  }, [currentItem, srsItems, intervals, updateWordProgress, updateWordLevelProgress]);

  const handleStartReview = () => {
    if (srsItems.length > 0) {
      setCurrentItem(srsItems[0]);
      setShowAnswer(false);
      setUserAnswer('');
      setInputError(null);
      setNotes('');
      setReviewCount(0);
    }
  };

  // Get recently reviewed words (last 10)
  const recentlyReviewed = useMemo(() => {
    if (!progress || !progress.words) return [];
    return Object.entries(progress.words)
      .filter(([_, wordProgress]) => wordProgress.lastReviewed)
      .sort((a, b) => (b[1].lastReviewed || 0) - (a[1].lastReviewed || 0))
      .slice(0, 10)
      .map(([wordId, wordProgress]) => {
        const word = getWordsForCurrentLevel().find(w => w.id === wordId) || getWordsByCategory('all').find(w => w.id === wordId);
        return word ? { word, lastReviewed: wordProgress.lastReviewed, nextReview: wordProgress.nextReviewDate, masteryLevel: wordProgress.masteryLevel || 0 } : null;
      })
      .filter(Boolean);
  }, [progress, getWordsForCurrentLevel, getWordsByCategory]);

  // Get all known words for extra practice
  const allKnownWords = useMemo(() => {
    if (!progress || !progress.words) return [];
    return Object.entries(progress.words)
      .map(([wordId, wordProgress]) => {
        const word = getWordsForCurrentLevel().find(w => w.id === wordId) || getWordsByCategory('all').find(w => w.id === wordId);
        return word ? { word, masteryLevel: wordProgress.masteryLevel || 0 } : null;
      })
      .filter(Boolean);
  }, [progress, getWordsForCurrentLevel, getWordsByCategory]);

  // Stats
  const totalReviewed = Object.values(progress?.words || {}).filter(w => w.lastReviewed).length;
  const masteredCount = Object.values(progress?.words || {}).filter(w => (w.masteryLevel || 0) >= 5).length;

  // Extra Practice state
  const [extraPracticeWord, setExtraPracticeWord] = useState<any>(null);
  const [showExtraPractice, setShowExtraPractice] = useState(false);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography>Loading SRS items...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
        <Button onClick={loadSRSItems} sx={{ ml: 2 }}>
          Retry
        </Button>
      </Alert>
    );
  }

  if (availableSRSItems.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            No items due for review
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Great job! All your items are up to date. Check back later for more reviews.
          </Typography>

          {/* Stats Section */}
          <Box mt={2} mb={2}>
            <Typography variant="subtitle1">Stats</Typography>
            <Typography variant="body2">Total reviewed: {totalReviewed}</Typography>
            <Typography variant="body2">Mastered: {masteredCount}</Typography>
          </Box>

          {/* Recently Reviewed Words */}
          {recentlyReviewed.length > 0 && (
            <Box mt={2}>
              <Typography variant="subtitle1">Recently Reviewed</Typography>
              <ul style={{ paddingLeft: 16 }}>
                {recentlyReviewed.map((item: any, i: number) => (
                  <li key={i}>
                    <b>{item.word.japanese}</b> ({item.word.english}) - Level {item.masteryLevel} - Next review: {item.nextReview ? new Date(item.nextReview).toLocaleString() : 'N/A'}
                  </li>
                ))}
              </ul>
            </Box>
          )}

          {/* Extra Practice Button */}
          <Box mt={3}>
            <Button variant="outlined" onClick={() => setShowExtraPractice(true)}>
              Extra Practice
            </Button>
          </Box>

          {/* Extra Practice Modal/Section */}
          {showExtraPractice && (
            <Box mt={3}>
              <Typography variant="subtitle1">Select a word to practice:</Typography>
              <ul style={{ paddingLeft: 16 }}>
                {allKnownWords.map((item: any, i: number) => (
                  <li key={i}>
                    <Button size="small" onClick={() => setExtraPracticeWord(item.word)}>
                      {item.word.japanese} ({item.word.english})
                    </Button>
                  </li>
                ))}
              </ul>
              {extraPracticeWord && (
                <Box mt={2}>
                  <Typography variant="h6">Practice: {extraPracticeWord.japanese}</Typography>
                  <Typography variant="body2">{extraPracticeWord.english}</Typography>
                  <Button variant="contained" sx={{ mt: 1 }} onClick={() => setExtraPracticeWord(null)}>
                    Done
                  </Button>
                </Box>
              )}
              <Button sx={{ mt: 2 }} onClick={() => setShowExtraPractice(false)}>
                Close
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!currentItem) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            SRS Review Complete
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            You've reviewed {reviewCount} items.
          </Typography>
          <Button 
            variant="contained" 
            onClick={handleStartReview}
            sx={{ mt: 2 }}
          >
            Start New Review
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            SRS Review ({reviewCount + 1}/{srsItems.length})
          </Typography>
          <Chip 
            label={`Level ${currentItem.level}`} 
            color={currentItem.level >= 4 ? "success" : currentItem.level >= 2 ? "warning" : "default"}
          />
        </Box>

        <LinearProgress 
          variant="determinate" 
          value={((reviewCount + 1) / srsItems.length) * 100} 
          sx={{ mb: 2 }}
        />

        <Typography variant="h4" textAlign="center" gutterBottom>
          {currentItem.word.japanese}
        </Typography>

        {currentItem.word.hiragana && (
          <Typography variant="subtitle1" textAlign="center" color="text.secondary" gutterBottom>
            {currentItem.word.hiragana}
          </Typography>
        )}

        {showAnswer && (
          <Box mt={2} p={2} bgcolor="background.paper" borderRadius={1}>
            <Typography variant="h6" gutterBottom>
              Answer: {currentItem.word.english}
            </Typography>
            {currentItem.word.notes && (
              <Typography variant="body2" color="text.secondary">
                {currentItem.word.notes}
              </Typography>
            )}
          </Box>
        )}

        <Stack direction="row" spacing={2} mt={2}>
          <Button
            variant="outlined"
            onClick={() => setShowAnswer(!showAnswer)}
            fullWidth
          >
            {showAnswer ? 'Hide Answer' : 'Show Answer'}
          </Button>
        </Stack>

        <Stack direction="row" spacing={2} mt={2}>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleAnswer(false)}
            fullWidth
          >
            Incorrect
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => handleAnswer(true)}
            fullWidth
          >
            Correct
          </Button>
        </Stack>

        <TextField
          fullWidth
          multiline
          rows={2}
          placeholder="Add notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          sx={{ mt: 2 }}
        />
      </CardContent>
    </Card>
  );
};

export default SRSManager; 