import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useProgress, ProgressItem } from '../context/ProgressContext';
import { useWordLevel } from '../context/WordLevelContext';
import { useSound } from '../context/SoundContext';
import { kuroshiroInstance } from '../utils/kuroshiro';
import { romajiCache } from '../utils/romajiCache';
import { v4 as uuidv4 } from 'uuid';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, Stack, Chip, Button, Alert, IconButton, Tabs, Tab, CircularProgress, TextField, InputAdornment, Tooltip, Menu, MenuItem, Divider } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import InfoIcon from '@mui/icons-material/Info';
import ListIcon from '@mui/icons-material/List';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import EditIcon from '@mui/icons-material/Edit';
import CloudIcon from '@mui/icons-material/Cloud';
import TimelineIcon from '@mui/icons-material/Timeline';
import ShareIcon from '@mui/icons-material/Share';
import SyncIcon from '@mui/icons-material/Sync';
import { DictionaryItem, DictionarySearchOptions, DictionaryStats, DictionaryProgress, DictionarySettings, DictionaryState } from '../types/dictionary';
import { initDictionaryDB, saveWord, getWord, searchWords, saveWordRelationships, getWordRelationships, generateWordCloud, createLearningPath, updateLearningPathProgress, getLearningPaths } from '../utils/dictionaryOfflineSupport';
import { WordRelationshipsVisualization } from '../utils/wordRelationshipsVisualization';
import { WordCloudVisualization } from '../utils/wordCloudVisualization';
import { LearningPathVisualization } from '../utils/learningPathVisualization';
import { useCache, useDebounce, useThrottle, useMemoization } from '../utils/performanceOptimization';
import { wordLevels } from '../data/wordLevels';
import WordCloud from './WordCloud';
import { allWords, waitForWords } from '../data/japaneseWords';
import Fuse from 'fuse.js';
import { useSettings } from '../context/SettingsContext';
import { useHotkeys } from 'react-hotkeys-hook';  // Changed from useKeyboardShortcut to useHotkeys
import { motion, AnimatePresence } from 'framer-motion';
import { LearningPath } from './visualizations/LearningPath';
import { KanjiStrokeOrder } from './KanjiStrokeOrder';
import { SpacedRepetition } from './SpacedRepetition';
import { DifficultyPredictor } from './DifficultyPredictor';
import { ExampleGenerator } from './ExampleGenerator';
import { ShareDialog } from './ShareDialog';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { SavedSearches } from './SavedSearches';
import { RadicalSearch } from './RadicalSearch';
import { initializeAudio, playAudio } from '../utils/audio';
import { useDatabase } from '../context/DatabaseContext';

// Enhanced types for dictionary features
type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
type WordDifficulty = 'beginner' | 'intermediate' | 'advanced';
type WordFrequency = 'very_common' | 'common' | 'uncommon' | 'rare';
type WordRelationship = 'synonym' | 'antonym' | 'related' | 'compound';
type WordCategory = 'noun' | 'verb' | 'adjective' | 'adverb' | 'particle' | 'expression';
type WordFormality = 'formal' | 'informal' | 'both';
type WordContext = 'casual' | 'business' | 'academic' | 'literary';

interface ExampleSentence {
  japanese: string;
  english: string;
  romaji: string;
  context: WordContext;
  formality: WordFormality;
  notes?: string;
  grammarPoints?: string[];
}

interface WordUsage {
  category: WordCategory;
  formality: WordFormality;
  contexts: WordContext[];
  grammarPoints: string[];
  notes: string;
  commonCollocations: string[];
}

interface WordRelationshipData {
  type: WordRelationship;
  words: string[];
  notes?: string;
}

interface WordEtymology {
  origin: string;
  components: string[];
  historicalNotes?: string;
  relatedKanji?: string[];
}

interface WordFrequencyData {
  level: WordFrequency;
  jlptLevel?: JLPTLevel;
  frequencyRank?: number;
  usageNotes?: string;
}

interface WordMastery {
  level: 'beginner' | 'intermediate' | 'advanced' | 'master';
  progress: number;
  lastPracticed: Date;
  practiceHistory: {
    date: Date;
    score: number;
    mistakes: string[];
  }[];
}

interface CustomWordList {
  id: string;
  name: string;
  description: string;
  words: string[];
  createdAt: Date;
  lastModified: Date;
  tags: string[];
  isPublic: boolean;
}

