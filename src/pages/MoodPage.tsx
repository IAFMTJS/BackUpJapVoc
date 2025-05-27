import React, { useState, useEffect } from 'react';
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
import { loadAllMoodWords, updateWordMastery } from '../utils/moodWordOperations';
import { generateMoodWordAudio } from '../utils/audio';
import { openDB } from '../utils/indexedDB';

const MoodPage: React.FC = () => {
  const { theme } = useTheme();
  const [words, setWords] = useState<MoodWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'mastered' | 'learning'>('all');
  const [selectedMoods, setSelectedMoods] = useState<EmotionalCategory[]>([]);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Load mood words from IndexedDB
  useEffect(() => {
    const loadWords = async () => {
      try {
        console.log('Loading mood words...');
        const moodWords = await loadAllMoodWords();
        console.log(`Loaded ${moodWords.length} mood words`);
        setWords(moodWords);
      } catch (error) {
        console.error('Error loading mood words:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWords();
  }, []);

  const handlePlayAudio = async (word: MoodWord) => {
    try {
      setIsPlayingAudio(true);
      setAudioError(null);
      
      // Always use the Japanese text to play audio
      await playAudio(word.japanese);
      
    } catch (error) {
      console.error('Error playing audio:', error);
      setAudioError(error instanceof Error ? error.message : 'Failed to play audio');
    } finally {
      setIsPlayingAudio(false);
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

  const filteredWords = words.filter(word => {
    const matchesSearch = 
      word.japanese.toLowerCase().includes(searchTerm.toLowerCase()) ||
      word.romaji.toLowerCase().includes(searchTerm.toLowerCase()) ||
      word.english.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'mastered' && word.mastered) ||
      (filter === 'learning' && !word.mastered);

    const matchesMoods =
      selectedMoods.length === 0 ||
      selectedMoods.includes(word.emotionalContext.category);

    return matchesSearch && matchesFilter && matchesMoods;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <CircularProgress />
      </div>
    );
  }

  return (
    <Container maxWidth="xl" className="py-8">
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
                  borderLeft: `4px solid ${EMOTIONAL_CATEGORIES[word.emotionalContext.category].color}`,
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
                      <Tooltip 
                        title={
                          <Box>
                            <Typography variant="subtitle2">
                              {word.emotionalContext.category} (Intensity: {word.emotionalContext.intensity}/5)
                            </Typography>
                            {word.emotionalContext.relatedEmotions && (
                              <Typography variant="caption" display="block">
                                Related: {word.emotionalContext.relatedEmotions.join(', ')}
                              </Typography>
                            )}
                          </Box>
                        }
                      >
                        <Chip
                          icon={<span>{word.emotionalContext.emoji}</span>}
                          label={word.emotionalContext.category}
                          size="small"
                          sx={{
                            backgroundColor: EMOTIONAL_CATEGORIES[word.emotionalContext.category].color,
                            color: 'white',
                            cursor: 'help'
                          }}
                        />
                      </Tooltip>
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
                  {word.emotionalContext.usageNotes && (
                    <Typography 
                      variant="caption" 
                      color="textSecondary" 
                      className="mt-2 block"
                      sx={{
                        fontStyle: 'italic',
                        borderLeft: `2px solid ${EMOTIONAL_CATEGORIES[word.emotionalContext.category].color}`,
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
                    disabled={isPlayingAudio}
                  >
                    {isPlayingAudio ? (
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