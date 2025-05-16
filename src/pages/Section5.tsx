import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useProgress } from '../context/ProgressContext';
import { useWordLevel } from '../context/WordLevelContext';
import { useSound } from '../context/SoundContext';
import { kuroshiroInstance } from '../utils/kuroshiro';
import { allWords } from '../data/japaneseWords';
import { wordLevels } from '../data/wordLevels';
import { Box, Typography, Stack, Chip, Button, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import SettingsPanel from '../components/Settings';

interface Category {
  id: string;
  name: string;
  words: typeof allWords;
}

// Add new interface for level statistics
interface LevelStats {
  level: number;
  totalWords: number;
  masteredWords: number;
  inProgressWords: number;
  notStartedWords: number;
}

const Section5 = () => {
  const { settings } = useApp();
  const { progress, updateProgress } = useProgress();
  const { currentLevel, unlockedLevels } = useWordLevel();
  const { playSound } = useSound();
  const [selectedCategory, setSelectedCategory] = useState<string>('all-words');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [totalWords, setTotalWords] = useState<number>(0);
  const [romajiMap, setRomajiMap] = useState<{ [key: string]: string }>({});
  const [showLockedAlert, setShowLockedAlert] = useState(false);
  const [selectedWord, setSelectedWord] = useState<typeof allWords[0] | null>(null);
  const [levelFilter, setLevelFilter] = useState<number | 'all'>('all');
  const [levelStats, setLevelStats] = useState<LevelStats[]>([]);

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
          const key = `vocabulary-${word.japanese}`;
          return progress[key]?.correct >= 3;
        }).length,
        inProgressWords: levelWords.filter(word => {
          const key = `vocabulary-${word.japanese}`;
          return progress[key]?.correct > 0 && progress[key]?.correct < 3;
        }).length,
        notStartedWords: levelWords.filter(word => {
          const key = `vocabulary-${word.japanese}`;
          return !progress[key] || progress[key]?.correct === 0;
        }).length
      };
      
      stats.push(levelStat);
    });
    
    setLevelStats(stats);
  }, [progress, unlockedLevels]);

  // Update level stats when progress or unlocked levels change
  useEffect(() => {
    calculateLevelStats();
  }, [calculateLevelStats, progress, unlockedLevels]);

  // Modify getAvailableWords to include level filter
  const getAvailableWords = () => {
    return allWords.filter(word => {
      const wordLevel = wordLevels.find(level => 
        level.words.some(w => w.japanese === word.japanese)
      );
      const isAvailable = wordLevel && unlockedLevels.includes(wordLevel.level);
      const matchesLevel = levelFilter === 'all' || wordLevel?.level === levelFilter;
      return isAvailable && matchesLevel;
    });
  };

  // Dynamically generate categories from available words
  const availableWords = getAvailableWords();
  const dynamicCategories = Array.from(
    availableWords.reduce((map, word) => {
      if (!map.has(word.category)) map.set(word.category, []);
      map.get(word.category).push(word);
      return map;
    }, new Map<string, typeof availableWords>())
  ).map(([cat, words]) => ({
    id: `cat-${cat}`,
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    words
  }));

  // Add the 'All Words' category
  const allWordsCategory = {
    id: 'all-words',
    name: 'All Words',
    words: availableWords
  };

  // Combine all categories for the UI
  const categories: Category[] = [allWordsCategory, ...dynamicCategories].filter(cat => cat.words.length > 0);

  const currentCategory = categories.find(cat => cat.id === selectedCategory);
  const filteredWords = currentCategory?.words.filter(word => 
    word.japanese.toLowerCase().includes(searchTerm.toLowerCase()) ||
    word.english.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const section = 'vocabulary';
  const completedWords = currentCategory
    ? currentCategory.words.filter(word => progress[`${section}-${word.japanese}`]?.correct > 0).length
    : 0;

  useEffect(() => {
    if (currentCategory) {
      setTotalWords(currentCategory.words.length);
    }
  }, [currentCategory]);

  const handleWordClick = (word: typeof allWords[0]) => {
    const wordLevel = wordLevels.find(level => 
      level.words.some(w => w.japanese === word.japanese)
    );

    if (wordLevel && !unlockedLevels.includes(wordLevel.level)) {
      setShowLockedAlert(true);
      return;
    }

    setSelectedWord(word);
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

  const renderLevelStats = () => (
    <Box sx={{ mb: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
      <Typography variant="h6" gutterBottom>
        Level Progress
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

  const renderLevelFilter = () => (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle2" gutterBottom>
        Filter by Level
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button
          variant={levelFilter === 'all' ? 'contained' : 'outlined'}
          onClick={() => setLevelFilter('all')}
          size="small"
        >
          All Levels
        </Button>
        {wordLevels
          .filter(level => unlockedLevels.includes(level.level))
          .map(level => (
            <Button
              key={level.level}
              variant={levelFilter === level.level ? 'contained' : 'outlined'}
              onClick={() => setLevelFilter(level.level)}
              size="small"
            >
              Level {level.level}
              <Chip
                size="small"
                label={levelStats.find(s => s.level === level.level)?.totalWords || 0}
                sx={{ ml: 1 }}
              />
            </Button>
          ))}
      </Box>
    </Box>
  );

  const renderWord = (word: typeof allWords[0]) => {
    const wordLevel = wordLevels.find(level => 
      level.words.some(w => w.japanese === word.japanese)
    );
    const isLocked = wordLevel && !unlockedLevels.includes(wordLevel.level);
    const key = `${section}-${word.japanese}`;
    const isMarked = progress[key]?.correct > 0;

    return (
      <Box
        key={word.japanese}
        onClick={() => handleWordClick(word)}
        sx={{
          cursor: isLocked ? 'not-allowed' : 'pointer',
          opacity: isLocked ? 0.6 : 1,
          position: 'relative',
          '&:hover': {
            backgroundColor: isLocked ? 'inherit' : 'action.hover'
          }
        }}
        className="bg-gray-50 p-4 rounded-lg"
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h6" component="h3">
              {word.japanese}
            </Typography>
            {settings.showRomajiVocabulary && (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                {romajiMap[word.japanese.trim()] || 'Loading...'}
              </Typography>
            )}
            <Typography variant="body1" color="text.secondary">
              {word.english}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {isLocked && <LockIcon color="action" fontSize="small" />}
            {wordLevel && !isLocked && (
              <Chip
                size="small"
                label={`Level ${wordLevel.level}`}
                color="primary"
                variant="outlined"
              />
            )}
            <Chip
              size="small"
              label={word.difficulty}
              color={
                word.difficulty === 'easy' ? 'success' :
                word.difficulty === 'medium' ? 'warning' :
                'error'
              }
              variant="outlined"
            />
          </Box>
        </Box>

        {'synonym' in word && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Synonym: {word.synonym} | Antonym: {word.antonym}
          </Typography>
        )}

        {'related' in word && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Related words: {word.related.join(', ')}
          </Typography>
        )}

        {'usage' in word && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Usage: {word.usage}
          </Typography>
        )}

        {'literal' in word && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Literal meaning: {word.literal}
          </Typography>
        )}

        <Button
          onClick={(e) => {
            e.stopPropagation();
            updateProgress(section, word.japanese, !isMarked);
            playSound(isMarked ? 'incorrect' : 'correct');
          }}
          variant={isMarked ? "contained" : "outlined"}
          color={isMarked ? "success" : "primary"}
          size="small"
          sx={{ mt: 2 }}
        >
          {isMarked ? '✓ Learned' : 'Mark as Learned'}
        </Button>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            component={Link}
            to="/"
            variant="outlined"
            color="primary"
          >
            ← Back to Home
          </Button>
          <Typography variant="h4" component="h1">
            Vocabulary Builder
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Progress: {completedWords}/{totalWords} words completed
        </Typography>
      </Box>

      {/* Level Statistics */}
      {renderLevelStats()}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
        <Box>
          {/* Level Filter */}
          {renderLevelFilter()}

          <Box sx={{ bgcolor: 'background.paper', borderRadius: 1, p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Choose a Category
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  variant={selectedCategory === category.id ? "contained" : "outlined"}
                  color="primary"
                  fullWidth
                >
                  {category.name}
                </Button>
              ))}
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <input
              type="text"
              placeholder="Search vocabulary..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </Box>

          <Stack spacing={2}>
            {filteredWords.map((word) => renderWord(word))}
          </Stack>
        </Box>

        <Box>
          <SettingsPanel />
        </Box>
      </Box>

      {renderLockedAlert()}
    </Box>
  );
};

export default Section5; 