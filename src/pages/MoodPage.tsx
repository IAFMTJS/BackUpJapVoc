import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  Card, Typography, Button, TextField, IconButton, Box, Grid, 
  CircularProgress, Alert, Snackbar, Chip, Tooltip, CardContent,
  Paper, Container, Fade, Zoom, Grow
} from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { playAudio } from '../utils/audio';
import { EmotionalCategory, MoodWord, EMOTIONAL_CATEGORIES } from '../types/mood';
import MoodSelector from '../components/MoodSelector';
import MoodStats from '../components/MoodStats';
import {
  getAllMoodWords as loadAllMoodWords,
  markWordAsMastered as updateWordMastery,
  getMoodWordsByCategory,
  getMasteredWords,
  updateMoodWord,
  deleteMoodWord
} from '../utils/moodWordOperations';
import { generateMoodWordAudio } from '../utils/audio';
import { openDB } from '../utils/indexedDB';
import { initializeMoodWords, getMoodWordsStatus } from '../utils/initMoodWords';
import { forceDatabaseReset } from '../utils/forceDatabaseReset';

const MoodPage: React.FC = () => {
  const { theme } = useTheme();
  const [words, setWords] = useState<MoodWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'mastered' | 'learning'>('all');
  const [selectedMoods, setSelectedMoods] = useState<EmotionalCategory[]>([]);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentPlayingWord, setCurrentPlayingWord] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const audioTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize and load mood words
  useEffect(() => {
    const initializeAndLoadWords = async () => {
      try {
        setLoading(true);
        console.log('Loading mood words...');
        
        // Load the words - this will automatically initialize if needed
        const moodWords = await loadAllMoodWords();
        console.log(`Loaded ${moodWords.length} mood words`);
        setWords(moodWords);
      } catch (error) {
        console.error('Error loading mood words:', error);
        // Even if there's an error, we can still show the built-in words
        setWords(MOOD_WORDS);
      } finally {
        setLoading(false);
      }
    };

    initializeAndLoadWords();
  }, []);

  const handlePlayAudio = async (word: MoodWord) => {
    // If already playing this word, do nothing
    if (isPlayingAudio && currentPlayingWord === word.japanese) {
      return;
    }

    // If playing a different word, stop it first
    if (isPlayingAudio) {
      try {
        await playAudio(currentPlayingWord);
      } catch (error) {
        console.error('Error stopping previous audio:', error);
      }
    }

    // Clear any existing timeout
    if (audioTimeoutRef.current) {
      clearTimeout(audioTimeoutRef.current);
    }

    try {
      setIsPlayingAudio(true);
      setCurrentPlayingWord(word.japanese);
      setAudioError(null);
      
      // Always use the Japanese text to play audio
      await playAudio(word.japanese);
      
    } catch (error) {
      console.error('Error playing audio:', error);
      setAudioError(error instanceof Error ? error.message : 'Failed to play audio');
    } finally {
      // Add a small delay before allowing next playback
      audioTimeoutRef.current = setTimeout(() => {
        setIsPlayingAudio(false);
        setCurrentPlayingWord(null);
      }, 100);
    }
  };

  const handleMarkAsMastered = async (wordId: string) => {
    try {
      const word = words.find(w => w.id === wordId);
      if (word) {
        await updateWordMastery(wordId, !word.mastered);
        setWords(words.map(w => 
          w.id === wordId 
            ? { ...w, mastered: !w.mastered, lastReviewed: new Date() }
            : w
        ));
      }
    } catch (error) {
      console.error('Error updating word mastery:', error);
    }
  };

  const handleReset = async () => {
    try {
      setLoading(true);
      setResetError(null);
      console.log('Resetting mood words...');
      
      // Force reset the database
      await forceDatabaseReset();
      console.log('Database reset complete');
      
      // Reinitialize mood words
      await initializeMoodWords();
      console.log('Mood words reinitialized');
      
      // Reload words
      const moodWords = await loadAllMoodWords();
      console.log(`Loaded ${moodWords.length} mood words`);
      setWords(moodWords);
    } catch (error) {
      console.error('Error resetting mood words:', error);
      setResetError(error instanceof Error ? error.message : 'Failed to reset mood words');
    } finally {
      setLoading(false);
    }
  };

  const filteredWords = words.filter(word => {
    // Safely handle potentially undefined or non-string values
    const searchTermLower = searchTerm.toLowerCase();
    const japaneseLower = (word.japanese || '').toLowerCase();
    const romajiLower = (word.romaji || '').toLowerCase();
    const englishLower = (word.english || '').toLowerCase();

    const matchesSearch = 
      japaneseLower.includes(searchTermLower) ||
      romajiLower.includes(searchTermLower) ||
      englishLower.includes(searchTermLower);
    
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'mastered' && word.mastered) ||
      (filter === 'learning' && !word.mastered);

    const matchesMoods =
      selectedMoods.length === 0 ||
      (word.emotionalContext?.category && selectedMoods.includes(word.emotionalContext.category));

    return matchesSearch && matchesFilter && matchesMoods;
  });

  // Helper function to safely get category color
  const getCategoryColor = (word: MoodWord) => {
    const category = word.emotionalContext?.category;
    return category && EMOTIONAL_CATEGORIES[category]?.color || '#ccc';
  };

  // Helper function to safely get category emoji
  const getCategoryEmoji = (word: MoodWord) => {
    const category = word.emotionalContext?.category;
    return category && EMOTIONAL_CATEGORIES[category]?.emoji || '❓';
  };

  // Helper function to safely get category name
  const getCategoryName = (word: MoodWord) => {
    const category = word.emotionalContext?.category;
    return category && EMOTIONAL_CATEGORIES[category]?.name || 'Unknown';
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioTimeoutRef.current) {
        clearTimeout(audioTimeoutRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <CircularProgress />
        {resetError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {resetError}
          </Alert>
        )}
      </div>
    );
  }

  return (
    <Container maxWidth="xl" className="py-8">
      {/* Add reset button */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          color="error"
          onClick={handleReset}
          disabled={loading}
        >
          Reset Mood Words
        </Button>
      </Box>

      {/* Hero Section with Mood Focus */}
      <Box 
        sx={{ 
          mb: 6,
          textAlign: 'center',
          background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
          borderRadius: 4,
          p: 4,
          color: 'white',
          boxShadow: 3
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Express Your Emotions in Japanese
        </Typography>
        <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
          Discover the perfect words for every feeling
        </Typography>
        
        {/* Prominent Mood Selector */}
        <Box sx={{ maxWidth: 800, mx: 'auto', mb: 2 }}>
          <MoodSelector
            selectedMoods={selectedMoods}
            onMoodSelect={setSelectedMoods}
            className="mood-selector-hero"
          />
        </Box>

        {/* Quick Stats */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mt: 3 }}>
          <Paper sx={{ p: 2, backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
            <Typography variant="h4">{words.length}</Typography>
            <Typography variant="subtitle2">Total Expressions</Typography>
          </Paper>
          <Paper sx={{ p: 2, backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
            <Typography variant="h4">{words.filter(w => w.mastered).length}</Typography>
            <Typography variant="subtitle2">Mastered</Typography>
          </Paper>
          <Paper sx={{ p: 2, backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
            <Typography variant="h4">{Object.keys(EMOTIONAL_CATEGORIES).length}</Typography>
            <Typography variant="subtitle2">Emotional Categories</Typography>
          </Paper>
        </Box>
      </Box>

      {/* Mood Statistics with Animation */}
      <Fade in={true} timeout={1000}>
        <Box sx={{ mb: 6 }}>
          <MoodStats words={words} />
        </Box>
      </Fade>

      {/* Search and Filter Section */}
      <Paper 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 2,
          background: 'linear-gradient(to right, #ffffff, #f8f9fa)'
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search expressions"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'center', md: 'flex-end' } }}>
              <Button
                variant={filter === 'all' ? 'contained' : 'outlined'}
                onClick={() => setFilter('all')}
                startIcon={<FilterListIcon />}
              >
                All
              </Button>
              <Button
                variant={filter === 'learning' ? 'contained' : 'outlined'}
                onClick={() => setFilter('learning')}
              >
                Learning
              </Button>
              <Button
                variant={filter === 'mastered' ? 'contained' : 'outlined'}
                onClick={() => setFilter('mastered')}
              >
                Mastered
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Selected Moods Display */}
        {selectedMoods.length > 0 && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {selectedMoods.map((mood, index) => (
              <Zoom in={true} style={{ transitionDelay: `${index * 50}ms` }} key={mood}>
                <Chip
                  label={EMOTIONAL_CATEGORIES[mood].name}
                  onDelete={() => setSelectedMoods(prev => prev.filter(m => m !== mood))}
                  icon={<span>{EMOTIONAL_CATEGORIES[mood].emoji}</span>}
                  sx={{
                    backgroundColor: `${EMOTIONAL_CATEGORIES[mood].emoji}20`,
                    border: `1px solid ${EMOTIONAL_CATEGORIES[mood].emoji}`,
                    '& .MuiChip-deleteIcon': {
                      color: 'inherit'
                    }
                  }}
                />
              </Zoom>
            ))}
          </Box>
        )}
      </Paper>

      {/* Words Grid with Animation */}
      <Grid container spacing={3}>
        {filteredWords.map((word, index) => (
          <Grid item xs={12} sm={6} md={4} key={word.id}>
            <Grow in={true} timeout={500} style={{ transitionDelay: `${index * 50}ms` }}>
              <Card 
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderLeft: `4px solid ${getCategoryColor(word)}`,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box className="flex justify-between items-start">
                    <Typography variant="h6" component="div">
                      {word.japanese}
                    </Typography>
                    <Box className="flex gap-1">
                      {word.emotionalContext && (
                        <Tooltip 
                          title={
                            <Box>
                              <Typography variant="subtitle2">
                                {getCategoryName(word)} (Intensity: {word.emotionalContext.intensity || 1}/5)
                              </Typography>
                              {word.emotionalContext.relatedEmotions?.length > 0 && (
                                <Typography variant="caption" display="block">
                                  Related: {word.emotionalContext.relatedEmotions.join(', ')}
                                </Typography>
                              )}
                            </Box>
                          }
                        >
                          <Chip
                            icon={<span>{getCategoryEmoji(word)}</span>}
                            label={getCategoryName(word)}
                            size="small"
                            sx={{
                              backgroundColor: getCategoryColor(word),
                              color: 'white',
                              cursor: 'help'
                            }}
                          />
                        </Tooltip>
                      )}
                      <IconButton
                        onClick={() => handleMarkAsMastered(word.id)}
                        color={word.mastered ? 'success' : 'default'}
                      >
                        <CheckCircleIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  <Typography variant="subtitle1" color="textSecondary">
                    {word.romaji}
                  </Typography>
                  <Typography variant="body1" className="mt-2">
                    {word.english}
                  </Typography>
                  {word.emotionalContext?.usageNotes && (
                    <Typography 
                      variant="caption" 
                      color="textSecondary" 
                      className="mt-2 block"
                      sx={{
                        fontStyle: 'italic',
                        borderLeft: `2px solid ${getCategoryColor(word)}`,
                        pl: 1,
                        ml: 1
                      }}
                    >
                      💭 {word.emotionalContext.usageNotes}
                    </Typography>
                  )}
                  <IconButton
                    onClick={() => handlePlayAudio(word)}
                    className="mt-2"
                    color="primary"
                    disabled={isPlayingAudio && currentPlayingWord === word.japanese}
                  >
                    {isPlayingAudio && currentPlayingWord === word.japanese ? (
                      <CircularProgress size={24} />
                    ) : (
                      <VolumeUpIcon />
                    )}
                  </IconButton>

                  {/* Add formality level */}
                  {word.formality && (
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Formality:
                      </Typography>
                      <Chip
                        size="small"
                        label={word.formality}
                        sx={{
                          backgroundColor: word.formality === 'formal' 
                            ? '#4682B4' 
                            : word.formality === 'polite'
                            ? '#98FB98'
                            : '#FFB6C1',
                          color: 'white'
                        }}
                      />
                    </Box>
                  )}

                  {/* Add common responses */}
                  {word.common_responses && word.common_responses.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Common Responses:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                        {word.common_responses.map((response, index) => (
                          <Chip
                            key={index}
                            size="small"
                            label={response}
                            variant="outlined"
                            sx={{ fontSize: '0.75rem' }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grow>
          </Grid>
        ))}
      </Grid>

      {/* No Results Message */}
      {filteredWords.length === 0 && (
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 8,
            color: 'text.secondary'
          }}
        >
          <Typography variant="h6" gutterBottom>
            No expressions found
          </Typography>
          <Typography variant="body2">
            Try adjusting your search or mood filters
          </Typography>
        </Box>
      )}

      {/* Add error snackbar */}
      <Snackbar
        open={!!audioError}
        autoHideDuration={6000}
        onClose={() => setAudioError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setAudioError(null)} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {audioError}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MoodPage; 