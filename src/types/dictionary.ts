export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

export interface WordFrequency {
  rank: number;
  source: string;
  lastUpdated: Date;
}

export interface WordMastery {
  level: number;
  lastPracticed: Date;
  practiceCount: number;
  mistakes: number;
  correctAnswers: number;
}

export interface WordUsage {
  example: string;
  translation: string;
  context: string;
  difficulty: number;
}

export interface WordEtymology {
  origin: string;
  components: string[];
  meaning: string;
  history: string;
}

export interface WordRelationship {
  sourceId: string;
  targetId: string;
  type: 'synonym' | 'antonym' | 'compound' | 'related' | 'prerequisite';
  strength: number;
  context?: string;
}

export interface DictionaryItem {
  id: string;
  japanese: string;
  english: string;
  romaji: string;
  type: 'word' | 'kanji' | 'compound';
  level: number;
  jlptLevel?: JLPTLevel;
  category?: string;
  frequency?: WordFrequency;
  mastery?: WordMastery;
  readings?: string[];
  meanings?: string[];
  examples?: WordUsage[];
  etymology?: WordEtymology;
  kanji?: string[];
  radicals?: string[];
  tags?: string[];
  notes?: string;
  lastViewed?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DictionarySearchOptions {
  query: string;
  searchFields?: ('japanese' | 'english' | 'romaji')[];
  filters?: {
    level?: number;
    category?: string;
    jlptLevel?: JLPTLevel;
    minMastery?: number;
    maxMastery?: number;
    tags?: string[];
  };
  sortBy?: 'frequency' | 'mastery' | 'lastViewed' | 'level';
  limit?: number;
  offset?: number;
}

export interface DictionaryStats {
  totalWords: number;
  byLevel: {
    [key: number]: number;
  };
  byJLPT: {
    [key in JLPTLevel]?: number;
  };
  byCategory: {
    [key: string]: number;
  };
  byMastery: {
    beginner: number;
    intermediate: number;
    advanced: number;
    expert: number;
  };
  recentlyAdded: DictionaryItem[];
  mostViewed: DictionaryItem[];
  mostPracticed: DictionaryItem[];
  mostMistaken: DictionaryItem[];
}

export interface DictionaryProgress {
  totalWords: number;
  masteredWords: number;
  inProgressWords: number;
  notStartedWords: number;
  averageMastery: number;
  byLevel: {
    [key: number]: {
      total: number;
      mastered: number;
      inProgress: number;
      notStarted: number;
      averageMastery: number;
    };
  };
  byJLPT: {
    [key in JLPTLevel]?: {
      total: number;
      mastered: number;
      inProgress: number;
      notStarted: number;
      averageMastery: number;
    };
  };
  byCategory: {
    [key: string]: {
      total: number;
      mastered: number;
      inProgress: number;
      notStarted: number;
      averageMastery: number;
    };
  };
  recentActivity: Array<{
    date: Date;
    wordsPracticed: number;
    wordsMastered: number;
    averageScore: number;
  }>;
  learningStreak: {
    current: number;
    longest: number;
    lastPracticed: Date;
  };
}

export interface DictionaryExportOptions {
  format: 'json' | 'csv' | 'txt';
  includeFields?: (keyof DictionaryItem)[];
  filters?: DictionarySearchOptions['filters'];
  sortBy?: DictionarySearchOptions['sortBy'];
  limit?: number;
}

export interface DictionaryImportOptions {
  format: 'json' | 'csv' | 'txt';
  updateExisting?: boolean;
  skipDuplicates?: boolean;
  validateData?: boolean;
}

export interface DictionarySyncOptions {
  mode: 'push' | 'pull' | 'sync';
  lastSync?: Date;
  includeProgress?: boolean;
  includeNotes?: boolean;
  includeCustomLists?: boolean;
}

export interface DictionaryBackupOptions {
  includeProgress?: boolean;
  includeNotes?: boolean;
  includeCustomLists?: boolean;
  includeSettings?: boolean;
  encryption?: {
    enabled: boolean;
    password?: string;
  };
}

export interface DictionaryRestoreOptions {
  validateBackup?: boolean;
  mergeData?: boolean;
  restoreSettings?: boolean;
  encryption?: {
    enabled: boolean;
    password?: string;
  };
}

export interface DictionarySettings {
  defaultSearchFields: ('japanese' | 'english' | 'romaji')[];
  defaultSortBy: DictionarySearchOptions['sortBy'];
  defaultLimit: number;
  showRomaji: boolean;
  showFurigana: boolean;
  showExamples: boolean;
  showEtymology: boolean;
  showRelationships: boolean;
  showProgress: boolean;
  showFrequency: boolean;
  showJLPTLevel: boolean;
  showCategory: boolean;
  showTags: boolean;
  showNotes: boolean;
  autoPlayAudio: boolean;
  autoSaveNotes: boolean;
  syncEnabled: boolean;
  syncInterval: number;
  backupEnabled: boolean;
  backupInterval: number;
  offlineMode: boolean;
  darkMode: boolean;
  fontSize: number;
  fontFamily: string;
  theme: string;
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
}

export interface DictionaryState {
  items: DictionaryItem[];
  stats: DictionaryStats;
  progress: DictionaryProgress;
  settings: DictionarySettings;
  searchHistory: Array<{
    query: string;
    timestamp: Date;
    results: string[];
  }>;
  favorites: string[];
  customLists: Array<{
    id: string;
    name: string;
    description: string;
    words: string[];
    createdAt: Date;
    updatedAt: Date;
  }>;
  notes: Array<{
    wordId: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  lastSync?: Date;
  lastBackup?: Date;
  isOnline: boolean;
  isSyncing: boolean;
  isBackingUp: boolean;
  error?: string;
} 