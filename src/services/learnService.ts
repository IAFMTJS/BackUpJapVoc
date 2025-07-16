import { 
  db, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  Timestamp 
} from '../utils/firebase';
import type { UserProgress, LevelProgress, LevelResult } from '../types/learn';

export class LearnService {
  private static instance: LearnService;
  private guestProgressKey = 'guest_learn_progress';
  
  private constructor() {}
  
  public static getInstance(): LearnService {
    if (!LearnService.instance) {
      LearnService.instance = new LearnService();
    }
    return LearnService.instance;
  }

  // Get user progress from Firestore or localStorage
  async getUserProgress(userId?: string): Promise<UserProgress> {
    try {
      // If no userId provided, use guest progress from localStorage
      if (!userId) {
        return this.getGuestProgress();
      }

      const userProgressRef = doc(db, 'users', userId, 'learn', 'progress');
      const docSnap = await getDoc(userProgressRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as UserProgress;
      } else {
        // Initialize with default progress (only level 1 unlocked)
        const defaultProgress: UserProgress = {
          level_1: {
            score: 0,
            passed: false,
            unlocked: true,
            timestamp: new Date().toISOString(),
            attempts: 0
          }
        };
        
        await setDoc(userProgressRef, defaultProgress);
        return defaultProgress;
      }
    } catch (error) {
      console.error('Error getting user progress:', error);
      // Fallback to guest progress if Firebase fails
      return this.getGuestProgress();
    }
  }

