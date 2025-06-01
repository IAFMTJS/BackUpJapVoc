export interface WordProgress {
  mastery: number;
  reviews: number;
  lastReviewed: number;
  nextReviewDate: number;
  favorite: boolean;
  notes?: string;
  tags?: string[];
  lastUpdated: number;
  studyHistory: {
    timestamp: number;
    masteryChange: number;
    reviewType: 'learning' | 'review' | 'quiz';
    accuracy: number;
  }[];
}

export interface SectionProgress {
  totalItems: number;
  masteredItems: number;
  inProgressItems: number;
  notStartedItems: number;
  lastStudied: number;
  streak: number;
  averageMastery: number;
  lastUpdated: number;
  studyHistory: {
    timestamp: number;
    itemsStudied: number;
    masteryGained: number;
    accuracy: number;
  }[];
}

export interface UserPreferences {
  showRomaji: boolean;
  showEnglish: boolean;
  autoPlayAudio: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  dailyGoal: number;
  theme: 'light' | 'dark' | 'system';
  notifications: {
    enabled: boolean;
    dailyReminder: boolean;
    streakReminder: boolean;
    reviewReminder: boolean;
  };
  studySettings: {
    reviewInterval: number;
    masteryThreshold: number;
    maxReviewsPerDay: number;
    preferredStudyTime: string;
  };
}

export interface StudySession {
  timestamp: number;
  duration: number;
  wordsLearned: number;
  accuracy: number;
  averageMastery: number;
  section: string;
  reviewType: 'learning' | 'review' | 'quiz';
  items: {
    id: string;
    masteryChange: number;
    accuracy: number;
  }[];
}

export interface DailyProgress {
  date: string;
  wordsStudied: number;
  timeSpent: number;
  accuracy: number;
  masteryGained: number;
  sessions: StudySession[];
}

export interface Statistics {
  totalStudyTime: number;
  wordsLearned: number;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: number;
  dailyProgress: { [date: string]: DailyProgress };
  studySessions: StudySession[];
  masteryDistribution: {
    mastered: number;
    learning: number;
    notStarted: number;
  };
  averageAccuracy: number;
  averageMastery: number;
  studyEfficiency: number;
  lastUpdated: number;
}

export interface ProgressState {
  words: { [wordId: string]: WordProgress };
  sections: {
    dictionary: SectionProgress;
    mood: SectionProgress;
    culture: SectionProgress;
  };
  preferences: UserPreferences;
  statistics: Statistics;
  version: string;
  lastSync: number;
  userId?: string;
}

export interface ProgressContextType {
  progress: ProgressState;
  isLoading: boolean;
  error: string | null;
  isSyncing: boolean;
  lastSyncTime: number | null;
  updateWordProgress: (wordId: string, progress: Partial<WordProgress>) => void;
  updateSectionProgress: (section: keyof ProgressState['sections'], progress: Partial<SectionProgress>) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  updateStatistics: (stats: Partial<Statistics>) => void;
  addStudySession: (session: StudySession) => void;
  resetProgress: () => void;
  exportProgress: () => string;
  importProgress: (data: string) => void;
  getWordProgress: (wordId: string) => WordProgress | undefined;
  getSectionProgress: (section: keyof ProgressState['sections']) => SectionProgress;
  getMasteryLevel: (wordId: string) => number;
  getNextReviewDate: (wordId: string) => number;
  toggleFavorite: (wordId: string) => void;
  addStudyTime: (duration: number) => void;
  updateStreak: () => void;
} 