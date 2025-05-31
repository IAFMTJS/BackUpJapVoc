import { WordStats } from '../types/quiz';

/**
 * Calculate mastery level based on word statistics
 * @param correctAnswers Number of correct answers
 * @param incorrectAnswers Number of incorrect answers
 * @param timeSpent Time spent in seconds
 * @returns Mastery level between 0 and 1
 */
export const calculateMastery = (
  correctAnswers: number,
  incorrectAnswers: number,
  timeSpent: number
): number => {
  // Base mastery on correct/incorrect ratio
  const totalAttempts = correctAnswers + incorrectAnswers;
  if (totalAttempts === 0) return 0;

  // Calculate accuracy (0-1)
  const accuracy = correctAnswers / totalAttempts;

  // Factor in time spent (normalized to 30 seconds per question)
  const averageTimePerQuestion = timeSpent / totalAttempts;
  const timeFactor = Math.max(0, 1 - (averageTimePerQuestion / 30));

  // Weight accuracy more heavily than time factor
  const mastery = (accuracy * 0.7) + (timeFactor * 0.3);

  return Math.min(1, Math.max(0, mastery));
};

/**
 * Calculate next review date based on spaced repetition intervals
 * @param wordStats Current word statistics
 * @param isCorrect Whether the last attempt was correct
 * @returns Next review date
 */
export const calculateNextReview = (
  wordStats: WordStats,
  isCorrect: boolean
): Date => {
  const now = new Date();
  const intervals = [1, 3, 7, 14, 30, 90, 180]; // Days
  const currentInterval = intervals[Math.min(wordStats.reviewCount, intervals.length - 1)];
  
  // If incorrect, reduce the interval
  const adjustedInterval = isCorrect ? currentInterval : Math.max(1, Math.floor(currentInterval / 2));
  
  const nextReview = new Date(now);
  nextReview.setDate(now.getDate() + adjustedInterval);
  
  return nextReview;
};

/**
 * Update word statistics after a quiz attempt
 * @param currentStats Current word statistics
 * @param isCorrect Whether the attempt was correct
 * @param timeSpent Time spent on the question in seconds
 * @returns Updated word statistics
 */
export const updateWordStats = (
  currentStats: WordStats,
  isCorrect: boolean,
  timeSpent: number
): WordStats => {
  const now = new Date();
  const nextReview = calculateNextReview(currentStats, isCorrect);
  
  return {
    ...currentStats,
    attempts: currentStats.attempts + 1,
    correct: isCorrect ? currentStats.correct + 1 : currentStats.correct,
    lastAttempt: now,
    lastSeen: now,
    nextReview,
    reviewCount: isCorrect ? currentStats.reviewCount + 1 : currentStats.reviewCount,
    correctAnswers: isCorrect ? currentStats.correctAnswers + 1 : currentStats.correctAnswers,
    incorrectAnswers: isCorrect ? currentStats.incorrectAnswers : currentStats.incorrectAnswers + 1,
    difficulty: calculateMastery(
      currentStats.correctAnswers + (isCorrect ? 1 : 0),
      currentStats.incorrectAnswers + (isCorrect ? 0 : 1),
      timeSpent
    )
  };
};

/**
 * Check if a word is due for review
 * @param wordStats Word statistics
 * @returns Whether the word is due for review
 */
export const isDueForReview = (wordStats: WordStats): boolean => {
  if (!wordStats.nextReview) return true;
  return new Date() >= wordStats.nextReview;
};

/**
 * Calculate overall progress percentage
 * @param wordStats Array of word statistics
 * @returns Progress percentage (0-100)
 */
export const calculateOverallProgress = (wordStats: WordStats[]): number => {
  if (wordStats.length === 0) return 0;
  
  const totalMastery = wordStats.reduce((sum, stats) => sum + stats.difficulty, 0);
  return (totalMastery / wordStats.length) * 100;
}; 