import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useProgress, ProgressItem } from '../context/ProgressContext';
import { useWordLevel } from '../context/WordLevelContext';
import { allWords } from '../data/japaneseWords';
import { Kanji, kanjiList } from '../data/kanjiData';
import { useSound } from '../context/SoundContext';
import { kuroshiroInstance } from '../utils/kuroshiro';
import { romajiCache } from '../utils/romajiCache';
import { v4 as uuidv4 } from 'uuid';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, Stack, Chip, Button, Alert } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { wordLevels } from '../data/wordLevels';
import { playAudio, playDynamicAudio } from '../utils/audio';

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

const Dictionary: React.FC<DictionaryProps> = ({ mode }) => {
  const { isDarkMode } = useTheme();
  const { progress, updateProgress, setTotalItems } = useProgress();
  const { playSound } = useSound();
  const { currentLevel, unlockedLevels, getWordMasteryForLevel } = useWordLevel();
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

  // Sync local progress with context progress
  useEffect(() => {
    console.log('Progress context updated:', progress);
    setLocalProgress(progress);
  }, [progress]);

  // Load dictionary items based on mode and current level
  useEffect(() => {
    const loadItems = async () => {
      let loadedItems: DictionaryItem[] = [];
      let hiraganaFiltered: DictionaryItem[] = [];
      let katakanaFiltered: DictionaryItem[] = [];

      // Get all words up to the current level
      const availableWords = allWords.filter(word => {
        const wordLevel = wordLevels.find(level => 
          level.words.some(w => w.japanese === word.japanese)
        );
        return wordLevel && unlockedLevels.includes(wordLevel.level);
      });

      switch (mode) {
        case 'all':
          loadedItems = availableWords;
          break;
        case 'hiragana':
          hiraganaFiltered = availableWords.filter(item => /[\u3040-\u309F]/.test(item.japanese));
          loadedItems = hiraganaFiltered;
          break;
        case 'katakana':
          katakanaFiltered = availableWords.filter(item => /[\u30A0-\u30FF]/.test(item.japanese));
          loadedItems = katakanaFiltered;
          break;
        case 'kanji':
          // For kanji, we'll show all kanji but mark which ones are locked
          loadedItems = kanjiList;
          break;
      }
      setItems(loadedItems);
      setTotalItems(mode, loadedItems.length);
    };
    loadItems();
  }, [mode, currentLevel, unlockedLevels, setTotalItems]);

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

  // Add function to calculate level statistics
  const calculateLevelStats = useCallback(() => {
    const stats: LevelStats[] = [];
    
    // Get all unlocked levels
    const levels = wordLevels.filter(level => unlockedLevels.includes(level.level));
    
    levels.forEach(level => {
      const levelWords = allWords.filter(word => 
        level.words.some(w => w.japanese === word.japanese)
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
  }, [mode, progress, unlockedLevels]);

  // Update level stats when progress or unlocked levels change
  useEffect(() => {
    calculateLevelStats();
  }, [calculateLevelStats, progress, unlockedLevels]);

  // Modify the filtering logic to include level filter
  useEffect(() => {
    let filtered = items.filter(item => {
      const searchLower = searchTerm.toLowerCase().trim();
      if (!searchLower) return true;

      // Search in Japanese text
      const japaneseText = 'japanese' in item ? item.japanese : item.character;
      if (japaneseText.toLowerCase().includes(searchLower)) return true;

      // Search in English text
      if ('english' in item && item.english.toLowerCase().includes(searchLower)) return true;

      // Search in romaji
      if ('romaji' in item && item.romaji?.toLowerCase().includes(searchLower)) return true;

      // Search in meanings for kanji
      if ('meanings' in item && Array.isArray(item.meanings) && 
          item.meanings.some((meaning: string) => meaning.toLowerCase().includes(searchLower))) {
        return true;
      }

      // Search in readings for kanji
      if ('readings' in item && Array.isArray(item.readings) && 
          item.readings.some((reading: string) => reading.toLowerCase().includes(searchLower))) {
        return true;
      }

      return false;
    });

    // Apply level filter
    if (levelFilter !== 'all') {
      filtered = filtered.filter(item => {
        const wordLevel = wordLevels.find(level => 
          level.words.some(w => w.japanese === ('japanese' in item ? item.japanese : item.character))
        );
        return wordLevel?.level === levelFilter;
      });
    }

    // Apply filter after search
    filtered = filtered.filter(item => {
      const itemId = 'japanese' in item ? item.japanese : item.character;
      const marked = isItemMarked(itemId);

      switch (filter) {
        case 'unmarked':
          return !marked;
        case 'marked':
          return marked;
        case 'mastered':
          const key = `${mode}-${itemId}`;
          const itemProgress = localProgress[key];
          return marked && itemProgress?.correct >= 3; // Consider mastered after 3 correct attempts
        default:
          return true;
      }
    });

    // Sort items
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'japanese':
          const aText = 'japanese' in a ? a.japanese : a.character;
          const bText = 'japanese' in b ? b.japanese : b.character;
          return aText.localeCompare(bText, 'ja');
        case 'english':
          const aEng = 'english' in a ? a.english : '';
          const bEng = 'english' in b ? b.english : '';
          return aEng.localeCompare(bEng);
        case 'progress':
          const aId = 'japanese' in a ? a.japanese : a.character;
          const bId = 'japanese' in b ? b.japanese : b.character;
          const aProgress = localProgress[`${mode}-${aId}`]?.correct || 0;
          const bProgress = localProgress[`${mode}-${bId}`]?.correct || 0;
          return bProgress - aProgress;
        default:
          return 0;
      }
    });

    setFilteredItems(filtered);
    console.log('Filtered items (first 5):', filtered.slice(0, 5));
  }, [items, searchTerm, filter, sortBy, localProgress, mode, levelFilter]);

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
    // Check if the word is available at the current level
    const wordLevel = wordLevels.find(level => 
      level.words.some(w => w.japanese === ('japanese' in item ? item.japanese : item.character))
    );

    if (wordLevel && !unlockedLevels.includes(wordLevel.level)) {
      setShowLockedAlert(true);
      return;
    }

    setSelectedItem(item);
  };

  const handlePlayAudio = (japanese: string) => {
    playAudio(japanese);
  };

  const renderLockedAlert = () => (
    <Dialog
      open={showLockedAlert}
      onClose={() => setShowLockedAlert(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LockIcon color="warning" />
          <Typography>Word Locked</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mt: 2 }}>
          This word is not yet available at your current level. Continue practicing to unlock more words!
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" gutterBottom>
            To unlock more words:
          </Typography>
          <ul className="list-disc pl-5">
            <li>Complete quizzes for your current level</li>
            <li>Master the required number of words</li>
            <li>Practice reading materials</li>
            <li>Meet the level requirements to advance</li>
          </ul>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowLockedAlert(false)}>Close</Button>
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
              <Box>
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
                <Box>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Example Words
                  </Typography>
                  <Stack spacing={2}>
                    {item.examples.map((example, index) => (
                      <Box
                        key={index}
                        sx={{
                          p: 2,
                          bgcolor: 'background.paper',
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'divider'
                        }}
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
                <Box>
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
                <Box>
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
              <Box>
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
                <Box>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Example Sentences
                  </Typography>
                  <Stack spacing={2}>
                    {item.examples.map((example, index) => (
                      <Box
                        key={index}
                        sx={{
                          p: 2,
                          bgcolor: 'background.paper',
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'divider'
                        }}
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
                <Box>
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
                <Box>
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
    <Box sx={{ mb: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
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
              bgcolor: levelFilter === stats.level ? 'action.selected' : 'background.paper',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }}
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
    <div className="mb-6 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 shadow-sm">
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

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Download Button */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={handleDownloadDictionary}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
        >
          Download Dictionary Data
        </button>
      </div>
      {/* Stats section */}
      <div className="mb-6 flex flex-wrap gap-4 text-sm">
        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
          Total Items: {items.length}
        </span>
        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
          Started: {items.filter(item => 
            getMasteryLevel('japanese' in item ? item.japanese : item.character) > 0
          ).length}
        </span>
        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
          Almost Mastered: {items.filter(item => {
            const itemId = 'japanese' in item ? item.japanese : item.character;
            return getMasteryLevel(itemId) === 2;
          }).length}
        </span>
        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
          Mastered: {items.filter(item => {
            const itemId = 'japanese' in item ? item.japanese : item.character;
            return getMasteryLevel(itemId) === 3;
          }).length}
        </span>
        {isRomajiLoading && (
          <span className="text-blue-500">
            Loading romaji... {Object.keys(romajiMap).length}/{items.length} cached
            {Object.keys(romajiMap).length > 0 && ` (${Math.round((Object.keys(romajiMap).length / items.length) * 100)}%)`}
          </span>
        )}
        {romajiError && (
          <span className="text-red-500">
            {romajiError}
          </span>
        )}
      </div>

      {/* Level Statistics */}
      {renderLevelStats()}

      {/* Filters */}
      {renderFilters()}

      {/* Word list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => renderItem(item))}
      </div>
    </div>
  );
};

export default Dictionary; 