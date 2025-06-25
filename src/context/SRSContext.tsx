import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import safeLocalStorage from '../utils/safeLocalStorage';

export interface SRSItem {
  id: string;
  word: string;
  reading: string;
  meaning: string;
  level: number;
  nextReview: Date;
  interval: number;
  easeFactor: number;
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
  totalReviews: number;
  lastReviewed?: Date;
}

export interface SRSStats {
  totalItems: number;
  dueItems: number;
  newItems: number;
  learningItems: number;
  reviewItems: number;
  averageEaseFactor: number;
  retentionRate: number;
  totalReviews: number;
  streakDays: number;
}

interface SRSContextType {
  items: SRSItem[];
  stats: SRSStats;
  isLoading: boolean;
  error: string | null;
  addItem: (item: Omit<SRSItem, 'id' | 'nextReview' | 'interval' | 'easeFactor' | 'consecutiveCorrect' | 'consecutiveIncorrect' | 'totalReviews'>) => void;
  reviewItem: (itemId: string, quality: 1 | 2 | 3 | 4 | 5) => void;
  getDueItems: () => SRSItem[];
  getNewItems: (count: number) => SRSItem[];
  updateStats: () => void;
  resetItem: (itemId: string) => void;
  removeItem: (itemId: string) => void;
}

const defaultStats: SRSStats = {
  totalItems: 0,
  dueItems: 0,
  newItems: 0,
  learningItems: 0,
  reviewItems: 0,
  averageEaseFactor: 2.5,
  retentionRate: 0,
  totalReviews: 0,
  streakDays: 0,
};

const SRSContext = createContext<SRSContextType | undefined>(undefined);

export const SRSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<SRSItem[]>([]);
  const [stats, setStats] = useState<SRSStats>(defaultStats);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load items from localStorage on mount
  useEffect(() => {
    try {
      const savedItems = safeLocalStorage.getItem('srsItems');
      if (savedItems) {
        const parsedItems = JSON.parse(savedItems);
        // Convert date strings back to Date objects
        const itemsWithDates = parsedItems.map((item: any) => ({
          ...item,
          nextReview: new Date(item.nextReview),
          lastReviewed: item.lastReviewed ? new Date(item.lastReviewed) : undefined,
        }));
        setItems(itemsWithDates);
      }
    } catch (error) {
      console.error('Error loading SRS items:', error);
    }
  }, []);

  // Save items to localStorage whenever they change
  useEffect(() => {
    try {
      safeLocalStorage.setItem('srsItems', JSON.stringify(items));
    } catch (error) {
      console.error('Error saving SRS items:', error);
    }
  }, [items]);

  // Update stats whenever items change
  useEffect(() => {
    updateStats();
  }, [items]);

  const addItem = (item: Omit<SRSItem, 'id' | 'nextReview' | 'interval' | 'easeFactor' | 'consecutiveCorrect' | 'consecutiveIncorrect' | 'totalReviews'>) => {
    const newItem: SRSItem = {
      ...item,
      id: Date.now().toString(),
      nextReview: new Date(),
      interval: 0,
      easeFactor: 2.5,
      consecutiveCorrect: 0,
      consecutiveIncorrect: 0,
      totalReviews: 0,
    };
    setItems(prev => [...prev, newItem]);
  };

  const reviewItem = (itemId: string, quality: 1 | 2 | 3 | 4 | 5) => {
    setItems(prev => {
      return prev.map(item => {
        if (item.id !== itemId) return item;

        const now = new Date();
        let newInterval: number;
        let newEaseFactor: number;
        let newConsecutiveCorrect: number;
        let newConsecutiveIncorrect: number;

        if (quality >= 3) {
          // Correct answer
          newConsecutiveCorrect = item.consecutiveCorrect + 1;
          newConsecutiveIncorrect = 0;

          if (item.level === 0) {
            // New item
            newInterval = 1;
            newEaseFactor = item.easeFactor;
          } else if (item.level === 1) {
            // Learning item
            newInterval = 6;
            newEaseFactor = item.easeFactor;
          } else {
            // Review item
            newInterval = Math.round(item.interval * item.easeFactor);
            newEaseFactor = Math.max(1.3, item.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
          }
        } else {
          // Incorrect answer
          newConsecutiveCorrect = 0;
          newConsecutiveIncorrect = item.consecutiveIncorrect + 1;
          newInterval = 1;
          newEaseFactor = Math.max(1.3, item.easeFactor - 0.2);
        }

        const nextReview = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000);

        return {
          ...item,
          level: quality >= 3 ? item.level + 1 : 0,
          nextReview,
          interval: newInterval,
          easeFactor: newEaseFactor,
          consecutiveCorrect: newConsecutiveCorrect,
          consecutiveIncorrect: newConsecutiveIncorrect,
          totalReviews: item.totalReviews + 1,
          lastReviewed: now,
        };
      });
    });
  };

  const getDueItems = (): SRSItem[] => {
    const now = new Date();
    return items.filter(item => item.nextReview <= now);
  };

  const getNewItems = (count: number): SRSItem[] => {
    return items
      .filter(item => item.level === 0)
      .slice(0, count);
  };

  const updateStats = () => {
    const now = new Date();
    const dueItems = items.filter(item => item.nextReview <= now);
    const newItems = items.filter(item => item.level === 0);
    const learningItems = items.filter(item => item.level === 1);
    const reviewItems = items.filter(item => item.level > 1);

    const totalReviews = items.reduce((sum, item) => sum + item.totalReviews, 0);
    const averageEaseFactor = items.length > 0 
      ? items.reduce((sum, item) => sum + item.easeFactor, 0) / items.length 
      : 2.5;

    // Calculate retention rate (simplified)
    const recentReviews = items.filter(item => 
      item.lastReviewed && 
      (now.getTime() - item.lastReviewed.getTime()) < 7 * 24 * 60 * 60 * 1000
    );
    const retentionRate = recentReviews.length > 0 
      ? recentReviews.filter(item => item.consecutiveCorrect > 0).length / recentReviews.length 
      : 0;

    setStats({
      totalItems: items.length,
      dueItems: dueItems.length,
      newItems: newItems.length,
      learningItems: learningItems.length,
      reviewItems: reviewItems.length,
      averageEaseFactor,
      retentionRate,
      totalReviews,
      streakDays: 0, // TODO: Implement streak calculation
    });
  };

  const resetItem = (itemId: string) => {
    setItems(prev => {
      return prev.map(item => {
        if (item.id !== itemId) return item;
        return {
          ...item,
          level: 0,
          nextReview: new Date(),
          interval: 0,
          easeFactor: 2.5,
          consecutiveCorrect: 0,
          consecutiveIncorrect: 0,
          totalReviews: 0,
          lastReviewed: undefined,
        };
      });
    });
  };

  const removeItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  return (
    <SRSContext.Provider
      value={{
        items,
        stats,
        isLoading,
        error,
        addItem,
        reviewItem,
        getDueItems,
        getNewItems,
        updateStats,
        resetItem,
        removeItem,
      }}
    >
      {children}
    </SRSContext.Provider>
  );
};

export const useSRS = (): SRSContextType => {
  const context = useContext(SRSContext);
  if (context === undefined) {
    throw new Error('useSRS must be used within a SRSProvider');
  }
  return context;
}; 