interface WordNote {
  id: string;
  wordId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

interface WordChallenge {
  id: string;
  type: 'daily' | 'weekly' | 'custom';
  words: string[];
  difficulty: WordDifficulty;
  timeLimit?: number;
  bonusPoints: number;
  completed: boolean;
  score: number;
  startDate: Date;
  endDate: Date;
}

interface WordProgress {
  mastery: WordMastery;
  practiceCount: number;
  correctCount: number;
  incorrectCount: number;
  averageScore: number;
  lastPracticed: Date;
  notes: WordNote[];
  challenges: WordChallenge[];
}

// Extend existing DictionaryItem type
interface EnhancedDictionaryItem extends DictionaryItem {
  examples: ExampleSentence[];
  usage: WordUsage;
  relationships: WordRelationshipData[];
  etymology: WordEtymology;
  frequency: WordFrequencyData;
  mastery: WordMastery;
  notes: WordNote[];
  progress: WordProgress;
  isFavorite: boolean;
  recentlyViewed: Date[];
  similarWords: string[];
}

type DictionaryItem = QuizWord | Kanji;
type FilterType = 'all' | 'unmarked' | 'marked' | 'mastered';
type MasteryLevel = 0 | 1 | 2 | 3;
type DictionaryMode = 'all' | 'hiragana' | 'katakana' | 'kanji';

interface MasteryInfo {
  icon: string;
  color: string;
  text: string;
}

interface DictionaryProps {
  mode: DictionaryMode;
}

// Add new interfaces for level statistics
interface LevelStats {
  level: number;
  totalWords: number;
  masteredWords: number;
  inProgressWords: number;
  notStartedWords: number;
}

interface SearchOptions {
  query: string;  // Changed from term to query to match usage
  filters: {
    category?: string;  // Added optional category filter
    level?: number;     // Added optional level filter
    jlptLevel?: string; // Added optional JLPT level filter
    jlptLevels?: string[];
    wordType?: string[];
    difficulty?: string[];
    frequency?: string[];
    radicals?: string[];
  };
  sortBy: 'frequency' | 'mastery' | 'lastViewed' | 'level';
  viewMode: 'grid' | 'list';
  advancedSearch: boolean;
}

const Dictionary: React.FC<DictionaryProps> = ({ mode }) => {
  const { theme } = useTheme();
  const { progress, updateProgress } = useProgress();
  const { wordLevel } = useWordLevel();
  const { playCorrect, playIncorrect } = useSound();
  const { db } = useDatabase();
  const [isDbReady, setIsDbReady] = useState(false);
  const [dbError, setDbError] = useState<Error | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [items, setItems] = useState<DictionaryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<DictionaryItem[]>([]);
  const [sortBy, setSortBy] = useState<'japanese' | 'english' | 'progress'>('japanese');
  const [romajiMap, setRomajiMap] = useState<Record<string, string>>({});
  const [isRomajiLoading, setIsRomajiLoading] = useState(false);
  const [romajiError, setRomajiError] = useState<string | null>(null);
  const [localProgress, setLocalProgress] = useState<Record<string, ProgressItem>>({});
  const [selectedItem, setSelectedItem] = useState<DictionaryItem | null>(null);
  const [showLockedAlert, setShowLockedAlert] = useState(false);
  const [levelFilter, setLevelFilter] = useState<number | 'all'>('all');
  const [levelStats, setLevelStats] = useState<LevelStats[]>([]);

  // New state for enhanced features
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [customWordLists, setCustomWordLists] = useState<CustomWordList[]>([]);
  const [wordNotes, setWordNotes] = useState<Record<string, WordNote[]>>({});
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [wordChallenges, setWordChallenges] = useState<WordChallenge[]>([]);
  const [wordOfTheDay, setWordOfTheDay] = useState<EnhancedDictionaryItem | null>(null);
  const [showWordCloud, setShowWordCloud] = useState(false);
  const [showLearningPath, setShowLearningPath] = useState(false);
  const [selectedWordList, setSelectedWordList] = useState<string | null>(null);
  const [practiceMode, setPracticeMode] = useState(false);
  const [wordRelationships, setWordRelationships] = useState<Record<string, WordRelationshipData[]>>({});
  const [wordEtymology, setWordEtymology] = useState<Record<string, WordEtymology>>({});
  const [wordFrequency, setWordFrequency] = useState<Record<string, WordFrequencyData>>({});
  const [wordMastery, setWordMastery] = useState<Record<string, WordMastery>>({});
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [showRelationships, setShowRelationships] = useState(false);
  const [visualizationData, setVisualizationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    query: '',
    filters: {
      category: undefined,
      level: undefined,
      jlptLevel: undefined,
      jlptLevels: [],
      wordType: [],
      difficulty: [],
      frequency: [],
      radicals: []
    },
    sortBy: 'frequency',
    viewMode: 'grid',
    advancedSearch: false
  });
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [showSearch, setShowSearch] = useState(false);  // Add this line
  const [showRadicalSearch, setShowRadicalSearch] = useState(false);
  const [selectedRadicals, setSelectedRadicals] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showSpacedRepetition, setShowSpacedRepetition] = useState(false);
  const [showDifficultyPredictor, setShowDifficultyPredictor] = useState(false);
  const [showExampleGenerator, setShowExampleGenerator] = useState(false);
  const [showStrokeOrder, setShowStrokeOrder] = useState(false);
  const [selectedKanji, setSelectedKanji] = useState<string | null>(null);

  // Add audio initialization state
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);

  // Initialize Fuse.js for fuzzy search
  const fuse = useMemo(() => new Fuse(items, {
    keys: ['japanese', 'english', 'romaji', 'meaning', 'reading'],
    threshold: 0.3,
    distance: 100,
    includeScore: true
  }), [items]);

  // Add memoized search function
  const memoizedSearch = useMemoization(async (options: DictionarySearchOptions) => {
    try {
      return await searchWords(options.query, {
        searchFields: options.searchFields,
        filters: options.filters,
        sortBy: options.sortBy,
        limit: options.limit
      });
    } catch (error) {
      console.error('Error in memoized search:', error);
      throw error;
    }
  }, [searchWords]);

  // Keyboard shortcuts
  useHotkeys('ctrl+k', () => {
    setShowKeyboardShortcuts(true);
  });
  useHotkeys('ctrl+f', (e) => {
    e.preventDefault();
    setShowSearch(true);
  });
  useHotkeys('ctrl+g', () => {
    setSearchOptions(prev => ({
      ...prev,
      viewMode: prev.viewMode === 'grid' ? 'list' : 'grid'
    }));
  });
  useHotkeys('esc', () => {
    setShowSearch(false);
    setShowKeyboardShortcuts(false);
    setShowShareDialog(false);
    setShowSavedSearches(false);
  });
  useHotkeys('ctrl+s', (e) => {
    e.preventDefault();
    setShowSavedSearches(true);
  });

  // Enhanced search function
  const performSearch = (term: string, filters: SearchOptions['filters']) => {
    let results = items;

    // Apply fuzzy search if term exists
    if (term) {
      const fuseResults = fuse.search(term);
      results = fuseResults.map(result => result.item);
    }

    // Apply filters
    if (filters.jlptLevel.length > 0) {
      results = results.filter(item => 
        'jlptLevel' in item && filters.jlptLevel.includes(item.jlptLevel)
      );
    }
    if (filters.wordType.length > 0) {
      results = results.filter(item => 
        'wordType' in item && filters.wordType.includes(item.wordType)
      );
    }
    if (filters.difficulty.length > 0) {
      results = results.filter(item => 
        'difficulty' in item && filters.difficulty.includes(item.difficulty)
      );
    }
    if (filters.frequency.length > 0) {
      results = results.filter(item => 
        'frequency' in item && filters.frequency.includes(item.frequency)
      );
    }
    if (filters.radicals.length > 0) {
      results = results.filter(item => 
        'radicals' in item && 
        filters.radicals.every(radical => 
          (item as KanjiItem).radicals.includes(radical)
        )
      );
    }

    // Update search history
    if (term) {
      setSearchHistory(prev => {
        const newHistory = [term, ...prev.filter(t => t !== term)].slice(0, 10);
        localStorage.setItem('dictionarySearchHistory', JSON.stringify(newHistory));
        return newHistory;
      });
    }

    return results;
  };

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // First useEffect for loading items - modified to prevent unnecessary reloads
  useEffect(() => {
    let isMounted = true;
    let loadTimeout: NodeJS.Timeout;

    const loadItems = async () => {
      if (!isMounted) return;
      
      setIsLoading(true);
      try {
        console.log('[Dictionary] Loading items...');
        
        // Wait for words to be loaded
        await waitForWords();
        
        if (!isMounted) return;
        
        // Check if allWords is available
        if (!allWords || allWords.length === 0) {
          console.error('[Dictionary] allWords is empty or undefined after waiting');
          throw new Error('Dictionary data not available');
        }

        // Load from allWords with filtering
        let loadedItems: DictionaryItem[] = allWords.filter(word => {
          // Mode-based filtering
          if (mode !== 'all') {
            const modeMatch = 
              (mode === 'hiragana' && word.isHiragana) ||
              (mode === 'katakana' && word.isKatakana) ||
              (mode === 'kanji' && word.kanji);
            
            if (!modeMatch) return false;
          }

          // Search term filtering with null checks
          const searchQuery = searchOptions?.query?.toLowerCase()?.trim();
          if (!searchQuery) return true;
          
          return (
            (word.japanese?.toLowerCase() || '').includes(searchQuery) ||
            (word.english?.toLowerCase() || '').includes(searchQuery) ||
            (word.romaji?.toLowerCase() || '').includes(searchQuery)
          );
        });

        if (!isMounted) return;

        // Apply additional filters
        if (searchOptions.filters.category) {
          loadedItems = loadedItems.filter(word => word.category === searchOptions.filters.category);
        }

        if (searchOptions.filters.level) {
          loadedItems = loadedItems.filter(word => word.level === searchOptions.filters.level);
        }

        if (searchOptions.filters.jlptLevel) {
          loadedItems = loadedItems.filter(word => word.jlptLevel === searchOptions.filters.jlptLevel);
        }

        // Batch state updates
        if (isMounted) {
          setItems(loadedItems);
          setFilteredItems(loadedItems);
          setTotalItems(mode, loadedItems.length);
        }
      } catch (error) {
        console.error('[Dictionary] Error loading items:', error);
        if (isMounted) {
          setSyncError('Failed to load dictionary items');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Debounce the loadItems call
    loadTimeout = setTimeout(() => {
      loadItems();
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(loadTimeout);
    };
  }, [mode, searchOptions.query, searchOptions.filters.category, searchOptions.filters.level, searchOptions.filters.jlptLevel]);

  // Second useEffect for filtering - modified to prevent unnecessary updates
  useEffect(() => {
    let isMounted = true;
    let filterTimeout: NodeJS.Timeout;

    const applyFilters = () => {
      if (!isMounted) return;

      let filtered = [...items];
      const filterStages: { stage: string; count: number }[] = [];

      // Always filter out locked words
      filtered = filtered.filter(item => {
        const wordLevel = wordLevels.find(level => 
          level.words.some(w => w.japanese === ('japanese' in item ? item.japanese : item.character))
        );
        return wordLevel ? unlockedLevels.includes(wordLevel.level) : true;
      });

      // Search term filtering
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase().trim();
        filtered = filtered.filter(item => {
          if (!item) return false;
          
          return (
            ('japanese' in item ? item.japanese : item.character).toLowerCase().includes(searchLower) ||
            ('english' in item ? item.english : '').toLowerCase().includes(searchLower) ||
            ('romaji' in item ? item.romaji : '').toLowerCase().includes(searchLower)
          );
        });
      }

      // Sort items
      if (sortBy) {
        filtered.sort((a, b) => {
          if (!a || !b) return 0;

          switch (sortBy) {
            case 'japanese':
              return ('japanese' in a ? a.japanese : a.character)
                .localeCompare('japanese' in b ? b.japanese : b.character);
            case 'english':
              return ('english' in a ? a.english : '')
                .localeCompare('english' in b ? b.english : '');
            case 'level':
              return (('level' in a ? a.level : 0) - ('level' in b ? b.level : 0));
            case 'mastery':
              const aProgress = localProgress?.['japanese' in a ? a.japanese : a.character]?.mastery || 0;
              const bProgress = localProgress?.['japanese' in b ? b.japanese : b.character]?.mastery || 0;
              return bProgress - aProgress;
            default:
              return 0;
          }
        });
      }

      if (isMounted) {
        setFilteredItems(filtered);
      }
    };

    // Debounce the filter application
    filterTimeout = setTimeout(() => {
      applyFilters();
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(filterTimeout);
    };
  }, [items, searchTerm, sortBy, localProgress, wordLevels, unlockedLevels]);

  // Handle word relationships visualization
  const handleShowRelationships = async (wordId: string) => {
    try {
      const relationships = await getWordRelationships(wordId);
      setVisualizationData(relationships);
      setShowRelationships(true);
    } catch (error) {
      console.error('Error loading word relationships:', error);
      setSyncError('Failed to load word relationships');
    }
  };

  // Handle word cloud visualization
  const handleShowWordCloud = async () => {
    try {
      const cloudData = await generateWordCloud(items);
      setVisualizationData(cloudData);
      setShowWordCloud(true);
    } catch (error) {
      console.error('Error generating word cloud:', error);
      setSyncError('Failed to generate word cloud');
    }
  };

  // Handle learning path visualization
  const handleShowLearningPath = async () => {
    try {
      const paths = await getLearningPaths();
      setVisualizationData(paths);
      setShowLearningPath(true);
    } catch (error) {
      console.error('Error loading learning paths:', error);
      setSyncError('Failed to load learning paths');
    }
  };

  // Sync local progress with context progress
  useEffect(() => {
    console.log('Progress context updated:', progress);
    setLocalProgress(progress);
  }, [progress]);

  // Initialize romaji conversion for all items with improved caching
  const initializeRomaji = useCallback(async (itemsToConvert: DictionaryItem[]) => {
    if (itemsToConvert.length === 0) return;

    setIsRomajiLoading(true);
    setRomajiError(null);

    try {
      console.log('Starting romaji initialization for', itemsToConvert.length, 'items');
      
      // Get all texts that need conversion
      const textsToConvert = itemsToConvert
        .map(item => 'japanese' in item ? item.japanese : item.character);

      // Try to get cached romaji first
      console.log('Fetching cached romaji...');
      const cachedRomaji = await romajiCache.getBatch(textsToConvert);
      console.log('Found', Object.keys(cachedRomaji).length, 'cached items');
      
      // Update state with cached values immediately
      if (Object.keys(cachedRomaji).length > 0) {
        console.log('Updating state with cached values');
        setRomajiMap(prev => ({ ...prev, ...cachedRomaji }));
      }

      // Find texts that weren't in cache
      const uncachedTexts = textsToConvert.filter(text => !cachedRomaji[text]);
      console.log('Found', uncachedTexts.length, 'uncached items');

      if (uncachedTexts.length === 0) {
        console.log('All items were cached, finishing initialization');
        setIsRomajiLoading(false);
        return;
      }

      // Process uncached texts in smaller batches
      const batchSize = 5;
      const newRomajiMap = { ...romajiMap, ...cachedRomaji };

      for (let i = 0; i < uncachedTexts.length; i += batchSize) {
        const batch = uncachedTexts.slice(i, i + batchSize);
        console.log('Converting batch', i / batchSize + 1, 'of', Math.ceil(uncachedTexts.length / batchSize));
        
        const batchResults = await kuroshiroInstance.convertBatch(batch);
        console.log('Batch conversion complete, caching results');
        
        // Cache the new conversions
        await romajiCache.setBatch(batchResults);
        
        // Update the map with new conversions
        Object.entries(batchResults).forEach(([text, romaji]) => {
          newRomajiMap[text] = romaji;
        });

        // Update state after each batch to show progress
        setRomajiMap(newRomajiMap);
      }

      console.log('Romaji initialization complete');
    } catch (error) {
      console.error('Error initializing romaji:', error);
      setRomajiError('Failed to load romaji. Please try refreshing the page.');
    } finally {
      setIsRomajiLoading(false);
    }
  }, [romajiMap]);

  // Preload romaji for all items when the component mounts or items change
  useEffect(() => {
    let isMounted = true;

    const preloadRomaji = async () => {
      if (items.length > 0 && isMounted) {
        console.log('Starting romaji preload for', items.length, 'items');
        await initializeRomaji(items);
      }
    };

    preloadRomaji();

    return () => {
      isMounted = false;
    };
  }, [items, initializeRomaji]);

  // Helper function to check if an item is marked
  const isItemMarked = useCallback((itemId: string) => {
    const key = `${mode}-${itemId}`;
    const itemProgress = progress[key];
    console.log('Checking marked status for', key, 'Progress:', itemProgress);
    return itemProgress?.correct > 0;
  }, [mode, progress]);

  // Helper function to get mastery level
  const getMasteryLevel = useCallback((itemId: string): 0 | 1 | 2 | 3 => {
    const key = `${mode}-${itemId}`;
    const itemProgress = progress[key];
    console.log('Getting mastery level for', key, 'Progress:', itemProgress);
    if (!itemProgress) return 0;
    
    const correctCount = itemProgress.correct || 0;
    console.log('Correct count:', correctCount);
    if (correctCount >= 3) return 3; // Mastered
    if (correctCount === 2) return 2; // Almost mastered
    if (correctCount === 1) return 1; // Marked
    return 0; // Unmarked
  }, [mode, progress]);

  // Helper function to check if a number is a valid mastery level
  const isValidMasteryLevel = (level: number): level is MasteryLevel => {
    return level >= 0 && level <= 3;
  };

  // Update progress to next mastery level
  const incrementMastery = async (item: DictionaryItem) => {
    const itemId = 'japanese' in item ? item.japanese : item.character;
    const key = `${mode}-${itemId}`;
    const currentLevel = getMasteryLevel(itemId);
    console.log('Increment mastery called:', { itemId, key, currentLevel });

    try {
      // If already at max level, don't do anything
      if (currentLevel >= 3) {
        showMotivation('encouragement');
        return;
      }

      // Update progress in context
      console.log('Updating progress in context...');
      await updateProgress(mode, itemId, true); // true to increment

      // Play sound and show feedback
      playSound('correct');

      // Show motivation message based on new level
      const newLevel = currentLevel + 1;
      if (newLevel === 1) {
        showMotivation('positive');
      } else if (newLevel === 3) {
        showMotivation('encouragement');
      }
    } catch (err) {
      console.error('Failed to update progress:', err);
      showError('Failed to save progress. Please try again.');
    }
  };

  // Reset progress to unmarked
  const resetProgress = async (item: DictionaryItem, event: React.MouseEvent) => {
    // Only reset on right-click or long-press
    if (event.type === 'click' && event.button !== 2) {
      return;
    }
    event.preventDefault();

    const itemId = 'japanese' in item ? item.japanese : item.character;
    const key = `${mode}-${itemId}`;
    console.log('Reset progress called:', { itemId, key });

    try {
      // Update progress in context to reset
      console.log('Resetting progress in context...');
      await updateProgress(mode, itemId, false); // false to reset

      // Play sound
      playSound('incorrect');
    } catch (err) {
      console.error('Failed to reset progress:', err);
      showError('Failed to reset progress. Please try again.');
    }
  };

  // Show error message
  const showError = (message: string) => {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-out';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  };

  // Utility functions for enhanced features
  const toggleFavorite = (wordId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(wordId)) {
        newFavorites.delete(wordId);
      } else {
        newFavorites.add(wordId);
      }
      // Save to localStorage
      localStorage.setItem('dictionary_favorites', JSON.stringify([...newFavorites]));
      return newFavorites;
    });
  };

  const addWordNote = (wordId: string, content: string, tags: string[] = []) => {
    const newNote: WordNote = {
      id: uuidv4(),
      wordId,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags
    };
    setWordNotes(prev => ({
      ...prev,
      [wordId]: [...(prev[wordId] || []), newNote]
    }));
    // Save to localStorage
    localStorage.setItem('dictionary_notes', JSON.stringify(wordNotes));
  };

  const createCustomWordList = (name: string, description: string, words: string[], tags: string[] = [], isPublic: boolean = false) => {
    const newList: CustomWordList = {
      id: uuidv4(),
      name,
      description,
      words,
      createdAt: new Date(),
      lastModified: new Date(),
      tags,
      isPublic
    };
    setCustomWordLists(prev => [...prev, newList]);
    // Save to localStorage
    localStorage.setItem('dictionary_word_lists', JSON.stringify([...customWordLists, newList]));
  };

  const updateRecentlyViewed = (wordId: string) => {
    setRecentlyViewed(prev => {
      const newList = [wordId, ...prev.filter(id => id !== wordId)].slice(0, 10);
      // Save to localStorage
      localStorage.setItem('dictionary_recently_viewed', JSON.stringify(newList));
      return newList;
    });
  };

  const generateWordOfTheDay = useCallback(() => {
    const availableWords = items.filter(word => {
      const wordId = 'japanese' in word ? word.japanese : word.character;
      return !favorites.has(wordId) && !recentlyViewed.includes(wordId);
    });
    
    if (availableWords.length > 0) {
      const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
      setWordOfTheDay(randomWord as EnhancedDictionaryItem);
      // Save to localStorage with date
      localStorage.setItem('dictionary_word_of_day', JSON.stringify({
        word: randomWord,
        date: new Date().toISOString()
      }));
    }
  }, [items, favorites, recentlyViewed]);

  const createWordChallenge = (type: 'daily' | 'weekly' | 'custom', words: string[], difficulty: WordDifficulty, timeLimit?: number) => {
    const newChallenge: WordChallenge = {
      id: uuidv4(),
      type,
      words,
      difficulty,
      timeLimit,
      bonusPoints: type === 'daily' ? 50 : type === 'weekly' ? 100 : 25,
      completed: false,
      score: 0,
      startDate: new Date(),
      endDate: new Date(Date.now() + (type === 'daily' ? 86400000 : type === 'weekly' ? 604800000 : 3600000))
    };
    setWordChallenges(prev => [...prev, newChallenge]);
    // Save to localStorage
    localStorage.setItem('dictionary_challenges', JSON.stringify([...wordChallenges, newChallenge]));
  };

  const updateWordMastery = (wordId: string, score: number, mistakes: string[] = []) => {
    setWordMastery(prev => {
      const currentMastery = prev[wordId] || {
        level: 'beginner',
        progress: 0,
        lastPracticed: new Date(),
        practiceHistory: []
      };

      const newHistory = [...currentMastery.practiceHistory, {
        date: new Date(),
        score,
        mistakes
      }];

      // Calculate new mastery level based on history
      const recentHistory = newHistory.slice(-5);
      const averageScore = recentHistory.reduce((sum, h) => sum + h.score, 0) / recentHistory.length;
      const newLevel = averageScore >= 0.9 ? 'master' :
                      averageScore >= 0.8 ? 'advanced' :
                      averageScore >= 0.6 ? 'intermediate' : 'beginner';

      const updatedMastery: WordMastery = {
        level: newLevel,
        progress: averageScore,
        lastPracticed: new Date(),
        practiceHistory: newHistory
      };

      // Save to localStorage
      localStorage.setItem('dictionary_mastery', JSON.stringify({
        ...prev,
        [wordId]: updatedMastery
      }));

      return {
        ...prev,
        [wordId]: updatedMastery
      };
    });
  };

  // Load saved data from localStorage on component mount
  useEffect(() => {
    const loadSavedData = () => {
      const savedFavorites = localStorage.getItem('dictionary_favorites');
      if (savedFavorites) {
        setFavorites(new Set(JSON.parse(savedFavorites)));
      }

      const savedNotes = localStorage.getItem('dictionary_notes');
      if (savedNotes) {
        setWordNotes(JSON.parse(savedNotes));
      }

      const savedWordLists = localStorage.getItem('dictionary_word_lists');
      if (savedWordLists) {
        setCustomWordLists(JSON.parse(savedWordLists));
      }

      const savedRecentlyViewed = localStorage.getItem('dictionary_recently_viewed');
      if (savedRecentlyViewed) {
        setRecentlyViewed(JSON.parse(savedRecentlyViewed));
      }

      const savedWordOfDay = localStorage.getItem('dictionary_word_of_day');
      if (savedWordOfDay) {
        const { word, date } = JSON.parse(savedWordOfDay);
        // Only set if it's from today
        if (new Date(date).toDateString() === new Date().toDateString()) {
          setWordOfTheDay(word);
        } else {
          generateWordOfTheDay();
        }
      } else {
        generateWordOfTheDay();
      }

      const savedChallenges = localStorage.getItem('dictionary_challenges');
      if (savedChallenges) {
        setWordChallenges(JSON.parse(savedChallenges));
      }

      const savedMastery = localStorage.getItem('dictionary_mastery');
      if (savedMastery) {
        setWordMastery(JSON.parse(savedMastery));
      }
    };

    loadSavedData();
  }, []);

  // Add function to calculate level statistics
  const calculateLevelStats = useCallback(() => {
    const stats: LevelStats[] = [];
    
    // Get all unlocked levels
    const levels = wordLevels.filter(level => unlockedLevels.includes(level.level));
    
    levels.forEach(level => {
      const levelWords = items.filter(word => 
        'japanese' in word && level.words.some(w => w.japanese === word.japanese)
      );
      
      const levelStat: LevelStats = {
        level: level.level,
        totalWords: levelWords.length,
        masteredWords: levelWords.filter(word => {
          const key = `${mode}-${word.japanese}`;
          return progress[key]?.correct >= 3;
        }).length,
        inProgressWords: levelWords.filter(word => {
          const key = `${mode}-${word.japanese}`;
          return progress[key]?.correct > 0 && progress[key]?.correct < 3;
        }).length,
        notStartedWords: levelWords.filter(word => {
          const key = `${mode}-${word.japanese}`;
          return !progress[key] || progress[key]?.correct === 0;
        }).length
      };
      
      stats.push(levelStat);
    });
    
    setLevelStats(stats);
  }, [mode, progress, unlockedLevels, items]);

  // Update level stats when progress or unlocked levels change
  useEffect(() => {
    calculateLevelStats();
  }, [calculateLevelStats, progress, unlockedLevels]);

  // Modify the filtering logic to include level filter
  useEffect(() => {
    console.log('=== Dictionary Filtering Debug ===');
    console.log('Starting filtering...');
    console.log('Initial items count:', items.length);
    console.log('Initial items sample:', items.slice(0, 3));
    console.log('Current mode:', mode);
    
    let filtered = items;

    // Apply mode-based filtering first
    if (mode !== 'all') {
      console.log('Applying mode filter:', mode);
      filtered = filtered.filter(item => {
        if (mode === 'hiragana' && !('isHiragana' in item ? item.isHiragana : false)) return false;
        if (mode === 'katakana' && !('isKatakana' in item ? item.isKatakana : false)) return false;
        if (mode === 'kanji' && !('kanji' in item ? item.kanji : false)) return false;
        return true;
      });
      console.log('After mode filter:', filtered.length);
      console.log('Mode filter sample:', filtered.slice(0, 3));
    }

    // Apply search filter
    if (searchTerm.trim()) {
      console.log('Applying search filter for:', searchTerm);
      filtered = filtered.filter(item => {
        const searchLower = searchTerm.toLowerCase().trim();

        // Search in Japanese text
        const japaneseText = 'japanese' in item ? item.japanese : item.character;
        if (japaneseText.toLowerCase().includes(searchLower)) {
          console.log('Match found in Japanese:', japaneseText);
          return true;
        }

        // Search in English text
        if ('english' in item && item.english.toLowerCase().includes(searchLower)) {
          console.log('Match found in English:', item.english);
          return true;
        }

        // Search in romaji
        if ('romaji' in item && item.romaji?.toLowerCase().includes(searchLower)) {
          console.log('Match found in romaji:', item.romaji);
          return true;
        }

        // Search in meanings for kanji
        if ('meanings' in item && Array.isArray(item.meanings) && 
            item.meanings.some((meaning: string) => meaning.toLowerCase().includes(searchLower))) {
          console.log('Match found in meanings:', item.meanings);
          return true;
        }

        // Search in readings for kanji
        if ('readings' in item && Array.isArray(item.readings) && 
            item.readings.some((reading: string) => reading.toLowerCase().includes(searchLower))) {
          console.log('Match found in readings:', item.readings);
          return true;
        }

        return false;
      });
      console.log('After search filter:', filtered.length);
      console.log('Search filter sample:', filtered.slice(0, 3));
    }

    // Apply level filter only if explicitly set
    if (levelFilter !== 'all') {
      console.log('Applying level filter for level:', levelFilter);
      filtered = filtered.filter(item => {
        const wordLevel = wordLevels.find(level => 
          level.words.some(w => w.japanese === ('japanese' in item ? item.japanese : item.character))
        );
        const matches = wordLevel?.level === levelFilter;
        if (matches) {
          console.log('Match found for level:', item.japanese);
        }
        return matches;
      });
      console.log('After level filter:', filtered.length);
      console.log('Level filter sample:', filtered.slice(0, 3));
    }

    // Apply status filter
    if (filter !== 'all') {
      console.log('Applying status filter:', filter);
      filtered = filtered.filter(item => {
        const key = `${mode}-${'japanese' in item ? item.japanese : item.character}`;
        const itemProgress = localProgress[key];
        
        switch (filter) {
          case 'unmarked':
            return !itemProgress || itemProgress.correct === 0;
          case 'marked':
            return itemProgress && itemProgress.correct > 0 && itemProgress.correct < 3;
          case 'mastered':
            return itemProgress && itemProgress.correct >= 3;
          default:
            return true;
        }
      });
      console.log('After status filter:', filtered.length);
      console.log('Status filter sample:', filtered.slice(0, 3));
    }

    // Sort the filtered items
    console.log('Applying sort:', sortBy);
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'japanese':
          return ('japanese' in a ? a.japanese : a.character).localeCompare(
            'japanese' in b ? b.japanese : b.character,
            'ja'
          );
        case 'english':
          return ('english' in a ? a.english : a.meaning).localeCompare(
            'english' in b ? b.english : b.meaning
          );
        case 'progress':
          const progressA = localProgress[`${mode}-${'japanese' in a ? a.japanese : a.character}`]?.correct || 0;
          const progressB = localProgress[`${mode}-${'japanese' in b ? b.japanese : b.character}`]?.correct || 0;
          return progressB - progressA;
        default:
          return 0;
      }
    });
    console.log('After sorting:', filtered.length);
    console.log('Sorting sample:', filtered.slice(0, 3));

    console.log('Final filtered count:', filtered.length);
    console.log('Final filtered sample:', filtered.slice(0, 3));
    console.log('=== End Dictionary Filtering Debug ===');

    setFilteredItems(filtered);
  }, [items, searchTerm, levelFilter, filter, sortBy, mode, localProgress, wordLevels]);

  // Add motivation messages
  const showMotivation = (type: 'positive' | 'encouragement') => {
    const messages = {
      positive: [
        "Great job! Keep going! 🌟",
        "You're making progress! 🎯",
        "Well done! Keep it up! 💪"
      ],
      encouragement: [
        "You've mastered this item! 🎉",
        "Excellent work! Keep learning! 📚",
        "You're doing amazing! 🌈"
      ]
    };

    const messageList = messages[type];
    const message = messageList[Math.floor(Math.random() * messageList.length)];
    
    // Show a temporary toast message
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-out';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 2000);
  };

  // Update the button to use mastery levels
  const renderButton = useCallback((item: DictionaryItem) => {
    const itemId = 'japanese' in item ? item.japanese : item.character;
    const key = `${mode}-${itemId}`;
    const masteryLevel = getMasteryLevel(itemId);
    console.log('Rendering button for', key, 'Mastery:', masteryLevel);
    
    const masteryInfo: Record<MasteryLevel, MasteryInfo> = {
      0: { icon: '○', color: isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300', text: 'Mark as learned' },
      1: { icon: '✓', color: 'bg-yellow-400 hover:bg-yellow-500', text: 'Almost there!' },
      2: { icon: '✓✓', color: 'bg-orange-400 hover:bg-orange-500', text: 'Getting closer!' },
      3: { icon: '★', color: 'bg-green-500 hover:bg-green-600', text: 'Mastered!' }
    };

    // Ensure masteryLevel is a valid MasteryLevel
    if (!isValidMasteryLevel(masteryLevel)) {
      console.error('Invalid mastery level:', masteryLevel);
      return null;
    }

    const info = masteryInfo[masteryLevel];
    
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          incrementMastery(item);
        }}
        onContextMenu={(e) => resetProgress(item, e)}
        className={`p-2 rounded-full transition-all duration-200 transform hover:scale-105 ${info.color} text-white shadow`}
        title={`${info.text} (Right-click to reset)`}
      >
        <span className="text-lg font-bold">{info.icon}</span>
      </button>
    );
  }, [isDarkMode, mode, getMasteryLevel, incrementMastery, resetProgress]);

  const handleItemClick = (item: DictionaryItem) => {
    // Only check level restrictions for practice/quizzes, not for dictionary browsing
    if (mode === 'practice' || mode === 'quiz') {
      const wordLevel = wordLevels.find(level => 
        level.words.some(w => w.japanese === ('japanese' in item ? item.japanese : item.character))
      );

      if (wordLevel && !unlockedLevels.includes(wordLevel.level)) {
        setShowLockedAlert(true);
        return;
      }
    }

    setSelectedItem(item);
  };

  // Initialize audio on component mount
  useEffect(() => {
    const initializeAudioContext = async () => {
      if (!audioInitialized) {
        console.log('[Dictionary] Initializing audio context...');
        try {
          const context = await initializeAudio();
          if (context) {
            setAudioInitialized(true);
            console.log('[Dictionary] Audio context initialized successfully');
          }
        } catch (error) {
          console.error('[Dictionary] Failed to initialize audio context:', error);
        }
      }
    };

    // For iOS, we need to wait for user interaction
    if (isIOS) {
      const handleInteraction = async () => {
        await initializeAudioContext();
      };

      const events = ['click', 'touchstart', 'keydown'];
      events.forEach(event => {
        document.addEventListener(event, handleInteraction, { once: true, passive: true });
      });

      return () => {
        events.forEach(event => {
          document.removeEventListener(event, handleInteraction);
        });
      };
    } else {
      // For non-iOS devices, initialize immediately
      initializeAudioContext();
    }
  }, [audioInitialized]);

  const handlePlayAudio = async (japanese: string) => {
    if (isAudioLoading) {
      console.log('[Dictionary] Audio is already loading, ignoring request');
      return;
    }

    console.log('[Dictionary] Play audio requested for:', japanese);
    setIsAudioLoading(true);

    try {
      if (!audioInitialized) {
        console.log('[Dictionary] Audio not initialized, attempting to initialize...');
        const context = await initializeAudio();
        if (context) {
          setAudioInitialized(true);
          // For iOS, ensure the context is resumed before playing
          if (isIOS) {
            try {
              if (context.state === 'suspended') {
                await context.resume();
                // Add a small delay to ensure the context is fully resumed
                await new Promise(resolve => setTimeout(resolve, 100));
              }
            } catch (error) {
              console.error('[Dictionary] iOS: Failed to resume audio context:', error);
              setIsAudioLoading(false);
              return;
            }
          }
        }
      }

      await playAudio(japanese);
    } catch (error) {
      console.error('[Dictionary] Error playing audio:', error);
    } finally {
      setIsAudioLoading(false);
    }
  };

  const renderLockedAlert = () => (
    <Dialog
      open={showLockedAlert}
      onClose={() => setShowLockedAlert(false)}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'var(--background-lighter)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)'
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'var(--text-primary)' }}>
          <LockIcon color="warning" />
          <Typography color="inherit">Word Locked</Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ bgcolor: 'var(--background-lighter)', color: 'var(--text-primary)' }}>
        <Alert severity="info" sx={{ mt: 2, bgcolor: 'var(--background-lightest)', color: 'var(--text-primary)' }}>
          This word is not yet available at your current level. Continue practicing to unlock more words!
        </Alert>
        <Box sx={{ mt: 2, color: 'var(--text-primary)' }}>
          <Typography variant="body1" gutterBottom color="inherit">
            To unlock more words:
          </Typography>
          <ul className="list-disc pl-5 text-text-primary">
            <li>Complete quizzes for your current level</li>
            <li>Master the required number of words</li>
            <li>Practice reading materials</li>
            <li>Meet the level requirements to advance</li>
          </ul>
        </Box>
      </DialogContent>
      <DialogActions sx={{ bgcolor: 'var(--background-lighter)', borderTop: '1px solid var(--border-color)' }}>
        <Button 
          onClick={() => setShowLockedAlert(false)}
          sx={{
            color: 'var(--text-primary)',
            '&:hover': {
              bgcolor: 'var(--background-lightest)'
            }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderItem = (item: DictionaryItem) => {
    const wordLevel = wordLevels.find(level => 
      level.words.some(w => w.japanese === ('japanese' in item ? item.japanese : item.character))
    );
    const isLocked = wordLevel && !unlockedLevels.includes(wordLevel.level);
    const isMarked = isItemMarked('japanese' in item ? item.japanese : item.character);

    return (
      <Box
        key={item.japanese}
        onClick={() => handleItemClick(item)}
        sx={{
          cursor: isLocked ? 'not-allowed' : 'pointer',
          opacity: isLocked ? 0.6 : 1,
          position: 'relative',
          '&:hover': {
            backgroundColor: isLocked ? 'inherit' : 'action.hover'
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" component="div">
              {item.japanese}
            </Typography>
            <button
              onClick={e => {
                e.stopPropagation();
                handlePlayAudio(item.japanese);
              }}
              title="Play Audio"
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2em' }}
            >
              🔊
            </button>
            {isLocked && (
              <LockIcon color="action" fontSize="small" />
            )}
            {wordLevel && !isLocked && (
              <Chip
                size="small"
                label={`Level ${wordLevel.level}`}
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
          <Typography color="text.secondary">
            {item.english}
          </Typography>
          {item.romaji && (
            <Typography variant="body2" color="text.secondary">
              {item.romaji}
            </Typography>
          )}
          {/* Mark as Learned button for non-kanji words */}
          {'japanese' in item && !isLocked && (
            <Button
              onClick={e => {
                e.stopPropagation();
                incrementMastery(item);
                playSound('correct');
              }}
              variant={isMarked ? 'contained' : 'outlined'}
              color={isMarked ? 'success' : 'primary'}
              size="small"
              sx={{ mt: 1 }}
            >
              {isMarked ? '✓ Learned' : 'Mark as Learned'}
            </Button>
          )}
        </Box>
      </Box>
    );
  };

  const renderWordDetails = (item: DictionaryItem) => {
    if ('character' in item) {
      // Kanji details rendering
      return (
        <Dialog
          open={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                {item.character}
              </Typography>
              <button
                onClick={() => handlePlayAudio(item.character)}
                title="Play Audio"
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2em' }}
              >
                🔊
              </button>
              <Chip
                label={item.difficulty}
                color={
                  item.difficulty === 'beginner' ? 'success' :
                  item.difficulty === 'intermediate' ? 'warning' :
                  'error'
                }
                size="small"
              />
              {item.jlptLevel && (
                <Chip
                  label={item.jlptLevel}
                  color="primary"
                  size="small"
                />
              )}
            </Box>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2}>
              {/* Basic Information */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  className: themeClasses.card
                }}
              >
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  Basic Information
                </Typography>
                <Box sx={{ pl: 2 }}>
                  <Typography variant="body1" gutterBottom>
                    <strong>Meaning:</strong> {item.meaning}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Reading:</strong> {item.reading}
                  </Typography>
                  {item.romaji && (
                    <Typography variant="body1" gutterBottom>
                      <strong>Romaji:</strong> {item.romaji}
                    </Typography>
                  )}
                  <Typography variant="body1" gutterBottom>
                    <strong>Category:</strong> {item.category}
                  </Typography>
                </Box>
              </Box>

              {/* Example Words */}
              {item.examples && item.examples.length > 0 && (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    className: themeClasses.card
                  }}
                >
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Example Words
                  </Typography>
                  <Stack spacing={2}>
                    {item.examples.map((example, index) => (
                      <Box
                        key={index}
                        sx={{
                          p: 2,
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'divider'
                        }}
                        className={themeClasses.card}
                      >
                        <Typography variant="body1" gutterBottom>
                          {example.japanese}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {example.romaji}
                        </Typography>
                        <Typography variant="body1">
                          {example.english}
                        </Typography>
                        {example.notes && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1, fontStyle: 'italic' }}
                          >
                            Note: {example.notes}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Notes */}
              {item.notes && (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    className: themeClasses.card
                  }}
                >
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Additional Notes
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography variant="body2">{item.notes}</Typography>
                  </Box>
                </Box>
              )}

              {/* Progress */}
              {localProgress[`${mode}-${item.character}`] && (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    className: themeClasses.card
                  }}
                >
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Learning Progress
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <Chip
                        label={`${localProgress[`${mode}-${item.character}`].correct} correct`}
                        color="success"
                        size="small"
                      />
                      <Chip
                        label={`${localProgress[`${mode}-${item.character}`].total - localProgress[`${mode}-${item.character}`].correct} incorrect`}
                        color="error"
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Last practiced: {new Date(localProgress[`${mode}-${item.character}`].lastPracticed).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedItem(null)}>Close</Button>
          </DialogActions>
        </Dialog>
      );
    } else {
      // Word details rendering
      return (
        <Dialog
          open={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                {item.japanese}
              </Typography>
              <button
                onClick={() => handlePlayAudio(item.japanese)}
                title="Play Audio"
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2em' }}
              >
                🔊
              </button>
              <Chip
                label={item.difficulty}
                color={
                  item.difficulty === 'beginner' ? 'success' :
                  item.difficulty === 'intermediate' ? 'warning' :
                  'error'
                }
                size="small"
              />
              {item.jlptLevel && (
                <Chip
                  label={item.jlptLevel}
                  color="primary"
                  size="small"
                />
              )}
            </Box>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2}>
              {/* Basic Information */}
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  className: themeClasses.card
                }}
              >
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  Basic Information
                </Typography>
                <Box sx={{ pl: 2 }}>
                  <Typography variant="body1" gutterBottom>
                    <strong>English:</strong> {item.english}
                  </Typography>
                  {item.romaji && (
                    <Typography variant="body1" gutterBottom>
                      <strong>Romaji:</strong> {item.romaji}
                    </Typography>
                  )}
                  <Typography variant="body1" gutterBottom>
                    <strong>Category:</strong> {item.category}
                  </Typography>
                </Box>
              </Box>

              {/* Example Sentences */}
              {item.examples && item.examples.length > 0 && (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    className: themeClasses.card
                  }}
                >
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Example Sentences
                  </Typography>
                  <Stack spacing={2}>
                    {item.examples.map((example, index) => (
                      <Box
                        key={index}
                        sx={{
                          p: 2,
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'divider'
                        }}
                        className={themeClasses.card}
                      >
                        <Typography variant="body1" gutterBottom>
                          {example.japanese}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {example.romaji}
                        </Typography>
                        <Typography variant="body1">
                          {example.english}
                        </Typography>
                        {example.notes && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1, fontStyle: 'italic' }}
                          >
                            Note: {example.notes}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Notes */}
              {item.notes && (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    className: themeClasses.card
                  }}
                >
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Additional Notes
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography variant="body2">{item.notes}</Typography>
                  </Box>
                </Box>
              )}

              {/* Progress */}
              {localProgress[`${mode}-${item.japanese}`] && (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    className: themeClasses.card
                  }}
                >
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Learning Progress
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <Chip
                        label={`${localProgress[`${mode}-${item.japanese}`].correct} correct`}
                        color="success"
                        size="small"
                      />
                      <Chip
                        label={`${localProgress[`${mode}-${item.japanese}`].total - localProgress[`${mode}-${item.japanese}`].correct} incorrect`}
                        color="error"
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Last practiced: {new Date(localProgress[`${mode}-${item.japanese}`].lastPracticed).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedItem(null)}>Close</Button>
          </DialogActions>
        </Dialog>
      );
    }
  };

  // Add level statistics section to the UI
  const renderLevelStats = () => (
    <Box sx={{ mb: 4, p: 2, borderRadius: 1, bgcolor: 'var(--background-lighter)' }}>
      <Typography variant="h6" gutterBottom>
        Level Statistics
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
        {levelStats.map((stats) => (
          <Box
            key={stats.level}
            sx={{
              p: 2,
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              cursor: 'pointer',
              '&:hover': {
                opacity: 0.9
              }
            }}
            className={`${themeClasses.card} ${levelFilter === stats.level ? 'ring-2 ring-accent-red' : ''}`}
            onClick={() => setLevelFilter(levelFilter === stats.level ? 'all' : stats.level)}
          >
            <Typography variant="subtitle1" gutterBottom>
              Level {stats.level}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2">
                Total Words: {stats.totalWords}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Box sx={{ width: '100%', height: 8, bgcolor: 'grey.200', borderRadius: 1, overflow: 'hidden' }}>
                  <Box
                    sx={{
                      width: `${(stats.masteredWords / stats.totalWords) * 100}%`,
                      height: '100%',
                      bgcolor: 'success.main'
                    }}
                  />
                  <Box
                    sx={{
                      width: `${(stats.inProgressWords / stats.totalWords) * 100}%`,
                      height: '100%',
                      bgcolor: 'warning.main',
                      position: 'relative',
                      top: -8
                    }}
                  />
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Mastered: {stats.masteredWords} | In Progress: {stats.inProgressWords} | Not Started: {stats.notStartedWords}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );

  // Add level filter to the filters section
  const renderFilters = () => (
    <div className="mb-6 rounded-lg p-4 shadow-sm" style={{ backgroundColor: 'var(--background-lighter)' }}>
      <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">Filters</h2>
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Search
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Japanese, romaji, or English..."
            className={`w-full px-4 py-2 rounded-lg border ${
              isDarkMode 
                ? 'bg-gray-700 text-white border-gray-600' 
                : 'bg-white text-gray-800 border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>

        <div className="w-48">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Filter by Status
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
            className={`w-full px-4 py-2 rounded-lg border ${
              isDarkMode 
                ? 'bg-gray-700 text-white border-gray-600' 
                : 'bg-white text-gray-800 border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="all">All Items</option>
            <option value="unmarked">Unmarked</option>
            <option value="marked">Marked</option>
            <option value="mastered">Mastered</option>
          </select>
        </div>

        <div className="w-48">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Sort by
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'japanese' | 'english' | 'progress')}
            className={`w-full px-4 py-2 rounded-lg border ${
              isDarkMode 
                ? 'bg-gray-700 text-white border-gray-600' 
                : 'bg-white text-gray-800 border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="japanese">Japanese</option>
            <option value="english">English</option>
            <option value="progress">Progress</option>
          </select>
        </div>

        <div className="w-48">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Filter by Level
          </label>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className={`w-full px-4 py-2 rounded-lg border ${
              isDarkMode 
                ? 'bg-gray-700 text-white border-gray-600' 
                : 'bg-white text-gray-800 border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="all">All Levels</option>
            {wordLevels
              .filter(level => unlockedLevels.includes(level.level))
              .map(level => (
                <option key={level.level} value={level.level}>
                  Level {level.level}
                </option>
              ))}
          </select>
        </div>
      </div>
    </div>
  );

  // Handler to download current dictionary data as JSON
  const handleDownloadDictionary = () => {
    const dataStr = JSON.stringify(items, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dictionary-data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // New UI components for enhanced features
  const WordOfTheDayCard = () => {
    if (!wordOfTheDay) return null;

    return (
      <Box
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
          border: '1px solid var(--border-color)',
          bgcolor: 'var(--background-lighter)',
          boxShadow: 3,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '150px',
            height: '150px',
            background: `linear-gradient(45deg, ${isDarkMode ? '#1a237e' : '#e3f2fd'}, transparent)`,
            opacity: 0.1,
            transform: 'translate(30%, -30%) rotate(45deg)'
          }}
        />
        <Typography variant="h6" gutterBottom color={isDarkMode ? 'neon-blue' : 'primary'}>
          Word of the Day
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="h4" component="div" sx={{ fontFamily: 'Noto Sans JP, sans-serif' }}>
            {wordOfTheDay.japanese}
          </Typography>
          <button
            onClick={() => handlePlayAudio(wordOfTheDay.japanese)}
            className="text-2xl hover:opacity-80 transition-opacity"
            aria-label="Play pronunciation"
          >
            🔊
          </button>
          <Chip
            label={wordOfTheDay.frequency?.level || 'common'}
            color="primary"
            size="small"
            sx={{ ml: 'auto' }}
          />
        </Box>
        <Typography variant="body1" gutterBottom>
          {wordOfTheDay.english}
        </Typography>
        {wordOfTheDay.romaji && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {wordOfTheDay.romaji}
          </Typography>
        )}
        {wordOfTheDay.examples && wordOfTheDay.examples.length > 0 && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'var(--background-lightest)' }}>
            <Typography variant="subtitle2" gutterBottom color="primary">
              Example Usage:
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'Noto Sans JP, sans-serif' }}>
              {wordOfTheDay.examples[0].japanese}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {wordOfTheDay.examples[0].english}
            </Typography>
          </Box>
        )}
        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={favorites.has(wordOfTheDay.japanese) ? <StarIcon /> : <StarBorderIcon />}
            onClick={() => toggleFavorite(wordOfTheDay.japanese)}
            color={favorites.has(wordOfTheDay.japanese) ? 'warning' : 'primary'}
          >
            {favorites.has(wordOfTheDay.japanese) ? 'Remove from Favorites' : 'Add to Favorites'}
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<InfoIcon />}
            onClick={() => setSelectedItem(wordOfTheDay)}
          >
            View Details
          </Button>
        </Box>
      </Box>
    );
  };

  const FavoritesSection = () => {
    const favoriteItems = items.filter(item => 
      favorites.has('japanese' in item ? item.japanese : item.character)
    );

    if (favoriteItems.length === 0) return null;

    return (
      <Box sx={{ mb: 4, bgcolor: 'var(--background)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" color={isDarkMode ? 'neon-blue' : 'primary'}>
            Favorites
          </Typography>
          <Chip
            label={`${favoriteItems.length} items`}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: 'repeat(2, 1fr)', 
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)'
          }, 
          gap: 2 
        }}>
          {favoriteItems.map(item => (
            <Box
              key={'japanese' in item ? item.japanese : item.character}
              sx={{
                p: 2,
                borderRadius: 1,
                border: '1px solid var(--border-color)',
                bgcolor: 'var(--background-lighter)',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 2,
                  bgcolor: 'var(--background-lightest)'
                }
              }}
              onClick={() => {
                setSelectedItem(item);
                updateRecentlyViewed('japanese' in item ? item.japanese : item.character);
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="h6" sx={{ fontFamily: 'Noto Sans JP, sans-serif' }}>
                  {'japanese' in item ? item.japanese : item.character}
                </Typography>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite('japanese' in item ? item.japanese : item.character);
                  }}
                  color="warning"
                >
                  <StarIcon />
                </IconButton>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {'english' in item ? item.english : item.meaning}
              </Typography>
              {('romaji' in item && item.romaji) && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  {item.romaji}
                </Typography>
              )}
              <Box sx={{ mt: 1, display: 'flex', gap: 0.5 }}>
                {('jlptLevel' in item && item.jlptLevel) && (
                  <Chip
                    label={item.jlptLevel}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
                {('difficulty' in item && item.difficulty) && (
                  <Chip
                    label={item.difficulty}
                    size="small"
                    color={
                      item.difficulty === 'beginner' ? 'success' :
                      item.difficulty === 'intermediate' ? 'warning' :
                      'error'
                    }
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  const CustomWordListsSection = () => {
    if (customWordLists.length === 0) return null;

    return (
      <Box sx={{ mb: 4, bgcolor: 'var(--background)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" color={isDarkMode ? 'neon-blue' : 'primary'}>
            Custom Word Lists
          </Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => {/* Open create list dialog */}}
          >
            Create New List
          </Button>
        </Box>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)'
          }, 
          gap: 2 
        }}>
          {customWordLists.map(list => (
            <Box
              key={list.id}
              sx={{
                p: 2,
                borderRadius: 1,
                border: '1px solid var(--border-color)',
                bgcolor: 'var(--background-lighter)',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 2,
                  bgcolor: 'var(--background-lightest)'
                }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {list.name}
                </Typography>
                {list.isPublic && (
                  <Chip
                    label="Public"
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                )}
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {list.description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                {list.tags.map(tag => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.75rem' }}
                  />
                ))}
              </Box>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  {list.words.length} words • Updated {new Date(list.lastModified).toLocaleDateString()}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => setSelectedWordList(list.id)}
                    title="View Words"
                  >
                    <ListIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {/* Open practice mode */}}
                    title="Practice"
                  >
                    <PlayArrowIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {/* Open edit dialog */}}
                    title="Edit List"
                  >
                    <EditIcon />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  const WordChallengesSection = () => {
    const activeChallenges = wordChallenges.filter(challenge => 
      !challenge.completed && new Date(challenge.endDate) > new Date()
    );

    if (activeChallenges.length === 0) return null;

    return (
      <Box sx={{ mb: 4, bgcolor: 'var(--background)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" color={isDarkMode ? 'neon-blue' : 'primary'}>
            Active Challenges
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => {/* Open create challenge dialog */}}
          >
            Create Challenge
          </Button>
        </Box>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)'
          }, 
          gap: 2 
        }}>
          {activeChallenges.map(challenge => (
            <Box
              key={challenge.id}
              sx={{
                p: 2,
                borderRadius: 1,
                border: '1px solid var(--border-color)',
                bgcolor: 'var(--background-lighter)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '100px',
                  height: '100px',
                  background: `linear-gradient(45deg, ${
                    challenge.difficulty === 'beginner' ? '#4caf50' :
                    challenge.difficulty === 'intermediate' ? '#ff9800' :
                    '#f44336'
                  }, transparent)`,
                  opacity: 0.1,
                  transform: 'translate(30%, -30%) rotate(45deg)'
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {challenge.type.charAt(0).toUpperCase() + challenge.type.slice(1)} Challenge
                </Typography>
                <Chip
                  label={challenge.difficulty}
                  color={
                    challenge.difficulty === 'beginner' ? 'success' :
                    challenge.difficulty === 'intermediate' ? 'warning' :
                    'error'
                  }
                  size="small"
                />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {challenge.words.length} words to master
                </Typography>
                {challenge.timeLimit && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Time limit: {Math.floor(challenge.timeLimit / 60)} minutes
                  </Typography>
                )}
                <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                  Bonus points: {challenge.bonusPoints}
                </Typography>
              </Box>
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  size="small"
                  fullWidth
                  startIcon={<PlayArrowIcon />}
                  onClick={() => {/* Start challenge */}}
                >
                  Start Challenge
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<InfoIcon />}
                  onClick={() => {/* View details */}}
                >
                  Details
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  const RecentlyViewedSection = () => {
    if (recentlyViewed.length === 0) return null;

    const recentlyViewedItems = items.filter(item => 
      recentlyViewed.includes('japanese' in item ? item.japanese : item.character)
    );

    return (
      <Box sx={{ mb: 4, bgcolor: 'var(--background)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" color={isDarkMode ? 'neon-blue' : 'primary'}>
            Recently Viewed
          </Typography>
          <Chip
            label={`${recentlyViewedItems.length} items`}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: 'repeat(2, 1fr)', 
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)'
          }, 
          gap: 2 
        }}>
          {recentlyViewedItems.map(item => (
            <Box
              key={'japanese' in item ? item.japanese : item.character}
              sx={{
                p: 2,
                borderRadius: 1,
                border: '1px solid var(--border-color)',
                bgcolor: 'var(--background-lighter)',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 2,
                  bgcolor: 'var(--background-lightest)'
                }
              }}
              onClick={() => {
                setSelectedItem(item);
                updateRecentlyViewed('japanese' in item ? item.japanese : item.character);
              }}
            >
              <Typography variant="h6" sx={{ fontFamily: 'Noto Sans JP, sans-serif' }}>
                {'japanese' in item ? item.japanese : item.character}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {'english' in item ? item.english : item.meaning}
              </Typography>
              {('romaji' in item && item.romaji) && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  {item.romaji}
                </Typography>
              )}
              <Box sx={{ mt: 1, display: 'flex', gap: 0.5 }}>
                {('jlptLevel' in item && item.jlptLevel) && (
                  <Chip
                    label={item.jlptLevel}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
                {('difficulty' in item && item.difficulty) && (
                  <Chip
                    label={item.difficulty}
                    size="small"
                    color={
                      item.difficulty === 'beginner' ? 'success' :
                      item.difficulty === 'intermediate' ? 'warning' :
                      'error'
                    }
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  // New render functions for enhanced features
  const renderVisualizations = () => (
    <Box sx={{ mt: 2 }}>
      <Stack direction="row" spacing={2}>
        <Button
          variant="outlined"
          startIcon={<TimelineIcon />}
          onClick={() => handleShowRelationships(selectedItem?.id || '')}
          disabled={!selectedItem}
        >
          Show Relationships
        </Button>
        <Button
          variant="outlined"
          startIcon={<CloudIcon />}
          onClick={handleShowWordCloud}
        >
          Show Word Cloud
        </Button>
        <Button
          variant="outlined"
          startIcon={<ShareIcon />}
          onClick={handleShowLearningPath}
        >
          Show Learning Path
        </Button>
      </Stack>

      {/* Visualization containers */}
      {showRelationships && (
        <Box ref={relationshipsRef} sx={{ mt: 2, height: 400, border: '1px solid var(--border-color)' }}>
          <WordRelationshipsVisualization
            data={visualizationData}
            container={relationshipsRef.current}
          />
        </Box>
      )}

      {showWordCloud && (
        <Box sx={{ mt: 2, height: 400, border: '1px solid var(--border-color)' }}>
          <WordCloudVisualization
            data={visualizationData || items}
            options={{
              colors: {
                background: isDarkMode ? '#1a1a1a' : '#ffffff',
                text: isDarkMode 
                  ? ['#64B5F6', '#81C784', '#FFB74D', '#E57373', '#BA68C8']
                  : ['#1976D2', '#388E3C', '#F57C00', '#D32F2F', '#7B1FA2'],
                highlight: isDarkMode ? '#FF4081' : '#D500F9'
              }
            }}
            height={400}
          />
        </Box>
      )}

      {showLearningPath && (
        <Box ref={learningPathRef} sx={{ mt: 2, height: 400, border: '1px solid var(--border-color)' }}>
          <LearningPathVisualization
            data={visualizationData}
            container={learningPathRef.current}
          />
        </Box>
      )}
    </Box>
  );

  const renderOfflineStatus = () => (
    <Alert
      severity={isOffline ? 'warning' : 'success'}
      sx={{ mb: 2 }}
      action={
        <Button
          color="inherit"
          size="small"
          startIcon={<SyncIcon />}
          onClick={() => setIsSyncing(true)}
          disabled={isSyncing}
        >
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </Button>
      }
    >
      {isOffline ? 'Working in offline mode' : 'Online mode'}
    </Alert>
  );

  const renderAdvancedSearch = () => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Advanced Search
      </Typography>
      <Stack spacing={2}>
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Search Fields
          </Typography>
          <Stack direction="row" spacing={1}>
            {['japanese', 'english', 'romaji'].map(field => (
              <Chip
                key={field}
                label={field}
                onClick={() => {
                  setSearchOptions(prev => ({
                    ...prev,
                    searchFields: prev.searchFields?.includes(field as any)
                      ? prev.searchFields.filter(f => f !== field)
                      : [...(prev.searchFields || []), field as any]
                  }));
                }}
                color={searchOptions.searchFields?.includes(field as any) ? 'primary' : 'default'}
                variant={searchOptions.searchFields?.includes(field as any) ? 'filled' : 'outlined'}
              />
            ))}
          </Stack>
        </Box>

        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Filters
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {Object.entries(searchOptions.filters || {}).map(([key, value]) => (
              <Chip
                key={key}
                label={`${key}: ${value}`}
                onDelete={() => {
                  setSearchOptions(prev => ({
                    ...prev,
                    filters: { ...prev.filters, [key]: undefined }
                  }));
                }}
              />
            ))}
          </Stack>
        </Box>

        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Sort By
          </Typography>
          <Stack direction="row" spacing={1}>
            {['frequency', 'mastery', 'lastViewed', 'level'].map(sort => (
              <Chip
                key={sort}
                label={sort}
                onClick={() => {
                  setSearchOptions(prev => ({
                    ...prev,
                    sortBy: sort as any
                  }));
                }}
                color={searchOptions.sortBy === sort ? 'primary' : 'default'}
                variant={searchOptions.sortBy === sort ? 'filled' : 'outlined'}
              />
            ))}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );

  // Check database readiness
  useEffect(() => {
    const checkDatabase = async () => {
      if (!db) {
        setDbError(new Error('Database not initialized'));
        return;
      }

      try {
        // Verify we can access the required stores
        const requiredStores = ['words', 'wordRelationships', 'wordEtymology', 'wordFrequency'];
        const transaction = db.transaction(requiredStores, 'readonly');
        
        // Wait for transaction to complete
        await new Promise((resolve, reject) => {
          transaction.oncomplete = resolve;
          transaction.onerror = () => reject(transaction.error);
        });

        setIsDbReady(true);
        setDbError(null);
      } catch (error) {
        console.error('Database verification failed:', error);
        setDbError(error instanceof Error ? error : new Error('Failed to verify database'));
        setIsDbReady(false);
      }
    };

    checkDatabase();
  }, [db]);

  // Show loading state while database is initializing
  if (!isDbReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          {dbError ? (
            <>
              <h2 className="text-xl font-bold text-red-600 mb-2">Database Error</h2>
              <p className="text-gray-600 dark:text-gray-300">{dbError.message}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Retry
              </button>
            </>
          ) : (
            <>
              <CircularProgress />
              <p className="mt-4 text-gray-600 dark:text-gray-300">Loading dictionary...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {renderOfflineStatus()}
      
      <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
        <Tab label="Dictionary" />
        <Tab label="Advanced Search" />
        <Tab label="Visualizations" />
      </Tabs>

      {activeTab === 0 && (
        <>
          {renderFilters()}
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              {filteredItems.map(item => renderItem(item))}
            </Box>
          )}
        </>
      )}

      {activeTab === 1 && renderAdvancedSearch()}

      {activeTab === 2 && renderVisualizations()}

      {selectedItem && (
        <Dialog
          open={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                {selectedItem.japanese}
              </Typography>
              <IconButton onClick={() => handlePlayAudio(selectedItem.japanese)}>
                🔊
              </IconButton>
              <IconButton
                onClick={() => toggleFavorite(selectedItem.id)}
                color={favorites.has(selectedItem.id) ? 'warning' : 'default'}
              >
                {favorites.has(selectedItem.id) ? <StarIcon /> : <StarBorderIcon />}
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2}>
              {/* ... existing dialog content ... */}
              {renderVisualizations()}
            </Stack>
          </DialogContent>
        </Dialog>
      )}

      {syncError && (
        <Alert severity="error" onClose={() => setSyncError(null)} sx={{ mt: 2 }}>
          {syncError}
        </Alert>
      )}
    </Box>
  );
};

export default Dictionary; 