  // Get guest progress from localStorage
  private getGuestProgress(): UserProgress {
    try {
      const stored = localStorage.getItem(this.guestProgressKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error reading guest progress from localStorage:', error);
    }

    // Return default progress for guest users
    return {
      level_1: {
        score: 0,
        passed: false,
        unlocked: true,
        timestamp: new Date().toISOString(),
        attempts: 0
      }
    };
  }

  // Save guest progress to localStorage
  private saveGuestProgress(progress: UserProgress): void {
    try {
      localStorage.setItem(this.guestProgressKey, JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving guest progress to localStorage:', error);
    }
  }

  // Save level result to Firestore or localStorage
  async saveLevelResult(userId: string | null, levelResult: LevelResult): Promise<void> {
    try {
      // If no userId provided, save to localStorage
      if (!userId) {
        this.saveGuestLevelResult(levelResult);
        return;
      }

      const userProgressRef = doc(db, 'users', userId, 'learn', 'progress');
      const levelKey = `level_${levelResult.levelId}`;
      
      const levelProgress: LevelProgress = {
        score: levelResult.score,
        passed: levelResult.passed,
        unlocked: true,
        timestamp: new Date().toISOString(),
        completedAt: levelResult.completedAt,
        attempts: 1 // This will be incremented if level already exists
      };

      // Get current progress to increment attempts if level already completed
      const currentDoc = await getDoc(userProgressRef);
      if (currentDoc.exists()) {
        const currentProgress = currentDoc.data() as UserProgress;
        if (currentProgress[levelKey]) {
          levelProgress.attempts = currentProgress[levelKey].attempts + 1;
        }
      }

      await updateDoc(userProgressRef, {
        [levelKey]: levelProgress
      });

      console.log(`Level ${levelResult.levelId} result saved for user ${userId}`);
    } catch (error) {
      console.error('Error saving level result:', error);
      // Fallback to localStorage if Firebase fails
      this.saveGuestLevelResult(levelResult);
    }
  }

  // Save level result to localStorage for guest users
  private saveGuestLevelResult(levelResult: LevelResult): void {
    try {
      const currentProgress = this.getGuestProgress();
      const levelKey = `level_${levelResult.levelId}`;
      
      const levelProgress: LevelProgress = {
        score: levelResult.score,
        passed: levelResult.passed,
        unlocked: true,
        timestamp: new Date().toISOString(),
        completedAt: levelResult.completedAt,
        attempts: 1
      };

      // Increment attempts if level already exists
      if (currentProgress[levelKey]) {
        levelProgress.attempts = currentProgress[levelKey].attempts + 1;
      }

      currentProgress[levelKey] = levelProgress;
      this.saveGuestProgress(currentProgress);

      console.log(`Level ${levelResult.levelId} result saved for guest user`);
    } catch (error) {
      console.error('Error saving guest level result:', error);
    }
  }

  // Unlock next levels based on completed level
  async unlockNextLevels(userId: string | null, completedLevelId: number): Promise<void> {
    try {
      const { levels } = await import('../data/levels');
      const completedLevel = levels.find(level => level.id === completedLevelId);
      
      if (!completedLevel) {
        console.warn(`Level ${completedLevelId} not found in levels data`);
        return;
      }

      // If no userId provided, unlock for guest user
      if (!userId) {
        this.unlockGuestLevels(completedLevelId);
        return;
      }

      const userProgressRef = doc(db, 'users', userId, 'learn', 'progress');
      const currentDoc = await getDoc(userProgressRef);
      
      if (!currentDoc.exists()) {
        console.warn('No user progress found for unlocking levels');
        return;
      }

      const currentProgress = currentDoc.data() as UserProgress;
      const updates: Record<string, any> = {};

      // Unlock next levels
      completedLevel.nextUnlocks.forEach(levelId => {
        const levelKey = `level_${levelId}`;
        if (!currentProgress[levelKey] || !currentProgress[levelKey].unlocked) {
          updates[levelKey] = {
            score: 0,
            passed: false,
            unlocked: true,
            timestamp: new Date().toISOString(),
            attempts: 0
          };
        }
      });

      if (Object.keys(updates).length > 0) {
        await updateDoc(userProgressRef, updates);
        console.log(`Unlocked levels for user ${userId}:`, Object.keys(updates));
      }
    } catch (error) {
      console.error('Error unlocking next levels:', error);
      // Fallback to guest unlocking if Firebase fails
      this.unlockGuestLevels(completedLevelId);
    }
  }

  // Unlock levels for guest users
  private unlockGuestLevels(completedLevelId: number): void {
    try {
      const { levels } = require('../data/levels');
      const completedLevel = levels.find((level: any) => level.id === completedLevelId);
      
      if (!completedLevel) {
        console.warn(`Level ${completedLevelId} not found in levels data`);
        return;
      }

      const currentProgress = this.getGuestProgress();
      let hasUpdates = false;

      // Unlock next levels
      completedLevel.nextUnlocks.forEach((levelId: number) => {
        const levelKey = `level_${levelId}`;
        if (!currentProgress[levelKey] || !currentProgress[levelKey].unlocked) {
          currentProgress[levelKey] = {
            score: 0,
            passed: false,
            unlocked: true,
            timestamp: new Date().toISOString(),
            attempts: 0
          };
          hasUpdates = true;
        }
      });

      if (hasUpdates) {
        this.saveGuestProgress(currentProgress);
        console.log(`Unlocked levels for guest user:`, completedLevel.nextUnlocks);
      }
    } catch (error) {
      console.error('Error unlocking guest levels:', error);
    }
  }

  // Subscribe to real-time progress updates (only for authenticated users)
  subscribeToProgress(userId: string | null, callback: (progress: UserProgress) => void): () => void {
    // If no userId provided, return a no-op function for guest users
    if (!userId) {
      // For guest users, just call the callback once with current progress
      const currentProgress = this.getGuestProgress();
      callback(currentProgress);
      return () => {}; // No-op unsubscribe function
    }

    const userProgressRef = doc(db, 'users', userId, 'learn', 'progress');
    
    return onSnapshot(userProgressRef, (doc) => {
      if (doc.exists()) {
        const progress = doc.data() as UserProgress;
        callback(progress);
      } else {
        // Initialize with default progress if document doesn't exist
        const defaultProgress: UserProgress = {
          level_1: {
            score: 0,
            passed: false,
            unlocked: true,
            timestamp: new Date().toISOString(),
            attempts: 0
          }
        };
        callback(defaultProgress);
      }
    }, (error) => {
      console.error('Error subscribing to progress:', error);
    });
  }

  // Get user statistics
  async getUserStats(userId?: string): Promise<{
    totalLevelsCompleted: number;
    totalScore: number;
    averageScore: number;
    totalTimeSpent: number;
  }> {
    try {
      const progress = await this.getUserProgress(userId);
      
      const completedLevels = Object.values(progress).filter(level => level.passed);
      const totalScore = completedLevels.reduce((sum, level) => sum + level.score, 0);
      const averageScore = completedLevels.length > 0 ? totalScore / completedLevels.length : 0;
      
      return {
        totalLevelsCompleted: completedLevels.length,
        totalScore,
        averageScore: Math.round(averageScore),
        totalTimeSpent: 0 // This would need to be tracked separately if needed
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw new Error('Failed to get user statistics');
    }
  }

  // Reset user progress (for testing/debugging)
  async resetUserProgress(userId?: string): Promise<void> {
    try {
      if (!userId) {
        // Reset guest progress
        const defaultProgress: UserProgress = {
          level_1: {
            score: 0,
            passed: false,
            unlocked: true,
            timestamp: new Date().toISOString(),
            attempts: 0
          }
        };
        this.saveGuestProgress(defaultProgress);
        console.log('Guest progress reset');
        return;
      }

      const userProgressRef = doc(db, 'users', userId, 'learn', 'progress');
      const defaultProgress: UserProgress = {
        level_1: {
          score: 0,
          passed: false,
          unlocked: true,
          timestamp: new Date().toISOString(),
          attempts: 0
        }
      };
      
      await setDoc(userProgressRef, defaultProgress);
      console.log(`Progress reset for user ${userId}`);
    } catch (error) {
      console.error('Error resetting user progress:', error);
      throw new Error('Failed to reset user progress');
    }
  }

  // Export guest progress (for when user logs in)
  exportGuestProgress(): UserProgress | null {
    try {
      const stored = localStorage.getItem(this.guestProgressKey);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error exporting guest progress:', error);
      return null;
    }
  }

  // Import guest progress to Firebase for authenticated users
  async importGuestProgressToFirebase(userId: string): Promise<boolean> {
    try {
      const guestProgress = this.exportGuestProgress();
      if (!guestProgress) {
        return false; // No guest progress to import
      }

      const userProgressRef = doc(db, 'users', userId, 'learn', 'progress');
      
      // Get current Firebase progress to merge properly
      const currentDoc = await getDoc(userProgressRef);
      let currentProgress: UserProgress = {};
      
      if (currentDoc.exists()) {
        currentProgress = currentDoc.data() as UserProgress;
      }

      // Merge guest progress with existing Firebase progress
      // Guest progress takes precedence for levels that exist in both
      const mergedProgress = { ...currentProgress, ...guestProgress };
      
      await setDoc(userProgressRef, mergedProgress);
      
      // Clear guest progress after successful import
      this.clearGuestProgress();
      
      console.log('Guest progress successfully imported to Firebase for user:', userId);
      return true;
    } catch (error) {
      console.error('Error importing guest progress to Firebase:', error);
      return false;
    }
  }

  // Clear guest progress (after successful export)
  clearGuestProgress(): void {
    try {
      localStorage.removeItem(this.guestProgressKey);
    } catch (error) {
      console.error('Error clearing guest progress:', error);
    }
  }
}

// Export singleton instance
export const learnService = LearnService.getInstance(); 