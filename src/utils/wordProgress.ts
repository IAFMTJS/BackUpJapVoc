import { openDB } from 'idb';
import { DictionaryItem, WordProgress, LevelProgress } from '../types/dictionary';

const MASTERY_LEVELS = {
  NOT_STARTED: 0,
  LEARNING: 1,
  FAMILIAR: 2,
  COMFORTABLE: 3,
  MASTERED: 4,
  EXPERT: 5
};

const REVIEW_INTERVALS = {
  [MASTERY_LEVELS.NOT_STARTED]: 0, // No review needed
  [MASTERY_LEVELS.LEARNING]: 1, // 1 day
  [MASTERY_LEVELS.FAMILIAR]: 3, // 3 days
  [MASTERY_LEVELS.COMFORTABLE]: 7, // 1 week
  [MASTERY_LEVELS.MASTERED]: 14, // 2 weeks
  [MASTERY_LEVELS.EXPERT]: 30 // 1 month
};

export async function updateWordProgress(
  wordId: string,
  isCorrect: boolean,
  masteryLevel?: number
): Promise<WordProgress> {
  const db = await openDB('DictionaryDB', 2);
  const tx = db.transaction(['words', 'wordProgress'], 'readwrite');
  
  // Get current word and progress
  const word = await tx.objectStore('words').get(wordId);
  const progressStore = tx.objectStore('wordProgress');
  let progress = await progressStore.get(wordId);
  
  const now = new Date();
  
  if (!progress) {
    // Initialize new progress
    progress = {
      wordId,
      masteryLevel: MASTERY_LEVELS.NOT_STARTED,
      lastReviewed: now,
      reviewCount: 0,
      correctAttempts: 0,
      incorrectAttempts: 0,
      streak: 0,
      nextReviewDate: now
    };
  }

  // Update progress
  progress.lastReviewed = now;
  progress.reviewCount++;
  
  if (isCorrect) {
    progress.correctAttempts++;
    progress.streak++;
    
    // Increase mastery level if specified or based on streak
    if (masteryLevel !== undefined) {
      progress.masteryLevel = masteryLevel;
    } else if (progress.streak >= 3 && progress.masteryLevel < MASTERY_LEVELS.EXPERT) {
      progress.masteryLevel++;
    }
  } else {
    progress.incorrectAttempts++;
    progress.streak = 0;
    
    // Decrease mastery level on incorrect attempts
    if (progress.masteryLevel > MASTERY_LEVELS.NOT_STARTED) {
      progress.masteryLevel--;
    }
  }

  // Calculate next review date
  const interval = REVIEW_INTERVALS[progress.masteryLevel];
  progress.nextReviewDate = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);

  // Update word's learning status
  if (word) {
    word.learningStatus = {
      isLearned: progress.masteryLevel >= MASTERY_LEVELS.COMFORTABLE,
      lastReviewed: now,
      reviewCount: progress.reviewCount,
      correctAttempts: progress.correctAttempts,
      incorrectAttempts: progress.incorrectAttempts,
      masteryLevel: progress.masteryLevel
    };
    await tx.objectStore('words').put(word);
  }

  // Save progress
  await progressStore.put(progress);
  await tx.done;

  return progress;
}

export async function getLevelProgress(level: number): Promise<LevelProgress> {
  const db = await openDB('DictionaryDB', 1);
  const tx = db.transaction(['words'], 'readonly');
  const store = tx.objectStore('words');
  const index = store.index('by-level');
  
  const words = await index.getAll(level);
  const now = new Date();
  
  const progress: LevelProgress = {
    level,
    totalWords: words.length,
    learnedWords: 0,
    masteredWords: 0,
    averageMastery: 0,
    lastUpdated: now
  };

  if (words.length > 0) {
    let totalMastery = 0;
    
    words.forEach(word => {
      const mastery = word.learningStatus?.masteryLevel || MASTERY_LEVELS.NOT_STARTED;
      totalMastery += mastery;
      
      if (mastery >= MASTERY_LEVELS.COMFORTABLE) {
        progress.learnedWords++;
      }
      if (mastery >= MASTERY_LEVELS.MASTERED) {
        progress.masteredWords++;
      }
    });
    
    progress.averageMastery = totalMastery / words.length;
  }

  return progress;
}

export async function getWordsForReview(level?: number): Promise<DictionaryItem[]> {
  const db = await openDB('DictionaryDB', 2);
  const tx = db.transaction(['words', 'wordProgress'], 'readonly');
  const wordStore = tx.objectStore('words');
  const progressStore = tx.objectStore('wordProgress');
  
  const now = new Date();
  const words: DictionaryItem[] = [];
  
  // Get all words or filter by level
  const wordCursor = level !== undefined
    ? wordStore.index('by-level').openCursor(level)
    : wordStore.openCursor();
  
  while (wordCursor) {
    const word = await wordCursor.value;
    const progress = await progressStore.get(word.id);
    
    if (progress && progress.nextReviewDate <= now) {
      words.push(word);
    }
    
    const cursor = await wordCursor.continue();
    if (!cursor) break;
  }
  
  return words;
}

export { MASTERY_LEVELS, REVIEW_INTERVALS }; 